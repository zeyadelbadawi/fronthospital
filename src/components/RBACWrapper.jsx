"use client"

import { useRoleBasedAuth } from "@/hooks/useRoleBasedAuth"
import styles from "@/styles/RBACWrapper.module.css"

/**
 * RBAC Wrapper Component
 * Wraps pages that need role-based access control
 * Shows loading state and prevents rendering until authorization is confirmed
 * Includes subdomain validation
 *
 * @param {Object} props
 * @param {React.ReactNode|Function} props.children - Page content to render if authorized (can be a render prop function)
 * @param {string} props.loadingMessage - Optional custom loading message
 */
export default function RBACWrapper({ children, loadingMessage = "Loading..." }) {
  const { user, loading, isAuthorized, logout } = useRoleBasedAuth()

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>{loadingMessage}</p>
      </div>
    )
  }

  // The redirect happens in the hook, so we just return null here
  if (!isAuthorized) {
    return null
  }

  // If children is a function, call it with user and handleLogout
  // Otherwise, render children directly
  return <>{typeof children === "function" ? children({ user, handleLogout: logout }) : children}</>
}
