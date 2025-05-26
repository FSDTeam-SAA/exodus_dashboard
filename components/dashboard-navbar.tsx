"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"

export function DashboardNavbar() {
   const session = useSession();
  const user = session
  console.log("User session:", user);
  return (
    <header className="flex h-[80px] items-center justify-between border-b bg-[#1F2022] px-6">
      <div className="flex items-center gap-4 ">
        <SidebarTrigger className="-ml-2" />
      </div>

      <div className="flex items-center gap-4 ">
        <Button variant="ghost" size="icon" className="relative border border-[#C0A05C] rounded-full">
          <Bell className="h-5 w-5 text-[#C0A05C] fill-[#C0A05C]" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-500"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col text-left">
                  <span className="text-base text-[#C0A05C] font-medium">Alex rock</span>
                  <span className="text-xs text-[#C0A05C] font-medium">Admin</span>
                </div>
                <Avatar className="h-10 w-10 bg-white">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Alex rock" />
                  <AvatarFallback className="text-[#C0A05C]">AR</AvatarFallback>
                </Avatar>
              </div>
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
            <DropdownMenuItem asChild className="border-b border-[#1F2022]/20 cursor-pointer hover:bg-[#1F2022]/10">
              <Link href="/change-password">Change Password</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1F2022]/20" />
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#1F2022]/10">
              <Link href="">Log out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
