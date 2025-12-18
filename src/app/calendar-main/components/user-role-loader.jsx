"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import { getCurrentUser, isAuthenticated } from "../utils/auth-utils"
import styles from "../styles/loading.module.css"

const UserRoleLoader = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is authenticated first
        if (!isAuthenticated()) {
          setLoading(false)
          return
        }

        // Get user from token
        const tokenUser = getCurrentUser()
        if (!tokenUser) {
          setLoading(false)
          return
        }

        // Fetch full user data from API
        const token = localStorage.getItem("token")
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const userData = response.data
        setUser({
          ...userData,
          role: userData.role || tokenUser.role,
          username: userData.username || tokenUser.username,
        })
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user data:", error)

        if (error.response) {
          const status = error.response.status
          const message = error.response.data?.message || ""

          // Session timeout or token revoked
          if (
            status === 401 &&
            (message.includes("Session expired") || message.includes("terminated") || message.includes("revoked"))
          ) {
            localStorage.removeItem("token")

            // Determine redirect based on subdomain
            const isStaffSubdomain = typeof window !== "undefined" && window.location.hostname.startsWith("stuff.")
            const redirectUrl = isStaffSubdomain ? "/sign-in" : "/sign-in"

            // Show user-friendly message
            setError(message)

            // Redirect after 2 seconds
            setTimeout(() => {
              router.push(redirectUrl)
            }, 2000)

            setLoading(false)
            return
          }
        }

        setError("Failed to load user data")
        setLoading(false)

        // Handle token refresh if needed
        if (error.response && error.response.status === 403) {
          try {
            const refreshResponse = await axiosInstance.post(
              `${process.env.NEXT_PUBLIC_API_URL}/authentication/refresh`,
              {},
              {
                withCredentials: true,
              },
            )
            const newAccessToken = refreshResponse.data.accessToken
            localStorage.setItem("token", newAccessToken)

            // Retry fetching user data
            const retryResponse = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`, {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            })

            const userData = retryResponse.data
            setUser({
              ...userData,
              role: userData.role,
            })
            setLoading(false)
            setError(null)
          } catch (refreshError) {
            console.error("Refresh token failed:", refreshError)
            setError("Session expired. Please login again.")

            setTimeout(() => {
              const isStaffSubdomain = typeof window !== "undefined" && window.location.hostname.startsWith("stuff.")
              router.push(isStaffSubdomain ? "/sign-in" : "/sign-in")
            }, 2000)

            setLoading(false)
          }
        }
      }
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading Calendar...</div>
        <div className={styles.loadingSubtext}>Please wait while we prepare your schedule</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText} style={{ color: "#ef4444" }}>
          {error}
        </div>
        <div className={styles.loadingSubtext}>
          {error.includes("Session expired") || error.includes("terminated")
            ? "Redirecting to login..."
            : "Please refresh the page or try again later"}
        </div>
      </div>
    )
  }

  return children({ user, loading })
}

export default UserRoleLoader
