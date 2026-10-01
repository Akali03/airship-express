import { NextResponse } from "next/server";
import { hasPermission } from "../../../lib/permissions";
import { authenticateFtmRequest } from "../../../lib/server/ftmRequestAuth";
import { createFtmParcelClient } from "../../../lib/server/ftmSupabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await authenticateFtmRequest(request);
  if (!("context" in auth)) return auth.response;
  const { context } = auth;
  if (!hasPermission(context.user.role, "vrds", "create")) {
    return NextResponse.json({ error: "Permission denied: vrds.create" }, { status: 403 });
  }

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid JSON request body is required." }, { status: 400 });
  }
  const courier = body.courier;
  const requestedIds = Array.isArray(body.parcel_ids) ? body.parcel_ids : [];
  const routePlanId = body.route_plan_id || null;
  if (!courier) return NextResponse.json({ error: "courier is required" }, { status: 400 });

  const parcelsSupabase = createFtmParcelClient();
  const bookingsSupabase = context.serviceClient;
  if (!parcelsSupabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  let routePlan = body.route_plan || null;
  let persistedRoutePlanId = routePlanId;
  if (routePlanId) {
    const { data, error } = await bookingsSupabase.from("route_plans").select("*").eq("id", routePlanId).maybeSingle();
    if (error && !/Could not find the table 'public\.route_plans'/i.test(error.message)) {
      return NextResponse.json({ error: `Unable to load route plan: ${error.message}` }, { status: 500 });
    }
    if (data) routePlan = data;
  }
  if (!routePlan && requestedIds.length) {
    routePlan = {
      courier,
      pickup_location: body.pickup_location || "Airship Express Hub - Binondo, Manila",
      pickup_latitude: body.pickup_latitude ?? null,
      pickup_longitude: body.pickup_longitude ?? null,
      delivery_destinations: [{ name: body.dropoff_location || "Selected delivery destinations" }],
    };
  }
  if (!routePlan) return NextResponse.json({ error: "route_plan or route_plan_id is required" }, { status: 400 });
  if (routePlan.courier && routePlan.courier !== courier) {
    return NextResponse.json({ error: "That route plan does not belong to the selected courier" }, { status: 400 });
  }

  if (!persistedRoutePlanId) {
    const uuid = typeof routePlan.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routePlan.id);
    const insert: Record<string, any> = {
      courier,
      pickup_location: routePlan.pickup_location || body.pickup_location || "Airship Express Hub - Binondo, Manila",
      pickup_latitude: routePlan.pickup_latitude ?? body.pickup_latitude ?? null,
      pickup_longitude: routePlan.pickup_longitude ?? body.pickup_longitude ?? null,
      delivery_destinations: Array.isArray(routePlan.delivery_destinations) && routePlan.delivery_destinations.length
        ? routePlan.delivery_destinations
        : [{ name: body.dropoff_location || "Selected delivery destinations" }],
      status: routePlan.status || "assigned",
    };
    if (uuid) insert.id = routePlan.id;
    const { data, error } = await bookingsSupabase.from("route_plans").insert(insert).select("*").maybeSingle();
    if (!error && data) {
      routePlan = data;
      persistedRoutePlanId = data.id;
    } else if (error && !/Could not find the table 'public\.route_plans'/i.test(error.message)) {
      console.warn("Unable to persist route plan for bulk booking:", error.message);
    }
  }

  let parcelQuery = parcelsSupabase.from("parcels").select("*");
  parcelQuery = requestedIds.length ? parcelQuery.in("id", requestedIds) : parcelQuery.eq("courier", courier);
  const { data: parcels, error: parcelError } = await parcelQuery;
  if (parcelError) return NextResponse.json({ error: `Unable to load parcels: ${parcelError.message}` }, { status: 500 });
  if (!parcels?.length) return NextResponse.json({ error: `No pending parcels found for courier "${courier}"` }, { status: 400 });

  const bookingId = `BK-${Date.now()}`;
  const totalWeight = parcels.reduce((sum, parcel) => sum + Number(parcel.weight_kg || parcel.weight || 0), 0);
  const parcelIds = parcels.map((parcel) => parcel.id);
  const destinations = Array.isArray(routePlan.delivery_destinations) ? routePlan.delivery_destinations : [];
  const linkedRoutePlanId = persistedRoutePlanId || routePlanId || routePlan.id || null;
  const bookingPayload = {
    id: bookingId,
    courier,
    route_plan_id: linkedRoutePlanId,
    delivery_destinations: destinations,
    pickup_location: routePlan.pickup_location,
    pickup_latitude: routePlan.pickup_latitude,
    pickup_longitude: routePlan.pickup_longitude,
    dropoff_location: destinations.length ? destinations[destinations.length - 1].name : routePlan.pickup_location,
    cargo_type: "BulkDelivery",
    cargo_description: `${parcels.length} parcel(s) for ${courier}; parcel_ids=${parcelIds.join(",")}`,
    cargo_weight: totalWeight,
    status: "Pending",
  };
  let { data: booking, error: bookingError } = await bookingsSupabase.from("bookings").insert(bookingPayload).select("*").single();
  if (bookingError && /column .* does not exist/i.test(bookingError.message)) {
    const { data, error } = await bookingsSupabase.from("bookings").insert({
      id: bookingId,
      courier,
      route_plan_id: linkedRoutePlanId,
      delivery_destinations: destinations,
      pickup_location: routePlan.pickup_location,
      pickup_latitude: routePlan.pickup_latitude,
      pickup_longitude: routePlan.pickup_longitude,
      dropoff_location: bookingPayload.dropoff_location,
      cargo_type: "BulkDelivery",
      cargo_description: bookingPayload.cargo_description,
      cargo_weight: totalWeight,
      status: "Pending",
    }).select("*").single();
    booking = data;
    bookingError = error;
  }
  if (bookingError) return NextResponse.json({ error: `Unable to create bulk booking: ${bookingError.message}` }, { status: 500 });

  const attach = { booking_id: bookingId, route_plan_id: linkedRoutePlanId, status: "booked" };
  let update = await parcelsSupabase.from("parcels").update(attach).in("id", parcelIds.map(String));
  let updateError = update.error;
  if (update.error && /invalid input value|status.*constraint|check constraint/i.test(update.error.message)) {
    update = await parcelsSupabase.from("parcels").update({ ...attach, status: "picked_up" }).in("id", parcelIds.map(String));
    updateError = update.error;
  }
  if (updateError && /invalid input syntax for type bigint|type bigint|column .* does not exist|could not match/i.test(updateError.message)) {
    updateError = null;
    for (const id of parcelIds) {
      let result = await parcelsSupabase.from("parcels").update(attach).eq("id", String(id));
      if (result.error && /invalid input value|status.*constraint|check constraint/i.test(result.error.message)) {
        result = await parcelsSupabase.from("parcels").update({ ...attach, status: "picked_up" }).eq("id", String(id));
      }
      if (result.error) {
        updateError = result.error;
        break;
      }
    }
  }
  if (updateError) console.warn("Bulk booking saved, but parcel linking failed:", updateError.message);
  return NextResponse.json({ booking, routePlan, parcelCount: parcels.length, totalWeight, parcelIds }, { status: 201 });
}