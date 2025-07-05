"use client"
import { convertUTCTo12Hour } from "@/helper/DateTime"
import { useState, useMemo } from "react"
import styles from "../styles/week-table.module.css"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const departments = ["PhysicalTherapy", "ABA", "OccupationalTherapy", "SpecialEducation", "Speech", "ay7aga"]

const colorMap = {
  ABA: "colorABA",
  ay7aga: "colorAy7aga",
  PhysicalTherapy: "colorPhysicalTherapy",
  OccupationalTherapy: "colorOccupationalTherapy",
  SpecialEducation: "colorSpecialEducation",
  Speech: "colorSpeech",
}

const departmentColors = {
  ABA: { bg: "#3b82f6", border: "#2563eb", text: "#ffffff" },
  ay7aga: { bg: "#ef4444", border: "#dc2626", text: "#ffffff" },
  PhysicalTherapy: { bg: "#10b981", border: "#059669", text: "#ffffff" },
  OccupationalTherapy: { bg: "#f59e0b", border: "#d97706", text: "#ffffff" },
  SpecialEducation: { bg: "#06b6d4", border: "#0891b2", text: "#ffffff" },
  Speech: { bg: "#6b7280", border: "#4b5563", text: "#ffffff" },
}

export default function ImprovedCalendar({ evaluations }) {
  const [selectedAppointments, setSelectedAppointments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)

  // Department color mapping
  const getDepartmentColors = (department) => {
    return (
      departmentColors[department] || {
        bg: "#3b82f6",
        border: "#2563eb",
        text: "#ffffff",
      }
    )
  }

  const getDepartmentColorClass = (department) => {
    return colorMap[department] || "colorABA"
  }

  // Group appointments by day and department
  const groupedAppointments = useMemo(() => {
    const grouped = {}
    // Initialize the structure
    daysOfWeek.forEach((day) => {
      grouped[day] = {}
      departments.forEach((dept) => {
        grouped[day][dept] = []
      })
    })

    // Group appointments
    evaluations.forEach((appointment) => {
      if (grouped[appointment.day] && grouped[appointment.day][appointment.department]) {
        grouped[appointment.day][appointment.department].push(appointment)
      }
    })

    return grouped
  }, [evaluations])

  // Handle cell click
  const handleCellClick = (day, department) => {
    const appointments = groupedAppointments[day][department]
    if (appointments.length > 0) {
      setSelectedAppointments(appointments)
      setSelectedCell({ day, department })
      setShowModal(true)
    }
  }

  // Format time for display
  const formatTime = (dateString) => {
    return convertUTCTo12Hour(dateString)
  }

  // Get appointment summary for cell
  const getAppointmentSummary = (appointments) => {
    if (appointments.length === 0) return null
    return appointments
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedAppointments([])
    setSelectedCell(null)
  }

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarCard}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Weekly Schedule</h1>
            <div className={styles.statsContainer}>
              <div className={styles.statBadge}>{evaluations.length} Total Appointments</div>
              <div className={styles.statBadge}>{new Set(evaluations.map((a) => a.doctor?.username)).size} Doctors</div>
              <div className={styles.statBadge}>{departments.length} Departments</div>
            </div>
          </div>
        </div>

        {/* Calendar Body */}
        <div className={styles.cardBody}>
          <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Day / Department</th>
                  {departments.map((department) => (
                    <th key={department}>
                      <div className={styles.departmentHeader}>
                        <span
                          className={styles.departmentBadge}
                          style={{
                            backgroundColor: getDepartmentColors(department).bg,
                          }}
                        >
                          ●
                        </span>
                        <span>{department}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daysOfWeek.map((day) => (
                  <tr key={day} className={styles.tableRow}>
                    <td className={styles.dayCell}>{day}</td>
                    {departments.map((department) => {
                      const appointments = groupedAppointments[day][department]
                      const summary = getAppointmentSummary(appointments)
                      const colorClass = getDepartmentColorClass(department)

                      return (
                        <td
                          key={`${day}-${department}`}
                          className={`${styles.appointmentCell} ${
                            appointments.length > 0 ? styles.hasAppointments : ""
                          }`}
                          onClick={() => handleCellClick(day, department)}
                        >
                          {summary && (
                            <div className={styles.appointmentCardContainer}>
                              <div className={`${styles.appointmentCard} ${styles[colorClass]}`}>
                                <div className={styles.appointmentCardBody}>
                                  {summary.map((item, index) => (
                                    <div key={index} className={styles.appointmentItem}>
                                      Dr. {item.doctor.username}: {convertUTCTo12Hour(item.start_time)} -{" "}
                                      {convertUTCTo12Hour(item.end_time)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Appointment Details */}
      {showModal && selectedAppointments.length > 0 && selectedCell && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {selectedCell.day} - {selectedCell.department} Department
                <span
                  className={styles.modalBadge}
                  style={{
                    backgroundColor: getDepartmentColors(selectedCell.department).bg,
                  }}
                >
                  {selectedAppointments.length} Appointments
                </span>
              </h3>
              <button onClick={closeModal} className={styles.closeButton} aria-label="Close">
                <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.appointmentsGrid}>
                {selectedAppointments.map((appointment) => (
                  <div key={appointment._id} className={styles.modalAppointmentCard}>
                    <div className={styles.modalAppointmentCardBody}>
                      <div className={styles.appointmentCardHeader}>
                        <h4 className={styles.doctorName}>Dr. {appointment.doctor.username}</h4>
                        <span
                          className={styles.departmentBadgeModal}
                          style={{
                            backgroundColor: getDepartmentColors(appointment.department).bg,
                          }}
                        >
                          {appointment.department}
                        </span>
                      </div>
                      <div className={styles.appointmentDetails}>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Day:</span>
                          <span className={styles.detailValue}>{appointment.day}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Time:</span>
                          <span className={styles.detailValue}>
                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>ID:</span>
                          <span className={`${styles.detailValue} ${styles.appointmentId}`}>{appointment._id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModal} className={styles.modalCloseButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
