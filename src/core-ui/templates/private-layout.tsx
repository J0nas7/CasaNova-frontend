// External
import React from "react";

// Internal
import { Footer, Header } from "../";

export const PrivateLayout = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <div className="layout-container">
            <Header />
            <div className="content-wrapper">
                <Footer />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};
