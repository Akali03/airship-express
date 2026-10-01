import { NextResponse } from "next/server";
import { authenticateFtmRequest } from "../../../lib/server/ftmRequestAuth";
import { createFtmParcelClient } from "../../../lib/server/ftmSupabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateFtmRequest(request);
  if (!("context" in auth)) return auth.response;
  const { context } = auth;
  if (context.user.role !== "driver") {
    return NextResponse.json({ error: "Only an authenticated driver can view driver assignments." }, { status: 403 });
  }

  const { data: assignments, error } = await context.serviceClient
    .from("booking_assignments")
    .select("*")
    .eq("driver_id", context.user.id)
    .order("assigned_at", { ascending: false });
  if (error) return NextResponse.json({ error: `Unable to load driver assignments: ${error.message}` }, { status: 500 });

  const rows = assignments || [];
  const bookingIds = [...new Set(rows.map((row) => row.booking_id).filter(Boolean))];
  const vehicleIds = [...new Set(rows.map((row) => row.vehicle_id).filter(Boolean))];
  const routePlanIds = [...new Set(rows.map((row) => row.route_plan_id).filter(Boolean))];
  const [{ data: bookings }, { data: vehicles }, { data: routePlans }] = await Promise.all([
    bookingIds.length ? context.serviceClient.from("bookings").select("*").in("id", bookingIds) : Promise.resolve({ data: [] }),
    vehicleIds.length ? context.serviceClient.from("vehicles").select("*").in("id", vehicleIds) : Promise.resolve({ data: [] }),
    routePlanIds.length ? context.serviceClient.from("route_plans").select("*").in("id", routePlanIds) : Promise.resolve({ data: [] }),
  ]);

  const bookingById = new Map((bookings || []).map((row) => [String(row.id), row]));
  const vehicleById = new Map((vehicles || []).map((row) => [String(row.id), row]));
  const routePlanById = new Map((routePlans || []).map((row) => [String(row.id), row]));
  const parcelsByBooking = new Map<string, any[]>();
  const parcelsSupabase = createFtmParcelClient();
  if (parcelsSupabase && bookingIds.length) {
    const { data: parcels } = await parcelsSupabase.from("parcels").select("*").in("booking_id", bookingIds);
    (parcels || []).forEach((parcel) => {
      const key = String(parcel.booking_id);
      parcelsByBooking.set(key, [...(parcelsByBooking.get(key) || []), parcel]);
    });
  }

  return NextResponse.json(rows.map((assignment) => ({
    ...assignment,
    booking: bookingById.get(String(assignment.booking_id)) || null,
    vehicle: vehicleById.get(String(assignment.vehicle_id)) || null,
    route_plan: assignment.route_plan_id ? routePlanById.get(String(assignment.route_plan_id)) || null : null,
    parcels: parcelsByBooking.get(String(assignment.booking_id)) || [],
  })));
}