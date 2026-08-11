"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/app/(supplyChain)/components/ui/ConfirmModal";
import { ParcelRow } from "../../server/incoming/ParcelRow";
import { TablePagination } from "./TablePagination";
import { deleteMultipleParcels } from "@/app/(supplyChain)/warehousing/actions/incoming/delete";
import { receiveMultipleParcels } from "@/app/(supplyChain)/warehousing/actions/incoming/parcels";
import { BulkActionsToolbar } from "@/app/(supplyChain)/components/global/BulkActionsToolbar";

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

interface IncomingTableProps {
    initialParcels: Parcel[];
    onDelete?: (id: number) => void;
    onBatchDelete?: (ids: number[]) => void;
    onBatchReceive?: (ids: number[]) => void;
    onRefresh?: () => void;
    page?: number;
    totalPages?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    isLoading?: boolean;
}

export function IncomingTable({
    initialParcels,
    onDelete,
    onBatchDelete,
    onBatchReceive,
    onRefresh,
    page = 1,
    totalPages = 1,
    totalItems = 0,
    onPageChange,
    isLoading = false,
}: IncomingTableProps) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isDeletingBatch, setIsDeletingBatch] = useState(false);
    const [isReceivingBatch, setIsReceivingBatch] = useState(false);
    const { confirm } = useConfirm();

    const duplicateBarcodes = useMemo(() => {
        const barcodeCount: Record<string, number> = {};
        const duplicates: Set<string> = new Set();

        initialParcels.forEach(p => {
            if (p.barcode) {
                barcodeCount[p.barcode] = (barcodeCount[p.barcode] || 0) + 1;
                if (barcodeCount[p.barcode] > 1) {
                    duplicates.add(p.barcode);
                }
            }
        });

        return duplicates;
    }, [initialParcels]);

    const isDuplicate = (barcode: string) => duplicateBarcodes.has(barcode);

    const handleSelectAll = () => {
        if (selectedIds.size === initialParcels.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(initialParcels.map(p => p.id)));
        }
    };

    const handleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBatchDelete = async () => {
        if (selectedIds.size === 0) {
            toast.warning('Please select at least one parcel to delete');
            return;
        }

        const confirmed = await confirm({
            title: `Delete ${selectedIds.size} Parcels`,
            message: `Are you sure you want to delete ${selectedIds.size} selected parcel(s)? This action cannot be undone.`,
            confirmText: `Delete ${selectedIds.size}`,
            cancelText: "Cancel",
            confirmVariant: "danger",
        });

        if (!confirmed) return;

        setIsDeletingBatch(true);
        const toastId = toast.loading(`Deleting ${selectedIds.size} parcels...`);

        try {
            const idsToDelete = Array.from(selectedIds);
            const result = await deleteMultipleParcels(idsToDelete);

            if (!result.success) {
                toast.error(result.error || 'Failed to delete parcels', {
                    id: toastId,
                    duration: 5000,
                });
                return;
            }

            toast.success(`Successfully deleted ${result.data?.deleted || selectedIds.size} parcels`, {
                id: toastId,
                duration: 3000,
            });

            onBatchDelete?.(idsToDelete);
            setSelectedIds(new Set());
            onRefresh?.();
        } catch (error) {
            console.error('Error deleting parcels:', error);
            toast.error('Failed to delete parcels', {
                id: toastId,
                description: error instanceof Error ? error.message : 'Please try again',
                duration: 5000,
            });
        } finally {
            setIsDeletingBatch(false);
        }
    };

    const handleBatchReceive = async () => {
        if (selectedIds.size === 0) {
            toast.warning('Please select at least one parcel to receive');
            return;
        }

        // Check if any selected parcels are already received
        const selectedParcels = initialParcels.filter(p => selectedIds.has(p.id));
        const alreadyReceived = selectedParcels.filter(p => p.status === 'verified');

        if (alreadyReceived.length > 0) {
            const confirmed = await confirm({
                title: `Some parcels already received`,
                message: `${alreadyReceived.length} of ${selectedIds.size} selected parcel(s) are already marked as received. Do you want to continue with the remaining ${selectedIds.size - alreadyReceived.length} parcel(s)?`,
                confirmText: "Continue",
                cancelText: "Cancel",
                confirmVariant: "warning",
            });

            if (!confirmed) return;

            // Remove already received parcels from selection
            const pendingIds = selectedParcels
                .filter(p => p.status !== 'verified')
                .map(p => p.id);

            if (pendingIds.length === 0) {
                toast.info('No pending parcels to receive');
                return;
            }

            // Update selectedIds to only pending ones
            setSelectedIds(new Set(pendingIds));

            // Continue with receive
            await processReceive(pendingIds);
            return;
        }

        // All selected are pending
        const confirmed = await confirm({
            title: `Receive ${selectedIds.size} Parcels`,
            message: `Are you sure you want to mark ${selectedIds.size} selected parcel(s) as received? This will move them to the receiving queue.`,
            confirmText: `Receive ${selectedIds.size}`,
            cancelText: "Cancel",
            confirmVariant: "success",
        });

        if (!confirmed) return;
        await processReceive(Array.from(selectedIds));
    };

    const processReceive = async (ids: number[]) => {
        setIsReceivingBatch(true);
        const toastId = toast.loading(`Processing ${ids.length} parcels...`);

        try {
            const result = await receiveMultipleParcels(ids);

            if (!result.success) {
                toast.error(result.error || 'Failed to receive parcels', {
                    id: toastId,
                    duration: 5000,
                });
                return;
            }

            toast.success(`Successfully received ${result.data?.received || ids.length} parcels`, {
                id: toastId,
                duration: 3000,
            });

            onBatchReceive?.(ids);
            setSelectedIds(new Set());
            onRefresh?.();
        } catch (error) {
            console.error('Error receiving parcels:', error);
            toast.error('Failed to receive parcels', {
                id: toastId,
                description: error instanceof Error ? error.message : 'Please try again',
                duration: 5000,
            });
        } finally {
            setIsReceivingBatch(false);
        }
    };

    const handleDeleteParcel = (id: number) => {
        onDelete?.(id);
    };

    const allSelected = initialParcels.length > 0 && selectedIds.size === initialParcels.length;
    const someSelected = selectedIds.size > 0 && selectedIds.size < initialParcels.length;
    const duplicateCount = duplicateBarcodes.size;

    const selectedParcels = initialParcels.filter(p => selectedIds.has(p.id));
    const pendingSelectedCount = selectedParcels.filter(p => p.status === 'pending').length;
    const canReceive = pendingSelectedCount > 0;

    const scrollToFirstDuplicate = () => {
        const firstDuplicate = initialParcels.find(p => duplicateBarcodes.has(p.barcode));
        if (firstDuplicate) {
            const element = document.getElementById(`row-${firstDuplicate.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {duplicateCount > 0 && (
                <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-red-700">
                        <i className="fas fa-exclamation-triangle text-red-500"></i>
                        <span className="font-medium">{duplicateCount} duplicate barcode(s) detected</span>
                        <span className="text-xs text-red-500 font-normal">
                            (Rows with duplicate barcodes are highlighted)
                        </span>
                    </div>
                    <button
                        onClick={scrollToFirstDuplicate}
                        className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
                    >
                        <i className="fas fa-arrow-down mr-1"></i>
                        View duplicates
                    </button>
                </div>
            )}

            {/* Bulk Actions Toolbar */}
            <BulkActionsToolbar
                selectedCount={selectedIds.size}
                itemLabel="parcels"
                singleItemLabel="parcel"
                floating={false}
                additionalInfo={
                    pendingSelectedCount > 0 && pendingSelectedCount < selectedIds.size && (
                        <span className="text-pink-200 text-xs font-normal ml-1">
                            ({pendingSelectedCount} pending, {selectedIds.size - pendingSelectedCount} already received)
                        </span>
                    )
                }
                actions={[
                    {
                        label: `Receive Selected ${pendingSelectedCount > 0 ? `(${pendingSelectedCount})` : ''}`,
                        icon: 'fa-check-double',
                        onClick: handleBatchReceive,
                        variant: 'success',
                        isLoading: isReceivingBatch,
                        disabled: isDeletingBatch || !canReceive,
                        show: canReceive,
                        mobileLabel: 'Receive',
                    },
                    {
                        label: 'Delete Selected',
                        icon: 'fa-trash',
                        onClick: handleBatchDelete,
                        variant: 'danger',
                        isLoading: isDeletingBatch,
                        disabled: isReceivingBatch,
                        mobileLabel: 'Delete',
                    },
                ]}
                onClear={() => setSelectedIds(new Set())}
            />

            <div className="overflow-x-auto">
                {/* Mobile Select All Bar - Visible only on mobile */}
                <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/60">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                        />
                        <span className="text-xs font-medium text-slate-700">
                            Select All
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
                            {initialParcels.length}
                        </span>
                    </label>
                    {selectedIds.size > 0 && (
                        <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
                            {selectedIds.size} selected
                        </span>
                    )}
                </div>

                <table className="table-pro">
                    <thead>
                        <tr>
                            <th className="text-center">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(input) => {
                                        if (input) {
                                            input.indeterminate = someSelected;
                                        }
                                    }}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500 focus:ring-2 cursor-pointer"
                                />
                            </th>
                            <th>#</th>
                            <th>Barcode</th>
                            <th>Tracking</th>
                            <th>Sender</th>
                            <th>Customer</th>
                            <th>Customer Number</th>
                            <th>Destination</th>
                            <th>Region</th>
                            <th>Courier</th>
                            <th>Status</th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialParcels.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="p-6 text-center text-slate-500">
                                    <i className="fas fa-box-open mr-2"></i>
                                    No pending parcels in queue
                                </td>
                            </tr>
                        ) : (
                            initialParcels.map((parcel, index) => (
                                <ParcelRow
                                    key={parcel.id}
                                    parcel={parcel}
                                    index={(page - 1) * 10 + index + 1}
                                    onDelete={() => handleDeleteParcel(parcel.id)}
                                    isSelected={selectedIds.has(parcel.id)}
                                    onSelect={handleSelect}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalItems > 0 && (
                <TablePagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={10}
                    onPageChange={onPageChange}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}