"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { SessionGuard } from "../components/server/SessionGuard";

declare global {
    interface Window {
        openSupplierModal?: (supplierId: string) => void;
        closeModal?: (supplierId: string) => void;
        openNewSupplierModal?: () => void;
        closeNewSupplierModal?: () => void;
        handleNewSupplier?: () => void;
    }
}

interface SupplierData {
    id: string;
    name: string;
    contact: string;
    phone: string;
    email: string;
    location: string;
    category: string;
    products: string[];
    totalOrders: number;
    totalSpent: number;
    avgOrder: number;
    orders: Array<{ po: string; item: string; amount: string; status: string }>;
}

export default function Suppliers() {
    const activityChartRef = useRef<HTMLCanvasElement>(null);
    const activityChartInstance = useRef<Chart | null>(null);

    const showToast = (message: string, type: string = "info") => {
        alert(message);
    };

    const supplierData: Record<string, SupplierData> = {
        "SUP-001": {
            id: "SUP-001",
            name: "ABC Tire Center",
            contact: "Juan Santos",
            phone: "+63 912 345 6789",
            email: "sales@abctires.ph",
            location: "Manila",
            category: "Tire Supplier",
            products: ["Truck Tires", "Tire Tubes", "Wheel Accessories"],
            totalOrders: 15,
            totalSpent: 280000,
            avgOrder: 18700,
            orders: [
                { po: "PO-2026-0031", item: "4 Truck Tires", amount: "₱ 40,000", status: "Delivered" },
                { po: "PO-2026-0028", item: "6 Tire Tubes", amount: "₱ 18,000", status: "Delivered" },
                { po: "PO-2026-0022", item: "8 Truck Tires", amount: "₱ 80,000", status: "Delivered" },
            ],
        },
        "SUP-002": {
            id: "SUP-002",
            name: "AutoPro Parts",
            contact: "Ligaya Reyes",
            phone: "+63 923 456 7890",
            email: "orders@autopro.ph",
            location: "Quezon City",
            category: "Auto Parts Supplier",
            products: ["Brake Components", "Engine Parts", "Filters"],
            totalOrders: 12,
            totalSpent: 195000,
            avgOrder: 16300,
            orders: [
                { po: "PO-2026-0032", item: "Brake Pads Set (10)", amount: "₱ 18,500", status: "Delivered" },
                { po: "PO-2026-0025", item: "Engine Filters (20)", amount: "₱ 15,000", status: "Delivered" },
            ],
        },
        "SUP-003": {
            id: "SUP-003",
            name: "Prime Fuel Supply",
            contact: "Noel Aquino",
            phone: "+63 934 567 8901",
            email: "info@primefuel.ph",
            location: "Pasig",
            category: "Fuel Supplier",
            products: ["Diesel", "Gasoline", "Lubricants"],
            totalOrders: 8,
            totalSpent: 142000,
            avgOrder: 17800,
            orders: [
                { po: "PO-2026-0033", item: "Diesel Fuel 500L", amount: "₱ 32,500", status: "In Transit" },
                { po: "PO-2026-0029", item: "Lubricants (20L)", amount: "₱ 12,000", status: "Delivered" },
            ],
        },
        "SUP-004": {
            id: "SUP-004",
            name: "Packaging Solutions",
            contact: "Maria Cruz",
            phone: "+63 945 678 9012",
            email: "info@packaging.ph",
            location: "Makati",
            category: "Packaging",
            products: ["Shipping Boxes", "Packaging Tape", "Bubble Wrap"],
            totalOrders: 6,
            totalSpent: 85000,
            avgOrder: 14200,
            orders: [
                { po: "PO-2026-0034", item: "Shipping Boxes (500)", amount: "₱ 12,800", status: "Confirmed" },
                { po: "PO-2026-0026", item: "Packaging Tape (100)", amount: "₱ 8,500", status: "Delivered" },
            ],
        },
        "SUP-005": {
            id: "SUP-005",
            name: "Office Depot",
            contact: "Ramon Tan",
            phone: "+63 956 789 0123",
            email: "orders@officedepot.ph",
            location: "Mandaluyong",
            category: "Office Supplies",
            products: ["Paper", "Ink Cartridges", "Office Furniture"],
            totalOrders: 6,
            totalSpent: 65000,
            avgOrder: 10800,
            orders: [
                { po: "PO-2026-0030", item: "Printer Paper (10)", amount: "₱ 8,500", status: "Delivered" },
                { po: "PO-2026-0024", item: "Ink Cartridges (20)", amount: "₱ 12,000", status: "Delivered" },
            ],
        },
    };

    useEffect(() => {
        if (typeof window === "undefined") return;

        function getElement<T extends HTMLElement>(id: string): T | null {
            return document.getElementById(id) as T | null;
        }

        // Modal functions
        window.openSupplierModal = function (supplierId: string) {
            const modal = getElement<HTMLDivElement>("modal-" + supplierId);
            if (modal) {
                modal.classList.remove("hidden");
                document.body.style.overflow = "hidden";
            }
        };

        window.closeModal = function (supplierId: string) {
            const modal = getElement<HTMLDivElement>("modal-" + supplierId);
            if (modal) {
                modal.classList.add("hidden");
                document.body.style.overflow = "auto";
            }
        };

        window.openNewSupplierModal = function () {
            const modal = getElement<HTMLDivElement>("newSupplierModal");
            if (modal) {
                modal.classList.remove("hidden");
                modal.classList.add("flex");
                document.body.style.overflow = "hidden";
            }
        };

        window.closeNewSupplierModal = function () {
            const modal = getElement<HTMLDivElement>("newSupplierModal");
            if (modal) {
                modal.classList.add("hidden");
                modal.classList.remove("flex");
                document.body.style.overflow = "auto";
                // Reset form
                const inputs = modal.querySelectorAll("input, textarea, select");
                inputs.forEach((input: any) => {
                    if (input.type === "text" || input.type === "email" || input.type === "tel") {
                        input.value = "";
                    } else if (input.tagName === "SELECT") {
                        input.value = "";
                    } else if (input.tagName === "TEXTAREA") {
                        input.value = "";
                    }
                });
            }
        };

        window.handleNewSupplier = function () {
            const name = (document.getElementById("supplierName") as HTMLInputElement)?.value;
            const category = (document.getElementById("supplierCategory") as HTMLSelectElement)?.value;
            const contact = (document.getElementById("supplierContact") as HTMLInputElement)?.value;
            const phone = (document.getElementById("supplierPhone") as HTMLInputElement)?.value;
            const email = (document.getElementById("supplierEmail") as HTMLInputElement)?.value;
            const location = (document.getElementById("supplierLocation") as HTMLInputElement)?.value;

            if (!name || !category || !contact || !phone || !email || !location) {
                showToast("Please fill in all required fields", "error");
                return;
            }

            if (window.closeNewSupplierModal) window.closeNewSupplierModal();
            showToast(` Supplier "${name}" has been added successfully!`, "info");

            setTimeout(() => {
                showToast(" New supplier registered in the directory", "info");
            }, 1000);
        };

        // Close modal when clicking outside
        document.addEventListener("click", function (e) {
            const modals = document.querySelectorAll('[id^="modal-"]');
            modals.forEach((modal) => {
                if (e.target === modal) {
                    modal.classList.add("hidden");
                    document.body.style.overflow = "auto";
                }
            });
            const newModal = document.getElementById("newSupplierModal");
            if (e.target === newModal && window.closeNewSupplierModal) {
                window.closeNewSupplierModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                const modals = document.querySelectorAll('[id^="modal-"]:not(.hidden)');
                modals.forEach((modal) => {
                    modal.classList.add("hidden");
                    document.body.style.overflow = "auto";
                });
                const newModal = document.getElementById("newSupplierModal");
                if (newModal && !newModal.classList.contains("hidden") && window.closeNewSupplierModal) {
                    window.closeNewSupplierModal();
                }
            }
        });

        // Create chart
        function createActivityChart() {
            if (activityChartInstance.current) {
                activityChartInstance.current.destroy();
                activityChartInstance.current = null;
            }

            if (activityChartRef.current && Chart) {
                activityChartInstance.current = new Chart(activityChartRef.current, {
                    type: "bar",
                    data: {
                        labels: ["ABC Tires", "AutoPro", "Prime Fuel", "Packaging", "Office Depot"],
                        datasets: [
                            {
                                label: "Total Orders",
                                data: [15, 12, 8, 6, 6],
                                backgroundColor: "#EC4899",
                                borderRadius: 6,
                                barThickness: 32,
                                order: 1,
                            },
                            {
                                label: "Spent (₱K)",
                                data: [280, 195, 142, 85, 65],
                                backgroundColor: "#F472B6",
                                borderRadius: 6,
                                barThickness: 32,
                                order: 2,
                            },
                        ],
                    },
                    options: {
                        plugins: {
                            legend: {
                                position: "top",
                                labels: {
                                    boxWidth: 12,
                                    boxHeight: 12,
                                    usePointStyle: true,
                                    font: { size: 10 },
                                },
                            },
                        },
                        scales: {
                            x: { grid: { display: false } },
                            y: {
                                grid: { color: "#F1F5F9" },
                                beginAtZero: true,
                            },
                        },
                    },
                });
            }
        }

        createActivityChart();

        // Top Suppliers by Orders
        const topSuppliers = document.getElementById("topSuppliers");
        if (topSuppliers) {
            const suppliers = [
                { name: "ABC Tire Center", orders: 15, spent: "₱ 280K", category: "Tire Supplier" },
                { name: "AutoPro Parts", orders: 12, spent: "₱ 195K", category: "Auto Parts" },
                { name: "Prime Fuel Supply", orders: 8, spent: "₱ 142K", category: "Fuel Supplier" },
                { name: "Packaging Solutions", orders: 6, spent: "₱ 85K", category: "Packaging" },
            ];

            const colors = ["bg-pink-500", "bg-rose-400", "bg-fuchsia-400", "bg-purple-400"];
            topSuppliers.innerHTML = "";
            suppliers.forEach((s, index) => {
                const initials = s.name
                    .split(" ")
                    .map((x: string) => x[0])
                    .join("");
                const li = document.createElement("li");
                li.className =
                    "flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition";
                li.innerHTML = `
          <div class="w-8 h-8 rounded-full ${colors[index]} text-white flex items-center justify-center font-bold text-xs flex-shrink-0">${initials}</div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm">${s.name}</div>
            <div class="text-xs text-slate-500">${s.category} · ${s.orders} orders</div>
          </div>
          <div class="text-sm font-semibold text-slate-900">${s.spent}</div>
        `;
                topSuppliers.appendChild(li);
            });
        }

        // Search and filter functionality
        const searchInput = getElement<HTMLInputElement>("sSearch");
        const categoryFilter = getElement<HTMLSelectElement>("sCategory");
        const tableRows = document.querySelectorAll("#sTable tbody tr");

        function filterTable() {
            const searchTerm = searchInput?.value?.toLowerCase() || "";
            const categoryValue = categoryFilter?.value || "";

            tableRows.forEach((row) => {
                const text = row.textContent?.toLowerCase() || "";
                const cells = row.querySelectorAll("td");
                const categoryCell = cells[2];
                const categoryText = categoryCell ? categoryCell.textContent?.trim() || "" : "";

                const matchesSearch = text.includes(searchTerm);
                const matchesCategory = !categoryValue || categoryText === categoryValue;

                (row as HTMLElement).style.display =
                    matchesSearch && matchesCategory ? "" : "none";
            });
        }

        if (searchInput) searchInput.addEventListener("input", filterTable);
        if (categoryFilter) categoryFilter.addEventListener("change", filterTable);

        return () => {
            if (activityChartInstance.current) {
                activityChartInstance.current.destroy();
                activityChartInstance.current = null;
            }
        };
    }, []);

    return (
        <SessionGuard requiredRole={['Admin', 'Employee']}>
            <main className="main-shell bgCard">
                <div className="p-6 space-y-6 fade-in">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                                Supplier &amp; Vendor Management
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Track supplier purchases, order frequency, and spending patterns.
                            </p>
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => {
                                if (window.openNewSupplierModal) window.openNewSupplierModal();
                            }}
                        >
                            + New Supplier
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="card kpi">
                            <div className="label">Active Suppliers</div>
                            <div className="value">8</div>
                            <div className="delta delta-up">▲ 2</div>
                        </div>
                        <div className="card kpi">
                            <div className="label">Total Purchases (YTD)</div>
                            <div className="value">47</div>
                            <div className="delta delta-up">▲ 12%</div>
                        </div>
                        <div className="card kpi">
                            <div className="label">Most Active Supplier</div>
                            <div className="value text-base font-semibold mt-2">ABC Tires</div>
                            <div className="delta text-slate-500">15 orders</div>
                        </div>
                        <div className="card kpi">
                            <div className="label">Top Spending Category</div>
                            <div className="value text-base font-semibold mt-2">Spare Parts</div>
                            <div className="delta text-slate-500">₱ 450K</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                            <div className="font-semibold text-slate-900">Supplier Directory</div>
                            <input
                                id="sSearch"
                                className="input max-w-xs ml-auto"
                                placeholder="Search suppliers…"
                            />
                            <select id="sCategory" className="input max-w-[180px]" defaultValue="">
                                <option value="">All categories</option>
                                <option value="Tire Supplier">Tire Supplier</option>
                                <option value="Auto Parts Supplier">Auto Parts Supplier</option>
                                <option value="Fuel Supplier">Fuel Supplier</option>
                                <option value="Packaging">Packaging</option>
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table-pro" id="sTable">
                                <thead>
                                    <tr>
                                        <th>Supplier ID</th>
                                        <th>Supplier Name</th>
                                        <th>Category</th>
                                        <th>Products / Services</th>
                                        <th>Total Orders</th>
                                        <th>Total Spent</th>
                                        <th>Last Order</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Supplier ID" className="font-mono text-xs">
                                            SUP-001
                                        </td>
                                        <td data-label="Supplier Name">
                                            <div className="font-medium">ABC Tire Center</div>
                                            <div className="text-xs text-slate-500">sales@abctires.ph</div>
                                        </td>
                                        <td data-label="Category">Tire Supplier</td>
                                        <td data-label="Products / Services">
                                            Truck tires, tubes, wheel accessories
                                        </td>
                                        <td data-label="Total Orders" className="font-medium text-center">
                                            15
                                        </td>
                                        <td data-label="Total Spent" className="font-medium">
                                            ₱ 280,000
                                        </td>
                                        <td data-label="Last Order" className="text-xs text-slate-500">
                                            2026-07-18
                                        </td>
                                        <td data-label="Status">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>Active
                                            </span>
                                        </td>
                                        <td data-label="Action" className="text-right">
                                            <button
                                                className="btn-ghost !py-1 !px-2 text-xs"
                                                onClick={() => {
                                                    if (window.openSupplierModal) window.openSupplierModal("SUP-001");
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td data-label="Supplier ID" className="font-mono text-xs">
                                            SUP-002
                                        </td>
                                        <td data-label="Supplier Name">
                                            <div className="font-medium">AutoPro Parts</div>
                                            <div className="text-xs text-slate-500">orders@autopro.ph</div>
                                        </td>
                                        <td data-label="Category">Auto Parts Supplier</td>
                                        <td data-label="Products / Services">
                                            Brake components, engine parts, filters
                                        </td>
                                        <td data-label="Total Orders" className="font-medium text-center">
                                            12
                                        </td>
                                        <td data-label="Total Spent" className="font-medium">
                                            ₱ 195,000
                                        </td>
                                        <td data-label="Last Order" className="text-xs text-slate-500">
                                            2026-07-17
                                        </td>
                                        <td data-label="Status">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>Active
                                            </span>
                                        </td>
                                        <td data-label="Action" className="text-right">
                                            <button
                                                className="btn-ghost !py-1 !px-2 text-xs"
                                                onClick={() => {
                                                    if (window.openSupplierModal) window.openSupplierModal("SUP-002");
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td data-label="Supplier ID" className="font-mono text-xs">
                                            SUP-003
                                        </td>
                                        <td data-label="Supplier Name">
                                            <div className="font-medium">Prime Fuel Supply</div>
                                            <div className="text-xs text-slate-500">info@primefuel.ph</div>
                                        </td>
                                        <td data-label="Category">Fuel Supplier</td>
                                        <td data-label="Products / Services">
                                            Diesel, gasoline, lubricants
                                        </td>
                                        <td data-label="Total Orders" className="font-medium text-center">
                                            8
                                        </td>
                                        <td data-label="Total Spent" className="font-medium">
                                            ₱ 142,000
                                        </td>
                                        <td data-label="Last Order" className="text-xs text-slate-500">
                                            2026-07-16
                                        </td>
                                        <td data-label="Status">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>Inactive
                                            </span>
                                        </td>
                                        <td data-label="Action" className="text-right">
                                            <button
                                                className="btn-ghost !py-1 !px-2 text-xs"
                                                onClick={() => {
                                                    if (window.openSupplierModal) window.openSupplierModal("SUP-003");
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td data-label="Supplier ID" className="font-mono text-xs">
                                            SUP-004
                                        </td>
                                        <td data-label="Supplier Name">
                                            <div className="font-medium">Packaging Solutions</div>
                                            <div className="text-xs text-slate-500">info@packaging.ph</div>
                                        </td>
                                        <td data-label="Category">Packaging</td>
                                        <td data-label="Products / Services">
                                            Shipping boxes, tape, bubble wrap
                                        </td>
                                        <td data-label="Total Orders" className="font-medium text-center">
                                            6
                                        </td>
                                        <td data-label="Total Spent" className="font-medium">
                                            ₱ 85,000
                                        </td>
                                        <td data-label="Last Order" className="text-xs text-slate-500">
                                            2026-07-15
                                        </td>
                                        <td data-label="Status">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>Active
                                            </span>
                                        </td>
                                        <td data-label="Action" className="text-right">
                                            <button
                                                className="btn-ghost !py-1 !px-2 text-xs"
                                                onClick={() => {
                                                    if (window.openSupplierModal) window.openSupplierModal("SUP-004");
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td data-label="Supplier ID" className="font-mono text-xs">
                                            SUP-005
                                        </td>
                                        <td data-label="Supplier Name">
                                            <div className="font-medium">Office Depot</div>
                                            <div className="text-xs text-slate-500">orders@officedepot.ph</div>
                                        </td>
                                        <td data-label="Category">Office Supplies</td>
                                        <td data-label="Products / Services">
                                            Paper, ink, office furniture
                                        </td>
                                        <td data-label="Total Orders" className="font-medium text-center">
                                            6
                                        </td>
                                        <td data-label="Total Spent" className="font-medium">
                                            ₱ 65,000
                                        </td>
                                        <td data-label="Last Order" className="text-xs text-slate-500">
                                            2026-07-14
                                        </td>
                                        <td data-label="Status">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>Active
                                            </span>
                                        </td>
                                        <td data-label="Action" className="text-right">
                                            <button
                                                className="btn-ghost !py-1 !px-2 text-xs"
                                                onClick={() => {
                                                    if (window.openSupplierModal) window.openSupplierModal("SUP-005");
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div data-pager className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Showing 5 of 5 suppliers</span>
                            <div className="flex gap-1">
                                <button className="btn-ghost !py-1 !px-3 text-xs" disabled>
                                    Prev
                                </button>
                                <button className="btn-ghost !py-1 !px-3 text-xs bg-pink-50 border-pink-200">
                                    1
                                </button>
                                <button className="btn-ghost !py-1 !px-3 text-xs" disabled>
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="card p-5 xl:col-span-2">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="font-semibold text-slate-900">Purchase Activity by Supplier</div>
                                    <div className="text-xs text-slate-500">Total orders and spending per supplier</div>
                                </div>
                            </div>
                            <canvas ref={activityChartRef} className="mt-3" height="110"></canvas>
                        </div>
                        <div className="card p-5">
                            <div className="font-semibold text-slate-900">Top Suppliers by Orders</div>
                            <div className="text-xs text-slate-500 mb-3">Most frequently used suppliers</div>
                            <ul className="space-y-3" id="topSuppliers"></ul>
                        </div>
                    </div>

                    <div className="card">
                        <div className="p-4 border-b border-slate-100">
                            <div className="font-semibold text-slate-900">Recent Purchase History</div>
                            <p className="text-xs text-slate-500">Latest orders placed with suppliers</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table-pro">
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Supplier</th>
                                        <th>Item</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Order #" className="font-mono text-xs">
                                            PO-2026-0031
                                        </td>
                                        <td data-label="Supplier">ABC Tire Center</td>
                                        <td data-label="Item">4 Truck Tires</td>
                                        <td data-label="Amount" className="font-medium">
                                            ₱ 40,000
                                        </td>
                                        <td data-label="Date" className="text-xs text-slate-500">
                                            2026-07-18
                                        </td>
                                        <td data-label="Status">
                                            <span className="status-badge status-delivered">Delivered</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td data-label="Order #" className="font-mono text-xs">
                                            PO-2026-0032
                                        </td>
                                        <td data-label="Supplier">AutoPro Parts</td>
                                        <td data-label="Item">Brake Pads Set (10)</td>
                                        <td data-label="Amount" className="font-medium">
                                            ₱ 18,500
                                        </td>
                                        <td data-label="Date" className="text-xs text-slate-500">
                                            2026-07-17
                                        </td>
                                        <td data-label="Status">
                                            <span className="status-badge status-delivered">Delivered</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td data-label="Order #" className="font-mono text-xs">
                                            PO-2026-0033
                                        </td>
                                        <td data-label="Supplier">Prime Fuel Supply</td>
                                        <td data-label="Item">Diesel Fuel 500L</td>
                                        <td data-label="Amount" className="font-medium">
                                            ₱ 32,500
                                        </td>
                                        <td data-label="Date" className="text-xs text-slate-500">
                                            2026-07-16
                                        </td>
                                        <td data-label="Status">
                                            <span className="status-badge status-transit">In Transit</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td data-label="Order #" className="font-mono text-xs">
                                            PO-2026-0034
                                        </td>
                                        <td data-label="Supplier">Packaging Solutions</td>
                                        <td data-label="Item">Shipping Boxes (500)</td>
                                        <td data-label="Amount" className="font-medium">
                                            ₱ 12,800
                                        </td>
                                        <td data-label="Date" className="text-xs text-slate-500">
                                            2026-07-15
                                        </td>
                                        <td data-label="Status">
                                            <span className="status-badge status-confirmed">Confirmed</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {Object.keys(supplierData).map((id) => {
                    const supplier = supplierData[id];
                    return (
                        <div
                            key={id}
                            id={"modal-" + id}
                            className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden"
                        >
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="text-xl font-semibold text-slate-900">
                                                {supplier.name}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {id} · {supplier.category}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (window.closeModal) window.closeModal(id);
                                            }}
                                            className="p-1 rounded-lg hover:bg-slate-100"
                                        >
                                            <svg
                                                className="w-5 h-5 text-slate-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <div className="text-xs text-slate-500">Contact Person</div>
                                            <div className="font-medium">{supplier.contact}</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <div className="text-xs text-slate-500">Phone</div>
                                            <div className="font-medium">{supplier.phone}</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <div className="text-xs text-slate-500">Email</div>
                                            <div className="font-medium text-sm">{supplier.email}</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <div className="text-xs text-slate-500">Location</div>
                                            <div className="font-medium">{supplier.location}</div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="text-sm font-semibold text-slate-900 mb-2">
                                            Products / Services
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {supplier.products.map((product, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium"
                                                >
                                                    {product}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="text-sm font-semibold text-slate-900 mb-2">
                                            Purchase Activity
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-slate-50 p-3 rounded-lg text-center">
                                                <div className="text-xs text-slate-500">Total Orders</div>
                                                <div className="font-bold text-lg text-slate-900">
                                                    {supplier.totalOrders}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-lg text-center">
                                                <div className="text-xs text-slate-500">Total Spent</div>
                                                <div className="font-bold text-lg text-slate-900">
                                                    ₱ {(supplier.totalSpent / 1000).toFixed(0)}K
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-lg text-center">
                                                <div className="text-xs text-slate-500">Avg. Order</div>
                                                <div className="font-bold text-lg text-slate-900">
                                                    ₱ {(supplier.avgOrder / 1000).toFixed(1)}K
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-semibold text-slate-900 mb-2">
                                            Order History
                                        </div>
                                        <ul className="space-y-2 text-sm">
                                            {supplier.orders.map((order, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg"
                                                >
                                                    <div>
                                                        <div className="font-medium">{order.po}</div>
                                                        <div className="text-xs text-slate-500">
                                                            {order.item} · {order.amount}
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`text-xs ${order.status === "Delivered"
                                                            ? "text-emerald-600"
                                                            : order.status === "In Transit"
                                                                ? "text-amber-600"
                                                                : "text-blue-600"
                                                            }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                                        <button
                                            className="btn-ghost"
                                            onClick={() => {
                                                if (window.closeModal) window.closeModal(id);
                                            }}
                                        >
                                            Close
                                        </button>
                                        <button
                                            className="btn-primary"
                                            onClick={() =>
                                                showToast(`Creating new PO for ${supplier.name}`, "info")
                                            }
                                        >
                                            Create Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div
                    id="newSupplierModal"
                    className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden"
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-xl font-semibold text-slate-900">Add New Supplier</div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Register a new supplier for procurement
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.closeNewSupplierModal) window.closeNewSupplierModal();
                                    }}
                                    className="p-1 rounded-lg hover:bg-slate-100"
                                >
                                    <svg
                                        className="w-5 h-5 text-slate-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <form
                                className="mt-4 space-y-4"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (window.handleNewSupplier) window.handleNewSupplier();
                                }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500">
                                            Supplier Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="supplierName"
                                            className="input mt-1"
                                            placeholder="e.g. ABC Tire Center"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500">
                                            Category *
                                        </label>
                                        <select id="supplierCategory" className="input mt-1" required defaultValue="">
                                            <option value="">Select category</option>
                                            <option value="Tire Supplier">Tire Supplier</option>
                                            <option value="Auto Parts Supplier">Auto Parts Supplier</option>
                                            <option value="Fuel Supplier">Fuel Supplier</option>
                                            <option value="Packaging">Packaging</option>
                                            <option value="Office Supplies">Office Supplies</option>
                                            <option value="Warehouse Equipment">Warehouse Equipment</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500">
                                            Contact Person *
                                        </label>
                                        <input
                                            type="text"
                                            id="supplierContact"
                                            className="input mt-1"
                                            placeholder="Full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="supplierPhone"
                                            className="input mt-1"
                                            placeholder="+63 912 345 6789"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="supplierEmail"
                                            className="input mt-1"
                                            placeholder="contact@supplier.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500">
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            id="supplierLocation"
                                            className="input mt-1"
                                            placeholder="City, Province"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-500">
                                        Products / Services
                                    </label>
                                    <textarea
                                        id="supplierProducts"
                                        className="input mt-1"
                                        rows={2}
                                        placeholder="List products or services offered"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-500">Notes</label>
                                    <textarea
                                        id="supplierNotes"
                                        className="input mt-1"
                                        rows={2}
                                        placeholder="Additional information about the supplier"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        className="btn-ghost"
                                        onClick={() => {
                                            if (window.closeNewSupplierModal) window.closeNewSupplierModal();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Add Supplier
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </SessionGuard>
    );
}