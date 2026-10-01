import { NextRequest, NextResponse } from "next/server";
import { OptimizeRequest, OptimizeResponse, OptimizeStop } from "../../lib/optimize";

export const runtime = "nodejs";
export const maxDuration = 60;

const DESTINATION_NAME = "__FTM_ROUTE_DESTINATION__";
const SERVICE_TIMEOUT_MS = 55_000;
const MILES_PER_KILOMETER = 0.621371;

type ServiceOptimizeResponse = {
  destination?: string | null;
  order?: unknown;
  routes?: Array<{ vehicle_id?: number; stops?: unknown; distance_km?: number }>;
  distance_km?: number;
  naive_distance_km?: number;
  solver?: string;
};

function createServiceError(message: string, status: number, details?: unknown, upstreamStatus?: number) {
  return Object.assign(new Error(message), { status, details, upstreamStatus });
}

function getOptimizerUrl(): string {
  const configuredUrl = process.env.ORTOOLS_SERVICE_URL;
  if (!configuredUrl) {
    throw createServiceError("ORTOOLS_SERVICE_URL is not configured on the server.", 503);
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw createServiceError("ORTOOLS_SERVICE_URL must be a valid absolute URL.", 500);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw createServiceError("ORTOOLS_SERVICE_URL must use HTTP or HTTPS.", 500);
  }

  const path = url.pathname.replace(/\/+$/, "");
  if (!path.endsWith("/optimize")) url.pathname = `${path}/optimize`;
  return url.toString();
}

function isValidLatLng(value: unknown): value is { lat: number; lng: number } {
  if (!value || typeof value !== "object") return false;
  const point = value as { lat?: number; lng?: number };
  const lat = Number(point.lat);
  const lng = Number(point.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function buildWarehouseFirstPolyline(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  stops: Array<{ id?: string; kind?: "warehouse" | "parcel"; lat: number; lng: number }>
): Array<{ lat: number; lng: number }> {
  const warehouseStops = stops.filter((stop) => stop.kind === "warehouse");
  const parcelStops = stops.filter((stop) => stop.kind !== "warehouse");
  const orderedStops = [...warehouseStops, ...parcelStops];
  return [origin, ...orderedStops.map((stop) => ({ lat: stop.lat, lng: stop.lng })), destination];
}

async function fetchOsrmPolyline(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  stops: Array<{ lat: number; lng: number }>
): Promise<Array<{ lat: number; lng: number }> | null> {
  try {
    const safeStops = stops.filter((stop) => isValidLatLng(stop));
    const coords = [
      [origin.lng, origin.lat],
      ...safeStops.map((stop) => [stop.lng, stop.lat]),
      [destination.lng, destination.lat],
    ].filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat) && !(lat === 0 && lng === 0));

    if (coords.length < 2) return null;

    const url = new URL("https://router.project-osrm.org/route/v1/driving/" + coords.map((coord) => coord.join(",")).join(";"));
    url.searchParams.set("geometries", "geojson");
    url.searchParams.set("overview", "full");
    url.searchParams.set("steps", "false");

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();
    const geometry = json?.routes?.[0]?.geometry;
    if (!geometry || geometry.type !== "LineString") return null;

    return geometry.coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng }));
  } catch {
    return null;
  }
}

function calcDistanceMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function calculateRouteDistanceMi(points: Array<{ lat: number; lng: number }>): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += calcDistanceMiles(points[i], points[i + 1]);
  }
  return total;
}

function roundDistanceMi(value: number): number {
  return Math.round(value * 10) / 10;
}

function computeFuelSavingsPct(baselineDistanceMi: number, optimizedDistanceMi: number): number {
  if (!Number.isFinite(baselineDistanceMi) || baselineDistanceMi <= 0) return 0;
  const savingsPct = ((baselineDistanceMi - optimizedDistanceMi) / baselineDistanceMi) * 100;
  if (!Number.isFinite(savingsPct)) return 0;
  return Math.max(0, Math.min(100, savingsPct));
}

