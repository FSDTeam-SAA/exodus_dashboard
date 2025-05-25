import { DashboardNavbar } from "@/components/dashboard-navbar";
import { TicketTable } from "./_components/passenger_booking_table";




export default function Page() {
    return (
        <div>
            <DashboardNavbar />
            <div className=" mx-auto px-6">
                <TicketTable />
            </div>
        </div>
    )
}
