'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    X,
    Search,
    Loader2,
    CheckCircle,
    Send,
    Filter,
    Trash2,
    Ban,
    Undo,
    Eye,
    Inbox
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/app/(supplyChain)/components/ui/ConfirmModal';
import { SessionGuard } from '../components/server/SessionGuard';
import { user } from '@/app/(supplyChain)/lib/services/Class/user';
import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { Pagination } from '../components/global/pagination';

// Utilities
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

export function isRateLimited(key: string): boolean {
    const now = Date.now();
    const record = rateLimiter.get(key);

    if (!record || now > record.resetTime) {
        rateLimiter.set(key, { count: 1, resetTime: now + 60000 });
        return false;
    }

    if (record.count >= 20) {
        return true;
    }

    record.count++;
    rateLimiter.set(key, record);
    return false;
}

export const sanitizeSearch = (value: string): string => {
    return value
        .replace(/<[^>]*>/g, '')
        .replace(/[<>]/g, '')
        .trim();
};

export const sanitizeText = (value: string): string => {
    return value
        .replace(/<[^>]*>/g, '')
        .replace(/[<>]/g, '')
        .trim()
        .slice(0, 200);
};

export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// Types
interface Session {
    id: string;
    user_id: string;
    session_token: string;
    expires_at: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    is_active: boolean;
    email: string;
    hr_employee_name: string;
    remember_me: boolean;
    expires_at_remember: string | null;
    users?: {
        display_name: string;
        email: string;
        role: string;
    };
    is_blocked?: boolean;
    blocked_device_id?: string;
}

interface BlockedDevice {
    id: string;
    user_id: string;
    device_name: string;
    user_agent: string;
    ip_address: string;
    blocked_at: string;
    blocked_by: string;
    reason: string;
    status: 'blocked' | 'unblocked';
    unblocked_at: string | null;
    created_at: string;
    blocked_count?: number;
}

interface Appeal {
    id: string;
    blocked_device_id: string;
    user_agent: string;
    user_email: string;
    user_name: string;
    user_role: string;
    appeal_message: string;
    response_message: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
    resolved_by: string | null;
}

interface UserActivity {
    id: number;
    user_id: string;
    action: string;
    module: string;
    description: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    users: {
        display_name: string;
        email: string;
    };
}

const ITEMS_PER_PAGE = 15;

