import Link from "next/link";
import { FileText } from "lucide-react";
import { requirePermission } from "../../library/auth/rbac.server";
import { getAnalyticsSummary, getBookingAnalytics } from "../../services/analytics.service";
import AnalyticsSection from "../../components/analytics/AnalyticsSection";
import {
  ChartEmpty,
  CountBarChart,
  DonutChart,
  KpiCard,
  TrendBarChart,
  TrendLineChart,
} from "../../components/analytics/Charts";


export default async function AnalyticsPage() {
  await requirePermission("analytics.view");

  const [data, booking] = await Promise.all([
    getAnalyticsSummary(),
    getBookingAnalytics(),
  ]);

  const statusColors: Record<string, string> = {
    Booked: "#f59e0b",
    "In Transit": "#3b82f6",
    "Handed Over": "#06b6d4",
    Batched: "#14b8a6",
    Delivered: "#10b981",
    Delayed: "#f97316",
    "Customs Hold": "#a855f7",
    Cancelled: "#6b7280",
    Archived: "#9ca3af",
    Intake: "#d4d4d8",
  };

  const slaDonut = [
    { name: "On time", value: data.onTimeShipments, color: "#10b981" },
    { name: "Late", value: data.lateShipments, color: "#f97316" },
    { name: "Overdue in-flight", value: data.overdueInFlight, color: "#ef4444" },
  ];

  const bookingStatusDonut = [
    {
      name: "Pending",
      value: booking.bookingsByStatus.find((s) => s.status === "PENDING")?.count ?? 0,
      color: "#f59e0b",
    },
    {
      name: "Accepted",
      value: booking.bookingsByStatus.find((s) => s.status === "ACCEPTED")?.count ?? 0,
      color: "#10b981",
    },
    {
      name: "Rejected",
      value: booking.bookingsByStatus.find((s) => s.status === "REJECTED")?.count ?? 0,
      color: "#ef4444",
    },
    {
      name: "Cancelled",
      value: booking.bookingsByStatus.find((s) => s.status === "CANCELLED")?.count ?? 0,
      color: "#6b7280",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            BI &amp; Freight Analytics
          </h1>
          <p className="text-muted mt-0.5 text-sm">
            Business and operational performance across CRBC and Freight
            Operations.
          </p>
        </div>
        <Link
          href="/crbc/analytics/reports"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-line/50 hover:text-foreground"
        >
          <FileText size={14} />
          Reports &amp; Export
        </Link>
      </div>

      {/* ── 1. OVERVIEW ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-foreground text-sm font-semibold">Overview</h2>
        <p className="text-muted mt-0.5 mb-3 text-xs">
          What is happening in the business right now.
        </p>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <KpiCard
            label="Total Customers"
            value={data.totalCustomers.toLocaleString("en-PH")}
            hint={`${data.activeCustomers} active`}
          />
          <KpiCard
            label="Total Bookings"
            value={booking.totalBookings.toLocaleString("en-PH")}
            hint="all channels"
          />
          <KpiCard
            label="Total Shipments"
            value={data.totalShipments.toLocaleString("en-PH")}
            hint="Freight Ops"
          />
          <KpiCard
            label="On-Time Rate"
            value={`${data.slaCompliance}%`}
            hint="of delivered shipments"
            tone={
              data.slaCompliance >= 90
                ? "good"
                : data.slaCompliance >= 75
                  ? "warn"
                  : "bad"
            }
          />
          <KpiCard
            label="Overdue In-Flight"
            value={data.overdueInFlight.toLocaleString("en-PH")}
            hint="past due, still moving"
            tone={data.overdueInFlight > 0 ? "warn" : "default"}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <AnalyticsSection
            title="Booking Trends"
            description="Requests created per month"
          >
            <TrendBarChart
              data={booking.bookingTrend.map((m) => ({
                label: m.month,
                value: m.count,
              }))}
              valueKey="value"
              categoryKey="label"
            />
          </AnalyticsSection>

          <AnalyticsSection
            title="Booking by Channel"
            description="Where requests originate"
          >
            <CountBarChart
              data={booking.bookingsByChannel.map((c) => ({
                label: c.label,
                value: c.count,
              }))}
              valueKey="value"
              categoryKey="label"
              color="#4f46e5"
            />
          </AnalyticsSection>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <AnalyticsSection
            title="Booking by Status"
            description="Intake state of every request"
          >
            <DonutChart data={bookingStatusDonut} valueKey="value" nameKey="name" />
          </AnalyticsSection>

          <AnalyticsSection
            title="Customer Growth"
            description="New customers per month"
          >
            <TrendLineChart
              data={data.customerGrowth.map((m) => ({
                label: m.month,
                value: m.customers,
              }))}
              valueKey="value"
              categoryKey="label"
              color="#0ea5e9"
            />
          </AnalyticsSection>
        </div>
      </div>

      {/* ── 2. FREIGHT PERFORMANCE ────────────────────────────────── */}
      <div className="pt-2">
        <h2 className="text-foreground text-sm font-semibold">
          Freight Performance
        </h2>
        <p className="text-muted mt-0.5 mb-3 text-xs">
          Operational and SLA outcomes from the Freight Operations adapter.
        </p>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="SLA Compliance"
            value={`${data.slaCompliance}%`}
            hint="delivered only"
          />
          <KpiCard label="On Time" value={data.onTimeShipments} tone="good" />
          <KpiCard label="Late Delivery" value={data.lateShipments} tone="warn" />
          <KpiCard label="Delivered" value={data.completedShipments} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <AnalyticsSection
            title="SLA Performance"
            description="Outcome split across evaluated shipments"
          >
            <DonutChart data={slaDonut} valueKey="value" nameKey="name" />
          </AnalyticsSection>

          <AnalyticsSection
            title="Shipment Status"
            description="Current state of every shipment"
          >
            {data.statusDistribution.length === 0 ? (
              <ChartEmpty message="No shipments correlated yet." />
            ) : (
              <DonutChart
                data={data.statusDistribution.map((s) => ({
                  name: s.status,
                  value: s.count,
                  color: statusColors[s.status] ?? "#a1a1aa",
                }))}
                valueKey="value"
                nameKey="name"
              />
            )}
          </AnalyticsSection>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <AnalyticsSection
            title="Delivery Performance by Region"
            description="Where CRBC's SLA tiers apply"
          >
            <CountBarChart
              data={data.regionalDistribution.map((r) => ({
                label: r.region,
                value: r.count,
              }))}
              valueKey="value"
              categoryKey="label"
              color="#0ea5e9"
            />
          </AnalyticsSection>

          <AnalyticsSection
            title="Monthly Shipment Volume"
            description="Shipments correlated per month"
          >
            <TrendBarChart
              data={data.monthlyShipments.map((m) => ({
                label: m.month,
                value: m.count,
              }))}
              valueKey="value"
              categoryKey="label"
              color="#0ea5e9"
            />
          </AnalyticsSection>
        </div>
      </div>

      {/* ── 3. CUSTOMER & BOOKING ────────────────────────────────── */}
      <div className="pt-2">
        <h2 className="text-foreground text-sm font-semibold">
          Customer &amp; Booking
        </h2>
        <p className="text-muted mt-0.5 mb-3 text-xs">
          CRBC-owned customer and interaction activity.
        </p>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Total Customers" value={data.totalCustomers} />
          <KpiCard label="Active (30d)" value={data.activeCustomers} tone="good" />
          <KpiCard label="Inactive" value={data.inactiveCustomers} />
          <KpiCard
            label="Interactions"
            value={booking.totalInteractions}
            hint="all channels"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <AnalyticsSection
            title="Interaction Analytics"
            description="Customer contact volume per month"
          >
            <TrendLineChart
              data={booking.interactionTrend.map((m) => ({
                label: m.month,
                value: m.count,
              }))}
              valueKey="value"
              categoryKey="label"
              color="#14b8a6"
            />
          </AnalyticsSection>

          <AnalyticsSection
            title="Customer Activity by Channel"
            description="Where recorded interactions came from"
          >
            <CountBarChart
              data={booking.interactionsByType.map((c) => ({
                label: c.label,
                value: c.count,
              }))}
              valueKey="value"
              categoryKey="label"
              color="#14b8a6"
            />
          </AnalyticsSection>
        </div>
      </div>
    </div>
  );
}