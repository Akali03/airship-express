import CrbcLayout from "../components/layout/CrbcLayout";
import { protectRoute } from "../library/auth/protect";
import { getCurrentUser } from "../library/auth/getCurrentUser";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
    // Any staff rank passes. Individual pages apply their own permission
    // guard, so a CSR reaching /crbc/user-management is redirected there by
    // requirePermission rather than by the layout.
    await protectRoute("staff");

    // The role is resolved server-side and handed to the sidebar so it can
    // show only the sections this person may open. Hiding a link is
    // convenience, not security — every page re-checks on the server.
    const user = await getCurrentUser();
    const role = user?.profile.role ?? "staff";

    return <CrbcLayout role={role}>{children}</CrbcLayout>
}