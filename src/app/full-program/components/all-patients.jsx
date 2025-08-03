"use client"
import { useState, useEffect } from "react"
import { Search, Calendar, AlertCircle, Users, UserCheck, RefreshCw, Eye, Trash2, Edit, Save } from "lucide-react"
import styles from "../styles/speech-upcoming-appointments.module.css"
import axiosInstance from "@/helper/axiosSetup"
import { getDepartmentByContentType } from "../config/departments"

const AllPatients = ({ contentType }) => {
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [message, setMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState(null)

  // Edit functionality states
  const [showEditModal, setShowEditModal] = useState(false)
  const [assignmentToEdit, setAssignmentToEdit] = useState(null)
  const [editDoctor, setEditDoctor] = useState("")
  const [editSubscriptionEndDate, setEditSubscriptionEndDate] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editFormErrors, setEditFormErrors] = useState({})
  const [isUpdating, setIsUpdating] = useState(false)

  const [stats, setStats] = useState({
    totalPatients: 0,
    assignedPatients: 0,
    unassignedPatients: 0,
    totalDoctors: 0,
    expiredAssignments: 0,
  })

  const department = getDepartmentByContentType(contentType)

  // If no department found, show error
  if (!department) {
    return (
      <div className={styles.upcomingContainer}>
        <div className={styles.upcomingCard}>
          <div className={styles.cardBody}>
            <div className={styles.emptyState}>
              <AlertCircle className={styles.emptyIcon} />
              <h3>Invalid Department</h3>
              <p>The requested department could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, contentType])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch patients from department-specific PatientAssignment collection
      console.log(`Fetching ${department.displayName} Students from Student${department.name}Assignment...`)
      let patientsResponse
      try {
        patientsResponse = await axiosInstance.get(`${department.apiEndpoint}/patient-assignments`, {
          params: { page: currentPage, search: searchTerm },
        })
        console.log(`${department.displayName} Student response:`, patientsResponse.data)
      } catch (error) {
        console.error(`${department.displayName} Student fetch failed:`, error)
        setMessage(
          `Failed to fetch ${department.displayName} Student: ` + (error.response?.data?.message || error.message),
        )
        patientsResponse = { data: { assignments: [], patients: [] } }
      }

      // Fetch doctors in department
      console.log(`Fetching ${department.displayName} doctors...`)
      let doctorsResponse
      try {
        doctorsResponse = await axiosInstance.get(
          `/doctor-student-assignment/doctors-by-department/${department.doctorDepartment}`,
        )
        console.log(`${department.displayName} doctors response:`, doctorsResponse.data)
      } catch (error) {
        console.error("Doctors fetch failed:", error)
        setMessage("Failed to fetch doctors: " + (error.response?.data?.message || error.message))
        doctorsResponse = { data: { doctors: [] } }
      }

      // Fetch current doctor-student assignments for department
      console.log(`Fetching ${department.displayName} doctor-student assignments...`)
      let assignmentsResponse
      try {
        assignmentsResponse = await axiosInstance.get("/doctor-student-assignment/all-assignments", {
          params: { department: department.doctorDepartment, page: 1, limit: 100 },
        })
        console.log(`${department.displayName} assignments response:`, assignmentsResponse.data)
      } catch (error) {
        console.error("Assignments fetch failed:", error)
        setMessage("Failed to fetch assignments: " + (error.response?.data?.message || error.message))
        assignmentsResponse = { data: { assignments: [] } }
      }

      // Set the data - patients from PatientAssignment
      const patientsData = patientsResponse.data.assignments || patientsResponse.data.patients || []
      const doctorsData = doctorsResponse.data.doctors || []
      const assignmentsData = assignmentsResponse.data.assignments || []

      setPatients(patientsData)
      setDoctors(doctorsData)
      setAssignments(assignmentsData)

      // Calculate stats
      const totalPatients = patientsData.length
      const assignedPatients = assignmentsData.length
      const unassignedPatients = totalPatients - assignedPatients
      const totalDoctors = doctorsData.length
      const expiredAssignments = assignmentsData.filter((a) => isSubscriptionExpired(a.subscriptionEndDate)).length

      setStats({
        totalPatients,
        assignedPatients,
        unassignedPatients,
        totalDoctors,
        expiredAssignments,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      setMessage("Error loading data: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const getAssignmentForPatient = (patientId) => {
    return assignments.find(
      (assignment) =>
        (assignment.patient?._id === patientId || assignment.patient === patientId) && assignment.status !== "inactive",
    )
  }

  const handleEditAssignment = async (e) => {
    e.preventDefault()

    // Reset errors
    setEditFormErrors({})

    // Validation
    const errors = {}

    if (!editDoctor) {
      errors.doctor = "Please select a doctor"
    }

    if (editSubscriptionEndDate && new Date(editSubscriptionEndDate) <= new Date()) {
      errors.subscriptionEndDate = "Subscription end date must be in the future"
    }

    // Check if trying to assign to the same doctor
    if (editDoctor === assignmentToEdit.doctor?._id) {
      // Allow same doctor if other fields are being updated
      if (
        editSubscriptionEndDate === (assignmentToEdit.subscriptionEndDate?.split("T")[0] || "") &&
        editNotes === (assignmentToEdit.notes || "")
      ) {
        errors.general = "No changes detected"
      }
    }

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors)
      return
    }

    try {
      setIsUpdating(true)

      // Update the assignment
      const response = await axiosInstance.put(`/doctor-student-assignment/update-assignment/${assignmentToEdit._id}`, {
        doctor: editDoctor,
        subscriptionEndDate: editSubscriptionEndDate || null,
        notes: editNotes,
      })

      setMessage("Assignment updated successfully!")
      setShowEditModal(false)
      setAssignmentToEdit(null)
      setEditDoctor("")
      setEditSubscriptionEndDate("")
      setEditNotes("")
      setEditFormErrors({})

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error("Error updating assignment:", error)
      setEditFormErrors({ general: "Error updating assignment: " + (error.response?.data?.message || error.message) })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUnassignStudent = async (assignmentId) => {
    try {
      await axiosInstance.delete(`/doctor-student-assignment/unassign-student/${assignmentId}`)
      setMessage("Student unassigned successfully!")
      setShowDeleteModal(false)
      setAssignmentToDelete(null)
      await fetchData()
    } catch (error) {
      console.error("Error unassigning student:", error)
      setMessage("Error unassigning student: " + (error.response?.data?.message || error.message))
    }
  }

  const handleUpdateSubscription = async (assignmentId, newEndDate) => {
    try {
      await axiosInstance.put(`/doctor-student-assignment/update-subscription/${assignmentId}`, {
        subscriptionEndDate: newEndDate,
        status: "active",
      })
      setMessage("Subscription updated successfully!")
      await fetchData()
    } catch (error) {
      console.error("Error updating subscription:", error)
      setMessage("Error updating subscription: " + (error.response?.data?.message || error.message))
    }
  }

  const filteredPatients = patients.filter(
    (assignment) =>
      assignment.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.patient?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.patient?.patientId?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const isSubscriptionExpired = (endDate) => {
    if (!endDate) return false
    return new Date(endDate) < new Date()
  }

  const handleViewDetails = (assignment) => {
    setSelectedAssignment(assignment)
    setShowDetailsModal(true)
  }

  const handleDeleteClick = (assignment) => {
    setAssignmentToDelete(assignment)
    setShowDeleteModal(true)
  }

  const handleEditClick = (assignment) => {
    setAssignmentToEdit(assignment)
    setEditDoctor(assignment.doctor?._id || "")
    setEditSubscriptionEndDate(assignment.subscriptionEndDate ? assignment.subscriptionEndDate.split("T")[0] : "")
    setEditNotes(assignment.notes || "")
    setEditFormErrors({})
    setShowEditModal(true)
  }

  const closeModal = () => {
    setShowDetailsModal(false)
    setShowDeleteModal(false)
    setShowEditModal(false)
    setSelectedAssignment(null)
    setAssignmentToDelete(null)
    setAssignmentToEdit(null)
    setEditDoctor("")
    setEditSubscriptionEndDate("")
    setEditNotes("")
    setEditFormErrors({})
  }

  if (loading && patients.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading {department.displayName} assignments...</p>
      </div>
    )
  }

  return (
    <div className={styles.upcomingContainer}>
      {/* Main Unified Card - Header, Stats, Search, and Table */}
      <div className={styles.upcomingCard}>
        {/* Header with Stats */}
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>
                <Users className={styles.titleIcon} />
                {department.displayName} Assignments Table
              </h1>
              <p className={styles.pageSubtitle}>
                View and manage {department.displayName} Student assignments to doctors
              </p>
            </div>
            <div className={styles.headerActions}>
              <button onClick={fetchData} disabled={loading} className={`${styles.actionButton} ${styles.viewButton}`}>
                <RefreshCw className={`${styles.actionIcon} ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.totalPatients}</div>
              <div className={styles.statLabel}>Total {department.displayName} Patients</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.assignedPatients}</div>
              <div className={styles.statLabel}>Assigned to Doctors</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.unassignedPatients}</div>
              <div className={styles.statLabel}>Unassigned</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.totalDoctors}</div>
              <div className={styles.statLabel}>Available Doctors</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.expiredAssignments}</div>
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
                  placeholder={`Search ${department.displayName} Students by name, email, or Student ID...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={styles.cardBody}>
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                borderRadius: "0.75rem",
                backgroundColor: message.includes("Error") || message.includes("Failed") ? "#fee2e2" : "#dcfce7",
                color: message.includes("Error") || message.includes("Failed") ? "#dc2626" : "#166534",
                border: `1px solid ${message.includes("Error") || message.includes("Failed") ? "#fecaca" : "#bbf7d0"}`,
                display: "flex",
                alignItems: "center",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {message.includes("Error") || message.includes("Failed") ? (
                <AlertCircle style={{ marginRight: "0.75rem", flexShrink: 0 }} size={20} />
              ) : (
                <UserCheck style={{ marginRight: "0.75rem", flexShrink: 0 }} size={20} />
              )}
              <span style={{ fontWeight: "500" }}>{message}</span>
            </div>
          </div>
        )}

        {/* Table Section - Integrated in the same card */}
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
              {department.displayName} Students & Doctor Assignments
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

          {filteredPatients.length === 0 ? (
            <div className={styles.emptyState}>
              <Users className={styles.emptyIcon} />
              <h3>No {department.displayName} Students found</h3>
              <p>
                {searchTerm
                  ? "No Students match your search criteria. Try adjusting your search terms."
                  : `Students need to be assigned to the ${department.displayName} department first through Student${department.name}Assignment.`}
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
                          <Users className={styles.headerIcon} />
                          Student
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>Phone Number</div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <Calendar className={styles.headerIcon} />
                          {department.displayName} Assignment Date
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <UserCheck className={styles.headerIcon} />
                          Assigned Doctor
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <Calendar className={styles.headerIcon} />
                          Doctor Assignment Date
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <Calendar className={styles.headerIcon} />
                          Subscription End
                        </div>
                      </th>
                      <th className={styles.textCenter}>
                        <div className={styles.headerCell}>Status</div>
                      </th>
                      <th className={styles.textCenter}>
                        <div className={styles.headerCell}>Actions</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patientAssignment, index) => {
                      const patient = patientAssignment.patient || patientAssignment.patientId
                      const patientId = patient?._id
                      const doctorAssignment = getAssignmentForPatient(patientId)
                      const isExpired = doctorAssignment && isSubscriptionExpired(doctorAssignment.subscriptionEndDate)

                      return (
                        <tr
                          key={patientAssignment._id}
                          className={`${styles.tableRow} ${isExpired ? "bg-red-50" : ""}`}
                        >
                          <td className={styles.indexCell}>{index + 1}</td>
                          <td className={styles.patientCell}>
                            <div className={styles.patientInfo}>
                              <div className={styles.patientName}>{patient?.name || "Unknown"}</div>
                              <div className={styles.patientId}>{patient?.email || "No email"}</div>
                            </div>
                          </td>
                          <td className={styles.patientCell}>
                            <div className={styles.patientInfo}>
                              <div className={styles.patientName}>{patient?.phone || "No Phone Number"}</div>
                            </div>
                          </td>
                          <td className={styles.dateCell}>
                            <div className={styles.dateInfo}>
                              <div className={styles.dateValue}>
                                {patientAssignment.assignedDate
                                  ? new Date(patientAssignment.assignedDate).toLocaleDateString()
                                  : new Date(patientAssignment.createdAt).toLocaleDateString()}
                              </div>
                              <div className={styles.dateYear}>
                                {patientAssignment.assignedDate
                                  ? new Date(patientAssignment.assignedDate).toLocaleDateString("en-US", {
                                      weekday: "short",
                                    })
                                  : new Date(patientAssignment.createdAt).toLocaleDateString("en-US", {
                                      weekday: "short",
                                    })}
                              </div>
                            </div>
                          </td>
                          <td className={styles.patientCell}>
                            {doctorAssignment ? (
                              <div className={styles.patientInfo}>
                                <div className={styles.patientName}>
                                  Dr.{" "}
                                  {doctorAssignment.doctor?.name ||
                                    doctorAssignment.doctor?.username ||
                                    "Unknown Doctor"}
                                </div>
                                <div className={styles.patientId}>{doctorAssignment.doctor?.email || "No email"}</div>
                              </div>
                            ) : (
                              <span style={{ fontSize: "0.875rem", color: "#9ca3af", fontStyle: "italic" }}>
                                Not assigned to doctor
                              </span>
                            )}
                          </td>
                          <td className={styles.dateCell}>
                            <div className={styles.dateInfo}>
                              <div className={styles.dateValue}>
                                {doctorAssignment ? new Date(doctorAssignment.assignedDate).toLocaleDateString() : "-"}
                              </div>
                              {doctorAssignment && (
                                <div className={styles.dateYear}>
                                  {new Date(doctorAssignment.assignedDate).toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className={styles.dateCell}>
                            {doctorAssignment ? (
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <Calendar style={{ marginRight: "0.25rem" }} size={16} />
                                <span
                                  className={`${styles.formInput} ${
                                    isExpired ? "border-red-300 bg-red-50" : "border-gray-300"
                                  }`}
                                  style={{
                                    fontSize: "0.875rem",
                                    padding: "0.25rem",
                                    backgroundColor: "transparent",
                                    border: "none",
                                  }}
                                >
                                  {doctorAssignment.subscriptionEndDate
                                    ? doctorAssignment.subscriptionEndDate.split("T")[0]
                                    : ""}
                                </span>
                                {isExpired && (
                                  <AlertCircle style={{ marginLeft: "0.25rem", color: "#dc2626" }} size={16} />
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>-</span>
                            )}
                          </td>
                          <td className={styles.typeCell}>
                            {doctorAssignment ? (
                              <span
                                className={`${styles.typeBadge} ${
                                  isExpired
                                    ? styles.assessment
                                    : doctorAssignment.status === "active"
                                      ? styles.therapy
                                      : styles.evaluation
                                }`}
                              >
                                {isExpired ? "Expired" : doctorAssignment.status || "active"}
                              </span>
                            ) : (
                              <span className={`${styles.typeBadge} ${styles.default}`}>Unassigned</span>
                            )}
                          </td>
                          <td className={styles.actionsCell}>
                            <div className={styles.actionButtons}>
                              {doctorAssignment ? (
                                <>
                                  <button
                                    onClick={() => handleViewDetails(doctorAssignment)}
                                    className={`${styles.actionButton} ${styles.viewButton}`}
                                    title="View Details"
                                  >
                                    <Eye className={styles.actionIcon} />
                                  </button>
                                  <button
                                    onClick={() => handleEditClick(doctorAssignment)}
                                    className={`${styles.actionButton} ${styles.editButton}`}
                                    title="Edit Assignment"
                                  >
                                    <Edit className={styles.actionIcon} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(doctorAssignment)}
                                    className={`${styles.actionButton} ${styles.deleteButton}`}
                                    title="Unassign Doctor"
                                  >
                                    <Trash2 className={styles.actionIcon} />
                                  </button>
                                </>
                              ) : (
                                <span style={{ fontSize: "0.875rem", color: "#9ca3af", fontStyle: "italic" }}>
                                  No actions available
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredPatients.length > 0 && (
                <div className={styles.paginationContainer}>
                  <div className={styles.paginationInfo}>
                    Showing 1 to {filteredPatients.length} of {filteredPatients.length} students
                  </div>
                  <div className={styles.paginationButtons}>
                    <button className={`${styles.paginationButton} ${styles.active}`}>1</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Assignment Modal */}
      {showEditModal && assignmentToEdit && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Assignment</h2>
              <button onClick={closeModal} className={styles.closeButton}>
                <span className={styles.closeIcon}>×</span>
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleEditAssignment} className={styles.editForm}>
                {editFormErrors.general && (
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "0.75rem",
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {editFormErrors.general}
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Student</label>
                    <input
                      type="text"
                      value={assignmentToEdit.patient?.name || assignmentToEdit.patientId?.name || "Unknown"}
                      className={styles.formInput}
                      disabled
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Current Doctor</label>
                    <input
                      type="text"
                      value={`Dr. ${assignmentToEdit.doctor?.name || assignmentToEdit.doctor?.username || "Unknown"}`}
                      className={styles.formInput}
                      disabled
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Change Doctor To *</label>
                    <select
                      value={editDoctor}
                      onChange={(e) => {
                        setEditDoctor(e.target.value)
                        if (editFormErrors.doctor) {
                          setEditFormErrors((prev) => ({ ...prev, doctor: null }))
                        }
                      }}
                      className={`${styles.formSelect} ${editFormErrors.doctor ? "border-red-500" : ""}`}
                      required
                    >
                      <option value="">Choose a doctor...</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.name || doctor.username} - {doctor.email}
                        </option>
                      ))}
                    </select>
                    {editFormErrors.doctor && (
                      <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.25rem" }}>
                        {editFormErrors.doctor}
                      </p>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subscription End Date</label>
                    <input
                      type="date"
                      value={editSubscriptionEndDate}
                      onChange={(e) => {
                        setEditSubscriptionEndDate(e.target.value)
                        if (editFormErrors.subscriptionEndDate) {
                          setEditFormErrors((prev) => ({ ...prev, subscriptionEndDate: null }))
                        }
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className={`${styles.formInput} ${editFormErrors.subscriptionEndDate ? "border-red-500" : ""}`}
                    />
                    {editFormErrors.subscriptionEndDate && (
                      <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.25rem" }}>
                        {editFormErrors.subscriptionEndDate}
                      </p>
                    )}
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className={styles.formTextarea}
                      rows="3"
                      placeholder="Add any notes about this assignment..."
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModal} className={styles.cancelButton} disabled={isUpdating}>
                Cancel
              </button>
              <button onClick={handleEditAssignment} disabled={isUpdating || !editDoctor} className={styles.saveButton}>
                <Save className={styles.buttonIcon} />
                {isUpdating ? "Updating..." : "Update Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAssignment && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Assignment Details</h2>
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
                  <div className={styles.detailLabel}>Doctor Name</div>
                  <div className={styles.detailValue}>
                    Dr. {selectedAssignment.doctor?.name || selectedAssignment.doctor?.username || "Unknown"}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Student Email</div>
                  <div className={styles.detailValue}>
                    {selectedAssignment.patient?.email || selectedAssignment.patientId?.email || "Not provided"}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Doctor Email</div>
                  <div className={styles.detailValue}>{selectedAssignment.doctor?.email || "Not provided"}</div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Department</div>
                  <div className={styles.detailValue}>{selectedAssignment.department || department.displayName}</div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && assignmentToDelete && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={`${styles.modal} ${styles.deleteModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Confirm Unassignment</h2>
              <button onClick={closeModal} className={styles.closeButton}>
                <span className={styles.closeIcon}>×</span>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteConfirmation}>
                <div className={styles.deleteIcon}>
                  <AlertCircle className={styles.deleteIconSvg} />
                </div>
                <h3 className={styles.deleteTitle}>Unassign Student from Doctor?</h3>
                <p className={styles.deleteMessage}>
                  Are you sure you want to unassign{" "}
                  <strong>
                    {assignmentToDelete.patient?.name || assignmentToDelete.patientId?.name || "this student"}
                  </strong>{" "}
                  from{" "}
                  <strong>
                    Dr. {assignmentToDelete.doctor?.name || assignmentToDelete.doctor?.username || "this doctor"}
                  </strong>
                  ?
                </p>
                <p className={styles.deleteWarning}>This action cannot be undone.</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModal} className={styles.cancelButton}>
                Cancel
              </button>
              <button
                onClick={() => handleUnassignStudent(assignmentToDelete._id)}
                className={styles.deleteConfirmButton}
              >
                <Trash2 className={styles.buttonIcon} />
                Unassign Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllPatients
