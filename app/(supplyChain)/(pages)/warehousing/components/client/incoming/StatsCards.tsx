"use client";

interface StatsCardsProps {
    scanned: number;
    topCourier: string;
}

export function StatsCards({ scanned, topCourier }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 self-center w-full">
            <div className="bg-[#f0f3f8] dark:bg-[#1d1e28] border border-white/70 dark:border-[#2a2b38] hover:border-pink-300 dark:hover:border-pink-500/50 shadow-[3px_3px_7px_rgba(166,175,195,0.35),-3px_-3px_7px_rgba(255,255,255,0.9),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.55),-2px_-2px_6px_rgba(255,255,255,0.04),inset_0_1px_1px_rgba(255,255,255,0.06)] transition-all p-3.5 sm:p-4 rounded-2xl text-center flex flex-col items-center justify-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Scanned
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                    {scanned ?? 0}
                </div>
                <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <i className="fas fa-barcode text-[9px] text-pink-500"></i>
                    <span>total processed</span>
                </div>
            </div>

            <div className="bg-[#f0f3f8] dark:bg-[#1d1e28] border border-white/70 dark:border-[#2a2b38] hover:border-pink-300 dark:hover:border-pink-500/50 shadow-[3px_3px_7px_rgba(166,175,195,0.35),-3px_-3px_7px_rgba(255,255,255,0.9),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.55),-2px_-2px_6px_rgba(255,255,255,0.04),inset_0_1px_1px_rgba(255,255,255,0.06)] transition-all p-3.5 sm:p-4 rounded-2xl text-center flex flex-col items-center justify-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Top Courier
                </span>
                <div
                    className="text-xl sm:text-2xl font-black text-pink-600 dark:text-pink-400 tracking-tight mt-1 truncate max-w-full px-1"
                    title={topCourier || "N/A"}
                >
                    {topCourier || "—"}
                </div>
                <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <i className="fas fa-truck text-[9px] text-pink-500"></i>
                    <span>highest volume</span>
                </div>
            </div>
        </div>
    );
}