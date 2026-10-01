import { NextResponse } from "next/server";
import { authenticateFtmRequest } from "../../../lib/server/ftmRequestAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateFtmRequest(request);
  if (!("context" in auth)) return auth.response;
  if (auth.context.user.role !== "admin") {
    return NextResponse.json({ error: "You do not have permission to perform this action." }, { status: 403 });
  }

  try {
    const supabase = auth.context.serviceClient;
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (authError) return NextResponse.json({ error: authError.message || "Failed to fetch users" }, { status: 500 });
    let { data: profiles, error: profileError } = await supabase.from("users")
      .select("id, email, full_name, avatar_url, role, phone, courier_id, created_at, updated_at");
    if (profileError && /avatar_url.*does not exist|column.*avatar_url/i.test(profileError.message)) {
      ({ data: profiles, error: profileError } = await supabase.from("users").select("id, email, full_name, role, phone, courier_id, created_at, updated_at"));
    }
    if (profileError) return NextResponse.json({ error: profileError.message || "Failed to fetch user profiles" }, { status: 500 });

    const profileById = new Map<string, Record<string, any>>((profiles || []).map((profile) => [profile.id, profile]));
    const listPasskeys = (supabase.auth.admin as any).listPasskeys;
    const passkeyCounts = new Map<string, number | null>();
    await Promise.all((authData.users || []).map(async (user) => {
      if (typeof listPasskeys !== "function") {
        passkeyCounts.set(user.id, null);
        return;
      }
      try {
        const { data, error } = await listPasskeys({ userId: user.id });
        passkeyCounts.set(user.id, error ? null : Array.isArray(data) ? data.length : 0);
      } catch {
        passkeyCounts.set(user.id, null);
      }
    }));

    return NextResponse.json((authData.users || []).map((user) => {
      const profile = profileById.get(user.id) || {};
      return {
        id: user.id,
        email: user.email,
        full_name: profile.full_name || user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || profile.avatar_url || null,
        role: profile.role || user.app_metadata?.role || user.user_metadata?.role || null,
        phone: profile.phone || user.user_metadata?.phone || null,
        courier_id: profile.courier_id || null,
        created_at: profile.created_at || user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
        locked: Boolean(user.banned_until && new Date(user.banned_until).getTime() > Date.now()),
        banned_until: user.banned_until || null,
        passkey_count: passkeyCounts.get(user.id) ?? null,
      };
    }));
  } catch (error) {
    console.error("Admin user list error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}