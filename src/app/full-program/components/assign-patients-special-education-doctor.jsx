"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Search, AlertCircle, Users, UserCheck, RefreshCw, Phone, Mail, User, Calendar, Eye, ClipboardList, FileText } from 'lucide-react'
import axiosInstance from "@/helper/axiosSetup"
import { getCurrentUserId } from "../utils/auth-utils"
import styles from "../styles/speech-upcoming-appointments.module.css"

const AssignPatientsSpecialEducationDoctor = () => {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
  })
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const doctorId = getCurrentUserId()
  const router = useRouter()

  useEffect(() => {
    fetchDoctorStudents()
  }, [currentPage, searchTerm])

  const fetchDoctorStudents = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("Fetching students for doctor:", doctorId)

      // Try the new endpoint first
      let response
      try {
        response = await axiosInstance.get(`/doctor-student-assignment/doctor-students/${doctorId}/SpecialEducation`, {
          params: { page: currentPage, search: searchTerm, limit: 10 },
        })
      } catch (error) {
        if (error.response?.status === 404) {
          // Fallback to alternative endpoint
          console.log("Primary endpoint not found, trying alternative...")
          response = await axiosInstance.get(`/doctor-student-assignment/doctor-assignments/${doctorId}`, {
            params: {
              department: "SpecialEducation",
              page: currentPage,
              search: searchTerm,
              limit: 10,
            },
          })
        } else {
          throw error
        }
      }

      console.log("Doctor students response:", response.data)

      const assignmentsData = response.data.assignments || []
      setAssignments(assignmentsData)
      setTotalPages(response.data.totalPages || 1)

      // Calculate stats
      const total = assignmentsData.length
      const active = assignmentsData.filter(
        (a) => !isSubscriptionExpired(a.subscriptionEndDate) && a.status === "active",
      ).length
      const expired = assignmentsData.filter((a) => isSubscriptionExpired(a.subscriptionEndDate)).length

      setStats({ total, active, expired })
    } catch (error) {
      console.error("Error fetching doctor students:", error)
      setError(`Failed to load students: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const isSubscriptionExpired = (endDate) => {
    if (!endDate) return false
    return new Date(endDate) < new Date()
  }

  const handleViewDetails = (assignment) => {
    setSelectedAssignment(assignment)
    setShowDetailsModal(true)
  }

  const handlePlanClick = (patientId) => {
    if (!patientId) {
      console.error("Patient ID is missing")
      return
    }
    router.push(`/ABA/plan/${patientId}`)
  }

  const handleExamClick = (patientId) => {
    if (!patientId) {
      console.error("Patient ID is missing")
      return
    }
    router.push(`/ABA/exam/${patientId}`)
  }

  const closeModal = () => {
    setShowDetailsModal(false)
    setSelectedAssignment(null)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading && assignments.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading your Special Education students...</p>
      </div>
    )
  }

  return (
    <div className={styles.upcomingContainer}>
      {/* Main Unified Card - Header, Stats, Search, and Students Table */}
      <div className={styles.upcomingCard}>
        {/* Header with Stats */}
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>
                <Users className={styles.titleIcon} />
                My Special Education Students
              </h1>
              <p className={styles.pageSubtitle}>Manage and view your assigned Special Education students</p>
            </div>
            <div className={styles.headerActions}>
              <button
                onClick={fetchDoctorStudents}
                disabled={loading}
                className={`${styles.actionButton} ${styles.viewButton}`}
              >
                <RefreshCw className={`${styles.actionIcon} ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.total}</div>
              <div className={styles.statLabel}>Total Students</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.active}</div>
              <div className={styles.statLabel}>Active</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.expired}</div>
              <div className={styles.statLabel}>Expired</div>
            </div>
          </div>

          {/* Search integrated in header */}
          <div className={styles.filtersContainer} style={{ marginTop: "2rem" }}>
            <div className={styles.searchForm}>
              <div className={styles.searchInputContainer}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search students by name, email, or phone..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className={styles.searchInput}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles.cardBody}>
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                borderRadius: "0.75rem",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              <AlertCircle style={{ marginRight: "0.75rem", flexShrink: 0 }} size={20} />
              <span style={{ fontWeight: "500" }}>{error}</span>
            </div>
          </div>
        )}

        {/* Students Table Section - Integrated in the same card */}
        <div className={styles.cardBody}>
          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#1f2937",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <UserCheck size={24} style={{ color: "#3b82f6" }} />
              Assigned Students
            </h2>
            <div
              style={{
                height: "2px",
                background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                borderRadius: "1px",
                marginBottom: "1.5rem",
              }}
            ></div>
          </div>

          {assignments.length === 0 ? (
            <div className={styles.emptyState}>
              <Users className={styles.emptyIcon} />
              <h3>No students assigned</h3>
              <p>
                {searchTerm
                  ? "No students match your search criteria. Try adjusting your search terms."
                  : "You don't have any Special Education students assigned to you yet."}
              </p>
            </div>
          ) : (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.appointmentsTable}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th>
                        <div className={styles.headerCell}>
                          <span>#</span>
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <User className={styles.headerIcon} />
                          Student Information
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <Calendar className={styles.headerIcon} />
                          Assignment Date
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <Calendar className={styles.headerIcon} />
                          Subscription End
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>Status</div>
                      </th>
                      <th className={styles.textCenter}>
                        <div className={styles.headerCell}>Actions</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment, index) => {
                      const patient = assignment.patient || assignment.patientId
                      const isExpired = isSubscriptionExpired(assignment.subscriptionEndDate)
                      const rowIndex = (currentPage - 1) * 10 + index + 1

                      return (
                        <tr key={assignment._id} className={styles.tableRow}>
                          <td className={styles.indexCell}>{rowIndex}</td>
                          <td className={styles.patientCell}>
                            <div className={styles.patientInfo}>
                              <div className={styles.patientName}>{patient?.name || "Unknown Patient"}</div>
                              <div className={styles.patientId}>
                                {patient?.email && (
                                  <div style={{ display: "flex", alignItems: "center", marginBottom: "0.25rem" }}>
                                    <Mail size={12} style={{ marginRight: "0.25rem" }} />
                                    {patient.email}
                                  </div>
                                )}
                                {patient?.phone && (
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <Phone size={12} style={{ marginRight: "0.25rem" }} />
                                    {patient.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={styles.dateCell}>
                            <div className={styles.dateInfo}>
                              <div className={styles.dateValue}>
                                {new Date(assignment.assignedDate).toLocaleDateString()}
                              </div>
                              <div className={styles.dateYear}>
                                {new Date(assignment.assignedDate).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                          </td>
                          <td className={styles.dateCell}>
                            {assignment.subscriptionEndDate ? (
                              <div className={styles.dateInfo}>
                                <div className={`${styles.dateValue} ${isExpired ? "text-red-600" : ""}`}>
                                  {new Date(assignment.subscriptionEndDate).toLocaleDateString()}
                                </div>
                                <div className={styles.dateYear}>
                                  {new Date(assignment.subscriptionEndDate).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                  })}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: "#9ca3af", fontStyle: "italic" }}>No end date</span>
                            )}
                          </td>
                          <td className={styles.typeCell}>
                            <span
                              className={`${styles.typeBadge} ${
                                isExpired
                                  ? styles.assessment
                                  : assignment.status === "active"
                                    ? styles.therapy
                                    : styles.evaluation
                              }`}
                            >
                              {isExpired ? "Expired" : assignment.status || "Active"}
                            </span>
                          </td>
                          <td className={styles.actionsCell}>
                            <div className={styles.actionButtons}>
                              {/* View Details Button */}
                              <button
                                onClick={() => handleViewDetails(assignment)}
                                className={`${styles.actionButton} ${styles.viewButton}`}
                                title="View Details"
                              >
                                <Eye className={styles.actionIcon} />
                              </button>

                              {/* Plan Button */}
                              <button
                                onClick={() => handlePlanClick(assignment.patient?._id)}
                                className={`${styles.actionButton} ${styles.editButton}`}
                                title="Student Plan"
                                disabled={!assignment.patient?._id}
                              >
                                <ClipboardList className={styles.actionIcon} />
                              </button>

                              {/* Exam Button */}
                              <button
                                onClick={() => handleExamClick(assignment.patient?._id)}
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                title="Student Exam"
                                disabled={!assignment.patient?._id}
                              >
                                <FileText className={styles.actionIcon} />
                              </button>
                            </div>
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
                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, stats.total)} of {stats.total}{" "}
                    students
                  </div>
                  <div className={styles.paginationButtons}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={styles.paginationButton}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`${styles.paginationButton} ${page === currentPage ? styles.active : ""}`}
                      >
                        {page}
                      </button>
                    ))}
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

      {/* Details Modal */}
      {showDetailsModal && selectedAssignment && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Student Details</h2>
              <button onClick={closeModal} className={styles.closeButton}>
                <span className={styles.closeIcon}>×</span>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Student Name</div>
                  <div className={styles.detailValue}>
                    {selectedAssignment.patient?.name || selectedAssignment.patientId?.name || "Unknown"}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Email</div>
                  <div className={styles.detailValue}>
                    {selectedAssignment.patient?.email || selectedAssignment.patientId?.email || "Not provided"}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Phone</div>
                  <div className={styles.detailValue}>
                    {selectedAssignment.patient?.phone || selectedAssignment.patientId?.phone || "Not provided"}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Patient ID</div>
                  <div className={styles.detailValue}>
                    {selectedAssignment.patient?.patientId || selectedAssignment.patientId?.patientId || "Not assigned"}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Disability Type</div>
                  <div className={styles.detailValue}>
                    {selectedAssignment.patient?.disabilityType ||
                      selectedAssignment.patientId?.disabilityType ||
                      "Not specified"}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Department</div>
                  <div className={styles.detailValue}>{selectedAssignment.department || "SpecialEducation"}</div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Assignment Date</div>
                  <div className={styles.detailValue}>
                    {new Date(selectedAssignment.assignedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Subscription End Date</div>
                  <div className={styles.detailValue}>
                    {selectedAssignment.subscriptionEndDate
                      ? new Date(selectedAssignment.subscriptionEndDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "No end date set"}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Status</div>
                  <div className={styles.detailValue}>
                    <span
                      className={`${styles.typeBadge} ${
                        isSubscriptionExpired(selectedAssignment.subscriptionEndDate)
                          ? styles.assessment
                          : selectedAssignment.status === "active"
                            ? styles.therapy
                            : styles.evaluation
                      }`}
                    >
                      {isSubscriptionExpired(selectedAssignment.subscriptionEndDate)
                        ? "Expired"
                        : selectedAssignment.status || "Active"}
                    </span>
                  </div>
                </div>
                {selectedAssignment.notes && (
                  <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                    <div className={styles.detailLabel}>Notes</div>
                    <div className={styles.detailValue}>{selectedAssignment.notes}</div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModal} className={styles.cancelButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignPatientsSpecialEducationDoctor
