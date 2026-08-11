import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { NextResponse } from 'next/server';

// HR System Dummy Data
const HR_DUMMY_DATA = {
    'Admin': [
        {
            id: '11111111-1111-1111-1111-111111111111',
            employee_id: 'EMP-001',
            display_name: 'John Smith',
            email: 'janzeldols@gmail.com',
            role: 'Admin',
            department: 'Management',
            position: 'Chief Operations Officer'
        },
        {
            id: '22222222-2222-2222-2222-222222222222',
            employee_id: 'EMP-002',
            display_name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            role: 'Admin',
            department: 'Management',
            position: 'Supply Chain Director'
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
            position: 'Warehouse Manager'
        },
        {
            id: '44444444-4444-4444-4444-444444444444',
            employee_id: 'EMP-004',
            display_name: 'Lisa Davis',
            email: 'lisa.davis@company.com',
            role: 'Manager',
            department: 'Operations',
            position: 'Procurement Manager'
        }
    ],
    'Employee': [
        {
            id: '55555555-5555-5555-5555-555555555555',
            employee_id: 'EMP-005',
            display_name: 'Tom Wilson',
            email: 'janzel@gmail.com',
            role: 'Employee',
            department: 'Warehouse',
            position: 'Warehouse Staff'
        },
        {
            id: '66666666-6666-6666-6666-666666666666',
            employee_id: 'EMP-006',
            display_name: 'Jane Lee',
            email: 'hotd0dg3@gmail.com',
            role: 'Employee',
            department: 'Warehouse',
            position: 'Inventory Specialist'
        }
    ],
    'Operator': [
        {
            id: '77777777-7777-7777-7777-777777777777',
            employee_id: 'OPT-001',
            display_name: 'SupplyChain',
            email: 'supplychainandinventory@gmail.com',
            role: 'Operator',
            department: 'Warehouse',
            position: 'Business'
        }
    ],
    'Executive': [
        {
            id: '88888888-8888-8888-8888-888888888888',
            employee_id: 'EXC-001',
            display_name: 'Boss Dols',
            email: 'b0s5ls.do1s@gmail.com',
            role: 'Executive',
            department: 'Executive',
            position: 'CEO'
        }
    ]
};


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const loggedInEmail = searchParams.get('email');

        console.log('📝 employees API called');
        console.log('📝 Role:', role);
        console.log('📝 Logged in email:', loggedInEmail);

        if (!role) {
            return NextResponse.json(
                { message: 'Role parameter is required' },
                { status: 400 }
            );
        }

        const employees = HR_DUMMY_DATA[role as keyof typeof HR_DUMMY_DATA] || [];

        let rememberedEmails: string[] = [];
        let activeEmails: string[] = [];

        // Check if the logged-in user has a remembered session
        if (loggedInEmail) {
            try {
                console.log('🔍 Checking session for email:', loggedInEmail);
                const { data: sessions, error } = await supabase
                    .from('sessions')
                    .select('email, remember_me, expires_at, is_active')
                    .eq('email', loggedInEmail)
                    .maybeSingle();

                if (!error && sessions) {
                    // Check if active
                    if (sessions.is_active && new Date(sessions.expires_at) > new Date()) {
                        activeEmails = [sessions.email];
                        console.log('✅ Found active session for:', sessions.email);
                    }

                    // Check if remembered
                    if (sessions.remember_me && new Date(sessions.expires_at) > new Date()) {
                        rememberedEmails = [sessions.email];
                        console.log('✅ Found remembered email:', sessions.email);
                    }
                } else {
                    console.log('⚠️ No session found for:', loggedInEmail);
                }
            } catch (error) {
                console.error('Error checking session:', error);
            }
        }

        const employeesWithStatus = employees.map(emp => ({
            ...emp,
            remembered: rememberedEmails.includes(emp.email),
            is_active: activeEmails.includes(emp.email) // 🔥 Add is_active flag
        }));

        console.log('📤 Returning employees:', employeesWithStatus.map(e => ({
            name: e.display_name,
            remembered: e.remembered,
            is_active: e.is_active
        })));

        return NextResponse.json(employeesWithStatus);
    } catch (error) {
        console.error('Error fetching employees from HR:', error);
        return NextResponse.json(
            { message: 'Failed to fetch employees from HR system' },
            { status: 500 }
        );
    }
}