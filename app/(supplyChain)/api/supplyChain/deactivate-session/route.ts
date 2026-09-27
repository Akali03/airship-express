import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPPLYCHAIN_SUPABASE_URL || '';
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPPLYCHAIN_SUPABASE_SERVICE_ROLE_KEY || 
                       process.env.SUPPLYCHAIN_SUPABASE_SERVICE_ROLE_KEY || 
                       process.env.NEXT_PUBLIC_SUPPLYCHAIN_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

export async function POST(request: Request) {
    try {
        let sessionToken = request.headers.get('x-session-token');
        let body: any = {};
        try {
            body = await request.json();
            if (!sessionToken && (body?.sessionToken || body?.session_token)) {
                sessionToken = body.sessionToken || body.session_token;
            }
        } catch (e) {
            // ignore
        }

        if (!sessionToken) {
            return NextResponse.json({ ok: false, message: 'No session token' }, { status: 400 });
        }

        await supabaseAdmin
            .from('sessions')
            .update({
                is_active: false,
                updated_at: new Date().toISOString()
            })
            .eq('session_token', sessionToken);

        return NextResponse.json({ ok: true, message: 'Session deactivated' });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}