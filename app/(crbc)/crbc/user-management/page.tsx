import { notFound } from "next/navigation";
import { requirePermission } from "../../library/auth/rbac.server";
import { maxAssignableRole } from "../../library/auth/rbac";
import { listStaffUsers } from "../../actions/staff";
import StaffManagement from "../../components/staff/StaffManagement";


export default async function UserManagementPage() {
  const user = await requirePermission("users.manage");

  if (!user) notFound();

  const result = await listStaffUsers();


  const assignableRoles =
    user.profile.role === "super_admin" ? ["admin", "staff"] : ["staff"];

  return (
    <div className="w-full py-4">
      <StaffManagement
        initialUsers={result.success ? result.data : []}
        loadError={result.success ? null : result.error}
        assignableRoles={assignableRoles}
        actorRole={user.profile.role}
        maxRole={maxAssignableRole(user.profile.role)}
      />
    </div>
  );
}