"use client"

import { useState, useEffect } from "react"

import { Search, Calendar, Clock, Check, User, CalendarDays, Filter, Users, Eye, Edit, Trash2Icon, X, Save, AlertCircle, CheckCircle, XCircle, CalendarIcon, ClockIcon, FileText, Phone, Mail, ChevronLeft } from 'lucide-react'

import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Select from "react-select"
import styles from "../styles/appointments-management.module.css"

export function AppointmentsManagement() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Modal states
  const [viewModal, setViewModal] = useState({ open: false, appointment: null })
  const [editModal, setEditModal] = useState({ open: false, appointment: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, appointment: null })
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, appointment: null })

  // Form states
  const [editForm, setEditForm] = useState({
    date: null,
    time: null,
    description: "",
    programkind: [],
  })

  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: null,
    newTime: null,
    reason: "",
  })

  const router = useRouter()

  const departmentOptions = [
    { value: "", label: "All Departments" },
    { value: "speech", label: "Speech Therapy" },
    { value: "physical_therapy", label: "Physical Therapy" },
    { value: "ABA", label: "ABA" },
    { value: "occupational_therapy", label: "Occupational Therapy" },
    { value: "special_education", label: "Special Education" },
  ]

  const serviceOptions = [
    { value: "physical_therapy", label: "Physical Therapy" },
    { value: "ABA", label: "ABA" },
    { value: "occupational_therapy", label: "Occupational Therapy" },
    { value: "special_education", label: "Special Education" },
    { value: "speech", label: "Speech Therapy" },
  ]

  useEffect(() => {
    fetchAppointments()
  }, [currentPage, search, selectedDepartment])

  useEffect(() => {
    applyFilters()
  }, [appointments, dateFilter, statusFilter])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: search,
        department: selectedDepartment,
      })

      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/appointments?${params}`,
      )

      const appointmentsData = response.data.appointments || []
      setAppointments(appointmentsData)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...appointments]

    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter((appointment) => {
        const appointmentDate = new Date(appointment.date)
        return appointmentDate.toDateString() === filterDate.toDateString()
      })
    }

    if (statusFilter) {
      filtered = filtered.filter((appointment) => {
        if (statusFilter === "upcoming") {
          return new Date(appointment.date) > new Date() && appointment.status !== "cancelled"
        }
        if (statusFilter === "past") {
          return new Date(appointment.date) < new Date()
        }
        return appointment.status === statusFilter
      })
    }

    setFilteredAppointments(filtered)
  }

  const handleViewAppointment = async (appointmentId) => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/appointmentManagement/appointment/${appointmentId}`,
      )
      setViewModal({ open: true, appointment: response.data.appointment, moneyRecord: response.data.moneyRecord })
    } catch (error) {
      console.error("Error fetching appointment details:", error)
      alert("Error loading appointment details")
    }
  }


  const handleCancelAppointment = async (appointmentId, reason = "") => {
    try {
      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_URL}/appointmentManagement/appointment/${appointmentId}/cancel`,
        { reason },
      )

      if (response.status === 200) {
        alert("Appointment cancelled successfully!")
        setDeleteModal({ open: false, appointment: null })
        fetchAppointments()
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      alert("Error cancelling appointment")
    }
  }

  const handleRescheduleAppointment = async () => {
    try {
      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_URL}/appointmentManagement/appointment/${rescheduleModal.appointment._id}/reschedule`,
        {
          newDate: rescheduleForm.newDate,
          newTime: rescheduleForm.newTime,
          reason: rescheduleForm.reason,
        },
      )

      if (response.status === 200) {
        alert("Appointment rescheduled successfully!")
        setRescheduleModal({ open: false, appointment: null })
        fetchAppointments()
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      alert("Error rescheduling appointment")
    }
  }

  const handleCompleteAppointment = async (appointmentId, notes = "") => {
    try {
      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_URL}/appointmentManagement/appointment/${appointmentId}/complete`,
        { notes },
      )

      if (response.status === 200) {
        alert("Appointment marked as completed!")
        fetchAppointments()
      }
    } catch (error) {
      console.error("Error completing appointment:", error)
      alert("Error completing appointment")
    }
  }

  const getAppointmentStatus = (appointment) => {
    const appointmentDate = new Date(appointment.date)
    const now = new Date()

    if (appointment.status === "cancelled") {
      return { status: "cancelled", label: "Cancelled", color: "red" }
    }

    if (appointment.status === "completed") {
      return { status: "completed", label: "Completed", color: "green" }
    }

    if (appointment.status === "rescheduled") {
      return { status: "rescheduled", label: "Rescheduled", color: "orange" }
    }

    if (appointmentDate < now) {
      return { status: "past", label: "Past", color: "gray" }
    }

    return { status: "upcoming", label: "Upcoming", color: "blue" }
  }

  const getDepartmentBadges = (programKind) => {
    if (!programKind || !Array.isArray(programKind)) return []

    return programKind.map((dept) => {
      const colors = {
        speech: "speech",
        physical_therapy: "physical",
        ABA: "aba",
        occupational_therapy: "occupational",
        special_education: "special",
      }

      return {
        name: dept,
        color: colors[dept] || "default",
        label: dept.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      }
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return "N/A"
    return timeString
  }

  const displayAppointments = filteredAppointments.length > 0 ? filteredAppointments : appointments

  return (
    <div className={styles.upcomingContainer}>
      <div className={styles.upcomingCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>    
              <h2 className={styles.pageTitle}>Appointment Management</h2>
              <p className={styles.pageSubtitle}>View, edit, and manage all therapy appointments</p>
            </div>
            <div className={styles.headerActions}>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  fetchAppointments()
                }}
                className={styles.searchForm}
              >
                <div className={styles.searchInputContainer}>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Student name..."
                    className={styles.searchInput}
                  />
                  <Search className={styles.searchIcon} />
                </div>
              </form>
            </div>
          </div>
          <div className={styles.filtersContainer}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Department:</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className={styles.filterSelect}
                >
                  {departmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Date:</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={styles.filterInput}/>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}>
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setDateFilter("")
                  setStatusFilter("")
                  setSelectedDepartment("")
                  setSearch("")
                  setCurrentPage(1)
                  fetchAppointments()
                }}
                className={styles.clearFiltersButton}>
                Clear Filters
              </button>
            </div>
            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>{displayAppointments.length}</span>
                  <span className={styles.statLabel}>Total Appointments</span>
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
          ) : displayAppointments.length === 0 ? (
            <div className={styles.noData}>
              <div className={styles.emptyState}>
                <CalendarDays className={styles.emptyIcon} />
                <h3>No Appointments Found</h3>
                <p>
                  {search || selectedDepartment || dateFilter || statusFilter
                    ? "No appointments match your search criteria. Try adjusting your filters."
                    : "No appointments are currently scheduled."}
                </p>
              </div>
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
                        Date & Time
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Filter className={styles.headerIcon} />
                        Services
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <CheckCircle className={styles.headerIcon} />
                        Status
                      </div>
                    </th>
                    <th className={styles.textCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayAppointments.map((appointment, index) => {
                    const status = getAppointmentStatus(appointment)
                    const departments = getDepartmentBadges(appointment.programkind)
                    const startIndex = (currentPage - 1) * 10

                    return (
                      <tr key={appointment._id} className={styles.tableRow}>
                        <td className={styles.indexCell}>{startIndex + index + 1}</td>
                        <td className={styles.patientCell}>
                          <div className={styles.patientInfo}>
                            <span className={styles.patientName}>{appointment.patientid?.name || "N/A"}</span>
                          </div>
                        </td>
                        <td className={styles.dateCell}>
                          <div className={styles.dateInfo}>
                            <div className={styles.appointmentDate}>
                              <Calendar className={styles.dateIcon} />
                              <span className={styles.dateValue}>{formatDate(appointment.date)}</span>
                            </div>
                            <div className={styles.appointmentTime}>
                              <Clock className={styles.timeIcon} />
<span className={styles.timeValue}>{new Date(appointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>






                            </div>  
                          </div>
                        </td>
                        <td className={styles.servicesCell}>
                          <div className={styles.departmentBadges}>
                            {departments.map((dept, deptIndex) => (
                              <span key={deptIndex} className={`${styles.departmentBadge} ${styles[dept.color]}`}>
                                {dept.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className={styles.typeCell}>
                          <span
                            className={`${styles.typeBadge} ${
                              status.color === "green"
                                ? "completed"
                                : status.color === "red"
                                  ? "assessment"
                                  : status.color === "orange"
                                    ? "pending"
                                    : status.color === "gray"
                                      ? "pending"
                                      : "active"
                            }`}
                          >
                            {status.color === "green" ? (
                              <CheckCircle className={styles.statusIcon} />
                            ) : status.color === "red" ? (
                              <XCircle className={styles.statusIcon} />
                            ) : (
                              <Clock className={styles.statusIcon} />
                            )}
                            {status.label}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleViewAppointment(appointment._id)}
                              className={`${styles.actionButton} ${styles.viewButton}`}
                              title="View Details"
                            >
                              <Eye className={styles.actionIcon} />
                            </button>
                            {status.status === "upcoming" && (
                              <>
                               
                                <button
                                  onClick={() => setRescheduleModal({ open: true, appointment })}
                                  className={`${styles.actionButton} ${styles.rescheduleButton}`}
                                  title="Reschedule"
                                >
                                  <CalendarIcon className={styles.actionIcon} />
                                </button>
                                <button
                                  onClick={() => handleCompleteAppointment(appointment._id)}
                                  className={`${styles.actionButton} ${styles.completeButton}`}
                                  title="Mark as Completed"
                                >
                                  <Check className={styles.actionIcon} />
                                </button>
                                <button
                                  onClick={() => setDeleteModal({ open: true, appointment })}
                                  className={`${styles.actionButton} ${styles.deleteButton}`}
                                  title="Cancel Appointment"
                                >
                                  <Trash2Icon className={styles.actionIcon} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {displayAppointments.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, displayAppointments.length)} of{" "}
                {displayAppointments.length} appointments
              </span>
              <div className={styles.paginationButtons}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.active : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Appointment Details</h3>
              <button onClick={() => setViewModal({ open: false, appointment: null })} className={styles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              {viewModal.appointment && (
                <div className={styles.patientDetails}>
                  <div className={styles.detailSection}>
                    <h4>Student Information</h4>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <User className={styles.detailIcon} />
                        <span>Name: {viewModal.appointment.patientid?.name}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <Mail className={styles.detailIcon} />
                        <span>Email: {viewModal.appointment.patientid?.email}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <Phone className={styles.detailIcon} />
                        <span>Phone: {viewModal.appointment.patientid?.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Appointment Information</h4>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <CalendarIcon className={styles.detailIcon} />
                        <span>Date: {formatDate(viewModal.appointment.date)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <ClockIcon className={styles.detailIcon} />
<span>Time: {new Date(viewModal.appointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>







                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Services</h4>
                    <div className={styles.servicesList}>
                      {getDepartmentBadges(viewModal.appointment.programkind).map((dept, index) => (
                        <span key={index} className={`${styles.serviceBadge} ${styles[dept.color]}`}>
                          {dept.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {viewModal.moneyRecord && (
                    <div className={styles.detailSection}>
                      <h4>Payment Information</h4>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <span>Amount: ${viewModal.moneyRecord.price}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span>Status: {viewModal.moneyRecord.status}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span>Invoice: {viewModal.moneyRecord.invoiceId}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    
      {/* Reschedule Modal */}
      {rescheduleModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Reschedule Appointment</h3>
              <button
                onClick={() => setRescheduleModal({ open: false, appointment: null })}
                className={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>New Date:</label>
                <DatePicker
                  selected={rescheduleForm.newDate}
                  onChange={(date) => setRescheduleForm({ ...rescheduleForm, newDate: date })}
                  className={styles.formInput}
                  dateFormat="MMMM dd, yyyy"
                  minDate={new Date()}
                />
              </div>
              <div className={styles.formGroup}>
                <label>New Time:</label>
                <input
                  type="time"
  value={rescheduleForm.newTime || ""}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newTime: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Reason for Rescheduling:</label>
                <textarea
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  className={styles.formTextarea}
                  rows={3}
                  placeholder="Optional reason for rescheduling..."
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setRescheduleModal({ open: false, appointment: null })}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button onClick={handleRescheduleAppointment} className={styles.completeActionButton}>
                  <CalendarIcon size={16} />
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete/Cancel Modal */}
      {deleteModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Cancel Appointment</h3>
              <button onClick={() => setDeleteModal({ open: false, appointment: null })} className={styles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.confirmationMessage}>
                <AlertCircle className={styles.confirmIcon} />
                <p>Are you sure you want to cancel this appointment?</p>
                <p>Student: {deleteModal.appointment?.patientid?.name}</p>
                <p>Date: {formatDate(deleteModal.appointment?.date)}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Cancellation Reason:</label>
                <textarea
                  placeholder="Please provide a reason for cancellation..."
                  className={styles.formTextarea}
                  rows={3}
                  id="cancellationReason"
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setDeleteModal({ open: false, appointment: null })}
                  className={styles.cancelButton}
                >
                  Keep Appointment
                </button>
                <button
                  onClick={() => {
                    const reason = document.getElementById("cancellationReason").value
                    handleCancelAppointment(deleteModal.appointment._id, reason)
                  }}
                  className={styles.deleteButton}
                >
                  <Trash2 size={16} />
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentsManagement
