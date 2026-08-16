// app/(supplyChain)/api/supplyChain/employees/route.ts

import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { NextResponse } from 'next/server';

// hr dummy data with passwords
const HR_DUMMY_DATA = {
    'Admin': [
        {
            id: '11111111-1111-1111-1111-111111111111',
            employee_id: 'EMP-001',
            display_name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'Admin',
            department: 'Management',
            position: 'CEO',
            password_hash: 'HR_Password_123'
        },
        {
            id: '22222222-2222-2222-2222-222222222222',
            employee_id: 'EMP-002',
            display_name: 'Sarah Johnson',
            email: 'janzeldols@gmail.com',
            role: 'Admin',
            department: 'Management',
            position: 'COO',
            password_hash: 'HR_Password_456'
        }
    ],
    'Manager': [
        {
            id: '33333333-3333-3333-3333-333333333333',
            employee_id: 'EMP-003',
            display_name: 'Mike Brown',
            email: 'mike.brown@company.com',
            role: 'Manager',
            department: 'Operations',
            position: 'Warehouse Manager',
            password_hash: 'HR_Password_789'
        },
        {
            id: '44444444-4444-4444-4444-444444444444',
            employee_id: 'EMP-004',
            display_name: 'Lisa Davis',
            email: 'lisa.davis@company.com',
            role: 'Manager',
            department: 'Operations',
            position: 'Procurement Manager',
            password_hash: 'HR_Password_101'
        }
    ],
    'Employee': [
        {
            id: '55555555-5555-5555-5555-555555555555',
            employee_id: 'EMP-005',
            display_name: 'Tom Wilson',
            email: 'tom.wilson@company.com',
            role: 'Employee',
            department: 'Warehouse',
            position: 'Warehouse Staff',
            password_hash: 'HR_Password_202'
        },
        {
            id: '66666666-6666-6666-6666-666666666666',
            employee_id: 'EMP-006',
            display_name: 'Jane Lee',
            email: 'jane.lee@company.com',
            role: 'Employee',
            department: 'Warehouse',
            position: 'Inventory Specialist',
            password_hash: 'HR_Password_303'
        }
    ],
    'Operator': [
        {
            id: '77777777-7777-7777-7777-777777777777',
            employee_id: 'OPT-001',
            display_name: 'SupplyChain Operator',
            email: 'operator@company.com',
            role: 'Operator',
            department: 'Warehouse',
            position: 'Business',
            password_hash: 'HR_Password_404'
        }
    ],
    'Executive': [
        {
            id: '88888888-8888-8888-8888-888888888888',
            employee_id: 'EXC-001',
            display_name: 'Executive User',
            email: 'executive@company.com',
            role: 'Executive',
            department: 'Executive',
            position: 'CEO',
            password_hash: 'HR_Password_505'
        }
    ]
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const loggedInEmail = searchParams.get('email');

        if (!role) {
            return NextResponse.json(
                { message: 'Role parameter is required' },
                { status: 400 }
            );
        }

        const employees = HR_DUMMY_DATA[role as keyof typeof HR_DUMMY_DATA] || [];

        let rememberedEmails: string[] = [];
        let activeEmails: string[] = [];

        if (loggedInEmail) {
            try {
                const { data: sessions } = await supabase
                    .from('sessions')
                    .select('email, remember_me, expires_at, is_active')
                    .eq('email', loggedInEmail)
                    .maybeSingle();

                if (sessions) {
                    if (sessions.is_active && new Date(sessions.expires_at) > new Date()) {
                        activeEmails = [sessions.email];
                    }
                    if (sessions.remember_me && new Date(sessions.expires_at) > new Date()) {
                        rememberedEmails = [sessions.email];
                    }
                }
            } catch (error) {
                console.error('Session check error:', error);
            }
        }

        const employeesWithStatus = employees.map(emp => ({
            ...emp,
            has_hr_password: !!emp.password_hash,
            remembered: rememberedEmails.includes(emp.email),
            is_active: activeEmails.includes(emp.email)
        }));

        return NextResponse.json(employeesWithStatus);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json(
            { message: 'Failed to fetch employees from HR system' },
            { status: 500 }
        );
    }
}