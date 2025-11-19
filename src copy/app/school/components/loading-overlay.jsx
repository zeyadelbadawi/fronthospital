"use client"

import styles from "../styles/loading-overlay.module.css"

export function LoadingOverlay({ isVisible, message = "Processing..." }) {
  if (!isVisible) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.spinner}></div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  )
}
