"use client"

import { convertUTCTo12Hour } from "@/helper/DateTime"
import styles from "@/styles/warning-modal.module.css"

export default function PatientAssignmentWarningModal({
  show,
  onClose,
  onProceed,
  patientName,
  existingAppointments = [],
  totalConflicts = 0,
}) {
  if (!show || !existingAppointments || existingAppointments.length === 0) return null

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
            <h5 className={styles.modalTitle}>Multiple Assignment Conflicts</h5>
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

            <h3 className={styles.warningTitle}>Assignment Conflicts Detected</h3>
            <p className={styles.warningMessage}>
              <strong>{patientName}</strong> is already assigned to <strong>{totalConflicts}</strong> other appointment
              {totalConflicts > 1 ? "s" : ""} in the <strong>{existingAppointments[0]?.department}</strong> department.
            </p>

            <div className={styles.conflictSummary}>
              <div className={styles.conflictCount}>
                {totalConflicts} Existing Assignment{totalConflicts > 1 ? "s" : ""}
              </div>
              <div className={styles.conflictDescription}>Review the conflicting appointments below</div>
            </div>

            <div className={styles.appointmentsContainer}>
              {existingAppointments.map((appointmentData, index) => {
                const appointment = appointmentData.appointment
                return (
                  <div key={appointmentData.assignmentId} className={styles.appointmentCard}>
                    <div className={styles.appointmentHeader}>
                      <h4 className={styles.appointmentTitle}>
                        <span className={styles.appointmentIndex}>{index + 1}</span>
                        Existing Appointment
                      </h4>
                    </div>

                    <div className={styles.appointmentDetails}>
                     
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Day:</span>
                        <span className={styles.detailValue}>{appointment?.day || "N/A"}</span>
                      </div>

                      <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                        <span className={styles.detailLabel}>Time:</span>
                        <span className={styles.detailValue}>
                          {appointment?.start_time && appointment?.end_time
                            ? `${convertUTCTo12Hour(appointment.start_time)} - ${convertUTCTo12Hour(appointment.end_time)}`
                            : "N/A"}
                        </span>
                      </div>

                      <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                        <span className={styles.detailLabel}>Department:</span>
                        <span className={styles.detailValue}>{appointmentData.department}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className={styles.warningMessage}>
              Do you want to proceed and assign this Student to the current appointment? This will create{" "}
              {totalConflicts > 1 ? "additional duplicate assignments" : "a duplicate assignment"} in the same
              department.
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
          <button type="button" className={styles.proceedButton} onClick={onProceed}>
            <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  )
}
