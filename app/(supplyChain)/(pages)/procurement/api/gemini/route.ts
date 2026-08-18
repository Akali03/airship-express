    // app/(supplyChain)/procurement/api/gemini/route.ts

    import { NextRequest, NextResponse } from "next/server";
    import { GoogleGenAI } from "@google/genai";

    const apiKey = process.env.GEMINI_API_KEY;
    const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

    export async function POST(request: NextRequest) {
        try {
            const body = await request.json();
            const { supplier_name, items, total_amount, delivery_date, po_number, notes } = body;

            if (!supplier_name || !items || items.length === 0) {
                return NextResponse.json(
                    { error: "Supplier name and items are required" },
                    { status: 400 }
                );
            }

            const genAI = new GoogleGenAI({ apiKey });

            const prompt = `
    You are a procurement assistant generating a professional purchase order message.

    **Supplier:** ${supplier_name}
    **Items:**
    ${items.map((item: any) => `- ${item.name}: ${item.quantity} x ₱${item.unit_price || 0} = ₱${(item.quantity * (item.unit_price || 0)).toLocaleString()}`).join('\n')}
    **Total Amount:** ₱${total_amount.toLocaleString()}
    **PO Number:** ${po_number || 'TBD'}
    **Delivery Date:** ${delivery_date || 'TBD'}
    **Notes:** ${notes || 'None'}

    Generate a concise, professional, and friendly email to a supplier regarding a purchase order.

    Use the following information:

    * Supplier: [Supplier Name]
    * Items ordered: [Item 1 – Quantity, Item 2 – Quantity, etc.]
    * Total amount: [Total Amount]
    * Expected delivery date: [Delivery Date]
    * Additional notes: [Optional Notes]

    The email should:

    1. Begin with a polite and professional greeting.
    2. Clearly state that the message is regarding the purchase order.
    3. Present the ordered items and quantities in an easy-to-read format.
    4. Clearly mention the total order amount.
    5. State the expected delivery date.
    6. Politely request the supplier to confirm receipt of the order and the availability/delivery schedule.
    7. End with a professional and friendly closing.

    Keep the message concise and natural. Use a professional but approachable tone suitable for a business-to-business supplier communication.

    Do not invent or assume any missing information. If a field is not provided, omit it rather than creating details.

    Output only the final email in plain text. Do not use Markdown, bullet points, tables, emojis, or explanations.`;


            const response = await genAI.interactions.create({
                model: MODEL_NAME,
                input: prompt,
            });

            const message = response.output_text || '';

            return NextResponse.json({
                success: true,
                message: message,
            });

        } catch (error) {
            console.error('❌ Gemini API Error:', error);
            return NextResponse.json(
                { error: "Failed to generate message" },
                { status: 500 }
            );
        }
    }