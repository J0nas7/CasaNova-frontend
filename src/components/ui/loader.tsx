import React from 'react'

export const Loading = () => {
    return (
        <div className="flex flex-col gap-4 justify-center items-center">
            <img
                src="/red-spinner.gif"
                alt="Loading..."
                className="w-10 h-10"
            />
            <p className="text-gray-500 text-center">Loading...</p>
        </div>
    )
}
