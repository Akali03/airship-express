"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Eye,
  Loader2,
  X,
  Power,
  Save,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  createStaffUser,
  setStaffActive,
  setStaffRole,
  type StaffUser,
} from "../../actions/staff";

/**
 * Staff User Management.
 *
 * The table is READ-ONLY. Every account is opened through a profile modal,
 * which is the only place a role or status can be changed.
 *
 * Nothing here is a security boundary. The server page already refused
 * anyone without `users.manage`, and every action re-derives the actor from
 * the session and re-checks the permission. Hiding a button is presentation;
 * `setStaffRole` and `setStaffActive` refuse the same actions server-side.
 *
 * `assignableRoles` is computed on the server from the actor's own limit, so
 * an admin is never offered super_admin even by editing the DOM.
 */

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  staff: "CSR / Marketing Staff",
};

const ROLE_BADGE: Record<string, string> = {
  super_admin: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  admin: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  staff: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
};

export default function StaffManagement({
  initialUsers,
  loadError,
  assignableRoles,
  actorRole,
  maxRole,
}: {
  initialUsers: StaffUser[];
  loadError: string | null;
  assignableRoles: string[];
  actorRole: string;
  maxRole: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState(assignableRoles[0] ?? "staff");

  // Pending modal edits. Held separately from the account so cancelling
  // discards cleanly without needing to refetch.
  const [draftRole, setDraftRole] = useState("");
  const [confirming, setConfirming] = useState<null | "activate" | "deactivate">(
    null
  );

  // The open account is derived from `initialUsers` on every render, so a
  // router.refresh() after a save updates the open card without an effect
  // writing state back into itself.
  const selected = initialUsers.find((u) => u.id === selectedId) ?? null;

  function run(
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string
  ) {
    setBusy(true);
    (async () => {
      const res = await action();
      setBusy(false);
      if (res.success) {
        toast.success(successMessage);
        setConfirming(null);
        router.refresh();
      } else {
        toast.error(res.error ?? "Action failed.");
      }
    })();
  }

  function openProfile(user: StaffUser) {
    setSelectedId(user.id);
    setDraftRole(user.role);
    setConfirming(null);
  }

  const actorIsSuperAdmin = actorRole === "super_admin";
  // The actor's own account is never editable, whatever their rank.
  const isSelf = selected?.role === actorRole;

  // A role change needs a rank strictly below the actor's.
  const canChangeRole =
    !!selected &&
    !isSelf &&
    assignableRoles.includes(selected.role);

  const canToggleActive =
    !!selected && !isSelf && assignableRoles.includes(selected.role);

  const roleChanged = !!selected && draftRole !== selected.role;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">User Management</h1>
          <p className="text-muted mt-0.5 text-sm">
            Staff accounts only. Customer accounts are managed from the CRM.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90"
        >
          <UserPlus size={14} />
          {showCreate ? "Close" : "Create Staff User"}
        </button>
      </div>

      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {loadError}
        </p>
      )}

      {showCreate && (
        <section className="rounded-lg border border-line bg-background p-5">
          <h2 className="text-foreground text-sm font-medium">New staff account</h2>
          <p className="text-muted mt-0.5 text-xs">
            You can grant up to{" "}
            <span className="text-foreground">{ROLE_LABELS[maxRole] ?? maxRole}</span>
            . Higher roles require a Super Admin.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              aria-label="Full name"
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@company.com"
              aria-label="Email"
              type="email"
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temporary password (min 8 characters)"
              aria-label="Temporary password"
              type="password"
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              aria-label="Role"
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {assignableRoles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r] ?? r}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const res = await createStaffUser({
                    email,
                    password,
                    fullName,
                    role,
                  });
                  if (res.success) {
                    setEmail("");
                    setPassword("");
                    setFullName("");
                    setShowCreate(false);
                  }
                  return res;
                }, "Staff account created.")
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserPlus size={14} />
              )}
              Create account
            </button>
          </div>
        </section>
      )}

      {/* ── READ-ONLY TABLE ───────────────────────────────────────── */}
      <section className="overflow-hidden rounded-lg border border-line bg-background">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-foreground text-sm font-medium">
            {initialUsers.length} staff account
            {initialUsers.length === 1 ? "" : "s"}
          </h2>
        </div>

        {initialUsers.length === 0 ? (
          <p className="text-muted px-5 py-10 text-center text-sm">
            {loadError
              ? "Could not load staff accounts. See the error above."
              : "No staff accounts found."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-5 py-2.5 font-medium">Name</th>
                  <th className="px-5 py-2.5 font-medium">Email</th>
                  <th className="px-5 py-2.5 font-medium">Role</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">MFA</th>
                  <th className="px-5 py-2.5 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {initialUsers.map((u) => {
                  const mine = u.role === actorRole;
                  return (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-line/20"
                    >
                      <td className="text-foreground px-5 py-3 text-xs">
                        {u.full_name ?? "—"}
                        {mine && (
                          <span className="text-muted ml-1.5">(you)</span>
                        )}
                      </td>
                      <td className="text-muted px-5 py-3 text-xs">{u.email}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            ROLE_BADGE[u.role] ?? "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            u.active === false
                              ? "bg-zinc-100 text-zinc-600"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
                          {u.active === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="text-muted px-5 py-3 text-xs">
                        {u.mfa_enabled
                          ? u.mfa_email_verified
                            ? "Enabled"
                            : "Pending"
                          : "Off"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openProfile(u)}
                          className="inline-flex items-center gap-1.5 rounded border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:bg-line/50 hover:text-foreground"
                        >
                          <Eye size={12} />
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── PROFILE MODAL ─────────────────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Profile for ${selected.email}`}
          onClick={() => !busy && setSelectedId(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-lg border border-line bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h2 className="text-foreground text-sm font-medium">
                User Profile
              </h2>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                disabled={busy}
                aria-label="Close"
                className="text-muted hover:text-foreground p-1 disabled:opacity-50"
              >
                <X size={15} />
              </button>
            </div>

            <dl className="divide-y divide-line px-5 py-1">
              <div className="flex items-baseline justify-between gap-4 py-2">
                <dt className="text-xs text-muted">Full Name</dt>
                <dd className="text-foreground text-sm">
                  {selected.full_name ?? "—"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2">
                <dt className="text-xs text-muted">Email</dt>
                <dd className="text-foreground text-sm">{selected.email}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2">
                <dt className="text-xs text-muted">Contact</dt>
                <dd className="text-foreground text-sm">
                  {selected.contact_number ?? "—"}
                </dd>
              </div>

              {/* Role — editable only when the actor outranks the target. */}
              <div className="flex items-baseline justify-between gap-4 py-2">
                <dt className="text-xs text-muted">Role</dt>
                <dd>
                  {canChangeRole ? (
                    <select
                      value={draftRole}
                      onChange={(e) => setDraftRole(e.target.value)}
                      disabled={busy}
                      aria-label={`Role for ${selected.email}`}
                      className="rounded border border-line bg-background px-2 py-1 text-xs outline-none focus:border-accent disabled:opacity-50"
                    >
                      {assignableRoles.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r] ?? r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          ROLE_BADGE[selected.role] ??
                          "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {ROLE_LABELS[selected.role] ?? selected.role}
                      </span>
                      <span className="text-muted inline-flex items-center gap-1 text-[11px]">
                        <ShieldCheck size={11} />
                        {isSelf ? "your own account — read only" : "read only"}
                      </span>
                    </span>
                  )}
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-4 py-2">
                <dt className="text-xs text-muted">Status</dt>
                <dd className="flex items-center gap-1.5 text-sm text-foreground">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      selected.active === false ? "bg-zinc-400" : "bg-emerald-500"
                    }`}
                  />
                  {selected.active === false ? "Inactive" : "Active"}
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-4 py-2">
                <dt className="text-xs text-muted">MFA</dt>
                <dd className="text-foreground text-sm">
                  {selected.mfa_enabled
                    ? selected.mfa_email_verified
                      ? "Enabled"
                      : "Pending verification"
                    : "Off"}
                  {selected.mfa_last_used_at && (
                    <span className="text-muted ml-2 text-xs">
                      last used{" "}
                      {new Date(selected.mfa_last_used_at).toLocaleDateString(
                        "en-PH",
                        { dateStyle: "medium" }
                      )}
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            {/* Status toggle, behind an explicit confirmation. */}
            <div className="border-t border-line px-5 py-3">
              {canToggleActive ? (
                confirming ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-foreground flex-1 text-xs">
                      {confirming === "deactivate"
                        ? `Deactivate ${selected.email}? They will not be able to sign in.`
                        : `Reactivate ${selected.email}?`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      disabled={busy}
                      className="rounded border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:bg-line/50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () =>
                            setStaffActive(
                              selected.id,
                              confirming === "activate"
                            ),
                          confirming === "activate"
                            ? "Account activated."
                            : "Account deactivated."
                        )
                      }
                      className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : null}
                      Confirm
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setConfirming(
                        selected.active === false ? "activate" : "deactivate"
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:bg-line/50 hover:text-foreground disabled:opacity-50"
                  >
                    <Power size={12} />
                    {selected.active === false
                      ? "Activate Account"
                      : "Deactivate Account"}
                  </button>
                )
              ) : (
                <p className="text-muted text-xs">
                  {isSelf
                    ? "You cannot deactivate your own account."
                    : actorIsSuperAdmin
                      ? "This account is at or above your rank."
                      : "You can only manage accounts below your own role."}
                </p>
              )}
            </div>

            {/* Save — role changes commit only on an explicit click. */}
            <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                disabled={busy}
                className="rounded-lg border border-line px-3.5 py-2 text-sm text-muted transition-colors hover:bg-line/50 hover:text-foreground disabled:opacity-50"
              >
                Close
              </button>
              {canChangeRole && (
                <button
                  type="button"
                  disabled={busy || !roleChanged}
                  onClick={() =>
                    run(
                      () => setStaffRole(selected.id, draftRole),
                      `Role updated to ${ROLE_LABELS[draftRole] ?? draftRole}.`
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
