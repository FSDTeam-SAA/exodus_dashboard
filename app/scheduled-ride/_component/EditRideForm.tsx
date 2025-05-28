"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"



interface ScheduleItem {
    day: string
    arrivalTime: string
    departureTime: string
}

interface EditRideFormProps {
    scheduleId: string
    initialData: {
        schedules: ScheduleItem[]
        driverId: string
        busId: string
    }
    onSuccess: () => void
    onCancel: () => void
}

interface Driver {
    _id: string
    name: string
    email: string
}

interface Bus {
    _id: string
    name: string
    bus_number: string
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function EditRideForm({ scheduleId, initialData, onSuccess, onCancel }: EditRideFormProps) {
    const [schedules, setSchedules] = useState<ScheduleItem[]>(initialData.schedules)
    const [selectedDriverId, setSelectedDriverId] = useState(initialData.driverId)
    const [selectedBusId, setSelectedBusId] = useState(initialData.busId)
    const session = useSession();
  const API_TOKEN = session?.data?.accessToken

    // Fetch drivers
    const { data: driversData } = useQuery({
        queryKey: ["drivers"],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/all/drivers`, {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            })
            if (!response.ok) throw new Error("Failed to fetch drivers")
            return response.json()
        },
    })

    // Fetch buses
    const { data: busesData } = useQuery({
        queryKey: ["buses"],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bus/all-bus`, {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            })
            if (!response.ok) throw new Error("Failed to fetch buses")
            return response.json()
        },
    })

    // Update schedule mutation
    const updateScheduleMutation = useMutation({
        mutationFn: async (data: { schedules: ScheduleItem[]; driverId: string; busId: string }) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) throw new Error("Failed to update schedule")
            return response.json()
        },
        onSuccess: () => {
            toast.success("Schedule updated successfully")
            onSuccess()
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update schedule")
        },
    })

    const addScheduleSlot = () => {
        setSchedules([...schedules, { day: "", arrivalTime: "", departureTime: "" }])
    }

    const removeScheduleSlot = (index: number) => {
        setSchedules(schedules.filter((_, i) => i !== index))
    }

    const updateScheduleSlot = (index: number, field: keyof ScheduleItem, value: string) => {
        const updatedSchedules = schedules.map((schedule, i) => (i === index ? { ...schedule, [field]: value } : schedule))
        setSchedules(updatedSchedules)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!selectedDriverId || !selectedBusId) {
            toast.error("Please select both driver and bus")
            return
        }

        if (schedules.length === 0) {
            toast.error("Please add at least one schedule")
            return
        }

        const invalidSchedules = schedules.some(
            (schedule) => !schedule.day || !schedule.arrivalTime || !schedule.departureTime,
        )

        if (invalidSchedules) {
            toast.error("Please fill in all schedule fields")
            return
        }

        updateScheduleMutation.mutate({
            schedules,
            driverId: selectedDriverId,
            busId: selectedBusId,
        })
    }

    const drivers = driversData?.data?.drivers || []
    const buses = busesData?.data?.buses || []

    return (
        <form onSubmit={handleSubmit} className="space-y-6 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Driver Selection */}
                <div className="space-y-2">
                    <Label className="text-[#C0A05C] text-base font-medium" htmlFor="driver">Select Driver</Label>
                    <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                        <SelectTrigger className="bg-[#1F2022] text-[#C0A05C] border-[#C0A05C]" >
                            <SelectValue placeholder="Choose a driver" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1F2022] text-[#C0A05C] border-[#C0A05C]">
                            {drivers.map((driver: Driver) => (
                                <SelectItem key={driver._id} value={driver._id}>
                                    {driver.name} - {driver.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Bus Selection */}
                <div className="space-y-2">
                    <Label className="text-[#C0A05C] text-base font-medium" htmlFor="bus">Select Bus</Label>
                    <Select value={selectedBusId} onValueChange={setSelectedBusId}>
                        <SelectTrigger className="bg-[#1F2022] text-[#C0A05C] border-[#C0A05C]">
                            <SelectValue placeholder="Choose a bus" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1F2022] text-[#C0A05C] border-[#C0A05C]">
                            {buses.map((bus: Bus) => (
                                <SelectItem key={bus._id} value={bus._id}>
                                    {bus.name} - {bus.bus_number}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Schedules Section */}
            <Card className="border border-[#C0A05C] bg-[#1F2022] text-[#C0A05C]">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Schedule Times</CardTitle>
                    <Button type="button" onClick={addScheduleSlot} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Schedule
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {schedules.map((schedule, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <Label>Day</Label>
                                <Select value={schedule.day} onValueChange={(value) => updateScheduleSlot(index, "day", value)}>
                                    <SelectTrigger className="bg-[#1F2022] text-[#C0A05C] border-[#C0A05C]">
                                        <SelectValue placeholder="Select day" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1F2022] text-[#C0A05C] border-[#C0A05C]">
                                        {DAYS_OF_WEEK.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Arrival Time</Label>
                                <Input
                                    type="time"
                                    value={schedule.arrivalTime}
                                    onChange={(e) => updateScheduleSlot(index, "arrivalTime", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Departure Time</Label>
                                <Input
                                    type="time"
                                    value={schedule.departureTime}
                                    onChange={(e) => updateScheduleSlot(index, "departureTime", e.target.value)}
                                />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeScheduleSlot(index)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}

                    {schedules.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No schedules added yet. Click &quot;Add Schedule&quot; to get started.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
                <Button className="text-[#C0A05C] border-[#C0A05C]" type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={updateScheduleMutation.isPending}
                    className="text-[#1F2022]"
                    style={{
                        background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                    }}
                >
                    {updateScheduleMutation.isPending ? "Updating..." : "Update Schedule"}
                </Button>
            </div>
        </form>
    )
}
