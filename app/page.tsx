import { DashboardNavbar } from "@/components/dashboard-navbar"
import { DashboardStats } from "@/components/dashboard-stats"
import { BookingChart } from "@/components/booking-chart"
import { SidebarInset } from "@/components/ui/sidebar"

export default function DashboardPage() {
  return (
    <SidebarInset>
      <DashboardNavbar />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-[40px] font-bold text-[#1F2022] ">Dashboard</h1>
          <p className="text-xl text-[#1F2022] font-medium">Welcome back to your admin panel</p>
        </div>

        <DashboardStats />

        <BookingChart />
      </main>
    </SidebarInset>
  )
}
