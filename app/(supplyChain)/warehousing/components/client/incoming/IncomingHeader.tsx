"use client";

import { useState } from "react";
import { toast } from "sonner";
import { receiveAllParcels } from "@/app/(supplyChain)/warehousing/actions/incoming/parcels";
import { user } from "@/app/(supplyChain)/lib/services/Class/user"

interface IncomingHeaderProps {
    onReceiveAll?: () => void;
}

export default function IncomingHeader({ onReceiveAll }: IncomingHeaderProps) {
    const [isReceivingAll, setIsReceivingAll] = useState(false);

    const handleReceiveAll = async () => {
        if (isReceivingAll) return;

        setIsReceivingAll(true);
        const toastId = toast.loading('Processing receive all...');

        try {
            const result = await receiveAllParcels();

            if (!result.success) {
                toast.error(result.error || 'Failed to receive parcels', {
                    id: toastId,
                    duration: 5000,
                });
                return;
            }

            if (result.data?.warning) {
                toast.warning(`Received ${result.data.received} parcels with warnings`, {
                    id: toastId,
                    duration: 3000,
                });
            } else {
                toast.success(`Successfully received ${result.data?.received || 0} parcels`, {
                    id: toastId,
                    duration: 3000,
                });
            }

            onReceiveAll?.();
        } catch (error) {
            console.error('Error receiving all:', error);
            toast.error('Failed to receive parcels', {
                id: toastId,
                description: error instanceof Error ? error.message : 'Please try again',
                duration: 5000,
            });
        } finally {
            setIsReceivingAll(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 pb-4 border-b border-slate-200/80 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-500 ring-1 ring-inset ring-pink-500/10">
                        <i className="fas fa-arrow-down text-sm" aria-hidden="true" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                        Incoming Receiving
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-sm">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        Batch <span className="font-mono font-bold text-slate-900">#B-2407</span>
                    </span>
                    <span className="text-slate-300" aria-hidden="true">•</span>
                    <span>Warehouse 1</span>
                    <span className="text-slate-300" aria-hidden="true">•</span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                        Operator: <strong className="font-semibold text-slate-900">{user.getName()}</strong>
                    </span>
                </div>
            </div>

            <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                <button
                    type="button"
                    onClick={handleReceiveAll}
                    disabled={isReceivingAll}
                    aria-busy={isReceivingAll}
                    className="group relative inline-flex w-full min-w-[140px] items-center justify-center gap-2.5 rounded-xl border-b-4 border-pink-800 bg-pink-600 px-5 py-2.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-75 hover:bg-pink-500 active:translate-y-1 active:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/30 sm:w-auto disabled:translate-y-0 disabled:border-b-0 disabled:bg-pink-400 disabled:opacity-60 disabled:shadow-none"
                >
                    <i
                        className={`fas ${isReceivingAll
                            ? 'fa-circle-notch fa-spin text-white'
                            : 'fa-check-circle text-pink-100 group-hover:text-white'
                            } text-sm drop-shadow transition-colors duration-200`}
                        aria-hidden="true"
                    />
                    <span className="tracking-wide drop-shadow-sm">
                        {isReceivingAll ? 'Processing...' : 'Receive All'}
                    </span>
                </button>
            </div>
        </div>
    );
}