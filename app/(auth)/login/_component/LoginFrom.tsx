"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await signIn("credentials", {
                email: email,
                password: password,
                redirect: false,
                callbackUrl: "/",
            })

            if (response?.error) {
                toast.error(response?.error)
            } else {
                toast.success("Login successful")
                window.location.href = "/"
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again. || " + error)
        }
      
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="min-h-screen bg-[#1F2022] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-[32px] font-semibold text-[#C0A05C]">Hello, Welcome!</h1>
                    <p className="text-[#C0A05C] text-base font-normal">Please Enter Your Details Below to Continue</p>
                </div>

                <div className="bg-[#C0A05C0D] p-6 rounded-[6px]">
                    <form onSubmit={handleLogin} className="space-y-4 ">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[#C0A05C] text-base">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#1F2022] focus:border-[#C0A05C] h-[48px] rounded-[6px]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[#C0A05C] text-sm">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-[#1F2022] border-[#C0A05C] text-[#C0A05C] placeholder-[#1F2022] focus:border-[#C0A05C] h-[48px] rounded-[6px] pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C0A05C] hover:text-[#F3E898] transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <div className="text-right">
                                <Link href="/forgot-password" className="text-[#C0A05C] text-sm  transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full  text-[#1F2022] text-base font-medium h-[48px] rounded-[6px]"
                            style={{
                                background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
                            }}
                        >
                            Login
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
