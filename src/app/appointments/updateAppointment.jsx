"use client"

import { useState, useEffect, useContext } from "react"
import axiosInstance from "@/helper/axiosSetup"
import { generateTimeString } from "@/helper/DateTime"
import { ModelContextInst } from "@/contexts/ModelContext"
import Loader from "@/components/Loader"
import styles from "@/styles/modal.module.css" // Assuming modal.module.css has the necessary styles
import toastStyles from "@/styles/toast.module.css" // Import toast styles

const departments = ["PhysicalTherapy", "ABA", "OccupationalTherapy", "SpecialEducation", "Speech", "ay7aga"]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const isEndTimeAfterStartTime = (startTime, endTime) => {
  if (!startTime || !endTime) return true

  const startHour = Number.parseInt(startTime.split(":")[0])
  const startMinute = Number.parseInt(startTime.split(":")[1])
  const endHour = Number.parseInt(endTime.split(":")[0])
  const endMinute = Number.parseInt(endTime.split(":")[1])

  const startTotalMinutes = startHour * 60 + startMinute
  const endTotalMinutes = endHour * 60 + endMinute

  const timeDifference = endTotalMinutes - startTotalMinutes
  return timeDifference >= 30
}

export default function AppointmentUpdate({ appointmentId, currentData, onSuccess }) {
  const [currentSelection, setCurrentSelection] = useState({
    department: "",
    doctor: "",
    day: "",
    start_time: "",
    end_time: "",
  })
  const [validationErrors, setValidationErrors] = useState([])
  const [doctors, setDoctors] = useState([])
  const [originalDoctorId, setOriginalDoctorId] = useState("")
  const [showDoctorConflictUI, setShowDoctorConflictUI] = useState(false)
  const [doctorChangeConflicts, setDoctorChangeConflicts] = useState(null)
  const { isLoading, setIsLoading, closeUpdateModal } = useContext(ModelContextInst)

  // Toast state
  const [toastMessage, setToastMessage] = useState({ type: "", message: "", visible: false })

  // Toast function
  const showToast = (type, message) => {
    setToastMessage({ type, message, visible: true })
    setTimeout(() => {
      setToastMessage((prev) => ({ ...prev, visible: false }))
    }, 3000) // Hide after 3 seconds
  }

  // Fetch doctors by department (Requirement 3)
  const getDoctorsByDepartment = async (department) => {
    try {
      const response = await axiosInstance.get(`/appointments/doctors-by-department/${department}`)
      setDoctors(response.data.doctors)
    } catch (error) {
      console.error("Error fetching doctors by department:", error)
      setDoctors([])
      showToast("error", `Error fetching doctors: ${error.response?.data?.error || error.message}`)
    }
  }

  useEffect(() => {
    if (currentData) {
      setCurrentSelection(currentData)
      setOriginalDoctorId(currentData.doctor)

      // Fetch doctors for the current department when component mounts
      if (currentData.department) {
        getDoctorsByDepartment(currentData.department)
      }
    }
  }, [currentData])

  // Handle doctor selection change
  const handleDoctorSelectionChange = async (newDoctorId) => {
    // If no original doctor or new doctor is same as old, just update selection
    if (!originalDoctorId || originalDoctorId === newDoctorId) {
      setCurrentSelection((prev) => ({ ...prev, doctor: newDoctorId }))
      setShowDoctorConflictUI(false) // Hide conflict UI if it was shown
      return
    }

    try {
      setIsLoading(true)
      // CORRECTED URL: Changed from /appointments/ to /students-appointment/
      const response = await axiosInstance.get(
        `/students-appointment/check-doctor-change-conflicts/${appointmentId}/${originalDoctorId}/${newDoctorId}`,
      )

      if (response.data.hasConflicts) {
        setDoctorChangeConflicts(response.data)
        setShowDoctorConflictUI(true) // Show conflict UI
        // Do NOT update currentSelection.doctor yet, wait for user decision
      } else {
        // No conflicts, proceed with doctor change
        setCurrentSelection((prev) => ({ ...prev, doctor: newDoctorId }))
        setShowDoctorConflictUI(false)
      }
    } catch (error) {
      console.error("Error checking doctor change conflicts:", error)
      showToast("error", `Error checking doctor change conflicts: ${error.response?.data?.error || error.message}`)
      // If error checking conflicts, proceed with change
      setCurrentSelection((prev) => ({ ...prev, doctor: newDoctorId }))
      setShowDoctorConflictUI(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDoctorChangeAction = async (action) => {
    try {
      setIsLoading(true)
      await axiosInstance.post("/students-appointment/handle-doctor-change", {
        appointmentId: appointmentId,
        conflictingStudentIds: doctorChangeConflicts.conflictingStudents.map((s) => s.patientId),
        action: action,
      })

      // Update the doctor selection after action
      setCurrentSelection((prev) => ({ ...prev, doctor: doctorChangeConflicts.newDoctorId || prev.doctor }))
      setShowDoctorConflictUI(false)
      setDoctorChangeConflicts(null)
      showToast("success", `Doctor change handled: students were ${action === "keep" ? "kept" : "removed"}.`)
    } catch (error) {
      console.error(`Error handling doctor change (${action}):`, error)
      showToast("error", `Error handling doctor change: ${error.response ? error.response.data.error : error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDoctorChangeCancel = () => {
    // Cancel doctor change, revert doctor selection to original
    setCurrentSelection((prev) => ({ ...prev, doctor: originalDoctorId }))
    setShowDoctorConflictUI(false)
    setDoctorChangeConflicts(null)
    showToast("error", "Doctor change cancelled.")
  }

  const updateAppointment = async () => {
    const errors = []

    if (
      !currentSelection.doctor ||
      !currentSelection.department ||
      !currentSelection.day ||
      !currentSelection.start_time ||
      !currentSelection.end_time
    ) {
      errors.push("Please fill in all fields")
    }

    if (
      currentSelection.start_time &&
      currentSelection.end_time &&
      !isEndTimeAfterStartTime(currentSelection.start_time, currentSelection.end_time)
    ) {
      errors.push("End time must be at least 30 minutes after start time")
    }

    setValidationErrors(errors)

    if (errors.length === 0) {
      const updateData = {
        doctor: currentSelection.doctor,
        department: currentSelection.department,
        day: currentSelection.day,
        start_time: generateTimeString(currentSelection.start_time, currentSelection.day),
        end_time: generateTimeString(currentSelection.end_time, currentSelection.day),
      }

      try {
        setIsLoading(true)
        const response = await axiosInstance.put(`/appointments/${appointmentId}`, updateData)

        if (response.status === 200) {
          console.log("Appointment updated successfully:", response.data)
          onSuccess()
          closeUpdateModal() // Close modal on success
          setCurrentSelection({
            department: "",
            doctor: "",
            day: "",
            start_time: "",
            end_time: "",
          })
          setValidationErrors([])
          showToast("success", "Appointment updated successfully!")
        }
      } catch (error) {
        console.error("Error updating appointment:", error.response ? error.response.data.error : error.message)
        showToast("error", `Error updating appointment: ${error.response ? error.response.data.error : error.message}`)
      } finally {
        setIsLoading(false)
      }
    } else {
      errors.forEach((error) => {
        showToast("error", `Validation Error: ${error}`)
      })
    }
  }

  return (
    <div className={styles.modalBody}>
      {/* Toast Notification */}
      {toastMessage.visible && (
        <div className={`${toastStyles.toast} ${toastStyles[toastMessage.type]}`}>{toastMessage.message}</div>
      )}

      {showDoctorConflictUI && doctorChangeConflicts ? (
        <div className={styles.doctorChangeConflictContainer}>
          <div className={styles.deleteIconContainer}>
            <svg className={styles.deleteIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className={styles.deleteTitle}>Doctor Change Warning</h3>
          <p className={styles.deleteMessage}>
            This appointment currently has{" "}
            <span className={styles.highlight}>{doctorChangeConflicts.totalConflicts}</span> Student(s) whose primary
            doctor is <span className={styles.highlight}>{doctorChangeConflicts.oldDoctorName}</span>.
          </p>
          <p className={styles.deleteMessage}>Do you want to keep them assigned to this appointment or remove them?</p>
          <div className={styles.assignedStudentsList}>
            <h4>Conflicting Students:</h4>
            <ul>
              {doctorChangeConflicts.conflictingStudents.map((student) => (
                <li key={student.patientId}>
                  {student.patientName} ({student.patientEmail})
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleDoctorChangeCancel}
              disabled={isLoading}
            >
              <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              type="button"
              className={`${styles.updateButton} ${isLoading ? styles.loadingButton : ""}`}
              onClick={() => handleDoctorChangeAction("keep")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Keep Students
                </>
              )}
            </button>
            <button
              type="button"
              className={`${styles.deleteButton} ${isLoading ? styles.loadingButton : ""}`}
              onClick={() => handleDoctorChangeAction("remove")}
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
                  Remove Students
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          <form className={styles.updateForm}>
            <div className={styles.formGrid}>
              {/* Doctors Selection - Updated to use filtered doctors */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <svg className={styles.labelIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Doctor
                </label>
                <select
                  className={`${styles.formSelect} ${
                    !currentSelection.doctor && validationErrors.some((error) => error.includes("fill in all fields"))
                      ? styles.formError
                      : ""
                  }`}
                  value={currentSelection.doctor}
                  onChange={(e) => handleDoctorSelectionChange(e.target.value)}
                >
                  <option value="">Select doctor</option>
                  {doctors?.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.username}
                    </option>
                  ))}
                </select>
                {!currentSelection.doctor && validationErrors.some((error) => error.includes("fill in all fields")) && (
                  <div className={styles.errorMessage}>Please select a doctor.</div>
                )}
              </div>

              {/* Department Selection */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <svg className={styles.labelIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Department
                </label>
                <select
                  className={`${styles.formSelect} ${
                    !currentSelection.department &&
                    validationErrors.some((error) => error.includes("fill in all fields"))
                      ? styles.formError
                      : ""
                  }`}
                  value={currentSelection.department || ""}
                  onChange={(e) => {
                    const newDepartment = e.target.value
                    setCurrentSelection({
                      ...currentSelection,
                      department: newDepartment,
                      doctor: "", // Reset doctor when department changes
                    })
                    setValidationErrors([])

                    // Fetch doctors for new department
                    if (newDepartment) {
                      getDoctorsByDepartment(newDepartment)
                    }
                  }}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {!currentSelection.department &&
                  validationErrors.some((error) => error.includes("fill in all fields")) && (
                    <div className={styles.errorMessage}>Please select a department.</div>
                  )}
              </div>

              {/* Day Selection */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <svg className={styles.labelIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Day
                </label>
                <select
                  className={`${styles.formSelect} ${
                    !currentSelection.day && validationErrors.some((error) => error.includes("fill in all fields"))
                      ? styles.formError
                      : ""
                  }`}
                  value={currentSelection.day}
                  onChange={(e) => {
                    setCurrentSelection({
                      ...currentSelection,
                      day: e.target.value,
                    })
                    setValidationErrors([])
                  }}
                >
                  <option value="">Select day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                {!currentSelection.day && validationErrors.some((error) => error.includes("fill in all fields")) && (
                  <div className={styles.errorMessage}>Please select a day.</div>
                )}
              </div>

              {/* Start Time Selection */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <svg className={styles.labelIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Start Time
                </label>
                <input
                  type="time"
                  className={`${styles.formInput} ${
                    (
                      !currentSelection.start_time &&
                        validationErrors.some((error) => error.includes("fill in all fields"))
                    ) ||
                    (
                      currentSelection.start_time &&
                        currentSelection.end_time &&
                        !isEndTimeAfterStartTime(currentSelection.start_time, currentSelection.end_time)
                    )
                      ? styles.formError
                      : ""
                  }`}
                  value={currentSelection.start_time || ""}
                  onChange={(e) => {
                    setCurrentSelection({
                      ...currentSelection,
                      start_time: e.target.value,
                    })
                    setValidationErrors([])
                  }}
                />
                {!currentSelection.start_time &&
                  validationErrors.some((error) => error.includes("fill in all fields")) && (
                    <div className={styles.errorMessage}>Please select a start time.</div>
                  )}
              </div>

              {/* End Time Selection */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <svg className={styles.labelIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  End Time
                </label>
                <input
                  type="time"
                  className={`${styles.formInput} ${
                    (
                      !currentSelection.end_time &&
                        validationErrors.some((error) => error.includes("fill in all fields"))
                    ) ||
                    (
                      currentSelection.start_time &&
                        currentSelection.end_time &&
                        !isEndTimeAfterStartTime(currentSelection.start_time, currentSelection.end_time)
                    )
                      ? styles.formError
                      : ""
                  }`}
                  value={currentSelection.end_time || ""}
                  onChange={(e) => {
                    setCurrentSelection({
                      ...currentSelection,
                      end_time: e.target.value,
                    })
                    setValidationErrors([])
                  }}
                />
                {!currentSelection.end_time &&
                  validationErrors.some((error) => error.includes("fill in all fields")) && (
                    <div className={styles.errorMessage}>Please select an end time.</div>
                  )}
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className={styles.errorsContainer}>
                {validationErrors.map((error, index) => (
                  <div key={index} className={styles.errorAlert}>
                    <div className={styles.errorContent}>
                      <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span className={styles.errorText}>Error: {error}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.errorCloseButton}
                      onClick={() => setValidationErrors(validationErrors.filter((_, i) => i !== index))}
                    >
                      <svg className={styles.errorCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => {
                setCurrentSelection({
                  department: "",
                  doctor: "",
                  day: "",
                  start_time: "",
                  end_time: "",
                })
                setValidationErrors([])
                closeUpdateModal() // Close modal on cancel
              }}
            >
              <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              type="button"
              className={`${styles.updateButton} ${isLoading ? styles.loadingButton : ""}`}
              onClick={updateAppointment}
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Update
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
