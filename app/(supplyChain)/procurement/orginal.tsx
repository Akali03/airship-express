// "use client";

// // ============================================================
// // 1. IMPORTS
// // ============================================================
// import { useEffect, useRef, useState, useCallback } from "react";
// import Chart from "chart.js/auto";
// import { supabase } from "../lib/services/client/supabase";
// import { toast } from "sonner";
// import { useDebounce } from "@/app/(supplyChain)/hooks/useDebounce";
// import { useConfirm } from "@/app/(supplyChain)/components/ui/ConfirmModal";
// import { sanitizeText, sanitizeNumber } from "../components/global/sanitize";
// import { PageSkeleton } from "../components/ui/SkeletonLoader";
// import { Pagination } from "../components/global/pagination";
// import Loader from "../components/global/Loader";

// // ============================================================
// // 2. TYPES & INTERFACES
// // ============================================================
// interface Supplier {
//     id: string;
//     name: string;
//     category: string;
//     contact_person: string;
//     phone: string;
//     email: string;
//     location: string;
//     products: string | null;
//     notes: string | null;
//     is_active: boolean;
// }

// interface PurchaseRequestItem {
//     name: string;
//     quantity: number;
// }

// interface PurchaseRequest {
//     id: string;
//     request_number: string;
//     type: string;
//     description: string;
//     requested_by: string;
//     department: string;
//     supplier_id: string;
//     supplier_name: string;
//     amount: number;
//     priority: string;
//     date: string;
//     status: string;
//     items: PurchaseRequestItem[];
//     reason: string;
//     created_at?: string;
//     updated_at?: string;
// }

// interface PurchaseOrder {
//     id: string;
//     po_number: string;
//     request_id: string;
//     supplier_id: string;
//     supplier_name: string;
//     total_amount: number;
//     status: string;
//     delivery_date: string;
//     notes: string;
//     items: any[];
//     created_at?: string;
//     updated_at?: string;
// }

// interface PurchaseRequestModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     suppliers: Supplier[];
//     role: string;
//     onRequestSubmitted?: (request: any) => void;
//     editData?: any;
//     isEdit?: boolean;
// }

// interface PurchaseOrderModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     request: PurchaseRequest | null;
//     suppliers: Supplier[];
//     onOrderCreated?: (order: any) => void;
// }

// // ============================================================
// // 3. UTILITY FUNCTIONS (Client-side)
// // ============================================================
// const formatDate = (dateString: string) => {
//     if (!dateString) return '';
//     return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//     });
// };

// const formatCurrency = (amount: number) => {
//     return `₱${amount.toLocaleString()}`;
// };

// const getPriorityColor = (priority: string) => {
//     switch (priority) {
//         case 'Critical': return 'bg-red-100 text-red-700';
//         case 'Urgent': return 'bg-amber-100 text-amber-700';
//         default: return 'bg-blue-100 text-blue-700';
//     }
// };

// const getStatusColor = (status: string) => {
//     switch (status) {
//         case 'Pending': return 'bg-amber-50 text-amber-700';
//         case 'Approved': return 'bg-emerald-50 text-emerald-700';
//         case 'Rejected': return 'bg-red-50 text-red-700';
//         case 'Completed': return 'bg-blue-50 text-blue-700';
//         default: return 'bg-slate-50 text-slate-700';
//     }
// };

// const getPOStatusColor = (status: string) => {
//     switch (status) {
//         case 'Draft': return 'bg-slate-100 text-slate-600';
//         case 'Sent': return 'bg-blue-100 text-blue-600';
//         case 'Confirmed': return 'bg-emerald-100 text-emerald-600';
//         case 'Delivered': return 'bg-pink-100 text-pink-600';
//         default: return 'bg-red-100 text-red-600';
//     }
// };

// // ============================================================
// // 4. PURCHASE REQUEST MODAL COMPONENT (Client-side)
// // ============================================================
// export function PurchaseRequestModal({
//     isOpen,
//     onClose,
//     suppliers,
//     role,
//     onRequestSubmitted,
//     editData,
//     isEdit = false,
// }: PurchaseRequestModalProps) {
//     const defaultFormState = {
//         requested_by: "",
//         supplier_id: "",
//         items: [{ name: "", quantity: 1 }] as PurchaseRequestItem[],
//         reason: "",
//         department: "Fleet",
//         priority: "Normal",
//         amount: 0,
//     };

//     const [formData, setFormData] = useState(defaultFormState);
//     const [submitting, setSubmitting] = useState(false);

//     // Sync state with editData or reset back to default on open/toggle
//     useEffect(() => {
//         if (isOpen) {
//             if (isEdit && editData) {
//                 setFormData({
//                     requested_by: editData.requested_by || "",
//                     supplier_id: editData.supplier_id || "",
//                     items: editData.items?.length ? editData.items : [{ name: "", quantity: 1 }],
//                     reason: editData.reason || "",
//                     department: editData.department || "Fleet",
//                     priority: editData.priority || "Normal",
//                     amount: editData.amount || 0,
//                 });
//             } else {
//                 setFormData(defaultFormState);
//             }
//         }
//     }, [isOpen, editData, isEdit]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (submitting) return;

//         const sanitizedRequestedBy = sanitizeText(formData.requested_by);
//         const sanitizedReason = sanitizeText(formData.reason);

//         if (!sanitizedRequestedBy || !formData.supplier_id || !sanitizedReason) {
//             toast.warning("Please fill in all required fields");
//             return;
//         }

//         const hasEmptyItem = formData.items.some(
//             (item: PurchaseRequestItem) => !sanitizeText(item.name) || sanitizeNumber(item.quantity) <= 0
//         );
//         if (hasEmptyItem) {
//             toast.warning("Please fill in all item names and valid quantities");
//             return;
//         }

//         const selectedSupplier = suppliers.find((s: Supplier) => Number(s.id) === Number(formData.supplier_id));
//         if (!selectedSupplier) {
//             toast.warning("Please select a valid supplier");
//             return;
//         }

//         const sanitizedItems = formData.items.map((item: PurchaseRequestItem) => ({
//             name: sanitizeText(item.name),
//             quantity: sanitizeNumber(item.quantity),
//         }));

//         const requestData = {
//             id: isEdit ? editData?.id : undefined,
//             request_number: isEdit ? editData?.request_number : undefined,
//             type: isEdit ? editData?.type : "New Request",
//             description: sanitizedItems.map((i) => `${i.name} (${i.quantity})`).join(", "),
//             requested_by: sanitizedRequestedBy,
//             department: formData.department,
//             supplier_id: formData.supplier_id,
//             supplier_name: selectedSupplier.name,
//             amount: formData.amount || 0,
//             priority: formData.priority,
//             date: isEdit ? editData?.date : new Date().toISOString().split("T")[0],
//             status: isEdit ? editData?.status : "Pending",
//             items: sanitizedItems,
//             reason: sanitizedReason,
//         };

