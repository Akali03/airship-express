// app/(supplyChain)/procurement/confirm/route.ts

import { NextRequest } from "next/server";
import { supabase } from "@/app/(supplyChain)/lib/services/client/supabase";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const po = searchParams.get('po');

    if (!po) {
        return new Response('Missing PO number', { status: 400 });
    }

    // Update the PO status to 'Confirmed'
    const { error } = await supabase
        .from('purchase_orders')
        .update({ status: 'Confirmed', updated_at: new Date().toISOString() })
        .eq('po_number', po);

    if (error) {
        console.error('Error confirming PO:', error);
        return new Response('Failed to confirm PO', { status: 500 });
    }

    return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>PO Confirmed</title>
            <style>
                body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
                .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
                .check { color: #22c55e; font-size: 48px; }
                h1 { margin: 16px 0 8px; color: #1e293b; }
                p { color: #64748b; margin: 8px 0; }
                .po { font-weight: bold; color: #0f172a; background: #f1f5f9; padding: 4px 12px; border-radius: 8px; display: inline-block; margin: 8px 0; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="check">✅</div>
                <h1>Purchase Order Confirmed!</h1>
                <p>PO Number: <span class="po">${po}</span></p>
                <p>Status has been updated to <strong>Confirmed</strong>.</p>
                <p style="margin-top: 20px; font-size: 14px; color: #94a3b8;">Thank you for confirming this order.</p>
            </div>
        </body>
        </html>
    `, {
        headers: { 'Content-Type': 'text/html' },
    });
}