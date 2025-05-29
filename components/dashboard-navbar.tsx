"use client"

import Link from "next/link"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, Loader2 } from "lucide-react"
import { LogoutModal } from "./shared/logoutModal"
import { ChangePasswordModal } from "./chagePassowrdModal"


// Function to fetch user data
const fetchUserData = async (userId: string, token: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/single-user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user data")
  }

  return response.json()
}

export function DashboardNavbar() {
  const session = useSession()
  const userId = session.data?.user?.id
  const token = session.data?.accessToken
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserData(userId as string, token as string),
    enabled: !!userId && !!token,
  })

  const user = userData?.data

  // Get first letter of first and last name for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U"
    const nameParts = name.split(" ")
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    }
    return name[0].toUpperCase()
  }

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleChangePasswordClick = () => {
    setIsChangePasswordModalOpen(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      await signOut({
        callbackUrl: "/", 
        redirect: true,
      })
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLogoutModalOpen(false)
    }
  }

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false)
  }

  return (
    <>
      <header className="flex h-[80px] items-center justify-between border-b bg-[#1F2022] px-6">
        <div className="flex items-center gap-4 ">{/* <SidebarTrigger className="-ml-2" /> */}</div>

        <div className="flex items-center gap-4 ">
          <Link href="/notification">
            <Button variant="ghost" size="icon" className="relative border border-[#C0A05C] rounded-full">
              <Bell className="h-5 w-5 text-[#C0A05C] fill-[#C0A05C]" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-500"></span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 text-[#C0A05C] animate-spin" />
                    <span className="text-[#C0A05C]">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[#C0A05C]">Error loading profile</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col text-left">
                      <span className="text-base text-[#C0A05C] font-medium">{user?.name || "User"}</span>
                      <span className="text-xs text-[#C0A05C] font-medium">{user?.role || "User"}</span>
                    </div>
                    <Avatar className="h-10 w-10 bg-white">
                      {user?.avatar?.url ? (
                        <AvatarImage src={user.avatar.url || "/placeholder.svg"} alt={user.name} />
                      ) : (
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.name || "User"} />
                      )}
                      <AvatarFallback className="text-[#C0A05C]">
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-[#C0A05C]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-[#C0A05C] text-[#1F2022] text-base font-medium border-transparent"
            >
              <DropdownMenuSeparator className="bg-[#1F2022]/20" />
              <DropdownMenuItem asChild className="border-b border-[#1F2022]/20 cursor-pointer hover:bg-[#1F2022]/10">
                <Link href="/personal-information">Personal Information</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border-b border-[#1F2022]/20 cursor-pointer hover:bg-[#1F2022]/10"
                onClick={handleChangePasswordClick}
              >
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1F2022]/20" />
              <DropdownMenuItem className="cursor-pointer hover:bg-[#1F2022]/10" onClick={handleLogoutClick}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <LogoutModal isOpen={isLogoutModalOpen} onClose={handleLogoutCancel} onConfirm={handleLogoutConfirm} />
      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} />
    </>
  )
}
