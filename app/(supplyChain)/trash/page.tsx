'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useConfirm } from '@/app/(supplyChain)/components/ui/ConfirmModal';
import { supabase } from '../lib/services/client/supabase';
import { SessionGuard } from '../components/server/SessionGuard';
import { BulkActionsToolbar } from '../components/global/BulkActionsToolbar';

interface ArchivedItem {
    id: string;
    item_code: string;
    item_name: string;
    category: string;
    current_stock: number;
    unit: string;
    archived_at: string;
    archived_by: string;
    archived_reason?: string;
    status: 'available' | 'low-stock' | 'out-of-stock';
    original_status?: string;
}

interface ArchivedDocument {
    id: string;
    title: string;
    file_name: string;
    file_size: number;
    file_type: string;
    storage_path: string;
    category: string;
    document_type: string;
    supplier: string | null;
    po_number: string | null;
    parcel_batch: string | null;
    uploaded_by: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    version: number;
    deleted_at: string;
    deleted_by: string;
    original_id: string;
}

type ArchiveTab = 'inventory' | 'documents';

export default function ArchivePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { confirm } = useConfirm();

    const tabFromUrl = searchParams.get('tab') as ArchiveTab;
    const [activeTab, setActiveTab] = useState<ArchiveTab>(tabFromUrl || 'inventory');

    const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

    const [archivedDocuments, setArchivedDocuments] = useState<ArchivedDocument[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [docSearchTerm, setDocSearchTerm] = useState('');
    const [docTypeFilter, setDocTypeFilter] = useState('all');
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

    const [isMounted, setIsMounted] = useState(false);

    const updateTab = useCallback((tab: ArchiveTab) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.push(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const fetchArchivedItems = useCallback(async () => {
        setItemsLoading(true);
        try {
            const mockData: ArchivedItem[] = [
                {
                    id: 'arch1',
                    item_code: 'ITM-2023-001',
                    item_name: 'Old Server Rack',
                    category: 'Equipment',
                    current_stock: 1,
                    unit: 'unit',
                    archived_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
                    archived_by: 'John Doe',
                    archived_reason: 'Discontinued model - replaced with new version',
                    status: 'out-of-stock',
                },
                {
                    id: 'arch2',
                    item_code: 'ITM-2023-002',
                    item_name: 'CRT Monitor',
                    category: 'Equipment',
                    current_stock: 3,
                    unit: 'unit',
                    archived_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
                    archived_by: 'Jane Smith',
                    archived_reason: 'Obsolete technology - no longer supported',
                    status: 'out-of-stock',
                },
                {
                    id: 'arch3',
                    item_code: 'ITM-2023-003',
                    item_name: 'Floppy Disk Drive',
                    category: 'Equipment',
                    current_stock: 5,
                    unit: 'unit',
                    archived_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
                    archived_by: 'Mike Johnson',
                    archived_reason: 'No longer used in daily operations',
                    status: 'out-of-stock',
                },
                {
                    id: 'arch4',
                    item_code: 'ITM-2023-004',
                    item_name: 'Fax Machine',
                    category: 'Equipment',
                    current_stock: 2,
                    unit: 'unit',
                    archived_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
                    archived_by: 'Sarah Wilson',
                    archived_reason: 'Replaced by digital alternatives',
                    status: 'out-of-stock',
                },
            ];

            setArchivedItems(mockData);
        } catch (error) {
            console.error('Error fetching archived items:', error);
            toast.error('Failed to load archived items');
        } finally {
            setItemsLoading(false);
        }
    }, []);

    const fetchArchivedDocuments = useCallback(async () => {
        setDocsLoading(true);
        try {
            const { data, error } = await supabase
                .from('documents_archive')
                .select('*')
                .order('deleted_at', { ascending: false });

            if (error) throw error;

            const transformedData: ArchivedDocument[] = (data || []).map((doc: any) => ({
                id: doc.id,
                title: doc.title || doc.file_name || 'Untitled',
                file_name: doc.file_name,
                file_size: doc.file_size,
                file_type: doc.file_type,
                storage_path: doc.storage_path || '',
                category: doc.category || 'documents',
                document_type: doc.document_type || 'Other',
                supplier: doc.supplier,
                po_number: doc.po_number,
                parcel_batch: doc.parcel_batch,
                uploaded_by: doc.uploaded_by,
                notes: doc.notes,
                created_at: doc.created_at,
                updated_at: doc.updated_at,
                version: doc.version || 1,
                deleted_at: doc.deleted_at || new Date().toISOString(),
                deleted_by: doc.deleted_by || 'Unknown',
                original_id: doc.original_id || doc.id,
            }));

            setArchivedDocuments(transformedData);
        } catch (error) {
            console.error('Error fetching archived documents:', error);
            toast.error('Failed to load archived documents');
        } finally {
            setDocsLoading(false);
        }
    }, []);

    const handleRestoreItem = async (id: string, name: string) => {
        const confirmed = await confirm({
            title: 'Restore Item',
            message: `Are you sure you want to restore "${name}" to active inventory?`,
            confirmText: 'Restore Item',
            confirmVariant: 'success'
        });

        if (confirmed) {
            setItemsLoading(true);
            try {
                setArchivedItems(prev => prev.filter(item => item.id !== id));
                setSelectedItemIds(prev => {
                    const updated = new Set(prev);
                    updated.delete(id);
                    return updated;
                });
                toast.success(`"${name}" restored successfully`);
            } catch (error) {
                toast.error('Failed to restore item');
                console.error(error);
            } finally {
                setItemsLoading(false);
            }
        }
    };

    const handleDeleteItemPermanently = async (id: string, name: string) => {
        const confirmed = await confirm({
            title: 'Permanent Delete',
            message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
            confirmText: 'Delete Permanently',
            confirmVariant: 'danger'
        });

        if (confirmed) {
            setItemsLoading(true);
            try {
                setArchivedItems(prev => prev.filter(item => item.id !== id));
                setSelectedItemIds(prev => {
                    const updated = new Set(prev);
                    updated.delete(id);
                    return updated;
                });
                toast.success(`"${name}" permanently deleted`);
            } catch (error) {
                toast.error('Failed to delete item');
                console.error(error);
            } finally {
                setItemsLoading(false);
            }
        }
    };

    const handleRestoreDocument = async (doc: ArchivedDocument) => {
        const confirmed = await confirm({
            title: 'Restore Document',
            message: `Are you sure you want to restore "${doc.title}" to active documents?`,
            confirmText: 'Restore Document',
            confirmVariant: 'success'
        });

        if (confirmed) {
            setDocsLoading(true);
            try {
                const { error: insertError } = await supabase
                    .from('documents')
                    .insert({
                        id: doc.original_id,
                        title: doc.title,
                        file_name: doc.file_name,
                        file_size: doc.file_size,
                        file_type: doc.file_type,
                        storage_path: doc.storage_path,
                        category: doc.category,
                        document_type: doc.document_type,
                        supplier: doc.supplier,
                        po_number: doc.po_number,
                        parcel_batch: doc.parcel_batch,
                        uploaded_by: doc.uploaded_by,
                        notes: doc.notes,
                        version: doc.version,
                        created_at: doc.created_at,
                        updated_at: new Date().toISOString(),
                    });

                if (insertError) throw insertError;

                const { error: deleteError } = await supabase
                    .from('documents_archive')
                    .delete()
                    .eq('id', doc.id);

                if (deleteError) throw deleteError;

                setArchivedDocuments(prev => prev.filter(d => d.id !== doc.id));
                setSelectedDocIds(prev => {
                    const updated = new Set(prev);
                    updated.delete(doc.id);
                    return updated;
                });
                toast.success(`"${doc.title}" restored successfully`);
            } catch (error) {
                console.error('Restore error:', error);
                toast.error('Failed to restore document');
            } finally {
                setDocsLoading(false);
            }
        }
    };

    const handleDeleteDocumentPermanently = async (doc: ArchivedDocument) => {
        const confirmed = await confirm({
            title: 'Permanent Delete',
            message: `Are you sure you want to permanently delete "${doc.title}"? This action cannot be undone.`,
            confirmText: 'Delete Permanently',
            confirmVariant: 'danger'
        });

        if (confirmed) {
            setDocsLoading(true);
            try {
                const { error } = await supabase
                    .from('documents_archive')
                    .delete()
                    .eq('id', doc.id);

                if (error) throw error;

                if (doc.storage_path) {
                    await supabase.storage.from('documents').remove([doc.storage_path]);
                }

                setArchivedDocuments(prev => prev.filter(d => d.id !== doc.id));
                setSelectedDocIds(prev => {
                    const updated = new Set(prev);
                    updated.delete(doc.id);
                    return updated;
                });
                toast.success(`"${doc.title}" permanently deleted`);
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete document');
            } finally {
                setDocsLoading(false);
            }
        }
    };

    const handleBulkRestoreItems = async () => {
        if (selectedItemIds.size === 0) return;

        const confirmed = await confirm({
            title: `Restore ${selectedItemIds.size} Items`,
            message: `Are you sure you want to restore ${selectedItemIds.size} item(s) to active inventory?`,
            confirmText: 'Restore All',
            confirmVariant: 'success'
        });

        if (confirmed) {
            setItemsLoading(true);
            try {
                setArchivedItems(prev => prev.filter(item => !selectedItemIds.has(item.id)));
                toast.success(`${selectedItemIds.size} item(s) restored successfully!`);
                setSelectedItemIds(new Set());
            } catch (error) {
                toast.error('Failed to restore items');
                console.error(error);
            } finally {
                setItemsLoading(false);
            }
        }
    };

    const handleBulkDeleteItems = async () => {
        if (selectedItemIds.size === 0) return;

        const confirmed = await confirm({
            title: `Delete ${selectedItemIds.size} Items Permanently`,
            message: `Are you sure you want to permanently delete ${selectedItemIds.size} item(s)? This action cannot be undone.`,
            confirmText: 'Delete All',
            confirmVariant: 'danger'
        });

        if (confirmed) {
            setItemsLoading(true);
            try {
                setArchivedItems(prev => prev.filter(item => !selectedItemIds.has(item.id)));
                toast.success(`${selectedItemIds.size} item(s) permanently deleted.`);
                setSelectedItemIds(new Set());
            } catch (error) {
                toast.error('Failed to delete items');
                console.error(error);
            } finally {
                setItemsLoading(false);
            }
        }
    };

    const handleBulkRestoreDocuments = async () => {
        if (selectedDocIds.size === 0) return;

        const confirmed = await confirm({
            title: `Restore ${selectedDocIds.size} Documents`,
            message: `Are you sure you want to restore ${selectedDocIds.size} document(s) to active documents?`,
            confirmText: 'Restore All',
            confirmVariant: 'success'
        });

        if (confirmed) {
            setDocsLoading(true);
            try {
                const docsToRestore = archivedDocuments.filter(d => selectedDocIds.has(d.id));
                for (const doc of docsToRestore) {
                    const { error: insertError } = await supabase
                        .from('documents')
                        .insert({
                            id: doc.original_id,
                            title: doc.title,
                            file_name: doc.file_name,
                            file_size: doc.file_size,
                            file_type: doc.file_type,
                            storage_path: doc.storage_path,
                            category: doc.category,
                            document_type: doc.document_type,
                            supplier: doc.supplier,
                            po_number: doc.po_number,
                            parcel_batch: doc.parcel_batch,
                            uploaded_by: doc.uploaded_by,
                            notes: doc.notes,
                            version: doc.version,
                            created_at: doc.created_at,
                            updated_at: new Date().toISOString(),
                        });

                    if (insertError) throw insertError;

                    await supabase
                        .from('documents_archive')
                        .delete()
                        .eq('id', doc.id);
                }

                setArchivedDocuments(prev => prev.filter(d => !selectedDocIds.has(d.id)));
                toast.success(`${selectedDocIds.size} document(s) restored successfully!`);
                setSelectedDocIds(new Set());
            } catch (error) {
                toast.error('Failed to restore documents');
                console.error(error);
            } finally {
                setDocsLoading(false);
            }
        }
    };

    const handleBulkDeleteDocuments = async () => {
        if (selectedDocIds.size === 0) return;

        const confirmed = await confirm({
            title: `Delete ${selectedDocIds.size} Documents Permanently`,
            message: `Are you sure you want to permanently delete ${selectedDocIds.size} document(s)? This action cannot be undone.`,
            confirmText: 'Delete All',
            confirmVariant: 'danger'
        });

        if (confirmed) {
            setDocsLoading(true);
            try {
                const docsToDelete = archivedDocuments.filter(d => selectedDocIds.has(d.id));
                for (const doc of docsToDelete) {
                    await supabase
                        .from('documents_archive')
                        .delete()
                        .eq('id', doc.id);

                    if (doc.storage_path) {
                        await supabase.storage.from('documents').remove([doc.storage_path]);
                    }
                }

                setArchivedDocuments(prev => prev.filter(d => !selectedDocIds.has(d.id)));
                toast.success(`${selectedDocIds.size} document(s) permanently deleted.`);
                setSelectedDocIds(new Set());
            } catch (error) {
                toast.error('Failed to delete documents');
                console.error(error);
            } finally {
                setDocsLoading(false);
            }
        }
    };

    const formatDate = (dateString: string) => {
        if (!isMounted) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    useEffect(() => {
        setIsMounted(true);
        fetchArchivedItems();
        fetchArchivedDocuments();
    }, []);

    const filteredItems = archivedItems.filter(item => {
        const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.archived_reason && item.archived_reason.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const filteredDocuments = archivedDocuments.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(docSearchTerm.toLowerCase()) ||
            doc.file_name.toLowerCase().includes(docSearchTerm.toLowerCase()) ||
            (doc.supplier && doc.supplier.toLowerCase().includes(docSearchTerm.toLowerCase())) ||
            (doc.po_number && doc.po_number.toLowerCase().includes(docSearchTerm.toLowerCase()));
        const matchesType = docTypeFilter === 'all' || doc.document_type === docTypeFilter;
        return matchesSearch && matchesType;
    });

    const itemCategories = ['all', ...Array.from(new Set(archivedItems.map(item => item.category)))];
    const docTypes = ['all', ...Array.from(new Set(archivedDocuments.map(doc => doc.document_type)))];

    const isAllItemsSelected = filteredItems.length > 0 && selectedItemIds.size === filteredItems.length;
    const isAllDocsSelected = filteredDocuments.length > 0 && selectedDocIds.size === filteredDocuments.length;

    return (
        <SessionGuard requiredRole={['Admin', 'Manager', 'Employee']}>
            <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300 bgCard">
                {/* Header Section */}
                <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200/80 pb-5">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 text-lg shadow-2xs shrink-0">
                            <i className="fas fa-archive"></i>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                Trash Management
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                View, restore, or permanently remove recently deleted records
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-2xs">
                        {/* Inventory Tab */}
                        <button
                            onClick={() => updateTab('inventory')}
                            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'inventory'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                                }`}
                        >
                            <i className={`fas fa-box text-xs ${activeTab === 'inventory' ? 'text-pink-500' : 'text-slate-400'}`}></i>
                            <span>Inventory</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${activeTab === 'inventory'
                                    ? 'bg-pink-100 text-pink-700'
                                    : 'bg-slate-200/70 text-slate-600'
                                    }`}
                            >
                                {archivedItems.length}
                            </span>
                        </button>

                        {/* Documents Tab */}
                        <button
                            onClick={() => updateTab('documents')}
                            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'documents'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                                }`}
                        >
                            <i className={`fas fa-file-alt text-xs ${activeTab === 'documents' ? 'text-pink-500' : 'text-slate-400'}`}></i>
                            <span>Documents</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${activeTab === 'documents'
                                    ? 'bg-pink-100 text-pink-700'
                                    : 'bg-slate-200/70 text-slate-600'
                                    }`}
                            >
                                {archivedDocuments.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* ============================================================
                INVENTORY TAB
            ============================================================ */}
                {activeTab === 'inventory' && (
                    <div className="space-y-4">
                        {/* OVERVIEW STATS GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            {/* Total Archived Card */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center justify-between relative overflow-hidden group">
                                <div className="space-y-1 z-10">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Archived</div>
                                    <div className="text-2xl font-bold text-slate-900">{archivedItems.length}</div>
                                    <div className="text-[11px] text-slate-400">Records currently in storage</div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 text-lg shrink-0 group-hover:scale-105 transition-transform">
                                    <i className="fas fa-boxes-stacked"></i>
                                </div>
                            </div>

                            {/* Categories Card */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center justify-between relative overflow-hidden group">
                                <div className="space-y-1 z-10">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categories</div>
                                    <div className="text-2xl font-bold text-slate-900">{Math.max(0, itemCategories.length - 1)}</div>
                                    <div className="text-[11px] text-slate-400">Distinct inventory groups</div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-600 text-lg shrink-0 group-hover:scale-105 transition-transform">
                                    <i className="fas fa-tags"></i>
                                </div>
                            </div>

                            {/* Storage Status Card */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center justify-between relative overflow-hidden group">
                                <div className="space-y-1 z-10">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Storage Status</div>
                                    <div className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                                        <span>Active</span>
                                    </div>
                                    <div className="text-[11px] text-slate-400">Ready for instant restoration</div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-pink-50/50 border border-pink-100 flex items-center justify-center text-pink-600 text-lg shrink-0 group-hover:scale-105 transition-transform">
                                    <i className="fas fa-database"></i>
                                </div>
                            </div>
                        </div>

                        {/* SEARCH & FILTER TOOLBAR */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2.5 flex-1">
                                {/* Search Bar */}
                                <div className="relative flex-1 min-w-[240px]">
                                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                                    <input
                                        className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-2xs"
                                        placeholder="Search code, name, or archive reason..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Category Dropdown */}
                                <div className="relative min-w-[170px]">
                                    <select
                                        className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 capitalize cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-2xs"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        {itemCategories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat === 'all' ? 'All Categories' : cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Reset Filters */}
                                {(searchTerm || categoryFilter !== 'all' || selectedItemIds.size > 0) && (
                                    <button
                                        className="text-xs text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl px-3 py-2 font-semibold transition-all flex items-center gap-1.5"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCategoryFilter('all');
                                            setSelectedItemIds(new Set());
                                        }}
                                    >
                                        <i className="fas fa-rotate-left text-[11px]"></i>
                                        <span>Reset Filters</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* BULK ACTIONS TOOLBAR */}
                        <BulkActionsToolbar
                            selectedCount={selectedItemIds.size}
                            itemLabel="items"
                            singleItemLabel="item"
                            floating={false}
                            actions={[
                                {
                                    label: 'Restore Selected',
                                    icon: 'fa-rotate-left',
                                    onClick: handleBulkRestoreItems,
                                    variant: 'success',
                                    isLoading: itemsLoading,
                                    mobileLabel: 'Restore',
                                },
                                {
                                    label: 'Delete Permanently',
                                    icon: 'fa-trash-can',
                                    onClick: handleBulkDeleteItems,
                                    variant: 'danger',
                                    isLoading: itemsLoading,
                                    mobileLabel: 'Delete',
                                },
                            ]}
                            onClear={() => setSelectedItemIds(new Set())}
                        />

                        {/* INVENTORY TABLE */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                {/* Mobile Select All Bar - Visible only on mobile */}
                                <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/60">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isAllItemsSelected}
                                            onChange={() => {
                                                if (isAllItemsSelected) {
                                                    setSelectedItemIds(new Set());
                                                } else {
                                                    setSelectedItemIds(new Set(filteredItems.map(item => item.id)));
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                        />
                                        <span className="text-xs font-medium text-slate-700">
                                            Select All
                                        </span>
                                        <span className="text-[10px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
                                            {filteredItems.length}
                                        </span>
                                    </label>
                                    {selectedItemIds.size > 0 && (
                                        <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
                                            {selectedItemIds.size} selected
                                        </span>
                                    )}
                                </div>

                                <table className="table-pro">
                                    <thead>
                                        <tr>
                                            <th className="text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllItemsSelected}
                                                    onChange={() => {
                                                        if (isAllItemsSelected) {
                                                            setSelectedItemIds(new Set());
                                                        } else {
                                                            setSelectedItemIds(new Set(filteredItems.map(item => item.id)));
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                                />
                                            </th>
                                            <th>Code</th>
                                            <th>Item Name</th>
                                            <th>Category</th>
                                            <th>Stock</th>
                                            <th>Archived By</th>
                                            <th>Archived Date</th>
                                            <th>Reason</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="py-12 text-center text-slate-400">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                                                            <i className="fas fa-archive text-xl"></i>
                                                        </div>
                                                        <p className="font-semibold text-slate-600">No archived items found</p>
                                                        <p className="text-xs text-slate-400">Try adjusting your category filter or search query</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredItems.map((item) => {
                                                const isSelected = selectedItemIds.has(item.id);
                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className={`hover:bg-slate-50/80 transition-colors group ${isSelected ? 'bg-pink-50/30' : ''}`}
                                                    >
                                                        <td data-label="Select" className="py-3 px-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => {
                                                                    const newSelected = new Set(selectedItemIds);
                                                                    if (newSelected.has(item.id)) newSelected.delete(item.id);
                                                                    else newSelected.add(item.id);
                                                                    setSelectedItemIds(newSelected);
                                                                }}
                                                                className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                                            />
                                                        </td>
                                                        <td data-label="Code" className="py-3 px-4 text-slate-500 font-mono text-[11px] font-semibold">
                                                            {item.item_code}
                                                        </td>
                                                        <td data-label="Item Name" className="py-3 px-4">
                                                            <div className="font-semibold text-slate-800 truncate max-w-[180px]" title={item.item_name}>
                                                                {item.item_name}
                                                            </div>
                                                        </td>
                                                        <td data-label="Category" className="py-3 px-4">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 capitalize">
                                                                {item.category}
                                                            </span>
                                                        </td>
                                                        <td data-label="Stock" className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                                                            {item.current_stock} <span className="text-[10px] text-slate-400 font-normal uppercase">{item.unit}</span>
                                                        </td>
                                                        <td data-label="Archived By" className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                                                            {item.archived_by}
                                                        </td>
                                                        <td data-label="Archived Date" className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                                            {formatDate(item.archived_at)}
                                                        </td>
                                                        <td data-label="Reason" className="py-3 px-4 text-slate-500 max-w-[200px]">
                                                            <div className="truncate" title={item.archived_reason}>
                                                                {item.archived_reason || <span className="text-slate-300">—</span>}
                                                            </div>
                                                        </td>
                                                        <td data-label="Actions" className="py-3 px-4 text-right whitespace-nowrap">
                                                            <div className="inline-flex items-center gap-1.5">
                                                                <button
                                                                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg hover:bg-emerald-100 transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                                    onClick={() => handleRestoreItem(item.id, item.item_name)}
                                                                    disabled={itemsLoading}
                                                                    title="Restore item to active inventory"
                                                                >
                                                                    <i className="fas fa-rotate-left text-[10px]"></i>
                                                                    Restore
                                                                </button>
                                                                <button
                                                                    className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 rounded-lg hover:bg-rose-100 transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                                    onClick={() => handleDeleteItemPermanently(item.id, item.item_name)}
                                                                    disabled={itemsLoading}
                                                                    title="Permanently remove item record"
                                                                >
                                                                    <i className="fas fa-trash-can text-[10px]"></i>
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================
                DOCUMENTS TAB
            ============================================================ */}
                {activeTab === 'documents' && (
                    <div className="space-y-4">
                        {/* OVERVIEW STATS CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Total Archived Card */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Archived</div>
                                    <div className="text-2xl font-bold text-slate-900 mt-0.5">{archivedDocuments.length}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">Documents in storage</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 text-pink-600 flex items-center justify-center text-sm shadow-2xs">
                                    <i className="fas fa-file-archive"></i>
                                </div>
                            </div>

                            {/* Document Types Card */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Document Types</div>
                                    <div className="text-2xl font-bold text-slate-900 mt-0.5">{Math.max(0, docTypes.length - 1)}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">Distinct classifications</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-sm shadow-2xs">
                                    <i className="fas fa-tags"></i>
                                </div>
                            </div>

                            {/* Total Size Card */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Size</div>
                                    <div className="text-2xl font-bold text-slate-900 mt-0.5">
                                        {formatFileSize(archivedDocuments.reduce((sum, d) => sum + (d.file_size || 0), 0))}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">Storage allocated</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-sm shadow-2xs">
                                    <i className="fas fa-database"></i>
                                </div>
                            </div>
                        </div>

                        {/* SEARCH & FILTER TOOLBAR */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                                {/* Search Input */}
                                <div className="relative flex-1 min-w-[220px]">
                                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                                    <input
                                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200/80 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-2xs"
                                        placeholder="Search title, file name, supplier, or PO..."
                                        value={docSearchTerm}
                                        onChange={(e) => setDocSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Type Filter Select */}
                                <div className="relative min-w-[150px]">
                                    <select
                                        className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200/80 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all capitalize cursor-pointer shadow-2xs"
                                        value={docTypeFilter}
                                        onChange={(e) => setDocTypeFilter(e.target.value)}
                                    >
                                        {docTypes.map(type => (
                                            <option key={type} value={type}>
                                                {type === 'all' ? 'All Types' : type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Reset Filters */}
                                {(docSearchTerm || docTypeFilter !== 'all' || selectedDocIds.size > 0) && (
                                    <button
                                        className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all flex items-center gap-1.5"
                                        onClick={() => {
                                            setDocSearchTerm('');
                                            setDocTypeFilter('all');
                                            setSelectedDocIds(new Set());
                                        }}
                                    >
                                        <i className="fas fa-rotate-left text-[11px]"></i>
                                        <span>Reset Filters</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* BULK ACTIONS TOOLBAR */}
                        <BulkActionsToolbar
                            selectedCount={selectedDocIds.size}
                            itemLabel="documents"
                            singleItemLabel="document"
                            floating={false}
                            actions={[
                                {
                                    label: 'Restore Selected',
                                    icon: 'fa-undo',
                                    onClick: handleBulkRestoreDocuments,
                                    variant: 'success',
                                    isLoading: docsLoading,
                                    mobileLabel: 'Restore',
                                },
                                {
                                    label: 'Delete Permanently',
                                    icon: 'fa-trash-can',
                                    onClick: handleBulkDeleteDocuments,
                                    variant: 'danger',
                                    isLoading: docsLoading,
                                    mobileLabel: 'Delete',
                                },
                            ]}
                            onClear={() => setSelectedDocIds(new Set())}
                        />

                        {/* DATA TABLE */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                {/* Mobile Select All Bar - Visible only on mobile */}
                                <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/60">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isAllDocsSelected}
                                            onChange={() => {
                                                if (isAllDocsSelected) {
                                                    setSelectedDocIds(new Set());
                                                } else {
                                                    setSelectedDocIds(new Set(filteredDocuments.map(doc => doc.id)));
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                        />
                                        <span className="text-xs font-medium text-slate-700">
                                            Select All
                                        </span>
                                        <span className="text-[10px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
                                            {filteredDocuments.length}
                                        </span>
                                    </label>
                                    {selectedDocIds.size > 0 && (
                                        <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
                                            {selectedDocIds.size} selected
                                        </span>
                                    )}
                                </div>

                                <table className="table-pro">
                                    <thead>
                                        <tr>
                                            <th className="text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllDocsSelected}
                                                    onChange={() => {
                                                        if (isAllDocsSelected) {
                                                            setSelectedDocIds(new Set());
                                                        } else {
                                                            setSelectedDocIds(new Set(filteredDocuments.map(doc => doc.id)));
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                                />
                                            </th>
                                            <th>Title / File</th>
                                            <th>Type</th>
                                            <th>Size</th>
                                            <th>Supplier</th>
                                            <th>PO Number</th>
                                            <th>Deleted By</th>
                                            <th>Deleted At</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocuments.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="py-12 text-center text-slate-400">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                                                            <i className="fas fa-file-excel text-xl"></i>
                                                        </div>
                                                        <p className="font-semibold text-slate-600">No archived documents found</p>
                                                        <p className="text-xs text-slate-400">Try adjusting your filters or search terms</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDocuments.map((doc) => {
                                                const isSelected = selectedDocIds.has(doc.id);
                                                return (
                                                    <tr
                                                        key={doc.id}
                                                        className={`hover:bg-slate-50/80 transition-colors group ${isSelected ? 'bg-pink-50/30' : ''}`}
                                                    >
                                                        <td data-label="Select" className="py-3 px-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => {
                                                                    const newSelected = new Set(selectedDocIds);
                                                                    if (newSelected.has(doc.id)) newSelected.delete(doc.id);
                                                                    else newSelected.add(doc.id);
                                                                    setSelectedDocIds(newSelected);
                                                                }}
                                                                className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                                            />
                                                        </td>
                                                        <td data-label="Title / File" className="py-3 px-4">
                                                            <div className="font-semibold text-slate-800 leading-snug">{doc.title}</div>
                                                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{doc.file_name}</div>
                                                            {doc.notes && (
                                                                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 italic truncate max-w-[220px]" title={doc.notes}>
                                                                    <i className="fas fa-sticky-note text-amber-400 text-[10px]"></i>
                                                                    <span>{doc.notes}</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td data-label="Type" className="py-3 px-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200/60">
                                                                {doc.document_type}
                                                            </span>
                                                        </td>
                                                        <td data-label="Size" className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">
                                                            {formatFileSize(doc.file_size)}
                                                        </td>
                                                        <td data-label="Supplier" className="py-3 px-4 text-slate-600 whitespace-nowrap">
                                                            {doc.supplier || <span className="text-slate-300">—</span>}
                                                        </td>
                                                        <td data-label="PO Number" className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                                                            {doc.po_number || <span className="text-slate-300">—</span>}
                                                        </td>
                                                        <td data-label="Deleted By" className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                                                            {doc.deleted_by}
                                                        </td>
                                                        <td data-label="Deleted At" className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                                            {formatDate(doc.deleted_at)}
                                                        </td>
                                                        <td data-label="Actions" className="py-3 px-4 text-right whitespace-nowrap">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    className="px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg hover:bg-emerald-100 transition-all font-semibold flex items-center gap-1 disabled:opacity-50"
                                                                    onClick={() => handleRestoreDocument(doc)}
                                                                    disabled={docsLoading}
                                                                    title="Restore Document"
                                                                >
                                                                    <i className="fas fa-undo text-[10px]"></i> Restore
                                                                </button>
                                                                <button
                                                                    className="px-2.5 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-200/80 rounded-lg hover:bg-rose-100 transition-all font-semibold flex items-center gap-1 disabled:opacity-50"
                                                                    onClick={() => handleDeleteDocumentPermanently(doc)}
                                                                    disabled={docsLoading}
                                                                    title="Delete Permanently"
                                                                >
                                                                    <i className="fas fa-trash-can text-[10px]"></i> Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SessionGuard>
    );
}