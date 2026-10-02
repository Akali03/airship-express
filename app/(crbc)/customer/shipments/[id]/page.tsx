import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "../../../library/auth/getCurrentUser";
import { getSLAPoliciesFromStore } from "../../../services/sla-policies.store";
import { getShipmentByRequestId } from "../../../services/shipment.service";
import { getShipmentTimeline } from "../../../services/notification.service";
import { getDocumentsByShipmentId } from "../../../services/document.service";
import {
  PageHeader,
  Panel,
  StatusPill,
  DataRow,
  SecondaryLink,
} from "../../../components/customer/PortalUI";


export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/customerportalAuth/login");
  if (currentUser.profile.role !== "customer") redirect("/crbc/dashboard");
  const customer = currentUser.customer;
  if (!customer) notFound();
  const slaPolicies = await getSLAPoliciesFromStore();
  const shipment = await getShipmentByRequestId(id, slaPolicies);
  if (!shipment) notFound();
  if (shipment.customer_code !== customer.customer_id) notFound();
  const [timeline, documents] = await Promise.all([
    getShipmentTimeline(shipment.shipment_id),
    getDocumentsByShipmentId(shipment.shipment_id),
  ]);
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <Link
        href="/customer/shipments"
        className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={13} />
        Back to Shipments
      </Link>
      <PageHeader
        title={shipment.tracking_number ?? shipment.reference}
        description={`Shipment for booking ${shipment.request_id}`}
        action={<StatusPill status={shipment.status} />}
      />
      <Panel title="Current status">
        <dl className="divide-y divide-line px-5 py-1">
          <DataRow label="Status" value={<StatusPill status={shipment.status} />} />
          {shipment.current_location && (
            <DataRow label="Current location" value={shipment.current_location} />
          )}
          <DataRow
            label="Expected delivery"
            value={shipment.expected_delivery ?? "To be confirmed"}
          />
          {shipment.actual_delivery && (
            <DataRow
              label="Delivered on"
              value={new Date(shipment.actual_delivery).toLocaleString("en-PH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            />
          )}
          <DataRow
            label="Service"
            value={`${shipment.platform} · ${shipment.service_type}`}
          />
          <DataRow
            label="Route"
            value={`${shipment.origin} → ${shipment.destination}`}
          />
        </dl>
      </Panel>
      <Panel title="Receiver">
        <dl className="divide-y divide-line px-5 py-1">
          <DataRow label="Name" value={shipment.receiver_name} />
          <DataRow label="Address" value={shipment.receiver_address || "—"} />
        </dl>
      </Panel>
      <Panel
        title="Package"
        description="As submitted with your shipment request."
      >
        <dl className="divide-y divide-line px-5 py-1">
          <DataRow
            label="Quantity"
            value={`${shipment.package_quantity} package${shipment.package_quantity === 1 ? "" : "s"}`}
          />
          <DataRow label="Type" value={shipment.package_type} />
          {shipment.item_category && (
            <DataRow label="Category" value={shipment.item_category} />
          )}
          {shipment.weight && (
            <DataRow label="Weight" value={`${shipment.weight} kg`} />
          )}
          {shipment.dimensions && (
            <DataRow
              label="Dimensions"
              value={`${shipment.dimensions.length_cm} × ${shipment.dimensions.width_cm} × ${shipment.dimensions.height_cm} cm`}
            />
          )}
          {shipment.declared_value != null && (
            <DataRow
              label="Declared value"
              value={`₱${Number(shipment.declared_value).toLocaleString("en-PH")}`}
            />
          )}
        </dl>
      </Panel>
      <Panel
        title="Tracking history"
        description="Provided by Freight Operations. Read-only."
      >
        {timeline.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">
            No tracking events have been recorded for this shipment yet.
          </p>
        ) : (
          <ol className="px-5 py-4">
            {timeline.map((event, index) => {
              const isLatest = index === timeline.length - 1;
              return (
                <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {index < timeline.length - 1 && (
                    <span
                      className="absolute left-1 top-4 h-full w-px bg-line"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 ${
                      isLatest
                        ? "border-accent bg-accent"
                        : "border-line bg-background"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${
                        isLatest ? "font-medium text-foreground" : "text-muted"
                      }`}
                    >
                      {event.status ?? event.event_type}
                    </p>
                    {event.location && (
                      <p className="mt-0.5 text-xs text-muted">
                        {event.location}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(event.created_at).toLocaleString("en-PH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
      {documents.length > 0 && (
        <Panel title="Documents">
          <ul className="divide-y divide-line">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm text-foreground">{doc.documentType}</p>
                  <p className="text-xs text-muted">
                    {doc.documentId}
                    {doc.generatedDate
                      ? ` · ${new Date(doc.generatedDate).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`
                      : ""}
                  </p>
                </div>
                <SecondaryLink href="/customer/documents">
                  View documents
                </SecondaryLink>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
