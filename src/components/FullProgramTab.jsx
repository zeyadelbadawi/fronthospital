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
  CreditCard,
  Banknote,
  DollarSign,
  Building2,
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

  const determineAppointmentStatus = (appointment) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Reset time to start of day for accurate date comparison

    let appointmentDateTime
    try {
      if (appointment.date && appointment.time) {
        // Parse the date string properly
        const dateStr = appointment.date.includes("T") ? appointment.date.split("T")[0] : appointment.date
        const timeStr = appointment.time.includes(":") ? appointment.time : `${appointment.time}:00`

        appointmentDateTime = new Date(`${dateStr}T${timeStr}`)

        // If invalid date, try alternative parsing
        if (isNaN(appointmentDateTime.getTime())) {
          appointmentDateTime = new Date(appointment.date + " " + appointment.time)
        }
      } else {
        appointmentDateTime = new Date(appointment.assignmentDate || appointment.date)
      }
    } catch (error) {
      console.error("Error parsing appointment date/time:", error)
      appointmentDateTime = new Date(appointment.assignmentDate || appointment.date)
    }

    // Reset appointment time to start of day for date-only comparison
    const appointmentDateOnly = new Date(appointmentDateTime)
    appointmentDateOnly.setHours(0, 0, 0, 0)

    const subscriptionEndDate = appointment.subscriptionEndDate ? new Date(appointment.subscriptionEndDate) : null
    if (subscriptionEndDate) {
      subscriptionEndDate.setHours(0, 0, 0, 0)
    }

    if (appointment.status === "not active") {
      // Compare dates only - appointment is missed only if the date has passed
      if (appointmentDateOnly > now) {
        return "upcoming" // Future appointment
      } else if (appointmentDateOnly.getTime() === now.getTime()) {
        return "upcoming" // Today's appointment is still upcoming
      } else {
        return "missed" // Past appointment
      }
    } else if (appointment.status === "active") {
      if (subscriptionEndDate && subscriptionEndDate < now) {
        return "expired" // Active but subscription ended
      } else {
        return "active" // Active program
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
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return ""
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const calculateSubscriptionProgress = (appointment) => {
    const now = new Date()
    const startDate = new Date(appointment.assignmentDate)
    const endDate = new Date(appointment.subscriptionEndDate)

    // Calculate total duration and elapsed time
    const totalDuration = endDate - startDate
    const elapsed = now - startDate
    const remaining = endDate - now

    // Calculate percentage (0-100)
    const percentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)

    // Calculate days remaining
    const daysRemaining = Math.ceil(remaining / (1000 * 60 * 60 * 24))

    // Determine status
    const isExpired = now > endDate
    const isNearExpiry = daysRemaining <= 30 && daysRemaining > 0

    return {
      percentage: isExpired ? 100 : percentage,
      daysRemaining,
      isExpired,
      isNearExpiry,
      startDate,
      endDate,
    }
  }

  const formatTimeRemaining = (daysRemaining) => {
    if (daysRemaining < 0) {
      return t?.profile?.expired || "Expired"
    } else if (daysRemaining === 0) {
      return t?.profile?.expiringToday || "Expiring Today"
    } else if (daysRemaining === 1) {
      return t?.profile?.oneDayLeft || "1 day left"
    } else if (daysRemaining <= 7) {
      return `${daysRemaining} ${daysRemaining === 1 ? t?.profile?.dayLeft || "day left" : t?.profile?.daysLeft || "days left"}`
    } else if (daysRemaining <= 30) {
      const weeks = Math.ceil(daysRemaining / 7)
      return `${weeks} ${weeks === 1 ? t?.profile?.weekLeft || "week left" : t?.profile?.weeksLeft || "weeks left"}`
    } else {
      const months = Math.ceil(daysRemaining / 30)
      return `${months} ${months === 1 ? t?.profile?.monthLeft || "month left" : t?.profile?.monthsLeft || "months left"}`
    }
  }

  const getPaymentBadge = (appointment) => {
    const { paymentStatus, paymentMethod, paidAmount, totalAmount } = appointment

    // For Full Program: Two-stage payment system
    // First payment: 1000 EGP (evaluation)
    // Second payment: 4000 EGP (remaining)

    // Check bank transfer FIRST before other payment methods
    if (paymentMethod === "BANK_TRANSFER") {
      if (paymentStatus === "FULLY_PAID" || paymentStatus === "PARTIALLY_PAID") {
        return {
          text: t?.profile?.paidViaBankTransfer || "Paid via Bank Transfer",
          icon: <Building2 size={14} />,
          className: styles.paidBankTransferBadge,
          tooltip: `${t?.profile?.paidViaBankTransferConfirmed || "Paid via bank transfer (Confirmed)"}: ${paidAmount || totalAmount} EGP`,
        }
      } else if (paymentStatus === "REJECTED") {
        return {
          text: t?.profile?.bankTransferRejected || "Bank Transfer Rejected",
          icon: <XCircle size={14} />,
          className: styles.rejectedBankTransferBadge,
          tooltip:
            t?.profile?.bankTransferRejectedMessage ||
            "Your bank transfer payment was rejected. Please contact support.",
        }
      } else if (paymentStatus === "PENDING") {
        return {
          text: t?.profile?.bankTransferPending || "Bank Transfer Pending",
          icon: <Clock size={14} />,
          className: styles.pendingBankTransferBadge,
          tooltip:
            t?.profile?.bankTransferPendingMessage ||
            "Your bank transfer is being reviewed. We will notify you once confirmed.",
        }
      }
    }

    if (paymentStatus === "FULLY_PAID") {
      // All payments completed (5000 EGP total)
      return {
        text: t?.profile?.fullyPaid || "Fully Paid",
        icon: <CheckCircle size={14} />,
        className: styles.fullyPaidBadge,
        tooltip: t?.profile?.allPaymentsCompleted || "All payments completed (5000 EGP)",
      }
    } else if (paymentStatus === "PARTIALLY_PAID") {
      // Evaluation paid (1000 EGP), remaining pending (4000 EGP)
      if (paymentMethod === "ONLINE" || paymentMethod === "MIXED") {
        return {
          text: t?.profile?.evaluationPaidOnline || "Evaluation Paid Online",
          icon: <CreditCard size={14} />,
          className: styles.paidOnlineBadge,
          tooltip: `${t?.profile?.paid || "Paid"}: ${paidAmount} EGP ${t?.profile?.online || "online"}. ${t?.profile?.remaining || "Remaining"}: ${totalAmount - paidAmount} EGP`,
        }
      } else {
        return {
          text: t?.profile?.evaluationPaidAtCenter || "Evaluation Paid at Center",
          icon: <Banknote size={14} />,
          className: styles.paidAtCenterBadge,
          tooltip: `${t?.profile?.paid || "Paid"}: ${paidAmount} EGP ${t?.profile?.atCenter || "at center"}. ${t?.profile?.remaining || "Remaining"}: ${totalAmount - paidAmount} EGP`,
        }
      }
    } else if (paymentStatus === "PENDING") {
      // No payment yet
      if (paymentMethod === "ONLINE") {
        // User selected online but hasn't paid yet (shouldn't happen often)
        return {
          text: t?.profile?.pendingOnlinePayment || "Pending Online Payment",
          icon: <Clock size={14} />,
          className: styles.pendingOnlineBadge,
          tooltip: t?.profile?.waitingForOnlinePayment || "Waiting for online payment",
        }
      } else {
        // Cash payment - waiting for client to pay at center
        return {
          text: t?.profile?.pendingPaymentAtCenter || "Pending Payment at Center",
          icon: <DollarSign size={14} />,
          className: styles.pendingCashBadge,
          tooltip: t?.profile?.paymentDueAtCenter || "Payment due when client arrives at center",
        }
      }
    }

    return null
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
        return renderActiveProgramCard(appointment, index) // Fallback for unknown status
    }
  }

  const renderUpcomingAppointmentCard = (appointment, index) => {
    const timeUntil = getTimeUntilAppointment(appointment)
    const paymentBadge = getPaymentBadge(appointment)

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
              {paymentBadge && (
                <div className={styles.paymentBadgeContainer} title={paymentBadge.tooltip}>
                  <span className={`${styles.paymentBadge} ${paymentBadge.className}`}>
                    {paymentBadge.icon}
                    <span>{paymentBadge.text}</span>
                  </span>
                </div>
              )}
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
    const paymentBadge = getPaymentBadge(appointment)

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
              {paymentBadge && (
                <div className={styles.paymentBadgeContainer} title={paymentBadge.tooltip}>
                  <span className={`${styles.paymentBadge} ${paymentBadge.className}`}>
                    {paymentBadge.icon}
                    <span>{paymentBadge.text}</span>
                  </span>
                </div>
              )}
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
    const paymentBadge = getPaymentBadge(appointment)
    const subscriptionProgress = calculateSubscriptionProgress(appointment)

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
              {paymentBadge && (
                <div className={styles.paymentBadgeContainer} title={paymentBadge.tooltip}>
                  <span className={`${styles.paymentBadge} ${paymentBadge.className}`}>
                    {paymentBadge.icon}
                    <span>{paymentBadge.text}</span>
                  </span>
                </div>
              )}
              <div className={styles.subscriptionProgressContainer}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>
                    {t?.profile?.subscriptionProgress || "Subscription Progress"}
                  </span>
                  <span
                    className={`${styles.progressTime} ${subscriptionProgress.isNearExpiry ? styles.progressTimeWarning : ""}`}
                  >
                    {formatTimeRemaining(subscriptionProgress.daysRemaining)}
                  </span>
                </div>
                <div className={styles.progressBarContainer}>
                  <div
                    className={`${styles.progressBarFill} ${subscriptionProgress.isNearExpiry ? styles.progressBarWarning : styles.progressBarActive}`}
                    style={{ width: `${subscriptionProgress.percentage}%` }}
                  >
                    <div className={styles.progressBarGlow}></div>
                  </div>
                </div>
                <div className={styles.progressDates}>
                  <span className={styles.progressDate}>{formatDate(subscriptionProgress.startDate)}</span>
                  <span className={styles.progressDate}>{formatDate(subscriptionProgress.endDate)}</span>
                </div>
              </div>
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
    const paymentBadge = getPaymentBadge(appointment)
    const subscriptionProgress = calculateSubscriptionProgress(appointment)

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
              {paymentBadge && (
                <div className={styles.paymentBadgeContainer} title={paymentBadge.tooltip}>
                  <span className={`${styles.paymentBadge} ${paymentBadge.className}`}>
                    {paymentBadge.icon}
                    <span>{paymentBadge.text}</span>
                  </span>
                </div>
              )}
              <div className={styles.subscriptionProgressContainer}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>
                    {t?.profile?.subscriptionProgress || "Subscription Progress"}
                  </span>
                  <span className={`${styles.progressTime} ${styles.progressTimeExpired}`}>
                    {t?.profile?.expired || "Expired"}
                  </span>
                </div>
                <div className={styles.progressBarContainer}>
                  <div className={`${styles.progressBarFill} ${styles.progressBarExpired}`} style={{ width: "100%" }}>
                    <div className={styles.progressBarGlow}></div>
                  </div>
                </div>
                <div className={styles.progressDates}>
                  <span className={styles.progressDate}>{formatDate(subscriptionProgress.startDate)}</span>
                  <span className={styles.progressDate}>{formatDate(subscriptionProgress.endDate)}</span>
                </div>
              </div>
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
