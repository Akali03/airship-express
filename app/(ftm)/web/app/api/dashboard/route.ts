import { NextResponse } from "next/server";
import { hasPermission } from "../../lib/permissions";
import { authenticateFtmRequest } from "../../lib/server/ftmRequestAuth";
import { createFtmParcelClient } from "../../lib/server/ftmSupabase";
import { normalizeTrip } from "../../lib/server/ftmTrips";
import { normalizeVehicle } from "../../lib/server/ftmVehicles";
import { normalizeRoutePlan } from "../../lib/server/ftmRoutePlans";

export const dynamic = "force-dynamic";

const SEED_TRIP_ID = /^D-TEST/;
const SEED_DRIVER_IDS = new Set(["a5d87bb4-d3a4-49c0-9bd7-6c5053233efe", "88657e7d-166f-4bb1-84a9-d7eee51d22c8"]);
const SEED_DRIVER_EMAILS = new Set(["demo.driver@example.com"]);
const SEED_PLATES = new Set(["ABC-014", "TRK-014"]);
const DEMO_DRIVER_NAME = /demo driver/i;

function isSeedTrip(trip: Record<string, any>) {
  return SEED_TRIP_ID.test(String(trip?.id ?? trip?.trip_id ?? trip?.code ?? "")) ||
    SEED_PLATES.has(String(trip?.vehicle_id ?? trip?.vehicle ?? trip?.plate ?? "")) ||
    SEED_DRIVER_IDS.has(String(trip?.driver_id ?? trip?.driver ?? ""));
}

function isSeedDriver(driver: Record<string, any>) {
  return SEED_DRIVER_IDS.has(driver.id) || SEED_DRIVER_EMAILS.has(driver.email) ||
    (typeof driver.full_name === "string" && DEMO_DRIVER_NAME.test(driver.full_name)) ||
    (typeof driver.name === "string" && DEMO_DRIVER_NAME.test(driver.name));
}

function addDriverLocation(driver: Record<string, any>, location: Record<string, any> | undefined) {
  if (!location) return driver;
  const lat = location.lat ?? location.latitude ?? location.location_lat;
  const lng = location.lng ?? location.longitude ?? location.location_lng;
  if (lat != null && lng != null) {
    driver.last_location_lat = Number(lat);
    driver.last_location_lng = Number(lng);
    driver.last_location_latitude = Number(lat);
    driver.last_location_longitude = Number(lng);
    driver.location = { lat: Number(lat), lng: Number(lng) };
    driver.latitude = Number(lat);
    driver.longitude = Number(lng);
  }
  if (location.recorded_at) {
    driver.last_location_at = location.recorded_at;
    driver.last_seen_at = location.recorded_at;
  }
  if (!driver.vehicle_id && location.vehicle_id) driver.vehicle_id = location.vehicle_id;
  return driver;
}

function fallbackSnapshot() {
  return { counts: { vehicles: 0, trips: 0, bookings: 0, drivers: 0, parcels: 0 }, vehicles: [], trips: [], bookings: [], parcels: [], drivers: [] };
}

