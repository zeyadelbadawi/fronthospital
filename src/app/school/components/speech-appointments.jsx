"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Calendar, Clock, Check, X, User, CalendarDays } from "lucide-react"
import { useRouter } from "next/navigation"
import styles from "../styles/speech-appointments.module.css"

export function SpeechAppointments() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [newAppointment, setNewAppointment] = useState({
    date: "",
    time: "",
  })
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()

  useEffect(() => {
    fetchAssignedPatients()
  }, [currentPage, search])

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientAppointments()
    }
  }, [selectedPatient])

  const fetchAssignedPatients = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration - replace with actual API call
      const mockPatients = [
        {
          _id: "1",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "333-444-5555",
          disabilityType: "Speech Delay",
          assignedDate: "2024-01-15",
          appointmentsCompleted: false,
        },
        {
          _id: "2",
          name: "David Lee",
          email: "david@example.com",
          phone: "666-777-8888",
          disabilityType: "Language Disorder",
          assignedDate: "2024-01-20",
          appointmentsCompleted: false,
        },
        {
          _id: "3",
          name: "Emma Wilson",
          email: "emma@example.com",
          phone: "999-000-1111",
          disabilityType: "Articulation Disorder",
          assignedDate: "2024-01-25",
          appointmentsCompleted: true,
        },
      ]
      setPatients(mockPatients)
      setTotalPages(1)
    } catch (error) {
      console.error("Error fetching assigned patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientAppointments = async () => {
    try {
      // Mock appointments data - replace with actual API call
      const mockAppointments = [
        {
          _id: "app1",
          date: "2024-02-15",
          time: "10:00",
          status: "scheduled",
          createdAt: "2024-01-30",
        },
        {
          _id: "app2",
          date: "2024-02-22",
          time: "14:30",
          status: "scheduled",
          createdAt: "2024-01-30",
        },
        {
          _id: "app3",
          date: "2024-03-01",
          time: "09:15",
          status: "scheduled",
          createdAt: "2024-01-30",
        },
      ]
      setAppointments(mockAppointments)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setAppointments([])
    }
  }

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setNewAppointment({ date: "", time: "" })
  }

  const handleBackToList = () => {
    setSelectedPatient(null)
    setAppointments([])
    setNewAppointment({ date: "", time: "" })
  }

  const handleAddAppointment = async () => {
    if (!newAppointment.date || !newAppointment.time) {
      alert("Please fill in both date and time")
      return
    }

    setSaving(true)
    try {
      // Mock save functionality - replace with actual API call
      const appointmentData = {
        patientId: selectedPatient._id,
        date: newAppointment.date,
        time: newAppointment.time,
        status: "scheduled",
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add to local state
      const newApp = {
        _id: `app_${Date.now()}`,
        ...appointmentData,
        createdAt: new Date().toISOString(),
      }
      setAppointments([...appointments, newApp])
      setNewAppointment({ date: "", time: "" })
      alert("Appointment added successfully!")
    } catch (error) {
      console.error("Error adding appointment:", error)
      alert("Error adding appointment: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCompleteAppointments = async () => {
    if (appointments.length === 0) {
      alert("No appointments to complete")
      return
    }

    const confirmComplete = window.confirm(
      "Are you sure you want to mark all appointments as complete? This action cannot be undone and will prevent adding new appointments.",
    )

    if (!confirmComplete) return

    setSaving(true)
    try {
      // Mock API call to complete appointments
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update patient status
      setPatients(patients.map((p) => (p._id === selectedPatient._id ? { ...p, appointmentsCompleted: true } : p)))

      setSelectedPatient({ ...selectedPatient, appointmentsCompleted: true })
      alert("All appointments marked as complete!")
    } catch (error) {
      console.error("Error completing appointments:", error)
      alert("Error completing appointments: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAppointment = async (appointmentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this appointment?")
    if (!confirmDelete) return

    try {
      // Mock API call to delete appointment
      await new Promise((resolve) => setTimeout(resolve, 500))

      setAppointments(appointments.filter((app) => app._id !== appointmentId))
      alert("Appointment deleted successfully!")
    } catch (error) {
      console.error("Error deleting appointment:", error)
      alert("Error deleting appointment: " + error.message)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchAssignedPatients()
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (selectedPatient) {
    return (
      <div className={styles.appointmentsContainer}>
        <div className={styles.appointmentsCard}>
          <div className={styles.appointmentHeader}>
            <div className={styles.headerLeft}>
              <button onClick={handleBackToList} className={styles.backButton}>
                <X className={styles.backIcon} />
                Back to Patients
              </button>
              <div className={styles.patientInfo}>
                <h2 className={styles.appointmentTitle}>Speech Therapy Appointments</h2>
                <div className={styles.patientDetails}>
                  <div className={styles.patientDetail}>
                    <User className={styles.detailIcon} />
                    <span>{selectedPatient.name}</span>
                  </div>
                  <div className={styles.patientDetail}>
                    <span className={styles.patientId}>ID: {selectedPatient._id}</span>
                  </div>
                  {selectedPatient.appointmentsCompleted && (
                    <div className={styles.completedBadge}>
                      <Check className={styles.completedIcon} />
                      Appointments Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.headerRight}>
              {!selectedPatient.appointmentsCompleted && (
                <button
                  onClick={handleCompleteAppointments}
                  disabled={saving || appointments.length === 0}
                  className={styles.completeButton}
                >
                  <Check className={styles.buttonIcon} />
                  {saving ? "Processing..." : "Complete All Appointments"}
                </button>
              )}
            </div>
          </div>

          <div className={styles.appointmentBody}>
            {!selectedPatient.appointmentsCompleted && (
              <div className={styles.addAppointmentSection}>
                <h3 className={styles.sectionTitle}>Add New Appointment</h3>
                <div className={styles.appointmentForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Calendar className={styles.labelIcon} />
                      Date
                    </label>
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                      className={styles.formInput}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Clock className={styles.labelIcon} />
                      Time
                    </label>
                    <input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                  <button
                    onClick={handleAddAppointment}
                    disabled={saving || !newAppointment.date || !newAppointment.time}
                    className={styles.addButton}
                  >
                    <Plus className={styles.buttonIcon} />
                    {saving ? "Adding..." : "Add Appointment"}
                  </button>
                </div>
              </div>
            )}

            <div className={styles.appointmentsListSection}>
              <h3 className={styles.sectionTitle}>Scheduled Appointments ({appointments.length})</h3>
              {appointments.length > 0 ? (
                <div className={styles.appointmentsList}>
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className={styles.appointmentItem}>
                      <div className={styles.appointmentInfo}>
                        <div className={styles.appointmentDate}>
                          <CalendarDays className={styles.appointmentIcon} />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className={styles.appointmentTime}>
                          <Clock className={styles.appointmentIcon} />
                          <span>{appointment.time}</span>
                        </div>
                        <div className={styles.appointmentStatus}>
                          <span className={styles.statusBadge}>Scheduled</span>
                        </div>
                      </div>
                      {!selectedPatient.appointmentsCompleted && (
                        <div className={styles.appointmentActions}>
                          <button
                            onClick={() => handleDeleteAppointment(appointment._id)}
                            className={styles.deleteButton}
                            title="Delete Appointment"
                          >
                            <X className={styles.actionIcon} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyAppointments}>
                  <Calendar className={styles.emptyIcon} />
                  <p>No appointments scheduled yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.appointmentsContainer}>
      <div className={styles.appointmentsCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.pageTitle}>Speech Therapy Appointments</h2>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  className={styles.searchInput}
                  name="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patients..."
                />
                <Search className={styles.searchIcon} />
              </div>
            </form>
          </div>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading patients...</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.patientsTable}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th>#</th>
                    <th>Patient Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Disability Type</th>
                    <th>Status</th>
                    <th className={styles.textCenter}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients && patients.length > 0 ? (
                    patients.map((patient, index) => (
                      <tr key={patient._id} className={styles.tableRow}>
                        <td>{(currentPage - 1) * 10 + index + 1}</td>
                        <td className={styles.patientName}>{patient.name}</td>
                        <td className={styles.patientInfo}>{patient.email}</td>
                        <td className={styles.patientInfo}>{patient.phone}</td>
                        <td className={styles.patientInfo}>{patient.disabilityType || "Not specified"}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              patient.appointmentsCompleted ? styles.completed : styles.active
                            }`}
                          >
                            {patient.appointmentsCompleted ? "Completed" : "Active"}
                          </span>
                        </td>
                        <td className={styles.textCenter}>
                          <button
                            onClick={() => handlePatientSelect(patient)}
                            className={styles.appointmentButton}
                            title="Manage Appointments"
                          >
                            <Calendar className={styles.actionIcon} />
                            Appointments
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className={styles.noData}>
                        No assigned patients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.paginationContainer}>
            <span className={styles.paginationInfo}>
              Showing {patients.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{" "}
              {Math.min(currentPage * 10, patients.length)} of {patients.length} patients
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
        </div>
      </div>
    </div>
  )
}
