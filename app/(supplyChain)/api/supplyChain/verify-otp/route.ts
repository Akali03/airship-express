// app/(supplyChain)/api/supplyChain/verify-otp/route.ts

import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

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

function generateTemporaryToken(): string {
    return randomBytes(16).toString('hex');
}

function hashOTP(otp: string): string {
    return createHash('sha256').update(otp).digest('hex');
}

export async function POST(request: Request) {
    try {
        const {
            userId,
            otp,
            targetUserId,
            rememberMe,
            email,
            employeeName,
            employeeRole
        } = await request.json();

        if (!/^\d{6}$/.test(otp)) {
            return NextResponse.json(
                { message: 'OTP must be 6 digits' },
                { status: 400 }
            );
        }

        const hashedInputOTP = hashOTP(otp);

        // get latest valid otp
        const { data: otpRecords, error: otpError } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('user_id', userId)
            .is('used_at', null)
            .gte('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (otpError || !otpRecords || otpRecords.length === 0) {
            return NextResponse.json(
                { message: 'No valid OTP found' },
                { status: 400 }
            );
        }

        const otpRecord = otpRecords[0];

        if (otpRecord.attempts >= 5) {
            return NextResponse.json(
                { message: 'Too many failed attempts' },
                { status: 400 }
            );
        }

        const isValid = otpRecord.code_hash === hashedInputOTP;

        if (!isValid) {
            await supabase
                .from('otp_codes')
                .update({ attempts: (otpRecord.attempts || 0) + 1 })
                .eq('id', otpRecord.id);

            return NextResponse.json(
                { message: 'Invalid OTP code' },
                { status: 400 }
            );
        }

        // mark otp as used
        await supabase
            .from('otp_codes')
            .update({ used_at: new Date().toISOString() })
            .eq('id', otpRecord.id);

        // check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id, email, role, display_name')
            .eq('email', email)
            .maybeSingle();

        // get hr data for password check
        let hrData = null;
        for (const roleData of Object.values(HR_DUMMY_DATA)) {
            const found = roleData.find(emp => emp.email === email);
            if (found) {
                hrData = found;
                break;
            }
        }

        // get client info
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'Unknown';
        const userAgent = request.headers.get('user-agent') || 'Unknown';

        // determine session expiry
        const expiresAt = rememberMe
            ? new Date(Date.now() + 15 * 24 * 3600000)
            : new Date(Date.now() + 8 * 3600000);

        if (existingUser) {
            const sessionToken = randomBytes(32).toString('hex');

            // deactivate existing sessions
            await supabase
                .from('sessions')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', existingUser.id)
                .eq('is_active', true);

            const { data: existingSession } = await supabase
                .from('sessions')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            if (existingSession) {
                const { error: updateError } = await supabase
                    .from('sessions')
                    .update({
                        session_token: sessionToken,
                        expires_at: expiresAt.toISOString(),
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        is_active: true,
                        remember_me: rememberMe || false,
                        hr_employee_name: existingUser.display_name,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existingSession.id);

                if (updateError) {
                    return NextResponse.json(
                        { message: 'Failed to update session' },
                        { status: 500 }
                    );
                }

            } else {
                const { error: insertError } = await supabase
                    .from('sessions')
                    .insert({
                        user_id: existingUser.id,
                        session_token: sessionToken,
                        expires_at: expiresAt.toISOString(),
                        email: email,
                        hr_employee_name: existingUser.display_name,
                        is_active: true,
                        remember_me: rememberMe || false,
                        user_agent: userAgent,
                        ip_address: ipAddress,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });

                if (insertError) {
                    return NextResponse.json(
                        { message: 'Failed to create session' },
                        { status: 500 }
                    );
                }

            }

            const roleRedirects: Record<string, string> = {
                'Admin': '/executive',
                'Manager': '/warehousing?tab=incoming',
                'Employee': '/documents',
                'Operator': '/warehousing?tab=incoming',
                'Executive': '/executive'
            };

            return NextResponse.json({
                verified: true,
                userExists: true,
                userId: existingUser.id,
                session_token: sessionToken,
                redirect_url: roleRedirects[existingUser.role] || '/documents',
                role: existingUser.role,
                employee: {
                    email: email,
                    display_name: existingUser.display_name,
                    role: existingUser.role
                }
            });
        } else {
            // user doesn't exist - return temp token for password setup
            const tempToken = generateTemporaryToken();

            return NextResponse.json({
                verified: true,
                userExists: false,
                tempToken: tempToken,
                hrHasPassword: !!hrData?.password_hash,
                hrPassword: hrData?.password_hash || null,
                employee: {
                    id: targetUserId,
                    email: email,
                    display_name: employeeName || 'User',
                    role: employeeRole || 'Employee',
                    employee_id: hrData?.employee_id || null,
                    department: hrData?.department || null,
                    position: hrData?.position || null,
                }
            });
        }
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}