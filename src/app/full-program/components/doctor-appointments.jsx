"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Calendar,
  Clock,
  User,
  FileText,
  X,
  Save,
  CheckCircle,
  XCircle,
  RotateCcw,
  DollarSign,
} from "lucide-react"
import styles from "../styles/doctor-appointments.module.css"
import axiosInstance from "@/helper/axiosSetup"
import { sendNotification } from "@/helper/notification-helper"

export function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTimeframe, setFilterTimeframe] = useState("all")
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all")
  const [itemsPerPage] = useState(10)

  // Modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
    reason: "",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAllAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, search, filterStatus, filterTimeframe, filterPaymentStatus])

  const fetchPatientName = async (patientId) => {
    try {
      const response = await axiosInstance.get(`/authentication/patient/${patientId}`)
      return response.data.name || `Student-${patientId}`
    } catch (error) {
      console.error("Error fetching Student name:", error)
      return `Student-${patientId}`
    }
  }

  const fetchAllAppointments = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get("/full/fullprogram")
      const data = response.data

      // Fetch patient names for all appointments
      const appointmentsWithNames = await Promise.all(
        data.map(async (appointment) => {
          const patientName = await fetchPatientName(appointment.patientid)
          return {
            ...appointment,
            patientName: patientName,
          }
        }),
      )

      // Sort appointments by date and time
      const sortedAppointments = appointmentsWithNames.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`)
        const dateTimeB = new Date(`${b.date}T${b.time}`)
        return dateTimeB - dateTimeA // Most recent first
      })

      setAppointments(
        sortedAppointments.filter(
          (app) =>
            app.programType === "full_program" &&
            (app.paymentStatus === "PARTIALLY_PAID" || app.paymentStatus === "FULLY_PAID"),
        ),
      )
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (appointment) =>
          (appointment.patientName && appointment.patientName.toLowerCase().includes(search.toLowerCase())) ||
          (appointment.description && appointment.description.toLowerCase().includes(search.toLowerCase())),
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === filterStatus)
    }

    // Timeframe filter
    if (filterTimeframe !== "all") {
      const now = new Date()
      filtered = filtered.filter((appointment) => {
        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
        if (filterTimeframe === "upcoming") {
          return appointmentDateTime > now
        } else if (filterTimeframe === "past") {
          return appointmentDateTime <= now
        }
        return true
      })
    }

    // Payment status filter
    if (filterPaymentStatus !== "all") {
      filtered = filtered.filter((appointment) => appointment.paymentStatus === filterPaymentStatus)
    }

    setFilteredAppointments(filtered)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    filterAppointments()
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const parseAppointmentDateTime = (date, time) => {
    if (!date || !time) {
      console.error("Invalid date or time:", date, time)
      return null
    }
    const dateParts = date.split("T")[0]
    const timeParts = time.split("T")[1]?.split("Z")[0] || time
    const formattedTime = timeParts.includes(":") && timeParts.split(":").length === 2 ? timeParts + ":00" : timeParts
    const formattedDateTime = `${dateParts}T${formattedTime}`
    return new Date(formattedDateTime)
  }

  const getAppointmentStatus = (appointment) => {
    const currentDateTime = new Date()
    const appointmentDateTime = parseAppointmentDateTime(appointment.date, appointment.time)
    const isPast = appointmentDateTime < currentDateTime

    if (appointment.status === "completed") {
      return { type: "completed", label: "Completed", isPast }
    } else if (appointment.status === "active") {
      return { type: "active", label: "Active", isPast }
    } else if (appointment.status === "cancelled") {
      return { type: "cancelled", label: "Cancelled", isPast }
    } else if (isPast) {
      return { type: "overdue", label: "Overdue", isPast }
    } else {
      return { type: "upcoming", label: "Upcoming", isPast }
    }
  }

  const getPaymentStatusBadge = (appointment) => {
    const { paymentStatus, paymentPercentage } = appointment

    switch (paymentStatus) {
      case "FULLY_PAID":
        return <span className={`${styles.paymentBadge} ${styles.fullyPaid}`}>Fully Paid</span>
      case "PARTIALLY_PAID":
        return (
          <span className={`${styles.paymentBadge} ${styles.partiallyPaid}`}>
            Partially Paid ({paymentPercentage || 0}%)
          </span>
        )
      case "PENDING":
        return <span className={`${styles.paymentBadge} ${styles.partiallyPaid}`}>PENDING 0 %</span>
    }
  }

  const handleMarkAsActive = async (appointmentId) => {
    try {
      setSaving(true)
      const response = await axiosInstance.put(`/full/fullprogram/${appointmentId}`, {
        status: "active",
      })

      const appointmentToUpdate = appointments.find((app) => app._id === appointmentId)
      if (appointmentToUpdate) {
        try {
          const accountantIdsResponse = await axiosInstance.get("/notification/accountant-ids")
          const accountantIdsList = accountantIdsResponse.data

          console.log("[v0] Accountant IDs fetched:", accountantIdsList)

          if (accountantIdsList && accountantIdsList.length > 0) {
            console.log("[v0] Sending notification to accountants:", accountantIdsList)

            await sendNotification({
              isList: true,
              receiverIds: accountantIdsList,
              rule: "Accountant",
              title: "Patient Ready for Payment",
              titleAr: "المريض جاهز للدفع",
              message: `${appointmentToUpdate.patientName} has finished their evaluation session and is ready for payment. You will find their record in the Full Program Payment page.`,
              messageAr: `${appointmentToUpdate.patientName} انتهى من جلسة التقييم وجاهز للدفع. ستجد سجله في صفحة دفع البرنامج الكامل.`,
              type: "payment_ready",
            })

            console.log("[v0] Notification sent successfully to accountants")
          } else {
            console.log("[v0] No accountants found to notify")
          }
        } catch (notificationError) {
          console.error("[v0] Error sending notification to accountants:", notificationError)
          // Don't fail the appointment marking if notification fails
        }
      }

      setAppointments(appointments.map((app) => (app._id === appointmentId ? { ...app, status: "active" } : app)))
      alert("Appointment marked as active! Student can now proceed to payment.")
    } catch (error) {
      console.error("Error marking appointment as active:", error)
      alert("Error marking appointment as active")
    } finally {
      setSaving(false)
    }
  }

  const handleMarkAsDone = async (appointmentId) => {
    try {
      setSaving(true)
      const response = await axiosInstance.put(`/full/fullprogram/${appointmentId}`, {
        status: "completed",
      })
      setAppointments(appointments.map((app) => (app._id === appointmentId ? { ...app, status: "completed" } : app)))
      alert("Appointment marked as completed!")
    } catch (error) {
      console.error("Error marking appointment as done:", error)
      alert("Error marking appointment as done")
    } finally {
      setSaving(false)
    }
  }

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleData({
      date: appointment.date.split("T")[0],
      time: appointment.time,
      reason: "",
    })
    setShowRescheduleModal(true)
  }

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowCancelModal(true)
  }

  const handleSaveReschedule = async () => {
    setSaving(true)
    try {
      const response = await axiosInstance.put(`/full/fullprogram/${selectedAppointment._id}`, {
        date: rescheduleData.date,
        time: rescheduleData.time,
        description: `${selectedAppointment.description} [Rescheduled: ${rescheduleData.reason}]`,
      })
      const updatedAppointments = appointments.map((app) => (app._id === selectedAppointment._id ? response.data : app))
      setAppointments(updatedAppointments)
      setShowRescheduleModal(false)
      setSelectedAppointment(null)
      alert("Appointment rescheduled successfully!")
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      alert("Error rescheduling appointment: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmCancel = async () => {
    setSaving(true)
    try {
      const response = await axiosInstance.put(`/full/fullprogram/${selectedAppointment._id}`, {
        status: "cancelled",
      })
      setAppointments(
        appointments.map((app) => (app._id === selectedAppointment._id ? { ...app, status: "cancelled" } : app)),
      )
      setShowCancelModal(false)
      setSelectedAppointment(null)
      alert("Appointment cancelled successfully!")
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      alert("Error cancelling appointment: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const closeModals = () => {
    setShowRescheduleModal(false)
    setShowCancelModal(false)
    setShowViewModal(false)
    setSelectedAppointment(null)
    setRescheduleData({ date: "", time: "", reason: "" })
  }

  const getActionButtons = (appointment) => {
    const status = getAppointmentStatus(appointment)

    if (appointment.status === "cancelled") {
      return (
        <div className={styles.actionButtons}>
          <span className={styles.cancelledText}>Cancelled</span>
        </div>
      )
    }

    if (appointment.status === "completed") {
      return (
        <div className={styles.actionButtons}>
          <span className={styles.completedText}>Completed</span>
        </div>
      )
    }

    // Full Program specific logic
    if (appointment.programType === "full_program") {
      if (appointment.status === "not active") {
        return (
          <div className={styles.actionButtons}>
            <button
              className={`${styles.actionButton} ${styles.activateButton}`}
              onClick={() => handleMarkAsActive(appointment._id)}
              title="Mark as Active"
              disabled={saving}
            >
              <CheckCircle className={styles.actionIcon} />
            </button>
            <button
              onClick={() => handleReschedule(appointment)}
              className={`${styles.actionButton} ${styles.rescheduleButton}`}
              title="Reschedule"
              disabled={saving}
            >
              <RotateCcw className={styles.actionIcon} />
            </button>
            <button
              onClick={() => handleCancelAppointment(appointment)}
              className={`${styles.actionButton} ${styles.cancelButton}`}
              title="Cancel"
              disabled={saving}
            >
              <XCircle className={styles.actionIcon} />
            </button>
          </div>
        )
      } else if (appointment.status === "active") {
        // Check if this is a full program and show appropriate status
        if (appointment.programType === "full_program") {
          if (appointment.paymentStatus === "FULLY_PAID") {
            return (
              <div className={styles.actionButtons}>
                <span className={styles.paidText}>Paid</span>
              </div>
            )
          } else {
            return (
              <div className={styles.actionButtons}>
                <span className={styles.activeText}>Ready for Payment</span>
              </div>
            )
          }
        } else {
          return (
            <div className={styles.actionButtons}>
              <span className={styles.activeText}>Active</span>
            </div>
          )
        }
      }
    }

    // For other program types
    if (appointment.status === "active") {
      // Check if this is a full program and show payment status
      if (appointment.programType === "full_program") {
        if (appointment.paymentStatus === "FULLY_PAID") {
          return (
            <div className={styles.actionButtons}>
              <span className={styles.paidText}>Paid</span>
            </div>
          )
        } else {
          return (
            <div className={styles.actionButtons}>
              <span className={styles.activeText}>Ready for Payment</span>
            </div>
          )
        }
      } else {
        return (
          <div className={styles.actionButtons}>
            <span className={styles.activeText}>Active</span>
          </div>
        )
      }
    }

    // For upcoming appointments or overdue ones
    if (status.type === "upcoming") {
      return (
        <div className={styles.actionButtons}>
          <button
            onClick={() => handleReschedule(appointment)}
            className={`${styles.actionButton} ${styles.rescheduleButton}`}
            title="Reschedule"
            disabled={saving}
          >
            <RotateCcw className={styles.actionIcon} />
          </button>
          <button
            onClick={() => handleCancelAppointment(appointment)}
            className={`${styles.actionButton} ${styles.cancelButton}`}
            title="Cancel"
            disabled={saving}
          >
            <XCircle className={styles.actionIcon} />
          </button>
        </div>
      )
    }

    if (status.type === "overdue") {
      return (
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionButton} ${styles.markDoneButton}`}
            onClick={() => handleMarkAsDone(appointment._id)}
            title="Mark as Done"
            disabled={saving}
          >
            <Save className={styles.actionIcon} />
          </button>
        </div>
      )
    }

    return null
  }

  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex)

  // Statistics
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter((app) => {
      const appointmentDateTime = parseAppointmentDateTime(app.date, app.time)
      return appointmentDateTime > new Date() && app.status !== "cancelled"
    }).length,
    active: appointments.filter((app) => app.status === "active").length,
    completed: appointments.filter((app) => app.status === "completed").length,
    pendingPayment: appointments.filter(
      (app) => app.paymentStatus === "PENDING" || app.paymentStatus === "PARTIALLY_PAID",
    ).length,
  }

  return (
    <div className={styles.upcomingContainer}>
      <div className={styles.upcomingCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h2 className={styles.pageTitle}>Doctor Appointments Dashboard</h2>
              <p className={styles.pageSubtitle}>Manage all Student appointments and track payment status</p>
            </div>
            <div className={styles.headerActions}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.searchInputContainer}>
                  <input
                    type="text"
                    className={styles.searchInput}
                    name="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search appointments..."
                  />
                  <Search className={styles.searchIcon} />
                </div>
              </form>
            </div>
          </div>
          <div className={styles.filtersContainer}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <select
                  className={styles.filterSelect}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="not active">Not Active</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Timeframe</label>
                <select
                  className={styles.filterSelect}
                  value={filterTimeframe}
                  onChange={(e) => setFilterTimeframe(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Payment</label>
                <select
                  className={styles.filterSelect}
                  value={filterPaymentStatus}
                  onChange={(e) => setFilterPaymentStatus(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="FULLY_PAID">Fully Paid</option>
                </select>
              </div>
              {(filterStatus !== "all" || filterTimeframe !== "all" || filterPaymentStatus !== "all") && (
                <button
                  onClick={() => {
                    setFilterStatus("all")
                    setFilterTimeframe("all")
                    setFilterPaymentStatus("all")
                  }}
                  className={styles.clearFiltersButton}
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Calendar className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.total}</div>
                  <div className={styles.statLabel}>Total</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Clock className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.upcoming}</div>
                  <div className={styles.statLabel}>Upcoming</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Save className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.active}</div>
                  <div className={styles.statLabel}>Active</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CheckCircle className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.completed}</div>
                  <div className={styles.statLabel}>Completed</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <DollarSign className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.pendingPayment}</div>
                  <div className={styles.statLabel}>Pending Payment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading appointments...</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.appointmentsTable}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th>#</th>
                    <th>
                      <div className={styles.headerCell}>
                        <User className={styles.headerIcon} />
                        Student
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Calendar className={styles.headerIcon} />
                        Date
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Clock className={styles.headerIcon} />
                        Time
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <FileText className={styles.headerIcon} />
                        Program Type
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <DollarSign className={styles.headerIcon} />
                        Payment Status
                      </div>
                    </th>
                    <th>Status</th>
                    <th className={styles.textCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments && currentAppointments.length > 0 ? (
                    currentAppointments.map((appointment, index) => {
                      const status = getAppointmentStatus(appointment)
                      return (
                        <tr key={appointment._id} className={styles.tableRow}>
                          <td className={styles.indexCell}>{startIndex + index + 1}</td>
                          <td className={styles.patientCell}>
                            <div className={styles.patientInfo}>
                              <span className={styles.patientName}>
                                {appointment.patientName || `Student-${appointment.patientid}`}
                              </span>
                            </div>
                          </td>
                          <td className={styles.dateCell}>
                            <div className={styles.dateInfo}>
                              <span className={styles.dateValue}>
                                {new Date(appointment.date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className={styles.dateYear}>{new Date(appointment.date).getFullYear()}</span>
                            </div>
                          </td>
                          <td className={styles.timeCell}>
                            <span className={styles.timeValue}>{appointment.time}</span>
                          </td>
                          <td className={styles.programTypeCell}>
                            <span className={`${styles.programBadge} ${styles[appointment.programType]}`}>
                              {appointment.programType?.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                          <td className={styles.paymentStatusCell}>
                            {getPaymentStatusBadge(appointment)}
                            {appointment.totalAmount && (
                              <div className={styles.paymentDetails}>
                                <small>
                                  {appointment.paidAmount || 0}/{appointment.totalAmount} AED
                                </small>
                              </div>
                            )}
                          </td>
                          <td className={styles.statusCell}>
                            <span className={`${styles.statusBadge} ${styles[status.type]}`}>{status.label}</span>
                          </td>
                          <td className={styles.actionsCell}>{getActionButtons(appointment)}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className={styles.noData}>
                        <div className={styles.emptyState}>
                          <Calendar className={styles.emptyIcon} />
                          <h3>No appointments found</h3>
                          <p>
                            {search ||
                            filterStatus !== "all" ||
                            filterTimeframe !== "all" ||
                            filterPaymentStatus !== "all"
                              ? "Try adjusting your search or filters"
                              : "No appointments are scheduled at this time"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {filteredAppointments.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAppointments.length)} of{" "}
                {filteredAppointments.length} appointments
              </span>
              <div className={styles.paginationButtons}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.active : ""}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reschedule Appointment</h3>
              <button onClick={closeModals} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>New Date:</label>
                  <input
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    className={styles.formInput}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>New Time:</label>
                  <input
                    type="time"
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Reason for Reschedule:</label>
                  <textarea
                    value={rescheduleData.reason}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                    className={styles.formTextarea}
                    rows={3}
                    placeholder="Please provide a reason for rescheduling..."
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModals} className={styles.cancelButton} disabled={saving}>
                Cancel
              </button>
              <button onClick={handleSaveReschedule} className={styles.saveButton} disabled={saving}>
                <RotateCcw className={styles.buttonIcon} />
                {saving ? "Rescheduling..." : "Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedAppointment && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={`${styles.modal} ${styles.deleteModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Cancel Appointment</h3>
              <button onClick={closeModals} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteConfirmation}>
                <div className={styles.deleteIcon}>
                  <XCircle className={styles.deleteIconSvg} />
                </div>
                <h4 className={styles.deleteTitle}>Cancel Appointment?</h4>
                <p className={styles.deleteMessage}>
                  Are you sure you want to cancel the appointment for{" "}
                  <strong>{selectedAppointment.patientName || `Student-${selectedAppointment.patientid}`}</strong> on{" "}
                  <strong>{new Date(selectedAppointment.date).toLocaleDateString()}</strong> at{" "}
                  <strong>{selectedAppointment.time}</strong>?
                </p>
                <p className={styles.deleteWarning}>This action can be undone by rescheduling.</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModals} className={styles.cancelButton} disabled={saving}>
                Keep Appointment
              </button>
              <button onClick={handleConfirmCancel} className={styles.deleteConfirmButton} disabled={saving}>
                <XCircle className={styles.buttonIcon} />
                {saving ? "Cancelling..." : "Cancel Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
