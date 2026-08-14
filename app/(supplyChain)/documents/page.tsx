"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/services/client/supabase";
import { toast } from "sonner";
import { useDebounce } from "@/app/(supplyChain)/hooks/useDebounce";
import Cards from "../components/global/Cards";
import { PageSkeleton } from "../components/ui/SkeletonLoader";
import { useConfirm } from "../components/ui/ConfirmModal";
import { Pagination } from "@/app/(supplyChain)/components/global/pagination";
import { SessionGuard } from "../components/server/SessionGuard";
import { BulkActionsToolbar } from "../components/global/BulkActionsToolbar";
import { TableContentLoader } from "../components/global/Loader";
import { user } from "@/app/(supplyChain)/lib/services/Class/user"

interface Document {
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
    created_by?: string | null;
}

interface Supplier {
    id: number;
    name: string;
    category: string;
    contact_person: string;
    phone: string;
    email: string;
    location: string;
}

interface Activity {
    id: string;
    user_name: string;
    user_email: string | null;
    action_type: string;
    target_resource: string;
    document_id: string | null;
    document_title: string | null;
    timestamp: string;
    status: string;
    details: any;
}

const DEFAULT_USER = {
    name: user.getName(),
    email: user.getEmail()
};

export default function Documents() {
    const { confirm } = useConfirm();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [supplierFilter, setSupplierFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
    const [editPreviewLoading, setEditPreviewLoading] = useState(false);
    const [activityFilter, setActivityFilter] = useState("");
    const [activitySearch, setActivitySearch] = useState("");
    const [activityPage, setActivityPage] = useState(1);
    const [totalActivities, setTotalActivities] = useState(0);
    const [userName, setUserName] = useState<string>(DEFAULT_USER.name);
    const [userEmail, setUserEmail] = useState<string>(DEFAULT_USER.email);
    const [archiveCount, setArchiveCount] = useState(0);
    const [activityDateFrom, setActivityDateFrom] = useState("");
    const [activityDateTo, setActivityDateTo] = useState("");

    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
    const [selectedActivityIds, setSelectedActivityIds] = useState<Set<string>>(new Set());
    const [isDownloading, setIsDownloading] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const debouncedSearch = useDebounce(searchTerm, 300);
    const debouncedActivitySearch = useDebounce(activitySearch, 300);
    const itemsPerPage = 10;
    const activitiesPerPage = 5;

    const [totalFiles, setTotalFiles] = useState(0);
    const [totalPhotos, setTotalPhotos] = useState(0);
    const [totalDocuments, setTotalDocuments] = useState(0);

    const getCurrentUser = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('display_name, email, role')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user from users table:', error);
                    setUserEmail(user.email || DEFAULT_USER.email);
                    setUserName(user.user_metadata?.full_name || user.email || DEFAULT_USER.name);
                } else if (userData) {
                    setUserEmail(userData.email || DEFAULT_USER.email);
                    setUserName(userData.display_name || userData.email || DEFAULT_USER.name);
                    if (userData.role) {
                        localStorage.setItem('user_role', userData.role);
                    }
                }
            } else {
                setUserName(DEFAULT_USER.name);
                setUserEmail(DEFAULT_USER.email);
            }
        } catch (error) {
            console.error('Error getting user:', error);
            setUserName(DEFAULT_USER.name);
            setUserEmail(DEFAULT_USER.email);
        }
    }, []);

    const fetchDocuments = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            let query = supabase
                .from('documents')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (debouncedSearch) {
                query = query.or(
                    `title.ilike.%${debouncedSearch}%,file_name.ilike.%${debouncedSearch}%`
                );
            }

            if (typeFilter) {
                query = query.eq('document_type', typeFilter);
            }

            if (categoryFilter) {
                query = query.eq('category', categoryFilter);
            }

            if (supplierFilter) {
                query = query.eq('supplier', supplierFilter);
            }

            if (dateFrom) {
                query = query.gte('created_at', dateFrom);
            }
            if (dateTo) {
                query = query.lte('created_at', dateTo);
            }

            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            setDocuments(data || []);
            setTotalItems(count || 0);
            setTotalPages(Math.ceil((count || 0) / itemsPerPage));

            const currentIds = new Set((data || []).map(d => d.id));
            setSelectedDocIds(prev => new Set([...prev].filter(id => currentIds.has(id))));
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Failed to load documents');
        } finally {
            if (showLoading) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    }, [debouncedSearch, typeFilter, categoryFilter, supplierFilter, dateFrom, dateTo, currentPage]);

    const fetchActivities = useCallback(async () => {
        try {
            let query = supabase
                .from('activity_history')
                .select('*', { count: 'exact' })
                .order('timestamp', { ascending: false });

            if (debouncedActivitySearch) {
                query = query.or(
                    `user_name.ilike.%${debouncedActivitySearch}%,document_title.ilike.%${debouncedActivitySearch}%`
                );
            }

            if (activityFilter) {
                query = query.eq('action_type', activityFilter);
            }

            if (activityDateFrom) {
                query = query.gte('timestamp', activityDateFrom);
            }
            if (activityDateTo) {
                query = query.lte('timestamp', activityDateTo);
            }

            const from = (activityPage - 1) * activitiesPerPage;
            const to = from + activitiesPerPage - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            setActivities(data || []);
            setTotalActivities(count || 0);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    }, [debouncedActivitySearch, activityFilter, activityDateFrom, activityDateTo, activityPage]);

    const fetchArchiveCount = useCallback(async () => {
        try {
            const { count, error } = await supabase
                .from('documents_archive')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            setArchiveCount(count || 0);
        } catch (error) {
            console.error('Error fetching archive count:', error);
        }
    }, []);

    const fetchStatistics = useCallback(async () => {
        try {
            // Get total count of all documents
            const { count: totalCount, error: totalError } = await supabase
                .from('documents')
                .select('*', { count: 'exact', head: true });

            if (totalError) throw totalError;
            setTotalFiles(totalCount || 0);

            // Get total count of photos
            const { count: photosCount, error: photosError } = await supabase
                .from('documents')
                .select('*', { count: 'exact', head: true })
                .eq('category', 'photos');

            if (photosError) throw photosError;
            setTotalPhotos(photosCount || 0);

            // Calculate total documents (total - photos)
            setTotalDocuments((totalCount || 0) - (photosCount || 0));

        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }, []);

    const fetchSuppliers = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setSuppliers(data || []);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    }, []);

    const logActivity = useCallback(async (
        actionType: string,
        targetResource: string,
        documentId?: string,
        documentTitle?: string,
        details?: any,
        status: string = 'Success'
    ) => {
        try {
            const name = userName || DEFAULT_USER.name;
            const email = userEmail || DEFAULT_USER.email;

            const activityData = {
                user_name: name,
                user_email: email,
                action_type: actionType,
                target_resource: targetResource,
                document_id: documentId || null,
                document_title: documentTitle || null,
                status: status,
                details: details || null,
            };

            const { error } = await supabase
                .from('activity_history')
                .insert(activityData);

            if (error) {
                console.error('Error logging activity:', error);
                return null;
            }

            return true;
        } catch (error) {
            console.error('Error logging activity:', error);
            return null;
        }
    }, [userName, userEmail]);

    const downloadFile = useCallback(async (doc: Document) => {
        try {
            const toastId = toast.loading('Downloading file...');

            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(doc.storage_path);

            const response = await fetch(publicUrl);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = doc.file_name || `${doc.title}.${doc.file_type.split('/').pop() || 'pdf'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('File downloaded successfully!', { id: toastId });
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download file');
        }
    }, []);

    const handleDelete = useCallback(async (doc: Document) => {
        const confirmed = await confirm({
            title: 'Delete Document',
            message: `Are you sure you want to delete "${doc.title}"? This action cannot be undone.`,
            confirmText: 'Delete',
            confirmVariant: 'danger'
        });

        if (!confirmed) return;

        const toastId = toast.loading('Deleting document...');

        try {
            const deletedBy = userName || DEFAULT_USER.name;

            await logActivity(
                'delete',
                'Deleted Document',
                doc.id,
                doc.title,
                { deleted_by: deletedBy }
            );

            const archiveData = {
                id: doc.id,
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
                updated_at: doc.updated_at,
                created_by: doc.created_by || null,
                deleted_by: deletedBy,
                original_id: doc.id,
            };

            const { error: archiveError } = await supabase
                .from('documents_archive')
                .insert(archiveData);

            if (archiveError) {
                console.error('Archive error:', archiveError);
                toast.error(`Failed to archive document: ${archiveError.message}`, { id: toastId });
                return;
            }

            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', doc.id);

            if (error) throw error;

            setSelectedDocIds(prev => {
                const updated = new Set(prev);
                updated.delete(doc.id);
                return updated;
            });

            toast.success('Document deleted and archived successfully', { id: toastId });

            await fetchArchiveCount();
            await fetchDocuments(false);
            await fetchActivities();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete document', { id: toastId });
        }
    }, [userName, logActivity, fetchArchiveCount, fetchDocuments, fetchActivities, confirm]);

    const downloadSelectedFiles = useCallback(async () => {
        if (selectedDocIds.size === 0) {
            toast.warning('Please select files to download');
            return;
        }

        const selectedDocs = documents.filter(doc => selectedDocIds.has(doc.id));
        if (selectedDocs.length === 0) {
            toast.warning('Selected files not found');
            return;
        }

        setIsDownloading(true);
        const toastId = toast.loading(`Downloading ${selectedDocs.length} file(s)...`);

        try {
            let successCount = 0;
            let failCount = 0;

            for (const doc of selectedDocs) {
                try {
                    const { data: { publicUrl } } = supabase.storage
                        .from('documents')
                        .getPublicUrl(doc.storage_path);

                    const response = await fetch(publicUrl);
                    const blob = await response.blob();

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = doc.file_name || `${doc.title}.${doc.file_type.split('/').pop() || 'pdf'}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    successCount++;
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (error) {
                    console.error(`Error downloading ${doc.title}:`, error);
                    failCount++;
                }
            }

            if (successCount > 0 && failCount === 0) {
                toast.success(`Successfully downloaded ${successCount} file(s)!`, { id: toastId });
            } else if (successCount > 0 && failCount > 0) {
                toast.warning(`Downloaded ${successCount} file(s), ${failCount} failed`, { id: toastId });
            } else {
                toast.error('Failed to download files', { id: toastId });
            }

            setSelectedDocIds(new Set());
        } catch (error) {
            console.error('Bulk download error:', error);
            toast.error('Failed to download files', { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    }, [selectedDocIds, documents]);

    const deleteSelectedDocuments = useCallback(async () => {
        if (selectedDocIds.size === 0) {
            toast.warning('Please select files to delete');
            return;
        }

        const selectedDocs = documents.filter(doc => selectedDocIds.has(doc.id));
        if (selectedDocs.length === 0) {
            toast.warning('Selected files not found');
            return;
        }

        const confirmed = await confirm({
            title: `Delete ${selectedDocs.length} Documents`,
            message: `Are you sure you want to permanently delete ${selectedDocs.length} selected document(s)? This action cannot be undone.`,
            confirmText: 'Delete All',
            confirmVariant: 'danger'
        });

        if (!confirmed) return;

        setIsBulkDeleting(true);
        const toastId = toast.loading(`Deleting ${selectedDocs.length} document(s)...`);

        try {
            let successCount = 0;
            let failCount = 0;

            for (const doc of selectedDocs) {
                try {
                    const deletedBy = userName || DEFAULT_USER.name;

                    await logActivity(
                        'delete',
                        'Deleted Document',
                        doc.id,
                        doc.title,
                        { deleted_by: deletedBy, bulk_delete: true }
                    );

                    const archiveData = {
                        id: doc.id,
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
                        updated_at: doc.updated_at,
                        created_by: doc.created_by || null,
                        deleted_by: deletedBy,
                        original_id: doc.id,
                    };

                    const { error: archiveError } = await supabase
                        .from('documents_archive')
                        .insert(archiveData);

                    if (archiveError) {
                        console.error('Archive error for', doc.title, archiveError);
                        failCount++;
                        continue;
                    }

                    await supabase.storage.from('documents').remove([doc.storage_path]);

                    const { error } = await supabase
                        .from('documents')
                        .delete()
                        .eq('id', doc.id);

                    if (error) {
                        console.error('Delete error for', doc.title, error);
                        failCount++;
                        continue;
                    }

                    successCount++;
                } catch (error) {
                    console.error(`Error deleting ${doc.title}:`, error);
                    failCount++;
                }
            }

            if (successCount > 0 && failCount === 0) {
                toast.success(`Successfully deleted ${successCount} document(s)!`, { id: toastId });
            } else if (successCount > 0 && failCount > 0) {
                toast.warning(`Deleted ${successCount} document(s), ${failCount} failed`, { id: toastId });
            } else {
                toast.error('Failed to delete documents', { id: toastId });
            }

            setSelectedDocIds(new Set());
            await fetchArchiveCount();
            await fetchDocuments(false);
            await fetchActivities();
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('Failed to delete documents', { id: toastId });
        } finally {
            setIsBulkDeleting(false);
        }
    }, [selectedDocIds, documents, userName, logActivity, fetchArchiveCount, fetchDocuments, fetchActivities, confirm]);

    const deleteSelectedActivities = useCallback(async () => {
        if (selectedActivityIds.size === 0) {
            toast.warning('Please select activities to delete');
            return;
        }

        const confirmed = await confirm({
            title: `Delete ${selectedActivityIds.size} Activity Records`,
            message: `Are you sure you want to permanently delete ${selectedActivityIds.size} selected activity record(s)? This action cannot be undone.`,
            confirmText: 'Delete All',
            confirmVariant: 'danger'
        });

        if (!confirmed) return;

        const toastId = toast.loading(`Deleting ${selectedActivityIds.size} activity record(s)...`);

        try {
            const idsToDelete = Array.from(selectedActivityIds);

            const { error } = await supabase
                .from('activity_history')
                .delete()
                .in('id', idsToDelete);

            if (error) throw error;

            toast.success(`Successfully deleted ${idsToDelete.length} activity record(s)`, { id: toastId });

            setSelectedActivityIds(new Set());
            await fetchActivities();
        } catch (error) {
            console.error('Error deleting activities:', error);
            toast.error('Failed to delete activity records', { id: toastId });
        }
    }, [selectedActivityIds, fetchActivities, confirm]);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            toast.warning('Please select files to upload');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        const toastId = toast.loading(`Uploading ${selectedFiles.length} file(s)...`);

        try {
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);

            const documentType = formData.get('documentType') as string || 'Other';
            const category = formData.get('category') as string || 'documents';
            const supplier = formData.get('supplier') as string || null;
            const poNumber = formData.get('poNumber') as string || null;
            const parcelBatch = formData.get('parcelBatch') as string || null;
            const uploadedBy = formData.get('uploadedBy') as string || userName || DEFAULT_USER.name;
            const notes = formData.get('notes') as string || null;

            let uploadedCount = 0;
            let skippedCount = 0;
            const skippedFiles: string[] = [];

            for (const file of selectedFiles) {
                const { data: existingDocs, error: checkError } = await supabase
                    .from('documents')
                    .select('id, file_name, file_size, storage_path')
                    .eq('file_name', file.name)
                    .eq('file_size', file.size);

                if (checkError) {
                    console.error('Duplicate check error:', checkError);
                    toast.error(`Failed to check for duplicates for ${file.name}`);
                    continue;
                }

                if (existingDocs && existingDocs.length > 0) {
                    skippedCount++;
                    skippedFiles.push(file.name);
                    continue;
                }

                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
                const filePath = `documents/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
                    continue;
                }

                const { error: insertError } = await supabase
                    .from('documents')
                    .insert({
                        title: `${documentType} - ${file.name}`,
                        file_name: file.name,
                        file_size: file.size,
                        file_type: file.type || fileExt || 'unknown',
                        storage_path: filePath,
                        category: category,
                        document_type: documentType,
                        supplier: supplier,
                        po_number: poNumber,
                        parcel_batch: parcelBatch,
                        uploaded_by: uploadedBy,
                        notes: notes,
                        version: 1,
                    });

                if (insertError) {
                    console.error('Insert error:', insertError);
                    toast.error(`Failed to save ${file.name}: ${insertError.message}`);
                    continue;
                }

                uploadedCount++;
                setUploadProgress(Math.round(((uploadedCount + skippedCount) / selectedFiles.length) * 100));
            }

            if (uploadedCount > 0 && skippedCount > 0) {
                toast.warning(`Uploaded ${uploadedCount} file(s), skipped ${skippedCount} duplicate(s)`, {
                    id: toastId,
                    duration: 5000,
                });
                if (skippedFiles.length > 0) {
                    toast.info(`Skipped: ${skippedFiles.join(', ')}`, {
                        duration: 5000,
                    });
                }
            } else if (uploadedCount > 0) {
                toast.success(`Successfully uploaded ${uploadedCount} file(s)!`, {
                    id: toastId,
                    duration: 3000,
                });
            } else if (skippedCount > 0) {
                toast.warning(`All ${skippedCount} file(s) already exist and were skipped`, {
                    id: toastId,
                    duration: 5000,
                });
            } else {
                toast.error('No files were uploaded successfully', {
                    id: toastId,
                    duration: 5000,
                });
            }

            if (uploadedCount > 0 || skippedCount > 0) {
                setSelectedFiles([]);
                setUploadProgress(0);
                setIsUploadModalOpen(false);
                await fetchDocuments(false);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload files', {
                id: toastId,
                duration: 5000,
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingDoc) return;

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const toastId = toast.loading('Updating document...');

        try {
            const updates = {
                title: formData.get('title') as string,
                document_type: formData.get('documentType') as string,
                category: formData.get('category') as string,
                supplier: formData.get('supplier') as string || null,
                po_number: formData.get('poNumber') as string || null,
                parcel_batch: formData.get('parcelBatch') as string || null,
                uploaded_by: formData.get('uploadedBy') as string || null,
                notes: formData.get('notes') as string || null,
                updated_at: new Date().toISOString(),
                version: (editingDoc.version || 0) + 1,
            };

            const { error } = await supabase
                .from('documents')
                .update(updates)
                .eq('id', editingDoc.id);

            if (error) throw error;

            await logActivity(
                'update',
                'Updated Document',
                editingDoc.id,
                updates.title,
                { old_version: editingDoc.version, new_version: updates.version }
            );

            toast.success('Document updated successfully!', { id: toastId });
            setIsEditModalOpen(false);
            setEditingDoc(null);
            setEditPreviewUrl(null);
            await fetchDocuments(false);
            await fetchActivities();
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update document', { id: toastId });
        }
    };

    const handleViewDocument = async (doc: Document) => {
        setSelectedDoc(doc);
        setIsPreviewModalOpen(true);
        setPreviewLoading(true);
        setPreviewUrl(null);

        try {
            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(doc.storage_path);

            setPreviewUrl(publicUrl);
        } catch (error) {
            console.error('Error getting preview URL:', error);
            toast.error('Failed to load preview');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleEditDocument = async (doc: Document) => {
        setEditingDoc(doc);
        setIsEditModalOpen(true);
        setEditPreviewLoading(true);
        setEditPreviewUrl(null);

        try {
            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(doc.storage_path);

            setEditPreviewUrl(publicUrl);
        } catch (error) {
            console.error('Error getting preview URL:', error);
        } finally {
            setEditPreviewLoading(false);
        }
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setTypeFilter("");
        setCategoryFilter("");
        setSupplierFilter("");
        setDateFrom("");
        setDateTo("");
        setCurrentPage(1);
        setActivitySearch("");
        setActivityFilter("");
        setActivityDateFrom("");
        setActivityDateTo("");
        setActivityPage(1);
        setSelectedDocIds(new Set());
        setSelectedActivityIds(new Set());
    };

    const getFileIcon = (fileType: string) => {
        const type = fileType.toLowerCase();
        if (type.includes('pdf')) return 'fa-file-pdf text-red-500';
        if (type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('heic')) {
            return 'fa-file-image text-blue-500';
        }
        if (type.includes('doc') || type.includes('docx')) return 'fa-file-word text-blue-600';
        if (type.includes('xls') || type.includes('xlsx')) return 'fa-file-excel text-green-600';
        return 'fa-file text-slate-500 dark:text-slate-400';
    };

    const getFileColor = (fileType: string) => {
        const type = fileType.toLowerCase();
        if (type.includes('pdf')) return 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400';
        if (type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('heic')) {
            return 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400';
        }
        if (type.includes('doc') || type.includes('docx')) return 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400';
        if (type.includes('xls') || type.includes('xlsx')) return 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-800/30 text-green-600 dark:text-green-400';
        return 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/30 text-slate-600 dark:text-slate-400';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        setSelectedFiles(prev => [...prev, ...Array.from(files)]);
        toast.success(`${files.length} file(s) selected`);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'upload': return 'fa-upload';
            case 'update': return 'fa-edit';
            case 'delete': return 'fa-trash';
            default: return 'fa-circle';
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'upload': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30';
            case 'update': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/30';
            case 'delete': return 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/30';
            default: return 'bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700/30';
        }
    };

    const toggleSelectAllDocuments = () => {
        if (selectedDocIds.size === documents.length) {
            setSelectedDocIds(new Set());
        } else {
            setSelectedDocIds(new Set(documents.map(d => d.id)));
        }
    };

    const toggleSelectAllActivities = () => {
        if (selectedActivityIds.size === activities.length) {
            setSelectedActivityIds(new Set());
        } else {
            setSelectedActivityIds(new Set(activities.map(a => a.id)));
        }
    };

    useEffect(() => {
        getCurrentUser();
        fetchDocuments(true);
        fetchStatistics();
        fetchSuppliers();
        fetchActivities();
        fetchArchiveCount();
    }, []);

    useEffect(() => {
        fetchDocuments(false);
    }, [debouncedSearch, typeFilter, categoryFilter, supplierFilter, dateFrom, dateTo, currentPage]);

    useEffect(() => {
        fetchActivities();
    }, [debouncedActivitySearch, activityFilter, activityDateFrom, activityDateTo, activityPage]);



    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <SessionGuard requiredRole={['Admin', 'Manager', 'Employee']}>
            <div className="p-6 space-y-6 bgCard dark:bg-ink/90">
                <div className="flex items-start justify-between gap-4 flex-wrap border-b border-slate-200/80 dark:border-ink/20 pb-5">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-3.5">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl 
                                    bg-pink-50 dark:bg-pink-950/30 
                                    border border-pink-100 dark:border-pink-800/30 
                                    flex items-center justify-center text-pink-600 dark:text-pink-400 
                                    text-lg sm:text-xl shadow-2xs shrink-0 mt-0.5">
                            <i className="fa-solid fa-folder-tree"></i>
                        </div>

                        <div className="w-full min-w-0">
                            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                                Document Tracking &amp; Logistics Records
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Centralized evidence repository for daily operations and audit trail.
                            </p>

                            <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5 
                                          px-2.5 py-1.5 sm:py-1 rounded-lg 
                                          bg-slate-100/80 dark:bg-slate-800/50 
                                          border border-slate-200/60 dark:border-ink/20 
                                          text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-full">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                                <i className="fa-solid fa-user text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500"></i>
                                <span>Logged in as:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px] sm:max-w-none">
                                    {userName}
                                </span>
                                {userEmail && (
                                    <span className="text-slate-400 dark:text-slate-500 font-normal sm:border-l sm:border-slate-300/60 sm:pl-2 sm:ml-0.5 truncate max-w-[180px] sm:max-w-none">
                                        {userEmail}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        className="px-4 py-2 bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 
                                   text-white rounded-xl text-xs sm:text-sm font-semibold 
                                   transition-all flex items-center gap-2 shadow-2xs hover:shadow-pink-500/20 active:scale-[0.98] shrink-0"
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        <i className="fas fa-cloud-arrow-up text-xs"></i>
                        <span>Upload Files</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    <Cards
                        frontIcon="fas fa-files"
                        header="Total Files"
                        data={totalFiles.toString()}
                        arrow="fas fa-arrow-up"
                        description="All uploaded files"
                        backBg="bg-ink dark:bg-ink/90"
                        backHeader="Total Files Overview"
                        headerTextColor="text-muted dark:text-white/80"
                        backDescription={`Total number of files in the system: ${totalFiles}\n\nIncludes all document types\nUpdated in real-time`}
                        tooltip="View all files"
                        tooltipLink="/gallery"
                        badge={`${totalFiles} files`}
                    />

                    <Cards
                        frontIcon="fas fa-image"
                        header="Photos"
                        data={totalPhotos.toString()}
                        arrow="fas fa-arrow-up"
                        description="Image files"
                        backBg="bg-ink dark:bg-ink/90"
                        backHeader="Photo Files"
                        headerTextColor="text-muted dark:text-white/80"
                        backDescription={`Total photo files stored: ${totalPhotos}\n\n Includes JPG, PNG, HEIC formats\nImage evidence for operations`}
                        tooltip="View all photos"
                        tooltipLink="#"
                        badge={`${totalPhotos} photos`}
                    />

                    <Cards
                        frontIcon="fas fa-file-alt"
                        header="Documents"
                        data={(totalFiles - totalPhotos).toString()}
                        arrow="fas fa-arrow-up"
                        description="Document files"
                        backBg="bg-ink dark:bg-ink/90"
                        backHeader="Document Files"
                        headerTextColor="text-muted dark:text-white/80"
                        backDescription={`Total document files stored: ${totalFiles - totalPhotos}\n\n Includes PDF, DOC, XLS formats\nOfficial records and receipts`}
                        tooltip="View all documents"
                        tooltipLink="#"
                        badge={`${totalFiles - totalPhotos} docs`}
                    />

                    <Cards
                        frontIcon="fas fa-archive"
                        header="Archived"
                        data={archiveCount.toString()}
                        arrow="fas fa-arrow-down"
                        description="Deleted documents"
                        backBg="bg-ink dark:bg-ink/90"
                        backHeader="Archived Documents"
                        headerTextColor="text-muted dark:text-white/80"
                        backDescription={`Total archived documents: ${archiveCount}\n\n📦 Deleted files stored in archive\nHistorical record of deletions`}
                        tooltip="View archive"
                        tooltipLink="/archive?tab=documents"
                        badge={`${archiveCount} archived`}
                        frontTextColor="text-amber-600 dark:text-amber-400"
                        descriptionTextColor="text-amber-600 dark:text-amber-400"
                    />
                </div>

                <div className="mt-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs dark:shadow-black/40 p-2.5 transition-all">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
                        {/* Category Filters */}
                        <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200/60 dark:border-white/10 shrink-0">
                            <button
                                onClick={() => {
                                    setCategoryFilter("");
                                    setTypeFilter("");
                                    setCurrentPage(1);
                                }}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${!categoryFilter && !typeFilter
                                    ? "bg-pink-500 text-white shadow-sm shadow-pink-500/25 dark:shadow-pink-500/20 ring-2 ring-pink-500/20 dark:ring-pink-500/40"
                                    : "bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white dark:border dark:border-white/5"
                                    }`}
                            >
                                <i className="fas fa-folder-open text-xs opacity-90" />
                                <span>All Files</span>
                                <span
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${!categoryFilter && !typeFilter
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200"
                                        }`}
                                >
                                    {totalFiles}
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setCategoryFilter("photos");
                                    setTypeFilter("");
                                    setCurrentPage(1);
                                }}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${categoryFilter === "photos"
                                    ? "bg-pink-500 text-white shadow-sm shadow-pink-500/25 dark:shadow-pink-500/20 ring-2 ring-pink-500/20 dark:ring-pink-500/40"
                                    : "bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white dark:border dark:border-white/5"
                                    }`}
                            >
                                <i className="fas fa-image text-xs opacity-90" />
                                <span>Photos</span>
                                <span
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${categoryFilter === "photos"
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200"
                                        }`}
                                >
                                    {totalPhotos}
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setCategoryFilter("documents");
                                    setTypeFilter("");
                                    setCurrentPage(1);
                                }}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${categoryFilter === "documents"
                                    ? "bg-pink-500 text-white shadow-sm shadow-pink-500/25 dark:shadow-pink-500/20 ring-2 ring-pink-500/20 dark:ring-pink-500/40"
                                    : "bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white dark:border dark:border-white/5"
                                    }`}
                            >
                                <i className="fas fa-file-alt text-xs opacity-90" />
                                <span>Documents</span>
                                <span
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${categoryFilter === "documents"
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200"
                                        }`}
                                >
                                    {totalFiles - totalPhotos}
                                </span>
                            </button>
                        </div>

                        {/* Specific Document Type Badges */}
                        <div className="flex items-center gap-1.5 pl-1 shrink-0">
                            {[
                                "Official Receipt",
                                "Invoice",
                                "Delivery Receipt",
                                "Parcel Condition",
                                "Courier Handover",
                                "Vehicle Maintenance",
                            ].map((type) => {
                                const count = documents.filter((d) => d.document_type === type).length;
                                const isActive = typeFilter === type;

                                return (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setTypeFilter(isActive ? "" : type);
                                            setCategoryFilter("");
                                            setCurrentPage(1);
                                        }}
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${isActive
                                            ? "bg-pink-500 text-white shadow-sm shadow-pink-500/25 dark:shadow-pink-500/20 ring-2 ring-pink-500/20 dark:ring-pink-500/40"
                                            : "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 dark:hover:text-pink-400 border border-slate-200/60 dark:border-white/10 dark:hover:border-pink-500/30"
                                            }`}
                                    >
                                        <i
                                            className={`fas fa-tag text-[10px] ${isActive ? "text-white" : "text-slate-400 dark:text-slate-400"
                                                }`}
                                        />
                                        <span>{type}</span>
                                        <span
                                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300"
                                                }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Documents Table */}
                <div className="bg-white dark:bg-ink rounded-2xl border border-slate-200/80 dark:border-ink/20 shadow-xs overflow-hidden flex flex-col">
                    {/* Filter Bar - Stays fixed */}
                    <div className="flex-shrink-0 border-b border-slate-100 dark:border-ink/20 bg-slate-50/50 dark:bg-slate-800/20 p-3 sm:p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-1 flex-wrap items-center gap-2.5">
                                <div className="relative w-full sm:w-64">
                                    <i
                                        className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 pointer-events-none"
                                        aria-hidden="true"
                                    ></i>
                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        aria-label="Search files"
                                        placeholder="Search files..."
                                        className="w-full rounded-xl border border-slate-200/80 dark:border-ink/30 
                                 bg-white dark:bg-ink/60 py-2 pl-8 pr-3 text-xs 
                                 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 
                                 transition-all shadow-xs 
                                 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                    />
                                </div>

                                <select
                                    value={typeFilter}
                                    onChange={(e) => {
                                        setTypeFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    aria-label="Filter by document type"
                                    className="w-full sm:w-auto rounded-xl border border-slate-200/80 dark:border-ink/30 
                             bg-white dark:bg-ink/60 px-3 py-2 text-xs 
                             text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs 
                             focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                >
                                    <option value="">All Types</option>
                                    <option value="Official Receipt">Official Receipt</option>
                                    <option value="Invoice">Invoice</option>
                                    <option value="Delivery Receipt">Delivery Receipt</option>
                                    <option value="Parcel Condition">Parcel Condition</option>
                                    <option value="Courier Handover">Courier Handover</option>
                                    <option value="Vehicle Maintenance">Vehicle Maintenance</option>
                                </select>

                                <select
                                    value={supplierFilter}
                                    onChange={(e) => {
                                        setSupplierFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    aria-label="Filter by supplier"
                                    className="w-full sm:w-auto rounded-xl border border-slate-200/80 dark:border-ink/30 
                             bg-white dark:bg-ink/60 px-3 py-2 text-xs 
                             text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs 
                             focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                >
                                    <option value="">All Suppliers</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.name}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex w-full sm:w-auto items-center justify-between gap-1.5 rounded-xl 
                              border border-slate-200/80 dark:border-ink/30 bg-white dark:bg-ink/60 p-1 shadow-xs">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => {
                                            setDateFrom(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        aria-label="Date From"
                                        title="Date From"
                                        className="w-full sm:w-auto border-0 bg-transparent px-2 py-1 text-xs 
                                 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
                                    />
                                    <span aria-hidden="true" className="text-[10px] font-medium text-slate-300 dark:text-slate-500 uppercase select-none">
                                        to
                                    </span>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => {
                                            setDateTo(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        aria-label="Date To"
                                        title="Date To"
                                        className="w-full sm:w-auto border-0 bg-transparent px-2 py-1 text-xs 
                                 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 dark:border-ink/20 pt-2 lg:border-t-0 lg:pt-0">
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    title="Reset filters"
                                    aria-label="Reset filters"
                                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold 
                             text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 
                             hover:text-pink-600 dark:hover:text-pink-400 transition-all 
                             focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                >
                                    <i className="fas fa-filter-circle-xmark" aria-hidden="true"></i>
                                    <span>Reset</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => fetchDocuments(false)}
                                    title="Refresh list"
                                    aria-label="Refresh list"
                                    className="inline-flex items-center justify-center rounded-xl p-2 text-xs 
                             text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/30 
                             hover:text-slate-800 dark:hover:text-slate-200 transition-all 
                             focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                                >
                                    <i className="fas fa-rotate" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {selectedDocIds.size > 0 && (
                        <BulkActionsToolbar
                            selectedCount={selectedDocIds.size}
                            itemLabel="files"
                            singleItemLabel="file"
                            actions={[
                                {
                                    label: 'Download',
                                    icon: 'fa-download',
                                    onClick: downloadSelectedFiles,
                                    variant: 'primary',
                                    isLoading: isDownloading,
                                    disabled: isBulkDeleting,
                                    mobileLabel: 'Download',
                                },
                                {
                                    label: 'Delete',
                                    icon: 'fa-trash-can',
                                    onClick: deleteSelectedDocuments,
                                    variant: 'danger',
                                    isLoading: isBulkDeleting,
                                    disabled: isDownloading,
                                    mobileLabel: 'Delete',
                                },
                            ]}
                            onClear={() => setSelectedDocIds(new Set())}
                        />
                    )}

                    {/* Scrollable Table Container */}
                    <div className="flex-1 overflow-y-auto max-h-[500px] relative">
                        <div className="md:hidden flex items-center justify-between p-3 
                      bg-slate-50/80 dark:bg-slate-800/30 border-b border-slate-200/60 dark:border-ink/20 rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={documents.length > 0 && selectedDocIds.size === documents.length}
                                    onChange={toggleSelectAllDocuments}
                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 
                             text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                />
                                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                    Select All ({documents.length})
                                </span>
                            </div>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                {selectedDocIds.size} selected
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            {refreshing && <TableContentLoader />}

                            <table className="table-pro p-1">
                                <thead>
                                    <tr>
                                        <th className="w-10 text-center!">
                                            <input
                                                type="checkbox"
                                                checked={documents.length > 0 && selectedDocIds.size === documents.length}
                                                onChange={toggleSelectAllDocuments}
                                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 
                                         text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                            />
                                        </th>
                                        <th className="w-12 text-center!">Format</th>
                                        <th>Document Title</th>
                                        <th>Category</th>
                                        <th>Size</th>
                                        <th>Supplier</th>
                                        <th>Date Uploaded</th>
                                        <th className="text-right!">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 dark:divide-ink/20 text-xs">
                                    {documents.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/30 
                                                  flex items-center justify-center text-slate-400 dark:text-slate-500 mb-1">
                                                        <i className="fas fa-folder-open text-xl"></i>
                                                    </div>
                                                    <p className="font-semibold text-slate-600 dark:text-slate-300">No documents found</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your filters or search terms</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        documents.map((doc) => {
                                            const isSelected = selectedDocIds.has(doc.id);
                                            return (
                                                <tr key={doc.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group ${isSelected ? 'bg-pink-50/30 dark:bg-pink-950/20' : ''}`}>
                                                    <td data-label="Select" className="py-3 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {
                                                                const newSelected = new Set(selectedDocIds);
                                                                if (newSelected.has(doc.id)) {
                                                                    newSelected.delete(doc.id);
                                                                } else {
                                                                    newSelected.add(doc.id);
                                                                }
                                                                setSelectedDocIds(newSelected);
                                                            }}
                                                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 
                                                     text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                                        />
                                                    </td>
                                                    <td data-label="Format" className="py-3 px-3">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border mx-auto ${getFileColor(doc.file_type)}`}>
                                                            <i className={`fas ${getFileIcon(doc.file_type)}`}></i>
                                                        </div>
                                                    </td>
                                                    <td data-label="Document Title" className="py-3 px-4">
                                                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]" title={doc.title}>
                                                            {doc.title}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tight mt-0.5">ID: {doc.id.substring(0, 8)}</div>
                                                    </td>
                                                    <td data-label="Category" className="py-3 px-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold 
                                                       bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 
                                                       border border-pink-100/80 dark:border-pink-800/30">
                                                            {doc.document_type}
                                                        </span>
                                                    </td>
                                                    <td data-label="Size" className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{formatFileSize(doc.file_size)}</td>
                                                    <td data-label="Supplier" className="py-3 px-4 text-slate-600 dark:text-slate-300">{doc.supplier || <span className="text-slate-300 dark:text-slate-500">—</span>}</td>
                                                    <td data-label="Date Uploaded" className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                        {new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td data-label="Actions" className="py-3 px-4 text-right whitespace-nowrap">
                                                        <div className="inline-flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleViewDocument(doc)}
                                                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 rounded-lg transition-colors"
                                                                title="View File"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditDocument(doc)}
                                                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                                                title="Edit Metadata"
                                                            >
                                                                <i className="fas fa-pen-to-square"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => downloadFile(doc)}
                                                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/30 rounded-lg transition-colors"
                                                                title="Download File"
                                                            >
                                                                <i className="fas fa-download"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(doc)}
                                                                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                                                                title="Delete File"
                                                            >
                                                                <i className="fas fa-trash"></i>
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

                    {/* Pagination - Stays fixed */}
                    {totalPages > 0 && (
                        <div className="flex-shrink-0 pagination-container-class dark:bg-ink/80 dark:border-ink/20">
                            <span className="text-slate-500 dark:text-slate-400">
                                Showing <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                                </span> to{' '}
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {Math.min(currentPage * itemsPerPage, totalItems)}
                                </span> of{' '}
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> files
                            </span>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>

                {/* Activity History Table */}
                <div className="bg-white dark:bg-ink rounded-2xl border border-slate-200/80 dark:border-ink/20 shadow-xs overflow-hidden flex flex-col">
                    {/* Header - Stays fixed */}
                    <div className="flex-shrink-0 p-4 border-b border-slate-100 dark:border-ink/20 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white leading-tight text-sm">Activity History</h3>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setActivitySearch("");
                                    setActivityFilter("");
                                    setActivityDateFrom("");
                                    setActivityDateTo("");
                                    setActivityPage(1);
                                    setSelectedActivityIds(new Set());
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 
                         hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 
                         rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-center"
                                title="Reset active filters"
                            >
                                <i className="fas fa-rotate-left text-[11px]"></i>
                                <span>Reset Filters</span>
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="relative flex-1 min-w-[200px]">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs pointer-events-none"></i>
                                <input
                                    type="search"
                                    value={activitySearch}
                                    onChange={(e) => setActivitySearch(e.target.value)}
                                    placeholder="Search user or document..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl 
                             border border-slate-200/80 dark:border-ink/30 
                             bg-white dark:bg-ink/60 text-slate-700 dark:text-slate-200 
                             placeholder-slate-400 dark:placeholder-slate-500 
                             focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 
                             transition-all shadow-2xs"
                                />
                            </div>

                            <select
                                value={activityFilter}
                                onChange={(e) => setActivityFilter(e.target.value)}
                                className="py-1.5 px-3 text-xs rounded-xl 
                         border border-slate-200/80 dark:border-ink/30 
                         bg-white dark:bg-ink/60 text-slate-700 dark:text-slate-200 
                         focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 
                         transition-all cursor-pointer shadow-2xs"
                            >
                                <option value="">All Actions</option>
                                <option value="upload">Uploads</option>
                                <option value="update">Updates</option>
                                <option value="delete">Deletions</option>
                            </select>

                            <div className="flex items-center gap-1.5 bg-white dark:bg-ink/60 p-1 rounded-xl 
                          border border-slate-200/80 dark:border-ink/30 shadow-2xs">
                                <input
                                    type="date"
                                    value={activityDateFrom}
                                    onChange={(e) => setActivityDateFrom(e.target.value)}
                                    className="py-0.5 px-2 text-xs border-0 bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                                    title="Activity Date From"
                                />
                                <span className="text-slate-300 dark:text-slate-500 text-[10px] font-medium uppercase">to</span>
                                <input
                                    type="date"
                                    value={activityDateTo}
                                    onChange={(e) => setActivityDateTo(e.target.value)}
                                    className="py-0.5 px-2 text-xs border-0 bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                                    title="Activity Date To"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions Bar - Stays fixed if present */}
                    {selectedActivityIds.size > 0 && (
                        <div className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-between gap-4 flex-wrap animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <span className="w-5 h-5 rounded-full bg-white/20 inline-flex items-center justify-center text-[10px]">
                                    {selectedActivityIds.size}
                                </span>
                                <span>record(s) selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={deleteSelectedActivities}
                                    className="px-3 py-1.5 text-xs font-semibold bg-rose-900/40 hover:bg-rose-900/60 border border-rose-300/30 text-white rounded-lg transition-all flex items-center gap-1.5 backdrop-blur-xs"
                                >
                                    <i className="fas fa-trash-can text-[11px]"></i> Delete Selected
                                </button>
                                <button
                                    onClick={() => setSelectedActivityIds(new Set())}
                                    className="px-2.5 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Scrollable Table Container */}
                    <div className="flex-1 overflow-y-auto max-h-[400px] relative">
                        <div className="md:hidden flex items-center justify-between px-4 py-2.5 
                      bg-slate-50/80 dark:bg-slate-800/30 border-b border-slate-200/60 dark:border-ink/20">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={activities.length > 0 && selectedActivityIds.size === activities.length}
                                    onChange={toggleSelectAllActivities}
                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 
                             text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                    Select All
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-700/30 px-2 py-0.5 rounded-full">
                                    {activities.length}
                                </span>
                            </label>
                            {selectedActivityIds.size > 0 && (
                                <span className="text-xs font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 px-2.5 py-1 rounded-full">
                                    {selectedActivityIds.size} selected
                                </span>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table-pro">
                                <thead>
                                    <tr className="border-b border-slate-200/60 dark:border-ink/20 bg-slate-50/70 dark:bg-slate-800/30 
                                  text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase select-none">
                                        <th className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={activities.length > 0 && selectedActivityIds.size === activities.length}
                                                onChange={toggleSelectAllActivities}
                                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 
                                         text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                            />
                                        </th>
                                        <th>User</th>
                                        <th>Action Type</th>
                                        <th>Target Resource</th>
                                        <th>Document</th>
                                        <th>Timestamp</th>
                                        <th className="!text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-ink/20 text-xs">
                                    {activities.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/30 
                                                  flex items-center justify-center text-slate-400 dark:text-slate-500 mb-1">
                                                        <i className="fas fa-inbox text-xl"></i>
                                                    </div>
                                                    <p className="font-semibold text-slate-600 dark:text-slate-300">No activity recorded yet</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">Activity logs will appear here as users perform operations</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        activities.map((activity) => {
                                            const isSelected = selectedActivityIds.has(activity.id);
                                            return (
                                                <tr key={activity.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group ${isSelected ? 'bg-pink-50/30 dark:bg-pink-950/20' : ''}`}>
                                                    <td data-label="Select" className="py-3 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {
                                                                const newSelected = new Set(selectedActivityIds);
                                                                if (newSelected.has(activity.id)) {
                                                                    newSelected.delete(activity.id);
                                                                } else {
                                                                    newSelected.add(activity.id);
                                                                }
                                                                setSelectedActivityIds(newSelected);
                                                            }}
                                                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 
                                                     text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                                        />
                                                    </td>
                                                    <td data-label="User" className="py-3 px-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2.5">
                                                            <div>
                                                                <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{activity.user_name}</div>
                                                                {activity.user_email && (
                                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{activity.user_email}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td data-label="Action Type" className="py-3 px-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${getActionColor(activity.action_type)}`}>
                                                            <i className={`fas text-[9px] ${getActionIcon(activity.action_type)}`}></i>
                                                            {activity.action_type.charAt(0).toUpperCase() + activity.action_type.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td data-label="Target Resource" className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                                                        {activity.target_resource}
                                                    </td>
                                                    <td data-label="Document" className="py-3 px-4 whitespace-nowrap">
                                                        {activity.document_title ? (
                                                            <div>
                                                                <div className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]" title={activity.document_title}>
                                                                    {activity.document_title}
                                                                </div>
                                                                {activity.document_id && (
                                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tight mt-0.5">
                                                                        ID: {activity.document_id.substring(0, 8)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 dark:text-slate-500">—</span>
                                                        )}
                                                    </td>
                                                    <td data-label="Timestamp" className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                        {new Date(activity.timestamp).toLocaleString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td data-label="Status" className="py-3 px-4 text-right whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full 
                                                       bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 
                                                       border border-emerald-200/60 dark:border-emerald-800/30 text-[11px] font-medium">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            {activity.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination - Stays fixed */}
                    {totalActivities > 0 && (
                        <div className="flex-shrink-0 pagination-container-class dark:bg-ink/80 dark:border-ink/20">
                            <span className="text-slate-500 dark:text-slate-400">
                                Showing <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {totalActivities === 0 ? 0 : (activityPage - 1) * activitiesPerPage + 1}
                                </span> to{' '}
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {Math.min(activityPage * activitiesPerPage, totalActivities)}
                                </span> of{' '}
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{totalActivities}</span> log entries
                            </span>
                            <Pagination
                                currentPage={activityPage}
                                totalPages={Math.ceil(totalActivities / activitiesPerPage)}
                                onPageChange={setActivityPage}
                            />
                        </div>
                    )}
                </div>

                {isEditModalOpen && editingDoc && (
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-ink rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-ink/20">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400 flex items-center justify-center">
                                            <i className="fas fa-edit"></i>
                                        </span>
                                        Edit Document
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Update document metadata (image is read-only)</p>
                                </div>
                                <button
                                    onClick={() => { setIsEditModalOpen(false); setEditingDoc(null); setEditPreviewUrl(null); }}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all flex items-center justify-center"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                {editingDoc.file_type.toLowerCase().includes('jpg') ||
                                    editingDoc.file_type.toLowerCase().includes('jpeg') ||
                                    editingDoc.file_type.toLowerCase().includes('png') ||
                                    editingDoc.file_type.toLowerCase().includes('heic') ? (
                                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200 dark:border-ink/20">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Current Image (Read Only)</label>
                                        <div className="flex items-center justify-center min-h-[200px] bg-white dark:bg-ink rounded-lg border border-slate-100 dark:border-ink/20">
                                            {editPreviewLoading ? (
                                                <div className="text-center">
                                                    <i className="fas fa-spinner fa-spin text-2xl text-pink-500 dark:text-pink-400 mb-2"></i>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Loading image...</p>
                                                </div>
                                            ) : editPreviewUrl ? (
                                                <img
                                                    src={editPreviewUrl}
                                                    alt={editingDoc.title}
                                                    className="max-w-full max-h-[300px] object-contain rounded-lg"
                                                />
                                            ) : (
                                                <div className="text-center text-slate-400 dark:text-slate-500 p-4">
                                                    <i className="fas fa-image text-4xl mb-2"></i>
                                                    <p className="text-sm">Image preview not available</p>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                            <i className="fas fa-info-circle mr-1"></i>
                                            Image cannot be edited. To change the image, delete and re-upload.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200 dark:border-ink/20">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Current File (Read Only)</label>
                                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-ink rounded-lg border border-slate-100 dark:border-ink/20">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border ${getFileColor(editingDoc.file_type)}`}>
                                                <i className={`fas ${getFileIcon(editingDoc.file_type)}`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{editingDoc.file_name}</div>
                                                <div className="text-xs text-slate-400 dark:text-slate-500">{formatFileSize(editingDoc.file_size)}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => downloadFile(editingDoc)}
                                                className="px-3 py-1.5 text-xs font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/30 rounded-lg transition-colors"
                                            >
                                                <i className="fas fa-download mr-1"></i> Download
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                            <i className="fas fa-info-circle mr-1"></i>
                                            File cannot be edited. To change the file, delete and re-upload.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Title</label>
                                    <input
                                        name="title"
                                        defaultValue={editingDoc.title}
                                        className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-400 dark:text-slate-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all cursor-not-allowed"
                                        required readOnly disabled
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
                                        <select name="category" defaultValue={editingDoc.category} className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all">
                                            <option value="documents">Documents</option>
                                            <option value="photos">Photos</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Document Type</label>
                                        <select name="documentType" defaultValue={editingDoc.document_type} className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all">
                                            <option value="Official Receipt">Official Receipt</option>
                                            <option value="Invoice">Invoice</option>
                                            <option value="Delivery Receipt">Delivery Receipt</option>
                                            <option value="Parcel Condition">Parcel Condition</option>
                                            <option value="Courier Handover">Courier Handover</option>
                                            <option value="Vehicle Maintenance">Vehicle Maintenance</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Supplier</label>
                                        <select name="supplier" defaultValue={editingDoc.supplier || ''} className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all">
                                            <option value="">Select supplier</option>
                                            {suppliers.map((s) => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">PO Number</label>
                                        <input name="poNumber" defaultValue={editingDoc.po_number || ''} className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all" placeholder="e.g. PO-2026-0031" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Parcel Batch</label>
                                        <input name="parcelBatch" defaultValue={editingDoc.parcel_batch || ''} className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all" placeholder="e.g. PB-2026-045" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Uploaded By</label>
                                        <input name="uploadedBy" defaultValue={editingDoc.uploaded_by || ''} className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all" placeholder="Your name" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Version</label>
                                        <input value={`v${(editingDoc.version || 0) + 1}`} className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed" disabled />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Notes</label>
                                    <textarea name="notes" defaultValue={editingDoc.notes || ''} rows={2} className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all" placeholder="Additional details" />
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-ink/20">
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditModalOpen(false); setEditingDoc(null); setEditPreviewUrl(null); }}
                                        className="px-4 py-2 text-sm font-medium bg-transparent border border-slate-200 dark:border-ink/30 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all text-slate-600 dark:text-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium bg-pink-500 dark:bg-pink-600 text-white rounded-lg hover:bg-pink-600 dark:hover:bg-pink-700 transition-all flex items-center gap-2"
                                    >
                                        <i className="fas fa-save"></i> Update Document
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isPreviewModalOpen && selectedDoc && (
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-ink rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-ink/20">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{selectedDoc.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{selectedDoc.id} · {selectedDoc.document_type}</p>
                                    </div>
                                    <button
                                        onClick={() => { setIsPreviewModalOpen(false); setSelectedDoc(null); setPreviewUrl(null); }}
                                        className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <i className="fas fa-times text-xl"></i>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 flex items-center justify-center min-h-[400px] border border-slate-100 dark:border-ink/20 relative">
                                            {previewLoading ? (
                                                <div className="text-center">
                                                    <i className="fas fa-spinner fa-spin text-3xl text-pink-500 dark:text-pink-400 mb-4"></i>
                                                    <p className="text-slate-500 dark:text-slate-400">Loading preview...</p>
                                                </div>
                                            ) : previewUrl ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    {selectedDoc.file_type.toLowerCase().includes('pdf') ? (
                                                        <iframe
                                                            src={`${previewUrl}#toolbar=1`}
                                                            className="w-full h-[500px] rounded-lg"
                                                            title="PDF Preview"
                                                        />
                                                    ) : selectedDoc.file_type.toLowerCase().includes('jpg') ||
                                                        selectedDoc.file_type.toLowerCase().includes('jpeg') ||
                                                        selectedDoc.file_type.toLowerCase().includes('png') ||
                                                        selectedDoc.file_type.toLowerCase().includes('heic') ? (
                                                        <img
                                                            src={previewUrl}
                                                            alt={selectedDoc.title}
                                                            className="max-w-full max-h-[500px] object-contain rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="text-center">
                                                            <i className={`fas ${getFileIcon(selectedDoc.file_type)} text-7xl mb-4 text-slate-400 dark:text-slate-500`}></i>
                                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedDoc.file_name}</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500">{formatFileSize(selectedDoc.file_size)}</p>
                                                            <button
                                                                onClick={() => downloadFile(selectedDoc)}
                                                                className="mt-2 px-4 py-2 bg-pink-500 dark:bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-600 dark:hover:bg-pink-700 transition-colors"
                                                            >
                                                                <i className="fas fa-download mr-2"></i>
                                                                Download File
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center text-slate-400 dark:text-slate-500">
                                                    <i className="fas fa-file text-7xl mb-4"></i>
                                                    <p className="text-sm">Preview not available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <i className="fas fa-info-circle text-slate-400 dark:text-slate-500"></i> File Information
                                            </h4>
                                            <dl className="mt-2.5 space-y-1.5 text-sm">
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-500 dark:text-slate-400">ID:</dt>
                                                    <dd className="font-mono text-slate-800 dark:text-slate-200 font-medium">{selectedDoc.id.substring(0, 8)}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-500 dark:text-slate-400">Type:</dt>
                                                    <dd className="text-slate-800 dark:text-slate-200 font-medium">{selectedDoc.document_type}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-500 dark:text-slate-400">Size:</dt>
                                                    <dd className="text-slate-800 dark:text-slate-200">{formatFileSize(selectedDoc.file_size)}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-500 dark:text-slate-400">Version:</dt>
                                                    <dd className="text-slate-800 dark:text-slate-200">v{selectedDoc.version || 1}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-500 dark:text-slate-400">Uploaded:</dt>
                                                    <dd className="text-slate-800 dark:text-slate-200">{new Date(selectedDoc.created_at).toLocaleDateString()}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-500 dark:text-slate-400">By:</dt>
                                                    <dd className="text-slate-800 dark:text-slate-200">{selectedDoc.uploaded_by || 'Unknown'}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <i className="fas fa-link text-slate-400 dark:text-slate-500"></i> Related Records
                                            </h4>
                                            <dl className="mt-2.5 space-y-1.5 text-sm">
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-500 dark:text-slate-400">PO:</dt>
                                                    <dd className="font-mono text-slate-800 dark:text-slate-200">{selectedDoc.po_number || '-'}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-500 dark:text-slate-400">Supplier:</dt>
                                                    <dd className="text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{selectedDoc.supplier || '-'}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-500 dark:text-slate-400">Parcel:</dt>
                                                    <dd className="font-mono text-slate-800 dark:text-slate-200">{selectedDoc.parcel_batch || '-'}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        {selectedDoc.notes && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <i className="fas fa-sticky-note text-slate-400 dark:text-slate-500"></i> Notes
                                                </h4>
                                                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-lg border border-slate-100 dark:border-ink/20">
                                                    {selectedDoc.notes}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-ink/20">
                                            <button
                                                className="flex-1 py-2 px-3 text-xs font-medium text-white bg-pink-600 dark:bg-pink-600 hover:bg-pink-700 dark:hover:bg-pink-700 rounded-lg transition-colors"
                                                onClick={() => downloadFile(selectedDoc)}
                                            >
                                                <i className="fas fa-download mr-1.5"></i> Download
                                            </button>
                                            <button
                                                className="flex-1 py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/30 rounded-lg transition-colors"
                                                onClick={() => window.print()}
                                            >
                                                <i className="fas fa-print mr-1.5"></i> Print
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isUploadModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-ink rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 dark:border-ink/20">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-950/30 text-pink-500 dark:text-pink-400 flex items-center justify-center text-sm">
                                            <i className="fas fa-upload"></i>
                                        </span>
                                        Upload Files
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload documents, receipts, or photos</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsUploadModalOpen(false);
                                        setSelectedFiles([]);
                                        setUploadProgress(0);
                                    }}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all flex items-center justify-center text-sm"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <form onSubmit={handleUpload}>
                                <div
                                    ref={dropZoneRef}
                                    className="border-2 border-dashed border-slate-200 dark:border-ink/30 rounded-xl p-6 text-center hover:border-pink-300 dark:hover:border-pink-500/50 transition cursor-pointer bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                    onClick={() => document.getElementById('fileInput')?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.add('border-pink-400', 'bg-pink-50/50', 'dark:bg-pink-950/20');
                                    }}
                                    onDragLeave={(e) => {
                                        e.currentTarget.classList.remove('border-pink-400', 'bg-pink-50/50', 'dark:bg-pink-950/20');
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('border-pink-400', 'bg-pink-50/50', 'dark:bg-pink-950/20');
                                        handleFileSelect(e.dataTransfer.files);
                                    }}
                                >
                                    <input
                                        id="fileInput"
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx,.xls,.xlsx"
                                        onChange={(e) => handleFileSelect(e.target.files)}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <i className="fas fa-cloud-upload-alt text-4xl text-pink-400 dark:text-pink-500"></i>
                                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                            Drop files here or <span className="text-pink-500 dark:text-pink-400 hover:underline">click to upload</span>
                                        </div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500">
                                            Supports PDF, JPG, PNG, HEIC, DOC, XLS (Max 10MB each)
                                        </div>

                                        {selectedFiles.length > 0 && (
                                            <div className="w-full max-w-md mt-3 space-y-2 text-left">
                                                {selectedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2.5 bg-white dark:bg-ink/60 border border-slate-100 dark:border-ink/20 rounded-lg text-sm shadow-sm">
                                                        <span className="flex items-center gap-2 truncate pr-2">
                                                            <i className="fas fa-file text-slate-400 dark:text-slate-500"></i>
                                                            <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-200 font-medium">{file.name}</span>
                                                            <span className="text-xs text-slate-400 dark:text-slate-500">({formatFileSize(file.size)})</span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                                            className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {uploadProgress > 0 && (
                                            <div className="w-full max-w-md mt-3">
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-pink-500 dark:bg-pink-400 h-1.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                    <span>Uploading...</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Category</label>
                                            <select name="category" className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all">
                                                <option value="documents">Documents</option>
                                                <option value="photos">Photos</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Document Type</label>
                                            <select name="documentType" className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all">
                                                <option value="Official Receipt">Official Receipt</option>
                                                <option value="Invoice">Invoice</option>
                                                <option value="Delivery Receipt">Delivery Receipt</option>
                                                <option value="Parcel Condition">Parcel Condition</option>
                                                <option value="Courier Handover">Courier Handover</option>
                                                <option value="Vehicle Maintenance">Vehicle Maintenance</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Supplier</label>
                                            <select name="supplier" className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all">
                                                <option value="">Select supplier</option>
                                                {suppliers.map((s) => (
                                                    <option key={s.id} value={s.name}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">PO Number</label>
                                            <input name="poNumber" className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="e.g. PO-2026-0031" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Parcel Batch</label>
                                            <input name="parcelBatch" className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="e.g. PB-2026-045" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Uploaded By</label>
                                            <input name="uploadedBy" defaultValue={userName || DEFAULT_USER.name} className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Your name" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Notes</label>
                                            <input name="notes" className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-ink/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Additional details" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-ink/20 mt-5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsUploadModalOpen(false);
                                            setSelectedFiles([]);
                                            setUploadProgress(0);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-transparent border border-slate-200 dark:border-ink/30 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUploading || selectedFiles.length === 0}
                                        className="px-4 py-2 text-sm font-medium bg-pink-500 dark:bg-pink-600 text-white rounded-lg hover:bg-pink-600 dark:hover:bg-pink-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2 shadow-sm shadow-pink-500/20"
                                    >
                                        {isUploading ? (
                                            <><i className="fas fa-spinner fa-spin"></i> Uploading...</>
                                        ) : (
                                            <><i className="fas fa-upload"></i> Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </SessionGuard>
    );
}