"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Shield, LogOut } from "lucide-react"
import {
  isAuthenticatedOptimized,
  hasSchoolAccessOptimized,
  getCurrentUserOptimized,
  logoutOptimized,
} from "../utils/auth-utils-optimized"
import styles from "../styles/access-control.module.css"

const AccessControlOptimized = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    hasAccess: false,
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // OPTIMIZED: Single authentication check with caching
    const checkAuthenticationOptimized = () => {
      try {
        const isAuth = isAuthenticatedOptimized()
        const hasAccess = hasSchoolAccessOptimized()
        const user = getCurrentUserOptimized()


        setAuthState({
          isAuthenticated: isAuth,
          hasAccess: hasAccess,
          user: user,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error("Authentication check failed:", error)
        setAuthState({
          isAuthenticated: false,
          hasAccess: false,
          user: null,
          loading: false,
          error: error.message,
        })
      }
    }

    checkAuthenticationOptimized()
  }, [])

  const handleLogout = () => {
    logoutOptimized()
  }

  if (authState.loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Verifying access permissions...</p>
      </div>
    )
  }

  if (authState.error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} />
        <h2>Authentication Error</h2>
        <p>There was an error verifying your authentication: {authState.error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    return (
      <div className={styles.accessDeniedContainer}>
        <div className={styles.accessDeniedCard}>
          <Shield className={styles.accessDeniedIcon} />
          <h2>Authentication Required</h2>
          <p>You need to be logged in to access the School Evaluation System.</p>
          <button onClick={() => (window.location.href = "/login")} className={styles.loginButton}>
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!authState.hasAccess) {
    return (
      <div className={styles.accessDeniedContainer}>
        <div className={styles.accessDeniedCard}>
          <AlertCircle className={styles.accessDeniedIcon} />
          <h2>Access Restricted</h2>
          <p>The School Evaluation System is restricted to administrators and doctors only.</p>
          <div className={styles.userInfo}>
            <p>
              <strong>Current User:</strong> {authState.user?.name || "Unknown"}
            </p>
            <p>
              <strong>Role:</strong> {authState.user?.role || "Unknown"}
            </p>
          </div>
          <div className={styles.actionButtons}>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogOut className={styles.buttonIcon} />
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  // User has access, render children
  return <>{children}</>
}

export default AccessControlOptimized
