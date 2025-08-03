"use client"

import { useContext } from "react"
import { ModelContextInst } from "@/contexts/ModelContext"
import styles from "@/styles/modal.module.css"

export default function UpdateModel({ closeFun, title, children }) {
  const { showUpdateModal } = useContext(ModelContextInst)

  return (
    <div className={`${styles.modalOverlay} ${showUpdateModal ? styles.show : ""}`}>
      <div className={styles.modal}>
        <div className={`${styles.modalHeader} ${styles.updateHeader}`}>
          <div className={styles.modalTitleContainer}>
            <svg
              className={`${styles.modalIcon} ${styles.updateIcon}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
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
