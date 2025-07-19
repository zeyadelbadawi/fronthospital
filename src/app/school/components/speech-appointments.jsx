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
} from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import { useToast } from "./toast"
import { ConfirmationModal } from "./confirmation-modal"
import { LoadingOverlay } from "./loading-overlay"
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

  const router = useRouter()
  const { showToast, ToastContainer } = useToast()

  // Memoized stats calculation
  const stats = useMemo(() => {
    const now = new Date()
    return appointments.reduce(
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
  }, [appointments])

  // FIXED: Extract patient ID from different possible structures
  const extractPatientId = useCallback((program) => {
    // Try different possible structures
    if (program.patientId && typeof program.patientId === "object" && program.patientId._id) {
      return program.patientId._id
    }
    if (program.patientid && typeof program.patientid === "object" && program.patientid._id) {
      return program.patientid._id
    }
    if (program.patient && typeof program.patient === "object" && program.patient._id) {
      return program.patient._id
    }
    if (typeof program.patientId === "string") {
      return program.patientId
    }
    if (typeof program.patientid === "string") {
      return program.patientid
    }
    if (typeof program.patient === "string") {
      return program.patient
    }
    return null
  }, [])

  // FIXED: Generate program name based on patient and creation order
  const generateProgramName = useCallback(
    (program, allPrograms) => {
      const patientId = extractPatientId(program)
      if (!patientId) {
        console.log("No patient ID found for program:", program)
        return "School Evaluation Program"
      }

      console.log("Processing program:", {
        unicValue: program.unicValue,
        patientId: patientId,
        createdAt: program.createdAt,
      })

      // Get all programs for this specific patient
      const patientPrograms = allPrograms.filter((p) => {
        const pId = extractPatientId(p)
        return pId === patientId
      })

      console.log(`Found ${patientPrograms.length} programs for patient ${patientId}`)

      // Sort by creation date (earliest first)
      const sortedPatientPrograms = patientPrograms.sort((a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateA - dateB
      })

      console.log(
        "Sorted patient programs:",
        sortedPatientPrograms.map((p) => ({
          unicValue: p.unicValue,
          createdAt: p.createdAt,
          date: new Date(p.createdAt).toISOString(),
        })),
      )

      // Find the index of current program in the sorted list
      const programIndex = sortedPatientPrograms.findIndex((p) => p.unicValue === program.unicValue)
      const programNumber = programIndex >= 0 ? programIndex + 1 : 1

      // Get the year from creation date
      const year = new Date(program.createdAt).getFullYear()

      console.log(`Program ${program.unicValue} for patient ${patientId} gets number: ${programNumber}`)

      return `School Evaluation ${programNumber} (${year})`
    },
    [extractPatientId],
  )

  // Check if program is completed by checking all its appointments
  const checkProgramStatus = useCallback(async (unicValue) => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/by-unic/${unicValue}`,
      )
      const programAppointments = response.data.appointments || []

      if (programAppointments.length === 0) return false

      // Check if all appointments are completed
      const allCompleted = programAppointments.every((apt) => apt.status === "completed")
      return allCompleted
    } catch (error) {
      console.error("Error checking program status:", error)
      return false
    }
  }, [])

  // FIXED: Fetch school programs with proper status checking and naming
  const fetchSchoolPrograms = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs`, {
        params: {
          page: currentPage,
          search: search,
          limit: 100, // Increased limit to get all programs for proper counting
        },
      })

      const programs = response.data.programs || []
      console.log("All programs fetched:", programs.length)
      console.log("Sample program structure:", programs[0])

      const uniquePrograms = []
      const seenUnicValues = new Set()

      // Get unique programs and check their status
      for (const program of programs) {
        if (!seenUnicValues.has(program.unicValue)) {
          seenUnicValues.add(program.unicValue)

          // Check if this program is completed
          const isCompleted = await checkProgramStatus(program.unicValue)

          // Generate program name using all programs data for proper counting
          const programName = generateProgramName(program, programs)

          uniquePrograms.push({
            ...program,
            isCompleted: isCompleted,
            programName: programName,
          })
        }
      }

      // Sort unique programs by creation date for display (newest first)
      uniquePrograms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      console.log(
        "Final unique programs with names:",
        uniquePrograms.map((p) => ({
          unicValue: p.unicValue,
          programName: p.programName,
          createdAt: p.createdAt,
          patientId: extractPatientId(p),
        })),
      )

      setSchoolPrograms(uniquePrograms)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching school programs:", error)
      showToast("Failed to load school programs. Please try again.", "error")
      setSchoolPrograms([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, showToast, checkProgramStatus, generateProgramName, extractPatientId])

  // FIXED: Fetch program appointments without infinite loop
  const fetchProgramAppointments = useCallback(async () => {
    if (!selectedProgram?.unicValue) return

    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/by-unic/${selectedProgram.unicValue}`,
      )

      const appointmentsData = response.data.appointments || []
      setAppointments(appointmentsData)

      // Check if program is completed
      const allCompleted = appointmentsData.length > 0 && appointmentsData.every((apt) => apt.status === "completed")
      setIsCompleted(allCompleted)
    } catch (error) {
      console.error("Error fetching program appointments:", error)
      showToast("Failed to load appointments. Please try again.", "error")
      setAppointments([])
    }
  }, [selectedProgram?.unicValue, showToast])

  // FIXED: Check program completion status without infinite loop
  const checkProgramCompletionStatus = useCallback(async () => {
    if (!selectedProgram) return

    const patientId = extractPatientId(selectedProgram)
    if (!patientId) return

    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/school/school-assignments`)

      const assignments = response.data.assignments || []
      const assignment = assignments.find((a) => a.patient?._id === patientId)

      setIsCompleted(assignment?.appointmentsCompleted || false)
    } catch (error) {
      console.error("Error checking completion status:", error)
      setIsCompleted(false)
    }
  }, [selectedProgram, extractPatientId])

  // FIXED: Effects with proper dependencies
  useEffect(() => {
    fetchSchoolPrograms()
  }, [currentPage, search])

  useEffect(() => {
    if (selectedProgram) {
      fetchProgramAppointments()
      checkProgramCompletionStatus()
    }
  }, [selectedProgram])

  // Enhanced validation
  const validateAppointmentData = useCallback(
    (appointmentData) => {
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

  // Event handlers
  const handleProgramSelect = useCallback((program) => {
    setSelectedProgram(program)
    setNewAppointment({ date: "", time: "", description: "" })
    setEditingAppointment(null)
    setEditFormData({ date: "", time: "", description: "" })
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedProgram(null)
    setAppointments([])
    setNewAppointment({ date: "", time: "", description: "" })
    setEditingAppointment(null)
    setEditFormData({ date: "", time: "", description: "" })
    setIsCompleted(false)
  }, [])

  const handleAddAppointment = useCallback(async () => {
    if (isCompleted) {
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
        date: newAppointment.date,
        time: newAppointment.time,
        description: newAppointment.description,
        unicValue: selectedProgram.unicValue,
        status: "not completed",
      }

      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/add-appointment`,
        appointmentData,
      )

      if (response.status === 201) {
        await fetchProgramAppointments()
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
    isCompleted,
    newAppointment,
    selectedProgram,
    validateAppointmentData,
    fetchProgramAppointments,
    showToast,
    extractPatientId,
  ])

  const handleEditClick = useCallback((appointment) => {
    setEditingAppointment(appointment._id)
    setEditFormData({
      date: appointment.date,
      time: appointment.time,
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
          await fetchProgramAppointments()
          setEditingAppointment(null)
          setEditFormData({ date: "", time: "", description: "" })
          showToast("Appointment updated successfully!", "success")
        }
      } catch (error) {
        console.error("Error updating appointment:", error)
        const errorMessage = error.response?.data?.message || error.message
        showToast(`Failed to update appointment: ${errorMessage}`, "error")
      } finally {
        setSaving(false)
      }
    },
    [editFormData, validateAppointmentData, fetchProgramAppointments, showToast],
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
              await fetchProgramAppointments()
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
    [fetchProgramAppointments, showToast, confirmModal],
  )

  // FIXED: Handle cancel appointment with last appointment check
  const handleCancelAppointment = useCallback(
    (appointmentId) => {
      // Check if this is the last appointment
      const activeAppointments = appointments.filter((apt) => apt.status !== "completed")
      const isLastAppointment = activeAppointments.length === 1

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
                await fetchProgramAppointments()
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
    [appointments, fetchProgramAppointments, showToast, confirmModal],
  )

  // Handle last appointment deletion (delete entire program)
  const handleDeleteLastAppointment = useCallback(async () => {
    setSaving(true)
    try {
      // Delete the appointment
      const response = await axiosInstance.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/${lastAppointmentWarning.appointmentId}`,
      )

      if (response.status === 200) {
        showToast("Program cancelled successfully! All appointments have been removed.", "success")
        // Go back to programs list since the entire program is now deleted
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

  // FIXED: Complete all appointments with proper patient ID extraction
  const handleCompleteAllAppointments = useCallback(() => {
    if (appointments.length === 0) {
      showToast("No appointments to complete", "warning")
      return
    }

    const incompleteAppointments = appointments.filter((app) => app.status !== "completed")
    if (incompleteAppointments.length === 0) {
      showToast("All appointments are already completed", "warning")
      return
    }

    setConfirmModal({
      isOpen: true,
      title: "Complete All Appointments",
      message: `Are you sure you want to mark all ${incompleteAppointments.length} incomplete appointments as complete? This will also prevent adding new appointments.`,
      type: "warning",
      onConfirm: async () => {
        setSaving(true)
        try {
          // FIXED: Extract patient ID properly
          const patientId = extractPatientId(selectedProgram)

          console.log("Selected Program:", selectedProgram)
          console.log("Extracted Patient ID:", patientId)

          if (!patientId) {
            throw new Error("Patient ID not found in program data")
          }

          // First, complete all appointments in the program
          const response = await axiosInstance.patch(
            `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/complete-all/${selectedProgram.unicValue}`,
          )

          if (response.status === 200) {
            // Then, update PatientSchoolAssignment with the correct patient ID
            await axiosInstance.patch(`${process.env.NEXT_PUBLIC_API_URL}/school/complete-assignment/${patientId}`)

            await fetchProgramAppointments()
            setIsCompleted(true)
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
  }, [appointments, selectedProgram, fetchProgramAppointments, showToast, confirmModal, extractPatientId])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  // Utility functions
  const getPatientInfo = useCallback(
    (program) => {
      // Try different possible structures for patient data
      let patient = null

      if (program.patientId && typeof program.patientId === "object") {
        patient = program.patientId
      } else if (program.patientid && typeof program.patientid === "object") {
        patient = program.patientid
      } else if (program.patient && typeof program.patient === "object") {
        patient = program.patient
      }

      return {
        name: patient?.name || program.patientName || "Unknown Patient",
        email: patient?.email || program.patientEmail || "",
        phone: patient?.phone || program.patientPhone || "",
        id: patient?._id || extractPatientId(program) || "",
      }
    },
    [extractPatientId],
  )

  const formatDateTime = useCallback((date, time) => {
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
  }, [])

  const isAppointmentPast = useCallback((date, time) => {
    const appointmentDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    return appointmentDateTime <= now
  }, [])

  // Last Appointment Warning Modal
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

  // Appointment Management View
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
                  Back to Programs
                </button>
                <div className={styles.patientInfo}>
                  <h2 className={styles.appointmentTitle}>
                    {selectedProgram.programName || "School Program Appointments"}
                  </h2>
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
              {/* Add New Appointment Section - Only show if not completed */}
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

              {/* Appointments List */}
              <div className={styles.appointmentsListSection}>
                <div className={styles.sectionHeader} style={{ padding: "24px 24px 0" }}>
                  <h3 className={styles.sectionTitle}>
                    <CalendarDays className={styles.sectionIcon} />
                    Appointments ({appointments.length})
                  </h3>
                </div>

                {appointments.length === 0 ? (
                  <div className={styles.emptyAppointments}>
                    <Calendar className={styles.emptyIcon} />
                    <h4>No Appointments Yet</h4>
                    <p className={styles.emptySubtext}>
                      {isCompleted
                        ? "This program has been completed."
                        : "Start by adding your first appointment above."}
                    </p>
                  </div>
                ) : (
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
                                <div className={styles.appointmentDate}>
                                  <Calendar className={styles.appointmentIcon} />
                                  {date}
                                </div>
                                <div className={styles.appointmentTime}>
                                  <Clock className={styles.appointmentIcon} />
                                  {time}
                                </div>
                                <div className={styles.appointmentDescription}>{appointment.description}</div>
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
                              <div className={styles.appointmentActions}>
                                {appointment.status !== "completed" && (
                                  <>
                                    <button
                                      onClick={() => handleCompleteAppointment(appointment._id)}
                                      className={`${styles.actionButton} ${styles.completeButton}`}
                                      title="Mark as completed"
                                    >
                                      <Check className={styles.actionIcon} />
                                    </button>
                                    <button
                                      onClick={() => handleEditClick(appointment)}
                                      className={`${styles.actionButton} ${styles.editButton}`}
                                      title="Edit appointment"
                                    >
                                      <Edit3 className={styles.actionIcon} />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleCancelAppointment(appointment._id)}
                                  className={`${styles.actionButton} ${styles.cancelButton}`}
                                  title="Cancel appointment"
                                >
                                  <X className={styles.actionIcon} />
                                </button>
                              </div>
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

  // Programs List View
  return (
    <>
      <div className={styles.appointmentsContainer}>
        <div className={styles.appointmentsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerLeft}>
                <h1 className={styles.pageTitle}>
                  <Activity className={styles.titleIcon} />
                  School Programs
                </h1>
                <p className={styles.pageSubtitle}>Manage school evaluation programs and appointments</p>
              </div>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.searchInputContainer}>
                  <Search className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by patient name..."
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
                        <th>Patient Information</th>
                        <th>Program Name</th>
                        <th>Status</th>
                        <th className={styles.textCenter}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolPrograms.map((program) => {
                        const patientInfo = getPatientInfo(program)
                        return (
                          <tr key={program.unicValue} className={styles.tableRow}>
                            <td>
                              <div className={styles.patientName}>{patientInfo.name}</div>
                              <div className={styles.patientInfo}>
                                {patientInfo.email && <div>📧 {patientInfo.email}</div>}
                                {patientInfo.phone && <div>📞 {patientInfo.phone}</div>}
                                <div>🆔 {patientInfo.id}</div>
                              </div>
                            </td>
                            <td>
                              <div className={styles.programName}>{program.programName}</div>
                              <div className={styles.programDetails}>
                                <div>Program ID: {program.unicValue}</div>
                                <div>Created: {new Date(program.createdAt).toLocaleDateString()}</div>
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
                                    Active
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
