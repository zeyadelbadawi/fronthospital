"use client"

import { useEffect } from "react"
import NProgressBar from "@/components/NProgressBar"
import { SessionProvider } from "@/contexts/SessionContext"
import SessionTimeoutWarning from "@/components/SessionTimeoutWarning"

export default function ClientProviders({ children }) {
  useEffect(() => {
    const initializeCSRF = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8070"
        await fetch(`${API_URL}/health-check`, {
          method: "GET",
          credentials: "include",
        })
      } catch (error) {
        console.error("  Failed to initialize CSRF token:", error)
      }
    }

    initializeCSRF()
  }, [])

  return (
    <>
      <NProgressBar />
      <SessionProvider>
        <SessionTimeoutWarning />
        {children}
      </SessionProvider>
    </>
  )
}
