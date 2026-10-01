import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

type Point = { name?: string; lat: number; lng: number; [key: string]: any };
type RoutePlan = Record<string, any>;

const LEGACY_COLUMNS = [
  "id", "trip_id", "courier", "courier_id", "pickup_location", "pickup_latitude", "pickup_longitude",
  "delivery_destinations", "status", "created_at", "updated_at",
];
const ROUTE_PLAN_COLUMNS = new Set([
  ...LEGACY_COLUMNS, "bulk_qr_code", "route_geojson", "distance_km", "estimated_duration_min", "fuel_savings",
  "eta_impact_min", "optimization_result", "route_details", "planned_delivery_date", "generated_by", "created_by",
]);
const OPEN_STATUSES = new Set(["draft", "assigned", "in_progress", "active", "archived"]);

export function normalizeRoutePlan(record: RoutePlan = {}) {
  return {
    ...record,
    bulkQrCode: record.bulk_qr_code ?? null,
    tripId: record.trip_id ?? null,
    courierId: record.courier_id ?? record.courierId ?? null,
    pickupLocation: record.pickup_location,
    pickupLatitude: record.pickup_latitude ?? null,
    pickupLongitude: record.pickup_longitude ?? null,
    deliveryDestinations: Array.isArray(record.delivery_destinations) ? record.delivery_destinations : [],
    routeGeojson: record.route_geojson || null,
    distanceKm: record.distance_km ?? null,
    durationMinutes: record.estimated_duration_min ?? null,
    fuelSavings: record.fuel_savings ?? null,
    etaImpactMinutes: record.eta_impact_min ?? null,
    optimizationResult: record.optimization_result || null,
    routeDetails: record.route_details || null,
    plannedDeliveryDate: record.planned_delivery_date || null,
  };
}

function buildRoutePlanPayload(record: RoutePlan) {
  return {
    id: record.id || record.route_plan_id || null,
    trip_id: record.trip_id ?? record.tripId ?? null,
    bulk_qr_code: record.bulk_qr_code ?? record.bulkQrCode ?? null,
    courier: record.courier || null,
    courier_id: record.courier_id ?? record.courierId ?? null,
    pickup_location: record.pickup_location || record.pickupLocation || null,
    pickup_latitude: record.pickup_latitude ?? record.pickupLatitude ?? null,
    pickup_longitude: record.pickup_longitude ?? record.pickupLongitude ?? null,
    delivery_destinations: Array.isArray(record.delivery_destinations) ? record.delivery_destinations : record.deliveryDestinations || [],
    route_geojson: record.route_geojson || record.routeGeojson || null,
    distance_km: record.distance_km ?? record.distanceKm ?? null,
    estimated_duration_min: record.estimated_duration_min ?? record.durationMinutes ?? null,
    fuel_savings: record.fuel_savings ?? record.fuelSavings ?? null,
    eta_impact_min: record.eta_impact_min ?? record.etaImpactMinutes ?? null,
    optimization_result: record.optimization_result || record.optimizationResult || null,
    route_details: record.route_details || record.routeDetails || null,
    planned_delivery_date: record.planned_delivery_date || record.plannedDeliveryDate || null,
    status: record.status || "draft",
    generated_by: record.generated_by || "OR-Tools",
    created_by: record.created_by || null,
  };
}

function distanceMeters(a: Point, b: Point) {
  const radians = (value: number) => value * Math.PI / 180;
  const lat1 = radians(Number(a.lat) || 0);
  const lon1 = radians(Number(a.lng) || 0);
  const lat2 = radians(Number(b.lat) || 0);
  const lon2 = radians(Number(b.lng) || 0);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(h));
}

async function routeMetrics(points: Point[]) {
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";");
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`OSRM route request failed with HTTP ${response.status}`);
  const result = await response.json();
  const route = result?.routes?.[0];
  if (result?.code !== "Ok" || !route) throw new Error("OSRM route request returned no route");
  return { distance: Number(route.distance || 0), duration: Number(route.duration || 0), geometry: route.geometry || null };
}

