import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        let sessionToken = request.headers.get('x-session-token');
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';

        // Try to get session token from request body if not in header
        if (!sessionToken) {
            try {
                const body = await request.json();
                sessionToken = body.session_token;
            } catch (e) {
                // No body or invalid JSON
            }
        }

        if (!sessionToken) {
            return NextResponse.json(
                { message: 'No session found' },
                { status: 400 }
            );
        }

        // Get session
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .select('*')
            .eq('session_token', sessionToken)
            .single();

        if (sessionError || !session) {
            return NextResponse.json(
                { message: 'Session not found' },
                { status: 404 }
            );
        }

        // Deactivate session (keep it in DB for future reuse)
        const { error: updateError } = await supabase
            .from('sessions')
            .update({
                is_active: false,
                // Update the user_agent with the current one for logging purposes
                user_agent: userAgent,
            })
            .eq('id', session.id);

        if (updateError) {
            console.error('Failed to deactivate session:', updateError);
            return NextResponse.json(
                { message: 'Failed to logout' },
                { status: 500 }
            );
        }

        // Log logout activity
        try {
            await supabase
                .from('user_activity')
                .insert({
                    user_id: session.user_id,
                    action: 'LOGOUT',
                    module: 'Authentication',
                    description: `User logged out${session.hr_employee_name ? ` (${session.hr_employee_name})` : ''}`,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                });
        } catch (activityError) {
            // Log the error but don't fail the logout
            console.error('Activity log error (non-critical):', activityError);
        }

        return NextResponse.json({
            message: 'Logged out successfully',
            session_id: session.id,
            deactivated: true,
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { message: 'Failed to logout' },
            { status: 500 }
        );
    }
}

// Also support OPTIONS for preflight
export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}