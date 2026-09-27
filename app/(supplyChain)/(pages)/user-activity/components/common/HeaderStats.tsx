'use client';

import React from 'react';
import { BlockedDevice, Appeal, UserActivity } from '../../types';
import { StatusBadge } from '../../../../components/ui/StatusBadge';

interface HeaderStatsProps {
    blockedDevices: BlockedDevice[];
    appeals: Appeal[];
    activities: UserActivity[];
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
    blockedDevices,
    appeals,
    activities,
}) => {
    const blockedCount = blockedDevices.filter(d => d.status === 'blocked').length;
    const pendingAppealsCount = appeals.filter(a => a.status === 'pending').length;

    return (
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
            <div className="flex items-start gap-4 min-w-0">
                {/* Main Icon Box */}
                <div className="w-12 h-12 rounded-2xl bg-[#ffe6f0] border border-pink-300/90 dark:bg-[#341427] dark:border-[#67224c] flex items-center justify-center text-pink-600 dark:text-pink-300 text-xl shadow-[inset_0_1px_0_#ffffff,0_2px_6px_rgba(244,63,94,0.14)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_6px_rgba(0,0,0,0.6)] shrink-0 mt-0.5">
                    <i className="fa-solid fa-laptop-code" />
                </div>

                {/* Text Content & Stat Badges */}
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Device Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Monitor all sessions, manage blocked devices, view appeals, and user activity
                    </p>

                    {/* Quick Stats / Indicators */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        {/* Blocked Devices Badge */}
                        {blockedCount > 0 && (
                            <StatusBadge tone="rose" dot size="xs">
                                <strong>{blockedCount}</strong> blocked device(s)
                            </StatusBadge>
                        )}

                        {/* Pending Appeals Badge */}
                        {pendingAppealsCount > 0 && (
                            <StatusBadge tone="amber" dot size="xs">
                                <strong>{pendingAppealsCount}</strong> pending appeal(s)
                            </StatusBadge>
                        )}

                        {/* Total Activities Badge */}
                        <StatusBadge tone="pink" icon={<i className="fas fa-chart-line text-[10px]" />} size="xs">
                            <strong>{activities.length}</strong> total activities
                        </StatusBadge>

                        {/* Realtime Live Indicator Badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/40 shadow-xs select-none">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>Live Realtime</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
