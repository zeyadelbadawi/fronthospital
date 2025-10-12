"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"

export function usePatientAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Allowed routes for patients
  const allowedPatientRoutes = [
    "/clientportal",
    "/Book-Appointment",
    "/student-calendar",
    "/financial-records",
    "/profile",
    "/clientportal/forgot-password",
    "/clientportal/reset-password",
  ]

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return null
    }

    try {
      const res = await axiosInstance.get("/authentication/profile")
      setUser(res.data)
      return res.data
    } catch (err) {
      if (err.response?.status === 403) {
        try {
          const r = await axiosInstance.post("/authentication/refresh")
          localStorage.setItem("token", r.data.accessToken)
          const retry = await axiosInstance.get("/authentication/profile")
          setUser(retry.data)
          return retry.data
        } catch (refreshError) {
          localStorage.removeItem("token")
          return null
        }
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (loading) return

    // Check if current route is in allowed list
    const isAllowedRoute = allowedPatientRoutes.some((route) => pathname.startsWith(route))

    // If user is not logged in or not a patient, and trying to access protected routes
    if (!isAllowedRoute && (!user || user.role !== "patient")) {
      router.push("/not-found")
    }
  }, [user, loading, pathname, router, allowedPatientRoutes])

  const handleLogout = useCallback(async () => {
    try {
      await axiosInstance.post("/authentication/logout")
      localStorage.removeItem("token")
      setUser(null)
      router.push("/clientportal")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }, [router])

  return {
    user,
    loading,
    loadProfile,
    handleLogout,
  }
}
