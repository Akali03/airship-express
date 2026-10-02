import { createClient } from "../../library/supabase/server";
import { mapDeliveryPolicyRow } from "../../types/delivery-policy";
import { NextRequest, NextResponse } from "next/server";
import { validatePolicyInput, validateId, getStaffClient, getPolicyAdminClient } from "../../library/validation/delivery.policy.validate";
import { recordAudit } from "../../services/audit.service";

export async function GET() {
  const { client: supabase, error: authError } = await getStaffClient(createClient);

  if (!supabase) {
    return NextResponse.json(
      { error: authError === "Forbidden" ? "Forbidden" : "Unauthorized" },
      { status: authError === "Forbidden" ? 403 : 401 }
    );
  }

  const { data, error } = await supabase
    .from("delivery_policies")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(mapDeliveryPolicyRow));
}


export async function POST(request: NextRequest) {
  const { client: supabase, error: authError } = await getPolicyAdminClient(createClient);

  if (!supabase) {
    return NextResponse.json(
      { error: authError === "Forbidden" ? "Forbidden" : "Unauthorized" },
      { status: authError === "Forbidden" ? 403 : 401 }
    );
  }

  const body = await request.json();

  const {
    policy,
    coverage,
    region,
    minDays,
    maxDays,
  } = body;

  const validationError = validatePolicyInput({
    policy,
    coverage,
    region,
    minDays,
    maxDays,
  });

  if (validationError) {
    return NextResponse.json(
      { error: validationError },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("delivery_policies")
    .insert({
      policy: policy.trim(),
      coverage: coverage.trim(),
      region,
      min_days: minDays,
      max_days: maxDays,
    })
    .select()
    .single();

  if (error) {
    console.error("Create delivery policy error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  await recordAudit({
    action: "sla_policy.created",
    targetType: "delivery_policy",
    targetId: data.id,
    description: `Created SLA policy "${data.policy}" (${data.region}, ${data.min_days}-${data.max_days} days)`,
    metadata: { region: data.region, minDays: data.min_days, maxDays: data.max_days },
  });

  return NextResponse.json(
    mapDeliveryPolicyRow(data),
    { status: 201 }
  );
}

export async function PATCH(request: NextRequest) {
  const { client: supabase, error: authError } = await getPolicyAdminClient(createClient);

  if (!supabase) {
    return NextResponse.json(
      { error: authError === "Forbidden" ? "Forbidden" : "Unauthorized" },
      { status: authError === "Forbidden" ? 403 : 401 }
    );
  }

  const body = await request.json();

  const {
    id,
    policy,
    coverage,
    region,
    minDays,
    maxDays,
  } = body;

  const idError = validateId(id);

  if (idError) {
    return NextResponse.json(
      { error: idError },
      { status: 400 }
    );
  }

  const validationError = validatePolicyInput({
    policy,
    coverage,
    region,
    minDays,
    maxDays,
  });

  if (validationError) {
    return NextResponse.json(
      { error: validationError },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("delivery_policies")
    .update({
      policy: policy.trim(),
      coverage: coverage.trim(),
      region,
      min_days: minDays,
      max_days: maxDays,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Policy not found." },
        { status: 404 }
      );
    }

    console.error("Update delivery policy error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  await recordAudit({
    action: "sla_policy.updated",
    targetType: "delivery_policy",
    targetId: id,
    description: `Updated SLA policy to "${data.policy}" (${data.region}, ${data.min_days}-${data.max_days} days)`,
    metadata: { region: data.region, minDays: data.min_days, maxDays: data.max_days },
  });

  return NextResponse.json(
    mapDeliveryPolicyRow(data)
  );
}

export async function DELETE(request: NextRequest) {
  const { client: supabase, error: authError } = await getPolicyAdminClient(createClient);

  if (!supabase) {
    return NextResponse.json(
      { error: authError === "Forbidden" ? "Forbidden" : "Unauthorized" },
      { status: authError === "Forbidden" ? 403 : 401 }
    );
  }

  const body = await request.json();
  const { id } = body;

  const idError = validateId(id);

  if (idError) {
    return NextResponse.json(
      { error: idError },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("delivery_policies")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Policy not found." },
        { status: 404 }
      );
    }

    console.error("Delete delivery policy error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  await recordAudit({
    action: "sla_policy.deleted",
    targetType: "delivery_policy",
    targetId: id,
    description: "Deleted an SLA policy",
  });

  return NextResponse.json({
    message: "Delivery policy deleted successfully.",
    id: data.id,
  });
}