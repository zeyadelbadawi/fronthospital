"use client"
import { convertUTCTo12Hour } from "@/helper/DateTime"
import { useState, useMemo, useEffect } from "react"
import styles from "../styles/student-week-table.module.css"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const departments = ["PhysicalTherapy", "ABA", "OccupationalTherapy", "SpecialEducation", "Speech"]

const daysOfWeekArabic = {
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
}

const departmentsArabic = {
  PhysicalTherapy: "علاج طبيعي",
  ABA: "تحليل السلوك التطبيقي",
  OccupationalTherapy: "حسي - وظيفي",
  SpecialEducation: "تربية خاصة",
  Speech: "لغة و نطق",
}

const colorMap = {
  ABA: "colorABA",
  PhysicalTherapy: "colorPhysicalTherapy",
  OccupationalTherapy: "colorOccupationalTherapy",
  SpecialEducation: "colorSpecialEducation",
  Speech: "colorSpeech",
}

const departmentColors = {
  ABA: { bg: "#2E4A87", border: "#1E3A77", text: "#ffffff" },
  PhysicalTherapy: { bg: "#00BCD4", border: "#0097A7", text: "#ffffff" },
  OccupationalTherapy: { bg: "#9C27B0", border: "#7B1FA2", text: "#ffffff" },
  SpecialEducation: { bg: "#FF5722", border: "#E64A19", text: "#ffffff" },
  Speech: { bg: "#4CAF50", border: "#388E3C", text: "#ffffff" },
}

export default function StudentWeekTable({ evaluations, studentName, studentId, language = "en" }) {
  const [selectedAppointments, setSelectedAppointments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)

  useEffect(() => {
    // Update RTL/LTR when language changes
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  const isRTL = language === "ar"

  // Department color mapping
  const getDepartmentColors = (department) => {
    return (
      departmentColors[department] || {
        bg: "#2E4A87",
        border: "#1E3A77",
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
      {/* Professional Header */}
      <div className={styles.headerBottom}>
        <h3 className={styles.scheduleTitle}>
          {getText("scheduleTitle", "Weekly Session Schedule", "مواعيد الجلسات الأسبوعي")}
        </h3>
      </div>

      {/* Calendar Body */}
      <div className={styles.calendarBody}>
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
                  <th className={styles.dayHeaderCell}>{getText("day", "Day", "اليوم")}</th>
                  {departments.map((department) => (
                    <th key={department} className={styles.departmentHeaderCell}>
                      <div className={styles.departmentHeader}>
                        <div
                          className={styles.departmentBadge}
                          style={{
                            backgroundColor: getDepartmentColors(department).bg,
                          }}
                        >
                          <span className={styles.departmentIcon}>●</span>
                        </div>
                        <span className={styles.departmentName}>
                          {language === "ar" ? departmentsArabic[department] : department}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daysOfWeek.map((day) => (
                  <tr key={day} className={styles.tableRow}>
                    <td className={styles.dayCell}>
                      <div className={styles.dayName}>{language === "ar" ? daysOfWeekArabic[day] : day}</div>
                    </td>
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
                       {getText("from", "From", "من")}: {formatTime(item.start_time)} - {getText("to", "To:", "الي")} :{formatTime(item.end_time)} 
                                      </div>
                                      <div className={styles.appointmentDoctor}>
                                        {getText("dr", "Dr.", "دكتور.")} {item.doctor.username}
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

      {/* Professional Footer */}
      <div className={styles.professionalFooter}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <img src="/images/rukn-logo.png" alt="Rukn Alwatikon Center" className={styles.footerLogoImg} />
          </div>
          <div className={styles.footerInfo}>
            <div className={styles.footerText}>
              {getText(
                "footerNote",
                "Villa 5, Wasit Street, Ramtha, Wasit District, Sharjah Emirate, United Arab Emirates",
                "فيلا 5 - شارع واسط - الرمثاء - ضاحية واسط - إمارة الشارقة - الإمارات العربية المتحدة",
              )}
            </div>
            <div className={styles.footerContact}>
              <span>📞 0568671616 | 065624947</span>
              <span>🌐 WWW.RAWC.AE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Appointment Details */}
      {showModal && selectedAppointments.length > 0 && selectedCell && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalLogo}>
                <img src="/images/rukn-logo.png" alt="Logo" className={styles.modalLogoImg} />
              </div>
              <h3 className={styles.modalTitle}>
                {language === "ar" ? daysOfWeekArabic[selectedCell.day] : selectedCell.day} -{" "}
                {language === "ar" ? departmentsArabic[selectedCell.department] : selectedCell.department}
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
                          {getText("dr", "Dr.", "دكتور")} {appointment.doctor.username}
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
                       {getText("from", "From", "من")}: {formatTime(appointment.start_time)} - {getText("to", "To:", "الي")}: {formatTime(appointment.end_time)} 
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
