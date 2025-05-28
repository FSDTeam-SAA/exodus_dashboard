"use client"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Bell, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Notification {
    _id: string
    userId: string
    message: string
    type: string
    read: boolean
    createdAt: string
    updatedAt: string
    __v: number
}

interface ApiResponse {
    success: boolean
    message: string
    data: Notification[]
}

const fetchNotifications = async (): Promise<ApiResponse> => {
    // Get token from localStorage or wherever you store it
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODFlZTM4MmI2YzY0NzEwNjU0NDE3YjUiLCJlbWFpbCI6ImJkY2FsbGluZ0BnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDgzNDQ0MjYsImV4cCI6MTc0ODQzMDgyNn0.254oEmBhtTBMhhgGJ1srLUeOcEzsKZTyLw2sAzWWUPo" // or however you store your token

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/get-notfication`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // or just token if your API expects it differently
        },
    })

    if (!response.ok) {
        throw new Error("Failed to fetch notifications")
    }
    return response.json()
}

const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const notificationDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
}

export default function NotificationList() {
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 7

    const { data, isLoading, error } = useQuery({
        queryKey: ["notifications"],
        queryFn: fetchNotifications,
    })

    if (isLoading) {
        return (
            <Card className=" ">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Bell className="h-5 w-5 text-[#C0A05C]" />
                        <h1 className="text-xl font-semibold text-white">Notification</h1>
                    </div>
                    <div className="space-y-4">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="flex items-start gap-3 p-4 bg-[#1F2022] rounded-lg border border-[#C0A05C]">
                                    <div className="w-10 h-10 bg-[#1F2022]rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-[#1F2022]rounded w-3/4"></div>
                                        <div className="h-4 bg-[#1F2022]rounded w-1/2"></div>
                                    </div>
                                    <div className="h-4 bg-[#1F2022]rounded w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full max-w-4xl mx-auto bg-gray-900 border-gray-800">
                <div className="p-6 text-center">
                    <p className="text-red-400">Error loading notifications</p>
                </div>
            </Card>
        )
    }

    const notifications = data?.data || []
    const totalPages = Math.ceil(notifications.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentNotifications = notifications.slice(startIndex, endIndex)

    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, "...", totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, "...", currentPage, "...", totalPages)
            }
        }

        return pages
    }

    return (
        <Card className="px-6   ">
            {/* Header */}
            <div className="flex items-center gap-2 mt-10 mb-7">
                <Bell className="h-10 w-10 text-[#1F2022]" />
                <h1 className="text-[40px] text-[#1F2022] font-medium">Notification</h1>
            </div>
            <div className="bg-[#1F2022] p-3">

                {/* Notifications List */}
                <div className="space-y-4 mb-6">
                    {currentNotifications.map((notification) => (
                        <div
                            key={notification._id}
                            className="flex items-start gap-3 p-4 bg-[#1F2022] rounded-lg border-b border-[#C0A05C] hover:bg-gray-750 transition-colors"
                        >
                            <Avatar className="w-10 h-10">
                                <AvatarImage src="/placeholder.svg?height=40&width=40&query=user avatar" />
                                <AvatarFallback className="bg-gray-600 text-white">
                                    {notification.userId.slice(-2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <p className=" text-[#C0A05C] leading-relaxed">{notification.message}</p>
                                {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                            </div>

                            <div className=" text-[#C0A05C] whitespace-nowrap">{formatTimeAgo(notification.createdAt)}</div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <p className=" text-[#C0A05C]">
                        Showing {startIndex + 1} to {Math.min(endIndex, notifications.length)} of {notifications.length} entries
                    </p>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="text-[#C0A05C] hover:text-yellow-300 hover:bg-[#1F2022]"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {getPageNumbers().map((page, index) => (
                            <Button
                                key={index}
                                variant={page === currentPage ? "default" : "ghost"}
                                size="sm"
                                onClick={() => typeof page === "number" && setCurrentPage(page)}
                                disabled={page === "..."}
                                className={
                                    page === currentPage
                                        ? "bg-[#C0A05C] text-gray-900 hover:bg-yellow-300"
                                        : "text-[#C0A05C] hover:text-yellow-300 hover:bg-[#1F2022]"
                                }
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="text-[#C0A05C] hover:text-yellow-300 hover:bg-[#1F2022]"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}