async function runOrTools(payload: OptimizeRequest): Promise<{
  orderedStopIds: string[];
  routes?: Array<{
    vehicleId: string;
    orderedStopIds: string[];
    polyline: Array<{ lat: number; lng: number }>;
    distanceMi: number;
    etaMinutes: number;
  }>;
  distanceMi: number;
  etaMinutes: number;
}> {
  const url = getOptimizerUrl();
  if (payload.stops.some((stop) => stop.id === DESTINATION_NAME)) {
    throw createServiceError("A route stop uses a reserved optimizer identifier.", 400);
  }

  const servicePayload = {
    depot: { name: ("label" in payload.origin && payload.origin.label) || "Airship Express depot", lat: payload.origin.lat, lng: payload.origin.lng },
    destination: { name: DESTINATION_NAME, lat: payload.destination.lat, lng: payload.destination.lng },
    stops: payload.stops.map((stop) => ({ name: stop.id, lat: stop.lat, lng: stop.lng })),
    num_vehicles: Math.max(1, Math.min(25, Math.floor(payload.vehicleCount || 1))),
    use_road_distance: true,
    time_limit_secs: 5,
  };
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  if (process.env.OPTIMIZER_API_KEY) headers["X-API-Key"] = process.env.OPTIMIZER_API_KEY;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(servicePayload),
      cache: "no-store",
      signal: AbortSignal.timeout(SERVICE_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw createServiceError(
      timedOut ? `OR-Tools service timed out after ${SERVICE_TIMEOUT_MS} ms.` : "Could not connect to the OR-Tools service.",
      timedOut ? 504 : 502,
      error instanceof Error ? error.message : String(error)
    );
  }

  const responseText = await response.text();
  let serviceResult: ServiceOptimizeResponse;
  try {
    serviceResult = JSON.parse(responseText) as ServiceOptimizeResponse;
  } catch {
    throw createServiceError(
      `OR-Tools service returned invalid JSON (HTTP ${response.status}).`,
      502,
      responseText.slice(0, 2000),
      response.status
    );
  }
  if (!response.ok) {
    const serviceMessage = (serviceResult as any)?.detail || (serviceResult as any)?.error || response.statusText;
    throw createServiceError(
      `OR-Tools service returned HTTP ${response.status}: ${serviceMessage || "request failed"}`,
      502,
      responseText.slice(0, 2000),
      response.status
    );
  }
  if (serviceResult.destination !== DESTINATION_NAME) {
    throw createServiceError(
      "The deployed OR-Tools service does not support terminal destinations; deploy the updated optimizer service.",
      502,
      responseText.slice(0, 2000),
      response.status
    );
  }
  if (!String(serviceResult.solver || "").toLowerCase().includes("or-tools")) {
    throw createServiceError("The optimizer service response does not confirm an OR-Tools solve.", 502, responseText.slice(0, 2000), response.status);
  }

  const stopsById = new Map(payload.stops.map((stop) => [stop.id, stop]));
  const mapServiceStops = (names: unknown): string[] => {
    if (!Array.isArray(names)) throw createServiceError("OR-Tools service response has no stop order.", 502, responseText.slice(0, 2000), response.status);
    const ids = names.map((name) => String(name));
    if (ids.some((id) => !stopsById.has(id))) {
      throw createServiceError("OR-Tools service returned an unknown stop identifier.", 502, responseText.slice(0, 2000), response.status);
    }
    return ids;
  };
  const orderedStopIds = mapServiceStops(serviceResult.order);
  if (orderedStopIds.length !== payload.stops.length || new Set(orderedStopIds).size !== payload.stops.length) {
    throw createServiceError("OR-Tools service did not return every route stop exactly once.", 502, responseText.slice(0, 2000), response.status);
  }

  const rawRoutes = Array.isArray(serviceResult.routes) && serviceResult.routes.length
    ? serviceResult.routes
    : [{ stops: orderedStopIds, distance_km: serviceResult.distance_km }];
  const routes = rawRoutes.map((route, index) => {
    const routeStopIds = mapServiceStops(route.stops);
    const routeStops = routeStopIds.map((id) => stopsById.get(id)!);
    const distanceMi = Number(route.distance_km ?? 0) * MILES_PER_KILOMETER;
    return {
      vehicleId: String(route.vehicle_id ?? index + 1),
      orderedStopIds: routeStopIds,
      polyline: [payload.origin, ...routeStops.map(({ lat, lng }) => ({ lat, lng })), payload.destination],
      distanceMi,
      etaMinutes: Math.max(1, Math.round((distanceMi / 32) * 60)),
    };
  });
  const distanceMi = Number(serviceResult.distance_km ?? 0) * MILES_PER_KILOMETER;
  if (!Number.isFinite(distanceMi) || distanceMi <= 0) {
    throw createServiceError("OR-Tools service returned an invalid route distance.", 502, responseText.slice(0, 2000), response.status);
  }

  return {
    orderedStopIds,
    routes,
    distanceMi,
    etaMinutes: Math.max(1, Math.round((distanceMi / 32) * 60)),
  };
}

