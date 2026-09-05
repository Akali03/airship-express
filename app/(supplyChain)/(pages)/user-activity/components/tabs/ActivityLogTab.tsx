'use client';
import React from 'react';
import { Search, Filter, Trash2, Inbox } from 'lucide-react';
import { Pagination } from '@/app/(supplyChain)/components/global/pagination';
import { TableRowsSkeleton } from '@/app/(supplyChain)/components/ui/SkeletonLoader';
import { StatusBadge } from '@/app/(supplyChain)/components/ui/StatusBadge';
import { AppButton } from '@/app/(supplyChain)/components/ui/AppButton';
import { UserActivity } from '../../types';
import { formatDate } from '../../utils/formatters';
interface ActivityLogTabProps {
    activities: UserActivity[];
    isLoading: boolean;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    filter: string;
    onFilterChange: (filter: string) => void;
    uniqueActions: string[];
    selectedActivities: Set<number>;
    onToggleSelectActivity: (id: number) => void;
    onSelectAllActivities: () => void;
    onBulkDelete: () => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}
export const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ activities, isLoading, searchTerm, onSearchTermChange, filter, onFilterChange, uniqueActions, selectedActivities, onToggleSelectActivity, onSelectAllActivities, onBulkDelete, currentPage, totalPages, onPageChange, }) => {
    const allActivitiesSelected = activities.length > 0 && selectedActivities.size === activities.length;
    const someActivitiesSelected = selectedActivities.size > 0 && selectedActivities.size < activities.length;
    return (
        <div className="rounded-3xl bg-[#f0f3f8] dark:bg-[#191a24] border border-white/80 dark:border-[#2c2d3c] shadow-[8px_8px_24px_rgba(166,175,195,0.4),-8px_-8px_24px_rgba(255,255,255,0.95)] dark:shadow-[10px_10px_30px_rgba(0,0,0,0.75)] overflow-hidden">
            {/* Controls Header */}
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search activity by user, action, module, or IP..."
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/60 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-[inset_2px_2px_5px_rgba(166,175,195,0.35),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.65),inset_-1px_-1px_4px_rgba(255,255,255,0.05)]"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                        <select
                            value={filter}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="px-3.5 py-2.5 text-xs font-semibold bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/60 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 min-w-[150px] transition-all cursor-pointer text-slate-700 dark:text-slate-200 shadow-[inset_1.5px_1.5px_4px_rgba(166,175,195,0.3),inset_-1.5px_-1.5px_4px_rgba(255,255,255,0.85)] dark:shadow-[inset_1.5px_1.5px_4px_rgba(0,0,0,0.65)]"
                        >
                            <option value="all" className="dark:bg-[#1c1d25]">All Actions</option>
                            {uniqueActions.map((action) => (
                                <option key={action} value={action} className="dark:bg-[#1c1d25]">
                                    {action}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Banner */}
            {selectedActivities.size > 0 && (
                <div className="p-3 bg-pink-50/60 dark:bg-pink-950/30 border-b border-pink-100 dark:border-pink-900/40 flex items-center justify-between flex-wrap gap-2 transition-all animate-in fade-in duration-150">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        <strong className="text-pink-600 dark:text-pink-400">{selectedActivities.size}</strong> activity(ies) selected
                    </span>
                    <AppButton type="button" variant="danger" size="xs" onClick={onBulkDelete}>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Selected</span>
                    </AppButton>
                </div>
            )}

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase select-none">
                            <th className="py-3 px-4 w-10 text-center">
                                <input
                                    type="checkbox"
                                    checked={allActivitiesSelected}
                                    ref={(input) => {
                                        if (input) {
                                            input.indeterminate = someActivitiesSelected;
                                        }
                                    }}
                                    onChange={onSelectAllActivities}
                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500 bg-transparent"
                                />
                            </th>
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-4">Action</th>
                            <th className="py-3 px-4">Module</th>
                            <th className="py-3 px-4">Description</th>
                            <th className="py-3 px-4">IP Address</th>
                            <th className="py-3 px-4">Timestamp</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                        {isLoading ? (
                            <TableRowsSkeleton
                                rows={6}
                                columns={[
                                    { type: 'checkbox', width: 'w-10' },
                                    { type: 'avatar-text', subtext: false },
                                    { type: 'badge' },
                                    { type: 'badge' },
                                    { type: 'text', width: 'w-64' },
                                    { type: 'mono', width: 'w-28' },
                                    { type: 'date' },
                                ]}
                            />
                        ) : activities.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-16 text-center text-slate-400 dark:text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-16 h-16 rounded-3xl bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/60 dark:border-slate-800 shadow-[inset_2px_2px_5px_rgba(166,175,195,0.35),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.65),inset_-1px_-1px_4px_rgba(255,255,255,0.05)] flex items-center justify-center text-slate-400 dark:text-slate-500 mb-1">
                                            <i className="fa-solid fa-clock-rotate-left text-2xl text-pink-500 dark:text-pink-400"></i>
                                        </div>
                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No activity log found</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">There are currently no recorded activities matching your filters</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            activities.map((activity, idx) => {
                                const isSelected = selectedActivities.has(activity.id);
                                const key = activity.id ?? `activity-${idx}`;
                                const isSuccess = activity.action?.includes('LOGIN') || activity.action?.includes('VERIFIED');
                                const isDanger =
                                    activity.action?.includes('FAILED') ||
                                    activity.action?.includes('ERROR') ||
                                    activity.action?.includes('BLOCKED');
                                const actionTone = isSuccess ? 'emerald' : isDanger ? 'rose' : 'pink';
                                return (
                                    <tr
                                        key={key}
                                        className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                                            isSelected ? 'bg-pink-50/30 dark:bg-pink-950/20' : ''
                                        }`}
                                    >
                                        <td className="py-3 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onToggleSelectActivity(activity.id)}
                                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500 bg-transparent"
                                            />
                                        </td>

                                        <td className="py-3 px-4">
                                            <div>
                                                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                                    {activity.users?.display_name || 'Unknown'}
                                                </span>
                                                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                    {activity.users?.email || 'No email'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">
                                            <StatusBadge tone={actionTone} size="xs">
                                                {activity.action}
                                            </StatusBadge>
                                        </td>

                                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                                            {activity.module || 'General'}
                                        </td>

                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-[250px]">
                                            <span className="truncate block" title={activity.description}>
                                                {activity.description || 'No details'}
                                            </span>
                                        </td>

                                        <td className="py-3 px-4">
                                            <StatusBadge tone="neutral" size="xs">
                                                <span className="font-mono">{activity.ip_address || 'Unknown'}</span>
                                            </StatusBadge>
                                        </td>

                                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                            {formatDate(activity.created_at)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-4 border-t border-slate-200/60 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Showing {activities.length} activities
                </span>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
        </div>
    );
};
