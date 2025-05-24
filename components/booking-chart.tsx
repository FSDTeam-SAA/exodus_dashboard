"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { month: "Jan", bookings: 100 },
  { month: "Feb", bookings: 150 },
  { month: "Mar", bookings: 200 },
  { month: "Apr", bookings: 180 },
  { month: "May", bookings: 220 },
  { month: "Jun", bookings: 250 },
  { month: "Jul", bookings: 280 },
  { month: "Aug", bookings: 300 },
  { month: "Sep", bookings: 350 },
  { month: "Oct", bookings: 400 },
  { month: "Nov", bookings: 450 },
  { month: "Dec", bookings: 500 },
]

export function BookingChart() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-yellow-500">Booking Statistics</CardTitle>
        <Select defaultValue="2025">
          <SelectTrigger className="w-20 bg-yellow-500 text-black border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F59E0B",
                }}
                labelStyle={{ color: "#F59E0B" }}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#F59E0B" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
