import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { getCurrentUser } from "../../library/auth/getCurrentUser";
import { getDocumentsByCustomerId } from "../../services/document.service";
import {
  PageHeader,
  Panel,
  EmptyState,
  SecondaryLink,
} from "../../components/customer/PortalUI";


export default async function DocumentsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/customerportalAuth/login");
  if (currentUser.profile.role !== "customer") redirect("/crbc/dashboard");

  const customer = currentUser.customer;

  if (!customer) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 py-6">
        <PageHeader
          title="Documents"
          description="Delivery documents for your shipments."
        />
        <Panel>
          <EmptyState
            icon={<FileText size={16} />}
            title="No documents yet"
            description="Documents appear here once a shipment has been delivered."
          />
        </Panel>
      </div>
    );
  }

  const documents = await getDocumentsByCustomerId(customer.customer_id);

  // Shipment ids, so each document can link to the shipment it belongs to.
  const shipmentIds = documents.map((d) => d.shipmentId);

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <PageHeader
        title="Documents"
        description="Delivery documents for your shipments."
      />

      <Panel
        title={`${documents.length} document${documents.length === 1 ? "" : "s"}`}
        description="A Proof of Delivery is available once a shipment has been delivered."
      >
        {documents.length === 0 ? (
          <EmptyState
            icon={<FileText size={16} />}
            title="No documents yet"
            description="Once a shipment is delivered, its Proof of Delivery will appear here."
            action={<SecondaryLink href="/customer/shipments">View shipments</SecondaryLink>}
          />
        ) : (
          <ul className="divide-y divide-line">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="flex items-start gap-3">
                  <FileText size={16} className="mt-0.5 shrink-0 text-muted" />
                  <div>
                    <p className="text-sm text-foreground">{doc.documentType}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted">
                      {doc.documentId}
                    </p>
                    {doc.generatedDate && (
                      <p className="mt-0.5 text-xs text-muted">
                        {new Date(doc.generatedDate).toLocaleDateString("en-PH", {
                          dateStyle: "medium",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-line/60 px-2.5 py-0.5 text-[11px] font-medium text-muted">
                    {doc.podStatus}
                  </span>
                  {shipmentIds.includes(doc.shipmentId) && (
                    <SecondaryLink href="/customer/shipments">
                      View shipment
                    </SecondaryLink>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>


    </div>
  );
}
