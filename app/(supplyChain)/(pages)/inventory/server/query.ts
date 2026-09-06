'use server';
import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { headers } from 'next/headers';
import { isRateLimited } from '@/app/(supplyChain)/components/global/rateLimit';
import { sanitizeSearch } from '@/app/(supplyChain)/components/global/sanitize';
export interface LatestPOInfo {
    poi_id?: string;
    purchase_order_id?: string;
    po_number?: string;
    status?: string;
    paid?: boolean;
    fully_received?: boolean;
    quantity_ordered?: number;
    quantity_received?: number;
    unit_price?: number;
    supplier_name?: string;
    delivery_date?: string;
    is_request?: boolean;
    request_number?: string;
    request_id?: string;
    created_at?: string;
    has_pending_pr?: boolean;
    pending_pr_number?: string;
    pending_pr_id?: string;
}
// types
export interface InventoryItem {
    id: string;
    item_code: string;
    item_name: string;
    category: string;
    current_stock: number;
    unit: string;
    minimum_stock: number;
    storage_location: string;
    status: 'available' | 'low-stock' | 'out-of-stock';
    updated_at: string;
    description?: string;
    supplier?: string;
    purchase_price?: number;
    created_at?: string;
    latest_po?: LatestPOInfo | null;
    force_updated_by?: string | null;
    force_updated_by_name?: string | null;
    force_updated_at?: string | null;
    force_reason?: string | null;
}
export interface Parcel {
    id: number;
    barcode: string;
    tracking_number: string;
    sender_name: string | null;
    customer_name: string | null;
    customer_number: string | null;
    destination: string | null;
    region: string | null;
    courier: string | null;
    scanned_by: string | null;
    scanned_at: string;
    status: string;
    created_at: string;
    updated_at: string;
}
export interface Supplier {
    id: number;
    name: string;
    category: string;
    contact_person: string;
    phone: string;
    email: string;
    location: string;
    is_active: boolean;
}
/**
 * Attaches the latest PO / PO item or pending PR info to each inventory item
 */
