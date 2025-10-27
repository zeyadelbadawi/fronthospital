"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import { isRouteAllowed, getRedirectPath, isLoginRoute, getDashboardRoute } from "@/config/routes-config"

/**
 * Universal authentication and authorization hook
 * Handles token validation, refresh, role checking, and redirects
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

    const isClientSubdomain = typeof window !== "undefined" && window.location.hostname.startsWith("client.")

    // If this is a login route and user is logged in, redirect to dashboard
    if (userData && isLoginRoute(pathname)) {
      const dashboardRoute = getDashboardRoute(userData.role)
      router.replace(dashboardRoute)
      setIsAuthorized(false)
      return
    }

    if (userData?.role === "patient" && isClientSubdomain) {
      setIsAuthorized(true)
      return
    }

    if (userData?.role === "patient" && !isClientSubdomain) {
      if (typeof window !== "undefined") {
        const protocol = window.location.protocol
        const hostname = window.location.hostname
        const port = window.location.port ? `:${window.location.port}` : ""
        const clientPortalUrl = `${protocol}//client.${hostname}${port}${pathname}`
        window.location.href = clientPortalUrl
      }
      setIsAuthorized(false)
      return
    }

    // Check if route is allowed for user's role
    const allowed = isRouteAllowed(pathname, userData?.role)

    if (!allowed) {
      // Redirect to appropriate page
      const redirectPath = getRedirectPath(userData?.role)
      router.replace(redirectPath)
      setIsAuthorized(false)
    } else {
      setIsAuthorized(true)
    }
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
      setUser(null)
      router.push("/sign-in")
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
