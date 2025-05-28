"use client"

import type React from "react"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { Trash2, Upload, Users, Plus } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { ReusablePagination } from "@/components/shared/Pagination"


interface Driver {
  _id: string
  name: string
  email: string
  username: string
  credit: number | null
  role: string
  createdAt: string
  updatedAt: string
  fine: number
  avatar: {
    public_id: string
    url: string
  }
  phone?: string
  __v: number
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    drivers: Driver[]
    pagination: Pagination
  }
}

type DriverFormData = {
  name: string
  email: string
  phone: string
  password: string
  idNo: string
  username: string
  avatar: File | null
}

interface DeleteResponse {
  success: boolean
  message: string
}

export default function DriverManagement() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteDriverId, setDeleteDriverId] = useState<string | null>(null)
  const [formData, setFormData] = useState<DriverFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    idNo: "",
    username: "",
    avatar: null,
  })
  const [dragActive, setDragActive] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const session = useSession()
  const token = session?.data?.accessToken

  const api = {
    getAllDrivers: async (): Promise<ApiResponse> => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/all/drivers?page=${currentPage}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) throw new Error("Failed to fetch drivers")
      return response.json()
    },

    addDriver: async (formData: FormData): Promise<ApiResponse> => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add/driver`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      if (!response.ok) throw new Error("Failed to add driver")
      return response.json()
    },

    deleteDriver: async (id: string): Promise<DeleteResponse> => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drivers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) throw new Error("Failed to delete driver")
      return response.json()
    },
  }

  const queryClient = useQueryClient()

  // Fetch drivers
  const {
    data: driversResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["drivers", currentPage],
    queryFn: api.getAllDrivers,
  })

  // Add driver mutation
  const addDriverMutation = useMutation({
    mutationFn: api.addDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      setShowAddForm(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        idNo: "",
        username: "",
        avatar: null,
      })
      toast.success("Driver added successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Delete driver mutation
  const deleteDriverMutation = useMutation({
    mutationFn: api.deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      setDeleteDriverId(null)
      toast.success("Driver deleted successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete driver")
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, avatar: files[0] }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitFormData = new FormData()
    submitFormData.append("name", formData.name)
    submitFormData.append("email", formData.email)
    submitFormData.append("phone", formData.phone)
    submitFormData.append("password", formData.password)
    submitFormData.append("idNo", formData.idNo)
    submitFormData.append("username", formData.username)
    if (formData.avatar) {
      submitFormData.append("avatar", formData.avatar)
    }

    addDriverMutation.mutate(submitFormData)
  }

  const handleDelete = (id: string) => {
    setDeleteDriverId(id)
  }

  const confirmDelete = () => {
    if (deleteDriverId) {
      deleteDriverMutation.mutate(deleteDriverId)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading drivers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-500">Error loading drivers</div>
      </div>
    )
  }

  // Fixed: Access drivers from the correct nested path
  const drivers = driversResponse?.data.drivers || []
  const pagination = driversResponse?.data.pagination

  return (
    <div className="px-6">
      <div className="">
        {!showAddForm ? (
          // Driver List View
          <div>
            <div className="flex items-center justify-between ">
              <div className="flex items-center gap-2 mt-10 mb-7">
                <Users className="w-6 h-6" />
                <h2 className="text-[40px] text-[#1F2022] font-medium">Driver List</h2>
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className="text-[#1F2022] text-base h-[50px] rounded-[8px]"
                style={{
                  background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            </div>
            <Card className="bg-[#1F2022]">
              <CardContent className="p-0">
                <div className="overflow-x-auto !rounded-[12px] border-transparent">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#C0A05C] bg-[#C0A05C]">
                        <th className="text-left p-4 text-base text-[#1F2022] font-medium">ID</th>
                        <th className="text-left p-4 text-base text-[#1F2022] font-medium">Name</th>
                        <th className="text-left p-4 text-base text-[#1F2022] font-medium">Email</th>
                        <th className="text-left p-4 text-base text-[#1F2022] font-medium">Phone</th>
                        <th className="text-left p-4 text-base text-[#1F2022] font-medium">Credit</th>
                        <th className="text-left p-4 text-base text-[#1F2022] font-medium">Added</th>
                        <th className="text-left p-4 text-base text-[#1F2022] font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((driver) => (
                        <tr key={driver._id} className="border-b border-[#C0A05C] hover:bg-gray-750">
                          <td className="p-4 text-[#C0A05C] text-base font-medium">#{driver._id.slice(-6)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 bg-[#C0A05C]">
                                <AvatarImage src={driver.avatar?.url || "/placeholder.svg"} alt={driver.name} />
                                <AvatarFallback className="text-[#202022] text-base font-medium">
                                  {driver.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[#C0A05C] text-base font-medium">{driver.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-base text-[#C0A05C] font-medium">{driver.email}</td>
                          <td className="p-4 text-base text-[#C0A05C] font-medium">{driver.phone || "N/A"}</td>
                          <td className="p-4">
                            <Badge variant="secondary" className="bg-green-600 text-white">
                              ${driver.credit ?? 0}
                            </Badge>
                          </td>
                          <td className="p-4 text-base text-[#C0A05C] font-medium">
                            {new Date(driver.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-base text-[#C0A05C] font-medium">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-red-400 hover:text-red-300"
                                onClick={() => handleDelete(driver._id)}
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
              </CardContent>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3">
                <div className="text-sm text-gray-400">
                  Showing {drivers.length} of {pagination?.total || 0} drivers
                </div>
                <ReusablePagination
                  currentPage={pagination?.page ?? 1}
                  totalPages={pagination?.totalPages ?? 1}
                  onPageChange={handlePageChange}
                />

              </div>
            </Card>

          </div>
        ) : (
          // Add Driver Form View
          <div className="px-6">
            <div className="flex items-center justify-between mt-10 mb-7">
              <h2 className="text-[40px] text-[#1F2022] font-medium">Add Driver</h2>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="text-[#1F2022] text-base border-transparent h-[50px] rounded-[8px]"
                style={{
                  background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                }}
              >
                Back to List
              </Button>
            </div>
            <Card className="bg-[#1F2022] border-[#C0A05C]">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Name Field */}
                      <div>
                        <Label htmlFor="name" className="text-[#C0A05C] text-base font-medium mb-2 block">
                          Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Type Driver Name here..."
                          className="bg-transparent border-[#C0A05C] text-[#C0A05C] placeholder:text-[#C0A05C]/60 rounded-[6px] h-[50px] text-base"
                          required
                        />
                      </div>

                      {/* ID No and Email Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="idNo" className="text-[#C0A05C] text-base font-medium mb-2 block">
                            ID No.
                          </Label>
                          <Input
                            id="idNo"
                            name="idNo"
                            value={formData.idNo}
                            onChange={handleInputChange}
                            placeholder="Type Driver ID here..."
                            className="bg-transparent border-[#C0A05C] text-[#C0A05C] placeholder:text-[#C0A05C]/60 rounded-[6px] h-[50px] text-base"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-[#C0A05C] text-base font-medium mb-2 block">
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Type Driver Email here..."
                            className="bg-transparent border-[#C0A05C] text-[#C0A05C] placeholder:text-[#C0A05C]/60 rounded-[6px] h-[50px] text-base"
                            required
                          />
                        </div>
                      </div>

                      {/* Phone and Password Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="phone" className="text-[#C0A05C] text-base font-medium mb-2 block">
                            Phone
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Type Driver Phone here..."
                            className="bg-transparent border-[#C0A05C] text-[#C0A05C] placeholder:text-[#C0A05C]/60 rounded-[6px] h-[50px] text-base"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="password" className="text-[#C0A05C] text-base font-medium mb-2 block">
                            Password
                          </Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Type Driver Password here..."
                            className="bg-transparent border-[#C0A05C] text-[#C0A05C] placeholder:text-[#C0A05C]/60 rounded-[6px] h-[50px] text-base"
                            required
                          />
                        </div>
                      </div>

                      {/* Username Field */}
                      <div>
                        <Label htmlFor="username" className="text-[#C0A05C] text-base font-medium mb-2 block">
                          Username
                        </Label>
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="Type Driver Username here..."
                          className="bg-transparent border-[#C0A05C] text-[#C0A05C] placeholder:text-[#C0A05C]/60 rounded-[6px] h-[50px] text-base"
                          required
                        />
                      </div>
                    </div>

                    {/* Right Column - Photo Upload */}
                    <div className="lg:col-span-1">
                      <Label className="text-[#C0A05C] text-base font-medium mb-2 block">Photo</Label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors h-[280px] flex flex-col items-center justify-center ${dragActive ? "border-[#C0A05C] bg-[#C0A05C]/10" : "border-[#C0A05C]/50 hover:border-[#C0A05C]"
                          }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="w-16 h-16 rounded-full bg-[#C0A05C] flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-[#1F2022]" />
                        </div>
                        <p className="text-[#C0A05C] mb-4 text-sm">Drag and drop image here, or click add image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <Button
                          type="button"
                          onClick={() => document.getElementById("avatar-upload")?.click()}
                          className="bg-[#C0A05C] hover:bg-[#C0A05C]/90 text-[#1F2022] font-medium px-6 py-2 rounded-md"
                        >
                          Add Image
                        </Button>
                        {formData.avatar && (
                          <p className="mt-3 text-sm text-[#C0A05C]">Selected: {formData.avatar.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end mt-8">
                    <Button
                      type="submit"
                      disabled={addDriverMutation.isPending}
                      className="bg-[#C0A05C] hover:bg-[#C0A05C]/90 text-[#1F2022] font-medium px-8 py-3 rounded-md text-base"
                    >
                      {addDriverMutation.isPending ? "Adding Driver..." : "Add Driver"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AlertDialog open={!!deleteDriverId} onOpenChange={() => setDeleteDriverId(null)}>
          <AlertDialogContent className="bg-gray-800 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to delete this driver? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => setDeleteDriverId(null)}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteDriverMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteDriverMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
