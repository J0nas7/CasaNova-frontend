// External
import { configureStore, PreloadedStateShapeFromReducersMapObject } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'

// Internal
import authSlice from '@/redux/slices/authSlice'

const rootReducer = combineReducers({
    auth: authSlice
})

export const appReducer = (state:any, action:any) => {
    if (action.type === 'RESET_APP') {
      console.log("R E S E T")
      state = undefined
    }
    return rootReducer(state, action)
}

const appStore = (preloadedState?: PreloadedStateShapeFromReducersMapObject<RootState>) =>
    configureStore({
        reducer: appReducer,
        preloadedState,
    })

export default appStore

export type RootState = ReturnType<typeof appReducer>
export type AppStore = ReturnType<typeof appStore>
export type AppDispatch = AppStore["dispatch"]