"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { SessionGuard } from "../components/server/SessionGuard";

declare global {
    interface Window {
        openPODetails?: (poNumber: string) => void;
        closePODetails?: () => void;
    }
}

interface POData {
    number: string;
    supplier: string;
    category: string;
    status: string;
    priority: string;
    department: string;
    amount: string;
    items: string;
    qty: number;
    expected: string;
    instructions: string;
}

export default function PurchaseOrders() {
    const poChartRef = useRef<HTMLCanvasElement>(null);
    const poChartInstance = useRef<Chart | null>(null);

    const showToast = (message: string, type: string = "info") => {
        alert(message);
    };

    const poData: Record<string, POData> = {
        "PO-2026-0031": {
            number: "PO-2026-0031",
            supplier: "ABC Tire Center",
            category: "Truck Parts",
            status: "In Transit",
            priority: "Urgent",
            department: "Fleet",
            amount: "₱ 40,000",
            items: "4 Truck Tires",
            qty: 4,
            expected: "2026-07-22",
            instructions: "Deliver to Fleet Warehouse",
        },
        "PO-2026-0032": {
            number: "PO-2026-0032",
            supplier: "AutoPro Parts",
            category: "Spare Parts",
            status: "Completed",
            priority: "Normal",
            department: "Fleet",
            amount: "₱ 18,500",
            items: "Brake Pads Set (10)",
            qty: 10,
            expected: "2026-07-20",
            instructions: "Deliver to Maintenance Bay",
        },
        "PO-2026-0033": {
            number: "PO-2026-0033",
            supplier: "Prime Fuel Supply",
            category: "Fuel",
            status: "Pending Confirmation",
            priority: "Urgent",
            department: "Fleet",
            amount: "₱ 32,500",
            items: "Diesel Fuel 500L",
            qty: 500,
            expected: "2026-07-19",
            instructions: "Deliver to Fuel Depot",
        },
        "PO-2026-0034": {
            number: "PO-2026-0034",
            supplier: "Packaging Solutions",
            category: "Packaging",
            status: "Confirmed",
            priority: "Normal",
            department: "Warehouse",
            amount: "₱ 12,800",
            items: "Shipping Boxes (500)",
            qty: 500,
            expected: "2026-07-18",
            instructions: "Deliver to Warehouse A",
        },
    };

    useEffect(() => {
        if (typeof window === "undefined") return;

        function getElement<T extends HTMLElement>(id: string): T | null {
            return document.getElementById(id) as T | null;
        }

        // PO Details Modal functions
        window.openPODetails = function (poNumber: string) {
            const data = poData[poNumber];
            if (!data) return;

            const detailNumber = getElement<HTMLDivElement>("poDetailNumber");
            const detailSupplier = getElement<HTMLDivElement>("poDetailSupplier");
            const detailStatus = getElement<HTMLDivElement>("poDetailStatus");
            const detailPriority = getElement<HTMLDivElement>("poDetailPriority");
            const detailDept = getElement<HTMLDivElement>("poDetailDept");
            const detailAmount = getElement<HTMLDivElement>("poDetailAmount");
            const detailItems = getElement<HTMLSpanElement>("poDetailItems");
            const detailQty = getElement<HTMLSpanElement>("poDetailQty");
            const detailExpected = getElement<HTMLDivElement>("poDetailExpected");
            const detailInstructions = getElement<HTMLDivElement>("poDetailInstructions");

            if (detailNumber) detailNumber.textContent = data.number;
            if (detailSupplier) detailSupplier.textContent = data.supplier + " · " + data.category;
            if (detailStatus) detailStatus.textContent = data.status;
            if (detailPriority) detailPriority.textContent = data.priority;
            if (detailDept) detailDept.textContent = data.department;
            if (detailAmount) detailAmount.textContent = data.amount;
            if (detailItems) detailItems.textContent = data.items;
            if (detailQty) detailQty.textContent = "Qty: " + data.qty;
            if (detailExpected) detailExpected.textContent = data.expected;
            if (detailInstructions) detailInstructions.textContent = data.instructions;

            const modal = getElement<HTMLDivElement>("poDetailsModal");
            if (modal) {
                modal.classList.remove("hidden");
                document.body.style.overflow = "hidden";
            }
        };

        window.closePODetails = function () {
            const modal = getElement<HTMLDivElement>("poDetailsModal");
            if (modal) {
                modal.classList.add("hidden");
                document.body.style.overflow = "auto";
            }
        };

        // Close modal when clicking outside
        const modal = getElement<HTMLDivElement>("poDetailsModal");
        if (modal) {
            modal.addEventListener("click", function (e) {
                if (e.target === modal && window.closePODetails) {
                    window.closePODetails();
                }
            });
        }

        // Create chart
        function createPOChart() {
            if (poChartInstance.current) {
                poChartInstance.current.destroy();
                poChartInstance.current = null;
            }

            if (poChartRef.current && Chart) {
                const statusData = {
                    Draft: 2,
                    "Pending Confirmation": 8,
                    Confirmed: 15,
                    "In Transit": 12,
                    Delivered: 5,
                    Completed: 83,
                    Cancelled: 0,
                };

                poChartInstance.current = new Chart(poChartRef.current, {
                    type: "bar",
                    data: {
                        labels: Object.keys(statusData),
                        datasets: [
                            {
                                label: "Purchase Orders",
                                data: Object.values(statusData),
                                backgroundColor: [
                                    "#D1D5DB",
                                    "#FCD34D",
                                    "#93C5FD",
                                    "#FBCFE8",
                                    "#6EE7B7",
                                    "#34D399",
                                    "#FCA5A5",
                                ],
                                borderRadius: 6,
                                borderSkipped: false,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: { font: { size: 9 } },
                            },
                            y: {
                                grid: { color: "#F1F5F9" },
                                beginAtZero: true,
                                ticks: { stepSize: 20 },
                            },
                        },
                    },
                });
            }
        }

        createPOChart();

        // Search and filter functionality
        const searchInput = getElement<HTMLInputElement>("poSearch");
        const statusFilter = getElement<HTMLSelectElement>("poStatus");
        const tableRows = document.querySelectorAll("#poTable tbody tr");

        function filterTable() {
            const searchTerm = searchInput?.value?.toLowerCase() || "";
            const statusValue = statusFilter?.value || "";

            tableRows.forEach((row) => {
                const text = row.textContent?.toLowerCase() || "";
                const cells = row.querySelectorAll("td");
                const statusCell = cells[8];
                const statusText = statusCell ? statusCell.textContent?.trim() || "" : "";

                const matchesSearch = text.includes(searchTerm);
                const matchesStatus = !statusValue || statusText === statusValue;

                (row as HTMLElement).style.display =
                    matchesSearch && matchesStatus ? "" : "none";
            });
        }

        if (searchInput) searchInput.addEventListener("input", filterTable);
        if (statusFilter) statusFilter.addEventListener("change", filterTable);

        // New PO Modal
        const newPOButton = document.getElementById("newPO");
        if (newPOButton) {
            newPOButton.addEventListener("click", () => {
                const wrap = document.createElement("div");
                wrap.className =
                    "fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in";
                wrap.innerHTML = `
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200">
            <div class="p-6">
              <div class="text-lg font-semibold text-slate-900">Create Purchase Order</div>
              <p class="text-sm text-slate-500 mt-1">Create an order from an approved purchase request.</p>
              <form class="mt-4 space-y-3" onsubmit="event.preventDefault(); this.closest('.fixed').remove(); alert('PO created');">
                <div>
                  <label class="text-xs font-medium text-slate-500">Purchase Request Reference</label>
                  <input class="input mt-1" placeholder="e.g. PR-2026-001" required />
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500">Supplier</label>
                  <select class="input mt-1" required>
                    <option>ABC Tire Center</option>
                    <option>AutoPro Parts</option>
                    <option>Prime Fuel Supply</option>
                    <option>Packaging Solutions</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500">Supplier Category</label>
                  <input class="input mt-1" placeholder="Auto-filled" readonly />
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500">Items</label>
                  <input class="input mt-1" placeholder="e.g. 4x Truck Tires" required />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs font-medium text-slate-500">Quantity</label>
                    <input class="input mt-1" type="number" placeholder="1" required />
                  </div>
                  <div>
                    <label class="text-xs font-medium text-slate-500">Unit Price (₱)</label>
                    <input class="input mt-1" placeholder="0.00" required />
                  </div>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500">Total Amount</label>
                  <input class="input mt-1" placeholder="Auto-calculated" readonly />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs font-medium text-slate-500">Expected Delivery Date</label>
                    <input type="date" class="input mt-1" required />
                  </div>
                  <div>
                    <label class="text-xs font-medium text-slate-500">Priority</label>
                    <select class="input mt-1">
                      <option>Normal</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500">Delivery Instructions</label>
                  <textarea class="input mt-1" rows="2" placeholder="Special delivery instructions..."></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                  <button type="button" class="btn-ghost" onclick="this.closest('.fixed').remove()">Cancel</button>
                  <button class="btn-primary">Create PO</button>
                </div>
              </form>
            </div>
          </div>
        `;
                wrap.addEventListener("click", (e) => {
                    if (e.target === wrap) wrap.remove();
                });
                document.body.appendChild(wrap);
            });
        }

        return () => {
            if (poChartInstance.current) {
                poChartInstance.current.destroy();
                poChartInstance.current = null;
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
                                Purchase Orders
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Manage approved purchase orders, supplier orders, and delivery tracking.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="btn-ghost"
                                onClick={() => showToast("Export started", "info")}
                            >
                                Export PDF
                            </button>
                            <button className="btn-primary" id="newPO">
                                + Create PO
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="card kpi">
                            <div className="label">Total Purchase Orders</div>
                            <div className="value">125</div>
                            <div className="delta delta-up">▲ 8</div>
                        </div>
                        <div className="card kpi">
                            <div className="label">Pending Confirmation</div>
                            <div className="value">8</div>
                            <div className="delta text-amber-600">Awaiting supplier</div>
                        </div>
                        <div className="card kpi">
                            <div className="label">Awaiting Delivery</div>
                            <div className="value">12</div>
                            <div className="delta text-pink-600">In transit</div>
                        </div>
                        <div className="card kpi">
                            <div className="label">Completed Orders</div>
                            <div className="value">105</div>
                            <div className="delta delta-up">▲ 14</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="card p-5">
                            <div className="font-semibold text-slate-900">Purchase Order Status</div>
                            <div className="chart-container mt-3">
                                <canvas ref={poChartRef}></canvas>
                            </div>
                        </div>
                        <div className="card p-5">
                            <div className="font-semibold text-slate-900 text-sm">PO Timeline (PO-2026-0031)</div>
                            <ol className="mt-3 relative pl-6">
                                <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200"></div>
                                <li className="relative mb-3">
                                    <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <div className="text-sm">PO Created</div>
                                    <div className="text-xs text-slate-500">Jul 18, 09:14</div>
                                </li>
                                <li className="relative mb-3">
                                    <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <div className="text-sm">Sent to Supplier</div>
                                    <div className="text-xs text-slate-500">Jul 18, 11:02</div>
                                </li>
                                <li className="relative mb-3">
                                    <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-pink-500"></div>
                                    <div className="text-sm">Supplier Confirmed</div>
                                    <div className="text-xs text-slate-500">Jul 18, 13:48</div>
                                </li>
                                <li className="relative mb-3">
                                    <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                                    <div className="text-sm font-medium text-amber-600">In Transit</div>
                                    <div className="text-xs text-slate-500">ETA Jul 22</div>
                                </li>
                            </ol>
                        </div>
                    </div>

                    <div className="card">
                        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                            <div className="font-semibold text-slate-900">Purchase Orders</div>
                            <input
                                id="poSearch"
                                className="input max-w-xs ml-auto"
                                placeholder="Search PO # or supplier…"
                            />
                            <select id="poStatus" className="input max-w-50" defaultValue="">
                                <option value="">All</option>
                                <option value="Draft">Draft</option>
                                <option value="Pending Confirmation">Pending Confirmation</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table-pro" id="poTable">
                                <thead>
                                    <tr>
                                        <th>PO Number</th>
                                        <th>Supplier</th>
                                        <th>Category</th>
                                        <th>Items</th>
                                        <th>Department</th>
                                        <th>Amount</th>
                                        <th>Issue Date</th>
                                        <th>Delivery Date</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="PO Number" className="font-mono text-xs">
                                            PO-2026-0031
                                        </td>
                                        <td data-label="Supplier">
                                            <div className="font-medium">ABC Tire Center</div>
                                            <div className="text-xs text-slate-500">Tire Supplier</div>
                                        </td>
                                        <td data-label="Category">Truck Parts</td>
                                        <td data-label="Items">4 Truck Tires</td>
                                        <td data-label="Department">Fleet</td>
                                        <td data-label="Amount" className="font-medium">
                                            ₱ 40,000
                                        </td>
                                        <td data-label="Issue Date" className="text-xs text-slate-500">
                                            2026-07-18
                                        </td>
                                        <td data-label="Delivery Date" className="text-xs text-slate-500">
                                            2026-07-22
                                        </td>
                                        <td data-label="Status">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200">
                                                In Transit
                                            </span>
                                        </td>
                                        <td data-label="Action" className="text-right space-x-1">
                                            <button
                                                className="btn-ghost py-1 px-2 text-xs"
                                                onClick={() => {
                                                    if (window.openPODetails) window.openPODetails("PO-2026-0031");
                                                }}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="btn-ghost py-1! px-2! text-xs"
                                                onClick={() => showToast("Print dialog opened", "info")}
                                            >
                                                Print
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td data-label="PO Number" className="font-mono text-xs">
                                            PO-2026-0032
                                        </td>
                                        <td data-label="Supplier">
                                            <div className="font-medium">AutoPro Parts</div>
                                            <div className="text-xs text-slate-500">Auto Parts Supplier</div>
                                        </td>
                                        <td data-label="Category">Spare Parts</td>
                                        <td data-label="Items">Brake Pads Set (10)</td>
                                        <td data-label="Department">Fleet</td>
                                        <td data-label="Amount" className="font-medium">
                                            ₱ 18,500
                                        </td>
                                        <td data-label="Issue Date" className="text-xs text-slate-500">
                                            2026-07-17
                                        </td>
                                        <td data-label="Delivery Date" className="text-xs text-slate-500">
                                            2026-07-20
                                        </td>
                                        <td data-label="Status">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Completed
                                            </span>
                                        </td>
                                        <td data-label="Action" className="text-right space-x-1">
                                            <button
                                                className="btn-ghost py-1! px-2! text-xs"
                                                onClick={() => {
                                                    if (window.openPODetails) window.openPODetails("PO-2026-0032");
                                                }}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="btn-ghost py-1! px-2! text-xs"
                                                onClick={() => showToast("Print dialog opened", "info")}
                                            >
                                                Print
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td data-label="PO Number" className="font-mono text-xs">
                                            PO-2026-0033
                                        </td>
                                        <td data-label="Supplier">
                                            <div className="font-medium">Prime Fuel Supply</div>
                                            <div className="text-xs text-slate-500">Fuel Supplier</div>
                                        </td>
                                        <td data-label="Category">Fuel</td>
                                        <td data-label="Items">Diesel Fuel 500L</td>
                                        <td data-label="Department">Fleet</td>
                                        <td data-label="Amount" className="font-medium">
                                            ₱ 32,500
                                        </td>
                                        <td data-label="Issue Date" className="text-xs text-slate-500">
                                            2026-07-16
                                        </td>
                                        <td data-label="Delivery Date" className="text-xs text-slate-500">
                                            2026-07-19
                                        </td>
                                        <td data-label="Status">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                Pending Confirmation
                                            </span>
                                        </td>
                                        <td data-label="Action" className="text-right space-x-1">
                                            <button
                                                className="btn-ghost py-1! px-2! text-xs"
                                                onClick={() => {
                                                    if (window.openPODetails) window.openPODetails("PO-2026-0033");
                                                }}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="btn-ghost py-1! px-2! text-xs"
                                                onClick={() => showToast("Print dialog opened", "info")}
                                            >
                                                Print
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td data-label="PO Number" className="font-mono text-xs">
                                            PO-2026-0034
                                        </td>
                                        <td data-label="Supplier">
                                            <div className="font-medium">Packaging Solutions</div>
                                            <div className="text-xs text-slate-500">Packaging Supplier</div>
                                        </td>
                                        <td data-label="Category">Packaging</td>
                                        <td data-label="Items">Shipping Boxes (500)</td>
                                        <td data-label="Department">Warehouse</td>
                                        <td data-label="Amount" className="font-medium">
                                            ₱ 12,800
                                        </td>
                                        <td data-label="Issue Date" className="text-xs text-slate-500">
                                            2026-07-15
                                        </td>
                                        <td data-label="Delivery Date" className="text-xs text-slate-500">
                                            2026-07-18
                                        </td>
                                        <td data-label="Status">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                Confirmed
                                            </span>
                                        </td>
                                        <td data-label="Action" className="text-right space-x-1">
                                            <button
                                                className="btn-ghost py-1! px-2! text-xs"
                                                onClick={() => {
                                                    if (window.openPODetails) window.openPODetails("PO-2026-0034");
                                                }}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="btn-ghost py-1! px-2! text-xs"
                                                onClick={() => showToast("Print dialog opened", "info")}
                                            >
                                                Print
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div data-pager className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Showing 4 of 4 POs</span>
                            <div className="flex gap-1">
                                <button className="btn-ghost py-1! px-3! text-xs" disabled>
                                    Prev
                                </button>
                                <button className="btn-ghost py-1! px-3! text-xs bg-pink-50 border-pink-200">
                                    1
                                </button>
                                <button className="btn-ghost py-1! px-3! text-xs" disabled>
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-slate-900">Recent Purchase Orders</h3>
                                <p className="text-xs text-slate-500">Latest orders and their status</p>
                            </div>
                            <button
                                className="btn-ghost text-xs"
                                onClick={() => showToast("Viewing all POs", "info")}
                            >
                                View All →
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-50 rounded-lg p-4 hover:bg-pink-50 transition">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-semibold text-slate-700">
                                        PO-2026-0031
                                    </span>
                                    <span className="text-xs font-medium text-pink-600">In Transit</span>
                                </div>
                                <div className="mt-1 text-sm font-medium">ABC Tire Center</div>
                                <div className="text-xs text-slate-500">4 Truck Tires · ₱40,000</div>
                                <div className="mt-2 text-xs text-slate-400">ETA: Jul 22</div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 hover:bg-pink-50 transition">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-semibold text-slate-700">
                                        PO-2026-0032
                                    </span>
                                    <span className="text-xs font-medium text-emerald-600">Completed</span>
                                </div>
                                <div className="mt-1 text-sm font-medium">AutoPro Parts</div>
                                <div className="text-xs text-slate-500">Brake Pads Set · ₱18,500</div>
                                <div className="mt-2 text-xs text-slate-400">Delivered: Jul 20</div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 hover:bg-pink-50 transition">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-semibold text-slate-700">
                                        PO-2026-0033
                                    </span>
                                    <span className="text-xs font-medium text-amber-600">Pending Confirmation</span>
                                </div>
                                <div className="mt-1 text-sm font-medium">Prime Fuel Supply</div>
                                <div className="text-xs text-slate-500">Diesel 500L · ₱32,500</div>
                                <div className="mt-2 text-xs text-slate-400">Awaiting supplier response</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    id="poDetailsModal"
                    className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden"
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-xl font-semibold text-slate-900" id="poDetailNumber">
                                        PO-2026-0031
                                    </div>
                                    <div className="text-sm text-slate-500" id="poDetailSupplier">
                                        ABC Tire Center · Truck Parts
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.closePODetails) window.closePODetails();
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
                                    <div className="text-xs text-slate-500">Status</div>
                                    <div className="font-medium" id="poDetailStatus">
                                        In Transit
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-xs text-slate-500">Priority</div>
                                    <div className="font-medium" id="poDetailPriority">
                                        Urgent
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-xs text-slate-500">Department</div>
                                    <div className="font-medium" id="poDetailDept">
                                        Fleet
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-xs text-slate-500">Total Amount</div>
                                    <div className="font-medium text-pink-600" id="poDetailAmount">
                                        ₱ 40,000
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-sm font-semibold text-slate-900 mb-2">Order Items</div>
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span id="poDetailItems">4 Truck Tires</span>
                                        <span className="font-medium" id="poDetailQty">
                                            Qty: 4
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-sm font-semibold text-slate-900 mb-2">
                                    Delivery Information
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <div className="text-xs text-slate-500">Expected Date</div>
                                        <div className="font-medium" id="poDetailExpected">
                                            2026-07-22
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <div className="text-xs text-slate-500">Delivery Instructions</div>
                                        <div className="font-medium text-sm" id="poDetailInstructions">
                                            Deliver to Fleet Warehouse
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-slate-900 mb-2">Timeline</div>
                                <ol className="relative pl-6">
                                    <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200"></div>
                                    <li className="relative mb-3">
                                        <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <div className="text-sm">PO Created</div>
                                        <div className="text-xs text-slate-500">Jul 18, 09:14</div>
                                    </li>
                                    <li className="relative mb-3">
                                        <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <div className="text-sm">Sent to Supplier</div>
                                        <div className="text-xs text-slate-500">Jul 18, 11:02</div>
                                    </li>
                                    <li className="relative mb-3">
                                        <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-pink-500"></div>
                                        <div className="text-sm">Supplier Confirmed</div>
                                        <div className="text-xs text-slate-500">Jul 18, 13:48</div>
                                    </li>
                                    <li className="relative mb-3">
                                        <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                                        <div className="text-sm font-medium text-amber-600">In Transit</div>
                                        <div className="text-xs text-slate-500">ETA Jul 22</div>
                                    </li>
                                </ol>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    className="btn-ghost"
                                    onClick={() => {
                                        if (window.closePODetails) window.closePODetails();
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={() => showToast("Order updated", "info")}
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </SessionGuard>
    );
}