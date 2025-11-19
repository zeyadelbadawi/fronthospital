"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, hasSchoolAccess } from "../utils/auth-utils"

const AccessControl = ({ children }) => {
  const router = useRouter()

  useEffect(() => {
    const checkAccess = () => {
      const authenticated = isAuthenticated()
      const schoolAccess = hasSchoolAccess()

      // If not authenticated or doesn't have school access, redirect immediately
      if (!authenticated || !schoolAccess) {
        router.replace("/error")
        return
      }
    }

    checkAccess()
  }, [router])

  // Don't render anything while checking - this prevents any flash of content
  return null
}

export default AccessControl
