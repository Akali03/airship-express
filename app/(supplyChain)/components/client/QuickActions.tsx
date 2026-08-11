"use client";

import { LinkBtn } from "../global/Buttons";

interface Activity {
    id: number;
    title: React.ReactNode;
    time: string;
    user: string;
    dotColor: string;
}

const activities: Activity[] = [
    {
        id: 1,
        title: (
            <>
                Manifest <b className="font-mono text-black dark:text-white">MF-0421</b> generated for J&amp;T Express
            </>
        ),
        time: "2 minutes ago",
        user: "Joana D.",
        dotColor: "bg-black dark:bg-white"
    },
    {
        id: 2,
        title: <>PR-2026-001 approved</>,
        time: "14 minutes ago",
        user: "Ramon A.",
        dotColor: "bg-black/60 dark:bg-white/60"
    },
    {
        id: 3,
        title: <>VH-004 flagged for maintenance</>,
        time: "1 hour ago",
        user: "Fleet bot",
        dotColor: "bg-black/40 dark:bg-white/40"
    },
    {
        id: 4,
        title: <>214 parcels moved to Area B</>,
        time: "2 hours ago",
        user: "Sorting team",
        dotColor: "bg-black/20 dark:bg-white/20"
    }
];

export default function QuickActions() {
    const handleAction = (action: string) => {
        console.log(`Action triggered: ${action}`);
    };

    return (
        <div className="card p-5 
                        bg-white dark:bg-[#2a2a2e] 
                        border border-slate-200/60 dark:border-slate-700/60 
                        rounded-xl shadow-sm 
                        dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            <div className="font-semibold text-slate-900 dark:text-white mb-3">
                <i className="fas fa-bolt mr-2 text-pink-500 dark:text-pink-400"></i> Quick actions
            </div>

            <div className="p-4 bg-white dark:bg-[#2a2a2e] rounded-xl 
                            border border-slate-200/60 dark:border-slate-700/60">
                <div className="grid grid-cols-2 gap-2">
                    <LinkBtn
                        link='/warehousing'
                        icon='fas fa-scan mr-1.5 text-xs'
                        label='Scan Parcel'
                        className="flex items-center justify-center px-3 py-2.5 rounded-lg 
                                   border border-slate-200/60 dark:border-slate-700/60 
                                   bg-white dark:bg-[#2a2a2e] 
                                   hover:bg-slate-900 dark:hover:bg-pink-500 
                                   hover:text-white dark:hover:text-white 
                                   text-slate-800 dark:text-slate-200 
                                   text-xs font-semibold transition-all duration-200"
                    />
                    <LinkBtn
                        link='/purchase-orders'
                        icon='fas fa-file-invoice mr-1.5 text-xs'
                        label='Create PO'
                        className="flex items-center justify-center px-3 py-2.5 rounded-lg 
                                   border border-slate-200/60 dark:border-slate-700/60 
                                   bg-white dark:bg-[#2a2a2e] 
                                   hover:bg-slate-900 dark:hover:bg-pink-500 
                                   hover:text-white dark:hover:text-white 
                                   text-slate-800 dark:text-slate-200 
                                   text-xs font-semibold transition-all duration-200"
                    />
                    <LinkBtn
                        link='/documents?modal=upload'
                        icon='fas fa-upload mr-1.5 text-xs'
                        label='Upload document'
                        className="flex items-center justify-center px-3 py-2.5 rounded-lg 
                                   border border-slate-200/60 dark:border-slate-700/60 
                                   bg-white dark:bg-[#2a2a2e] 
                                   hover:bg-slate-900 dark:hover:bg-pink-500 
                                   hover:text-white dark:hover:text-white 
                                   text-slate-800 dark:text-slate-200 
                                   text-xs font-semibold transition-all duration-200"
                    />
                    <button
                        onClick={() => handleAction('view-forecast')}
                        className="flex items-center justify-center px-3 py-2.5 rounded-lg 
                                   border border-slate-200/60 dark:border-slate-700/60 
                                   bg-white dark:bg-[#2a2a2e] 
                                   hover:bg-slate-900 dark:hover:bg-pink-500 
                                   hover:text-white dark:hover:text-white 
                                   text-slate-800 dark:text-slate-200 
                                   text-xs font-semibold transition-all duration-200"
                    >
                        <i className="fas fa-chart-line mr-1.5 text-xs"></i> View forecast
                    </button>
                </div>

                <div className="mt-6 border-t border-slate-200/60 dark:border-slate-700/60 pt-5">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center">
                        <i className="fas fa-history mr-2 text-xs text-pink-500 dark:text-pink-400"></i> Recent activity
                    </div>

                    <ul className="mt-4 space-y-4 text-sm relative 
                                   before:absolute before:left-[3.5px] 
                                   before:top-2 before:bottom-2 before:w-px 
                                   before:bg-slate-200 dark:before:bg-slate-700">
                        {activities.map((activity) => (
                            <li key={activity.id} className="flex gap-3 relative items-start">
                                <div className={`w-2 h-2 mt-1.5 rounded-full ${activity.dotColor} 
                                                ring-4 ring-white dark:ring-[#2a2a2e] shrink-0`}></div>
                                <div>
                                    <div className="text-slate-900 dark:text-white font-medium">
                                        {activity.title}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {activity.time} · {activity.user}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}