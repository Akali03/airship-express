// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { supabase } from "@/app/(supplyChain)/lib/services/client/supabase";
// import { toast } from "sonner";
// import { useDebounce } from "@/app/(supplyChain)/hooks/useDebounce";
// import { useConfirm } from "@/app/(supplyChain)/components/ui/ConfirmModal";
// import { sanitizeSearch, sanitizeText, sanitizeNumber } from "@/app/(supplyChain)/components/global/sanitize";

// import {
//     Chart,
//     BarController,
//     DoughnutController,
//     BarElement,
//     ArcElement,
//     CategoryScale,
//     LinearScale,
//     Legend,
//     Tooltip,
// } from 'chart.js';

// Chart.register(
//     BarController,
//     DoughnutController,
//     BarElement,
//     ArcElement,
//     CategoryScale,
//     LinearScale,
//     Legend,
//     Tooltip
// );

// interface Parcel {
//     id: number;
//     barcode: string;
//     tracking_number: string;
//     sender_name: string | null;
//     destination: string | null;
//     courier: string | null;
//     status: string;
//     created_at: string;
// }

// interface InventoryItem {
//     id: string;
//     item_code: string;
//     item_name: string;
//     category: string;
//     current_stock: number;
//     unit: string;
//     minimum_stock: number;
//     storage_location: string;
//     status: 'available' | 'low-stock' | 'out-of-stock';
//     updated_at: string;
//     description?: string;
//     supplier?: string;
//     purchase_price?: number;
// }

// interface EquipmentAsset {
//     id: string;
//     assetNumber: string;
//     equipmentName: string;
//     assignedTo?: string;
//     condition: string;
//     status: 'available' | 'in-use' | 'maintenance' | 'retired';
// }

// interface GroupedParcels {
//     date: string;
//     parcels: Parcel[];
// }

// interface Supplier {
//     id: number;
//     name: string;
//     category: string;
//     contact_person: string;
//     phone: string;
//     email: string;
//     location: string;
//     is_active: boolean;
// }

// export default function Inventory() {
//     const [isMounted, setIsMounted] = useState(false);
//     const [activeTab, setActiveTab] = useState('dashboard');

//     const [showAddModal, setShowAddModal] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showStockInModal, setShowStockInModal] = useState(false);
//     const [showStockOutModal, setShowStockOutModal] = useState(false);
//     const [showPurchaseRequestModal, setShowPurchaseRequestModal] = useState(false);
//     const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

//     const [searchTerm, setSearchTerm] = useState('');
//     const [categoryFilter, setCategoryFilter] = useState('all');
//     const [statusFilter, setStatusFilter] = useState('all');
//     const [currentPage, setCurrentPage] = useState(1);
//     const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
//     const [parcels, setParcels] = useState<Parcel[]>([]);
//     const [groupedParcels, setGroupedParcels] = useState<GroupedParcels[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [stockInSaving, setStockInSaving] = useState(false);
//     const [stockOutSaving, setStockOutSaving] = useState(false);
//     const [deleting, setDeleting] = useState(false);
//     const [parcelSearchTerm, setParcelSearchTerm] = useState('');
//     const [parcelStatusFilter, setParcelStatusFilter] = useState('');
//     const [parcelDateFrom, setParcelDateFrom] = useState('');
//     const [parcelDateTo, setParcelDateTo] = useState('');
//     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//     const itemsPerPage = 15;
//     const debouncedParcelSearch = useDebounce(parcelSearchTerm, 300);
//     const debouncedSearch = useDebounce(searchTerm, 300);
//     const { confirm } = useConfirm();

//     const [addItemForm, setAddItemForm] = useState({
//         item_code: '',
//         item_name: '',
//         category: 'Packaging Materials',
//         unit: '',
//         description: '',
//         current_stock: 0,
//         minimum_stock: 0,
//         storage_location: '',
//         supplier: '',
//         purchase_price: 0
//     });

//     const [editItemForm, setEditItemForm] = useState({
//         id: '',
//         item_code: '',
//         item_name: '',
//         category: '',
//         unit: '',
//         description: '',
//         current_stock: 0,
//         minimum_stock: 0,
//         storage_location: '',
//         supplier: '',
//         purchase_price: 0
//     });

//     const [stockInForm, setStockInForm] = useState({
//         item: '',
//         quantity: 0,
//         supplier: '',
//         reference: '',
//         remarks: ''
//     });

//     const [stockOutForm, setStockOutForm] = useState({
//         item: '',
//         quantity: 0,
//         department: '',
//         purpose: '',
//         remarks: ''
//     });

//     const [purchaseRequestForm, setPurchaseRequestForm] = useState({
//         requested_by: '',
//         supplier: '',
//         items: [{ name: '', quantity: 0 }],
//         reason: '',
//         status: 'pending'
//     });

//     const chartRefs = {
//         cat: useRef<HTMLCanvasElement>(null),
//         stat: useRef<HTMLCanvasElement>(null),
//     };
//     const chartInstances = useRef<any>({ cat: null, stat: null });

//     const showToast = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
//         toast[type](message);
//     };

//     const getStatusBadge = (status: string) => {
//         const classes: Record<string, string> = {
//             'available': 'bg-green-100 text-green-700',
//             'low-stock': 'bg-amber-100 text-amber-700',
//             'out-of-stock': 'bg-red-100 text-red-700',
//             'received': 'bg-blue-100 text-blue-700',
//             'sorting': 'bg-amber-100 text-amber-700',
//             'ready_for_pickup': 'bg-emerald-100 text-emerald-700',
//             'picked_up': 'bg-purple-100 text-purple-700',
//             'delivered': 'bg-green-100 text-green-700',
//             'in-use': 'bg-blue-100 text-blue-700',
//             'maintenance': 'bg-orange-100 text-orange-700',
//             'retired': 'bg-gray-100 text-gray-700',
//         };
//         return classes[status] || 'bg-gray-100 text-gray-700';
//     };

//     const getStatusLabel = (status: string) => {
//         switch (status) {
//             case 'ready_for_pickup': return 'Ready';
//             case 'picked_up': return 'Picked Up';
//             default: return status.charAt(0).toUpperCase() + status.slice(1);
//         }
//     };

//     const fetchData = useCallback(async () => {
//         try {
//             setLoading(true);

//             const [
//                 { data: parcelsData, error: parcelsError },
//                 { data: inventoryData, error: inventoryError },
//                 { data: supplierData, error: supplierError }
//             ] = await Promise.all([
//                 supabase.from('parcels').select('*').order('created_at', { ascending: false }),
//                 supabase.from('inventory_items').select('*').order('item_name'),
//                 supabase.from('suppliers').select('*').eq('is_active', true).order('name')
//             ]);

//             if (parcelsError) throw parcelsError;
//             if (inventoryError) throw inventoryError;
//             if (supplierError) throw supplierError;

//             setParcels(parcelsData || []);

//             const grouped = (parcelsData || []).reduce((acc: GroupedParcels[], parcel: any) => {
//                 const date = new Date(parcel.created_at).toLocaleDateString('en-US', {
//                     year: 'numeric', month: 'long', day: 'numeric'
//                 });
//                 const existingGroup = acc.find(g => g.date === date);
//                 if (existingGroup) existingGroup.parcels.push(parcel);
//                 else acc.push({ date, parcels: [parcel] });
//                 return acc;
//             }, []);
//             setGroupedParcels(grouped);

//             setInventoryItems(inventoryData || []);
//             setSuppliers(supplierData || []);

//         } catch (error) {
//             console.error('Error fetching data:', error);
//             toast.error('Failed to load inventory data');
//         } finally {
//             setLoading(false);
//         }
//     }, []);


//     const saveInventoryItem = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (saving) return;

//         const sanitizedItemCode = addItemForm.item_code;
//         const sanitizedItemName = sanitizeText(addItemForm.item_name);
//         const sanitizedCategory = sanitizeText(addItemForm.category);
//         const sanitizedUnit = sanitizeText(addItemForm.unit);

//         if (!sanitizedItemCode || !sanitizedItemName || !sanitizedCategory || !sanitizedUnit) {
//             toast.warning('Please fill in all required fields');
//             return;
//         }

//         setSaving(true);
//         const toastId = toast.loading('Saving inventory item...');