async function attachLatestPOToItems(items: any[]) {
    if (!items || items.length === 0)
        return items;
    const itemIds = items.map(item => item.id).filter(Boolean);
    try {
        // 1. Fetch latest POIs for these items
        const { data: poiData } = await supabase
            .from('purchase_order_items')
            .select(`
                id,
                purchase_order_id,
                inventory_item_id,
                item_name,
                quantity_ordered,
                quantity_received,
                unit_price,
                stocked_in_at,
                created_at,
                purchase_orders (
                    id,
                    po_number,
                    status,
                    paid,
                    fully_received,
                    supplier_name,
                    delivery_date,
                    created_at
                )
            `)
            .in('inventory_item_id', itemIds)
            .order('created_at', { ascending: false });

        // Map PO by item id (first occurrence is latest due to ordering)
        const poMap = new Map<string, LatestPOInfo>();
        if (poiData) {
            for (const poi of poiData) {
                const key = String(poi.inventory_item_id);
                if (!poMap.has(key)) {
                    const po = (poi as any).purchase_orders;
                    poMap.set(key, {
                        poi_id: poi.id,
                        purchase_order_id: poi.purchase_order_id,
                        po_number: po?.po_number,
                        status: po?.status,
                        paid: po?.paid,
                        fully_received: po?.fully_received,
                        quantity_ordered: poi.quantity_ordered,
                        quantity_received: poi.quantity_received,
                        unit_price: poi.unit_price,
                        supplier_name: po?.supplier_name,
                        delivery_date: po?.delivery_date,
                        is_request: false,
                        created_at: po?.created_at || poi.created_at,
                    });
                }
            }
        }

        // 2. fetch purchase requests for active pipeline (pending and approved) or recent window (last 60 days)
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
        const { data: prData } = await supabase
            .from('purchase_requests')
            .select('id, request_number, status, supplier_name, items, created_at')
            .or(`status.in.(Pending,Approved),created_at.gte.${sixtyDaysAgo}`)
            .order('created_at', { ascending: false })
            .limit(300);

        // index prs by inventory item id and lowercased item name for o(1) matching
        const prsByItemId = new Map<string, { pr: any; item: any }[]>();
        const prsByItemName = new Map<string, { pr: any; item: any }[]>();

        for (const pr of prData || []) {
            const prItems = Array.isArray(pr.items) ? pr.items : [];
            for (const pi of prItems) {
                if (pi.inventory_item_id != null) {
                    const idKey = String(pi.inventory_item_id);
                    if (!prsByItemId.has(idKey)) prsByItemId.set(idKey, []);
                    prsByItemId.get(idKey)!.push({ pr, item: pi });
                }
                const nameKey = (pi.name || pi.item_name || '').toLowerCase().trim();
                if (nameKey) {
                    if (!prsByItemName.has(nameKey)) prsByItemName.set(nameKey, []);
                    prsByItemName.get(nameKey)!.push({ pr, item: pi });
                }
            }
        }

        const latestActivityMap = new Map<string, LatestPOInfo>();

        for (const item of items) {
            const key = String(item.id);
            const nameKey = (item.item_name || '').toLowerCase().trim();
            const existingPO = poMap.get(key);

            // fast indexed lookup for matching purchase requests
            const candidates = [
                ...(prsByItemId.get(key) || []),
                ...(prsByItemName.get(nameKey) || [])
            ];
            const seenPrIds = new Set<string>();
            const matchingEntries: { pr: any; item: any }[] = [];
            for (const c of candidates) {
                if (!seenPrIds.has(c.pr.id)) {
                    seenPrIds.add(c.pr.id);
                    matchingEntries.push(c);
                }
            }

            const pendingEntry = matchingEntries.find(e => (e.pr.status || '').toLowerCase() === 'pending');
            const hasPendingPR = Boolean(pendingEntry);
            const latestEntry = matchingEntries[0];

            let chosenActivity: LatestPOInfo | null = null;

            if (latestEntry) {
                const latestPR = latestEntry.pr;
                const matchingItem = latestEntry.item;

                const prInfo: LatestPOInfo = {
                    is_request: true,
                    request_id: latestPR.id,
                    request_number: latestPR.request_number,
                    status: latestPR.status,
                    supplier_name: latestPR.supplier_name,
                    quantity_ordered: matchingItem?.quantity || 0,
                    quantity_received: 0,
                    unit_price: matchingItem?.unit_price || matchingItem?.price || 0,
                    created_at: latestPR.created_at,
                    has_pending_pr: hasPendingPR,
                    pending_pr_number: pendingEntry?.pr.request_number,
                    pending_pr_id: pendingEntry?.pr.id,
                };

                if (!existingPO) {
                    chosenActivity = prInfo;
                } else {
                    const poDate = existingPO.created_at ? new Date(existingPO.created_at).getTime() : 0;
                    const prDate = latestPR.created_at ? new Date(latestPR.created_at).getTime() : 0;
                    const isPOFinished = ['delivered', 'cancelled', 'completed'].includes((existingPO.status || '').toLowerCase());

                    if (hasPendingPR) {
                        // if there is an active pending pr, that takes precedence over any completed/previous po
                        if (pendingEntry && pendingEntry.pr.id !== latestPR.id) {
                            const pendingMatch = pendingEntry.item;
                            chosenActivity = {
                                is_request: true,
                                request_id: pendingEntry.pr.id,
                                request_number: pendingEntry.pr.request_number,
                                status: pendingEntry.pr.status,
                                supplier_name: pendingEntry.pr.supplier_name,
                                quantity_ordered: pendingMatch?.quantity || 0,
                                quantity_received: 0,
                                unit_price: pendingMatch?.unit_price || pendingMatch?.price || 0,
                                created_at: pendingEntry.pr.created_at,
                                has_pending_pr: true,
                                pending_pr_number: pendingEntry.pr.request_number,
                                pending_pr_id: pendingEntry.pr.id,
                            };
                        } else {
                            chosenActivity = prInfo;
                        }
                    } else if (isPOFinished && (prDate > poDate || ['approved'].includes((latestPR.status || '').toLowerCase()))) {
                        // previous po is finished and there is a newer or approved pr waiting
                        chosenActivity = prInfo;
                    } else if (prDate > poDate && !isPOFinished && (existingPO.status || '').toLowerCase() === 'draft') {
                        // pr created after draft po
                        chosenActivity = prInfo;
                    } else {
                        // po is the active/latest activity
                        chosenActivity = {
                            ...existingPO,
                            has_pending_pr: hasPendingPR,
                            pending_pr_number: pendingEntry?.pr.request_number,
                            pending_pr_id: pendingEntry?.pr.id,
                        };
                    }
                }
            } else if (existingPO) {
                chosenActivity = {
                    ...existingPO,
                    has_pending_pr: false,
                };
            }

            if (chosenActivity) {
                latestActivityMap.set(key, chosenActivity);
            }
        }

        return items.map(item => ({
            ...item,
            latest_po: latestActivityMap.get(String(item.id)) || null,
        }));
    }
    catch (err) {
        console.warn('Error attaching latest PO to items:', err);
        return items;
    }
}
/**
 * Attaches the display name/email of the user who performed a force update
 */
