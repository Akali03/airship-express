'use client';

import { toast } from "sonner";
import { useState, useEffect, useCallback } from 'react';
import { useConfirm } from '@/app/(supplyChain)/components/ui/ConfirmModal';
import { useInventory } from './hooks/useInventory';
import { useParcels } from './hooks/useParcels';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// ui pieces
import { DashboardTab } from './components/tabs/DashboardTab';
import { InventoryTab } from './components/tabs/InventoryTab';
import { ParcelsTab } from './components/tabs/ParcelsTab';
import { AddItemModal } from './components/modals/AddItemModal';
import { EditItemModal } from './components/modals/EditItemModal';
import { StockInModal } from './components/modals/StockInModal';
import { StockOutModal } from './components/modals/StockOutModal';

// types and helpers
import { GroupedParcels, InventoryItem } from './types';
import { PageSkeleton } from '../components/ui/SkeletonLoader';
import { useDebounce } from "../hooks/useDebounce";
import { sanitizeText } from "../components/global/sanitize";
import { fetchInventoryPageData, type Parcel } from './server/query';

// Animation variants with proper typing
const tabVariants: Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 30 : -30,
        opacity: 0,
        scale: 0.98
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut" as const
        }
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 30 : -30,
        opacity: 0,
        scale: 0.98,
        transition: {
            duration: 0.2,
            ease: "easeIn" as const
        }
    })
};

