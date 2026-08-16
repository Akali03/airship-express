"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { supabase } from "@/app/(supplyChain)/lib/services/client/supabase";
import { useDebounce } from "@/app/(supplyChain)/hooks/useDebounce";
import { toast } from "sonner";
import { useConfirm } from "@/app/(supplyChain)/components/ui/ConfirmModal";
import { PageSkeleton } from "@/app/(supplyChain)/components/ui/SkeletonLoader";
import Portal from "@/app/(supplyChain)/components/client/Portal";
import { Pagination } from "@/app/(supplyChain)/components/global/pagination";

interface Parcel {
    id: number;
    barcode: string;
    tracking_number: string;
    destination: string | null;
    courier: string | null;
    status: string;
    created_at: string;
    sender_name: string | null;
    bulk_qr_code?: string | null;
    bulk_qr_city?: string | null;
    bulk_qr_courier?: string | null;
    region?: string | null;
    city?: string | null;
}

interface CityGroup {
    city: string;
    total: number;
    couriers: { name: string; count: number }[];
    parcels: Parcel[];
    hasBulkQr: boolean;
    bulkQrCode: string | null;
    bulkQrCity: string | null;
}

interface RegionGroup {
    region: string;
    total: number;
    cities: CityGroup[];
    expanded: boolean;
}

interface CourierStats {
    name: string;
    count: number;
    parcels: Parcel[];
    hasBulkQr: boolean;
    bulkQrCode?: string | null;
    bulkQrCourier?: string | null;
}

