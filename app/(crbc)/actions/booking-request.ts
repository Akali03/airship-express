"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../library/supabase/server";
import { recordAudit } from "../services/audit.service";


async function resolveOwnCustomer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  authUserId: string
) {
  const { data: byAuth } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (byAuth) return byAuth.id;

  const { data: byProfile } = await supabase
    .from("customers")
    .select("id")
    .eq("profile_id", authUserId)
    .maybeSingle();
  return byProfile?.id ?? null;
}

/** Fields a customer may change while a request is still PENDING. */
export type EditableBookingFields = {
  receiverName: string;
  receiverContact: string | null;
  receiverProvince: string | null;
  receiverCity: string | null;
  receiverBarangay: string | null;
  receiverFullAddress: string | null;
  packageQuantity: number;
  packageType: "box" | "parcel" | "document";
  itemCategory: string | null;
  weight: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  declaredValue: number | null;
  airshipPackagingRequested: boolean;
  remarks: string | null;
};


export async function updateBookingRequest(
  requestId: string,
  fields: EditableBookingFields
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: "Unauthorized" };

  const customerId = await resolveOwnCustomer(supabase, user.id);
  if (!customerId) return { error: "Customer profile not found." };

  const { data: existing } = await supabase
    .from("booking_requests")
    .select("id, status, customer_id")
    .eq("request_id", requestId)
    .maybeSingle();

  if (!existing) return { error: "Booking request not found." };
  if (existing.customer_id !== customerId) return { error: "Forbidden." };
  if (existing.status !== "PENDING") {
    return { error: "Only pending requests can be edited." };
  }

  if (!fields.receiverName?.trim()) {
    return { error: "Receiver name is required." };
  }
  if (!fields.receiverProvince?.trim() || !fields.receiverCity?.trim()) {
    return { error: "Receiver province and city are required." };
  }
  if (!Number.isFinite(fields.packageQuantity) || fields.packageQuantity < 1) {
    return { error: "Quantity must be at least 1." };
  }
  if (!Number.isFinite(fields.weight ?? NaN) || (fields.weight ?? 0) <= 0) {
    return { error: "Weight must be greater than zero." };
  }

  const { lengthCm, widthCm, heightCm } = fields;
  const hasAllDimensions =
    lengthCm !== null && widthCm !== null && heightCm !== null;

  const { error } = await supabase
    .from("booking_requests")
    .update({
      receiver_name: fields.receiverName.trim(),
      receiver_contact: fields.receiverContact || null,
      receiver_province: fields.receiverProvince,
      receiver_city: fields.receiverCity,
      receiver_barangay: fields.receiverBarangay || null,
      receiver_full_address: fields.receiverFullAddress || null,
      package_quantity: fields.packageQuantity,
      package_type: fields.packageType,
      item_category: fields.itemCategory || null,
      weight: fields.weight,
      dimensions: hasAllDimensions
        ? { length_cm: lengthCm, width_cm: widthCm, height_cm: heightCm }
        : null,
      declared_value: fields.declaredValue ?? null,
      airship_packaging_requested: fields.airshipPackagingRequested,
      remarks: fields.remarks || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .eq("status", "PENDING"); // guard against a concurrent status change

  if (error) return { error: "Failed to save changes. Please try again." };

  // Refresh every surface that shows this request, so the saved values are
  // visible immediately in Shipment History and on the detail page.
  revalidatePath("/customer/shipment-history");
  revalidatePath(`/customer/shipment-history/${requestId}`);
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/notifications");

  return { success: true };
}

export async function cancelBookingRequest(
  requestId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: "Unauthorized" };

  const customerId = await resolveOwnCustomer(supabase, user.id);
  if (!customerId) return { error: "Customer profile not found." };

  const { data: existing } = await supabase
    .from("booking_requests")
    .select("id, status, customer_id")
    .eq("request_id", requestId)
    .maybeSingle();

  if (!existing) return { error: "Booking request not found." };
  if (existing.customer_id !== customerId) return { error: "Forbidden." };
  if (existing.status !== "PENDING") return { error: "Only pending requests can be cancelled." };

  const { error } = await supabase
    .from("booking_requests")
    .update({ status: "CANCELLED" })
    .eq("id", existing.id);

  if (error) return { error: "Failed to cancel. Please try again." };

  await recordAudit({
    action: "booking.cancelled",
    targetType: "booking_request",
    targetId: requestId,
    description: `Customer cancelled booking ${requestId}`,
  });

  revalidatePath("/customer/shipment-history");
  revalidatePath("/customer/shipments");
  return { success: true };
}
