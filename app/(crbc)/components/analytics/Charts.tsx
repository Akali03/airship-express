"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";



const AXIS = { fontSize: 11, fill: "#71717a" };
const TOOLTIP = {
  contentStyle: {
    fontSize: 12,
    borderRadius: 8,
    border: "1px solid #e4e4e7",
    background: "#ffffff",
  },
};

/** Horizontal-bar comparison. Used for channel and status counts. */
export function CountBarChart({
  data,
  valueKey,
  categoryKey,
  color = "#4f46e5",
}: {
  data: { label: string; value: number }[];
  valueKey: string;
  categoryKey: string;
  color?: string;
}) {
  if (data.every((d) => d[valueKey] === 0)) {
    return <ChartEmpty />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" allowDecimals={false} tick={AXIS} stroke="#e4e4e7" />
        <YAxis type="category" dataKey={categoryKey} width={92} tick={AXIS} stroke="none" />
        <Tooltip {...TOOLTIP} />
        <Bar dataKey={valueKey} fill={color} radius={[0, 4, 4, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Vertical-bar trend over time. */
export function TrendBarChart({
  data,
  valueKey,
  categoryKey,
  color = "#4f46e5",
}: {
  data: { label: string; value: number }[];
  valueKey: string;
  categoryKey: string;
  color?: string;
}) {
  if (data.every((d) => d[valueKey] === 0)) {
    return <ChartEmpty />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -18, right: 8 }}>
        <XAxis dataKey={categoryKey} tick={AXIS} stroke="#e4e4e7" />
        <YAxis allowDecimals={false} tick={AXIS} stroke="none" />
        <Tooltip {...TOOLTIP} cursor={{ fill: "#f4f4f5" }} />
        <Bar dataKey={valueKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Line trend, for a series where the shape matters more than the totals. */
export function TrendLineChart({
  data,
  valueKey,
  categoryKey,
  color = "#4f46e5",
}: {
  data: { label: string; value: number }[];
  valueKey: string;
  categoryKey: string;
  color?: string;
}) {
  if (data.every((d) => d[valueKey] === 0)) {
    return <ChartEmpty />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: -18, right: 8 }}>
        <XAxis dataKey={categoryKey} tick={AXIS} stroke="#e4e4e7" />
        <YAxis allowDecimals={false} tick={AXIS} stroke="none" />
        <Tooltip {...TOOLTIP} />
        <Line
          type="monotone"
          dataKey={valueKey}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Donut for a small part-to-whole breakdown. */
export function DonutChart({
  data,
  valueKey,
  nameKey,
}: {
  data: { name: string; value: number; color: string }[];
  valueKey: string;
  nameKey: string;
}) {
  const total = data.reduce((sum, d) => sum + d[valueKey], 0);

  if (total === 0) {
    return <ChartEmpty />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          innerRadius="52%"
          outerRadius="80%"
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry[nameKey]} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip {...TOOLTIP} />
        <Legend
          verticalAlign="bottom"
          height={28}
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-muted">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}


export function ChartEmpty({ message = "No data for this period." }: { message?: string }) {
  return (
    <div className="flex h--55 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line">
      <p className="text-muted text-xs">{message}</p>
    </div>
  );
}

/** Compact KPI tile. */
export function KpiCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneClass = {
    default: "text-foreground",
    good: "text-emerald-600",
    warn: "text-amber-600",
    bad: "text-red-600",
  }[tone];

  return (
    <div className="rounded-lg border border-line bg-background px-4 py-3">
      <p className="text-muted text-xs">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${toneClass}`}>{value}</p>
      {hint && <p className="text-muted mt-0.5 text-[11px]">{hint}</p>}
    </div>
  );
}
