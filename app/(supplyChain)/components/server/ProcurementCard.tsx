import ViewLink from "@/app/(supplyChain)/components/global/Links";

export default function ProcurementCard() {
    return (
        <div className="card p-5 
                        bg-white dark:bg-[#2a2a2e] 
                        border border-slate-200/60 dark:border-slate-700/60 
                        rounded-xl shadow-sm 
                        dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between pb-3 
                            border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center">
                    <i className="fas fa-shopping-cart mr-2 text-xs text-pink-500 dark:text-pink-400"></i>
                    Procurement
                </div>
                <ViewLink link="/procurement" name="view" />
            </div>

            <ul className="mt-2 divide-y divide-slate-200/60 dark:divide-slate-700/60 text-sm">
                <li className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Open POs</span>
                    <span className="font-semibold text-slate-900 dark:text-white">12</span>
                </li>
                <li className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Pending approvals</span>
                    <span className="font-semibold text-xs px-2 py-0.5 rounded 
                                    bg-amber-50 dark:bg-amber-950/30 
                                    text-amber-700 dark:text-amber-400 
                                    border border-amber-200/60 dark:border-amber-800/30">
                        2 pending
                    </span>
                </li>
                <li className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">MTD spend</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">₱ 661,500</span>
                </li>
                <li className="py-2.5">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-600 dark:text-slate-400">Budget utilization</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">62%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 dark:bg-pink-400 rounded-full transition-all duration-500"
                            style={{ width: "62%" }}></div>
                    </div>
                </li>
            </ul>
        </div>
    );
}