async function attachForceUpdateDetails(items: any[]) {
    if (!items || items.length === 0)
        return items;
    const userIds = items
        .map(i => i.force_updated_by)
        .filter((id): id is string => Boolean(id) && typeof id === 'string');
    if (userIds.length === 0)
        return items;
    try {
        const { data: usersData } = await supabase
            .from('users')
            .select('id, display_name, email, role')
            .in('id', userIds);
        const userMap = new Map<string, string>();
        if (usersData) {
            for (const u of usersData) {
                userMap.set(u.id, u.display_name || u.email || 'Admin');
            }
        }
        return items.map(item => ({
            ...item,
            force_updated_by_name: item.force_updated_by ? (userMap.get(item.force_updated_by) || 'Admin') : null,
        }));
    }
    catch (err) {
        console.warn('Error attaching force update details:', err);
        return items;
    }
}
// get inventory items with pagination and filters
export async function fetchInventoryItems(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
}) {
    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (isRateLimited(`${ip}:inventory_fetch`)) {
            return {
                success: false,
                error: 'Too many requests. Please wait.',
                status: 429,
            };
        }
        const { page = 1, limit = 30, search = '', category = 'all', status = 'all' } = params;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        let query = supabase
            .from('inventory_items')
            .select('*', { count: 'exact' });
        if (search) {
            const sanitizedSearch = sanitizeSearch(search);
            query = query.or(`item_name.ilike.%${sanitizedSearch}%,` +
                `item_code.ilike.%${sanitizedSearch}%`);
        }
        if (category !== 'all') {
            query = query.eq('category', category);
        }
        if (status !== 'all') {
            query = query.eq('status', status);
        }
        const { data, count: totalCount, error } = await query
            .order('item_name')
            .range(from, to);
        if (error)
            throw error;
        // enrich items with latest po / poi and pr tracking
        const itemsWithPo = await attachLatestPOToItems(data || []);
        const enrichedItems = await attachForceUpdateDetails(itemsWithPo);
        return {
            success: true,
            data: {
                items: enrichedItems,
                totalItems: totalCount || 0,
                page,
                limit,
                totalPages: Math.ceil((totalCount || 0) / limit),
            },
            status: 200,
        };
    }
    catch (error) {
        console.error('Error fetching inventory items:', error);
        return {
            success: false,
            error: 'Failed to fetch inventory items',
            status: 500,
        };
    }
}
// get parcels with pagination and filters
export async function fetchParcels(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}) {
    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (isRateLimited(`${ip}:parcels_fetch`)) {
            return {
                success: false,
                error: 'Too many requests. Please wait.',
                status: 429,
            };
        }
        const { page = 1, limit = 15, search = '', status = '', dateFrom = '', dateTo = '' } = params;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        let query = supabase
            .from('parcels')
            .select('*', { count: 'exact' });
        if (search) {
            const sanitizedSearch = sanitizeSearch(search);
            query = query.or(`barcode.ilike.%${sanitizedSearch}%,` +
                `tracking_number.ilike.%${sanitizedSearch}%,` +
                `sender_name.ilike.%${sanitizedSearch}%`);
        }
        if (status) {
            query = query.eq('status', status);
        }
        if (dateFrom) {
            query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
            query = query.lte('created_at', dateTo + 'T23:59:59');
        }
        const { data, count: totalCount, error } = await query
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error)
            throw error;
        return {
            success: true,
            data: {
                parcels: data || [],
                totalItems: totalCount || 0,
                page,
                limit,
                totalPages: Math.ceil((totalCount || 0) / limit),
            },
            status: 200,
        };
    }
    catch (error) {
        console.error('Error fetching parcels:', error);
        return {
            success: false,
            error: 'Failed to fetch parcels',
            status: 500,
        };
    }
}
// get all active suppliers
export async function fetchSuppliers() {
    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (isRateLimited(`${ip}:suppliers_fetch`)) {
            return {
                success: false,
                error: 'Too many requests. Please wait.',
                status: 429,
            };
        }
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('is_active', true)
            .order('name');
        if (error)
            throw error;
        return {
            success: true,
            data: data || [],
            status: 200,
        };
    }
    catch (error) {
        console.error('Error fetching suppliers:', error);
        return {
            success: false,
            error: 'Failed to fetch suppliers',
            status: 500,
        };
    }
}
// get dashboard statistics
export async function fetchDashboardStats() {
    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (isRateLimited(`${ip}:dashboard_stats`)) {
            return {
                success: false,
                error: 'Too many requests. Please wait.',
                status: 429,
            };
        }
        const { count: totalItems, error: totalError } = await supabase
            .from('inventory_items')
            .select('*', { count: 'exact', head: true });
        if (totalError)
            throw totalError;
        const { count: lowStock, error: lowError } = await supabase
            .from('inventory_items')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'low-stock');
        if (lowError)
            throw lowError;
        const { count: outOfStock, error: outError } = await supabase
            .from('inventory_items')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'out-of-stock');
        if (outError)
            throw outError;
        const { data: categoryData, error: categoryError } = await supabase
            .from('inventory_items')
            .select('category', { count: 'exact' });
        if (categoryError)
            throw categoryError;
        const categoryCounts: Record<string, number> = {};
        categoryData?.forEach(item => {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        });
        const { data: lowStockItems, error: lowItemsError } = await supabase
            .from('inventory_items')
            .select('id, item_name, current_stock, minimum_stock, unit, status')
            .in('status', ['low-stock', 'out-of-stock'])
            .order('current_stock', { ascending: true })
            .limit(6);
        if (lowItemsError)
            throw lowItemsError;
        return {
            success: true,
            data: {
                totalItems: totalItems || 0,
                lowStock: lowStock || 0,
                outOfStock: outOfStock || 0,
                categoryCounts,
                lowStockItems: lowStockItems || [],
            },
            status: 200,
        };
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            success: false,
            error: 'Failed to fetch dashboard stats',
            status: 500,
        };
    }
}
// fetch all the data needed for the inventory page in one go, running everything simultaneously so it's faster
export async function fetchInventoryPageData(params: {
    inventoryPage?: number;
    inventoryLimit?: number;
    inventorySearch?: string;
    inventoryCategory?: string;
    inventoryStatus?: string;
    parcelPage?: number;
    parcelLimit?: number;
    parcelSearch?: string;
    parcelStatus?: string;
    parcelDateFrom?: string;
    parcelDateTo?: string;
}) {
    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (isRateLimited(`${ip}:inventory_page`)) {
            return {
                success: false,
                error: 'Too many requests. Please wait.',
                status: 429,
            };
        }
        // run all queries at the same time so it don't wait for each one to finish before starting the next
        const [inventoryResult, parcelsResult, suppliersResult, statsResult,] = await Promise.all([
            fetchInventoryItems({
                page: params.inventoryPage || 1,
                limit: params.inventoryLimit || 15,
                search: params.inventorySearch || '',
                category: params.inventoryCategory || 'all',
                status: params.inventoryStatus || 'all',
            }),
            fetchParcels({
                page: params.parcelPage || 1,
                limit: params.parcelLimit || 30,
                search: params.parcelSearch || '',
                status: params.parcelStatus || '',
                dateFrom: params.parcelDateFrom || '',
                dateTo: params.parcelDateTo || '',
            }),
            fetchSuppliers(),
            fetchDashboardStats(),
        ]);
        return {
            success: true,
            data: {
                inventory: inventoryResult.success ? inventoryResult.data : null,
                parcels: parcelsResult.success ? parcelsResult.data : null,
                suppliers: suppliersResult.success ? suppliersResult.data : [],
                stats: statsResult.success ? statsResult.data : null,
            },
            status: 200,
        };
    }
    catch (error) {
        console.error('Error fetching inventory page data:', error);
        return {
            success: false,
            error: 'Failed to fetch inventory page data',
            status: 500,
        };
    }
}
