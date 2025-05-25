import React from 'react'
import BusList from './_components/bus_list'
import { DashboardNavbar } from '@/components/dashboard-navbar'

const page = () => {
    return (
        <div>
            <DashboardNavbar />
            <BusList />
        </div>
    )
}

export default page
