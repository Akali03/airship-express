// app/(supplyChain)/inventory/components/tabs/ParcelsTab.tsx
'use client';
import { useState, memo, useMemo } from 'react';
import { toast } from "sonner";
import { Parcel, GroupedParcels } from '../../types';
import { getStatusLabel, getStatusTone } from '../../utils/helpers';
import { sanitizeSearch } from '@/app/(supplyChain)/components/global/sanitize';
import { Pagination } from '@/app/(supplyChain)/components/global/pagination';
import { TableSkeleton } from '@/app/(supplyChain)/components/ui/SkeletonLoader';
import { CrudActionButton } from '@/app/(supplyChain)/components/ui/CrudActionButton';
import { AppButton } from '@/app/(supplyChain)/components/ui/AppButton';
import { StatusBadge } from '@/app/(supplyChain)/components/ui/StatusBadge';
import { ParcelTrackingCard } from '../tracking/ParcelTrackingCard';
import Portal from '@/app/(supplyChain)/components/client/Portal';

interface ParcelsTabProps {
    parcels: Parcel[];
    groupedParcels: GroupedParcels[];
    searchTerm: string;
    statusFilter: string;
    dateFrom: string;
    dateTo: string;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    isLoading?: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onClearFilters: () => void;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
}

const STATUS_FLOW = [
    { key: 'received', label: 'Received', icon: 'fa-box', color: 'blue' },
    { key: 'sorting', label: 'Sorting', icon: 'fa-sort', color: 'amber' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: 'fa-check-circle', color: 'emerald' },
    { key: 'picked_up', label: 'Picked Up', icon: 'fa-truck', color: 'purple' },
    { key: 'in_transit', label: 'In Transit', icon: 'fa-truck-moving', color: 'indigo' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'fa-shipping-fast', color: 'pink' },
    { key: 'delivered', label: 'Delivered', icon: 'fa-home', color: 'green' },
];

const STATUS_COLORS: Record<string, string> = {
    'received': 'bg-blue-500',
    'sorting': 'bg-amber-500',
    'ready_for_pickup': 'bg-emerald-500',
    'picked_up': 'bg-purple-500',
    'in_transit': 'bg-indigo-500',
    'out_for_delivery': 'bg-pink-500',
    'delivered': 'bg-green-500',
};

