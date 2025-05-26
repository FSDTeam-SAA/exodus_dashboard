import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppProvider from "@/provider/AppProvider"
import { Toaster } from "sonner"
import { AuthProvider } from "@/components/sheyerd/AuthProvider"
import TokenProvider from "@/components/sheyerd/TokenProvider"

const inter = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

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
          <div className="flex  min-h-screen w-full">
            <AppSidebar />
            <AppProvider>
              <AuthProvider>

                <TokenProvider>

                  <div className="flex-1">{children}</div>
                </TokenProvider>

              </AuthProvider>
              <Toaster />
            </AppProvider>
          </div>
        </SidebarProvider>

      </body>
    </html>
  )
}
