"use client"

// External
import { Provider } from 'react-redux'

// Internal
import { LayoutController } from "@/core-ui/"

// Providers
import appStore from '@/redux/store'
import { TranslationProvider } from '@/contexts/TranslationContext'

export default async function Providers({
    children
}: {
    children: React.ReactNode
}) {    
    return (
        <>
            <Provider store={appStore(undefined)}>
                <TranslationProvider>
                    <LayoutController>
                        {children}
                    </LayoutController>
                </TranslationProvider>
            </Provider>
        </>
    )
}