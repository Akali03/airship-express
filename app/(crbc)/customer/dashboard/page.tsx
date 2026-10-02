import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  FileText,
  Truck,
  PlusCircle,
  Bell,
  ArrowRight,
} from "lucide-react";
import { getCurrentUser } from "../../library/auth/getCurrentUser";
import { getBookingRequests } from "../../services/booking-request.service";
import { getSLAPoliciesFromStore } from "../../services/sla-policies.store";
import { getShipmentsByCustomerId } from "../../services/shipment.service";
import { getDocumentsByCustomerId } from "../../services/document.service";
import { getCustomerNotifications } from "../../services/notification.service";
import {
  REQUEST_STATUS_LABELS,
  type BookingRequestStatus,
} from "../../types/booking-request";
import {
  Panel,
  EmptyState,
  PrimaryLink,
  SecondaryLink,
  StatusPill,
} from "../../components/customer/PortalUI";


export default async function CustomerDashboard() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/customerportalAuth/login");
  if (currentUser.profile.role !== "customer") redirect("/crbc/dashboard");

  const customer = currentUser.customer;

  // No CRM record yet is a valid state: the account exists but no booking has
  // ever been made for them on any channel.
  if (!customer) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 py-6">
        <div>
          <h1 className="font-bricolage text-xl font-semibold text-foreground sm:text-2xl">
            Welcome,{" "}
            {currentUser.profile.full_name ?? currentUser.profile.email}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Your Airship Express customer account.
          </p>
        </div>

        <Panel>
          <EmptyState
            icon={<Package size={16} />}
            title="No requests yet"
            description="Submit a Shipment Request to send a parcel, or visit one of our hubs and our team will record it for you."
            action={
              <PrimaryLink href="/customer/shipments/new">
                <PlusCircle size={14} />
                Create a Shipment Request
              </PrimaryLink>
            }
          />
        </Panel>
      </div>
    );
  }

  const [requests, slaPolicies] = await Promise.all([
    getBookingRequests({ customerUuid: customer.id }),
    getSLAPoliciesFromStore(),
  ]);

  const [shipments, documents, notifications] = await Promise.all([
    getShipmentsByCustomerId(customer.customer_id, slaPolicies),
    getDocumentsByCustomerId(customer.customer_id),
    getCustomerNotifications(customer.id, requests),
  ]);

  const activeRequests = requests.filter(
    (r) => r.status === "PENDING" || r.status === "ACCEPTED" || r.status === "SUBMITTED"
  );
  const inTransit = shipments.filter(
    (s) => s.status === "In Transit" || s.status === "Batched" || s.status === "Handed Over"
  );
  const delivered = shipments.filter((s) => s.actual_delivery !== null);

  const stats = [
    { label: "Active shipment requests", value: activeRequests.length },
    { label: "Shipments in transit", value: inTransit.length },
    { label: "Delivered", value: delivered.length },
    { label: "Documents", value: documents.length },
  ];

  const recentRequests = requests.slice(0, 5);
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-bricolage text-xl font-semibold text-foreground sm:text-2xl">
            Welcome, {customer.full_name ?? currentUser.profile.full_name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {customer.customer_id}
          </p>
        </div>
        <PrimaryLink href="/customer/shipments/new">
          <PlusCircle size={14} />
          Create a Shipment Request
        </PrimaryLink>
      </div>

      {/* Counts — only what the customer's own records say */}
      {stats.some((s) => s.value > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-line bg-background px-4 py-3"
            >
              <p className="text-xs text-muted">{s.label}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent booking requests */}
        <Panel
          title="Recent shipment requests"
          className="lg:col-span-2"
          action={<SecondaryLink href="/customer/shipment-history">View all</SecondaryLink>}
        >
          {recentRequests.length === 0 ? (
            <EmptyState
              icon={<Package size={16} />}
              title="No shipment history yet"
              description="Submit a Shipment Request, or ask our team at the counter."
            />
          ) : (
            <ul className="divide-y divide-line">
              {recentRequests.map((r) => {
                const status = r.status as BookingRequestStatus;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/customer/shipment-history/${r.request_id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-line/20"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-accent">
                          {r.request_id}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted">
                          To {r.receiver.name} ·{" "}
                          {r.receiver.address.city ||
                            r.receiver.address.province ||
                            "—"}
                        </p>
                      </div>
                      <StatusPill
                        status={REQUEST_STATUS_LABELS[status] ?? r.status}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* Notifications */}
        <Panel
          title="Recent updates"
          action={<SecondaryLink href="/customer/notifications">View all</SecondaryLink>}
        >
          {recentNotifications.length === 0 ? (
            <EmptyState
              icon={<Bell size={16} />}
              title="No updates yet"
              description="We'll let you know when a request is accepted or a shipment moves."
            />
          ) : (
            <ul className="divide-y divide-line">
              {recentNotifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    className="block px-5 py-3 transition-colors hover:bg-line/20"
                  >
                    <p className="text-xs font-medium text-foreground">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(n.at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Shortcuts */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/customer/shipments"
          className="flex items-center gap-3 rounded-lg border border-line bg-background px-4 py-3.5 transition-colors hover:bg-line/20"
        >
          <Truck size={16} className="shrink-0 text-muted" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-foreground">Your shipments</span>
            <span className="block text-xs text-muted">
              Status and tracking
            </span>
          </span>
          <ArrowRight size={14} className="shrink-0 text-muted" />
        </Link>

        <Link
          href="/customer/documents"
          className="flex items-center gap-3 rounded-lg border border-line bg-background px-4 py-3.5 transition-colors hover:bg-line/20"
        >
          <FileText size={16} className="shrink-0 text-muted" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-foreground">Documents</span>
            <span className="block text-xs text-muted">Proof of Delivery</span>
          </span>
          <ArrowRight size={14} className="shrink-0 text-muted" />
        </Link>

        <Link
          href="/customer/profile"
          className="flex items-center gap-3 rounded-lg border border-line bg-background px-4 py-3.5 transition-colors hover:bg-line/20"
        >
          <Package size={16} className="shrink-0 text-muted" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-foreground">Your profile</span>
            <span className="block text-xs text-muted">Name and address</span>
          </span>
          <ArrowRight size={14} className="shrink-0 text-muted" />
        </Link>
      </div>
    </div>
  );
}
