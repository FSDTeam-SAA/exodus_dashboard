import React, { Suspense } from 'react'
import UpdatePasswordPage from './_component/UpdatePasswordPage'

const page = () => {
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <UpdatePasswordPage />
            </Suspense>
        </div>
    )
}

export default page
