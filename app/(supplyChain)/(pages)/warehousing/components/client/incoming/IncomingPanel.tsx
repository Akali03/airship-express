"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { fetchParcels } from "@/app/(supplyChain)/(pages)/warehousing/actions/incoming/incomingPanel";
import IncomingHeader from "./IncomingHeader";
import ScanPanel from "./ScanPanel";
import TableFilters from "./TableFilters";
import { IncomingTable } from "./ParcelTable";
import { supabase } from "@/app/(supplyChain)/lib/services/client/supabase";
import { TableSkeleton } from "@/app/(supplyChain)/components/ui/SkeletonLoader";
interface Parcel {
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
    status: 'pending' | 'verified' | 'rejected';
}
export default function IncomingPanel() {
    const [parcels, setParcels] = useState<Parcel[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ scanned: 0, topCourier: '' });
    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);
    const limit = 15;
    const isMounted = useRef(true);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const subscriptionRef = useRef<any>(null);
    const isInitialLoad = useRef(true);
    const fetchParcelsData = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            else {
                setIsRefreshing(true);
            }
            const result = await fetchParcels({
                filter: filter || undefined,
                search: search || undefined,
                page,
                limit,
            });
            if (!result.success) {
                if (showLoading) {
                    toast.error(result.error || 'Failed to load parcels', {
                        duration: 5000,
                    });
                }
                if (showLoading) {
                    setLoading(false);
                }
                else {
                    setIsRefreshing(false);
                }
                return;
            }
            if (isMounted.current) {
                setParcels(result.data);
                setTotalItems(result.pagination.total);
                setTotalPages(result.pagination.totalPages);
                setStats(result.stats);
                setLastUpdate(new Date());
            }
        }
        catch (error) {
            console.error('Error fetching parcels:', error);
            if (showLoading) {
                toast.error('Failed to load parcels', {
                    description: error instanceof Error ? error.message : 'Please refresh the page',
                    duration: 5000,
                });
            }
        }
        finally {
            if (showLoading) {
                setLoading(false);
            }
            else {
                setIsRefreshing(false);
            }
        }
    }, [filter, search, page, limit]);
    const updateStatsOnly = useCallback(async () => {
        try {
            const result = await fetchParcels({
                filter: filter || undefined,
                search: search || undefined,
                page: 1,
                limit: 1,
            });
            if (result.success && isMounted.current) {
                setStats(result.stats);
            }
        }
        catch (error) {
            console.error('Error updating stats:', error);
        }
    }, [filter, search]);
    const handleRealtimeUpdate = useCallback(() => {
        if (!isMounted.current)
            return;
        requestAnimationFrame(() => {
            fetchParcelsData(false);
        });
    }, [fetchParcelsData]);
    const handleScan = useCallback(() => {
        setStats(prev => ({
            ...prev,
            scanned: prev.scanned + 1
        }));
        setTimeout(() => {
            handleRealtimeUpdate();
        }, 500);
    }, [handleRealtimeUpdate]);
    const handleAddManual = useCallback(() => {
        setStats(prev => ({
            ...prev,
            scanned: prev.scanned + 1
        }));
        setTimeout(() => {
            handleRealtimeUpdate();
        }, 500);
    }, [handleRealtimeUpdate]);
    const handleDelete = useCallback((parcelId: number) => {
        setParcels(prev => prev.filter(p => p.id !== parcelId));
        setStats(prev => ({
            ...prev,
            scanned: Math.max(0, prev.scanned - 1)
        }));
        setTotalItems(prev => Math.max(0, prev - 1));
        setTimeout(() => {
            handleRealtimeUpdate();
        }, 500);
    }, [handleRealtimeUpdate]);
    const handleBatchDelete = useCallback((deletedIds: number[]) => {
        setParcels(prev => prev.filter(p => !deletedIds.includes(p.id)));
        setStats(prev => ({
            ...prev,
            scanned: Math.max(0, prev.scanned - deletedIds.length)
        }));
        setTotalItems(prev => Math.max(0, prev - deletedIds.length));
        setTimeout(() => {
            handleRealtimeUpdate();
        }, 500);
    }, [handleRealtimeUpdate]);
    useEffect(() => {
        console.log('Setting up real-time subscription...');
        const subscription = supabase
            .channel('incoming_panel_updates')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'receiving_queue',
        }, (payload) => {
            console.log('Real-time update received:', payload.eventType);
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
            refreshTimeoutRef.current = setTimeout(() => {
                handleRealtimeUpdate();
            }, 300);
        })
            .subscribe((status) => {
            console.log('Subscription status:', status);
            if (status === 'SUBSCRIBED') {
                console.log(' Real-time subscription active');
            }
        });
        subscriptionRef.current = subscription;
        return () => {
            console.log('Cleaning up real-time subscription...');
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [handleRealtimeUpdate]);
    useEffect(() => {
        setMounted(true);
    }, []);
    // page change
    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    }, [totalPages]);
    // filter change
    const handleFilterChange = useCallback((courier: string) => {
        setFilter(courier);
        setPage(1);
    }, []);
    // search
    const handleSearch = useCallback((searchTerm: string) => {
        setSearch(searchTerm);
        setPage(1);
    }, []);
    // initial load
    useEffect(() => {
        isMounted.current = true;
        fetchParcelsData(true);
        return () => {
            isMounted.current = false;
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [filter, search, page]);
    const formatTime = (date: Date | null) => {
        if (!date)
            return '';
        return date.toLocaleTimeString();
    };
    const hasNoData = !loading && parcels.length === 0;
    return (<>
            <div data-panel="incoming" className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 mx-auto min-h-screen bg-slate-50/50 card">
                <section className="space-y-5">
                    <IncomingHeader onReceiveAll={() => fetchParcelsData(true)}/>
                    <ScanPanel scanned={stats.scanned} topCourier={stats.topCourier} onScan={handleScan}/>
                </section>

                <section className="space-y-4 ">
                    <TableFilters onFilterChange={handleFilterChange} onSearch={handleSearch} onAddManual={handleAddManual}/>

                    <div className="flex items-center justify-between">
                        {isRefreshing && !loading && (<div className="flex items-center gap-2 px-1 text-xs font-medium text-slate-500 animate-pulse">
                                <i className="fas fa-arrows-rotate fa-spin text-pink-500 text-[11px]"></i>
                                <span>Syncing...</span>
                            </div>)}
                        <div className="flex-1"></div>
                        {mounted && lastUpdate && (<span className="text-[10px] text-slate-400">
                                <i className="far fa-clock mr-1"></i>
                                Updated: {formatTime(lastUpdate)}
                            </span>)}
                    </div>

                    {loading ? (<TableSkeleton rows={8}/>) : hasNoData ? (
                        <div className="relative overflow-hidden rounded-3xl border border-white/80 dark:border-[#2c2d3c] bg-[#f0f3f8] dark:bg-[#191a24] shadow-[8px_8px_24px_rgba(166,175,195,0.4),-8px_-8px_24px_rgba(255,255,255,0.95),inset_0_1px_1.5px_rgba(255,255,255,0.9)] dark:shadow-[10px_10px_30px_rgba(0,0,0,0.75),-6px_-6px_20px_rgba(255,255,255,0.03),inset_0_1px_1px_rgba(255,255,255,0.07)] p-8 sm:p-12 text-center">
                            <div className="relative z-10 max-w-md mx-auto space-y-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ebf0f7] dark:bg-[#14151c] text-pink-600 dark:text-pink-400 border border-slate-200/60 dark:border-slate-800 shadow-[inset_2px_2px_5px_rgba(166,175,195,0.35),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.65),inset_-1px_-1px_4px_rgba(255,255,255,0.05)] mx-auto animate-in zoom-in duration-300">
                                    <i className="fas fa-inbox text-2xl"></i>
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        {filter || search ? 'No Matching Parcels Found' : 'Receiving Queue is Empty'}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                        {filter || search ? (
                                            <>No parcels match your current filter criteria. Try clearing your filters or search term to see all queue items.</>
                                        ) : (
                                            <>All incoming parcels have been processed into inventory. Scan a new barcode or add an entry manually to begin receiving.</>
                                        )}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                    {filter || search ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilter("");
                                                setSearch("");
                                                setPage(1);
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f0f3f8] dark:bg-[#1d1e28] text-slate-800 dark:text-slate-200 border border-white/70 dark:border-[#2a2b38] shadow-[3px_3px_7px_rgba(166,175,195,0.35),-3px_-3px_7px_rgba(255,255,255,0.9),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.55),-2px_-2px_6px_rgba(255,255,255,0.04),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:shadow-[1px_1px_3px_rgba(166,175,195,0.5),-1px_-1px_3px_rgba(255,255,255,0.9)] text-xs font-bold transition-all cursor-pointer active:scale-95"
                                        >
                                            <i className="fas fa-undo-alt text-[11px]"></i>
                                            <span>Clear Filters</span>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (typeof window !== 'undefined' && window.openManualEntryModal) {
                                                        window.openManualEntryModal();
                                                    }
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-b from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 text-white border border-pink-400/80 text-xs font-bold shadow-[0_4px_14px_rgba(236,72,153,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95"
                                            >
                                                <i className="fas fa-plus text-[11px]"></i>
                                                <span>Add Manual Entry</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => fetchParcelsData(true)}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f0f3f8] dark:bg-[#1d1e28] border border-white/70 dark:border-[#2a2b38] text-slate-700 dark:text-slate-200 text-xs font-bold shadow-[3px_3px_7px_rgba(166,175,195,0.35),-3px_-3px_7px_rgba(255,255,255,0.9),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.55),-2px_-2px_6px_rgba(255,255,255,0.04),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:shadow-[1px_1px_3px_rgba(166,175,195,0.5),-1px_-1px_3px_rgba(255,255,255,0.9)] transition-all cursor-pointer active:scale-95"
                                            >
                                                <i className="fas fa-sync-alt text-[11px]"></i>
                                                <span>Refresh List</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (<IncomingTable initialParcels={parcels} onDelete={handleDelete} onBatchDelete={handleBatchDelete} page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={handlePageChange} onRefresh={() => fetchParcelsData(true)} isLoading={isRefreshing}/>)}
                </section>
            </div>
        </>);
}
