"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Chart from "chart.js/auto";
import Portal from "@/app/(supplyChain)/components/client/Portal";
import { AppButton } from "@/app/(supplyChain)/components/ui/AppButton";
import { toast } from "sonner";
import { generateExecutiveDirectPdf } from "../../utils/executivePdfBuilder";
import { ExecutiveDataPayload } from "../../hooks/useExecutiveData";

interface ExecutivePdfExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ExecutiveDataPayload;
}

const CHART_COLORS = {
    primary: '#EC4899',
    secondary: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    cyan: '#06B6D4',
};

export default function ExecutivePdfExportModal({
    isOpen,
    onClose,
    data,
}: ExecutivePdfExportModalProps) {
    const [isPrinting, setIsPrinting] = useState(false);

    const parcelsCanvasRef = useRef<HTMLCanvasElement>(null);
    const inventoryCanvasRef = useRef<HTMLCanvasElement>(null);
    const procurementCanvasRef = useRef<HTMLCanvasElement>(null);

    const parcelsChartInstance = useRef<Chart | null>(null);
    const inventoryChartInstance = useRef<Chart | null>(null);
    const procurementChartInstance = useRef<Chart | null>(null);

    // Format current date and time
    const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const reportTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Render print-optimized Chart.js instances
    const initCharts = useCallback(() => {
        // Destroy existing
        if (parcelsChartInstance.current) {
            parcelsChartInstance.current.destroy();
            parcelsChartInstance.current = null;
        }
        if (inventoryChartInstance.current) {
            inventoryChartInstance.current.destroy();
            inventoryChartInstance.current = null;
        }
        if (procurementChartInstance.current) {
            procurementChartInstance.current.destroy();
            procurementChartInstance.current = null;
        }

        // 1. Parcel Volume Trend (Wide Line Chart)
        if (parcelsCanvasRef.current) {
            const ctx = parcelsCanvasRef.current.getContext('2d');
            if (ctx) {
                const labels = data.dailyTrend?.map(t => t.dayLabel) || [];
                const receivedSeries = data.dailyTrend?.map(t => t.receivedCount) || [];
                const deliveredSeries = data.dailyTrend?.map(t => t.deliveredCount) || [];

                parcelsChartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels.length > 0 ? labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [
                            {
                                label: 'Ingested Parcels',
                                data: receivedSeries.length > 0 ? receivedSeries : [0, 0, 0, 0, 0, 0, 0],
                                borderColor: CHART_COLORS.secondary,
                                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                fill: true,
                                tension: 0.35,
                                borderWidth: 2.5,
                                pointRadius: 4,
                                pointBackgroundColor: CHART_COLORS.secondary,
                            },
                            {
                                label: 'Delivered',
                                data: deliveredSeries.length > 0 ? deliveredSeries : [0, 0, 0, 0, 0, 0, 0],
                                borderColor: CHART_COLORS.primary,
                                backgroundColor: 'rgba(236, 72, 153, 0.12)',
                                fill: true,
                                tension: 0.35,
                                borderWidth: 2.5,
                                pointRadius: 4,
                                pointBackgroundColor: CHART_COLORS.primary,
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    boxWidth: 10,
                                    usePointStyle: true,
                                    font: { size: 11, weight: 'bold' },
                                    color: '#1e293b',
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: { font: { size: 10, weight: 'bold' }, color: '#64748b' }
                            },
                            y: {
                                grid: { color: 'rgba(0, 0, 0, 0.06)' },
                                ticks: { font: { size: 10, weight: 'bold' }, color: '#64748b', stepSize: 1 }
                            }
                        }
                    }
                });
            }
        }

        // 2. Inventory SKU Categories
        if (inventoryCanvasRef.current) {
            const ctx = inventoryCanvasRef.current.getContext('2d');
            if (ctx) {
                const categories = Object.keys(data.inventoryCategoryBreakdown || {});
                const values = Object.values(data.inventoryCategoryBreakdown || {});

                inventoryChartInstance.current = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: categories.length > 0 ? categories : ['General SKUs'],
                        datasets: [{
                            data: values.length > 0 ? values : [1],
                            backgroundColor: values.length > 0
                                ? [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.purple, CHART_COLORS.cyan]
                                : ['#cbd5e1'],
                            borderWidth: 2,
                            borderColor: '#ffffff',
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: false,
                        cutout: '58%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    boxWidth: 8,
                                    padding: 8,
                                    usePointStyle: true,
                                    font: { size: 9.5, weight: 'bold' },
                                    color: '#334155',
                                }
                            }
                        }
                    }
                });
            }
        }

        // 3. Procurement Pipeline Status
        if (procurementCanvasRef.current) {
            const ctx = procurementCanvasRef.current.getContext('2d');
            if (ctx) {
                const statuses = Object.keys(data.procurementStatusBreakdown || {});
                const values = Object.values(data.procurementStatusBreakdown || {});

                procurementChartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: statuses.length > 0 ? statuses : ['Pending', 'Approved', 'Rejected', 'Completed'],
                        datasets: [{
                            label: 'Requisitions',
                            data: values.length > 0 ? values : [0, 0, 0, 0],
                            backgroundColor: [CHART_COLORS.warning, CHART_COLORS.success, CHART_COLORS.danger, CHART_COLORS.secondary],
                            borderRadius: 6,
                            maxBarThickness: 32,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: { font: { size: 10, weight: 'bold' }, color: '#64748b' }
                            },
                            y: {
                                grid: { color: 'rgba(0, 0, 0, 0.06)' },
                                ticks: { font: { size: 10, weight: 'bold' }, color: '#64748b', stepSize: 1 }
                            }
                        }
                    }
                });
            }
        }
    }, [data]);

    // Re-render charts when modal opens
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                initCharts();
            }, 80);
            return () => clearTimeout(timer);
        } else {
            if (parcelsChartInstance.current) parcelsChartInstance.current.destroy();
            if (inventoryChartInstance.current) inventoryChartInstance.current.destroy();
            if (procurementChartInstance.current) procurementChartInstance.current.destroy();
        }
    }, [isOpen, initCharts]);

    const [isDownloadingWord, setIsDownloadingWord] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    // Direct Word (.doc) download with embedded styles, charts, tables, and logo
    const handleDownloadWord = () => {
        if (isDownloadingWord) return;
        setIsDownloadingWord(true);
        try {
            const reportEl = document.getElementById('executive-printable-report');
            if (!reportEl) return;

            // Convert canvas charts to base64 images so they embed directly into the Word document
            const parcelsDataUrl = parcelsCanvasRef.current ? parcelsCanvasRef.current.toDataURL('image/png') : '';
            const inventoryDataUrl = inventoryCanvasRef.current ? inventoryCanvasRef.current.toDataURL('image/png') : '';
            const procurementDataUrl = procurementCanvasRef.current ? procurementCanvasRef.current.toDataURL('image/png') : '';

            // Clone report element to inject images in place of canvas elements
            const clone = reportEl.cloneNode(true) as HTMLElement;
            
            // Replace canvases with image tags in the clone
            const canvases = clone.querySelectorAll('canvas');
            canvases.forEach((c) => {
                const parent = c.parentElement;
                if (!parent) return;
                const img = document.createElement('img');
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.display = 'block';

                if (parent.querySelector('canvas') === canvases[0] && parcelsDataUrl) {
                    img.src = parcelsDataUrl;
                } else if (parent.querySelector('canvas') === canvases[1] && inventoryDataUrl) {
                    img.src = inventoryDataUrl;
                } else if (procurementDataUrl) {
                    img.src = procurementDataUrl;
                }
                c.replaceWith(img);
            });

            // Clean up any interactive buttons or badges in clone
            clone.querySelectorAll('button, .no-print').forEach(el => el.remove());

            const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>Airship Express - Executive Operations Report</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
  body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #0f172a; line-height: 1.4; }
  h1 { font-size: 16pt; color: #db2777; margin-bottom: 4pt; }
  h2 { font-size: 13pt; color: #1e293b; margin-top: 14pt; margin-bottom: 6pt; border-bottom: 1.5pt solid #e2e8f0; padding-bottom: 4pt; }
  table { width: 100%; border-collapse: collapse; margin-top: 8pt; margin-bottom: 12pt; }
  th { background-color: #f1f5f9; color: #334155; font-weight: bold; text-align: left; padding: 6pt; border: 1pt solid #cbd5e1; font-size: 9.5pt; }
  td { padding: 6pt; border: 1pt solid #e2e8f0; font-size: 9pt; }
  .kpi-card { background: #f8fafc; border: 1pt solid #cbd5e1; padding: 8pt; border-radius: 6pt; margin-bottom: 6pt; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body>
  ${clone.innerHTML}
</body>
</html>`;

            const blob = new Blob(['\ufeff' + htmlContent], {
                type: 'application/msword'
            });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `Airship_Express_Executive_Report_${new Date().toISOString().slice(0, 10)}.doc`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Word export failed:", err);
        } finally {
            setIsDownloadingWord(false);
        }
    };

    // Direct PDF download without opening browser print preview (Instant & Optimized)
    const handleDownloadDirectPdf = async () => {
        if (isDownloadingPdf) return;
        setIsDownloadingPdf(true);
        try {
            const pdfBlob = await generateExecutiveDirectPdf(data, {
                parcelsCanvas: parcelsCanvasRef.current,
                inventoryCanvas: inventoryCanvasRef.current,
                procurementCanvas: procurementCanvasRef.current,
            });

            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = new Date().toISOString().slice(0, 10);
            a.download = `Airship_Express_Executive_Report_${dateStr}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Executive PDF report downloaded successfully!");
        } catch (err) {
            console.error("Direct PDF export error:", err);
            toast.error("Failed to generate PDF. Please try Word export.");
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    // Handle print action
    const handlePrint = () => {
        if (isPrinting) return;
        setIsPrinting(true);
        document.body.classList.add('is-printing-executive-report');

        // Temporarily stop Lenis smooth scroll while printing
        try {
            (window as any).__lenis?.stop();
        } catch (_) {}

        // Allow layout to settle, then open print dialog
        setTimeout(() => {
            window.print();
        }, 150);
    };

    // Clean up print class after printing
    useEffect(() => {
        const handleAfterPrint = () => {
            setIsPrinting(false);
            document.body.classList.remove('is-printing-executive-report');
            try {
                (window as any).__lenis?.start();
            } catch (_) {}
        };
        window.addEventListener('afterprint', handleAfterPrint);
        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
            document.body.classList.remove('is-printing-executive-report');
            try {
                (window as any).__lenis?.start();
            } catch (_) {}
        };
    }, []);

    // Handle escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const pageKpis = data?.pageKpis || {
        parcelsToday: 0,
        parcelsChangePct: "0% vs yesterday",
        readyForDispatch: 0,
        readyPct: "0.0% of total queue",
        dispatchedMtd: 0,
        dispatchedChangePct: "0 shipments this month",
        ontimeRate: "0.0%",
    };

    const deliveredCount = data?.parcels?.filter(p => p.status === 'delivered')?.length || 0;
    const ops = data?.operationsSummary || {
        receivingQueuePending: 0,
        sortingParcels: 0,
        deliveredParcels: 0,
        anomaliesCount: 0,
    };
    const proc = data?.procurementSummary || {
        openPOs: 0,
        pendingApprovals: 0,
        mtdSpend: 0,
        budgetUtilizationPct: 0,
    };
    const txList = data?.recentTransactions || [];

    return (
        <Portal>
            {/* Backdrop */}
            <div
                id="executive-modal-backdrop"
                className="fixed inset-0 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-2 sm:p-4 sm:py-6 overflow-y-auto"
                onClick={onClose}
            >
                {/* Modal Container */}
                <div
                    id="executive-modal-container"
                    className="bg-[#f8fafc] dark:bg-[#151620] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top Action Bar (Screen Only - Hidden in Print) */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white dark:bg-[#1a1b26] border-b border-slate-200 dark:border-white/10 shrink-0 modal-action-bar no-print">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 flex items-center justify-center text-sm shadow-xs shrink-0">
                                <i className="fas fa-file-pdf"></i>
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    Executive Overview — Official PDF Export
                                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                        Live Dataset
                                    </span>
                                </h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Review report preview below with official logo, KPI metrics, charts, and audit ledger.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-2 shrink-0">
                            {/* Primary Action: Direct Download PDF (Instant, Optimized & No Print Dialog) */}
                            <AppButton
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={handleDownloadDirectPdf}
                                disabled={isDownloadingPdf}
                                className="!bg-pink-600 hover:!bg-pink-700 !text-white !font-bold flex items-center gap-2 shadow-md shadow-pink-500/20 cursor-pointer"
                                title="Download complete PDF directly to your device (Instant & Optimized)"
                            >
                                <i className={`fas ${isDownloadingPdf ? 'fa-spinner fa-spin' : 'fa-file-pdf'} text-xs`}></i>
                                <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                            </AppButton>

                            {/* Download as Word (.doc) */}
                            <AppButton
                                type="button"
                                variant="neutral"
                                size="sm"
                                onClick={handleDownloadWord}
                                disabled={isDownloadingWord}
                                className="!border-blue-300 dark:!border-blue-700 !text-blue-700 dark:!text-blue-300 hover:!bg-blue-50 dark:hover:!bg-blue-950/40 !font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                                title="Direct download as editable Microsoft Word (.doc) with embedded charts and tables"
                            >
                                <i className={`fas ${isDownloadingWord ? 'fa-spinner fa-spin' : 'fa-file-word'} text-blue-500 text-xs`}></i>
                                <span>{isDownloadingWord ? 'Exporting Word...' : 'Download Word'}</span>
                            </AppButton>

                            {/* Browser Print (Fallback) */}
                            <AppButton
                                type="button"
                                variant="neutral"
                                size="sm"
                                onClick={handlePrint}
                                disabled={isPrinting}
                                className="!border-slate-300 dark:!border-slate-700 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
                                title="Open browser print dialog"
                            >
                                <i className={`fas ${isPrinting ? 'fa-spinner fa-spin' : 'fa-print'} text-xs text-slate-500`}></i>
                                <span>{isPrinting ? 'Printing...' : 'Print'}</span>
                            </AppButton>

                            <AppButton
                                type="button"
                                variant="neutral"
                                size="icon-sm"
                                onClick={onClose}
                                aria-label="Close export modal"
                            >
                                <i className="fas fa-times text-xs"></i>
                            </AppButton>
                        </div>
                    </div>

                    {/* Scrollable Preview Area */}
                    <div
                        id="executive-modal-scroll"
                        className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100 dark:bg-[#0e0f16] w-full min-w-0"
                        style={{ maxHeight: 'none' }}
                    >
                        {/* Printable Document Sheet */}
                        <div
                            id="executive-printable-report"
                            className="bg-white text-slate-900 w-full max-w-3xl mx-auto p-5 sm:p-8 rounded-xl shadow-lg border border-slate-200/90 space-y-6 font-rethink min-w-0 h-auto min-h-fit"
                            style={{ height: 'auto', maxHeight: 'none', overflow: 'visible' }}
                        >
                            {/* 1. DOCUMENT HEADER WITH LOGO */}
                            <header className="pb-4 border-b-2 border-pink-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print-avoid-break">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
                                        <img
                                            src="/images/logo-remove-bg.png"
                                            alt="Airship Express Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-xl tracking-tight text-slate-900 font-bricolage">
                                                AIRSHIP <span className="text-pink-600">EXPRESS</span>
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                                                Internal
                                            </span>
                                        </div>
                                        <h1 className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                                            Executive Operations & Performance Intelligence Report
                                        </h1>
                                    </div>
                                </div>

                                <div className="text-left sm:text-right text-xs space-y-0.5 text-slate-500 shrink-0">
                                    <div>
                                        <span className="font-semibold text-slate-700">Date Generated:</span> {reportDate}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-700">Time:</span> {reportTime}
                                    </div>
                                    <div className="flex items-center sm:justify-end gap-1.5 text-[11px] font-medium text-emerald-600">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                        <span>Live Database Synchronized</span>
                                    </div>
                                </div>
                            </header>

                            {/* 2. EXECUTIVE SUMMARY METRICS (4 CARDS) */}
                            <section className="print-avoid-break">
                                <div className="flex items-center justify-between mb-2.5">
                                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <i className="fas fa-tachometer-alt text-pink-600"></i>
                                        Executive KPI Scorecard
                                    </h2>
                                    <span className="text-[10px] text-slate-400">Strictly computed from database records</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {/* KPI 1 */}
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                                        <div className="text-[11px] font-medium text-slate-500 truncate">Parcels Today</div>
                                        <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 font-bricolage">
                                            {pageKpis.parcelsToday.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium truncate">
                                            <i className="fas fa-arrow-trend-up text-pink-500 shrink-0"></i>
                                            <span className="truncate">{pageKpis.parcelsChangePct}</span>
                                        </div>
                                    </div>

                                    {/* KPI 2 */}
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                                        <div className="text-[11px] font-medium text-slate-500 truncate">Ready Dispatch</div>
                                        <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 font-bricolage">
                                            {pageKpis.readyForDispatch.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium truncate">
                                            <i className="fas fa-boxes-packing text-amber-500 shrink-0"></i>
                                            <span className="truncate">{pageKpis.readyPct}</span>
                                        </div>
                                    </div>

                                    {/* KPI 3 */}
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                                        <div className="text-[11px] font-medium text-slate-500 truncate">Dispatched (MTD)</div>
                                        <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 font-bricolage">
                                            {pageKpis.dispatchedMtd.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium truncate">
                                            <i className="fas fa-truck-fast text-indigo-500 shrink-0"></i>
                                            <span className="truncate">{pageKpis.dispatchedChangePct}</span>
                                        </div>
                                    </div>

                                    {/* KPI 4 */}
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                                        <div className="text-[11px] font-medium text-slate-500 truncate">Delivery SLA Rate</div>
                                        <div className="text-lg sm:text-xl font-extrabold text-emerald-600 mt-1 font-bricolage">
                                            {pageKpis.ontimeRate}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium truncate">
                                            <i className="fas fa-circle-check text-emerald-500 shrink-0"></i>
                                            <span className="truncate">{deliveredCount} delivered</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 3. EXECUTIVE CHARTS SECTION */}
                            <section className="space-y-4 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <i className="fas fa-chart-pie text-pink-600"></i>
                                        Visual Analytics & Trend Curves
                                    </h2>
                                    <span className="text-[10px] text-slate-400">Rendered via Chart.js vectors</span>
                                </div>

                                {/* Top Chart: Daily Parcel Volume (Wide Layout) */}
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-w-0 print-avoid-break">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                            <i className="fas fa-chart-line text-indigo-500 text-xs"></i>
                                            <span>Parcel Volume Trend (Past 7 Days Ingestion vs Delivered)</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">Daily Trend</span>
                                    </div>
                                    <div className="h-52 sm:h-56 relative mt-2.5 w-full min-w-0 overflow-hidden">
                                        <canvas ref={parcelsCanvasRef} />
                                    </div>
                                </div>

                                {/* Bottom Charts: 2-Column Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                                    {/* Chart 2: Inventory SKU Breakdown */}
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-w-0 flex flex-col justify-between print-avoid-break">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                <i className="fas fa-boxes text-emerald-500 text-xs"></i>
                                                <span>Inventory SKU Category Distribution</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono">Catalog</span>
                                        </div>
                                        <div className="h-48 relative mt-2 w-full min-w-0 overflow-hidden">
                                            <canvas ref={inventoryCanvasRef} />
                                        </div>
                                    </div>

                                    {/* Chart 3: Procurement Requests Pipeline */}
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-w-0 flex flex-col justify-between print-avoid-break">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                <i className="fas fa-shopping-bag text-pink-500 text-xs"></i>
                                                <span>Procurement Pipeline Requests</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono">Status</span>
                                        </div>
                                        <div className="h-48 relative mt-2 w-full min-w-0 overflow-hidden">
                                            <canvas ref={procurementCanvasRef} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 4. OPERATIONS & PROCUREMENT AUDIT BREAKDOWNS */}
                            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                                {/* Operations Summary Box */}
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-w-0 print-avoid-break">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                        <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                            <i className="fas fa-dolly text-pink-600"></i>
                                            Operations Activity Summary
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-500">Warehouse Hub</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 block">Receiving Pending</span>
                                            <span className="text-sm font-bold text-slate-900 font-bricolage">
                                                {ops.receivingQueuePending.toLocaleString()} items
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 block">Sorting in Line</span>
                                            <span className="text-sm font-bold text-amber-600 font-bricolage">
                                                {ops.sortingParcels.toLocaleString()} parcels
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 block">Total Delivered</span>
                                            <span className="text-sm font-bold text-emerald-600 font-bricolage">
                                                {ops.deliveredParcels.toLocaleString()} parcels
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 block">Transit Exceptions</span>
                                            <span className="text-sm font-bold text-rose-600 font-bricolage">
                                                {ops.anomaliesCount} flagged
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Procurement Summary Box */}
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-w-0 print-avoid-break">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                        <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                            <i className="fas fa-file-invoice-dollar text-indigo-600"></i>
                                            Procurement Commitments
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-500">Financials</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 block">Open Purchase Orders</span>
                                            <span className="text-sm font-bold text-slate-900 font-bricolage">
                                                {proc.openPOs} active
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 block">Pending Approvals</span>
                                            <span className="text-sm font-bold text-amber-600 font-bricolage">
                                                {proc.pendingApprovals} requests
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 block">Month-to-Date Spend</span>
                                            <span className="text-sm font-bold text-slate-900 font-bricolage">
                                                ₱ {proc.mtdSpend.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 block">Budget Utilization</span>
                                            <span className="text-sm font-bold text-indigo-600 font-bricolage">
                                                {proc.budgetUtilizationPct}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 5. RECENT TRANSACTIONS AUDIT LEDGER */}
                            <section className="space-y-2.5 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <i className="fas fa-list-check text-pink-600"></i>
                                        Recent Transaction Manifest ({txList.length} records)
                                    </h2>
                                    <span className="text-[10px] text-slate-400">Audit ledger</span>
                                </div>

                                <div className="border border-slate-200 rounded-xl overflow-x-auto min-w-0">
                                    <table className="w-full text-[11px] text-left border-collapse min-w-[540px]">
                                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="py-2.5 px-3">Tracking ID</th>
                                                <th className="py-2.5 px-3">Consignee</th>
                                                <th className="py-2.5 px-3">Destination Area</th>
                                                <th className="py-2.5 px-3">Courier</th>
                                                <th className="py-2.5 px-3">Status</th>
                                                <th className="py-2.5 px-3 text-right">Received Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {txList.map((tx, idx) => (
                                                <tr key={tx.id || idx} className="hover:bg-slate-50 print-avoid-break">
                                                    <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                                                        {tx.id}
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-700 font-medium">
                                                        {tx.consignee || '—'}
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-600 truncate max-w-[140px]">
                                                        {tx.area || 'Hub Distribution'}
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-600">
                                                        {tx.courier || 'In-House'}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-3 text-right text-slate-500 font-mono text-[10px]">
                                                        {tx.received}
                                                    </td>
                                                </tr>
                                            ))}
                                            {txList.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="py-4 text-center text-slate-400">
                                                        No transactions recorded in current period.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* 6. OFFICIAL DOCUMENT FOOTER */}
                            <footer className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 executive-report-footer print-avoid-break">
                                <div className="flex items-center gap-2 text-center sm:text-left">
                                    <span className="font-bold text-slate-700">Airship Express</span>
                                    <span>•</span>
                                    <span>Supply Chain & Operations Management System</span>
                                    <span>•</span>
                                    <span className="text-pink-600 font-semibold">Confidential</span>
                                </div>
                                <div className="text-center sm:text-right text-slate-400">
                                    <span>© {new Date().getFullYear()} Airship Express Inc. All rights reserved.</span>
                                </div>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
