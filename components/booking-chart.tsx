"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useSession } from "next-auth/react"

interface BookingData {
  year: number
  month: number
  total: number
}

interface ApiResponse {
  success: boolean
  data: BookingData[]
}

interface ChartData {
  month: string
  bookings: number
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]




// Generate dynamic year options
function generateYearOptions(): number[] {
  const currentYear = new Date().getFullYear()
  const startYear = 2020 // You can adjust this start year as needed
  const endYear = currentYear + 2 // Include next 2 years for future planning

  const years: number[] = []
  for (let year = startYear; year <= endYear; year++) {
    years.push(year)
  }
  return years.reverse() // Show newest years first
}



function transformData(apiData: BookingData[]): ChartData[] {
  // Create array for all 12 months with 0 bookings as default
  const chartData: ChartData[] = monthNames.map((monthName) => ({
    month: monthName,
    bookings: 0,
  }))

  // Fill in actual data from API
  apiData.forEach((item) => {
    if (item.month >= 1 && item.month <= 12) {
      chartData[item.month - 1].bookings = item.total
    }
  })

  return chartData
}

export function BookingChart() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const session = useSession();
  const AUTH_TOKEN = session?.data?.accessToken
  async function fetchBookingStats(year: string): Promise<ApiResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking-stats?year=${year}`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch booking stats")
    }
    return response.json()
  }
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["booking-stats", selectedYear],
    queryFn: () => fetchBookingStats(selectedYear),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const chartData = apiResponse?.data ? transformData(apiResponse.data) : []

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-red-400">Error loading booking statistics: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1F2022] border-[#374151]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#C0A05C] text-[32px] font-semibold">Booking Statistics</CardTitle>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-20 bg-[#C0A05C] text-black border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1F2022] border-transparent text-[#C0A05C]">
            {generateYearOptions().map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #C0A05C",
                    borderRadius: "8px",
                    color: "#C0A05C",
                  }}
                  labelStyle={{ color: "#C0A05C" }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#C0A05C"
                  strokeWidth={3}
                  dot={{ fill: "#C0A05C", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#F59E0B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
