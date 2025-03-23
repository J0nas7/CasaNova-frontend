// External
import React from "react"
import type { Metadata } from "next"

// Internal
import Providers from "@/core-ui/providers"

// Global CSS
import "@/core-ui/styles/global/Tailwind.scss"
import "@/core-ui/styles/global/Global.scss"
import "@/core-ui/styles/global/Button.scss"
import "@/core-ui/styles/global/Layout.scss"
import "@/core-ui/styles/global/Guest.scss"
import "@/core-ui/styles/global/TaskPlayer.scss";
import "@/core-ui/styles/global/Flexible-Box.scss"

export const metadata: Metadata = {
    title: {
        default: "CasaNova - Find Your New Home",
        template: "CasaNova - %s", // Automatically adds "CasaNova | " as a prefix
    },
    description: "CasaNova is a great way to find your new home. We provide a platform for you to find your dream home.",
    keywords: ["CasaNova", "Home", "Real Estate", "Property", "Rent", "Buy", "Sell"]
}

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode,
    params: { locale: string }
}>) {
    return (
        <html lang={params.locale || "en-US"}>
            <body className={`font-sans`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
