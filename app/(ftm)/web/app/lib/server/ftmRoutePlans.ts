import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OptimizeRequest } from "../optimize";
import { runFtmPythonOptimizer } from "./ftmPythonOptimizer";

type Point = { name?: string; lat: number; lng: number; [key: string]: any };
type RoutePlan = Record<string, any>;
type OsrmCostMatrices = { distanceMatrix: number[][]; durationMatrix: number[][] };

async function fetchOsrmCostMatrices(points: Point[]): Promise<OsrmCostMatrices> {
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";");
  const url = new URL(`https://router.project-osrm.org/table/v1/driving/${coordinates}`);
  url.searchParams.set("annotations", "distance,duration");
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`OSRM table request failed with HTTP ${response.status}`);

  const result = await response.json();
  const isValidMatrix = (matrix: unknown) => Array.isArray(matrix)
    && matrix.length === points.length
    && matrix.every((row) => Array.isArray(row)
      && row.length === points.length
      && row.every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0));
  if (result?.code !== "Ok" || !isValidMatrix(result.distances) || !isValidMatrix(result.durations)) {
    throw new Error("OSRM did not return complete distance and duration matrices for every selected stop.");
  }

  return {
    distanceMatrix: result.distances.map((row: number[]) => row.map((meters) => meters / 1609.344)),
    durationMatrix: result.durations.map((row: number[]) => row.map((seconds) => seconds / 60)),
  };
}

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

export async function runFtmRouteOptimizer(
  depot: Point,
  stops: Point[],
  options: { numVehicles?: number; vehicleCapacities?: number[] } = {}
) {
  const stopById = new Map<string, Point>();
  const solverStops = stops.map((stop, index) => {
    const id = String(stop.id || stop.name || `stop-${index + 1}`);
    stopById.set(id, stop);
    return { ...stop, id, lat: Number(stop.lat), lng: Number(stop.lng) };
  });
  const vehicleCount = Math.max(1, Math.min(25, Math.floor(options.numVehicles || 1)));
  const availableVehicles = options.vehicleCapacities?.length === vehicleCount
    ? options.vehicleCapacities.map((capacityKg, index) => ({ id: `vehicle-${index + 1}`, capacityKg }))
    : [];
  const solverPayload: OptimizeRequest = {
    origin: { lat: Number(depot.lat), lng: Number(depot.lng) },
    destination: { lat: Number(depot.lat), lng: Number(depot.lng) },
    stops: solverStops,
    vehicleCount,
    availableVehicles,
    optimizationMode: "fastest",
  };
  const osrmCosts = await fetchOsrmCostMatrices([
    solverPayload.origin,
    ...solverStops,
    solverPayload.destination,
  ]);
  Object.assign(solverPayload, osrmCosts);
  const solved = await runFtmPythonOptimizer(solverPayload);
  const order = solved.orderedStopIds.map((id) => stopById.get(id)?.name || id);
  const distanceKm = Number((solved.distanceMi * 1.609344).toFixed(2));
  const durationMin = Number(solved.etaMinutes.toFixed(1));
  const routes = (solved.routes || []).map((route, index) => ({
    vehicle_id: index,
    stops: route.orderedStopIds.map((id) => stopById.get(id)?.name || id),
    distance_km: Number((route.distanceMi * 1.609344).toFixed(2)),
  }));
  const firstPolyline = solved.routes?.[0]?.polyline || [];

  return {
    depot: depot.name || "Depot",
    order,
    routes,
    distance_km: distanceKm,
    duration_min: durationMin,
    naive_distance_km: distanceKm,
    pct_shorter: 0,
    distance_source: "osrm-road-distance",
    route_provider: "osrm-table-costs",
    route_geometry: firstPolyline.length
      ? { type: "LineString", coordinates: firstPolyline.map((point) => [point.lng, point.lat]) }
      : null,
    solver: "OR-Tools (GUIDED_LOCAL_SEARCH)",
    used_ortools: true,
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