//         try {
//             let status = 'available';
//             if (addItemForm.current_stock <= 0) {
//                 status = 'out-of-stock';
//             } else if (addItemForm.current_stock < addItemForm.minimum_stock) {
//                 status = 'low-stock';
//             }

//             const { data, error } = await supabase
//                 .from('inventory_items')
//                 .insert([{
//                     item_code: addItemForm.item_code,
//                     item_name: addItemForm.item_name,
//                     category: addItemForm.category,
//                     unit: addItemForm.unit,
//                     current_stock: addItemForm.current_stock,
//                     minimum_stock: addItemForm.minimum_stock,
//                     storage_location: addItemForm.storage_location || null,
//                     supplier: addItemForm.supplier || null,
//                     purchase_price: addItemForm.purchase_price || 0,
//                     description: addItemForm.description || null,
//                     status: status
//                 }])
//                 .select();

//             if (error) throw error;

//             toast.success('Item added successfully!', { id: toastId });
//             setShowAddModal(false);
//             resetAddForm();
//             fetchData();

//         } catch (error) {
//             console.error('Error saving item:', error);
//             toast.error('Failed to save item', { id: toastId });
//         } finally {
//             setSaving(false);
//         }
//     };

//     const openEditModal = (item: InventoryItem) => {
//         setEditingItem(item);
//         setEditItemForm({
//             id: item.id,
//             item_code: item.item_code,
//             item_name: item.item_name,
//             category: item.category,
//             unit: item.unit,
//             description: item.description || '',
//             current_stock: item.current_stock,
//             minimum_stock: item.minimum_stock,
//             storage_location: item.storage_location || '',
//             supplier: item.supplier || '',
//             purchase_price: item.purchase_price || 0
//         });
//         setShowEditModal(true);
//     };

//     const updateInventoryItem = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (saving) return;

//         if (!editItemForm.item_code || !editItemForm.item_name || !editItemForm.category || !editItemForm.unit) {
//             toast.warning('Please fill in all required fields');
//             return;
//         }

//         setSaving(true);
//         const toastId = toast.loading('Updating inventory item...');

//         try {
//             let status = 'available';
//             if (editItemForm.current_stock <= 0) {
//                 status = 'out-of-stock';
//             } else if (editItemForm.current_stock < editItemForm.minimum_stock) {
//                 status = 'low-stock';
//             }

//             const { error } = await supabase
//                 .from('inventory_items')
//                 .update({
//                     item_code: editItemForm.item_code,
//                     item_name: editItemForm.item_name,
//                     category: editItemForm.category,
//                     unit: editItemForm.unit,
//                     current_stock: editItemForm.current_stock,
//                     minimum_stock: editItemForm.minimum_stock,
//                     storage_location: editItemForm.storage_location || null,
//                     supplier: editItemForm.supplier || null,
//                     purchase_price: editItemForm.purchase_price || 0,
//                     description: editItemForm.description || null,
//                     status: status,
//                     updated_at: new Date().toISOString()
//                 })
//                 .eq('id', editItemForm.id);

//             if (error) throw error;

//             toast.success('Item updated successfully!', { id: toastId });
//             setShowEditModal(false);
//             setEditingItem(null);
//             fetchData();

//         } catch (error) {
//             console.error('Error updating item:', error);
//             toast.error('Failed to update item', { id: toastId });
//         } finally {
//             setSaving(false);
//         }
//     };

//     const deleteItem = async (id: string, itemName: string) => {
//         const confirmed = await confirm({
//             title: "Delete Item",
//             message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
//             confirmText: "Delete",
//             cancelText: "Cancel",
//             confirmVariant: "danger",
//         });

//         if (!confirmed) return;

//         setDeleting(true);
//         const toastId = toast.loading(`Deleting ${itemName}...`);

//         try {
//             const { error } = await supabase
//                 .from('inventory_items')
//                 .delete()
//                 .eq('id', id);

//             if (error) throw error;

//             toast.success(`"${itemName}" deleted successfully!`, { id: toastId });
//             fetchData();

//         } catch (error) {
//             console.error('Error deleting item:', error);
//             toast.error('Failed to delete item', { id: toastId });
//         } finally {
//             setDeleting(false);
//         }
//     };

//     const deleteMultipleItems = async () => {
//         if (selectedIds.size === 0) {
//             toast.warning('Please select at least one item to delete');
//             return;
//         }

//         const confirmed = await confirm({
//             title: `Delete ${selectedIds.size} Items`,
//             message: `Are you sure you want to delete ${selectedIds.size} selected item(s)? This action cannot be undone.`,
//             confirmText: `Delete ${selectedIds.size}`,
//             cancelText: "Cancel",
//             confirmVariant: "danger",
//         });

//         if (!confirmed) return;

//         setDeleting(true);
//         const toastId = toast.loading(`Deleting ${selectedIds.size} items...`);

//         try {
//             const { error } = await supabase
//                 .from('inventory_items')
//                 .delete()
//                 .in('id', Array.from(selectedIds));

//             if (error) throw error;

//             toast.success(`Successfully deleted ${selectedIds.size} items!`, { id: toastId });
//             setSelectedIds(new Set());
//             fetchData();

//         } catch (error) {
//             console.error('Error deleting items:', error);
//             toast.error('Failed to delete items', { id: toastId });
//         } finally {
//             setDeleting(false);
//         }
//     };


//     const handleStockIn = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (stockInSaving) return;

//         if (stockInForm.quantity <= 0) {
//             showToast("Quantity must be greater than 0", "warning");
//             return;
//         }

//         const item = inventoryItems.find(i => i.item_name === stockInForm.item);
//         if (!item) {
//             showToast("Item not found", "error");
//             return;
//         }

//         setStockInSaving(true);
//         const toastId = toast.loading(`Adding stock to ${item.item_name}...`);

//         try {
//             const newStock = item.current_stock + stockInForm.quantity;

//             const { error } = await supabase
//                 .from('inventory_items')
//                 .update({
//                     current_stock: newStock,
//                     updated_at: new Date().toISOString()
//                 })
//                 .eq('id', item.id);

//             if (error) throw error;

//             toast.success(`Added ${stockInForm.quantity} ${item.unit} to ${item.item_name}`, { id: toastId });
//             setShowStockInModal(false);
//             setStockInForm({ item: '', quantity: 0, supplier: '', reference: '', remarks: '' });
//             fetchData();

//         } catch (error) {
//             console.error('Error updating stock:', error);
//             toast.error(`Failed to update stock: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
//         } finally {
//             setStockInSaving(false);
//         }
//     };

//     const handleStockOut = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (stockOutSaving) return;

//         if (stockOutForm.quantity <= 0) {
//             showToast("Quantity must be greater than 0", "warning");
//             return;
//         }

//         const item = inventoryItems.find(i => i.item_name === stockOutForm.item);
//         if (!item) {
//             showToast("Item not found", "error");
//             return;
//         }

//         if (stockOutForm.quantity > item.current_stock) {
//             showToast(`Insufficient stock! Available: ${item.current_stock} ${item.unit}`, "error");
//             return;
//         }

//         setStockOutSaving(true);
//         const toastId = toast.loading(`Removing stock from ${item.item_name}...`);

//         try {
//             const newStock = item.current_stock - stockOutForm.quantity;

//             const { error } = await supabase
//                 .from('inventory_items')
//                 .update({
//                     current_stock: newStock,
//                     updated_at: new Date().toISOString()
//                 })
//                 .eq('id', item.id);

//             if (error) throw error;

//             toast.success(`Removed ${stockOutForm.quantity} ${item.unit} from ${item.item_name}`, { id: toastId });
//             setShowStockOutModal(false);
//             setStockOutForm({ item: '', quantity: 0, department: '', purpose: '', remarks: '' });
//             fetchData();

//         } catch (error) {
//             console.error('Error updating stock:', error);
//             toast.error(`Failed to update stock: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
//         } finally {
//             setStockOutSaving(false);
//         }
//     };


//     const resetAddForm = () => {
//         setAddItemForm({
//             item_code: '',
//             item_name: '',
//             category: 'Packaging Materials',
//             unit: '',
//             description: '',
//             current_stock: 0,
//             minimum_stock: 0,
//             storage_location: '',
//             supplier: '',
//             purchase_price: 0
//         });
//     };

