'use client'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TokenProvider = ({ children }: any) => {
    return (
        <>
            <SessionProvider>

                {children}
            </SessionProvider>
        </>
    )
}

export default TokenProvider
