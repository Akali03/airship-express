import "server-only";
import { NextResponse } from "next/server";
import { scanReceipt } from "../../../../../backend/services/receiptOcr.js";
import { hasPermission } from "../../../lib/permissions";
import { authenticateFtmRequest } from "../../../lib/server/ftmRequestAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await authenticateFtmRequest(request);
  if (!("context" in auth)) return auth.response;
  if (!hasPermission(auth.context.user.role, "costAnalysis", "create")) {
    return NextResponse.json({ error: "Permission denied: costAnalysis.create" }, { status: 403 });
  }
  let body: { photo_base64?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "A valid JSON request body is required." }, { status: 400 });
  }
  if (!body.photo_base64) return NextResponse.json({ error: "photo_base64 is required" }, { status: 400 });
  try {
    return NextResponse.json(await scanReceipt(body.photo_base64));
  } catch (error) {
    return NextResponse.json({ ok: false, reason: "ocr_failed", details: error instanceof Error ? error.message : "OCR processing failed" }, { status: 500 });
  }
}