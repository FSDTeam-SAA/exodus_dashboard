"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Save } from "lucide-react"
import { toast } from "sonner"

const API_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODFlZTM4MmI2YzY0NzEwNjU0NDE3YjUiLCJlbWFpbCI6ImJkY2FsbGluZ0BnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDgyMzAyMzMsImV4cCI6MTc0ODMxNjYzM30.uq8uW4rFVTwAKYWJE9ETARQv937GG34BQGxHENhZ5Ow"

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

interface Driver {
    _id: string
    name: string
    email: string
}

interface Bus {
    _id: string
    name: string
    bus_number: string
    source: string
    lastStop: string
}

interface ScheduleDay {
    day: string
    arrivalTime: string
    departureTime: string
}

interface AddRideFormProps {
    onSuccess: () => void
    onCancel: () => void
}

export function AddRideForm({ onSuccess, onCancel }: AddRideFormProps) {
    const [selectedDriverId, setSelectedDriverId] = useState<string>("")
    const [selectedBusId, setSelectedBusId] = useState<string>("")
    const [schedules, setSchedules] = useState<Record<string, ScheduleDay>>({})

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

    // Add schedule mutation
    const addScheduleMutation = useMutation({
        mutationFn: async (data: {
            schedules: ScheduleDay[]
            driverId: string
            busId: string
        }) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add/schedule`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                throw new Error("Failed to add schedule")
            }
            return response.json()
        },
        onSuccess: () => {
            toast.success("Schedule added successfully")
            onSuccess()
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add schedule")
        },
    })

    const handleTimeChange = (day: string, field: "arrivalTime" | "departureTime", value: string) => {
        setSchedules((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                day: day.slice(0, 3), // Convert to short form (Mon, Tue, etc.)
                [field]: value,
            },
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedDriverId || !selectedBusId) {
            toast.error("Please select both driver and bus")
            return
        }

        const validSchedules = Object.values(schedules).filter((schedule) => schedule.arrivalTime && schedule.departureTime)

        if (validSchedules.length === 0) {
            toast.error("Please add at least one schedule")
            return
        }

        addScheduleMutation.mutate({
            schedules: validSchedules,
            driverId: selectedDriverId,
            busId: selectedBusId,
        })
    }

    const drivers = driversData?.data?.drivers || []
    const buses = busesData?.data?.buses || []

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#1F2022] p-6 rounded-lg shadow-lg ">
            {/* Driver Selection */}
            <div className="space-y-2 ">
                <Label htmlFor="driver" className="text-[#C0A05C] text-base font-medium">
                    Select Driver
                </Label>
                <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                    <SelectTrigger className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder:text-[#C0A05C] h-[50px] rounded-[8px]">
                        <SelectValue placeholder="Select Driver from the dropdown....." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] rounded-[8px]">
                        {drivers.map((driver: Driver) => (
                            <SelectItem key={driver._id} value={driver._id}>
                                <p className="text-[#C0A05C]">
                                    {driver.name} - {driver.email}
                                </p>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Bus Selection */}
            <div className="space-y-2">
                <Label htmlFor="bus" className="text-[#C0A05C] text-base font-medium">
                    Select Bus
                </Label>
                <Select value={selectedBusId} onValueChange={setSelectedBusId}>
                    <SelectTrigger className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder:text-[#C0A05C] h-[50px] rounded-[8px]">
                        <SelectValue placeholder="Select Bus from the dropdown....." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] rounded-[8px]">
                        {buses.map((bus: Bus) => (
                            <SelectItem key={bus._id} value={bus._id}>
                                {bus.name} - {bus.bus_number} ({bus.source} to {bus.lastStop})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Schedule Bus */}
            <div className="space-y-4">
                <Label className="text-[#C0A05C] text-base font-medium">Schedule Bus</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {DAYS.map((day) => (
                        <Card key={day} className="bg-[#C0A05C] border-[#C0A05C]">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-[#000000] text-xl  mb-3">{day}</h3>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-4 h-4 text-[#1F2022]" />
                                            <Label className="text-base text-[#1F2022]">Starting Time</Label>
                                        </div>
                                        <Input
                                            type="time"
                                            value={schedules[day]?.arrivalTime || ""}
                                            onChange={(e) => handleTimeChange(day, "arrivalTime", e.target.value)}
                                            className="bg-[#1F2022] border-[#C0A05C] text-white rounded-[8px]"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-4 h-4 text-[#1F2022]" />
                                            <Label className="text-base text-[#1F2022]">Ending Time</Label>
                                        </div>
                                        <Input
                                            type="time"
                                            value={schedules[day]?.departureTime || ""}
                                            onChange={(e) => handleTimeChange(day, "departureTime", e.target.value)}
                                            className="bg-[#1F2022] border-[#C0A05C] text-white rounded-[8px]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="text-[#1F2022] h-[50px] rounded-[8px]"
                    style={{
                        background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                    }}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="text-[#1F2022] h-[50px] rounded-[8px]"
                    style={{
                        background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                    }}
                    disabled={addScheduleMutation.isPending}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {addScheduleMutation.isPending ? "Saving..." : "Save"}
                </Button>
            </div>
        </form>
    )
}
