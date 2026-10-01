import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasPermission } from "../../../../lib/permissions";
import { authenticateFtmRequest } from "../../../../lib/server/ftmRequestAuth";
import { createFtmParcelClient } from "../../../../lib/server/ftmSupabase";
import { normalizeBooking, validateBookingAssignment } from "../../../../lib/server/ftmBookings";

export const dynamic = "force-dynamic";

async function updateResourceStatus(
  supabase: SupabaseClient,
  resource: { driverId?: string | null; vehicleId?: string | null },
  status: string,
) {
  const updates = [];
  if (resource.vehicleId) {
    updates.push((async () => {
      const primary = await supabase.from("vehicles")
        .update({ status, availability: status, assignment_status: status.toLowerCase() })
        .eq("id", resource.vehicleId);
      if (primary.error && /assignment_status|column .* does not exist|schema cache/i.test(primary.error.message)) {
        return supabase.from("vehicles").update({ status, availability: status }).eq("id", resource.vehicleId);
      }
      return primary;
    })());
  }
  if (resource.driverId) {
    updates.push(supabase.from("users").update({ is_active: status.toLowerCase() !== "inactive" }).eq("id", resource.driverId));
  }
  (await Promise.all(updates)).forEach((result) => {
    if (result.error) console.warn(`Unable to update ${status.toLowerCase()} resource status:`, result.error.message);
  });
}

