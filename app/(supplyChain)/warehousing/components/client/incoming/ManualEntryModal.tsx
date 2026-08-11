"use client";

import { useEffect, useRef } from "react";

export default function ManualEntryModal() {
    const modalRef = useRef<HTMLDivElement>(null);

    const showToast = (message: string, type: string = "info") => {
        alert(message);
    };

    useEffect(() => {
        // Manual Entry Modal functions
        window.openManualEntryModal = function () {
            const modal = document.getElementById("manualEntryModal");
            if (modal) {
                modal.classList.remove("hidden");
                document.body.style.overflow = "hidden";
            }
        };

        window.closeManualEntryModal = function () {
            const modal = document.getElementById("manualEntryModal");
            if (modal) {
                modal.classList.add("hidden");
                document.body.style.overflow = "auto";
                // Reset form
                const inputs = modal.querySelectorAll("input, textarea, select");
                inputs.forEach((input: any) => {
                    if (input.type === "text" || input.type === "textarea") {
                        input.value = "";
                    } else if (input.tagName === "SELECT") {
                        input.value = "";
                    }
                });
                const statusSelect = document.getElementById(
                    "manualStatus"
                ) as HTMLSelectElement;
                if (statusSelect) statusSelect.value = "Received";
            }
        };

        window.handleManualEntry = function () {
            const barcode = (document.getElementById("manualBarcode") as HTMLInputElement)
                ?.value;
            const tracking = (
                document.getElementById("manualTracking") as HTMLInputElement
            )?.value;
            const destination = (
                document.getElementById("manualDestination") as HTMLInputElement
            )?.value;

            if (!barcode || !tracking || !destination) {
                showToast("Please fill in all required fields", "error");
                return;
            }

            if (window.closeManualEntryModal) {
                window.closeManualEntryModal();
            }
            showToast("Parcel " + barcode + " added successfully!", "info");

            setTimeout(() => {
                showToast(" Parcel is now in the sorting queue", "info");
            }, 1000);
        };

        // Close modal on backdrop click
        const modal = document.getElementById("manualEntryModal");
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === e.currentTarget && window.closeManualEntryModal) {
                    window.closeManualEntryModal();
                }
            });
        }

        // Close modal on Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && window.closeManualEntryModal) {
                window.closeManualEntryModal();
            }
        });

    }, []);

    return (
        <div
            id="manualEntryModal"
            ref={modalRef}
            className="fixed inset-0 z-90 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-xl font-semibold text-slate-900">
                                <i className="fas fa-pen text-pink-500 mr-2"></i> Manual Entry
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Enter parcel details manually</p>
                        </div>
                        <button
                            onClick={() => {
                                if (window.closeManualEntryModal) window.closeManualEntryModal();
                            }}
                            className="p-1 rounded-lg hover:bg-slate-100"
                        >
                            <i className="fas fa-times text-slate-400 text-xl"></i>
                        </button>
                    </div>

                    <form
                        className="mt-4 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (window.handleManualEntry) window.handleManualEntry();
                        }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500">
                                    <i className="fas fa-barcode mr-1"></i> Barcode *
                                </label>
                                <input type="text" id="manualBarcode" className="input mt-1" placeholder="e.g. AX-1023" required />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">
                                    <i className="fas fa-hashtag mr-1"></i> Tracking Number *
                                </label>
                                <input type="text" id="manualTracking" className="input mt-1" placeholder="e.g. TRK-8821" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500">
                                    <i className="fas fa-user mr-1"></i> Sender
                                </label>
                                <input type="text" id="manualSender" className="input mt-1" placeholder="Sender name" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">
                                    <i className="fas fa-map-pin mr-1"></i> Destination *
                                </label>
                                <input type="text" id="manualDestination" className="input mt-1" placeholder="e.g. Makati" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500">
                                    <i className="fas fa-truck mr-1"></i> Courier
                                </label>
                                <select id="manualCourier" className="input mt-1" defaultValue="">
                                    <option value="">Select courier</option>
                                    <option value="J&T Express">J&T Express</option>
                                    <option value="LBC Express">LBC Express</option>
                                    <option value="Flash Express">Flash Express</option>
                                    <option value="Air21">Air21</option>
                                    <option value="JRS Express">JRS Express</option>
                                    <option value="Shopee">Shopee</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">
                                    <i className="fas fa-tag mr-1"></i> Status
                                </label>
                                <select id="manualStatus" className="input mt-1" defaultValue="Received">
                                    <option value="Received">Received</option>
                                    <option value="Sorting">Sorting</option>
                                    <option value="Ready for Pickup">Ready for Pickup</option>
                                    <option value="In Transit">In Transit</option>
                                    <option value="Delivered">Delivered</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-500">
                                <i className="fas fa-sticky-note mr-1"></i> Notes
                            </label>
                            <textarea
                                id="manualNotes"
                                className="input mt-1"
                                rows={2}
                                placeholder="Additional details about this parcel"
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => {
                                    if (window.closeManualEntryModal) window.closeManualEntryModal();
                                }}
                            >
                                <i className="fas fa-times mr-2"></i> Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                <i className="fas fa-save mr-2"></i> Save Parcel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}