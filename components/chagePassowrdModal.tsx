"use client"

import type React from "react"
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UserData {
  success: boolean
  message: string
  data: {
    _id: string
    email: string
    name: string
    username: string
    role: string
    credit: number
    fine: number
    avatar: {
      public_id: string
      url: string
    }
    createdAt: string
    updatedAt: string
    __v: number
  }
}

interface ChangePasswordData {
  email: string
  oldPassword: string
  newPassword: string
}

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { data: session } = useSession()

  const userId = session?.user?.id
  const token = session?.accessToken

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Fetch user data to get email
  const { data: userData } = useQuery<UserData>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/single-user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }
      return response.json()
    },
    enabled: !!userId && !!token, // Only run query if userId and token exist
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to change password")
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Password changed successfully")

      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Reset visibility states
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)

      // Close modal
      onClose()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (!userData?.data?.email) {
      toast.error("User email not found")
      return
    }

    if (!token) {
      toast.error("Authentication token not found")
      return
    }

    // Submit change password request
    changePasswordMutation.mutate({
      email: userData.data.email,
      oldPassword: currentPassword,
      newPassword: newPassword,
    })
  }

  const handleClose = () => {
    // Reset form when closing
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    onClose()
  }

  return (
    <div className="bg-[#1F2022]">
        <Dialog open={isOpen} onOpenChange={handleClose} >
      <DialogContent className="bg-[#1F2022] backdrop-blur-[2px] border-none !rounded-[10px]  ">
        <DialogHeader>
          <DialogTitle className="text-[32px] font-bold text-[#C0A05C] text-center">Change Password</DialogTitle>
       
        </DialogHeader>

        <div className="">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-[#C0A05C] text-base">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#1F2022] border border-[#C0A05C] rounded p-2 pr-10 text-[#C0A05C] focus:outline-none focus:ring-2 focus:ring-[#C0A05C]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C0A05C] hover:text-[#F3E898] transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-[#C0A05C] text-base">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#1F2022] border border-[#C0A05C] rounded p-2 pr-10 text-[#C0A05C] focus:outline-none focus:ring-2 focus:ring-[#C0A05C]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C0A05C] hover:text-[#F3E898] transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-[#C0A05C] text-base">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1F2022] border border-[#C0A05C] rounded p-2 pr-10 text-[#C0A05C] focus:outline-none focus:ring-2 focus:ring-[#C0A05C]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C0A05C] hover:text-[#F3E898] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-[#C0A05C] text-[#C0A05C] hover:bg-[#C0A05C] hover:text-[#1F2022]"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={changePasswordMutation.isPending || !token}
                className="flex-1 text-[#1F2022] font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                }}
              >
                {changePasswordMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  )
}
