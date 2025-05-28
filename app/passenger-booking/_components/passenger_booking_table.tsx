"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"
import { ReusablePagination } from "@/components/shared/Pagination"
import { useSession } from "next-auth/react"


// Define types for TypeScript
interface Ticket {
  _id: string
  userId: string
  busNumber: string
  source: string
  destination: string
  time: string
  seatNumber: string
  date: string
  price: number
  status: string
}

interface Pagination {
  total: number
  totalPages: number
}

interface ApiResponse {
  data: {
    ticket: Ticket[]
    pagination: Pagination
  }
}

export function TicketTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 1
  const session = useSession();
  const token = session?.data?.accessToken


  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["tickets", currentPage],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ticket/admin-all-ticket?page=${currentPage}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      if (!response.ok) {
        throw new Error("Failed to fetch tickets")
      }
      return response.json()
    },
  })

  const handlePageChange = (page: number) => {

    setCurrentPage(page)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">Error loading tickets: {error.message}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="">
      <div className="pb-3 mt-10 mb-7">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center">
            <span className="text-white text-sm">
              <Calendar className="h-9 w-9 text-[#1F2022]" />
            </span>
          </div>
          <h2 className="text-[40px] text-[#1F2022] font-medium">Passenger Booking</h2>
        </div>
      </div>
      <Card className="">
        <CardContent className="p-0 rounded-[12px]">
          <div className="bg-[#C0A05C] border-b border-[#C0A05C] text-[#1F2022] text-[18px] font-medium">
            <div className="grid grid-cols-8 gap-4 p-4 text-sm font-medium">
              <div>ID</div>
              <div>Passenger</div>
              <div>Bus</div>
              <div>From</div>
              <div>To</div>
              <div>Date</div>
              <div>Amount</div>
              <div>Status</div>
            </div>
          </div>

          <div className="bg-[#1F2022] text-white min-h-[400px]">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-8 gap-4 p-4">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 bg-gray-700" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <>
                {data?.data?.ticket?.length ? (
                  data.data.ticket.map((ticket: Ticket) => (
                    <div
                      key={ticket._id}
                      className="grid grid-cols-8 gap-4 p-4 border-b border-[#C0A05C] hover:bg-gray-800 transition-colors items-center"
                    >
                      <div className="text-[#C0A05C] text-base font-normal">#{ticket._id.slice(-6)}</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="/placeholder-user.jpg" />
                          <AvatarFallback className="text-xs bg-amber-600">
                            {ticket.userId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-base text-[#C0A05C] font-medium">User {ticket.userId.slice(-4)}</span>
                      </div>
                      <div className="text-base text-[#C0A05C] font-medium">Bus {ticket.busNumber.slice(-4)}</div>
                      <div className="text-base text-[#C0A05C] font-medium">
                        <div>{ticket.source}</div>
                        <div className="text-sm text-[#C0A05C]">{ticket.time}</div>
                      </div>
                      <div className="text-base text-[#C0A05C] font-medium">
                        <div>{ticket.destination}</div>
                        <div className="text-sm text-[#C0A05C]">Seat {ticket.seatNumber}</div>
                      </div>
                      <div className="text-base text-[#C0A05C] font-medium">{formatDate(ticket.date)}</div>
                      <div className="text-sm text-[#C0A05C] font-medium">${ticket.price}</div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">No tickets found</div>
                )}
              </>
            )}
          </div>

          {data?.data?.pagination && (
            <div className="bg-[#1F2022] border-t border-[#C0A05C] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400 order-2 sm:order-1">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, data.data.pagination.total)}{" "}
                of {data.data.pagination.total} entries
              </div>
              <div className="order-1 sm:order-2">
                <ReusablePagination
                  currentPage={currentPage}
                  totalPages={data.data.pagination.totalPages || 1}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
