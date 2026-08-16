import { SLAPolicy } from "@/app/types/sla"

export const slaPolicies: SLAPolicy[] = [
  { region: "Metro Manila", maxDays: 1 },
  { region: "Luzon", maxDays: 3 },
  { region: "Visayas", maxDays: 5 },
  { region: "Mindanao", maxDays: 5 },
]
