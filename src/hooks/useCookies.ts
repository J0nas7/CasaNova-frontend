// External
import { getCookie, setCookie, deleteCookie, getCookies } from 'cookies-next'

export const useCookies = () => {
    const getTheCookie = (name: string) => {
        return getCookie(name)
    }

    const deleteTheCookie = (name: string) => {
        return deleteCookie(name)
    }

    const getAllTheCookies = () => {
        return getCookies()
    }

    const setTheCookie = (name: string, value: string) => {
        setCookie(name, value, {
            httpOnly: false,//true
            secure: process.env.NODE_ENV !== "development",
            maxAge: 60 * 60 * 24,
            sameSite: false,//"strict",
            path: '/',
        })
    }

    return {
        getTheCookie,
        setTheCookie,
        deleteTheCookie,
    }
}