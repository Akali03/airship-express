import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../library/supabase/server";
import { isAnyStaff } from "../../../library/auth/rbac";
import {
  getReport,
  reportToCsv,
  REPORT_TYPES,
  type ReportType,
} from "../../../services/report.service";


export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!isAnyStaff(profile?.role)) {
    return NextResponse.json(
      { success: false, error: "Forbidden: staff access required" },
      { status: 403 }
    );
  }

  const params = request.nextUrl.searchParams;
  const type = params.get("type") as ReportType | null;

  if (!type || !REPORT_TYPES.includes(type)) {
    return NextResponse.json(
      { success: false, error: `Unknown report type. Expected one of: ${REPORT_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const report = await getReport(type, {
    status: params.get("status") ?? undefined,
    channel: params.get("channel") ?? undefined,
  });

  const csv = reportToCsv(report);

  const filename = `${report.type}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
