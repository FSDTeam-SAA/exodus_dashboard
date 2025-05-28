import React from 'react'
import NotificationList from './_component/NotificationList'
import { DashboardNavbar } from '@/components/dashboard-navbar'

const page = () => {
    return (
        <div>
            <DashboardNavbar />
            <div>
                <NotificationList />
            </div>
        </div>
    )
}

export default page
