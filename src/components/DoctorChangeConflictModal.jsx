"use client"

import styles from "@/styles/doctor-change-modal.module.css"

export default function DoctorChangeConflictModal({
  show,
  onClose,
  onKeepStudents,
  onRemoveStudents,
  conflictingStudents = [],
  totalConflicts = 0,
  oldDoctorName = "",
  appointmentDepartment = "",
}) {
  if (!show || !conflictingStudents || conflictingStudents.length === 0) return null

  return (
    <div className={`${styles.modalOverlay} ${show ? styles.show : ""}`}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleContainer}>
            <svg className={styles.modalIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h5 className={styles.modalTitle}>Doctor Change Conflict</h5>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.warningContent}>
            <div className={styles.warningIconContainer}>
              <svg className={styles.warningIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h3 className={styles.warningTitle}>Patient Ownership Conflict</h3>
            <p className={styles.warningMessage}>
              This appointment still has <strong>{totalConflicts}</strong> patient{totalConflicts > 1 ? "s" : ""} which
              belong to <strong>Dr. {oldDoctorName}</strong> in the <strong>{appointmentDepartment}</strong> department.
            </p>

            <div className={styles.conflictSummary}>
              <div className={styles.conflictCount}>
                {totalConflicts} Patient{totalConflicts > 1 ? "s" : ""} Affected
              </div>
              <div className={styles.conflictDescription}>These patients currently belong to Dr. {oldDoctorName}</div>
            </div>

            <div className={styles.studentsContainer}>
              {conflictingStudents.map((student, index) => (
                <div key={student.patientId || index} className={styles.studentItem}>
                  <div className={styles.studentAvatar}>
                    {student.patientName ? student.patientName.charAt(0).toUpperCase() : "P"}
                  </div>
                  <span className={styles.studentName}>{student.patientName || "Unknown Patient"}</span>
                </div>
              ))}
            </div>

            <p className={styles.warningMessage}>
              Do you want to <strong>keep them</strong> in this appointment or <strong>remove them</strong> from this
              appointment?
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button type="button" className={styles.keepButton} onClick={onKeepStudents}>
            <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Keep Them
          </button>
          <button type="button" className={styles.removeButton} onClick={onRemoveStudents}>
            <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"
              />
            </svg>
            Remove Them
          </button>
        </div>
      </div>
    </div>
  )
}
