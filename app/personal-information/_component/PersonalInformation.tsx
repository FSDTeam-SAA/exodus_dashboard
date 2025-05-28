"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Save, Info } from "lucide-react"
import { useSession } from "next-auth/react"

interface UserData {
  _id: string
  id: string
  name: string
  email: string
  username: string
  credit: number
  role: string
  fine: number
  avatar: {
    public_id: string
    url: string
  }
  createdAt: string
  updatedAt: string
  __v?: number
}

interface ApiResponse {
  success: boolean
  message: string
  data: UserData
}

interface FormData {
  name: string
  email: string
  username: string
  credit: number
  role: string
  fine: number
}

export default function PersonalInformation() {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    username: "",
    credit: 0,
    role: "",
    fine: 0,
  })

  const queryClient = useQueryClient()
  // Fix: Properly destructure status from useSession
  const { data: session, status } = useSession()

  const fetchUser = async (): Promise<ApiResponse> => {
    const token = session?.accessToken
    const userId = session?.user?.id
  

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/single-user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`)
    }

    return response.json()
  }

  const updateUser = async (userData: Partial<UserData>): Promise<ApiResponse> => {
    const token = session?.accessToken

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drivers`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`Failed to update user data: ${response.status}`)
    }

    return response.json()
  }

  const {
    data: userResponse,
    isLoading,
    error,
    isError,
  } = useQuery<ApiResponse, Error>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUser,
    enabled: status === "authenticated" && !!session?.accessToken && !!session?.user?.id,
  })

  // Update form data when user data is loaded
  useEffect(() => {
    if (userResponse?.success && userResponse.data) {
      setFormData({
        name: userResponse.data.name || "",
        email: userResponse.data.email || "",
        username: userResponse.data.username || "",
        credit: userResponse.data.credit || 0,
        role: userResponse.data.role || "",
        fine: userResponse.data.fine || 0,
      })
    }
  }, [userResponse])

  const updateMutation = useMutation<ApiResponse, Error, Partial<UserData>>({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", session?.user?.id] })
      setIsEditing(false)
    },
    onError: (error: Error) => {
      console.error("Update failed:", error.message)
    },
  })

  const handleEdit = (): void => {
    setIsEditing(true)
  }

  const handleSave = (): void => {
    updateMutation.mutate({
      id: session?.user?.id, // Add userId as _id
      name: formData.name,
      email: formData.email,
      username: formData.username,
    })
  }

  const handleCancel = (): void => {
    if (userResponse?.success && userResponse.data) {
      setFormData({
        name: userResponse.data.name || "",
        email: userResponse.data.email || "",
        username: userResponse.data.username || "",
        credit: userResponse.data.credit || 0,
        role: userResponse.data.role || "",
        fine: userResponse.data.fine || 0,
      })
    }
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  // Handle authentication states
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#1F2022] p-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse flex items-center justify-center">
              <div className="text-lg">Loading authentication...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#1F2022] p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p>Please sign in to view your personal information.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1F2022] p-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse flex items-center justify-center">
              <div className="text-lg">Loading user information...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || error) {
    return (
      <div className="min-h-screen bg-[#1F2022] p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-red-500 text-center">
              <h3 className="text-lg font-semibold mb-2">Error Loading User Data</h3>
              <p>{error?.message || "An unexpected error occurred"}</p>
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["user", session?.user?.id] })}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userResponse?.success || !userResponse.data) {
    return (
      <div className="min-h-screen bg-[#1F2022] p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">No user data available</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mt-10 mb-7 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-10 h-10" />
            <div className="text-[40px] text-[#1F2022] font-medium">
              {isEditing ? "Edit Personal Information" : "Personal Information"}
            </div>
          </div>
          {!isEditing ? (
            <Button
              onClick={handleEdit}
              variant="secondary"
              size="sm"
              className="text-base text-[#1F2022] font-medium h-[48px] px-6 rounded-[6px]"
              style={{
                background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
              }}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="text-base text-[#1F2022] font-medium h-[48px] px-6 rounded-[6px] border-none"
                style={{
                  background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                }}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="text-base text-[#1F2022] font-medium h-[48px] px-6 rounded-[6px]"
                style={{
                  background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                }}
                disabled={updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-1" />
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Card>
        <CardContent className="bg-[#1F2022] text-white p-6 rounded-b-lg">
          {updateMutation.isError && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-[6px] text-red-200">
              <p className="text-sm">Failed to update: {updateMutation.error?.message || "Unknown error"}</p>
            </div>
          )}

          {!isEditing ? (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#C0A05C] text-base font-medium">Full Name</Label>
                <div className="bg-[#1F2022] border border-[#C0A05C] rounded-[6px] px-3 py-2 text-[#C0A05C]">
                  {formData.name || "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#C0A05C] text-base font-medium">Username</Label>
                <div className="bg-[#1F2022] border border-[#C0A05C] rounded-[6px] px-3 py-2 text-[#C0A05C]">
                  {formData.username || "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#C0A05C] text-base font-medium">Email Address</Label>
                <div className="bg-[#1F2022] border border-[#C0A05C] rounded-[6px] px-3 py-2 text-[#C0A05C]">
                  {formData.email || "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#C0A05C] text-base font-medium">Role</Label>
                <div className="bg-[#1F2022] border border-[#C0A05C] rounded-[6px] px-3 py-2 text-[#C0A05C]">
                  <span className="capitalize">{formData.role || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#C0A05C] text-base font-medium">Credit</Label>
                <div className="bg-[#1F2022] border border-[#C0A05C] rounded-[6px] px-3 py-2 text-[#C0A05C]">
                  {formData.credit}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#C0A05C] text-base font-medium">Fine</Label>
                <div className="bg-[#1F2022] border border-[#C0A05C] rounded-[6px] px-3 py-2 text-[#C0A05C]">
                  {formData.fine}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#C0A05C] text-base font-medium">Member Since</Label>
                <div className="bg-[#1F2022] border border-[#C0A05C] rounded-[6px] px-3 py-2 text-[#C0A05C]">
                  {formatDate(userResponse.data.createdAt)}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#C0A05C] text-base font-medium">Last Updated</Label>
                <div className="bg-[#1F2022] border border-[#C0A05C] rounded-[6px] px-3 py-2 text-[#C0A05C]">
                  {formatDate(userResponse.data.updatedAt)}
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#C0A05C] text-base font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] focus:border-yellow-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#C0A05C] text-base font-medium">
                  Username *
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] focus:border-yellow-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#C0A05C] text-base font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] focus:border-yellow-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#C0A05C] text-base font-medium">Role</Label>
                <div className="bg-[#1F2022] border border-[#C0A05C] rounded-[6px] px-3 py-2 text-[#C0A05C]">
                  <span className="capitalize">{formData.role || "N/A"}</span>
                  <span className="text-xs ml-2">(Read-only)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#C0A05C] text-base font-medium">Credit</Label>
                <div className="bg-[#1F2022] border border-[#C0A05C] rounded-[6px] px-3 py-2 text-[#C0A05C]">
                  {formData.credit}
                  <span className="text-xs ml-2">(Read-only)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#C0A05C] text-base font-medium">Fine</Label>
                <div className="bg-[#1F2022] border border-[#C0A05C] rounded-[6px] px-3 py-2 text-[#C0A05C]">
                  {formData.fine}
                  <span className="text-xs ml-2">(Read-only)</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
