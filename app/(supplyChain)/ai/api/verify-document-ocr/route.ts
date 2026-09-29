import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_SUPPLYCHAIN_API_KEY;
const FALLBACK_MODELS = [
    process.env.GEMINI_SUPPLYCHAIN_MODEL || "gemini-3.5-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-2.5-flash",
];

async function generateWithFallback(genAI: any, contents: any[]) {
    let lastError: any = null;
    for (const model of FALLBACK_MODELS) {
        try {
            const response = await genAI.models.generateContent({
                model,
                contents,
            });
            if (response && response.text) {
                return response;
            }
        } catch (err: any) {
            console.warn(`[verify-document-ocr] Model ${model} failed, trying next fallback:`, err?.message || err);
            lastError = err;
        }
    }
    throw lastError || new Error("All Gemini models unavailable");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            fileBase64,
            fileName = "uploaded_file",
            fileType = "image/png",
            userRole = "Employee",
            userName = "User",
        } = body;

        if (!fileBase64) {
            return NextResponse.json(
                { success: false, error: "No file provided for OCR inspection." },
                { status: 400 }
            );
        }

        // Clean base64 string
        let pureBase64 = fileBase64;
        if (pureBase64.includes(",")) {
            pureBase64 = pureBase64.split(",")[1];
        }

        if (!apiKey) {
            // Fallback if no key configured: allow upload with basic check
            const defaultExtracted = {
                text: null,
                description: `Uploaded document: ${fileName}`,
                visual_objects: [],
                vendor_name: null,
                po_number: null,
                price: null,
                summary: "AI validation bypassed: API key not configured.",
                document_type: "Standard Document",
                category: "documents",
                confidence_score: 90,
                extracted_at: new Date().toISOString(),
            };

            return NextResponse.json({
                success: true,
                is_valid_system_doc: true,
                detected_type: "Standard Document",
                detected_category: "documents",
                extracted_title: fileName.replace(/\.[^/.]+$/, ""),
                extracted_price: null,
                extracted_supplier: null,
                extracted_po_number: null,
                extracted_text: null,
                photo_description: defaultExtracted.description,
                visual_objects: [],
                rejection_reason: null,
                summary: defaultExtracted.summary,
                extracted: defaultExtracted,
            });
        }

        const genAI = new GoogleGenAI({ apiKey });

        const promptText = `
You are the Chief OCR & Compliance Intelligence Officer for Airship Express (a courier, logistics, and supply chain management enterprise).
Your strict task is to inspect the attached document or image named "${fileName}" and determine if it represents a VALID supply chain/company operational document or photo, OR if it is UNRELATED out-of-scope media (such as an anime character like Itachi, cartoon, video game screenshot, internet meme, personal selfie, or random unrelated photo).

VALID Supply Chain & Company Assets include:
- Financial & Commercial documents: Official Receipts, Invoices, Delivery Receipts, Purchase Orders, Bills of Lading, Manifests, Quotations, Vendor Contracts, Tax Certificates, Customs Declarations.
- Logistics & Operational media: Parcel photos, Damaged package condition, Courier handover, Barcode/Tracking labels, Packaging, Warehouse storage/racks, Fleet vehicles/trucks/vans, Vehicle maintenance, Official badges/IDs, Workplace equipment.

INVALID / OUT-OF-SCOPE Media include:
- Anime, manga, cartoon illustrations (e.g. Itachi Uchiha, Naruto, Dragon Ball, superheroes, fictional drawings).
- Gaming screenshots, fantasy graphics, video game characters.
- Personal selfies, casual vacation photos, food/cooking recipes with no company relation.
- Internet memes, jokes, unrelated viral images.

Perform detailed OCR and visual inspection (like Google Lens):
Extract and describe:
1. "is_valid_system_doc": boolean (true if valid supply chain/business/logistics document or photo; false if anime, meme, selfie, or unrelated graphic).
2. "detected_type": Specific name of what is depicted (e.g., "Official Receipt", "Tax Invoice", "Delivery Receipt", "Parcel Condition Photo", "Warehouse Facility Photo", "Fleet Vehicle Photo", "Merchandise / Item Photo", "Equipment Photo").
3. "confidence_score": 0 to 100 percentage.
4. "detected_category": "documents" | "photos" | "unrelated".
5. "extracted_text": Comprehensive OCR transcription of ALL legible text, table items, totals, dates, reference codes, tracking numbers, and labels visible in the document or image. If there is NO visible text or minimal text (just a pure photo), return null or empty string.
6. "photo_description": A rich, comprehensive visual description of the photo/image. IMPORTANT: If there is no text or this is just a picture, thoroughly describe the photo: subjects, items, packaging, parcel condition, machinery, warehouse setting, vehicles, equipment, colors, and layout in detail (like Google Lens visual indexing). If text is present, also provide a concise visual description of what the document looks like.
7. "visual_objects": An array of 3-10 distinct physical objects, items, tools, equipment, or materials recognized in the picture (e.g. ["cardboard box", "wooden pallet", "barcode sticker", "delivery van", "steel rack", "receipt paper"]).
8. "extracted_title": Clean recommended title for the document (e.g., "Official Receipt - ABC Logistics" or "Warehouse Pallet Storage Photo").
9. "extracted_price": Formatted currency amount (e.g., "₱1,250.00" or "1250.00") if a financial amount/total is visible, or null.
10. "extracted_supplier": Merchant, vendor, or supplier name if visible, or null.
11. "extracted_po_number": PO or tracking reference number (e.g., "PO-2026-0031" or "TRK123456") if visible, or null.
12. "rejection_reason": If invalid, write a clear, polite 1-2 sentence explanation of why this file is rejected. If valid, return null.
13. "summary": A clear 1-2 sentence summary of what this document or photo depicts.

Return ONLY a valid JSON object without markdown formatting, code fences, or backticks:
{
  "is_valid_system_doc": true,
  "detected_type": "Official Receipt",
  "confidence_score": 95,
  "detected_category": "documents",
  "extracted_text": "Full OCR text extracted from the document...",
  "photo_description": "Detailed visual description of the photo/image content...",
  "visual_objects": ["receipt", "stamp", "table"],
  "extracted_title": "Official Receipt - ABC Logistics",
  "extracted_price": "1,500.00",
  "extracted_supplier": "ABC Logistics Co.",
  "extracted_po_number": null,
  "rejection_reason": null,
  "summary": "Official sales receipt from ABC Logistics Co. with itemized charges."
}
`;

        let mime = fileType;
        if (!mime || mime === "application/octet-stream") {
            mime = "image/png";
        }
        if (mime === "application/pdf") {
            mime = "application/pdf";
        }

        const response = await generateWithFallback(genAI, [
            {
                role: "user",
                parts: [
                    { text: promptText },
                    {
                        inlineData: {
                            data: pureBase64,
                            mimeType: mime.startsWith("image/") ? mime : (mime === "application/pdf" ? "application/pdf" : "image/png"),
                        },
                    },
                ],
            },
        ]);

        const rawText = response.text || "";
        const cleanJsonStr = rawText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        let parsedResult: any;
        try {
            parsedResult = JSON.parse(cleanJsonStr);
        } catch (parseErr) {
            console.warn("Failed to parse Gemini OCR response as JSON:", rawText);
            const isInvalid = /anime|itachi|naruto|meme|cartoon|selfie|gaming/i.test(rawText);
            parsedResult = {
                is_valid_system_doc: !isInvalid,
                detected_type: isInvalid ? "Unrelated Image" : "Document / Photo",
                confidence_score: 80,
                detected_category: isInvalid ? "unrelated" : "documents",
                extracted_title: fileName.replace(/\.[^/.]+$/, ""),
                extracted_price: null,
                extracted_supplier: null,
                extracted_po_number: null,
                extracted_text: null,
                photo_description: rawText.substring(0, 300),
                visual_objects: [],
                rejection_reason: isInvalid ? "The uploaded file does not appear to be a standard supply chain document or warehouse photo." : null,
                summary: rawText.substring(0, 150),
            };
        }

        // Standardized extracted payload for public.documents "extracted" jsonb column
        const extractedPayload = {
            text: parsedResult.extracted_text || null,
            description: parsedResult.photo_description || parsedResult.summary || null,
            visual_objects: Array.isArray(parsedResult.visual_objects) ? parsedResult.visual_objects : [],
            vendor_name: parsedResult.extracted_supplier || null,
            po_number: parsedResult.extracted_po_number || null,
            price: parsedResult.extracted_price || null,
            summary: parsedResult.summary || null,
            document_type: parsedResult.detected_type || "Document",
            category: parsedResult.detected_category || "documents",
            confidence_score: parsedResult.confidence_score || 90,
            extracted_at: new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            ...parsedResult,
            extracted: extractedPayload,
            userRole,
            userName,
        });
    } catch (error: any) {
        console.error("Error in verify-document-ocr route:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to inspect document with Gemini OCR.",
                is_valid_system_doc: true, // Fail-open gracefully on internal server error
            },
            { status: 500 }
        );
    }
}

