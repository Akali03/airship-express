import { NextResponse } from "next/server";
import { hasPermission } from "../../lib/permissions";
import { authenticateFtmRequest } from "../../lib/server/ftmRequestAuth";
import { insertRoutePlanWithFallback, isOpenRoutePlan, isRoutePlanSchemaUnavailable, normalizeRoutePlan, prepareRoutePlanPayload, runFtmRouteOptimizer } from "../../lib/server/ftmRoutePlans";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateFtmRequest(request);
  if (!("context" in auth)) return auth.response;
  const { context } = auth;
  if (!hasPermission(context.user.role, "vrds", "view")) {
    return NextResponse.json({ error: "Permission denied: vrds.view" }, { status: 403 });
  }
  let query = context.serviceClient.from("route_plans").select("*").order("created_at", { ascending: false });
  const courier = new URL(request.url).searchParams.get("courier");
  if (courier) query = query.eq("courier", courier);
  const { data, error } = await query;
  if (error) {
    if (isRoutePlanSchemaUnavailable(error)) return NextResponse.json([]);
    return NextResponse.json({ error: `Unable to load route plans: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json((data || []).filter(isOpenRoutePlan).map(normalizeRoutePlan));
}

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
  if (!body.courier || !body.pickup_location || !Array.isArray(body.delivery_destinations) || !body.delivery_destinations.length) {
    return NextResponse.json({ error: "courier, pickup_location, and at least one delivery destination are required" }, { status: 400 });
  }

  const depot = { name: body.pickup_location, lat: Number(body.pickup_latitude), lng: Number(body.pickup_longitude) };
  const stops = body.delivery_destinations.map((stop: Record<string, any>, index: number) => {
    const rawName = stop.name || stop.address || stop.delivery_address || `Stop ${index + 1}`;
    const cityLabel = stop.city || stop.location || stop.area || "";
    const uniqueName = `${rawName}${cityLabel ? ` \u2022 ${cityLabel}` : ""} \u2022 ${index + 1}`;
    return {
      ...stop,
      id: stop.id || stop.stop_id || `${uniqueName}-${index}`,
      name: uniqueName,
      lat: Number(stop.lat ?? stop.latitude),
      lng: Number(stop.lng ?? stop.longitude),
    };
  }).filter((stop: Record<string, any>) => stop.name && Number.isFinite(stop.lat) && Number.isFinite(stop.lng));

  if (!Number.isFinite(depot.lat) || !Number.isFinite(depot.lng)) {
    return NextResponse.json({ error: "pickup_latitude/pickup_longitude are required" }, { status: 400 });
  }
  if (!stops.length) return NextResponse.json({ error: "delivery_destinations must include valid lat/lng for each stop" }, { status: 400 });

  let optimized;
  try {
    optimized = await runFtmRouteOptimizer(depot, stops);
  } catch (error) {
    console.error("Route plan optimization failed:", error);
    return NextResponse.json({ error: "Route optimization service failed" }, { status: 502 });
  }

  const stopsByName = new Map(stops.map((stop: Record<string, any>) => [stop.name, stop]));
  const orderedStops = Array.isArray(optimized.order) && optimized.order.length
    ? optimized.order.map((name: string) => stopsByName.get(name) || stops.find((stop: Record<string, any>) => stop.id === name)).filter(Boolean)
    : stops;
  orderedStops.forEach((stop: any) => stop?.name && stopsByName.delete(stop.name));
  const finalStops = [...orderedStops, ...Array.from(stopsByName.values())];
  const payload = prepareRoutePlanPayload(body, optimized, finalStops);
  const { data, error } = await insertRoutePlanWithFallback(context.serviceClient, payload);
  if (error) {
    if (/permission denied|not authorized|rls|jwt/i.test(error.message)) {
      return NextResponse.json({ error: "Unable to save route plan: permission denied for table route_plans", details: "Supabase RLS policies are not configured for service-role access." }, { status: 403 });
    }
    if (isRoutePlanSchemaUnavailable(error) || /column .* of 'route_plans'/i.test(error.message)) {
      return NextResponse.json({ error: "route_plans table is not migrated to the workflow schema.", details: error.message, migration: "20260814_route_plans_workflow_migration.sql" }, { status: 500 });
    }
    return NextResponse.json({ error: `Unable to save route plan: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json(normalizeRoutePlan(data), { status: 201 });
}