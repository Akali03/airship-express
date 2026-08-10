'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Check,
    CircleDot,
    Circle,
    Wallet,
    TrendingUp,
    Receipt,
    HeartPulse,
    BarChart3,
    Bot,
    Calendar as CalendarIcon,
    Activity,
} from 'lucide-react';
import Navbar from './comps/navbar/page';
import Sidebar from './comps/sidebar/page';
import { SidebarProvider, useSidebar } from './comps/sidebar-context/page';
import { useCurrentUser } from './hooks/useCurrentUser';

const PAY_CYCLE_STEPS = [
    { label: 'Timesheets locked', date: 'Aug 05' },
    { label: 'Payroll draft', date: 'Aug 06' },
    { label: 'HR review & approval', date: 'Aug 07' },
    { label: 'Disbursement', date: 'Aug 08' },
    { label: 'Payslips released', date: 'Aug 08' },
];
const currentStep = 1;

const STATS = [
    { label: 'Next pay run', value: 'Aug 08', hint: 'in 4 days', tone: 'bg-accent' },
    { label: 'Payroll cost, this cycle', value: '₱4.82M', hint: '312 employees', tone: 'bg-accent-dark' },
    { label: 'Pending claims', value: '18', hint: '₱126,400 total', tone: 'bg-ink' },
    { label: 'Active HMO enrollees', value: '287', hint: '92% of headcount', tone: 'bg-emerald-600' },
];

const BANNER_PILLS = [
    { label: 'Employees', value: 312 },
    { label: 'Pending claims', value: 18 },
    { label: 'Active contracts', value: 6 },
];

const MODULES = [
    { icon: Wallet, label: 'Payroll Management', href: '/payroll-benefits-dashboard/payroll-management' },
    { icon: TrendingUp, label: 'Compensation Planning', href: '/payroll-benefits-dashboard/compensation-planning' },
    { icon: Receipt, label: 'Claims and Reimbursement', href: '/payroll-benefits-dashboard/claims-and-reimbursement' },
    { icon: HeartPulse, label: 'HMO & Benefits Administration', href: '/payroll-benefits-dashboard/hmo-benefits-administration' },
    { icon: BarChart3, label: 'HR Analytics Dashboard', href: '/payroll-benefits-dashboard/hr-analytics-dashboard' },
    { icon: Bot, label: 'Payroll Assistant (AI)', href: '/payroll-benefits-dashboard/chatbot' },
];

const RECENT_RUNS = [
    { id: 'PR-0812', label: 'July Cut-off 2', amount: '₱2.41M', status: 'Disbursed' },
    { id: 'PR-0798', label: 'July Cut-off 1', amount: '₱2.38M', status: 'Disbursed' },
    { id: 'PR-0781', label: 'June Cut-off 2', amount: '₱2.35M', status: 'Disbursed' },
    { id: 'PR-0764', label: 'June Cut-off 1', amount: '₱2.33M', status: 'Disbursed' },
];

function buildCalendar(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
}

function DashboardContent() {
    const { isCollapsed } = useSidebar();
    const { user } = useCurrentUser();
    const today = new Date();
    const weeks = buildCalendar(today.getFullYear(), today.getMonth());
    const monthLabel = today.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const firstName = user?.fullName?.split(' ')[0] ?? 'there';
    const roleLabel = user?.role ? `${user.role.replace('_', ' ')} session active` : 'Session active';

    return (
        <div className="flex min-h-dvh w-full bg-paper text-ink font-rethink">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Navbar />

                <main className="w-full min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                    >
                        <p className="font-rethink text-[13px] font-medium uppercase tracking-[0.2em] text-accent">
                            AirshipExpress · Payroll &amp; Benefits
                        </p>
                        <h1 className="mt-2 font-bricolage text-[24px] font-medium leading-tight tracking-tight sm:text-[32px] xl:text-[36px]">
                            Here&rsquo;s where this cycle stands.
                        </h1>
                    </motion.div>

                    {/* content grid — expands on large screens */}
                    <div className="mt-6 grid w-full grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
                        <div className="flex min-w-0 flex-col gap-5">
                            {/* banner */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
                                className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-accent-dark px-6 py-7 text-paper sm:px-8 sm:py-9"
                            >
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em]">
                                    <Activity size={12} strokeWidth={2} />
                                    {roleLabel}
                                </span>
                                <p className="mt-4 text-[15px] text-paper/70">Welcome back,</p>
                                <h2 className="font-bricolage text-[28px] font-semibold tracking-tight sm:text-[40px]">
                                    {firstName}
                                </h2>

                                <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                                    {BANNER_PILLS.map((p) => (
                                        <div
                                            key={p.label}
                                            className="rounded-xl bg-paper/10 px-4 py-2.5 backdrop-blur-sm"
                                        >
                                            <p className="font-bricolage text-[20px] font-semibold leading-none">
                                                {p.value}
                                            </p>
                                            <p className="mt-1 text-[11px] text-paper/70">{p.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* stats */}
                            <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
                                {STATS.map((s) => (
                                    <div
                                        key={s.label}
                                        className={`${s.tone} rounded-2xl px-4 py-5 text-paper sm:px-5`}
                                    >
                                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-paper/70 sm:text-[11.5px]">
                                            {s.label}
                                        </p>
                                        <p className="mt-2 font-bricolage text-[20px] font-medium tracking-tight sm:text-[24px]">
                                            {s.value}
                                        </p>
                                        <p className="mt-0.5 text-[12px] text-paper/70">{s.hint}</p>
                                    </div>
                                ))}
                            </div>

                            {/* pay cycle */}
                            <div className="w-full rounded-2xl border border-line px-5 py-6 sm:px-8 sm:py-7 dark:border-paper/10">
                                <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">
                                    Current pay cycle
                                </p>
                                <ol className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-0">
                                    {PAY_CYCLE_STEPS.map((step, i) => {
                                        const done = i < currentStep;
                                        const active = i === currentStep;
                                        return (
                                            <li
                                                key={step.label}
                                                className="flex flex-1 items-start gap-3 sm:flex-col sm:items-start sm:gap-2 sm:border-l sm:border-line sm:pl-4 sm:first:border-l-0 sm:first:pl-0 dark:sm:border-paper/10"
                                            >
                                                <span className="mt-0.5 shrink-0 sm:mt-0">
                                                    {done ? (
                                                        <Check size={16} className="text-accent" strokeWidth={2.5} />
                                                    ) : active ? (
                                                        <CircleDot size={16} className="text-accent" strokeWidth={2} />
                                                    ) : (
                                                        <Circle size={16} className="text-line" strokeWidth={2} />
                                                    )}
                                                </span>
                                                <span>
                                                    <span
                                                        className={`block text-[13px] font-medium ${active || done ? 'text-ink' : 'text-muted'
                                                            }`}
                                                    >
                                                        {step.label}
                                                    </span>
                                                    <span className="block text-[12px] text-muted">{step.date}</span>
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>

                            {/* modules quick access */}
                            <div className="w-full rounded-2xl border border-line px-5 py-6 sm:px-8 sm:py-7 dark:border-paper/10">
                                <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">
                                    Modules
                                </p>
                                <div className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 xl:grid-cols-3 dark:border-paper/10 dark:bg-paper/10">
                                    {MODULES.map(({ icon: Icon, label, href }) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            className="group flex items-center gap-3 bg-paper px-4 py-4 transition-colors hover:bg-accent/[0.06]"
                                        >
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition-colors group-hover:border-accent group-hover:text-accent dark:border-paper/15">
                                                <Icon size={16} strokeWidth={1.75} />
                                            </span>
                                            <span className="text-[13px] font-medium text-ink">{label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* aside */}
                        <div className="flex min-w-0 flex-col gap-5">
                            <div className="w-full rounded-2xl border border-line px-5 py-5 dark:border-paper/10">
                                <div className="flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">
                                    <CalendarIcon size={14} strokeWidth={1.75} />
                                    {monthLabel}
                                </div>
                                <div className="mt-4 grid grid-cols-7 gap-y-2 text-center text-[11px]">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                        <span key={i} className="text-muted">
                                            {d}
                                        </span>
                                    ))}
                                    {weeks.flat().map((day, i) => {
                                        const isToday = day === today.getDate();
                                        return (
                                            <span
                                                key={i}
                                                className={`mx-auto flex h-7 w-7 items-center justify-center text-[12px] ${day === null
                                                        ? ''
                                                        : isToday
                                                            ? 'rounded-full bg-accent font-medium text-paper'
                                                            : 'text-ink'
                                                    }`}
                                            >
                                                {day ?? ''}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="w-full rounded-2xl border border-line px-5 py-5 dark:border-paper/10">
                                <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">
                                    Recent payroll runs
                                </p>
                                <div className="mt-4 flex flex-col gap-3">
                                    {RECENT_RUNS.map((run) => (
                                        <div key={run.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[13px] font-medium text-ink">{run.label}</p>
                                                <p className="text-[11.5px] text-muted">{run.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[13px] font-medium text-ink">{run.amount}</p>
                                                <span className="text-[11px] font-medium text-emerald-600">
                                                    {run.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href="/payroll-benefits-dashboard/chatbot"
                                className="group flex w-full flex-col gap-3 rounded-2xl border border-line px-5 py-5 transition-colors hover:bg-accent/[0.06] dark:border-paper/10"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-accent dark:border-paper/15">
                                    <Bot size={16} strokeWidth={1.75} />
                                </span>
                                <div>
                                    <p className="text-[13px] font-medium text-ink">Payroll Assistant</p>
                                    <p className="mt-1 text-[12px] text-muted">
                                        Ask for payroll computations, claim checks, or benefit summaries.
                                    </p>
                                </div>
                                <span className="text-[12px] font-medium text-accent">Open assistant →</span>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function PayrollBenefitsDashboardPage() {
    return (
        <SidebarProvider>
            <DashboardContent />
        </SidebarProvider>
    );
}