//         try {
//             setSubmitting(true);
//             if (onRequestSubmitted) {
//                 await onRequestSubmitted(requestData);
//             }
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const addItem = () => {
//         setFormData((prev) => ({
//             ...prev,
//             items: [...prev.items, { name: "", quantity: 1 }],
//         }));
//     };

//     const removeItem = (index: number) => {
//         if (formData.items.length === 1) {
//             toast.warning("At least one item is required");
//             return;
//         }
//         setFormData((prev) => ({
//             ...prev,
//             items: prev.items.filter((_, i) => i !== index),
//         }));
//     };

//     const updateItem = (index: number, field: keyof PurchaseRequestItem, value: string | number) => {
//         setFormData((prev) => {
//             const updatedItems = [...prev.items];
//             if (field === "name") {
//                 updatedItems[index] = { ...updatedItems[index], name: sanitizeText(value as string) };
//             } else if (field === "quantity") {
//                 updatedItems[index] = { ...updatedItems[index], quantity: sanitizeNumber(value as number) };
//             }
//             return { ...prev, items: updatedItems };
//         });
//     };

//     if (!isOpen) return null;

//     return (
//         <div
//             className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
//             onClick={onClose}
//         >
//             <div
//                 className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
//                     <div className="flex items-center gap-3">
//                         <span className="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                             </svg>
//                         </span>
//                         <div>
//                             <h3 className="text-base font-bold text-slate-900">
//                                 {isEdit ? "Edit Purchase Request" : "Create Purchase Request"}
//                             </h3>
//                             <p className="text-xs text-slate-500">
//                                 {isEdit ? `Editing request #${editData?.request_number || editData?.id}` : "Request new inventory items from suppliers"}
//                             </p>
//                         </div>
//                     </div>
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center"
//                     >
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                     </button>
//                 </div>

//                 {/* Form */}
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     {/* Requested By */}
//                     <div>
//                         <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
//                             Requested By <span className="text-pink-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
//                             placeholder="Your full name"
//                             value={formData.requested_by}
//                             onChange={(e) => setFormData({ ...formData, requested_by: e.target.value })}
//                             required
//                             maxLength={150}
//                         />
//                     </div>

//                     {/* Supplier */}
//                     <div>
//                         <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
//                             Supplier <span className="text-pink-500">*</span>
//                         </label>
//                         <select
//                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
//                             value={formData.supplier_id}
//                             onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
//                             required
//                         >
//                             <option value="">Select a supplier...</option>
//                             {suppliers.map((s: Supplier) => (
//                                 <option key={s.id} value={s.id}>
//                                     {s.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* Department & Priority Grid */}
//                     <div className="grid grid-cols-2 gap-3">
//                         <div>
//                             <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
//                                 Department
//                             </label>
//                             <select
//                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
//                                 value={formData.department}
//                                 onChange={(e) => setFormData({ ...formData, department: e.target.value })}
//                             >
//                                 <option value="Fleet">Fleet</option>
//                                 <option value="Warehouse">Warehouse</option>
//                                 <option value="Operations">Operations</option>
//                                 <option value="Office">Office</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
//                                 Priority
//                             </label>
//                             <select
//                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
//                                 value={formData.priority}
//                                 onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
//                             >
//                                 <option value="Normal">Normal</option>
//                                 <option value="Urgent">Urgent</option>
//                                 <option value="Critical">Critical</option>
//                             </select>
//                         </div>
//                     </div>

//                     {/* Amount */}
//                     <div>
//                         <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
//                             Estimated Amount (₱)
//                         </label>
//                         <input
//                             type="number"
//                             step="0.01"
//                             min="0"
//                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
//                             placeholder="0.00"
//                             value={formData.amount || ""}
//                             onChange={(e) =>
//                                 setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
//                             }
//                         />
//                     </div>

//                     {/* Items Section */}
//                     <div>
//                         <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
//                             Items List <span className="text-pink-500">*</span>
//                         </label>
//                         <div className="space-y-2">
//                             {formData.items.map((item: PurchaseRequestItem, index: number) => (
//                                 <div key={index} className="flex items-center gap-2">
//                                     <input
//                                         type="text"
//                                         className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
//                                         placeholder="Item name"
//                                         value={item.name}
//                                         onChange={(e) => updateItem(index, "name", e.target.value)}
//                                         required
//                                         maxLength={100}
//                                     />
//                                     <input
//                                         type="number"
//                                         min="1"
//                                         className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none text-center"
//                                         placeholder="Qty"
//                                         value={item.quantity || ""}
//                                         onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
//                                         required
//                                     />
//                                     <button
//                                         type="button"
//                                         className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
//                                         onClick={() => removeItem(index)}
//                                         title="Remove item"
//                                     >
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                         </svg>
//                                     </button>
//                                 </div>
//                             ))}

//                             <button
//                                 type="button"
//                                 className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors pt-1"
//                                 onClick={addItem}
//                             >
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//                                 </svg>
//                                 Add another item
//                             </button>
//                         </div>
//                     </div>

//                     {/* Reason */}
//                     <div>
//                         <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
//                             Reason <span className="text-pink-500">*</span>
//                         </label>
//                         <textarea
//                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none resize-none"
//                             rows={3}
//                             placeholder="Provide a brief reason for this request..."
//                             value={formData.reason}
//                             onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
//                             required
//                             maxLength={500}
//                         />
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             disabled={submitting}
//                             className="px-4 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={submitting}
//                             className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white rounded-xl transition-all shadow-md shadow-pink-500/20 active:scale-[0.98] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
//                         >
//                             {submitting ? (
//                                 <>
//                                     <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                     <span>Submitting...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//                                     </svg>
//                                     <span>{isEdit ? "Update Request" : "Submit Request"}</span>
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// // ============================================================
// // 5. PURCHASE ORDER MODAL COMPONENT (Client-side)
// // ============================================================
// function PurchaseOrderModal({
//     isOpen,
//     onClose,
//     request,
//     suppliers,
//     onOrderCreated,
// }: PurchaseOrderModalProps) {
//     const [step, setStep] = useState<1 | 2>(1);
//     const [submitting, setSubmitting] = useState(false);
//     const [formData, setFormData] = useState({
//         delivery_date: "",
//         notes: "",
//         items: request?.items.map((item: PurchaseRequestItem) => ({
//             name: item.name,
//             quantity: item.quantity,
//             unit_price: 0,
//             total: 0,
//         })) || [],
//     });

//     useEffect(() => {
//         if (request) {
//             setFormData({
//                 delivery_date: "",
//                 notes: "",
//                 items: request.items.map((item: PurchaseRequestItem) => ({
//                     name: item.name,
//                     quantity: item.quantity,
//                     unit_price: 0,
//                     total: 0,
//                 })),
//             });
//             setStep(1);
//         }
//     }, [request]);

//     const updateItem = (index: number, field: string, value: number) => {
//         const newItems = [...formData.items];
//         if (field === "unit_price") {
//             newItems[index] = {
//                 ...newItems[index],
//                 unit_price: value,
//                 total: value * newItems[index].quantity,
//             };
//         }
//         setFormData({ ...formData, items: newItems });
//     };

//     const totalAmount = formData.items.reduce((sum, item) => sum + item.total, 0);
//     const poNumber = `PO-${Date.now().toString().slice(-6)}`;

//     const handleNext = () => {
//         const hasEmptyPrice = formData.items.some((item) => item.unit_price <= 0);
//         if (hasEmptyPrice) {
//             toast.warning("Please set a unit price for all items");
//             return;
//         }
//         setStep(2);
//     };

//     const handleBack = () => {
//         setStep(1);
//     };

//     const handleCopy = () => {
//         const text = `PO #: ${poNumber}\nSupplier: ${request?.supplier_name || ''}\nAmount: ₱${totalAmount.toLocaleString()}\nDelivery: ${formData.delivery_date || 'TBD'}\nNotes: ${formData.notes}`;
//         navigator.clipboard.writeText(text);
//         toast.success("Copied to clipboard!");
//     };

//     const handlePrint = () => {
//         window.print();
//     };

//     const handleEmail = () => {
//         const subject = `Purchase Order ${poNumber}`;
//         const body = `Dear ${request?.supplier_name || 'Supplier'},\n\nWe would like to place the following order:\n\n${formData.items.map(item => `${item.name} x ${item.quantity} @ ₱${item.unit_price} = ₱${item.total}`).join('\n')}\n\nTotal Amount: ₱${totalAmount.toLocaleString()}\nExpected Delivery: ${formData.delivery_date || 'TBD'}\n\nPlease confirm receipt of this order.\n\nBest regards,\nProcurement Team`;
//         window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
//     };

//     const handleMessenger = () => {
//         const message = `Dear ${request?.supplier_name || 'Supplier'},\n\nWe would like to place the following order:\n${formData.items.map(item => `${item.name} x ${item.quantity}`).join('\n')}\nTotal: ₱${totalAmount.toLocaleString()}\nDelivery: ${formData.delivery_date || 'TBD'}\nPO #: ${poNumber}\n\nPlease confirm. Thanks!`;
//         window.open(`https://m.me/?text=${encodeURIComponent(message)}`, "_blank");
//     };

//     const handleSubmit = async () => {
//         if (!request || submitting) return;

//         const orderData = {
//             po_number: poNumber,
//             request_id: request.id,
//             supplier_id: request.supplier_id,
//             supplier_name: request.supplier_name,
//             total_amount: totalAmount,
//             status: "Draft",
//             delivery_date: formData.delivery_date || new Date().toISOString().split("T")[0],
//             notes: formData.notes,
//             items: formData.items,
//         };

//         try {
//             setSubmitting(true);
//             if (onOrderCreated) {
//                 await onOrderCreated(orderData);
//             }
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     if (!isOpen || !request) return null;

//     return (
//         <div
//             className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
//             onClick={onClose}
//         >
//             <div
//                 className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
//                     <div>
//                         <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
//                             <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
//                                 <i className="fas fa-file-invoice text-sm"></i>
//                             </span>
//                             Create Purchase Order
//                         </h3>
//                         <p className="text-xs text-slate-500 mt-0.5">
//                             For request: <span className="font-mono font-semibold">{request.request_number}</span>
//                         </p>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center"
//                     >
//                         <i className="fas fa-times text-sm"></i>
//                     </button>
//                 </div>

//                 {step === 1 && (
//                     <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
//                         <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
//                             <div className="grid grid-cols-2 gap-4 text-sm">
//                                 <div>
//                                     <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier</span>
//                                     <p className="font-medium text-slate-900 mt-0.5">{request.supplier_name}</p>
//                                 </div>
//                                 <div>
//                                     <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Requested By</span>
//                                     <p className="font-medium text-slate-900 mt-0.5">{request.requested_by}</p>
//                                 </div>
//                                 <div>
//                                     <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</span>
//                                     <p className="font-medium text-slate-900 mt-0.5">{request.department}</p>
//                                 </div>
//                                 <div>
//                                     <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</span>
//                                     <p className="font-medium text-slate-900 mt-0.5">{request.priority}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                 Items & Pricing
//                             </label>
//                             <div className="space-y-2">
//                                 {formData.items.map((item, index) => (
//                                     <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
//                                         <div className="flex-1">
//                                             <span className="text-sm font-medium text-slate-900">{item.name}</span>
//                                             <span className="text-xs text-slate-400 ml-2">× {item.quantity}</span>
//                                         </div>
//                                         <div className="w-32">
//                                             <input
//                                                 type="number"
//                                                 min="0"
//                                                 step="0.01"
//                                                 className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
//                                                 placeholder="Unit price"
//                                                 value={item.unit_price || ""}
//                                                 onChange={(e) =>
//                                                     updateItem(index, "unit_price", parseFloat(e.target.value) || 0)
//                                                 }
//                                                 required
//                                             />
//                                         </div>
//                                         <div className="w-24 text-right">
//                                             <span className="text-sm font-semibold text-slate-900">
//                                                 ₱{item.total.toLocaleString()}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Delivery Date
//                                 </label>
//                                 <input
//                                     type="date"
//                                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
//                                     value={formData.delivery_date}
//                                     onChange={(e) =>
//                                         setFormData({
//                                             ...formData,
//                                             delivery_date: e.target.value,
//                                         })
//                                     }
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                     Total Amount
//                                 </label>
//                                 <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-bold">
//                                     ₱{totalAmount.toLocaleString()}
//                                 </div>
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
//                                 Notes
//                             </label>
//                             <textarea
//                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
//                                 rows={2}
//                                 placeholder="Additional notes for this purchase order"
//                                 value={formData.notes}
//                                 onChange={(e) =>
//                                     setFormData({
//                                         ...formData,
//                                         notes: e.target.value,
//                                     })
//                                 }
//                             />
//                         </div>

//                         <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
//                             <button
//                                 type="button"
//                                 onClick={onClose}
//                                 className="px-5 py-2.5 text-sm font-medium bg-transparent border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={handleNext}
//                                 className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl transition-all shadow-md shadow-emerald-500/25 active:scale-[0.98] flex items-center gap-2"
//                             >
//                                 Next <i className="fas fa-arrow-right w-4 h-4"></i>
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {step === 2 && (
//                     <div className="animate-in slide-in-from-right-4 duration-300">
//                         <div className="bg-gradient-to-r from-pink-50 to-pink-50 border border-pink-200 rounded-xl p-5 mb-5">
//                             <div className="flex items-center gap-2 text-pink-700 mb-3">
//                                 <i className="fas fa-robot text-lg"></i>
//                                 <span className="font-semibold">AI Recommendation - Message to Supplier</span>
//                             </div>
//                             <div className="bg-white rounded-lg p-4 border border-pink-100 text-sm text-slate-700 leading-relaxed">
//                                 <p className="font-medium text-pink-800 mb-2">Dear {request.supplier_name},</p>
//                                 <p className="mb-2">
//                                     We would like to place a purchase order for the following items:
//                                 </p>
//                                 <div className="bg-slate-50 rounded-lg p-3 my-3 font-mono text-xs">
//                                     {formData.items.map((item) =>
//                                         `${item.name} x ${item.quantity} @ ₱${item.unit_price} = ₱${item.total}`
//                                     ).join('\n')}
//                                 </div>
//                                 <p className="mb-1">
//                                     <strong>Total Amount:</strong> ₱{totalAmount.toLocaleString()}
//                                 </p>
//                                 <p className="mb-1">
//                                     <strong>Expected Delivery:</strong> {formData.delivery_date ? new Date(formData.delivery_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}
//                                 </p>
//                                 <p className="mb-3">
//                                     <strong>PO Number:</strong> {poNumber}
//                                 </p>
//                                 <p className="text-xs text-slate-500 italic">
//                                     * This is an auto-generated recommendation. Please review and confirm.
//                                 </p>
//                             </div>
//                             <div className="mt-3 flex items-center gap-2 text-xs text-pink-600">
//                                 <i className="fas fa-info-circle"></i>
//                                 <span>Recommended based on previous orders and current inventory levels</span>
//                             </div>
//                         </div>

//                         <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
//                             <h4 className="text-sm font-semibold text-slate-700 mb-2">PO Summary</h4>
//                             <div className="space-y-1 text-sm text-slate-600">
//                                 <p><span className="font-medium">PO #:</span> {poNumber}</p>
//                                 <p><span className="font-medium">Supplier:</span> {request.supplier_name}</p>
//                                 <p><span className="font-medium">Amount:</span> ₱{totalAmount.toLocaleString()}</p>
//                                 <p><span className="font-medium">Delivery:</span> {formData.delivery_date || 'TBD'}</p>
//                                 {formData.notes && <p><span className="font-medium">Notes:</span> {formData.notes}</p>}
//                             </div>
//                         </div>

//                         <div className="flex flex-wrap gap-2 justify-between pt-4 border-t border-slate-100">
//                             <button
//                                 type="button"
//                                 onClick={handleBack}
//                                 disabled={submitting}
//                                 className="px-4 py-2.5 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
//                             >
//                                 <i className="fas fa-arrow-left w-4 h-4"></i> Back
//                             </button>
//                             <div className="flex flex-wrap gap-2">
//                                 <button
//                                     type="button"
//                                     onClick={handleCopy}
//                                     className="px-4 py-2.5 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-2"
//                                 >
//                                     <i className="fas fa-copy w-4 h-4"></i> Copy
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={handlePrint}
//                                     className="px-4 py-2.5 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-2"
//                                 >
//                                     <i className="fas fa-print w-4 h-4"></i> Print PO
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={handleEmail}
//                                     className="px-4 py-2.5 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl transition-all flex items-center gap-2"
//                                 >
//                                     <i className="fas fa-envelope w-4 h-4"></i> Email
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={handleMessenger}
//                                     className="px-4 py-2.5 text-sm font-medium bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl transition-all flex items-center gap-2"
//                                 >
//                                     <i className="fab fa-facebook-messenger w-4 h-4"></i> Messenger
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={handleSubmit}
//                                     disabled={submitting}
//                                     className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl transition-all shadow-md shadow-emerald-500/25 active:scale-[0.98] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
//                                 >
//                                     {submitting ? (
//                                         <i className="fas fa-spinner fa-spin w-4 h-4"></i>
//                                     ) : (
//                                         <i className="fas fa-check w-4 h-4"></i>
//                                     )}
//                                     Create PO
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// // ============================================================
// // 6. TOOLTIP COMPONENT (Client-side)
// // ============================================================
// function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
//     const [show, setShow] = useState(false);

//     return (
//         <div className="relative inline-block">
//             <div
//                 onMouseEnter={() => setShow(true)}
//                 onMouseLeave={() => setShow(false)}
//                 className="cursor-help"
//             >
//                 {children}
//             </div>
//             {show && (
//                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-150">
//                     {content}
//                     <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
//                 </div>
//             )}
//         </div>
//     );
// }


// // ============================================================
// // 8. EMPTY STATE COMPONENT
// // ============================================================
// function EmptyState({
//     title,
//     description,
//     icon,
//     actionText,
//     onAction
// }: {
//     title: string;
//     description: string;
//     icon?: string;
//     actionText?: string;
//     onAction?: () => void;
// }) {
//     return (
//         <div className="flex flex-col items-center justify-center py-16 px-4">
//             <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
//                 <i className={`${icon || 'fas fa-inbox'} text-3xl`}></i>
//             </div>
//             <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
//             <p className="text-sm text-slate-400 text-center max-w-sm mb-6">{description}</p>
//             {actionText && onAction && (
//                 <button
//                     onClick={onAction}
//                     className="px-4 py-2 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
//                 >
//                     <i className="fas fa-plus text-xs"></i>
//                     {actionText}
//                 </button>
//             )}
//         </div>
//     );
// }

// // ============================================================
// // 9. MAIN PROCUREMENT COMPONENT (Client-side)
// // ============================================================
// export default function Procurement() {
//     const { confirm } = useConfirm();
//     const expenseChartCanvasRef = useRef<HTMLCanvasElement>(null);
//     const priorityChartCanvasRef = useRef<HTMLCanvasElement>(null);
//     const expenseChartInstanceRef = useRef<Chart | null>(null);
//     const priorityChartInstanceRef = useRef<Chart | null>(null);
//     const tableContainerRef = useRef<HTMLDivElement>(null);

//     const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");
//     const [isPurchaseRequestModalOpen, setIsPurchaseRequestModalOpen] = useState(false);
//     const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);
//     const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
//     const [editData, setEditData] = useState<any>(null);
//     const [isEditMode, setIsEditMode] = useState(false);

//     // `loading` now ONLY controls the very first, full-page load.
//     const [loading, setLoading] = useState(true);
//     // `isRefreshing` covers every subsequent fetch (pagination, tab switch,
//     // realtime updates, post-CRUD refresh) — the table stays mounted and we
//     // just show a small inline indicator instead of replacing the screen.
//     const [isRefreshing, setIsRefreshing] = useState(false);
//     const hasLoadedOnceRef = useRef(false);

//     // Tracks which row currently has an action in-flight so we can disable
//     // just that row's buttons instead of freezing the whole table.
//     const [pendingRowId, setPendingRowId] = useState<string | null>(null);

//     // ========== BULK SELECTION STATE ==========
//     const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
//     const [isSelectAll, setIsSelectAll] = useState(false);

//     const [requests, setRequests] = useState<PurchaseRequest[]>([]);
//     const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
//     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const debouncedSearch = useDebounce(searchTerm, 300);

//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage] = useState(10);
//     const [totalItems, setTotalItems] = useState(0);

//     // ========== TOTAL COUNTS STATE ==========
//     const [totalCounts, setTotalCounts] = useState<{ all: number; pending: number; approved: number }>({
//         all: 0,
//         pending: 0,
//         approved: 0
//     });

//     // ========== TAB TRANSITION STATE ==========
//     const [isTabTransitioning, setIsTabTransitioning] = useState(false);

//     const userRole = "admin";

//     // ============================================================
//     // 10. SCROLL TO TABLE FUNCTION (Client-side)
//     // ============================================================
//     const scrollToTable = () => {
//         if (tableContainerRef.current) {
//             const element = tableContainerRef.current;
//             const elementId = element.id;

//             const targetElement = document.getElementById(elementId);
//             if (targetElement) {
//                 const offset = 80;
//                 const elementPosition = targetElement.getBoundingClientRect().top;
//                 const offsetPosition = elementPosition + window.pageYOffset - offset;

//                 window.scrollTo({
//                     top: offsetPosition,
//                     behavior: 'smooth'
//                 });
//             }
//         }
//     };

//     // ============================================================
//     // 11. FETCH DATA (Client-side with Supabase)
//     // ============================================================
//     const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
//         const silent = opts?.silent ?? false;

//         try {
//             if (!silent) {
//                 if (!hasLoadedOnceRef.current) {
//                     setLoading(true);
//                 } else {
//                     setIsRefreshing(true);
//                     setIsTabTransitioning(true);
//                 }
//             }

//             const { data: suppliersData, error: suppliersError } = await supabase
//                 .from('suppliers')
//                 .select('*')
//                 .eq('is_active', true)
//                 .order('name');

//             if (suppliersError) throw suppliersError;
//             setSuppliers(suppliersData || []);

//             // ===== FIX: Get total count first to determine if pagination is valid =====
//             let countQuery = supabase
//                 .from('purchase_requests')
//                 .select('*', { count: 'exact', head: true });

//             if (debouncedSearch) {
//                 countQuery = countQuery.or(
//                     `request_number.ilike.%${debouncedSearch}%,` +
//                     `requested_by.ilike.%${debouncedSearch}%,` +
//                     `supplier_name.ilike.%${debouncedSearch}%,` +
//                     `description.ilike.%${debouncedSearch}%`
//                 );
//             }

//             if (activeTab === 'pending') {
//                 countQuery = countQuery.eq('status', 'Pending');
//             } else if (activeTab === 'approved') {
//                 countQuery = countQuery.in('status', ['Approved', 'Completed']);
//             }

//             const { count: totalCount, error: countError } = await countQuery;
//             if (countError) throw countError;

//             // If total count is 0 or less than offset, reset to page 1
//             const effectiveTotal = totalCount || 0;
//             const from = (currentPage - 1) * itemsPerPage;

//             // If we're beyond the total, reset to page 1
//             if (from >= effectiveTotal && effectiveTotal > 0) {
//                 setCurrentPage(1);
//                 // Re-fetch with page 1 (will be caught by dependency change)
//                 return;
//             }

//             let query = supabase
//                 .from('purchase_requests')
//                 .select('*', { count: 'exact' })
//                 .order('created_at', { ascending: false });

//             if (debouncedSearch) {
//                 query = query.or(
//                     `request_number.ilike.%${debouncedSearch}%,` +
//                     `requested_by.ilike.%${debouncedSearch}%,` +
//                     `supplier_name.ilike.%${debouncedSearch}%,` +
//                     `description.ilike.%${debouncedSearch}%`
//                 );
//             }

//             if (activeTab === 'pending') {
//                 query = query.eq('status', 'Pending');
//             } else if (activeTab === 'approved') {
//                 query = query.in('status', ['Approved', 'Completed']);
//             }

//             // Only apply range if there are items to fetch
//             if (effectiveTotal > 0 && from < effectiveTotal) {
//                 const to = Math.min(from + itemsPerPage - 1, effectiveTotal - 1);
//                 query = query.range(from, to);
//             }

//             const { data: requestsData, error: requestsError } = await query;

//             if (requestsError) {
//                 // If it's a 416 error and we have data, it might be a race condition
//                 if (requestsError.code === 'PGRST103') {
//                     // Refresh the page to get correct state
//                     setTimeout(() => fetchData({ silent: true }), 100);
//                     return;
//                 }
//                 throw requestsError;
//             }

//             setTotalItems(effectiveTotal);

//             const transformedRequests: PurchaseRequest[] = (requestsData || []).map((req: any) => ({
//                 id: req.id,
//                 request_number: req.request_number || '',
//                 type: req.type || '',
//                 description: req.description || '',
//                 requested_by: req.requested_by || '',
//                 department: req.department || '',
//                 supplier_id: req.supplier_id || '',
//                 supplier_name: req.supplier_name || '',
//                 amount: req.amount || 0,
//                 priority: req.priority || 'Normal',
//                 date: req.date || req.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
//                 status: req.status || 'Pending',
//                 items: req.items || [],
//                 reason: req.reason || '',
//                 created_at: req.created_at,
//                 updated_at: req.updated_at,
//             }));

//             setRequests(transformedRequests);

//             // Fetch purchase orders separately (no pagination needed here)
//             const { data: ordersData, error: ordersError } = await supabase
//                 .from('purchase_orders')
//                 .select('*')
//                 .order('created_at', { ascending: false });

//             if (ordersError) throw ordersError;
//             setPurchaseOrders(ordersData || []);

//             // Update counts after data fetch
//             await updateCounts();

//         } catch (error) {
//             console.error('Error fetching data:', error);
//             // Don't show toast for 416 errors as they're handled gracefully
//             if ((error as any)?.code !== 'PGRST103') {
//                 toast.error('Failed to load procurement data');
//             }
//         } finally {
//             hasLoadedOnceRef.current = true;
//             if (!silent) {
//                 setLoading(false);
//                 setIsRefreshing(false);
//                 // Add a small delay before hiding the tab transition state
//                 setTimeout(() => setIsTabTransitioning(false), 300);
//             }
//         }
//     }, [currentPage, itemsPerPage, debouncedSearch, activeTab]);

//     // ============================================================
//     // 12. UPDATE COUNTS FUNCTION
//     // ============================================================
//     const updateCounts = useCallback(async () => {
//         try {
//             const { count: allCount } = await supabase
//                 .from('purchase_requests')
//                 .select('*', { count: 'exact', head: true });

//             const { count: pendingCount } = await supabase
//                 .from('purchase_requests')
//                 .select('*', { count: 'exact', head: true })
//                 .eq('status', 'Pending');

//             const { count: approvedCount } = await supabase
//                 .from('purchase_requests')
//                 .select('*', { count: 'exact', head: true })
//                 .in('status', ['Approved', 'Completed']);

//             setTotalCounts({
//                 all: allCount || 0,
//                 pending: pendingCount || 0,
//                 approved: approvedCount || 0
//             });
//         } catch (error) {
//             console.error('Error updating counts:', error);
//         }
//     }, []);

//     // ============================================================
//     // 13. INITIAL LOAD + reload on page/tab/search change
//     // ============================================================
//     useEffect(() => {
//         fetchData();
//     }, [fetchData]);

//     // ============================================================
//     // 14. REALTIME SUBSCRIPTIONS (Client-side)
//     // ============================================================
//     useEffect(() => {
//         const requestsSubscription = supabase
//             .channel('purchase_requests_changes')
//             .on(
//                 'postgres_changes',
//                 { event: '*', schema: 'public', table: 'purchase_requests' },
//                 () => {
//                     fetchData({ silent: true });
//                 }
//             )
//             .subscribe();

//         const ordersSubscription = supabase
//             .channel('purchase_orders_changes')
//             .on(
//                 'postgres_changes',
//                 { event: '*', schema: 'public', table: 'purchase_orders' },
//                 () => {
//                     fetchData({ silent: true });
//                 }
//             )
//             .subscribe();

//         const suppliersSubscription = supabase
//             .channel('suppliers_changes')
//             .on(
//                 'postgres_changes',
//                 { event: '*', schema: 'public', table: 'suppliers' },
//                 () => {
//                     fetchData({ silent: true });
//                 }
//             )
//             .subscribe();

//         return () => {
//             requestsSubscription.unsubscribe();
//             ordersSubscription.unsubscribe();
//             suppliersSubscription.unsubscribe();
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [fetchData]);

//     // ============================================================
//     // 15. CRUD OPERATIONS (Client-side with Supabase)
//     // ============================================================

//     const handleRequestSubmitted = async (newRequest: any) => {
//         try {
//             if (isEditMode && editData) {
//                 const { error } = await supabase
//                     .from('purchase_requests')
//                     .update({
//                         type: newRequest.type,
//                         description: newRequest.description,
//                         requested_by: newRequest.requested_by,
//                         department: newRequest.department,
//                         supplier_id: newRequest.supplier_id,
//                         supplier_name: newRequest.supplier_name,
//                         amount: newRequest.amount,
//                         priority: newRequest.priority,
//                         status: newRequest.status,
//                         items: newRequest.items,
//                         reason: newRequest.reason,
//                         updated_at: new Date().toISOString(),
//                     })
//                     .eq('id', editData.id);

//                 if (error) throw error;

//                 setRequests(prev => prev.map(r =>
//                     r.id === editData.id ? { ...newRequest, id: editData.id, request_number: editData.request_number } : r
//                 ));
//                 toast.success("Purchase request updated successfully!");
//             } else {
//                 const { data, error } = await supabase
//                     .from('purchase_requests')
//                     .insert({
//                         type: newRequest.type,
//                         description: newRequest.description,
//                         requested_by: newRequest.requested_by,
//                         department: newRequest.department,
//                         supplier_id: newRequest.supplier_id,
//                         supplier_name: newRequest.supplier_name,
//                         amount: newRequest.amount,
//                         priority: newRequest.priority,
//                         status: newRequest.status,
//                         date: newRequest.date,
//                         items: newRequest.items,
//                         reason: newRequest.reason,
//                     })
//                     .select()
//                     .single();

//                 if (error) throw error;

//                 const newRequestWithId = { ...newRequest, id: data.id, request_number: data.request_number };
//                 setRequests(prev => [newRequestWithId, ...prev]);
//                 setTotalItems(prev => prev + 1);
//                 toast.success("Purchase request submitted successfully!");
//             }

//             // Clear selection after operation
//             setSelectedIds(new Set());
//             setIsSelectAll(false);
//             setIsEditMode(false);
//             setEditData(null);
//             setIsPurchaseRequestModalOpen(false);

//             // Update counts
//             await updateCounts();
//         } catch (error) {
//             console.error('Error submitting request:', error);
//             toast.error(isEditMode ? 'Failed to update request' : 'Failed to submit request');
//         }
//     };

//     const handleCreateOrder = (request: PurchaseRequest) => {
//         setSelectedRequest(request);
//         setIsPurchaseOrderModalOpen(true);
//     };

//     const handleOrderCreated = async (orderData: any) => {
//         try {
//             const { error } = await supabase
//                 .from('purchase_requests')
//                 .update({ status: "Approved", updated_at: new Date().toISOString() })
//                 .eq('id', orderData.request_id);

//             if (error) throw error;

//             const { error: orderError } = await supabase
//                 .from('purchase_orders')
//                 .insert({
//                     po_number: orderData.po_number,
//                     request_id: orderData.request_id,
//                     supplier_id: orderData.supplier_id,
//                     supplier_name: orderData.supplier_name,
//                     total_amount: orderData.total_amount,
//                     status: orderData.status,
//                     delivery_date: orderData.delivery_date,
//                     notes: orderData.notes,
//                     items: orderData.items,
//                 });

//             if (orderError) throw orderError;

//             setPurchaseOrders(prev => [...prev, { ...orderData, id: Date.now().toString() }]);
//             setRequests(prev => prev.map(r =>
//                 r.id === orderData.request_id ? { ...r, status: "Approved" } : r
//             ));

//             toast.success("Purchase Order created successfully!");
//             setIsPurchaseOrderModalOpen(false);
//             setSelectedRequest(null);

//             // Update counts
//             await updateCounts();
//         } catch (error) {
//             console.error('Error creating order:', error);
//             toast.error('Failed to create purchase order');
//         }
//     };

//     const handleEditRequest = (id: string) => {
//         const request = requests.find(r => r.id === id);
//         if (request) {
//             setEditData(request);
//             setIsEditMode(true);
//             setIsPurchaseRequestModalOpen(true);
//         }
//     };

//     const handleDeleteRequest = async (id: string) => {
//         const confirmed = await confirm({
//             title: "Delete Purchase Request",
//             message: `Are you sure you want to delete this request? This action cannot be undone.`,
//             confirmText: "Delete",
//             cancelText: "Cancel",
//             confirmVariant: "danger",
//         });

//         if (!confirmed) return;

//         setPendingRowId(id);
//         try {
//             const { error } = await supabase
//                 .from('purchase_requests')
//                 .delete()
//                 .eq('id', id);

//             if (error) throw error;

//             setRequests(prev => prev.filter(r => r.id !== id));
//             setTotalItems(prev => prev - 1);
//             // Remove from selected if present
//             setSelectedIds(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(id);
//                 return newSet;
//             });
//             toast.success("Request deleted successfully");

//             // Update counts
//             await updateCounts();
//         } catch (error) {
//             console.error('Error deleting request:', error);
//             toast.error('Failed to delete request');
//         } finally {
//             setPendingRowId(null);
//         }
//     };

//     // ========== BULK DELETE HANDLER ==========
//     const handleBulkDelete = async () => {
//         if (selectedIds.size === 0) {
//             toast.warning("Please select at least one request to delete");
//             return;
//         }

//         // Check if any selected requests are not in "Pending" status
//         const selectedRequests = requests.filter(r => selectedIds.has(r.id));
//         const nonPendingSelected = selectedRequests.filter(r => r.status !== "Pending");

//         if (nonPendingSelected.length > 0) {
//             const confirmed = await confirm({
//                 title: "Bulk Delete Warning",
//                 message: `${nonPendingSelected.length} selected request(s) are not in "Pending" status.
//                           Only Pending requests can be deleted.
//                           Would you like to delete only the Pending ones?`,
//                 confirmText: "Delete Pending Only",
//                 cancelText: "Cancel",
//                 confirmVariant: "danger",
//             });

//             if (!confirmed) return;

//             // Filter to only pending requests
//             const pendingToDelete = selectedRequests.filter(r => r.status === "Pending");
//             if (pendingToDelete.length === 0) {
//                 toast.warning("No pending requests selected for deletion");
//                 return;
//             }

//             // Continue with only pending ones
//             const confirmedFinal = await confirm({
//                 title: "Delete Selected Pending Requests",
//                 message: `Are you sure you want to delete ${pendingToDelete.length} pending request(s)? This action cannot be undone.`,
//                 confirmText: `Delete ${pendingToDelete.length}`,
//                 cancelText: "Cancel",
//                 confirmVariant: "danger",
//             });

//             if (!confirmedFinal) return;

//             const idsToDelete = pendingToDelete.map(r => r.id);
//             await performBulkDelete(idsToDelete);
//             return;
//         }

//         // All selected are pending - proceed with normal confirmation
//         const confirmed = await confirm({
//             title: "Delete Selected Requests",
//             message: `Are you sure you want to delete ${selectedIds.size} selected request(s)? This action cannot be undone.`,
//             confirmText: `Delete ${selectedIds.size}`,
//             cancelText: "Cancel",
//             confirmVariant: "danger",
//         });

//         if (!confirmed) return;

//         await performBulkDelete(Array.from(selectedIds));
//     };

//     const performBulkDelete = async (ids: string[]) => {
//         try {
//             setPendingRowId("bulk"); // Use a special key for bulk operations

//             const { error } = await supabase
//                 .from('purchase_requests')
//                 .delete()
//                 .in('id', ids);

//             if (error) throw error;

//             setRequests(prev => prev.filter(r => !ids.includes(r.id)));
//             setTotalItems(prev => prev - ids.length);
//             setSelectedIds(new Set());
//             setIsSelectAll(false);
//             toast.success(`Successfully deleted ${ids.length} request(s)`);

//             // Update counts
//             await updateCounts();
//         } catch (error) {
//             console.error('Error deleting requests:', error);
//             toast.error('Failed to delete selected requests');
//         } finally {
//             setPendingRowId(null);
//         }
//     };

//     // ========== SELECTION HANDLERS ==========
//     const handleSelectAll = () => {
//         if (isSelectAll) {
//             setSelectedIds(new Set());
//         } else {
//             // Only select pending requests for bulk operations
//             const pendingIds = filteredRequests
//                 .filter(r => r.status === "Pending")
//                 .map(r => r.id);
//             setSelectedIds(new Set(pendingIds));
//         }
//         setIsSelectAll(!isSelectAll);
//     };

//     const handleSelectOne = (id: string) => {
//         const newSet = new Set(selectedIds);
//         if (newSet.has(id)) {
//             newSet.delete(id);
//         } else {
//             // Only allow selection of pending requests
//             const request = requests.find(r => r.id === id);
//             if (request && request.status !== "Pending") {
//                 toast.warning("Only Pending requests can be selected for bulk operations");
//                 return;
//             }
//             newSet.add(id);
//         }
//         setSelectedIds(newSet);
//         // Update select all state
//         const pendingIds = filteredRequests.filter(r => r.status === "Pending").map(r => r.id);
//         const allSelected = pendingIds.every(id => newSet.has(id));
//         setIsSelectAll(allSelected && newSet.size === pendingIds.length);
//     };

//     const handleApproveRequest = async (id: string) => {
//         const confirmed = await confirm({
//             title: "Approve Purchase Request",
//             message: `Are you sure you want to approve this request?`,
//             confirmText: "Approve",
//             cancelText: "Cancel",
//             confirmVariant: "success",
//         });

//         if (!confirmed) return;

//         setPendingRowId(id);
//         try {
//             const { error } = await supabase
//                 .from('purchase_requests')
//                 .update({ status: "Approved", updated_at: new Date().toISOString() })
//                 .eq('id', id);

//             if (error) throw error;

//             setRequests(prev => prev.map(r =>
//                 r.id === id ? { ...r, status: "Approved" } : r
//             ));
//             // Remove from selection if present
//             setSelectedIds(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(id);
//                 return newSet;
//             });
//             toast.success("Request approved successfully");

//             // Update counts
//             await updateCounts();
//         } catch (error) {
//             console.error('Error approving request:', error);
//             toast.error('Failed to approve request');
//         } finally {
//             setPendingRowId(null);
//         }
//     };

//     const handleRejectRequest = async (id: string) => {
//         const confirmed = await confirm({
//             title: "Reject Purchase Request",
//             message: `Are you sure you want to reject this request?`,
//             confirmText: "Reject",
//             cancelText: "Cancel",
//             confirmVariant: "danger",
//         });

//         if (!confirmed) return;

//         setPendingRowId(id);
//         try {
//             const { error } = await supabase
//                 .from('purchase_requests')
//                 .update({ status: "Rejected", updated_at: new Date().toISOString() })
//                 .eq('id', id);

//             if (error) throw error;

//             setRequests(prev => prev.map(r =>
//                 r.id === id ? { ...r, status: "Rejected" } : r
//             ));
//             // Remove from selection if present
//             setSelectedIds(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(id);
//                 return newSet;
//             });
//             toast.info("Request rejected");

//             // Update counts
//             await updateCounts();
//         } catch (error) {
//             console.error('Error rejecting request:', error);
//             toast.error('Failed to reject request');
//         } finally {
//             setPendingRowId(null);
//         }
//     };

//     // ============================================================
//     // 16. HELPER FUNCTIONS (Client-side)
//     // ============================================================
//     const getPurchaseOrderStatus = (requestId: string): string | null => {
//         const order = purchaseOrders.find(po => po.request_id === requestId);
//         return order ? order.status : null;
//     };

//     const getPurchaseOrderNumber = (requestId: string): string | null => {
//         const order = purchaseOrders.find(po => po.request_id === requestId);
//         return order ? order.po_number : null;
//     };

//     // ============================================================
//     // 17. CHARTS (Client-side with Chart.js)
//     // ============================================================
//     useEffect(() => {
//         function createCharts() {
//             if (expenseChartInstanceRef.current) {
//                 expenseChartInstanceRef.current.destroy();
//                 expenseChartInstanceRef.current = null;
//             }
//             if (priorityChartInstanceRef.current) {
//                 priorityChartInstanceRef.current.destroy();
//                 priorityChartInstanceRef.current = null;
//             }

//             const monthlyData = Array(12).fill(0);
//             const currentYear = new Date().getFullYear();

//             purchaseOrders.forEach((order: PurchaseOrder) => {
//                 if (order.delivery_date && (order.status === 'Delivered' || order.status === 'Confirmed')) {
//                     const orderDate = new Date(order.delivery_date);
//                     if (orderDate.getFullYear() === currentYear) {
//                         const month = orderDate.getMonth();
//                         monthlyData[month] += order.total_amount || 0;
//                     }
//                 }
//             });

//             const priorityCounts = {
//                 Normal: 0,
//                 Urgent: 0,
//                 Critical: 0,
//             };

//             requests.forEach((req: PurchaseRequest) => {
//                 if (req.priority === 'Normal') priorityCounts.Normal++;
//                 else if (req.priority === 'Urgent') priorityCounts.Urgent++;
//                 else if (req.priority === 'Critical') priorityCounts.Critical++;
//             });

//             const priorityLabels = ['Normal', 'Urgent', 'Critical'];
//             const priorityValues = [priorityCounts.Normal, priorityCounts.Urgent, priorityCounts.Critical];
//             const priorityColors = ['#10B981', '#F59E0B', '#EF4444'];

//             if (expenseChartCanvasRef.current && Chart) {
//                 expenseChartInstanceRef.current = new Chart(expenseChartCanvasRef.current, {
//                     type: "line",
//                     data: {
//                         labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
//                         datasets: [{
//                             label: "Spend",
//                             data: monthlyData,
//                             borderColor: "#EC4899",
//                             backgroundColor: "rgba(236,72,153,.12)",
//                             fill: true,
//                             tension: 0.35,
//                             borderWidth: 2,
//                             pointRadius: 3,
//                             pointBackgroundColor: "#EC4899",
//                             pointHoverRadius: 6,
//                             pointHoverBackgroundColor: "#BE185D",
//                         }],
//                     },
//                     options: {
//                         responsive: true,
//                         maintainAspectRatio: false,
//                         plugins: {
//                             legend: { display: false },
//                             tooltip: {
//                                 backgroundColor: "rgba(15,23,42,0.9)",
//                                 titleColor: "#fff",
//                                 bodyColor: "#e2e8f0",
//                                 borderColor: "#EC4899",
//                                 borderWidth: 1,
//                                 padding: 12,
//                                 callbacks: {
//                                     label: function (context: any) {
//                                         return `₱${context.parsed.y.toLocaleString()}`;
//                                     }
//                                 }
//                             }
//                         },
//                         scales: {
//                             x: { grid: { display: false } },
//                             y: {
//                                 grid: { color: "#F1F5F9" },
//                                 ticks: {
//                                     callback: function (value: any) {
//                                         return `₱${value.toLocaleString()}`;
//                                     }
//                                 }
//                             }
//                         }
//                     },
//                 });
//             }

//             if (priorityChartCanvasRef.current && Chart) {
//                 priorityChartInstanceRef.current = new Chart(priorityChartCanvasRef.current, {
//                     type: "doughnut",
//                     data: {
//                         labels: priorityLabels,
//                         datasets: [{
//                             data: priorityValues,
//                             backgroundColor: priorityColors,
//                             borderWidth: 2,
//                             borderColor: "#fff",
//                             hoverOffset: 15,
//                         }],
//                     },
//                     options: {
//                         responsive: true,
//                         maintainAspectRatio: false,
//                         cutout: "65%",
//                         plugins: {
//                             legend: {
//                                 position: "bottom",
//                                 labels: {
//                                     boxWidth: 10,
//                                     boxHeight: 10,
//                                     usePointStyle: true,
//                                     font: { size: 10 },
//                                 },
//                             },
//                             tooltip: {
//                                 backgroundColor: "rgba(15,23,42,0.9)",
//                                 titleColor: "#fff",
//                                 bodyColor: "#e2e8f0",
//                                 borderColor: "#EC4899",
//                                 borderWidth: 1,
//                                 padding: 12,
//                                 callbacks: {
//                                     label: function (context: any) {
//                                         const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
//                                         const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
//                                         return `${context.label}: ${context.parsed} (${percentage}%)`;
//                                     }
//                                 }
//                             }
//                         }
//                     },
//                 });
//             }
//         }

//         // Charts redraw whenever the underlying data changes
//         if (!loading) {
//             const timer = setTimeout(() => {
//                 createCharts();
//             }, 100);
//             return () => clearTimeout(timer);
//         }

//         return () => {
//             if (expenseChartInstanceRef.current) {
//                 expenseChartInstanceRef.current.destroy();
//                 expenseChartInstanceRef.current = null;
//             }
//             if (priorityChartInstanceRef.current) {
//                 priorityChartInstanceRef.current.destroy();
//                 priorityChartInstanceRef.current = null;
//             }
//         };
//     }, [purchaseOrders, requests, loading]);

//     // ============================================================
//     // 18. FILTERING (Client-side)
//     // ============================================================
//     const filteredRequests = requests.filter((req: PurchaseRequest) => {
//         const matchesTab = activeTab === "all" ||
//             (activeTab === "pending" && req.status === "Pending") ||
//             (activeTab === "approved" && (req.status === "Approved" || req.status === "Completed"));
//         const matchesSearch = (req.request_number || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//             (req.requested_by || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//             (req.supplier_name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//             (req.description || '').toLowerCase().includes(debouncedSearch.toLowerCase());
//         return matchesTab && matchesSearch;
//     });

//     // ============================================================
//     // 19. PAGINATION (Client-side)
//     // ============================================================
//     const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

//     const handlePageChange = (page: number) => {
//         if (page >= 1 && page <= totalPages && page !== currentPage) {
//             setCurrentPage(page);
//             // Clear selection when changing page
//             setSelectedIds(new Set());
//             setIsSelectAll(false);
//             setTimeout(() => scrollToTable(), 100);
//         }
//     };

//     // ============================================================
//     // 20. STATS (Client-side)
//     // ============================================================
//     const pendingRequests = requests.filter((r: PurchaseRequest) => r.status === "Pending").length;
//     const approvedRequests = requests.filter((r: PurchaseRequest) => r.status === "Approved" || r.status === "Completed").length;
//     const totalRequests = totalItems;

//     const totalSpend = purchaseOrders
//         .filter((o: PurchaseOrder) => o.status === 'Delivered' || o.status === 'Confirmed')
//         .reduce((sum: number, o: PurchaseOrder) => sum + (o.total_amount || 0), 0);

//     // ============================================================
//     // 21. LOADING STATE (Client-side) — only shown on the very first load
//     // ============================================================
//     if (loading) {
//         return (
//             <PageSkeleton />
//         );
//     }

//     // ============================================================
//     // 22. RENDER (Client-side)
//     // ============================================================
//     return (
//         <div className="p-6 space-y-6 fade-in">
//             {/* Header */}
//             <div className="flex items-start justify-between gap-4 flex-wrap border-b border-slate-200/80 pb-5">
//                 <div className="flex items-start gap-3.5">
//                     <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 text-xl shadow-2xs shrink-0 mt-0.5">
//                         <i className="fas fa-shopping-cart"></i>
//                     </div>
//                     <div>
//                         <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
//                             Procurement &amp; Sourcing
//                         </h1>
//                         <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
//                             Manage fleet maintenance, spare parts, fuel, and operational supplies.
//                         </p>
//                         <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/60 text-xs text-slate-500">
//                             <span className="w-2 h-2 rounded-full bg-pink-500"></span>
//                             <i className="fas fa-user-tag text-[11px] text-slate-400"></i>
//                             <span>Role:</span>
//                             <span className="font-semibold text-slate-700 capitalize">{userRole}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <button
//                     className="px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-2xs hover:shadow-pink-500/20 active:scale-[0.98] shrink-0"
//                     onClick={() => {
//                         setIsEditMode(false);
//                         setEditData(null);
//                         setSelectedIds(new Set());
//                         setIsSelectAll(false);
//                         setIsPurchaseRequestModalOpen(true);
//                     }}
//                 >
//                     <i className="fas fa-plus text-xs"></i>
//                     <span>New Purchase Request</span>
//                 </button>
//             </div>

//             {/* AI Suggested Questions */}
//             <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
//                 <div className="flex items-center justify-between mb-3">
//                     <span className="font-semibold text-slate-900 text-sm">
//                         <i className="fas fa-robot text-pink-500 mr-2"></i> AI Suggested Questions
//                     </span>
//                     <span className="text-xs text-slate-400">
//                         <i className="fas fa-mouse-pointer mr-1"></i> Click to ask
//                     </span>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
//                     <button
//                         className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-pink-200 hover:bg-pink-50 transition text-left"
//                         onClick={() =>
//                             toast.info(
//                                 `AI: Procurement summary...\n\n Active requests: ${totalRequests}\n⏳ Pending approvals: ${pendingRequests}\n💰 Total spend: ₱${totalSpend.toLocaleString()}`
//                             )
//                         }
//                     >
//                         <span className="w-2 h-2 rounded-full bg-pink-400 shrink-0"></span>
//                         <span className="text-xs text-slate-700">Procurement summary</span>
//                     </button>
//                     <button
//                         className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-pink-200 hover:bg-pink-50 transition text-left"
//                         onClick={() => {
//                             const categoryData: Record<string, number> = requests.reduce((acc: Record<string, number>, req: PurchaseRequest) => {
//                                 const type = req.type || 'Other';
//                                 acc[type] = (acc[type] || 0) + (req.amount || 0);
//                                 return acc;
//                             }, {});
//                             const sorted = Object.entries(categoryData)
//                                 .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
//                                 .slice(0, 3)
//                                 .map(([key, value]: [string, number]) => `${key}: ₱${value.toLocaleString()}`)
//                                 .join('\n');
//                             toast.info(`AI: Top expenses by category...\n\n${sorted || 'No data available'}`);
//                         }}
//                     >
//                         <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
//                         <span className="text-xs text-slate-700">Top expenses?</span>
//                     </button>
//                     <button
//                         className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-pink-200 hover:bg-pink-50 transition text-left"
//                         onClick={() =>
//                             toast.info(
//                                 `AI: Urgent requests...\n\n ${requests.filter(r => r.priority === 'Critical' && r.status === 'Pending').map(r => `${r.request_number} - ${r.description}`).join('\n') || 'No urgent requests'}`
//                             )
//                         }
//                     >
//                         <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
//                         <span className="text-xs text-slate-700">Any urgent requests?</span>
//                     </button>
//                     <button
//                         className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-pink-200 hover:bg-pink-50 transition text-left"
//                         onClick={() =>
//                             toast.info(
//                                 `AI: Supplier performance...\n\n ${suppliers.slice(0, 3).map((s, i) => `${i + 1}. ${s.name}`).join('\n')}`
//                             )
//                         }
//                     >
//                         <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
//                         <span className="text-xs text-slate-700">Supplier performance?</span>
//                     </button>
//                 </div>
//             </div>

//             {/* KPIs */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 cursor-help">
//                     <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
//                         <i className="fas fa-file-invoice text-pink-500"></i> Total Requests
//                     </div>
//                     <div className="text-2xl font-bold text-slate-900 mt-1">{totalCounts.all}</div>
//                     <div className="text-xs text-emerald-600 flex items-center gap-1">
//                         <i className="fas fa-arrow-up text-[10px]"></i> {totalCounts.pending} pending
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 cursor-help">
//                     <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
//                         <i className="fas fa-clock text-amber-500"></i> Pending Approvals
//                     </div>
//                     <div className="text-2xl font-bold text-slate-900 mt-1">{totalCounts.pending}</div>
//                     <div className="text-xs text-amber-600 flex items-center gap-1">
//                         <i className="fas fa-hourglass-half text-[10px]"></i> Awaiting review
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 cursor-help">
//                     <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
//                         <i className="fas fa-check-circle text-emerald-500"></i> Approved
//                     </div>
//                     <div className="text-2xl font-bold text-slate-900 mt-1">{totalCounts.approved}</div>
//                     <div className="text-xs text-emerald-600 flex items-center gap-1">
//                         <i className="fas fa-check text-[10px]"></i> Ready for PO
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 cursor-help">
//                     <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
//                         <i className="fas fa-coins text-blue-500"></i> Total Spend
//                     </div>
//                     <div className="text-2xl font-bold text-slate-900 mt-1">₱{totalSpend.toLocaleString()}</div>
//                     <div className="text-xs text-blue-600 flex items-center gap-1">
//                         <i className="fas fa-chart-line text-[10px]"></i> Completed orders
//                     </div>
//                 </div>
//             </div>

//             {/* Charts */}
//             <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
//                 <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 xl:col-span-2">
//                     <div className="flex items-center justify-between">
//                         <div className="font-semibold text-slate-900 text-sm">
//                             <i className="fas fa-chart-bar mr-2 text-pink-500"></i> Procurement Spending Trend
//                         </div>
//                         <div className="text-xs text-slate-500">
//                             <i className="fas fa-calendar-alt mr-1"></i> Completed orders
//                         </div>
//                     </div>
//                     <div className="w-full h-[200px]">
//                         <canvas ref={expenseChartCanvasRef} className="w-full h-full"></canvas>
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
//                     <div className="font-semibold text-slate-900 text-sm">
//                         <i className="fas fa-chart-pie mr-2 text-pink-500"></i> Request Priority Distribution
//                     </div>
//                     <div className="w-full h-[200px]">
//                         <canvas ref={priorityChartCanvasRef} className="w-full h-full"></canvas>
//                     </div>
//                 </div>
//             </div>

//             {/* Purchase Requests Table */}
//             <div
//                 ref={tableContainerRef}
//                 id="procurement-table"
//                 className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden relative"
//             >
//                 {/* Thin inline progress bar instead of a full-screen spinner */}
//                 {isRefreshing && (
//                     <div className="absolute top-0 left-0 right-0 h-0.5 bg-pink-100 overflow-hidden z-10">
//                         <div className="h-full w-1/3 bg-pink-500 animate-[pulse_1s_ease-in-out_infinite]"></div>
//                     </div>
//                 )}
//                 <div className="p-4 border-b border-slate-100 bg-slate-50/50">
//                     <div className="flex flex-wrap items-center gap-3">
//                         <div className="font-semibold text-slate-900 text-sm mr-2 flex items-center gap-2">
//                             <i className="fas fa-list text-pink-500"></i>
//                             Purchase Requests
//                             {isRefreshing && (
//                                 <i className="fas fa-circle-notch fa-spin text-pink-400 text-xs" title="Refreshing..."></i>
//                             )}
//                         </div>
//                         <div className="relative flex-1 min-w-[200px] max-w-xs">
//                             <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs"></i>
//                             <input
//                                 className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 pl-8 text-xs focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
//                                 placeholder="Search by ID, requester, supplier..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                             />
//                         </div>
//                         <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
//                             <button
//                                 className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${activeTab === "all"
//                                     ? "bg-white text-slate-900 shadow-sm"
//                                     : "text-slate-600 hover:text-slate-900"
//                                     }`}
//                                 onClick={() => {
//                                     setActiveTab("all");
//                                     setSelectedIds(new Set());
//                                     setIsSelectAll(false);
//                                 }}
//                             >
//                                 All ({totalCounts.all})
//                             </button>
//                             <button
//                                 className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${activeTab === "pending"
//                                     ? "bg-white text-slate-900 shadow-sm"
//                                     : "text-slate-600 hover:text-slate-900"
//                                     }`}
//                                 onClick={() => {
//                                     setActiveTab("pending");
//                                     setSelectedIds(new Set());
//                                     setIsSelectAll(false);
//                                 }}
//                             >
//                                 Pending ({totalCounts.pending})
//                             </button>
//                             <button
//                                 className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${activeTab === "approved"
//                                     ? "bg-white text-slate-900 shadow-sm"
//                                     : "text-slate-600 hover:text-slate-900"
//                                     }`}
//                                 onClick={() => {
//                                     setActiveTab("approved");
//                                     setSelectedIds(new Set());
//                                     setIsSelectAll(false);
//                                 }}
//                             >
//                                 Approved ({totalCounts.approved})
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Table Content with Animation */}
//                 <div className="relative rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
//                     {/* Loading Overlay */}
//                     {isTabTransitioning && (
//                         <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-30 flex items-center justify-center transition-all">
//                             <div className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white shadow-xl border border-slate-100">
//                                 <svg className="w-6 h-6 animate-spin text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                 </svg>
//                                 <span className="text-xs text-slate-600 font-semibold tracking-wide">Loading requests...</span>
//                             </div>
//                         </div>
//                     )}

//                     {/* Table Container */}
//                     <div className={`transition-all duration-300 ${isTabTransitioning ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-left border-collapse">
//                                 <thead>
//                                     <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none">
//                                         <th className="py-3.5 px-4 w-12">
//                                             <div className="flex items-center gap-1.5">
//                                                 <input
//                                                     type="checkbox"
//                                                     className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500/30 focus:ring-2 transition-all cursor-pointer accent-pink-600"
//                                                     checked={isSelectAll && selectedIds.size > 0}
//                                                     onChange={handleSelectAll}
//                                                     disabled={filteredRequests.filter(r => r.status === "Pending").length === 0}
//                                                     title={filteredRequests.filter(r => r.status === "Pending").length === 0 ? "No pending requests to select" : "Select all pending requests"}
//                                                 />
//                                                 {selectedIds.size > 0 && (
//                                                     <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-1.5 py-0.5 rounded-full">
//                                                         {selectedIds.size}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </th>
//                                         <th className="py-3.5 px-4">ID</th>
//                                         <th className="py-3.5 px-4">PR #</th>
//                                         <th className="py-3.5 px-4">Type</th>
//                                         <th className="py-3.5 px-4">Description</th>
//                                         <th className="py-3.5 px-4">Requested By</th>
//                                         <th className="py-3.5 px-4">Department</th>
//                                         <th className="py-3.5 px-4">Supplier</th>
//                                         <th className="py-3.5 px-4 text-right">Amount</th>
//                                         <th className="py-3.5 px-4">Priority</th>
//                                         <th className="py-3.5 px-4">Date</th>
//                                         <th className="py-3.5 px-4">Status</th>
//                                         <th className="py-3.5 px-4 text-right">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100 text-xs">
//                                     {filteredRequests.length === 0 ? (
//                                         <tr>
//                                             <td colSpan={13} className="py-8">
//                                                 <EmptyState
//                                                     title="No purchase requests found"
//                                                     description={
//                                                         activeTab === "pending"
//                                                             ? "There are no pending requests waiting for approval."
//                                                             : activeTab === "approved"
//                                                                 ? "There are no approved requests ready for purchase orders."
//                                                                 : "Try adjusting your search filters or create a new request."
//                                                     }
//                                                     icon="fas fa-shopping-cart"
//                                                     actionText="Create New Request"
//                                                     onAction={() => {
//                                                         setIsEditMode(false);
//                                                         setEditData(null);
//                                                         setIsPurchaseRequestModalOpen(true);
//                                                     }}
//                                                 />
//                                             </td>
//                                         </tr>
//                                     ) : (
//                                         filteredRequests.map((req: PurchaseRequest) => {
//                                             const hasPO = purchaseOrders.some((po: PurchaseOrder) => po.request_id === req.id);
//                                             const poStatus = getPurchaseOrderStatus(req.id);
//                                             const poNumber = getPurchaseOrderNumber(req.id);
//                                             const rowBusy = pendingRowId === req.id;
//                                             const isSelected = selectedIds.has(req.id);
//                                             const isPending = req.status === "Pending";

//                                             return (
//                                                 <tr
//                                                     key={req.id}
//                                                     className={`group hover:bg-slate-50/80 even:bg-gray-100 transition-colors ${rowBusy ? "opacity-50 pointer-events-none" : ""} ${isSelected ? "bg-pink-50/30" : ""}`}
//                                                 >
//                                                     {/* Selection Checkbox */}
//                                                     <td className="py-3 px-4">
//                                                         <input
//                                                             type="checkbox"
//                                                             className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500/30 focus:ring-2 transition-all cursor-pointer accent-pink-600 disabled:opacity-40 disabled:cursor-not-allowed"
//                                                             checked={isSelected}
//                                                             onChange={() => handleSelectOne(req.id)}
//                                                             disabled={!isPending || rowBusy}
//                                                             title={!isPending ? "Only pending requests can be selected" : ""}
//                                                         />
//                                                     </td>

//                                                     {/* Column Identifiers */}
//                                                     <td className="py-3 px-4 font-mono text-[10px] text-slate-400 font-medium">
//                                                         {req.id.substring(0, 8)}
//                                                     </td>
//                                                     <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-800">
//                                                         {req.request_number}
//                                                     </td>
//                                                     <td className="py-3 px-4 font-medium text-slate-700">
//                                                         {req.type}
//                                                     </td>

//                                                     {/* Details */}
//                                                     <td className="py-3 px-4">
//                                                         <span className="text-slate-600 truncate max-w-[160px] block font-normal" title={req.description}>
//                                                             {req.description}
//                                                         </span>
//                                                     </td>
//                                                     <td className="py-3 px-4 font-medium text-slate-700">{req.requested_by}</td>
//                                                     <td className="py-3 px-4 text-slate-600">{req.department}</td>
//                                                     <td className="py-3 px-4 text-slate-600">{req.supplier_name}</td>

//                                                     {/* Amount */}
//                                                     <td className="py-3 px-4 text-right font-bold text-slate-900 tracking-tight">
//                                                         ₱{req.amount.toLocaleString()}
//                                                     </td>

//                                                     {/* Priority */}
//                                                     <td className="py-3 px-4">
//                                                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${getPriorityColor(req.priority)}`}>
//                                                             {req.priority}
//                                                         </span>
//                                                     </td>

//                                                     {/* Date */}
//                                                     <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">{req.date}</td>

//                                                     {/* Status Badge */}
//                                                     <td className="py-3 px-4">
//                                                         <div className="flex flex-col gap-1 items-start">
//                                                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(req.status)}`}>
//                                                                 <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
//                                                                 {req.status}
//                                                             </span>
//                                                             {hasPO && poStatus && (
//                                                                 <span
//                                                                     className={`text-[9px] px-2 py-0.5 rounded-md font-medium border ${getPOStatusColor(poStatus)}`}
//                                                                     title={`PO Status: ${poStatus}`}
//                                                                 >
//                                                                     PO: {poStatus} {poNumber && `(#${poNumber})`}
//                                                                 </span>
//                                                             )}
//                                                         </div>
//                                                     </td>

//                                                     {/* Row Action Controls */}
//                                                     <td className="py-3 px-4 text-right">
//                                                         <div className="flex items-center justify-end gap-1">
//                                                             {rowBusy && (
//                                                                 <svg className="w-4 h-4 animate-spin text-slate-400 mr-1" fill="none" viewBox="0 0 24 24">
//                                                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                                                 </svg>
//                                                             )}

//                                                             {/* PO Creation Button */}
//                                                             {req.status === "Approved" && !hasPO && (
//                                                                 <button
//                                                                     className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
//                                                                     onClick={() => handleCreateOrder(req)}
//                                                                     disabled={rowBusy}
//                                                                     title="Create Purchase Order"
//                                                                 >
//                                                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                                                         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                                                     </svg>
//                                                                 </button>
//                                                             )}

//                                                             {/* Pending Actions (Approve/Reject/Edit/Delete) */}
//                                                             {req.status === "Pending" && (
//                                                                 <>
//                                                                     <button
//                                                                         className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
//                                                                         onClick={() => handleApproveRequest(req.id)}
//                                                                         disabled={rowBusy}
//                                                                         title="Approve"
//                                                                     >
//                                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                                                                             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                                                                         </svg>
//                                                                     </button>
//                                                                     <button
//                                                                         className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
//                                                                         onClick={() => handleRejectRequest(req.id)}
//                                                                         disabled={rowBusy}
//                                                                         title="Reject"
//                                                                     >
//                                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                                                                             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//                                                                         </svg>
//                                                                     </button>
//                                                                     <button
//                                                                         className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
//                                                                         onClick={() => handleEditRequest(req.id)}
//                                                                         disabled={rowBusy}
//                                                                         title="Edit"
//                                                                     >
//                                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                                                             <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                                         </svg>
//                                                                     </button>
//                                                                     <button
//                                                                         className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
//                                                                         onClick={() => handleDeleteRequest(req.id)}
//                                                                         disabled={rowBusy}
//                                                                         title="Delete"
//                                                                     >
//                                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                                                             <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                                         </svg>
//                                                                     </button>
//                                                                 </>
//                                                             )}

//                                                             {/* Completed Row Status Labels */}
//                                                             {req.status === "Approved" && hasPO && (
//                                                                 <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium px-2 py-1 bg-emerald-50 rounded-md">
//                                                                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                                                         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                                                     </svg>
//                                                                     PO Created
//                                                                 </span>
//                                                             )}
//                                                             {req.status === "Rejected" && (
//                                                                 <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-medium px-2 py-1 bg-rose-50 rounded-md">
//                                                                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                                                         <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                                                     </svg>
//                                                                     Rejected
//                                                                 </span>
//                                                             )}
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             );
//                                         })
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//                 {/* Pagination with Bulk Delete */}
//                 <div className="p-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/40 text-xs flex-wrap gap-2">
//                     <div className="flex items-center gap-4">
//                         <span className="text-slate-500">
//                             Showing <span className="font-semibold text-slate-700">{requests.length}</span> of{' '}
//                             <span className="font-semibold text-slate-700">{totalItems}</span> requests
//                         </span>
//                         {selectedIds.size > 0 && (
//                             <div className="flex items-center gap-2">
//                                 <span className="text-purple-600 font-semibold">
//                                     {selectedIds.size} selected
//                                 </span>
//                                 <button
//                                     onClick={handleBulkDelete}
//                                     disabled={pendingRowId === "bulk"}
//                                     className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
//                                 >
//                                     {pendingRowId === "bulk" ? (
//                                         <i className="fas fa-spinner fa-spin"></i>
//                                     ) : (
//                                         <i className="fas fa-trash-alt text-xs"></i>
//                                     )}
//                                     Delete Selected
//                                 </button>
//                                 <button
//                                     onClick={() => {
//                                         setSelectedIds(new Set());
//                                         setIsSelectAll(false);
//                                     }}
//                                     className="text-slate-400 hover:text-slate-600 transition-colors"
//                                     title="Clear selection"
//                                 >
//                                     <i className="fas fa-times"></i>
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                     <Pagination
//                         currentPage={currentPage}
//                         totalPages={totalPages}
//                         onPageChange={handlePageChange}
//                     />
//                 </div>

//             </div>

//             {/* Modals */}
//             <PurchaseRequestModal
//                 isOpen={isPurchaseRequestModalOpen}
//                 onClose={() => {
//                     setIsPurchaseRequestModalOpen(false);
//                     setIsEditMode(false);
//                     setEditData(null);
//                 }}
//                 suppliers={suppliers}
//                 role={userRole}
//                 onRequestSubmitted={handleRequestSubmitted}
//                 editData={editData}
//                 isEdit={isEditMode}
//             />

//             <PurchaseOrderModal
//                 isOpen={isPurchaseOrderModalOpen}
//                 onClose={() => {
//                     setIsPurchaseOrderModalOpen(false);
//                     setSelectedRequest(null);
//                 }}
//                 request={selectedRequest}
//                 suppliers={suppliers}
//                 onOrderCreated={handleOrderCreated}
//             />
//         </div>
//     );
// }