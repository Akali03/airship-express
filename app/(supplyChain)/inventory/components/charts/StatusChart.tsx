'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { InventoryItem } from '../../types';

// Guard against multiple registrations during hot-reloads
let isRegistered = false;

interface StatusChartProps {
    items: InventoryItem[];
    onStatusClick: (status: string) => void;
}

const STATUS_MAP: Record<string, string> = {
    'Available': 'available',
    'Low Stock': 'low-stock',
    'Out of Stock': 'out-of-stock',
};

export function StatusChart({ items, onStatusClick }: StatusChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        if (!isRegistered) {
            Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
            isRegistered = true;
        }
    }, []);

    useEffect(() => {
        if (!chartRef.current) return;

        // Destroy existing instance
        if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
        }

        // Do not draw empty chart if no items exist
        if (items.length === 0) return;

        const statusData = {
            'Available': items.filter((i) => i.status === 'available').length,
            'Low Stock': items.filter((i) => i.status === 'low-stock').length,
            'Out of Stock': items.filter((i) => i.status === 'out-of-stock').length,
        };

        const labels = Object.keys(statusData);
        const values = Object.values(statusData);
        const colors = ['#34D399', '#FBBF24', '#F87171']; // Refined Emerald, Amber, Red

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: values,
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        hoverOffset: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 8,
                            boxHeight: 8,
                            usePointStyle: true,
                            padding: 12,
                            font: { size: 11, family: 'inherit' },
                            color: '#64748B', // slate-500
                        },
                    },
                    tooltip: {
                        backgroundColor: '#FFFFFF',
                        titleColor: '#0F172A',
                        bodyColor: '#475569',
                        borderColor: '#E2E8F0',
                        borderWidth: 1,
                        cornerRadius: 10,
                        padding: 12,
                        boxPadding: 4,
                        usePointStyle: true,
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = (context.parsed as number) || 0;
                                const total = values.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                return ` ${label}: ${value} (${percentage}%)`;
                            },
                            afterBody: function (tooltipItems) {
                                const status = STATUS_MAP[tooltipItems[0].label] || '';
                                return `\nClick to filter by "${status}"`;
                            },
                        },
                    },
                },
                onClick: function (_evt, elements) {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const label = labels[index];
                        const status = STATUS_MAP[label] || '';
                        onStatusClick(status);
                    }
                },
                onHover: function (evt, elements) {
                    const canvas = evt.native?.target as HTMLCanvasElement;
                    if (canvas) {
                        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                    }
                },
            },
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [items, onStatusClick]);

    return (
        <div className="relative w-full h-full min-h-[220px]">
            {/* Information Overlay Toggle */}
            <button
                type="button"
                className="absolute top-1 right-1 z-10 p-1.5 rounded-lg 
                           text-slate-400 dark:text-slate-500 
                           hover:text-indigo-600 dark:hover:text-indigo-400 
                           hover:bg-slate-100 dark:hover:bg-slate-800/50 
                           transition-colors"
                onClick={() => setShowInfo(!showInfo)}
                aria-label="Chart Information"
            >
                <i className="fas fa-info-circle text-sm" />
            </button>

            {/* Canvas */}
            <div className="w-full h-full">
                <canvas ref={chartRef} />
            </div>

            {/* Empty State Overlay */}
            {items.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center 
                                text-slate-400 dark:text-slate-500 text-xs font-medium 
                                bg-slate-50/50 dark:bg-slate-800/20 rounded-xl">
                    <i className="fas fa-chart-pie text-2xl mb-1.5 opacity-40 dark:opacity-30" />
                    <span>No inventory data available</span>
                </div>
            )}

            {/* Info Popover */}
            {showInfo && (
                <div
                    className="absolute top-4 right-1 z-20 
                               bg-white dark:bg-ink rounded-xl shadow-xl 
                               border border-slate-200/80 dark:border-ink/20 
                               p-4 w-64 animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setShowInfo(false)}
                >
                    <div className="flex items-center justify-between mb-2 pb-2 
                                    border-b border-slate-100 dark:border-ink/20">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                            <i className="fas fa-chart-pie text-indigo-500 dark:text-indigo-400" />
                            Status Breakdown
                        </h4>
                        <button
                            type="button"
                            onClick={() => setShowInfo(false)}
                            className="text-slate-400 dark:text-slate-500 
                                     hover:text-slate-600 dark:hover:text-slate-300 
                                     p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50 
                                     transition-colors"
                        >
                            <i className="fas fa-times text-xs" />
                        </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                        Displays item stock distribution. Hover over segments to see percentages, or click any segment to filter the list.
                    </p>

                    <div className="grid grid-cols-1 gap-1.5 pt-1 border-t border-slate-100 dark:border-ink/20">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                Available
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {items.filter((i) => i.status === 'available').length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                Low Stock
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {items.filter((i) => i.status === 'low-stock').length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-rose-400" />
                                Out of Stock
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {items.filter((i) => i.status === 'out-of-stock').length}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}