"use client"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  FileText,
  Download,
  Eye,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Target,
  RefreshCw,
} from "lucide-react"
import styles from "../styles/school-tab.module.css"
import PatientDocumentViewer from "./PatientDocumentViewer"

const SchoolTab = ({ patientId, schoolData, setSchoolData, loading, setLoading, error, setError }) => {
  const [expandedPrograms, setExpandedPrograms] = useState(new Set())
  const [viewingDocument, setViewingDocument] = useState(null)
  const [schoolAssignment, setSchoolAssignment] = useState(null)
  const [schoolPlans, setSchoolPlans] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const documentViewerRef = useRef(null)

  useEffect(() => {
    if (patientId) {
      fetchSchoolData()
    }
  }, [patientId])

  const fetchSchoolData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch school assignment
      let assignmentData = null
      try {
        const assignmentResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/school/school-assignments?search=${patientId}`,
        )
        if (assignmentResponse.data.assignments && assignmentResponse.data.assignments.length > 0) {
          assignmentData = assignmentResponse.data.assignments.find(
            (assignment) => assignment.patient._id === patientId,
          )
        }
      } catch (assignmentError) {
        console.log("No school assignment found for patient")
      }

      setSchoolAssignment(assignmentData)

      // Fetch school programs (appointments)
      const programsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/by-patient/${patientId}`,
      )

      const appointments = programsResponse.data.appointments || []

      // Group appointments by unicValue
      const groupedPrograms = groupAppointmentsByUnicValue(appointments)

      // Fetch school plans
      let plansData = []
      try {
        const plansResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/school/plan/${patientId}`)
        plansData = plansResponse.data ? [plansResponse.data] : []
      } catch (planError) {
        console.log("No school plans found for patient")
      }

      setSchoolPlans(plansData)
      setSchoolData(groupedPrograms)
    } catch (error) {
      console.error("Error fetching school data:", error)
      setError("Failed to load school data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSchoolData()
    setRefreshing(false)
  }

  // Group appointments by unicValue to create programs
  const groupAppointmentsByUnicValue = (appointments) => {
    const grouped = {}

    appointments.forEach((appointment) => {
      const unicValue = appointment.unicValue
      if (!grouped[unicValue]) {
        grouped[unicValue] = {
          unicValue,
          appointments: [],
          totalAppointments: 0,
          completedAppointments: 0,
          programStatus: "upcoming",
          createdAt: appointment.createdAt,
          programType: appointment.programType || "school_evaluation",
          programKind: appointment.programKind || "School",
        }
      }
      grouped[unicValue].appointments.push(appointment)
      grouped[unicValue].totalAppointments++
      if (appointment.status === "completed") {
        grouped[unicValue].completedAppointments++
      }
    })

    // Determine program status and sort appointments
    Object.values(grouped).forEach((program) => {
      // Sort appointments by date and time
      program.appointments.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateA - dateB
      })

      // Determine program status
      program.programStatus = determineProgramStatus(program)
    })

    // Convert to array and sort by creation date (newest first)
    return Object.values(grouped).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // Determine program status based on appointments
  const determineProgramStatus = (program) => {
    const now = new Date()
    const { appointments, completedAppointments, totalAppointments } = program

    // Check if all appointments are completed
    if (completedAppointments === totalAppointments) {
      return "completed"
    }

    // Check if any appointment is in progress or upcoming
    const hasUpcomingAppointments = appointments.some((apt) => {
      const appointmentDateTime = new Date(`${apt.date}T${apt.time}`)
      return appointmentDateTime > now && apt.status !== "completed"
    })

    const hasPastIncompleteAppointments = appointments.some((apt) => {
      const appointmentDateTime = new Date(`${apt.date}T${apt.time}`)
      return appointmentDateTime <= now && apt.status !== "completed"
    })

    if (hasUpcomingAppointments) {
      return "active"
    } else if (hasPastIncompleteAppointments) {
      return "missed"
    } else {
      return "completed"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const toggleExpanded = (unicValue) => {
    setExpandedPrograms((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(unicValue)) {
        newSet.delete(unicValue)
      } else {
        newSet.add(unicValue)
      }
      return newSet
    })
  }

  // Helper function to construct proper file URL
  const getFileUrl = (plan) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    let filePath = plan.filePath || ""

    // Remove leading slash if present to avoid double slashes
    if (filePath.startsWith("/")) {
      filePath = filePath.substring(1)
    }

    // Check if filePath already contains the base URL
    if (filePath.startsWith("http")) {
      return filePath
    }

    // Construct the full URL for school plans
    return `${baseUrl}/uploads/school-plan/plan/${filePath}`
  }

  const handleFileDownload = async (plan) => {
    try {
      const fileUrl = getFileUrl(plan)
      console.log("Downloading file from:", fileUrl)

      const response = await axios.get(fileUrl, { responseType: "blob" })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", plan.fileName || plan.title)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Failed to download file. Please try again.")
    }
  }

  const handleViewFile = (plan) => {
    const fileUrl = getFileUrl(plan)
    console.log("Viewing file from:", fileUrl)

    setViewingDocument({
      filePath: fileUrl,
      fileName: plan.fileName || plan.title,
      fileType: "School Plan",
      file: plan,
    })
  }

  const handleBackToFiles = () => {
    setViewingDocument(null)
  }

  const getAppointmentStatus = (appointment) => {
    const now = new Date()
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)

    if (appointment.status === "completed") {
      return "completed"
    } else if (appointmentDateTime > now) {
      return "upcoming"
    } else {
      return "missed"
    }
  }

  const getTimeUntilAppointment = (appointment) => {
    const now = new Date()
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
    const diffMs = appointmentDateTime - now
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))

    if (diffMs < 0) {
      return "Past"
    } else if (diffHours <= 1) {
      return "Soon"
    } else if (diffHours <= 24) {
      return `In ${diffHours} hours`
    } else if (diffDays === 1) {
      return "Tomorrow"
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`
    } else {
      return `In ${Math.ceil(diffDays / 7)} weeks`
    }
  }

  // Render school assignment card
  const renderSchoolAssignmentCard = () => {
    if (!schoolAssignment) {
      return (
        <div className={`${styles.assignmentCard} ${styles.noAssignmentCard}`}>
         
        </div>
      )
    }

    return (
      <div className={`${styles.assignmentCard} ${styles.activeAssignmentCard}`}>
        <div className={styles.assignmentHeader}>
          <div className={styles.assignmentInfo}>
            <GraduationCap className={`${styles.assignmentIcon} ${styles.activeAssignmentIcon}`} />
            <div className={styles.assignmentDetails}>
              <h4 className={styles.assignmentTitle}>School Program Assignment</h4>
              <p className={styles.assignmentDates}>Assigned on {formatDate(schoolAssignment.assignedDate)}</p>
              <p className={styles.assignmentDescription}>
                Status: <span className={styles.statusActive}>{schoolAssignment.status}</span>
              </p>
              {schoolAssignment.notes && <p className={styles.assignmentNotes}>Notes: {schoolAssignment.notes}</p>}
            </div>
          </div>
          <div className={styles.assignmentStats}>
            <div className={`${styles.statBadge} ${styles.activeAssignmentBadge}`}>
              <span className={styles.statLabel}>Active</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render school program card
  const renderSchoolProgramCard = (program, index) => {
    const { programStatus } = program

    return (
      <div key={program.unicValue} className={`${styles.programCard} ${styles[`${programStatus}Card`]}`}>
        <div className={styles.programHeader} onClick={() => toggleExpanded(program.unicValue)}>
          <div className={styles.programInfo}>
            {expandedPrograms.has(program.unicValue) ? (
              <ChevronDown className={styles.chevron} />
            ) : (
              <ChevronRight className={styles.chevron} />
            )}
            {programStatus === "completed" && (
              <CheckCircle className={`${styles.programIcon} ${styles.completedIcon}`} />
            )}
            {programStatus === "active" && <BookOpen className={`${styles.programIcon} ${styles.activeIcon}`} />}
            {programStatus === "missed" && <XCircle className={`${styles.programIcon} ${styles.missedIcon}`} />}
            <div className={styles.programDetails}>
              <h4 className={styles.programTitle}>School Program {index + 1}</h4>
              <p className={styles.programDates}>
                {program.appointments.length > 0 && (
                  <>
                    {formatDate(program.appointments[0].date)} -{" "}
                    {formatDate(program.appointments[program.appointments.length - 1].date)}
                  </>
                )}
              </p>
              <p className={styles.programDescription}>Program ID: {program.unicValue}</p>
            </div>
          </div>
          <div className={styles.programStats}>
            <div className={`${styles.statBadge} ${styles[`${programStatus}Badge`]}`}>
              <span className={styles.statNumber}>{program.completedAppointments}</span>
              <span className={styles.statLabel}>completed</span>
            </div>
            <div className={`${styles.statBadge} ${styles[`${programStatus}Badge`]}`}>
              <span className={styles.statNumber}>{program.totalAppointments}</span>
              <span className={styles.statLabel}>total</span>
            </div>
          </div>
        </div>

        <div className={styles.statusMessage}>
          <div className={`${styles.statusContent} ${styles[`${programStatus}Status`]}`}>
            {programStatus === "completed" && <Award className={styles.statusIcon} />}
            {programStatus === "active" && <Target className={styles.statusIcon} />}
            {programStatus === "missed" && <AlertTriangle className={styles.statusIcon} />}
            <div className={styles.statusText}>
              {programStatus === "completed" && (
                <>
                  <h5>Program Completed Successfully!</h5>
                  <p>
                    You have completed all {program.totalAppointments} appointments in this school program. Great job!
                  </p>
                </>
              )}
              {programStatus === "active" && (
                <>
                  <h5>Program In Progress</h5>
                  <p>
                    You have completed {program.completedAppointments} out of {program.totalAppointments} appointments.
                    Keep up the good work!
                  </p>
                </>
              )}
              {programStatus === "missed" && (
                <>
                  <h5>Attention Required</h5>
                  <p>
                    Some appointments in this program were missed. Please contact your coordinator to reschedule or
                    discuss next steps.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {expandedPrograms.has(program.unicValue) && (
          <div className={styles.programContent}>
            <div className={styles.appointmentsSection}>
              <div className={styles.sectionHeader}>
                <Calendar className={styles.sectionIcon} />
                <h5 className={styles.sectionTitle}>Appointments ({program.totalAppointments})</h5>
              </div>
              <div className={styles.appointmentsList}>
                {program.appointments.map((appointment) => {
                  const appointmentStatus = getAppointmentStatus(appointment)
                  const timeUntil = getTimeUntilAppointment(appointment)

                  return (
                    <div
                      key={appointment._id}
                      className={`${styles.appointmentItem} ${styles[`${appointmentStatus}Appointment`]}`}
                    >
                      <div className={styles.appointmentInfo}>
                        {appointmentStatus === "completed" && <CheckCircle className={styles.appointmentStatusIcon} />}
                        {appointmentStatus === "upcoming" && <Clock className={styles.appointmentStatusIcon} />}
                        {appointmentStatus === "missed" && <XCircle className={styles.appointmentStatusIcon} />}
                        <div className={styles.appointmentDetails}>
                          <span className={styles.appointmentDate}>
                            {formatDate(appointment.date)} at {formatTime(appointment.time)}
                          </span>
                          <span className={styles.appointmentDescription}>{appointment.description}</span>
                        </div>
                      </div>
                      <div className={styles.appointmentStatus}>
                        {appointmentStatus === "completed" && (
                          <span className={`${styles.statusBadge} ${styles.completedBadge}`}>Completed</span>
                        )}
                        {appointmentStatus === "upcoming" && (
                          <span className={`${styles.statusBadge} ${styles.upcomingBadge}`}>{timeUntil}</span>
                        )}
                        {appointmentStatus === "missed" && (
                          <span className={`${styles.statusBadge} ${styles.missedBadge}`}>Missed</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render school plans section
  const renderSchoolPlansSection = () => {
    if (schoolPlans.length === 0) {
      return (
        <div className={styles.plansSection}>
          <div className={styles.sectionHeader}>
            <FileText className={styles.sectionIcon} />
            <h5 className={styles.sectionTitle}>School Plans</h5>
          </div>
          <div className={styles.emptyPlans}>
            <FileText className={styles.emptyIcon} />
            <p className={styles.emptyText}>No school plans available yet.</p>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.plansSection}>
        <div className={styles.sectionHeader}>
          <FileText className={styles.sectionIcon} />
          <h5 className={styles.sectionTitle}>School Plans ({schoolPlans.length})</h5>
        </div>
        <div className={styles.plansList}>
          {schoolPlans.map((plan) => (
            <div key={plan._id} className={styles.planItem}>
              <div className={styles.planInfo}>
                <FileText className={styles.planIcon} />
                <div className={styles.planDetails}>
                  <span className={styles.planTitle}>{plan.title || plan.fileName}</span>
                  <div className={styles.planMetadata}>
                    <span className={styles.planType}>School Plan</span>
                    <span className={styles.planDate}>
                      Last modified: {formatDate(plan.lastModified || plan.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.planActions}>
                <button className={styles.viewButton} onClick={() => handleViewFile(plan)} title="View Document">
                  <Eye size={16} />
                </button>
                <button
                  className={styles.downloadButton}
                  onClick={() => handleFileDownload(plan)}
                  title="Download Document"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Loading your school program data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} />
        <p className={styles.errorText}>{error}</p>
        <button onClick={fetchSchoolData} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    )
  }

  // Document Viewer Mode
  if (viewingDocument) {
    return (
      <div className={styles.documentViewerContainer}>
        <div className={styles.documentViewerHeader}>
          <button onClick={handleBackToFiles} className={styles.backButton}>
            <ArrowLeft size={20} />
            Back to School Program
          </button>
          <div className={styles.documentInfo}>
            <FileText size={20} className={styles.documentIcon} />
            <div className={styles.documentDetails}>
              <h5 className={styles.documentTitle}>{viewingDocument.fileName}</h5>
              <span className={styles.documentType}>{viewingDocument.fileType}</span>
            </div>
          </div>
        </div>
        <div className={styles.documentViewerContent}>
          <PatientDocumentViewer
            ref={documentViewerRef}
            filePath={viewingDocument.filePath}
            fileName={viewingDocument.fileName}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.schoolTabContainer}>
      {/* Header */}
     

      {/* School Assignment Card */}
      {renderSchoolAssignmentCard()}

      {/* School Programs */}
      {schoolData.length > 0 ? (
        <div className={styles.programsList}>
          
          {schoolData.map((program, index) => renderSchoolProgramCard(program, index))}
        </div>
      ) : (
        <div className={styles.emptyContainer}>
          <GraduationCap className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No School Programs</h3>
          <p className={styles.emptyText}>You don't have any school programs scheduled yet.</p>
        </div>
      )}

      {/* School Plans */}
      {renderSchoolPlansSection()}
    </div>
  )
}

export default SchoolTab
