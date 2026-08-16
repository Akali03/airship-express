export type AppRole =
  | "super_admin"
  | "hr_payroll_admin"
  | "hr_performance_admin"
  | "hr_recruitment_admin"
  | "hr_workforce_admin";

export type CurrentUser = {
  id: string;
  email: string | null;
  fullName: string;
  role: AppRole;
  initials: string;
};
