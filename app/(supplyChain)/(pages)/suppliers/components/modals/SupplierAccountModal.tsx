"use client";

import React, { useState, useEffect } from "react";
import { 
    ShieldCheck, 
    Mail, 
    Send, 
    User, 
    AlertCircle, 
    Loader2, 
    Lock, 
    Unlock
} from "lucide-react";
import { Supplier } from "../../types";
import { supabase } from "../../../../lib/services/client/supabase";
import { user } from "../../../../lib/services/Class/user";
import { toast } from "sonner";
import { useConfirm } from "../../../../components/ui/ConfirmModal";
import Portal from "../../../../components/client/Portal";

interface SupplierAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier: Supplier | null;
    onAccountUpdated?: () => void;
}

export function SupplierAccountModal({
    isOpen,
    onClose,
    supplier,
    onAccountUpdated,
}: SupplierAccountModalProps) {
    const { confirm } = useConfirm();
    const currentUserRole = user.getRole();
    const currentUserName = user.getName() || "Administrator";
    const canManageAccounts = ["Admin", "Executive"].includes(currentUserRole);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [existingAccount, setExistingAccount] = useState<any | null>(null);

    // Form state for creating an account
    const [contactName, setContactName] = useState("");
    const [email, setEmail] = useState("");

    // Load existing account
    useEffect(() => {
        if (!isOpen || !supplier) return;

        setContactName(supplier.contact_person || "");
        setEmail(supplier.email || "");

        const fetchAccount = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from("suppliers_account")
                    .select("*")
                    .eq("supplier_id", supplier.id)
                    .maybeSingle();

                if (!error && data) {
                    setExistingAccount(data);
                } else {
                    setExistingAccount(null);
                }
            } catch (err) {
                console.error("Error checking supplier account:", err);
                setExistingAccount(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAccount();
    }, [isOpen, supplier]);

    // Create Account Handler
    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplier) return;

        if (!canManageAccounts) {
            toast.error("Permission Denied: Only Admin and Executive can create supplier accounts.");
            return;
        }

        if (!email || !contactName) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/suppliers/create-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supplierId: supplier.id,
                    supplierName: supplier.name,
                    contactName: contactName.trim(),
                    email: email.trim().toLowerCase(),
                    invitedBy: user.getUserId() || null,
                    invitedByName: currentUserName,
                }),
            });

            const result = await res.json();
            if (!res.ok || !result.ok) {
                throw new Error(result.message || "Failed to create supplier account");
            }

            toast.success(`Supplier registered & invitation emailed to ${email}`);
            setExistingAccount(result.data);
            onAccountUpdated?.();
        } catch (err: any) {
            console.error("Error creating supplier account:", err);
            toast.error(err.message || "Failed to create supplier account");
        } finally {
            setIsSaving(false);
        }
    };

    // Toggle Account Status (Disable / Enable)
    const handleToggleStatus = async () => {
        if (!existingAccount || !supplier) return;

        if (!canManageAccounts) {
            toast.error("Only Admin and Executive can change account status.");
            return;
        }

        const isCurrentlyActive = existingAccount.status === "Active";
        const newStatus = isCurrentlyActive ? "Disabled" : "Active";

        const agreed = await confirm({
            title: `${isCurrentlyActive ? "Disable" : "Enable"} Supplier Account`,
            message: `Are you sure you want to ${isCurrentlyActive ? "disable" : "enable"} portal access for ${supplier.name}? ${isCurrentlyActive ? "They will no longer be able to log in to the portal." : "They will regain portal access."}`,
            confirmText: isCurrentlyActive ? "Disable Account" : "Enable Account",
            cancelText: "Cancel",
            confirmVariant: isCurrentlyActive ? "danger" : "pink",
        });

        if (!agreed) return;

        setIsSaving(true);
        try {
            const { data, error } = await supabase
                .from("suppliers_account")
                .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq("id", existingAccount.id)
                .select()
                .single();

            if (error) throw error;

            setExistingAccount(data);
            toast.success(`Supplier account successfully ${newStatus.toLowerCase()}`);
            onAccountUpdated?.();
        } catch (err: any) {
            console.error("Error updating account status:", err);
            toast.error("Failed to update status: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Resend Email Credentials
    const handleResendCredentials = async () => {
        if (!existingAccount || !supplier) return;

        setIsSaving(true);
        try {
            const res = await fetch("/api/suppliers/send-credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supplierName: supplier.name,
                    contactName: existingAccount.contact_name,
                    email: existingAccount.email,
                    password: existingAccount.password_hash || "Contact Procurement to reset",
                    invitedBy: currentUserName,
                }),
            });

            const result = await res.json().catch(() => ({}));

            if (res.ok && result.ok) {
                toast.success(`Credentials successfully resent to ${existingAccount.email}`);
            } else {
                toast.error(result.message || "Failed to send credentials email");
            }
        } catch (err: any) {
            toast.error(err.message || "Error dispatching email request");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !supplier) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div 
                    className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={onClose}
                />

                <div className="relative bg-[#f0f3f8] dark:bg-[#191a24] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-white/80 dark:border-white/[0.08] animate-in fade-in zoom-in-95 duration-200 z-10">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/60 dark:border-slate-800/80">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200/80 dark:border-pink-900/40 flex items-center justify-center shadow-[inset_1.5px_1.5px_3px_rgba(166,175,195,0.3)]">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                    Supplier Portal Account
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {supplier.name} (SUP-{String(supplier.id).padStart(3, "0")})
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl bg-[#ebf0f7] dark:bg-[#14151c] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center border border-slate-200/60 dark:border-slate-800 transition-all cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="w-7 h-7 text-pink-500 animate-spin mx-auto mb-2" />
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Checking account status...
                            </p>
                        </div>
                    ) : existingAccount ? (
                        /* Existing Account View */
                        <div className="space-y-5">
                            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#151620] border border-slate-200/70 dark:border-slate-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Account Status</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                        existingAccount.status === "Active" 
                                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200" 
                                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200"
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${existingAccount.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                                        {existingAccount.status}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">Portal Email</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{existingAccount.email}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">Representative</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{existingAccount.contact_name}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">Role Account Login</span>
                                    <span className="font-mono text-pink-600 dark:text-pink-400 font-semibold">supplier@gmail.com</span>
                                </div>
                            </div>

                            {!canManageAccounts && (
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>Only Admin and Executive can modify account statuses.</span>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleResendCredentials}
                                    disabled={isSaving || existingAccount.status !== "Active"}
                                    className="flex-1 py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#1d1e28] dark:hover:bg-[#252633] text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    Resend Credentials
                                </button>

                                {canManageAccounts && (
                                    <button
                                        type="button"
                                        onClick={handleToggleStatus}
                                        disabled={isSaving}
                                        className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                                            existingAccount.status === "Active"
                                                ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900"
                                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900"
                                        }`}
                                    >
                                        {existingAccount.status === "Active" ? (
                                            <>
                                                <Lock className="w-3.5 h-3.5" />
                                                Disable Account
                                            </>
                                        ) : (
                                            <>
                                                <Unlock className="w-3.5 h-3.5" />
                                                Enable Account
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Create Account Form */
                        <form onSubmit={handleCreateAccount} className="space-y-4">
                            {!canManageAccounts ? (
                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                                    <div className="font-bold flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4" />
                                        Account Creation Restricted
                                    </div>
                                    <p>Only Administrators and Executives are authorized to provision portal credentials for suppliers.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Contact Representative Name
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                required
                                                value={contactName}
                                                onChange={(e) => setContactName(e.target.value)}
                                                placeholder="e.g. Maria Santos"
                                                className="w-full py-2.5 pl-10 pr-3 bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 shadow-[inset_2px_2px_4px_rgba(166,175,195,0.3)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Supplier Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="supplier@company.com"
                                                className="w-full py-2.5 pl-10 pr-3 bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 shadow-[inset_2px_2px_4px_rgba(166,175,195,0.3)]"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-pink-50/50 dark:bg-pink-950/20 p-3 rounded-xl border border-pink-100 dark:border-pink-900/30">
                                        An invitation will be emailed to <strong>{email || "the supplier"}</strong>. They will verify with OTP and create their own secure password on first login.
                                    </p>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#1d1e28] text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex-1 py-2.5 px-4 rounded-2xl bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-xs font-bold shadow-[0_3px_10px_rgba(236,72,153,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-3.5 h-3.5" />
                                                    Create & Send Email
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </Portal>
    );
}
