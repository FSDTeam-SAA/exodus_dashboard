"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Settings, Save, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton"

interface Subscription {
  _id: string
  planName: string
  roundtrip: number
  price: number
  planValid: boolean
  features?: string[]
}

interface ApiResponse {
  success: boolean
  message: string
  data: Subscription[]
}

interface CreateSubscriptionData {
  planName: string
  roundtrip: number
  price: number
  planValid: boolean
  features: string[]
}

export default function SubscriptionPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    planName: "",
    roundtrip: 0,
    price: 0,
    planValid: true,
    features: [] as string[],
  })
  const [newFeature, setNewFeature] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [editFormData, setEditFormData] = useState({
    planName: "",
    price: 0,
  })
  const session = useSession()
  const AUTH_TOKEN = session?.data?.accessToken

  const queryClient = useQueryClient()
  const fetchSubscriptions = async (): Promise<ApiResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch subscriptions")
    }

    return response.json()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createSubscription = async (data: CreateSubscriptionData): Promise<any> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create subscription")
    }

    return response.json()
  }

  const deleteSubscription = async (id: string): Promise<string> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete subscription")
    }

    return response.json()
  }

  const updateSubscription = async ({
    id,
    data,
  }: { id: string; data: { planName: string; price: number } }): Promise<string> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to update subscription")
    }

    return response.json()
  }

  const {
    data: subscriptionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: fetchSubscriptions,
  })

  const createMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
      toast.success("Subscription created successfully")
      setShowAddForm(false)
      setFormData({
        planName: "",
        roundtrip: 0,
        price: 0,
        planValid: true,
        features: [],
      })
      setNewFeature("")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
      toast.success("Subscription deleted successfully")
      setShowDeleteModal(false)
      setSelectedSubscription(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete subscription")
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
      toast.success("Subscription updated successfully")
      setShowEditModal(false)
      setSelectedSubscription(null)
      setEditFormData({ planName: "", price: 0 })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update subscription")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (featureToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((feature) => feature !== featureToRemove),
    }))
  }

  const handleFeatureKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addFeature()
    }
  }

  const handleDelete = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setShowDeleteModal(true)
  }

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setEditFormData({
      planName: subscription.planName,
      price: subscription.price,
    })
    setShowEditModal(true)
  }

  const confirmDelete = () => {
    if (selectedSubscription) {
      deleteMutation.mutate(selectedSubscription._id)
    }
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSubscription) {
      updateMutation.mutate({
        id: selectedSubscription._id,
        data: editFormData,
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditInputChange = (field: string, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="px-6">
        <div className="flex items-center justify-between mb-7 mt-10">
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 bg-gray-300" />
            <Skeleton className="h-10 w-64 bg-gray-300" />
          </div>
          <Skeleton className="h-12 w-48 bg-gray-300" />
        </div>

        <Card className="bg-amber-100 border-amber-200">
          <CardContent className="p-0">
            {/* Header Skeleton */}
            <div className="grid grid-cols-6 gap-4 p-4 bg-[#C0A05C]">
              {["Plan Name", "Price", "Description", "Features", "Active User", "Action"].map((header, index) => (
                <Skeleton key={index} className="h-5 w-full bg-[#946329]" />
              ))}
            </div>

            {/* Subscription Rows Skeleton */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 p-4 bg-[#1F2022] border-b border-[#C0A05C]">
                {/* Plan Name */}
                <Skeleton className="h-5 w-24 bg-gray-700" />

                {/* Price */}
                <Skeleton className="h-5 w-16 bg-gray-700" />

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-700" />
                  <Skeleton className="h-4 w-3/4 bg-gray-700" />
                </div>

                {/* Features */}
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20 bg-gray-700" />
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                  <Skeleton className="h-4 w-24 bg-gray-700" />
                </div>

                {/* Active Users */}
                <Skeleton className="h-5 w-12 bg-gray-700" />

                {/* Actions */}
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 bg-gray-700" />
                  <Skeleton className="h-8 w-8 bg-gray-700" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error loading subscriptions</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className=" px-6">
      <div className="">
        {!showAddForm ? (
          // Subscription List View
          <div>
            <div className="flex items-center justify-between mb-7 mt-10">
              <div className="flex items-center gap-2">
                <Settings className="w-10 h-10 text-[#1F2022]" />
                <h2 className="text-[40px] text-[#1F2022] font-medium">Subscription</h2>
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className=" text-[#1F2022] h-[48px] rounded-[8px]"
                style={{
                  background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subscription
              </Button>
            </div>

            <Card className="bg-amber-100 border-amber-200">
              <CardContent className="p-0">
                {/* Header */}
                <div className="grid grid-cols-6 gap-4 p-4 bg-[#C0A05C] text-[#1F2022] font-medium ">
                  <div>Plan Name</div>
                  <div>Price</div>
                  <div>Description</div>
                  <div>Features</div>
                  <div>Active User</div>
                  <div>Action</div>
                </div>

                {/* Subscription Rows */}
                {subscriptionsData?.data?.map((subscription) => (
                  <div
                    key={subscription._id}
                    className="grid grid-cols-6 gap-4 p-4 bg-[#1F2022]  border-b border-[#C0A05C]"
                  >
                    <div className="text-[#C0A05C] text-base font-medium">{subscription.planName}</div>
                    <div className="text-[#C0A05C] text-base font-medium">${subscription.price}</div>
                    <div className="text-[#C0A05C] text-base font-medium">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras interdum blandit luctus.
                    </div>
                    <div className="space-y-1">
                      {subscription.features?.map((feature, index) => (
                        <div key={`custom-${index}`} className="text-[#C0A05C] text-base font-medium">
                          {feature}
                        </div>
                      ))}
                      {(!subscription.features || subscription.features.length === 0) && (
                        <div className="text-[#C0A05C]/50 text-base font-medium italic">No features added</div>
                      )}
                    </div>
                    <div className="text-[#C0A05C] text-base font-medium">150</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400"
                        onClick={() => handleEdit(subscription)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400"
                        onClick={() => handleDelete(subscription)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Add Subscription Form View
          <div>
            <div className="flex items-center justify-between mb-7 mt-10">
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6" />
                <h2 className="text-[40px] text-[#1F2022] font-medium">Add Subscription </h2>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="text-[#1F2022] h-[48px] rounded-[6px]"
                style={{
                  background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                }}
              >
                <span>
                  <Save className="w-4 h-4 mr-2" />
                </span>
                {createMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>

            <Card className="bg-[#1F2022] ">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="planName" className="text-[#C0A05C] text-base font-medium">
                        Plan Name
                      </Label>
                      <Input
                        id="planName"
                        value={formData.planName}
                        onChange={(e) => handleInputChange("planName", e.target.value)}
                        placeholder="Enter plan name"
                        className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#C0A05C] h-[48px] rounded-[6px]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-[#C0A05C] text-base font-medium">
                        Price
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                        placeholder="$0.00"
                        className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#C0A05C] h-[48px] rounded-[6px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roundtrip" className="text-[#C0A05C] text-base font-medium">
                      Roundtrip
                    </Label>
                    <Input
                      id="roundtrip"
                      type="number"
                      value={formData.roundtrip}
                      onChange={(e) => handleInputChange("roundtrip", Number.parseInt(e.target.value) || 0)}
                      placeholder="Number of roundtrips"
                      className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#C0A05C] h-[48px] rounded-[6px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[#C0A05C] text-base font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Write here..."
                      className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#C0A05C] h-[48px] rounded-[6px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[#C0A05C] text-base font-medium">Features</Label>

                    {/* Add new feature input */}
                    <div className="flex gap-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={handleFeatureKeyPress}
                        placeholder="Add a custom feature..."
                        className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#C0A05C] h-[40px] rounded-[6px]"
                      />
                      <Button
                        type="button"
                        onClick={addFeature}
                        disabled={!newFeature.trim()}
                        className="h-[40px] px-4 text-[#1F2022] rounded-[6px] cursor-pointer"
                        style={{
                          background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                        }}
                      >
                        <Plus className="w-4 h-4 text-[#1F2022]" />
                      </Button>
                    </div>

                    {/* Features display */}
                    <div className="flex flex-wrap gap-2 p-3 bg-[#1F2022] border border-[#C0A05C] rounded-md min-h-[80px]">
                      {/* Custom features (removable) */}
                      {formData.features.map((feature, index) => (
                        <Badge
                          key={`custom-${index}`}
                          variant="secondary"
                          className="bg-[#C0A05C] text-[#1F2022] rounded-[6px] flex items-center gap-1 hover:bg-[#C0A05C]"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => removeFeature(feature)}
                            className="ml-1 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                      {formData.features.length === 0 && (
                        <div className="text-[#C0A05C]/50 text-sm italic">
                          No custom features added yet. Add features using the input above.
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-[#C0A05C]/70">
                      Add custom features for this subscription plan. Click the X to remove any feature.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="border-[#C0A05C] text-[#C0A05C] hover:text-[#C0A05C] h-[48px] rounded-[6px]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1F2022] border border-[#C0A05C] rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-[#C0A05C] text-lg font-medium mb-4">Confirm Delete</h3>
              <p className="text-[#C0A05C] mb-6">
                Are you sure you want to delete the subscription &quot;{selectedSubscription?.planName}&quot;? This
                action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="border-[#C0A05C] text-[#C0A05C] hover:text-[#C0A05C]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1F2022] border border-[#C0A05C] rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-[#C0A05C] text-lg font-medium mb-4">Edit Subscription</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editPlanName" className="text-[#C0A05C] text-base font-medium">
                    Plan Name
                  </Label>
                  <Input
                    id="editPlanName"
                    value={editFormData.planName}
                    onChange={(e) => handleEditInputChange("planName", e.target.value)}
                    placeholder="Enter plan name"
                    className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#C0A05C] h-[48px] rounded-[6px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPrice" className="text-[#C0A05C] text-base font-medium">
                    Price
                  </Label>
                  <Input
                    id="editPrice"
                    type="number"
                    step="0.01"
                    value={editFormData.price}
                    onChange={(e) => handleEditInputChange("price", Number.parseFloat(e.target.value) || 0)}
                    placeholder="$0.00"
                    className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#C0A05C] h-[48px] rounded-[6px]"
                    required
                  />
                </div>
                <div className="flex gap-4 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    className="border-[#C0A05C] text-[#C0A05C] hover:text-[#C0A05C]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="text-[#1F2022]"
                    style={{
                      background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                    }}
                  >
                    {updateMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