export default function InventoryClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get tab from URL or default to 'dashboard'
    const initialTab = searchParams.get('tab') || 'dashboard';
    const [activeTab, setActiveTab] = useState<string>(initialTab);
    const [direction, setDirection] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [parcelSearchTerm, setParcelSearchTerm] = useState('');
    const [parcelStatusFilter, setParcelStatusFilter] = useState('');
    const [parcelDateFrom, setParcelDateFrom] = useState('');
    const [parcelDateTo, setParcelDateTo] = useState('');

    const [inventoryPage, setInventoryPage] = useState(1);
    const [parcelPage, setParcelPage] = useState(1);
    const itemsPerPage = 15;

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStockInModal, setShowStockInModal] = useState(false);
    const [showStockOutModal, setShowStockOutModal] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [selectedItemForStock, setSelectedItemForStock] = useState<string>('');

    const [loading, setLoading] = useState(true);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [totalInventoryItems, setTotalInventoryItems] = useState(0);
    const [inventoryTotalPages, setInventoryTotalPages] = useState(1);

    const [parcels, setParcels] = useState<Parcel[]>([]);
    const [totalParcels, setTotalParcels] = useState(0);
    const [parcelTotalPages, setParcelTotalPages] = useState(1);

    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [dashboardStats, setDashboardStats] = useState<any>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const debouncedParcelSearch = useDebounce(parcelSearchTerm, 300);

    const { confirm } = useConfirm();
    const {
        saving,
        deleting,
        addItem,
        updateItem,
        deleteItem,
        deleteMultipleItems,
        stockIn,
        stockOut,
    } = useInventory();

    // fetch everything we need
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const result = await fetchInventoryPageData({
                inventoryPage: inventoryPage,
                inventoryLimit: itemsPerPage,
                inventorySearch: debouncedSearchTerm,
                inventoryCategory: categoryFilter,
                inventoryStatus: statusFilter,
                parcelPage: parcelPage,
                parcelLimit: itemsPerPage,
                parcelSearch: debouncedParcelSearch,
                parcelStatus: parcelStatusFilter,
                parcelDateFrom: parcelDateFrom,
                parcelDateTo: parcelDateTo,
            });

            if (!result.success) {
                toast.error(result.error || 'Failed to load data');
                return;
            }

            // pull out data with safe fallbacks
            const { data } = result;

            // inventory data
            const inventoryData = data?.inventory;
            if (inventoryData) {
                setInventoryItems(inventoryData.items || []);
                setTotalInventoryItems(inventoryData.totalItems || 0);
                setInventoryTotalPages(inventoryData.totalPages || 1);
            } else {
                setInventoryItems([]);
                setTotalInventoryItems(0);
                setInventoryTotalPages(1);
            }

            // parcel data
            const parcelsData = data?.parcels;
            if (parcelsData) {
                setParcels(parcelsData.parcels || []);
                setTotalParcels(parcelsData.totalItems || 0);
                setParcelTotalPages(parcelsData.totalPages || 1);
            } else {
                setParcels([]);
                setTotalParcels(0);
                setParcelTotalPages(1);
            }

            // suppliers and stats
            setSuppliers(data?.suppliers || []);
            setDashboardStats(data?.stats || null);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [
        inventoryPage,
        itemsPerPage,
        debouncedSearchTerm,
        categoryFilter,
        statusFilter,
        parcelPage,
        debouncedParcelSearch,
        parcelStatusFilter,
        parcelDateFrom,
        parcelDateTo,
    ]);

    // Sync tab with URL without page reload
    const handleTabChange = (tab: string) => {
        const tabIndex = ['dashboard', 'inventory', 'parcels'].indexOf(tab);
        const currentIndex = ['dashboard', 'inventory', 'parcels'].indexOf(activeTab);
        setDirection(tabIndex > currentIndex ? 1 : -1);

        setActiveTab(tab);
        localStorage.setItem('inventoryActiveTab', tab);

        // Update URL without reload
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.replace(`/inventory?${params.toString()}`, { scroll: false });
    };

    // load saved tab and initial data
    useEffect(() => {
        const savedTab = localStorage.getItem('inventoryActiveTab');
        const urlTab = searchParams.get('tab');

        // Prioritize URL tab over saved tab
        if (urlTab && ['dashboard', 'inventory', 'parcels'].includes(urlTab)) {
            setActiveTab(urlTab);
        } else if (savedTab && !urlTab) {
            setActiveTab(savedTab);
            // Update URL to match saved tab
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', savedTab);
            router.replace(`/inventory?${params.toString()}`, { scroll: false });
        }

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData]);

    // handlers for user actions
    const handleInventoryPageChange = (page: number) => {
        if (page >= 1 && page <= inventoryTotalPages && page !== inventoryPage) {
            setInventoryPage(page);
        }
    };

    const handleParcelPageChange = (page: number) => {
        if (page >= 1 && page <= parcelTotalPages && page !== parcelPage) {
            setParcelPage(page);
        }
    };

    const handleAddItem = async (data: any) => {
        await addItem(data);
        setShowAddModal(false);
        fetchData();
    };

    const handleUpdateItem = async (data: any) => {
        await updateItem(data);
        setShowEditModal(false);
        setEditingItem(null);
        fetchData();
    };

    const handleDeleteItem = async (id: string, name: string) => {
        const confirmed = await confirm({
            title: 'Delete Item',
            message: `Are you sure you want to delete "${name}"?`,
            confirmText: 'Delete',
            confirmVariant: 'danger'
        });
        if (confirmed) {
            await deleteItem(id, name);
            fetchData();
        }
    };

    const handleDeleteMultiple = async () => {
        if (selectedIds.size === 0) {
            toast.warning('Please select at least one item');
            return;
        }
        const confirmed = await confirm({
            title: `Delete ${selectedIds.size} Items`,
            message: `Are you sure you want to delete ${selectedIds.size} item(s)?`,
            confirmText: `Delete ${selectedIds.size}`,
            confirmVariant: 'danger'
        });
        if (confirmed) {
            await deleteMultipleItems(Array.from(selectedIds));
            setSelectedIds(new Set());
            fetchData();
        }
    };

    const handleStockIn = async (itemName: string, quantity: number, supplier?: string, reference?: string, remarks?: string) => {
        await stockIn(itemName, quantity, supplier, reference, remarks);
        setShowStockInModal(false);
        fetchData();
    };

    const handleStockOut = async (itemName: string, quantity: number, department?: string, purpose?: string, remarks?: string) => {
        await stockOut(itemName, quantity, department, purpose, remarks);
        setShowStockOutModal(false);
        fetchData();
    };

    const openEditModal = (item: InventoryItem) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    const openStockInModal = (itemName: string) => {
        setSelectedItemForStock(itemName);
        setShowStockInModal(true);
    };

    if (loading) {
        return <PageSkeleton />;
    }

    // group parcels by date for display
    const filteredGroupedParcels = parcels.reduce((acc: GroupedParcels[], parcel) => {
        const date = new Date(parcel.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        const existingGroup = acc.find(g => g.date === date);
        if (existingGroup) {
            existingGroup.parcels.push(parcel);
        } else {
            acc.push({ date, parcels: [parcel] });
        }
        return acc;
    }, []);

    // Map tab IDs to components with their keys
    const tabComponents = {
        dashboard: (
            <DashboardTab
                key="dashboard"
                inventoryItems={inventoryItems}
                stats={dashboardStats}
                onStockIn={openStockInModal}
                onCategoryClick={(category) => {
                    handleTabChange('inventory');
                    setCategoryFilter(category);
                    setInventoryPage(1);
                }}
                onStatusClick={(status) => {
                    handleTabChange('inventory');
                    setStatusFilter(status);
                    setInventoryPage(1);
                }}
            />
        ),
        inventory: (
            <InventoryTab
                key="inventory"
                items={inventoryItems}
                totalItems={totalInventoryItems}
                currentPage={inventoryPage}
                totalPages={inventoryTotalPages}
                searchTerm={searchTerm}
                categoryFilter={categoryFilter}
                statusFilter={statusFilter}
                selectedIds={selectedIds}
                itemsPerPage={itemsPerPage}
                onSearchChange={setSearchTerm}
                onCategoryChange={(val) => {
                    setCategoryFilter(val);
                    setInventoryPage(1);
                }}
                onStatusChange={(val) => {
                    setStatusFilter(val);
                    setInventoryPage(1);
                }}
                onPageChange={handleInventoryPageChange}
                onSelectAll={() => {
                    if (selectedIds.size === inventoryItems.length) {
                        setSelectedIds(new Set());
                    } else {
                        setSelectedIds(new Set(inventoryItems.map(item => item.id)));
                    }
                }}
                onSelect={(id) => {
                    const newSelected = new Set(selectedIds);
                    if (newSelected.has(id)) newSelected.delete(id);
                    else newSelected.add(id);
                    setSelectedIds(newSelected);
                }}
                onClearFilters={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setSelectedIds(new Set());
                    setInventoryPage(1);
                }}
                onEdit={openEditModal}
                onDelete={handleDeleteItem}
                onStockIn={openStockInModal}
                onStockOut={(itemName) => {
                    setSelectedItemForStock(itemName);
                    setShowStockOutModal(true);
                }}
                onAddItem={() => setShowAddModal(true)}
            />
        ),
        parcels: (
            <ParcelsTab
                key="parcels"
                parcels={parcels}
                groupedParcels={filteredGroupedParcels}
                searchTerm={parcelSearchTerm}
                statusFilter={parcelStatusFilter}
                dateFrom={parcelDateFrom}
                dateTo={parcelDateTo}
                currentPage={parcelPage}
                totalPages={parcelTotalPages}
                totalItems={totalParcels}
                onSearchChange={setParcelSearchTerm}
                onStatusChange={setParcelStatusFilter}
                onDateFromChange={setParcelDateFrom}
                onDateToChange={setParcelDateTo}
                onClearFilters={() => {
                    setParcelSearchTerm('');
                    setParcelStatusFilter('');
                    setParcelDateFrom('');
                    setParcelDateTo('');
                    setParcelPage(1);
                }}
                onPageChange={handleParcelPageChange}
            />
        )
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-300 bgCard">

            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 text-xl shadow-2xs shrink-0">
                            <i className="fas fa-warehouse"></i>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Warehouse Inventory
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Manage warehouse supplies, equipment, parcels, and assets
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {selectedIds.size > 0 && (
                            <button
                                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-2xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in duration-200"
                                onClick={handleDeleteMultiple}
                                disabled={deleting}
                            >
                                <i className="fas fa-trash-can text-xs text-rose-600"></i>
                                <span>Delete</span>
                                <span className="px-1.5 py-0.5 rounded-full bg-rose-200/80 text-rose-800 text-[10px] font-bold">
                                    {selectedIds.size}
                                </span>
                            </button>
                        )}

                        <button
                            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-2xs hover:shadow-pink-500/20 active:scale-[0.98]"
                            onClick={() => setShowAddModal(true)}
                        >
                            <i className="fas fa-plus text-xs"></i>
                            <span>Add Item</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-2xs max-w-fit">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
                        { id: 'inventory', label: 'Inventory', icon: 'fa-boxes-stacked' },
                        { id: 'parcels', label: 'Parcels', icon: 'fa-box-archive' },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 relative cursor-pointer ${isActive
                                    ? 'text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg shadow-xs dark:border dark:border-slate-700/60"
                                        transition={{ type: "spring", duration: 0.4 }}
                                    />
                                )}
                                <i
                                    className={`fas ${tab.icon} text-xs relative z-10 transition-colors ${isActive
                                        ? 'text-pink-500 dark:text-pink-400'
                                        : 'text-slate-400 dark:text-slate-500'
                                        }`}
                                />
                                <span className="relative z-10">{tab.label}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Animated Tab Content */}
            <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={activeTab}
                        custom={direction}
                        variants={tabVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="min-h-[400px]"
                    >
                        {tabComponents[activeTab as keyof typeof tabComponents]}
                    </motion.div>
                </AnimatePresence>
            </div>

            <AddItemModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddItem}
                suppliers={suppliers}
                loading={saving}
            />

            {editingItem && (
                <EditItemModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingItem(null);
                    }}
                    onSave={handleUpdateItem}
                    item={editingItem}
                    suppliers={suppliers}
                    loading={saving}
                />
            )}

            <StockInModal
                isOpen={showStockInModal}
                onClose={() => {
                    setShowStockInModal(false);
                    setSelectedItemForStock('');
                }}
                onStockIn={handleStockIn}
                inventoryItems={inventoryItems}
                preSelectedItem={selectedItemForStock}
                loading={saving}
            />

            <StockOutModal
                isOpen={showStockOutModal}
                onClose={() => {
                    setShowStockOutModal(false);
                    setSelectedItemForStock('');
                }}
                onStockOut={handleStockOut}
                inventoryItems={inventoryItems}
                preSelectedItem={selectedItemForStock}
                loading={saving}
            />
        </div>
    );
}