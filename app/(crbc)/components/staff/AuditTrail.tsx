"use client";

import {
  LogIn,
  LogOut,
  ShieldCheck,
  UserPlus,
  UserCog,
  Power,
  PackagePlus,
  PackageX,
  FileText,
  AlertTriangle,
  Circle,
} from "lucide-react";

/**
 * Audit Trail — horizontal activity log.
 *
 * Read-only by design. There is no edit or delete control because the RLS
 * policies grant no UPDATE and no DELETE to any application role: a record
 * cannot be altered even by a super_admin through the API.
 *
 * Every field is taken from the stored row. Nothing is inferred for display
 * beyond turning `action` into a readable phrase, and the reference shown is
 * the value already in `target_id`.
 */

export type AuditEntryView = {
  id: string;
  actorEmail: string | null;
  /** Display name from profiles. Null for actors with no profile row. */
  actorName: string | null;
  /** Role at the time of the event, else the current role, else null. */
  actorRole: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  staff: "Staff",
  customer: "Customer",
};

/**
 * Human phrase for an action, WITHOUT the reference.
 * The reference is appended separately so it renders in a lighter weight.
 */
const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Signed in",
  "auth.logout": "Signed out",
  "auth.login_failed": "Failed sign-in",
  "mfa.enabled": "MFA enabled",
  "mfa.disabled": "MFA disabled",
  "mfa.verified": "MFA verified",
  "user.created": "User created",
  "user.role_changed": "User role changed",
  "user.activated": "User activated",
  "user.deactivated": "User deactivated",
  "booking.created": "Booking created",
  "booking.status_changed": "Booking status changed",
  "booking.cancelled": "Booking cancelled",
  "booking.updated": "Booking updated",
  "customer.created": "Customer created",
  "customer.updated": "Customer updated",
  "sla_policy.created": "SLA policy created",
  "sla_policy.updated": "SLA policy updated",
  "sla_policy.deleted": "SLA policy deleted",
  "compliance.reviewed": "Compliance reviewed",
};

/** Extra detail for actions whose meaningful part lives in metadata. */
function actionDetail(entry: AuditEntryView): string | null {
  const meta = entry.metadata ?? {};

  // "Staff → Admin" reads far better than a description paragraph.
  if (entry.action === "user.role_changed") {
    const from = meta.from as string | undefined;
    const to = meta.to as string | undefined;
    if (from && to) {
      return `${ROLE_LABELS[from] ?? from} → ${ROLE_LABELS[to] ?? to}`;
    }
  }

  if (
    entry.action === "booking.created" ||
    entry.action === "booking.status_changed" ||
    entry.action === "booking.cancelled" ||
    entry.action === "booking.updated"
  ) {
    const channel = meta.channel as string | undefined;
    if (channel) {
      return channel.replace("_", " ").toLowerCase();
    }
  }

  return null;
}

/** The value shown after an em dash: a booking ref, a customer code, a policy id. */
function reference(entry: AuditEntryView): string | null {
  // For booking events the reference IS the request id (e.g. REQ-0043).
  if (entry.targetId && entry.targetType === "booking_request") {
    return entry.targetId;
  }
  if (entry.targetId && entry.targetType === "customer") {
    return entry.targetId;
  }
  if (entry.targetId && entry.targetType === "delivery_policy") {
    return entry.targetId.slice(0, 8);
  }
  // Profile events target a uuid; the description already names the account.
  return null;
}

function iconFor(action: string) {
  if (action === "auth.login") return LogIn;
  if (action === "auth.logout" || action === "auth.login_failed")
    return LogOut;
  if (action.startsWith("mfa.")) return ShieldCheck;
  if (action === "user.created") return UserPlus;
  if (action.startsWith("user.")) return UserCog;
  if (action === "booking.cancelled") return PackageX;
  if (action.startsWith("booking.")) return PackagePlus;
  if (action.startsWith("sla_policy.")) return FileText;
  if (action.startsWith("customer.")) return Power;
  return Circle;
}

