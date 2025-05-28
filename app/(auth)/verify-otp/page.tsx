import React, { Suspense } from 'react'
import VerifyOtpPage from './_component/VerifyOtpPage'

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyOtpPage />
      </Suspense>
    </div>
  )
}

export default page
