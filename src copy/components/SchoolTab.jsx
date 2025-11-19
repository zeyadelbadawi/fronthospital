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
  GraduationCap,
  BookOpen,
  FileX,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  CreditCard,
  Banknote,
  DollarSign,
  Building2,
} from "lucide-react"
import styles from "../styles/school-tab.module.css"
import PatientDocumentViewer from "./PatientDocumentViewer"

const SchoolTab = ({
  patientId,
  schoolData,
  setSchoolData,
  loading,
  setLoading,
  error,
  setError,
  language,
  translations: t,
}) => {
  const [expandedPrograms, setExpandedPrograms] = useState(new Set())
  const [expandedAppointments, setExpandedAppointments] = useState(new Set())
  const [viewingDocument, setViewingDocument] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const documentViewerRef = useRef(null)

  useEffect(() => {
    if (patientId) {
      fetchSchoolData()
    }
  }, [patientId, language]) // Added 'language' to the dependency array

  const fetchSchoolData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch school programs for this patient
      const schoolResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/by-patient/${patientId}`,
      )

      const schoolPrograms = schoolResponse.data.appointments || []

      // Group appointments by unicValue (program group)
      const groupedPrograms = groupAppointmentsByUnicValue(schoolPrograms)

      // Fetch school plans for each program group
      const programsWithPlans = await Promise.all(
        groupedPrograms.map(async (program) => {
          try {
            // جلب الخطط المحددة لهذا البرنامج باستخدام unicValue
            const plansResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/school/plan/${patientId}/${program.unicValue}`,
            )

            const plans = plansResponse.data
              ? Array.isArray(plansResponse.data)
                ? plansResponse.data.filter((plan) => plan.filePath && plan.filePath.trim() !== "")
                : plansResponse.data.filePath && plansResponse.data.filePath.trim() !== ""
                  ? [plansResponse.data]
                  : []
              : []

            return {
              ...program,
              plans,
              totalFiles: plans.length,
              planExists: plans.length > 0,
            }
          } catch (error) {
            console.error(`Error fetching school plans for program ${program.unicValue}:`, error)

            // إذا فشل الـ API المحدد، جرب الـ API العام كـ fallback
            try {
              const fallbackResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/school/plan/${patientId}`)
              const allPlans = fallbackResponse.data
                ? Array.isArray(fallbackResponse.data)
                  ? fallbackResponse.data
                  : [fallbackResponse.data]
                : []

              // فلتر الخطط حسب unicValue إذا كان متوفر في البيانات
              const filteredPlans = allPlans.filter(
                (plan) =>
                  (plan.unicValue === program.unicValue || plan.programId === program.unicValue || !plan.unicValue) &&
                  plan.filePath &&
                  plan.filePath.trim() !== "",
              )

              return {
                ...program,
                plans: filteredPlans,
                totalFiles: filteredPlans.length,
                planExists: filteredPlans.length > 0,
              }
            } catch (fallbackError) {
              console.error(`Fallback error for program ${program.unicValue}:`, fallbackError)
              return {
                ...program,
                plans: [],
                totalFiles: 0,
                planExists: false,
              }
            }
          }
        }),
      )

      // Sort programs by creation date (oldest first, but display newest first)
      // This means the first created program gets index 1, but appears last in the list
      const sortedPrograms = programsWithPlans.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.appointments[0]?.createdAt)
        const dateB = new Date(b.createdAt || b.appointments[0]?.createdAt)
        return dateB - dateA // Newest first in display
      })

      setSchoolData(sortedPrograms)
    } catch (error) {
      console.error("Error fetching school data:", error)
      setError(t?.profile?.failedToLoadSchoolData || "Failed to load school data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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
          status: "not_started",
          createdAt: appointment.createdAt,
        }
      }

      grouped[unicValue].appointments.push(appointment)
      grouped[unicValue].totalAppointments++

      if (appointment.status === "completed") {
        grouped[unicValue].completedAppointments++
      }
    })

    // Determine overall program status with smart logic
    Object.values(grouped).forEach((program) => {
      // Sort appointments within each program by date first
      program.appointments.sort((a, b) => {
        const dateA = parseAppointmentDateTime(a)
        const dateB = parseAppointmentDateTime(b)
        return dateA - dateB
      })

      // Get program status using smart logic
      program.smartStatus = getProgramSmartStatus(program)

      // Keep original status for backward compatibility
      if (program.completedAppointments === 0) {
        program.status = "not_started"
      } else if (program.completedAppointments === program.totalAppointments) {
        program.status = "completed"
      } else {
        program.status = "in_progress"
      }
    })

    return Object.values(grouped)
  }

  // دالة لتحليل التاريخ والوقت بشكل صحيح
  const parseAppointmentDateTime = (appointment) => {
    try {
      // إذا كان التاريخ يحتوي على الوقت (ISO format)
      if (appointment.date && appointment.date.includes("T")) {
        // استخدم التاريخ كما هو لأنه يحتوي على الوقت
        const appointmentDate = new Date(appointment.date)

        // إذا كان هناك وقت منفصل، استبدل الوقت في التاريخ
        if (appointment.time) {
          const [hours, minutes] = appointment.time.split(":")
          appointmentDate.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10), 0, 0)
        }

        return appointmentDate
      } else {
        // إذا كان التاريخ والوقت منفصلين
        const dateStr = appointment.date
        const timeStr = appointment.time || "00:00"

        // دمج التاريخ والوقت
        const combinedDateTime = new Date(`${dateStr}T${timeStr}:00`)
        return combinedDateTime
      }
    } catch (error) {
      console.error("Error parsing appointment date/time:", error, appointment)
      return new Date() // fallback to current date
    }
  }

  const getProgramSmartStatus = (program) => {
    const now = new Date()

    // التأكد من وجود مواعيد
    if (!program.appointments || program.appointments.length === 0) {
      return {
        type: "unknown",
        message: t?.profile?.noAppointmentsFound || "No appointments found",
        showPlans: false,
        color: "gray",
        icon: "help",
      }
    }

    const firstAppointment = program.appointments[0]

    // تحليل تاريخ ووقت الموعد الأول
    const firstAppointmentTime = parseAppointmentDateTime(firstAppointment)

    // التحقق من صحة التاريخ
    if (isNaN(firstAppointmentTime.getTime())) {
      return {
        type: "unknown",
        message: t?.profile?.invalidAppointmentDateTime || "Invalid appointment date/time",
        showPlans: false,
        color: "gray",
        icon: "help",
      }
    }

    // الحالة 1: الموعد الأول لم يأتي بعد ولم يكتمل
    if (firstAppointmentTime > now && firstAppointment.status !== "completed") {
      return {
        type: "upcoming",
        message: t?.profile?.programScheduledUpcoming || "Program scheduled - First appointment is upcoming",
        showPlans: false,
        color: "blue",
        icon: "clock",
      }
    }

    // الحالة 2: الموعد الأول فات وقته ولم يكتمل (ملغي)
    if (firstAppointmentTime <= now && firstAppointment.status !== "completed") {
      return {
        type: "cancelled",
        message: t?.profile?.programCancelledMissed || "Program cancelled - First appointment was missed",
        showPlans: false,
        color: "red",
        icon: "x",
      }
    }

    // الحالة 3، 4، 5: الموعد الأول مكتمل
    if (firstAppointment.status === "completed") {
      // الحالة 5: جميع المواعيد مكتملة - ONLY show plans when ALL appointments are completed
      if (program.completedAppointments === program.totalAppointments) {
        return {
          type: "completed",
          message: t?.profile?.programCompletedAllFinished || "Program completed - All appointments finished",
          showPlans: true, // Only show plans when program is fully completed
          color: "green",
          icon: "check",
        }
      } else {
        // الحالة 3 و 4: البرنامج نشط مع بعض المواعيد المكتملة - DON'T show plans yet
        const nextIncompleteAppointment = program.appointments.find((apt) => apt.status !== "completed")

        let message = t?.profile?.programActive || "Program active - "
        if (nextIncompleteAppointment) {
          const nextAppointmentTime = parseAppointmentDateTime(nextIncompleteAppointment)

          if (!isNaN(nextAppointmentTime.getTime())) {
            if (nextAppointmentTime > now) {
              message = t?.profile?.programActiveNextUpcoming || "Program active - Next appointment is upcoming"
            } else {
              message = t?.profile?.programActiveNextReady || "Program active - Next appointment is ready"
            }
          } else {
            message = t?.profile?.programActiveInProgress || "Program active - In progress"
          }
        } else {
          message = t?.profile?.programActiveInProgress || "Program active - In progress"
        }

        return {
          type: "active",
          message: message,
          showPlans: false, // Don't show plans until program is fully completed
          color: "green",
          icon: "play",
        }
      }
    }

    // Default fallback - لا يجب أن نصل هنا
    console.warn("Unexpected program state:", program)
    return {
      type: "unknown",
      message: t?.profile?.programStatusUnknown || "Program status unknown",
      showPlans: false,
      color: "gray",
      icon: "help",
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return t?.profile?.invalidDate || "Invalid Date"
    }
  }

  const formatTime = (timeString) => {
    try {
      if (timeString && timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":")
        const date = new Date()
        date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10), 0, 0)
        return date.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      }
      return timeString || t?.profile?.noTime || "No time"
    } catch (error) {
      return t?.profile?.invalidTime || "Invalid Time"
    }
  }

  const toggleExpanded = (type, id) => {
    const setterMap = {
      program: setExpandedPrograms,
      appointment: setExpandedAppointments,
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

  const getFileUrl = (file) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    let filePath = file.filePath || ""

    if (filePath.startsWith("/")) {
      filePath = filePath.substring(1)
    }

    if (filePath.startsWith("http")) {
      return filePath
    }

    return `${baseUrl}/uploads/school-plan/plan/${filePath}`
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
      alert(t?.profile?.failedToDownload || "Failed to download file. Please try again.")
    }
  }

  const handleViewFile = (file) => {
    const fileUrl = getFileUrl(file)

    setViewingDocument({
      filePath: fileUrl,
      fileName: file.fileName || file.title,
      fileType: t?.profile?.schoolPlan || "School Plan",
      file: file,
    })
  }

  const handleBackToFiles = () => {
    setViewingDocument(null)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className={`${styles.statusIcon} ${styles.completedIcon}`} />
      case "in_progress":
        return <Clock className={`${styles.statusIcon} ${styles.inProgressIcon}`} />
      case "not_started":
        return <AlertCircle className={`${styles.statusIcon} ${styles.notStartedIcon}`} />
      default:
        return <AlertCircle className={`${styles.statusIcon} ${styles.notStartedIcon}`} />
    }
  }

  const getSmartStatusIcon = (smartStatus) => {
    switch (smartStatus.icon) {
      case "check":
        return <CheckCircle className={`${styles.smartStatusIcon} ${styles.completedIcon}`} />
      case "play":
        return <PlayCircle className={`${styles.smartStatusIcon} ${styles.activeIcon}`} />
      case "clock":
        return <Clock className={`${styles.smartStatusIcon} ${styles.upcomingIcon}`} />
      case "x":
        return <XCircle className={`${styles.smartStatusIcon} ${styles.cancelledIcon}`} />
      case "pause":
        return <PauseCircle className={`${styles.smartStatusIcon} ${styles.pausedIcon}`} />
      default:
        return <AlertTriangle className={`${styles.smartStatusIcon} ${styles.unknownIcon}`} />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return t?.profile?.completed || "Completed"
      case "in_progress":
        return t?.profile?.inProgress || "In Progress"
      case "not_started":
        return t?.profile?.notStarted || "Not Started"
      default:
        return t?.profile?.unknown || "Unknown"
    }
  }

  const getAppointmentStatusIcon = (appointment) => {
    const now = new Date()
    const appointmentDateTime = parseAppointmentDateTime(appointment)

    if (appointment.status === "completed") {
      return <CheckCircle className={`${styles.appointmentStatusIcon} ${styles.completedIcon}`} />
    } else if (appointmentDateTime < now) {
      return <XCircle className={`${styles.appointmentStatusIcon} ${styles.missedIcon}`} />
    } else {
      return <Clock className={`${styles.appointmentStatusIcon} ${styles.upcomingIcon}`} />
    }
  }

  const getAppointmentStatusText = (appointment) => {
    const now = new Date()
    const appointmentDateTime = parseAppointmentDateTime(appointment)

    if (appointment.status === "completed") {
      return t?.profile?.completed || "Completed"
    } else if (appointmentDateTime < now) {
      return t?.profile?.missed || "Missed"
    } else {
      return t?.profile?.upcoming || "Upcoming"
    }
  }

  // Calculate program number based on creation order
  const getProgramNumber = (program, allPrograms) => {
    // Sort all programs by creation date (oldest first) to get the correct numbering
    const sortedByCreation = [...allPrograms].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.appointments[0]?.createdAt)
      const dateB = new Date(b.createdAt || b.appointments[0]?.createdAt)
      return dateA - dateB // Oldest first for numbering
    })

    // Find the index of current program in the creation-sorted list
    const programIndex = sortedByCreation.findIndex((p) => p.unicValue === program.unicValue)
    return programIndex + 1 // Program numbers start from 1
  }

  const getPaymentBadge = (appointment) => {
    const { paymentStatus, paymentMethod, paidAmount, totalAmount } = appointment

    // For School Program: One-time payment (full amount upfront)

    if (paymentMethod === "BANK_TRANSFER") {
      if (paymentStatus === "FULLY_PAID") {
        return {
          text: t?.profile?.paidViaBankTransfer || "Paid via Bank Transfer",
          icon: <Building2 size={14} />,
          className: styles.paidBankTransferBadge,
          tooltip: `${t?.profile?.paidViaBankTransferConfirmed || "Paid via bank transfer (Confirmed)"}: ${totalAmount} AED`,
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
      // Payment completed
      if (paymentMethod === "ONLINE") {
        return {
          text: t?.profile?.paidOnline || "Paid Online",
          icon: <CreditCard size={14} />,
          className: styles.paidOnlineBadge,
          tooltip: `${t?.profile?.paidOnlineViaWebsite || "Paid online via website"}: ${totalAmount} AED`,
        }
      } else {
        return {
          text: t?.profile?.paidAtCenter || "Paid at Center",
          icon: <Banknote size={14} />,
          className: styles.paidAtCenterBadge,
          tooltip: `${t?.profile?.paidCashAtCenter || "Paid cash at center"}: ${totalAmount} AED`,
        }
      }
    } else if (paymentStatus === "PENDING") {
      // No payment yet
      if (paymentMethod === "ONLINE") {
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
          tooltip: `${t?.profile?.paymentDueAtCenter || "Payment due when client arrives at center"}: ${totalAmount} AED`,
        }
      }
    }

    return null
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
        <p className={styles.loadingText}>{t?.profile?.loading || "Loading profile..."}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} />
        <p className={styles.errorText}>{error}</p>
        <button onClick={fetchSchoolData} className={styles.retryButton}>
          {t?.profile?.tryAgain || "Try Again"}
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
            {t?.profile?.backToFiles || "Back to Files"}
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

  if (!schoolData.length) {
    return (
      <div className={styles.emptyContainer}>
        <GraduationCap className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>{t?.profile?.noSchools || "No schools found"}</h3>
        <p className={styles.emptyText}>
          {t?.profile?.noSchoolProgramsYet || "You don't have any school programs yet."}
        </p>
      </div>
    )
  }

  return (
    <div className={`${styles.schoolContainer} ${language === "ar" ? "rtl" : "ltr"}`}>
      <div className={styles.programsList}>
        {schoolData.map((program) => {
          const programNumber = getProgramNumber(program, schoolData)

          return (
            <div
              key={program.unicValue}
              className={`${styles.programCard} ${styles[program.smartStatus.type + "Card"]}`}
            >
              <div className={styles.programHeader} onClick={() => toggleExpanded("program", program.unicValue)}>
                <div className={styles.programInfo}>
                  {expandedPrograms.has(program.unicValue) ? (
                    <ChevronDown className={styles.chevron} />
                  ) : (
                    <ChevronRight className={styles.chevron} />
                  )}
                  <GraduationCap className={`${styles.programIcon} ${styles[program.smartStatus.type + "Icon"]}`} />
                  <div className={styles.programDetails}>
                    <h4 className={styles.programTitle}>
                      {t?.profile?.schoolProgram || "School Program"} {programNumber}
                    </h4>

                    <div className={styles.programProgress}>
                      <span className={styles.progressText}>
                        {program.completedAppointments} {t?.profile?.of || "of"} {program.totalAppointments}{" "}
                        {t?.profile?.sessionsCompleted || "sessions completed"}
                      </span>
                      <div className={styles.progressBar}>
                        <div
                          className={`${styles.progressFill} ${styles[program.smartStatus.type + "Progress"]}`}
                          style={{
                            width: `${(program.completedAppointments / program.totalAppointments) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.programStats}>
                  <div className={`${styles.statBadge} ${styles[program.smartStatus.type + "Badge"]}`}>
                    {getSmartStatusIcon(program.smartStatus)}
                    <span className={styles.statLabel}>{program.smartStatus.message}</span>
                  </div>
                  {(() => {
                    // Get payment badge from first appointment (they all have same payment info)
                    const firstAppointment = program.appointments[0]
                    const paymentBadge = firstAppointment ? getPaymentBadge(firstAppointment) : null
                    return paymentBadge ? (
                      <div className={styles.paymentBadgeContainer} title={paymentBadge.tooltip}>
                        <span className={`${styles.paymentBadge} ${paymentBadge.className}`}>
                          {paymentBadge.icon}
                          <span>{paymentBadge.text}</span>
                        </span>
                      </div>
                    ) : null
                  })()}
                  {program.smartStatus.showPlans && (
                    <div className={`${styles.statBadge} ${styles.filesBadge}`}>
                      <span className={styles.statNumber}>{program.totalFiles}</span>
                      <span className={styles.statLabel}>{t?.profile?.files || "files"}</span>
                    </div>
                  )}
                </div>
              </div>

              {expandedPrograms.has(program.unicValue) && (
                <div className={styles.programContent}>
                  {/* Smart Status Message */}
                  <div className={`${styles.smartStatusMessage} ${styles[program.smartStatus.type + "Message"]}`}>
                    {getSmartStatusIcon(program.smartStatus)}
                    <span className={styles.smartStatusText}>{program.smartStatus.message}</span>
                  </div>

                  {/* Appointments Section */}
                  <div className={styles.appointmentsSection}>
                    <div className={styles.sectionHeader}>
                      <Calendar className={styles.sectionIcon} />
                      <h5 className={styles.sectionTitle}>
                        {t?.profile?.appointments || "Appointments"} ({program.totalAppointments})
                      </h5>
                    </div>
                    <div className={styles.appointmentsList}>
                      {program.appointments.map((appointment) => {
                        return (
                          <div key={appointment._id} className={styles.appointmentItem}>
                            <div className={styles.appointmentInfo}>
                              {getAppointmentStatusIcon(appointment)}
                              <div className={styles.appointmentDetails}>
                                <span className={styles.appointmentDate}>
                                  {formatDate(appointment.date)} {t?.profile?.at || "at"} {formatTime(appointment.time)}
                                </span>
                                <span className={styles.appointmentDescription}>{appointment.description}</span>
                              </div>
                            </div>
                            <div className={styles.appointmentStatus}>
                              <span
                                className={`${styles.statusBadge} ${styles[getAppointmentStatusText(appointment).toLowerCase() + "Status"]}`}
                              >
                                {getAppointmentStatusText(appointment)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Files Section - Only show if smartStatus allows */}
                  {program.smartStatus.showPlans && (
                    <div className={styles.filesSection}>
                      <div className={styles.sectionHeader}>
                        <BookOpen className={styles.sectionIcon} />
                        <h5 className={styles.sectionTitle}>
                          {t?.profile?.schoolPlans || "School Plans"} ({program.plans.length})
                        </h5>
                      </div>

                      {program.plans.length > 0 ? (
                        <div className={styles.filesList}>
                          {program.plans.map((plan) => (
                            <div key={plan._id} className={styles.fileItem}>
                              <div className={styles.fileInfo}>
                                <FileText className={styles.fileIcon} />
                                <div className={styles.fileDetails}>
                                  <span className={styles.fileName}>{plan.title || plan.fileName}</span>
                                  <div className={styles.fileMetadata}>
                                    <span className={styles.fileType}>{t?.profile?.schoolPlan || "School Plan"}</span>
                                    <span className={styles.fileDate}>
                                      {t?.profile?.modified || "Modified"}:{" "}
                                      {formatDate(plan.lastModified || plan.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className={styles.fileActions}>
                                <button
                                  className={styles.viewButton}
                                  onClick={() => handleViewFile(plan)}
                                  title={t?.profile?.viewDocument || "View Document"}
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className={styles.downloadButton}
                                  onClick={() => handleFileDownload(plan)}
                                  title={t?.profile?.downloadDocument || "Download Document"}
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.noPlanContainer}>
                          <FileX className={styles.noPlanIcon} />
                          <h4 className={styles.noPlanTitle}>{t?.profile?.noPlansAvailable || "No Plans Available"}</h4>
                          <p className={styles.noPlanText}>
                            {t?.profile?.yourPlanNotCreated || "Your plan didn't created yet"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hidden Plans Message for non-showPlans status */}
                  {!program.smartStatus.showPlans && (
                    <div
                      className={`${styles.hiddenPlansMessage} ${styles[program.smartStatus.type + "HiddenMessage"]}`}
                    >
                      <FileX className={styles.hiddenPlansIcon} />
                      <span className={styles.hiddenPlansText}>
                        {program.smartStatus.type === "upcoming"
                          ? t?.profile?.plansWillBeAvailableAfterCompletion ||
                            "Plans will be available after your program is completed"
                          : program.smartStatus.type === "active"
                            ? t?.profile?.plansWillBeAvailableAfterAllAppointments ||
                              "Plans will be available after all appointments are completed"
                            : t?.profile?.plansNotAvailableForCancelled ||
                              "Plans are not available for cancelled programs"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SchoolTab
