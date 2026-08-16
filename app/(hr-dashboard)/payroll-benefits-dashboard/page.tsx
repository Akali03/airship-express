'use client';

import DashboardLayout from './components/layout/DashboardLayout';
import { PayrollDashboard } from './modules/dashboard/PayrollDashboard';

export default function PayrollBenefitsDashboardPage() {
    return (
        <DashboardLayout>
            <PayrollDashboard />
        </DashboardLayout>
    );
}