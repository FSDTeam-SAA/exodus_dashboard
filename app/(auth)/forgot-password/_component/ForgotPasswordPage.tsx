"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

interface ForgotPasswordRequest {
    email: string
}

interface ForgotPasswordResponse {
    success: boolean
    message: string
    token?: string
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const router = useRouter()

    const forgotPasswordApi = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forget`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: data.email,
            }),
        })

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || "Failed to send OTP")
        }

        return result
    }

    const mutation = useMutation({
        mutationFn: forgotPasswordApi,
        onSuccess: (response) => {
            toast.success(response.message || "OTP sent successfully!")
            router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong. Please try again.")
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error("Please enter your email address")
            return
        }

        mutation.mutate({ email: email.trim() })
    }

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    return (
        <div className="min-h-screen bg-[#1F2022] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="border-none">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">

                        </div>
                        <CardTitle className="text-[32px] font-semibold text-[#C0A05C]">Forgot Password</CardTitle>
                        <CardDescription className="text-sm text-[#C0A05C]">
                            Enter the email address associated with your account.
                            <br />
                            {"We'll send you an OTP to your email."}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[#C0A05C] text-base">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#C0A05C] focus:border-[#C0A05C] focus:ring-[#C0A05C] h-[48px] rounded-[6px]"
                                    required
                                />
                                {email && !isValidEmail(email) && (
                                    <p className="text-red-400 text-xs">Please enter a valid email address</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={mutation.isPending || !email.trim() || !isValidEmail(email)}
                                className="w-full  text-[#1F2022] font-medium py-3 disabled:opacity-50 h-[50px] rounded-[6px]"
                                style={{
                                    background: 'linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)',
                                }}
                            >
                                {mutation.isPending ? "Sending..." : "Send OTP"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Button variant="ghost" onClick={() => router.back()} className="text-[#C0A05C] hover:text-[#C0A05C] ">
                                <ArrowLeft className="h-4 w-4 mr-2 text-[#C0A05C]" />
                                Back to Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
