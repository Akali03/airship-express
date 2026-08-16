import { getNotifications } from "../../services/notification.service"
import { getCustomers } from "../../services/crm.service"
import { Bell, BellOff } from "lucide-react"

const typeStyle: Record<string, string> = {
  "Shipment Accepted": "bg-blue-50 text-blue-600",
  "Shipment In Transit": "bg-indigo-50 text-indigo-600",
  "Shipment Delivered": "bg-emerald-50 text-emerald-600",
  "POD Available": "bg-purple-50 text-purple-600",
  "General Announcement": "bg-zinc-100 text-zinc-500",
}

export default async function PortalPage() {
  const [notifications, customers] = await Promise.all([getNotifications(), getCustomers()])
  const customerMap = Object.fromEntries(customers.map((c) => [c.customerId, c.fullName]))
  const unread = notifications.filter((n) => n.status === "Unread").length

  return (
    <div className="w-full py-4 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-zinc-900 text-xl font-semibold">Customer Portal & Notifications</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Manage customer notifications and portal activity</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-zinc-100 rounded-xl px-4 py-3">
          <Bell size={14} className="text-indigo-500" />
          <span className="text-zinc-700 text-sm font-medium">{unread} unread</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h2 className="text-zinc-800 text-sm font-medium">All Notifications</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left">
              {["ID", "Customer", "Type", "Message", "Shipment", "Status", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-xs text-indigo-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.notificationId} className={`border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 transition-colors ${n.status === "Unread" ? "bg-indigo-50/30" : ""}`}>
                <td className="px-4 py-3 text-indigo-600 text-xs font-medium">{n.notificationId}</td>
                <td className="px-4 py-3 text-zinc-700 text-xs">{customerMap[n.customerId] ?? n.customerId}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeStyle[n.type] ?? "bg-zinc-100 text-zinc-500"}`}>{n.type}</span>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs max-w-xs truncate">{n.message}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{n.shipmentId ?? "—"}</td>
                <td className="px-4 py-3">
                  {n.status === "Unread"
                    ? <span className="flex items-center gap-1 text-xs text-indigo-600"><Bell size={11} /> Unread</span>
                    : <span className="flex items-center gap-1 text-xs text-zinc-400"><BellOff size={11} /> Read</span>
                  }
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{new Date(n.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
