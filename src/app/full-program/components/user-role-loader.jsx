"use client"
import styles from "../styles/globals.module.css"

export default function UserRoleLoader() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p>Loading user information...</p>
    </div>
  )
}
