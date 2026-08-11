import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { NextResponse } from 'next/server';

const VALID_ROLES = ['Admin', 'Manager', 'Employee', 'Executive', 'Operator'];

export async function GET(request: Request) {
    try {
        const sessionToken = request.headers.get('x-session-token');
        const currentUserAgent = request.headers.get('user-agent') || '';

        console.log('🔍 Validating session...');
        console.log('📝 Session token:', sessionToken);
        console.log('📱 User-Agent:', currentUserAgent);

        if (!sessionToken) {
            return NextResponse.json(
                { valid: false },
                { status: 401 }
            );
        }

        // Get session from database
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .select('*')
            .eq('session_token', sessionToken)
            .eq('is_active', true)
            .maybeSingle();

        if (sessionError || !session) {
            console.log('❌ Session not found or inactive');
            return NextResponse.json(
                { valid: false },
                { status: 401 }
            );
        }

        console.log('✅ Session found:', {
            id: session.id,
            email: session.email,
            is_active: session.is_active,
            expires_at: session.expires_at,
            user_id: session.user_id
        });

        // Check if session is expired
        if (new Date(session.expires_at) < new Date()) {
            console.log('❌ Session expired');
            await supabase
                .from('sessions')
                .update({ is_active: false })
                .eq('id', session.id);

            return NextResponse.json(
                { valid: false, session_cleared: true },
                { status: 401 }
            );
        }

        // Get user with role
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, display_name, email, role, department')
            .eq('id', session.user_id)
            .maybeSingle();

        if (userError || !user) {
            console.error('❌ User not found:', userError);
            return NextResponse.json(
                { valid: false, session_cleared: true },
                { status: 401 }
            );
        }

        // 🔥 Validate role
        if (!user.role || !VALID_ROLES.includes(user.role)) {
            console.log('❌ Invalid or missing role:', user.role);
            // Deactivate the session
            await supabase
                .from('sessions')
                .update({ is_active: false })
                .eq('id', session.id);

            return NextResponse.json(
                { valid: false, session_cleared: true, invalid_role: true },
                { status: 401 }
            );
        }

        console.log('👤 User role from DB:', user.role);

        // CHECK USER_AGENT
        const storedUserAgent = session.user_agent || '';
        const isSameDevice = storedUserAgent === currentUserAgent;
        console.log('🔍 Same device?', isSameDevice);

        if (!isSameDevice) {
            console.log('❌ Different device detected - invalidating session');
            await supabase
                .from('sessions')
                .update({ is_active: false })
                .eq('id', session.id);

            await supabase
                .from('user_activity')
                .insert({
                    user_id: session.user_id,
                    action: 'DEVICE_MISMATCH',
                    module: 'Authentication',
                    description: `Session invalidated due to device mismatch. Stored: ${storedUserAgent}, Current: ${currentUserAgent}`,
                    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
                    user_agent: currentUserAgent,
                });

            return NextResponse.json(
                { valid: false, message: 'Different device detected', session_cleared: true },
                { status: 401 }
            );
        }

        console.log('✅ Session valid!');
        return NextResponse.json({
            valid: true,
            user: {
                id: user.id,
                display_name: user.display_name,
                email: user.email,
                role: user.role,
                department: user.department,
            }
        });
    } catch (error) {
        console.error('Session validation error:', error);
        return NextResponse.json(
            { valid: false, session_cleared: true },
            { status: 500 }
        );
    }
}