async function syncAssignedTrip(supabase: SupabaseClient, booking: Record<string, any>, assignment: Record<string, any>) {
  if (!booking?.id || !assignment.driverId || !assignment.vehicleId) return;
  const trip = {
    id: `TRIP-${booking.id}`,
    booking_id: booking.id,
    route_plan_id: booking.route_plan_id || null,
    courier_id: booking.courier_id || null,
    driver_id: assignment.driverId,
    driver_name: assignment.driverName || null,
    vehicle_id: assignment.vehicleId,
    vehicle_plate: assignment.vehiclePlate || null,
    from_location: booking.pickup_location || null,
    to_location: booking.dropoff_location || null,
    from_latitude: booking.pickup_latitude || null,
    from_longitude: booking.pickup_longitude || null,
    to_latitude: booking.dropoff_latitude || null,
    to_longitude: booking.dropoff_longitude || null,
    load_kg: booking.total_weight_kg || booking.load_kg || booking.cargo_weight || 0,
    status: "Assigned",
    progress: 0,
    pickup_status: "pending",
    updated_at: new Date().toISOString(),
  };
  const { data: existing, error: lookupError } = await supabase.from("trips").select("id").eq("booking_id", booking.id).maybeSingle();
  if (lookupError) {
    console.warn("Unable to look up assigned trip for booking:", lookupError.message);
    return;
  }
  const persist = async (payload: Record<string, unknown>) => existing
    ? supabase.from("trips").update(payload).eq("id", existing.id)
    : supabase.from("trips").insert(payload);
  let result = await persist(trip);
  if (result.error && /column .* does not exist|schema cache|from_latitude|to_latitude/i.test(result.error.message)) {
    const legacy = { ...trip } as Record<string, unknown>;
    delete legacy.from_latitude;
    delete legacy.from_longitude;
    delete legacy.to_latitude;
    delete legacy.to_longitude;
    result = await persist(legacy);
  }
  if (result.error) console.warn("Unable to synchronize assigned trip for driver app:", result.error.message);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateFtmRequest(request);
  if (!("context" in auth)) return auth.response;
  const { context } = auth;
  if (!hasPermission(context.user.role, "vrds", "update")) {
    return NextResponse.json({ error: "Permission denied: vrds.update" }, { status: 403 });
  }

  let body: { driver_id?: string; driver_name?: string; vehicle_id?: string; vehicle_plate?: string; courier_id?: string; courier?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid JSON request body is required." }, { status: 400 });
  }
  const bookingId = params.id;
  const { driver_id, driver_name, vehicle_id, vehicle_plate } = body;
  if (!driver_id || !vehicle_id) {
    return NextResponse.json({ error: "driver_id and vehicle_id are required" }, { status: 400 });
  }

  const supabase = context.serviceClient;
  const { data: bookingBefore, error: lookupError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();
  if (lookupError) return NextResponse.json({ error: `Unable to load booking for assignment: ${lookupError.message}` }, { status: 500 });
  if (!bookingBefore) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  let validation;
  try {
    validation = await validateBookingAssignment(supabase, bookingBefore, driver_id, vehicle_id, body.courier_id || body.courier);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Driver and vehicle are not eligible for this booking." }, { status: 409 });
  }

  const assignedAt = new Date().toISOString();
  const { data: assignment, error: assignmentError } = await supabase.from("booking_assignments").upsert({
    booking_id: bookingId,
    driver_id,
    vehicle_id,
    route_plan_id: bookingBefore.route_plan_id || null,
    assigned_at: assignedAt,
    status: "assigned",
    updated_at: assignedAt,
  }, { onConflict: "booking_id" }).select("*").single();
  if (assignmentError) console.error("Unable to save auxiliary booking assignment row:", assignmentError.message);

  const { data: previous } = await supabase.from("bookings").select("driver_id, vehicle_id").eq("id", bookingId).maybeSingle();
  const assignedVehiclePlate = validation.vehicle.plate_number || vehicle_plate || null;
  const { data, error } = await supabase.from("bookings").update({
    driver_id,
    driver_name: driver_name || null,
    vehicle_id,
    vehicle_plate: assignedVehiclePlate,
    status: "DRIVER_VEHICLE_ASSIGNED",
  }).eq("id", bookingId).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: `Unable to assign booking resources: ${error.message}` }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (previous && (previous.driver_id !== driver_id || previous.vehicle_id !== vehicle_id)) {
    await updateResourceStatus(supabase, { driverId: previous.driver_id, vehicleId: previous.vehicle_id }, "Available");
  }
  await updateResourceStatus(supabase, { driverId: driver_id, vehicleId: vehicle_id }, "Assigned");
  await syncAssignedTrip(supabase, data, { driverId: driver_id, driverName: driver_name, vehicleId: vehicle_id, vehiclePlate: assignedVehiclePlate });
  const { error: notificationError } = await supabase.from("notifications").insert({
    user_id: driver_id,
    title: "New booking assignment",
    message: `Booking ${data.id} has been assigned to you: ${data.pickup_location || "pickup"} to ${data.dropoff_location || "destination"}.`,
    is_read: false,
  });
  if (notificationError) console.warn("Booking assignment saved but driver notification could not be sent:", notificationError.message);

  try {
    const cargoDescription = String(data.cargo_description || "");
    const parcelIds = cargoDescription.match(/parcel_ids=([^;\s]+)/i)?.[1]?.split(",").map((id: string) => id.trim()).filter(Boolean) || [];
    if (parcelIds.length) {
      const parcelsSupabase = createFtmParcelClient();
      if (!parcelsSupabase) throw new Error("Parcels Supabase is not configured.");
      let parcelUpdate = await parcelsSupabase.from("parcels").update({ status: "booked" }).in("id", parcelIds);
      if (parcelUpdate.error && /invalid input value|status.*constraint|check constraint/i.test(parcelUpdate.error.message)) {
        parcelUpdate = await parcelsSupabase.from("parcels").update({ status: "picked_up" }).in("id", parcelIds);
      }
      if (parcelUpdate.error) console.warn("Unable to preserve booked parcel status during assignment:", parcelUpdate.error.message);
    }
  } catch (error) {
    console.warn("Unable to synchronize parcel assignment status:", error);
  }

  return NextResponse.json({
    ...normalizeBooking(data),
    assignment: assignment || null,
    ...(assignmentError ? { assignment_warning: `Booking was assigned, but its auxiliary assignment record could not be saved: ${assignmentError.message}` } : {}),
  });
}