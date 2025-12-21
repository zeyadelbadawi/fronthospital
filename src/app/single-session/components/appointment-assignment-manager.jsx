"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Calendar,
  Clock,
  User,
  Filter,
  Users,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  CalendarIcon,
  ClockIcon,
  Loader,
  Grid3x3,
  List,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { getCurrentUser } from "../utils/auth-utils"

import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/appointments-management.module.css"
import { sendNotification } from "@/helper/notification-helper"

export function AppointmentAssignmentManager() {
  const [appointments, setAppointments] = useState([])
  const [separatedAppointments, setSeparatedAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [viewMode, setViewMode] = useState("table")
  const [assignments, setAssignments] = useState({})
  const [expandedGroups, setExpandedGroups] = useState({})

  // Modal states
  const [assignModal, setAssignModal] = useState({ open: false, appointment: null, department: null })
  const [confirmModal, setConfirmModal] = useState({ open: false, data: null })
  const [availableDoctors, setAvailableDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)

  const departmentOptions = [
    { value: "", label: "All Departments" },
    { value: "Speech", label: "Speech Therapy" },
    { value: "PhysicalTherapy", label: "Physical Therapy" },
    { value: "Psychotherapy", label: "Psychotherapy" },
    { value: "ABA", label: "ABA" },
    { value: "OccupationalTherapy", label: "Occupational Therapy" },
    { value: "SpecialEducation", label: "Special Education" },
  ]

  const user = getCurrentUser()

  useEffect(() => {
    fetchAppointments()
  }, [currentPage, search, selectedDepartment])

  useEffect(() => {
    applyFilters()
  }, [appointments, dateFilter, statusFilter])

  useEffect(() => {
    separateAppointmentsByDepartment()
  }, [appointments])

  const fetchAllAssignments = async () => {
    try {
      const appointmentIds = appointments.map((apt) => apt._id)
      const assignmentPromises = appointmentIds.flatMap((aptId) => {
        const apt = appointments.find((a) => a._id === aptId)
        if (!apt || !apt.programkind) return []
        return apt.programkind.map((dept) =>
          getExistingAssignment(aptId, dept).then((assignment) => ({
            key: `${aptId}-${dept}`,
            assignment,
          })),
        )
      })

      const results = await Promise.all(assignmentPromises)
      const assignmentsMap = {}
      results.forEach(({ key, assignment }) => {
        assignmentsMap[key] = assignment
      })
      setAssignments(assignmentsMap)
    } catch (error) {
      console.error("Error fetching assignments:", error)
    }
  }

  useEffect(() => {
    if (appointments.length > 0) {
      fetchAllAssignments()
    }
  }, [appointments])

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

      // Only show FULLY_PAID appointments and exclude completed ones
      const paidAppointments = appointmentsData.filter((appointment) => {
        return appointment.paymentStatus === "FULLY_PAID" && appointment.status !== "completed"
      })

      setAppointments(paidAppointments)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const separateAppointmentsByDepartment = () => {
    const separated = []

    appointments.forEach((appointment) => {
      if (appointment.programkind && Array.isArray(appointment.programkind)) {
        appointment.programkind.forEach((department) => {
          separated.push({
            ...appointment,
            assignmentDepartment: department,
            uniqueId: `${appointment._id}-${department}`,
          })
        })
      }
    })

    setSeparatedAppointments(separated)
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

    const sortedFiltered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a._id)
      const dateB = new Date(b.createdAt || b._id)
      return dateB - dateA // Descending order (newest first)
    })

    setFilteredAppointments(sortedFiltered)
  }

  const fetchAvailableDoctorsForDepartment = async (department, appointmentId) => {
    setLoadingDoctors(true)
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/doctors?departments=${encodeURIComponent(department)}`,
      )

      let doctors = response.data.doctors || []

      doctors = doctors.filter((doc) => {
        if (!doc.departments || doc.departments.length === 0) {
          return false
        }

        const normalizedRequestedDept = normalizeDepartmentName(department)

        const hasMatchingDept = doc.departments.some((dept) => {
          const normalizedDocDept = normalizeDepartmentName(dept.name)
          return normalizedDocDept === normalizedRequestedDept
        })

        return hasMatchingDept
      })

      const assignmentKey = `${appointmentId}-${department}`
      const existingAssignment = assignments[assignmentKey]

      if (existingAssignment && existingAssignment.doctorId) {
        doctors = doctors.filter((doc) => doc._id !== existingAssignment.doctorId._id)
      }

      setAvailableDoctors(doctors)
    } catch (error) {
      console.error("Error fetching doctors:", error)
      setAvailableDoctors([])
    } finally {
      setLoadingDoctors(false)
    }
  }

  const getExistingAssignment = async (appointmentId, department) => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/single-session-appointment-assignment/appointment/${appointmentId}?department=${department}`,
      )
      return response.data.assignment || null
    } catch (error) {
      return null
    }
  }

  const handleOpenAssignModal = async (appointment, department) => {
    setAssignModal({ open: true, appointment, department })
    await fetchAvailableDoctorsForDepartment(department, appointment._id)
  }

  const handleAssignDoctor = (doctor) => {
    setConfirmModal({
      open: true,
      data: {
        doctor,
        appointment: assignModal.appointment,
        department: assignModal.department,
      },
    })
  }

  const confirmAssignment = async () => {
    const { doctor, appointment, department } = confirmModal.data

    try {
      const assignmentData = {
        doctorId: doctor._id,
        appointmentId: appointment._id,
        patientId: appointment.patientid._id,
        department: department,
        assignedBy: user?.id,
      }

      const existingAssignment = assignments[`${appointment._id}-${department}`]

      if (existingAssignment) {
        // This is a reassignment - update existing assignment
        const response = await axiosInstance.put(
          `${process.env.NEXT_PUBLIC_API_URL}/single-session-appointment-assignment/${existingAssignment._id}`,
          assignmentData,
        )

        await sendNotification({
          isList: false,
          title: `Appointment Assignment Removed`,
          message: `You have been removed from ${appointment.patientid?.name || "Student"}'s ${department} appointment on ${formatDate(appointment.date)} at ${formatTime(appointment.time)}. A new doctor has been assigned.`,
          receiverId: response.data.oldDoctorId,
          rule: "Doctor",
          type: "assignment",
        })

        await sendNotification({
          isList: false,
          title: `New Appointment Assignment`,
          message: `You have been assigned to ${appointment.patientid?.name || "Student"}'s ${department} appointment on ${formatDate(appointment.date)} at ${formatTime(appointment.time)}`,
          receiverId: doctor._id,
          rule: "Doctor",
          type: "assignment",
        })

        alert("Doctor reassigned successfully!")
      } else {
        // This is a new assignment
        await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_API_URL}/single-session-appointment-assignment/assign`,
          assignmentData,
        )

        await sendNotification({
          isList: false,
          title: `New Appointment Assignment`,
          message: `You have been assigned to ${appointment.patientid?.name || "Student"}'s ${department} appointment on ${formatDate(appointment.date)} at ${formatTime(appointment.time)}`,
          receiverId: doctor._id,
          rule: "Doctor",
          type: "assignment",
        })

        alert("Doctor assigned successfully!")
      }

      setAssignModal({ open: false, appointment: null, department: null })
      setConfirmModal({ open: false, data: null })
      await fetchAllAssignments()
    } catch (error) {
      console.error("Error assigning doctor:", error)
      alert("Error assigning doctor: " + (error.response?.data?.message || error.message))
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

  const getDepartmentLabel = (dept) => {
    const labels = {
      Speech: "Speech Therapy",
      PhysicalTherapy: "Physical Therapy",
      Psychotherapy: "Psychotherapy",
      ABA: "ABA",
      OccupationalTherapy: "Occupational Therapy",
      SpecialEducation: "Special Education",
    }
    return labels[dept] || dept
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

  const getGroupedAppointments = () => {
    const grouped = {}
    displayAppointments.forEach((apt) => {
      if (!grouped[apt._id]) {
        grouped[apt._id] = {
          appointment: apt,
          departments: [],
        }
      }
      if (!grouped[apt._id].departments.includes(apt.programkind)) {
        grouped[apt._id].departments.push(...apt.programkind)
      }
    })
    return Object.values(grouped)
  }

  const toggleGroupExpanded = (appointmentId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [appointmentId]: !prev[appointmentId],
    }))
  }

  return (
    <div className={styles.upcomingContainer}>
      <div className={styles.upcomingCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h2 className={styles.pageTitle}>Appointment Assignment Manager</h2>
              <p className={styles.pageSubtitle}>Assign doctors to therapy appointments by department</p>
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
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
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
                className={styles.clearFiltersButton}
              >
                Clear Filters
              </button>
            </div>
            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>{separatedAppointments.length}</span>
                  <span className={styles.statLabel}>Departments to Assign</span>
                </div>
              </div>
              <div className={styles.viewModeToggle}>
                <button
                  onClick={() => setViewMode("table")}
                  className={`${styles.viewModeButton} ${viewMode === "table" ? styles.active : ""}`}
                  title="Table View"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`${styles.viewModeButton} ${viewMode === "card" ? styles.active : ""}`}
                  title="Card View"
                >
                  <Grid3x3 size={18} />
                </button>
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
          ) : separatedAppointments.length === 0 ? (
            <div className={styles.noData}>
              <div className={styles.emptyState}>
                <Calendar className={styles.emptyIcon} />
                <h3>No Appointments to Assign</h3>
                <p>
                  {search || selectedDepartment || dateFilter || statusFilter
                    ? "No appointments match your search criteria. Try adjusting your filters."
                    : "No fully paid appointments are available for assignment."}
                </p>
              </div>
            </div>
          ) : viewMode === "table" ? (
            <GroupedTableView
              groupedAppointments={getGroupedAppointments()}
              onAssign={handleOpenAssignModal}
              formatDate={formatDate}
              formatTime={formatTime}
              getDepartmentLabel={getDepartmentLabel}
              getAppointmentStatus={getAppointmentStatus}
              expandedGroups={expandedGroups}
              toggleGroupExpanded={toggleGroupExpanded}
              assignments={assignments}
              currentPage={currentPage}
            />
          ) : (
            <CardView
              appointments={separatedAppointments}
              onAssign={handleOpenAssignModal}
              formatDate={formatDate}
              formatTime={formatTime}
              getDepartmentLabel={getDepartmentLabel}
              getAppointmentStatus={getAppointmentStatus}
              assignments={assignments}
            />
          )}

          {separatedAppointments.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, separatedAppointments.length)} of{" "}
                {separatedAppointments.length} departments
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

      {/* Assign Modal */}
      {assignModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Assign Doctor to {getDepartmentLabel(assignModal.department)}</h3>
              <button
                onClick={() => setAssignModal({ open: false, appointment: null, department: null })}
                className={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.appointmentInfo}>
                <h4>Appointment Details</h4>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <User className={styles.detailIcon} />
                    <span>Student: {assignModal.appointment?.patientid?.name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <CalendarIcon className={styles.detailIcon} />
                    <span>Date: {formatDate(assignModal.appointment?.date)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <ClockIcon className={styles.detailIcon} />
                    <span>Time: {formatTime(assignModal.appointment?.time)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.doctorSelectionSection}>
                <h4>Select Doctor</h4>
                {loadingDoctors ? (
                  <div className={styles.loadingContainer}>
                    <Loader className={styles.loadingSpinner} />
                    <p>Loading available doctors...</p>
                  </div>
                ) : availableDoctors.length === 0 ? (
                  <div className={styles.noData}>
                    <AlertCircle className={styles.emptyIcon} />
                    <p>No doctors available for this department</p>
                  </div>
                ) : (
                  <div className={styles.doctorsList}>
                    {availableDoctors.map((doctor) => (
                      <div key={doctor._id} className={styles.doctorCard}>
                        <div className={styles.doctorInfo}>
                          <div className={styles.doctorAvatar}>
                            <User size={24} />
                          </div>
                          <div className={styles.doctorDetails}>
                            <p className={styles.doctorName}>{doctor.username || doctor.email}</p>
                            <p className={styles.doctorEmail}>{doctor.email}</p>
                          </div>
                        </div>
                        <button onClick={() => handleAssignDoctor(doctor)} className={styles.assignButton}>
                          <Plus size={16} />
                          Assign
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Confirm Assignment</h3>
              <button onClick={() => setConfirmModal({ open: false, data: null })} className={styles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.confirmationMessage}>
                <CheckCircle className={styles.confirmIcon} />
                <p>Are you sure you want to assign this doctor?</p>
                <div className={styles.confirmDetails}>
                  <p>
                    <strong>Doctor:</strong> {confirmModal.data?.doctor?.username || confirmModal.data?.doctor?.email}
                  </p>
                  <p>
                    <strong>Student:</strong> {confirmModal.data?.appointment?.patientid?.name}
                  </p>
                  <p>
                    <strong>Department:</strong> {getDepartmentLabel(confirmModal.data?.department)}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(confirmModal.data?.appointment?.date)}
                  </p>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button onClick={() => setConfirmModal({ open: false, data: null })} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={confirmAssignment} className={styles.completeActionButton}>
                  <CheckCircle size={16} />
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GroupedTableView({
  groupedAppointments,
  onAssign,
  formatDate,
  formatTime,
  getDepartmentLabel,
  getAppointmentStatus,
  expandedGroups,
  toggleGroupExpanded,
  assignments,
  currentPage,
}) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.appointmentsTable}>
        <thead>
          <tr className={styles.tableHeader}>
            <th></th>
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
                Departments
              </div>
            </th>
            <th>
              <div className={styles.headerCell}>
                <CheckCircle className={styles.headerIcon} />
                Status
              </div>
            </th>
            <th className={styles.textCenter}>Action</th>
          </tr>
        </thead>
        <tbody>
          {groupedAppointments.flatMap((group, groupIndex) => {
            const appointment = group.appointment
            const status = getAppointmentStatus(appointment)
            const isExpanded = expandedGroups[appointment._id]
            const departmentCount = group.departments.length
            const rowHeight = Math.max(80, 40 + departmentCount * 45)

            const rows = [
              // Parent Row
              <tr
                key={`parent-${appointment._id}`}
                className={styles.appointmentGroupRow}
                style={{ height: `${rowHeight}px` }}
              >
                <td className={styles.expandCell}>
                  <button
                    onClick={() => toggleGroupExpanded(appointment._id)}
                    className={styles.expandButton}
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </td>
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
                      <span className={styles.timeValue}>{formatTime(appointment.time)}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.servicesCell}>
                  <div className={styles.departmentBadges}>
                    {group.departments.map((dept) => (
                      <span key={dept} className={`${styles.departmentBadge} ${styles.speech}`}>
                        {getDepartmentLabel(dept)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className={styles.typeCell}>
                  <span
                    className={`${styles.typeBadge} ${status.color === "green"
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
                <td className={styles.actionsCell}></td>
              </tr>,
            ]

            // Child Rows - Department Details
            if (isExpanded) {
              group.departments.forEach((department, deptIndex) => {
                const assignmentKey = `${appointment._id}-${department}`
                const assignment = assignments[assignmentKey]
                rows.push(
                  <tr key={`${appointment._id}-dept-${deptIndex}-${department}`} className={styles.departmentChildRow}>
                    <td></td>
                    <td colSpan="2">
                      <div className={styles.departmentRowContent}>
                        <span className={styles.departmentLabel}>{getDepartmentLabel(department)}</span>
                      </div>
                    </td>
                    <td className={styles.assignmentStatusCell}>
                      {assignment ? (
                        <div className={styles.assignedDoctorInfo}>
                          <User size={16} className={styles.doctorIcon} />
                          <span className={styles.assignedDoctorName}>
                            {assignment.doctorId?.username || assignment.doctorId?.email}
                          </span>
                        </div>
                      ) : (
                        <span className={styles.unassignedBadge}>Unassigned</span>
                      )}
                    </td>
                    <td></td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => onAssign(appointment, department)}
                        className={`${styles.actionButton} ${styles.completeButton}`}
                        title={assignment ? "Reassign Doctor" : "Assign Doctor"}
                      >
                        {assignment ? "✎" : <Plus className={styles.actionIcon} />}
                      </button>
                    </td>
                  </tr>,
                )
              })
            }

            return rows
          })}
        </tbody>
      </table>
    </div>
  )
}

function CardView({
  appointments,
  onAssign,
  formatDate,
  formatTime,
  getDepartmentLabel,
  getAppointmentStatus,
  assignments,
}) {
  return (
    <div className={styles.cardsGrid}>
      {appointments.map((appointment) => {
        const status = getAppointmentStatus(appointment)
        const assignmentKey = `${appointment._id}-${appointment.assignmentDepartment}`
        const assignment = assignments[assignmentKey]

        return (
          <div key={appointment.uniqueId} className={styles.appointmentCard}>
            <div className={styles.cardTop}>
              <div className={styles.cardPatientInfo}>
                <User className={styles.cardIcon} />
                <div>
                  <p className={styles.cardPatientName}>{appointment.patientid?.name || "N/A"}</p>
                  <p className={styles.cardPatientEmail}>{appointment.patientid?.email}</p>
                </div>
              </div>
              <span
                className={`${styles.typeBadge} ${status.color === "green"
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
                {status.label}
              </span>
            </div>

            <div className={styles.cardDetails}>
              <div className={styles.detailRow}>
                <Calendar className={styles.detailIcon} />
                <span>{formatDate(appointment.date)}</span>
              </div>
              <div className={styles.detailRow}>
                <Clock className={styles.detailIcon} />
                <span>{formatTime(appointment.time)}</span>
              </div>
              <div className={styles.detailRow}>
                <Filter className={styles.detailIcon} />
                <span className={`${styles.departmentBadge} ${styles.speech}`}>
                  {getDepartmentLabel(appointment.assignmentDepartment)}
                </span>
              </div>
              {assignment && (
                <div className={styles.detailRow}>
                  <User className={styles.detailIcon} />
                  <span className={styles.assignedDoctorName}>
                    Assigned to: {assignment.doctorId?.username || assignment.doctorId?.email}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => onAssign(appointment, appointment.assignmentDepartment)}
              className={styles.cardAssignButton}
            >
              <Plus size={16} />
              {assignment ? "Reassign Doctor" : "Assign Doctor"}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function normalizeDepartmentName(name) {
  if (!name) return ""

  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[-_\s]/g, "") // Remove underscores, hyphens, and spaces

  const departmentMap = {
    speech: "speech",
    speechtherapy: "speech",
    speechlanguagepathology: "speech",
    physicaltherapy: "physicaltherapy",
    pt: "physicaltherapy",
    physiotherapy: "physicaltherapy",
    aba: "aba",
    appliedbehavioranalysis: "aba",
    occupationaltherapy: "occupationaltherapy",
    ot: "occupationaltherapy",
    specialeducation: "specialeducation",
    specialed: "specialeducation",
    sped: "specialeducation",
    psychotherapy: "psychotherapy",
  }

  return departmentMap[normalized] || normalized
}

export default AppointmentAssignmentManager
