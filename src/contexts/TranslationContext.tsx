"use client"

// External
import React, { createContext, ReactNode, useContext } from "react"

// Internal
import { useTranslation, I18nextProvider, UseTranslationResponse } from "react-i18next";
import i18n from "@/app/lib/i18n"

const TranslationContext = createContext<UseTranslationResponse<string, undefined> | undefined>(undefined);

export const TranslationProvider = ({
    children,
}: {
    children: ReactNode
}) => {
    return (
        <I18nextProvider i18n={i18n}>
            <TranslationContext.Provider value={useTranslation()}>
                {children}
            </TranslationContext.Provider>
        </I18nextProvider>
    )
}

export const useTranslations = () => {
    const context = useContext(TranslationContext)
    if (!context) {
        throw new Error("useTranslations must be used within a TranslationProvider")
    }
    return context
}
