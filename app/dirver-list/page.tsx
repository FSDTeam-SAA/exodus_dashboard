import React from 'react'
import DriverManagement from './_component/Driver_list'
import { DashboardNavbar } from '@/components/dashboard-navbar'

const page = () => {
    return (
        <div>
            <DashboardNavbar />
            <div>
                <DriverManagement />
            </div>
        </div>
    )
}

export default page
