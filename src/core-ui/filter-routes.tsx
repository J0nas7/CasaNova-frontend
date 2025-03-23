"use client"

// External
import { useAuth } from "@/hooks"
import { selectIsLoggedIn, useTypedSelector } from "@/redux"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Internal
//import { useAuthContext } from "@/hooks/useAuthContext"

// Check if you are on the client (browser) or server
const isBrowser = () => typeof window !== "undefined"

export const OnlyPublicRoutes = ({ children }: { children: React.ReactNode }) => {
    // Hooks
    useAuth()
    const router = useRouter()
    const pathname = usePathname() // Get the current pathname
    
    // Redux
    const isLoggedIn = useTypedSelector(selectIsLoggedIn)

    // Variables
    const [render,setRender] = useState<boolean>(false)

    // Routes that are allowed for guests
    const publicRoutes = [
        "/",
        "/sign-in",
        "/register-account",
        "/forgot-password"
    ]

    /**
     * @var pathIsProtected checks if path exists in the the publicRoutes routes array
     */
    const pathIsProtected = publicRoutes.indexOf(pathname) === -1
    
    if (isBrowser() && isLoggedIn === false && pathIsProtected) {
        router.push("/sign-in")
    }
    
    useEffect(() => {
        setRender(true)
    }, [])
    
    if (!render) return null
    
    if (isLoggedIn === false && pathIsProtected) {
        return null
    }

    return <>{children}</>
}

export const OnlyPrivateRoutes = ({ children }: { children: React.ReactNode }) => {
    // Hooks
    useAuth()
    const router = useRouter()
    const pathname = usePathname() // Get the current pathname
    
    // Redux
    const isLoggedIn = useTypedSelector(selectIsLoggedIn)

    // Variables
    const [render, setRender] = useState<boolean>(false)

    // Routes that are allowed for guests
    const privateRoutes = [
        "/sign-in",
        "/register-account",
        "/forgot-password"
    ]

    /**
     * @var pathIsProtected checks if path exists in the the publicRoutes routes array
     */
    const pathIsNotProtected = privateRoutes.indexOf(pathname) === -1
    
    useEffect(() => {
        setRender(true)
    }, [])
    
    if (!render) return null
    
    if (isLoggedIn === true && !pathIsNotProtected) {
        return null
    }

    return <>{children}</>
}