"use client"
import { useState, useEffect } from "react"
import { Calendar, Clock, User, CheckCircle, Phone, FileText } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/styles/home-components.module.css"

const HomeComSix = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState({
    totalCompleted: 0,
    fullProgramCount: 0,
    singleSessionCount: 0,
    schoolEvaluationCount: 0,
    uniquePatients: 0,
  })

  useEffect(() => {
    const fetchCompletedAppointments = async () => {
      try {
        setLoading(true)
        const { data } = await axiosInstance.get("/authentication/latest-completed-appointments", {
          params: { limit: 5 }, // Changed from 8 to 5
        })


        if (data.success) {
          setAppointments(data.appointments || [])
          setSummary(data.summary || {})
          setError("")
        } else {
          setError("Failed to load completed appointments")
        }
      } catch (err) {
        console.error("Error fetching completed appointments:", err)
        setError("Failed to load completed appointments")
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    fetchCompletedAppointments()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return "N/A"
    // Assuming timeString is in HH:MM format, convert to 12-hour with AM/PM
    const [hours, minutes] = timeString.split(":").map(Number)
    const ampm = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`
  }

  const getCompletedDate = (completedDateString) => {
    if (!completedDateString) return "Recently"
    const completedDate = new Date(completedDateString)
    const now = new Date()
    const diffInHours = Math.floor((now - completedDate) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return formatDate(completedDateString)
  }

  const getProgramTypeColor = (programType) => {
    switch (programType) {
      case "Full Program":
        return {
          bg: "#e0f2f7", // Light blue
          text: "#1a4b6e", // Darker blue
          border: "#b3d9e6", // Light blue border
        }
      case "Single Session":
        return {
          bg: "#fce4f0", // Light pink
          text: "#8a1c5f", // Darker pink
          border: "#f7b3d1", // Light pink border
        }
      case "School Evaluation":
        return {
          bg: "#e6e6f2", // Light purple
          text: "#2a2a5c", // Darker purple
          border: "#c2c2d9", // Light purple border
        }
      default:
        return {
          bg: "#f3f4f6",
          text: "#374151",
          border: "#d1d5db",
        }
    }
  }

  if (loading) {
    return (
      <div className={styles.colXxl12}>
        <div className={styles.dashboardCard}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span className={styles.loadingText}>Loading completed appointments...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.colXxl12}>
        <div className={styles.dashboardCard}>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.colXxl12}>
      <div className={styles.dashboardCard}>
        <div className={styles.cardHeader}>
          <h6 className={styles.cardTitle}>
            <CheckCircle size={20} />
            Completed Appointments
          </h6>
        </div>

        {/* Summary Statistics */}
        <div className={styles.cardBody} style={{ paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
          <div className={`${styles.gridRow} ${styles.gap3}`}>
            <div className={`${styles.gridCol} ${styles.col4}`}>
              <div className={`${styles.homeComSixSummaryBox} ${styles.homeComSixSummaryBox.blue}`}>
                <div className={styles.homeComSixSummaryValueBlue}>{summary.fullProgramCount}</div>
                <div className={`${styles.homeComSixSummaryLabel} ${styles.homeComSixSummaryLabelBlue}`}>
                  Full Programs
                </div>
              </div>
            </div>
            <div className={`${styles.gridCol} ${styles.col4}`}>
              <div className={`${styles.homeComSixSummaryBox} ${styles.homeComSixSummaryBox.pink}`}>
                <div className={styles.homeComSixSummaryValuePink}>{summary.singleSessionCount}</div>
                <div className={`${styles.homeComSixSummaryLabel} ${styles.homeComSixSummaryLabelPink}`}>
                  Single Sessions
                </div>
              </div>
            </div>
            <div className={`${styles.gridCol} ${styles.col4}`}>
              <div className={`${styles.homeComSixSummaryBox} ${styles.homeComSixSummaryBox.purple}`}>
                <div className={styles.homeComSixSummaryValuePurple}>{summary.schoolEvaluationCount}</div>
                <div className={`${styles.homeComSixSummaryLabel} ${styles.homeComSixSummaryLabelPurple}`}>
                  School Evals
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <div className={styles.tableResponsive}>
            <table className={styles.appointmentsTable}>
              <thead>
                <tr>
                  <th>Student Details</th>
                  <th>Program Type</th>
                  <th>Appointment Date</th>
                  <th>Completed</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={`${styles.textAlignC} ${styles.paddingY4}`} style={{ color: "#6b7280" }}>
                      <CheckCircle size={48} style={{ color: "#cbd5e1", marginBottom: "1rem" }} />
                      <div>No completed appointments found</div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                        Showing latest 5 completed appointments
                      </div>
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => {
                    const programColors = getProgramTypeColor(appointment.programType)
                    return (
                      <tr key={appointment.id}>
                        <td>
                          <div className={`${styles.flexContainer} ${styles.flexColumn} ${styles.gap1}`}>
                            <div className={`${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap2}`}>
                              <User size={16} style={{ color: "#6b7280" }} />
                              <span style={{ fontWeight: "600", color: "#1e293b" }}>{appointment.patientName}</span>
                            </div>
                            {appointment.patientPhone && appointment.patientPhone !== "N/A" && (
                              <div
                                className={`${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap2}`}
                                style={{ marginLeft: "18px" }}
                              >
                                <Phone size={12} style={{ color: "#94a3b8" }} />
                                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                  {appointment.patientPhone}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              backgroundColor: programColors.bg,
                              color: programColors.text,
                              border: `1px solid ${programColors.border}`,
                            }}
                          >
                            {appointment.programType}
                          </span>
                        </td>
                        <td>
                          <div className={`${styles.flexContainer} ${styles.flexColumn} ${styles.gap1}`}>
                            <div className={`${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap2}`}>
                              <Calendar size={14} style={{ color: "#6b7280" }} />
                              <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                                {formatDate(appointment.appointmentDate)}
                              </span>
                            </div>
                            <div
                              className={`${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap2}`}
                              style={{ marginLeft: "16px" }}
                            >
                              <Clock size={12} style={{ color: "#94a3b8" }} />
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                {formatTime(appointment.appointmentTime)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={`${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap2}`}>
                            <CheckCircle size={16} style={{ color: "#2977ba" }} />
                            <span style={{ fontSize: "0.875rem", color: "#2977ba", fontWeight: "500" }}>
                              {getCompletedDate(appointment.completedDate)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className={`${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap2}`}>
                            <FileText size={14} style={{ color: "#6b7280" }} />
                            <span
                              style={{
                                fontSize: "0.875rem",
                                color: "#374151",
                                maxWidth: "200px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={appointment.description}
                            >
                              {appointment.description || "No description"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeComSix
