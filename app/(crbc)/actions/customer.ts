"use server";

import { createClient } from "@/app/(crbc)/library/supabase/server";
import { revalidatePath } from "next/cache";
import { isAnyStaff } from "../library/auth/rbac";
import {
  INTERACTION_CHANNELS,
  type InteractionChannel,
  type PackageType,
} from "../types/booking-request";

export type BookingPackageDetails = {
  package_quantity: number;
  package_type: PackageType;
  item_category: string;
  weight: number;
  dimensions?: {
    length_cm: number;
    width_cm: number;
    height_cm: number;
  };
  declared_value?: number;
  packaging_service: "empty" | "provided";
  remarks?: string;
};

export type UpdateCustomerFormState = {
  id: string;
  full_name: string;
  phone: string | null;
  province: string | null;
  city: string | null;
  barangay: string | null;
  full_address: string | null;
  email: string | null;
};

export type UpdateCustomerResult = {
  success?: boolean;
  error?: string;
};

export async function updateCustomer(
  prevState: UpdateCustomerFormState,
  formData: FormData
): Promise<UpdateCustomerResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const { data: ownCustomer } = await supabase
    .from("customers")
    .select("id, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!ownCustomer) {
    return {
      error:
        "No customer record is linked to your account. Please contact support.",
    };
  }

  // Extract form data
  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string | null;
  const province = formData.get("province") as string | null;
  const city = formData.get("city") as string | null;
  const barangay = formData.get("barangay") as string | null;
  const full_address = formData.get("full_address") as string | null;
  const email = formData.get("email") as string | null;

  if (!full_name?.trim()) {
    return { error: "Full name is required" };
  }

  const nextEmail = email?.trim() || ownCustomer.email || null;

  const { data, error } = await supabase
    .from("customers")
    .update({
      full_name: full_name.trim(),
      phone: phone?.trim() || null,
      province: province?.trim() || null,
      city: city?.trim() || null,
      barangay: barangay?.trim() || null,
      full_address: full_address?.trim() || null,
      email: nextEmail,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ownCustomer.id)
    .select();

  if (error) {
    console.error("Customer update error:", error);
    return { error: "Failed to update customer" };
  }

  if (!data || data.length === 0) {
    return { error: "No customer record was updated — check permissions" };
  }

  return { success: true };
}
/* ------------------------------------------------------------------ *
 * Manual customer interaction
 * ------------------------------------------------------------------ *
 * Records a CSR-observed contact on a customer: at the counter, over the
 * phone, or over Messenger.
 *
 * This is a MANUAL CRM RECORD ONLY. There is no Messenger API, webhook or
 * import — a staff member types what was said. That is why this is a separate
 * action rather than something derived from a booking.
 *
 * Reuses the existing `customer_interactions` table, its RLS policies and the
 * InteractionChannel union. No new table, no duplicate interaction system.
 *
 * Ownership is NOT taken from the request: the customer is resolved from the
 * caller's own session-scoped client, and staff status is re-checked here
 * rather than trusted from the browser.
 */

export type CreateInteractionResult = {
  success: boolean;
  error?: string;
};

export async function createCustomerInteraction(input: {
  customerId: string;
  channel: InteractionChannel;
  notes?: string;
  interactionDate?: string;
}): Promise<CreateInteractionResult> {
  const supabase = await createClient();

  // Staff-only. RLS would also refuse a customer, but a clear 403 here beats
  // a confusing constraint violation further down.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!isAnyStaff(profile?.role)) {
    return { success: false, error: "Forbidden: staff access required" };
  }

  // The customer is a UUID the CRM already holds. Staff may record an
  // interaction for any customer; RLS on customer_interactions governs which
  // rows a non-staff caller may touch, and a customer can never reach here.
  if (!input.customerId) {
    return { success: false, error: "A customer is required." };
  }

  if (!INTERACTION_CHANNELS.includes(input.channel)) {
    return { success: false, error: "Unknown interaction channel." };
  }

  const notes = input.notes?.trim();

  const { error } = await supabase.from("customer_interactions").insert({
    customer_id: input.customerId,
    interaction_type: input.channel,
    notes: notes ? notes : null,
    // Default to now() when the CSR does not backdate it.
    interaction_date: input.interactionDate
      ? new Date(input.interactionDate).toISOString()
      : new Date().toISOString(),
  });

  if (error) {
    console.error("Create interaction error:", error);
    return { success: false, error: "Failed to record the interaction." };
  }

  revalidatePath("/crbc/customers/interactions");
  return { success: true };
}

/* ------------------------------------------------------------------ *
 * Staff-side customer update
 * ------------------------------------------------------------------ *
 * Distinct from updateCustomer() above, which is the Customer Portal's
 * self-service edit and resolves the record from the caller's OWN session.
 * A CSR editing someone else's profile is a different operation and needs a
 * different guard, so it gets its own action rather than loosening that one.
 *
 * IMMUTABLE FIELDS
 *   `id`, `customer_id`, `auth_user_id`, `profile_id`, `created_at` are never
 *   written. They are the customer's identity and its link to the auth account;
 *   a typo in a name field must not be able to orphan an account. The update
 *   below only ever writes the listed columns.
 *
 * RLS on `customers` independently limits UPDATE to staff, so this action is
 * the first layer rather than the only one.
 */

export type StaffUpdateCustomerResult = {
  success: boolean;
  error?: string;
};

export async function staffUpdateCustomer(input: {
  customerUuid: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  province?: string | null;
  city?: string | null;
  barangay?: string | null;
  fullAddress?: string | null;
}): Promise<StaffUpdateCustomerResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!isAnyStaff(profile?.role)) {
    return { success: false, error: "Forbidden: staff access required" };
  }

  if (!input.fullName?.trim()) {
    return { success: false, error: "Full name is required." };
  }

  const { data, error } = await supabase
    .from("customers")
    .update({
      full_name: input.fullName.trim(),
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      province: input.province?.trim() || null,
      city: input.city?.trim() || null,
      barangay: input.barangay?.trim() || null,
      full_address: input.fullAddress?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.customerUuid)
    .select("id, customer_id");

  if (error) {
    console.error("Staff customer update error:", error);
    return { success: false, error: "Failed to update the customer." };
  }

  if (!data || data.length === 0) {
    return { success: false, error: "Customer not found or not permitted." };
  }

  revalidatePath(`/crbc/customers/${input.customerUuid}`);
  return { success: true };
}
