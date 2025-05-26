import React from 'react'
import ReserveBus from './_component/ReserveBus'
import { DashboardNavbar } from '@/components/dashboard-navbar'

const page = () => {
  return (
    <div>
      <DashboardNavbar />
      <div>
        <ReserveBus />
      </div>
    </div>
  )
}

export default page
