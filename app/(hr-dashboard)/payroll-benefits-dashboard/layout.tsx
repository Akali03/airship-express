'use client';

import { SidebarProvider } from './components/layout/SidebarContext';

export default function PayrollBenefitsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            {children}
        </SidebarProvider>
    );
}