export default function UserActivityPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { confirm } = useConfirm();

    const initialTab = searchParams.get('tab') as 'sessions' | 'blocked' | 'activity' | 'appeals' || 'sessions';

    const [activeTab, setActiveTab] = useState<'sessions' | 'blocked' | 'activity' | 'appeals'>(initialTab);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
    const [blockedDevices, setBlockedDevices] = useState<BlockedDevice[]>([]);
    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
    const [selectedBlockedDevices, setSelectedBlockedDevices] = useState<Set<string>>(new Set());
    const [selectedAppeals, setSelectedAppeals] = useState<Set<string>>(new Set());
    const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set());
    const [userRole, setUserRole] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<string>('');

    // Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [activitySearchTerm, setActivitySearchTerm] = useState('');
    const [activityFilter, setActivityFilter] = useState<string>('all');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const debouncedActivitySearchTerm = useDebounce(activitySearchTerm, 300);

    // Pagination states - separate for each tab
    const [sessionPage, setSessionPage] = useState(1);
    const [blockedPage, setBlockedPage] = useState(1);
    const [appealPage, setAppealPage] = useState(1);
    const [activityPage, setActivityPage] = useState(1);

    const [sessionTotalPages, setSessionTotalPages] = useState(1);
    const [blockedTotalPages, setBlockedTotalPages] = useState(1);
    const [appealTotalPages, setAppealTotalPages] = useState(1);
    const [activityTotalPages, setActivityTotalPages] = useState(1);

    // Appeal response modal
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
    const [responseMessage, setResponseMessage] = useState('');

    // Get unique action types for filter
    const uniqueActions = Array.from(new Set(activities.map(a => a.action)));

    const handleTabChange = (tab: 'sessions' | 'blocked' | 'activity' | 'appeals') => {
        setActiveTab(tab);
        // Reset to page 1 when switching tabs
        if (tab === 'sessions') setSessionPage(1);
        else if (tab === 'blocked') setBlockedPage(1);
        else if (tab === 'appeals') setAppealPage(1);
        else if (tab === 'activity') setActivityPage(1);

        // Clear selections when switching tabs
        setSelectedSessions(new Set());
        setSelectedBlockedDevices(new Set());
        setSelectedAppeals(new Set());
        setSelectedActivities(new Set());
        router.push(`?tab=${tab}`, { scroll: false });
    };

    useEffect(() => {
        const role = user.getRole();
        const userData = user.getUser();
        setUserRole(role);
        setCurrentUserId(userData?.email || '');
        fetchAllData();
    }, []);

    // Handle search for sessions
    useEffect(() => {
        if (activeTab === 'sessions') {
            handleSessionSearch(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm, sessions]);

    // Handle search and filter for activities
    useEffect(() => {
        if (activeTab === 'activity') {
            handleActivitySearchAndFilter(debouncedActivitySearchTerm, activityFilter);
        }
    }, [debouncedActivitySearchTerm, activityFilter, activities]);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchSessions(),
                fetchBlockedDevices(),
                fetchActivities(),
                fetchAppeals()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const { data: blockedData, error: blockedError } = await supabase
                .from('blocked_devices')
                .select('id, user_agent, ip_address, status')
                .eq('status', 'blocked');

            if (blockedError) throw blockedError;

            const blockedSet = new Set();
            (blockedData || []).forEach(d => {
                blockedSet.add(`${d.user_agent}_${d.ip_address || 'unknown'}`);
            });

            const { data: sessionsData, error: sessionsError } = await supabase
                .from('sessions')
                .select(`
                    *,
                    users!inner(
                        display_name,
                        email,
                        role
                    )
                `)
                .order('created_at', { ascending: false });

            if (sessionsError) throw sessionsError;

            const sessionsWithBlockStatus = (sessionsData || []).map(session => {
                const key = `${session.user_agent}_${session.ip_address || 'unknown'}`;
                const isBlocked = blockedSet.has(key);
                const blockedDevice = (blockedData || []).find(d =>
                    `${d.user_agent}_${d.ip_address || 'unknown'}` === key
                );
                return {
                    ...session,
                    is_blocked: isBlocked,
                    blocked_device_id: isBlocked ? blockedDevice?.id : undefined
                };
            });

            setSessions(sessionsWithBlockStatus);
            setFilteredSessions(sessionsWithBlockStatus);
            setSessionTotalPages(Math.max(1, Math.ceil(sessionsWithBlockStatus.length / ITEMS_PER_PAGE)));
        } catch (error) {
            console.error('Error fetching sessions:', error);
            toast.error('Failed to fetch sessions');
        }
    };

    const fetchBlockedDevices = async () => {
        try {
            const { data: devices, error: devicesError } = await supabase
                .from('blocked_devices')
                .select('*')
                .eq('status', 'blocked')
                .order('blocked_at', { ascending: false });

            if (devicesError) throw devicesError;

            const devicesWithCount = await Promise.all(
                (devices || []).map(async (device) => {
                    const { count, error: countError } = await supabase
                        .from('blocked_devices')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_agent', device.user_agent)
                        .eq('ip_address', device.ip_address || '');

                    return {
                        ...device,
                        blocked_count: count || 0,
                    };
                })
            );

            setBlockedDevices(devicesWithCount);
            setBlockedTotalPages(Math.max(1, Math.ceil(devicesWithCount.length / ITEMS_PER_PAGE)));
        } catch (error) {
            console.error('Error fetching blocked devices:', error);
            toast.error('Failed to fetch blocked devices');
        }
    };

    const fetchActivities = async () => {
        try {
            const { data, error } = await supabase
                .from('user_activity')
                .select('*, users!inner(display_name, email)')
                .order('created_at', { ascending: false })
                .limit(500);

            if (error) throw error;
            setActivities(data || []);
            setFilteredActivities(data || []);
            setActivityTotalPages(Math.max(1, Math.ceil((data || []).length / ITEMS_PER_PAGE)));
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast.error('Failed to fetch activities');
        }
    };

    const fetchAppeals = async () => {
        try {
            const { data, error } = await supabase
                .from('appeals')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAppeals(data || []);
            setAppealTotalPages(Math.max(1, Math.ceil((data || []).length / ITEMS_PER_PAGE)));
        } catch (error) {
            console.error('Error fetching appeals:', error);
            toast.error('Failed to fetch appeals');
        }
    };

    const getPaginatedData = <T,>(data: T[], page: number): T[] => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return data.slice(startIndex, endIndex);
    };

    const handleSessionSearch = useCallback((term: string) => {
        if (!term.trim()) {
            setFilteredSessions(sessions);
            setSessionTotalPages(Math.max(1, Math.ceil(sessions.length / ITEMS_PER_PAGE)));
            return;
        }

        const filtered = sessions.filter(session =>
            session.user_agent?.toLowerCase().includes(term.toLowerCase()) ||
            session.ip_address?.toLowerCase().includes(term.toLowerCase()) ||
            session.email?.toLowerCase().includes(term.toLowerCase()) ||
            session.hr_employee_name?.toLowerCase().includes(term.toLowerCase()) ||
            session.users?.display_name?.toLowerCase().includes(term.toLowerCase())
        );

        setFilteredSessions(filtered);
        setSessionTotalPages(Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)));
        setSessionPage(1);
    }, [sessions]);

    const handleActivitySearchAndFilter = useCallback((term: string, filter: string) => {
        let filtered = activities;

        // Apply search
        if (term.trim()) {
            filtered = filtered.filter(activity =>
                activity.action?.toLowerCase().includes(term.toLowerCase()) ||
                activity.module?.toLowerCase().includes(term.toLowerCase()) ||
                activity.description?.toLowerCase().includes(term.toLowerCase()) ||
                activity.ip_address?.toLowerCase().includes(term.toLowerCase()) ||
                activity.users?.display_name?.toLowerCase().includes(term.toLowerCase()) ||
                activity.users?.email?.toLowerCase().includes(term.toLowerCase())
            );
        }

        // Apply filter
        if (filter !== 'all') {
            filtered = filtered.filter(activity => activity.action === filter);
        }

        setFilteredActivities(filtered);
        setActivityTotalPages(Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)));
        setActivityPage(1);
    }, [activities]);

    const isTargetUserAdmin = async (userId: string): Promise<boolean> => {
        try {
            const { data } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single();
            return data?.role === 'Admin';
        } catch (error) {
            console.error('Error checking user role:', error);
            return false;
        }
    };

    const handleBlockDevice = async (sessionId: string, userAgent: string, ipAddress?: string, userName?: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session?.user_id) {
            const isAdmin = await isTargetUserAdmin(session.user_id);
            if (isAdmin) {
                toast.warning('Cannot block admin users');
                return;
            }
        }

        const confirmed = await confirm({
            title: 'Block Device',
            message: `Are you sure you want to block this device?\n\nDevice: ${userName || 'Unknown'}\nIP: ${ipAddress || 'Unknown'}`,
            confirmText: 'Block Device',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
        });

        if (!confirmed) return;

        try {
            const userId = session?.user_id || currentUserId || '00000000-0000-0000-0000-000000000000';

            const { data: existingBlocked } = await supabase
                .from('blocked_devices')
                .select('id, status')
                .eq('user_agent', userAgent)
                .eq('ip_address', ipAddress || '')
                .eq('status', 'blocked')
                .maybeSingle();

            if (existingBlocked) {
                toast.warning('This device is already blocked');
                await fetchSessions();
                return;
            }

            const { data: existingUnblocked } = await supabase
                .from('blocked_devices')
                .select('id')
                .eq('user_agent', userAgent)
                .eq('ip_address', ipAddress || '')
                .eq('status', 'unblocked')
                .maybeSingle();

            if (existingUnblocked) {
                await supabase
                    .from('blocked_devices')
                    .update({
                        status: 'blocked',
                        blocked_at: new Date().toISOString(),
                        blocked_by: userId,
                        reason: 'Blocked by admin',
                        updated_at: new Date().toISOString(),
                        unblocked_at: null,
                    })
                    .eq('id', existingUnblocked.id);
            } else {
                await supabase
                    .from('blocked_devices')
                    .insert({
                        user_id: userId,
                        device_name: userName || 'Unknown Device',
                        user_agent: userAgent,
                        ip_address: ipAddress || 'Unknown',
                        status: 'blocked',
                        reason: 'Blocked by admin',
                        blocked_at: new Date().toISOString(),
                        blocked_by: userId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });
            }

            toast.success('Device blocked successfully');
            await fetchAllData();
        } catch (error: any) {
            console.error('Error blocking device:', error);
            toast.error(`Failed to block device: ${error?.message || 'Unknown error'}`);
        }
    };

    const handleUnblockDevice = async (deviceId: string) => {
        const confirmed = await confirm({
            title: 'Unblock Device',
            message: 'Are you sure you want to unblock this device?',
            confirmText: 'Unblock',
            cancelText: 'Cancel',
            confirmVariant: 'success',
        });

        if (!confirmed) return;

        try {
            await supabase
                .from('blocked_devices')
                .update({
                    status: 'unblocked',
                    unblocked_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', deviceId);

            toast.success('Device unblocked successfully');
            await fetchAllData();
        } catch (error) {
            console.error('Error unblocking device:', error);
            toast.error('Failed to unblock device');
        }
    };

    const handleDeleteDevice = async (deviceId: string) => {
        const confirmed = await confirm({
            title: 'Delete Device Record',
            message: 'Are you sure you want to delete this device record?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
        });

        if (!confirmed) return;

        try {
            await supabase
                .from('blocked_devices')
                .delete()
                .eq('id', deviceId);

            toast.success('Device record deleted');
            await fetchAllData();
        } catch (error) {
            console.error('Error deleting device:', error);
            toast.error('Failed to delete device');
        }
    };

    const handleApproveAppeal = async (appealId: string) => {
        const confirmed = await confirm({
            title: 'Approve Appeal',
            message: 'Are you sure you want to approve this appeal? The device will be unblocked.',
            confirmText: 'Approve',
            cancelText: 'Cancel',
            confirmVariant: 'success',
        });

        if (!confirmed) return;

        try {
            const appeal = appeals.find(a => a.id === appealId);
            if (!appeal) return;

            await supabase
                .from('appeals')
                .update({
                    status: 'approved',
                    resolved_at: new Date().toISOString(),
                    resolved_by: user.getEmail() || 'Admin',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', appealId);

            await supabase
                .from('blocked_devices')
                .update({
                    status: 'unblocked',
                    unblocked_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', appeal.blocked_device_id);

            toast.success('Appeal approved and device unblocked');
            await fetchAllData();
        } catch (error) {
            console.error('Error approving appeal:', error);
            toast.error('Failed to approve appeal');
        }
    };

    const handleRejectAppeal = async (appealId: string) => {
        const confirmed = await confirm({
            title: 'Reject Appeal',
            message: 'Are you sure you want to reject this appeal? The device will remain blocked.',
            confirmText: 'Reject',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
        });

        if (!confirmed) return;

        try {
            await supabase
                .from('appeals')
                .update({
                    status: 'rejected',
                    resolved_at: new Date().toISOString(),
                    resolved_by: user.getEmail() || 'Admin',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', appealId);

            toast.success('Appeal rejected');
            await fetchAllData();
        } catch (error) {
            console.error('Error rejecting appeal:', error);
            toast.error('Failed to reject appeal');
        }
    };

    const handleDeleteAppeal = async (appealId: string) => {
        const confirmed = await confirm({
            title: 'Delete Appeal',
            message: 'Are you sure you want to delete this appeal? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
        });

        if (!confirmed) return;

        try {
            await supabase
                .from('appeals')
                .delete()
                .eq('id', appealId);

            toast.success('Appeal deleted successfully');
            await fetchAllData();
        } catch (error) {
            console.error('Error deleting appeal:', error);
            toast.error('Failed to delete appeal');
        }
    };

    const handleSendResponse = async () => {
        if (!selectedAppeal || !responseMessage.trim()) {
            toast.warning('Please enter a response message');
            return;
        }

        try {
            await supabase
                .from('appeals')
                .update({
                    response_message: sanitizeText(responseMessage.trim()),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', selectedAppeal.id);

            toast.success('Response sent successfully');
            setShowResponseModal(false);
            setResponseMessage('');
            setSelectedAppeal(null);
            await fetchAppeals();
        } catch (error) {
            console.error('Error sending response:', error);
            toast.error('Failed to send response');
        }
    };

    const handleBulkBlock = async () => {
        if (selectedSessions.size === 0) {
            toast.warning('Please select at least one device');
            return;
        }

        if (isRateLimited('bulk-block')) {
            toast.warning('Too many requests. Please wait a moment.');
            return;
        }

        let hasAdmin = false;
        for (const sessionId of selectedSessions) {
            const session = sessions.find(s => s.id === sessionId);
            if (session?.user_id) {
                const isAdmin = await isTargetUserAdmin(session.user_id);
                if (isAdmin) {
                    hasAdmin = true;
                    break;
                }
            }
        }

        if (hasAdmin) {
            toast.warning('Cannot block admin users');
            return;
        }

        const confirmed = await confirm({
            title: `Block ${selectedSessions.size} Devices`,
            message: `Are you sure you want to block ${selectedSessions.size} selected device(s)?`,
            confirmText: 'Block All',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
        });

        if (!confirmed) return;

        try {
            let blockedCount = 0;

            for (const sessionId of selectedSessions) {
                const session = sessions.find(s => s.id === sessionId);
                if (session) {
                    const { data: existingBlocked } = await supabase
                        .from('blocked_devices')
                        .select('id, status')
                        .eq('user_agent', session.user_agent)
                        .eq('ip_address', session.ip_address || '')
                        .eq('status', 'blocked')
                        .maybeSingle();

                    if (existingBlocked) continue;

                    await supabase
                        .from('blocked_devices')
                        .insert({
                            user_id: session.user_id || currentUserId || '00000000-0000-0000-0000-000000000000',
                            device_name: session.users?.display_name || 'Unknown Device',
                            user_agent: session.user_agent,
                            ip_address: session.ip_address || 'Unknown',
                            status: 'blocked',
                            reason: 'Blocked by admin (bulk action)',
                            blocked_at: new Date().toISOString(),
                            blocked_by: currentUserId || '00000000-0000-0000-0000-000000000000',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        });

                    blockedCount++;
                }
            }

            if (blockedCount > 0) {
                toast.success(`Blocked ${blockedCount} device(s)`);
            }

            setSelectedSessions(new Set());
            await fetchAllData();
        } catch (error: any) {
            console.error('Error bulk blocking devices:', error);
            toast.error(`Failed to block devices: ${error?.message || 'Unknown error'}`);
        }
    };

    const handleBulkUnblock = async () => {
        if (selectedBlockedDevices.size === 0) {
            toast.warning('Please select at least one device');
            return;
        }

        if (isRateLimited('bulk-unblock')) {
            toast.warning('Too many requests. Please wait a moment.');
            return;
        }

        const confirmed = await confirm({
            title: `Unblock ${selectedBlockedDevices.size} Devices`,
            message: `Are you sure you want to unblock ${selectedBlockedDevices.size} selected device(s)?`,
            confirmText: 'Unblock All',
            cancelText: 'Cancel',
            confirmVariant: 'success',
        });

        if (!confirmed) return;

        try {
            await supabase
                .from('blocked_devices')
                .update({
                    status: 'unblocked',
                    unblocked_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .in('id', Array.from(selectedBlockedDevices));

            toast.success(`Unblocked ${selectedBlockedDevices.size} device(s)`);
            setSelectedBlockedDevices(new Set());
            await fetchAllData();
        } catch (error) {
            console.error('Error bulk unblocking devices:', error);
            toast.error('Failed to unblock devices');
        }
    };

    const handleBulkDeleteBlocked = async () => {
        if (selectedBlockedDevices.size === 0) {
            toast.warning('Please select at least one device');
            return;
        }

        const confirmed = await confirm({
            title: `Delete ${selectedBlockedDevices.size} Device Records`,
            message: `Are you sure you want to delete ${selectedBlockedDevices.size} selected device record(s)? This action cannot be undone.`,
            confirmText: 'Delete All',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
        });

        if (!confirmed) return;

        try {
            await supabase
                .from('blocked_devices')
                .delete()
                .in('id', Array.from(selectedBlockedDevices));

            toast.success(`Deleted ${selectedBlockedDevices.size} device record(s)`);
            setSelectedBlockedDevices(new Set());
            await fetchAllData();
        } catch (error) {
            console.error('Error bulk deleting devices:', error);
            toast.error('Failed to delete devices');
        }
    };

    const handleBulkDeleteSessions = async () => {
        if (selectedSessions.size === 0) {
            toast.warning('Please select at least one session');
            return;
        }

        const confirmed = await confirm({
            title: `Delete ${selectedSessions.size} Sessions`,
            message: `Are you sure you want to delete ${selectedSessions.size} selected session(s)? This action cannot be undone.`,
            confirmText: 'Delete All',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
        });

        if (!confirmed) return;

        try {
            await supabase
                .from('sessions')
                .delete()
                .in('id', Array.from(selectedSessions));

            toast.success(`Deleted ${selectedSessions.size} session(s)`);
            setSelectedSessions(new Set());
            await fetchAllData();
        } catch (error) {
            console.error('Error bulk deleting sessions:', error);
            toast.error('Failed to delete sessions');
        }
    };

    const handleBulkDeleteActivities = async () => {
        if (selectedActivities.size === 0) {
            toast.warning('Please select at least one activity');
            return;
        }

        const confirmed = await confirm({
            title: `Delete ${selectedActivities.size} Activities`,
            message: `Are you sure you want to delete ${selectedActivities.size} selected activity record(s)? This action cannot be undone.`,
            confirmText: 'Delete All',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
        });

        if (!confirmed) return;

        try {
            await supabase
                .from('user_activity')
                .delete()
                .in('id', Array.from(selectedActivities));

            toast.success(`Deleted ${selectedActivities.size} activity record(s)`);
            setSelectedActivities(new Set());
            await fetchAllData();
        } catch (error) {
            console.error('Error bulk deleting activities:', error);
            toast.error('Failed to delete activities');
        }
    };

    const handleBulkDeleteAppeals = async () => {
        if (selectedAppeals.size === 0) {
            toast.warning('Please select at least one appeal');
            return;
        }

        const confirmed = await confirm({
            title: `Delete ${selectedAppeals.size} Appeals`,
            message: `Are you sure you want to delete ${selectedAppeals.size} selected appeal(s)? This action cannot be undone.`,
            confirmText: 'Delete All',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
        });

        if (!confirmed) return;

        try {
            await supabase
                .from('appeals')
                .delete()
                .in('id', Array.from(selectedAppeals));

            toast.success(`Deleted ${selectedAppeals.size} appeal(s)`);
            setSelectedAppeals(new Set());
            await fetchAllData();
        } catch (error) {
            console.error('Error bulk deleting appeals:', error);
            toast.error('Failed to delete appeals');
        }
    };

    const handleSelectAllSessions = () => {
        const selectableSessions = filteredSessions.filter(s => !s.is_blocked && s.users?.role !== 'Admin');
        if (selectedSessions.size === selectableSessions.length) {
            setSelectedSessions(new Set());
        } else {
            setSelectedSessions(new Set(selectableSessions.map(s => s.id)));
        }
    };

    const handleSelectAllBlocked = () => {
        const paginated = getPaginatedData(blockedDevices, blockedPage);
        if (selectedBlockedDevices.size === paginated.length) {
            setSelectedBlockedDevices(new Set());
        } else {
            setSelectedBlockedDevices(new Set(paginated.map(d => d.id)));
        }
    };

    const handleSelectAllAppeals = () => {
        const paginated = getPaginatedData(appeals, appealPage);
        if (selectedAppeals.size === paginated.length) {
            setSelectedAppeals(new Set());
        } else {
            setSelectedAppeals(new Set(paginated.map(a => a.id)));
        }
    };

    const handleSelectAllActivities = () => {
        const paginated = getPaginatedData(filteredActivities, activityPage);
        if (selectedActivities.size === paginated.length) {
            setSelectedActivities(new Set());
        } else {
            setSelectedActivities(new Set(paginated.map(a => a.id)));
        }
    };

    const formatDate = (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const paginatedSessions = getPaginatedData(filteredSessions, sessionPage);
    const paginatedBlockedDevices = getPaginatedData(blockedDevices, blockedPage);
    const paginatedAppeals = getPaginatedData(appeals, appealPage);
    const paginatedActivities = getPaginatedData(filteredActivities, activityPage);

    const allSessionsSelected = paginatedSessions.filter(s => !s.is_blocked && s.users?.role !== 'Admin').length > 0 &&
        selectedSessions.size === paginatedSessions.filter(s => !s.is_blocked && s.users?.role !== 'Admin').length;
    const someSessionsSelected = selectedSessions.size > 0 && selectedSessions.size < paginatedSessions.filter(s => !s.is_blocked && s.users?.role !== 'Admin').length;
    const allBlockedSelected = paginatedBlockedDevices.length > 0 && selectedBlockedDevices.size === paginatedBlockedDevices.length;
    const someBlockedSelected = selectedBlockedDevices.size > 0 && selectedBlockedDevices.size < paginatedBlockedDevices.length;
    const allAppealsSelected = paginatedAppeals.length > 0 && selectedAppeals.size === paginatedAppeals.length;
    const someAppealsSelected = selectedAppeals.size > 0 && selectedAppeals.size < paginatedAppeals.length;
    const allActivitiesSelected = paginatedActivities.length > 0 && selectedActivities.size === paginatedActivities.length;
    const someActivitiesSelected = selectedActivities.size > 0 && selectedActivities.size < paginatedActivities.length;

    if (userRole !== 'Admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
                    <p className="text-gray-600 mt-2">You need administrator privileges to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <SessionGuard requiredRole={['Admin']}>
            <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300 bgCard">

                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
                    <div className="flex items-start gap-4 min-w-0">
                        {/* Main Icon Box */}
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 flex items-center justify-center text-lg sm:text-xl shadow-sm shrink-0 mt-0.5 ring-4 ring-pink-500/5">
                            <i className="fas fa-shield-halved"></i>
                        </div>

                        {/* Text Content & Stat Badges */}
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Device Management
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                                Monitor all sessions, manage blocked devices, view appeals, and user activity
                            </p>

                            {/* Quick Stats / Indicators */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {/* Blocked Devices Badge */}
                                {blockedDevices.filter(d => d.status === 'blocked').length > 0 && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200/80 text-[11px] sm:text-xs text-red-700 font-medium shadow-2xs">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                        <span>
                                            <strong className="font-semibold">{blockedDevices.filter(d => d.status === 'blocked').length}</strong> blocked device(s)
                                        </span>
                                    </div>
                                )}

                                {/* Pending Appeals Badge */}
                                {appeals.filter(a => a.status === 'pending').length > 0 && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] sm:text-xs text-amber-700 font-medium shadow-2xs">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        <span>
                                            <strong className="font-semibold">{appeals.filter(a => a.status === 'pending').length}</strong> pending appeal(s)
                                        </span>
                                    </div>
                                )}

                                {/* Total Activities Badge */}
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 border border-pink-200/80 text-[11px] sm:text-xs text-pink-700 font-medium shadow-2xs">
                                    <i className="fas fa-chart-line text-[10px] text-pink-500"></i>
                                    <span>
                                        <strong className="font-semibold">{activities.length}</strong> total activities
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner max-w-full overflow-x-auto no-scrollbar">
                    {[
                        { id: 'sessions', label: 'Sessions', icon: 'fa-laptop', count: sessions.length },
                        { id: 'blocked', label: 'Blocked', icon: 'fa-ban', count: blockedDevices.length },
                        { id: 'appeals', label: 'Appeals', icon: 'fa-message', count: appeals.length },
                        { id: 'activity', label: 'Activity Log', icon: 'fa-clock-rotate-left', count: activities.length },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as 'sessions' | 'blocked' | 'activity' | 'appeals')}
                                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 ${isActive
                                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-900/5'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                                    }`}
                            >
                                <i className={`fas ${tab.icon} text-xs transition-colors ${isActive ? 'text-pink-500' : 'text-slate-400'
                                    }`}></i>
                                <span>{tab.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${isActive
                                    ? 'bg-pink-500 text-white shadow-2xs'
                                    : 'bg-slate-200/80 text-slate-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {activeTab === 'sessions' && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        {/* Search Header */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search sessions by user, IP, or user agent..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white"
                                />
                            </div>
                        </div>

                        {/* Bulk Actions Banner */}
                        {selectedSessions.size > 0 && (
                            <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                                <span className="text-xs text-slate-600">
                                    {selectedSessions.size} session(s) selected
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={handleBulkBlock}
                                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/80 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        <Ban className="w-3 h-3" />
                                        Block Selected
                                    </button>
                                    <button
                                        onClick={handleBulkDeleteSessions}
                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete Selected
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Table Content */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/60 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-400 uppercase select-none">
                                        <th className="py-3 px-4 w-10 text-center">
                                            <input
                                                type="checkbox"
                                                checked={allSessionsSelected}
                                                ref={(input) => {
                                                    if (input) {
                                                        input.indeterminate = someSessionsSelected;
                                                    }
                                                }}
                                                onChange={handleSelectAllSessions}
                                                className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                            />
                                        </th>
                                        <th className="py-3 px-4">User</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Device / User Agent</th>
                                        <th className="py-3 px-4">IP Address</th>
                                        <th className="py-3 px-4">Created At</th>
                                        <th className="py-3 px-4">Expires At</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={9} className="py-8 text-center text-slate-500">
                                                <Loader2 className="animate-spin h-5 w-5 inline mr-2" />
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : paginatedSessions.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-8 text-center text-slate-500">
                                                <i className="fas fa-check-circle text-emerald-500 text-lg mr-2" />
                                                No sessions found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedSessions.map((session) => {
                                            const isSelected = selectedSessions.has(session.id);
                                            const isAdmin = session.users?.role === 'Admin';
                                            const isBlocked = Boolean(session.is_blocked);
                                            const isDisabled = isAdmin || isBlocked;
                                            const userName = session.users?.display_name || session.hr_employee_name || 'Unknown';

                                            const toggleSelection = () => {
                                                if (isDisabled) return;
                                                const newSelected = new Set(selectedSessions);
                                                if (newSelected.has(session.id)) {
                                                    newSelected.delete(session.id);
                                                } else {
                                                    newSelected.add(session.id);
                                                }
                                                setSelectedSessions(newSelected);
                                            };

                                            return (
                                                <tr
                                                    key={session.id}
                                                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-pink-50/30' : ''
                                                        } ${isBlocked ? 'opacity-60 bg-red-50/20' : ''}`}
                                                >
                                                    <td className="py-3 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            disabled={isDisabled}
                                                            onChange={toggleSelection}
                                                            className={`w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 accent-pink-500 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                                }`}
                                                        />
                                                    </td>

                                                    <td className="py-3 px-4">
                                                        <span className="font-semibold text-slate-800">{userName}</span>
                                                        {isAdmin && (
                                                            <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                                                                Admin
                                                            </span>
                                                        )}
                                                        {isBlocked && (
                                                            <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                                                Blocked
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-3 px-4 text-slate-600">
                                                        {session.email || session.users?.email || 'N/A'}
                                                    </td>

                                                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={session.user_agent}>
                                                        {session.user_agent || 'Unknown'}
                                                    </td>

                                                    <td className="py-3 px-4">
                                                        <code className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 text-slate-700">
                                                            {session.ip_address || 'Unknown'}
                                                        </code>
                                                    </td>

                                                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                                        {formatDate(session.created_at)}
                                                    </td>

                                                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                                        {formatDate(session.expires_at)}
                                                    </td>

                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${session.is_active && !isBlocked
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                                                : isBlocked
                                                                    ? 'bg-red-50 text-red-700 border-red-200/60'
                                                                    : 'bg-gray-50 text-gray-500 border-gray-200/60'
                                                                }`}
                                                        >
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full ${session.is_active && !isBlocked
                                                                    ? 'bg-emerald-500'
                                                                    : isBlocked
                                                                        ? 'bg-red-500'
                                                                        : 'bg-gray-400'
                                                                    }`}
                                                            />
                                                            {isBlocked ? 'Blocked' : session.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>

                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {isBlocked ? (
                                                                <span className="text-xs text-slate-400 italic">Blocked</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        handleBlockDevice(
                                                                            session.id,
                                                                            session.user_agent,
                                                                            session.ip_address,
                                                                            userName
                                                                        )
                                                                    }
                                                                    disabled={isAdmin}
                                                                    className={`px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80 rounded-lg hover:bg-red-100 transition-all flex items-center gap-1.5 ${isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                                        }`}
                                                                    title={isAdmin ? 'Cannot block admin users' : 'Block this device'}
                                                                >
                                                                    <Ban className="w-3 h-3" />
                                                                    Block
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Showing {paginatedSessions.length} of {filteredSessions.length} sessions
                            </span>
                            <Pagination
                                currentPage={sessionPage}
                                totalPages={sessionTotalPages}
                                onPageChange={setSessionPage}
                            />
                        </div>
                    </div>
                )}

                {/* Blocked Devices tab */}
                {activeTab === 'blocked' && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        {selectedBlockedDevices.size > 0 && (
                            <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                                <span className="text-xs text-slate-600">
                                    {selectedBlockedDevices.size} device(s) selected
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={handleBulkUnblock}
                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
                                    >
                                        <Undo className="w-3 h-3" />
                                        Unblock Selected
                                    </button>
                                    <button
                                        onClick={handleBulkDeleteBlocked}
                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete Selected
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/60 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-400 uppercase select-none">
                                        <th className="py-3 px-4 w-10 text-center">
                                            <input
                                                type="checkbox"
                                                checked={allBlockedSelected}
                                                ref={(input) => {
                                                    if (input) {
                                                        input.indeterminate = someBlockedSelected;
                                                    }
                                                }}
                                                onChange={handleSelectAllBlocked}
                                                className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                            />
                                        </th>
                                        <th className="py-3 px-4">Device Name</th>
                                        <th className="py-3 px-4">User Agent</th>
                                        <th className="py-3 px-4">IP Address</th>
                                        <th className="py-3 px-4">Blocked Count</th>
                                        <th className="py-3 px-4">Blocked At</th>
                                        <th className="py-3 px-4">Reason</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={9} className="py-8 text-center text-slate-500">
                                                <Loader2 className="animate-spin h-5 w-5 inline mr-2" />
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : paginatedBlockedDevices.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-8 text-center text-slate-500">
                                                <i className="fas fa-check-circle text-emerald-500 text-lg mr-2"></i>
                                                No blocked devices found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedBlockedDevices.map((device) => {
                                            const isSelected = selectedBlockedDevices.has(device.id);
                                            return (
                                                <tr key={device.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-pink-50/30' : ''}`}>
                                                    <td className="py-3 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {
                                                                const newSelected = new Set(selectedBlockedDevices);
                                                                if (newSelected.has(device.id)) {
                                                                    newSelected.delete(device.id);
                                                                } else {
                                                                    newSelected.add(device.id);
                                                                }
                                                                setSelectedBlockedDevices(newSelected);
                                                            }}
                                                            className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-4 font-medium text-slate-800">
                                                        {device.device_name || 'Unknown Device'}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={device.user_agent}>
                                                        {device.user_agent}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <code className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 text-slate-700">
                                                            {device.ip_address || 'Unknown'}
                                                        </code>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="font-bold text-slate-700">{device.blocked_count || 0}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                                        {formatDate(device.blocked_at)}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600 max-w-[150px] truncate">
                                                        {device.reason || 'No reason provided'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${device.status === 'blocked'
                                                            ? 'bg-red-50 text-red-700 border-red-200/60'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'blocked' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                                            {device.status === 'blocked' ? 'Blocked' : 'Unblocked'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {device.status === 'blocked' && (
                                                                <button
                                                                    onClick={() => handleUnblockDevice(device.id)}
                                                                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg hover:bg-emerald-100 transition-all flex items-center gap-1.5"
                                                                >
                                                                    <Undo className="w-3 h-3" />
                                                                    Unblock
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteDevice(device.id)}
                                                                className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 rounded-lg hover:bg-rose-100 transition-all flex items-center gap-1.5"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Showing {paginatedBlockedDevices.length} of {blockedDevices.length} blocked devices
                            </span>
                            <Pagination
                                currentPage={blockedPage}
                                totalPages={blockedTotalPages}
                                onPageChange={setBlockedPage}
                            />
                        </div>
                    </div>
                )}

                {/* Appeals Tab with Modern SaaS UI */}
                {activeTab === 'appeals' && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden transition-all duration-300">

                        {/* Contextual Bulk Action Bar */}
                        {selectedAppeals.size > 0 && (
                            <div className="p-3.5 bg-slate-900/95 backdrop-blur-md text-white flex items-center justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-top-2 duration-200 border-b border-slate-800">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold border border-pink-500/30 shadow-2xs">
                                        {selectedAppeals.size}
                                    </span>
                                    <span className="text-xs font-medium text-slate-200 tracking-wide">
                                        appeal{selectedAppeals.size > 1 ? 's' : ''} selected
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Approve/Reject visible only when all selected items are pending */}
                                    {Array.from(selectedAppeals).every(id =>
                                        appeals.find(a => a.id === id)?.status === 'pending'
                                    ) && (
                                            <div className="flex items-center gap-2 pr-2.5 border-r border-slate-700/80">
                                                <button
                                                    onClick={() => selectedAppeals.forEach(id => handleApproveAppeal(id))}
                                                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Approve Selected
                                                </button>
                                                <button
                                                    onClick={() => selectedAppeals.forEach(id => handleRejectAppeal(id))}
                                                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    Reject Selected
                                                </button>
                                            </div>
                                        )}

                                    <button
                                        onClick={handleBulkDeleteAppeals}
                                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete Selected
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Table Wrapper */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-400 uppercase select-none">
                                        <th className="py-4 px-4 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                checked={allAppealsSelected}
                                                ref={(input) => {
                                                    if (input) {
                                                        input.indeterminate = someAppealsSelected;
                                                    }
                                                }}
                                                onChange={handleSelectAllAppeals}
                                                className="w-4 h-4 rounded-md border-slate-300 text-pink-500 focus:ring-pink-500/20 focus:ring-offset-0 cursor-pointer accent-pink-500 transition-all"
                                            />
                                        </th>
                                        <th className="py-4 px-4">User</th>
                                        <th className="py-4 px-4">Email</th>
                                        <th className="py-4 px-4">Appeal Message</th>
                                        <th className="py-4 px-4">Response</th>
                                        <th className="py-4 px-4">Status</th>
                                        <th className="py-4 px-4">Submitted</th>
                                        <th className="py-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={8} className="py-16 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="p-3 bg-pink-50 rounded-full border border-pink-100">
                                                        <Loader2 className="animate-spin h-6 w-6 text-pink-500" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-600 tracking-wide">Loading appeals data...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedAppeals.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-16 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-1 shadow-2xs">
                                                        <i className="fas fa-inbox text-xl" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700">No appeals found</p>
                                                    <p className="text-xs text-slate-400">There are no appeals matching your current view filter.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedAppeals.map((appeal) => {
                                            const isSelected = selectedAppeals.has(appeal.id);
                                            const isPending = appeal.status === 'pending';
                                            const isResolved = appeal.status === 'approved' || appeal.status === 'rejected';

                                            return (
                                                <tr
                                                    key={appeal.id}
                                                    className={`group transition-all duration-150 ${isSelected
                                                        ? 'bg-pink-50/50 hover:bg-pink-50/70'
                                                        : 'hover:bg-slate-50/80'
                                                        }`}
                                                >
                                                    {/* Checkbox */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {
                                                                const newSelected = new Set(selectedAppeals);
                                                                if (newSelected.has(appeal.id)) {
                                                                    newSelected.delete(appeal.id);
                                                                } else {
                                                                    newSelected.add(appeal.id);
                                                                }
                                                                setSelectedAppeals(newSelected);
                                                            }}
                                                            className="w-4 h-4 rounded-md border-slate-300 text-pink-500 focus:ring-pink-500/20 focus:ring-offset-0 cursor-pointer accent-pink-500 transition-all"
                                                        />
                                                    </td>

                                                    {/* User Name with Initial Avatar Badge */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200/60 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0 uppercase">
                                                                {appeal.user_name ? appeal.user_name.charAt(0) : 'U'}
                                                            </div>
                                                            <div className="font-semibold text-slate-800 group-hover:text-pink-600 transition-colors">
                                                                {appeal.user_name}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* User Email */}
                                                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                                                        {appeal.user_email}
                                                    </td>

                                                    {/* Appeal Message */}
                                                    <td className="py-3.5 px-4 text-slate-600 max-w-[220px]">
                                                        <span
                                                            className="truncate block text-slate-700 bg-slate-100/60 group-hover:bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors shadow-2xs"
                                                            title={appeal.appeal_message}
                                                        >
                                                            {appeal.appeal_message}
                                                        </span>
                                                    </td>

                                                    {/* Response Message */}
                                                    <td className="py-3.5 px-4 text-slate-600 max-w-[180px]">
                                                        {appeal.response_message ? (
                                                            <span
                                                                className="truncate block text-emerald-700 bg-emerald-50/70 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-medium shadow-2xs"
                                                                title={appeal.response_message}
                                                            >
                                                                {appeal.response_message}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 italic text-[11px] px-1">
                                                                No response yet
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${isPending
                                                                ? 'bg-amber-50/80 text-amber-700 border-amber-200/80 shadow-2xs'
                                                                : appeal.status === 'approved'
                                                                    ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80 shadow-2xs'
                                                                    : 'bg-rose-50/80 text-rose-700 border-rose-200/80 shadow-2xs'
                                                                }`}
                                                        >
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full ${isPending
                                                                    ? 'bg-amber-500 animate-pulse'
                                                                    : appeal.status === 'approved'
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-rose-500'
                                                                    }`}
                                                            />
                                                            {appeal.status.charAt(0).toUpperCase() + appeal.status.slice(1)}
                                                        </span>
                                                    </td>

                                                    {/* Created At */}
                                                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                                        {formatDate(appeal.created_at)}
                                                    </td>

                                                    {/* Row Actions */}
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {isPending && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApproveAppeal(appeal.id)}
                                                                        title="Approve Appeal"
                                                                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-2xs cursor-pointer"
                                                                    >
                                                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectAppeal(appeal.id)}
                                                                        title="Reject Appeal"
                                                                        className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-2xs cursor-pointer"
                                                                    >
                                                                        <X className="w-3 h-3 text-rose-600" />
                                                                        Reject
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedAppeal(appeal);
                                                                            setResponseMessage(appeal.response_message || '');
                                                                            setShowResponseModal(true);
                                                                        }}
                                                                        title="Send Custom Response"
                                                                        className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-2xs cursor-pointer"
                                                                    >
                                                                        <Send className="w-3 h-3 text-blue-600" />
                                                                        Respond
                                                                    </button>
                                                                </>
                                                            )}

                                                            {isResolved && (
                                                                <>
                                                                    {appeal.response_message && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedAppeal(appeal);
                                                                                setResponseMessage(appeal.response_message || '');
                                                                                setShowResponseModal(true);
                                                                            }}
                                                                            title="View Response Details"
                                                                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-2xs cursor-pointer"
                                                                        >
                                                                            <Eye className="w-3 h-3 text-slate-500" />
                                                                            View
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleDeleteAppeal(appeal.id)}
                                                                        title="Delete Record"
                                                                        className="px-2.5 py-1 text-xs font-semibold bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-2xs cursor-pointer"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer & Pagination */}
                        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
                            <span className="text-xs text-slate-500 font-medium">
                                Showing <span className="font-semibold text-slate-700">{paginatedAppeals.length}</span> of{' '}
                                <span className="font-semibold text-slate-700">{appeals.length}</span> appeals
                            </span>
                            <Pagination
                                currentPage={appealPage}
                                totalPages={appealTotalPages}
                                onPageChange={setAppealPage}
                            />
                        </div>
                    </div>
                )}

                {/* Activity Log tab with search, filter and pagination */}
                {activeTab === 'activity' && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">

                        {/* Controls Header */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search activity by user, action, module, or IP..."
                                        value={activitySearchTerm}
                                        onChange={(e) => setActivitySearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white transition-all placeholder:text-slate-400"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                                    <select
                                        value={activityFilter}
                                        onChange={(e) => setActivityFilter(e.target.value)}
                                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white min-w-[150px] transition-all cursor-pointer text-slate-700"
                                    >
                                        <option value="all">All Actions</option>
                                        {uniqueActions.map((action) => (
                                            <option key={action} value={action}>
                                                {action}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Bulk Actions Banner */}
                        {selectedActivities.size > 0 && (
                            <div className="p-3 bg-pink-50/60 border-b border-pink-100 flex items-center justify-between flex-wrap gap-2 transition-all animate-in fade-in duration-150">
                                <span className="text-xs font-medium text-slate-700">
                                    <strong className="text-pink-600">{selectedActivities.size}</strong> activity(ies) selected
                                </span>
                                <button
                                    type="button"
                                    onClick={handleBulkDeleteActivities}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200/80 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Selected</span>
                                </button>
                            </div>
                        )}

                        {/* Table Container */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/60 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-400 uppercase select-none">
                                        <th className="py-3 px-4 w-10 text-center">
                                            <input
                                                type="checkbox"
                                                checked={allActivitiesSelected}
                                                ref={(input) => {
                                                    if (input) {
                                                        input.indeterminate = someActivitiesSelected;
                                                    }
                                                }}
                                                onChange={handleSelectAllActivities}
                                                className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
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

                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-slate-500">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="animate-spin h-5 w-5 text-pink-500" />
                                                    <span className="font-medium">Loading activities...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedActivities.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Inbox className="w-8 h-8 text-slate-300" />
                                                    <span className="font-medium">No activity log found</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedActivities.map((activity, idx) => {
                                            const isSelected = selectedActivities.has(activity.id);
                                            const key = activity.id ?? `activity-${idx}`;

                                            // Action color variant setup
                                            const isSuccess =
                                                activity.action?.includes('LOGIN') || activity.action?.includes('VERIFIED');
                                            const isDanger =
                                                activity.action?.includes('FAILED') ||
                                                activity.action?.includes('ERROR') ||
                                                activity.action?.includes('BLOCKED');

                                            const actionBadgeStyle = isSuccess
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                                : isDanger
                                                    ? 'bg-red-50 text-red-700 border-red-200/60'
                                                    : 'bg-pink-50 text-pink-700 border-pink-200/60';

                                            return (
                                                <tr
                                                    key={key}
                                                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-pink-50/30' : ''
                                                        }`}
                                                >
                                                    <td className="py-3 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {
                                                                setSelectedActivities((prev) => {
                                                                    const next = new Set(prev);
                                                                    if (next.has(activity.id)) {
                                                                        next.delete(activity.id);
                                                                    } else {
                                                                        next.add(activity.id);
                                                                    }
                                                                    return next;
                                                                });
                                                            }}
                                                            className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500/20 cursor-pointer accent-pink-500"
                                                        />
                                                    </td>

                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <span className="font-semibold text-slate-800 block">
                                                                {activity.users?.display_name || 'Unknown'}
                                                            </span>
                                                            <span className="text-[11px] text-slate-400">
                                                                {activity.users?.email || 'No email'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${actionBadgeStyle}`}
                                                        >
                                                            {activity.action}
                                                        </span>
                                                    </td>

                                                    <td className="py-3 px-4 text-slate-600 font-medium">
                                                        {activity.module || 'General'}
                                                    </td>

                                                    <td className="py-3 px-4 text-slate-600 max-w-[250px]">
                                                        <span className="truncate block" title={activity.description}>
                                                            {activity.description || 'No details'}
                                                        </span>
                                                    </td>

                                                    <td className="py-3 px-4">
                                                        <code className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 text-slate-700">
                                                            {activity.ip_address || 'Unknown'}
                                                        </code>
                                                    </td>

                                                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
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
                        <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <span className="text-xs text-slate-500">
                                Showing {paginatedActivities.length} of {filteredActivities.length} activities
                            </span>
                            <Pagination
                                currentPage={activityPage}
                                totalPages={activityTotalPages}
                                onPageChange={setActivityPage}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Response Modal */}
            <AnimatePresence>
                {showResponseModal && selectedAppeal && (
                    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                        >
                            {/* Fixed Header */}
                            <div className="shrink-0 flex items-center justify-between border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50/80 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 ring-1 ring-blue-200/60 shadow-xs">
                                        <Send className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                            {selectedAppeal.response_message ? 'View Response' : 'Send Response'}
                                        </h3>
                                        <p className="text-xs font-medium text-gray-500 mt-0.5">
                                            {selectedAppeal.user_name} <span className="text-gray-400">({selectedAppeal.user_email})</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowResponseModal(false);
                                        setSelectedAppeal(null);
                                        setResponseMessage('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                {/* Original Appeal Message */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Appeal Message
                                    </label>
                                    <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                        {selectedAppeal.appeal_message || 'No appeal message provided.'}
                                    </div>
                                </div>

                                {/* Response Textarea / Content */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {selectedAppeal.response_message ? 'Recorded Response' : 'Your Response'}
                                        </label>
                                        {!selectedAppeal.response_message && (
                                            <span className="text-xs text-gray-400 font-medium">
                                                {responseMessage.length}/500
                                            </span>
                                        )}
                                    </div>

                                    <textarea
                                        value={responseMessage}
                                        onChange={(e) => setResponseMessage(e.target.value)}
                                        placeholder="Type your response to the appeal..."
                                        className={`w-full p-3.5 border rounded-xl text-sm leading-relaxed transition-all outline-none resize-none h-32 ${selectedAppeal.response_message
                                            ? 'bg-gray-50/80 text-gray-700 border-gray-200'
                                            : 'bg-white text-gray-900 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20'
                                            }`}
                                        readOnly={!!selectedAppeal.response_message}
                                        maxLength={500}
                                    />
                                </div>
                            </div>

                            {/* Fixed Footer Actions */}
                            <div className="shrink-0 border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowResponseModal(false);
                                        setSelectedAppeal(null);
                                        setResponseMessage('');
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-xl transition-colors"
                                >
                                    Close
                                </button>

                                {!selectedAppeal.response_message && (
                                    <button
                                        type="button"
                                        onClick={handleSendResponse}
                                        disabled={!responseMessage.trim()}
                                        className="px-5 py-2 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xs"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>Send Response</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </SessionGuard>
    );
}