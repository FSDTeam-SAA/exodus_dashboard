"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ResetPasswordRequest {
    email: string
    otp: string
    password: string
}

const resetPasswordApi = async (data: ResetPasswordRequest) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to reset password")
    }

    return response.json()
}

export default function UpdatePasswordPage() {
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()

    const email = searchParams.get("email")
    const otp = searchParams.get("otp")
    const decodedEmail = email ? decodeURIComponent(email) : ""
    const decodedOtp = otp ? decodeURIComponent(otp) : ""



    const mutation = useMutation({
        mutationFn: (data: ResetPasswordRequest) => resetPasswordApi(data),
        onSuccess: () => {
            toast.success("Password updated successfully")
            // Clear stored email
            sessionStorage.removeItem("resetEmail")
            router.push("/login")
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long")
            return
        }

        mutation.mutate({
            email: decodedEmail,
            otp: decodedOtp,
            password: newPassword,
        })
    }

    return (
        <div className="min-h-screen bg-[#1F2022] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-[32px] font-semibold text-[#C0A05C]">Update Password</h1>
                    <p className="text-[#C0A05C] text-sm">Create your new password</p>
                    {email && <p className="text-[#C0A05C] text-xs">Resetting password for: {email}</p>}
                </div>

                <div className="bg-[#C0A05C0D] p-6 rounded-[8px]">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-[#C0A05C] text-base">
                                New Password
                            </Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter your New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#1F2022] focus:border-yellow-[#C0A05C] h-[48px] rounded-[8px]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-[#C0A05C] text-base">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Enter your Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#1F2022] focus:border-yellow-[#C0A05C] h-[48px] rounded-[8px]"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={mutation.isPending || !email || !otp}
                            className="w-full  text-[#1F2022] font-medium h-[48px] rounded-[8px]"
                            style={{
                                background: 'linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)',
                            }}
                        >
                            {mutation.isPending ? "Updating..." : "Update Password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
