"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Bus, X, Plus, Save } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"


interface BusFormData {
    name: string
    bus_number: string
    seat: number
    standing: number
    source: string
    stops: { name: string }[]
    lastStop: string
    price: number
}



export default function AddBus() {
    const router = useRouter()
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODFlZTM4MmI2YzY0NzEwNjU0NDE3YjUiLCJlbWFpbCI6ImJkY2FsbGluZ0BnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDgyMzAyMzMsImV4cCI6MTc0ODMxNjYzM30.uq8uW4rFVTwAKYWJE9ETARQv937GG34BQGxHENhZ5Ow"
    const queryClient = useQueryClient()

    const createBus = async (busData: BusFormData): Promise<void> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bus`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${token}`,
            },
            body: JSON.stringify(busData),
        })

        if (!response.ok) {
            throw new Error("Failed to create bus")
        }
    }

    const [formData, setFormData] = useState<BusFormData>({
        name: "",
        bus_number: "",
        seat: 0,
        standing: 0,
        source: "",
        stops: [],
        lastStop: "",
        price: 0,
    })

    const [newStop, setNewStop] = useState("")

    const createMutation = useMutation({
        mutationFn: createBus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["buses"] })
            toast.success("Bus added successfully!")
            router.push("/bus-list")
        },
        onError: (error) => {
            toast.error("Failed to add bus")
            console.error("Create error:", error)
        },
    })

    const handleInputChange = (field: keyof BusFormData, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const addStop = () => {
        if (newStop.trim() && !formData.stops.some((stop) => stop.name === newStop.trim())) {
            setFormData((prev) => ({
                ...prev,
                stops: [...prev.stops, { name: newStop.trim() }],
            }))
            setNewStop("")
        }
    }

    const removeStop = (stopName: string) => {
        setFormData((prev) => ({
            ...prev,
            stops: prev.stops.filter((stop) => stop.name !== stopName),
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.bus_number || !formData.source || !formData.lastStop) {
            toast.error("Please fill in all required fields")
            return
        }

        if (formData.stops.length === 0) {
            toast.error("Please add at least one stop")
            return
        }

        createMutation.mutate(formData)
    }

    return (
        <div className="px-6">
            <div className="">
                <div className=" mt-10 mb-7">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Bus className="w-10 h-10" />
                            <h2 className="text-[40px] text-[#1F2022] font-medium"> Add Bus</h2>
                        </CardTitle>
                        <div className="flex gap-2">
                            <Link href="/bus-list">
                                <Button variant="ghost" className="text-[#1F2022]"
                                    style={{
                                        background: 'linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)',
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                onClick={handleSubmit}
                                disabled={createMutation.isPending}
                                className=" text-[#1F2022]"
                                style={{
                                    background: 'linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)',
                                }}
                            >
                                <Save className="w-4 h-4 mr-1" />
                                {createMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
                <Card className="bg-[#1F2022]">
                    <CardContent className="p-6 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="busName" className="text-[#C0A05C] text-base font-medium">
                                        Bus Name
                                    </Label>
                                    <Input
                                        id="busName"
                                        placeholder="Type Bus to here..."
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-gray-400 h-[50px] rounded-[6px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="numberPlate" className="text-[#C0A05C] text-base font-medium">
                                        Number plate
                                    </Label>
                                    <Input
                                        id="numberPlate"
                                        placeholder="Type Bus Number plate here..."
                                        value={formData.bus_number}
                                        onChange={(e) => handleInputChange("bus_number", e.target.value)}
                                        className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-gray-400 h-[50px] rounded-[6px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="seatsCapacity" className="text-[#C0A05C] text-base font-medium">
                                        Seats Capacity
                                    </Label>
                                    <Input
                                        id="seatsCapacity"
                                        type="number"
                                        placeholder="Type Bus Seats Capacity here..."
                                        value={formData.seat || ""}
                                        onChange={(e) => handleInputChange("seat", Number.parseInt(e.target.value) || 0)}
                                        className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-gray-400 h-[50px] rounded-[6px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="standingCapacity" className="text-[#C0A05C] text-base font-medium">
                                        Standing Capacity
                                    </Label>
                                    <Input
                                        id="standingCapacity"
                                        type="number"
                                        placeholder="Type Bus Standing Capacity here..."
                                        value={formData.standing || ""}
                                        onChange={(e) => handleInputChange("standing", Number.parseInt(e.target.value) || 0)}
                                        className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-gray-400 h-[50px] rounded-[6px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startingPoint" className="text-[#C0A05C] text-base font-medium">
                                        Starting Point
                                    </Label>
                                    <Input
                                        id="startingPoint"
                                        placeholder="Type Bus Starting Point here..."
                                        value={formData.source}
                                        onChange={(e) => handleInputChange("source", e.target.value)}
                                        className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-gray-400 h-[50px] rounded-[6px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endingPoint" className="text-[#C0A05C] text-base font-medium">
                                        Ending Point
                                    </Label>
                                    <Input
                                        id="endingPoint"
                                        placeholder="Type Bus Ending Point here..."
                                        value={formData.lastStop}
                                        onChange={(e) => handleInputChange("lastStop", e.target.value)}
                                        className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-gray-400 h-[50px] rounded-[6px]"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="price" className="text-[#C0A05C] text-base font-medium">
                                        Price
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="Type Bus Price here..."
                                        value={formData.price || ""}
                                        onChange={(e) => handleInputChange("price", Number.parseInt(e.target.value) || 0)}
                                        className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-gray-400 h-[50px] rounded-[6px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[#C0A05C] text-base font-medium">Selected stops</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a stop..."
                                        value={newStop}
                                        onChange={(e) => setNewStop(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addStop())}
                                        className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-gray-400 h-[50px] rounded-[6px]"
                                    />
                                    <Button type="button" onClick={addStop} className="bg-[#C0A05C] hover:bg-[#C0A05C]/90 text-white h-[50px] rounded-[6px]">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {formData.stops.map((stop, index) => (
                                        <Badge
                                            key={index}
                                            className="bg-[#C0A05C] text-white hover:bg-[#C0A05C]/80 cursor-pointer"
                                            onClick={() => removeStop(stop.name)}
                                        >
                                            {stop.name}
                                            <X className="w-3 h-3 ml-1 " />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
