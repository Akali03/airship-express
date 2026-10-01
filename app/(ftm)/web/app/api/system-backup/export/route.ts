import "server-only";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { authenticateFtmRequest } from "../../../lib/server/ftmRequestAuth";
import { createFtmParcelClient } from "../../../lib/server/ftmSupabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKUP_TABLES = [
  "_migrations", "alerts", "alert_history", "ai_conversations", "ai_messages", "bookings", "cost_entries", "couriers",
  "dispatches", "driver_assignments", "driver_performance", "driver_push_tokens", "driver_tracking", "drivers", "expenses",
  "fuel_logs", "incident_reports", "locations", "maintenance_history", "mobile_device_tracking", "notifications",
  "optimized_routes", "parcels", "parcels_for_pickup", "pickup_events", "role_change_audit", "route_plan_bookings",
  "route_plan_parcels", "route_plans", "tracking_history", "trip_statistics", "trip_stops", "trips", "users", "vehicles",
  "vehicle_documents", "vehicle_gps_tracking",
];

function parcelDatabaseConfigured() {
  const url = process.env.FTM_PARCELS_SUPABASE_URL || process.env.PARCELS_SUPABASE_URL || process.env.NEXT_PUBLIC_FTM_PARCEL_SUPABASE_URL;
  const key = process.env.FTM_PARCELS_SUPABASE_SERVICE_ROLE_KEY || process.env.FTM_PARCELS_SUPABASE_ANON_KEY || process.env.PARCELS_SUPABASE_SERVICE_ROLE_KEY || process.env.PARCELS_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_FTM_PARCEL_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

async function readAllRows(supabase: any, table: string) {
  const rows: Record<string, any>[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from(table).select("*").range(offset, offset + 999);
    if (error) {
      if (/relation .* does not exist|could not find the table/i.test(error.message || "")) return { rows: [], skipped: true };
      return { rows: [], skipped: true };
    }
    const page = Array.isArray(data) ? data : [];
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return { rows, skipped: false };
}

function toPlainText(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(toPlainText).join(", ");
  if (typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([key, nested]) => `${key}: ${toPlainText(nested)}`).join("\n");
  const text = String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function styleHeader(row: ExcelJS.Row) {
  row.height = 26;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBE185D" } };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = { bottom: { style: "thin", color: { argb: "FF9F1239" } } };
  });
}

function styleDataRows(sheet: ExcelJS.Worksheet, startRow: number) {
  for (let index = startRow; index <= sheet.rowCount; index += 1) {
    const row = sheet.getRow(index);
    row.height = 22;
    row.eachCell((cell) => {
      cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
      cell.border = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } };
      if (index % 2 === 0) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
    });
  }
}

export async function GET(request: Request) {
  const auth = await authenticateFtmRequest(request);
  if (!("context" in auth)) return auth.response;
  if (auth.context.user.role !== "admin") return NextResponse.json({ message: "You do not have permission to export a system backup." }, { status: 403 });

  const supabase = auth.context.serviceClient;
  const tables: Record<string, Record<string, any>[]> = {};
  const tableStatus: Record<string, string> = {};
  try {
    for (const table of BACKUP_TABLES) {
      const result = await readAllRows(supabase, table);
      if (!result.skipped) {
        tables[table] = result.rows;
        tableStatus[table] = "Included";
      }
    }

    if (parcelDatabaseConfigured()) {
      const parcelSupabase = createFtmParcelClient();
      if (parcelSupabase) {
        const result = await readAllRows(parcelSupabase, "parcels");
        if (!result.skipped) {
          tables.parcel_parcels = result.rows;
          tableStatus.parcel_parcels = "Included from parcel Supabase";
        }
      }
    }

    const exportedAt = new Date();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Airship Express";
    workbook.created = exportedAt;
    workbook.modified = exportedAt;
    const summary = workbook.addWorksheet("Backup Summary", { views: [{ state: "frozen", ySplit: 6 }] });
    summary.mergeCells("A1:C1");
    summary.getCell("A1").value = "Airship Express | FTM and Parcel Supabase Backup";
    summary.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 16 };
    summary.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF831843" } };
    summary.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };
    summary.getRow(1).height = 34;
    summary.addRow(["Exported at", exportedAt.toLocaleString(), ""]);
    summary.addRow(["Format", "Excel workbook with plain-text table values", ""]);
    summary.addRow(["Included tables", String(Object.keys(tables).length), ""]);
    summary.addRow([]);
    summary.addRow(["Table", "Rows", "Status"]);
    styleHeader(summary.getRow(6));
    for (const [table, rows] of Object.entries(tables)) summary.addRow([table, String(rows.length), tableStatus[table]]);
    styleDataRows(summary, 7);
    summary.columns = [{ width: 34 }, { width: 42 }, { width: 30 }];

    for (const [table, rows] of Object.entries(tables)) {
      const sheet = workbook.addWorksheet(table.slice(0, 31), { views: [{ state: "frozen", ySplit: 4 }] });
      const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
      sheet.mergeCells(1, 1, 1, Math.max(columns.length, 1));
      sheet.getCell(1, 1).value = `${table} | ${rows.length} records`;
      sheet.getCell(1, 1).font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
      sheet.getCell(1, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF831843" } };
      sheet.getCell(1, 1).alignment = { vertical: "middle", horizontal: "left" };
      sheet.getRow(1).height = 30;
      sheet.addRow(["Status", tableStatus[table], `Exported ${exportedAt.toLocaleString()}`]);
      sheet.addRow([]);
      sheet.addRow(columns.length ? columns : ["message"]);
      styleHeader(sheet.getRow(4));
      if (!rows.length) sheet.addRow(["No rows found in this table."]);
      else rows.forEach((row) => sheet.addRow(columns.map((column) => toPlainText(row[column]))));
      styleDataRows(sheet, 5);
      sheet.columns = (columns.length ? columns : ["message"]).map((column) => ({ key: column, width: Math.min(42, Math.max(16, column.length + 3)) }));
      sheet.autoFilter = { from: "A4", to: `${sheet.getColumn(columns.length || 1).letter}4` };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="airship-express-supabase-backup-${exportedAt.toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Supabase backup export failed:", error);
    return NextResponse.json({ message: "The system backup could not be created." }, { status: 500 });
  }
}