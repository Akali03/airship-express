import { createClient } from "../../library/supabase/server";
import { getDashboardMetrics } from "../../services/crm.service"
import { getPendingDocumentsCount } from "../../services/document.service"
import { getSlaOverviewData } from "../../services/sla.service"
import { Users, Package, Truck, ShieldCheck, Clock, AlertTriangle } from "lucide-react"
import ThemeToggle from "@/app/components/ThemeToggle"


const RECENT_LIMIT = 5

const CHANNEL_LABELS: Record<string, string> = {
  PORTAL: "Portal",
  WALK_IN: "Walk-in",
  PHONE_CALL: "Phone",
}

const BOOKING_STATUS_TONE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  SUBMITTED: "bg-blue-50 text-blue-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-zinc-100 text-zinc-600",
  DRAFT: "bg-zinc-100 text-zinc-600",
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default async function CrmDashboard() {
  const [metrics, pendingDocs, overview, supabase] = await Promise.all([
    getDashboardMetrics(),
    getPendingDocumentsCount(),
    getSlaOverviewData(),    
    createClient(),
  ])

  const { shipments, summary } = overview

  // Counts come from the real Freight Ops shipment_status enum.
  const shipmentStatusCounts = shipments.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1
    return acc
  }, {})

  // Delayed is included: a delayed parcel is still on the move.
  const inFlightStatuses = ["Booked", "Intake", "Batched", "Handed Over", "In Transit", "Customs Hold", "Delayed"]
  const activeShipments = inFlightStatuses.reduce(
    (total, status) => total + (shipmentStatusCounts[status] ?? 0),
    0
  )

  // Recent Customers 
  const { data: recentCustomers } = await supabase
    .from("customers")
    .select("id, customer_id, full_name, created_at")
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT)
  const { data: recentBookings } = await supabase
    .from("booking_requests")
    .select(`
      request_id,
      request_channel,
      status,
      created_at,
      customers:customer_id ( customer_id, full_name )
    `)
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT)

  // SLA Attention — shipments that need a staff member to act. Overdue means
  // past its delivery window and still moving; delayed means Freight Ops
  // flagged it late.
  const needsAttention = shipments
    .filter((s) => s.sla_status === "Delayed" || s.actual_delivery === null && s.sla_status !== "On Time")
    .sort((a, b) => (a.expected_delivery ?? "9999").localeCompare(b.expected_delivery ?? "9999"))
    .slice(0, RECENT_LIMIT)

  const kpis = [
    {
      label: "Total Customers",
      value: metrics.totalCustomers,
      icon: Users,
      color: "text-indigo-500",
    },
    {
      label: "Booking Requests",
      value: metrics.activeShipments,
      hint: "pending or accepted",
      icon: Package,
      color: "text-blue-500",
    },
    {
      label: "Active Shipments",
      value: activeShipments,
      hint: "in transit",
      icon: Truck,
      color: "text-blue-500",
    },
    {
      label: "SLA Compliance",
      value: `${summary.compliance}%`,
      hint: `${summary.onTime} on time · ${summary.late} late`,
      icon: ShieldCheck,
      color: summary.compliance >= 90 ? "text-emerald-500" : "text-amber-500",
    },
    {
      label: "Rejected",
      value: metrics.rejectedRequests,
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      label: "Pending Documents",
      value: pendingDocs,
      icon: Clock,
      color: "text-amber-500",
    },
  ]

  const activity = [
    { label: "New Customers", value: metrics.newCustomersThisMonth ?? 0 },
    { label: "Delivered", value: shipmentStatusCounts["Delivered"] ?? 0 },
    { label: "Overdue In-Flight", value: summary.overdue },
  ]

  return (
    <div className="w-full py-4 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Dashboard</h1>
          <p className="text-muted text-sm mt-0.5">
            What is happening in CRBC right now. Trends and reporting are in BI
            &amp; Analytics.
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map(({ label, value, hint, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-lg border border-line bg-background px-4 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-muted text-xs">{label}</p>
              <Icon size={14} className={`shrink-0 ${color}`} />
            </div>
            <p className="text-foreground mt-1 text-xl font-semibold">
              {value}
            </p>
            {hint && <p className="text-muted mt-0.5 text-[11px]">{hint}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Recent Customers ───────────────────────────────────── */}
        <section className="rounded-lg border border-line bg-background">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-foreground text-sm font-medium">
              Recent Customers
            </h2>
            <p className="text-muted mt-0.5 text-xs">
              The {RECENT_LIMIT} most recently registered accounts.
            </p>
          </div>

          {!recentCustomers || recentCustomers.length === 0 ? (
            <p className="text-muted px-5 py-10 text-center text-sm">
              No customers yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-5 py-2 font-medium">Name</th>
                  <th className="px-5 py-2 font-medium">Customer ID</th>
                  <th className="hidden px-5 py-2 font-medium sm:table-cell">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentCustomers.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-line/20">
                    <td className="text-foreground px-5 py-2.5 text-xs">
                      {c.full_name ?? "—"}
                    </td>
                    <td className="text-muted px-5 py-2.5 font-mono text-xs">
                      {c.customer_id}
                    </td>
                    <td className="text-muted hidden px-5 py-2.5 text-xs whitespace-nowrap sm:table-cell">
                      {shortDate(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ── Recent Bookings ────────────────────────────────────── */}
        <section className="rounded-lg border border-line bg-background">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-foreground text-sm font-medium">
              Recent Bookings
            </h2>
            <p className="text-muted mt-0.5 text-xs">
              The {RECENT_LIMIT} most recent requests, all channels.
            </p>
          </div>

          {!recentBookings || recentBookings.length === 0 ? (
            <p className="text-muted px-5 py-10 text-center text-sm">
              No booking requests yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-5 py-2 font-medium">Request</th>
                  <th className="px-5 py-2 font-medium">Channel</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentBookings.map((b) => {
                  const customer = Array.isArray(b.customers)
                    ? b.customers[0]
                    : b.customers

                  return (
                    <tr key={b.request_id} className="transition-colors hover:bg-line/20">
                      <td className="px-5 py-2.5">
                        <p className="font-mono text-xs text-accent">
                          {b.request_id}
                        </p>
                        <p className="text-muted text-xs">
                          {customer?.full_name ?? "—"}
                        </p>
                      </td>
                      <td className="text-muted px-5 py-2.5 text-xs">
                        {CHANNEL_LABELS[b.request_channel] ?? b.request_channel}
                      </td>
                      <td className="px-5 py-2.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            BOOKING_STATUS_TONE[b.status] ?? "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* ── SLA Attention ────────────────────────────────────────── */}
      {needsAttention.length > 0 && (
        <section className="rounded-lg border border-line bg-background">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-foreground text-sm font-medium">
              SLA Attention
            </h2>
            <p className="text-muted mt-0.5 text-xs">
              Shipments past their delivery window or flagged late by Freight
              Operations.
            </p>
          </div>

          <ul className="divide-y divide-line">
            {needsAttention.map((s) => (
              <li
                key={s.shipment_id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-line/20"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-accent">
                    {s.tracking_number ?? s.reference}
                  </p>
                  <p className="text-muted mt-0.5 text-xs">
                    {s.origin} → {s.destination}
                    {s.current_location ? ` · near ${s.current_location}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      s.sla_status === "Delayed"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {s.sla_status}
                  </span>
                  <p className="text-muted mt-0.5 text-[11px]">
                    {s.actual_delivery
                      ? `Delivered ${shortDate(s.actual_delivery)}`
                      : s.days_variance !== null && s.days_variance !== undefined
                        ? `${s.days_variance}d overdue`
                        : `Due ${s.expected_delivery ?? "—"}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Activity strip ───────────────────────────────────────── */}
      <section className="rounded-lg border border-line bg-background">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-foreground text-sm font-medium">Activity</h2>
        </div>
        <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {activity.map((a) => (
            <div key={a.label} className="px-5 py-3.5">
              <p className="text-muted text-xs">{a.label}</p>
              <p className="text-foreground mt-0.5 text-lg font-semibold">
                {a.value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}