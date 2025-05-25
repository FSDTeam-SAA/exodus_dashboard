import { DashboardNavbar } from '@/components/dashboard-navbar'
import React from 'react'
import AddBus from './_component/AddBus'

const page = () => {
    return (
        <div>
            <DashboardNavbar />
            <div>
                <AddBus />
            </div>
        </div>
    )
}

export default page
