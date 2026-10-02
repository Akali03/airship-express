import { NextRequest, NextResponse } from "next/server";
import { OptimizeRequest, OptimizeResponse, OptimizeStop } from "../../lib/optimize";
import { runFtmPythonOptimizer } from "../../lib/server/ftmPythonOptimizer";

export const runtime = "nodejs";
export const maxDuration = 60;


function isValidLatLng(value: unknown): value is { lat: number; lng: number } {
  if (!value || typeof value !== "object") return false;
  const point = value as { lat?: number; lng?: number };
  const lat = Number(point.lat);
  const lng = Number(point.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
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

async function fetchOsrmCostMatrix(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  stops: Array<{ lat: number; lng: number }>
): Promise<{ distanceMatrix: number[][]; durationMatrix: number[][] } | null> {
  const points = [origin, ...stops, destination];
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";");
  const url = new URL(`https://router.project-osrm.org/table/v1/driving/${coordinates}`);
  url.searchParams.set("annotations", "distance,duration");

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
    });
    const responseText = await response.text();
    if (!response.ok) {
      console.warn("[optimize-route] OSRM table request failed", {
        status: response.status,
        details: responseText.slice(0, 1000),
      });
      return null;
    }

    const result = JSON.parse(responseText);
    if (result.code !== "Ok" || !Array.isArray(result.distances) || !Array.isArray(result.durations)) {
      console.warn("[optimize-route] OSRM returned an invalid cost matrix", {
        code: result.code,
        details: responseText.slice(0, 1000),
      });
      return null;
    }

    const validMatrix = (matrix: unknown[]) => matrix.length === points.length
      && matrix.every((row) => Array.isArray(row)
        && row.length === points.length
        && row.every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0));
    if (!validMatrix(result.distances) || !validMatrix(result.durations)) {
      console.warn("[optimize-route] OSRM returned null, negative, or non-finite matrix costs");
      return null;
    }
    const distanceMatrix = result.distances.map((row: number[]) => row.map((value) => value / 1609.344));
    const durationMatrix = result.durations.map((row: number[]) => row.map((value) => value / 60));
    return { distanceMatrix, durationMatrix };
  } catch (error) {
    console.warn("[optimize-route] OSRM table request failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
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

async function runOrTools(payload: OptimizeRequest): Promise<OptimizeResponse> {
  return runFtmPythonOptimizer(payload);
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
  const requestedStops = Array.isArray(body?.stops) ? body.stops : [];
  const safeStops = requestedStops.filter((stop: any) => typeof stop?.id === "string" && stop.id.trim() && isValidLatLng(stop));

  if (!safeOrigin || !safeDestination) {
    return NextResponse.json(
      { error: "origin and destination are required" },
      { status: 400 }
    );
  }
  if (!safeStops.length) return NextResponse.json({ error: "At least one stop with a valid ID and coordinates is required." }, { status: 400 });
  if (safeStops.length !== requestedStops.length) {
    return NextResponse.json({ error: "Every selected stop must have a unique ID and valid coordinates." }, { status: 400 });
  }
  if (new Set(safeStops.map((stop: any) => stop.id)).size !== safeStops.length) {
    return NextResponse.json({ error: "Selected stop IDs must be unique." }, { status: 400 });
  }

  const normalizedBody = {
    ...body,
    origin: safeOrigin,
    destination: safeDestination,
    stops: safeStops,
  };

  let result: OptimizeResponse;

  try {
    const roadCosts = await fetchOsrmCostMatrix(normalizedBody.origin, normalizedBody.destination, normalizedBody.stops);
    if (!roadCosts) {
      return NextResponse.json({
        error: "Unable to optimize route because OSRM did not provide a complete travel-time and distance matrix.",
      }, { status: 502 });
    }
    const solved = await runOrTools({
      ...normalizedBody,
      distanceMatrix: roadCosts.distanceMatrix,
      durationMatrix: roadCosts.durationMatrix,
    });
    const routeStopIds = solved.routes.flatMap((route) => route.orderedStopIds || []);
    const selectedStopIds = normalizedBody.stops.map((stop: any) => stop.id);
    if (solved.orderedStopIds.length !== selectedStopIds.length
      || new Set(solved.orderedStopIds).size !== selectedStopIds.length
      || solved.orderedStopIds.some((id) => !selectedStopIds.includes(id))
      || routeStopIds.length !== selectedStopIds.length
      || new Set(routeStopIds).size !== selectedStopIds.length
      || routeStopIds.some((id, index) => !selectedStopIds.includes(id) || id !== solved.orderedStopIds[index])) {
      throw Object.assign(new Error("OR-Tools did not return every selected stop exactly once."), { status: 502 });
    }
    const orderedStops = solved.orderedStopIds
      .map((id: string) => normalizedBody.stops.find((s: any) => s.id === id))
      .filter(Boolean) as OptimizeStop[];

    const routeResults = await Promise.all(
      solved.routes.map(async (route) => {
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

    const allOrderedStopIds = solved.routes.flatMap((route) => route.orderedStopIds || []);

    const allOrderedStops = (allOrderedStopIds || [])
      .map((id: string) => normalizedBody.stops.find((s: any) => s.id === id))
      .filter(Boolean)
      .map((stop: any) => ({ lat: stop.lat, lng: stop.lng })) as Array<{ lat: number; lng: number }>;

    const polyline = (await fetchOsrmPolyline(normalizedBody.origin, normalizedBody.destination, allOrderedStops)) ??
      routeResults[0]?.polyline ??
      [
        normalizedBody.origin,
        ...orderedStops.map((s: any) => ({ lat: s.lat, lng: s.lng })),
        normalizedBody.destination,
      ];
    const matrixRouteCost = (orderedIds: string[], matrix: number[][] | undefined) => {
      if (!matrix || matrix.length !== normalizedBody.stops.length + 2) return 0;
      const stopIndex = new Map(normalizedBody.stops.map((stop: any, index: number) => [stop.id, index + 1]));
      const indexes = [0, ...orderedIds.map((id) => stopIndex.get(id)!), normalizedBody.stops.length + 1];
      return indexes.slice(0, -1).reduce((total, from, index) => total + (matrix[from][indexes[index + 1]] ?? 0), 0);
    };
    const matrixRouteTotal = (matrix: number[][]) => solved.routes.reduce(
      (total, route) => total + matrixRouteCost(route.orderedStopIds || [], matrix),
      0
    );
    const baselineRoadDistanceMi = matrixRouteCost(normalizedBody.stops.map((stop: any) => stop.id), roadCosts.distanceMatrix);
    const displayedRoadDistanceMi = matrixRouteTotal(roadCosts.distanceMatrix);
    const baselineRoadDurationMin = matrixRouteCost(normalizedBody.stops.map((stop: any) => stop.id), roadCosts.durationMatrix);
    const displayedRoadDurationMin = Math.max(...solved.routes.map((route) => matrixRouteCost(route.orderedStopIds || [], roadCosts.durationMatrix)));
    const baselineDistanceMi = roundDistanceMi(body.initialDistanceMi ?? baselineRoadDistanceMi);
    const baselineEtaMinutes = Math.round(body.initialEtaMinutes ?? baselineRoadDurationMin);
    const selectedRoadDistanceMi = roundDistanceMi(displayedRoadDistanceMi);
    const selectedRoadEtaMinutes = Math.round(displayedRoadDurationMin);
    result = {
      orderedStopIds: solved.orderedStopIds,
      routes: routeResults,
      polyline,
      distanceMi: selectedRoadDistanceMi,
      etaMinutes: selectedRoadEtaMinutes,
      fuelSavingsPct: computeFuelSavingsPct(
        baselineDistanceMi,
        selectedRoadDistanceMi
      ),
      etaImprovementMin: Math.max(0, baselineEtaMinutes - selectedRoadEtaMinutes),
      baselineDistanceMi,
      baselineEtaMinutes,
      engine: solved.engine,
    };
  } catch (err) {
    const failure = err as Error & { status?: number; details?: unknown; upstreamStatus?: number };
    const status = failure.status || 502;
    console.error("[optimize-route] Python OR-Tools request failed", {
      message: failure.message || String(err),
      status,
      upstreamStatus: failure.upstreamStatus,
      details: failure.details,
    });
    return NextResponse.json({
      error: "OR-Tools optimization failed.",
      details: failure.message || "The Python OR-Tools request failed.",
      upstreamStatus: failure.upstreamStatus,
    }, { status });
  }

  return NextResponse.json(result);
}
