import { redirect } from "next/navigation";
import Link from "next/link";
import { Truck, PlusCircle } from "lucide-react";
import { getCurrentUser } from "../../library/auth/getCurrentUser";
import { getSLAPoliciesFromStore } from "../../services/sla-policies.store";
import { getShipmentsByCustomerId } from "../../services/shipment.service";
import {
  PageHeader,
  Panel,
  EmptyState,
  PrimaryLink,
  StatusPill,
} from "../../components/customer/PortalUI";


export default async function ShipmentsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/customerportalAuth/login");
  if (currentUser.profile.role !== "customer") redirect("/crbc/dashboard");

  const customer = currentUser.customer;

  if (!customer) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 py-6">
        <PageHeader
          title="Shipments"
          description="Parcels currently with Airship Express."
        />
        <Panel>
          <EmptyState
            icon={<Truck size={16} />}
            title="No shipments yet"
            description="Once you submit a shipment request and it is accepted, your shipment will appear here."
            action={<PrimaryLink href="/customer/shipments/new">Create a Shipment Request</PrimaryLink>}
          />
        </Panel>
      </div>
    );
  }

  const slaPolicies = await getSLAPoliciesFromStore();
  const shipments = await getShipmentsByCustomerId(
    customer.customer_id,
    slaPolicies
  );

  // Newest operational activity first — the last tracking event is the most
  // useful thing to see at the top of a shipment list.
  const ordered = [...shipments].sort((a, b) =>
    (b.status_updated_at ?? b.booking_created_at).localeCompare(
      a.status_updated_at ?? a.booking_created_at
    )
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6">
      <PageHeader
        title="Shipments"
        description="Parcels Airship Express is moving for you."
        action={
          <PrimaryLink href="/customer/shipments/new">
            <PlusCircle size={14} />
            New Shipment Request
          </PrimaryLink>
        }
      />

      <Panel
        title={`${shipments.length} shipment${shipments.length === 1 ? "" : "s"}`}
        description="Status and location are provided by Freight Operations."
      >
        {shipments.length === 0 ? (
          <EmptyState
            icon={<Truck size={16} />}
            title="No shipments yet"
            description="A shipment is created once your request is accepted and processed. Accepted requests appear under Shipment History until then."
            action={<PrimaryLink href="/customer/shipment-history">View Shipment History</PrimaryLink>}
          />
        ) : (
          <ul className="divide-y divide-line">
            {ordered.map((s) => (
              <li key={s.shipment_id} className="transition-colors hover:bg-line/20">
                <Link
                  href={`/customer/shipments/${s.request_id}`}
                  className="block px-5 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-accent">
                          {s.tracking_number ?? s.reference}
                        </span>
                        <StatusPill status={s.status} />
                        <StatusPill status={s.sla_status} />
                      </div>
                      <p className="mt-1.5 text-sm text-foreground">
                        {s.origin} → {s.destination}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        To {s.receiver_name}
                        {s.current_location
                          ? ` · Near ${s.current_location}`
                          : ""}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[11px] uppercase tracking-wide text-muted">
                        Expected delivery
                      </p>
                      <p className="mt-0.5 text-sm text-foreground">
                        {s.expected_delivery ?? "To be confirmed"}
                      </p>
                      {s.actual_delivery && (
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                          Delivered{" "}
                          {new Date(s.actual_delivery).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