//     const handleSelectAll = () => {
//         if (selectedIds.size === filteredItems.length) {
//             setSelectedIds(new Set());
//         } else {
//             setSelectedIds(new Set(filteredItems.map(item => item.id)));
//         }
//     };

//     const handleSelect = (id: string) => {
//         const newSelected = new Set(selectedIds);
//         if (newSelected.has(id)) {
//             newSelected.delete(id);
//         } else {
//             newSelected.add(id);
//         }
//         setSelectedIds(newSelected);
//     };

//     const getCurrentItem = (itemName: string) => {
//         return inventoryItems.find(i => i.item_name === itemName);
//     };

//     useEffect(() => {
//         fetchData();
//     }, [fetchData]);

//     useEffect(() => {
//         setIsMounted(true);
//         return () => {
//             if (chartInstances.current.cat) {
//                 chartInstances.current.cat.destroy();
//                 chartInstances.current.cat = null;
//             }
//             if (chartInstances.current.stat) {
//                 chartInstances.current.stat.destroy();
//                 chartInstances.current.stat = null;
//             }
//         };
//     }, []);

//     useEffect(() => {
//         if (!isMounted || inventoryItems.length === 0 || activeTab !== 'dashboard') return;

//         const initCharts = () => {
//             const categoryData: Record<string, number> = {};
//             inventoryItems.forEach(item => {
//                 categoryData[item.category] = (categoryData[item.category] || 0) + 1;
//             });

//             const categoryLabels = Object.keys(categoryData);
//             const categoryValues = Object.values(categoryData);
//             const colors = ['#EC4899', '#F43F5E', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

//             if (chartRefs.cat.current) {
//                 if (chartInstances.current.cat) chartInstances.current.cat.destroy();
//                 const ctx = chartRefs.cat.current.getContext('2d');
//                 if (ctx) {
//                     chartInstances.current.cat = new Chart(ctx, {
//                         type: "bar",
//                         data: {
//                             labels: categoryLabels,
//                             datasets: [{
//                                 label: "Items",
//                                 data: categoryValues,
//                                 backgroundColor: categoryLabels.map((_, i) => colors[i % colors.length]),
//                                 barThickness: 30,
//                                 borderRadius: 6,
//                             }],
//                         },
//                         options: {
//                             responsive: true,
//                             maintainAspectRatio: false,
//                             plugins: {
//                                 legend: { display: false },
//                                 tooltip: {
//                                     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                                     titleColor: '#1e293b',
//                                     bodyColor: '#475569',
//                                     borderColor: '#e2e8f0',
//                                     borderWidth: 1,
//                                     cornerRadius: 8,
//                                     padding: 10,
//                                     callbacks: {
//                                         label: function (context) {
//                                             const label = context.label || '';
//                                             const value = context.parsed.y || 0;
//                                             const total = categoryValues.reduce((a, b) => a + b, 0);
//                                             const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
//                                             return `${label}: ${value} items (${percentage}%)`;
//                                         },
//                                         afterBody: function (tooltipItems) {
//                                             return `Click to filter by "${tooltipItems[0].label}"`;
//                                         }
//                                     }
//                                 }
//                             },
//                             scales: {
//                                 x: {
//                                     grid: { display: false },
//                                     ticks: { font: { size: 10 } }
//                                 },
//                                 y: {
//                                     grid: { display: false },
//                                     beginAtZero: true,
//                                     ticks: { font: { size: 10 } }
//                                 },
//                             },
//                             onClick: function (evt, elements) {
//                                 if (elements.length > 0) {
//                                     const index = elements[0].index;
//                                     const category = categoryLabels[index];
//                                     setActiveTab('inventory');
//                                     setCategoryFilter(category);
//                                     setCurrentPage(1);
//                                     setTimeout(() => {
//                                         const tableElement = document.querySelector('.overflow-x-auto');
//                                         if (tableElement) {
//                                             tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//                                         }
//                                     }, 300);
//                                     toast.info(`Showing items in: ${category}`);
//                                 }
//                             },
//                             onHover: function (evt, elements) {
//                                 const canvas = evt.native?.target as HTMLCanvasElement;
//                                 if (canvas) {
//                                     canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
//                                 }
//                             }
//                         },
//                     });
//                 }
//             }

//             const statusData = {
//                 'Available': inventoryItems.filter(i => i.status === 'available').length,
//                 'Low Stock': inventoryItems.filter(i => i.status === 'low-stock').length,
//                 'Out of Stock': inventoryItems.filter(i => i.status === 'out-of-stock').length,
//             };
//             const statusLabels = Object.keys(statusData);
//             const statusValues = Object.values(statusData);
//             const statusColors = ['#6EE7B7', '#FCD34D', '#F87171'];

//             if (chartRefs.stat.current) {
//                 if (chartInstances.current.stat) chartInstances.current.stat.destroy();
//                 const ctx = chartRefs.stat.current.getContext('2d');
//                 if (ctx) {
//                     chartInstances.current.stat = new Chart(ctx, {
//                         type: "doughnut",
//                         data: {
//                             labels: statusLabels,
//                             datasets: [{
//                                 data: statusValues,
//                                 backgroundColor: statusColors,
//                                 borderWidth: 2,
//                                 borderColor: '#ffffff',
//                                 hoverOffset: 10,
//                             }],
//                         },
//                         options: {
//                             responsive: true,
//                             maintainAspectRatio: false,
//                             cutout: "65%",
//                             plugins: {
//                                 legend: {
//                                     position: "bottom",
//                                     labels: {
//                                         boxWidth: 10,
//                                         boxHeight: 10,
//                                         usePointStyle: true,
//                                         padding: 8,
//                                         font: { size: 9 },
//                                         color: '#475569',
//                                     },
//                                 },
//                                 tooltip: {
//                                     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                                     titleColor: '#1e293b',
//                                     bodyColor: '#475569',
//                                     borderColor: '#e2e8f0',
//                                     borderWidth: 1,
//                                     cornerRadius: 8,
//                                     padding: 10,
//                                     callbacks: {
//                                         label: function (context) {
//                                             const label = context.label || '';
//                                             const value = context.parsed || 0;
//                                             const total = statusValues.reduce((a, b) => a + b, 0);
//                                             const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
//                                             return `${label}: ${value} items (${percentage}%)`;
//                                         },
//                                         afterBody: function (tooltipItems) {
//                                             const statusMap: Record<string, string> = {
//                                                 'Available': 'available',
//                                                 'Low Stock': 'low-stock',
//                                                 'Out of Stock': 'out-of-stock'
//                                             };
//                                             const status = statusMap[tooltipItems[0].label] || '';
//                                             return `Click to filter by "${status}"`;
//                                         }
//                                     }
//                                 }
//                             },
//                             onClick: function (evt, elements) {
//                                 if (elements.length > 0) {
//                                     const index = elements[0].index;
//                                     const label = statusLabels[index];
//                                     const statusMap: Record<string, string> = {
//                                         'Available': 'available',
//                                         'Low Stock': 'low-stock',
//                                         'Out of Stock': 'out-of-stock'
//                                     };
//                                     const status = statusMap[label] || '';
//                                     setActiveTab('inventory');
//                                     setStatusFilter(status);
//                                     setCurrentPage(1);
//                                     setTimeout(() => {
//                                         const tableElement = document.querySelector('.overflow-x-auto');
//                                         if (tableElement) {
//                                             tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//                                         }
//                                     }, 300);
//                                     toast.info(`Showing items with status: ${label}`);
//                                 }
//                             },
//                             onHover: function (evt, elements) {
//                                 const canvas = evt.native?.target as HTMLCanvasElement;
//                                 if (canvas) {
//                                     canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
//                                 }
//                             }
//                         },
//                     });
//                 }
//             }
//         };

//         setTimeout(initCharts, 100);

//         return () => {
//             if (chartInstances.current.cat) {
//                 chartInstances.current.cat.destroy();
//                 chartInstances.current.cat = null;
//             }
//             if (chartInstances.current.stat) {
//                 chartInstances.current.stat.destroy();
//                 chartInstances.current.stat = null;
//             }
//         };
//     }, [isMounted, inventoryItems, activeTab]);

