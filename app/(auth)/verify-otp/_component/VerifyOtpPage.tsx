"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const decodedEmail = email ? decodeURIComponent(email) : ""

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Redirect if no email is provided
    if (!decodedEmail) {
      toast.error("Email is required for OTP verification")
      router.push("/forgot-password")
      return
    }
  }, [decodedEmail, router])

  const handleVerifyAndRedirect = (otpString: string) => {
    toast.success("Redirecting to update password...")

    // Store OTP parameters in sessionStorage for the next page
    sessionStorage.setItem("verifiedOtp", otpString)
    sessionStorage.setItem("otpVerificationTime", new Date().toISOString())
    sessionStorage.setItem("verifiedEmail", decodedEmail)

    // Redirect with OTP as parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set("otp", otpString)
    router.push(`/update-password?${params.toString()}`)
  }

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value) || value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    if (pastedData.length === 6) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("")

    if (otpString.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }

    if (!decodedEmail) {
      toast.error("Email is required for verification")
      return
    }

    // Send OTP for verification with decoded email
    handleVerifyAndRedirect(otpString)
  }

  // Mask email for display (show first 2 chars and domain)
  const maskEmail = (email: string) => {
    if (!email) return ""
    const [localPart, domain] = email.split("@")
    if (!localPart || !domain) return email
    const maskedLocal = localPart.length > 2 ? localPart.slice(0, 2) + "*".repeat(localPart.length - 2) : localPart
    return `${maskedLocal}@${domain}`
  }

  if (!decodedEmail) {
    return (
      <div className="min-h-screen bg-[#1F2022] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1F2022] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-[32px] font-semibold text-[#C0A05C]">Verify OTP</h1>
          <p className="text-[#C0A05C] text-sm">
            {"We've sent a verification code to"}
            <br />
            <span className="text-[#C0A05C] font-medium">{maskEmail(decodedEmail)}</span>
            <br />
            {"Enter the 6-digit code below"}
          </p>
        </div>

        <div className="bg-[#C0A05C0D] rounded-[8px] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center space-x-2 " onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center bg-gray-800 border-[#C0A05C] text-[#C0A05C] text-lg font-semibold focus:border-[#C0A05C] focus:ring-1 focus:ring-[#C0A05C] rounded-[8px]"
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-[#C0A05C] text-sm">Enter the 6-digit code sent to your email</p>
            </div>

            <Button
              type="submit"
              disabled={otp.join("").length !== 6}
              className="w-full text-[#1F2022] font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
              }}
            >
              Send
            </Button>
          </form>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-[#C0A05C] text-sm hover:text-[#C0A05C] transition-colors"
          >
            ← Back to forgot password
          </button>
        </div>
      </div>
    </div>
  )
}
