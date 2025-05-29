"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Ticket, Bus, Users, AlertCircle, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

interface ApiResponse {
  success: boolean
  message: string
  data: {
    totalUsers: number
    totalBus: number
    totalTickets: number
    totalCancle: number
  }
}

export function DashboardStats() {
  const session = useSession();
  const token = session?.data?.accessToken
 
  // Replace with your actual token - you might get this from localStorage, cookies, or context


  const fetchStats = async (): Promise<ApiResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/count`, {
      // Update with your actual API endpoint
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch stats")
    }

    return response.json()
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Map API data to stats array
  const stats = data
    ? [
      {
        title: "Total Bookings",
        value: data.data.totalTickets.toString(),
        icon: Ticket,
      },
      {
        title: "Active Buses",
        value: data.data.totalBus.toString(),
        icon: Bus,
      },
      {
        title: "Total Users",
        value: data.data.totalUsers.toString(),
        icon: Users,
      },
      {
        title: "Total Cancellations",
        value: data.data.totalCancle.toString(),
        icon: AlertCircle,
      },
    ]
    : []

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-[#1F2022] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg ">
                  <Loader2 className="h-6 w-6 text-[#C0A05C] animate-spin" />
                </div>
                <div>
                  <div className="h-4 w-20 bg-[#1F2022] rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-16 bg-[#1F2022] rounded animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-red-900/20 border-red-700 col-span-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-[60px] w-[60px] text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-500">Error loading stats</p>
                <p className="text-sm text-red-400">
                  {error instanceof Error ? error.message : "Something went wrong"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-[#1F2022] h-[160px]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-lg ">
                <stat.icon className="h-[60px] w-[60px] text-[#C0A05C]" />
              </div>
              <div>
                <p className="text-xl font-medium text-[#C0A05C]">{stat.title}</p>
                <p className="text-[40px] font-bold text-[#C0A05C]">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
