"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Calendar, ArrowRight, Clock, User } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/styles/home-components.module.css"

const HomeComSix = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axiosInstance.get("/authentication/latest-appointments")
        setAppointments(data)
      } catch (err) {
        console.error("Failed to load latest appointments:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

  if (loading) {
    return (
      <div className="col-xxl-12">
        <div className={styles.dashboardCard}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span className={styles.loadingText}>Loading appointments...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="col-xxl-12">
      <div className={styles.dashboardCard}>
        <div className={styles.cardHeader}>
          <h6 className={styles.cardTitle}>
            <Calendar size={20} />
            Latest Appointments
          </h6>
          <Link
            href="#"
            className="text-decoration-none d-flex align-items-center gap-1"
            style={{ color: "var(--dashboard-primary)", fontSize: "0.875rem", fontWeight: "500" }}
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className={styles.appointmentsTable}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Session/Evaluation</th>
                  <th>Program Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4" style={{ color: "#6b7280" }}>
                      No appointments found
                    </td>
                  </tr>
                ) : (
                  appointments.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <User size={16} style={{ color: "#6b7280" }} />
                          {app.studentName}
                        </div>
                      </td>
                      <td>{app.itemName}</td>
                      <td>{app.programType}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Calendar size={14} style={{ color: "#6b7280" }} />
                          {formatDate(app.date)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Clock size={14} style={{ color: "#6b7280" }} />
                          {app.time}
                        </div>
                      </td>
                      <td>{app.doctor ? `Dr. ${app.doctor}` : "Admin"}</td>
                      <td>
                        <span
                          className={`${styles.appointmentStatus} ${
                            app.status === "Completed" ? styles.completed : styles.pending
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))
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
