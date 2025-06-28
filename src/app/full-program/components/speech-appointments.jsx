"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Clock, Check, X, User, CalendarDays } from "lucide-react"
import { useRouter } from "next/navigation"
import { useContentStore } from "../store/content-store"
import styles from "../styles/speech-appointments.module.css"

export function SpeechAppointments() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()
  const setActiveContent = useContentStore((state) => state.setActiveContent)

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
          completed: false,
          createdAt: "2024-01-30",
        },
        {
          _id: "app2",
          date: "2024-02-22",
          time: "14:30",
          status: "scheduled",
          completed: false,
          createdAt: "2024-01-30",
        },
        {
          _id: "app3",
          date: "2024-03-01",
          time: "09:15",
          status: "completed",
          completed: true,
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
  }

  const handleBackToList = () => {
    setSelectedPatient(null)
    setAppointments([])
  }

  const handleAppointmentClick = (appointmentId) => {
    setActiveContent({
      department: "speech",
      type: "appointment-completion",
      appointmentId: appointmentId,
    })
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
          </div>

          <div className={styles.appointmentBody}>
            <div className={styles.appointmentsListSection}>
              <h3 className={styles.sectionTitle}>Patient Appointments ({appointments.length})</h3>
              {appointments.length > 0 ? (
                <div className={styles.appointmentsList}>
                  {appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className={`${styles.appointmentItem} ${styles.clickable}`}
                      onClick={() => handleAppointmentClick(appointment._id)}
                    >
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
                          <span
                            className={`${styles.statusBadge} ${appointment.completed ? styles.completed : styles.scheduled}`}
                          >
                            {appointment.completed ? "Completed" : "Scheduled"}
                          </span>
                        </div>
                      </div>
                      <div className={styles.appointmentActions}>
                        <span className={styles.clickHint}>Click to {appointment.completed ? "view" : "complete"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyAppointments}>
                  <Calendar className={styles.emptyIcon} />
                  <p>No appointments found for this patient</p>
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
                            title="View Appointments"
                          >
                            <Calendar className={styles.actionIcon} />
                            View Appointments
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
