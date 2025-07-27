"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  ArrowLeft,
  Save,
  AlertCircle,
  Users,
  Activity,
  Mail,
  Phone,
  AlertTriangle,
  Hash,
  ClipboardCheck,
} from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import { useToast } from "./toast"
import { ConfirmationModal } from "./confirmation-modal"
import { LoadingOverlay } from "./loading-overlay"
import styles from "../styles/school-appointments.module.css"
import { useContentStore } from "../store/content-store"

export function SchoolAppointments() {
  // State management
  const [schoolPrograms, setSchoolPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    completed: 0,
    remaining: 0,
    isCompleted: false,
    completionPercentage: 0,
  })
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
  const setActiveContent = useContentStore((state) => state.setActiveContent)

  const [editFormData, setEditFormData] = useState({
    date: "",
    time: "",
    description: "",
  })
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "warning",
  })
  const [lastAppointmentWarning, setLastAppointmentWarning] = useState({
    isOpen: false,
    appointmentId: null,
  })

  const { showToast, ToastContainer } = useToast()

  // OPTIMIZED: Memoized stats calculation using server data
  const stats = useMemo(() => {
    if (appointmentStats.total > 0) {
      // Use server-calculated stats when available
      return {
        total: appointmentStats.total,
        completed: appointmentStats.completed,
        scheduled: appointmentStats.remaining,
        overdue: 0, // Could be calculated server-side if needed
      }
    }

    // Fallback to client-side calculation
    const now = new Date()
    return appointments.reduce(
      (acc, appointment) => {
        acc.total++
        if (appointment.status === "completed") {
          acc.completed++
        } else {
          // Use appointment.date (ISO string) for comparison
          const appointmentDateTime = new Date(appointment.date)
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
  }, [appointments, appointmentStats])

  // OPTIMIZED: Extract patient ID (simplified)
  const extractPatientId = useCallback((program) => {
    return program.patientId || program.patientid || program.patient?._id || program.patient || null
  }, [])

  // OPTIMIZED: Single API call to fetch programs with completion status
  const fetchSchoolProgramsOptimized = useCallback(async () => {
    setLoading(true)
    try {
      // Use the new optimized endpoint that returns programs with status in single query
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs-optimized`,
        {
          params: {
            page: currentPage,
            search: search,
            limit: 100,
          },
        },
      )

      const programs = response.data.programs || []

      // Programs already come with isCompleted status from server
      // No need for additional API calls!
      console.log(`✅ OPTIMIZED: Loaded ${programs.length} programs with status in single API call`)

      setSchoolPrograms(programs)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching optimized school programs:", error)
      showToast("Failed to load school programs. Please try again.", "error")
      setSchoolPrograms([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, showToast])

  // OPTIMIZED: Single API call to fetch appointments with stats
  const fetchProgramAppointmentsOptimized = useCallback(async () => {
    if (!selectedProgram?.unicValue) return

    try {
      // Use optimized endpoint that returns appointments with stats
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs-with-appointments/${selectedProgram.unicValue}`,
      )

      const appointmentsData = response.data.appointments || []
      const stats = response.data.stats || {}

      setAppointments(appointmentsData)
      setAppointmentStats(stats)

      console.log(`✅ OPTIMIZED: Loaded ${appointmentsData.length} appointments with stats in single API call`)
    } catch (error) {
      console.error("Error fetching optimized appointments:", error)
      showToast("Failed to load appointments. Please try again.", "error")
      setAppointments([])
      setAppointmentStats({
        total: 0,
        completed: 0,
        remaining: 0,
        isCompleted: false,
        completionPercentage: 0,
      })
    }
  }, [selectedProgram?.unicValue, showToast])

  // OPTIMIZED: Effects with proper dependencies
  useEffect(() => {
    fetchSchoolProgramsOptimized()
  }, [currentPage, search])

  useEffect(() => {
    if (selectedProgram) {
      fetchProgramAppointmentsOptimized()
    }
  }, [selectedProgram])

  // Enhanced validation (unchanged)
  const validateAppointmentData = useCallback(
    (appointmentData) => {
      const { date, time, description } = appointmentData

      if (!date || !time) {
        throw new Error("Date and time are required")
      }

      if (!description || description.trim().length < 5) {
        throw new Error("Description must be at least 5 characters long")
      }

      // For validation, combine date and time from form inputs
      const appointmentDateTime = new Date(`${date}T${time}`)
      const now = new Date()

      if (appointmentDateTime <= now) {
        throw new Error("Appointment must be scheduled for a future date and time")
      }

      // Check for duplicate appointments
      const isDuplicate = appointments.some(
        (apt) => apt.date === date && apt.time === time && apt.status !== "completed",
      )

      if (isDuplicate) {
        throw new Error("An appointment already exists at this date and time")
      }

      return true
    },
    [appointments],
  )

  const handleBackToWelcome = () => {
    setActiveContent(null)
  }

  // Event handlers (mostly unchanged, but using optimized data)
  const handleProgramSelect = useCallback((program) => {
    setSelectedProgram(program)
    setNewAppointment({ date: "", time: "", description: "" })
    setEditingAppointment(null)
    setEditFormData({ date: "", time: "", description: "" })
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedProgram(null)
    setAppointments([])
    setAppointmentStats({
      total: 0,
      completed: 0,
      remaining: 0,
      isCompleted: false,
      completionPercentage: 0,
    })
    setNewAppointment({ date: "", time: "", description: "" })
    setEditingAppointment(null)
    setEditFormData({ date: "", time: "", description: "" })
  }, [])

  const handleAddAppointment = useCallback(async () => {
    if (appointmentStats.isCompleted) {
      showToast("Cannot add appointments. This program has been completed.", "warning")
      return
    }

    try {
      validateAppointmentData(newAppointment)
    } catch (error) {
      showToast(error.message, "error")
      return
    }

    setSaving(true)
    try {
      const patientId = extractPatientId(selectedProgram)

      const appointmentData = {
        patientid: patientId,
        date: newAppointment.date, // This will be YYYY-MM-DD
        time: newAppointment.time, // This will be HH:MM
        description: newAppointment.description,
        unicValue: selectedProgram.unicValue,
        status: "not completed",
      }

      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/add-appointment`,
        appointmentData,
      )

      if (response.status === 201) {
        await fetchProgramAppointmentsOptimized()
        setNewAppointment({ date: "", time: "", description: "" })
        showToast("Appointment added successfully!", "success")
      }
    } catch (error) {
      console.error("Error adding appointment:", error)
      const errorMessage = error.response?.data?.message || error.message
      showToast(`Failed to add appointment: ${errorMessage}`, "error")
    } finally {
      setSaving(false)
    }
  }, [
    appointmentStats.isCompleted,
    newAppointment,
    selectedProgram,
    validateAppointmentData,
    fetchProgramAppointmentsOptimized,
    showToast,
    extractPatientId,
  ])

  const handleEditClick = useCallback((appointment) => {
    setEditingAppointment(appointment._id)
    setEditFormData({
      date: appointment.date.split("T")[0], // Extract YYYY-MM-DD from ISO string for date input
      time: appointment.time, // Use the HH:MM time from DB
      description: appointment.description,
    })
  }, [])

  const handleEditSave = useCallback(
    async (appointmentId) => {
      try {
        validateAppointmentData(editFormData)
      } catch (error) {
        showToast(error.message, "error")
        return
      }

      setSaving(true)
      try {
        const response = await axiosInstance.put(
          `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/${appointmentId}`,
          editFormData,
        )

        if (response.status === 200) {
          await fetchProgramAppointmentsOptimized()
          setEditingAppointment(null)
          setEditFormData({ date: "", time: "", description: "" })
          showToast("Appointment Reschedule successfully!", "success")
        }
      } catch (error) {
        console.error("Error Rescheduling appointment:", error)
        const errorMessage = error.response?.data?.message || error.message
        showToast(`Failed to Rescheduling appointment: ${errorMessage}`, "error")
      } finally {
        setSaving(false)
      }
    },
    [editFormData, validateAppointmentData, fetchProgramAppointmentsOptimized, showToast],
  )

  const handleEditCancel = useCallback(() => {
    setEditingAppointment(null)
    setEditFormData({ date: "", time: "", description: "" })
  }, [])

  const handleCompleteAppointment = useCallback(
    (appointmentId) => {
      setConfirmModal({
        isOpen: true,
        title: "Complete Appointment",
        message: "Are you sure you want to mark this appointment as completed? This action cannot be undone.",
        type: "success",
        onConfirm: async () => {
          setSaving(true)
          try {
            const response = await axiosInstance.patch(
              `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/${appointmentId}/complete`,
            )

            if (response.status === 200) {
              await fetchProgramAppointmentsOptimized()
              showToast("Appointment marked as completed!", "success")
            }
          } catch (error) {
            console.error("Error completing appointment:", error)
            const errorMessage = error.response?.data?.message || error.message
            showToast(`Failed to complete appointment: ${errorMessage}`, "error")
          } finally {
            setSaving(false)
            setConfirmModal({ ...confirmModal, isOpen: false })
          }
        },
      })
    },
    [fetchProgramAppointmentsOptimized, showToast, confirmModal],
  )

  // OPTIMIZED: Handle cancel appointment with server stats
  const handleCancelAppointment = useCallback(
    (appointmentId) => {
      // Use server-calculated stats instead of client-side filtering
      const isLastAppointment = appointmentStats.remaining === 1

      if (isLastAppointment) {
        setLastAppointmentWarning({
          isOpen: true,
          appointmentId: appointmentId,
        })
      } else {
        setConfirmModal({
          isOpen: true,
          title: "Cancel Appointment",
          message: "Are you sure you want to cancel this appointment? This action cannot be undone.",
          type: "danger",
          onConfirm: async () => {
            setSaving(true)
            try {
              const response = await axiosInstance.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/${appointmentId}`,
              )

              if (response.status === 200) {
                await fetchProgramAppointmentsOptimized()
                showToast("Appointment cancelled successfully!", "success")
              }
            } catch (error) {
              console.error("Error cancelling appointment:", error)
              const errorMessage = error.response?.data?.message || error.message
              showToast(`Failed to cancel appointment: ${errorMessage}`, "error")
            } finally {
              setSaving(false)
              setConfirmModal({ ...confirmModal, isOpen: false })
            }
          },
        })
      }
    },
    [appointmentStats.remaining, fetchProgramAppointmentsOptimized, showToast, confirmModal],
  )

  // Handle last appointment deletion (delete entire program)
  const handleDeleteLastAppointment = useCallback(async () => {
    setSaving(true)
    try {
      const response = await axiosInstance.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/${lastAppointmentWarning.appointmentId}`,
      )

      if (response.status === 200) {
        showToast("Program cancelled successfully! All appointments have been removed.", "success")
        handleBackToList()
      }
    } catch (error) {
      console.error("Error cancelling program:", error)
      const errorMessage = error.response?.data?.message || error.message
      showToast(`Failed to cancel program: ${errorMessage}`, "error")
    } finally {
      setSaving(false)
      setLastAppointmentWarning({ isOpen: false, appointmentId: null })
    }
  }, [lastAppointmentWarning.appointmentId, showToast, handleBackToList])

  // OPTIMIZED: Complete all appointments using server stats
  const handleCompleteAllAppointments = useCallback(() => {
    if (appointmentStats.total === 0) {
      showToast("No appointments to complete", "warning")
      return
    }

    if (appointmentStats.remaining === 0) {
      showToast("All appointments are already completed", "warning")
      return
    }

    setConfirmModal({
      isOpen: true,
      title: "Complete All Appointments",
      message: `Are you sure you want to mark all ${appointmentStats.remaining} incomplete appointments as complete? This will also prevent adding new appointments.`,
      type: "warning",
      onConfirm: async () => {
        setSaving(true)
        try {
          const patientId = extractPatientId(selectedProgram)

          if (!patientId) {
            throw new Error("Patient ID not found in program data")
          }

          // Complete all appointments in the program
          const response = await axiosInstance.patch(
            `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/complete-all/${selectedProgram.unicValue}`,
          )

          if (response.status === 200) {
            // Update PatientSchoolAssignment
            await axiosInstance.patch(`${process.env.NEXT_PUBLIC_API_URL}/school/complete-assignment/${patientId}`)

            await fetchProgramAppointmentsOptimized()
            showToast("All appointments marked as complete!", "success")
          }
        } catch (error) {
          console.error("Error completing all appointments:", error)
          const errorMessage = error.response?.data?.message || error.message
          showToast(`Failed to complete all appointments: ${errorMessage}`, "error")
        } finally {
          setSaving(false)
          setConfirmModal({ ...confirmModal, isOpen: false })
        }
      },
    })
  }, [appointmentStats, selectedProgram, fetchProgramAppointmentsOptimized, showToast, confirmModal, extractPatientId])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  // Utility functions (simplified using server data)
  const getPatientInfo = useCallback((program) => {
    return {
      name: program.patientName || "Unknown Patient",
      email: program.patientEmail || "",
      phone: program.patientPhone || "",
      id: program.patientId || "",
    }
  }, [])

  // Modified formatDateTime to handle ISO string directly
  const formatDateTime = useCallback((isoDateString) => {
    if (!isoDateString) {
      return { date: "N/A", time: "N/A" }
    }
    try {
      const dateObj = new Date(isoDateString)

      if (isNaN(dateObj.getTime())) {
        // Check if the date object is invalid
        return { date: "Invalid Date", time: "Invalid Date" }
      }

      return {
        date: dateObj.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: dateObj.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true, // Use 12-hour format with AM/PM
        }),
      }
    } catch (error) {
      console.error("Error formatting date/time:", error)
      return { date: "Error Date", time: "Error Time" }
    }
  }, [])

  // Modified isAppointmentPast to handle ISO string directly
  const isAppointmentPast = useCallback((isoDateString) => {
    if (!isoDateString) return false
    try {
      const appointmentDateTime = new Date(isoDateString)
      if (isNaN(appointmentDateTime.getTime())) {
        return false // Treat invalid dates as not past for safety
      }
      const now = new Date()
      return appointmentDateTime <= now
    } catch (error) {
      console.error("Error checking if appointment is past:", error)
      return false
    }
  }, [])

  // Last Appointment Warning Modal (unchanged)
  const LastAppointmentWarningModal = () => {
    if (!lastAppointmentWarning.isOpen) return null

    return (
      <div className={styles.warningModal}>
        <div className={styles.warningContent}>
          <div className={styles.warningHeader}>
            <AlertTriangle className={styles.warningIcon} />
            <h3 className={styles.warningTitle}>Cancel Entire Program?</h3>
          </div>
          <div className={styles.warningMessage}>
            <p>
              <strong>Warning:</strong> This is the last appointment in this program. Cancelling it will remove the
              entire program from the system.
            </p>
            <p>Are you sure you want to proceed? This action cannot be undone.</p>
          </div>
          <div className={styles.warningActions}>
            <button
              onClick={() => setLastAppointmentWarning({ isOpen: false, appointmentId: null })}
              className={`${styles.warningButton} ${styles.secondary}`}
            >
              Keep Program
            </button>
            <button
              onClick={handleDeleteLastAppointment}
              disabled={saving}
              className={`${styles.warningButton} ${styles.danger}`}
            >
              {saving ? "Cancelling..." : "Cancel Program"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Appointment Management View (using optimized data)
  if (selectedProgram) {
    const patientInfo = getPatientInfo(selectedProgram)

    return (
      <>
        <div className={styles.appointmentsContainer}>
          <div className={styles.appointmentsCard}>
            <div className={styles.appointmentHeader}>
              <div className={styles.headerLeft}>
                <button onClick={handleBackToList} className={styles.backButton}>
                  <ArrowLeft className={styles.backIcon} />
                  Back to All School Evaluation Appointments
                </button>
                <div className={styles.patientInfobyziad}>
                  <h2 className={styles.appointmentTitle}>
                    {selectedProgram.programName || "School Program Appointments"}
                  </h2>
                  <div className={styles.patientDetails}>
                    <div className={styles.patientDetail}>
                      <User className={styles.detailIconbyziad} />
                      <span className={styles.patientInfobyziad}>
                        {" "}
                        Student Name:<b> {patientInfo.name} </b>
                      </span>
                    </div>
                    {patientInfo.email && (
                      <div className={styles.patientDetail}>
                        <Mail className={styles.detailIconbyziad} />
                        <span className={styles.patientInfobyziad}>
                          {" "}
                          Student Email:<b> {patientInfo.email}</b>
                        </span>
                      </div>
                    )}
                    {patientInfo.phone && (
                      <div className={styles.patientDetail}>
                        <Phone className={styles.detailIconbyziad} />
                        <span className={styles.patientInfobyziad}>
                          {" "}
                          Student Phone Number: <b> {patientInfo.phone} </b>
                        </span>
                      </div>
                    )}

                    {appointmentStats.isCompleted && (
                      <div className={styles.completedBadge}>
                        <CheckCircle className={styles.completedIcon} />
                        <b>Status:</b>
                        Program Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.headerRight}>{/* This space is now empty as the button moved */}</div>
            </div>

            {/* OPTIMIZED: Stats Dashboard using server data */}
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
              {/* Add New Appointment Section - Only show if not completed */}
              {!appointmentStats.isCompleted && (
                <div className={styles.addAppointmentSection}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                      <Plus className={styles.sectionIcon} />
                      Add New Appointment
                    </h3>
                  </div>
                  <div className={styles.appointmentForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="new-date" className={styles.formLabel}>
                        <Calendar className={styles.labelIcon} />
                        Date *
                      </label>
                      <input
                        id="new-date"
                        type="date"
                        value={newAppointment.date}
                        onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                        className={styles.formInput}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="new-time" className={styles.formLabel}>
                        <Clock className={styles.labelIcon} />
                        Time *
                      </label>
                      <input
                        id="new-time"
                        type="time"
                        value={newAppointment.time}
                        onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={`${styles.formGroup} ${styles.formGroupFullWidth}`}>
                      <label htmlFor="new-description" className={styles.formLabel}>
                        <Edit3 className={styles.labelIcon} />
                        Description *
                      </label>
                      <textarea
                        id="new-description"
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
            </div>

            {/* Appointments List */}
            <div className={styles.appointmentsListSection}>
              <div className={styles.sectionHeader} style={{ padding: "24px 24px 0" }}>
                <h3 className={styles.sectionTitle}>
                  <CalendarDays className={styles.sectionIcon} />
                  All Evaulation Appointments ({appointments.length})
                </h3>
                {!appointmentStats.isCompleted && appointmentStats.total > 0 && (
                  <button onClick={handleCompleteAllAppointments} disabled={saving} className={styles.completeButton}>
                    <Check className={styles.buttonIcon} />
                    {saving ? "Processing..." : "Complete All Appointments"}
                  </button>
                )}
              </div>

              {appointments.length === 0 ? (
                <div className={styles.emptyAppointments}>
                  <Calendar className={styles.emptyIcon} />
                  <h4>No Appointments Yet</h4>
                  <p className={styles.emptySubtext}>
                    {appointmentStats.isCompleted
                      ? "This program has been completed."
                      : "Start by adding your first appointment above."}
                  </p>
                </div>
              ) : (
                <div className={styles.appointmentsList}>
                  {appointments.map((appointment, index) => {
                    // Pass only the ISO date string to formatDateTime and isAppointmentPast
                    const { date, time } = formatDateTime(appointment.date)
                    const isPast = isAppointmentPast(appointment.date)
                    const isEditing = editingAppointment === appointment._id

                    return (
                      <div
                        key={appointment._id}
                        className={`${styles.appointmentItem} ${isEditing ? styles.editing : ""}`}
                      >
                        {isEditing ? (
                          <div className={styles.editForm}>
                            <div className={styles.editFormHeader}>
                              <h4>Reschedule Appointment</h4>
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
                            <div className={styles.editActions}>
                              <button
                                onClick={() => handleEditSave(appointment._id)}
                                disabled={
                                  saving || !editFormData.date || !editFormData.time || !editFormData.description
                                }
                                className={styles.saveButton}
                              >
                                <Save className={styles.buttonIcon} />
                                {saving ? "Saving..." : "Save Changes"}
                              </button>
                              <button onClick={handleEditCancel} className={styles.cancelEditButton}>
                                <X className={styles.buttonIcon} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={styles.appointmentInfo}>
                              <div className={styles.appointmentNumberAndLabel}>
                                <span className={styles.appointmentNumber}>{index + 1}</span>
                                <span className={styles.ziad}>No. </span>
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
                                    {appointment.status === "completed" ? (
                                      <>
                                        <CheckCircle size={14} />
                                        Completed
                                      </>
                                    ) : isPast ? (
                                      <>
                                        <AlertCircle size={14} />
                                        Overdue
                                      </>
                                    ) : (
                                      <>
                                        <Clock size={14} />
                                        Scheduled
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className={styles.appointmentDateTimeRow}>
                                <div className={styles.appointmentDate}>
                                  <Calendar className={styles.appointmentIcon} />
                                  <span className={styles.ziad}> Date:</span>
                                  {date}
                                </div>
                                <div className={styles.appointmentTime}>
                                  <Clock className={styles.appointmentIcon} />
                                  <span className={styles.ziad}> Time:</span>
                                  {time}
                                </div>
                              </div>
                              <div className={styles.appointmentDescription}>
                                <span className={styles.ziad}>Apoointmnet Description:</span> {appointment.description}
                              </div>
                            </div>
                            {!appointment.isCompleted && (
                              <div className={styles.appointmentActions}>
                                {appointment.status !== "completed" ? (
                                  <>
                                    <button
                                      onClick={() => handleCompleteAppointment(appointment._id)}
                                      className={`${styles.actionButton} ${styles.completeButton}`}
                                      title="Mark as completed"
                                    >
                                      Mark as completed
                                      <Check className={styles.actionIcon} fill="currentColor" stroke="currentColor" />
                                    </button>
                                    <button
                                      onClick={() => handleEditClick(appointment)}
                                      className={`${styles.actionButton} ${styles.editButton}`}
                                      title="Reschedule appointment"
                                    >
                                      <Edit3 className={styles.actionIcon} />
                                    </button>
                                    <button
                                      onClick={() => handleCancelAppointment(appointment._id)}
                                      className={`${styles.actionButton} ${styles.cancelButton}`}
                                      title="Cancel appointment"
                                    >
                                      <X className={styles.actionIcon} />
                                    </button>
                                  </>
                                ) : // Render nothing if the appointment is completed
                                null}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          loading={saving}
        />

        <LastAppointmentWarningModal />

        {saving && <LoadingOverlay message="Processing..." />}
        <ToastContainer />
      </>
    )
  }

  // Programs List View (using optimized data with server-calculated status)
  return (
    <>
      <div className={styles.appointmentsContainer}>
        <div className={styles.appointmentsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerLeft}>
                <h2 className={styles.pageTitle}>
                  <Activity className={styles.titleIcon} />
                  School Evaluation Programs
                </h2>
                <p className={styles.pageSubtitle}>Manage All school evaluation programs and it's appointments</p>
              </div>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.searchInputContainer}>
                  <Search className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by Student name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                  />
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
            ) : schoolPrograms.length === 0 ? (
              <div className={styles.noData}>
                <div className={styles.noDataContent}>
                  <Users className={styles.noDataIcon} />
                  <h4>No School Programs Found</h4>
                  <p>
                    {search
                      ? `No programs found matching "${search}". Try adjusting your search.`
                      : "No school programs have been created yet."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.tableContainer}>
                  <table className={styles.patientsTable}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th>
                          <User className={styles.headerIcon} />
                          &nbsp; Student Information
                        </th>
                        <th>
                          <Hash className={styles.headerIcon} />
                          &nbsp; Evaluation Information
                        </th>
                        <th>
                          <ClipboardCheck className={styles.headerIcon} />
                          &nbsp; Status
                        </th>
                        <th className={styles.textCenter}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolPrograms.map((program) => {
                        const patientInfo = getPatientInfo(program)
                        return (
                          <tr key={program.unicValue} className={styles.tableRow}>
                            <td>
                              <div className={styles.patientName}>
                                <b>Student Name: </b>
                                {patientInfo.name}
                              </div>
                              <div className={styles.patientInfo}>
                                {patientInfo.email && (
                                  <div>
                                    <b>Student Email:</b> {patientInfo.email}
                                  </div>
                                )}
                                {patientInfo.phone && (
                                  <div>
                                    <b>Phone Number:</b> {patientInfo.phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className={styles.programName}>{program.programName}</div>
                              <div className={styles.programDetails}>
                                <div>
                                  <b>
                                    {program.oldestAppointmentDate &&
                                    new Date(program.oldestAppointmentDate) > new Date()
                                      ? "Will start at:"
                                      : "Started at:"}{" "}
                                  </b>
                                  {program.oldestAppointmentDate
                                    ? new Date(program.oldestAppointmentDate).toLocaleDateString()
                                    : "N/A"}
                                </div>
                                <div>
                                  <b>Number of Sessions:</b> {program.totalSessions}
                                </div>
                                {program.completionPercentage > 0 && (
                                  <div>
                                    <b>Progress:</b> {program.completionPercentage}%
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`${styles.statusBadge} ${
                                  program.isCompleted ? styles.completed : styles.active
                                }`}
                              >
                                {program.isCompleted ? (
                                  <>
                                    <CheckCircle size={14} />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <Activity size={14} />
                                    In progress
                                  </>
                                )}
                              </span>
                            </td>
                            <td className={styles.textCenter}>
                              <button onClick={() => handleProgramSelect(program)} className={styles.appointmentButton}>
                                <Calendar className={styles.actionIcon} />
                                View Appointments
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.paginationContainer}>
                    <div className={styles.paginationInfo}>
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className={styles.paginationButtons}>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`${styles.paginationButton} ${page === currentPage ? styles.active : ""}`}
                          >
                            {page}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  )
}
