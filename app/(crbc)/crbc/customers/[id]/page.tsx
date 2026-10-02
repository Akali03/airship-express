import {
  getCustomerById,
  getInteractionsByCustomerId,
  getBookingRequestsByCustomerId,
} from "@/app/(crbc)/services/crm.service"
import { getShipmentsByCustomerId } from "@/app/(crbc)/services/shipment.service"
import { getSLAPoliciesFromStore } from "@/app/(crbc)/services/sla-policies.store"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { formatDate } from "@/app/(crbc)/library/utils/formattedate"
import Link from "next/link"
import { CustomerProfileTabs } from "@/app/(crbc)/components/customers/CustomerProfileTabs"
import type { ShipmentRow } from "@/app/(crbc)/components/customers/CustomerProfileTabs"
import EditCustomerModal from "@/app/(crbc)/components/customers/EditCustomerModal"

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [customer, interactions, requests, slaPolicies] = await Promise.all([
    getCustomerById(id),
    getInteractionsByCustomerId(id),
    getBookingRequestsByCustomerId(id),
    getSLAPoliciesFromStore(),
  ])

  if (!customer) notFound()

  const shipments = await getShipmentsByCustomerId(customer.customer_id, slaPolicies)

  const transformedShipments: ShipmentRow[] = shipments.map((s) => ({
    shipmentId: s.reference,
    origin: s.origin,
    destination: s.destination,
    bookingDate: s.booking_created_at,
    status: s.status,
  }))

  const infoRows: { label: string; value: string }[] = [
    { label: "Customer ID", value: customer.customer_id },
    { label: "Full Name", value: customer.full_name },
    { label: "Customer Type", value: customer.role === "customer" ? "Individual" : customer.role },
    { label: "Email", value: customer.email ?? "-" },
    { label: "Phone", value: customer.phone ?? "-" },
    { label: "Address", value: customer.full_address ?? "-" },
    { label: "Registered", value: formatDate(customer.created_at) },
  ]

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 text-foreground">
      <Link
        href="/crbc/customers"
        className="inline-flex items-center gap-1.5 text-xs hover:text-zinc-700 transition-colors"
      >
        <ArrowLeft size={13} /> Back to Customers
      </Link>

      {/* Customer Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground truncate">
            {customer.full_name}
          </h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span className="font-mono text-accent">{customer.customer_id}</span>
            <span aria-hidden="true">·</span>
            <span>Customer since {formatDate(customer.created_at)}</span>
          </p>
        </div>
        <EditCustomerModal
          customer={{
            uuid: customer.id,
            customerId: customer.customer_id,
            fullName: customer.full_name,
            email: customer.email ?? null,
            phone: customer.phone ?? null,
            province: customer.province ?? null,
            city: customer.city ?? null,
            barangay: customer.barangay ?? null,
            fullAddress: customer.full_address ?? null,
          }}
        />
      </div>

      {/* Customer Information — permanent identity */}
      <section className="rounded-xl border border-line bg-background">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-foreground text-sm font-medium">
            Customer Information
          </h2>
          <p className="text-muted mt-0.5 text-xs">
            CRM master record. Customer ID and account links are system-managed.
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-3">
          {infoRows.map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="text-muted text-[11px] uppercase tracking-wide">
                {label}
              </dt>
              <dd className="mt-1 truncate text-sm text-foreground">{value}</dd>
            </div>
          ))}
          <div>
            <dt className="text-muted text-[11px] uppercase tracking-wide">
              Status
            </dt>
            <dd className="mt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Active
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <CustomerProfileTabs
        shipments={transformedShipments}
        requests={requests}
        interactions={interactions}
      />
    </div>
  )
}
