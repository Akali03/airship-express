import { NextResponse } from "next/server";
import { hasPermission } from "../../../../lib/permissions";
import { authenticateFtmRequest } from "../../../../lib/server/ftmRequestAuth";
import { normalizeTrip, validateTripAssignment } from "../../../../lib/server/ftmTrips";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateFtmRequest(request);
  if (!("context" in auth)) return auth.response;
  const { context } = auth;
  if (!hasPermission(context.user.role, "operations", "create")) {
    return NextResponse.json({ error: "Permission denied: operations.create" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({})) as { driver_id?: string };
  const supabase = context.serviceClient;
  const { data: trip, error: tripError } = await supabase.from("trips").select("*").eq("id", params.id).maybeSingle();
  if (tripError) return NextResponse.json({ error: `Unable to load trip: ${tripError.message}` }, { status: 500 });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const update: Record<string, unknown> = {};
  if (body.driver_id || trip.driver_id) {
    try {
      const assignment = await validateTripAssignment(supabase, trip, body.driver_id || trip.driver_id);
      update.driver_id = body.driver_id || trip.driver_id;
      update.driver_name = assignment.driver.full_name || null;
      update.courier_id = assignment.courier.id || trip.courier_id;
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Driver is not eligible for this trip." }, { status: 409 });
    }
  }
  update.status = "Scheduled";
  const { data, error } = await supabase.from("trips").update(update).eq("id", params.id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: "Failed to accept trip" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json(normalizeTrip(data));
}