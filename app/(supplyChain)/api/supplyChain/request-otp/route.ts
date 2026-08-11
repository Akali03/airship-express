import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { sendOTPEmail } from '@/app/(supplyChain)/lib/email/sendOTP';

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(otp: string): string {
    return createHash('sha256').update(otp).digest('hex');
}

export async function POST(request: Request) {
    try {
        const { userId, email, loggedInUserId, employeeName } = await request.json();

        console.log(`📝 Request OTP for HR user: ${userId}, email: ${email}`);
        console.log(`📝 Logged in user ID: ${loggedInUserId}`);
        console.log(`📝 Employee Name: ${employeeName}`);

        if (!userId || !email || !loggedInUserId) {
            return NextResponse.json(
                { message: 'User ID, email, and logged in user are required' },
                { status: 400 }
            );
        }

        // 🔥 VALIDATE EMAIL FORMAT
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Check rate limiting (max 3 requests per hour)
        const { count, error: countError } = await supabase
            .from('otp_codes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', loggedInUserId)
            .gte('created_at', new Date(Date.now() - 3600000).toISOString());

        if (countError) {
            console.error('Rate limit check error:', countError);
        }

        if (count && count >= 3) {
            return NextResponse.json(
                { message: 'Too many OTP requests. Please wait an hour.' },
                { status: 429 }
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);
        const expiresAt = new Date(Date.now() + 5 * 60000);

        console.log(`🔑 Generated OTP for ${email}`);

        // Store OTP in database
        const { error: insertError } = await supabase
            .from('otp_codes')
            .insert({
                user_id: loggedInUserId,
                code_hash: hashedOTP,
                expires_at: expiresAt.toISOString(),
                attempts: 0,
                email: email,
                employee_name: employeeName || 'Unknown',
            });

        if (insertError) {
            console.error('OTP insert error:', insertError);
            return NextResponse.json(
                { message: 'Failed to generate OTP' },
                { status: 500 }
            );
        }

        try {
            await sendOTPEmail({
                to: email,
                otp: otp,
                userName: employeeName || 'HR Employee',
                expiresIn: 5,
            });
            console.log(`✅ OTP email sent to ${email}`);
        } catch (emailError: any) {
            console.error('❌ Email sending failed:', emailError.message);
            return NextResponse.json(
                { message: 'Failed to send OTP email. Please check your email address or contact support.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'OTP sent successfully to your email',
            expiresAt: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error('Error requesting OTP:', error);
        return NextResponse.json(
            { message: 'Failed to send OTP. Please try again.' },
            { status: 500 }
        );
    }
}