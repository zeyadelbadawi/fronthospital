"use client"

import { useContext } from "react"
import { ModelContextInst } from "@/contexts/ModelContext"
import styles from "@/styles/modal.module.css"

export default function DeleteModel({ closeFun, title, children }) {
  const { showDeleteModal } = useContext(ModelContextInst)

  return (
    <div className={`${styles.modalOverlay} ${showDeleteModal ? styles.show : ""}`}>
      <div className={`${styles.modal} ${styles.deleteModal}`}>
        <div className={`${styles.modalHeader} ${styles.deleteHeader}`}>
          <div className={styles.modalTitleContainer}>
            <svg
              className={`${styles.modalIcon} ${styles.deleteIcon}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <h5 className={styles.modalTitle}>{title}</h5>
          </div>
          <button type="button" className={styles.closeButton} onClick={closeFun}>
            <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
