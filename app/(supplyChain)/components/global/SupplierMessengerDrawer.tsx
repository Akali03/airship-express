"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    MessageSquare, 
    Send, 
    Search, 
    Building2, 
    User, 
    X, 
    FileText, 
    Clock, 
    Loader2, 
    CheckCheck,
    Minimize2,
    Maximize2,
    Sparkles,
    ShieldCheck
} from "lucide-react";
import { supabase } from "../../lib/services/client/supabase";
import { user } from "../../lib/services/Class/user";
import { toast } from "sonner";
import Portal from "../client/Portal";

interface SupplierMessengerDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    initialSupplierId?: number | null;
}

export function SupplierMessengerDrawer({
    isOpen,
    onClose,
    initialSupplierId,
}: SupplierMessengerDrawerProps) {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [selectedPo, setSelectedPo] = useState<string>("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUserName = user.getName() || "Procurement Staff";
    const currentUserEmail = user.getEmail();
    const currentUserRole = user.getRole();
    const currentUserId = user.getUserId();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Load supplier list
    useEffect(() => {
        if (!isOpen) return;

        const loadSuppliers = async () => {
            setIsLoadingSuppliers(true);
            try {
                const { data, error } = await supabase
                    .from("suppliers")
                    .select("id, name, email, contact_person, category, is_active")
                    .order("name", { ascending: true });

                if (!error && data) {
                    setSuppliers(data);
                    if (initialSupplierId) {
                        const match = data.find((s) => s.id === initialSupplierId);
                        if (match) setSelectedSupplier(match);
                        else if (data.length > 0) setSelectedSupplier(data[0]);
                    } else if (data.length > 0 && !selectedSupplier) {
                        setSelectedSupplier(data[0]);
                    }
                }
            } catch (err) {
                console.error("Error loading suppliers for chat:", err);
            } finally {
                setIsLoadingSuppliers(false);
            }
        };

        loadSuppliers();
    }, [isOpen, initialSupplierId]);

    // Load messages when selected supplier changes
    useEffect(() => {
        if (!isOpen || !selectedSupplier) return;

        const loadChat = async () => {
            setIsLoadingMessages(true);
            try {
                // Fetch POs
                const { data: pos } = await supabase
                    .from("purchase_orders")
                    .select("id, po_number, status, total_amount")
                    .eq("supplier_id", selectedSupplier.id)
                    .order("created_at", { ascending: false });

                setPurchaseOrders(pos || []);

                // Fetch Messages
                const { data: msgs } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("supplier_id", selectedSupplier.id)
                    .order("created_at", { ascending: true });

                setMessages(msgs || []);
            } catch (err) {
                console.error("Error loading chat:", err);
                setMessages([]);
            } finally {
                setIsLoadingMessages(false);
                setTimeout(scrollToBottom, 100);
            }
        };

        loadChat();

        // Subscribe to live messages
        const channel = supabase
            .channel(`dock_chat_${selectedSupplier.id}_${Date.now()}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `supplier_id=eq.${selectedSupplier.id}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new]);
                    setTimeout(scrollToBottom, 50);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, selectedSupplier]);

    // Send Message
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedSupplier) return;

        setIsSending(true);
        const text = inputText.trim();
        setInputText("");

        try {
            const newMsg = {
                supplier_id: selectedSupplier.id,
                purchase_order_id: selectedPo || null,
                sender_type: "internal",
                sender_id: currentUserId || null,
                sender_name: currentUserName || "Supply Chain Staff",
                sender_email: currentUserEmail || "staff@airship.com",
                sender_role: currentUserRole || "Manager",
                role: currentUserRole || "Manager",
                message: text,
                is_read: false,
                attachments: [],
                created_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from("messages")
                .insert(newMsg)
                .select()
                .single();

            if (error) {
                setMessages((prev) => [...prev, { ...newMsg, id: Date.now().toString() }]);
            } else if (data) {
                setMessages((prev) => [...prev.filter((m) => m.id !== data.id), data]);
            }

            setTimeout(scrollToBottom, 50);
        } catch (err: any) {
            toast.error("Failed to send message: " + err.message);
        } finally {
            setIsSending(false);
        }
    };

    const filteredSuppliers = suppliers.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto">
                <div 
                    className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={onClose}
                />

                <div className="relative bg-[#f0f3f8] dark:bg-[#191a24] rounded-t-3xl sm:rounded-3xl max-w-4xl w-full h-[85vh] sm:h-[650px] max-h-[95vh] flex border border-white/80 dark:border-[#2c2d3c] shadow-[12px_12px_36px_rgba(166,175,195,0.5),-12px_-12px_36px_rgba(255,255,255,0.95)] dark:shadow-[14px_14px_40px_rgba(0,0,0,0.85)] animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 z-10 overflow-hidden">
                    
                    {/* Left Panel: Supplier Conversation List */}
                    <div className="w-72 sm:w-80 border-r border-slate-200/70 dark:border-slate-800 flex flex-col bg-white/50 dark:bg-[#14151e]">
                        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-sm">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                        Supplier Messages
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Internal Channel</p>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="p-3 border-b border-slate-200/60 dark:border-slate-800">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search supplier..."
                                    className="w-full py-1.5 pl-8 pr-3 bg-[#ebf0f7] dark:bg-[#101118] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500"
                                />
                            </div>
                        </div>

                        {/* Supplier List */}
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                            {isLoadingSuppliers ? (
                                <div className="py-8 text-center">
                                    <Loader2 className="w-5 h-5 text-pink-500 animate-spin mx-auto mb-1" />
                                    <span className="text-[11px] text-slate-400">Loading partners...</span>
                                </div>
                            ) : filteredSuppliers.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-400">
                                    No matching suppliers found.
                                </div>
                            ) : (
                                filteredSuppliers.map((sup) => {
                                    const isSelected = selectedSupplier?.id === sup.id;
                                    return (
                                        <button
                                            key={sup.id}
                                            type="button"
                                            onClick={() => setSelectedSupplier(sup)}
                                            className={`w-full p-3 text-left transition-all flex items-start gap-3 cursor-pointer ${
                                                isSelected
                                                    ? "bg-pink-50/80 dark:bg-pink-950/40 border-l-4 border-pink-500"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                            }`}
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-[#ebf0f7] dark:bg-[#181924] text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700">
                                                {sup.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                                        {sup.name}
                                                    </h4>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                    {sup.contact_person || sup.category || "Supplier"}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Conversation View */}
                    <div className="flex-1 flex flex-col bg-[#f0f3f8] dark:bg-[#191a24]">
                        {selectedSupplier ? (
                            <>
                                {/* Conversation Header */}
                                <div className="p-4 bg-white/70 dark:bg-[#161722] border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200/80 dark:border-pink-900/40 flex items-center justify-center shadow-[inset_1.5px_1.5px_3px_rgba(166,175,195,0.3)]">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                                {selectedSupplier.name}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {selectedSupplier.contact_person} • {selectedSupplier.email}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-xl bg-[#ebf0f7] dark:bg-[#14151c] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center border border-slate-200/60 dark:border-slate-800 transition-all cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* PO Tag selector */}
                                {purchaseOrders.length > 0 && (
                                    <div className="px-4 py-1.5 bg-slate-100/70 dark:bg-[#12131b] border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-2 text-xs">
                                        <span className="text-[11px] text-slate-500 font-semibold shrink-0">
                                            Tag PO:
                                        </span>
                                        <select
                                            value={selectedPo}
                                            onChange={(e) => setSelectedPo(e.target.value)}
                                            className="py-0.5 px-2 bg-white dark:bg-[#1e1f2b] border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            <option value="">None (General)</option>
                                            {purchaseOrders.map((po) => (
                                                <option key={po.id} value={po.po_number}>
                                                    #{po.po_number} - {po.status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Messages Area */}
                                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5">
                                    {isLoadingMessages ? (
                                        <div className="h-full flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                            <div className="w-12 h-12 rounded-2xl bg-[#ebf0f7] dark:bg-[#14151c] text-slate-400 flex items-center justify-center mb-2">
                                                <MessageSquare className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                No messages yet with {selectedSupplier.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                                                Type below to send a message directly to their portal.
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => {
                                            const isInternal = msg.sender_type === "internal";
                                            return (
                                                <div
                                                    key={msg.id || index}
                                                    className={`flex flex-col ${isInternal ? "items-end" : "items-start"}`}
                                                >
                                                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                            {isInternal ? `You (${msg.sender_role || "Staff"})` : msg.sender_name || selectedSupplier.name}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>

                                                    <div
                                                        className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                                                            isInternal
                                                                ? "bg-pink-500 text-white rounded-br-none shadow-[0_2px_8px_rgba(236,72,153,0.3)]"
                                                                : "bg-white dark:bg-[#1d1e28] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-bl-none shadow-sm"
                                                        }`}
                                                    >
                                                        {msg.purchase_order_id && (
                                                            <div className={`mb-1 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                                                                isInternal ? "bg-pink-600/60 text-pink-100" : "bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400"
                                                            }`}>
                                                                <FileText className="w-3 h-3" />
                                                                <span>PO #{msg.purchase_order_id}</span>
                                                            </div>
                                                        )}
                                                        <p className="whitespace-pre-wrap">{msg.message}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Send Input Form */}
                                <form onSubmit={handleSend} className="p-3 bg-white/70 dark:bg-[#151620] border-t border-slate-200/60 dark:border-slate-800 flex gap-2">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder={`Message ${selectedSupplier.name}...`}
                                        className="flex-1 py-2 px-3.5 bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-pink-500 shadow-[inset_1.5px_1.5px_3px_rgba(166,175,195,0.3)]"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSending || !inputText.trim()}
                                        className="py-2 px-4 rounded-2xl bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-xs font-bold shadow-[0_2px_8px_rgba(236,72,153,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        {isSending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Send</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-center p-6">
                                <p className="text-xs text-slate-400 font-semibold">
                                    Select a supplier from the list to begin messaging.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
}
