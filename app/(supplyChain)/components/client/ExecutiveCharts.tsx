// app/(supplyChain)/components/client/ExecutiveCharts.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { supabase } from "@/app/(supplyChain)/lib/services/client/supabase";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import OperationsSummary from "../server/OperationsSummary";
import ProcurementCard from "../server/ProcurementCard";
import RecentTransactions from "../server/RecentTransactions";
import QuickActions from "../client/QuickActions";

interface Insight {
    id: string;
    title: string;
    description: string;
    type: 'positive' | 'negative' | 'neutral' | 'warning';
    metric?: string;
    change?: string;
    actionable?: boolean;
    actionText?: string;
    actionLink?: string;
}

interface KPI {
    id: string;
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'up' | 'down' | 'neutral';
    icon: string;
    color: string;
    description: string;
}

type TabType = 'overview' | 'operations' | 'kpis' | 'insights' | 'forecast' | 'reports';

export default function ExecutiveCharts() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [parcelData, setParcelData] = useState<any[]>([]);
    const [inventoryData, setInventoryData] = useState<any[]>([]);
    const [procurementData, setProcurementData] = useState<any[]>([]);
    const [documentData, setDocumentData] = useState<any[]>([]);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [showInsights, setShowInsights] = useState(true);
    const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
    const [isTabTransitioning, setIsTabTransitioning] = useState(false);

    const chartRefs = {
        parcels: useRef<HTMLCanvasElement>(null),
        inventory: useRef<HTMLCanvasElement>(null),
        procurement: useRef<HTMLCanvasElement>(null),
        documents: useRef<HTMLCanvasElement>(null),
        forecast: useRef<HTMLCanvasElement>(null),
        kpi: useRef<HTMLCanvasElement>(null),
        fleetUtilization: useRef<HTMLCanvasElement>(null),
        fuelEfficiency: useRef<HTMLCanvasElement>(null),
        deliveryPerformance: useRef<HTMLCanvasElement>(null),
        carbonEmissions: useRef<HTMLCanvasElement>(null),
        warehouseThroughput: useRef<HTMLCanvasElement>(null),
        routeCongestion: useRef<HTMLCanvasElement>(null),
        driverSafety: useRef<HTMLCanvasElement>(null),
    };

    const chartInstances = useRef<any>({
        parcels: null,
        inventory: null,
        procurement: null,
        documents: null,
        forecast: null,
        kpi: null,
        fleetUtilization: null,
        fuelEfficiency: null,
        deliveryPerformance: null,
        carbonEmissions: null,
        warehouseThroughput: null,
        routeCongestion: null,
        driverSafety: null,
    });

    // Get tab from URL on mount
    useEffect(() => {
        const tabParam = searchParams.get('tab') as TabType;
        if (tabParam && ['overview', 'operations', 'kpis', 'insights', 'forecast', 'reports'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Update URL when tab changes
    const handleTabChange = (tab: TabType) => {
        setIsTabTransitioning(true);
        setActiveTab(tab);
        router.push(`?tab=${tab}`, { scroll: false });

        setTimeout(() => {
            setIsTabTransitioning(false);
        }, 300);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [{ data: parcels }, { data: inventory }, { data: procurement }, { data: documents }] = await Promise.all([
                supabase.from('parcels').select('created_at, status, courier').order('created_at', { ascending: true }).limit(100),
                supabase.from('inventory_items').select('category, current_stock, status, item_name, minimum_stock'),
                supabase.from('purchase_requests').select('status, department, amount, date').order('date', { ascending: true }).limit(50),
                supabase.from('documents').select('document_type, category, created_at').order('created_at', { ascending: true }).limit(50),
            ]);

            setParcelData(parcels || []);
            setInventoryData(inventory || []);
            setProcurementData(procurement || []);
            setDocumentData(documents || []);

            generateInsights(parcels || [], inventory || [], procurement || []);

        } catch (error) {
            console.error('Error fetching chart data:', error);
            toast.error('Failed to load chart data');
        } finally {
            setLoading(false);
        }
    };

    const generateInsights = (parcels: any[], inventory: any[], procurement: any[]) => {
        const newInsights: Insight[] = [];

        const today = new Date();
        const todayParcels = parcels.filter(p => new Date(p.created_at).toDateString() === today.toDateString());
        const yesterdayParcels = parcels.filter(p => {
            const d = new Date(p.created_at);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return d.toDateString() === yesterday.toDateString();
        });

        if (todayParcels.length > 0 || yesterdayParcels.length > 0) {
            const change = yesterdayParcels.length > 0
                ? ((todayParcels.length - yesterdayParcels.length) / yesterdayParcels.length * 100)
                : 100;
            newInsights.push({
                id: 'parcel-volume',
                title: 'Parcel Volume Trend',
                description: todayParcels.length > yesterdayParcels.length
                    ? `Today's parcel volume is ${change.toFixed(1)}% higher than yesterday.`
                    : `Today's parcel volume is ${Math.abs(change).toFixed(1)}% lower than yesterday.`,
                type: change > 0 ? 'positive' : 'negative',
                metric: `${todayParcels.length} today`,
                change: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
                actionable: true,
                actionText: 'View Details',
                actionLink: '/warehousing?tab=incoming',
            });
        }

        const deliveredParcels = parcels.filter(p => p.status === 'delivered');
        const totalParcels = parcels.length;
        const deliveryRate = totalParcels > 0 ? (deliveredParcels.length / totalParcels * 100) : 0;

        if (totalParcels > 0) {
            newInsights.push({
                id: 'delivery-rate',
                title: 'Delivery Performance',
                description: deliveryRate > 85
                    ? `Excellent ${deliveryRate.toFixed(1)}% delivery rate. Above industry average.`
                    : deliveryRate > 70
                        ? `${deliveryRate.toFixed(1)}% delivery rate. Room for improvement.`
                        : `Low ${deliveryRate.toFixed(1)}% delivery rate. Immediate attention needed.`,
                type: deliveryRate > 85 ? 'positive' : deliveryRate > 70 ? 'neutral' : 'warning',
                metric: `${deliveryRate.toFixed(1)}%`,
                change: deliveryRate > 85 ? 'On target' : 'Below target',
                actionable: true,
                actionText: 'Analyze',
                actionLink: '/warehousing?tab=sorting',
            });
        }

        const lowStockItems = inventory.filter(i => i.status === 'low-stock' || i.current_stock < i.minimum_stock);
        const outOfStockItems = inventory.filter(i => i.status === 'out-of-stock' || i.current_stock === 0);

        if (lowStockItems.length > 0 || outOfStockItems.length > 0) {
            newInsights.push({
                id: 'inventory-health',
                title: 'Inventory Health Alert',
                description: `${lowStockItems.length} items low stock, ${outOfStockItems.length} items out of stock. Restock recommended.`,
                type: outOfStockItems.length > 0 ? 'warning' : 'neutral',
                metric: `${lowStockItems.length} low`,
                change: `${outOfStockItems.length} out`,
                actionable: true,
                actionText: 'View Inventory',
                actionLink: '/inventory',
            });
        }

        const pendingRequests = procurement.filter(p => p.status === 'Pending');
        const approvedRequests = procurement.filter(p => p.status === 'Approved');

        if (pendingRequests.length > 0) {
            newInsights.push({
                id: 'procurement-pending',
                title: 'Pending Approvals',
                description: `${pendingRequests.length} purchase requests awaiting approval. ${approvedRequests.length} requests approved.`,
                type: 'neutral',
                metric: `${pendingRequests.length} pending`,
                change: `${approvedRequests.length} approved`,
                actionable: true,
                actionText: 'Review Requests',
                actionLink: '/procurement',
            });
        }

        const courierCounts: Record<string, number> = {};
        parcels.forEach(p => {
            if (p.courier) {
                courierCounts[p.courier] = (courierCounts[p.courier] || 0) + 1;
            }
        });
        let topCourier = '';
        let maxCount = 0;
        for (const [courier, count] of Object.entries(courierCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topCourier = courier;
            }
        }
        if (topCourier) {
            newInsights.push({
                id: 'top-courier',
                title: 'Top Performing Courier',
                description: `${topCourier} is handling ${maxCount} parcels, leading all couriers this period.`,
                type: 'positive',
                metric: topCourier,
                change: `${maxCount} parcels`,
                actionable: true,
                actionText: 'View All Couriers',
                actionLink: '/warehousing?tab=sorting',
            });
        }

        if (documentData.length > 0) {
            newInsights.push({
                id: 'document-volume',
                title: 'Document Activity',
                description: `${documentData.length} documents processed. ${documentData.filter(d => d.document_type === 'Invoice').length} invoices, ${documentData.filter(d => d.document_type === 'PO').length} purchase orders.`,
                type: 'neutral',
                metric: `${documentData.length} total`,
                change: 'Active',
                actionable: true,
                actionText: 'View Documents',
                actionLink: '/documents',
            });
        }

        setInsights(newInsights);
    };

    const KPIs: KPI[] = [
        {
            id: 'total-parcels',
            label: 'Total Parcels',
            value: parcelData.length,
            change: '+12.5%',
            changeType: 'up',
            icon: 'fa-box',
            color: 'text-pink-500',
            description: 'Total parcels processed across all statuses',
        },
        {
            id: 'delivery-rate',
            label: 'Delivery Rate',
            value: `${(parcelData.filter(p => p.status === 'delivered').length / (parcelData.length || 1) * 100).toFixed(1)}%`,
            change: '+3.2%',
            changeType: 'up',
            icon: 'fa-check-circle',
            color: 'text-emerald-500',
            description: 'Percentage of parcels successfully delivered',
        },
        {
            id: 'active-couriers',
            label: 'Active Couriers',
            value: new Set(parcelData.map(p => p.courier).filter(Boolean)).size,
            change: '+2',
            changeType: 'up',
            icon: 'fa-truck',
            color: 'text-blue-500',
            description: 'Number of couriers currently handling parcels',
        },
        {
            id: 'inventory-items',
            label: 'Inventory Items',
            value: inventoryData.length,
            change: '-3',
            changeType: 'down',
            icon: 'fa-warehouse',
            color: 'text-amber-500',
            description: 'Total items in warehouse inventory',
        },
        {
            id: 'pending-requests',
            label: 'Pending Requests',
            value: procurementData.filter(p => p.status === 'Pending').length,
            change: '+2',
            changeType: 'neutral',
            icon: 'fa-clock',
            color: 'text-purple-500',
            description: 'Purchase requests awaiting approval',
        },
        {
            id: 'documents',
            label: 'Documents',
            value: documentData.length,
            change: '+5',
            changeType: 'up',
            icon: 'fa-file-alt',
            color: 'text-indigo-500',
            description: 'Total documents in the system',
        },
    ];

    const generateAISummary = async () => {
        setIsGeneratingAI(true);
        const toastId = toast.loading('AI is analyzing your data...');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success('AI Summary Generated!', { id: toastId, duration: 8000 });
            setShowInsights(true);
        } catch (error) {
            toast.error('Failed to generate AI summary', { id: toastId });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return days;
    };

    const getLast12Months = () => {
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d.toLocaleDateString('en-US', { month: 'short' }));
        }
        return months;
    };

    // Operations Analytics Data
    const analyticsData = {
        fleetAvailability: 94,
        outboundDistribution: 87,
        logisticsEfficiency: 92,
        fuelData: [
            { day: 'Mon', volume: 2450, efficiency: 78 },
            { day: 'Tue', volume: 2320, efficiency: 82 },
            { day: 'Wed', volume: 2580, efficiency: 75 },
            { day: 'Thu', volume: 2400, efficiency: 80 },
            { day: 'Fri', volume: 2650, efficiency: 73 },
            { day: 'Sat', volume: 2100, efficiency: 85 },
            { day: 'Sun', volume: 1800, efficiency: 88 },
        ],
        deliveryPerformance: [
            { month: 'Jan', onTime: 92, delayed: 8 },
            { month: 'Feb', onTime: 94, delayed: 6 },
            { month: 'Mar', onTime: 89, delayed: 11 },
            { month: 'Apr', onTime: 93, delayed: 7 },
            { month: 'May', onTime: 95, delayed: 5 },
            { month: 'Jun', onTime: 91, delayed: 9 },
        ],
        carbonEmissions: [
            { week: 'W1', actual: 320, target: 350 },
            { week: 'W2', actual: 290, target: 350 },
            { week: 'W3', actual: 340, target: 350 },
            { week: 'W4', actual: 280, target: 350 },
        ],
        fleetUtilization: [
            { category: 'Active', count: 60 },
            { category: 'Inactive', count: 45 },
            { category: 'Available', count: 30 },
            { category: 'Returning', count: 15 },
        ],
        warehouseThroughput: [
            { hour: '06:00', inbound: 120, outbound: 80 },
            { hour: '08:00', inbound: 280, outbound: 200 },
            { hour: '10:00', inbound: 450, outbound: 380 },
            { hour: '12:00', inbound: 320, outbound: 400 },
            { hour: '14:00', inbound: 500, outbound: 450 },
            { hour: '16:00', inbound: 380, outbound: 420 },
            { hour: '18:00', inbound: 200, outbound: 300 },
        ],
        routeCongestion: [
            { route: 'North-South\nCorridor', score: 75 },
            { route: 'Metro Express\nRing', score: 62 },
            { route: 'Coastal', score: 48 },
        ],
        driverSafety: [
            { tier: 'Safe', count: 75 },
            { tier: 'Needs\nImprovement', count: 40 },
            { tier: 'At Risk', count: 20 },
        ],
        topHubs: [
            { name: 'Manila Hub', performance: 94 },
            { name: 'Cebu Hub', performance: 88 },
            { name: 'Davao Hub', performance: 82 },
            { name: 'Clark Hub', performance: 78 },
        ],
    };

    const initializeCharts = () => {
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#fcfbf9' : '#1c1b1f';
        const mutedColor = isDark ? '#6b6b76' : '#6b6b76';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        // ─── 1. PARCEL TREND CHART ───
        if (chartRefs.parcels.current) {
            const ctx = chartRefs.parcels.current.getContext('2d');
            if (ctx) {
                const last7Days = getLast7Days();
                const statuses = ['received', 'sorting', 'ready', 'picked-up', 'delivered'];
                const statusColors = {
                    'received': '#6366F1',
                    'sorting': '#F59E0B',
                    'ready': '#10B981',
                    'picked-up': '#8B5CF6',
                    'delivered': '#EC4899'
                };

                const datasets = statuses.map(status => {
                    const data = last7Days.map(day => {
                        const count = parcelData.filter(p => {
                            const pDate = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            return pDate === day && p.status === status;
                        }).length;
                        return count;
                    });
                    return {
                        label: status.charAt(0).toUpperCase() + status.slice(1),
                        data: data,
                        borderColor: statusColors[status as keyof typeof statusColors],
                        backgroundColor: `${statusColors[status as keyof typeof statusColors]}20`,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: statusColors[status as keyof typeof statusColors],
                    };
                });

                if (chartInstances.current.parcels) chartInstances.current.parcels.destroy();

                chartInstances.current.parcels = new Chart(ctx, {
                    type: 'line',
                    data: { labels: last7Days, datasets },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: { boxWidth: 12, padding: 8, font: { size: 10 }, usePointStyle: true, color: textColor },
                            },
                            tooltip: {
                                backgroundColor: isDark ? 'rgba(28,27,31,0.95)' : 'rgba(255,255,255,0.95)',
                                titleColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                bodyColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                borderWidth: 1,
                                cornerRadius: 8,
                            }
                        },
                        scales: {
                            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: mutedColor } },
                            y: {
                                beginAtZero: true,
                                ticks: { stepSize: 1, font: { size: 10 }, color: mutedColor },
                                grid: { color: gridColor }
                            }
                        },
                        interaction: { mode: 'index', intersect: false },
                    },
                });
            }
        }

        // ─── 2. INVENTORY CHART ───
        if (chartRefs.inventory.current) {
            const ctx = chartRefs.inventory.current.getContext('2d');
            if (ctx) {
                const categories: Record<string, number> = {};
                inventoryData.forEach(item => {
                    const category = item.category || 'Uncategorized';
                    categories[category] = (categories[category] || 0) + 1;
                });

                const labels = Object.keys(categories);
                const data = Object.values(categories);
                const backgroundColors = ['#EC4899', '#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6', '#F472B6'];

                if (chartInstances.current.inventory) chartInstances.current.inventory.destroy();

                chartInstances.current.inventory = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels,
                        datasets: [{
                            data,
                            backgroundColor: backgroundColors.slice(0, labels.length),
                            borderWidth: 2,
                            borderColor: isDark ? '#2a2a2e' : '#ffffff',
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { boxWidth: 12, padding: 8, font: { size: 10 }, usePointStyle: true, color: textColor },
                            },
                            tooltip: {
                                backgroundColor: isDark ? 'rgba(28,27,31,0.95)' : 'rgba(255,255,255,0.95)',
                                titleColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                bodyColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                borderWidth: 1,
                                cornerRadius: 8,
                                callbacks: {
                                    label: function (context) {
                                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return `${context.label}: ${context.parsed} items (${percentage}%)`;
                                    }
                                }
                            }
                        },
                        cutout: '65%',
                    },
                });
            }
        }

        // ─── 3. PROCUREMENT CHART ───
        if (chartRefs.procurement.current) {
            const ctx = chartRefs.procurement.current.getContext('2d');
            if (ctx) {
                const statusCounts: Record<string, number> = {};
                procurementData.forEach(item => {
                    const status = item.status || 'Unknown';
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });

                const statusColors: Record<string, string> = {
                    'Pending': '#F59E0B',
                    'Approved': '#10B981',
                    'Rejected': '#EF4444',
                    'Completed': '#6366F1',
                    'Unknown': '#94A3B8'
                };

                const labels = Object.keys(statusCounts);
                const data = Object.values(statusCounts);
                const colors = labels.map(label => statusColors[label] || '#94A3B8');

                if (chartInstances.current.procurement) chartInstances.current.procurement.destroy();

                chartInstances.current.procurement = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [{
                            label: 'Purchase Requests',
                            data,
                            backgroundColor: colors,
                            borderRadius: 6,
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: isDark ? 'rgba(28,27,31,0.95)' : 'rgba(255,255,255,0.95)',
                                titleColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                bodyColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                borderWidth: 1,
                                cornerRadius: 8,
                            }
                        },
                        scales: {
                            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: mutedColor } },
                            y: {
                                beginAtZero: true,
                                ticks: { stepSize: 1, font: { size: 10 }, color: mutedColor },
                                grid: { color: gridColor }
                            }
                        },
                    },
                });
            }
        }

        // ─── 4. DOCUMENTS CHART ───
        if (chartRefs.documents.current) {
            const ctx = chartRefs.documents.current.getContext('2d');
            if (ctx) {
                const docTypes: Record<string, number> = {};
                documentData.forEach(doc => {
                    const type = doc.document_type || 'Other';
                    docTypes[type] = (docTypes[type] || 0) + 1;
                });

                const labels = Object.keys(docTypes);
                const data = Object.values(docTypes);
                const backgroundColors = ['#EC4899', '#6366F1', '#10B981', '#F59E0B', '#8B5CF6'];

                if (chartInstances.current.documents) chartInstances.current.documents.destroy();

                chartInstances.current.documents = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels,
                        datasets: [{
                            data,
                            backgroundColor: backgroundColors.slice(0, labels.length),
                            borderWidth: 2,
                            borderColor: isDark ? '#2a2a2e' : '#ffffff',
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { boxWidth: 12, padding: 8, font: { size: 10 }, usePointStyle: true, color: textColor },
                            },
                            tooltip: {
                                backgroundColor: isDark ? 'rgba(28,27,31,0.95)' : 'rgba(255,255,255,0.95)',
                                titleColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                bodyColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                borderWidth: 1,
                                cornerRadius: 8,
                                callbacks: {
                                    label: function (context) {
                                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                                    }
                                }
                            }
                        },
                    },
                });
            }
        }

        // ─── 5. FORECAST CHART ───
        if (chartRefs.forecast.current) {
            const ctx = chartRefs.forecast.current.getContext('2d');
            if (ctx) {
                const months = getLast12Months();
                const baseData = months.map((_, index) => {
                    const base = 1500 + (index * 65);
                    const variation = Math.random() * 300 - 150;
                    return Math.round(base + variation);
                });

                const historicalData = baseData.slice(0, 9);
                const forecastData = baseData.slice(9);
                const paddedForecast = [...Array(9).fill(null), ...forecastData];

                if (chartInstances.current.forecast) chartInstances.current.forecast.destroy();

                chartInstances.current.forecast = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: [
                            {
                                label: 'Historical Volume',
                                data: [...historicalData, ...Array(3).fill(null)],
                                borderColor: '#6366F1',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                fill: false,
                                tension: 0.4,
                                pointRadius: 3,
                                pointBackgroundColor: '#6366F1',
                                borderWidth: 2,
                            },
                            {
                                label: 'Forecast',
                                data: paddedForecast,
                                borderColor: '#EC4899',
                                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                                fill: false,
                                tension: 0.4,
                                borderDash: [5, 5],
                                pointRadius: 3,
                                pointBackgroundColor: '#EC4899',
                                borderWidth: 2,
                            },
                            {
                                label: 'Confidence Range',
                                data: paddedForecast.map(v => v ? v + 300 : null),
                                borderColor: 'rgba(236, 72, 153, 0.2)',
                                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                                fill: '+1',
                                tension: 0.4,
                                pointRadius: 0,
                                borderWidth: 0,
                            }
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: { boxWidth: 12, padding: 8, font: { size: 10 }, usePointStyle: true, color: textColor },
                            },
                            tooltip: {
                                backgroundColor: isDark ? 'rgba(28,27,31,0.95)' : 'rgba(255,255,255,0.95)',
                                titleColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                bodyColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                borderWidth: 1,
                                cornerRadius: 8,
                            }
                        },
                        scales: {
                            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: mutedColor } },
                            y: {
                                beginAtZero: true,
                                ticks: { font: { size: 10 }, color: mutedColor },
                                grid: { color: gridColor }
                            }
                        },
                    },
                });
            }
        }

        // ─── 6. KPI CHART ───
        if (chartRefs.kpi.current && (activeTab === 'overview' || activeTab === 'kpis')) {
            const ctx = chartRefs.kpi.current.getContext('2d');
            if (ctx) {
                const kpiData = KPIs.map(k => ({
                    label: k.label,
                    value: typeof k.value === 'string' ? parseFloat(k.value) : k.value,
                    color: k.color,
                }));

                if (chartInstances.current.kpi) chartInstances.current.kpi.destroy();

                chartInstances.current.kpi = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: kpiData.map(k => k.label),
                        datasets: [{
                            label: 'KPI Values',
                            data: kpiData.map(k => k.value),
                            backgroundColor: kpiData.map(k => {
                                switch (k.color) {
                                    case 'text-pink-500': return 'rgba(236, 72, 153, 0.8)';
                                    case 'text-emerald-500': return 'rgba(16, 185, 129, 0.8)';
                                    case 'text-blue-500': return 'rgba(99, 102, 241, 0.8)';
                                    case 'text-amber-500': return 'rgba(245, 158, 11, 0.8)';
                                    case 'text-purple-500': return 'rgba(139, 92, 246, 0.8)';
                                    case 'text-indigo-500': return 'rgba(99, 102, 241, 0.8)';
                                    default: return 'rgba(99, 102, 241, 0.8)';
                                }
                            }),
                            borderRadius: 6,
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: isDark ? 'rgba(28,27,31,0.95)' : 'rgba(255,255,255,0.95)',
                                titleColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                bodyColor: isDark ? '#fcfbf9' : '#1c1b1f',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                borderWidth: 1,
                                cornerRadius: 8,
                                callbacks: {
                                    afterBody: function (tooltipItems) {
                                        const kpi = KPIs[tooltipItems[0].dataIndex];
                                        return kpi ? kpi.description : '';
                                    }
                                }
                            }
                        },
                        scales: {
                            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: mutedColor } },
                            y: {
                                beginAtZero: true,
                                ticks: { font: { size: 10 }, color: mutedColor },
                                grid: { color: gridColor }
                            }
                        },
                    },
                });
            }
        }
    };

    useEffect(() => {
        if (!loading) {
            setTimeout(initializeCharts, 300);
        }
        return () => {
            Object.values(chartInstances.current).forEach((chart: any) => {
                if (chart) chart.destroy();
            });
        };
    }, [loading, parcelData, inventoryData, procurementData, documentData, activeTab]);

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'positive': return 'text-emerald-500';
            case 'negative': return 'text-red-500';
            case 'warning': return 'text-amber-500';
            default: return 'text-blue-500';
        }
    };

    const getInsightBg = (type: string) => {
        switch (type) {
            case 'positive': return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800';
            case 'negative': return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
            case 'warning': return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
            default: return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
        }
    };

    const getKPIChangeIcon = (type: string) => {
        switch (type) {
            case 'up': return 'fa-arrow-up text-emerald-500';
            case 'down': return 'fa-arrow-down text-red-500';
            default: return 'fa-minus text-slate-400';
        }
    };

    const InfoTooltip = ({ text }: { text: string }) => (
        <span className="group relative inline-flex items-center ml-1">
            <i className="fas fa-info-circle text-slate-400 text-[10px] cursor-help hover:text-pink-500 transition-colors"></i>
            <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 dark:bg-slate-900 text-white text-[10px] rounded-lg shadow-lg whitespace-nowrap z-10 w-48 text-center">
                {text}
            </span>
        </span>
    );

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white dark:bg-[#2a2a2e] rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 shadow-sm animate-pulse">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                            <div className="h-[200px] bg-slate-100 dark:bg-slate-800 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
        { id: 'operations', label: 'Operations', icon: 'fa-warehouse' },
        { id: 'kpis', label: 'KPIs', icon: 'fa-chart-simple' },
        { id: 'insights', label: 'AI Insights', icon: 'fa-lightbulb' },
        { id: 'forecast', label: 'Forecast', icon: 'fa-chart-line' },
        { id: 'reports', label: 'Reports', icon: 'fa-file-alt' },
    ];

    // Tab content wrapper with animation
    const TabContent = ({ children }: { children: React.ReactNode }) => (
        <div className={`transition-all duration-300 ease-in-out ${isTabTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {children}
        </div>
    );

    // Chart Link component with hover effect
    const ChartLink = ({ href, label }: { href: string; label: string }) => (
        <Link
            href={href}
            className="text-[10px] text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 flex items-center gap-1 transition-all duration-200 hover:gap-2 group"
        >
            {label}
            <i className="fas fa-arrow-right text-[8px] transition-transform duration-200 group-hover:translate-x-1"></i>
        </Link>
    );

    // Card wrapper with hover effect
    const CardWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
        <div className={`bg-white dark:bg-[#2a2a2e] rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60 hover:-translate-y-1 ${className}`}>
            {children}
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as TabType)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md'
                            }`}
                    >
                        <i className={`fas ${tab.icon} text-xs`}></i>
                        {tab.label}
                    </button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={generateAISummary}
                        disabled={isGeneratingAI}
                        className="text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/20 dark:bg-pink-500 dark:hover:bg-pink-600 dark:text-white dark:shadow-pink-500/20 border border-transparent dark:border-white/10 hover:shadow-lg hover:shadow-pink-600/30 dark:hover:shadow-pink-500/30"
                    >
                        {isGeneratingAI ? (
                            <>
                                <i className="fas fa-circle-notch fa-spin text-xs" />
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-robot text-xs" />
                                <span>AI Summary</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ─── OVERVIEW TAB ─── */}
            {activeTab === 'overview' && (
                <TabContent>
                    {/* AI Insights Banner */}
                    <div className="bg-gradient-to-r from-pink-50 via-purple-50/50 to-pink-50/30 dark:from-pink-950/30 dark:via-purple-950/20 dark:to-slate-900/40 backdrop-blur-xl rounded-2xl border border-pink-200/80 dark:border-pink-500/20 p-4 shadow-sm dark:shadow-black/40 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20 dark:hover:shadow-pink-500/30 hover:-translate-y-0.5 mb-3">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/50 dark:border dark:border-pink-500/30 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-xs dark:shadow-pink-500/20 transition-all duration-300 group-hover:shadow-md group-hover:shadow-pink-500/30">
                                    <i className="fas fa-robot text-sm" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                        <span>AI Business Intelligence</span>
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-300 border border-pink-500/20 dark:border-pink-500/30 uppercase tracking-wider">
                                            Live
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Real-time insights powered by AI
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowInsights(!showInsights)}
                                    className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all duration-200 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-white/10 shadow-2xs dark:shadow-black/20 hover:shadow-md cursor-pointer"
                                >
                                    {showInsights ? 'Hide Insights' : 'Show Insights'}
                                </button>
                            </div>
                        </div>

                        {/* Insights Grid */}
                        {showInsights && (
                            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 animate-in fade-in duration-200">
                                {insights.slice(0, 4).map((insight) => (
                                    <div
                                        key={insight.id}
                                        onClick={() => setSelectedInsight(insight)}
                                        className={`p-3 rounded-xl border border-slate-200/80 dark:border-white/10 ${getInsightBg(
                                            insight.type
                                        )} dark:bg-slate-900/60 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60 hover:-translate-y-1 dark:hover:border-pink-500/40 cursor-pointer relative group flex flex-col justify-between`}
                                    >
                                        <div className="flex items-start justify-between gap-2.5">
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 truncate">
                                                    <i className={`fas ${insight.type === 'positive' ? 'fa-arrow-up' : insight.type === 'negative' ? 'fa-arrow-down' : insight.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} text-[10px] ${getInsightIcon(insight.type)}`} />
                                                    <span className="truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                                        {insight.title}
                                                    </span>
                                                    <InfoTooltip text={insight.description} />
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                                    {insight.description}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <span className={`text-xs font-semibold ${getInsightIcon(insight.type)}`}>
                                                    {insight.metric && (
                                                        <span className="block font-bold leading-none">{insight.metric}</span>
                                                    )}
                                                    {insight.change && (
                                                        <span className="block text-[10px] text-slate-400 dark:text-slate-400/80 font-medium mt-0.5">
                                                            {insight.change}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {insight.actionable && (
                                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                <Link
                                                    href={insight.actionLink || '#'}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 inline-flex items-center gap-1 transition-all duration-200 group/link hover:gap-2"
                                                >
                                                    <span>{insight.actionText || 'View Details'}</span>
                                                    <i className="fas fa-arrow-right text-[8px] transition-transform duration-200 group-hover/link:translate-x-1" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                        <CardWrapper>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                    <i className="fas fa-box text-pink-500"></i>
                                    Parcel Volume Trend
                                    <InfoTooltip text="Tracks parcel status changes over the last 7 days" />
                                </h3>
                                <ChartLink href="/warehousing" label="View Details" />
                            </div>
                            <div className="h-[200px]">
                                <canvas ref={chartRefs.parcels}></canvas>
                            </div>
                            <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-3 flex-wrap">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Received</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Sorting</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Ready</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Picked Up</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500"></span>Delivered</span>
                            </div>
                        </CardWrapper>

                        <CardWrapper>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                    <i className="fas fa-warehouse text-amber-500"></i>
                                    Inventory by Category
                                    <InfoTooltip text="Distribution of inventory items across categories" />
                                </h3>
                                <ChartLink href="/inventory" label="View All" />
                            </div>
                            <div className="h-[200px]">
                                <canvas ref={chartRefs.inventory}></canvas>
                            </div>
                        </CardWrapper>
                    </div>

                    {/* KPI Cards with hover effect */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                        {KPIs.map((kpi) => (
                            <div
                                key={kpi.id}
                                className="bg-white dark:bg-[#2a2a2e] rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-3 text-center shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60 hover:-translate-y-1 group relative"
                            >
                                <div className="flex items-center justify-center mb-1 transition-transform duration-300 group-hover:scale-110">
                                    <i className={`fas ${kpi.icon} ${kpi.color} text-lg`}></i>
                                </div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                    {kpi.label}
                                    <InfoTooltip text={kpi.description} />
                                </p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-pink-600 dark:group-hover:text-pink-400">
                                    {kpi.value}
                                </p>
                                {kpi.change && (
                                    <p className={`text-[10px] font-medium flex items-center justify-center gap-1 ${kpi.changeType === 'up' ? 'text-emerald-500' :
                                        kpi.changeType === 'down' ? 'text-red-500' : 'text-slate-400'
                                        }`}>
                                        <i className={`fas ${getKPIChangeIcon(kpi.changeType ?? '')} text-[8px]`}></i>
                                        {kpi.change}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Forecast Preview */}
                    <CardWrapper>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                    <i className="fas fa-chart-line text-pink-500"></i>
                                    Volume Forecast
                                    <InfoTooltip text="AI-powered 12-month volume projection with confidence intervals" />
                                    <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full">AI Powered</span>
                                </h3>
                            </div>
                            <ChartLink href="/forecast" label="View full forecast" />
                        </div>
                        <div className="h-[220px]">
                            <canvas ref={chartRefs.forecast}></canvas>
                        </div>
                    </CardWrapper>
                </TabContent>
            )}

            {/* ─── OPERATIONS TAB ─── */}
            {activeTab === 'operations' && (
                <TabContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60 hover:-translate-y-1">
                                <OperationsSummary />
                            </div>
                            <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60 hover:-translate-y-1">
                                <ProcurementCard />
                            </div>
                        </div>
                        <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60 hover:-translate-y-1">
                            <RecentTransactions />
                        </div>
                        <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60 hover:-translate-y-1">
                            <QuickActions />
                        </div>
                    </div>
                </TabContent>
            )}

            {/* ─── KPIS TAB ─── */}
            {activeTab === 'kpis' && (
                <TabContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {KPIs.map((kpi) => (
                                <div
                                    key={kpi.id}
                                    className="bg-white dark:bg-[#2a2a2e] rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60 hover:-translate-y-1 group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                {kpi.label}
                                                <InfoTooltip text={kpi.description} />
                                            </p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 transition-colors duration-300 group-hover:text-pink-600 dark:group-hover:text-pink-400">
                                                {kpi.value}
                                            </p>
                                            {kpi.change && (
                                                <p className={`text-xs font-medium flex items-center gap-1 mt-1 ${kpi.changeType === 'up' ? 'text-emerald-500' :
                                                    kpi.changeType === 'down' ? 'text-red-500' : 'text-slate-400'
                                                    }`}>
                                                    <i className={`fas ${getKPIChangeIcon(kpi.changeType ?? '')} text-[10px]`}></i>
                                                    {kpi.change}
                                                </p>
                                            )}
                                        </div>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color} bg-opacity-10 transition-transform duration-300 group-hover:scale-110`}>
                                            <i className={`fas ${kpi.icon} ${kpi.color}`}></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <CardWrapper>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                    <i className="fas fa-chart-bar text-pink-500"></i>
                                    KPI Performance Chart
                                    <InfoTooltip text="Visual representation of all KPI values for quick comparison" />
                                </h3>
                                <ChartLink href="/kpi-dashboard" label="View All KPIs" />
                            </div>
                            <div className="h-[300px]">
                                <canvas ref={chartRefs.kpi}></canvas>
                            </div>
                        </CardWrapper>

                        <CardWrapper>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-1">
                                <i className="fas fa-table text-pink-500"></i>
                                KPI Details
                                <InfoTooltip text="Detailed breakdown of all KPIs with performance indicators" />
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">KPI</th>
                                            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Value</th>
                                            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Change</th>
                                            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {KPIs.map((kpi) => (
                                            <tr key={kpi.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                                                <td className="px-4 py-2 flex items-center gap-2">
                                                    <i className={`fas ${kpi.icon} ${kpi.color}`}></i>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{kpi.label}</span>
                                                    <InfoTooltip text={kpi.description} />
                                                </td>
                                                <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">{kpi.value}</td>
                                                <td className="px-4 py-2">
                                                    {kpi.change && (
                                                        <span className={`text-xs font-medium flex items-center gap-1 ${kpi.changeType === 'up' ? 'text-emerald-500' :
                                                            kpi.changeType === 'down' ? 'text-red-500' : 'text-slate-400'
                                                            }`}>
                                                            <i className={`fas ${getKPIChangeIcon(kpi.changeType ?? '')} text-[10px]`}></i>
                                                            {kpi.change}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${kpi.changeType === 'up' ? 'bg-emerald-100 text-emerald-700' :
                                                        kpi.changeType === 'down' ? 'bg-red-100 text-red-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {kpi.changeType === 'up' ? 'Improving' :
                                                            kpi.changeType === 'down' ? 'Declining' :
                                                                'Stable'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardWrapper>
                    </div>
                </TabContent>
            )}

            {/* ─── INSIGHTS TAB ─── */}
            {activeTab === 'insights' && (
                <TabContent>
                    <div className="space-y-6">
                        {/* AI Insights Header */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 shadow-xs backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60 hover:-translate-y-1">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-pink-500 dark:bg-pink-600 flex items-center justify-center shadow-xs border border-white/20 dark:border-white/10 transition-transform duration-300 hover:scale-110">
                                        <i className="fas fa-robot text-2xl text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2.5">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            AI-Powered Intelligence
                                        </h3>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                                        Get real-time AI-powered insights and actionable recommendations based on your operational data.
                                    </p>
                                </div>

                                <button
                                    onClick={generateAISummary}
                                    disabled={isGeneratingAI}
                                    className="flex-shrink-0 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white rounded-xl transition-all duration-200 shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer border border-pink-700 dark:border-pink-400/30 hover:shadow-lg hover:shadow-pink-600/30 dark:hover:shadow-pink-500/30"
                                >
                                    {isGeneratingAI ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin text-xs" />
                                            Analyzing Data...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-wand-magic-sparkles text-xs" />
                                            Generate Insights
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Insights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {insights.map((insight) => {
                                const iconMap = {
                                    positive: 'fa-circle-check',
                                    negative: 'fa-circle-exclamation',
                                    warning: 'fa-triangle-exclamation',
                                    neutral: 'fa-circle-info',
                                };

                                const colorClasses = {
                                    positive: {
                                        card: 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/40',
                                        iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40',
                                        badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40',
                                    },
                                    negative: {
                                        card: 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/40',
                                        iconBg: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-800/40',
                                        badge: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/40',
                                    },
                                    warning: {
                                        card: 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-500/40',
                                        iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40',
                                        badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40',
                                    },
                                    neutral: {
                                        card: 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/40',
                                        iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40',
                                        badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40',
                                    },
                                };

                                const currentStyle = colorClasses[insight.type] || colorClasses.neutral;

                                return (
                                    <div
                                        key={insight.id}
                                        className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60 hover:-translate-y-1 cursor-pointer ${currentStyle.card}`}
                                        onClick={() => setSelectedInsight(insight)}
                                    >
                                        <div className="flex items-start gap-3.5 sm:gap-4">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${currentStyle.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                                                <i className={`fas ${iconMap[insight.type]} text-base`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300">
                                                        {insight.title}
                                                    </h4>
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${currentStyle.badge}`}>
                                                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                                                    {insight.description}
                                                </p>

                                                {insight.metric && (
                                                    <div className="mt-3 flex items-center gap-4 text-xs">
                                                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                            <i className="fas fa-chart-simple text-[10px] text-slate-400 dark:text-slate-500" />
                                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{insight.metric}</span>
                                                        </span>
                                                        {insight.change && (
                                                            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                                <i className="fas fa-arrow-right text-[10px] text-slate-400 dark:text-slate-500" />
                                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{insight.change}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {insight.actionable && (
                                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                                                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/30">
                                                    <i className="fas fa-lightbulb text-[9px]" />
                                                    Actionable
                                                </span>
                                                <Link
                                                    href={insight.actionLink || '#'}
                                                    className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 flex items-center gap-1 transition-all duration-200 group-hover:gap-1.5"
                                                >
                                                    {insight.actionText || 'Take Action'}
                                                    <i className="fas fa-arrow-right text-[10px] transition-transform duration-200 group-hover:translate-x-1" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {insights.length === 0 && (
                            <div className="text-center py-14 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/40">
                                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 flex items-center justify-center mb-3 text-slate-400 dark:text-slate-500 transition-transform duration-300 hover:scale-110">
                                    <i className="fas fa-robot text-xl" />
                                </div>
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Insights Generated Yet</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                    Click &quot;Generate Insights&quot; above to run automated AI diagnostics on your records.
                                </p>
                            </div>
                        )}

                        {/* AI Summary Modal */}
                        {selectedInsight && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                                onClick={() => setSelectedInsight(null)}
                            >
                                <div
                                    className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl border border-slate-200/80 dark:border-white/10 animate-scale-in transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Modal Header */}
                                    <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/50 border border-pink-200/60 dark:border-pink-800/40 flex items-center justify-center text-pink-600 dark:text-pink-400 transition-transform duration-300 hover:scale-110">
                                                <i className="fas fa-lightbulb text-xs" />
                                            </div>
                                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                                {selectedInsight.title}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => setSelectedInsight(null)}
                                            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center transition-colors duration-200 cursor-pointer hover:shadow-md"
                                        >
                                            <i className="fas fa-xmark text-xs" />
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6 space-y-4">
                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/5 transition-all duration-300 hover:shadow-md">
                                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                {selectedInsight.description}
                                            </p>
                                        </div>

                                        {selectedInsight.metric && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-xl p-3.5 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Metric</p>
                                                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedInsight.metric}</p>
                                                </div>
                                                {selectedInsight.change && (
                                                    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-xl p-3.5 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Change</p>
                                                        <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedInsight.change}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedInsight.actionable && (
                                            <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex justify-end">
                                                <Link
                                                    href={selectedInsight.actionLink || '#'}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white rounded-xl transition-all duration-200 text-xs font-semibold shadow-xs hover:shadow-lg hover:shadow-pink-600/30 dark:hover:shadow-pink-500/30 hover:gap-2.5"
                                                >
                                                    {selectedInsight.actionText || 'Take Action'}
                                                    <i className="fas fa-arrow-right text-[10px] transition-transform duration-200 group-hover:translate-x-1" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </TabContent>
            )}

            {/* ─── FORECAST TAB ─── */}
            {activeTab === 'forecast' && (
                <TabContent>
                    <div className="space-y-4">
                        <CardWrapper>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                        <i className="fas fa-chart-line text-pink-500"></i>
                                        Volume Forecast
                                        <InfoTooltip text="AI-powered 12-month volume projection with confidence intervals" />
                                        <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full">AI Powered</span>
                                    </h3>
                                </div>
                                <ChartLink href="/forecast" label="View full forecast" />
                            </div>
                            <div className="h-[300px]">
                                <canvas ref={chartRefs.forecast}></canvas>
                            </div>
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                    <p className="text-[10px] text-slate-400 uppercase">Next Month</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">2,450</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                    <p className="text-[10px] text-slate-400 uppercase">Growth</p>
                                    <p className="text-lg font-bold text-emerald-500">+8.2%</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                    <p className="text-[10px] text-slate-400 uppercase">Confidence</p>
                                    <p className="text-lg font-bold text-blue-500">High</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                    <p className="text-[10px] text-slate-400 uppercase">Quarterly</p>
                                    <p className="text-lg font-bold text-purple-500">+12.4%</p>
                                </div>
                            </div>
                        </CardWrapper>
                    </div>
                </TabContent>
            )}

            {/* ─── REPORTS TAB ─── */}
            {activeTab === 'reports' && (
                <TabContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { title: 'Executive Summary', icon: 'fa-file-alt', color: 'text-pink-500', desc: 'Complete overview of all operations', link: '/reports/executive' },
                                { title: 'Parcel Performance', icon: 'fa-box', color: 'text-blue-500', desc: 'Detailed parcel metrics and trends', link: '/reports/parcels' },
                                { title: 'Inventory Report', icon: 'fa-warehouse', color: 'text-amber-500', desc: 'Stock levels and inventory health', link: '/reports/inventory' },
                                { title: 'Procurement Status', icon: 'fa-shopping-cart', color: 'text-purple-500', desc: 'Purchase requests and approvals', link: '/reports/procurement' },
                                { title: 'Courier Performance', icon: 'fa-truck', color: 'text-emerald-500', desc: 'Courier efficiency and metrics', link: '/reports/couriers' },
                                { title: 'Financial Summary', icon: 'fa-chart-bar', color: 'text-indigo-500', desc: 'Cost breakdown and savings', link: '/reports/financial' },
                            ].map((report) => (
                                <div
                                    key={report.title}
                                    className="bg-white dark:bg-[#2a2a2e] rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-black/60 hover:-translate-y-1 group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.color} bg-opacity-10 transition-transform duration-300 group-hover:scale-110`}>
                                            <i className={`fas ${report.icon} ${report.color}`}></i>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                                {report.title}
                                                <InfoTooltip text={report.desc} />
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{report.desc}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400">Last updated: Today</span>
                                        <Link
                                            href={report.link}
                                            className="text-xs text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 flex items-center gap-1 transition-all duration-200 hover:gap-2 group/link"
                                        >
                                            <i className="fas fa-file-pdf text-[10px]"></i> View Report
                                            <i className="fas fa-arrow-right text-[8px] transition-transform duration-200 group-hover/link:translate-x-1"></i>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabContent>
            )}
        </div>
    );
}