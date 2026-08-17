// app/(supplyChain)/api/supplier/confirm/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/(supplyChain)/lib/services/client/supabase';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const po = searchParams.get('po');

        if (!po) {
            return NextResponse.json(
                { error: 'PO number is required' },
                { status: 400 }
            );
        }

        // Update the purchase order status to 'Confirmed'
        const { data, error } = await supabase
            .from('purchase_orders')
            .update({
                status: 'Confirmed',
                updated_at: new Date().toISOString(),
                confirmed_at: new Date().toISOString()
            })
            .eq('po_number', po)
            .select()
            .single();

        if (error) {
            console.error('Error confirming PO:', error);
            return NextResponse.json(
                { error: 'Failed to confirm purchase order' },
                { status: 500 }
            );
        }

        // Return a success page
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>PO Confirmed</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0fdf4; }
                    .container { text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; }
                    .icon { font-size: 64px; color: #22c55e; }
                    h1 { color: #166534; }
                    p { color: #4b5563; line-height: 1.6; }
                    .button { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #EC4899; color: white; text-decoration: none; border-radius: 6px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">✅</div>
                    <h1>Purchase Order Confirmed!</h1>
                    <p>PO #${po} has been successfully confirmed.</p>
                    <p>The procurement team has been notified.</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/procurement" class="button">Return to Dashboard</a>
                </div>
            </body>
            </html>
        `, {
            headers: {
                'Content-Type': 'text/html',
            },
        });

    } catch (error) {
        console.error('Error confirming PO:', error);
        return NextResponse.json(
            { error: 'Failed to confirm purchase order' },
            { status: 500 }
        );
    }
}