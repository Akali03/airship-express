import { NextResponse } from "next/server";
import { hasPermission } from "../../../../lib/permissions";
import { authenticateFtmRequest } from "../../../../lib/server/ftmRequestAuth";
import { normalizeTrip, notifyDriverTripAssigned, updateTripResources, validateTripAssignment } from "../../../../lib/server/ftmTrips";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateFtmRequest(request);
  if (!("context" in auth)) return auth.response;
  const { context } = auth;
  if (!hasPermission(context.user.role, "operations", "create")) {
    return NextResponse.json({ error: "Permission denied: operations.create" }, { status: 403 });
  }

  let body: { driver_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid JSON request body is required." }, { status: 400 });
  }
  if (!body.driver_id) return NextResponse.json({ error: "driver_id is required" }, { status: 400 });

  const supabase = context.serviceClient;
  const { data: trip, error: tripError } = await supabase.from("trips").select("*").eq("id", params.id).maybeSingle();
  if (tripError) return NextResponse.json({ error: `Unable to load trip: ${tripError.message}` }, { status: 500 });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  let assignment;
  try {
    assignment = await validateTripAssignment(supabase, trip, body.driver_id);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Driver is not eligible for this trip." }, { status: 409 });
  }
  const { data, error } = await supabase.from("trips").update({
    driver_id: body.driver_id,
    driver_name: assignment.driver.full_name || null,
    courier_id: assignment.courier.id || trip.courier_id,
    status: "Driver Assigned",
  }).eq("id", params.id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: "Failed to assign trip" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  await notifyDriverTripAssigned(supabase, data);
  await updateTripResources(supabase, { driverId: data.driver_id, vehicleId: data.vehicle_id }, "Assigned");
  return NextResponse.json(normalizeTrip(data));
}