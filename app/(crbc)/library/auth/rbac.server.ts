import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "./getCurrentUser";
import { isAnyStaff, hasPermission, type StaffPermission } from "./rbac";


export function requireStaff(): Promise<CurrentUser> {
  return requirePermission("dashboard.view");
}

export async function requirePermission(
  permission: StaffPermission
): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/crbcAuth/login");
  }

  if (!isAnyStaff(user.profile.role)) {
    // A customer reached a staff route.
    if (user.profile.role === "customer") {
      redirect("/customer/dashboard");
    }
    redirect("/crbcAuth/login");
  }

  if (!hasPermission(user.profile.role, permission)) {
    redirect("/crbc/dashboard");
  }

  return user;
}

export async function getActorRole(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.profile.role ?? null;
}

/** True when the caller holds `permission`. Used by route handlers. */
export async function actorHasPermission(
  permission: StaffPermission
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return hasPermission(user.profile.role, permission);
}