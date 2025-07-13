"use client"

// External
// import { TFunction } from "next-i18next"
import { useEffect, useState } from "react"

// Internal
import { GuestLayout, PrivateLayout, OnlyPublicRoutes, OnlyPrivateRoutes, TypeProvider } from "@/core-ui"
import { selectIsLoggedIn, useTypedSelector } from "@/redux"

export default function LayoutController(
    { children }: { children: React.ReactNode }
) {
    // Redux
    const isLoggedIn = useTypedSelector(selectIsLoggedIn)

    // Internal variables
    const [isLoading, setIsLoading] = useState<boolean>(true)

    // Effects
    useEffect(() => {
        setIsLoading(false)
    }, [])

    if (isLoading) return null
    
    return (
        <div className="casanova-wrapper">
            <TypeProvider>
                <PrivateLayout>
                    {children}
                </PrivateLayout>
            </TypeProvider>
        </div>
    )
}