export const ParcelsTab = memo(function ParcelsTab({
    parcels,
    groupedParcels,
    searchTerm,
    statusFilter,
    dateFrom,
    dateTo,
    currentPage,
    totalPages,
    totalItems,
    isLoading = false,
    onSearchChange,
    onStatusChange,
    onDateFromChange,
    onDateToChange,
    onClearFilters,
    onPageChange,
    itemsPerPage = 30,
}: ParcelsTabProps) {
    const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedParcelIds, setSelectedParcelIds] = useState<Set<string | number>>(new Set());

    // All parcels currently present across all date groups
    const allParcelsInGroups = useMemo(() => groupedParcels.flatMap(g => g.parcels), [groupedParcels]);
    const allSelected = allParcelsInGroups.length > 0 && allParcelsInGroups.every(p => selectedParcelIds.has(p.id));
    const someSelected = selectedParcelIds.size > 0 && !allSelected;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedParcelIds(new Set(allParcelsInGroups.map(p => p.id)));
        } else {
            setSelectedParcelIds(new Set());
        }
    };

    const handleSelectGroup = (groupParcels: Parcel[], checked: boolean) => {
        const next = new Set(selectedParcelIds);
        if (checked) {
            groupParcels.forEach(p => next.add(p.id));
        } else {
            groupParcels.forEach(p => next.delete(p.id));
        }
        setSelectedParcelIds(next);
    };

    const handleSelectParcel = (id: string | number, checked: boolean) => {
        const next = new Set(selectedParcelIds);
        if (checked) {
            next.add(id);
        } else {
            next.delete(id);
        }
        setSelectedParcelIds(next);
    };
    const getStatusIndex = (status: string): number => {
        return STATUS_FLOW.findIndex(s => s.key === status);
    };
    const getStatusState = (status: string, currentStatus: string): 'completed' | 'current' | 'pending' => {
        const statusIndex = getStatusIndex(status);
        const currentIndex = getStatusIndex(currentStatus);
        if (statusIndex === -1)
            return 'pending';
        if (statusIndex < currentIndex)
            return 'completed';
        if (statusIndex === currentIndex)
            return 'current';
        return 'pending';
    };
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const formatRelativeTime = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };
    const getTimelineData = (parcel: Parcel) => {
        const currentStatus = parcel.status;
        return STATUS_FLOW.map((status, index) => {
            const state = getStatusState(status.key, currentStatus);
            const isCompleted = state === 'completed';
            const isCurrent = state === 'current';
            const isPending = state === 'pending';
            let timestamp = null;
            let formattedDate = null;
            let relativeTime = null;
            if (isCompleted || isCurrent) {
                if (isCurrent) {
                    timestamp = new Date(parcel.updated_at);
                }
                else {
                    const baseDate = new Date(parcel.created_at);
                    const estimatedMinutes = index * 15;
                    timestamp = new Date(baseDate.getTime() + estimatedMinutes * 60000);
                }
                formattedDate = timestamp ? formatDate(timestamp.toISOString()) : null;
                relativeTime = timestamp ? formatRelativeTime(timestamp.toISOString()) : null;
            }
            return {
                ...status,
                state,
                isCompleted,
                isCurrent,
                isPending,
                timestamp,
                formattedDate,
                relativeTime,
            };
        });
    };
    const handleViewParcel = (parcel: Parcel) => {
        setSelectedParcel(parcel);
        setShowModal(true);
    };
    const getProgressData = (parcel: Parcel) => {
        const timelineData = getTimelineData(parcel);
        const isDelivered = parcel.status === 'delivered' ||
            parcel.status === 'returned' ||
            parcel.status === 'cancelled';
        let progressPercent = 100;
        if (!isDelivered) {
            const currentIndex = timelineData.findIndex(item => item.isCurrent);
            if (currentIndex >= 0) {
                progressPercent = Math.min(100, Math.max(0, (currentIndex / (timelineData.length - 1)) * 100));
            }
            else {
                progressPercent = 0;
            }
        }
        return { timelineData, isDelivered, progressPercent };
    };
    const handlePageChange = (page: number) => {
        if (typeof onPageChange === 'function') {
            onPageChange(page);
        }
        else {
            console.warn('onPageChange is not a function');
        }
    };
    // calculate range
    const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
    return (<>
            <div className="bg-[#f0f3f8] dark:bg-[#191a24] rounded-3xl border border-white/80 dark:border-[#2c2d3c] shadow-[8px_8px_24px_rgba(166,175,195,0.4),-8px_-8px_24px_rgba(255,255,255,0.95),inset_0_1px_1.5px_rgba(255,255,255,0.9)] dark:shadow-[10px_10px_30px_rgba(0,0,0,0.75),-6px_-6px_20px_rgba(255,255,255,0.03),inset_0_1px_1px_rgba(255,255,255,0.07)] overflow-hidden transition-colors flex flex-col">
                {/* header */}
                <div className="flex-shrink-0 p-4 border-b border-slate-200/60 dark:border-slate-800/80 bg-[#ebf0f7]/70 dark:bg-[#14151c]/70 backdrop-blur-md flex flex-wrap items-center gap-3 justify-between">
                    <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                        {/* search */}
                        <div className="relative flex-1 min-w-[200px] max-w-xs group">
                            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-pink-500 text-xs pointer-events-none transition-colors"></i>
                            <input type="search" className="w-full bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 py-2 pl-9 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-[inset_1px_1px_3px_rgba(166,175,195,0.35),inset_-1px_-1px_3px_rgba(255,255,255,0.9)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none focus:border-pink-500 dark:focus:border-pink-500/80 transition-all" placeholder="Search barcode, tracking, sender..." value={searchTerm} onChange={(e) => onSearchChange(sanitizeSearch(e.target.value))}/>
                        </div>

                        {/* status filter */}
                        <div className="relative min-w-[140px] group">
                            <i className="fas fa-filter absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-pink-500 text-xs pointer-events-none transition-colors"></i>
                            <select className="w-full appearance-none bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 py-2 pl-9 pr-8 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-[inset_1px_1px_3px_rgba(166,175,195,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.8)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)] focus:outline-none focus:border-pink-500 dark:focus:border-pink-500/80 transition-all cursor-pointer" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
                                <option value="" className="dark:bg-slate-900">All Statuses</option>
                                <option value="received" className="dark:bg-slate-900">Received</option>
                                <option value="sorting" className="dark:bg-slate-900">Sorting</option>
                                <option value="ready_for_pickup" className="dark:bg-slate-900">Ready</option>
                                <option value="picked_up" className="dark:bg-slate-900">Picked Up</option>
                                <option value="in_transit" className="dark:bg-slate-900">In Transit</option>
                                <option value="out_for_delivery" className="dark:bg-slate-900">Out for Delivery</option>
                                <option value="delivered" className="dark:bg-slate-900">Delivered</option>
                            </select>
                            <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[10px] pointer-events-none"></i>
                        </div>

                        {/* date filter */}
                        <div className="flex items-center gap-1.5 bg-[#ebf0f7] dark:bg-[#14151c] p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-[inset_1px_1px_3px_rgba(166,175,195,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.8)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)]">
                            <div className="relative flex items-center">
                                <input type="date" className="py-0.5 px-2 text-xs font-medium border-0 bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer scheme-light dark:scheme-dark" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} title="Date From"/>
                            </div>
                            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium uppercase">—</span>
                            <div className="relative flex items-center">
                                <input type="date" className="py-0.5 px-2 text-xs font-medium border-0 bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer scheme-light dark:scheme-dark" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} title="Date To"/>
                            </div>
                        </div>
                    </div>

                    {/* counter & bulk actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {/* Bulk Checkbox Button that checks all across all dates */}
                        <AppButton
                            type="button"
                            variant={allSelected ? "primary" : "neutral"}
                            size="sm"
                            onClick={() => handleSelectAll(!allSelected)}
                            disabled={allParcelsInGroups.length === 0}
                            title="Check or uncheck all parcels across all date groups"
                            className="!font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <i className={`fas ${allSelected ? 'fa-square-check text-pink-500' : someSelected ? 'fa-minus-square text-pink-500' : 'fa-square text-slate-400'} text-xs`} />
                            <span>
                                {allSelected
                                    ? `Deselect All (${allParcelsInGroups.length})`
                                    : someSelected
                                        ? `Select All (${allParcelsInGroups.length}) [${selectedParcelIds.size} checked]`
                                        : `Select All Parcels (${allParcelsInGroups.length})`}
                            </span>
                        </AppButton>

                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-[#ebf0f7] dark:bg-[#14151c] px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-[inset_1px_1px_3px_rgba(166,175,195,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.8)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)]">
                            <i className="fas fa-box text-pink-500 dark:text-pink-400 text-[11px]"></i>
                            <span>{totalItems} parcels</span>
                        </span>

                        <button className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-[#f0f3f8] dark:bg-[#1d1e28] border border-white/80 dark:border-[#2a2b38] shadow-[3px_3px_7px_rgba(166,175,195,0.35),-3px_-3px_7px_rgba(255,255,255,0.9),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.55),-2px_-2px_6px_rgba(255,255,255,0.04)] hover:text-pink-600 dark:hover:text-pink-400 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer" onClick={onClearFilters} title="Reset active filters">
                            <i className="fas fa-rotate-left text-[11px]"></i>
                            <span>Clear</span>
                        </button>
                    </div>
                </div>

                {/* content */}
                <div className="flex-1 overflow-y-auto max-h-[600px] p-4 space-y-5 bg-[#f0f3f8] dark:bg-[#191a24]">
                    {/* Global Bulk Select-All Banner */}
                    {allParcelsInGroups.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#ebf0f7]/90 dark:bg-[#14151e]/90 border border-white/80 dark:border-white/[0.06] shadow-xs">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(el) => {
                                        if (el) {
                                            el.indeterminate = someSelected;
                                        }
                                    }}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500 bg-transparent"
                                />
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    Select All Parcels across All Dates ({allParcelsInGroups.length} items in {groupedParcels.length} date groups)
                                </span>
                            </label>
                            {selectedParcelIds.size > 0 && (
                                <div className="flex items-center gap-2.5 text-xs">
                                    <span className="font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2.5 py-0.5 rounded-full border border-pink-200 dark:border-pink-800 text-[11px]">
                                        {selectedParcelIds.size} of {allParcelsInGroups.length} selected
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const trackings = allParcelsInGroups.filter(p => selectedParcelIds.has(p.id)).map(p => p.tracking_number || p.barcode).filter(Boolean).join('\n');
                                            if (trackings) {
                                                navigator.clipboard.writeText(trackings);
                                                toast.success(`Copied ${selectedParcelIds.size} tracking numbers`);
                                            }
                                        }}
                                        className="text-[11px] font-bold text-pink-600 hover:text-pink-700 dark:text-pink-400 underline cursor-pointer"
                                    >
                                        Copy Tracking Numbers
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedParcelIds(new Set())}
                                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
                                    >
                                        Clear Selection
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {isLoading ? (<TableSkeleton rows={6} cardWrapper={false}/>) : groupedParcels.length > 0 ? (groupedParcels.map((group) => (<div key={group.date} className="rounded-2xl border border-white/80 dark:border-[#2c2d3c] overflow-hidden bg-[#f0f3f8] dark:bg-[#191a24] shadow-[4px_4px_12px_rgba(166,175,195,0.35),-4px_-4px_12px_rgba(255,255,255,0.9)] dark:shadow-[4px_4px_14px_rgba(0,0,0,0.6),-2px_-2px_6px_rgba(255,255,255,0.03)] transition-colors">

                                {/* group header */}
                                <div className="bg-[#ebf0f7]/80 dark:bg-[#14151c]/80 px-4 py-2.5 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={group.parcels.length > 0 && group.parcels.every(p => selectedParcelIds.has(p.id))}
                                            ref={(el) => {
                                                if (el) {
                                                    const someInGroup = group.parcels.some(p => selectedParcelIds.has(p.id));
                                                    const allInGroup = group.parcels.every(p => selectedParcelIds.has(p.id));
                                                    el.indeterminate = someInGroup && !allInGroup;
                                                }
                                            }}
                                            onChange={(e) => handleSelectGroup(group.parcels, e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500 bg-transparent"
                                            title={`Select all ${group.parcels.length} parcels for ${group.date}`}
                                        />
                                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20 inline-flex items-center justify-center text-pink-500 dark:text-pink-400 text-[11px]">
                                                <i className="fas fa-calendar-day"></i>
                                            </span>
                                            {group.date}
                                        </h3>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-[#ebf0f7] dark:bg-[#14151c] px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-800 shadow-[inset_1px_1px_2px_rgba(166,175,195,0.2)]">
                                        {group.parcels.length} {group.parcels.length === 1 ? 'parcel' : 'parcels'}
                                    </span>
                                </div>

                                {/* table */}
                                <div className="overflow-x-auto">
                                    <table className="table-pro p-1">
                                        <thead>
                                            <tr>
                                                <th className="w-10 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={group.parcels.length > 0 && group.parcels.every(p => selectedParcelIds.has(p.id))}
                                                        onChange={(e) => handleSelectGroup(group.parcels, e.target.checked)}
                                                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500 bg-transparent"
                                                    />
                                                </th>
                                                <th className="w-10 text-center">#</th>
                                                <th>Barcode</th>
                                                <th>Tracking</th>
                                                <th>Sender</th>
                                                <th>Customer</th>
                                                <th>Customer Number</th>
                                                <th>Destination</th>
                                                <th>Courier</th>
                                                <th>Status</th>
                                                <th>Time</th>
                                                <th className="text-right! w-[80px] min-w-[80px]">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.parcels.map((parcel, index) => {
                                                const isSelected = selectedParcelIds.has(parcel.id);
                                                return (<tr
                                                    key={parcel.id}
                                                    onClick={() => handleViewParcel(parcel)}
                                                    className={`hover:bg-[#e8edf5]/80 dark:hover:bg-[#20212f]/40 transition-colors duration-150 group cursor-pointer ${isSelected ? 'bg-pink-50/50 dark:bg-pink-950/30' : ''}`}
                                                >
                                                    <td className="text-center w-10" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => handleSelectParcel(parcel.id, e.target.checked)}
                                                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500 bg-transparent"
                                                        />
                                                    </td>
                                                    <td data-label="#" className="text-center text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                                                        {index + 1}
                                                    </td>
                                                    <td data-label="Barcode" className="whitespace-nowrap">
                                                        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 font-bold bg-[#ebf0f7] dark:bg-[#14151c] px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/50 shadow-[inset_1px_1px_2px_rgba(166,175,195,0.2)]">
                                                            {parcel.barcode}
                                                        </span>
                                                    </td>
                                                    <td data-label="Tracking" className="font-mono text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                        {parcel.tracking_number}
                                                    </td>
                                                    <td data-label="Sender" className="text-slate-800 dark:text-slate-200 font-semibold whitespace-nowrap">
                                                        {parcel.sender_name || 'N/A'}
                                                    </td>
                                                    <td data-label="Customer" className="text-slate-800 dark:text-slate-200 font-semibold whitespace-nowrap">
                                                        {parcel.customer_name || 'N/A'}
                                                    </td>
                                                    <td data-label="Customer Number" className="text-slate-800 dark:text-slate-200 font-semibold whitespace-nowrap">
                                                        {parcel.customer_number || 'N/A'}
                                                    </td>
                                                    <td data-label="Destination" className="text-slate-600 dark:text-slate-300 whitespace-nowrap truncate max-w-3">
                                                        {parcel.destination || 'N/A'}
                                                    </td>
                                                    <td data-label="Courier" className="text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                                                        {parcel.courier || 'N/A'}
                                                    </td>
                                                    <td data-label="Status" className="whitespace-nowrap">
                                                        <StatusBadge tone={getStatusTone(parcel.status)} size="xs" dot>
                                                            {getStatusLabel(parcel.status)}
                                                        </StatusBadge>
                                                    </td>
                                                    <td data-label="Time" className="text-slate-400 dark:text-slate-500 text-[11px] font-mono whitespace-nowrap">
                                                        {new Date(parcel.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td data-label="Action" className="text-right whitespace-nowrap w-[80px] min-w-[80px]" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end">
                                                            <CrudActionButton action="view" ariaLabel={`View parcel ${parcel.barcode}`} title="View Parcel" onClick={() => handleViewParcel(parcel)}/>
                                                        </div>
                                                    </td>
                                                </tr>);
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>))) : (
        /* Empty State */
        <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/60 dark:border-slate-800 shadow-[inset_2px_2px_5px_rgba(166,175,195,0.35),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.65),inset_-1px_-1px_4px_rgba(255,255,255,0.05)] flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
                <i className="fas fa-box-open text-xl"></i>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No parcels found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto font-medium">Try adjusting your search query or active filter parameters</p>
        </div>)}
                </div>

                {/* pagination */}
                {!isLoading && groupedParcels.length > 0 && totalItems > 0 && (<div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 backdrop-blur-md flex-wrap gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{startIndex}</span> to{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{endIndex}</span> of{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> parcels
                        </span>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange}/>
                    </div>)}
            </div>

            {/* modal */}
            {showModal && selectedParcel && (() => {
            const { timelineData, isDelivered, progressPercent } = getProgressData(selectedParcel);
            return (
                <Portal>
                    <div className="fixed inset-0 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 transition-all duration-300 animate-in fade-in" onClick={() => setShowModal(false)}>
                        <div className="bg-[#f0f3f8] dark:bg-[#191a24] rounded-3xl max-w-3xl lg:max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[16px_16px_40px_rgba(0,0,0,0.35)] border border-white/80 dark:border-[#2c2d3c] overflow-hidden transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4" onClick={(e) => e.stopPropagation()}>

                            {/* header */}
                            <div className="flex items-center justify-between p-5 border-b border-slate-200/60 dark:border-slate-800 shrink-0 bg-slate-50/70 dark:bg-slate-900/40">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                                        <span className="w-10 h-10 rounded-2xl bg-[#ebf0f7] dark:bg-[#14151c] text-pink-500 dark:text-pink-400 border border-slate-200/60 dark:border-slate-800 shadow-[inset_1.5px_1.5px_3px_rgba(166,175,195,0.35),inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.9)] dark:shadow-[inset_1.5px_1.5px_4px_rgba(0,0,0,0.65)] inline-flex items-center justify-center">
                                            <i className="fas fa-route text-sm"></i>
                                        </span>
                                        Parcel Delivery Tracking
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                                        <span>Tracking: <code className="font-mono font-semibold text-slate-800 dark:text-slate-200 bg-[#ebf0f7] dark:bg-[#14151c] px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800 shadow-[inset_1px_1px_2px_rgba(166,175,195,0.25)]">{selectedParcel.tracking_number}</code></span>
                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                        <span>Courier: <strong className="font-bold text-slate-800 dark:text-slate-200">{selectedParcel.courier || 'Airship Express'}</strong></span>
                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                        <span>Barcode: <code className="font-mono font-semibold text-slate-800 dark:text-slate-200 bg-[#ebf0f7] dark:bg-[#14151c] px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800 shadow-[inset_1px_1px_2px_rgba(166,175,195,0.25)]">{selectedParcel.barcode}</code></span>
                                    </p>
                                </div>
                                <AppButton type="button" variant="neutral" size="icon-sm" onClick={() => setShowModal(false)} aria-label="Close modal">
                                    <i className="fas fa-times text-xs"></i>
                                </AppButton>
                            </div>

                            {/* body */}
                            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#ebf0f7]/40 dark:bg-[#14151c]/40 overscroll-contain">

                                {/* tracking map */}
                                <ParcelTrackingCard parcel={selectedParcel}/>

                                {/* progress card */}
                                <div className="p-5 rounded-3xl bg-[#f0f3f8] dark:bg-[#191a24] border border-white/80 dark:border-[#2c2d3c] shadow-[6px_6px_18px_rgba(166,175,195,0.35),-6px_-6px_18px_rgba(255,255,255,0.9)] dark:shadow-[8px_8px_24px_rgba(0,0,0,0.65)] space-y-4">
                                    {/* header */}
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold flex items-center gap-1.5">
                                            <span className={`inline-block w-2 h-2 rounded-full ${isDelivered ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.5)]'}`}/>
                                            {isDelivered ? 'Delivery Complete' : 'Overall Delivery Progress'}
                                        </span>
                                        <StatusBadge tone={isDelivered ? "emerald" : "pink"} size="xs">
                                            {isDelivered ? '100%' : `${Math.round(progressPercent)}%`}
                                        </StatusBadge>
                                    </div>

                                    {/* progress bar */}
                                    <div className="w-full bg-[#ebf0f7] dark:bg-[#14151c] h-3 rounded-full overflow-hidden relative p-0.5 border border-slate-200/60 dark:border-slate-800 shadow-[inset_1.5px_1.5px_3px_rgba(166,175,195,0.35),inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.9)] dark:shadow-[inset_1.5px_1.5px_4px_rgba(0,0,0,0.65)]">
                                        <div className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isDelivered
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300 shadow-sm shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-pink-500 to-rose-400 dark:from-pink-400 dark:to-rose-300 shadow-sm shadow-pink-500/20'}`} style={{ width: `${isDelivered ? 100 : progressPercent}%` }}/>
                                    </div>

                                    {/* complete banner */}
                                    {isDelivered && (<div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold shadow-[3px_3px_8px_rgba(16,185,129,0.15),inset_0_1px_1px_#ffffff]">
                                            <i className="fas fa-check-circle text-sm text-emerald-600 dark:text-emerald-400"></i>
                                            <span>Parcel successfully delivered</span>
                                        </div>)}

                                    {/* metadata */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                                        <div className="p-3 rounded-2xl bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/60 dark:border-slate-800 shadow-[inset_1px_1px_2.5px_rgba(166,175,195,0.25)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)] space-y-1">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Sender</p>
                                            <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 break-words">{selectedParcel.sender_name || 'N/A'}</p>
                                        </div>

                                        <div className="p-3 rounded-2xl bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/60 dark:border-slate-800 shadow-[inset_1px_1px_2.5px_rgba(166,175,195,0.25)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)] space-y-1">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Destination</p>
                                            <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 break-words whitespace-normal">{selectedParcel.destination || 'N/A'}</p>
                                        </div>

                                        <div className="p-3 rounded-2xl bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/60 dark:border-slate-800 shadow-[inset_1px_1px_2.5px_rgba(166,175,195,0.25)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)] space-y-1">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Courier</p>
                                            <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 break-words">{selectedParcel.courier || 'N/A'}</p>
                                        </div>

                                        <div className="p-3 rounded-2xl bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/60 dark:border-slate-800 shadow-[inset_1px_1px_2.5px_rgba(166,175,195,0.25)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)] space-y-1">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Status</p>
                                            <div>
                                                <StatusBadge tone={getStatusTone(selectedParcel.status)} size="xs" dot>
                                                    {getStatusLabel(selectedParcel.status)}
                                                </StatusBadge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* timeline */}
                                <div className="relative pl-2">

                                    {/* line */}
                                    <div className="absolute left-6 top-5 bottom-5 w-0.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>

                                    {/* progress line */}
                                    <div className={`absolute left-6 top-5 w-0.5 rounded-full transition-all duration-1000 ease-out ${isDelivered ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-pink-500 dark:bg-pink-400'}`} style={{ height: isDelivered ? '100%' : `${progressPercent}%` }}></div>

                                    <div className="space-y-5">
                                        {timelineData.map((item, index) => {
                    const isCompleted = isDelivered || item.isCompleted;
                    const isCurrent = !isDelivered && item.isCurrent;
                    const isPending = !isDelivered && item.isPending;
                    const isLastDelivered = isDelivered && item.key === 'delivered';
                    return (<div key={item.key} className="relative flex items-start gap-4 group transition-all duration-300" style={{ animationDelay: `${index * 80}ms` }}>
                                                    {/* node */}
                                                    <div className="relative z-10 flex-shrink-0">
                                                        <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300
                                        ${isCompleted || isLastDelivered ? `bg-emerald-500 dark:bg-emerald-600 text-white ring-4 ring-[#f0f3f8] dark:ring-[#191a24] shadow-[0_2px_8px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.4)]` : ''}
                                        ${isCurrent ? `bg-gradient-to-tr from-pink-600 to-rose-500 text-white ring-4 ring-pink-100 dark:ring-pink-950/50 shadow-[0_2px_8px_rgba(244,63,94,0.35),inset_0_1px_0_rgba(255,255,255,0.4)]` : ''}
                                        ${isPending ? 'bg-[#ebf0f7] dark:bg-[#14151c] text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800 ring-4 ring-[#f0f3f8] dark:ring-[#191a24] shadow-[inset_1px_1px_2px_rgba(166,175,195,0.25)]' : ''}
                                    `}>
                                                            <i className={`fas ${item.icon}`}></i>
                                                        </div>
                                                    </div>

                                                    {/* content */}
                                                    <div className={`flex-1 rounded-2xl p-4 border transition-all duration-200 ${isCurrent
                            ? 'bg-[#f0f3f8] dark:bg-[#191a24] border-pink-300 dark:border-pink-800 shadow-[4px_4px_12px_rgba(244,63,94,0.15),-2px_-2px_6px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_12px_rgba(0,0,0,0.5)]'
                            : isLastDelivered
                                ? 'bg-[#f0f3f8] dark:bg-[#191a24] border-emerald-300 dark:border-emerald-800 shadow-[4px_4px_12px_rgba(16,185,129,0.15),-2px_-2px_6px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_12px_rgba(0,0,0,0.5)]'
                                : 'bg-[#f0f3f8] dark:bg-[#191a24] border-white/80 dark:border-[#2c2d3c] shadow-[3px_3px_8px_rgba(166,175,195,0.25),-3px_-3px_8px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45)]'}`}>
                                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                                            <div>
                                                                <p className={`font-bold text-sm ${isPending ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                                                                    {item.label}
                                                                </p>

                                                                {(isCompleted || isCurrent || isLastDelivered) && item.formattedDate && (<p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                                                                        <i className="far fa-calendar-alt text-[10px]"></i>
                                                                        <span>{item.formattedDate}</span>
                                                                    </p>)}
                                                            </div>

                                                            {/* badges */}
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {(isCompleted || isCurrent || isLastDelivered) && item.relativeTime && (<span className="text-[11px] text-slate-600 dark:text-slate-300 bg-[#ebf0f7] dark:bg-[#14151c] px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800 font-semibold shadow-[inset_1px_1px_2px_rgba(166,175,195,0.2)]">
                                                                        {item.relativeTime}
                                                                    </span>)}

                                                                {isCurrent && (<StatusBadge tone="pink" size="xs" dot>
                                                                        Current
                                                                    </StatusBadge>)}

                                                                {isLastDelivered && (<StatusBadge tone="emerald" size="xs" icon="fas fa-check-circle">
                                                                        Delivered
                                                                    </StatusBadge>)}

                                                                {isPending && (<StatusBadge tone="neutral" size="xs" icon="far fa-clock">
                                                                        Pending
                                                                    </StatusBadge>)}
                                                            </div>
                                                        </div>

                                                        {/* text */}
                                                        <div className="mt-2 text-xs">
                                                            {(isCompleted || isLastDelivered) && (<p className="text-slate-500 dark:text-slate-400 font-medium">
                                                                    {item.key === 'received' && 'Parcel received at facility'}
                                                                    {item.key === 'sorting' && 'Parcel is being sorted'}
                                                                    {item.key === 'ready_for_pickup' && 'Parcel ready for courier pickup'}
                                                                    {item.key === 'picked_up' && 'Parcel picked up by courier'}
                                                                    {item.key === 'in_transit' && 'Parcel is in transit to destination'}
                                                                    {item.key === 'delivered' && 'Parcel delivered successfully'}
                                                                </p>)}
                                                            {isCurrent && (<p className="text-pink-600 dark:text-pink-400 font-semibold">
                                                                    {item.key === 'received' && 'Currently being received at facility'}
                                                                    {item.key === 'sorting' && 'Currently being sorted'}
                                                                    {item.key === 'ready_for_pickup' && 'Awaiting courier pickup'}
                                                                    {item.key === 'picked_up' && 'Currently being picked up'}
                                                                    {item.key === 'in_transit' && 'In transit to destination'}
                                                                    {item.key === 'delivered' && 'Being delivered to recipient'}
                                                                </p>)}
                                                        </div>
                                                    </div>
                                                </div>);
                })}
                                    </div>
                                </div>
                            </div>

                            {/* footer */}
                            <div className="flex justify-end gap-2 p-4 border-t border-slate-200/60 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 shrink-0">
                                <AppButton type="button" variant="primary" size="sm" onClick={() => setShowModal(false)}>
                                    <i className="fas fa-check text-[11px]"></i>
                                    <span>Done</span>
                                </AppButton>
                            </div>

                        </div>
                    </div>
                </Portal>
            );
        })()}
        </>);
});
