"use client"
import { useState } from "react"
import {
  Users,
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  CalendarX,
} from "lucide-react"
import styles from "../styles/navigation-bookingmadi.module.css"

const departments = ["ABA", "Cardiology", "Dermatology", "Neurology", "Orthopedics", "Pediatrics"]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const timeSlots = [
  { label: "9:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "1:00 PM", value: "13:00" },
  { label: "2:00 PM", value: "14:00" },
  { label: "3:00 PM", value: "15:00" },
  { label: "4:00 PM", value: "16:00" },
  { label: "5:00 PM", value: "17:00" },
]

// Validation functions
const isEndTimeAfterStartTime = (startTime, endTime) => {
  if (!startTime || !endTime) return true
  const startHour = Number.parseInt(startTime.split(":")[0])
  const endHour = Number.parseInt(endTime.split(":")[0])
  return endHour > startHour
}

const isDuplicateTimeSlot = (appointments, department, day, startTime, endTime, excludeId = null) => {
  return appointments.some(
    (apt) =>
      apt.id !== excludeId &&
      apt.department === department &&
      apt.day === day &&
      ((formatTimeForComparison(apt.startTime) === startTime && formatTimeForComparison(apt.endTime) === endTime) ||
        (formatTimeForComparison(apt.startTime) < endTime && formatTimeForComparison(apt.endTime) > startTime)),
  )
}

const generateTimeString = (time, day) => {
  const today = new Date()
  const currentDayIndex = today.getUTCDay()
  const targetDayIndex = daysOfWeek.indexOf(day)
  let daysUntilTarget = (targetDayIndex + 1 - currentDayIndex + 7) % 7
  if (daysUntilTarget === 0) daysUntilTarget = 7

  const targetDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + daysUntilTarget),
  )

  const [hours, minutes] = time.split(":").map((num) => Number.parseInt(num, 10))

  targetDate.setUTCHours(hours, minutes || 0, 0, 0)
  return targetDate.toISOString()
}

const formatTimeForComparison = (isoString) => {
  const date = new Date(isoString)
  return date.getUTCHours().toString().padStart(2, "0") + ":" + date.getUTCMinutes().toString().padStart(2, "0")
}

