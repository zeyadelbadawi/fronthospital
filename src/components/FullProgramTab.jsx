"use client"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  FolderOpen,
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
  PlayCircle,
  StopCircle,
} from "lucide-react"
import styles from "../styles/full-program-tab.module.css"
import PatientDocumentViewer from "./PatientDocumentViewer"

const FullProgramTab = ({
  patientId,
  fullProgramData,
  setFullProgramData,
  loading,
  setLoading,
  error,
  setError,
  language,
  translations: t,
}) => {
  const [expandedAppointments, setExpandedAppointments] = useState(new Set())
  const [expandedDepartments, setExpandedDepartments] = useState(new Set())
  const [expandedYears, setExpandedYears] = useState(new Set())
  const [expandedQuarters, setExpandedQuarters] = useState(new Set())
  const [viewingDocument, setViewingDocument] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const documentViewerRef = useRef(null)

  // Department mapping
  const departments = [
    { key: "aba", name: "ABA", endpoint: "aba" },
    { key: "physicalTherapy", name: "Physical Therapy", endpoint: "physicalTherapy" },
    { key: "occupationalTherapy", name: "Occupational Therapy", endpoint: "OccupationalTherapy" },
    { key: "specialEducation", name: "Special Education", endpoint: "SpecialEducation" },
    { key: "speech", name: "Speech Therapy", endpoint: "speech" },
  ]

  useEffect(() => {
    if (patientId) {
      fetchFullProgramData()
    }
  }, [patientId])

  const fetchFullProgramData = async () => {
    setLoading(true)
    setError(null)

    try {
      const appointmentsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-full-programs/${patientId}`,
      )

      const appointments = appointmentsResponse.data

      const appointmentsWithFiles = await Promise.all(
        appointments.map(async (appointment) => {
          const startDate = appointment.assignmentDate
          const endDate = appointment.subscriptionEndDate

          // Only fetch files for active appointments
          if (appointment.status === "active" && startDate && endDate) {
            const departmentFiles = await Promise.all(
              departments.map(async (dept) => {
                try {
                  const [plansResponse, examsResponse] = await Promise.all([
                    axios.get(
                      `${process.env.NEXT_PUBLIC_API_URL}/${dept.endpoint}/view-plans/${patientId}?startDate=${startDate}&endDate=${endDate}`,
                    ),
                    axios.get(
                      `${process.env.NEXT_PUBLIC_API_URL}/${dept.endpoint}/view-exams/${patientId}?startDate=${startDate}&endDate=${endDate}`,
                    ),
                  ])

                  const plans = Array.isArray(plansResponse.data.plans)
                    ? plansResponse.data.plans
                    : plansResponse.data.plans
                      ? [plansResponse.data.plans]
                      : []
                  const exams = Array.isArray(examsResponse.data.exams)
                    ? examsResponse.data.exams
                    : examsResponse.data.exams
                      ? [examsResponse.data.exams]
                      : []

                  return {
                    department: dept.name,
                    departmentKey: dept.key,
                    plans,
                    exams,
                    totalFiles: plans.length + exams.length,
                  }
                } catch (error) {
                  console.error(`Error fetching ${dept.name} files:`, error)
                  return {
                    department: dept.name,
                    departmentKey: dept.key,
                    plans: [],
                    exams: [],
                    totalFiles: 0,
                  }
                }
              }),
            )

            const departmentsWithFiles = departmentFiles.filter((dept) => dept.totalFiles > 0)

            return {
              ...appointment,
              departments: departmentsWithFiles,
              totalFiles: departmentsWithFiles.reduce((sum, dept) => sum + dept.totalFiles, 0),
            }
          } else {
            // For non-active appointments, don't fetch files
            return {
              ...appointment,
              departments: [],
              totalFiles: 0,
            }
          }
        }),
      )

      // Sort appointments according to the requirements
      const sortedAppointments = sortAppointments(appointmentsWithFiles)
      setFullProgramData(sortedAppointments)
    } catch (error) {
      console.error("Error fetching full program data:", error)
      setError("Failed to load full program data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Function to sort appointments based on priority and date
  const sortAppointments = (appointments) => {
    return appointments.sort((a, b) => {
      const statusA = determineAppointmentStatus(a)
      const statusB = determineAppointmentStatus(b)

      // Define priority order: upcoming > active > expired > missed
      const statusPriority = {
        upcoming: 1,
        active: 2,
        expired: 3,
        missed: 4,
      }

      const priorityA = statusPriority[statusA] || 5
      const priorityB = statusPriority[statusB] || 5

      // First sort by status priority
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      // Within same status, sort by date (newest first)
      const dateA = new Date(a.createdAt || a.assignmentDate || a.date)
      const dateB = new Date(b.createdAt || b.assignmentDate || b.date)

      return dateB - dateA // Newest first
    })
  }

  // Function to get program number for active/expired appointments
  const getProgramNumber = (appointment, allAppointments) => {
    const status = determineAppointmentStatus(appointment)

    if (status === "active" || status === "expired") {
      // Get all active and expired appointments
      const programAppointments = allAppointments.filter((apt) => {
        const aptStatus = determineAppointmentStatus(apt)
        return aptStatus === "active" || aptStatus === "expired"
      })

      // Sort by creation date (oldest first) to assign correct program numbers
      const sortedPrograms = programAppointments.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.assignmentDate || a.date)
        const dateB = new Date(b.createdAt || b.assignmentDate || b.date)
        return dateA - dateB // Oldest first
      })

      // Find the index of current appointment in sorted list
      const programIndex = sortedPrograms.findIndex((apt) => apt._id === appointment._id)
      return programIndex + 1
    }

    return null
  }

  // Function to determine appointment status
  const determineAppointmentStatus = (appointment) => {
    const now = new Date()

    // Create appointment datetime - handle different date formats
    let appointmentDateTime
    try {
      // Try different date format combinations
      if (appointment.date && appointment.time) {
        // Ensure proper date format
        const dateStr = appointment.date.includes("T") ? appointment.date.split("T")[0] : appointment.date
        const timeStr = appointment.time.includes(":") ? appointment.time : `${appointment.time}:00`

        appointmentDateTime = new Date(`${dateStr}T${timeStr}`)

        // If invalid date, try alternative parsing
        if (isNaN(appointmentDateTime.getTime())) {
          appointmentDateTime = new Date(appointment.date + " " + appointment.time)
        }
      } else {
        // Fallback to assignment date if no specific appointment time
        appointmentDateTime = new Date(appointment.assignmentDate || appointment.date)
      }
    } catch (error) {
      console.error("Error parsing appointment date/time:", error)
      appointmentDateTime = new Date(appointment.assignmentDate || appointment.date)
    }

    const subscriptionEndDate = appointment.subscriptionEndDate ? new Date(appointment.subscriptionEndDate) : null



    if (appointment.status === "not active") {
      if (appointmentDateTime > now) {
        return "upcoming" // Case a: Future appointment, not active
      } else {
        return "missed" // Case b: Past appointment, not active
      }
    } else if (appointment.status === "active") {
      if (subscriptionEndDate && subscriptionEndDate < now) {
        return "expired" // Case d: Active but subscription ended
      } else {
        return "active" // Case c and e: Active program
      }
    }

    return "unknown"
  }

  const getTimeUntilAppointment = (appointment) => {
    const now = new Date()

    let appointmentDateTime
    try {
      if (appointment.date && appointment.time) {
        const dateStr = appointment.date.includes("T") ? appointment.date.split("T")[0] : appointment.date
        const timeStr = appointment.time.includes(":") ? appointment.time : `${appointment.time}:00`
        appointmentDateTime = new Date(`${dateStr}T${timeStr}`)

        if (isNaN(appointmentDateTime.getTime())) {
          appointmentDateTime = new Date(appointment.date + " " + appointment.time)
        }
      } else {
        appointmentDateTime = new Date(appointment.assignmentDate || appointment.date)
      }
    } catch (error) {
      appointmentDateTime = new Date(appointment.assignmentDate || appointment.date)
    }

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

  const organizeFilesByYearQuarter = (files) => {
    const organized = {}

    files.forEach((file) => {
      const year = file.year
      const quarter = file.quarterOfYear

      if (!organized[year]) {
        organized[year] = {}
      }
      if (!organized[year][quarter]) {
        organized[year][quarter] = []
      }
      organized[year][quarter].push(file)
    })

    return organized
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

  const toggleExpanded = (type, id) => {
    const setterMap = {
      appointment: setExpandedAppointments,
      department: setExpandedDepartments,
      year: setExpandedYears,
      quarter: setExpandedQuarters,
    }

    const setter = setterMap[type]
    setter((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Helper function to construct proper file URL
  const getFileUrl = (file) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    let filePath = file.fullPath || file.filePath || ""

    // Remove leading slash if present to avoid double slashes
    if (filePath.startsWith("/")) {
      filePath = filePath.substring(1)
    }

    // Check if fullPath already contains the base URL
    if (filePath.startsWith("http")) {
      return filePath
    }

    // Construct the full URL
    return `${baseUrl}/${filePath}`
  }

  const handleFileDownload = async (file) => {
    try {
      const fileUrl = getFileUrl(file)

      const response = await axios.get(fileUrl, { responseType: "blob" })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", file.fileName || file.title)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Failed to download file. Please try again.")
    }
  }

  const handleViewFile = (file) => {
    const fileUrl = getFileUrl(file)

    setViewingDocument({
      filePath: fileUrl,
      fileName: file.fileName || file.title,
      fileType: file.title ? "Plan" : "Exam",
      file: file,
    })
  }

  const handleBackToFiles = () => {
    setViewingDocument(null)
  }

  const filterFiles = (files) => {
    return files.filter((file) => {
      const fileName = (file.fileName || file.title || "").toLowerCase()
      const matchesSearch = fileName.includes(searchTerm.toLowerCase())
      const matchesYear = !selectedYear || file.year.toString() === selectedYear
      return matchesSearch && matchesYear
    })
  }

  // Render different card types based on status
  const renderAppointmentCard = (appointment, index) => {
    const status = determineAppointmentStatus(appointment)

    switch (status) {
      case "upcoming":
        return renderUpcomingAppointmentCard(appointment, index)
      case "missed":
        return renderMissedAppointmentCard(appointment, index)
      case "active":
        return renderActiveProgramCard(appointment, index)
      case "expired":
        return renderExpiredProgramCard(appointment, index)
      default:
        return renderActiveProgramCard(appointment, index)
    }
  }

  const renderUpcomingAppointmentCard = (appointment, index) => {
    const timeUntil = getTimeUntilAppointment(appointment)

    return (
      <div key={appointment._id} className={`${styles.appointmentCard} ${styles.upcomingCard}`}>
        <div className={styles.appointmentHeader}>
          <div className={styles.appointmentInfo}>
            <Clock className={`${styles.appointmentIcon} ${styles.upcomingIcon}`} />
            <div className={styles.appointmentDetails}>
              <h4 className={styles.appointmentTitle}>
                {t?.profile?.upcomingEvaluation || "Upcoming Evaluation Session"}
              </h4>
              <p className={styles.appointmentDates}>
                {formatDate(appointment.date)} at {formatTime(appointment.time)}
              </p>
              <p className={styles.appointmentDescription}>{appointment.description}</p>
            </div>
          </div>
          <div className={styles.appointmentStats}>
            <div className={`${styles.statBadge} ${styles.upcomingBadge}`}>
              <span className={styles.statLabel}>{timeUntil}</span>
            </div>
          </div>
        </div>
        <div className={styles.statusMessage}>
          <div className={`${styles.statusContent} ${styles.upcomingStatus}`}>
            <CheckCircle className={styles.statusIcon} />
            <div className={styles.statusText}>
              <h5>{t?.profile?.evaluationScheduled || "Your evaluation session is scheduled"}</h5>
              <p>
                {t?.profile?.arriveEarly ||
                  "Please arrive 15 minutes early for your appointment. This session will help us assess your needs and create a personalized program for you."}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMissedAppointmentCard = (appointment, index) => {
    return (
      <div key={appointment._id} className={`${styles.appointmentCard} ${styles.missedCard}`}>
        <div className={styles.appointmentHeader}>
          <div className={styles.appointmentInfo}>
            <XCircle className={`${styles.appointmentIcon} ${styles.missedIcon}`} />
            <div className={styles.appointmentDetails}>
              <h4 className={styles.appointmentTitle}>{t?.profile?.missedEvaluation || "Missed Evaluation Session"}</h4>
              <p className={styles.appointmentDates}>
                {formatDate(appointment.date)} at {formatTime(appointment.time)}
              </p>
              <p className={styles.appointmentDescription}>{appointment.description}</p>
            </div>
          </div>
          <div className={styles.appointmentStats}>
            <div className={`${styles.statBadge} ${styles.missedBadge}`}>
              <span className={styles.statLabel}>Missed</span>
            </div>
          </div>
        </div>
        <div className={styles.statusMessage}>
          <div className={`${styles.statusContent} ${styles.missedStatus}`}>
            <AlertTriangle className={styles.statusIcon} />
            <div className={styles.statusText}>
              <h5>{t?.profile?.missedEvaluationMessage || "You missed your evaluation session"}</h5>
              <p>
                {t?.profile?.rescheduleEvaluation ||
                  "Please contact us to reschedule your evaluation session. This is important to start your personalized program."}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderActiveProgramCard = (appointment, index) => {
    const programNumber = getProgramNumber(appointment, fullProgramData)

    return (
      <div key={appointment._id} className={`${styles.appointmentCard} ${styles.activeCard}`}>
        <div className={styles.appointmentHeader} onClick={() => toggleExpanded("appointment", appointment._id)}>
          <div className={styles.appointmentInfo}>
            {expandedAppointments.has(appointment._id) ? (
              <ChevronDown className={styles.chevron} />
            ) : (
              <ChevronRight className={styles.chevron} />
            )}
            <PlayCircle className={`${styles.appointmentIcon} ${styles.activeIcon}`} />
            <div className={styles.appointmentDetails}>
              <h4 className={styles.appointmentTitle}>
                {t?.profile?.programName} {programNumber}
              </h4>
              <p className={styles.appointmentDates}>
                {formatDate(appointment.assignmentDate)} - {formatDate(appointment.subscriptionEndDate)}
              </p>
            </div>
          </div>
          <div className={styles.appointmentStats}>
            <div className={`${styles.statBadge} ${styles.activeBadge}`}>
              <span className={styles.statNumber}>{appointment.totalFiles}</span>
              <span className={styles.statLabel}>{t?.profile?.files || "files"}</span>
            </div>
            <div className={`${styles.statBadge} ${styles.activeBadge}`}>
              <span className={styles.statNumber}>{appointment.departments.length}</span>
              <span className={styles.statLabel}>{t?.profile?.departments || "departments"}</span>
            </div>
          </div>
        </div>

        <div className={styles.statusMessage}>
          <div className={`${styles.statusContent} ${styles.activeStatus}`}>
            <CheckCircle className={styles.statusIcon} />
            <div className={styles.statusText}>
              <h5>{t?.profile?.programActive || "Your program is now active!"}</h5>
              <p>
                {t?.profile?.accessFiles ||
                  "You can now access all your files and track your progress. Your evaluation session was completed on"}{" "}
                {formatDate(appointment.date)} {t?.profile?.at} {formatTime(appointment.time)}.
              </p>
              <div className={styles.evaluationDetails}>
                <strong>{t?.profile?.initialEvaluation || "Initial Evaluation"}:</strong> {appointment.description}
              </div>
            </div>
          </div>
        </div>

        {expandedAppointments.has(appointment._id) && (
          <div className={styles.appointmentContent}>
            {appointment.departments.map((dept) => (
              <div key={dept.departmentKey} className={styles.departmentSection}>
                <div
                  className={styles.departmentHeader}
                  onClick={() => toggleExpanded("department", `${appointment._id}-${dept.departmentKey}`)}
                >
                  {expandedDepartments.has(`${appointment._id}-${dept.departmentKey}`) ? (
                    <ChevronDown className={styles.chevron} />
                  ) : (
                    <ChevronRight className={styles.chevron} />
                  )}
                  <FolderOpen className={styles.departmentIcon} />
                  <span className={styles.departmentName}>{dept.department}</span>
                  <span className={styles.fileCount}>({dept.totalFiles} files)</span>
                </div>

                {expandedDepartments.has(`${appointment._id}-${dept.departmentKey}`) && (
                  <div className={styles.departmentContent}>
                    {/* Plans Section */}
                    {dept.plans.length > 0 && (
                      <div className={styles.fileTypeSection}>
                        <div className={styles.fileTypeHeader}>
                          <FileText className={styles.fileTypeIcon} />
                          <h5 className={styles.fileTypeTitle}>Plans ({dept.plans.length})</h5>
                        </div>
                        <div className={styles.yearsList}>
                          {Object.entries(organizeFilesByYearQuarter(filterFiles(dept.plans))).map(
                            ([year, quarters]) => (
                              <div key={`plans-${year}`} className={styles.yearSection}>
                                <div
                                  className={styles.yearHeader}
                                  onClick={() =>
                                    toggleExpanded("year", `${appointment._id}-${dept.departmentKey}-plans-${year}`)
                                  }
                                >
                                  {expandedYears.has(`${appointment._id}-${dept.departmentKey}-plans-${year}`) ? (
                                    <ChevronDown className={styles.smallChevron} />
                                  ) : (
                                    <ChevronRight className={styles.smallChevron} />
                                  )}
                                  <Calendar className={styles.yearIcon} />
                                  <span className={styles.yearTitle}>{year}</span>
                                  <span className={styles.yearCount}>
                                    ({Object.values(quarters).reduce((sum, files) => sum + files.length, 0)} files)
                                  </span>
                                </div>

                                {expandedYears.has(`${appointment._id}-${dept.departmentKey}-plans-${year}`) && (
                                  <div className={styles.quartersList}>
                                    {Object.entries(quarters).map(([quarter, files]) => (
                                      <div key={`plans-${quarter}`} className={styles.quarterSection}>
                                        <div
                                          className={styles.quarterHeader}
                                          onClick={() =>
                                            toggleExpanded(
                                              "quarter",
                                              `${appointment._id}-${dept.departmentKey}-plans-${year}-${quarter}`,
                                            )
                                          }
                                        >
                                          {expandedQuarters.has(
                                            `${appointment._id}-${dept.departmentKey}-plans-${year}-${quarter}`,
                                          ) ? (
                                            <ChevronDown className={styles.smallChevron} />
                                          ) : (
                                            <ChevronRight className={styles.smallChevron} />
                                          )}
                                          <span className={styles.quarterTitle}>
                                            Q{quarter} ({files.length} files)
                                          </span>
                                        </div>

                                        {expandedQuarters.has(
                                          `${appointment._id}-${dept.departmentKey}-plans-${year}-${quarter}`,
                                        ) && (
                                          <div className={styles.filesList}>
                                            {files.map((file) => (
                                              <div key={file._id} className={styles.fileItem}>
                                                <div className={styles.fileInfo}>
                                                  <FileText className={styles.fileIcon} />
                                                  <div className={styles.fileDetails}>
                                                    <span className={styles.fileName}>
                                                      {file.title || file.fileName}
                                                    </span>
                                                    <div className={styles.fileMetadata}>
                                                      <span className={styles.fileType}>Plan</span>
                                                      <span className={styles.fileDepartment}>{dept.department}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className={styles.fileActions}>
                                                  <button
                                                    className={styles.viewButton}
                                                    onClick={() => handleViewFile(file)}
                                                    title={t?.profile?.viewDocument || "View Document"}
                                                  >
                                                    <Eye size={16} />
                                                  </button>
                                                  <button
                                                    className={styles.downloadButton}
                                                    onClick={() => handleFileDownload(file)}
                                                    title={t?.profile?.downloadDocument || "Download Document"}
                                                  >
                                                    <Download size={16} />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* Exams Section */}
                    {dept.exams.length > 0 && (
                      <div className={styles.fileTypeSection}>
                        <div className={styles.fileTypeHeader}>
                          <FileText className={styles.fileTypeIcon} />
                          <h5 className={styles.fileTypeTitle}>Exams ({dept.exams.length})</h5>
                        </div>
                        <div className={styles.yearsList}>
                          {Object.entries(organizeFilesByYearQuarter(filterFiles(dept.exams))).map(
                            ([year, quarters]) => (
                              <div key={`exams-${year}`} className={styles.yearSection}>
                                <div
                                  className={styles.yearHeader}
                                  onClick={() =>
                                    toggleExpanded("year", `${appointment._id}-${dept.departmentKey}-exams-${year}`)
                                  }
                                >
                                  {expandedYears.has(`${appointment._id}-${dept.departmentKey}-exams-${year}`) ? (
                                    <ChevronDown className={styles.smallChevron} />
                                  ) : (
                                    <ChevronRight className={styles.smallChevron} />
                                  )}
                                  <Calendar className={styles.yearIcon} />
                                  <span className={styles.yearTitle}>{year}</span>
                                  <span className={styles.yearCount}>
                                    ({Object.values(quarters).reduce((sum, files) => sum + files.length, 0)} files)
                                  </span>
                                </div>

                                {expandedYears.has(`${appointment._id}-${dept.departmentKey}-exams-${year}`) && (
                                  <div className={styles.quartersList}>
                                    {Object.entries(quarters).map(([quarter, files]) => (
                                      <div key={`exams-${quarter}`} className={styles.quarterSection}>
                                        <div
                                          className={styles.quarterHeader}
                                          onClick={() =>
                                            toggleExpanded(
                                              "quarter",
                                              `${appointment._id}-${dept.departmentKey}-exams-${year}-${quarter}`,
                                            )
                                          }
                                        >
                                          {expandedQuarters.has(
                                            `${appointment._id}-${dept.departmentKey}-exams-${year}-${quarter}`,
                                          ) ? (
                                            <ChevronDown className={styles.smallChevron} />
                                          ) : (
                                            <ChevronRight className={styles.smallChevron} />
                                          )}
                                          <span className={styles.quarterTitle}>
                                            Q{quarter} ({files.length} files)
                                          </span>
                                        </div>

                                        {expandedQuarters.has(
                                          `${appointment._id}-${dept.departmentKey}-exams-${year}-${quarter}`,
                                        ) && (
                                          <div className={styles.filesList}>
                                            {files.map((file) => (
                                              <div key={file._id} className={styles.fileItem}>
                                                <div className={styles.fileInfo}>
                                                  <FileText className={styles.fileIcon} />
                                                  <div className={styles.fileDetails}>
                                                    <span className={styles.fileName}>
                                                      {file.title || file.fileName}
                                                    </span>
                                                    <div className={styles.fileMetadata}>
                                                      <span className={styles.fileType}>Exam</span>
                                                      <span className={styles.fileDepartment}>{dept.department}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className={styles.fileActions}>
                                                  <button
                                                    className={styles.viewButton}
                                                    onClick={() => handleViewFile(file)}
                                                    title={t?.profile?.viewDocument || "View Document"}
                                                  >
                                                    <Eye size={16} />
                                                  </button>
                                                  <button
                                                    className={styles.downloadButton}
                                                    onClick={() => handleFileDownload(file)}
                                                    title={t?.profile?.downloadDocument || "Download Document"}
                                                  >
                                                    <Download size={16} />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderExpiredProgramCard = (appointment, index) => {
    const programNumber = getProgramNumber(appointment, fullProgramData)

    return (
      <div key={appointment._id} className={`${styles.appointmentCard} ${styles.expiredCard}`}>
        <div className={styles.appointmentHeader} onClick={() => toggleExpanded("appointment", appointment._id)}>
          <div className={styles.appointmentInfo}>
            {expandedAppointments.has(appointment._id) ? (
              <ChevronDown className={styles.chevron} />
            ) : (
              <ChevronRight className={styles.chevron} />
            )}
            <StopCircle className={`${styles.appointmentIcon} ${styles.expiredIcon}`} />
            <div className={styles.appointmentDetails}>
              <h4 className={styles.appointmentTitle}>
                {t?.profile?.programName} {programNumber} (Completed)
              </h4>
              <p className={styles.appointmentDates}>
                {formatDate(appointment.assignmentDate)} - {formatDate(appointment.subscriptionEndDate)}
              </p>
            </div>
          </div>
          <div className={styles.appointmentStats}>
            <div className={`${styles.statBadge} ${styles.expiredBadge}`}>
              <span className={styles.statNumber}>{appointment.totalFiles}</span>
              <span className={styles.statLabel}>{t?.profile?.files || "files"}</span>
            </div>
            <div className={`${styles.statBadge} ${styles.expiredBadge}`}>
              <span className={styles.statNumber}>{appointment.departments.length}</span>
              <span className={styles.statLabel}>{t?.profile?.departments || "departments"}</span>
            </div>
          </div>
        </div>

        <div className={styles.statusMessage}>
          <div className={`${styles.statusContent} ${styles.expiredStatus}`}>
            <AlertCircle className={styles.statusIcon} />
            <div className={styles.statusText}>
              <h5>{t?.profile?.programEnded || "This program has ended"}</h5>
              <p>
                {t?.profile?.programEndedMessage || "Your program subscription ended on"}{" "}
                {formatDate(appointment.subscriptionEndDate)}.{" "}
                {t?.profile?.accessFilesStill ||
                  "You can still access your files and progress history. Your initial evaluation was completed on"}{" "}
                {formatDate(appointment.date)} {t?.profile?.at} {formatTime(appointment.time)}.
              </p>
              <div className={styles.evaluationDetails}>
                <strong>{t?.profile?.initialEvaluation || "Initial Evaluation"}:</strong> {appointment.description}
              </div>
            </div>
          </div>
        </div>

        {expandedAppointments.has(appointment._id) && (
          <div className={styles.appointmentContent}>
            {appointment.departments.map((dept) => (
              <div key={dept.departmentKey} className={styles.departmentSection}>
                <div
                  className={styles.departmentHeader}
                  onClick={() => toggleExpanded("department", `${appointment._id}-${dept.departmentKey}`)}
                >
                  {expandedDepartments.has(`${appointment._id}-${dept.departmentKey}`) ? (
                    <ChevronDown className={styles.chevron} />
                  ) : (
                    <ChevronRight className={styles.chevron} />
                  )}
                  <FolderOpen className={styles.departmentIcon} />
                  <span className={styles.departmentName}>{dept.department}</span>
                  <span className={styles.fileCount}>({dept.totalFiles} files)</span>
                </div>

                {expandedDepartments.has(`${appointment._id}-${dept.departmentKey}`) && (
                  <div className={styles.departmentContent}>
                    {/* Plans Section */}
                    {dept.plans.length > 0 && (
                      <div className={styles.fileTypeSection}>
                        <div className={styles.fileTypeHeader}>
                          <FileText className={styles.fileTypeIcon} />
                          <h5 className={styles.fileTypeTitle}>Plans ({dept.plans.length})</h5>
                        </div>
                        <div className={styles.yearsList}>
                          {Object.entries(organizeFilesByYearQuarter(filterFiles(dept.plans))).map(
                            ([year, quarters]) => (
                              <div key={`plans-${year}`} className={styles.yearSection}>
                                <div
                                  className={styles.yearHeader}
                                  onClick={() =>
                                    toggleExpanded("year", `${appointment._id}-${dept.departmentKey}-plans-${year}`)
                                  }
                                >
                                  {expandedYears.has(`${appointment._id}-${dept.departmentKey}-plans-${year}`) ? (
                                    <ChevronDown className={styles.smallChevron} />
                                  ) : (
                                    <ChevronRight className={styles.smallChevron} />
                                  )}
                                  <Calendar className={styles.yearIcon} />
                                  <span className={styles.yearTitle}>{year}</span>
                                  <span className={styles.yearCount}>
                                    ({Object.values(quarters).reduce((sum, files) => sum + files.length, 0)} files)
                                  </span>
                                </div>

                                {expandedYears.has(`${appointment._id}-${dept.departmentKey}-plans-${year}`) && (
                                  <div className={styles.quartersList}>
                                    {Object.entries(quarters).map(([quarter, files]) => (
                                      <div key={`plans-${quarter}`} className={styles.quarterSection}>
                                        <div
                                          className={styles.quarterHeader}
                                          onClick={() =>
                                            toggleExpanded(
                                              "quarter",
                                              `${appointment._id}-${dept.departmentKey}-plans-${year}-${quarter}`,
                                            )
                                          }
                                        >
                                          {expandedQuarters.has(
                                            `${appointment._id}-${dept.departmentKey}-plans-${year}-${quarter}`,
                                          ) ? (
                                            <ChevronDown className={styles.smallChevron} />
                                          ) : (
                                            <ChevronRight className={styles.smallChevron} />
                                          )}
                                          <span className={styles.quarterTitle}>
                                            Q{quarter} ({files.length} files)
                                          </span>
                                        </div>

                                        {expandedQuarters.has(
                                          `${appointment._id}-${dept.departmentKey}-plans-${year}-${quarter}`,
                                        ) && (
                                          <div className={styles.filesList}>
                                            {files.map((file) => (
                                              <div key={file._id} className={styles.fileItem}>
                                                <div className={styles.fileInfo}>
                                                  <FileText className={styles.fileIcon} />
                                                  <div className={styles.fileDetails}>
                                                    <span className={styles.fileName}>
                                                      {file.title || file.fileName}
                                                    </span>
                                                    <div className={styles.fileMetadata}>
                                                      <span className={styles.fileType}>Plan</span>
                                                      <span className={styles.fileDepartment}>{dept.department}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className={styles.fileActions}>
                                                  <button
                                                    className={styles.viewButton}
                                                    onClick={() => handleViewFile(file)}
                                                    title={t?.profile?.viewDocument || "View Document"}
                                                  >
                                                    <Eye size={16} />
                                                  </button>
                                                  <button
                                                    className={styles.downloadButton}
                                                    onClick={() => handleFileDownload(file)}
                                                    title={t?.profile?.downloadDocument || "Download Document"}
                                                  >
                                                    <Download size={16} />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* Exams Section */}
                    {dept.exams.length > 0 && (
                      <div className={styles.fileTypeSection}>
                        <div className={styles.fileTypeHeader}>
                          <FileText className={styles.fileTypeIcon} />
                          <h5 className={styles.fileTypeTitle}>Exams ({dept.exams.length})</h5>
                        </div>
                        <div className={styles.yearsList}>
                          {Object.entries(organizeFilesByYearQuarter(filterFiles(dept.exams))).map(
                            ([year, quarters]) => (
                              <div key={`exams-${year}`} className={styles.yearSection}>
                                <div
                                  className={styles.yearHeader}
                                  onClick={() =>
                                    toggleExpanded("year", `${appointment._id}-${dept.departmentKey}-exams-${year}`)
                                  }
                                >
                                  {expandedYears.has(`${appointment._id}-${dept.departmentKey}-exams-${year}`) ? (
                                    <ChevronDown className={styles.smallChevron} />
                                  ) : (
                                    <ChevronRight className={styles.smallChevron} />
                                  )}
                                  <Calendar className={styles.yearIcon} />
                                  <span className={styles.yearTitle}>{year}</span>
                                  <span className={styles.yearCount}>
                                    ({Object.values(quarters).reduce((sum, files) => sum + files.length, 0)} files)
                                  </span>
                                </div>

                                {expandedYears.has(`${appointment._id}-${dept.departmentKey}-exams-${year}`) && (
                                  <div className={styles.quartersList}>
                                    {Object.entries(quarters).map(([quarter, files]) => (
                                      <div key={`exams-${quarter}`} className={styles.quarterSection}>
                                        <div
                                          className={styles.quarterHeader}
                                          onClick={() =>
                                            toggleExpanded(
                                              "quarter",
                                              `${appointment._id}-${dept.departmentKey}-exams-${year}-${quarter}`,
                                            )
                                          }
                                        >
                                          {expandedQuarters.has(
                                            `${appointment._id}-${dept.departmentKey}-exams-${year}-${quarter}`,
                                          ) ? (
                                            <ChevronDown className={styles.smallChevron} />
                                          ) : (
                                            <ChevronRight className={styles.smallChevron} />
                                          )}
                                          <span className={styles.quarterTitle}>
                                            Q{quarter} ({files.length} files)
                                          </span>
                                        </div>

                                        {expandedQuarters.has(
                                          `${appointment._id}-${dept.departmentKey}-exams-${year}-${quarter}`,
                                        ) && (
                                          <div className={styles.filesList}>
                                            {files.map((file) => (
                                              <div key={file._id} className={styles.fileItem}>
                                                <div className={styles.fileInfo}>
                                                  <FileText className={styles.fileIcon} />
                                                  <div className={styles.fileDetails}>
                                                    <span className={styles.fileName}>
                                                      {file.title || file.fileName}
                                                    </span>
                                                    <div className={styles.fileMetadata}>
                                                      <span className={styles.fileType}>Exam</span>
                                                      <span className={styles.fileDepartment}>{dept.department}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className={styles.fileActions}>
                                                  <button
                                                    className={styles.viewButton}
                                                    onClick={() => handleViewFile(file)}
                                                    title={t?.profile?.viewDocument || "View Document"}
                                                  >
                                                    <Eye size={16} />
                                                  </button>
                                                  <button
                                                    className={styles.downloadButton}
                                                    onClick={() => handleFileDownload(file)}
                                                    title={t?.profile?.downloadDocument || "Download Document"}
                                                  >
                                                    <Download size={16} />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
        <p className={styles.loadingText}>{t?.profile?.loading || "Loading"}...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} />
        <p className={styles.errorText}>{error}</p>
        <button onClick={fetchFullProgramData} className={styles.retryButton}>
          {t?.profile?.tryAgain || "Try Again"}
        </button>
      </div>
    )
  }

  // Document Viewer Mode - Inline
  if (viewingDocument) {
    return (
      <div className={styles.documentViewerContainer}>
        <div className={styles.documentViewerHeader}>
          <button onClick={handleBackToFiles} className={styles.backButton}>
            <ArrowLeft size={20} />
            {t?.profile?.backToFiles || "Back to Files"}
          </button>
          <div className={styles.documentInfo}>
            <FileText size={20} className={styles.documentIcon} />
            <div className={styles.documentDetails}>
              <h5 className={styles.documentTitle}>{viewingDocument.fileName}</h5>
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

  if (!fullProgramData.length) {
    return (
      <div className={styles.emptyContainer}>
        <Calendar className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>{t?.profile?.noPrograms || "No Programs"}</h3>
        <p className={styles.emptyText}>You don't have any full program appointments yet.</p>
      </div>
    )
  }

  return (
    <div className={`${styles.fullProgramContainer} ${language === "ar" ? styles.rtl : styles.ltr}`}>
      <div className={styles.appointmentsList}>
        {fullProgramData.map((appointment, index) => renderAppointmentCard(appointment, index))}
      </div>
    </div>
  )
}

export default FullProgramTab
