import ViewLink from "@/app/(supplyChain)/components/global/Links";

export default function FleetCard() {
    return (
        <div className="card p-5 
                        bg-white dark:bg-[#2a2a2e] 
                        border border-slate-200/60 dark:border-slate-700/60 
                        rounded-xl shadow-sm 
                        dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between pb-3 
                            border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center">
                    <i className="fas fa-truck mr-2 text-xs text-blue-500 dark:text-blue-400"></i>
                    Fleet
                </div>
                <ViewLink link="/fleet" name="view" />
            </div>

            <ul className="mt-2 divide-y divide-slate-200/60 dark:divide-slate-700/60 text-sm">
                <li className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Vehicles on route</span>
                    <span className="font-semibold text-slate-900 dark:text-white">7 / 10</span>
                </li>
                <li className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Drivers active</span>
                    <span className="font-semibold text-slate-900 dark:text-white">7</span>
                </li>
                <li className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Maintenance due</span>
                    <span className="font-semibold text-xs px-2 py-0.5 rounded 
                                    bg-orange-50 dark:bg-orange-950/30 
                                    text-orange-700 dark:text-orange-400 
                                    border border-orange-200/60 dark:border-orange-800/30">
                        2 vehicles
                    </span>
                </li>
                <li className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Avg fuel level</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">64%</span>
                </li>
            </ul>
        </div>
    );
}