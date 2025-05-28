"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Filter, Bus } from "lucide-react"
import { ReusablePagination } from "@/components/shared/Pagination"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface ReservedBy {
    _id: string
    name: string
    email: string
}

interface Reservation {
    _id: string
    bus_number: string
    time: string
    day: string
    price: number
    totalHour: number
    reservedBy: ReservedBy
    status: "confirmed" | "cancelled" | "pending"
    createdAt: string
    updatedAt: string
}

interface ApiResponse {
    success: boolean
    message: string
    data: {
        reservations: Reservation[]
        meta: {
            currentPage: number
            totalPages: number
            totalItems: number
            itemsPerPage: number
        }
    }
}


export default function ReserveBus() {
    const [currentPage, setCurrentPage] = useState(1)
    const session = useSession();
    const AUTH_TOKEN = session?.data?.accessToken
    const queryClient = useQueryClient()

    const fetchReservations = async (page: number): Promise<ApiResponse> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reserve-bus?page=${page}&limit=10`, {
            headers: {
                Authorization: `Bearer ${AUTH_TOKEN}`,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            throw new Error("Failed to fetch reservations")
        }

        return response.json()
    }

    const updateReservationStatus = async (reservationId: string): Promise<string> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reserve-bus/${reservationId}/status`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${AUTH_TOKEN}`,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            throw new Error("Failed to update reservation status")
        }

        return response.json()
    }

    const cancelReservation = async (reservationId: string): Promise<string> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reserve-bus/${reservationId}/cancel`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${AUTH_TOKEN}`,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            throw new Error("Failed to cancel reservation")
        }

        return response.json()
    }

    const formatTime = (timeString: string) => {
        return timeString
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const getEndTime = (startTime: string, totalHours: number) => {
        // Simple calculation - you might want to implement proper time parsing
        const startHour = Number.parseInt(startTime.split(":")[0])
        const endHour = startHour + totalHours
        const period = endHour >= 12 ? "PM" : "AM"
        const displayHour = endHour > 12 ? endHour - 12 : endHour
        return `${displayHour.toString().padStart(2, "0")}:00${period}`
    }

    const statusMutation = useMutation({
        mutationFn: updateReservationStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reservations"] })
            toast.success("Reservation has been accepted successfully.")
        },
        onError: (error) => {
            console.error("Error updating status:", error)
            toast.error("Failed to activate reservation. Please try again.")
        },
    })

    const cancelMutation = useMutation({
        mutationFn: cancelReservation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reservations"] })
            toast.success("Reservation has been cancelled successfully.")
        },
        onError: () => {
           
            toast.error("Failed to cancel reservation. Please try again.")
        },
    })

    const handleActiveClick = (reservationId: string) => {
        statusMutation.mutate(reservationId)
    }

    const handleCancelClick = (reservationId: string) => {
        cancelMutation.mutate(reservationId)
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ["reservations", currentPage],
        queryFn: () => fetchReservations(currentPage),
    })

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    if (isLoading) {
        return (
            <div className="p-6 bg-gray-900 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-amber-400">Loading reservations...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 bg-gray-900 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-red-400">Error loading reservations</div>
                </div>
            </div>
        )
    }

    const reservations = data?.data.reservations || []
    const meta = data?.data.meta

    return (
        <div className="px-6">
            <div className=" mt-10 mb-7">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xl">
                        <Bus className="h-10 w-10 text-[#1F2022]" />
                        <h2 className="text-[40px] text-[#1F2022] font-medium"> Reserve Bus</h2>
                    </div>
                    <Button variant="outline" size="sm" className=" border-none text-[#1F2022] tex-base font-medium rounded-[5px] px-4 h-[44px] hover:opacity-90"
                        style={{
                            background: 'linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)',
                        }}
                    >
                        <Filter className="h-4 w-4 mr-2 " />
                        Filter
                    </Button>
                </div>
            </div>
            <Card className="bg-[#1F2022]">
                <CardContent className="p-0">
                    {/* Table Header */}
                    <div className="grid grid-cols-5 gap-4 p-4 bg-[#C0A05C] text-[#1F2022] text-base font-semibold">
                        <div>Name</div>
                        <div>Starting Time</div>
                        <div>Ending Time</div>
                        <div>Date</div>
                        <div>Action</div>
                    </div>

                    {/* Table Body */}
                    <div className="bg-[#1F2022] ">
                        {reservations.map((reservation, index) => (
                            <div
                                key={reservation._id}
                                className={`grid grid-cols-5 gap-4 p-4 items-center border-b border-[#C0A05C] ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                                    }`}
                            >
                                {/* Name */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src="/placeholder-user.jpg" alt={reservation.reservedBy.name} />
                                        <AvatarFallback className="bg-[#C0A05C] text-[#1F2022]">
                                            {reservation.reservedBy.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-[#C0A05C] text-base font-medium">{reservation.reservedBy.name}</div>
                                        <div className="text-[#C0A05C] text-sm font-medium">{reservation.reservedBy.email}</div>
                                    </div>
                                </div>

                                {/* Starting Time */}
                                <div className="text-[#C0A05C] text-base font-medium">{formatTime(reservation.time)}</div>

                                {/* Ending Time */}
                                <div className="text-[#C0A05C] text-base font-medium">
                                    {getEndTime(reservation.time, reservation.totalHour)}
                                </div>

                                {/* Date */}
                                <div className="text-[#C0A05C] text-base font-medium">{formatDate(reservation.day)}</div>

                                {/* Action */}
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-[5px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handleActiveClick(reservation._id)}
                                        disabled={
                                            statusMutation.isPending ||
                                            reservation.status === "confirmed" ||
                                            (cancelMutation.isPending && cancelMutation.variables === reservation._id)
                                        }
                                    >
                                        {statusMutation.isPending && statusMutation.variables === reservation._id ? "Loading..." : "Accept"}
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-[5px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handleCancelClick(reservation._id)}
                                        disabled={
                                            cancelMutation.isPending ||
                                            reservation.status === "cancelled" ||
                                            (statusMutation.isPending && statusMutation.variables === reservation._id)
                                        }
                                    >
                                        {cancelMutation.isPending && cancelMutation.variables === reservation._id ? "Loading..." : "Cancel"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Footer */}
                    {meta && (
                        <div className="flex items-center justify-between p-4 bg-gray-800 border-t border-gray-700">
                            <div className="text-[#C0A05C] text-sm">
                                Showing {(meta.currentPage - 1) * meta.itemsPerPage + 1} to{" "}
                                {Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)} of {meta.totalItems} entries
                            </div>
                            <ReusablePagination
                                currentPage={meta.currentPage}
                                totalPages={meta.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
