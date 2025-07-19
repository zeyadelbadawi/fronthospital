"use client"

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import styles from "../styles/confirmation-modal.module.css"

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <XCircle className={styles.icon} />
      case "success":
        return <CheckCircle className={styles.icon} />
      default:
        return <AlertTriangle className={styles.icon} />
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          {getIcon()}
          <h3 className={styles.title}>{title}</h3>
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button onClick={onClose} className={`${styles.button} ${styles.secondary}`} disabled={isLoading}>
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.button} ${styles.primary} ${styles[type]}`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
