"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"

const SessionContext = createContext()

export function SessionProvider({ children }) {
    const router = useRouter()
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
    const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(false)

    const sessionTimeoutRef = useRef(null)
    const warningTimeoutRef = useRef(null)

    const SESSION_TIMEOUT = 5 * 60 * 1000 // 5 minutes
    const WARNING_TIME = 1 * 60 * 1000 // Show warning 1 minute before timeout

    // Handle session timeout
    const handleSessionTimeout = useCallback(async () => {
        try {
            await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/logout`)
        } catch (error) {
            console.error("Logout error:", error)
        }

        localStorage.removeItem("token")
        setShowTimeoutWarning(false)

        // Redirect to appropriate sign-in page
        const isStaffSubdomain = typeof window !== "undefined" && window.location.hostname.startsWith("stuff.")
        const redirectUrl = isStaffSubdomain ? "/sign-in" : "/clientportal"
        router.push(redirectUrl)
    }, [router])

    // Reset session timer
    const resetSessionTimer = useCallback(() => {
        if (sessionTimeoutRef.current) {
            clearTimeout(sessionTimeoutRef.current)
        }
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current)
        }

        // Hide warning if it was showing
        setShowTimeoutWarning(false)

        // Set new session timeout
        sessionTimeoutRef.current = setTimeout(() => {
            handleSessionTimeout()
        }, SESSION_TIMEOUT)

        // Set warning timer (show warning 1 minute before timeout)
        warningTimeoutRef.current = setTimeout(() => {
            setShowTimeoutWarning(true)
        }, SESSION_TIMEOUT - WARNING_TIME)
    }, [SESSION_TIMEOUT, WARNING_TIME, handleSessionTimeout])

    // Extend session
    const extendSession = useCallback(() => {
        setShowTimeoutWarning(false)
        resetSessionTimer()
    }, [resetSessionTimer])

    // Initialize session timer on mount
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            resetSessionTimer()
        }

        // Track user activity
        const events = ["mousedown", "keydown", "scroll", "touchstart", "click"]

        const handleActivity = () => {
            if (token && !keepMeLoggedIn) {
                resetSessionTimer()
            }
        }

        events.forEach((event) => {
            document.addEventListener(event, handleActivity, true)
        })

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleActivity, true)
            })
            if (sessionTimeoutRef.current) {
                clearTimeout(sessionTimeoutRef.current)
            }
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current)
            }
        }
    }, [resetSessionTimer, keepMeLoggedIn])

    return (
        <SessionContext.Provider
            value={{
                showTimeoutWarning,
                extendSession,
                handleSessionTimeout,
                keepMeLoggedIn,
                setKeepMeLoggedIn,
            }}
        >
            {children}
        </SessionContext.Provider>
    )
}

export function useSession() {
    const context = useContext(SessionContext)
    if (!context) {
        throw new Error("useSession must be used within SessionProvider")
    }
    return context
}
