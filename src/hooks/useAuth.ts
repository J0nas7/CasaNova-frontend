"use client"

// External
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Internal
import { useAxios, useCookies } from './'
import { apiResponseDTO, User } from "@/types"
import {
    useAppDispatch,
    useTypedSelector,

    useAuthActions,

    setIsLoggedIn,
    setAccessToken,
    setRefreshToken,
    setAuthUser,
} from '@/redux'

interface Errors {
    [key: string]: string | undefined
}

const errorCodes: Errors = {
    wrong_credentials: 'Incorrect credentials. Please try again.',
    invalid_username: 'Invalid username or email address. Please check it and try again.',
    invalid_email: 'Invalid email address. Please check it and try again.',
    incorrect_password: 'Incorrect password. Please try again, or reset your password.',
    empty_username: 'Please provide your username.',
    empty_password: 'Please provide your password.',
    "Login Attempt Failed": 'Incorrect credentials. Please try again.',
    //"Empty request": 'Name or password not provided.',
}

export const useAuth = () => {
    // Hooks
    const { httpPostWithData, httpGetRequest } = useAxios()
    const { getTheCookie, setTheCookie, deleteTheCookie } = useCookies()
    const router = useRouter()

    // Redux
    const dispatch = useAppDispatch()
    const { fetchIsLoggedInStatus } = useAuthActions()

    // Variables
    const [errorMsg, setErrorMsg] = useState<string>('')
    const [status, setStatus] = useState<string>('')

    // Methods
    const saveLoginSuccess = (loginData: any) => {
        if (typeof window !== "undefined") {
            const newAccessToken = loginData.accessToken
            const newAuthUser = loginData.user
            
            setTheCookie("accessToken", newAccessToken)

            dispatch(setAccessToken({ "data": newAccessToken }))
            // dispatch(setRefreshToken({ "data": jwtData.refreshToken }))
            dispatch(setIsLoggedIn({ "data": true }))
            dispatch(setAuthUser({ "data": newAuthUser }))

            router.push("/")
        }

        return true
    }

    const processResult = (fromAction: string, theResult: apiResponseDTO) => {
        if (fromAction != 'login') return false

        setStatus('resolved')
        
        if (theResult.success === true) {
            console.log("User logged in:", theResult.data)
            return saveLoginSuccess(theResult.data)
        }

        console.log("Login failed", theResult)
        alert(theResult.message)
        return false
    }

    const handleLoginSubmit = async (emailInput: string, passwordInput: string): Promise<boolean> => {
        setStatus('resolving')
        let errorData: apiResponseDTO
        let error = false
        // Resetting the errorType triggers another dispatch that resets the error
        // dispatch(setLoginErrorType({ "data": "" }))

        // If name/email or password is empty
        if (!emailInput || !passwordInput) {
            errorData = {
                "success": false,
                "message": "Missing neccesary credentials.",
                "data": false
            }
            error = true
        }

        const loginVariables = {
            "User_Email": emailInput,
            "password": passwordInput
        }
        // Send login variables to the API for authentication
        try {
            if (!error) {
                const data = await httpPostWithData("auth/login", loginVariables)
                return processResult("login", data)
            }
        } catch (e) {
            console.log("useAuth login error", e)
            errorData = {
                "success": false,
                "message": "Login failed. Try again.",
                "data": false
            }
            error = true
        }

        processResult("login", errorData!)
        return false
    }

    const handleLogoutSubmit = async () => {
        deleteTheCookie("accessToken")
        window.location.href = "/sign-in"; // Forces a full page reload
    }
    
    const handleTokenTest = () => {
        dispatch(fetchIsLoggedInStatus())
    }

    // Effects
    useEffect(() => {
        if (typeof window !== "undefined") {
            // deleteTheCookie("accessToken")
            // console.log("useAuth loginstatus")
            // if (window.localStorag.getItem("isLoggedIn")) {
            if (getTheCookie("accessToken")) {
                const accessToken = getTheCookie("accessToken")
                // console.log("window.local true")
                dispatch(setAccessToken({ "data": accessToken }))
                dispatch(setIsLoggedIn({ "data": true }))
                handleTokenTest()
            } else {
                // console.log("window.local false")
                dispatch(setAccessToken({ "data": "" }))
                dispatch(setIsLoggedIn({ "data": false }))
            }
        }
    }, [])

    return {
        saveLoginSuccess,
        handleLoginSubmit,
        handleLogoutSubmit,
        errorMsg,
        status,
    }
}