//     const scrollToTable = () => {
//         setTimeout(() => {
//             const tableElement = document.querySelector('.overflow-x-auto');
//             if (tableElement) {
//                 tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//             }
//         }, 300);
//     };

//     const filteredItems = inventoryItems.filter(item => {
//         const matchesSearch = item.item_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//             item.item_code.toLowerCase().includes(debouncedSearch.toLowerCase());
//         const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
//         const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
//         return matchesSearch && matchesCategory && matchesStatus;
//     });

//     const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
//     const paginatedItems = filteredItems.slice(
//         (currentPage - 1) * itemsPerPage,
//         currentPage * itemsPerPage
//     );

//     const filteredParcels = parcels.filter(parcel => {
//         const matchesSearch = parcel.barcode.toLowerCase().includes(debouncedParcelSearch.toLowerCase()) ||
//             parcel.tracking_number.toLowerCase().includes(debouncedParcelSearch.toLowerCase()) ||
//             (parcel.sender_name && parcel.sender_name.toLowerCase().includes(debouncedParcelSearch.toLowerCase()));
//         const matchesStatus = parcelStatusFilter === '' || parcel.status === parcelStatusFilter;
//         let matchesDate = true;
//         if (parcelDateFrom) {
//             matchesDate = matchesDate && new Date(parcel.created_at) >= new Date(parcelDateFrom);
//         }
//         if (parcelDateTo) {
//             matchesDate = matchesDate && new Date(parcel.created_at) <= new Date(parcelDateTo + 'T23:59:59');
//         }
//         return matchesSearch && matchesStatus && matchesDate;
//     });

//     const filteredGroupedParcels = filteredParcels.reduce((acc: GroupedParcels[], parcel) => {
//         const date = new Date(parcel.created_at).toLocaleDateString('en-US', {
//             year: 'numeric', month: 'long', day: 'numeric'
//         });
//         const existingGroup = acc.find(g => g.date === date);
//         if (existingGroup) {
//             existingGroup.parcels.push(parcel);
//         } else {
//             acc.push({ date, parcels: [parcel] });
//         }
//         return acc;
//     }, []);

//     const totalItems = inventoryItems.length;
//     const lowStockItems = inventoryItems.filter(i => i.status === 'low-stock').length;
//     const outOfStockItems = inventoryItems.filter(i => i.status === 'out-of-stock').length;
//     const allSelected = filteredItems.length > 0 && selectedIds.size === filteredItems.length;
//     const someSelected = selectedIds.size > 0 && selectedIds.size < filteredItems.length;

//     if (!isMounted || loading) {
//         return (
//             <div className="p-6">
//                 <div className="flex items-center justify-center h-64">
//                     <div className="text-center">
//                         <i className="fas fa-spinner fa-spin text-3xl text-pink-500 mb-4"></i>
//                         <p className="text-slate-500">Loading inventory...</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6 space-y-6 animate-in fade-in duration-300">

//             <div className="flex items-start justify-between gap-4 flex-wrap">
//                 <div>
//                     <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
//                         Warehouse Inventory
//                     </h1>
//                     <p className="text-sm text-slate-500 mt-1">
//                         Manage warehouse supplies, equipment, parcels, and assets
//                     </p>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                     <button
//                         className="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition-all hover:shadow-lg hover:shadow-pink-500/30 flex items-center gap-1.5"
//                         onClick={() => setShowAddModal(true)}
//                     >
//                         <i className="fas fa-plus w-4 h-4"></i>
//                         Add Item
//                     </button>
//                     {selectedIds.size > 0 && (
//                         <button
//                             className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-all hover:shadow-lg hover:shadow-red-500/30 flex items-center gap-1.5"
//                             onClick={deleteMultipleItems}
//                             disabled={deleting}
//                         >
//                             <i className="fas fa-trash w-4 h-4"></i>
//                             Delete {selectedIds.size}
//                         </button>
//                     )}
//                 </div>
//             </div>

//             <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
//                 {['dashboard', 'inventory', 'parcels'].map((tab) => (
//                     <button
//                         key={tab}
//                         onClick={() => setActiveTab(tab)}
//                         className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab
//                             ? 'bg-pink-50 text-pink-600 border border-pink-200'
//                             : 'text-slate-600 hover:bg-slate-50'
//                             }`}
//                     >
//                         {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                     </button>
//                 ))}
//             </div>

//             DAS
//             {activeTab === 'dashboard' && (
//                 <>
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3x gap-4">
//                         <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
//                             <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Items</div>
//                             <div className="text-2xl font-bold text-slate-900 my-1">{totalItems}</div>
//                             <div className="text-xs text-slate-500">Inventory items</div>
//                         </div>
//                         <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
//                             <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Low Stock</div>
//                             <div className="text-2xl font-bold text-amber-600 my-1">{lowStockItems}</div>
//                             <div className="text-xs text-amber-600">⚠️ Need restock</div>
//                         </div>
//                         <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
//                             <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Out of Stock</div>
//                             <div className="text-2xl font-bold text-red-600 my-1">{outOfStockItems}</div>
//                             <div className="text-xs text-red-600">🚫 Unavailable</div>
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 border-l-4 border-l-amber-500">
//                         <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center gap-2">
//                                 <i className="fas fa-exclamation-triangle text-amber-500"></i>
//                                 <h3 className="font-semibold text-slate-900">Low Stock Alert</h3>
//                                 <span className="text-xs text-slate-400">
//                                     ({inventoryItems.filter(i => i.status === 'low-stock' || i.status === 'out-of-stock').length} items)
//                                 </span>
//                             </div>
//                             <button
//                                 className="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition-all flex items-center gap-1.5"
//                                 onClick={() => setShowPurchaseRequestModal(true)}
//                             >
//                                 <i className="fas fa-shopping-cart w-4 h-4"></i>
//                                 Create Purchase Request
//                             </button>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                             {inventoryItems.filter(i => i.status === 'low-stock' || i.status === 'out-of-stock').slice(0, 6).map(item => (
//                                 <div
//                                     key={item.id}
//                                     className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${item.status === 'out-of-stock'
//                                         ? 'bg-red-50 border-red-200 hover:border-red-400 hover:bg-red-100'
//                                         : 'bg-amber-50 border-amber-200 hover:border-amber-400 hover:bg-amber-100'
//                                         }`}
//                                     onClick={() => {
//                                         setStockInForm({
//                                             ...stockInForm,
//                                             item: item.item_name,
//                                             quantity: 0,
//                                             supplier: '',
//                                             reference: '',
//                                             remarks: ''
//                                         });
//                                         setShowStockInModal(true);
//                                     }}
//                                 >
//                                     <div className="flex items-center justify-between">
//                                         <div>
//                                             <p className="font-medium text-sm text-slate-800">{item.item_name}</p>
//                                             <p className="text-xs text-slate-500">
//                                                 Current: <span className="font-semibold">{item.current_stock}</span> {item.unit}
//                                                 <span className="mx-1">|</span>
//                                                 Min: <span className="font-semibold">{item.minimum_stock}</span> {item.unit}
//                                             </p>
//                                         </div>
//                                         <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${item.status === 'out-of-stock'
//                                             ? 'bg-red-200 text-red-700'
//                                             : 'bg-amber-200 text-amber-700'
//                                             }`}>
//                                             {item.status === 'out-of-stock' ? 'Out of Stock' : 'Low Stock'}
//                                         </span>
//                                     </div>
//                                     <div className="mt-2 pt-2 border-t border-slate-200/50 flex justify-end">
//                                         <button
//                                             className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 setStockInForm({
//                                                     ...stockInForm,
//                                                     item: item.item_name,
//                                                     quantity: 0,
//                                                     supplier: '',
//                                                     reference: '',
//                                                     remarks: ''
//                                                 });
//                                                 setShowStockInModal(true);
//                                             }}
//                                         >
//                                             <i className="fas fa-arrow-down text-[10px]"></i>
//                                             Add Stock
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     CHARTS S
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//                         <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 lg:col-span-2">
//                             <div className="flex items-center justify-between mb-2">
//                                 <div className="font-semibold text-slate-900 text-sm">Inventory by Category</div>
//                                 <div className="text-xs text-slate-400">Click a bar to filter by category</div>
//                             </div>
//                             <div className="h-[180px] relative">
//                                 <canvas ref={chartRefs.cat}></canvas>
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
//                             <div className="font-semibold text-slate-900 text-center sm:text-left text-sm">Stock Status</div>
//                             <div className="text-xs text-slate-400 text-center sm:text-left mb-1">Click a segment to filter by status</div>
//                             <div className="h-[180px] relative">
//                                 <canvas ref={chartRefs.stat}></canvas>
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}

