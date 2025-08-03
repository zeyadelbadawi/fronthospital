"use client"
import { useEffect } from "react"
import { CheckCircle, AlertCircle, X } from "lucide-react"
import styles from "../styles/toast.module.css"

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className={styles.toastIcon} />
      case "error":
        return <AlertCircle className={styles.toastIcon} />
      default:
        return null
    }
  }

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      {getIcon()}
      <span className={styles.toastMessage}>{message}</span>
      <button className={styles.closeButton} onClick={onClose}>
        <X className={styles.closeIcon} />
      </button>
    </div>
  )
}

export default Toast
