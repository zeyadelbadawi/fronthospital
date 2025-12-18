"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import { getRedirectPath, isLoginRoute, getDashboardRoute } from "@/config/routes-config"
import {
  isStaffSubdomain,
  redirectToCorrectDomain,
  getErrorPageUrl,
  validateRouteAccess,
} from "@/utils/subdomain-utils"

/**
 * Universal authentication and authorization hook
 * Handles token validation, refresh, role checking, redirects, and subdomain routing
 *
 * @returns {Object} - { user, loading, isAuthorized, logout }
 */
export function useRoleBasedAuth() {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  /**
   * Load user profile from API
   */
  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      setLoading(false)
      return null
    }

    try {
      const res = await axiosInstance.get("/authentication/profile")
      const userData = res.data

      // Store user data in localStorage for other components
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch (err) {
      // Try to refresh token if expired
      if (err.response?.status === 403) {
        try {
          const refreshRes = await axiosInstance.post("/authentication/refresh")
          localStorage.setItem("token", refreshRes.data.accessToken)

          // Retry profile fetch
          const retryRes = await axiosInstance.get("/authentication/profile")
          const userData = retryRes.data

          localStorage.setItem("user", JSON.stringify(userData))
          setUser(userData)
          return userData
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          return null
        }
      } else {
        console.error("Profile loading failed:", err)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        return null
      }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Check authorization and handle redirects
   */
  const checkAuthorization = useCallback(async () => {
    const userData = await loadProfile()
    const onStaffSubdomain = isStaffSubdomain()

    // If this is a login route and user is logged in, redirect to dashboard
    if (userData && isLoginRoute(pathname)) {
      const dashboardRoute = getDashboardRoute(userData.role)
      router.replace(dashboardRoute)
      setIsAuthorized(false)
      return
    }

    const validation = validateRouteAccess(pathname, userData?.role)

    if (!validation.isValid) {
      if (validation.reason === "not_authenticated") {
        // Unauthenticated user trying to access protected route
        router.replace(getErrorPageUrl())
        setIsAuthorized(false)
        return
      }

      if (validation.reason === "patient_on_staff_domain") {
        // Patient trying to access staff subdomain
        redirectToCorrectDomain("patient", "/clientportal")
        setIsAuthorized(false)
        return
      }

      if (validation.reason === "staff_on_main_domain") {
        // Staff trying to access main domain
        redirectToCorrectDomain(userData?.role, getDashboardRoute(userData?.role))
        setIsAuthorized(false)
        return
      }

      if (validation.reason === "client_route_on_staff_domain" || validation.reason === "staff_route_on_main_domain") {
        // Cross-domain route access attempt
        router.replace("/not-found")
        setIsAuthorized(false)
        return
      }

      // Generic unauthorized access
      const redirectPath = getRedirectPath(userData?.role)
      router.replace(redirectPath)
      setIsAuthorized(false)
      return
    }

    setIsAuthorized(true)
  }, [pathname, router, loadProfile])

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/authentication/logout")
    } catch (err) {
      console.error("Logout failed:", err)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")

      // Clear any lockout data
      const lockoutKeys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("lockout_")) {
          lockoutKeys.push(key)
        }
      }
      lockoutKeys.forEach((key) => localStorage.removeItem(key))

      // Clear state immediately
      setUser(null)
      setIsAuthorized(false)

      // Redirect based on subdomain
      if (isStaffSubdomain()) {
        router.push("/sign-in")
      } else {
        router.push("/clientportal")
      }
    }
  }, [router])

  // Run authorization check on mount and pathname change
  useEffect(() => {
    checkAuthorization()
  }, [checkAuthorization])

  return {
    user,
    loading,
    isAuthorized,
    logout,
  }
}