export async function runFtmRouteOptimizer(depot: Point, stops: Point[], options: { useService?: boolean } = {}) {
  const serviceUrl = process.env.ORTOOLS_SERVICE_URL || "http://localhost:8000/optimize";
  const serviceEnabled = options.useService ?? process.env.USE_ORTOOLS !== "false";
  const serviceAvailable = Boolean(process.env.ORTOOLS_SERVICE_URL) || process.env.NODE_ENV !== "production";
  if (serviceEnabled && serviceAvailable) {
    try {
      const response = await fetch(serviceUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.OPTIMIZER_API_KEY ? { "X-API-Key": process.env.OPTIMIZER_API_KEY } : {}),
        },
        body: JSON.stringify({
          depot,
          stops,
          num_vehicles: 1,
          use_road_distance: true,
          time_limit_secs: 5,
          distance_matrix_provider: "osrm",
          route_provider: "osrm",
          include_traffic: false,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`Optimizer service returned HTTP ${response.status}`);
      return { ...(await response.json()), used_ortools: true };
    } catch (error) {
      console.warn("OR-Tools service unavailable; falling back to nearest-neighbor routing:", error);
    }
  }

  const remaining = stops.map((stop) => ({ ...stop }));
  const order: string[] = [];
  const ordered: Point[] = [];
  let current = depot;
  let totalDistance = 0;
  while (remaining.length) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    remaining.forEach((stop, index) => {
      const distance = distanceMeters(current, stop);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    const nextStop = remaining.splice(nearestIndex, 1)[0];
    order.push(nextStop.name || `Stop ${order.length + 1}`);
    ordered.push(nextStop);
    totalDistance += nearestDistance;
    current = nextStop;
  }

  const naiveDistance = stops.reduce((total, stop, index) => total + distanceMeters(index ? stops[index - 1] : depot, stop), 0);
  let distanceKm = Number((totalDistance / 1000).toFixed(2));
  let durationMin = Number((distanceKm * 1.5).toFixed(1));
  let routeGeometry = null;
  try {
    const metrics = await routeMetrics([depot, ...ordered]);
    distanceKm = Number((metrics.distance / 1000).toFixed(2));
    durationMin = Number((metrics.duration / 60).toFixed(1));
    routeGeometry = metrics.geometry;
  } catch (error) {
    console.warn("OSRM fallback route request failed:", error);
  }
  return {
    depot: depot.name || "Depot",
    order,
    routes: [{ vehicle_id: 0, stops: order, distance_km: distanceKm }],
    distance_km: distanceKm,
    duration_min: durationMin,
    naive_distance_km: Number((naiveDistance / 1000).toFixed(2)),
    pct_shorter: naiveDistance > 0 ? Math.round(((naiveDistance - totalDistance) / naiveDistance) * 100) : 0,
    distance_source: "straight-line-fallback",
    route_provider: "osrm",
    route_geometry: routeGeometry,
    solver: "nearest-neighbor heuristic (OSRM route fallback)",
    used_ortools: false,
  };
}

export async function insertRoutePlanWithFallback(supabase: SupabaseClient, payload: RoutePlan) {
  const legacyPayload = Object.fromEntries(Object.entries(payload).filter(([key]) => LEGACY_COLUMNS.includes(key)));
  let { data, error } = await supabase.from("route_plans").insert(payload).select("*").single();
  if (error && (/Could not find the table|schema cache|column .* of 'route_plans'/i.test(error.message) || error.code === "PGRST002")) {
    ({ data, error } = await supabase.from("route_plans").insert(legacyPayload).select("*").single());
  }
  return { data, error };
}

export function isRoutePlanSchemaUnavailable(error: { message?: string; code?: string } | null) {
  return Boolean(error && (error.code === "PGRST002" || /Could not find the table 'public\.route_plans'|Could not query the database for the schema cache/i.test(error.message || "")));
}

export function isOpenRoutePlan(record: RoutePlan) {
  return !record?.status || OPEN_STATUSES.has(String(record.status).trim().toLowerCase());
}

export function prepareRoutePlanPayload(body: RoutePlan, optimized: RoutePlan, finalStops: Point[]) {
  const submittedGeojson = body.route_geojson || body.routeGeojson || null;
  const routeGeojson = submittedGeojson && typeof submittedGeojson === "object" ? { ...submittedGeojson } : {};
  const raw = buildRoutePlanPayload({
    ...body,
    route_geojson: {
      ...routeGeojson,
      order: optimized.order,
      routes: optimized.routes || routeGeojson.routes || null,
      route_geometry: optimized.route_geometry || routeGeojson.route_geometry || null,
      distance_km: optimized.distance_km,
      estimated_duration_min: optimized.duration_min,
      generated_by: optimized.solver || body.generated_by || "OR-Tools",
    },
    distance_km: optimized.distance_km,
    estimated_duration_min: optimized.duration_min,
    fuel_savings: body.fuel_savings ?? body.fuelSavings ?? null,
    eta_impact_min: body.eta_impact_min ?? body.etaImpactMinutes ?? null,
    optimization_result: optimized,
    route_details: body.route_details || body.routeDetails || routeGeojson,
    generated_by: optimized.solver || "OR-Tools",
    delivery_destinations: finalStops,
    status: body.status || "assigned",
    created_by: body.created_by || null,
  });
  const payload = Object.fromEntries(Object.entries(raw).filter(([, value]) => value != null).filter(([key]) => ROUTE_PLAN_COLUMNS.has(key)));
  if (!payload.id) payload.id = randomUUID();
  return payload;
}