export async function POST(req: NextRequest) {
  let body: OptimizeRequest;
  try {
    body = (await req.json()) as OptimizeRequest;
  } catch {
    return NextResponse.json({ error: "A valid JSON request body is required." }, { status: 400 });
  }
  const safeOrigin = isValidLatLng(body?.origin) ? body.origin : null;
  const safeDestination = isValidLatLng(body?.destination) ? body.destination : null;
  const safeStops = Array.isArray(body?.stops) ? body.stops.filter((stop: any) => isValidLatLng(stop)) : [];

  if (!safeOrigin || !safeDestination) {
    return NextResponse.json(
      { error: "origin and destination are required" },
      { status: 400 }
    );
  }

  const normalizedBody = {
    ...body,
    origin: safeOrigin,
    destination: safeDestination,
    stops: safeStops,
  };

  let result: OptimizeResponse;

  try {
    const roadCosts: { distanceMatrix: number[][]; durationMatrix: number[][] } | null = null;
    const solved = await runOrTools(normalizedBody);
    const orderedStops = solved.orderedStopIds
      .map((id: string) => normalizedBody.stops.find((s: any) => s.id === id))
      .filter(Boolean) as OptimizeStop[];

    const directFallbackPolyline = buildWarehouseFirstPolyline(
      normalizedBody.origin,
      normalizedBody.destination,
      normalizedBody.stops.map((stop: any) => ({ id: stop.id, kind: stop.kind, lat: stop.lat, lng: stop.lng }))
    );

    const routeSegments = (solved.routes?.length ? solved.routes : [{
      vehicleId: "vehicle-1",
      orderedStopIds: solved.orderedStopIds,
      polyline: body.stops.some((stop: any) => stop.kind === "warehouse") ? directFallbackPolyline : [
        body.origin,
        ...orderedStops.map((s: any) => ({ lat: s.lat, lng: s.lng })),
        body.destination,
      ],
      distanceMi: solved.distanceMi,
      etaMinutes: solved.etaMinutes,
    }]) as Array<{
      vehicleId: string;
      orderedStopIds: string[];
      polyline: Array<{ lat: number; lng: number }>;
      distanceMi: number;
      etaMinutes: number;
    }>;

    const routeResults = await Promise.all(
      routeSegments.map(async (route) => {
        const routeStops = (route.orderedStopIds || [])
          .map((id: string) => normalizedBody.stops.find((s: any) => s.id === id))
          .filter(Boolean)
          .map((stop: any) => ({ lat: stop.lat, lng: stop.lng })) as Array<{ lat: number; lng: number }>;

        const osrmRoutePolyline = await fetchOsrmPolyline(normalizedBody.origin, normalizedBody.destination, routeStops);
        const polyline = osrmRoutePolyline ?? route.polyline ?? [
          normalizedBody.origin,
          ...routeStops,
          normalizedBody.destination,
        ];

        return {
          ...route,
          polyline,
        };
      })
    );

    const allOrderedStopIds = solved.routes?.length
      ? solved.routes.flatMap((route) => route.orderedStopIds || [])
      : solved.orderedStopIds;

    const allOrderedStops = (allOrderedStopIds || [])
      .map((id: string) => normalizedBody.stops.find((s: any) => s.id === id))
      .filter(Boolean)
      .map((stop: any) => ({ lat: stop.lat, lng: stop.lng })) as Array<{ lat: number; lng: number }>;

    const polyline = (await fetchOsrmPolyline(normalizedBody.origin, normalizedBody.destination, allOrderedStops.length ? allOrderedStops : normalizedBody.stops.map((stop: any) => ({ lat: stop.lat, lng: stop.lng })))) ??
      routeResults[0]?.polyline ??
      (normalizedBody.stops.some((stop: any) => stop.kind === "warehouse") ? buildWarehouseFirstPolyline(normalizedBody.origin, normalizedBody.destination, normalizedBody.stops) : [
        normalizedBody.origin,
        ...orderedStops.map((s: any) => ({ lat: s.lat, lng: s.lng })),
        normalizedBody.destination,
      ]);

    // Use the initial metrics if provided, otherwise calculate a straight-line fallback.
    const straightLineBaselineMi = (() => {
      const pts = [normalizedBody.origin, ...normalizedBody.stops, normalizedBody.destination];
      return calculateRouteDistanceMi(pts);
    })();

    const baselinePolyline = await fetchOsrmPolyline(
      normalizedBody.origin,
      normalizedBody.destination,
      normalizedBody.stops.map((stop) => ({ lat: stop.lat, lng: stop.lng }))
    );
    const matrixRouteCost = (orderedIds: string[], matrix: number[][] | undefined) => {
      if (!matrix || matrix.length !== normalizedBody.stops.length + 2) return 0;
      const stopIndex = new Map(normalizedBody.stops.map((stop: any, index: number) => [stop.id, index + 1]));
      const indexes = [0, ...orderedIds.map((id) => stopIndex.get(id)).filter((index): index is number => index !== undefined), normalizedBody.stops.length + 1];
      return indexes.slice(0, -1).reduce((total, from, index) => total + (matrix[from]?.[indexes[index + 1]] || 0), 0);
    };
    const matrixRouteTotal = (matrix: number[][] | undefined) => solved.routes?.length
      ? solved.routes.reduce((total, route) => total + matrixRouteCost(route.orderedStopIds || [], matrix), 0)
      : matrixRouteCost(solved.orderedStopIds, matrix);
    const baselineRoadDistanceMi = roadCosts?.distanceMatrix
      ? matrixRouteCost(normalizedBody.stops.map((stop: any) => stop.id), roadCosts.distanceMatrix)
      : baselinePolyline?.length
      ? calculateRouteDistanceMi(baselinePolyline)
      : 0;
    const displayedRoadDistanceMi = roadCosts?.distanceMatrix
      ? matrixRouteTotal(roadCosts.distanceMatrix)
      : calculateRouteDistanceMi(polyline);
    const baselineRoadDurationMin = roadCosts?.durationMatrix
      ? matrixRouteCost(normalizedBody.stops.map((stop: any) => stop.id), roadCosts.durationMatrix)
      : 0;
    const displayedRoadDurationMin = roadCosts?.durationMatrix
      ? solved.routes?.length
        ? Math.max(...solved.routes.map((route) => matrixRouteCost(route.orderedStopIds || [], roadCosts.durationMatrix)))
        : matrixRouteCost(solved.orderedStopIds, roadCosts.durationMatrix)
      : 0;
    const baselineDistanceMi = roundDistanceMi(body.initialDistanceMi
      ?? (baselineRoadDistanceMi > 0 ? baselineRoadDistanceMi : straightLineBaselineMi));
    const baselineEtaMinutes = body.initialEtaMinutes
      ?? (baselineRoadDurationMin > 0
        ? Math.max(1, Math.round(baselineRoadDurationMin))
        : Math.max(1, Math.round((baselineDistanceMi / 32) * 60)));
    const displayedEtaMinutes = displayedRoadDurationMin > 0
      ? Math.max(1, Math.round(displayedRoadDurationMin))
      : Math.max(1, Math.round((displayedRoadDistanceMi / 32) * 60));
    const isTimeObjective = body.optimizationMode === "fastest" || body.optimizationMode === "balanced";
    const useBaselineRoute = baselineRoadDistanceMi > 0 && (isTimeObjective
      ? displayedEtaMinutes > baselineEtaMinutes
      : displayedRoadDistanceMi > baselineDistanceMi);
    const selectedRoadPolyline = useBaselineRoute && baselinePolyline?.length ? baselinePolyline : polyline;
    const selectedRoadDistanceMi = roadCosts?.distanceMatrix
      ? roundDistanceMi(useBaselineRoute ? baselineRoadDistanceMi : displayedRoadDistanceMi)
      : roundDistanceMi(calculateRouteDistanceMi(selectedRoadPolyline));
    const selectedRoadEtaMinutes = Math.max(1, Math.round(roadCosts?.durationMatrix
      ? useBaselineRoute ? baselineRoadDurationMin : displayedRoadDurationMin
      : (selectedRoadDistanceMi / 32) * 60));
    result = {
      orderedStopIds: solved.orderedStopIds,
      routes: routeResults,
      polyline: selectedRoadPolyline,
      distanceMi: selectedRoadDistanceMi > 0 ? selectedRoadDistanceMi : solved.distanceMi,
      etaMinutes: selectedRoadDistanceMi > 0 ? selectedRoadEtaMinutes : solved.etaMinutes,
      fuelSavingsPct: computeFuelSavingsPct(
        baselineDistanceMi,
        selectedRoadDistanceMi > 0 ? selectedRoadDistanceMi : solved.distanceMi
      ),
      etaImprovementMin: Math.max(0, baselineEtaMinutes - (selectedRoadDistanceMi > 0 ? selectedRoadEtaMinutes : solved.etaMinutes)),
      baselineDistanceMi,
      baselineEtaMinutes,
      engine: "or-tools",
    };
  } catch (err) {
    const failure = err as Error & { status?: number; details?: unknown; upstreamStatus?: number };
    const status = failure.status || 502;
    console.error("[optimize-route] OR-Tools service request failed", {
      message: failure.message || String(err),
      status,
      upstreamStatus: failure.upstreamStatus,
      details: failure.details,
    });
    return NextResponse.json({
      error: "OR-Tools optimization failed.",
      details: failure.message || "The OR-Tools service request failed.",
      upstreamStatus: failure.upstreamStatus,
    }, { status });
  }

  return NextResponse.json(result);
}
