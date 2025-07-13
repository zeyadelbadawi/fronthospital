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
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronLeft,
  Filter,
  Clock,
  CheckSquare,
  XCircle,
} from "lucide-react"

import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import { useContentStore } from "../store/content-store"
import styles from "../styles/speech-upcoming-appointments.module.css"

const AllPatientsSpeech = () => {
  const [assignments, setAssignments] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")
  const [viewModal, setViewModal] = useState({ open: false, patient: null })
  const [completeModal, setCompleteModal] = useState({ open: false, assignment: null })
  const [completionNotes, setCompletionNotes] = useState("")

  const router = useRouter()
  const setActiveContent = useContentStore((state) => state.setActiveContent)

  useEffect(() => {
    fetchSpeechPatients()
  }, [currentPage, search, statusFilter])

  const fetchSpeechPatients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: search,
        status: statusFilter,
      })

      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/speechS/Speech-assignments?${params}`,
      )

      const assignmentsData = Array.isArray(response.data) ? response.data : response.data.assignments || []
      setAssignments(assignmentsData)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching Speech Students:", error)
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
    fetchSpeechPatients()
  }

  const handleBackToWelcome = () => {
    setActiveContent(null)
  }

  const handleViewPatient = (patient) => {
    setViewModal({ open: true, patient })
  }

  const handleCompleteAssignment = async () => {
    if (!completeModal.assignment) return

    try {
      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_URL}/speechS/complete-assignment/${completeModal.assignment._id}`,
        { notes: completionNotes },
      )

      if (response.status === 200) {
        alert("Assignment completed successfully!")
        setCompleteModal({ open: false, assignment: null })
        setCompletionNotes("")
        fetchSpeechPatients()
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

  const handlePlanClick = (patientId) => {
    router.push(`/speechS/plan/${patientId}`)
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

  const itemsPerPage = 10
  const startIndex = (currentPage - 1) * itemsPerPage

  return (
    <div className={styles.upcomingContainer}>
      <div className={styles.upcomingCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <button onClick={handleBackToWelcome} className={styles.backButton}>
                <ChevronLeft className={styles.backIcon} />
                Back to All Single Sessions Appointments
              </button>
              <h2 className={styles.pageTitle}>Speech Therapy Students</h2>
              <p className={styles.pageSubtitle}>Manage and view all students assigned to Speech Therapy</p>
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
                  fetchSpeechPatients()
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
              <p className={styles.loadingText}>Loading Speech Therapy Students...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className={styles.noData}>
              <div className={styles.emptyState}>
                <Brain className={styles.emptyIcon} />
                <h3>No Speech Therapy Students Found</h3>
                <p>
                  {search || statusFilter
                    ? "No students match your search criteria. Try adjusting your filters."
                    : "No students are currently assigned to the Speech Therapy department."}
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
                    <th>
                      <div className={styles.headerCell}>
                        <Mail className={styles.headerIcon} />
                        Email
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Phone className={styles.headerIcon} />
                        Phone
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Calendar className={styles.headerIcon} />
                        Assigned Date
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Filter className={styles.headerIcon} />
                        Status
                      </div>
                    </th>
                    <th className={styles.textCenter}>View Plan</th>
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
                      <td className={styles.dateCell}>
                        <div className={styles.dateInfo}>
                          <span className={styles.dateValue}>{getPatientProperty(assignment, "email")}</span>
                        </div>
                      </td>
                      <td className={styles.timeCell}>
                        <span className={styles.timeValue}>{getPatientProperty(assignment, "phone")}</span>
                      </td>
                      <td className={styles.descriptionCell}>
                        <div className={styles.descriptionText}>{formatDate(assignment.assignedDate)}</div>
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
                            onClick={() => handlePlanClick(assignment.patient?._id)}
                            className={`${styles.actionButton} ${styles.editButton}`}
                            title="Student Plan"
                            disabled={!assignment.patient?._id}
                          >
                            <ClipboardList className={styles.actionIcon} />
                          </button>
                          {assignment.status === "active" && (
                            <button
                              onClick={() => setCompleteModal({ open: true, assignment })}
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

      {/* View Patient Modal */}
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
                    <div className={styles.detailItem}>
                      <Mail className={styles.detailIcon} />
                      <span>Email: {viewModal.patient.email || "N/A"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Phone className={styles.detailIcon} />
                      <span>Phone: {viewModal.patient.phone || "N/A"}</span>
                    </div>
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
                      <FileText className={styles.detailIcon} />
                      <span>Disability Type: {viewModal.patient.disabilityType || "N/A"}</span>
                    </div>
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

      {/* Complete Assignment Modal */}
      {completeModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Complete Speech Therapy Assignment</h3>
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
                  Are you sure you want to mark the Speech Therapy assignment for{" "}
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
    </div>
  )
}

export default AllPatientsSpeech
