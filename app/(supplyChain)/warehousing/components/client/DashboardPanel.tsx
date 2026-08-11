"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Chart from "chart.js/auto";
import Cards from '../../../components/global/Cards';
import { LinkBtn } from '../../../components/global/Buttons';
import { supabase } from "@/app/(supplyChain)/lib/services/client/supabase";
import { PageSkeleton } from "@/app/(supplyChain)/components/ui/SkeletonLoader";

interface DashboardStats {
    scannedParcels: number;
    highestParcels: number;
    monthlyTotal: number;
    topCourier: string;
    courierData: {
        name: string;
        data: number[];
        color: string;
    }[];
    dailyLabels: string[];
    dailyFullDates: string[];
    forecast: {
        day: string;
        parcels: number;
        change: number;
        width: number;
    }[];
}

interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
    pointRadius: number;
    pointBackgroundColor: string;
    pointHoverRadius: number;
    pointHoverBackgroundColor: string;
}

export default function DashboardPanel() {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);
    const [stats, setStats] = useState<DashboardStats>({
        scannedParcels: 0,
        highestParcels: 0,
        monthlyTotal: 0,
        topCourier: 'N/A',
        courierData: [],
        dailyLabels: [],
        dailyFullDates: [],
        forecast: [],
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [courierDetails, setCourierDetails] = useState<{
        topCourier: { name: string; count: number };
        courierBreakdown: { name: string; count: number }[];
        peakHour: { hour: number; count: number; timeRange: string };
        busiestDay: { date: string; count: number; dayName: string };
        avgDaily: number;
    }>({
        topCourier: { name: 'N/A', count: 0 },
        courierBreakdown: [],
        peakHour: { hour: 0, count: 0, timeRange: '' },
        busiestDay: { date: '', count: 0, dayName: '' },
        avgDaily: 0,
    });

    const isMounted = useRef(true);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = (message: string, type: string = "info") => {
        alert(message);
    };

    const colors = ['#EC4899', '#6366F1', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            const today = new Date();
            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            //  1. Get total scanned today
            const { count: scannedCount, error: scannedError } = await supabase
                .from('parcels')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString());

            if (scannedError) throw scannedError;

            //  2. Get detailed hourly data for peak hour
            const { data: hourlyData, error: hourlyError } = await supabase
                .from('parcels')
                .select('created_at')
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString());

            if (hourlyError) throw hourlyError;

            let highestParcels = 0;
            let peakHour = 0;
            if (hourlyData && hourlyData.length > 0) {
                const hourCounts: Record<string, number> = {};
                hourlyData.forEach((p: any) => {
                    const hour = new Date(p.created_at).getHours();
                    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                });

                let maxCount = 0;
                let maxHour = 0;
                for (const [hour, count] of Object.entries(hourCounts)) {
                    if (count > maxCount) {
                        maxCount = count;
                        maxHour = parseInt(hour);
                    }
                }
                highestParcels = maxCount;
                peakHour = maxHour;
            }

            //  3. Get monthly total - FIX: handle null
            const { count: monthlyCount, error: monthlyError } = await supabase
                .from('parcels')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', thirtyDaysAgo.toISOString());

            if (monthlyError) throw monthlyError;

            //  4. Get top courier with count
            const { data: courierStats, error: courierStatsError } = await supabase
                .from('parcels')
                .select('courier')
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString());

            if (courierStatsError) throw courierStatsError;

            let topCourier = 'N/A';
            let topCourierCount = 0;
            const courierCounts: Record<string, number> = {};

            if (courierStats && courierStats.length > 0) {
                courierStats.forEach((p: any) => {
                    if (p.courier) {
                        courierCounts[p.courier] = (courierCounts[p.courier] || 0) + 1;
                    }
                });

                let maxCount = 0;
                let maxName = '';
                for (const [name, count] of Object.entries(courierCounts)) {
                    if (count > maxCount) {
                        maxCount = count;
                        maxName = name;
                    }
                }
                topCourier = maxName || 'N/A';
                topCourierCount = maxCount;
            }

            //  5. Get courier breakdown for all couriers
            const courierBreakdown = Object.entries(courierCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            //  6. Get busiest day in the last 7 days
            const { data: dailyData, error: dailyError } = await supabase
                .from('parcels')
                .select('created_at')
                .gte('created_at', sevenDaysAgo.toISOString());

            if (dailyError) throw dailyError;

            const dailyCountMap: Record<string, number> = {};
            dailyData?.forEach((p: any) => {
                const date = new Date(p.created_at).toISOString().split('T')[0];
                dailyCountMap[date] = (dailyCountMap[date] || 0) + 1;
            });

            let busiestDate = '';
            let busiestCount = 0;
            for (const [date, count] of Object.entries(dailyCountMap)) {
                if (count > busiestCount) {
                    busiestCount = count;
                    busiestDate = date;
                }
            }

            const busiestDayName = busiestDate
                ? new Date(busiestDate).toLocaleDateString('en-US', { weekday: 'long' })
                : 'N/A';

            //  7. Calculate average daily - FIX: handle null monthlyCount
            const safeMonthlyCount = monthlyCount || 0;
            const avgDaily = safeMonthlyCount > 0 ? Math.round(safeMonthlyCount / 30) : 0;

            //  8. Set courier details
            setCourierDetails({
                topCourier: { name: topCourier, count: topCourierCount },
                courierBreakdown,
                peakHour: {
                    hour: peakHour,
                    count: highestParcels,
                    timeRange: peakHour > 0 ? `${peakHour}:00 - ${peakHour + 1}:00` : 'No data'
                },
                busiestDay: {
                    date: busiestDate,
                    count: busiestCount,
                    dayName: busiestDayName
                },
                avgDaily,
            });

            //  9. Get courier data for chart (last 7 days)
            const { data: courierChartData, error: courierChartError } = await supabase
                .from('parcels')
                .select('courier, created_at')
                .gte('created_at', sevenDaysAgo.toISOString());

            if (courierChartError) throw courierChartError;

            //  Generate proper date labels for the last 7 days
            const dateLabels: string[] = [];
            const fullDateLabels: string[] = [];
            const dateMap: Record<string, number> = {};

            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateKey = date.toISOString().split('T')[0];
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                dateLabels.push(dayName);
                fullDateLabels.push(`${dayName}, ${monthDay}`);
                dateMap[dateKey] = 6 - i;
            }

            //  Initialize courier data with zeros for all 7 days
            const courierMap: Record<string, number[]> = {};

            if (courierChartData) {
                courierChartData.forEach((p: any) => {
                    const date = new Date(p.created_at);
                    const dateKey = date.toISOString().split('T')[0];
                    const dayIndex = dateMap[dateKey];

                    if (dayIndex !== undefined && p.courier) {
                        if (!courierMap[p.courier]) {
                            courierMap[p.courier] = new Array(7).fill(0);
                        }
                        courierMap[p.courier][dayIndex] += 1;
                    }
                });
            }

            const courierData = Object.keys(courierMap).map((name, index) => ({
                name,
                data: courierMap[name],
                color: colors[index % colors.length],
            }));

            //  10. Generate forecast
            const dailyValues = Object.values(dailyCountMap);
            const avg = dailyValues.length > 0
                ? dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length
                : 100;

            const forecastDays = ['Tomorrow', 'In 2 days', 'In 3 days', 'In 5 days', 'In 7 days'];
            const forecastChanges = [8, -3, 12, -5, 6];
            const maxParcels = 2000;

            const forecast = forecastDays.map((day, index) => {
                const parcels = Math.round(avg * (1 + forecastChanges[index] / 100));
                const width = Math.min(Math.max((parcels / maxParcels) * 100, 5), 100);
                return {
                    day,
                    parcels,
                    change: forecastChanges[index],
                    width,
                };
            });

            if (isMounted.current) {
                setStats({
                    scannedParcels: scannedCount || 0,
                    highestParcels: highestParcels || 0,
                    monthlyTotal: safeMonthlyCount,
                    topCourier: topCourier || 'N/A',
                    courierData,
                    dailyLabels: dateLabels,
                    dailyFullDates: fullDateLabels,
                    forecast,
                });

                setLastUpdated(new Date());
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (loading) return;
        if (!chartRef.current) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }

        const ctx = chartRef.current.getContext("2d");
        if (!ctx) return;

        const datasets: ChartDataset[] = stats.courierData.map((courier) => ({
            label: courier.name,
            data: courier.data,
            borderColor: courier.color,
            backgroundColor: `${courier.color}20`,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: courier.color,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: courier.color,
        }));

        chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: stats.dailyFullDates,
                datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        display: true, position: "top",
                        labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true, font: { size: 11 }, padding: 10 },
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1e293b',
                        bodyColor: '#475569',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        cornerRadius: 8,
                        boxPadding: 6,
                        usePointStyle: true,
                        callbacks: {
                            title: (items) => items[0].label,
                            label: (context) => `${context.dataset.label || ''}: ${context.parsed.y || 0} parcels`,
                            afterBody: (items) => `Total: ${items.reduce((sum, i) => sum + (i.parsed.y || 0), 0)} parcels`,
                        },
                    },
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                    y: { grid: { color: "#F1F5F9" }, beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } } },
                },
                hover: { mode: 'nearest', intersect: true },
            },
        });
    }, [loading, stats.courierData, stats.dailyFullDates]);
    useEffect(() => {
        isMounted.current = true;
        console.log('Setting up dashboard real-time subscription...');

        fetchDashboardData();

        const subscription = supabase
            .channel('dashboard_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'parcels' },
                async (payload) => {
                    if (isMounted.current) {
                        if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
                        refreshTimeoutRef.current = setTimeout(() => fetchDashboardData(), 500);
                    }
                }
            )
            .subscribe((status) => console.log('Dashboard subscription status:', status));

        return () => {
            console.log('Cleaning up dashboard real-time subscription...');
            subscription.unsubscribe();
            if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
            isMounted.current = false;
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [fetchDashboardData]);


    if (loading) {
        return (
            <PageSkeleton />
        );
    }

    return (
        <div data-panel="dashboard" className="p-4 sm:p-8 space-y-6 sm:space-y-8 mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200/60">
                            <i className="fas fa-warehouse text-slate-400 text-[10px]"></i>
                            <span>Airship Express</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500">Warehouse</span>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Real-time warehouse operations overview and metrics
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <i className="fas fa-clock text-[11px] text-slate-400"></i>
                        <span>Updated: <strong className="text-slate-600 font-semibold">{lastUpdated.toLocaleTimeString()}</strong></span>
                    </div>

                    <button
                        type="button"
                        onClick={fetchDashboardData}
                        title="Refresh dashboard metrics"
                        className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                    >
                        <i className="fas fa-rotate text-xs text-slate-500 transition-transform group-hover:rotate-180"></i>
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Cards
                    frontIcon="fas fa-box mr-1"
                    header="Received Parcels"
                    data={stats.scannedParcels.toLocaleString()}
                    arrow="fas fa-arrow-up mr-1"
                    description="Today"
                    backBg="bg-slate-900"
                    backHeader="Received Parcels Details"
                    backIcon="fas fa-box"
                    headerTextColor="text-slate-200"
                    backDescription={`Total of ${stats.scannedParcels} parcels received today.\n\n ${courierDetails.courierBreakdown.length > 0 ? courierDetails.courierBreakdown.slice(0, 3).map(c => `${c.name}: ${c.count}`).join('\n') : 'No courier data'}\n\n Top Courier: ${courierDetails.topCourier.name} (${courierDetails.topCourier.count} parcels)`}
                    tooltip="Click to see details about received parcels"
                    tooltipLink="/warehousing?tab=incoming"
                    badge={stats.scannedParcels > 0 ? 'Live' : ''}
                />

                <Cards
                    frontIcon="fas fa-clock mr-1"
                    header="Peak Hour Volume"
                    data={stats.highestParcels.toString()}
                    arrow="fas fa-arrow-up mr-1"
                    description={courierDetails.peakHour.timeRange}
                    backBg="bg-slate-900"
                    backHeader="Peak Hour Details"
                    backIcon="fas fa-clock"
                    headerTextColor="text-slate-200"
                    backDescription={`${stats.highestParcels} parcels during peak hour.\n\n⏰ Time: ${courierDetails.peakHour.timeRange}\n\n Avg parcels/hour: ${Math.round(stats.scannedParcels / Math.max(1, Object.keys(courierDetails.courierBreakdown).length || 1))}`}
                    tooltip="Click to see peak hour details"
                    tooltipLink="/warehousing?tab=incoming&view=hourly"
                    badge={courierDetails.peakHour.timeRange !== 'No data' ? `Peak ${courierDetails.peakHour.timeRange}` : ''}
                />

                <Cards
                    frontIcon="fas fa-warehouse mr-1"
                    header="Total Parcels (30D)"
                    data={stats.monthlyTotal.toLocaleString()}
                    arrow="fas fa-arrow-up mr-1"
                    description="Last 30 days"
                    backBg="bg-slate-900"
                    backHeader="Monthly Parcel Details"
                    backIcon="fas fa-chart-line"
                    headerTextColor="text-slate-200"
                    backDescription={`Total of ${stats.monthlyTotal} parcels processed.\n\n📈 Daily average: ${courierDetails.avgDaily} parcels/day\n\n Busiest day: ${courierDetails.busiestDay.dayName} (${courierDetails.busiestDay.count} parcels)`}
                    tooltip="Click to see monthly statistics"
                    tooltipLink="/inventory"
                    badge={`${courierDetails.avgDaily}/day avg`}
                />

                <Cards
                    frontIcon="fas fa-calendar-day mr-1"
                    header="Busiest Day"
                    data={courierDetails.busiestDay.dayName || 'N/A'}
                    arrow="fas fa-arrow-up mr-1"
                    description={`${courierDetails.busiestDay.count} parcels`}
                    backBg="bg-slate-900"
                    backHeader="Busiest Day Details"
                    backIcon="fas fa-calendar-check"
                    headerTextColor="text-slate-200"
                    backDescription={`Busiest day: ${courierDetails.busiestDay.dayName}\n\n📦 Parcels: ${courierDetails.busiestDay.count}\n\n Date: ${courierDetails.busiestDay.date ? new Date(courierDetails.busiestDay.date).toLocaleDateString() : 'N/A'}\n\n Top courier: ${courierDetails.topCourier.name} (${courierDetails.topCourier.count} parcels)`}
                    tooltip="Click to see busiest day details"
                    tooltipLink="/warehousing?tab=incoming&view=daily"
                    badge={`${courierDetails.busiestDay.count} parcels`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 lg:gap-8">
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
                                <i className="fas fa-chart-line text-slate-400"></i>
                                Courier Parcel Volume
                            </h2>
                            <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">
                                Last 7 days
                            </span>
                        </div>
                        <div className="mt-4 relative min-h-[200px]">
                            <canvas ref={chartRef} height="120"></canvas>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-3 border-t border-slate-100">
                        <i className="fas fa-circle-info"></i>
                        <span>Hover over data points to inspect specific metrics</span>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
                                <i className="fas fa-robot text-pink-500"></i>
                                Ask AI Assistant
                            </h2>
                            <span className="text-xs text-slate-400 font-medium">Suggested queries</span>
                        </div>

                        <ul className="mt-4 space-y-2.5">
                            {[
                                {
                                    color: "bg-pink-500",
                                    text: "How many parcels were received today?",
                                    msg: `AI: Today's total: ${stats.scannedParcels} parcels received.`,
                                },
                                {
                                    color: "bg-amber-500",
                                    text: "What's the expected dispatch volume for tomorrow?",
                                    msg: `AI: Tomorrow's forecast: ${stats.forecast[0]?.parcels || 0} parcels expected.`,
                                },
                                {
                                    color: "bg-blue-500",
                                    text: "Which courier has the highest volume?",
                                    msg: `AI: Top courier is ${courierDetails.topCourier.name} with ${courierDetails.topCourier.count} parcels.`,
                                },
                                {
                                    color: "bg-emerald-500",
                                    text: "When was the busiest day this week?",
                                    msg: `AI: Busiest day was ${courierDetails.busiestDay.dayName} with ${courierDetails.busiestDay.count} parcels.`,
                                },
                            ].map((q, idx) => (
                                <li key={idx}>
                                    <button
                                        className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-pink-50/60 hover:border-pink-200/80 transition-all group"
                                        onClick={() => showToast(q.msg, "info")}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${q.color} shrink-0`}></span>
                                        <span className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-900 font-medium transition-colors">
                                            {q.text}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                        <button
                            className="btn-ghost text-xs w-full py-2 flex items-center justify-center gap-1.5 font-medium text-pink-600 hover:text-pink-700 hover:bg-pink-50/50 rounded-lg transition-all"
                            onClick={() => showToast("Opening AI chat...", "info")}
                        >
                            <i className="fas fa-comment-dots"></i>
                            <span>Open Interactive AI Chat →</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
                                <i className="fas fa-chart-line text-indigo-500"></i>
                                Prophet Forecast
                            </h2>
                            <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">
                                7-Day Projection
                            </span>
                        </div>

                        <div className="mt-4 space-y-3.5">
                            {stats.forecast.length > 0 ? (
                                stats.forecast.map((item, index) => {
                                    const isPositive = item.change > 0;
                                    return (
                                        <div key={index} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center justify-between text-xs sm:text-sm">
                                                <span className="font-medium text-slate-700 w-20">{item.day}</span>
                                                <span className="font-semibold text-slate-900">
                                                    {item.parcels.toLocaleString()}{" "}
                                                    <span className="text-xs font-normal text-slate-400">parcels</span>
                                                </span>
                                                <span
                                                    className={`font-medium flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${isPositive
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-amber-50 text-amber-700"
                                                        }`}
                                                >
                                                    <i
                                                        className={`fas ${isPositive ? "fa-arrow-trend-up" : "fa-arrow-trend-down"
                                                            }`}
                                                    ></i>
                                                    {Math.abs(item.change)}%
                                                </span>
                                            </div>
                                            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${item.width}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-slate-400 py-8 flex flex-col items-center justify-center">
                                    <i className="fas fa-chart-line text-3xl mb-2 text-slate-300"></i>
                                    <p className="text-sm">No forecast data currently available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                        <LinkBtn
                            link="/forecast"
                            className="btn-ghost text-xs w-full py-2 flex items-center justify-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 rounded-lg transition-all"
                            icon="fas fa-arrow-trend-up"
                            label="View Full Predictive Analytics →"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}