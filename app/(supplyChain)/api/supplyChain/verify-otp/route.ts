import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

function generateSessionToken(): string {
    return randomBytes(32).toString('hex');
}

function hashOTP(otp: string): string {
    return createHash('sha256').update(otp).digest('hex');
}

export async function POST(request: Request) {
    try {
        const { userId, otp, targetUserId, rememberMe, email, employeeName } = await request.json();

        console.log('🔐 Verifying OTP:', { userId, targetUserId, rememberMe, email, employeeName });

        if (!userId || !otp || !targetUserId || !email) {
            return NextResponse.json(
                { message: 'User ID, OTP, target user, and email are required' },
                { status: 400 }
            );
        }

        // 🔥 VALIDATE OTP FORMAT (6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return NextResponse.json(
                { message: 'OTP must be 6 digits' },
                { status: 400 }
            );
        }

        const hashedInputOTP = hashOTP(otp);

        // Get latest OTP for the user
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
                { message: 'No valid OTP found. Please request a new one.' },
                { status: 400 }
            );
        }

        const otpRecord = otpRecords[0];

        // Check attempts
        if (otpRecord.attempts >= 5) {
            return NextResponse.json(
                { message: 'Too many failed attempts. Please request a new OTP.' },
                { status: 400 }
            );
        }

        // Verify OTP
        const isValid = otpRecord.code_hash === hashedInputOTP;

        if (!isValid) {
            // Increment attempts
            await supabase
                .from('otp_codes')
                .update({ attempts: (otpRecord.attempts || 0) + 1 })
                .eq('id', otpRecord.id);

            const remainingAttempts = 5 - (otpRecord.attempts + 1);
            return NextResponse.json(
                {
                    message: `Invalid OTP code. ${remainingAttempts} attempts remaining.`
                },
                { status: 400 }
            );
        }

        // Mark OTP as used
        await supabase
            .from('otp_codes')
            .update({ used_at: new Date().toISOString() })
            .eq('id', otpRecord.id);

        // Get the logged-in user
        const { data: loggedInUser, error: loggedInError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (loggedInError || !loggedInUser) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Get device info
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            request.headers.get('cf-connecting-ip') ||
            'Unknown';

        console.log('📱 User Agent:', userAgent);
        console.log('🌐 IP Address:', ipAddress);

        const sessionExpiresAt = rememberMe
            ? new Date(Date.now() + 15 * 24 * 3600000)
            : new Date(Date.now() + 8 * 3600000);

        const sessionToken = generateSessionToken();

        // Check if session exists for this email
        const { data: existingSession } = await supabase
            .from('sessions')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        let session;

        if (existingSession) {
            // UPDATE existing session with new device info
            console.log(`🔄 Updating existing session for ${email}`);

            const { data: updated, error: updateError } = await supabase
                .from('sessions')
                .update({
                    session_token: sessionToken,
                    expires_at: sessionExpiresAt.toISOString(),
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    is_active: true,
                    remember_me: rememberMe || false,
                    hr_employee_name: employeeName || 'HR Employee',
                })
                .eq('id', existingSession.id)
                .select()
                .single();

            if (updateError) {
                console.error('Session update error:', updateError);
                return NextResponse.json(
                    { message: 'Failed to update session' },
                    { status: 500 }
                );
            }

            session = updated;
        } else {
            // CREATE new session
            console.log(`🆕 Creating new session for ${email}`);

            const { data: created, error: createError } = await supabase
                .from('sessions')
                .insert({
                    user_id: userId,
                    session_token: sessionToken,
                    expires_at: sessionExpiresAt.toISOString(),
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    is_active: true,
                    email: email,
                    hr_employee_name: employeeName || 'HR Employee',
                    remember_me: rememberMe || false,
                })
                .select()
                .single();

            if (createError) {
                console.error('Session creation error:', createError);
                return NextResponse.json(
                    { message: 'Failed to create session' },
                    { status: 500 }
                );
            }

            session = created;
        }

        // Update last_login in users table
        await supabase
            .from('users')
            .update({
                last_login: new Date().toISOString(),
            })
            .eq('id', userId);

        // Log activity
        await supabase
            .from('user_activity')
            .insert({
                user_id: userId,
                action: 'LOGIN',
                module: 'Authentication',
                description: `User logged in as ${employeeName} (${email}) ${rememberMe ? '🔒 15 days' : '⏱️ 8 hours'}`,
                ip_address: ipAddress,
                user_agent: userAgent,
            });

        // Get user role
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        const role = userData?.role || 'Employee';

        const roleRedirects: Record<string, string> = {
            'Admin': '/executive',
            'Manager': '/warehousing?tab=incoming',
            'Employee': '/documents',
            'Operator': '/warehousing?tab=incoming',
            'Executive': '/executive'
        };

        return NextResponse.json({
            session_token: sessionToken,
            role: role,
            redirect_url: roleRedirects[role] || '/documents',
            remember_me: rememberMe || false,
            expires_at: sessionExpiresAt.toISOString(),
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json(
            { message: 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}