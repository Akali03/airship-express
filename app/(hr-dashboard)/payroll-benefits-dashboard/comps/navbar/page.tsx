'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function Navbar() {
    const router = useRouter();

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/hrAuth/payroll-benefits');
    }

    return (
        <header className="border-b border-line">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
                <Image
                    src="/images/logo-remove-bg.png"
                    alt="Airship Express"
                    width={140}
                    height={38}
                    className="h-8 w-auto"
                    priority
                />
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 text-[12.5px] text-muted">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        Payroll &amp; Benefits
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted transition-colors hover:text-ink"
                    >
                        <LogOut size={14} strokeWidth={1.75} />
                        Log out
                    </button>
                </div>
            </div>
        </header>
    );
}