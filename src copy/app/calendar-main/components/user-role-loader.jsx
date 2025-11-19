"use client"
import { useState, useEffect } from "react"
import axiosInstance from "@/helper/axiosSetup"
import { getCurrentUser, isAuthenticated } from "../utils/auth-utils"
import styles from "../styles/loading.module.css"

const UserRoleLoader = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
            setLoading(false)
          }
        }
      }
    }

    fetchUserData()
  }, [])

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
        <div className={styles.loadingSubtext}>Please refresh the page or try again later</div>
      </div>
    )
  }

  return children({ user, loading })
}

export default UserRoleLoader
