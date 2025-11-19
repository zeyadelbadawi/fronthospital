"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"
import styles from "../styles/toast.module.css"

export function Toast({ message, type = "success", duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className={styles.icon} />
      case "error":
        return <XCircle className={styles.icon} />
      case "warning":
        return <AlertCircle className={styles.icon} />
      default:
        return <CheckCircle className={styles.icon} />
    }
  }

  return (
    <div className={`${styles.toast} ${styles[type]} ${isVisible ? styles.show : ""}`}>
      <div className={styles.content}>
        {getIcon()}
        <span className={styles.message}>{message}</span>
        <button onClick={handleClose} className={styles.closeButton}>
          <X className={styles.closeIcon} />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = "success", duration = 4000) => {
    const id = Date.now()
    const toast = { id, message, type, duration }
    setToasts((prev) => [...prev, toast])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const ToastContainer = () => (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )

  return {
    showToast,
    ToastContainer,
  }
}
