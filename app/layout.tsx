import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppProvider from "@/provider/AppProvider"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Exodus  Dashboard",
  description: "Admin dashboard for Exodus Transport Company",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>

        <SidebarProvider>
          <div className="flex gap-10 min-h-screen w-full">
            <AppSidebar />
            <AppProvider>
              <div className="flex-1">{children}</div>
            </AppProvider>
          </div>
        </SidebarProvider>

      </body>
    </html>
  )
}
