"use server";

export type MeritSuggestionInput = {
  employee_name: string;
  performance_rating: number | null;
  letter_grade?: string | null;
  cycle_name?: string | null;
  comments?: string | null;
  strengths?: string | null;
  improvements?: string | null;
  current_salary: number;
  department?: string | null;
  tenure_years?: number | null;
  policy_baseline_percent?: number;
};

export type MeritSuggestionResult = {
  recommended_increase_percent: number;
  recommended_new_salary: number;
  rationale: string;
  confidence: "low" | "medium" | "high";
  policy_baseline_percent: number;
  adjustment_reason: string;
};

const POLICY_BASELINE: Record<number, number> = {
  1: 0,
  2: 2,
  3: 5,
  4: 8,
  5: 12,
};

export async function suggestMerit(
  input: MeritSuggestionInput
): Promise<MeritSuggestionResult> {
  const rating = Number(input.performance_rating ?? 0);
  const baseline =
    input.policy_baseline_percent ?? POLICY_BASELINE[rating] ?? 0;

  const system = `You are an HR compensation analyst for Airship Express (Philippines).
Given an employee's HR3 performance appraisal and current monthly salary, recommend a merit increase.
Rules:
- Policy baseline is provided. You may adjust by up to ±3 percentage points based on strengths, improvements, manager notes, tenure, and department.
- Final percent must be between 0 and 15.
- Output STRICT JSON only. No markdown, no code fences, no commentary.
JSON shape:
{
  "recommended_increase_percent": number,
  "adjustment_reason": string,
  "rationale": string,
  "confidence": "low" | "medium" | "high"
}`;

  const userPrompt = `Employee: ${input.employee_name}
Department: ${input.department ?? "N/A"}
Tenure (years): ${input.tenure_years ?? "unknown"}
HR3 cycle: ${input.cycle_name ?? "N/A"}
HR3 rating: ${input.performance_rating ?? "none"} / 5
Letter grade: ${input.letter_grade ?? "N/A"}
Policy baseline for this rating: ${baseline}%

Manager notes: ${input.comments ?? "(none)"}
Strengths: ${input.strengths ?? "(none)"}
Improvements: ${input.improvements ?? "(none)"}

Current monthly salary: PHP ${input.current_salary.toFixed(2)}

Return JSON only.`;

  // Fallback path (used if AI is unreachable)
  const fallback = (): MeritSuggestionResult => {
    const pct = Math.max(0, Math.min(15, baseline));
    const newSalary =
      Math.round(input.current_salary * (1 + pct / 100) * 100) / 100;
    return {
      recommended_increase_percent: pct,
      recommended_new_salary: newSalary,
      rationale: `Applied company policy baseline for a ${
        rating || "—"
      }-star rating.`,
      adjustment_reason: "No adjustment — using policy baseline.",
      confidence: "low",
      policy_baseline_percent: baseline,
    };
  };

  try {
    // Call the existing internal chat API route — it handles provider selection.
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000";

    const res = await fetch(
      `${baseUrl}/payroll-benefits-dashboard/ai/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          maxTokens: 500,
          intent: "merit-suggest",
        }),
        // Server-to-server — no cache
        cache: "no-store",
      }
    );

    if (!res.ok) {
      // If the chat route fails, fall back gracefully
      return fallback();
    }

    const data = await res.json();

    // The chat route may return { content } or { message } or raw string.
    const raw: string =
      typeof data === "string"
        ? data
        : data?.content ?? data?.message ?? data?.text ?? "";

    const cleaned = String(raw)
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed: any = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Try to extract first JSON object
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = null;
        }
      }
    }

    if (!parsed) return fallback();

    const pctRaw = Number(parsed.recommended_increase_percent);
    const pct = Number.isFinite(pctRaw)
      ? Math.max(0, Math.min(15, pctRaw))
      : baseline;

    const newSalary =
      Math.round(input.current_salary * (1 + pct / 100) * 100) / 100;

    return {
      recommended_increase_percent: pct,
      recommended_new_salary: newSalary,
      rationale:
        String(parsed.rationale ?? "").slice(0, 600) || fallback().rationale,
      adjustment_reason:
        String(parsed.adjustment_reason ?? "").slice(0, 400) ||
        fallback().adjustment_reason,
      confidence:
        parsed.confidence === "low" ||
        parsed.confidence === "medium" ||
        parsed.confidence === "high"
          ? parsed.confidence
          : "medium",
      policy_baseline_percent: baseline,
    };
  } catch (err) {
    console.error("[suggestMerit] error:", err);
    return fallback();
  }
}
