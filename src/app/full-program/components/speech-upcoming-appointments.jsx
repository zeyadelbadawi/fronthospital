"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Clock, User, FileText, Tag, Briefcase, Eye, Edit, Trash2, X, Save } from "lucide-react"
import styles from "../styles/speech-upcoming-appointments.module.css"
import axiosInstance from "@/helper/axiosSetup"
import { useContentStore } from "../store/content-store"; // Ensure to import the store correctly

export function SpeechUpcomingAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterType, setFilterType] = useState("all")
  const [filterProgram, setFilterProgram] = useState("all")
  const setActiveContent = useContentStore((state) => state.setActiveContent);

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

  })
  const [saving, setSaving] = useState(false)



  useEffect(() => {
    fetchUpcomingAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, search, filterType, filterProgram])

const fetchUpcomingAppointments = async () => {
  setLoading(true);
  try {
    // Use axios to fetch data
    const response = await axiosInstance.get("/full/fullprogram");  // API endpoint

    // Ensure that the response is an array of appointments
    const data = response.data;

    // Sort appointments by date and time
    const sortedAppointments = data.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA - dateTimeB;
    });

    // Debugging: Log all appointments
    console.log("Fetched and sorted appointments:", sortedAppointments);

    setAppointments(sortedAppointments);
  } catch (error) {
    // Handle errors (e.g., network issues, non-2xx status codes)
    console.error("Error fetching upcoming appointments:", error);
    if (error.response) {
      // Server responded with a non-2xx status code
      console.error("Error response:", error.response.data);
    } else if (error.request) {
      // No response from the server
      console.error("No response received:", error.request);
    } else {
      // Some other error (e.g., setup error)
      console.error("Error message:", error.message);
    }
  } finally {
    setLoading(false);
  }
};

  const filterAppointments = () => {
    let filtered = appointments

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.patientName.toLowerCase().includes(search.toLowerCase()) ||
          appointment.description.toLowerCase().includes(search.toLowerCase()),
      )
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
  const currentDateTime = new Date();
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);

  // If the appointment has passed and isn't marked as complete, mark it as complete
  if (appointmentDateTime < currentDateTime && appointment.status !== "complete") {
    markAppointmentAsComplete(appointment._id);  // Call function to mark it complete
  } else {
    // Dynamically set content to the appointment completion view
    setActiveContent({
      department: "New-Evaulations-Appointments",
      type: "COMPLETE-Evaulations",  // New content type for the appointment completion view
      appointmentId: appointment._id,  // Pass the appointment ID to the content
    });
  }
};

const markAppointmentAsComplete = async (appointmentId) => {
  try {
    // Send request to update the status to 'complete'
    const response = await axiosInstance.put(`/full/fullprogram/${appointmentId}`, {
      status: "complete"
    });

    // Update the appointment locally to reflect the change
    setAppointments(appointments.map(app =>
      app._id === appointmentId ? { ...app, status: "complete" } : app
    ));

    alert("Appointment marked as complete!");
  } catch (error) {
    console.error("Error marking appointment as complete:", error);
    alert("Error marking appointment as complete");
  }
};



  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setEditFormData({
      patientName: appointment.patientName,
      date: appointment.date,
      time: appointment.time,
      description: appointment.description,
    })
    setShowEditModal(true)
  }

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDeleteModal(true)
  }

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      // Send updated appointment data via PUT request
      const response = await axiosInstance.put(`/full/fullprogram/${selectedAppointment._id}`, editFormData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Update the appointment in the local state with the response data
      const updatedAppointment = response.data;

      // Update the local state with the new data
      const updatedAppointments = appointments.map((app) =>
        app._id === selectedAppointment._id ? updatedAppointment : app
      );

      setAppointments(updatedAppointments);
      setShowEditModal(false);
      setSelectedAppointment(null);
      alert("Appointment updated successfully!");
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Error updating appointment: " + error.message);
    } finally {
      setSaving(false);
    }
  };
  const handleConfirmDelete = async () => {
    setSaving(true);
    try {
      // Use axios to send a DELETE request
      await axiosInstance.delete(`/full/fullprogram/${selectedAppointment._id}`);

      // Remove the deleted appointment from the local state
      setAppointments(appointments.filter((app) => app._id !== selectedAppointment._id));

      // Close the delete modal and reset the selected appointment
      setShowDeleteModal(false);
      setSelectedAppointment(null);

      alert("Appointment deleted successfully!");
    } catch (error) {
      // Handle errors (e.g., network issues, non-2xx status codes)
      console.error("Error deleting appointment:", error);
      alert("Error deleting appointment: " + error.message);
    } finally {
      setSaving(false);
    }
  };
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

    })
  }

const parseAppointmentDateTime = (date, time) => {
  // Format: YYYY-MM-DD and HH:mm
  const dateParts = date.split('T')[0];  // Get the date part (e.g., 2025-07-03)
  const timeParts = time.split('T')[1]?.split('Z')[0] || time;  // Get the time part (e.g., 14:32 or 13:30:00)
  
  // Check if time has seconds or just hours and minutes
  const formattedTime = timeParts.includes(":") && timeParts.split(":").length === 2 ? timeParts + ":00" : timeParts; 

  // Combine date and time into ISO 8601 format
  const formattedDateTime = `${dateParts}T${formattedTime}`;

  return new Date(formattedDateTime);  // Return the Date object
};
const getActionButtons = (appointment) => {
  const currentDateTime = new Date();
  const appointmentDateTime = parseAppointmentDateTime(appointment.date, appointment.time);

  // Check if the appointment is in the past
  const isPastAppointment = appointmentDateTime < currentDateTime;

  if (isPastAppointment && appointment.status !== "complete") {
    return (
      <div className={styles.actionButtons}>
        <button 
          className={`${styles.actionButton} ${styles.completeButton}`} 
          onClick={() => handleViewDetails(appointment)} 
          title="Mark as Complete"
        >
          <Save className={styles.actionIconRight} /> {/* Only the icon to the right */}
        </button>


         
        {/* Disable the Edit and Delete buttons for past appointments */}
        <button className={`${styles.actionButton} ${styles.editButton}`} style={{ display: "none" }} disabled title="Edit Appointment">
          <Edit className={styles.actionIcon} />
        </button>
        <button className={`${styles.actionButton} ${styles.deleteButton}`} style={{ display: "none" }} disabled title="Delete Appointment">
          <Trash2 className={styles.actionIcon} />
        </button>
      </div>
    );
  } else {
    return (
      <div className={styles.actionButtons}>
        <button onClick={() => handleViewDetails(appointment)} className={`${styles.actionButton} ${styles.viewButton}`} title="View Details">
          <Eye className={styles.actionIcon} />
        </button>
        <button onClick={() => handleEditAppointment(appointment)} className={`${styles.actionButton} ${styles.editButton}`} title="Edit Appointment">
          <Edit className={styles.actionIcon} />
        </button>
        <button onClick={() => handleDeleteAppointment(appointment)} className={`${styles.actionButton} ${styles.deleteButton}`} title="Delete Appointment">
          <Trash2 className={styles.actionIcon} />
        </button>
      </div>
    );
  }
};


  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex)

  // Get unique types and programs for filters

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
                       
                       
                      <td className={styles.actionsCell}>
  {getActionButtons(appointment)}
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