// Memoized animated component to prevent unnecessary re-renders
const AnimatedRegionContent = memo(({
    region,
    children
}: {
    region: RegionGroup;
    children: React.ReactNode
}) => {
    return (
        <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${region.expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
        >
            <div className="border-t border-slate-100">
                {children}
            </div>
        </div>
    );
});

AnimatedRegionContent.displayName = 'AnimatedRegionContent';

export default function SortingPanel() {
    const [parcels, setParcels] = useState<Parcel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [locationSearch, setLocationSearch] = useState("");
    const [locationRegionFilter, setLocationRegionFilter] = useState("");
    const [locationCityFilter, setLocationCityFilter] = useState("");
    const [regionGroups, setRegionGroups] = useState<RegionGroup[]>([]);
    const [cityGroups, setCityGroups] = useState<CityGroup[]>([]);
    const [viewMode, setViewMode] = useState<"region" | "city">("region");
    const [courierStats, setCourierStats] = useState<CourierStats[]>([]);
    const [selectedParcels, setSelectedParcels] = useState<Parcel[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [generatingBulk, setGeneratingBulk] = useState(false);
    const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filteredParcels, setFilteredParcels] = useState<Parcel[]>([]);
    const [showCourierModal, setShowCourierModal] = useState(false);
    const [courierParcels, setCourierParcels] = useState<Parcel[]>([]);
    const [selectedParcelIds, setSelectedParcelIds] = useState<Set<number>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const [allCities, setAllCities] = useState<string[]>([]);
    const [allRegions, setAllRegions] = useState<string[]>([]);
    const [generatingAllBulk, setGeneratingAllBulk] = useState(false);
    const limit = 10;
    const { confirm } = useConfirm();

    const debouncedSearch = useDebounce(searchTerm, 300);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('QR Code copied to clipboard!', { duration: 2000 });
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('QR Code copied to clipboard!', { duration: 2000 });
        });
    };

    // Generate random code for bulk QR
    const generateRandomCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    // Generate bulk QR for ALL received parcels - updates bulk_qr_code column
    const handleGenerateAllBulkQr = async () => {
        if (parcels.length === 0) {
            toast.warning('No parcels found to generate bulk QR');
            return;
        }

        const allHaveBulkQr = parcels.every(p => p.bulk_qr_code);
        if (allHaveBulkQr) {
            toast.info(`All ${parcels.length} parcels already have global bulk QR codes`, { duration: 3000 });
            return;
        }

        const confirmed = await confirm({
            title: "Generate Global Bulk QR",
            message: `Generate a global bulk QR code for all ${parcels.length} received parcels?`,
            confirmText: "Generate",
            cancelText: "Cancel",
            confirmVariant: "success",
        });

        if (!confirmed) return;

        setGeneratingAllBulk(true);
        const toastId = toast.loading(`Generating global bulk QR for ${parcels.length} parcels...`);

        try {
            const randomCode = generateRandomCode();
            const bulkQrCode = `BULK-${randomCode}`;

            const ids = parcels.map(p => p.id);
            const { error } = await supabase
                .from('parcels')
                .update({
                    bulk_qr_code: bulkQrCode
                })
                .in('id', ids);

            if (error) throw error;

            toast.success(`Global bulk QR generated for ${parcels.length} parcels!`, {
                id: toastId,
                duration: 4000,
                action: {
                    label: 'Copy QR',
                    onClick: () => copyToClipboard(bulkQrCode)
                }
            });

            fetchData();

        } catch (error) {
            console.error('Error generating global bulk QR:', error);
            toast.error('Failed to generate global bulk QR code', {
                id: toastId,
                duration: 5000,
            });
        } finally {
            setGeneratingAllBulk(false);
        }
    };

    // fetch data from supabase with pagination
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const offset = (page - 1) * limit;

            // get received parcels with pagination
            let query = supabase
                .from('parcels')
                .select('*', { count: 'exact' })
                .eq('status', 'received')
                .order('created_at', { ascending: false });

            // apply search filter
            if (debouncedSearch) {
                query = query.or(
                    `barcode.ilike.%${debouncedSearch}%,tracking_number.ilike.%${debouncedSearch}%,destination.ilike.%${debouncedSearch}%,city.ilike.%${debouncedSearch}%`
                );
            }

            // apply city filter for paginated data
            if (locationCityFilter) {
                query = query.ilike('city', `%${locationCityFilter}%`);
            }

            // apply region filter for paginated data
            if (locationRegionFilter) {
                query = query.ilike('region', `%${locationRegionFilter}%`);
            }

            query = query.range(offset, offset + limit - 1);

            const { data: parcelsData, error: parcelsError, count } = await query;

            if (parcelsError) throw parcelsError;

            setParcels(parcelsData || []);
            setFilteredParcels(parcelsData || []);
            setTotalItems(count || 0);
            setTotalPages(Math.ceil((count || 0) / limit));

            // Fetch all received parcels for statistics
            let allQuery = supabase
                .from('parcels')
                .select('*')
                .eq('status', 'received');

            if (locationCityFilter) {
                allQuery = allQuery.ilike('city', `%${locationCityFilter}%`);
            }

            if (locationRegionFilter) {
                allQuery = allQuery.ilike('region', `%${locationRegionFilter}%`);
            }

            const { data: allParcels, error: allError } = await allQuery;

            if (allError) throw allError;

            // Get all unique cities and regions for filters
            const { data: allCitiesData } = await supabase
                .from('parcels')
                .select('city')
                .eq('status', 'received')
                .not('city', 'is', null);

            const cities = [...new Set((allCitiesData || []).map(p => p.city).filter(Boolean))] as string[];
            setAllCities(cities.sort());

            const { data: allRegionsData } = await supabase
                .from('parcels')
                .select('region')
                .eq('status', 'received')
                .not('region', 'is', null);

            const regions = [...new Set((allRegionsData || []).map(p => p.region).filter(Boolean))] as string[];
            setAllRegions(regions.sort());

            // Group by region then city
            const regionMap: Record<string, Record<string, CityGroup>> = {};

            (allParcels || []).forEach((p: any) => {
                const region = p.region || 'N/A';
                const city = p.city || 'N/A';

                if (!regionMap[region]) {
                    regionMap[region] = {};
                }

                if (!regionMap[region][city]) {
                    regionMap[region][city] = {
                        city: city,
                        total: 0,
                        couriers: [],
                        parcels: [],
                        hasBulkQr: false,
                        bulkQrCode: null,
                        bulkQrCity: null
                    };
                }

                const cityGroup = regionMap[region][city];
                cityGroup.total += 1;
                cityGroup.parcels.push(p);

                if (p.courier) {
                    const existingCourier = cityGroup.couriers.find(c => c.name === p.courier);
                    if (existingCourier) {
                        existingCourier.count += 1;
                    } else {
                        cityGroup.couriers.push({ name: p.courier, count: 1 });
                    }
                }

                // Check for city-specific bulk QR
                if (p.bulk_qr_city) {
                    cityGroup.hasBulkQr = true;
                    cityGroup.bulkQrCode = p.bulk_qr_city;
                    cityGroup.bulkQrCity = p.bulk_qr_city;
                }
            });

            // Build region groups
            const regionGroupsData: RegionGroup[] = Object.entries(regionMap).map(([region, citiesMap]) => {
                const citiesData = Object.values(citiesMap);
                const total = citiesData.reduce((sum, c) => sum + c.total, 0);

                return {
                    region,
                    total,
                    cities: citiesData,
                    expanded: false
                };
            });

            // Sort regions by total
            regionGroupsData.sort((a, b) => b.total - a.total);

            setRegionGroups(regionGroupsData);

            // Build flat city groups for city view
            const allCitiesMap: Record<string, CityGroup> = {};
            (allParcels || []).forEach((p: any) => {
                const city = p.city || 'Unassigned';
                if (!allCitiesMap[city]) {
                    allCitiesMap[city] = {
                        city: city,
                        total: 0,
                        couriers: [],
                        parcels: [],
                        hasBulkQr: false,
                        bulkQrCode: null,
                        bulkQrCity: null
                    };
                }

                const cityGroup = allCitiesMap[city];
                cityGroup.total += 1;
                cityGroup.parcels.push(p);

                if (p.courier) {
                    const existingCourier = cityGroup.couriers.find(c => c.name === p.courier);
                    if (existingCourier) {
                        existingCourier.count += 1;
                    } else {
                        cityGroup.couriers.push({ name: p.courier, count: 1 });
                    }
                }

                if (p.bulk_qr_city) {
                    cityGroup.hasBulkQr = true;
                    cityGroup.bulkQrCode = p.bulk_qr_city;
                    cityGroup.bulkQrCity = p.bulk_qr_city;
                }
            });

            const cityGroupsData = Object.values(allCitiesMap);
            cityGroupsData.sort((a, b) => b.total - a.total);
            setCityGroups(cityGroupsData);

            // Courier stats
            const courierMap: Record<string, { count: number; parcels: Parcel[]; hasBulkQr: boolean; bulkQrCode?: string | null; bulkQrCourier?: string | null }> = {};
            (allParcels || []).forEach((p: any) => {
                if (p.courier) {
                    if (!courierMap[p.courier]) {
                        courierMap[p.courier] = { count: 0, parcels: [], hasBulkQr: false, bulkQrCode: null, bulkQrCourier: null };
                    }
                    courierMap[p.courier].count += 1;
                    courierMap[p.courier].parcels.push(p);

                    if (p.bulk_qr_courier) {
                        courierMap[p.courier].hasBulkQr = true;
                        courierMap[p.courier].bulkQrCode = p.bulk_qr_courier;
                        courierMap[p.courier].bulkQrCourier = p.bulk_qr_courier;
                    }
                }
            });

            const courierStatsData = Object.entries(courierMap)
                .map(([name, data]) => ({
                    name,
                    count: data.count,
                    parcels: data.parcels,
                    hasBulkQr: data.hasBulkQr,
                    bulkQrCode: data.bulkQrCode,
                    bulkQrCourier: data.bulkQrCourier
                }))
                .sort((a, b) => b.count - a.count);

            setCourierStats(courierStatsData);

            // Determine view mode based on filters
            if (locationCityFilter) {
                setViewMode("city");
            } else if (locationRegionFilter) {
                setViewMode("region");
            } else {
                setViewMode("region");
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load sorting data');
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, locationRegionFilter, locationCityFilter]);

    useEffect(() => {
        fetchData();

        const subscription = supabase
            .channel('sorting_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'parcels',
                    filter: 'status=eq.received',
                },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchData]);

    // Toggle region expansion
    const toggleRegion = (regionName: string) => {
        setRegionGroups(prev => prev.map(region =>
            region.region === regionName
                ? { ...region, expanded: !region.expanded }
                : region
        ));
    };

    // Expand all regions
    const expandAllRegions = () => {
        setRegionGroups(prev => prev.map(region => ({
            ...region,
            expanded: true
        })));
    };

    // Collapse all regions
    const collapseAllRegions = () => {
        setRegionGroups(prev => prev.map(region => ({
            ...region,
            expanded: false
        })));
    };

    // Show parcels for a specific city
    const handleViewCityParcels = (city: string, parcels: Parcel[]) => {
        setSelectedParcels(parcels);
        setShowModal(true);
    };

    // Show parcels for a specific courier
    const handleViewCourierParcels = (courierName: string) => {
        const courier = courierStats.find(c => c.name === courierName);
        if (courier) {
            setCourierParcels(courier.parcels);
            setSelectedCourier(courierName);
            setShowCourierModal(true);
        }
    };

    // Generate bulk QR for a specific city - updates bulk_qr_city column
    const handleGenerateCityBulkQr = async (city: string, parcels: Parcel[]) => {
        if (parcels.length === 0) {
            toast.warning('No parcels in this city');
            return;
        }

        // Check if all parcels already have city bulk QR
        const allHaveBulkQr = parcels.every(p => p.bulk_qr_city);
        if (allHaveBulkQr) {
            toast.info(`All parcels in ${city} already have city bulk QR codes`, { duration: 3000 });
            return;
        }

        const confirmed = await confirm({
            title: `Generate City Bulk QR for ${city}`,
            message: `Generate a bulk QR code for ${parcels.length} parcels in ${city}?`,
            confirmText: "Generate",
            cancelText: "Cancel",
            confirmVariant: "success",
        });

        if (!confirmed) return;

        setGeneratingBulk(true);
        const toastId = toast.loading(`Generating city bulk QR for ${city}...`);

        try {
            // Format: BULK-CITYNAME-RANDOMCODE
            const randomCode = generateRandomCode();
            const bulkQrCode = `BULK-${city.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${randomCode}`;

            const ids = parcels.map(p => p.id);
            const { error } = await supabase
                .from('parcels')
                .update({
                    bulk_qr_city: bulkQrCode
                })
                .in('id', ids);

            if (error) throw error;

            toast.success(`City bulk QR generated for ${parcels.length} parcels in ${city}!`, {
                id: toastId,
                duration: 4000,
                action: {
                    label: 'Copy QR',
                    onClick: () => copyToClipboard(bulkQrCode)
                }
            });

            fetchData();

        } catch (error) {
            console.error('Error generating city bulk QR:', error);
            toast.error('Failed to generate city bulk QR code', {
                id: toastId,
                duration: 5000,
            });
        } finally {
            setGeneratingBulk(false);
        }
    };

    // Generate bulk QR for a specific courier - updates bulk_qr_courier column
    const handleGenerateCourierBulkQr = async (courierName: string) => {
        const courier = courierStats.find(c => c.name === courierName);
        if (!courier || courier.parcels.length === 0) {
            toast.warning('No parcels for this courier');
            return;
        }

        // Check if all parcels already have courier bulk QR
        if (courier.hasBulkQr) {
            toast.info(`This courier already has a courier bulk QR code: ${courier.bulkQrCode}`, {
                duration: 3000,
                action: {
                    label: 'Copy',
                    onClick: () => copyToClipboard(courier.bulkQrCode || '')
                }
            });
            return;
        }

        const confirmed = await confirm({
            title: `Generate Courier Bulk QR for ${courierName}`,
            message: `Generate a bulk QR code for ${courier.parcels.length} parcels from ${courierName}?`,
            confirmText: "Generate",
            cancelText: "Cancel",
            confirmVariant: "success",
        });

        if (!confirmed) return;

        setGeneratingBulk(true);
        const toastId = toast.loading(`Generating courier bulk QR for ${courierName}...`);

        try {
            // Format: BULK-COURIERNAME-RANDOMCODE
            const randomCode = generateRandomCode();
            const bulkQrCode = `BULK-${courierName.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${randomCode}`;

            const ids = courier.parcels.map(p => p.id);
            const { error } = await supabase
                .from('parcels')
                .update({
                    bulk_qr_courier: bulkQrCode
                })
                .in('id', ids);

            if (error) throw error;

            toast.success(`Courier bulk QR generated for ${courier.parcels.length} parcels (${courierName})!`, {
                id: toastId,
                duration: 4000,
                action: {
                    label: 'Copy QR',
                    onClick: () => copyToClipboard(bulkQrCode)
                }
            });

            fetchData();

        } catch (error) {
            console.error('Error generating courier bulk QR:', error);
            toast.error('Failed to generate courier bulk QR code', {
                id: toastId,
                duration: 5000,
            });
        } finally {
            setGeneratingBulk(false);
        }
    };

    // Generate bulk QR for selected parcels in modal - updates bulk_qr_code column
    const handleGenerateBulkQr = async () => {
        if (selectedParcels.length === 0) {
            toast.warning('No parcels selected');
            return;
        }

        const allHaveBulkQr = selectedParcels.every(p => p.bulk_qr_code);
        if (allHaveBulkQr) {
            toast.info(`All selected parcels already have bulk QR codes`, { duration: 3000 });
            return;
        }

        const confirmed = await confirm({
            title: "Generate Bulk QR",
            message: `Generate a bulk QR code for ${selectedParcels.length} parcels?`,
            confirmText: "Generate",
            cancelText: "Cancel",
            confirmVariant: "success",
        });

        if (!confirmed) return;

        setGeneratingBulk(true);
        const toastId = toast.loading('Generating bulk QR code...');

        try {
            // Format: BULK-RANDOMCODE
            const randomCode = generateRandomCode();
            const bulkQrCode = `BULK-${randomCode}`;

            const ids = selectedParcels.map(p => p.id);
            const { error } = await supabase
                .from('parcels')
                .update({
                    bulk_qr_code: bulkQrCode
                })
                .in('id', ids);

            if (error) throw error;

            toast.success(`Bulk QR generated for ${selectedParcels.length} parcels!`, {
                id: toastId,
                duration: 4000,
                action: {
                    label: 'Copy QR',
                    onClick: () => copyToClipboard(bulkQrCode)
                }
            });

            fetchData();

        } catch (error) {
            console.error('Error generating bulk QR:', error);
            toast.error('Failed to generate bulk QR code', {
                id: toastId,
                duration: 5000,
            });
        } finally {
            setGeneratingBulk(false);
        }
    };

    // Delete single parcel
    const handleDeleteParcel = async (parcelId: number, barcode: string) => {
        const confirmed = await confirm({
            title: "Delete Parcel",
            message: `Are you sure you want to delete parcel ${barcode}? This action cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            confirmVariant: "danger",
        });

        if (!confirmed) return;

        const toastId = toast.loading('Deleting parcel...');

        try {
            const { error } = await supabase
                .from('parcels')
                .delete()
                .eq('id', parcelId);

            if (error) throw error;

            toast.success(`Parcel ${barcode} deleted successfully!`, {
                id: toastId,
                duration: 3000,
            });

            fetchData();

        } catch (error) {
            console.error('Error deleting parcel:', error);
            toast.error('Failed to delete parcel', {
                id: toastId,
                duration: 5000,
            });
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedParcelIds.size === 0) {
            toast.warning('No parcels selected for deletion');
            return;
        }

        const confirmed = await confirm({
            title: "Delete Selected Parcels",
            message: `Are you sure you want to delete ${selectedParcelIds.size} parcel(s)? This action cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            confirmVariant: "danger",
        });

        if (!confirmed) return;

        setDeleting(true);
        const toastId = toast.loading(`Deleting ${selectedParcelIds.size} parcels...`);

        try {
            const ids = Array.from(selectedParcelIds);
            const { error } = await supabase
                .from('parcels')
                .delete()
                .in('id', ids);

            if (error) throw error;

            toast.success(`Successfully deleted ${ids.length} parcels!`, {
                id: toastId,
                duration: 3000,
            });

            setSelectedParcelIds(new Set());
            fetchData();

        } catch (error) {
            console.error('Error deleting parcels:', error);
            toast.error('Failed to delete parcels', {
                id: toastId,
                duration: 5000,
            });
        } finally {
            setDeleting(false);
        }
    };

    // Handle select all checkbox
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const ids = new Set(filteredParcels.map(p => p.id));
            setSelectedParcelIds(ids);
        } else {
            setSelectedParcelIds(new Set());
        }
    };

    // Handle individual checkbox
    const handleSelectParcel = (id: number, checked: boolean) => {
        const newSelected = new Set(selectedParcelIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedParcelIds(newSelected);
    };

    // Handle page navigation
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    // Get color for courier badges
    const getCourierColor = (name: string, index: number): string => {
        const colors: { [key: string]: string } = {
            'Lazada': 'bg-pink-500',
            'Shopee': 'bg-indigo-500',
            'J&T Express': 'bg-emerald-500',
            'Flash Express': 'bg-amber-500',
            'LBC Express': 'bg-purple-500',
            'Air21': 'bg-cyan-500',
            'JRS Express': 'bg-rose-500',
            'GrabExpress': 'bg-teal-500',
            'DHL': 'bg-yellow-500',
            'FedEx': 'bg-blue-500'
        };
        return colors[name] || ['bg-pink-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500', 'bg-rose-500'][index % 7];
    };

    if (loading) {
        return <PageSkeleton />;
    }

    // Get the data to display based on view mode
    const displayData = viewMode === "city" ? cityGroups : regionGroups;
    const isAnyRegionExpanded = regionGroups.some(r => r.expanded);

    return (
        <div data-panel="sorting" className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="space-y-5">
                <div className="flex flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                            <i className="fas fa-sort text-pink-500 dark:text-pink-400"></i>
                            <span>Courier Sorting</span>
                        </h1>
                        <span className="inline-flex items-center text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                            <i className="fas fa-box mr-1.5 text-slate-400 dark:text-slate-500"></i> {totalItems} parcels received
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                            <i className="far fa-calendar-alt text-slate-400 dark:text-slate-500 mr-1.5"></i> {new Date().toISOString().split('T')[0]}
                        </span>
                        <button
                            type="button"
                            onClick={fetchData}
                            aria-label="Refresh data"
                            className="p-2 rounded-xl text-slate-500 hover:text-pink-600 dark:text-slate-400 dark:hover:text-pink-400 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer"
                        >
                            <i className="fas fa-sync-alt text-xs"></i>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative flex-1 min-w-[180px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-8 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                            placeholder="Search by barcode, tracking, or destination..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <select
                            className="appearance-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all cursor-pointer min-w-[130px]"
                            value={locationRegionFilter}
                            onChange={(e) => {
                                setLocationRegionFilter(e.target.value);
                                setLocationCityFilter('');
                            }}
                        >
                            <option value="" className="dark:bg-slate-900 dark:text-slate-200">All Regions</option>
                            {allRegions.map((region) => (
                                <option key={region} value={region} className="dark:bg-slate-900 dark:text-slate-200">
                                    {region}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            className="appearance-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all cursor-pointer min-w-[130px]"
                            value={locationCityFilter}
                            onChange={(e) => {
                                setLocationCityFilter(e.target.value);
                                if (e.target.value) {
                                    setLocationRegionFilter('');
                                }
                            }}
                        >
                            <option value="" className="dark:bg-slate-900 dark:text-slate-200">All Cities</option>
                            {allCities.map((city) => (
                                <option key={city} value={city} className="dark:bg-slate-900 dark:text-slate-200">
                                    {city}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Generate All Bulk QR Button */}
                    <button
                        onClick={handleGenerateAllBulkQr}
                        disabled={generatingAllBulk || parcels.length === 0}
                        className="h-10 inline-flex items-center gap-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {generatingAllBulk ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-qrcode"></i>
                                <span>Generate All Bulk QR</span>
                            </>
                        )}
                    </button>

                    {selectedParcelIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={deleting}
                            className="h-10 inline-flex items-center gap-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {deleting ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fas fa-trash"></i>
                            )}
                            Delete {selectedParcelIds.size}
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <svg className="w-4 h-4 text-pink-500 dark:text-pink-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {viewMode === "city" ? "City Distribution" : "Destination Distribution"}
                            </h2>
                            {viewMode === "region" && regionGroups.length > 0 && (
                                <div className="inline-flex items-center gap-0.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                                    <button
                                        type="button"
                                        onClick={expandAllRegions}
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-pink-600 dark:text-pink-400 transition-all hover:bg-white dark:hover:bg-slate-700 hover:text-pink-700 dark:hover:text-pink-300 hover:shadow-xs cursor-pointer"
                                    >
                                        <i className="fas fa-angles-down text-[9px]"></i>
                                        <span>Expand All</span>
                                    </button>

                                    <span className="h-3.5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

                                    <button
                                        type="button"
                                        onClick={collapseAllRegions}
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 transition-all hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 hover:shadow-xs cursor-pointer"
                                    >
                                        <i className="fas fa-angles-up text-[9px]"></i>
                                        <span>Collapse All</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {viewMode === "city" ? `${cityGroups.length} cities` : `${regionGroups.length} regions`}
                            </span>
                            {viewMode === "region" && (
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    ({regionGroups.filter(r => r.expanded).length} expanded)
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                        {displayData.length > 0 ? (
                            viewMode === "city" ? (
                                // City View - Flat list of cities
                                (displayData as CityGroup[]).map((city) => (
                                    <div
                                        key={city.city}
                                        className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                                    >
                                        <div>
                                            {/* Header: City Name & Total Count */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-500 dark:text-pink-400">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate" title={city.city}>
                                                        {city.city}
                                                    </span>
                                                </div>
                                                <span className="inline-flex items-center rounded-full bg-pink-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs shrink-0">
                                                    {city.total} total
                                                </span>
                                            </div>

                                            {/* Courier Progress List */}
                                            <div className="space-y-2.5 my-2">
                                                {city.couriers.length > 0 ? (
                                                    city.couriers.map((courier, idx) => {
                                                        const percentage = city.total > 0 ? Math.min(100, Math.max(0, (courier.count / city.total) * 100)) : 0;
                                                        const barColor = getCourierColor(courier.name, idx);

                                                        return (
                                                            <div key={courier.name} className="space-y-1">
                                                                <div className="flex justify-between items-center text-xs">
                                                                    <span className="font-medium text-slate-600 dark:text-slate-400 truncate mr-2">{courier.name}</span>
                                                                    <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">{courier.count}</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                                    <div
                                                                        className={`${barColor} h-full rounded-full transition-all duration-500 ease-out`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-xs text-slate-400 dark:text-slate-500 py-2 italic text-center rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
                                                        No courier assigned
                                                    </div>
                                                )}
                                            </div>

                                            {/* Display City Bulk QR Code */}
                                            {city.bulkQrCity && (
                                                <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 border border-slate-100 dark:border-slate-800">
                                                    <span className="truncate text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400 max-w-[130px]">
                                                        {city.bulkQrCity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(city.bulkQrCity!)}
                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                                                        title="Copy QR code"
                                                    >
                                                        <i className="fas fa-copy text-xs"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer Actions */}
                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleViewCityParcels(city.city, city.parcels)}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 dark:text-pink-400 transition-colors hover:text-pink-700 dark:hover:text-pink-300 hover:underline cursor-pointer"
                                            >
                                                <span>View parcels</span>
                                                <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleGenerateCityBulkQr(city.city, city.parcels)}
                                                    disabled={generatingBulk || city.parcels.length === 0}
                                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${city.hasBulkQr
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 cursor-default'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed'
                                                        }`}
                                                >
                                                    <i className={`fas ${city.hasBulkQr ? 'fa-check-circle text-emerald-600 dark:text-emerald-400' : 'fa-qrcode'} text-[10px]`}></i>
                                                    <span>{city.hasBulkQr ? 'City QR Ready' : 'City Bulk QR'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Region View - Expandable regional accordion cards
                                (displayData as RegionGroup[]).map((region) => (
                                    <div
                                        key={region.region}
                                        className="h-fit rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm overflow-hidden"
                                    >
                                        {/* Region Header */}
                                        <div
                                            className="flex items-center justify-between p-3.5 cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors select-none"
                                            onClick={() => toggleRegion(region.region)}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                    <svg
                                                        className={`w-3.5 h-3.5 transition-transform duration-200 ${region.expanded ? 'rotate-90' : ''}`}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white text-sm truncate" title={region.region}>
                                                    {region.region}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                    {region.cities.length} {region.cities.length === 1 ? 'city' : 'cities'}
                                                </span>
                                                <span className="inline-flex items-center rounded-full bg-pink-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                                                    {region.total}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Animated Expandable City List */}
                                        <AnimatedRegionContent region={region}>
                                            <div className="p-2 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
                                                <div className="space-y-1 pt-1.5">
                                                    {region.cities.map((city) => (
                                                        <div
                                                            key={city.city}
                                                            className="flex items-center justify-between gap-2 rounded-xl p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60 group/city"
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                                                                    {city.city}
                                                                </span>
                                                                <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                                                                    {city.total}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleViewCityParcels(city.city, city.parcels)}
                                                                    className="rounded px-2 py-0.5 text-[10px] font-semibold text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-700 dark:hover:text-pink-300 transition-colors cursor-pointer"
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleGenerateCityBulkQr(city.city, city.parcels)}
                                                                    disabled={generatingBulk || city.parcels.length === 0}
                                                                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${city.hasBulkQr
                                                                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 cursor-default'
                                                                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300'
                                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                                >
                                                                    <i className={`fas ${city.hasBulkQr ? 'fa-check-circle' : 'fa-qrcode'}`}></i>
                                                                    <span>{city.hasBulkQr ? 'QR' : 'City QR'}</span>
                                                                </button>
                                                                {city.bulkQrCity && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => copyToClipboard(city.bulkQrCity!)}
                                                                        className="rounded p-0.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                                                        title="Copy QR code"
                                                                    >
                                                                        <i className="fas fa-copy text-[10px]"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </AnimatedRegionContent>
                                    </div>
                                ))
                            )
                        ) : (
                            /* Improved Empty State */
                            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/50 dark:to-slate-900 py-16 px-6 text-center">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 blur-2xl bg-pink-200/30 dark:bg-pink-900/10 rounded-full"></div>
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/50 text-pink-500 dark:text-pink-400 shadow-sm ring-1 ring-pink-500/10 dark:ring-pink-500/20">
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-slate-900 dark:text-white">No destinations found</p>
                                <p className="mt-1.5 max-w-xs text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {searchTerm || locationRegionFilter || locationCityFilter ? (
                                        <>
                                            Try adjusting your search or filter criteria
                                            <span className="block text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                No parcels match the current {searchTerm && 'search term'}{searchTerm && (locationRegionFilter || locationCityFilter) && ' and '}{locationRegionFilter && 'region filter'}{locationRegionFilter && locationCityFilter && ' and '}{locationCityFilter && 'city filter'}
                                            </span>
                                        </>
                                    ) : (
                                        'No received parcels available for sorting at this time.'
                                    )}
                                </p>
                                {(searchTerm || locationRegionFilter || locationCityFilter) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setLocationRegionFilter('');
                                            setLocationCityFilter('');
                                        }}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                    >
                                        <i className="fas fa-undo-alt text-[10px]"></i>
                                        <span>Clear all filters</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-black/40 overflow-hidden" id="table">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="p-3.5 pl-4 w-8">
                                        <input
                                            type="checkbox"
                                            className="accent-pink-500 rounded cursor-pointer"
                                            checked={filteredParcels.length > 0 && selectedParcelIds.size === filteredParcels.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                        />
                                    </th>
                                    <th className="p-3.5">#</th>
                                    <th className="p-3.5">Barcode</th>
                                    <th className="p-3.5">Tracking</th>
                                    <th className="p-3.5">Destination</th>
                                    <th className="p-3.5">City</th>
                                    <th className="p-3.5">Region</th>
                                    <th className="p-3.5">Courier</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5">Received</th>
                                    <th className="p-3.5">Bulk QR (Global)</th>
                                    <th className="p-3.5 pr-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-300">
                                {filteredParcels.length > 0 ? (
                                    filteredParcels.map((parcel, index) => (
                                        <tr key={parcel.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors even:bg-slate-50/40 dark:even:bg-slate-800/20">
                                            <td className="p-3.5 pl-4">
                                                <input
                                                    type="checkbox"
                                                    className="accent-pink-500 rounded cursor-pointer"
                                                    checked={selectedParcelIds.has(parcel.id)}
                                                    onChange={(e) => handleSelectParcel(parcel.id, e.target.checked)}
                                                />
                                            </td>
                                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">{index + 1}</td>
                                            <td className="p-3.5 font-mono text-slate-900 dark:text-slate-200 font-semibold">
                                                {parcel.barcode}
                                                {(parcel.bulk_qr_city || parcel.bulk_qr_courier || parcel.bulk_qr_code) && (
                                                    <span
                                                        className="ml-1 text-[10px] text-blue-500 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                                        title={`Click to copy: ${parcel.bulk_qr_city || parcel.bulk_qr_courier || parcel.bulk_qr_code}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(parcel.bulk_qr_city || parcel.bulk_qr_courier || parcel.bulk_qr_code!);
                                                        }}
                                                    >
                                                        <i className="fas fa-qrcode"></i>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{parcel.tracking_number}</td>
                                            <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{parcel.destination || 'N/A'}</td>
                                            <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{parcel.city || 'N/A'}</td>
                                            <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{parcel.region || 'N/A'}</td>
                                            <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                                                {parcel.courier || 'N/A'}
                                            </td>
                                            <td className="p-3.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40">
                                                    received
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-slate-400 dark:text-slate-500 font-mono">
                                                {parcel.created_at ? new Date(parcel.created_at).toLocaleTimeString() : 'N/A'}
                                            </td>
                                            <td className="p-3.5">
                                                {parcel.bulk_qr_code ? (
                                                    <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-200/60 dark:border-emerald-800/40">
                                                        <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 max-w-[100px] truncate">
                                                            {parcel.bulk_qr_code}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(parcel.bulk_qr_code!)}
                                                            className="rounded p-0.5 text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                                                            title="Copy QR code"
                                                        >
                                                            <i className="fas fa-copy text-[10px]"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-600 font-semibold">—</span>
                                                )}
                                            </td>
                                            <td className="p-3.5 pr-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteParcel(parcel.id, parcel.barcode)}
                                                    className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                    title="Delete parcel"
                                                >
                                                    <i className="fas fa-times text-xs"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={12} className="p-8 text-center">
                                            <div className="flex flex-col items-center justify-center py-4">
                                                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-2 text-slate-400 dark:text-slate-500">
                                                    <i className="fas fa-box-open text-lg"></i>
                                                </div>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No parcels found</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                    {searchTerm || locationRegionFilter || locationCityFilter ?
                                                        'Try adjusting your search or filters' :
                                                        'No received parcels available'
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-900 dark:text-white">{Math.min(limit, filteredParcels.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> parcels
                            {selectedParcelIds.size > 0 && (
                                <span className="ml-2 text-pink-600 dark:text-pink-400 font-bold">
                                    ({selectedParcelIds.size} selected)
                                </span>
                            )}
                        </span>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>

            <div className="text-slate-900 dark:text-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center">
                            <i className="fas fa-truck text-pink-500 dark:text-pink-400 text-xs"></i>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                            Courier Pickup Summary
                        </h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                        <i className="far fa-clock text-slate-400 dark:text-slate-500 mr-1"></i> Ready for pickup
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
                    {courierStats.length > 0 ? (
                        courierStats.map((courier) => {
                            const hasQr = courier.hasBulkQr;
                            const qrCode = courier.bulkQrCourier;

                            return (
                                <div
                                    key={courier.name}
                                    className={`group relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${hasQr
                                        ? 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:shadow-emerald-500/5'
                                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-slate-500/5'
                                        }`}
                                >
                                    {/* Header Section */}
                                    <div>
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-bold tracking-tight text-slate-800 dark:text-white" title={courier.name}>
                                                {courier.name}
                                            </span>
                                            <span className="inline-flex items-center rounded-full bg-pink-50 dark:bg-pink-950/40 px-2.5 py-0.5 text-xs font-bold text-pink-600 dark:text-pink-400 ring-1 ring-inset ring-pink-500/10 dark:ring-pink-500/20">
                                                {courier.count}
                                            </span>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium">
                                            <span
                                                className={`h-2 w-2 rounded-full ${hasQr ? 'bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-950' : 'bg-amber-500 ring-2 ring-amber-100 dark:ring-amber-950'
                                                    }`}
                                            />
                                            <span className={hasQr ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                                                {hasQr ? 'Courier QR Ready' : 'Ready for pickup'}
                                            </span>
                                        </div>

                                        {/* QR Code Pill - Show Courier QR */}
                                        {hasQr && qrCode && (
                                            <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 border border-slate-100 dark:border-slate-800">
                                                <span className="truncate text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400 max-w-[130px]">
                                                    {qrCode}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(qrCode);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                    title="Copy QR code"
                                                >
                                                    <i className="fas fa-copy text-xs"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons Footer */}
                                    <div className="mt-4 flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        {/* Main Action: View Parcels */}
                                        <button
                                            type="button"
                                            onClick={() => handleViewCourierParcels(courier.name)}
                                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 dark:hover:text-pink-400 group/btn"
                                        >
                                            <span>View parcels</span>
                                            <i className="fas fa-arrow-right text-[10px] text-slate-400 dark:text-slate-500 group-hover/btn:text-pink-500 group-hover/btn:translate-x-0.5 transition-all"></i>
                                        </button>

                                        {/* Secondary Action: Courier Bulk QR Generator */}
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateCourierBulkQr(courier.name)}
                                            disabled={generatingBulk || courier.parcels.length === 0 || hasQr}
                                            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${hasQr
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 cursor-default border border-emerald-200/60 dark:border-emerald-800/60'
                                                : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                                                }`}
                                        >
                                            <i className={`fas ${hasQr ? 'fa-check-circle text-emerald-600 dark:text-emerald-400' : 'fa-qrcode'} text-xs`}></i>
                                            <span>{hasQr ? 'Courier QR Generated' : 'Generate Courier QR'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        /* Improved Empty State for Couriers */
                        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/50 dark:to-slate-900 py-14 px-6 text-center">
                            <div className="relative mb-3">
                                <div className="absolute inset-0 blur-2xl bg-amber-200/30 dark:bg-amber-900/10 rounded-full"></div>
                                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-500 dark:text-amber-400 shadow-sm ring-1 ring-amber-500/10 dark:ring-amber-500/20">
                                    <i className="fas fa-truck text-xl"></i>
                                </div>
                            </div>
                            <p className="text-base font-bold text-slate-900 dark:text-white">No couriers available</p>
                            <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                There are currently no couriers with pending parcels ready for pickup.
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                                <i className="fas fa-info-circle text-slate-300 dark:text-slate-600"></i>
                                <span>Parcels will appear here when assigned to a courier</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Portal>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl dark:shadow-black/70 border border-slate-200/80 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 dark:text-pink-400 border border-pink-100 dark:border-pink-900/30">
                                        <i className="fas fa-map-pin text-base"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                            {selectedParcels.length > 0 ? selectedParcels[0]?.city || 'Parcels' : 'Parcels'}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {selectedParcels.length} {selectedParcels.length === 1 ? 'parcel' : 'parcels'} found
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleGenerateBulkQr}
                                        disabled={generatingBulk || selectedParcels.length === 0 || selectedParcels.every((p) => p.bulk_qr_code)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                                    >
                                        {generatingBulk ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin text-xs"></i>
                                                <span>Generating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-qrcode text-xs"></i>
                                                <span>Generate Bulk QR</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setSelectedParcels([]);
                                        }}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 cursor-pointer"
                                        aria-label="Close modal"
                                    >
                                        <i className="fas fa-times text-sm"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Table Area */}
                            <div className="relative flex-1 overflow-y-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800">
                                        <tr>
                                            <th className="py-3 px-4 sm:px-6">Barcode</th>
                                            <th className="py-3 px-3">Tracking</th>
                                            <th className="py-3 px-3">Courier</th>
                                            <th className="py-3 px-4 sm:px-6">Bulk QR (City)</th>
                                            <th className="py-3 px-4 sm:px-6 text-right">Bulk QR (Global)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                        {selectedParcels.map((parcel) => (
                                            <tr key={parcel.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                                <td className="py-3 px-4 sm:px-6 font-mono font-bold text-slate-900 dark:text-slate-100">
                                                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200">
                                                        {parcel.barcode}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                                                    {parcel.tracking_number}
                                                </td>
                                                <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                                                    {parcel.courier || 'N/A'}
                                                </td>
                                                <td className="py-3 px-4 sm:px-6">
                                                    {parcel.bulk_qr_city ? (
                                                        <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-200/60 dark:border-emerald-800/60">
                                                            <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 max-w-[100px] truncate">
                                                                {parcel.bulk_qr_city}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(parcel.bulk_qr_city!)}
                                                                className="rounded p-0.5 text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                                                                title="Copy QR code"
                                                            >
                                                                <i className="fas fa-copy text-[10px]"></i>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-600 font-semibold">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 sm:px-6 text-right">
                                                    {parcel.bulk_qr_code ? (
                                                        <div className="inline-flex items-center justify-end gap-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-200/60 dark:border-emerald-800/60">
                                                            <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 max-w-[100px] truncate">
                                                                {parcel.bulk_qr_code}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(parcel.bulk_qr_code!)}
                                                                className="rounded p-0.5 text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                                                                title="Copy QR code"
                                                            >
                                                                <i className="fas fa-copy text-[10px]"></i>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-600 font-semibold">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 sm:px-6">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                                        {selectedParcels.filter((p) => p.bulk_qr_code).length} of {selectedParcels.length} with global QR
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                                        {selectedParcels.filter((p) => p.bulk_qr_city).length} with city QR
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedParcels([]);
                                    }}
                                    className="rounded-xl px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </Portal>

            <Portal>
                {showCourierModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 dark:text-pink-400 border border-pink-100 dark:border-pink-900/30">
                                        <i className="fas fa-truck text-base"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                            {selectedCourier || 'Courier Parcels'}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {courierParcels.length} {courierParcels.length === 1 ? 'parcel' : 'parcels'} found
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCourierModal(false);
                                        setCourierParcels([]);
                                        setSelectedCourier(null);
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                                    aria-label="Close modal"
                                >
                                    <i className="fas fa-xmark text-sm"></i>
                                </button>
                            </div>

                            {/* Modal Body / Table */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                {courierParcels.length > 0 ? (
                                    <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    <th scope="col" className="px-3 py-2.5">Barcode</th>
                                                    <th scope="col" className="px-3 py-2.5">Tracking</th>
                                                    <th scope="col" className="px-3 py-2.5">Destination</th>
                                                    <th scope="col" className="px-3 py-2.5">City</th>
                                                    <th scope="col" className="px-3 py-2.5">Bulk QR (Courier)</th>
                                                    <th scope="col" className="px-3 py-2.5">Bulk QR (Global)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                                                {courierParcels.map((parcel) => (
                                                    <tr key={parcel.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                                            {parcel.barcode}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                                                            {parcel.tracking_number}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                                                            {parcel.destination || <span className="text-slate-400 dark:text-slate-600">N/A</span>}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                                                            {parcel.city || <span className="text-slate-400 dark:text-slate-600">N/A</span>}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-2.5">
                                                            {parcel.bulk_qr_courier ? (
                                                                <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/40 px-2 py-0.5">
                                                                    <span className="font-mono text-[10px] font-medium text-emerald-700 dark:text-emerald-400 max-w-[120px] truncate">
                                                                        {parcel.bulk_qr_courier}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => copyToClipboard(parcel.bulk_qr_courier!)}
                                                                        className="rounded p-0.5 text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
                                                                        title="Copy QR code"
                                                                    >
                                                                        <i className="fas fa-copy text-[10px]"></i>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-300 dark:text-slate-700 font-mono">—</span>
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-2.5">
                                                            {parcel.bulk_qr_code ? (
                                                                <div className="inline-flex items-center gap-1.5 rounded-md border border-blue-200/80 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/40 px-2 py-0.5">
                                                                    <span className="font-mono text-[10px] font-medium text-blue-700 dark:text-blue-400 max-w-[120px] truncate">
                                                                        {parcel.bulk_qr_code}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => copyToClipboard(parcel.bulk_qr_code!)}
                                                                        className="rounded p-0.5 text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
                                                                        title="Copy QR code"
                                                                    >
                                                                        <i className="fas fa-copy text-[10px]"></i>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-300 dark:text-slate-700 font-mono">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    /* Empty Table State */
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="mb-2 rounded-full bg-slate-100 dark:bg-slate-800 p-3 text-slate-400 dark:text-slate-500">
                                            <i className="fas fa-box-open text-xl"></i>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No parcels found</p>
                                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">There are no individual parcels attached to this courier.</p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 px-6 py-3.5">
                                <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                                        {courierParcels.filter((p) => p.bulk_qr_courier).length} with courier QR
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                                        {courierParcels.filter((p) => p.bulk_qr_code).length} with global QR
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCourierModal(false);
                                        setCourierParcels([]);
                                        setSelectedCourier(null);
                                    }}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
                                >
                                    Done
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </Portal>
        </div>
    );
}