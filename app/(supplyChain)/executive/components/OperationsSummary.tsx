import ViewLink from "@/app/(supplyChain)/components/global/Links";

export default function OperationsSummary() {
    return (
        <div className="card p-5 
                        bg-white dark:bg-[#2a2a2e] 
                        border border-slate-200/60 dark:border-slate-700/60 
                        rounded-xl shadow-sm 
                        dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between pb-3 
                            border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center">
                    <i className="fas fa-warehouse mr-2 text-xs text-pink-500 dark:text-pink-400"></i>
                    Operations summary
                </div>
                <ViewLink link="/warehousing" name="view" />
            </div>

            <ul className="mt-2 divide-y divide-slate-200/60 dark:divide-slate-700/60 text-sm">
                <li className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Sorting areas active</span>
                    <span className="font-semibold text-slate-900 dark:text-white">4 / 4</span>
                </li>
                <li className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Avg dwell time</span>
                    <span className="font-semibold text-slate-900 dark:text-white">3h 12m</span>
                </li>
                <li className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Scans (today)</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">2,146</span>
                </li>
                <li className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Anomalies flagged</span>
                    <span className="font-semibold text-xs px-2 py-0.5 rounded 
                                    bg-slate-900 dark:bg-pink-500 
                                    text-white">
                        3 flagged
                    </span>
                </li>
            </ul>
        </div>
    );
}