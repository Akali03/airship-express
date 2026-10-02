"use client"

import { useState } from "react"
import { Package, MessageSquare, ClipboardList, Truck, Inbox } from "lucide-react"
import { formatDate } from "@/app/(crbc)/library/utils/formattedate"
import {
  CHANNEL_LABELS,
  REQUEST_STATUS_LABELS,
} from "@/app/(crbc)/types/booking-request"
import type {
  BookingRequest,
  BookingRequestStatus,
  InteractionChannel,
} from "@/app/(crbc)/types/booking-request"

export type ShipmentRow = {
  shipmentId: string
  origin: string
  destination: string
  bookingDate: string
  status: string
}

type InteractionRow = {
  id: string
  interaction_date: string
  interaction_type: InteractionChannel
  notes?: string | null
}

/**
 * Status pills use theme tokens rather than hardcoded zinc, so they stay
 * legible in dark mode. A missing value falls back to a neutral pill rather
 * than rendering nothing.
 */
const shipmentStatusStyle: Record<string, string> = {
  Completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "In Transit": "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Handed Over": "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  Pending: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Delayed: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  Cancelled: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
}

const requestStatusStyle: Record<BookingRequestStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  SUBMITTED: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  ACCEPTED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
}

const NEUTRAL_PILL = "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"

type Tab = "shipments" | "requests" | "interactions"

const EMPTY_PANEL =
  "flex flex-col items-center justify-center gap-1.5 px-5 py-10 text-center"

/** Shared empty state so the three tabs read consistently. */
function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className={EMPTY_PANEL}>
      <Inbox size={18} className="text-muted" aria-hidden="true" />
      <p className="text-foreground text-sm font-medium">{title}</p>
      <p className="text-muted max-w-sm text-xs">{description}</p>
    </div>
  )
}

function tableHead(cells: string[]) {
  return (
    <thead>
      <tr className="border-b border-line text-left">
        {cells.map((h) => (
          <th
            key={h}
            className="text-muted px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export function CustomerProfileTabs({
  shipments,
  requests,
  interactions,
}: {
  shipments: ShipmentRow[]
  requests: BookingRequest[]
  interactions: InteractionRow[]
}) {
  const [active, setActive] = useState<Tab>("requests")

  // Counts live on the tab so a CSR can see where the history is without
  // clicking each tab first.
  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "requests", label: "Booking Requests", icon: <ClipboardList size={13} />, count: requests.length },
    { id: "shipments", label: "Shipments", icon: <Truck size={13} />, count: shipments.length },
    { id: "interactions", label: "Interactions", icon: <MessageSquare size={13} />, count: interactions.length },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-background">
      {/* Tab bar — scrolls horizontally on narrow screens */}
      <div className="flex overflow-x-auto border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            aria-current={active === tab.id ? "page" : undefined}
            className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
              active === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className="text-muted rounded-full bg-line/60 px-1.5 text-[10px] tabular-nums">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking Requests — the default tab: a CSR opens a profile to see
          what the customer has asked for. */}
      {active === "requests" && (
        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <EmptyState
              title="No booking requests"
              description="Nothing has been submitted or recorded for this customer yet."
            />
          ) : (
            <table className="w-full text-sm">
              {tableHead(["Request", "Date", "Receiver", "Status"])}
              <tbody className="divide-y divide-line">
                {requests.map((r) => {
                  const status = r.status as BookingRequestStatus
                  return (
                    <tr
                      key={r.id}
                      className="transition-colors hover:bg-line/20"
                    >
                      <td className="px-5 py-3 font-mono text-xs font-medium text-accent">
                        {r.request_id}
                      </td>
                      <td className="text-muted px-5 py-3 text-xs whitespace-nowrap">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="text-foreground max-w-xs truncate px-5 py-3 text-xs">
                        {r.receiver_name}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            requestStatusStyle[status] ?? NEUTRAL_PILL
                          }`}
                        >
                          {REQUEST_STATUS_LABELS[status] ?? r.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Shipments — read from the Freight Ops adapter, never stored in CRBC. */}
      {active === "shipments" && (
        <div className="overflow-x-auto">
          {shipments.length === 0 ? (
            <EmptyState
              title="No shipments yet"
              description="Shipments appear once Freight Operations creates one from an accepted booking."
            />
          ) : (
            <table className="w-full text-sm">
              {tableHead(["Shipment", "Route", "Booked", "Status"])}
              <tbody className="divide-y divide-line">
                {shipments.map((s) => (
                  <tr
                    key={s.shipmentId}
                    className="transition-colors hover:bg-line/20"
                  >
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2">
                        <Package
                          size={13}
                          className="text-muted shrink-0"
                          aria-hidden="true"
                        />
                        <span className="font-mono text-xs font-medium text-foreground">
                          {s.shipmentId}
                        </span>
                      </span>
                    </td>
                    <td className="text-muted px-5 py-3 text-xs">
                      {s.origin} → {s.destination}
                    </td>
                    <td className="text-muted hidden px-5 py-3 text-xs whitespace-nowrap sm:table-cell">
                      {s.bookingDate}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          shipmentStatusStyle[s.status] ?? NEUTRAL_PILL
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Interaction History */}
      {active === "interactions" && (
        <div className="overflow-x-auto">
          {interactions.length === 0 ? (
            <EmptyState
              title="No interactions recorded"
              description="Contacts logged at the counter, over the phone, or in Messenger will appear here."
            />
          ) : (
            <table className="w-full text-sm">
              {tableHead(["Date", "Channel", "Activity / Notes"])}
              <tbody className="divide-y divide-line">
                {interactions.map((i) => (
                  <tr
                    key={i.id}
                    className="transition-colors hover:bg-line/20"
                  >
                    <td className="text-muted px-5 py-3 text-xs whitespace-nowrap">
                      {formatDate(i.interaction_date)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-accent inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium">
                        {CHANNEL_LABELS[i.interaction_type] ?? i.interaction_type}
                      </span>
                    </td>
                    <td className="text-muted max-w-md truncate px-5 py-3 text-xs">
                      {i.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}