function toneFor(action: string): string {
  if (action === "auth.login_failed" || action.startsWith("user.deactivated")) {
    return "text-red-500";
  }
  if (action === "user.role_changed" || action === "mfa.disabled") {
    return "text-amber-500";
  }
  if (action.startsWith("user.") || action.startsWith("mfa.")) {
    return "text-emerald-500";
  }
  if (action.startsWith("booking.")) return "text-accent";
  if (action.startsWith("sla_policy.")) return "text-sky-500";
  return "text-muted";
}

/** 9:27 PM · Oct 02, 2026 */
function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const time = d.toLocaleString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const date = d.toLocaleString("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  return `${time} · ${date}`;
}

/** "Robert Pradilla", falling back to the email local part. */
function actorLabel(entry: AuditEntryView): string {
  if (entry.actorName) return entry.actorName;
  if (entry.actorEmail) {
    const local = entry.actorEmail.split("@")[0];
    return local
      .split(/[._-]/)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }
  return "System";
}

export default function AuditTrail({
  entries,
  loadError,
}: {
  entries: AuditEntryView[];
  loadError: string | null;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Audit Trail</h1>
          <p className="text-muted mt-0.5 flex items-center gap-1.5 text-sm">
            <ShieldCheck size={13} />
            Append-only record of security and business actions.
          </p>
        </div>
        <p className="text-muted text-xs">
          {entries.length} event{entries.length === 1 ? "" : "s"}
          {entries.length >= 200 && " · showing the most recent 200"}
        </p>
      </div>

      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {loadError}
        </p>
      )}

      {entries.length === 0 ? (
        <div className="rounded-lg border border-line bg-background">
          <p className="text-muted px-5 py-12 text-center text-sm">
            No audit records yet. Events appear here as they happen.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-background">
          {/* Header row */}
          <div className="grid grid-cols-[auto_1fr] items-center gap-4 border-b border-line bg-background px-5 py-2.5 text-xs font-medium text-muted md:grid-cols-[13rem_1fr_14rem]">
            <span>Time</span>
            <span>Action</span>
            <span className="hidden md:block">Activity By</span>
          </div>

          <ul className="divide-y divide-line">
            {entries.map((entry) => {
              const Icon = iconFor(entry.action);
              const detail = actionDetail(entry);
              const ref = reference(entry);
              const label = ACTION_LABELS[entry.action] ?? entry.action;

              return (
                <li
                  key={entry.id}
                  className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-1 px-5 py-3 transition-colors hover:bg-line/20 md:grid-cols-[13rem_1fr_14rem] md:items-center md:gap-y-0"
                >
                  {/* Time */}
                  <time
                    dateTime={entry.createdAt}
                    className="text-muted order-1 text-xs tabular-nums whitespace-nowrap md:order-none"
                  >
                    {formatTimestamp(entry.createdAt)}
                  </time>

                  {/* Action — icon, phrase and reference travel as one
                      centred unit so long descriptions do not push the
                      column off-centre. */}
                  <div className="order-2 flex min-w-0 items-center justify-center gap-2 md:order-none">
                    <Icon
                      size={13}
                      className={`shrink-0 ${toneFor(entry.action)}`}
                      aria-hidden="true"
                    />
                    <span className="text-foreground truncate text-sm">
                      {label}
                    </span>
                    {detail && (
                      <span className="text-muted shrink-0 text-xs">
                        — {detail}
                      </span>
                    )}
                    {!detail && ref && (
                      <span className="text-muted shrink-0 font-mono text-xs">
                        — {ref}
                      </span>
                    )}
                  </div>

                  {/* Actor */}
                  <div className="order-3 col-span-2 flex items-center gap-2 pl-5 md:order-none md:col-span-1 md:pl-0">
                    <span className="text-muted truncate text-xs">
                      {actorLabel(entry)}
                    </span>
                    {entry.actorRole && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          entry.actorRole === "super_admin"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                            : entry.actorRole === "admin"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              : entry.actorRole === "customer"
                                ? "bg-zinc-100 text-zinc-600"
                                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        {ROLE_LABELS[entry.actorRole] ?? entry.actorRole}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-muted flex items-start gap-1.5 text-xs">
        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          Read only.
      </p>
    </div>
  );
}