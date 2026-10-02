import { requirePermission } from "../../../library/auth/rbac.server";
import { getReport, REPORT_LABELS, REPORT_TYPES, type ReportType } from "../../../services/report.service";
import AnalyticsSection from "../../../components/analytics/AnalyticsSection";
import ExportButtons from "../../../components/analytics/ExportButtons";


export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; channel?: string }>;
}) {
  await requirePermission("analytics.view");

  const params = await searchParams;
  const type = (REPORT_TYPES.includes(params.type as ReportType)
    ? params.type
    : "customer-booking") as ReportType;
  const status = params.status ?? "all";
  const channel = params.channel ?? "all";

  const report = await getReport(type, { status, channel });

  // The CSV route is staff-guarded server-side and applies the same filters.
  const csvUrl = `/api/analytics/report?type=${report.type}&status=${status}&channel=${channel}`;

  const statusOptions = ["all", "PENDING", "ACCEPTED", "REJECTED", "CANCELLED"];
  const channelOptions = ["all", "PORTAL", "WALK_IN", "PHONE_CALL"];

  const tabClass = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? "bg-accent/10 text-accent"
        : "text-muted hover:bg-line/50 hover:text-foreground"
    }`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Reports &amp; Export
          </h1>
          <p className="text-muted mt-0.5 text-sm">
            Report data, generated as PDF or CSV. Exports match what is shown.
          </p>
        </div>
        <ExportButtons report={report} csvUrl={csvUrl} />
      </div>

      {/* Report selector */}
      <div className="flex flex-wrap gap-1.5">
        {REPORT_TYPES.map((t) => {
          const q = new URLSearchParams({ type: t, status, channel });
          return (
            <a key={t} href={`/crbc/analytics/reports?${q}`} className={tabClass(t === type)}>
              {REPORT_LABELS[t]}
            </a>
          );
        })}
      </div>

      {/* Filters. Only status and channel are offered: both map to real
          columns, so no filter can silently return nothing. */}
      <div className="flex flex-wrap items-center gap-3">
        <form className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="type" value={type} />
          <label className="text-muted text-xs" htmlFor="f-status">
            Status
          </label>
          <select
            id="f-status"
            name="status"
            defaultValue={status}
            className="rounded-lg border border-line bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All" : s}
              </option>
            ))}
          </select>

          <label className="text-muted text-xs" htmlFor="f-channel">
            Channel
          </label>
          <select
            id="f-channel"
            name="channel"
            defaultValue={channel}
            className="rounded-lg border border-line bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent"
          >
            {channelOptions.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All" : c.replace("_", " ")}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-foreground/90"
          >
            Apply
          </button>
        </form>

        {(status !== "all" || channel !== "all") && (
          <a
            href={`/crbc/analytics/reports?type=${type}`}
            className="text-muted text-xs hover:text-foreground hover:underline"
          >
            Clear filters
          </a>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {report.kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border border-line bg-background px-4 py-3"
          >
            <p className="text-muted text-xs">{kpi.label}</p>
            <p className="text-foreground mt-1 text-lg font-semibold">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {report.blocks.map((block) => (
        <AnalyticsSection
          key={block.title}
          title={block.title}
          description={`${block.rows.length} row${block.rows.length === 1 ? "" : "s"}`}
        >
          {block.rows.length === 0 ? (
            <p className="text-muted py-6 text-center text-xs">
              No rows match the current filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    {block.columns.map((c) => (
                      <th key={c.key} className="px-3 py-2 font-medium">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {block.rows.map((row, i) => (
                    <tr key={i} className="print:bg-transparent">
                      {block.columns.map((c) => (
                        <td
                          key={c.key}
                          className="text-muted px-3 py-2 text-xs whitespace-nowrap"
                        >
                          {row[c.key] === null || row[c.key] === undefined
                            ? "—"
                            : String(row[c.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AnalyticsSection>
      ))}

      <p className="text-muted text-xs">
        Generated {new Date(report.generatedAt).toLocaleString("en-PH", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
        . PDF and CSV contain exactly the rows shown above.
      </p>
    </div>
  );
}