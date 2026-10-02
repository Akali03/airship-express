import { getCurrentUser } from "@/app/(crbc)/library/auth/getCurrentUser";
import { isAnyStaff } from "../../library/auth/rbac";
import { redirect } from "next/navigation";
import StaffSettingsClient from "./StaffSettingsClient";

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/crbcAuth/login");
  }

  if (!isAnyStaff(currentUser.profile.role)) {
    redirect("/customer/dashboard");
  }

  return (
    <StaffSettingsClient
      isMfaEnabled={currentUser.profile.mfa_enabled}
      mfaEmailVerified={currentUser.profile.mfa_email_verified}
    />
  );
}