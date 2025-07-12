"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUserRole } from "../utils/auth-utils"
import styles from "../styles/access-control.module.css" // Import the CSS module

const AccessControl = ({ allowedRoles, children, fallback = null }) => {
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = () => {
      const authenticated = isAuthenticated()
      const userRole = getCurrentUserRole()

      if (!authenticated) {
        setHasAccess(false)
      } else if (allowedRoles && !allowedRoles.includes(userRole)) {
        setHasAccess(false)
      } else {
        setHasAccess(true)
      }
      setLoading(false)
    }

    checkAccess()
  }, [allowedRoles])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading content...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return fallback
    }

    const authenticated = isAuthenticated()
    const userRole = getCurrentUserRole()

    if (!authenticated) {
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.icon}>🔒</div>
            <h2 className={styles.title}>Authentication Required</h2>
            <p className={styles.message}>Please log in to access this content.</p>
            <button onClick={() => router.push("/sign-in")} className={styles.button}>
              Go to Login
            </button>
          </div>
        </div>
      )
    } else if (allowedRoles && !allowedRoles.includes(userRole)) {
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.icon}>🚫</div>
            <h2 className={styles.title}>Permission Denied</h2>
            <p className={styles.message}>You do not have the necessary permissions to view this page.</p>
            <button onClick={() => router.push("/full-program")} className={styles.button}>
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }
  }

  return children
}

export default AccessControl
