// External
import React from "react";

// Internal
import { Header, Footer } from "../";
import { TaskDetailWithModal } from "@/components/partials/task/TaskDetails";
import { TaskTimeTrackPlayer } from "@/components/partials/task/TaskTimeTrackPlayer";

export const PrivateLayout = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <div className="layout-container">
            {/* <TaskDetailWithModal />
            <TaskTimeTrackPlayer /> */}
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
