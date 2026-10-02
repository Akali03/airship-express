

/** Ranks, highest first. */
export const STAFF_ROLES = ["super_admin", "admin", "staff"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

const STAFF_ROLE_SET: ReadonlySet<string> = new Set(STAFF_ROLES);

export function isStaffRole(role: unknown): role is StaffRole {
  return typeof role === "string" && STAFF_ROLE_SET.has(role);
}

export function isAnyStaff(role: unknown): boolean {
  return isStaffRole(role);
}

export function isSuperAdmin(role: unknown): role is "super_admin" {
  return role === "super_admin";
}

/** Admin and super_admin. Audit-trail reads and CSR management. */
export function isAdminOrAbove(role: unknown): boolean {
  return role === "super_admin" || role === "admin";
}

export type StaffPermission =
  | "dashboard.view"
  | "crm.view"
  | "crm.manage"
  | "bookings.view"
  | "bookings.manage"
  | "documents.view"
  | "compliance.view"
  | "sla.view"
  | "analytics.view"
  | "policies.manage"
  | "users.manage"
  | "audit.view"
  | "system.admin";

const STAFF_PERMISSIONS: Record<StaffRole, readonly StaffPermission[]> = {
  super_admin: [
    "dashboard.view",
    "crm.view",
    "crm.manage",
    "bookings.view",
    "bookings.manage",
    "documents.view",
    "compliance.view",
    "sla.view",
    "analytics.view",
    "policies.manage",
    "users.manage",
    "audit.view",
    "system.admin",
  ],
  admin: [
    "dashboard.view",
    "crm.view",
    "crm.manage",
    "bookings.view",
    "bookings.manage",
    "documents.view",
    "compliance.view",
    "sla.view",
    "analytics.view",
    "policies.manage",
    "users.manage",
    "audit.view",
  ],
  staff: [
    "dashboard.view",
    "crm.view",
    "crm.manage",
    "bookings.view",
    "bookings.manage",
    "documents.view",
    "compliance.view",
    "sla.view",
    "analytics.view",
  ],
};

export function hasPermission(
  role: unknown,
  permission: StaffPermission
): boolean {
  if (!isStaffRole(role)) return false;
  return STAFF_PERMISSIONS[role].includes(permission);
}


export function maxAssignableRole(actorRole: unknown): Exclude<StaffRole, "super_admin"> {
  return isSuperAdmin(actorRole) ? "admin" : "staff";
}

export function canAssignRole(
  actorRole: unknown,
  targetRole: unknown
): boolean {
  if (!isStaffRole(actorRole) || !isStaffRole(targetRole)) return false;
  return (
    STAFF_ROLES.indexOf(targetRole) >=
    STAFF_ROLES.indexOf(maxAssignableRole(actorRole))
  );
}

export function canManageRole(actorRole: unknown, targetRole: unknown): boolean {
  if (!isStaffRole(actorRole) || !isStaffRole(targetRole)) return false;
  return STAFF_ROLES.indexOf(actorRole) < STAFF_ROLES.indexOf(targetRole);
}