//             INVENTORY TABLE WIT
//             {activeTab === 'inventory' && (
//                 <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
//                     <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/50">
//                         <div className="relative flex-1 min-w-[200px] max-w-xs">
//                             <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
//                             <input
//                                 className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
//                                 placeholder="Search by item name or code..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(sanitizeSearch(e.target.value))}
//                             />
//                         </div>
//                         <div className="relative">
//                             <i className="fas fa-filter absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
//                             <select
//                                 className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all max-w-[180px]"
//                                 value={categoryFilter}
//                                 onChange={(e) => setCategoryFilter(e.target.value)}
//                             >
//                                 <option value="all">All Categories</option>
//                                 <option value="Packaging Materials">Packaging Materials</option>
//                                 <option value="Warehouse Supplies">Warehouse Supplies</option>
//                                 <option value="Equipment">Equipment</option>
//                                 <option value="Warehouse Equipment">Warehouse Equipment</option>
//                             </select>
//                         </div>
//                         <div className="relative">
//                             <i className="fas fa-tag absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
//                             <select
//                                 className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all max-w-[180px]"
//                                 value={statusFilter}
//                                 onChange={(e) => setStatusFilter(e.target.value)}
//                             >
//                                 <option value="all">All Statuses</option>
//                                 <option value="available">Available</option>
//                                 <option value="low-stock">Low Stock</option>
//                                 <option value="out-of-stock">Out of Stock</option>
//                             </select>
//                         </div>
//                         <button
//                             className="ml-auto text-xs text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1"
//                             onClick={() => {
//                                 setSearchTerm('');
//                                 setCategoryFilter('all');
//                                 setStatusFilter('all');
//                                 setSelectedIds(new Set());
//                             }}
//                         >
//                             <i className="fas fa-times"></i>
//                             Clear filters
//                         </button>
//                     </div>

//                     <div className="overflow-x-auto p-5">
//                         <div className="rounded-lg overflow-hidden shadow-md">
//                             <table className="w-full text-sm">
//                                 <thead className="bg-slate-50/80">
//                                     <tr>
//                                         <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 w-10">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={allSelected}
//                                                 ref={(input) => {
//                                                     if (input) {
//                                                         input.indeterminate = someSelected;
//                                                     }
//                                                 }}
//                                                 onChange={handleSelectAll}
//                                                 className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500 focus:ring-2 cursor-pointer"
//                                             />
//                                         </th>
//                                         <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">#</th>
//                                         <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Item Name</th>
//                                         <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Category</th>
//                                         <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Stock</th>
//                                         <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Status</th>
//                                         <th className="text-right px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Action</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100">
//                                     {paginatedItems.map((item, index) => (
//                                         <tr key={item.id} className="hover:bg-slate-50/80 transition-all even:bg-gray-100">
//                                             <td className="px-4 py-2.5">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={selectedIds.has(item.id)}
//                                                     onChange={() => handleSelect(item.id)}
//                                                     className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500 focus:ring-2 cursor-pointer"
//                                                 />
//                                             </td>
//                                             <td className="px-4 py-2.5 text-slate-500 text-xs font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                                             <td className="px-4 py-2.5 text-slate-900 font-medium">{item.item_name}</td>
//                                             <td className="px-4 py-2.5 text-slate-600">{item.category}</td>
//                                             <td className="px-4 py-2.5 text-slate-900 font-semibold">{item.current_stock}</td>
//                                             <td className="px-4 py-2.5">
//                                                 <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
//                                                     {item.status === 'available' ? 'Available' :
//                                                         item.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-4 py-2.5 text-right">
//                                                 <div className="flex items-center justify-end gap-1">
//                                                     <button
//                                                         className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:bg-slate-50 transition-all flex items-center gap-1"
//                                                         onClick={() => {
//                                                             setStockInForm({ ...stockInForm, item: item.item_name });
//                                                             setShowStockInModal(true);
//                                                         }}
//                                                     >
//                                                         <i className="fas fa-arrow-down text-green-500 text-xs"></i> In
//                                                     </button>
//                                                     <button
//                                                         className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:bg-slate-50 transition-all flex items-center gap-1"
//                                                         onClick={() => {
//                                                             setStockOutForm({ ...stockOutForm, item: item.item_name });
//                                                             setShowStockOutModal(true);
//                                                         }}
//                                                     >
//                                                         <i className="fas fa-arrow-up text-orange-500 text-xs"></i> Out
//                                                     </button>
//                                                     <button
//                                                         className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:bg-slate-50 transition-all"
//                                                         onClick={() => openEditModal(item)}
//                                                     >
//                                                         <i className="fas fa-edit text-xs"></i>
//                                                     </button>
//                                                     <button
//                                                         className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:bg-slate-50 transition-all text-red-500 hover:text-red-600 hover:bg-red-50"
//                                                         onClick={() => deleteItem(item.id, item.item_name)}
//                                                         disabled={deleting}
//                                                     >
//                                                         <i className="fas fa-trash text-xs"></i>
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
//                         <span className="text-sm text-slate-500">
//                             Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
//                         </span>
//                         <div className="flex gap-1">
//                             <button
//                                 className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//                                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                                 disabled={currentPage === 1}
//                             >
//                                 <i className="fas fa-chevron-left text-xs"></i> Prev
//                             </button>
//                             {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
//                                 <button
//                                     key={page}
//                                     className={`px-3 py-1.5 text-xs border rounded-lg transition-all ${currentPage === page ? 'bg-pink-50 border-pink-200 text-pink-600 font-medium' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
//                                     onClick={() => setCurrentPage(page)}
//                                 >
//                                     {page}
//                                 </button>
//                             ))}
//                             {totalPages > 5 && <span className="px-2 py-1.5 text-xs text-slate-400">...</span>}
//                             <button
//                                 className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//                                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                                 disabled={currentPage === totalPages}
//                             >
//                                 Next <i className="fas fa-chevron-right text-xs"></i>
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             PARCEL
//             {activeTab === 'parcels' && (
//                 <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
//                     <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/50">
//                         <div className="relative flex-1 min-w-[200px] max-w-xs">
//                             <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
//                             <input
//                                 className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
//                                 placeholder="Search by barcode, tracking, or sender..."
//                                 value={parcelSearchTerm}
//                                 onChange={(e) => setParcelSearchTerm(sanitizeSearch(e.target.value))}
//                             />
//                         </div>
//                         <div className="relative">
//                             <i className="fas fa-filter absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
//                             <select
//                                 className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all max-w-[180px]"
//                                 value={parcelStatusFilter}
//                                 onChange={(e) => setParcelStatusFilter(e.target.value)}
//                             >
//                                 <option value="">All Statuses</option>
//                                 <option value="received">Received</option>
//                                 <option value="sorting">Sorting</option>
//                                 <option value="ready_for_pickup">Ready</option>
//                                 <option value="picked_up">Picked Up</option>
//                                 <option value="delivered">Delivered</option>
//                             </select>
//                         </div>
//                         <div className="relative">
//                             <i className="fas fa-calendar-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
//                             <input
//                                 type="date"
//                                 className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all max-w-[150px]"
//                                 value={parcelDateFrom}
//                                 onChange={(e) => setParcelDateFrom(e.target.value)}
//                                 placeholder="From"
//                             />
//                         </div>
//                         <span className="text-slate-300 text-sm">—</span>
//                         <div className="relative">
//                             <i className="fas fa-calendar-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
//                             <input
//                                 type="date"
//                                 className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all max-w-[150px]"
//                                 value={parcelDateTo}
//                                 onChange={(e) => setParcelDateTo(e.target.value)}
//                                 placeholder="To"
//                             />
//                         </div>
//                         <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
//                             <i className="fas fa-box mr-1"></i> {filteredParcels.length} parcels
//                         </span>
//                         <button
//                             className="ml-auto text-xs text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1"
//                             onClick={() => { setParcelSearchTerm(''); setParcelStatusFilter(''); setParcelDateFrom(''); setParcelDateTo(''); }}
//                         >
//                             <i className="fas fa-times"></i> Clear filters
//                         </button>
//                     </div>

