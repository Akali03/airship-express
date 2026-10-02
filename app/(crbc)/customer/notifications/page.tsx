import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getCurrentUser } from "../../library/auth/getCurrentUser";
import { getBookingRequests } from "../../services/booking-request.service";
import { getCustomerNotifications } from "../../services/notification.service";
import {
  PageHeader,
  Panel,
  EmptyState,
  SecondaryLink,
  Caption,
} from "../../components/customer/PortalUI";
import type { NotificationKind } from "../../services/notification.service";

const KIND_ACCENT: Record<NotificationKind, string> = {
  request_accepted: "bg-emerald-500",
  request_rejected: "bg-red-500",
  request_cancelled: "bg-zinc-400",
  shipment_updated: "bg-blue-500",
  shipment_delivered: "bg-emerald-500",
  pod_available: "bg-purple-500",
};

export default async function NotificationsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/customerportalAuth/login");
  if (currentUser.profile.role !== "customer") redirect("/crbc/dashboard");

  const customer = currentUser.customer;

  if (!customer) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-6">
        <PageHeader
          title="Notifications"
          description="Updates about your requests and shipments."
        />
        <Panel>
          <EmptyState
            icon={<Bell size={16} />}
            title="No notifications yet"
            description="Updates about your requests and shipments will appear here."
          />
        </Panel>
      </div>
    );
  }

  const requests = await getBookingRequests({ customerUuid: customer.id });
  const notifications = await getCustomerNotifications(customer.id, requests);

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      <PageHeader
        title="Notifications"
        description="Updates about your requests and shipments."
      />

      <Panel
        title={`${notifications.length} update${notifications.length === 1 ? "" : "s"}`}
      >
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={16} />}
            title="Nothing to report yet"
            description="You'll be notified here when a request is accepted or a shipment changes status."
            action={<SecondaryLink href="/customer/shipment-history">View Shipment History</SecondaryLink>}
          />
        ) : (
          <ul className="divide-y divide-line">
            {notifications.map((n) => (
              <li key={n.id} className="transition-colors hover:bg-line/20">
                <Link href={n.href} className="flex items-start gap-3 px-5 py-4">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      KIND_ACCENT[n.kind]
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{n.detail}</p>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(n.at).toLocaleString("en-PH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Caption>
        Notifications are generated from your request status and shipment
        tracking history, so they always match the underlying record.
      </Caption>
    </div>
  );
}
