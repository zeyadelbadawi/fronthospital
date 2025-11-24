"use client"

import { useState, useEffect } from "react"
import {
  Search,
  ClipboardList,
  Users,
  Brain,
  Calendar,
  Phone,
  Mail,
  User,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Filter,
  Clock,
  CheckSquare,
  XCircle,
  Loader2,
  Upload,
} from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import { useContentStore } from "../store/content-store"
import { sendNotification } from "@/helper/notification-helper"
import UnifiedPlanEditor from "./unified-plan-editor"
import styles from "../styles/speech-upcoming-appointments.module.css"
import { getCurrentUserId, isDoctor } from "../utils/auth-utils"

// Configuration for different therapy types
const THERAPY_CONFIGS = {
  aba: {
    title: "ABA Therapy Students",
    subtitle: "Manage and view all students assigned to ABA",
    apiEndpoint: "/abaS/ABA-assignments",
    completeEndpoint: "/abaS/complete-assignment",
    modalTitle: "ABA Assignment",
    loadingText: "Loading ABA Students...",
    emptyTitle: "No ABA Students Found",
    emptyDescription: "No students are currently assigned to the ABA department.",
  },
  speech: {
    title: "Speech Therapy Students",
    subtitle: "Manage and view all students assigned to Speech Therapy",
    apiEndpoint: "/speechS/Speech-assignments",
    completeEndpoint: "/speechS/complete-assignment",
    modalTitle: "Speech Therapy Assignment",
    loadingText: "Loading Speech Therapy Students...",
    emptyTitle: "No Speech Therapy Students Found",
    emptyDescription: "No students are currently assigned to the Speech Therapy department.",
  },
  "physical-therapy": {
    title: "Physical Therapy Students",
    subtitle: "Manage and view all students assigned to Physical Therapy",
    apiEndpoint: "/physicalTherapyS/physical-therapy-assignments",
    completeEndpoint: "/physicalTherapyS/complete-assignment",
    modalTitle: "Physical Therapy Assignment",
    loadingText: "Loading Physical Therapy Students...",
    emptyTitle: "No Physical Therapy Students Found",
    emptyDescription: "No students are currently assigned to the Physical Therapy department.",
  },
  psychotherapy: {
    title: "Psychotherapy Students",
    subtitle: "Manage and view all students assigned to Psychotherapy",
    apiEndpoint: "/PsychotherapyS/Psychotherapy-assignments",
    completeEndpoint: "/PsychotherapyS/complete-assignment",
    modalTitle: "Psychotherapy Assignment",
    loadingText: "Loading Psychotherapy Students...",
    emptyTitle: "No Psychotherapy Students Found",
    emptyDescription: "No students are currently assigned to the Psychotherapy department.",
  },

  "occupational-therapy": {
    title: "Occupational Therapy Students",
    subtitle: "Manage and view all students assigned to Occupational Therapy",
    apiEndpoint: "/OccupationalTherapyS/Occupational-therapy-assignments",
    completeEndpoint: "/OccupationalTherapyS/complete-assignment",
    modalTitle: "Occupational Therapy Assignment",
    loadingText: "Loading Occupational Therapy Students...",
    emptyTitle: "No Occupational Therapy Students Found",
    emptyDescription: "No students are currently assigned to the Occupational Therapy department.",
  },
  "special-education": {
    title: "Special Education Students",
    subtitle: "Manage and view all students assigned to Special Education",
    apiEndpoint: "/SpecialEducationS/Special-Education-assignments",
    completeEndpoint: "/SpecialEducationS/complete-assignment",
    modalTitle: "Special Education Assignment",
    loadingText: "Loading Special Education Students...",
    emptyTitle: "No Special Education Students Found",
    emptyDescription: "No students are currently assigned to the Special Education department.",
  },
}

const getDepartmentNameForAssignment = (therapyType) => {
  console.log("[ziad] getDepartmentNameForAssignment input therapyType:", therapyType)
  const mapping = {
    aba: "ABA",
    speech: "Speech",
    "physical-therapy": "PhysicalTherapy",
    psychotherapy: "Psychotherapy",
    "occupational-therapy": "OccupationalTherapy",
    "special-education": "SpecialEducation",
  }
  const result = mapping[therapyType] || therapyType
  console.log("[ziad] getDepartmentNameForAssignment result:", result)
  return result
}

