"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const BankTransferAccessControl = ({ children }) => {
  const router = useRouter()

  useEffect(() => {
    const checkAccess = () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.replace("/error")
        return
      }

      try {
        // Decode JWT token to get user role
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        )
        const decoded = JSON.parse(jsonPayload)

        // Only admin and accountant can access bank transfer payments
        const allowedRoles = ["admin", "accountant", "HeadDoctor"]
        if (!allowedRoles.includes(decoded.role)) {
          router.replace("/error")
          return
        }
      } catch (error) {
        console.error("Error checking access:", error)
        router.replace("/error")
      }
    }

    checkAccess()
  }, [router])

  // Don't render anything while checking - this prevents any flash of content
  return null
}

export default BankTransferAccessControl