export default function AppointmentBooking() {
  const [selectedAppointments, setSelectedAppointments] = useState([])
  const [currentSelection, setCurrentSelection] = useState({
    department: "",
    day: "",
    startTime: "",
    endTime: "",
  })
  const [editingId, setEditingId] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])

  const addOrUpdateAppointment = () => {
    const errors = []

    if (
      !currentSelection.department ||
      !currentSelection.day ||
      !currentSelection.startTime ||
      !currentSelection.endTime
    ) {
      errors.push("Please fill in all fields")
    }

    if (
      currentSelection.startTime &&
      currentSelection.endTime &&
      !isEndTimeAfterStartTime(currentSelection.startTime, currentSelection.endTime)
    ) {
      errors.push("End time must be after start time")
    }

    if (currentSelection.department && currentSelection.day && currentSelection.startTime && currentSelection.endTime) {
      if (
        isDuplicateTimeSlot(
          selectedAppointments,
          currentSelection.department,
          currentSelection.day,
          currentSelection.startTime,
          currentSelection.endTime,
          editingId,
        )
      ) {
        errors.push(`Time slot already exists for ${currentSelection.department} on ${currentSelection.day}`)
      }
    }

    setValidationErrors(errors)

    if (errors.length === 0) {
      if (editingId) {
        setSelectedAppointments(
          selectedAppointments.map((apt) =>
            apt.id === editingId
              ? {
                  ...apt,
                  department: currentSelection.department,
                  day: currentSelection.day,
                  startTime: generateTimeString(currentSelection.startTime, currentSelection.day),
                  endTime: generateTimeString(currentSelection.endTime, currentSelection.day),
                }
              : apt,
          ),
        )
        setEditingId(null)
      } else {
        const newAppointment = {
          id: Date.now().toString(),
          department: currentSelection.department,
          day: currentSelection.day,
          startTime: generateTimeString(currentSelection.startTime, currentSelection.day),
          endTime: generateTimeString(currentSelection.endTime, currentSelection.day),
        }
        setSelectedAppointments([...selectedAppointments, newAppointment])
      }

      setCurrentSelection({
        department: "",
        day: "",
        startTime: "",
        endTime: "",
      })
      setValidationErrors([])
    }
  }

  const onSend = async () => {
    console.log(selectedAppointments)
  }

  const editAppointment = (appointment) => {
    setCurrentSelection({
      department: appointment.department,
      day: appointment.day,
      startTime: formatTimeForComparison(appointment.startTime),
      endTime: formatTimeForComparison(appointment.endTime),
    })
    setEditingId(appointment.id)
    setValidationErrors([])
  }

  const cancelEdit = () => {
    setCurrentSelection({
      department: "",
      day: "",
      startTime: "",
      endTime: "",
    })
    setEditingId(null)
    setValidationErrors([])
  }

  const removeAppointment = (id) => {
    setSelectedAppointments(selectedAppointments.filter((apt) => apt.id !== id))
    if (editingId === id) {
      cancelEdit()
    }
  }

  const formatDisplayTime = (isoString) => {
    const date = new Date(isoString)
    const hours = date.getUTCHours()
    const minutes = date.getUTCMinutes()
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const ampm = hours >= 12 ? "PM" : "AM"
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`
  }

  const isFormValid =
    currentSelection.department &&
    currentSelection.day &&
    currentSelection.startTime &&
    currentSelection.endTime &&
    isEndTimeAfterStartTime(currentSelection.startTime, currentSelection.endTime) &&
    !isDuplicateTimeSlot(
      selectedAppointments,
      currentSelection.department,
      currentSelection.day,
      currentSelection.startTime,
      currentSelection.endTime,
      editingId,
    )

  return (
    <div className={styles.bookingContainer}>
      <div className={styles.bookingWrapper}>
        {/* Header */}
        <div className={styles.bookingHeader}>
          <h1 className={styles.bookingTitle}>Appointment Booking System</h1>
          <p className={styles.bookingSubtitle}>Select multiple appointment slots for different departments</p>
        </div>

        {/* Appointment Selection Form */}
        <div className={styles.bookingCard}>
          <div className={`${styles.bookingCardHeader} ${editingId ? styles.bookingCardHeaderEdit : ""}`}>
            <h5 className={styles.bookingCardTitle}>
              {editingId ? <Edit size={20} /> : <Plus size={20} />}
              {editingId ? "Edit Appointment Slot" : "Add New Appointment Slot"}
            </h5>
          </div>
          <div className={styles.bookingCardBody}>
            <div className={styles.formGrid}>
              {/* Department Selection */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <Users size={16} />
                  Department
                </label>
                <select
                  className={styles.formSelect}
                  value={currentSelection.department}
                  onChange={(e) =>
                    setCurrentSelection({
                      ...currentSelection,
                      department: e.target.value,
                    })
                  }
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Selection */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <Calendar size={16} />
                  Day
                </label>
                <select
                  className={styles.formSelect}
                  value={currentSelection.day}
                  onChange={(e) =>
                    setCurrentSelection({
                      ...currentSelection,
                      day: e.target.value,
                    })
                  }
                >
                  <option value="">Select day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time Selection */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <Clock size={16} />
                  Start Time
                </label>
                <select
                  className={`${styles.formSelect} ${
                    currentSelection.startTime &&
                    currentSelection.endTime &&
                    !isEndTimeAfterStartTime(currentSelection.startTime, currentSelection.endTime)
                      ? styles.formSelectInvalid
                      : ""
                  }`}
                  value={currentSelection.startTime}
                  onChange={(e) => {
                    setCurrentSelection({
                      ...currentSelection,
                      startTime: e.target.value,
                    })
                    setValidationErrors([])
                  }}
                >
                  <option value="">Start time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* End Time Selection */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <Clock size={16} />
                  End Time
                </label>
                <select
                  className={`${styles.formSelect} ${
                    currentSelection.startTime &&
                    currentSelection.endTime &&
                    !isEndTimeAfterStartTime(currentSelection.startTime, currentSelection.endTime)
                      ? styles.formSelectInvalid
                      : ""
                  }`}
                  value={currentSelection.endTime}
                  onChange={(e) => {
                    setCurrentSelection({
                      ...currentSelection,
                      endTime: e.target.value,
                    })
                    setValidationErrors([])
                  }}
                >
                  <option value="">End time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className={styles.errorAlert}>
                <div className={styles.errorTitle}>
                  <AlertTriangle size={16} />
                  Please fix the following errors:
                </div>
                <ul className={styles.errorList}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.primaryButton} ${editingId ? styles.warningButton : ""}`}
                onClick={addOrUpdateAppointment}
                disabled={!isFormValid}
              >
                {editingId ? <CheckCircle size={16} /> : <Plus size={16} />}
                {editingId ? "Update Appointment" : "Add Appointment Slot"}
              </button>
              {editingId && (
                <button className={styles.secondaryButton} onClick={cancelEdit}>
                  <X size={16} />
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Selected Appointments Display */}
        {selectedAppointments.length > 0 && (
          <div className={styles.bookingCard}>
            <div className={`${styles.bookingCardHeader} ${styles.successHeader}`}>
              <h5 className={styles.bookingCardTitle}>Selected Appointment Slots ({selectedAppointments.length})</h5>
            </div>
            <div className={styles.bookingCardBody}>
              <div className={styles.appointmentsList}>
                {selectedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`${styles.appointmentItem} ${
                      editingId === appointment.id ? styles.appointmentItemEditing : ""
                    }`}
                  >
                    <div className={styles.appointmentContent}>
                      <div className={styles.appointmentInfo}>
                        <span
                          className={`${styles.appointmentBadge} ${
                            editingId === appointment.id ? styles.appointmentBadgeEditing : ""
                          }`}
                        >
                          {appointment.department}
                        </span>
                        <div className={styles.appointmentDetail}>
                          <Calendar size={16} />
                          {appointment.day}
                        </div>
                        <div className={styles.appointmentDetail}>
                          <Clock size={16} />
                          {formatDisplayTime(appointment.startTime)} - {formatDisplayTime(appointment.endTime)}
                        </div>
                        {editingId === appointment.id && (
                          <span className={styles.appointmentBadgeEditing}>
                            <Edit size={14} />
                            Editing
                          </span>
                        )}
                      </div>
                      <div className={styles.appointmentActions}>
                        <button
                          className={`${styles.actionButton} ${styles.editButton}`}
                          onClick={() => editAppointment(appointment)}
                          disabled={editingId === appointment.id}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => removeAppointment(appointment.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedAppointments.length === 0 && (
          <div className={styles.bookingCard}>
            <div className={styles.bookingCardBody}>
              <div className={styles.emptyState}>
                <CalendarX className={styles.emptyStateIcon} />
                <h3 className={styles.emptyStateTitle}>No appointments selected</h3>
                <p className={styles.emptyStateText}>Add your first appointment slot using the form above</p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button className={styles.saveButton} onClick={onSend} disabled={selectedAppointments.length === 0}>
          <Save size={20} />
          Save Appointments
        </button>
      </div>
    </div>
  )
}