const UnifiedPatientsManagement = ({ therapyType }) => {
  const [assignments, setAssignments] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")
  const [viewModal, setViewModal] = useState({ open: false, patient: null })
  const [completeModal, setCompleteModal] = useState({ open: false, assignment: null })
  const [completionNotes, setCompletionNotes] = useState("")
  const [showPlanEditor, setShowPlanEditor] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [adminHeadDoctorIds, setAdminHeadDoctorIds] = useState([])
  const [doctorAssignments, setDoctorAssignments] = useState([])
  const [errorModal, setErrorModal] = useState({ open: false, message: "" })
  const [isDoctorRole, setIsDoctorRole] = useState(false)
  const [uploadModal, setUploadModal] = useState({ open: false, patientId: null, patientName: "" })
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const setActiveContent = useContentStore((state) => state.setActiveContent)

  // Get configuration for current therapy type
  const config = THERAPY_CONFIGS[therapyType]

  useEffect(() => {
    setIsDoctorRole(isDoctor())
  }, [])

  useEffect(() => {
    getAdminHeadDoctorIds()
    if (isDoctor()) {
      fetchDoctorAssignments()
    } else {
      fetchPatients()
    }
  }, [therapyType, currentPage, search, statusFilter])

  useEffect(() => {
    if (isDoctor() && doctorAssignments.length >= 0) {
      fetchPatients()
    }
  }, [doctorAssignments])

  const fetchDoctorAssignments = async () => {
    try {
      const doctorId = getCurrentUserId()
      if (!doctorId) return

      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/single-session-appointment-assignment/doctor/${doctorId}`,
      )

      const currentDepartment = getDepartmentNameForAssignment(therapyType)
      console.log("[v0] Therapy Type:", therapyType)
      console.log("[v0] Mapped Department Name:", currentDepartment)
      console.log("[v0] All Doctor Assignments:", response.data.assignments)

      const filteredByDepartment = (response.data.assignments || []).filter((assignment) => {
        console.log("[v0] Checking assignment department:", assignment.department, "against", currentDepartment)
        // Case-insensitive comparison to handle inconsistent database casing
        return assignment.department?.toLowerCase() === currentDepartment.toLowerCase()
      })

      console.log("[v0] Filtered Assignments for this department:", filteredByDepartment)
      setDoctorAssignments(filteredByDepartment)
    } catch (error) {
      console.error("Error fetching doctor assignments:", error)
      setDoctorAssignments([])
    }
  }

  const getAdminHeadDoctorIds = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/notification/admin-headdoctor-ids`)
      const allIds = [...(response.data.adminIds || []), ...(response.data.headDoctorIds || [])]
      console.log("[v0] Admin and Head Doctor IDs fetched:", allIds)
      setAdminHeadDoctorIds(allIds)
    } catch (error) {
      console.error("Error fetching admin and head doctor IDs:", error)
    }
  }

  const fetchPatients = async () => {
    console.log("[ziad] fetchPatients called with therapyType:", therapyType)
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: search,
        status: statusFilter,
      })

      console.log("[ziad] API endpoint:", `${process.env.NEXT_PUBLIC_API_URL}${config.apiEndpoint}`)
      console.log("[ziad] Query params:", params.toString())

      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}${config.apiEndpoint}?${params}`)

      console.log("[ziad] Raw response data:", response.data)

      const assignmentsData = Array.isArray(response.data) ? response.data : response.data.assignments || []

      console.log("[ziad] Total assignments received:", assignmentsData.length)
      console.log("[ziad] First few assignments:", assignmentsData.slice(0, 3))

      const paidAssignments = assignmentsData.filter((assignment) => {
        if (!assignment.programId) return false
        return assignment.programId.paymentStatus === "FULLY_PAID"
      })

      console.log("[ziad] Paid assignments count:", paidAssignments.length)
      console.log(
        "[ziad] Paid assignments details:",
        paidAssignments.map((a) => ({
          id: a._id,
          studentName: a.studentId?.firstName,
          department: a.department,
          programId: a.programId?._id,
        })),
      )

      let filteredAssignments = paidAssignments
      if (isDoctor() && doctorAssignments.length > 0) {
        console.log("[ziad] Is Doctor: true")
        console.log("[ziad] Doctor Assignments Count:", doctorAssignments.length)

        const doctorAppointmentIds = doctorAssignments.map((da) => {
          // appointmentId can be a populated object with _id, or just a string ID
          return da.appointmentId?._id || da.appointmentId
        })
        console.log("[ziad] Doctor Appointment IDs:", doctorAppointmentIds)

        filteredAssignments = paidAssignments.filter((assignment) => {
          const appointmentId = assignment.programId?._id || assignment.programId
          console.log("[ziad] Checking appointment:", appointmentId, "in", doctorAppointmentIds)
          return doctorAppointmentIds.includes(appointmentId)
        })
        console.log("[ziad] Filtered Assignments after doctor filter:", filteredAssignments.length)
      } else {
        console.log("[ziad] Is Doctor:", isDoctor(), "| Doctor Assignments Length:", doctorAssignments.length)
      }

      console.log("[ziad] Final filtered assignments count:", filteredAssignments.length)
      console.log(
        "[ziad] Final filtered assignments:",
        filteredAssignments.map((a) => ({
          id: a._id,
          studentName: a.studentId?.firstName,
          department: a.department,
          status: a.status,
        })),
      )

      setAssignments(filteredAssignments)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("[ziad] Error fetching patients:", error)
      console.error("[ziad] Error details:", error.response?.data)
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPatients()
  }

  const handleBackToWelcome = () => {
    setActiveContent(null)
  }

  const handleViewPatient = (patient) => {
    setViewModal({ open: true, patient })
  }

  const sendNotificationToAdminsAndHeadDoctors = async (doctorName, departmentName, patientName) => {
    try {
      if (adminHeadDoctorIds.length === 0) {
        return
      }

      const title = `Plan Completed - ${departmentName}`
      const titleAr = `تم إكمال الخطة - ${departmentName}`
      const message = `Doctor ${doctorName} has completed the ${departmentName} plan in Single Session for Student ${patientName}.`
      const messageAr = `الدكتور ${doctorName} أكمل خطة ${departmentName} في الجلسة الواحدة للطالب ${patientName}.`

      await sendNotification({
        isList: true,
        receiverIds: adminHeadDoctorIds,
        rule: "Admin",
        title,
        titleAr,
        message,
        messageAr,
        type: "successfully",
      })

      console.log("[v0] Notification sent to admins and head doctors successfully")
    } catch (error) {
      console.error("[v0] Error sending notifications to admins and head doctors:", error)
    }
  }

  const checkPatientPlan = async (patientId) => {
    try {
      const departmentEndpoint = {
        aba: "/abaS",
        speech: "/speechS",
        "physical-therapy": "/physicalTherapyS",
        psychotherapy: "/PsychotherapyS",
        "occupational-therapy": "/OccupationalTherapyS",
        "special-education": "/SpecialEducationS",
      }

      const endpoint = departmentEndpoint[therapyType]
      if (!endpoint) {
        return { hasPlan: false, error: "Invalid therapy type" }
      }

      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}/plan-details/${patientId}`,
      )

      // Check if plan exists and has a file
      if (response.status === 200 && response.data && response.data.filePath) {
        return { hasPlan: true }
      }

      return { hasPlan: false }
    } catch (error) {
      // If 404 or any error, it means no plan exists
      if (error.response?.status === 404) {
        return { hasPlan: false }
      }
      console.error("Error checking patient plan:", error)
      return { hasPlan: false, error: error.message }
    }
  }

  const handleCompleteClick = async (assignment) => {
    const patientId = assignment.patient?._id

    if (!patientId) {
      setErrorModal({
        open: true,
        message: "Student information is missing. Cannot complete assignment.",
      })
      return
    }

    // Check if patient has a plan
    const planCheck = await checkPatientPlan(patientId)

    if (!planCheck.hasPlan) {
      setErrorModal({
        open: true,
        message:
          "This Student does not have a plan yet. Please create or update the plan before marking the appointment as complete. Once completed, you will not be able to update the plan again.",
      })
      return
    }

    // If plan exists, open the complete modal
    setCompleteModal({ open: true, assignment })
  }

  const handleCompleteAssignment = async () => {
    if (!completeModal.assignment) return

    try {
      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_URL}${config.completeEndpoint}/${completeModal.assignment._id}`,
        { notes: completionNotes },
      )

      if (response.status === 200) {
        const patientId = completeModal.assignment.patient?._id
        const patientName = completeModal.assignment.patient?.name || "Student"
        const departmentName = config.title.replace(" Students", "")
        const doctorName =
          completeModal.assignment.doctor?.name || completeModal.assignment.doctor?.username || "Doctor"

        if (patientId) {
          await sendNotification({
            isList: false,
            receiverId: patientId,
            title: `${departmentName} Plan Completed`,
            titleAr: `اكتملت خطة ${departmentName}`,
            message: `Your ${departmentName} plan in Single Session is now complete! You can view it in your profile page.`,
            messageAr: `خطتك في ${departmentName} في الجلسة الواحدة مكتملة الآن! يمكنك عرضها في صفحة ملفك الشخصي.`,
            rule: "Patient",
            type: "successfully",
          })
          console.log("[v0] Notification sent to Student successfully")
        }

        await sendNotificationToAdminsAndHeadDoctors(doctorName, departmentName, patientName)

        alert("Assignment completed successfully!")
        setCompleteModal({ open: false, assignment: null })
        setCompletionNotes("")
        fetchPatients()
      }
    } catch (error) {
      console.error("Error completing assignment:", error)
      alert("Error completing assignment")
    }
  }

  const getPatientProperty = (assignment, property) => {
    if (!assignment || !assignment.patient) return "N/A"
    return assignment.patient[property] || "N/A"
  }

  const handlePlanClick = async (patientId) => {
    // For Psychotherapy, check if patient has a plan first
    if (therapyType === "psychotherapy") {
      const planCheck = await checkPatientPlan(patientId)

      if (!planCheck.hasPlan) {
        // Show upload modal instead of plan editor
        const patient = assignments.find((p) => p.patient?._id === patientId)
        setUploadModal({
          open: true,
          patientId,
          patientName: patient?.patient?.name || "Student",
        })
        return
      }
    }

    // For other departments or if plan exists, open editor normally
    setSelectedPatientId(patientId)
    setShowPlanEditor(true)
  }

  const handleBackFromPlanEditor = () => {
    setShowPlanEditor(false)
    setSelectedPatientId(null)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "active"
      case "completed":
        return "completed"
      case "suspended":
        return "pending"
      case "cancelled":
        return "assessment"
      default:
        return "pending"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Clock className={styles.statusIcon} />
      case "completed":
        return <CheckCircle className={styles.statusIcon} />
      case "suspended":
        return <AlertCircle className={styles.statusIcon} />
      case "cancelled":
        return <XCircle className={styles.statusIcon} />
      default:
        return <AlertCircle className={styles.statusIcon} />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleUploadPlan = async () => {
    if (!uploadFile || !uploadModal.patientId) {
      alert("Please select a file to upload")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("document", uploadFile)
      formData.append("patientId", uploadModal.patientId)

      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/PsychotherapyS/upload-plan/${uploadModal.patientId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )

      if (response.status === 200) {
        alert("Plan uploaded successfully!")
        setUploadModal({ open: false, patientId: null, patientName: "" })
        setUploadFile(null)

        // Now open the plan editor with the uploaded plan
        setSelectedPatientId(uploadModal.patientId)
        setShowPlanEditor(true)
      }
    } catch (error) {
      console.error("Error uploading plan:", error)
      alert("Error uploading plan. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ]
      if (!validTypes.includes(file.type)) {
        alert("Please upload a Word document (.docx or .doc)")
        return
      }
      setUploadFile(file)
    }
  }

  if (showPlanEditor && selectedPatientId) {
    return (
      <UnifiedPlanEditor patientId={selectedPatientId} therapyType={therapyType} onBack={handleBackFromPlanEditor} />
    )
  }

  const itemsPerPage = 10
  const startIndex = (currentPage - 1) * itemsPerPage

  return (
    <div className={styles.upcomingContainer}>
      {config ? (
        <div className={styles.upcomingCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerLeft}>
                <button onClick={handleBackToWelcome} className={styles.backButton}>
                  <ChevronLeft className={styles.backIcon} />
                  Back to All Single Sessions Appointments
                </button>
                <h2 className={styles.pageTitle}>{config.title}</h2>
                <p className={styles.pageSubtitle}>{config.subtitle}</p>
              </div>
              <div className={styles.headerActions}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                  <div className={styles.searchInputContainer}>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by student name..."
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
                  <label className={styles.filterLabel}>Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="suspended">Suspended</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setStatusFilter("")
                    setSearch("")
                    setCurrentPage(1)
                    fetchPatients()
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
                    <span className={styles.statNumber}>{assignments.length}</span>
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
                <p className={styles.loadingText}>{config.loadingText}</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className={styles.noData}>
                <div className={styles.emptyState}>
                  <Brain className={styles.emptyIcon} />
                  <h3>{config.emptyTitle}</h3>
                  <p>
                    {search || statusFilter
                      ? "No students match your search criteria. Try adjusting your filters."
                      : config.emptyDescription}
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
                          Student Name
                        </div>
                      </th>
                      {!isDoctorRole && (
                        <th>
                          <div className={styles.headerCell}>
                            <Mail className={styles.headerIcon} />
                            Email
                          </div>
                        </th>
                      )}
                      {!isDoctorRole && (
                        <th>
                          <div className={styles.headerCell}>
                            <Phone className={styles.headerIcon} />
                            Phone
                          </div>
                        </th>
                      )}
                      <th>
                        <div className={styles.headerCell}>
                          <Calendar className={styles.headerIcon} />
                          Assigned Date
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <Filter className={styles.headerIcon} />
                          Plan Status
                        </div>
                      </th>
                      <th className={styles.textCenter}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment, index) => (
                      <tr key={assignment._id || index} className={styles.tableRow}>
                        <td className={styles.indexCell}>{startIndex + index + 1}</td>
                        <td className={styles.patientCell}>
                          <div className={styles.patientInfo}>
                            <span className={styles.patientName}>{getPatientProperty(assignment, "name")}</span>
                          </div>
                        </td>
                        {!isDoctorRole && (
                          <td className={styles.dateCell}>
                            <div className={styles.dateInfo}>
                              <span className={styles.dateValue}>{getPatientProperty(assignment, "email")}</span>
                            </div>
                          </td>
                        )}
                        {!isDoctorRole && (
                          <td className={styles.timeCell}>
                            <span className={styles.timeValue}>{getPatientProperty(assignment, "phone")}</span>
                          </td>
                        )}
                        <td className={styles.descriptionCell}>
                          <div className={styles.descriptionText}>
                            {formatDate(assignment.programId?.date || assignment.assignedDate)}
                          </div>
                        </td>
                        <td className={styles.typeCell}>
                          <span className={`${styles.typeBadge} ${getStatusBadgeClass(assignment.status)}`}>
                            {getStatusIcon(assignment.status)}
                            {assignment.status || "Unknown"}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleViewPatient(assignment.patient)}
                              className={`${styles.actionButton} ${styles.viewButton}`}
                              title="View Student Details"
                              disabled={!assignment.patient}
                            >
                              <User className={styles.actionIcon} />
                            </button>
                            {assignment.status !== "completed" && (
                              <button
                                onClick={() => handlePlanClick(assignment.patient?._id)}
                                className={`${styles.actionButton} ${styles.editButton}`}
                                title="Student Plan"
                                disabled={!assignment.patient?._id}
                              >
                                <ClipboardList className={styles.actionIcon} />
                              </button>
                            )}
                            {assignment.status === "active" && (
                              <button
                                onClick={() => handleCompleteClick(assignment)}
                                className={`${styles.actionButton} ${styles.completeButton}`}
                                title="Mark as Completed"
                              >
                                <CheckSquare className={styles.actionIcon} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {assignments.length > 0 && (
              <div className={styles.paginationContainer}>
                <span className={styles.paginationInfo}>
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, assignments.length)} of{" "}
                  {assignments.length} students
                </span>
                <div className={styles.paginationButtons}>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
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
      ) : (
        <div>Invalid therapy type configuration</div>
      )}

      {viewModal.open && viewModal.patient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Student Details</h3>
              <button onClick={() => setViewModal({ open: false, patient: null })} className={styles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.patientDetails}>
                <div className={styles.detailSection}>
                  <h4>Personal Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <User className={styles.detailIcon} />
                      <span>Name: {viewModal.patient.name || "N/A"}</span>
                    </div>
                    {!isDoctorRole && (
                      <div className={styles.detailItem}>
                        <Mail className={styles.detailIcon} />
                        <span>Email: {viewModal.patient.email || "N/A"}</span>
                      </div>
                    )}
                    {!isDoctorRole && (
                      <div className={styles.detailItem}>
                        <Phone className={styles.detailIcon} />
                        <span>Phone: {viewModal.patient.phone || "N/A"}</span>
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <Calendar className={styles.detailIcon} />
                      <span>Age: {viewModal.patient.age || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Medical Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <ClipboardList className={styles.detailIcon} />
                      <span>Medical History: {viewModal.patient.medicalHistory || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Actions</h4>
                  <div className={styles.modalActions}>
                    <button
                      onClick={() => handlePlanClick(viewModal.patient._id)}
                      className={styles.planActionButton}
                      disabled={!viewModal.patient._id}
                    >
                      <ClipboardList size={16} />
                      View Treatment Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {completeModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Complete {config.modalTitle}</h3>
              <button
                onClick={() => setCompleteModal({ open: false, assignment: null })}
                className={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.confirmationMessage}>
                <CheckCircle className={styles.confirmIcon} />
                <p>
                  Are you sure you want to mark the {config.modalTitle.toLowerCase()} for{" "}
                  <strong>{getPatientProperty(completeModal.assignment, "name")}</strong> as completed?
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Completion Notes:</label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add any notes about the completed assignment..."
                  className={styles.formTextarea}
                  rows={4}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setCompleteModal({ open: false, assignment: null })}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button onClick={handleCompleteAssignment} className={styles.completeActionButton}>
                  <CheckCircle size={16} />
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Cannot Complete Appointment</h3>
              <button onClick={() => setErrorModal({ open: false, message: "" })} className={styles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.confirmationMessage}>
                <AlertCircle className={styles.confirmIcon} style={{ color: "#ef4444" }} />
                <p>{errorModal.message}</p>
              </div>

              <div className={styles.modalActions}>
                <button onClick={() => setErrorModal({ open: false, message: "" })} className={styles.cancelButton}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Upload Psychotherapy Plan</h3>
              <button
                onClick={() => {
                  setUploadModal({ open: false, patientId: null, patientName: "" })
                  setUploadFile(null)
                }}
                className={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.uploadInfo}>
                <p>
                  Upload a plan document for <strong>{uploadModal.patientName}</strong>
                </p>
                <p className={styles.uploadNote}>
                  Psychotherapy department requires manual plan uploads. Please upload the plan document (.docx or .doc)
                  to continue.
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Select Plan Document:</label>
                <input
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                {uploadFile && <p className={styles.selectedFile}>Selected: {uploadFile.name}</p>}
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => {
                    setUploadModal({ open: false, patientId: null, patientName: "" })
                    setUploadFile(null)
                  }}
                  className={styles.cancelButton}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadPlan}
                  className={styles.completeActionButton}
                  disabled={!uploadFile || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className={styles.spinning} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UnifiedPatientsManagement
