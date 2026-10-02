import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared Customer Portal UI primitives.
 *
 * These are layout wrappers only — no data, no behaviour. Every class comes
 * from the existing Airship Express theme tokens (background, foreground,
 * line, muted, accent) so the portal stays visually identical to the staff
 * side. No gradients, no shadows beyond a border, no oversized type.
 */

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-bricolage text-xl font-semibold text-foreground sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/** Bordered panel. The portal's only container style. */
export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-line bg-background ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div>
            {title && (
              <h2 className="text-sm font-medium text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-muted">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Primary action button, matching the portal's existing primary colour. */
export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90"
    >
      {children}
    </Link>
  );
}

/** Quiet action button for secondary navigation. */
export function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-line/50 hover:text-foreground"
    >
      {children}
    </Link>
  );
}

/**
 * Empty state. Every list in the portal uses this rather than showing a bare
 * blank area, so the customer always knows what to do next.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  SUBMITTED: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  ACCEPTED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  CANCELLED: "bg-line/60 text-muted",
  DRAFT: "bg-line/60 text-muted",

  Booked: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Intake: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  Batched: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  "Handed Over": "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  "In Transit": "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Customs Hold": "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  Delayed: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  Delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Archived: "bg-line/60 text-muted",
};

/** Status pill. One component so booking and shipment statuses stay consistent. */
export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        STATUS_TONE[status] ?? "bg-line/60 text-muted"
      }`}
    >
      {status}
    </span>
  );
}

/** Label/value pair used across the profile and detail panels. */
export function DataRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

/** Small caption used under a page or section heading. */
export function Caption({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted">{children}</p>;
}
