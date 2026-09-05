'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SessionGuard } from '@/app/(supplyChain)/components/server/SessionGuard';
import { DocumentsTab } from '@/app/(supplyChain)/(pages)/trash/components/DocumentsTab';
import { PurchaseOrdersTab } from '@/app/(supplyChain)/(pages)/trash/components/PurchaseOrdersTab';
import { SuppliersTab } from '@/app/(supplyChain)/(pages)/trash/components/SuppliersTab';
import { ParcelsTab } from '@/app/(supplyChain)/(pages)/trash/components/ParcelsTab';

type ArchiveTab = 'inventory' | 'documents' | 'purchase_orders' | 'suppliers' | 'parcels';

const DEFAULT_TAB: ArchiveTab = 'documents';
const VALID_TABS: ArchiveTab[] = ['inventory', 'documents', 'purchase_orders', 'suppliers', 'parcels'];

export default function ArchivePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tabFromUrl = searchParams.get('tab') as ArchiveTab;
    const isValidTab = tabFromUrl && VALID_TABS.includes(tabFromUrl);
    const [activeTab, setActiveTab] = useState<ArchiveTab>(isValidTab ? tabFromUrl : DEFAULT_TAB);
    const [isAnimating, setIsAnimating] = useState(false);

    // update tab
    const updateTab = useCallback((tab: ArchiveTab) => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
        setActiveTab(tab);

        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.push(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    // sync active tab
    useEffect(() => {
        const tab = searchParams.get('tab') as ArchiveTab;
        if (tab && VALID_TABS.includes(tab)) {
            setActiveTab(tab);
        } else if (!tab) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', DEFAULT_TAB);
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [searchParams, router]);

    // tab config
    const tabs = [
        { key: 'documents' as const, label: 'Documents', icon: 'fa-file-alt' },
        { key: 'purchase_orders' as const, label: 'Purchase Orders', icon: 'fa-file-invoice' },
        { key: 'suppliers' as const, label: 'Suppliers', icon: 'fa-handshake' },
        { key: 'parcels' as const, label: 'Parcels', icon: 'fa-boxes' },
    ];

    return (
        <SessionGuard requiredRole={['Admin', 'Manager', 'Employee', 'Executive']}>
            <div className={`p-6 space-y-6 animate-in fade-in duration-300 bgCard ${isAnimating ? 'opacity-50 transition-opacity duration-200' : 'opacity-100'}`}>
                {/* header */}
                <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200/80 dark:border-slate-800 pb-5">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#ffe6f0] border border-pink-300/90 dark:bg-[#341427] dark:border-[#67224c] flex items-center justify-center text-pink-600 dark:text-pink-300 text-xl shadow-[inset_0_1px_0_#ffffff,0_2px_6px_rgba(244,63,94,0.14)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_6px_rgba(0,0,0,0.6)] shrink-0">
                            <i className="fa-solid fa-trash-can-arrow-up"></i>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                Trash Management
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                View, restore, or permanently remove deleted records
                            </p>
                        </div>
                    </div>
                </div>

                {/* tabs */}
                <div className="flex items-center gap-1.5 bg-[#ebf0f7]/95 dark:bg-[#14151c]/95 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/60 shadow-[inset_2px_2px_5px_rgba(166,175,195,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.65),inset_-1px_-1px_4px_rgba(255,255,255,0.05)] overflow-x-auto no-scrollbar w-fit">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => updateTab(tab.key)}
                                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer active:scale-95 ${
                                    isActive
                                        ? 'bg-gradient-to-b from-pink-500 to-pink-600 text-white border border-pink-400/80 dark:border-pink-500/80 shadow-[0_4px_14px_rgba(236,72,153,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.25)] font-bold'
                                        : 'bg-[#f0f3f8] dark:bg-[#1d1e28] text-slate-700 dark:text-slate-200 border border-white/70 dark:border-[#2a2b38] hover:bg-[#e8edf5] dark:hover:bg-[#232533] shadow-[3px_3px_7px_rgba(166,175,195,0.35),-3px_-3px_7px_rgba(255,255,255,0.9),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.55),-2px_-2px_6px_rgba(255,255,255,0.04),inset_0_1px_1px_rgba(255,255,255,0.06)]'
                                }`}
                            >
                                <i
                                    className={`fas ${tab.icon} text-xs transition-colors duration-200 ${
                                        isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                                    }`}
                                ></i>
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* content */}
                <div className="transition-opacity duration-300 ease-in-out">
                    {activeTab === 'documents' && <DocumentsTab />}
                    {activeTab === 'purchase_orders' && <PurchaseOrdersTab />}
                    {activeTab === 'suppliers' && <SuppliersTab />}
                    {activeTab === 'parcels' && <ParcelsTab />}
                </div>
            </div>
        </SessionGuard>
    );
}