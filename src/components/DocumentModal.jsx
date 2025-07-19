"use client"
import { useEffect, useRef } from "react"
import styles from "@/styles/syncfusion-docx.module.css" // Import the custom styles
import { X } from "lucide-react" // Using Lucide React for the close icon

const DocumentModal = ({ isOpen, onClose, title, description, children }) => {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden" // Prevent scrolling background
    } else {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "" // Restore scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={`${styles.modalOverlay} ${isOpen ? styles.open : ""}`} onClick={onClose}>
      <div
        className={styles.modalContent}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{title}</h2>
            {description && <p className={styles.modalDescription}>{description}</p>}
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  )
}

export default DocumentModal
