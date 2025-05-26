"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { toast } from "sonner"
import { AddRideForm } from "./AddRideForm"
import { EditRideForm } from "./EditRideForm"

const API_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODFlZTM4MmI2YzY0NzEwNjU0NDE3YjUiLCJlbWFpbCI6ImJkY2FsbGluZ0BnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDgyMzAyMzMsImV4cCI6MTc0ODMxNjYzM30.uq8uW4rFVTwAKYWJE9ETARQv937GG34BQGxHENhZ5Ow"

interface Schedule {
    _id: string
    schedules: Array<{
        day: string
        arrivalTime: string
        departureTime: string
        _id: string
    }>
    driverId: {
        _id: string
        name: string
        email: string
        avatar: {
            url: string
        }
    }
    busId: {
        _id: string
        name: string
        bus_number: string
        source: string
        lastStop: string
        price: number
    }
    isActive: boolean
    createdAt: string
}

interface ApiResponse {
    success: boolean
    message: string
    data: Schedule[]
}

export default function ScheduledRidePage() {
    const [currentView, setCurrentView] = useState<"list" | "add">("list")
    const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null)
    const [editSchedule, setEditSchedule] = useState<Schedule | null>(null)
    const queryClient = useQueryClient()

    // Fetch schedules
    const {
        data: schedulesData,
        isLoading,
        error,
    } = useQuery<ApiResponse>({
        queryKey: ["schedules"],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/all/schedules`, {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            })
            if (!response.ok) {
                throw new Error("Failed to fetch schedules")
            }
            return response.json()
        },
    })

    // Delete schedule mutation
    const deleteScheduleMutation = useMutation({
        mutationFn: async (scheduleId: string) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            })
            if (!response.ok) {
                throw new Error("Failed to delete schedule")
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedules"] })
            toast.success("Schedule deleted successfully")
            setDeleteScheduleId(null)
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete schedule")
        },
    })

    const handleDeleteSchedule = (scheduleId: string) => {
        setDeleteScheduleId(scheduleId)
    }

    const handleEditSchedule = (schedule: Schedule) => {
        setEditSchedule(schedule)
    }

    const confirmDelete = () => {
        if (deleteScheduleId) {
            deleteScheduleMutation.mutate(deleteScheduleId)
        }
    }

    const handleAddRideSuccess = () => {
        setCurrentView("list")
        queryClient.invalidateQueries({ queryKey: ["schedules"] })
    }

    const handleEditSuccess = () => {
        setEditSchedule(null)
        queryClient.invalidateQueries({ queryKey: ["schedules"] })
    }

    const formatScheduleDays = (schedules: Schedule["schedules"]) => {
        return schedules.map((s) => s.day).join(", ")
    }

    const getFirstScheduleTime = (schedules: Schedule["schedules"]) => {
        if (schedules.length > 0) {
            return `${schedules[0].arrivalTime} - ${schedules[0].departureTime}`
        }
        return "N/A"
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading schedules...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-red-500">Error loading schedules</div>
            </div>
        )
    }

    const schedules = schedulesData?.data || []

    return (
        <div className="px-6">
            <div className="mt-10 mb-7">
                {currentView === "list" ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-[40px] text-[#1F2022] font-medium">🚌 Scheduled Ride</h1>
                            <Button
                                onClick={() => setCurrentView("add")}
                                className="text-[#1F2022] h-[50px] rounded-[8px]"
                                style={{
                                    background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Ride
                            </Button>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="w-full !rounded-lg">
                                <thead className="bg-[#C0A05C] !rounded-lg">
                                    <tr>
                                        <th className="text-base text-[#1F2022] font-medium text-left px-4 py-3">Bus Name</th>
                                        <th className="text-base text-[#1F2022] font-medium text-left px-4 py-3">Number Plate</th>
                                        <th className="text-base text-[#1F2022] font-medium text-left px-4 py-3">Assigned Driver</th>
                                        <th className="text-base text-[#1F2022] font-medium text-left px-4 py-3">From</th>
                                        <th className="text-base text-[#1F2022] font-medium text-left px-4 py-3">To</th>
                                        <th className="text-base text-[#1F2022] font-medium text-left px-4 py-3">Schedule</th>
                                        <th className="text-base text-[#1F2022] font-medium text-left px-4 py-3">Status</th>
                                        <th className="text-base text-[#1F2022] font-medium text-left px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map((schedule) => (
                                        <tr key={schedule._id} className="bg-[#1F2022] text-white border-b border-[#C0A05C]">
                                            <td className="font-medium text-[#C0A05C] text-base px-4 py-3">{schedule.busId.name}</td>
                                            <td className="px-4 py-3 text-base text-[#C0A05C]">{schedule.busId.bus_number}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-8 h-8 rounded-full bg-[#C0A05C] text-[#1F2022]">
                                                        <AvatarImage src={schedule.driverId.avatar.url || "/placeholder.svg"} />
                                                        <AvatarFallback>{schedule.driverId.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-base text-[#C0A05C]">{schedule.driverId.name}</div>
                                                        <div className="text-sm text-[#C0A05C]">{schedule.driverId.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium text-base text-[#C0A05C]">{schedule.busId.source}</div>
                                                    <div className="text-sm text-[#C0A05C]">{getFirstScheduleTime(schedule.schedules)}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium text-base text-[#C0A05C]">{schedule.busId.lastStop}</div>
                                                    <div className="text-sm text-[#C0A05C]">{getFirstScheduleTime(schedule.schedules)}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-base text-[#C0A05C]">{formatScheduleDays(schedule.schedules)}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={schedule.isActive ? "default" : "destructive"}
                                                    className={`rounded-[8px] ${schedule.isActive ? "bg-[#09B850] hover:bg-[#09B850]/80" : "bg-red-600 hover:bg-red-700"
                                                        }`}
                                                >
                                                    <p className="text-base text-[#1F2022] font-medium px-3 py-2">
                                                        {schedule.isActive ? "Active" : "Inactive"}
                                                    </p>
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="  text-blue-400"
                                                        onClick={() => handleEditSchedule(schedule)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-400 hover:text-red-300"
                                                        onClick={() => handleDeleteSchedule(schedule._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Add Ride Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <h1 className="text-[40px] text-[#1F2022] font-medium">🚌 Add Ride</h1>
                            </div>
                        </div>

                        {/* Add Ride Form */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <AddRideForm onSuccess={handleAddRideSuccess} onCancel={() => setCurrentView("list")} />
                        </div>
                    </>
                )}

                {/* Edit Schedule Dialog */}
                <Dialog open={!!editSchedule} onOpenChange={() => setEditSchedule(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1F2022] text-white border border-[#C0A05C]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-[#C0A05C] font-semibold">Edit Schedule</DialogTitle>
                        </DialogHeader>
                        {editSchedule && (
                            <EditRideForm
                                scheduleId={editSchedule._id}
                                initialData={{
                                    schedules: editSchedule.schedules.map((s) => ({
                                        day: s.day,
                                        arrivalTime: s.arrivalTime,
                                        departureTime: s.departureTime,
                                    })),
                                    driverId: editSchedule.driverId._id,
                                    busId: editSchedule.busId._id,
                                }}
                                onSuccess={handleEditSuccess}
                                onCancel={() => setEditSchedule(null)}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!deleteScheduleId} onOpenChange={() => setDeleteScheduleId(null)}>
                    <AlertDialogContent className="bg-[#1F2022] text-white border border-[#C0A05C]">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the schedule.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteScheduleMutation.isPending}
                            >
                                {deleteScheduleMutation.isPending ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
