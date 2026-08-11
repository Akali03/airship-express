import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { NextResponse } from 'next/server';

// handles the "remember me" login flow - activates a stored session
export async function POST(request: Request) {
    try {
        const { session_token, user_agent } = await request.json();

        console.log('🔍 Activating session:', session_token);
        console.log('📱 User Agent:', user_agent);

        if (!session_token) {
            return NextResponse.json(
                { message: 'Session token is required' },
                { status: 400 }
            );
        }

        // grab the user's ip address
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            request.headers.get('cf-connecting-ip') ||
            'Unknown';

        // look up the session in the database
        const { data: session, error: findError } = await supabase
            .from('sessions')
            .select('*')
            .eq('session_token', session_token)
            .maybeSingle();

        if (findError || !session) {
            console.error('❌ Session not found:', findError);
            return NextResponse.json(
                { message: 'Session not found' },
                { status: 404 }
            );
        }

        console.log('✅ Session found:', {
            id: session.id,
            email: session.email,
            is_active: session.is_active
        });

        // activate the session and update device info
        const { data: updated, error: updateError } = await supabase
            .from('sessions')
            .update({
                is_active: true,
                user_agent: user_agent || session.user_agent,
                ip_address: ipAddress || session.ip_address,
                // extend the session by another 15 days
                expires_at: new Date(Date.now() + 15 * 24 * 3600000).toISOString(),
            })
            .eq('id', session.id)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Failed to update session:', updateError);
            return NextResponse.json(
                { message: 'Failed to activate session' },
                { status: 500 }
            );
        }

        console.log('✅ Session activated successfully:', {
            id: updated.id,
            email: updated.email,
            is_active: updated.is_active,
            expires_at: updated.expires_at
        });

        // log what happened
        await supabase
            .from('user_activity')
            .insert({
                user_id: session.user_id,
                action: 'SESSION_ACTIVATED',
                module: 'Authentication',
                description: `Session activated via "Login (Remembered)" for ${session.email}`,
                ip_address: ipAddress,
                user_agent: user_agent || session.user_agent,
            });

        return NextResponse.json({
            success: true,
            message: 'Session activated successfully',
            session: {
                id: updated.id,
                email: updated.email,
                is_active: updated.is_active,
                expires_at: updated.expires_at
            }
        });
    } catch (error) {
        console.error('❌ Error activating session:', error);
        return NextResponse.json(
            { message: 'Failed to activate session' },
            { status: 500 }
        );
    }
}