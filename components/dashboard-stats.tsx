"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Ticket, Bus, Users, AlertCircle } from "lucide-react"

const stats = [
  {
    title: "Total Bookings",
    value: "350",
    icon: Ticket,
  },
  {
    title: "Active Buses",
    value: "120",
    icon: Bus,
  },
  {
    title: "Total Users",
    value: "200",
    icon: Users,
  },
  {
    title: "Total Cancellations",
    value: "200",
    icon: AlertCircle,
  },
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <stat.icon className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-500">{stat.title}</p>
                <p className="text-3xl font-bold text-yellow-500">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
