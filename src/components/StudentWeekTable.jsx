"use client"
import { convertUTCTo12Hour } from "@/helper/DateTime"
import { useState, useMemo } from "react"
import styles from "../styles/student-week-table.module.css"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const departments = ["PhysicalTherapy", "ABA", "OccupationalTherapy", "SpecialEducation", "Speech", "ay7aga"]

const daysOfWeekArabic = {
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
}

const departmentsArabic = {
  PhysicalTherapy: "العلاج الطبيعي",
  ABA: "تحليل السلوك التطبيقي",
  OccupationalTherapy: "العلاج الوظيفي",
  SpecialEducation: "التربية الخاصة",
  Speech: "علاج النطق",
  ay7aga: "أي حاجة",
}

const colorMap = {
  ABA: "colorABA",
  ay7aga: "colorAy7aga",
  PhysicalTherapy: "colorPhysicalTherapy",
  OccupationalTherapy: "colorOccupationalTherapy",
  SpecialEducation: "colorSpecialEducation",
  Speech: "colorSpeech",
}

const departmentColors = {
  ABA: { bg: "#e91e63", border: "#ad1457", text: "#ffffff" },
  ay7aga: { bg: "#4a4a8a", border: "#3c3c6e", text: "#ffffff" },
  PhysicalTherapy: { bg: "#10b981", border: "#059669", text: "#ffffff" },
  OccupationalTherapy: { bg: "#f59e0b", border: "#d97706", text: "#ffffff" },
  SpecialEducation: { bg: "#06b6d4", border: "#0891b2", text: "#ffffff" },
  Speech: { bg: "#8b5cf6", border: "#7c3aed", text: "#ffffff" },
}

export default function StudentWeekTable({ evaluations, studentName, studentId, language = "en" }) {
  const [selectedAppointments, setSelectedAppointments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)

  const isRTL = language === "ar"

  // Department color mapping
  const getDepartmentColors = (department) => {
    return (
      departmentColors[department] || {
        bg: "#e91e63",
        border: "#ad1457",
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

  const getText = (key, enText, arText) => {
    return language === "ar" ? arText : enText
  }

  return (
    <div className={`${styles.calendarContainer} ${isRTL ? styles.rtl : styles.ltr}`}>
      <div className={styles.calendarCard}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>{getText("title", "My Weekly Schedule", "جدولي الأسبوعي")}</h1>
            <div className={styles.studentInfo}>
              <div className={styles.studentBadge}>
                <i className="bi bi-person-circle me-2"></i>
                {studentName}
              </div>
            </div>
            <div className={styles.statsContainer}>
              <div className={styles.statBadge}>
                {evaluations.length} {getText("appointments", "My Appointments", "مواعيدي")}
              </div>
              <div className={styles.statBadge}>
                {new Set(evaluations.map((a) => a.department)).size} {getText("departments", "Departments", "الأقسام")}
              </div>
              <div className={styles.statBadge}>
                {new Set(evaluations.map((a) => a.doctor?.username)).size} {getText("doctors", "Doctors", "الأطباء")}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Body */}
        <div className={styles.cardBody}>
          {evaluations.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <i className="bi bi-calendar-x"></i>
              </div>
              <h3 className={styles.emptyStateTitle}>
                {getText("noAppointments", "No Appointments Scheduled", "لا توجد مواعيد مجدولة")}
              </h3>
              <p className={styles.emptyStateText}>
                {getText(
                  "noAppointmentsDesc",
                  "You don't have any appointments scheduled at the moment. Please contact your coordinator if you need to schedule appointments.",
                  "ليس لديك أي مواعيد مجدولة في الوقت الحالي. يرجى الاتصال بالمنسق إذا كنت بحاجة لجدولة مواعيد.",
                )}
              </p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.scheduleTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>{getText("dayDepartment", "Day / Department", "اليوم / القسم")}</th>
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
                          <span>{language === "ar" ? departmentsArabic[department] : department}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map((day) => (
                    <tr key={day} className={styles.tableRow}>
                      <td className={styles.dayCell}>{language === "ar" ? daysOfWeekArabic[day] : day}</td>
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
                                        <div className={styles.appointmentTime}>
                                          {convertUTCTo12Hour(item.start_time)} - {convertUTCTo12Hour(item.end_time)}
                                        </div>
                                        <div className={styles.appointmentDoctor}>
                                          {getText("dr", "Dr.", "د.")} {item.doctor.username}
                                        </div>
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
          )}
        </div>
      </div>

      {/* Modal for Appointment Details */}
      {showModal && selectedAppointments.length > 0 && selectedCell && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {language === "ar" ? daysOfWeekArabic[selectedCell.day] : selectedCell.day} -{" "}
                {language === "ar" ? departmentsArabic[selectedCell.department] : selectedCell.department}{" "}
                {getText("department", "Department", "قسم")}
                <span
                  className={styles.modalBadge}
                  style={{
                    backgroundColor: getDepartmentColors(selectedCell.department).bg,
                  }}
                >
                  {selectedAppointments.length} {getText("appointment", "Appointment", "موعد")}
                  {selectedAppointments.length > 1 ? (language === "ar" ? "" : "s") : ""}
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
                        <h4 className={styles.doctorName}>
                          {getText("dr", "Dr.", "د.")} {appointment.doctor.username}
                        </h4>
                        <span
                          className={styles.departmentBadgeModal}
                          style={{
                            backgroundColor: getDepartmentColors(appointment.department).bg,
                          }}
                        >
                          {language === "ar" ? departmentsArabic[appointment.department] : appointment.department}
                        </span>
                      </div>
                      <div className={styles.appointmentDetails}>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>{getText("day", "Day:", "اليوم:")}</span>
                          <span className={styles.detailValue}>
                            {language === "ar" ? daysOfWeekArabic[appointment.day] : appointment.day}
                          </span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>{getText("time", "Time:", "الوقت:")}</span>
                          <span className={styles.detailValue}>
                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>{getText("department", "Department:", "القسم:")}</span>
                          <span className={styles.detailValue}>
                            {language === "ar" ? departmentsArabic[appointment.department] : appointment.department}
                          </span>
                        </div>
                        <div className={styles.studentNote}>
                          <i className="bi bi-info-circle me-2"></i>
                          {getText(
                            "note",
                            "This is your scheduled appointment. Please arrive 10 minutes early.",
                            "هذا موعدك المجدول. يرجى الحضور قبل 10 دقائق من الموعد.",
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModal} className={styles.modalCloseButton}>
                {getText("close", "Close", "إغلاق")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
