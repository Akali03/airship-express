"use server";

import { supabaseAdmin } from "@/app/(hr-dashboard)/supabase/admin-client";
import { visionChat } from "../providers";
import { loadKnowledgeServer } from "../knowledge/serverLoader";

export type ReceiptVerdict = {
  ok: true;
  receipt_readable: boolean;
  readability_issue: string | null;
  extracted: {
    merchant: string | null;
    date: string | null;
    amount: number | null;
    currency: string | null;
    items: Array<{ name: string; amount: number }> | null;
    receipt_number: string | null;
    vat_or_tin: string | null;
  };
  mismatches: Array<{
    field: string;
    claimed: string;
    found: string;
    severity: "low" | "medium" | "high";
  }>;
  tamper_signals: string[];
  confidence: number;
  verdict: "approve" | "review" | "reject";
  notes: string;
  provider: string;
  model: string;
};

export type ReceiptVerdictError = { ok: false; error: string };

/**
 * Guards against the model emitting a hardcoded "everything is fine"
 * confidence (commonly 0.95) even when it also flags mismatches, tamper
 * signals, or an unreadable receipt.
 */
function deriveConfidence(parsed: any): number {
  const raw =
    typeof parsed?.confidence === "number" && Number.isFinite(parsed.confidence)
      ? parsed.confidence
      : null;

  if (raw === null) return 0;

  // Normalize: model may return 0-100 instead of 0-1.
  const normalized = raw > 1 ? raw / 100 : raw;
  const clamped = Math.max(0, Math.min(1, normalized));

  const hasMismatch =
    Array.isArray(parsed?.mismatches) && parsed.mismatches.length > 0;
  const hasTamper =
    Array.isArray(parsed?.tamper_signals) && parsed.tamper_signals.length > 0;
  const unreadable = parsed?.receipt_readable === false;

  // Self-contradictory: model says "near certain" while flagging problems.
  if (clamped >= 0.9 && (hasMismatch || hasTamper || unreadable)) {
    console.warn(
      "[verifyReceipt] confidence guard tripped",
      JSON.stringify({
        rawConfidence: clamped,
        hasMismatch,
        hasTamper,
        unreadable,
        verdict: parsed?.verdict,
      })
    );
    // Cap at 0.79 — matches "one low/medium mismatch" band.
    return Math.min(clamped, 0.79);
  }

  // Hard cap if unreadable, regardless of model's claim.
  if (unreadable) return Math.min(clamped, 0.39);

  return clamped;
}

export async function verifyReceipt(opts: {
  employeeId: string;
  imageBase64: string;
  mimeType: string;
  claimedAmount: number;
  claimedDescription: string;
  claimedClaimType: string;
  verifiedByAdminId: string;
}): Promise<ReceiptVerdict | ReceiptVerdictError> {
  try {
    const systemPrompt = loadKnowledgeServer("receipt-verifier");
    if (!systemPrompt) {
      return { ok: false, error: "Receipt verifier knowledge missing." };
    }

    const userPrompt =
      systemPrompt +
      `\n\n---\nCLAIMED DATA\n` +
      `amount: ${opts.claimedAmount}\n` +
      `description: ${opts.claimedDescription || "(empty)"}\n` +
      `claim_type: ${opts.claimedClaimType}\n`;

    const res = await visionChat({
      prompt: userPrompt,
      imageBase64: opts.imageBase64,
      mimeType: opts.mimeType,
      maxTokens: 900,
    });

    // ---- TEMP: confirm what the model actually returns, then delete ----
    console.log(
      "[verifyReceipt] provider=%s model=%s raw=%s",
      res.provider,
      res.model,
      res.content
    );
    // -------------------------------------------------------------------

    let parsed: any;
    try {
      parsed = JSON.parse(res.content);
    } catch {
      return { ok: false, error: "AI returned non-JSON response." };
    }

    const verdict: ReceiptVerdict = {
      ok: true,
      receipt_readable: !!parsed.receipt_readable,
      readability_issue: parsed.readability_issue ?? null,
      extracted: {
        merchant: parsed.extracted?.merchant ?? null,
        date: parsed.extracted?.date ?? null,
        amount: parsed.extracted?.amount ?? null,
        currency: parsed.extracted?.currency ?? null,
        items: Array.isArray(parsed.extracted?.items)
          ? parsed.extracted.items
          : null,
        receipt_number: parsed.extracted?.receipt_number ?? null,
        vat_or_tin: parsed.extracted?.vat_or_tin ?? null,
      },
      mismatches: Array.isArray(parsed.mismatches) ? parsed.mismatches : [],
      tamper_signals: Array.isArray(parsed.tamper_signals)
        ? parsed.tamper_signals
        : [],
      confidence: deriveConfidence(parsed),
      verdict:
        parsed.verdict === "approve" ||
        parsed.verdict === "review" ||
        parsed.verdict === "reject"
          ? parsed.verdict
          : "review",
      notes: parsed.notes ?? "",
      provider: res.provider,
      model: res.model,
    };

    await supabaseAdmin.from("hr4_claim_receipt_verifications").insert({
      claim_id: null,
      employee_id: opts.employeeId,
      receipt_url: "pending-upload",
      claimed_amount: opts.claimedAmount,
      claimed_description: opts.claimedDescription || null,
      claimed_claim_type: opts.claimedClaimType,
      extracted_amount: verdict.extracted.amount,
      extracted_merchant: verdict.extracted.merchant,
      extracted_date: verdict.extracted.date,
      extracted_items: verdict.extracted.items,
      verdict: verdict.verdict,
      confidence: verdict.confidence,
      mismatches: verdict.mismatches,
      notes: verdict.notes,
      provider: verdict.provider,
      model: verdict.model,
      raw_response: parsed,
      verified_by: opts.verifiedByAdminId,
    });

    return verdict;
  } catch (err: any) {
    console.error("[verifyReceipt] error:", err);
    return { ok: false, error: err?.message ?? "Receipt verification failed." };
  }
}
