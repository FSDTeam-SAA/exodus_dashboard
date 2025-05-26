import React from 'react'
import SubscriptionPage from './_component/SubscriptionPage'
import { DashboardNavbar } from '@/components/dashboard-navbar'

const page = () => {
    return (
        <div>
            <DashboardNavbar />
            <div>
                <SubscriptionPage />
            </div>
        </div>
    )
}

export default page