//                     <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
//                         {filteredGroupedParcels.length > 0 ? (
//                             filteredGroupedParcels.map((group) => (
//                                 <div key={group.date} className="rounded-lg overflow-hidden shadow-md">
//                                     <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
//                                         <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                                             <i className="fas fa-calendar-day text-pink-500"></i>
//                                             {group.date}
//                                         </h3>
//                                         <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
//                                             {group.parcels.length} parcels
//                                         </span>
//                                     </div>
//                                     <div className="overflow-x-auto">
//                                         <table className="w-full text-sm">
//                                             <thead className="bg-slate-50/80">
//                                                 <tr>
//                                                     <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">#</th>
//                                                     <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Barcode</th>
//                                                     <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Tracking</th>
//                                                     <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Sender</th>
//                                                     <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Destination</th>
//                                                     <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Courier</th>
//                                                     <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Status</th>
//                                                     <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">Time</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody className="divide-y divide-slate-100">
//                                                 {group.parcels.map((parcel, index) => (
//                                                     <tr key={parcel.id} className="hover:bg-slate-50/80 transition-all even:bg-gray-100">
//                                                         <td className="px-4 py-2.5 text-slate-500 text-xs font-medium">{index + 1}</td>
//                                                         <td className="px-4 py-2.5 font-mono text-xs text-slate-900 font-semibold">
//                                                             <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{parcel.barcode}</span>
//                                                         </td>
//                                                         <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{parcel.tracking_number}</td>
//                                                         <td className="px-4 py-2.5 text-slate-700 font-medium">{parcel.sender_name || 'N/A'}</td>
//                                                         <td className="px-4 py-2.5 text-slate-600">{parcel.destination || 'N/A'}</td>
//                                                         <td className="px-4 py-2.5 text-slate-600 font-medium">{parcel.courier || 'N/A'}</td>
//                                                         <td className="px-4 py-2.5">
//                                                             <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(parcel.status)}`}>
//                                                                 {getStatusLabel(parcel.status)}
//                                                             </span>
//                                                         </td>
//                                                         <td className="px-4 py-2.5 text-slate-400 text-xs font-mono">
//                                                             {new Date(parcel.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 </div>
//                             ))
//                         ) : (
//                             <div className="text-center py-12 text-slate-400">
//                                 <i className="fas fa-box-open text-4xl mb-3 block text-slate-300"></i>
//                                 <p className="text-sm font-medium">No parcels found</p>
//                                 <p className="text-xs mt-1">Try adjusting your search or filters</p>
//                             </div>
//                         )}
//                     </div>

//                     {filteredGroupedParcels.length > 0 && (
//                         <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
//                             <span className="text-sm text-slate-500">
//                                 Showing <span className="font-semibold text-slate-700">{filteredGroupedParcels.length}</span> date groups
//                                 <span className="mx-1">·</span>
//                                 <span className="font-semibold text-slate-700">{filteredParcels.length}</span> total parcels
//                             </span>
//                             <div className="flex gap-1">
//                                 <button className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1" disabled={true}>
//                                     <i className="fas fa-chevron-left text-xs"></i> Prev
//                                 </button>
//                                 <button className="px-3 py-1.5 text-xs bg-pink-50 border border-pink-200 rounded-lg text-pink-600 font-medium">1</button>
//                                 <button className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1" disabled={true}>
//                                     Next <i className="fas fa-chevron-right text-xs"></i>
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}

//             ADD ITEM MODAL - CO
//             {showAddModal && (
//                 <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
//                     onClick={() => setShowAddModal(false)}>
//                     <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
//                         onClick={e => e.stopPropagation()}>

//                         <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
//                             <div>
//                                 <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
//                                     <span className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
//                                         <i className="fas fa-box text-sm"></i>
//                                     </span>
//                                     Add Inventory Item
//                                 </h3>
//                                 <p className="text-xs text-slate-500 mt-0.5">Add a new item to the warehouse inventory</p>
//                             </div>
//                             <button onClick={() => setShowAddModal(false)}
//                                 className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center">
//                                 <i className="fas fa-times text-sm"></i>
//                             </button>
//                         </div>

//                         <form onSubmit={saveInventoryItem} className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Item Code <span className="text-pink-500">*</span>
//                                     </label>
//                                     <input
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="e.g., TAPE-001"
//                                         value={addItemForm.item_code}
//                                         onChange={(e) => setAddItemForm({ ...addItemForm, item_code: e.target.value })}
//                                         required
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Item Name <span className="text-pink-500">*</span>
//                                     </label>
//                                     <input
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="e.g., Packing Tape"
//                                         value={addItemForm.item_name}
//                                         onChange={(e) => setAddItemForm({ ...addItemForm, item_name: sanitizeText(e.target.value) })}
//                                         required
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Category <span className="text-pink-500">*</span>
//                                     </label>
//                                     <select
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         value={addItemForm.category}
//                                         onChange={(e) => setAddItemForm({ ...addItemForm, category: e.target.value })}
//                                         required
//                                     >
//                                         <option value="Packaging Materials">Packaging Materials</option>
//                                         <option value="Warehouse Supplies">Warehouse Supplies</option>
//                                         <option value="Equipment">Equipment</option>
//                                         <option value="Warehouse Equipment">Warehouse Equipment</option>
//                                         <option value="Cleaning Supplies">Cleaning Supplies</option>
//                                         <option value="Office Supplies">Office Supplies</option>
//                                         <option value="Other">Other</option>
//                                     </select>
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Unit <span className="text-pink-500">*</span>
//                                     </label>
//                                     <input
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="e.g., rolls, pieces, units"
//                                         value={addItemForm.unit}
//                                         onChange={(e) => setAddItemForm({ ...addItemForm, unit: e.target.value })}
//                                         required
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Current Stock <span className="text-pink-500">*</span>
//                                     </label>
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="0"
//                                         value={addItemForm.current_stock}
//                                         onChange={(e) => setAddItemForm({ ...addItemForm, current_stock: parseInt(e.target.value) || 0 })}
//                                         required
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Minimum Stock <span className="text-pink-500">*</span>
//                                     </label>
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="10"
//                                         value={addItemForm.minimum_stock}
//                                         onChange={(e) => setAddItemForm({ ...addItemForm, minimum_stock: parseInt(e.target.value) || 0 })}
//                                         required
//                                     />
//                                 </div>

//                                 <div className="md:col-span-2">
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Storage Location
//                                     </label>
//                                     <input
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="e.g., Aisle 3, Shelf B"
//                                         value={addItemForm.storage_location}
//                                         onChange={(e) => setAddItemForm({ ...addItemForm, storage_location: e.target.value })}
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Supplier
//                                     </label>
//                                     <select
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         value={addItemForm.supplier}
//                                         onChange={(e) => setAddItemForm({ ...addItemForm, supplier: e.target.value })}
//                                     >
//                                         <option value="">Select supplier</option>
//                                         {suppliers.map((s) => (
//                                             <option key={s.id} value={s.name}>{s.name}</option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Purchase Price
//                                     </label>
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         step="0.01"
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="0.00"
//                                         value={addItemForm.purchase_price}
//                                         onChange={(e) => setAddItemForm({ ...addItemForm, purchase_price: parseFloat(e.target.value) || 0 })}
//                                     />
//                                 </div>

//                                 <div className="md:col-span-2">
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Description
//                                     </label>
//                                     <textarea
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         rows={2}
//                                         placeholder="Brief description of the item"
//                                         value={addItemForm.description}
//                                         onChange={(e) => setAddItemForm({ ...addItemForm, description: e.target.value })}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
//                                 <button type="button" onClick={() => setShowAddModal(false)}
//                                     className="px-5 py-2.5 text-sm font-medium bg-transparent border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]">
//                                     Cancel
//                                 </button>
//                                 <button type="submit" disabled={saving}
//                                     className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white rounded-xl transition-all shadow-md shadow-pink-500/25 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
//                                     {saving ? (
//                                         <><i className="fas fa-spinner fa-spin w-4 h-4"></i> Saving...</>
//                                     ) : (
//                                         <><i className="fas fa-save w-4 h-4"></i> Save Item</>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             EDIT ITEM
//             {showEditModal && editingItem && (
//                 <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
//                     onClick={() => setShowEditModal(false)}>
//                     <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
//                         onClick={e => e.stopPropagation()}>

