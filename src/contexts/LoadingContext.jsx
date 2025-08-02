    "use client"

    import React, { createContext, useContext, useState, useEffect } from "react"

    const LoadingContext = createContext(null)

    export function LoadingProvider({ children }) {
    const [isLoading, setIsLoading] = useState(true) // Start as true for initial load
    const [loadingTimer, setLoadingTimer] = useState(null)

    // On initial mount, hide the spinner after a short delay
    useEffect(() => {
        const timer = setTimeout(() => {
        setIsLoading(false)
        }, 300) // Minimum 300ms display time for initial load
        setLoadingTimer(timer)
        return () => clearTimeout(timer)
    }, [])

    const startLoading = () => {
        // Clear any existing timer to ensure the spinner stays visible
        if (loadingTimer) {
        clearTimeout(loadingTimer)
        setLoadingTimer(null)
        }
        setIsLoading(true)
    }

    const stopLoading = () => {
        // Ensure spinner is visible for a minimum duration before hiding
        const timer = setTimeout(() => {
        setIsLoading(false)
        }, 300) // Minimum 300ms display time for navigation
        setLoadingTimer(timer)
    }

    const contextValue = React.useMemo(
        () => ({
        isLoading,
        startLoading,
        stopLoading,
        }),
        [isLoading, loadingTimer], // Include loadingTimer in dependencies
    )

    return <LoadingContext.Provider value={contextValue}>{children}</LoadingContext.Provider>
    }

    export function useLoading() {
    const context = useContext(LoadingContext)
    if (!context) {
        throw new Error("useLoading must be used within a LoadingProvider")
    }
    return context
    }
