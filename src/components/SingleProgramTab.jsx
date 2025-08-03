"use client"

import { useState, useEffect } from "react"
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
  PlayCircle,
  User,
  Activity,
  Briefcase,
} from "lucide-react"
import styles from "../styles/single-program-tab.module.css"
import PatientDocumentViewer from "./PatientDocumentViewer"

export default function SingleProgramTab({ patientId, language, translations: t }) {
  const [singlePrograms, setSinglePrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedPrograms, setExpandedPrograms] = useState(new Set())
  const [expandedDepartments, setExpandedDepartments] = useState(new Set())
  const [viewingDocument, setViewingDocument] = useState(null)

  // Department mapping with API routes
  const departmentMapping = {
    ABA: {
      name: "Applied Behavior Analysis",
      icon: Activity,
      color: "#3b82f6",
      route: "abaS",
    },
    speech: {
      name: "Speech Therapy",
      icon: User,
      color: "#10b981",
      route: "speechS",
    },
    physical_therapy: {
      name: "Physical Therapy",
      icon: Activity,
      color: "#f59e0b",
      route: "physicalTherapyS",
    },
    occupational_therapy: {
      name: "Occupational Therapy",
      icon: Briefcase,
      color: "#8b5cf6",
      route: "OccupationalTherapyS",
    },
    special_education: {
      name: "Special Education",
      icon: FileText,
      color: "#ef4444",
      route: "SpecialEducationS",
    },
  }

  useEffect(() => {
    if (patientId) {
      fetchSinglePrograms()
    }
  }, [patientId])

  const fetchSinglePrograms = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch single programs for this patient
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-single-programs/${patientId}`,
      )
      const programs = response.data || []

      // Fetch department details for each program
      const programsWithDetails = await Promise.all(
        programs.map(async (program) => {
          const departmentDetails = await Promise.all(
            (program.programkind || []).map(async (dept) => {
              const deptConfig = departmentMapping[dept]
              if (!deptConfig) {
                return {
                  name: dept,
                  displayName: dept,
                  assignment: null,
                  plan: null,
                  icon: FileText,
                  color: "#6b7280",
                }
              }

              try {
                // Fetch assignment and plan for this department
                const [assignmentRes, planRes] = await Promise.all([
                  axios
                    .get(`${process.env.NEXT_PUBLIC_API_URL}/${deptConfig.route}/assignment-by-program/${program._id}`)
                    .catch(() => ({ data: null })),
                  axios
                    .get(`${process.env.NEXT_PUBLIC_API_URL}/${deptConfig.route}/plan-details/${patientId}`)
                    .catch(() => ({ data: null })),
                ])

                return {
                  name: dept,
                  displayName: deptConfig.name,
                  assignment: assignmentRes.data,
                  plan: planRes.data,
                  icon: deptConfig.icon,
                  color: deptConfig.color,
                }
              } catch (error) {
                console.error(`Error fetching ${dept} details:`, error)
                return {
                  name: dept,
                  displayName: deptConfig.name,
                  assignment: null,
                  plan: null,
                  icon: deptConfig.icon,
                  color: deptConfig.color,
                }
              }
            }),
          )

          return {
            ...program,
            departments: departmentDetails,
            status: determineOverallStatus(program, departmentDetails),
          }
        }),
      )

      // Sort programs by date (newest first)
      const sortedPrograms = programsWithDetails.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB - dateA
      })

      setSinglePrograms(sortedPrograms)
    } catch (error) {
      console.error("Error fetching single programs:", error)
      setError("Failed to load single programs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const determineOverallStatus = (program, departments) => {
    const now = new Date()
    const programDateTime = new Date(`${program.date}T${program.time || "00:00"}`)

    // If program is in the future
    if (programDateTime > now) {
      return "upcoming"
    }

    // If program is in the past, check department statuses
    const totalDepts = departments.length
    const completedDepts = departments.filter(
      (dept) => dept.assignment && dept.assignment.status === "completed",
    ).length
    const activeDepts = departments.filter((dept) => dept.assignment && dept.assignment.status === "active").length

    if (completedDepts === totalDepts && totalDepts > 0) {
      return "completed"
    } else if (activeDepts > 0 || completedDepts > 0) {
      return "in-progress"
    } else if (programDateTime < now) {
      return "missed"
    }

    return "active"
  }

  const toggleExpanded = (type, id) => {
    const setterMap = {
      program: setExpandedPrograms,
      department: setExpandedDepartments,
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  const formatTime = (timeString) => {
    try {
      if (timeString && timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":")
        const date = new Date()
        date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10), 0, 0)
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      }
      return timeString || "No time"
    } catch (error) {
      return "Invalid Time"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className={`${styles.statusIcon} ${styles.completedIcon}`} />
      case "in-progress":
        return <PlayCircle className={`${styles.statusIcon} ${styles.inProgressIcon}`} />
      case "upcoming":
        return <Clock className={`${styles.statusIcon} ${styles.upcomingIcon}`} />
      case "missed":
        return <XCircle className={`${styles.statusIcon} ${styles.missedIcon}`} />
      case "active":
        return <PlayCircle className={`${styles.statusIcon} ${styles.activeIcon}`} />
      default:
        return <AlertCircle className={`${styles.statusIcon} ${styles.unknownIcon}`} />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return t.profile.completed
      case "in-progress":
        return t.profile.inProgress
      case "upcoming":
        return t.profile.upcoming
      case "missed":
        return t.profile.missed
      case "active":
        return t.profile.active
      default:
        return t.profile.unknown
    }
  }

  const handleViewFile = (plan, departmentName) => {
    if (plan && plan.filePath) {
      const deptConfig = departmentMapping[departmentName]
      const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${deptConfig?.route || "files"}/${plan.filePath}`

      setViewingDocument({
        filePath: fileUrl,
        fileName: plan.fileName || plan.title || `${departmentName}_plan.pdf`,
        fileType: `${departmentName} Plan`,
        file: plan,
      })
    }
  }

  const handleFileDownload = async (plan, departmentName) => {
    try {
      if (plan && plan.filePath) {
        const deptConfig = departmentMapping[departmentName]
        const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${deptConfig?.route || "files"}/${plan.filePath}`

        const response = await axios.get(fileUrl, { responseType: "blob" })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", plan.fileName || plan.title || `${departmentName}_plan.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Failed to download file. Please try again.")
    }
  }

  const handleBackToFiles = () => {
    setViewingDocument(null)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
        <p className={styles.loadingText}>{t?.profile?.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} />
        <p className={styles.errorText}>{error}</p>
        <button onClick={fetchSinglePrograms} className={styles.retryButton}>
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
            Back to Programs
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
          <PatientDocumentViewer filePath={viewingDocument.filePath} fileName={viewingDocument.fileName} />
        </div>
      </div>
    )
  }

  if (!singlePrograms.length) {
    return (
      <div className={styles.emptyContainer}>
        <Calendar className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>{t?.profile?.noPrograms}</h3>
        <p className={styles.emptyText}>You don't have any single program appointments yet.</p>
      </div>
    )
  }

  return (
    <div className={`${styles.singleProgramContainer} ${language === "ar" ? "rtl" : "ltr"}`}>
      <div className={styles.programsList}>
        {singlePrograms.map((program) => (
          <div key={program._id} className={`${styles.programCard} ${styles[program.status + "Card"]}`}>
            <div className={styles.programHeader} onClick={() => toggleExpanded("program", program._id)}>
              <div className={styles.programInfo}>
                {expandedPrograms.has(program._id) ? (
                  <ChevronDown className={styles.chevron} />
                ) : (
                  <ChevronRight className={styles.chevron} />
                )}
                <User className={`${styles.programIcon} ${styles[program.status + "Icon"]}`} />
                <div className={styles.programDetails}>
                  <h4 className={styles.programTitle}>{t.profile.singleProgram}</h4>
                  <p className={styles.programDate}>
                    {formatDate(program.date)} at {formatTime(program.time)}
                  </p>
                  <p className={styles.programDescription}>{program.description}</p>
                  <div className={styles.departmentTags}>
                    {program.departments.map((dept) => (
                      <span
                        key={dept.name}
                        className={styles.departmentTag}
                        style={{ backgroundColor: dept.color + "20", color: dept.color }}
                      >
                        {dept.displayName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.programStats}>
                <div className={`${styles.statBadge} ${styles[program.status + "Badge"]}`}>
                  {getStatusIcon(program.status)}
                  <span className={styles.statLabel}>{getStatusText(program.status)}</span>
                </div>
                <div className={`${styles.statBadge} ${styles.departmentsBadge}`}>
                  <span className={styles.statNumber}>{program.departments.length}</span>
                  <span className={styles.statLabel}>departments</span>
                </div>
              </div>
            </div>

            {expandedPrograms.has(program._id) && (
              <div className={styles.programContent}>
                <div className={styles.departmentsSection}>
                  <div className={styles.sectionHeader}>
                    <Briefcase className={styles.sectionIcon} />
                    <h5 className={styles.sectionTitle}>Departments ({program.departments.length})</h5>
                  </div>

                  {program.departments.map((department) => (
                    <div key={department.name} className={styles.departmentCard}>
                      <div
                        className={styles.departmentHeader}
                        onClick={() => toggleExpanded("department", `${program._id}-${department.name}`)}
                      >
                        {expandedDepartments.has(`${program._id}-${department.name}`) ? (
                          <ChevronDown className={styles.smallChevron} />
                        ) : (
                          <ChevronRight className={styles.smallChevron} />
                        )}
                        <department.icon className={styles.departmentIcon} style={{ color: department.color }} />
                        <span className={styles.departmentName}>{department.displayName}</span>
                        <div className={styles.departmentStatus}>
                          {department.assignment ? (
                            <span
                              className={`${styles.statusBadge} ${styles[department.assignment.status + "Status"]}`}
                            >
                              {department.assignment.status}
                            </span>
                          ) : (
                            <span className={`${styles.statusBadge} ${styles.notAssignedStatus}`}>Not Assigned</span>
                          )}
                        </div>
                      </div>

                      {expandedDepartments.has(`${program._id}-${department.name}`) && (
                        <div className={styles.departmentContent}>
                          {/* Assignment Details */}
                          {department.assignment && (
                            <div className={styles.assignmentSection}>
                              <h6 className={styles.subsectionTitle}>Assignment Details</h6>
                              <div className={styles.assignmentDetails}>
                                <div className={styles.detailRow}>
                                  <span className={styles.detailLabel}>{t.profile.status}:</span>
                                  <span className={styles.detailValue}>{department.assignment.status}</span>
                                </div>
                                {department.assignment.sessionNumber && (
                                  <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Session:</span>
                                    <span className={styles.detailValue}>#{department.assignment.sessionNumber}</span>
                                  </div>
                                )}
                                <div className={styles.detailRow}>
                                  <span className={styles.detailLabel}>Assigned Date:</span>
                                  <span className={styles.detailValue}>
                                    {formatDate(department.assignment.assignedDate)}
                                  </span>
                                </div>
                                {department.assignment.completedAt && (
                                  <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Completed:</span>
                                    <span className={styles.detailValue}>
                                      {formatDate(department.assignment.completedAt)}
                                    </span>
                                  </div>
                                )}
                                {department.assignment.notes && (
                                  <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Notes:</span>
                                    <span className={styles.detailValue}>{department.assignment.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Treatment Plan */}
                          {department.plan && (
                            <div className={styles.planSection}>
                              <h6 className={styles.subsectionTitle}>Treatment Plan</h6>
                              <div className={styles.planDetails}>
                                <div className={styles.planInfo}>
                                  <FileText className={styles.planIcon} />
                                  <div className={styles.planText}>
                                    <span className={styles.planTitle}>
                                      {department.plan.title || `${department.displayName} Plan`}
                                    </span>
                                    <span className={styles.planDate}>
                                      Last updated:{" "}
                                      {formatDate(department.plan.lastModified || department.plan.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <div className={styles.planActions}>
                                  <button
                                    className={styles.viewButton}
                                    onClick={() => handleViewFile(department.plan, department.name)}
                                    title={t.profile.viewDetails}
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    className={styles.downloadButton}
                                    onClick={() => handleFileDownload(department.plan, department.name)}
                                    title="Download Document"
                                  >
                                    <Download size={16} />
                                  </button>
                                </div>
                              </div>
                              {department.plan.content && (
                                <div className={styles.planContent}>
                                  <p>{department.plan.content}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* No Assignment/Plan Messages */}
                          {!department.assignment && (
                            <div className={styles.noDataMessage}>
                              <AlertCircle className={styles.noDataIcon} />
                              <span className={styles.noDataText}>No assignment found for this department</span>
                            </div>
                          )}

                          {!department.plan && (
                            <div className={styles.noDataMessage}>
                              <FileText className={styles.noDataIcon} />
                              <span className={styles.noDataText}>No treatment plan available yet</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
