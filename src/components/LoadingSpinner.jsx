"use client"
import { useLoading } from "@/contexts/LoadingContext"
import styles from "@/styles/loading-spinner.module.css"

export default function LoadingSpinner() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className={styles.spinnerOverlay}>
      <div className={styles.spinnerContent}>
        <img src="/images/rukn-logo.png" alt="Rukn Alwatekon Center Logo" className={styles.spinnerLogo} />
        <div className={styles.loadingText}>Loading...</div>
      </div>
    </div>
  )
}
