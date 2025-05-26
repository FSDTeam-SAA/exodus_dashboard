"use client"

import type * as React from "react"
import { LayoutDashboard, Users, Bus, UserCheck, Calendar, BookOpen, CreditCard, LogOut, } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/",
    isActive: true,
  },
  {
    title: "Passenger Booking",
    icon: Users,
    url: "/passenger-booking",
  },
  {
    title: "Bus Lists",
    icon: Bus,
    url: "/bus-list",
  },
  {
    title: "Driver List",
    icon: UserCheck,
    url: "/dirver-list",
  },
  {
    title: "Scheduled Ride",
    icon: Calendar,
    url: "/scheduled-ride",
  },
  {
    title: "Reserve Bus",
    icon: BookOpen,
    url: "/reserve-bus",
  },
  {
    title: "Subscription",
    icon: CreditCard,
    url: "/subscription",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0 bg-[#1F2022] " {...props}>
      <SidebarHeader className=" ">
        <div className="flex justify-center">
          <Image src="/assets/logo.png" alt="logo" width={100} height={100} className="w-[124px] h-[90px]" />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 py-4 mt-6">
        <SidebarMenu className="space-y-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                className="h-12 rounded-[6px] text-black hover:opacity-90 data-[active=true]:text-black"
                style={{
                  background: 'linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)',
                }}
              >
                <Link href={item.url} className="flex items-center gap-3 px-4">
                  <item.icon className="h-5 w-5" />
                  <span className="text-[18px] text-[#1F2022] font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild

              className="h-12 rounded-lg text-black hover:opacity-90 data-[active=true]:text-black"
              style={{
                background: 'linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)',
              }}
            >
              <a href="#" className="flex items-center gap-3 px-4">
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Log Out</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