export async function GET(request: Request) {
  const auth = await authenticateFtmRequest(request);
  if (!("context" in auth)) return auth.response;
  const { context } = auth;
  if (!hasPermission(context.user.role, "operations", "view")) {
    return NextResponse.json({ error: "Permission denied: operations.view" }, { status: 403 });
  }
  const supabase = context.serviceClient;
  const parcelsSupabase = createFtmParcelClient() || supabase;

  try {
    const [vehiclesResult, tripsResult, bookingsResult, parcelsResult, routePlansResult, initialDriversResult] = await Promise.all([
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("trips").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(200),
      parcelsSupabase.from("parcels").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("route_plans").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("users").select("id,email,full_name,avatar_url,role,phone,created_at,updated_at").eq("role", "driver").order("full_name", { ascending: true }).limit(150),
    ]);

    let driversResult: { data: Record<string, any>[] | null; error: { message: string; code?: string } | null } = initialDriversResult;
    if (driversResult.error && /avatar_url.*does not exist|column.*avatar_url/i.test(driversResult.error.message)) {
      driversResult = await supabase.from("users").select("id,email,full_name,role,phone,created_at,updated_at").eq("role", "driver").order("full_name", { ascending: true }).limit(150);
    }

    const coreError = vehiclesResult.error || tripsResult.error || bookingsResult.error || routePlansResult.error;
    if (coreError) {
      if (/relationship|schema cache|Could not find the table|Could not find a relationship/i.test(coreError.message) || ["PGRST002", "42501", "PGRST303"].includes(coreError.code || "")) {
        return NextResponse.json(fallbackSnapshot());
      }
      return NextResponse.json({ error: "Failed to fetch dashboard snapshot data" }, { status: 500 });
    }

    const routePlans = (routePlansResult.data || []).map(normalizeRoutePlan);
    const routePlanById = new Map(routePlans.map((routePlan) => [String(routePlan.id), routePlan]));
    const bookings = (bookingsResult.data || []).map((booking) => ({
      ...booking,
      routePlan: booking.route_plan_id ? routePlanById.get(String(booking.route_plan_id)) || null : null,
    }));
    const bookingById = new Map(bookings.map((booking) => [String(booking.id), booking]));
    const driverRows = driversResult.data || [];
    const driverIds = driverRows.map((driver) => driver.id);
    const vehicleRows = vehiclesResult.data || [];
    const vehicleIds = vehicleRows.map((vehicle) => vehicle.id ?? vehicle.vehicle_id).filter(Boolean);

    const [assignmentResult, mobileResult, trackingResult] = await Promise.all([
      vehicleIds.length ? supabase.from("driver_assignments").select("vehicle_id,driver_id").in("vehicle_id", vehicleIds) : Promise.resolve({ data: [] as any[] }),
      driverIds.length ? supabase.from("mobile_device_tracking").select("driver_id,vehicle_id,lat,lng,latitude,longitude,recorded_at").in("driver_id", driverIds).order("recorded_at", { ascending: false }) : Promise.resolve({ data: [] as any[] }),
      driverIds.length ? supabase.from("driver_tracking").select("driver_id,vehicle_id,latitude,longitude,recorded_at").in("driver_id", driverIds).order("recorded_at", { ascending: false }) : Promise.resolve({ data: [] as any[] }),
    ]);

    const assignments = new Map<string, string>();
    (assignmentResult.data || []).forEach((row) => {
      if (row?.vehicle_id && row?.driver_id && !assignments.has(String(row.vehicle_id))) assignments.set(String(row.vehicle_id), String(row.driver_id));
    });
    const mobileByDriver = new Map<string, Record<string, any>>();
    (mobileResult.data || []).forEach((row) => { if (row?.driver_id && !mobileByDriver.has(String(row.driver_id))) mobileByDriver.set(String(row.driver_id), row); });
    const trackingByDriver = new Map<string, Record<string, any>>();
    (trackingResult.data || []).forEach((row) => { if (row?.driver_id && !trackingByDriver.has(String(row.driver_id))) trackingByDriver.set(String(row.driver_id), row); });

    const drivers = driverRows.filter((driver) => !isSeedDriver(driver)).map((driver) => {
      const enriched = {
        id: driver.id,
        email: driver.email,
        full_name: driver.full_name || null,
        name: driver.full_name || null,
        role: driver.role || null,
        phone: driver.phone || null,
        created_at: driver.created_at,
        updated_at: driver.updated_at,
        vehicle_id: null as string | null,
      };
      const assignment = assignmentResult.data?.find((row: any) => String(row.driver_id) === String(driver.id));
      if (assignment?.vehicle_id) enriched.vehicle_id = assignment.vehicle_id;
      return addDriverLocation(enriched, mobileByDriver.get(String(driver.id)) || trackingByDriver.get(String(driver.id)));
    });
    const driverById = new Map(drivers.map((driver) => [String(driver.id), driver]));

    const vehicles = vehicleRows.map((row) => {
      const vehicle = normalizeVehicle(row);
      const vehicleId = String(vehicle.id ?? vehicle.vehicle_id ?? row.id ?? row.vehicle_id);
      const assignedDriverId = assignments.get(vehicleId) || null;
      const driver = assignedDriverId ? driverById.get(assignedDriverId) : null;
      const locationDriver = driver && driver.last_location_lat != null && driver.last_location_lng != null ? driver : null;
      const driverName = driver?.full_name || vehicle.driverName || vehicle.driver || null;
      return {
        ...vehicle,
        driver_id: assignedDriverId,
        driver: driverName,
        driverName,
        locationLat: locationDriver?.last_location_lat ?? vehicle.locationLat ?? null,
        locationLng: locationDriver?.last_location_lng ?? vehicle.locationLng ?? null,
        locationSource: locationDriver ? "driver_app" : "vehicle",
        locationRecordedAt: locationDriver?.last_location_at ?? null,
      };
    });

    const trips = (tripsResult.data || []).map((trip) => {
      const booking = trip.booking_id ? bookingById.get(String(trip.booking_id)) : null;
      const driver = trip.driver_id ? driverById.get(String(trip.driver_id)) : null;
      const routePlan = trip.route_plan_id ? routePlanById.get(String(trip.route_plan_id)) : null;
      return normalizeTrip({
        ...trip,
        bookings: booking || null,
        routePlan: routePlan || null,
        distance_km: routePlan?.optimizedDistanceKm ?? trip.distance_km,
        duration_minutes: routePlan?.optimizedDurationMinutes ?? trip.duration_minutes,
        from_location: trip.from_location || booking?.pickup_location || null,
        to_location: trip.to_location || booking?.dropoff_location || null,
        from_latitude: driver?.last_location_lat ?? trip.from_latitude ?? booking?.pickup_latitude ?? null,
        from_longitude: driver?.last_location_lng ?? trip.from_longitude ?? booking?.pickup_longitude ?? null,
        to_latitude: trip.to_latitude ?? booking?.dropoff_latitude ?? null,
        to_longitude: trip.to_longitude ?? booking?.dropoff_longitude ?? null,
        load_kg: trip.load_kg ?? booking?.cargo_weight ?? null,
      });
    }).filter((trip) => !isSeedTrip(trip));
    const parcels = parcelsResult.error ? [] : parcelsResult.data || [];

    const deployments = trips.map((trip) => {
      const booking = trip.booking_id ? bookingById.get(String(trip.booking_id)) : null;
      const routePlan = trip.route_plan_id ? routePlanById.get(String(trip.route_plan_id)) : null;
      const stops = routePlan?.delivery_destinations || routePlan?.stops || [];
      const lastStop = stops[stops.length - 1];
      const latitude = Number(trip.to_latitude ?? lastStop?.latitude ?? booking?.dropoff_latitude ?? routePlan?.destination_latitude ?? 0);
      const longitude = Number(trip.to_longitude ?? lastStop?.longitude ?? booking?.dropoff_longitude ?? routePlan?.destination_longitude ?? 0);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) return null;
      const status = /delayed|late|delay|critical/i.test(String(trip.status)) ? "Delayed" : /approach|arriv|near/i.test(String(trip.status)) ? "Approaching" : "In Transit";
      const eta = trip.estimated_arrival ? new Date(trip.estimated_arrival) : null;
      const flightTimeLeft = eta && !Number.isNaN(eta.getTime()) ? `${Math.max(0, Math.ceil((eta.getTime() - Date.now()) / 60000))} min` : trip.duration_minutes ? `${trip.duration_minutes} min` : "--:--";
      return {
        vesselId: trip.id || null,
        destination: trip.to_location || booking?.dropoff_location || routePlan?.destination || lastStop?.name || "Assigned route",
        status,
        flightTimeLeft,
        cargoWeight: trip.load_kg || booking?.cargo_weight || routePlan?.cargo_weight || "-",
        lat: latitude,
        lng: longitude,
      };
    }).filter(Boolean);
    const hubs = routePlans.map((routePlan) => {
      const lat = routePlan.pickup_latitude ?? routePlan.pickupLatitude ?? routePlan.hub_latitude;
      const lng = routePlan.pickup_longitude ?? routePlan.pickupLongitude ?? routePlan.hub_longitude;
      return !lat || !lng ? null : { name: routePlan.name || routePlan.route_name || routePlan.hub_name || "Hub", lat: Number(lat), lng: Number(lng) };
    }).filter(Boolean);
    const labels = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
    const hourlyDispatchTrend = labels.map((time, index) => ({
      time,
      volume: trips.filter((trip) => {
        const timestamp = trip.created_at || trip.createdAt;
        if (!timestamp) return false;
        const date = new Date(timestamp);
        return !Number.isNaN(date.getTime()) && date.getHours() >= index * 3 && date.getHours() < (index + 1) * 3;
      }).length,
    }));

    return NextResponse.json({
      counts: { vehicles: vehicles.length, trips: trips.length, bookings: bookings.length, drivers: drivers.length, parcels: parcels.length },
      vehicles,
      trips,
      bookings,
      parcels,
      drivers,
      routePlans,
      routePlanBookings: [],
      deployments,
      hubs: hubs.length ? hubs : [{ name: "Hub Alpha - Manila", lat: 14.5995, lng: 120.9842 }],
      hourlyDispatchTrend,
    });
  } catch (error) {
    console.error("Dashboard snapshot error:", error);
    return NextResponse.json({ error: "Unable to load dashboard snapshot" }, { status: 500 });
  }
}