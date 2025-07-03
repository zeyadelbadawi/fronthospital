"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Calendar,
  Clock,
  Check,
  X,
  User,
  CalendarDays,
  Edit3,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Save,
  AlertCircle,
  Users,
  Activity,
  Mail,
  Phone,
} from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/speech-appointments.module.css"

export function SpeechAppointments() {
  // State management
  const [schoolPrograms, setSchoolPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [newAppointment, setNewAppointment] = useState({
    date: "",
    time: "",
    description: "",
  })
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [editFormData, setEditFormData] = useState({
    date: "",
    time: "",
    description: "",
  })
  const [isCompleted, setIsCompleted] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    scheduled: 0,
    overdue: 0,
  })
  const router = useRouter()

  // Fetch school programs grouped by unicValue
  useEffect(() => {
    fetchSchoolPrograms()
  }, [currentPage, search])

  // Fetch appointments when a program is selected
  useEffect(() => {
    if (selectedProgram) {
      fetchProgramAppointments()
      checkProgramCompletionStatus()
    }
  }, [selectedProgram])

  // Calculate stats when appointments change
  useEffect(() => {
    calculateStats()
  }, [appointments])

  const calculateStats = () => {
    const now = new Date()
    const stats = appointments.reduce(
      (acc, appointment) => {
        acc.total++
        if (appointment.status === "completed") {
          acc.completed++
        } else {
          const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
          if (appointmentDateTime <= now) {
            acc.overdue++
          } else {
            acc.scheduled++
          }
        }
        return acc
      },
      { total: 0, completed: 0, scheduled: 0, overdue: 0 },
    )
    setStats(stats)
  }

  const fetchSchoolPrograms = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs?page=${currentPage}&search=${search}`,
      )

      console.log("Fetched programs:", response.data.programs)

      // Group programs by unicValue and get unique programs
      const programs = response.data.programs || []
      const uniquePrograms = []
      const seenUnicValues = new Set()

      programs.forEach((program) => {
        if (!seenUnicValues.has(program.unicValue)) {
          seenUnicValues.add(program.unicValue)
          uniquePrograms.push(program)
        }
      })

      setSchoolPrograms(uniquePrograms)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching school programs:", error)
      setSchoolPrograms([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProgramAppointments = async () => {
    if (!selectedProgram?.unicValue) return

    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/by-unic/${selectedProgram.unicValue}`,
      )

      console.log("Fetched appointments:", response.data.appointments)

      const appointmentsData = response.data.appointments || []
      setAppointments(appointmentsData)
    } catch (error) {
      console.error("Error fetching program appointments:", error)
      setAppointments([])
    }
  }

  const checkProgramCompletionStatus = async () => {
    if (!selectedProgram?.patientid) return

    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/school/school-assignments`)

      const assignments = response.data.assignments || []
      const assignment = assignments.find((a) => a.patient?._id === selectedProgram.patientid)

      setIsCompleted(assignment?.appointmentsCompleted || false)
    } catch (error) {
      console.error("Error checking completion status:", error)
      setIsCompleted(false)
    }
  }

  const handleProgramSelect = async (program) => {
    console.log("Selected program:", program)
    setSelectedProgram(program)
    setNewAppointment({ date: "", time: "", description: "" })
    setEditingAppointment(null)
    setEditFormData({ date: "", time: "", description: "" })
  }

  const handleBackToList = () => {
    setSelectedProgram(null)
    setAppointments([])
    setNewAppointment({ date: "", time: "", description: "" })
    setEditingAppointment(null)
    setEditFormData({ date: "", time: "", description: "" })
    setIsCompleted(false)
    setStats({ total: 0, completed: 0, scheduled: 0, overdue: 0 })
  }

  const validateAppointmentData = (appointmentData) => {
    const { date, time, description } = appointmentData

    if (!date || !time) {
      throw new Error("Date and time are required")
    }

    if (!description || description.trim().length < 5) {
      throw new Error("Description must be at least 5 characters long")
    }

    const appointmentDateTime = new Date(`${date}T${time}`)
    const now = new Date()

    if (appointmentDateTime <= now) {
      throw new Error("Appointment must be scheduled for a future date and time")
    }

    return true
  }

  const handleAddAppointment = async () => {
    if (isCompleted) {
      alert("Cannot add appointments. This program has been completed.")
      return
    }

    try {
      validateAppointmentData(newAppointment)
    } catch (error) {
      alert(error.message)
      return
    }

    setSaving(true)
    try {
      const appointmentData = {
        patientid: selectedProgram.patientid,
        date: newAppointment.date,
        time: newAppointment.time,
        description: newAppointment.description,
        unicValue: selectedProgram.unicValue,
        status: "not completed",
      }

      console.log("Adding appointment with data:", appointmentData)

      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/add-appointment`,
        appointmentData,
      )

      if (response.status === 201) {
        await fetchProgramAppointments()
        setNewAppointment({ date: "", time: "", description: "" })
        showSuccessMessage("Appointment added successfully!")
      }
    } catch (error) {
      console.error("Error adding appointment:", error)
      const errorMessage = error.response?.data?.message || error.message
      showErrorMessage("Error adding appointment: " + errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment._id)
    setEditFormData({
      date: appointment.date,
      time: appointment.time,
      description: appointment.description,
    })
  }

  const handleEditSave = async (appointmentId) => {
    try {
      validateAppointmentData(editFormData)
    } catch (error) {
      alert(error.message)
      return
    }

    setSaving(true)
    try {
      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/${appointmentId}`,
        editFormData,
      )

      if (response.status === 200) {
        await fetchProgramAppointments()
        setEditingAppointment(null)
        setEditFormData({ date: "", time: "", description: "" })
        showSuccessMessage("Appointment updated successfully!")
      }
    } catch (error) {
      console.error("Error updating appointment:", error)
      showErrorMessage("Error updating appointment: " + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleEditCancel = () => {
    setEditingAppointment(null)
    setEditFormData({ date: "", time: "", description: "" })
  }

  const handleCompleteAppointment = async (appointmentId) => {
    const confirmComplete = window.confirm("Are you sure you want to mark this appointment as completed?")

    if (!confirmComplete) return

    setSaving(true)
    try {
      const response = await axiosInstance.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/${appointmentId}/complete`,
      )

      if (response.status === 200) {
        await fetchProgramAppointments()
        showSuccessMessage("Appointment marked as completed!")
      }
    } catch (error) {
      console.error("Error completing appointment:", error)
      showErrorMessage("Error completing appointment: " + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment? This action cannot be undone.",
    )

    if (!confirmCancel) return

    setSaving(true)
    try {
      const response = await axiosInstance.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/${appointmentId}`,
      )

      if (response.status === 200) {
        await fetchProgramAppointments()
        showSuccessMessage("Appointment cancelled successfully!")
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      showErrorMessage("Error cancelling appointment: " + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleCompleteAllAppointments = async () => {
    if (appointments.length === 0) {
      alert("No appointments to complete")
      return
    }

    const incompleteAppointments = appointments.filter((app) => app.status !== "completed")
    if (incompleteAppointments.length === 0) {
      alert("All appointments are already completed")
      return
    }

    const confirmComplete = window.confirm(
      `Are you sure you want to mark all ${incompleteAppointments.length} incomplete appointments as complete? This will also prevent adding new appointments.`,
    )

    if (!confirmComplete) return

    setSaving(true)
    try {
      const response = await axiosInstance.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/complete-all/${selectedProgram.unicValue}`,
      )

      if (response.status === 200) {
        // Update PatientSchoolAssignment
        await axiosInstance.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/school/complete-assignment/${selectedProgram.patientid}`,
        )

        await fetchProgramAppointments()
        setIsCompleted(true)
        showSuccessMessage("All appointments marked as complete!")
      }
    } catch (error) {
      console.error("Error completing all appointments:", error)
      showErrorMessage("Error completing all appointments: " + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const showSuccessMessage = (message) => {
    // Create and show success toast
    const toast = document.createElement("div")
    toast.className = styles.successToast
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add(styles.show)
    }, 100)

    setTimeout(() => {
      toast.classList.remove(styles.show)
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 3000)
  }

  const showErrorMessage = (message) => {
    // Create and show error toast
    const toast = document.createElement("div")
    toast.className = styles.errorToast
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add(styles.show)
    }, 100)

    setTimeout(() => {
      toast.classList.remove(styles.show)
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 4000)
  }

  const isAppointmentPast = (date, time) => {
    const appointmentDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    return appointmentDateTime <= now
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchSchoolPrograms()
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // FIXED: Better patient name extraction
  const getPatientName = (program) => {
    console.log("Getting patient name for program:", program)

    // Try multiple ways to get the patient name
    if (program.patient?.name) return program.patient.name
    if (program.patientName) return program.patientName
    if (program.patientid?.name) return program.patientid.name

    return "Unknown Patient"
  }

  // FIXED: Better patient info extraction
  const getPatientInfo = (program) => {
    const patient = program.patient || program.patientid
    return {
      name: patient?.name || program.patientName || "Unknown Patient",
      email: patient?.email || program.patientEmail || "",
      phone: patient?.phone || program.patientPhone || "",
      id: patient?._id || program.patientid || "",
    }
  }

  const formatDateTime = (date, time) => {
    try {
      const dateObj = new Date(date)
      return {
        date: dateObj.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: time,
      }
    } catch (error) {
      return { date: date, time: time }
    }
  }

  // Appointment Management View
  if (selectedProgram) {
    const patientInfo = getPatientInfo(selectedProgram)

    return (
      <div className={styles.appointmentsContainer}>
        <div className={styles.appointmentsCard}>
          <div className={styles.appointmentHeader}>
            <div className={styles.headerLeft}>
              <button onClick={handleBackToList} className={styles.backButton}>
                <ArrowLeft className={styles.backIcon} />
                Back to Programs
              </button>
              <div className={styles.patientInfo}>
                <h2 className={styles.appointmentTitle}>School Program Appointments</h2>
                <div className={styles.patientDetails}>
                  <div className={styles.patientDetail}>
                    <User className={styles.detailIcon} />
                    <span>{patientInfo.name}</span>
                  </div>
                  {patientInfo.email && (
                    <div className={styles.patientDetail}>
                      <Mail className={styles.detailIcon} />
                      <span>{patientInfo.email}</span>
                    </div>
                  )}
                  {patientInfo.phone && (
                    <div className={styles.patientDetail}>
                      <Phone className={styles.detailIcon} />
                      <span>{patientInfo.phone}</span>
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className={styles.completedBadge}>
                      <CheckCircle className={styles.completedIcon} />
                      Program Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.headerRight}>
              {!isCompleted && appointments.length > 0 && (
                <button onClick={handleCompleteAllAppointments} disabled={saving} className={styles.completeButton}>
                  <Check className={styles.buttonIcon} />
                  {saving ? "Processing..." : "Complete All Appointments"}
                </button>
              )}
            </div>
          </div>

          {/* Stats Dashboard */}
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
              <div className={`${styles.statIcon} ${styles.completed}`}>
                <CheckCircle className={styles.statIconSvg} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.completed}</div>
                <div className={styles.statLabel}>Completed</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.scheduled}`}>
                <Clock className={styles.statIconSvg} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.scheduled}</div>
                <div className={styles.statLabel}>Scheduled</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.overdue}`}>
                <AlertCircle className={styles.statIconSvg} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.overdue}</div>
                <div className={styles.statLabel}>Overdue</div>
              </div>
            </div>
          </div>

          <div className={styles.appointmentBody}>
            {/* Add New Appointment Section */}
            {!isCompleted && (
              <div className={styles.addAppointmentSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>
                    <Plus className={styles.sectionIcon} />
                    Add New Appointment
                  </h3>
                </div>
                <div className={styles.appointmentForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Calendar className={styles.labelIcon} />
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                      className={styles.formInput}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Clock className={styles.labelIcon} />
                      Time *
                    </label>
                    <input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description *</label>
                    <textarea
                      value={newAppointment.description}
                      onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                      className={styles.formTextarea}
                      placeholder="Describe the appointment purpose..."
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleAddAppointment}
                    disabled={saving || !newAppointment.date || !newAppointment.time || !newAppointment.description}
                    className={styles.addButton}
                  >
                    <Plus className={styles.buttonIcon} />
                    {saving ? "Adding..." : "Add Appointment"}
                  </button>
                </div>
              </div>
            )}

            {/* Appointments List Section */}
            <div className={styles.appointmentsListSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <CalendarDays className={styles.sectionIcon} />
                  Scheduled Appointments ({appointments.length})
                </h3>
              </div>

              {appointments.length > 0 ? (
                <div className={styles.appointmentsList}>
                  {appointments.map((appointment) => {
                    const { date, time } = formatDateTime(appointment.date, appointment.time)
                    const isPast = isAppointmentPast(appointment.date, appointment.time)
                    const isEditing = editingAppointment === appointment._id

                    return (
                      <div
                        key={appointment._id}
                        className={`${styles.appointmentItem} ${isEditing ? styles.editing : ""}`}
                      >
                        {isEditing ? (
                          // Edit Mode
                          <div className={styles.editForm}>
                            <div className={styles.editFormHeader}>
                              <h4>Edit Appointment</h4>
                            </div>
                            <div className={styles.editFormGrid}>
                              <div className={styles.editFormGroup}>
                                <label>Date</label>
                                <input
                                  type="date"
                                  value={editFormData.date}
                                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                  className={styles.editInput}
                                  min={new Date().toISOString().split("T")[0]}
                                />
                              </div>
                              <div className={styles.editFormGroup}>
                                <label>Time</label>
                                <input
                                  type="time"
                                  value={editFormData.time}
                                  onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                                  className={styles.editInput}
                                />
                              </div>
                              <div className={styles.editFormGroup}>
                                <label>Description</label>
                                <textarea
                                  value={editFormData.description}
                                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                  className={styles.editTextarea}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <div className={styles.editActions}>
                              <button
                                onClick={() => handleEditSave(appointment._id)}
                                disabled={saving}
                                className={styles.saveButton}
                              >
                                <Save className={styles.actionIcon} />
                                {saving ? "Saving..." : "Save Changes"}
                              </button>
                              <button onClick={handleEditCancel} className={styles.cancelEditButton}>
                                <X className={styles.actionIcon} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className={styles.appointmentInfo}>
                              <div className={styles.appointmentDate}>
                                <CalendarDays className={styles.appointmentIcon} />
                                <span>{date}</span>
                              </div>
                              <div className={styles.appointmentTime}>
                                <Clock className={styles.appointmentIcon} />
                                <span>{time}</span>
                              </div>
                              <div className={styles.appointmentDescription}>
                                <span>{appointment.description}</span>
                              </div>
                              <div className={styles.appointmentStatus}>
                                <span
                                  className={`${styles.statusBadge} ${
                                    appointment.status === "completed"
                                      ? styles.completed
                                      : isPast
                                        ? styles.overdue
                                        : styles.scheduled
                                  }`}
                                >
                                  {appointment.status === "completed" ? "Completed" : isPast ? "Overdue" : "Scheduled"}
                                </span>
                              </div>
                            </div>

                            {!isCompleted && (
                              <div className={styles.appointmentActions}>
                                {/* Complete Button - Always visible */}
                                <button
                                  onClick={() => handleCompleteAppointment(appointment._id)}
                                  disabled={saving || appointment.status === "completed"}
                                  className={`${styles.actionButton} ${styles.completeButton}`}
                                  title="Mark as Completed"
                                >
                                  <CheckCircle className={styles.actionIcon} />
                                </button>

                                {/* Edit Button - Only if not past */}
                                {!isPast && appointment.status !== "completed" && (
                                  <button
                                    onClick={() => handleEditClick(appointment)}
                                    className={`${styles.actionButton} ${styles.editButton}`}
                                    title="Edit Appointment"
                                  >
                                    <Edit3 className={styles.actionIcon} />
                                  </button>
                                )}

                                {/* Cancel Button - Only if not past */}
                                {!isPast && appointment.status !== "completed" && (
                                  <button
                                    onClick={() => handleCancelAppointment(appointment._id)}
                                    className={`${styles.actionButton} ${styles.cancelButton}`}
                                    title="Cancel Appointment"
                                  >
                                    <XCircle className={styles.actionIcon} />
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className={styles.emptyAppointments}>
                  <Calendar className={styles.emptyIcon} />
                  <h4>No appointments scheduled yet</h4>
                  {!isCompleted && (
                    <p className={styles.emptySubtext}>Add your first appointment above to get started</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Programs List View
  return (
    <div className={styles.appointmentsContainer}>
      <div className={styles.appointmentsCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h2 className={styles.pageTitle}>
                <Users className={styles.titleIcon} />
                School Program Management
              </h2>
              <p className={styles.pageSubtitle}>Manage appointments for school evaluation programs</p>
            </div>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  className={styles.searchInput}
                  name="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search programs..."
                />
                <Search className={styles.searchIcon} />
              </div>
            </form>
          </div>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading school programs...</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.patientsTable}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th>#</th>
                    <th>Student Name</th>

                    <th>Last appointment</th>
                    <th>Status</th>
                    <th className={styles.textCenter}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolPrograms && schoolPrograms.length > 0 ? (
                    schoolPrograms.map((program, index) => {
                      const patientInfo = getPatientInfo(program)
                      return (
                        <tr key={program._id} className={styles.tableRow}>
                          <td>{(currentPage - 1) * 10 + index + 1}</td>
                          <td className={styles.patientName}>{patientInfo.name}</td>

                          <td className={styles.patientInfo}>{new Date(program.date).toLocaleDateString()}</td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                program.status === "completed" ? styles.completed : styles.active
                              }`}
                            >
                              {program.status === "completed" ? "Completed" : "Active"}
                            </span>
                          </td>
                          <td className={styles.textCenter}>
                            <button
                              onClick={() => handleProgramSelect(program)}
                              className={styles.appointmentButton}
                              title="Manage Appointments"
                            >
                              <Calendar className={styles.actionIcon} />
                              Appointments
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className={styles.noData}>
                        <div className={styles.noDataContent}>
                          <Activity className={styles.noDataIcon} />
                          <h4>No school programs found</h4>
                          <p>Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.paginationContainer}>
            <span className={styles.paginationInfo}>
              Showing {schoolPrograms.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{" "}
              {Math.min(currentPage * 10, schoolPrograms.length)} of {schoolPrograms.length} programs
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
        </div>
      </div>
    </div>
  )
}
