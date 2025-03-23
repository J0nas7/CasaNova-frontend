// External
import { Dispatch } from 'redux'

// Internal
import { useAxios, useCookies } from '@/hooks'
import { setAuthUser, setAuthUserOrganisation, setAuthUserSeat, setAuthUserTaskTimeTrack, setIsLoggedIn } from '../slices/authSlice'

export const useAuthActions = () => {
    const { deleteTheCookie } = useCookies()
    const { httpGetRequest, httpPostWithData } = useAxios()

    /**
     * @returns {Function} An asynchronous function to be dispatched, which updates the logged-in status.
     * 
     * @remarks
     * - Makes a GET request to the `userLoggedInTest` endpoint.
     * - If the server indicates the user is logged in:
     *   - Dispatches an action to update the `isLoggedIn` state to `true`.
     *   - Dispatches an action to update the authenticated user's details in the store.
     * - Logs any errors encountered during the request.
     */
    // Fetches the user's logged-in status from the server and updates the Redux store accordingly.
    const fetchIsLoggedInStatus = () => async (dispatch: Dispatch) => {
        try {
            const data = await httpGetRequest("auth/me")
            // console.log("fetchIsLoggedInStatus", data)
            if (
                data && 
                data.userData &&
                data.message === "Is logged in"
            ) {
                // Update the Redux store with the user's logged-in status and details
                // dispatch(setRefreshToken({ "data": jwtData.refreshToken }))
                dispatch(setIsLoggedIn({ "data": true }))
                dispatch(setAuthUser({ "data": data.userData }))
                
                if (Array.isArray(data.userSeats) && data.userSeats.length) {
                    dispatch(setAuthUserSeat({ "data": data.userSeats[0] }))
                }
                
                dispatch(setAuthUserOrganisation({ "data": data.userOrganisation }))
                dispatch(setAuthUserTaskTimeTrack(data.userActiveTimeTrack))
            } else {
                deleteTheCookie("accessToken")
                // Optionally handle the "not logged in" scenario
                dispatch(setIsLoggedIn({ "data": false }))
            }
        } catch (e) {
            console.log("fetchIsLoggedInStatus", e)
        }
    }

    return {
        fetchIsLoggedInStatus,
    }
}