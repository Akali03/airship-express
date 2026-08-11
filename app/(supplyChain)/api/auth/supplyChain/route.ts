import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // 🔥 First, sign out any existing session
        await supabase.auth.signOut();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Then sign in
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !authData.user) {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        console.log('🔍 Auth user ID:', authData.user.id);
        console.log('🔍 Auth user email:', authData.user.email);

        // Get user from users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, display_name, role, department, status')
            .eq('id', authData.user.id)
            .single();

        if (userError || !userData) {
            console.error('User not found in DB:', userError);
            return NextResponse.json(
                { message: 'User not found in system' },
                { status: 404 }
            );
        }

        console.log('✅ User from DB:', {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            display_name: userData.display_name
        });

        if (userData.status !== 'Active') {
            return NextResponse.json(
                { message: 'Your account is inactive. Please contact HR.' },
                { status: 403 }
            );
        }

        // Log login attempt
        await supabase
            .from('user_activity')
            .insert({
                user_id: userData.id,
                action: 'LOGIN_ATTEMPT',
                module: 'Authentication',
                description: `User ${userData.email} logged in with password`,
                ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
                user_agent: request.headers.get('user-agent'),
            });

        return NextResponse.json({
            user: {
                id: userData.id,
                email: userData.email,
                display_name: userData.display_name,
                role: userData.role,
                department: userData.department,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}