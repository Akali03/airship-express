import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "../../../library/auth/getCurrentUser";
import { getBookingRequestById } from "../../../services/booking-request.service";
import { getSLAPoliciesFromStore } from "../../../services/sla-policies.store";
import { getShipmentByRequestId } from "../../../services/shipment.service";
import EditBookingRequestForm from "../../../components/customer/EditBookingRequestForm";
import {
  REQUEST_STATUS_LABELS,
  type BookingRequestStatus,
} from "../../../types/booking-request";
import {
  PageHeader,
  Panel,
  StatusPill,
  DataRow,
  SecondaryLink,
} from "../../../components/customer/PortalUI";

const CHANNEL_LABELS: Record<string, string> = {
  PORTAL: "Submitted online (Customer Portal)",
  WALK_IN: "Walk-in at an Airship Express hub",
  PHONE_CALL: "Recorded over the phone",
};

export default async function BookingRequestDetailPage({
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

  const request = await getBookingRequestById(id);
  if (!request) notFound();

  if (request.customer_id !== customer.id) notFound();

  const slaPolicies = await getSLAPoliciesFromStore();
  const shipment = await getShipmentByRequestId(
    request.request_id,
    slaPolicies
  );

  const status = request.status as BookingRequestStatus;
  const label = REQUEST_STATUS_LABELS[status] ?? request.status;

  const senderAddress = [
    request.sender.address.full_address,
    request.sender.address.barangay,
    request.sender.address.city,
    request.sender.address.province,
  ]
    .filter(Boolean)
    .join(", ");

  const receiverAddress = [
    request.receiver.address.full_address,
    request.receiver.address.barangay,
    request.receiver.address.city,
    request.receiver.address.province,
  ]
    .filter(Boolean)
    .join(", ");

  const dims = request.package.dimensions;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <Link
        href="/customer/shipment-history"
        className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={13} />
        Back to Shipment History
      </Link>

      <PageHeader
        title={`Shipment ${request.request_id}`}
        description={CHANNEL_LABELS[request.request_channel] ?? request.request_channel}
        action={<StatusPill status={label} />}
      />

      <Panel title="Status">
        <div className="px-5 py-4">
          {request.status === "PENDING" && (
            <p className="text-sm text-muted">
              Awaiting review by Airship Express. Once accepted, this request is
              passed to Freight Operations for processing.
            </p>
          )}
          {request.status === "ACCEPTED" &&
            (shipment ? (
              <p className="text-sm text-muted">
                Accepted and processed by Freight Operations. Track the shipment
                using its tracking number.
              </p>
            ) : (
              <p className="text-sm text-muted">
                Accepted and sent to Freight Operations. Your shipment will
                appear here once it has been created.
              </p>
            ))}
          {request.status === "REJECTED" && (
            <p className="text-sm text-muted">
              This request could not be accepted. Please contact Airship
              Express for details.
            </p>
          )}
          {request.status === "CANCELLED" && (
            <p className="text-sm text-muted">
              This request was cancelled and is no longer being processed.
            </p>
          )}
        </div>
      </Panel>

      <Panel title="Shipment">
        {shipment ? (
          <>
            <dl className="divide-y divide-line px-5 py-1">
              <DataRow
                label="Tracking number"
                value={
                  <span className="font-mono text-xs">
                    {shipment.tracking_number ?? "Not yet assigned"}
                  </span>
                }
              />
              <DataRow label="Shipment reference" value={<span className="font-mono text-xs">{shipment.reference}</span>} />
              <DataRow label="Status" value={<StatusPill status={shipment.status} />} />
              {shipment.current_location && (
                <DataRow label="Current location" value={shipment.current_location} />
              )}
              <DataRow
                label="Expected delivery"
                value={shipment.expected_delivery ?? "—"}
              />
              <DataRow label="SLA" value={<StatusPill status={shipment.sla_status} />} />
            </dl>
            <div className="px-5 pb-5">
              <SecondaryLink href={`/customer/shipments/${request.request_id}`}>
                View shipment details
              </SecondaryLink>
            </div>
          </>
        ) : (
          <p className="px-5 py-6 text-sm text-muted">
            No shipment has been created for this request yet. A shipment is
            created by Freight Operations only after the request is accepted
            and processed.
          </p>
        )}
      </Panel>

      <Panel title="Sender">
        <dl className="divide-y divide-line px-5 py-1">
          <DataRow label="Name" value={request.sender.name} />
          {request.sender.phone && (
            <DataRow label="Phone" value={request.sender.phone} />
          )}
          <DataRow label="Address" value={senderAddress || "—"} />
        </dl>
      </Panel>

      <Panel title="Receiver">
        <dl className="divide-y divide-line px-5 py-1">
          <DataRow label="Name" value={request.receiver.name} />
          {request.receiver.contact && (
            <DataRow label="Phone" value={request.receiver.contact} />
          )}
          <DataRow label="Address" value={receiverAddress || "—"} />
        </dl>
      </Panel>

      <Panel title="Package">
        <dl className="divide-y divide-line px-5 py-1">
          <DataRow label="Quantity" value={`${request.package.quantity} package${request.package.quantity === 1 ? "" : "s"}`} />
          <DataRow label="Type" value={request.package.type} />
          {request.package.category && (
            <DataRow label="Category" value={request.package.category} />
          )}
          {request.package.weight && (
            <DataRow label="Weight" value={`${request.package.weight} kg`} />
          )}
          {dims && (
            <DataRow
              label="Dimensions"
              value={`${dims.length_cm} × ${dims.width_cm} × ${dims.height_cm} cm`}
            />
          )}
          {request.declared_value != null && (
            <DataRow
              label="Declared value"
              value={`₱${Number(request.declared_value).toLocaleString("en-PH")}`}
            />
          )}
          {request.airship_packaging_requested && (
            <DataRow label="Packaging" value="Airship packaging requested" />
          )}
          {request.remarks && (
            <DataRow label="Remarks" value={request.remarks} />
          )}
        </dl>
      </Panel>

      <Panel title="Request details">
        <dl className="divide-y divide-line px-5 py-1">
          <DataRow
            label="Submitted"
            value={new Date(request.created_at).toLocaleString("en-PH", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
          <DataRow
            label="Channel"
            value={CHANNEL_LABELS[request.request_channel] ?? request.request_channel}
          />
        </dl>
      </Panel>

      {request.status === "PENDING" && (
        <Panel
          title="Edit request"
          description="Available while this request is still pending."
        >
          <div className="px-5 py-5">
            <EditBookingRequestForm
              requestId={request.request_id}
              initial={{
                receiver_name: request.receiver_name,
                receiver_contact: request.receiver_contact,
                receiver_province: request.receiver_province,
                receiver_city: request.receiver_city,
                receiver_barangay: request.receiver_barangay,
                receiver_full_address: request.receiver_full_address,
                package_quantity: request.package_quantity,
                package_type: request.package_type,
                item_category: request.item_category,
                weight: request.weight,
                dimensions: request.dimensions,
                declared_value: request.declared_value,
                airship_packaging_requested: request.airship_packaging_requested,
                remarks: request.remarks,
              }}
            />
          </div>
        </Panel>
      )}
    </div>
  );
}
