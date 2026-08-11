import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const sessionToken = request.headers.get('x-session-token');
        const currentUserAgent = request.headers.get('user-agent') || '';

        console.log('🔍 check-remembered-session called');
        console.log('📝 Session token:', sessionToken);
        console.log('📱 User-Agent:', currentUserAgent);

        if (!sessionToken) {
            return NextResponse.json(
                { remembered: false, message: 'No session token' },
                { status: 401 }
            );
        }

        // First, try to find the session by session_token WITHOUT the join
        const { data: session, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('session_token', sessionToken)
            .maybeSingle();

        if (error) {
            console.error('❌ Database error:', error);
            return NextResponse.json(
                { remembered: false, message: 'Database error: ' + error.message },
                { status: 500 }
            );
        }

        if (!session) {
            console.log('❌ Session not found');
            return NextResponse.json(
                { remembered: false, message: 'Session not found' },
                { status: 401 }
            );
        }

        console.log('✅ Session found:', {
            id: session.id,
            email: session.email,
            remember_me: session.remember_me,
            is_active: session.is_active,
            expires_at: session.expires_at,
            user_id: session.user_id
        });

        // Check if expired
        if (new Date(session.expires_at) < new Date()) {
            console.log('❌ Session expired');
            await supabase
                .from('sessions')
                .update({ is_active: false })
                .eq('id', session.id);

            return NextResponse.json(
                { remembered: false, message: 'Session expired' },
                { status: 401 }
            );
        }

        // Check if remembered
        if (!session.remember_me) {
            console.log('❌ Not a remembered session');
            return NextResponse.json(
                { remembered: false, message: 'Not remembered' },
                { status: 401 }
            );
        }

        // Get user info separately (without join to avoid errors)
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, display_name, email, role')
            .eq('id', session.user_id)
            .maybeSingle();

        if (userError) {
            console.error('❌ User fetch error:', userError);
            // Use session data as fallback
            return NextResponse.json({
                remembered: true,
                differentDevice: false,
                session: {
                    email: session.email,
                    hr_employee_name: session.hr_employee_name,
                    expires_at: session.expires_at,
                },
                user: {
                    id: session.user_id,
                    display_name: 'User',
                    email: session.email,
                    role: 'Employee',
                }
            });
        }

        // Check device
        const storedUserAgent = session.user_agent || '';
        const isSameDevice = storedUserAgent === currentUserAgent;
        console.log('📱 Same device?', isSameDevice);

        if (!isSameDevice) {
            console.log('⚠️ Different device detected');
            return NextResponse.json({
                remembered: true,
                differentDevice: true,
                session: {
                    email: session.email,
                    hr_employee_name: session.hr_employee_name,
                    expires_at: session.expires_at,
                },
                user: {
                    id: userData?.id || session.user_id,
                    display_name: userData?.display_name || 'User',
                    email: userData?.email || session.email,
                    role: userData?.role || 'Employee',
                }
            });
        }

        // Reactivate if inactive
        if (!session.is_active) {
            console.log('🔄 Reactivating session...');
            await supabase
                .from('sessions')
                .update({
                    is_active: true,
                    user_agent: currentUserAgent
                })
                .eq('id', session.id);
        }

        console.log('✅ Session is valid and remembered!');

        return NextResponse.json({
            remembered: true,
            differentDevice: false,
            session: {
                email: session.email,
                hr_employee_name: session.hr_employee_name,
                expires_at: session.expires_at,
            },
            user: {
                id: userData?.id || session.user_id,
                display_name: userData?.display_name || 'User',
                email: userData?.email || session.email,
                role: userData?.role || 'Employee',
            }
        });
    } catch (error) {
        console.error('❌ Error checking remembered session:', error);
        return NextResponse.json(
            { remembered: false, message: 'Server error: ' + (error as Error).message },
            { status: 500 }
        );
    }
}