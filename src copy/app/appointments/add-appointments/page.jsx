"use client"

import RBACWrapper from "@/components/RBACWrapper"
import { useState, useEffect } from "react"
import axiosInstance from "@/helper/axiosSetup"
import { generateTimeString } from "@/helper/DateTime"
import styles from "@/styles/add-appointments.module.css"

const departments = ["PhysicalTherapy", "ABA", "OccupationalTherapy", "SpecialEducation", "Speech"]
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

function AddAppointmentContent() {
  const [currentSelection, setCurrentSelection] = useState({
    doctor: "",
    department: "",
    day: "",
    start_time: "",
    end_time: "",
  })
  const [validationErrors, setValidationErrors] = useState([])
  const [doctors, setDoctors] = useState([])
  const [toastMessage, setToastMessage] = useState({ type: "", message: "", visible: false })

  const showToast = (type, message) => {
    setToastMessage({ type, message, visible: true })
    setTimeout(() => {
      setToastMessage((prev) => ({ ...prev, visible: false }))
    }, 3000) // Hide after 3 seconds
  }

  const getDoctorsByDepartment = async (department) => {
    try {
      const response = await axiosInstance.get(`/appointments/doctors-by-department/${department}`)
      setDoctors(response.data.doctors)
    } catch (error) {
      setDoctors([])
    }
  }

  useEffect(() => {
    if (currentSelection.department) {
      getDoctorsByDepartment(currentSelection.department)
    } else {
      setDoctors([])
      setCurrentSelection((prev) => ({ ...prev, doctor: "" }))
    }
  }, [currentSelection.department])

  const addAppointment = async () => {
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
      const addedData = {
        doctor: currentSelection.doctor,
        department: currentSelection.department,
        day: currentSelection.day,
        start_time: generateTimeString(currentSelection.start_time, currentSelection.day),
        end_time: generateTimeString(currentSelection.end_time, currentSelection.day),
      }

      try {
        const response = await axiosInstance.post("/appointments/", addedData)
        if (response.status !== 201) {
          showToast("error", "Failed to save appointment: There was an issue saving your appointment.")
        } else {
          showToast("success", `Appointment saved successfully! New slot added for ${currentSelection.department}.`)
          setCurrentSelection({
            department: "",
            day: "",
            doctor: "",
            start_time: "",
            end_time: "",
          })
          setValidationErrors([])
        }
      } catch (error) {
        showToast("error", `Error saving appointment: ${error.response?.data?.error || error.message}`)
      }
    } else {
      // Display validation errors using custom toast
      errors.forEach((error) => {
        showToast("error", `Validation Error: ${error}`)
      })
    }
  }

  return (
    <div className={styles.addAppointmentContainer}>
      {toastMessage.visible && (
        <div className={`${styles.toast} ${styles[toastMessage.type]}`}>{toastMessage.message}</div>
      )}
      <div className={styles.containerWrapper}>
        {/* Header */}

        {/* Appointment Selection Form */}
        <div className={styles.appointmentCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerContent}>
              <svg className={styles.headerIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <h5 className={styles.cardTitle}>Add New Appointment Slot</h5>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.formGrid}>
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
                  value={currentSelection.department}
                  onChange={(e) => {
                    setCurrentSelection({
                      ...currentSelection,
                      department: e.target.value,
                    })
                    setValidationErrors([])
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

              {/* Doctors Selection */}
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
                <div
                  title={!currentSelection.department ? "You have to select department first" : ""}
                  className={styles.doctorSelectWrapper}
                >
                  <select
                    className={`${styles.formSelect} ${
                      !currentSelection.doctor && validationErrors.some((error) => error.includes("fill in all fields"))
                        ? styles.formError
                        : ""
                    }`}
                    value={currentSelection.doctor}
                    onChange={(e) => {
                      setCurrentSelection({
                        ...currentSelection,
                        doctor: e.target.value,
                      })
                      setValidationErrors([])
                    }}
                    disabled={!currentSelection.department}
                  >
                    <option value="">Select doctor</option>
                    {doctors.length > 0 ? (
                      doctors.map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          {doc.username}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No doctors available for this department
                      </option>
                    )}
                  </select>
                </div>
                {!currentSelection.doctor && validationErrors.some((error) => error.includes("fill in all fields")) && (
                  <div className={styles.errorMessage}>Please select a doctor.</div>
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
                  value={currentSelection.start_time}
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
                  value={currentSelection.end_time}
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

            <div className={styles.buttonContainer}>
              <button className={styles.submitButton} onClick={addAppointment}>
                <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Appointment Slot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AddAppointmentPage() {
  return (
    <RBACWrapper>
      <AddAppointmentContent />
    </RBACWrapper>
  )
}
