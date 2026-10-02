import { createClient } from "../../library/supabase/server";
import { requirePermission } from "../../library/auth/rbac.server";
import AuditTrail from "../../components/staff/AuditTrail";


export default async function AuditTrailPage() {
  await requirePermission("audit.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      "id, actor_user_id, actor_email, action, target_type, target_id, description, metadata, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];

  // One profiles read for every actor on this page, keyed by email.
  const actorEmails = [
    ...new Set(rows.map((r) => r.actor_email).filter((e): e is string => !!e)),
  ];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("email, full_name, role")
    .in(
      "email",
      actorEmails.length
        ? actorEmails
        : ["__none__@__none__"]
    );

  const profileByEmail = new Map(
    (profiles ?? []).map((p) => [p.email, p])
  );

  return (
    <div className="w-full py-4">
      <AuditTrail
        entries={
          error
            ? []
            : rows.map((row) => {
                const profile = row.actor_email
                  ? profileByEmail.get(row.actor_email)
                  : undefined;

                const eventRole =
                  typeof (row.metadata as { role?: unknown } | null)?.role ===
                  "string"
                    ? ((row.metadata as { role: string }).role)
                    : null;

                return {
                  id: row.id,
                  actorEmail: row.actor_email,
                  actorName: profile?.full_name ?? null,
                  actorRole: eventRole ?? profile?.role ?? null,
                  action: row.action,
                  targetType: row.target_type,
                  targetId: row.target_id,
                  description: row.description,
                  metadata: row.metadata as Record<string, unknown> | null,
                  createdAt: row.created_at,
                };
              })
        }
        loadError={error ? "Failed to load audit records." : null}
      />
    </div>
  );
}