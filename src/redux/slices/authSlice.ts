// External
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

// Internal
import { RootState } from '@/redux/store'
import { User } from '@/types'

export interface AuthState {
    isLoggedIn: boolean | undefined,
    adminLoggedIn: string,
    authUser: User | undefined,
    accessToken: string,
    refreshToken: string,
    loginResponse: Object,
    axiosGet: string,
}

const initialState = {
    isLoggedIn: undefined,
    adminLoggedIn: '',
    authUser: undefined,
    accessToken: '',
    refreshToken: '',
    loginResponse: {},
    axiosGet: '',
} as AuthState

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setIsLoggedIn: (state: AuthState, action: PayloadAction<any>) => {
            state.isLoggedIn = action.payload.data
        },
        setAuthUser: (state: AuthState, action: PayloadAction<any>) => {
            state.authUser = action.payload.data
        },
        setAccessToken: (state: AuthState, action: PayloadAction<any>) => {
            state.accessToken = action.payload.data
        },
        setRefreshToken: (state: AuthState, action: PayloadAction<any>) => {
            state.refreshToken = action.payload.data
        },
        setLoginResponse: (state: AuthState, action: PayloadAction<any>) => {
            state.loginResponse = action.payload.data
        },
        setAxiosGet: (state: AuthState, action: PayloadAction<any>) => {
            state.axiosGet = action.payload.data
        },
    }
})

const { actions } = authSlice
export const {
    setIsLoggedIn,
    setAuthUser,
    setAccessToken,
    setRefreshToken,
    setLoginResponse,
    setAxiosGet
} = actions

export default authSlice.reducer

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn
export const selectAuthUser = (state: RootState) => state.auth.authUser
export const selectAccessToken = (state: RootState) => state.auth.accessToken
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken
export const selectLoginResponse = (state: RootState) => state.auth.loginResponse
export const selectAxiosGet = (state: RootState) => state.auth.axiosGet