//                         <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
//                             <div>
//                                 <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
//                                     <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
//                                         <i className="fas fa-edit text-sm"></i>
//                                     </span>
//                                     Edit Inventory Item
//                                 </h3>
//                                 <p className="text-xs text-slate-500 mt-0.5">Update item details</p>
//                             </div>
//                             <button onClick={() => setShowEditModal(false)}
//                                 className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center">
//                                 <i className="fas fa-times text-sm"></i>
//                             </button>
//                         </div>

//                         <form onSubmit={updateInventoryItem} className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Item Code <span className="text-pink-500">*</span>
//                                     </label>
//                                     <input
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="e.g., TAPE-001"
//                                         value={editItemForm.item_code}
//                                         onChange={(e) => setEditItemForm({ ...editItemForm, item_code: e.target.value })}
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Item Name <span className="text-pink-500">*</span>
//                                     </label>
//                                     <input
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="e.g., Packing Tape"
//                                         value={editItemForm.item_name}
//                                         onChange={(e) => setEditItemForm({ ...editItemForm, item_name: e.target.value })}
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Category <span className="text-pink-500">*</span>
//                                     </label>
//                                     <select
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         value={editItemForm.category}
//                                         onChange={(e) => setEditItemForm({ ...editItemForm, category: e.target.value })}
//                                         required
//                                     >
//                                         <option value="Packaging Materials">Packaging Materials</option>
//                                         <option value="Warehouse Supplies">Warehouse Supplies</option>
//                                         <option value="Equipment">Equipment</option>
//                                         <option value="Warehouse Equipment">Warehouse Equipment</option>
//                                         <option value="Cleaning Supplies">Cleaning Supplies</option>
//                                         <option value="Office Supplies">Office Supplies</option>
//                                         <option value="Other">Other</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Unit <span className="text-pink-500">*</span>
//                                     </label>
//                                     <input
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="e.g., rolls, pieces, units"
//                                         value={editItemForm.unit}
//                                         onChange={(e) => setEditItemForm({ ...editItemForm, unit: e.target.value })}
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Current Stock <span className="text-pink-500">*</span>
//                                     </label>
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="0"
//                                         value={editItemForm.current_stock}
//                                         onChange={(e) => setEditItemForm({ ...editItemForm, current_stock: parseInt(e.target.value) || 0 })}
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Minimum Stock <span className="text-pink-500">*</span>
//                                     </label>
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="10"
//                                         value={editItemForm.minimum_stock}
//                                         onChange={(e) => setEditItemForm({ ...editItemForm, minimum_stock: parseInt(e.target.value) || 0 })}
//                                         required
//                                     />
//                                 </div>
//                                 <div className="md:col-span-2">
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Storage Location
//                                     </label>
//                                     <input
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="e.g., Aisle 3, Shelf B"
//                                         value={editItemForm.storage_location}
//                                         onChange={(e) => setEditItemForm({ ...editItemForm, storage_location: e.target.value })}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Supplier
//                                     </label>
//                                     <select
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         value={editItemForm.supplier}
//                                         onChange={(e) => setEditItemForm({ ...editItemForm, supplier: e.target.value })}
//                                     >
//                                         <option value="">Select supplier</option>
//                                         {suppliers.map((s) => (
//                                             <option key={s.id} value={s.name}>{s.name}</option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Purchase Price
//                                     </label>
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         step="0.01"
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         placeholder="0.00"
//                                         value={editItemForm.purchase_price}
//                                         onChange={(e) => setEditItemForm({ ...editItemForm, purchase_price: parseFloat(e.target.value) || 0 })}
//                                     />
//                                 </div>
//                                 <div className="md:col-span-2">
//                                     <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                         Description
//                                     </label>
//                                     <textarea
//                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                         rows={2}
//                                         placeholder="Brief description of the item"
//                                         value={editItemForm.description}
//                                         onChange={(e) => setEditItemForm({ ...editItemForm, description: e.target.value })}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
//                                 <button type="button" onClick={() => setShowEditModal(false)}
//                                     className="px-5 py-2.5 text-sm font-medium bg-transparent border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]">
//                                     Cancel
//                                 </button>
//                                 <button type="submit" disabled={saving}
//                                     className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all shadow-md shadow-blue-500/25 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
//                                     {saving ? (
//                                         <><i className="fas fa-spinner fa-spin w-4 h-4"></i> Updating...</>
//                                     ) : (
//                                         <><i className="fas fa-save w-4 h-4"></i> Update Item</>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             STOCK IN
//             {showStockInModal && (
//                 <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
//                     onClick={() => setShowStockInModal(false)}>
//                     <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
//                         onClick={e => e.stopPropagation()}>
//                         <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
//                             <div>
//                                 <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
//                                     <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
//                                         <i className="fas fa-arrow-down text-sm"></i>
//                                     </span>
//                                     Stock In
//                                 </h3>
//                                 <p className="text-xs text-slate-500 mt-0.5">Add stock to inventory item</p>
//                             </div>
//                             <button onClick={() => setShowStockInModal(false)}
//                                 className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center">
//                                 <i className="fas fa-times text-sm"></i>
//                             </button>
//                         </div>
//                         <form onSubmit={handleStockIn} className="space-y-4">
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Item <span className="text-pink-500">*</span>
//                                 </label>
//                                 <input type="text" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 cursor-not-allowed"
//                                     value={stockInForm.item} readOnly disabled />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Current Stock
//                                 </label>
//                                 <div className="flex items-center gap-3">
//                                     <input type="text" className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 cursor-not-allowed"
//                                         value={(() => {
//                                             const item = inventoryItems.find(i => i.item_name === stockInForm.item);
//                                             return item ? `${item.current_stock} ${item.unit}` : '0';
//                                         })()} readOnly disabled />
//                                     <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${(() => {
//                                         const item = inventoryItems.find(i => i.item_name === stockInForm.item);
//                                         if (!item) return 'bg-slate-100 text-slate-600';
//                                         if (item.current_stock <= 0) return 'bg-red-100 text-red-700';
//                                         if (item.current_stock < item.minimum_stock) return 'bg-amber-100 text-amber-700';
//                                         return 'bg-emerald-100 text-emerald-700';
//                                     })()}`}>
//                                         {(() => {
//                                             const item = inventoryItems.find(i => i.item_name === stockInForm.item);
//                                             if (!item) return 'Unknown';
//                                             if (item.current_stock <= 0) return 'Out of Stock';
//                                             if (item.current_stock < item.minimum_stock) return 'Low Stock';
//                                             return 'Available';
//                                         })()}
//                                     </span>
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Quantity to Add <span className="text-pink-500">*</span>
//                                 </label>
//                                 <input type="number" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                     placeholder="Enter quantity" value={stockInForm.quantity || ''}
//                                     onChange={(e) => setStockInForm({ ...stockInForm, quantity: parseInt(e.target.value) || 0 })} required />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     New Total <span className="text-slate-400">(auto-calculated)</span>
//                                 </label>
//                                 <div className="flex items-center gap-3">
//                                     <input type="text" className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 cursor-not-allowed font-semibold"
//                                         value={(() => {
//                                             const item = inventoryItems.find(i => i.item_name === stockInForm.item);
//                                             if (!item) return '0';
//                                             const newTotal = item.current_stock + (stockInForm.quantity || 0);
//                                             return `${newTotal} ${item.unit}`;
//                                         })()} readOnly disabled />
//                                     <span className="text-xs text-slate-400"><i className="fas fa-calculator"></i></span>
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Supplier <span className="text-slate-400">(optional)</span>
//                                 </label>
//                                 <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                     placeholder="Supplier name" value={stockInForm.supplier}
//                                     onChange={(e) => setStockInForm({ ...stockInForm, supplier: e.target.value })} />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Reference Number <span className="text-slate-400">(optional)</span>
//                                 </label>
//                                 <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                     placeholder="e.g., PO-2026-001" value={stockInForm.reference}
//                                     onChange={(e) => setStockInForm({ ...stockInForm, reference: e.target.value })} />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Remarks <span className="text-slate-400">(optional)</span>
//                                 </label>
//                                 <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                     rows={2} placeholder="Additional notes" value={stockInForm.remarks}
//                                     onChange={(e) => setStockInForm({ ...stockInForm, remarks: e.target.value })} />
//                             </div>
//                             <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
//                                 <button type="button" onClick={() => setShowStockInModal(false)}
//                                     className="px-5 py-2.5 text-sm font-medium bg-transparent border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]">
//                                     Cancel
//                                 </button>
//                                 <button type="submit" disabled={stockInSaving}
//                                     className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl transition-all shadow-md shadow-emerald-500/25 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
//                                     {stockInSaving ? <><i className="fas fa-spinner fa-spin w-4 h-4"></i> Adding...</> : <><i className="fas fa-check w-4 h-4"></i> Add Stock</>}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             STOCK OUT
//             {showStockOutModal && (
//                 <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
//                     onClick={() => setShowStockOutModal(false)}>
//                     <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
//                         onClick={e => e.stopPropagation()}>
//                         <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
//                             <div>
//                                 <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
//                                     <span className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
//                                         <i className="fas fa-arrow-up text-sm"></i>
//                                     </span>
//                                     Stock Out
//                                 </h3>
//                                 <p className="text-xs text-slate-500 mt-0.5">Reduce stock from inventory item</p>
//                             </div>
//                             <button onClick={() => setShowStockOutModal(false)}
//                                 className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center">
//                                 <i className="fas fa-times text-sm"></i>
//                             </button>
//                         </div>
//                         <form onSubmit={handleStockOut} className="space-y-4">
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Item <span className="text-pink-500">*</span>
//                                 </label>
//                                 <input type="text" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 cursor-not-allowed"
//                                     value={stockOutForm.item} readOnly disabled />
//                             </div>
//                             <div>
//                                 Out of Stock
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Quantity to Remove <span className="text-pink-500">*</span>
//                                 </label>
//                                 <input type="number" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                     placeholder="Enter quantity" value={stockOutForm.quantity || ''}
//                                     onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: parseInt(e.target.value) || 0 })} required />
//                                 <p className="mt-1 text-xs text-slate-400">
//                                     <i className="fas fa-info-circle mr-1"></i>
//                                     Available: {(() => {
//                                         const item = inventoryItems.find(i => i.item_name === stockOutForm.item);
//                                         return item ? `${item.current_stock} ${item.unit}` : '0';
//                                     })()}
//                                 </p>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     New Total <span className="text-slate-400">(auto-calculated)</span>
//                                 </label>
//                                 <div className="flex items-center gap-3">
//                                     <input type="text" className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 cursor-not-allowed font-semibold"
//                                         value={(() => {
//                                             const item = inventoryItems.find(i => i.item_name === stockOutForm.item);
//                                             if (!item) return '0';
//                                             const newTotal = item.current_stock - (stockOutForm.quantity || 0);
//                                             return `${Math.max(0, newTotal)} ${item.unit}`;
//                                         })()} readOnly disabled />
//                                     <span className="text-xs text-slate-400"><i className="fas fa-calculator"></i></span>
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Department/User <span className="text-slate-400">(optional)</span>
//                                 </label>
//                                 <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                     placeholder="e.g., Warehouse Staff" value={stockOutForm.department}
//                                     onChange={(e) => setStockOutForm({ ...stockOutForm, department: e.target.value })} />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Purpose <span className="text-slate-400">(optional)</span>
//                                 </label>
//                                 <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                     placeholder="e.g., Packing operations" value={stockOutForm.purpose}
//                                     onChange={(e) => setStockOutForm({ ...stockOutForm, purpose: e.target.value })} />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Remarks <span className="text-slate-400">(optional)</span>
//                                 </label>
//                                 <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
//                                     rows={2} placeholder="Additional notes" value={stockOutForm.remarks}
//                                     onChange={(e) => setStockOutForm({ ...stockOutForm, remarks: e.target.value })} />
//                             </div>
//                             <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
//                                 <button type="button" onClick={() => setShowStockOutModal(false)}
//                                     className="px-5 py-2.5 text-sm font-medium bg-transparent border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]">
//                                     Cancel
//                                 </button>
//                                 <button type="submit" disabled={stockOutSaving}
//                                     className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl transition-all shadow-md shadow-orange-500/25 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
//                                     {stockOutSaving ? <><i className="fas fa-spinner fa-spin w-4 h-4"></i> Removing...</> : <><i className="fas fa-check w-4 h-4"></i> Remove Stock</>}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             PURCHASE REQUEST
//             {showPurchaseRequestModal && (
//                 <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowPurchaseRequestModal(false)}>
//                     <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-semibold text-slate-900">Create Purchase Request</h3>
//                             <button onClick={() => setShowPurchaseRequestModal(false)} className="text-slate-400 hover:text-slate-600">
//                                 <i className="fas fa-times"></i>
//                             </button>
//                         </div>
//                         <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); showToast("Purchase request submitted!", "success"); setShowPurchaseRequestModal(false); }}>
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Requested By *</label>
//                                 <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
//                                     placeholder="Your name" value={purchaseRequestForm.requested_by}
//                                     onChange={(e) => setPurchaseRequestForm({ ...purchaseRequestForm, requested_by: e.target.value })} required />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
//                                 <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
//                                     value={purchaseRequestForm.supplier} onChange={(e) => setPurchaseRequestForm({ ...purchaseRequestForm, supplier: e.target.value })} required>
//                                     {suppliers.map((s) => (
//                                         <option key={s.id} value={s.name}>{s.name}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Items *</label>
//                                 <div className="space-y-2">
//                                     {purchaseRequestForm.items.map((item, index) => (
//                                         <div key={index} className="flex gap-2">
//                                             <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
//                                                 placeholder="Item name" value={item.name}
//                                                 onChange={(e) => {
//                                                     const newItems = [...purchaseRequestForm.items];
//                                                     newItems[index] = { ...newItems[index], name: e.target.value };
//                                                     setPurchaseRequestForm({ ...purchaseRequestForm, items: newItems });
//                                                 }} required />
//                                             <input type="number" className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
//                                                 placeholder="Qty" value={item.quantity}
//                                                 onChange={(e) => {
//                                                     const newItems = [...purchaseRequestForm.items];
//                                                     newItems[index] = { ...newItems[index], quantity: parseInt(e.target.value) || 0 };
//                                                     setPurchaseRequestForm({ ...purchaseRequestForm, items: newItems });
//                                                 }} required />
//                                             <button type="button" className="px-2 text-red-500 hover:text-red-700 transition-colors"
//                                                 onClick={() => {
//                                                     const newItems = purchaseRequestForm.items.filter((_, i) => i !== index);
//                                                     setPurchaseRequestForm({ ...purchaseRequestForm, items: newItems });
//                                                 }}>
//                                                 <i className="fas fa-times"></i>
//                                             </button>
//                                         </div>
//                                     ))}
//                                     <button type="button" className="text-sm text-pink-500 hover:text-pink-600 transition-colors"
//                                         onClick={() => setPurchaseRequestForm({ ...purchaseRequestForm, items: [...purchaseRequestForm.items, { name: '', quantity: 0 }] })}>
//                                         <i className="fas fa-plus mr-1"></i> Add Item
//                                     </button>
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
//                                 <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
//                                     rows={2} placeholder="Reason for purchase request" value={purchaseRequestForm.reason}
//                                     onChange={(e) => setPurchaseRequestForm({ ...purchaseRequestForm, reason: e.target.value })} required />
//                             </div>
//                             <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
//                                 <button type="button" onClick={() => setShowPurchaseRequestModal(false)}
//                                     className="px-4 py-2 text-sm font-medium bg-transparent border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
//                                     Cancel
//                                 </button>
//                                 <button type="submit" className="px-4 py-2 text-sm font-medium bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all flex items-center gap-1.5">
//                                     <i className="fas fa-paper-plane w-4 h-4"></i> Submit Request
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }