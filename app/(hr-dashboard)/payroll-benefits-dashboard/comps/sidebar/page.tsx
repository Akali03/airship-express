'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, TrendingUp, Receipt, HeartPulse, BarChart3 } from 'lucide-react';

const LINKS = [
    { icon: Wallet, label: 'Payroll Management', href: '/payroll-benefits-dashboard/payroll-management' },
    { icon: TrendingUp, label: 'Compensation Planning', href: '/payroll-benefits-dashboard/compensation-planning' },
    { icon: Receipt, label: 'Claims and Reimbursement', href: '/payroll-benefits-dashboard/claims-and-reimbursement' },
    { icon: HeartPulse, label: 'HMO & Benefits Administration', href: '/payroll-benefits-dashboard/hmo-benefits-administration' },
    { icon: BarChart3, label: 'HR Analytics Dashboard', href: '/payroll-benefits-dashboard/hr-analytics-dashboard' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-full shrink-0 border-line sm:w-64 sm:border-r">
            <nav className="flex flex-col gap-1 px-3 py-6">
                {LINKS.map(({ icon: Icon, label, href }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-medium transition-colors ${active
                                    ? 'bg-ink text-paper'
                                    : 'text-muted hover:bg-accent/[0.06] hover:text-ink'
                                }`}
                        >
                            <Icon size={16} strokeWidth={1.75} />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}