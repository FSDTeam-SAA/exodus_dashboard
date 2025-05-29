"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type React from "react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Bus } from "lucide-react"
import { useState } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReusablePagination } from "@/components/shared/Pagination"
import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton"

interface Stop {
  _id?: string
  name: string
}

interface BusType {
  _id: string
  name: string
  bus_number: string
  seat: number
  standing: number
  source: string
  stops: Stop[]
  lastStop: string
  price: number
  createdAt: string
  updatedAt: string
}

interface BusResponse {
  success: boolean
  message: string
  data: {
    buses: BusType[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

interface EditFormData {
  name: string
  bus_number: string
  seat: number
  standing: number
  source: string
  lastStop: string
  price: number
}

export default function BusList() {
  const session = useSession()
  const token = session?.data?.accessToken

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false)
  const [busToDelete, setBusToDelete] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
  const [busToEdit, setBusToEdit] = useState<BusType | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    bus_number: "",
    seat: 0,
    standing: 0,
    source: "",
    lastStop: "",
    price: 0,
  })
  const [stopsInput, setStopsInput] = useState<string>("")
  const limit = 10

  // API functions
  const fetchBuses = async (page = 1): Promise<BusResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bus/all-bus?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error("Failed to fetch buses")
    }
    return response.json()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateBus = async ({ id, data }: { id: string; data: any }): Promise<void> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bus/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to update bus")
    }
  }

  const deleteBus = async (id: string): Promise<void> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bus/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error("Failed to delete bus")
    }
  }

  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["buses", currentPage],
    queryFn: () => fetchBuses(currentPage),
  })

  // Populate form data when bus is selected for editing
  useEffect(() => {
    if (busToEdit) {
      setEditFormData({
        name: busToEdit.name,
        bus_number: busToEdit.bus_number,
        seat: busToEdit.seat,
        standing: busToEdit.standing,
        source: busToEdit.source,
        lastStop: busToEdit.lastStop,
        price: busToEdit.price,
      })
      setStopsInput(busToEdit.stops.map((stop) => stop.name).join(", "))
    }
  }, [busToEdit])

  const updateMutation = useMutation({
    mutationFn: updateBus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] })
      toast.success("Bus updated successfully!")
      handleCloseEditModal()
    },
    onError: (error: Error) => {
      toast.error("Failed to update bus")
      console.error("Update error:", error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] })
      toast.success("Bus deleted successfully!")
    },
    onError: () => {
      toast.error("Failed to delete bus")
    },
  })

  const handleEdit = (bus: BusType) => {
    setBusToEdit(bus)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setBusToEdit(null)
    setEditFormData({
      name: "",
      bus_number: "",
      seat: 0,
      standing: 0,
      source: "",
      lastStop: "",
      price: 0,
    })
    setStopsInput("")
  }

  const handleDelete = (busId: string) => {
    setBusToDelete(busId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (busToDelete) {
      deleteMutation.mutate(busToDelete)
      setDeleteConfirmOpen(false)
      setBusToDelete(null)
    }
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!busToEdit) return

    const stopsArray = stopsInput
      .split(",")
      .map((stop) => ({ name: stop.trim() }))
      .filter((stop) => stop.name)

    const updateData = {
      name: editFormData.name,
      bus_number: editFormData.bus_number,
      seat: editFormData.seat,
      standing: editFormData.standing,
      source: editFormData.source,
      stops: stopsArray,
      lastStop: editFormData.lastStop,
      price: editFormData.price,
    }

    updateMutation.mutate({ id: busToEdit._id, data: updateData })
  }

  const handleInputChange = (field: keyof EditFormData, value: string | number) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="px-6">
        <div className="text-white rounded-t-lg mt-10 mb-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-10 h-10 bg-gray-700" />
              <Skeleton className="h-10 w-48 bg-gray-700" />
            </div>
            <Skeleton className="h-10 w-32 bg-gray-700" />
          </div>
        </div>
        <div>
          <Card className="bg-[#1F2022]">
            <CardContent className="p-0 bg-[#1F2022]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#C0A05C] text-base text-[#1F2022] font-medium h-[80px]">
                    <tr>
                      <th className="px-4 py-3 text-left">Bus Name</th>
                      <th className="px-4 py-3 text-left">Number plate</th>
                      <th className="px-4 py-3 text-left">Starting Ending point</th>
                      <th className="px-4 py-3 text-left">Stops</th>
                      <th className="px-4 py-3 text-left">Seat Capacity</th>
                      <th className="px-4 py-3 text-left">Standing Capacity</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <tr
                        key={index}
                        className={`${index % 2 === 0 ? "bg-[#1F2022]" : "bg-gray-750"} border-b border-[#C0A05C]`}
                      >
                        <td className="px-4 py-4">
                          <Skeleton className="h-4 w-24 bg-gray-700" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-4 w-20 bg-gray-700" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-center space-y-2">
                            <Skeleton className="h-4 w-16 bg-gray-700 mx-auto" />
                            <Skeleton className="h-3 w-6 bg-gray-700 mx-auto" />
                            <Skeleton className="h-4 w-20 bg-gray-700 mx-auto" />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {Array.from({ length: 3 }).map((_, stopIndex) => (
                              <Skeleton key={stopIndex} className="h-5 w-12 bg-gray-700 rounded-full" />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-4 w-8 bg-gray-700 mx-auto" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-4 w-8 bg-gray-700 mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 bg-gray-700" />
                            <Skeleton className="h-8 w-8 bg-gray-700" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between bg-[#1F2022] px-4 py-4">
                <div className="bg-[#1F2022] px-4 py-7">
                  <Skeleton className="h-4 w-32 bg-gray-700" />
                </div>
                <div>
                  <Skeleton className="h-8 w-48 bg-gray-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400">Error loading buses</div>
          </div>
        </div>
      </div>
    )
  }

  const buses = data?.data?.buses || []

  return (
    <div className=" px-6">
      <div className=" text-white rounded-t-lg mt-10 mb-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="w-10 h-10 text-[#1F2022]" />
            <h2 className="text-[40px] text-[#1F2022] font-medium">Bus List</h2>
          </div>
          <Link href="/add-bus">
            <Button
              className=" hover:bg-yellow-800 text-[#1F2022] rounded-[8px] py-3"
              style={{
                background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Bus
            </Button>
          </Link>
        </div>
      </div>
      <div className="">
        <Card className="bg-[#1F2022] ">
          <CardContent className="p-0 bg-[#1F2022]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#C0A05C] text-base text-[#1F2022] font-medium h-[80px] ">
                  <tr>
                    <th className="px-4 py-3 text-left">Bus Name</th>
                    <th className="px-4 py-3 text-left">Number plate</th>
                    <th className="px-4 py-3 text-left">Starting Ending point</th>
                    <th className="px-4 py-3 text-left">Stops</th>
                    <th className="px-4 py-3 text-left">Seat Capacity</th>
                    <th className="px-4 py-3 text-left">Standing Capacity</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((bus, index) => (
                    <tr
                      key={bus._id}
                      className={`${index % 2 === 0 ? "bg-[#1F2022]" : "bg-gray-750"} text-white border-b border-[#C0A05C] `}
                    >
                      <td className="px-4 py-4 text-base text-[#C0A05C] font-medium">{bus.name}</td>
                      <td className="px-4 py-4 text-base text-[#C0A05C] font-medium">{bus.bus_number}</td>
                      <td className="px-4 py-4">
                        <div className="text-center">
                          <div className="text-base text-[#C0A05C] font-medium">{bus.source}</div>
                          <div className="text-sm text-gray-400">to</div>
                          <div className="text-base text-[#C0A05C] font-medium">{bus.lastStop}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {bus.stops.map((stop, stopIndex) => (
                            <Badge
                              key={stop._id || stopIndex}
                              variant="outline"
                              className="text-xs bg-[#C0A05C] text-[#1F2022] border-yellow-500"
                            >
                              {stop.name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-base text-[#C0A05C] font-medium">{bus.seat}</td>
                      <td className="px-4 py-4 text-center text-base text-[#C0A05C] font-medium">{bus.standing}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                            onClick={() => handleEdit(bus)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                            onClick={() => handleDelete(bus._id)}
                            disabled={deleteMutation.isPending}
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
            {buses.length === 0 && (
              <div className="text-center py-8 text-gray-400">No buses found. Add your first bus!</div>
            )}
            <div className="flex items-center justify-between bg-[#1F2022] px-4 py-4 ">
              <div className="bg-[#1F2022] px-4 py-7 text-[#C0A05C] text-sm  border-gray-700">
                Showing {buses.length} of {data?.data?.pagination?.total || 0} entries
              </div>
              <div>
                <ReusablePagination
                  currentPage={currentPage}
                  totalPages={data?.data?.pagination?.totalPages || 1}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={handleCloseEditModal}>
          <DialogContent className="bg-[#1F2022] border-[#C0A05C] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#C0A05C] text-xl">Edit Bus</DialogTitle>
              <DialogDescription className="text-gray-300">Update the bus information below.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#C0A05C]">
                    Bus Name
                  </Label>
                  <Input
                    id="name"
                    value={editFormData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-[#1F2022] border-[#C0A05C] text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bus_number" className="text-[#C0A05C] text-base font-medium">
                    Bus Number
                  </Label>
                  <Input
                    id="bus_number"
                    value={editFormData.bus_number}
                    onChange={(e) => handleInputChange("bus_number", e.target.value)}
                    className="bg-[#1F2022] border-[#C0A05C] text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seat" className="text-[#C0A05C] text-base font-medium">
                    Seat Capacity
                  </Label>
                  <Input
                    id="seat"
                    type="number"
                    value={editFormData.seat}
                    onChange={(e) => handleInputChange("seat", Number.parseInt(e.target.value) || 0)}
                    className="bg-[#1F2022] border-[#C0A05C] text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="standing" className="text-[#C0A05C] text-base font-medium">
                    Standing Capacity
                  </Label>
                  <Input
                    id="standing"
                    type="number"
                    value={editFormData.standing}
                    onChange={(e) => handleInputChange("standing", Number.parseInt(e.target.value) || 0)}
                    className="bg-[#1F2022] border-[#C0A05C] text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source" className="text-[#C0A05C] text-base font-medium">
                    Source
                  </Label>
                  <Input
                    id="source"
                    value={editFormData.source}
                    onChange={(e) => handleInputChange("source", e.target.value)}
                    className="bg-[#1F2022] border-[#C0A05C] text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastStop" className="text-[#C0A05C] text-base font-medium">
                    Last Stop
                  </Label>
                  <Input
                    id="lastStop"
                    value={editFormData.lastStop}
                    onChange={(e) => handleInputChange("lastStop", e.target.value)}
                    className="bg-[#1F2022] border-[#C0A05C] text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stops" className="text-[#C0A05C] text-base font-medium">
                  Stops (comma separated)
                </Label>
                <Input
                  id="stops"
                  value={stopsInput}
                  onChange={(e) => setStopsInput(e.target.value)}
                  placeholder="Enter stops (comma separated)"
                  className="bg-[#1F2022] border-[#C0A05C] text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-[#C0A05C]">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => handleInputChange("price", Number.parseInt(e.target.value) || 0)}
                  className="bg-[#1F2022] border-[#C0A05C] text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseEditModal}
                  className="border-[#C0A05C] text-[#C0A05C] hover:bg-[#C0A05C] hover:text-[#1F2022]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-[#C0A05C] text-[#1F2022] hover:bg-[#C0A05C]/90"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Bus"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent className="bg-[#1F2022] border-[#C0A05C]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#C0A05C]">Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to delete this bus? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="bg-gray-600 text-white hover:bg-gray-700"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
