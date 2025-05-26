import React from 'react'
import ScheduledRidePage from './_component/ScheduledRidePage'
import { DashboardNavbar } from '@/components/dashboard-navbar'

const page = () => {
    return (
        <div>
            <DashboardNavbar />
            <div>
                <ScheduledRidePage />
            </div>
        </div>
    )
}

export default page
