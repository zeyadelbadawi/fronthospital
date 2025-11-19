"use client"
import { useContext, useState, useEffect } from "react"
import { ModelContextInst } from "@/contexts/ModelContext"
import axiosInstance from "@/helper/axiosSetup"
import Loader from "@/components/Loader"
import styles from "@/styles/modal.module.css" // Assuming modal.module.css has the necessary styles
import toastStyles from "@/styles/toast.module.css" // Import toast styles

export default function DeleteAppointment({ currentId, onSuccess }) {
  const { isLoading, setIsLoading, closeDeleteModal } = useContext(ModelContextInst)
  const [assignedStudentsCount, setAssignedStudentsCount] = useState(0)
  const [assignedStudents, setAssignedStudents] = useState([])

  // Toast state
  const [toastMessage, setToastMessage] = useState({ type: "", message: "", visible: false })

  // Toast function
  const showToast = (type, message) => {
    setToastMessage({ type, message, visible: true })
    setTimeout(() => {
      setToastMessage((prev) => ({ ...prev, visible: false }))
    }, 3000) // Hide after 3 seconds
  }

  // Fetch assigned students count when component mounts or currentId changes
  useEffect(() => {
    const fetchAssignedStudents = async () => {
      if (!currentId) return

      try {
        const response = await axiosInstance.get(`/appointments/assigned-students/${currentId}`)
        setAssignedStudentsCount(response.data.count)
        setAssignedStudents(response.data.students)
      } catch (error) {
        console.error("Error fetching assigned students:", error)
        setAssignedStudentsCount(0)
        setAssignedStudents([])
        showToast(
          "error",
          `Error fetching assigned students for warning: ${error.response?.data?.error || error.message}`,
        )
      }
    }

    fetchAssignedStudents()
  }, [currentId])

  const onDelete = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.delete(`/appointments/${currentId}`)
      if (response.status === 200) {
        onSuccess()
        closeDeleteModal() // Close modal on success
        showToast("success", "Appointment deleted successfully!")
      }
    } catch (error) {
      console.error("Error deleting appointment:", error.response ? error.response.data.error : error.message)
      showToast("error", "Error deleting appointment: " + (error.response ? error.response.data.error : error.message))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.modalBody}>
      {/* Toast Notification */}
      {toastMessage.visible && (
        <div className={`${toastStyles.toast} ${toastStyles[toastMessage.type]}`}>{toastMessage.message}</div>
      )}

      <div className={styles.deleteConfirmation}>
        <div className={styles.deleteIconContainer}>
          <svg className={styles.deleteIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <h3 className={styles.deleteTitle}>Delete Appointment</h3>
        <p className={styles.deleteMessage}>
          Are you sure you want to delete this appointment? This action cannot be undone.
        </p>
        {assignedStudentsCount > 0 && (
          <p className={styles.deleteWarning}>
            This appointment currently has <span className={styles.highlight}>{assignedStudentsCount}</span> assigned
            student(s). If you delete it, these students will be unassigned from this appointment.
          </p>
        )}
        {assignedStudentsCount > 0 && (
          <div className={styles.assignedStudentsList}>
            <h4>Assigned Students:</h4>
            <ul>
              {assignedStudents.map((student) => (
                <li key={student.patientId._id}>
                  {student.patientId.name} ({student.patientId.email})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.modalFooter}>
        <button type="button" className={styles.cancelButton} onClick={closeDeleteModal} disabled={isLoading}>
          <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel
        </button>
        <button
          type="button"
          className={`${styles.deleteButton} ${isLoading ? styles.loadingButton : ""}`}
          onClick={onDelete}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </>
          )}
        </button>
      </div>
    </div>
  )
}
