'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye,
    EyeOff,
    X,
    Search,
    Send,
    CheckCircle,
    AlertCircle,
    Users,
    UserCog,
    User,
    Building,
    Loader2,
    Clock,
    Mail,
    LogIn,
    AlertTriangle,
    MessageSquare,
    Pencil,
    Trash2,
    Eye as EyeIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { useConfirm } from '@/app/(supplyChain)/components/ui/ConfirmModal';
import { OfflineDetector } from '@/app/(supplyChain)/components/global/OfflineDetector';
import { user } from '@/app/(supplyChain)/lib/services/Class/user';

export default function SupplyChainLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [loggedInUser, setLoggedInUser] = useState<any>(null);

    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);

    const [isRemembered, setIsRemembered] = useState(false);
    const [isCheckingRemembered, setIsCheckingRemembered] = useState(false);
    const [rememberedData, setRememberedData] = useState<any>(null);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [isRequestingOTP, setIsRequestingOTP] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isLoggingInWithRemembered, setIsLoggingInWithRemembered] = useState(false);
    const [isCurrentlyActive, setIsCurrentlyActive] = useState(false);
    const [isSelectionLocked, setIsSelectionLocked] = useState(false);

    const [isDeviceBlocked, setIsDeviceBlocked] = useState(false);
    const [blockedDeviceId, setBlockedDeviceId] = useState<string | null>(null);
    const [showAppealModal, setShowAppealModal] = useState(false);
    const [appealMessage, setAppealMessage] = useState('');
    const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
    const [existingAppeal, setExistingAppeal] = useState<any>(null);
    const [isEditingAppeal, setIsEditingAppeal] = useState(false);

    const lastCheckRef = useRef<number>(0);
    const isCheckingRef = useRef<boolean>(false);
    const checkCacheDuration = 60 * 1000;
    const { confirm } = useConfirm();

    const clearUserSession = useCallback(async () => {
        const sessionToken = localStorage.getItem('session_token');

        if (sessionToken) {
            try {
                await fetch('/api/supplyChain/logout', {
                    method: 'POST',
                    headers: { 'x-session-token': sessionToken }
                });
            } catch (error) {
            }
        }
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('session_expires');
        localStorage.removeItem('logged_in_email');
        localStorage.removeItem('user_agent');
        document.cookie = 'session_token=; path=/; max-age=0';
    }, []);

    const checkIfDeviceBlocked = async (userId: string, userAgent: string): Promise<any> => {
        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .maybeSingle();

            if (userError) {
                return null;
            }

            if (userData?.role === 'Admin') {
                return null;
            }

            const { data, error } = await supabase
                .from('blocked_devices')
                .select('id, device_name, reason, status')
                .eq('user_id', userId)
                .eq('user_agent', userAgent)
                .eq('status', 'blocked')
                .maybeSingle();

            if (error) {
                return null;
            }

            return data;
        } catch (error) {
            return null;
        }
    };

    const checkExistingAppeal = async (blockedDeviceId: string) => {
        try {
            const { data, error } = await supabase
                .from('appeals')
                .select('*')
                .eq('blocked_device_id', blockedDeviceId)
                .order('created_at', { ascending: false })
                .maybeSingle();

            if (error) {
                return null;
            }

            return data;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        if (isDeviceBlocked && blockedDeviceId) {
            const fetchAppeal = async () => {
                const appeal = await checkExistingAppeal(blockedDeviceId);
                setExistingAppeal(appeal);
            };
            fetchAppeal();
        }
    }, [isDeviceBlocked, blockedDeviceId]);

    const handleSubmitAppeal = async () => {
        if (!appealMessage.trim()) {
            toast.error('Please enter an appeal message');
            return;
        }

        if (!blockedDeviceId) {
            toast.error('No blocked device found');
            return;
        }

        setIsSubmittingAppeal(true);

        try {
            const existing = await checkExistingAppeal(blockedDeviceId);
            if (existing) {
                toast.warning('You already have a pending appeal for this device');
                setShowAppealModal(false);
                setIsSubmittingAppeal(false);
                return;
            }

            const { data, error } = await supabase
                .from('appeals')
                .insert({
                    blocked_device_id: blockedDeviceId,
                    user_agent: navigator.userAgent,
                    user_email: loggedInUser?.email || '',
                    user_name: loggedInUser?.display_name || 'Unknown User',
                    user_role: loggedInUser?.role || 'Employee',
                    appeal_message: appealMessage.trim(),
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select();

            if (error) {
                toast.error('Failed to submit appeal. Please try again.');
                return;
            }

            toast.success('Appeal submitted successfully. Please wait for admin approval.');
            setShowAppealModal(false);
            setAppealMessage('');
            setIsEditingAppeal(false);
            setExistingAppeal(data?.[0] || null);
        } catch (error) {
            toast.error('Failed to submit appeal. Please try again.');
        } finally {
            setIsSubmittingAppeal(false);
        }
    };

    const handleUpdateAppeal = async () => {
        if (!appealMessage.trim()) {
            toast.error('Please enter an appeal message');
            return;
        }

        if (!existingAppeal?.id) {
            toast.error('No appeal found to update');
            return;
        }

        setIsSubmittingAppeal(true);

        try {
            const { error } = await supabase
                .from('appeals')
                .update({
                    appeal_message: appealMessage.trim(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingAppeal.id);

            if (error) {
                toast.error('Failed to update appeal. Please try again.');
                return;
            }

            toast.success('Appeal updated successfully');
            setShowAppealModal(false);
            setAppealMessage('');
            setIsEditingAppeal(false);
            setExistingAppeal({ ...existingAppeal, appeal_message: appealMessage.trim() });
        } catch (error) {
            toast.error('Failed to update appeal. Please try again.');
        } finally {
            setIsSubmittingAppeal(false);
        }
    };

    const handleDeleteAppeal = async () => {
        if (!existingAppeal?.id) {
            toast.error('No appeal found to delete');
            return;
        }

        const confirmed = await confirm({
            title: 'Delete Appeal',
            message: 'Are you sure you want to delete this appeal? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('appeals')
                .delete()
                .eq('id', existingAppeal.id);

            if (error) {
                toast.error('Failed to delete appeal. Please try again.');
                return;
            }

            toast.success('Appeal deleted successfully');
            setExistingAppeal(null);
            setAppealMessage('');
            setIsEditingAppeal(false);
            setShowAppealModal(false);
        } catch (error) {
            toast.error('Failed to delete appeal. Please try again.');
        }
    };

    useEffect(() => {
        const checkExistingSession = async () => {
            const sessionToken = localStorage.getItem('session_token');

            if (!sessionToken) {
                setIsLoading(false);
                return;
            }

            const now = Date.now();
            const lastCheck = lastCheckRef.current;
            if (lastCheck && (now - lastCheck) < checkCacheDuration) {
                setIsLoading(false);
                return;
            }

            if (isCheckingRef.current) return;
            isCheckingRef.current = true;

            try {
                const res = await fetch('/api/supplyChain/check-remembered-session', {
                    headers: { 'x-session-token': sessionToken }
                });

                lastCheckRef.current = now;
                const data = await res.json();

                if (res.ok && data.remembered) {

                    if (data.differentDevice) {
                        toast.warning('Different device. Please login with OTP.');
                        setIsLoading(false);
                        return;
                    }

                    const userAgent = localStorage.getItem('user_agent') || navigator.userAgent;
                    const blockedDevice = await checkIfDeviceBlocked(data.user?.id, userAgent);

                    if (blockedDevice) {
                        setIsDeviceBlocked(true);
                        setBlockedDeviceId(blockedDevice.id);
                        toast.error(`This device is blocked. Reason: ${blockedDevice.reason || 'Blocked by admin'}`);
                        setIsLoading(false);
                        return;
                    }

                    localStorage.setItem('user_role', data.user.role);

                    const roleRedirects: Record<string, string> = {
                        'Admin': '/executive',
                        'Manager': '/warehousing?tab=incoming',
                        'Employee': '/documents',
                        'Operator': '/warehousing?tab=incoming',
                        'Executive': '/executive'
                    };

                    const redirectPath = roleRedirects[data.user.role] || '/warehousing';
                    window.location.href = redirectPath;
                    return;
                }

                await clearUserSession();
                toast.error('Session expired. Please login again.');
            } catch (error) {
            } finally {
                isCheckingRef.current = false;
                setIsLoading(false);
            }
        };

        checkExistingSession();
    }, [clearUserSession]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleEmployeeSelect = async (employee: any) => {
        if (isSelectionLocked || isCheckingRemembered || isRequestingOTP || isDeviceBlocked) return;

        setSelectedEmployee(employee);
        setIsCheckingRemembered(true);
        setIsRemembered(false);
        setIsCurrentlyActive(false);
        setRememberedData(null);
        setIsSelectionLocked(true);

        try {
            const storedUserAgent = localStorage.getItem('user_agent');

            const res = await fetch(`/api/supplyChain/check-employee-session?email=${encodeURIComponent(employee.email)}`);
            const data = await res.json();

            if (data.found && data.user_id) {
                const userAgent = navigator.userAgent;
                const blockedDevice = await checkIfDeviceBlocked(data.user_id, userAgent);

                if (blockedDevice) {
                    setIsDeviceBlocked(true);
                    setBlockedDeviceId(blockedDevice.id);
                    toast.error(`This device is blocked. Reason: ${blockedDevice.reason || 'Blocked by admin'}`);
                    setIsCheckingRemembered(false);
                    setIsSelectionLocked(false);
                    return;
                }
            }

            if (data.found && data.is_currently_active) {
                setIsCurrentlyActive(true);
                toast.info(`${employee.display_name} is currently logged in on another device`);
                setIsCheckingRemembered(false);
                setIsSelectionLocked(false);
                return;
            }

            if (data.found && data.remember_me && !data.is_expired) {
                const isSameDevice = data.user_agent === storedUserAgent;

                if (isSameDevice) {
                    setIsRemembered(true);
                    setRememberedData({
                        ...data,
                        user: { role: data.role || 'Employee' }
                    });
                    toast.success(`${employee.display_name} is remembered on this device`);
                } else {
                    toast.warning('Different device. Please verify with OTP.');
                    setIsRemembered(false);
                }
            } else {
                setIsRemembered(false);
            }
        } catch (error) {
            setIsRemembered(false);
        } finally {
            setIsCheckingRemembered(false);
            setIsSelectionLocked(false);
        }
    };

    const handleLoginWithRemembered = async () => {
        if (!selectedEmployee || isDeviceBlocked) {
            if (isDeviceBlocked) {
                toast.error('This device is blocked. Please submit an appeal.');
            }
            return;
        }

        setIsLoggingInWithRemembered(true);
        try {
            toast.success(`Logging in as ${selectedEmployee.display_name}...`);

            const userRole = rememberedData?.role ||
                loggedInUser?.role ||
                localStorage.getItem('user_role') ||
                'Employee';

            const sessionToken = rememberedData?.session_token;

            if (sessionToken) {
                const currentUserAgent = navigator.userAgent;

                const blockedDevice = await checkIfDeviceBlocked(rememberedData.user_id, currentUserAgent);
                if (blockedDevice) {
                    setIsDeviceBlocked(true);
                    setBlockedDeviceId(blockedDevice.id);
                    toast.error(`This device is blocked. Reason: ${blockedDevice.reason || 'Blocked by admin'}`);
                    setIsLoggingInWithRemembered(false);
                    return;
                }

                const updateRes = await fetch('/api/supplyChain/activate-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_token: sessionToken,
                        user_agent: currentUserAgent,
                    }),
                });

                if (!updateRes.ok) {
                    toast.error('Session activation failed. Please login with OTP.');
                    setIsLoggingInWithRemembered(false);
                    return;
                }

                const updateData = await updateRes.json();

                localStorage.setItem('session_token', sessionToken);
            } else {
                const existingToken = localStorage.getItem('session_token');
                if (!existingToken) {
                    toast.error('No session found. Please login with OTP.');
                    setIsLoggingInWithRemembered(false);
                    return;
                }
            }

            localStorage.setItem('user_role', userRole);
            localStorage.setItem('user_name', selectedEmployee.display_name);
            localStorage.setItem('user_email', selectedEmployee.email);

            const roleRedirects: Record<string, string> = {
                'Admin': '/executive',
                'Manager': '/warehousing?tab=incoming',
                'Employee': '/documents',
            };

            setTimeout(() => {
                setShowEmployeeModal(false);
                router.push(roleRedirects[userRole] || '/warehousing');
            }, 1000);
        } catch (error) {
            toast.error('Failed to login. Please request OTP.');
        } finally {
            setIsLoggingInWithRemembered(false);
        }
    };

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoginError(null);

        if (!email || !password) {
            setLoginError('Please enter your email and password.');
            return;
        }

        setIsLoggingIn(true);
        try {
            await supabase.auth.signOut();

            localStorage.clear();

            document.cookie.split(";").forEach(c => {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toISOString() + ";path=/");
            });

            await new Promise(resolve => setTimeout(resolve, 500));

            const res = await fetch('/api/auth/supplyChain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();


            if (!res.ok) {
                setLoginError(data.message || 'Invalid email or password.');
                return;
            }

            setLoggedInUser(data.user);

            localStorage.setItem('user_agent', navigator.userAgent);
            localStorage.setItem('logged_in_email', data.user.email);
            localStorage.setItem('user_role', data.user.role);
            localStorage.setItem('user_name', data.user.display_name || 'User');
            localStorage.setItem('user_id', data.user.id);


            await loadEmployeesFromHR(data.user.role);
            setShowEmployeeModal(true);
        } catch (err) {
            setLoginError('Something went wrong. Please try again.');
        } finally {
            setIsLoggingIn(false);
        }
    }

    async function loadEmployeesFromHR(role: string) {
        setIsLoadingEmployees(true);
        try {

            const userEmail = loggedInUser?.email;
            const params = new URLSearchParams();
            params.append('role', role);
            if (userEmail) params.append('email', userEmail);

            const res = await fetch(`/api/supplyChain/employees?${params.toString()}`, {
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (res.ok) {
                setEmployees(data);
            } else {
                setLoginError('Failed to load employees from HR system.');
            }
        } catch (err) {
            setLoginError('Failed to connect to HR system.');
        } finally {
            setIsLoadingEmployees(false);
        }
    }

    async function requestOTP() {
        if (!selectedEmployee || isDeviceBlocked) {
            if (isDeviceBlocked) {
                toast.error('This device is blocked. Please submit an appeal.');
            }
            return;
        }

        setIsRequestingOTP(true);
        setOtpError(null);
        setOtpSuccess(null);

        try {
            const blockedDevice = await checkIfDeviceBlocked(loggedInUser.id, navigator.userAgent);
            if (blockedDevice) {
                setIsDeviceBlocked(true);
                setBlockedDeviceId(blockedDevice.id);
                toast.error(`This device is blocked. Reason: ${blockedDevice.reason || 'Blocked by admin'}`);
                setIsRequestingOTP(false);
                return;
            }

            const res = await fetch('/api/supplyChain/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedEmployee.id,
                    email: selectedEmployee.email,
                    loggedInUserId: loggedInUser.id,
                    employeeName: selectedEmployee.display_name,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    toast.error('Rate limit exceeded. Please wait an hour.');
                    setOtpError('Rate limit exceeded. Please wait an hour.');
                } else {
                    throw new Error(data.message || 'Failed to send OTP');
                }
                return;
            }

            toast.success(`OTP sent to ${selectedEmployee.email}`);
            setOtpSuccess(`OTP sent to ${selectedEmployee.email}`);

            setOtpSent(true);
            setCountdown(30);
            setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
        } catch (err: any) {
            toast.error(err.message);
            setOtpError(err.message);
        } finally {
            setIsRequestingOTP(false);
        }
    }

    async function resendOTP() {
        if (!selectedEmployee || isDeviceBlocked) {
            if (isDeviceBlocked) {
                toast.error('This device is blocked. Please submit an appeal.');
            }
            return;
        }

        setIsResending(true);
        setOtpError(null);
        setOtpSuccess(null);

        try {
            const blockedDevice = await checkIfDeviceBlocked(loggedInUser.id, navigator.userAgent);
            if (blockedDevice) {
                setIsDeviceBlocked(true);
                setBlockedDeviceId(blockedDevice.id);
                toast.error(`This device is blocked. Reason: ${blockedDevice.reason || 'Blocked by admin'}`);
                setIsResending(false);
                return;
            }

            const res = await fetch('/api/supplyChain/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedEmployee.id,
                    email: selectedEmployee.email,
                    loggedInUserId: loggedInUser.id,
                    employeeName: selectedEmployee.display_name,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    toast.error('Rate limit exceeded. Please wait an hour.');
                    setOtpError('Rate limit exceeded. Please wait an hour.');
                } else {
                    throw new Error(data.message || 'Failed to resend OTP');
                }
                return;
            }

            toast.success(`New OTP sent to ${selectedEmployee.email}`);
            setOtpSuccess(`New OTP sent to ${selectedEmployee.email}`);
            setCountdown(30);
        } catch (err: any) {
            toast.error(err.message);
            setOtpError(err.message);
        } finally {
            setIsResending(false);
        }
    }

    async function verifyOTP() {
        const otpString = otpCode.join('');
        if (otpString.length !== 6) {
            toast.error('Please enter all 6 digits');
            setOtpError('Please enter all 6 digits');
            return;
        }

        if (isDeviceBlocked) {
            toast.error('This device is blocked. Please submit an appeal.');
            return;
        }

        setIsVerifying(true);
        setOtpError(null);
        setOtpSuccess(null);

        try {
            const blockedDevice = await checkIfDeviceBlocked(loggedInUser.id, navigator.userAgent);
            if (blockedDevice) {
                setIsDeviceBlocked(true);
                setBlockedDeviceId(blockedDevice.id);
                toast.error(`This device is blocked. Reason: ${blockedDevice.reason || 'Blocked by admin'}`);
                setIsVerifying(false);
                return;
            }

            const res = await fetch('/api/supplyChain/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: loggedInUser.id,
                    otp: otpString,
                    targetUserId: selectedEmployee.id,
                    rememberMe: rememberMe,
                    email: selectedEmployee.email,
                    employeeName: selectedEmployee.display_name,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Invalid OTP');
            }

            localStorage.setItem('session_token', data.session_token);
            localStorage.setItem('session_id', data.session_id);
            localStorage.setItem('user_role', data.role);
            localStorage.setItem('session_expires', data.expires_at);
            localStorage.setItem('user_name', selectedEmployee.display_name);
            localStorage.setItem('user_email', selectedEmployee.email);

            const maxAge = rememberMe ? 15 * 24 * 60 * 60 : 8 * 60 * 60;
            document.cookie = `session_token=${data.session_token}; path=/; max-age=${maxAge}`;

            toast.success(`Login successful! ${rememberMe ? 'Remembered 15 days' : 'Session 8 hours'}`);
            setOtpSuccess('Verification successful!');

            await loadEmployeesFromHR(loggedInUser.role);
            await new Promise(resolve => setTimeout(resolve, 500));

            setShowEmployeeModal(false);
            router.push(data.redirect_url);
        } catch (err: any) {
            toast.error(err.message);
            setOtpError(err.message);
            setOtpCode(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setIsVerifying(false);
        }
    }

    function handleOtpChange(index: number, value: string) {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otpCode];
        newOtp[index] = value.slice(0, 1);
        setOtpCode(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    }

    function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    }

    function handleOtpPaste(e: React.ClipboardEvent) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (!/^\d{6}$/.test(pastedData)) return;
        const digits = pastedData.split('');
        setOtpCode(digits);
        document.getElementById('otp-5')?.focus();
    }

    const filteredEmployees = employees.filter(emp =>
        (emp.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedEmployees = filteredEmployees.length > 5
        ? filteredEmployees.slice(0, 5)
        : filteredEmployees;
    const remainingCount = filteredEmployees.length - 5;

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Manager': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Employee': return 'bg-green-100 text-green-700 border-green-200';
            case 'Executive': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Operator': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleCloseModal = async () => {
        setShowEmployeeModal(false);
        await clearUserSession();
        router.push('/scAuth');
    };

    const openAppealModal = () => {
        if (existingAppeal) {
            setAppealMessage(existingAppeal.appeal_message);
            setIsEditingAppeal(false);
        } else {
            setAppealMessage('');
            setIsEditingAppeal(false);
        }
        setShowAppealModal(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-2 text-gray-600">Checking session...</p>
                </div>
            </div>
        );
    }

    return (
        <OfflineDetector
            showToast={true}
            autoReconnect={true}
            reconnectInterval={30000}
            blurAmount={4}
        >
            <>
                <div className="h-dvh w-full bg-paper text-ink font-rethink grid grid-cols-1 lg:grid-cols-[1fr_460px]">
                    {/* left side - branding */}
                    <div className="relative hidden lg:flex flex-col justify-between border-r border-line px-16 py-14 overflow-hidden">
                        <div className="absolute bottom-14 right-14 rotate-[-6deg] select-none">
                            <div className="flex items-center gap-2 rounded-full border border-line px-4 py-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                <span className="font-rethink text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                                    Supply Chain
                                </span>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            <Image
                                src="/images/logo-remove-bg.png"
                                alt="Airship Express"
                                width={168}
                                height={48}
                                className="h-10 w-auto"
                                priority
                            />
                        </motion.div>

                        <motion.div
                            className="max-w-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
                        >
                            <p className="font-rethink text-[13px] font-medium uppercase tracking-[0.2em] text-accent">
                                Secure Access
                            </p>
                            <h1 className="mt-5 font-bricolage text-[44px] font-medium leading-[1.05] tracking-tight">
                                Supply Chain
                                <br />
                                Management
                                <br />
                                Portal
                            </h1>
                            <p className="mt-5 text-[15px] leading-relaxed text-muted">
                                Access the supply chain management system to track inventory,
                                manage orders, and optimize logistics.
                            </p>
                        </motion.div>

                        <div className="flex items-center gap-2 text-[12px] text-muted">
                            <span className="h-1 w-1 rounded-full bg-accent" />
                            Internal use only &middot; Airship Express Supply Chain
                        </div>
                    </div>

                    {/* right side - login form */}
                    <div className="h-dvh overflow-y-auto flex items-center justify-center px-5 py-8 sm:px-12 sm:py-16">
                        <motion.div
                            className="w-full max-w-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
                        >
                            <div className="mb-6 sm:mb-10 lg:hidden">
                                <Image
                                    src="/images/logo-remove-bg.png"
                                    alt="Airship Express"
                                    width={144}
                                    height={40}
                                    className="h-8 w-auto sm:h-9"
                                    priority
                                />
                            </div>

                            <p className="font-rethink text-[12px] sm:text-[13px] font-medium uppercase tracking-[0.2em] text-accent">
                                Welcome back
                            </p>
                            <h2 className="mt-2 sm:mt-3 font-bricolage text-[24px] sm:text-[28px] lg:text-[30px] font-medium tracking-tight">
                                Sign in to Supply Chain
                            </h2>
                            <p className="mt-2 sm:mt-2.5 text-[13.5px] sm:text-[14.5px] leading-relaxed text-muted">
                                Use your company email and password.
                            </p>

                            <form
                                onSubmit={handleLogin}
                                className="mt-6 sm:mt-9 lg:mt-11 space-y-5 sm:space-y-7 lg:space-y-8"
                                noValidate
                            >
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-[11.5px] sm:text-[12.5px] font-medium uppercase tracking-[0.1em] text-muted"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        className="mt-2 block w-full border-0 border-b border-line bg-transparent px-0 py-2 text-[14px] sm:text-[15px] text-ink placeholder:text-line outline-none transition focus:border-accent"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-baseline justify-between">
                                        <label
                                            htmlFor="password"
                                            className="block text-[11.5px] sm:text-[12.5px] font-medium uppercase tracking-[0.1em] text-muted"
                                        >
                                            Password
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="mt-2 block w-full border-0 border-b border-line bg-transparent px-0 py-2 pr-12 text-[14px] sm:text-[15px] text-ink placeholder:text-line outline-none transition focus:border-accent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute bottom-1.5 right-0 text-muted transition-colors hover:text-ink"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={17} strokeWidth={1.75} />
                                            ) : (
                                                <Eye size={17} strokeWidth={1.75} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {loginError && (
                                    <div role="alert" className="border-l-2 border-red-500 pl-3 text-[13px] text-red-600">
                                        {loginError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full bg-ink px-4 py-3.5 text-[14px] font-medium tracking-wide text-paper transition-colors duration-200 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {isLoggingIn ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Signing in…
                                        </>
                                    ) : (
                                        'Sign in'
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <p className="mt-6 sm:mt-9 lg:mt-12 text-center text-[12px] sm:text-[12.5px] text-muted">
                                    Trouble accessing your account? Contact HR at{' '}
                                    <a
                                        href="mailto:hr@airshipexpress.com"
                                        className="font-medium text-accent transition-colors hover:text-accent-dark"
                                    >
                                        hr@airshipexpress.com
                                    </a>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* employee selection modal */}
                <AnimatePresence>
                    {showEmployeeModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                            >
                                <div className="border-b border-slate-100 p-6 flex justify-between items-center bg-white rounded-t-2xl">
                                    <div className="flex items-center gap-3.5">
                                        <div className="p-2.5 rounded-xl bg-pink-50 text-pink-500 ring-1 ring-pink-500/10 shrink-0">
                                            <Building size={22} className="text-pink-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 tracking-tight">
                                                Select Employee from HR System
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs font-medium text-slate-500">
                                                    HR System Data
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCloseModal}
                                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all p-2 rounded-xl active:scale-95"
                                        title="Close"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 font-medium">Logged in as:</span>
                                        <span className="font-semibold text-slate-800">
                                            {loggedInUser?.display_name || loggedInUser?.email}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] tracking-wide ${getRoleColor(loggedInUser?.role)}`}>
                                            {loggedInUser?.role}
                                        </span>
                                    </div>
                                    <span className="text-slate-400 hidden sm:inline-block font-medium">
                                        Select an employee to verify
                                    </span>
                                </div>

                                {isDeviceBlocked ? (
                                    <div className="p-6 text-center">
                                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertTriangle className="h-8 w-8 text-red-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Device Blocked</h3>
                                        <p className="text-sm text-gray-600 mt-2">
                                            This device has been blocked by an administrator.
                                        </p>

                                        {existingAppeal?.response_message && (
                                            <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200 text-left">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-bold text-blue-600">A</span>
                                                    </div>
                                                    <span className="text-xs font-semibold text-blue-700">Admin Response</span>
                                                </div>
                                                <p className="text-sm text-gray-700">{existingAppeal.response_message}</p>
                                                {existingAppeal.status === 'approved' && (
                                                    <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                                        <CheckCircle size={14} />
                                                        Appeal Approved
                                                    </div>
                                                )}
                                                {existingAppeal.status === 'rejected' && (
                                                    <div className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1">
                                                        <AlertCircle size={14} />
                                                        Appeal Rejected
                                                    </div>
                                                )}
                                                {existingAppeal.resolved_at && (
                                                    <div className="mt-1 text-[10px] text-gray-400">
                                                        Resolved: {new Date(existingAppeal.resolved_at).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {existingAppeal && !existingAppeal.response_message && (
                                            <div className="mt-4 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                                <p className="text-sm text-yellow-800">
                                                    <span className="font-semibold">Status:</span>{' '}
                                                    {existingAppeal.status === 'pending' ? 'Waiting for admin review...' :
                                                        existingAppeal.status === 'approved' ? 'Approved! Device will be unblocked shortly.' :
                                                            'Rejected. Please contact support for further assistance.'}
                                                </p>
                                                <p className="text-xs text-yellow-600 mt-1">
                                                    Submitted: {new Date(existingAppeal.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-500 mt-1">
                                            {existingAppeal ?
                                                (existingAppeal.response_message ? 'Admin has responded to your appeal.' :
                                                    'Your appeal is under review.') :
                                                'If you believe this is a mistake, you can submit an appeal.'}
                                        </p>
                                        <button
                                            onClick={openAppealModal}
                                            className="mt-4 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-all flex items-center gap-2 mx-auto"
                                        >
                                            {existingAppeal ? (
                                                <>
                                                    <EyeIcon size={16} />
                                                    {existingAppeal.response_message ? 'View Response' : 'Review Appeal'}
                                                </>
                                            ) : (
                                                <>
                                                    <MessageSquare size={16} />
                                                    Submit Appeal
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : !otpSent ? (
                                    <>
                                        <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                                            <div className="relative">
                                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 shrink-0 pointer-events-none" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Search employee by name, ID, or email..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm bg-slate-50 border border-gray-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-3 sm:p-4 max-h-[60vh] sm:max-h-96 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
                                            {isLoadingEmployees ? (
                                                <div className="text-center py-10 sm:py-14">
                                                    <Loader2 className="animate-spin text-accent mx-auto" size={32} />
                                                    <p className="mt-2.5 text-gray-500 text-xs sm:text-sm font-medium">Fetching directory from HR system...</p>
                                                </div>
                                            ) : filteredEmployees.length === 0 ? (
                                                <div className="text-center py-10 sm:py-14 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                                        <User size={24} />
                                                    </div>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-600">No matching employees found</p>
                                                    <p className="text-[11px] text-gray-400 mt-1">Try adjusting your search terms</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {displayedEmployees.map((emp) => {
                                                        const isSelected = selectedEmployee?.id === emp.id;
                                                        const isDisabled = isSelectionLocked || isCheckingRemembered || isDeviceBlocked;

                                                        return (
                                                            <button
                                                                key={emp.id}
                                                                onClick={() => handleEmployeeSelect(emp)}
                                                                disabled={isDisabled}
                                                                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all border duration-150 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'
                                                                    } ${isSelected
                                                                        ? 'border-accent bg-accent/5 ring-1 ring-accent/30 shadow-xs'
                                                                        : 'border-slate-200/60 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-start gap-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                            <span className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                                                                                {emp.display_name}
                                                                            </span>
                                                                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60 shrink-0">
                                                                                {emp.employee_id}
                                                                            </span>

                                                                            {emp.is_active && (
                                                                                <span className="text-[10px] bg-red-50 text-red-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200/60 shrink-0">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                                                    Active
                                                                                </span>
                                                                            )}
                                                                            {!emp.is_active && emp.remembered && (
                                                                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/60 shrink-0">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                                    Remembered
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="text-xs text-gray-500 truncate mt-1">{emp.email}</div>

                                                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                                                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 ${getRoleColor(emp.role)}`}>
                                                                                {emp.role}
                                                                            </span>
                                                                            <span className="text-[10px] text-gray-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[120px] sm:max-w-none">
                                                                                {emp.department}
                                                                            </span>
                                                                            <span className="text-[10px] text-gray-300">•</span>
                                                                            <span className="text-[10px] text-gray-400 truncate max-w-[120px] sm:max-w-none">
                                                                                {emp.position}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {isSelected && (
                                                                        <div className="mt-0.5 shrink-0 bg-accent/10 p-1 rounded-full text-accent">
                                                                            <CheckCircle size={18} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}

                                                    {remainingCount > 0 && (
                                                        <div className="text-center py-2.5 text-xs text-gray-400 border-t border-dashed border-gray-200 mt-3 font-medium">
                                                            + {remainingCount} more {remainingCount === 1 ? 'employee' : 'employees'} available
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-gray-200/80 p-3.5 sm:p-4 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                                            <div className="text-xs text-gray-500 min-w-0">
                                                {selectedEmployee ? (
                                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                        <CheckCircle className="text-emerald-500 shrink-0" size={16} />
                                                        <span className="font-medium text-gray-600">Selected:</span>
                                                        <span className="font-bold text-gray-900 truncate max-w-[130px] sm:max-w-[180px]">
                                                            {selectedEmployee.display_name}
                                                        </span>

                                                        {isCheckingRemembered ? (
                                                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                                                                <Loader2 className="animate-spin text-accent" size={13} />
                                                                <span>Checking...</span>
                                                            </div>
                                                        ) : isCurrentlyActive ? (
                                                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                                                Logged In
                                                            </span>
                                                        ) : isRemembered ? (
                                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                                                Remembered
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                                                Not remembered
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-medium">Select an employee from the HR list</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                <button
                                                    onClick={handleCloseModal}
                                                    className="flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors border sm:border-0 border-gray-200 rounded-xl bg-white sm:bg-transparent text-center"
                                                >
                                                    Cancel
                                                </button>

                                                {selectedEmployee && isCurrentlyActive ? (
                                                    <button
                                                        disabled
                                                        className="flex-1 sm:flex-initial px-5 py-2 bg-slate-300 text-slate-600 text-xs sm:text-sm font-semibold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                                        <span>Logged In</span>
                                                    </button>
                                                ) : selectedEmployee && isRemembered ? (
                                                    <button
                                                        onClick={handleLoginWithRemembered}
                                                        disabled={isCheckingRemembered || isLoggingInWithRemembered || isDeviceBlocked}
                                                        className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                                                    >
                                                        {isLoggingInWithRemembered ? (
                                                            <>
                                                                <Loader2 className="animate-spin" size={15} />
                                                                <span>Logging in...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LogIn size={15} />
                                                                <span>Login</span>
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={requestOTP}
                                                        disabled={!selectedEmployee || isRequestingOTP || isCheckingRemembered || isDeviceBlocked}
                                                        className="flex-1 sm:flex-initial px-5 py-2 bg-accent text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-accent-dark shadow-sm shadow-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                                                    >
                                                        {isRequestingOTP || isCheckingRemembered ? (
                                                            <>
                                                                <Loader2 className="animate-spin" size={15} />
                                                                <span>{isRequestingOTP ? 'Sending...' : 'Checking...'}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send size={15} />
                                                                <span>Send OTP</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-6 sm:p-8">
                                        <div className="text-center mb-6">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent/10 ring-1 ring-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-sm">
                                                {isVerifying ? (
                                                    <Loader2 className="animate-spin text-accent" size={24} />
                                                ) : (
                                                    <Mail className="text-accent" size={24} />
                                                )}
                                            </div>
                                            <h4 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">Verify Security Code</h4>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 px-2 leading-relaxed">
                                                Enter the 6-digit verification code sent to <br />
                                                <span className="font-semibold text-gray-800 break-all">{selectedEmployee?.email}</span>
                                            </p>
                                            <div className="mt-2.5 inline-block bg-slate-100/80 px-3 py-1 rounded-full border border-slate-200/60">
                                                <p className="text-[11px] text-gray-500 font-medium truncate">
                                                    HR Employee: <span className="font-semibold text-gray-800">{selectedEmployee?.display_name}</span> ({selectedEmployee?.employee_id})
                                                </p>
                                            </div>
                                        </div>

                                        {otpSuccess && (
                                            <div className="mb-5 border-l-4 border-emerald-500 text-xs sm:text-[13px] text-emerald-800 font-medium flex items-center gap-2.5 bg-emerald-50/80 p-3.5 rounded-r-xl shadow-xs">
                                                <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                                                <span>{otpSuccess}</span>
                                            </div>
                                        )}

                                        {otpError && (
                                            <div className="mb-5 border-l-4 border-red-500 text-xs sm:text-[13px] text-red-800 font-medium flex items-center gap-2.5 bg-red-50/80 p-3.5 rounded-r-xl shadow-xs">
                                                <AlertCircle size={16} className="shrink-0 text-red-600" />
                                                <span>{otpError}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-center gap-2 sm:gap-2.5 my-6">
                                            {otpCode.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    onPaste={index === 0 ? handleOtpPaste : undefined}
                                                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-slate-50/80 border-2 rounded-xl focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/15 outline-none transition-all duration-200 transform focus:-translate-y-0.5 ${isVerifying ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'
                                                        } ${otpError ? 'border-red-400 text-red-600 bg-red-50/30' : 'border-gray-200/80 text-gray-900'}`}
                                                    disabled={isVerifying}
                                                    autoFocus={index === 0}
                                                />
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between mb-5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 shadow-xs">
                                            <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent focus:ring-offset-0 transition-all cursor-pointer accent-accent"
                                                    disabled={isVerifying}
                                                />
                                                <span>Remember me on this device</span>
                                            </label>
                                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200/80 shrink-0">
                                                {rememberMe ? '15 days' : '8 hours'}
                                            </span>
                                        </div>

                                        {countdown > 0 && (
                                            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 mb-4">
                                                <Clock size={14} className="text-gray-400" />
                                                <span>Resend available in <strong className="text-gray-800 font-bold">{countdown}s</strong></span>
                                            </div>
                                        )}

                                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setOtpSent(false);
                                                    setOtpCode(['', '', '', '', '', '']);
                                                    setOtpError(null);
                                                    setOtpSuccess(null);
                                                    setIsRemembered(false);
                                                }}
                                                className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors text-center py-2 sm:py-0 active:scale-95"
                                                disabled={isVerifying}
                                            >
                                                ← Back
                                            </button>

                                            <div className="flex flex-col sm:flex-row gap-2.5">
                                                <button
                                                    onClick={resendOTP}
                                                    disabled={countdown > 0 || isResending || isVerifying || isDeviceBlocked}
                                                    className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200/80 rounded-xl hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                                                >
                                                    {isResending ? (
                                                        <>
                                                            <Loader2 className="animate-spin text-gray-500" size={14} />
                                                            <span>Resending...</span>
                                                        </>
                                                    ) : (
                                                        <span>Resend Code</span>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={verifyOTP}
                                                    disabled={isVerifying || otpCode.join('').length !== 6 || isDeviceBlocked}
                                                    className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-accent-dark text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-accent/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                                                >
                                                    {isVerifying ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={16} />
                                                            <span>Verifying...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle size={16} />
                                                            <span>Verify Code</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* appeal modal */}
                <AnimatePresence>
                    {showAppealModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl"
                            >
                                <div className="border-b border-gray-200 p-6 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500 ring-1 ring-blue-500/10">
                                            {existingAppeal ? <EyeIcon size={22} /> : <MessageSquare size={22} />}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">
                                                {existingAppeal ? 'Review Appeal' : 'Submit Appeal'}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {existingAppeal ? 'View and manage your appeal' : 'Request to unblock your device'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowAppealModal(false);
                                            setAppealMessage('');
                                            setIsEditingAppeal(false);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {existingAppeal && !isEditingAppeal ? (
                                        <>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${existingAppeal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        existingAppeal.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {existingAppeal.status.charAt(0).toUpperCase() + existingAppeal.status.slice(1)}
                                                    </span>
                                                </div>

                                                <div className="mt-2">
                                                    <span className="text-xs font-semibold text-gray-500">Your Message:</span>
                                                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{existingAppeal.appeal_message}</p>
                                                </div>

                                                {existingAppeal.response_message && (
                                                    <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <span className="text-xs font-bold text-blue-600">A</span>
                                                            </div>
                                                            <span className="text-xs font-semibold text-blue-700">Admin Response</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{existingAppeal.response_message}</p>
                                                    </div>
                                                )}

                                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                                                    <span>Submitted: {new Date(existingAppeal.created_at).toLocaleString()}</span>
                                                    {existingAppeal.resolved_at && (
                                                        <span>• Resolved: {new Date(existingAppeal.resolved_at).toLocaleString()}</span>
                                                    )}
                                                    {existingAppeal.resolved_by && (
                                                        <span>• By: {existingAppeal.resolved_by}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {existingAppeal.status === 'pending' && (
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingAppeal(true);
                                                            setAppealMessage(existingAppeal.appeal_message);
                                                        }}
                                                        className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-2"
                                                    >
                                                        <Pencil size={15} />
                                                        Edit Appeal
                                                    </button>
                                                    <button
                                                        onClick={handleDeleteAppeal}
                                                        className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all flex items-center gap-2"
                                                    >
                                                        <Trash2 size={15} />
                                                        Delete Appeal
                                                    </button>
                                                </div>
                                            )}

                                            {existingAppeal.status !== 'pending' && (
                                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-center">
                                                    <p className="text-sm text-gray-600">
                                                        {existingAppeal.status === 'approved' ? (
                                                            <span className="text-emerald-600">✅ Your appeal has been approved!</span>
                                                        ) : (
                                                            <span className="text-red-600">❌ Your appeal was rejected.</span>
                                                        )}
                                                    </p>
                                                    {existingAppeal.response_message && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            See the admin response above for more details.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Appeal Message
                                                </label>
                                                <textarea
                                                    value={appealMessage}
                                                    onChange={(e) => setAppealMessage(e.target.value)}
                                                    placeholder="Explain why you believe this device should be unblocked..."
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition resize-none h-32 text-sm"
                                                    maxLength={500}
                                                />
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {appealMessage.length}/500 characters
                                                </p>
                                            </div>

                                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                                <p className="text-xs text-blue-700">
                                                    <strong>Note:</strong> Your appeal will be reviewed by an administrator. You will be notified once a decision is made.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setShowAppealModal(false);
                                            setAppealMessage('');
                                            setIsEditingAppeal(false);
                                        }}
                                        className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        {existingAppeal && !isEditingAppeal ? 'Close' : 'Cancel'}
                                    </button>
                                    {isEditingAppeal || !existingAppeal ? (
                                        <button
                                            onClick={existingAppeal ? handleUpdateAppeal : handleSubmitAppeal}
                                            disabled={isSubmittingAppeal || !appealMessage.trim()}
                                            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSubmittingAppeal ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={16} />
                                                    {existingAppeal ? 'Updating...' : 'Submitting...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={16} />
                                                    {existingAppeal ? 'Update Appeal' : 'Submit Appeal'}
                                                </>
                                            )}
                                        </button>
                                    ) : null}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </>
        </OfflineDetector>

    );
}