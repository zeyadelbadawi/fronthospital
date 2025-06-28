"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Clock, User, FileText, Tag, Briefcase, Eye, Edit, Trash2, X, Save } from "lucide-react"
import styles from "../styles/speech-upcoming-appointments.module.css"

export function SpeechUpcomingAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterType, setFilterType] = useState("all")
  const [filterProgram, setFilterProgram] = useState("all")
  const itemsPerPage = 10

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [editFormData, setEditFormData] = useState({
    patientName: "",
    date: "",
    time: "",
    description: "",
    type: "",
    programKind: "",
  })
  const [saving, setSaving] = useState(false)

  // Available options for dropdowns
  const appointmentTypes = ["Assessment", "Therapy Session", "Group Session", "Evaluation", "Review", "Workshop"]
  const programKinds = ["Individual Therapy", "Group Therapy", "Specialized Program"]

  useEffect(() => {
    fetchUpcomingAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, search, filterType, filterProgram])

  const fetchUpcomingAppointments = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration - replace with actual API call
      const mockAppointments = [
        {
          _id: "app1",
          patientName: "Sarah Johnson",
          patientId: "pat001",
          date: "2024-02-15",
          time: "10:00",
          description: "Initial speech assessment and therapy planning session",
          type: "Assessment",
          programKind: "Individual Therapy",
          status: "scheduled",
          createdAt: "2024-01-30",
        },
        {
          _id: "app2",
          patientName: "David Lee",
          patientId: "pat002",
          date: "2024-02-15",
          time: "14:30",
          description: "Articulation therapy session focusing on /r/ sound production",
          type: "Therapy Session",
          programKind: "Individual Therapy",
          status: "scheduled",
          createdAt: "2024-01-30",
        },
        {
          _id: "app3",
          patientName: "Emma Wilson",
          patientId: "pat003",
          date: "2024-02-16",
          time: "09:15",
          description: "Language development group session",
          type: "Group Session",
          programKind: "Group Therapy",
          status: "scheduled",
          createdAt: "2024-01-30",
        },
        {
          _id: "app4",
          patientName: "Michael Chen",
          patientId: "pat004",
          date: "2024-02-16",
          time: "11:00",
          description: "Follow-up evaluation for speech progress",
          type: "Evaluation",
          programKind: "Individual Therapy",
          status: "scheduled",
          createdAt: "2024-02-01",
        },
        {
          _id: "app5",
          patientName: "Sarah Johnson",
          patientId: "pat001",
          date: "2024-02-17",
          time: "10:00",
          description: "Fluency therapy session with breathing exercises",
          type: "Therapy Session",
          programKind: "Individual Therapy",
          status: "scheduled",
          createdAt: "2024-02-01",
        },
        {
          _id: "app6",
          patientName: "Alex Rodriguez",
          patientId: "pat005",
          date: "2024-02-17",
          time: "15:30",
          description: "Voice therapy session for vocal cord strengthening",
          type: "Therapy Session",
          programKind: "Specialized Program",
          status: "scheduled",
          createdAt: "2024-02-02",
        },
        {
          _id: "app7",
          patientName: "Lisa Park",
          patientId: "pat006",
          date: "2024-02-18",
          time: "13:00",
          description: "Social communication skills group workshop",
          type: "Workshop",
          programKind: "Group Therapy",
          status: "scheduled",
          createdAt: "2024-02-02",
        },
        {
          _id: "app8",
          patientName: "David Lee",
          patientId: "pat002",
          date: "2024-02-19",
          time: "14:30",
          description: "Progress review and therapy plan adjustment",
          type: "Review",
          programKind: "Individual Therapy",
          status: "scheduled",
          createdAt: "2024-02-03",
        },
      ]

      // Sort by date and time
      const sortedAppointments = mockAppointments.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`)
        const dateTimeB = new Date(`${b.date}T${b.time}`)
        return dateTimeA - dateTimeB
      })

      setAppointments(sortedAppointments)
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.patientName.toLowerCase().includes(search.toLowerCase()) ||
          appointment.description.toLowerCase().includes(search.toLowerCase()) ||
          appointment.type.toLowerCase().includes(search.toLowerCase()) ||
          appointment.programKind.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((appointment) => appointment.type === filterType)
    }

    // Program filter
    if (filterProgram !== "all") {
      filtered = filtered.filter((appointment) => appointment.programKind === filterProgram)
    }

    setFilteredAppointments(filtered)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    filterAppointments()
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowViewModal(true)
  }

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setEditFormData({
      patientName: appointment.patientName,
      date: appointment.date,
      time: appointment.time,
      description: appointment.description,
      type: appointment.type,
      programKind: appointment.programKind,
    })
    setShowEditModal(true)
  }

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDeleteModal(true)
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      // Mock API call to update appointment
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the appointment in the local state
      const updatedAppointments = appointments.map((app) =>
        app._id === selectedAppointment._id
          ? {
              ...app,
              ...editFormData,
              lastModified: new Date().toISOString(),
            }
          : app,
      )

      setAppointments(updatedAppointments)
      setShowEditModal(false)
      setSelectedAppointment(null)
      alert("Appointment updated successfully!")
    } catch (error) {
      console.error("Error updating appointment:", error)
      alert("Error updating appointment: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    setSaving(true)
    try {
      // Mock API call to delete appointment
      await new Promise((resolve) => setTimeout(resolve, 500))

      setAppointments(appointments.filter((app) => app._id !== selectedAppointment._id))
      setShowDeleteModal(false)
      setSelectedAppointment(null)
      alert("Appointment deleted successfully!")
    } catch (error) {
      console.error("Error deleting appointment:", error)
      alert("Error deleting appointment: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const closeModals = () => {
    setShowEditModal(false)
    setShowDeleteModal(false)
    setShowViewModal(false)
    setSelectedAppointment(null)
    setEditFormData({
      patientName: "",
      date: "",
      time: "",
      description: "",
      type: "",
      programKind: "",
    })
  }

  const getTypeColor = (type) => {
    const colors = {
      Assessment: "assessment",
      "Therapy Session": "therapy",
      "Group Session": "group",
      Evaluation: "evaluation",
      Review: "review",
      Workshop: "workshop",
    }
    return colors[type] || "default"
  }

  const getProgramColor = (program) => {
    const colors = {
      "Individual Therapy": "individual",
      "Group Therapy": "group",
      "Specialized Program": "specialized",
    }
    return colors[program] || "default"
  }

  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex)

  // Get unique types and programs for filters
  const uniqueTypes = [...new Set(appointments.map((app) => app.type))]
  const uniquePrograms = [...new Set(appointments.map((app) => app.programKind))]

  return (
    <div className={styles.upcomingContainer}>
      <div className={styles.upcomingCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.pageTitle}>Upcoming Speech Appointments</h2>
            <div className={styles.headerActions}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.searchInputContainer}>
                  <input
                    type="text"
                    className={styles.searchInput}
                    name="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search appointments..."
                  />
                  <Search className={styles.searchIcon} />
                </div>
              </form>
            </div>
          </div>

          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Program:</label>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Programs</option>
                {uniquePrograms.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{filteredAppointments.length}</span>
                <span className={styles.statLabel}>Total Appointments</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading upcoming appointments...</p>
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
                        Patient Name
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Calendar className={styles.headerIcon} />
                        Date
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Clock className={styles.headerIcon} />
                        Time
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <FileText className={styles.headerIcon} />
                        Description
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Tag className={styles.headerIcon} />
                        Type
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Briefcase className={styles.headerIcon} />
                        Program Kind
                      </div>
                    </th>
                    <th className={styles.textCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments && currentAppointments.length > 0 ? (
                    currentAppointments.map((appointment, index) => (
                      <tr key={appointment._id} className={styles.tableRow}>
                        <td className={styles.indexCell}>{startIndex + index + 1}</td>
                        <td className={styles.patientCell}>
                          <div className={styles.patientInfo}>
                            <span className={styles.patientName}>{appointment.patientName}</span>
                            <span className={styles.patientId}>ID: {appointment.patientId}</span>
                          </div>
                        </td>
                        <td className={styles.dateCell}>
                          <div className={styles.dateInfo}>
                            <span className={styles.dateValue}>
                              {new Date(appointment.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className={styles.dateYear}>{new Date(appointment.date).getFullYear()}</span>
                          </div>
                        </td>
                        <td className={styles.timeCell}>
                          <span className={styles.timeValue}>{appointment.time}</span>
                        </td>
                        <td className={styles.descriptionCell}>
                          <div className={styles.descriptionText} title={appointment.description}>
                            {appointment.description}
                          </div>
                        </td>
                        <td className={styles.typeCell}>
                          <span className={`${styles.typeBadge} ${styles[getTypeColor(appointment.type)]}`}>
                            {appointment.type}
                          </span>
                        </td>
                        <td className={styles.programCell}>
                          <span
                            className={`${styles.programBadge} ${styles[getProgramColor(appointment.programKind)]}`}
                          >
                            {appointment.programKind}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleViewDetails(appointment)}
                              className={`${styles.actionButton} ${styles.viewButton}`}
                              title="View Details"
                            >
                              <Eye className={styles.actionIcon} />
                            </button>
                            <button
                              onClick={() => handleEditAppointment(appointment)}
                              className={`${styles.actionButton} ${styles.editButton}`}
                              title="Edit Appointment"
                            >
                              <Edit className={styles.actionIcon} />
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(appointment)}
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              title="Delete Appointment"
                            >
                              <Trash2 className={styles.actionIcon} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className={styles.noData}>
                        <div className={styles.emptyState}>
                          <Calendar className={styles.emptyIcon} />
                          <h3>No upcoming appointments found</h3>
                          <p>
                            {search || filterType !== "all" || filterProgram !== "all"
                              ? "Try adjusting your search or filters"
                              : "No appointments are scheduled at this time"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filteredAppointments.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAppointments.length)} of{" "}
                {filteredAppointments.length} appointments
              </span>
              <div className={styles.paginationButtons}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.active : ""}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedAppointment && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Appointment Details</h3>
              <button onClick={closeModals} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Patient Name:</label>
                  <span className={styles.detailValue}>{selectedAppointment.patientName}</span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Patient ID:</label>
                  <span className={styles.detailValue}>{selectedAppointment.patientId}</span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Date:</label>
                  <span className={styles.detailValue}>
                    {new Date(selectedAppointment.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Time:</label>
                  <span className={styles.detailValue}>{selectedAppointment.time}</span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Type:</label>
                  <span className={`${styles.typeBadge} ${styles[getTypeColor(selectedAppointment.type)]}`}>
                    {selectedAppointment.type}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Program Kind:</label>
                  <span
                    className={`${styles.programBadge} ${styles[getProgramColor(selectedAppointment.programKind)]}`}
                  >
                    {selectedAppointment.programKind}
                  </span>
                </div>
                <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                  <label className={styles.detailLabel}>Description:</label>
                  <span className={styles.detailValue}>{selectedAppointment.description}</span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Status:</label>
                  <span className={styles.detailValue}>{selectedAppointment.status}</span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Created:</label>
                  <span className={styles.detailValue}>
                    {new Date(selectedAppointment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAppointment && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Appointment</h3>
              <button onClick={closeModals} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.editForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Patient Name:</label>
                    <input
                      type="text"
                      value={editFormData.patientName}
                      onChange={(e) => setEditFormData({ ...editFormData, patientName: e.target.value })}
                      className={styles.formInput}
                      disabled
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Date:</label>
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className={styles.formInput}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Time:</label>
                    <input
                      type="time"
                      value={editFormData.time}
                      onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Type:</label>
                    <select
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                      className={styles.formSelect}
                    >
                      {appointmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Program Kind:</label>
                    <select
                      value={editFormData.programKind}
                      onChange={(e) => setEditFormData({ ...editFormData, programKind: e.target.value })}
                      className={styles.formSelect}
                    >
                      {programKinds.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Description:</label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className={styles.formTextarea}
                      rows={3}
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModals} className={styles.cancelButton} disabled={saving}>
                Cancel
              </button>
              <button onClick={handleSaveEdit} className={styles.saveButton} disabled={saving}>
                <Save className={styles.buttonIcon} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAppointment && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={`${styles.modal} ${styles.deleteModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirm Delete</h3>
              <button onClick={closeModals} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteConfirmation}>
                <div className={styles.deleteIcon}>
                  <Trash2 className={styles.deleteIconSvg} />
                </div>
                <h4 className={styles.deleteTitle}>Delete Appointment?</h4>
                <p className={styles.deleteMessage}>
                  Are you sure you want to delete the appointment for <strong>{selectedAppointment.patientName}</strong>{" "}
                  on <strong>{new Date(selectedAppointment.date).toLocaleDateString()}</strong> at{" "}
                  <strong>{selectedAppointment.time}</strong>?
                </p>
                <p className={styles.deleteWarning}>This action cannot be undone.</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModals} className={styles.cancelButton} disabled={saving}>
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className={styles.deleteConfirmButton} disabled={saving}>
                <Trash2 className={styles.buttonIcon} />
                {saving ? "Deleting..." : "Delete Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
