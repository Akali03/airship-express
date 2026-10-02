"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../library/supabase/server";
import {
  isAnyStaff,

  isStaffRole,
  canAssignRole,
  canManageRole,
  maxAssignableRole,
} from "../library/auth/rbac";
import { recordAudit } from "../services/audit.service";


export type StaffUser = {
  id: string;
  email: string;
  full_name: string | null;
  contact_number: number | null;
  role: string;
  mfa_enabled: boolean;
  mfa_email_verified: boolean;
  active: boolean;
  mfa_last_used_at: string | null;
};

type ActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? object : { data: T }))
  | { success: false; error: string };

async function requireManager(): Promise<
  { ok: true; role: string; supabase: Awaited<ReturnType<typeof createClient>> }
  | { ok: false; error: string }
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role;
  if (!isAnyStaff(role) || role === "staff") {
    return { ok: false, error: "Forbidden: user management requires admin access." };
  }
  return { ok: true, role, supabase };
}

export async function listStaffUsers(): Promise<ActionResult<StaffUser[]>> {
  const guard = await requireManager();
  if (!guard.ok) return { success: false, error: guard.error };

  const { data, error } = await guard.supabase
    .from("profiles")
    .select(
      "id, email, full_name, contact_number, role, mfa_enabled, mfa_email_verified, active, mfa_last_used_at"
    ).in("role", ["super_admin", "admin", "staff"])
    .order("email", { ascending: true });

  if (error) {
    console.error("listStaffUsers query failed:", error.message);
    return {
      success: false,
      error: `Failed to load staff accounts: ${error.message}`,
    };
  }

  return {
    success: true,
    data: (data ?? []) as unknown as StaffUser[],
  };
}

export async function createStaffUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: string;
}): Promise<ActionResult<{ id: string }>> {
  const guard = await requireManager();
  if (!guard.ok) return { success: false, error: guard.error };

  const email = input.email?.trim().toLowerCase();
  const fullName = input.fullName?.trim();

  if (!email || !email.includes("@")) {
    return { success: false, error: "A valid email is required." };
  }
  if (!input.password || input.password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }
  if (!fullName) {
    return { success: false, error: "Full name is required." };
  }

  if (!canAssignRole(guard.role, input.role)) {
    return {
      success: false,
      error: `Forbidden: you cannot grant the role "${input.role}". Your limit is ${maxAssignableRole(guard.role)}.`,
    };
  }
  if (!isStaffRole(input.role)) {
    return { success: false, error: "Invalid staff role." };
  }

  const { data: authData, error: authError } =
    await guard.supabase.auth.signUp({
      email,
      password: input.password,
      options: { data: { full_name: fullName } },
    });

  if (authError || !authData.user) {
    return {
      success: false,
      error:
        authError?.message === "User already registered"
          ? "That email already has an account."
          : "Failed to create the staff account.",
    };
  }

  const { error: profileError } = await guard.supabase
    .from("profiles")
    .upsert(
      {
        id: authData.user.id,
        email,
        full_name: fullName,
        role: input.role,
      },
      { onConflict: "id" }
    );

  if (profileError) {
    return { success: false, error: "Account created but profile update failed." };
  }


  // reach the staff area.
  const { data: verify } = await guard.supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (verify?.role !== input.role) {
    return {
      success: false,
      error: "Account created but the staff role was not applied. Check the profiles insert policy.",
    };
  }

  await recordAudit({
    action: "user.created",
    targetType: "profile",
    targetId: authData.user.id,
    description: `Created staff account ${email} with role ${input.role}`,
    metadata: { role: input.role, createdByRole: guard.role },
  });

  revalidatePath("/crbc/user-management");
  return { success: true, data: { id: authData.user.id } };
}

export async function setStaffActive(
  targetId: string,
  active: boolean
): Promise<ActionResult> {
  const guard = await requireManager();
  if (!guard.ok) return { success: false, error: guard.error };

  const { data: target } = await guard.supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", targetId)
    .maybeSingle();

  if (!target || !isStaffRole(target.role)) {
    return { success: false, error: "Staff account not found." };
  }
  if (!canManageRole(guard.role, target.role)) {
    return {
      success: false,
      error: "Forbidden: you cannot modify an account at or above your own role.",
    };
  }

  if (targetId === (await currentActorId(guard.supabase))) {
    return {
      success: false,
      error: "Forbidden: you cannot deactivate your own account.",
    };
  }

  const { error } = await guard.supabase
    .from("profiles")
    .update({ active })
    .eq("id", targetId);

  if (error) {
    return { success: false, error: "Failed to update the account." };
  }

  await recordAudit({
    action: active ? "user.activated" : "user.deactivated",
    targetType: "profile",
    targetId,
    description: `${active ? "Activated" : "Deactivated"} staff account ${target.email}`,
    metadata: { role: target.role },
  });

  revalidatePath("/crbc/user-management");
  return { success: true };
}

export async function setStaffRole(
  targetId: string,
  newRole: string
): Promise<ActionResult> {
  const guard = await requireManager();
  if (!guard.ok) return { success: false, error: guard.error };

  // Self-promotion is blocked before anything else is read.
  if (targetId === (await currentActorId(guard.supabase))) {
    return {
      success: false,
      error: "Forbidden: you cannot change your own role.",
    };
  }

  const { data: target } = await guard.supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", targetId)
    .maybeSingle();

  if (!target || !isStaffRole(target.role)) {
    return { success: false, error: "Staff account not found." };
  }
  if (!canManageRole(guard.role, target.role)) {
    return {
      success: false,
      error: "Forbidden: you cannot modify an account at or above your own role.",
    };
  }
  if (!isStaffRole(newRole)) {
    return { success: false, error: "Invalid staff role." };
  }
  if (!canAssignRole(guard.role, newRole)) {
    return {
      success: false,
      error: `Forbidden: you cannot grant the role "${newRole}". Your limit is ${maxAssignableRole(guard.role)}.`,
    };
  }

  const { error } = await guard.supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetId);

  if (error) {
    return { success: false, error: "Failed to update the role." };
  }

  await recordAudit({
    action: "user.role_changed",
    targetType: "profile",
    targetId,
    description: `Changed ${target.email} from ${target.role} to ${newRole}`,
    metadata: { from: target.role, to: newRole, changedByRole: guard.role },
  });

  revalidatePath("/crbc/user-management");
  return { success: true };
}

async function currentActorId(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

