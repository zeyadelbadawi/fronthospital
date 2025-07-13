"use client"
import { useState, useEffect } from "react"
import { UserPlus, AlertCircle, Users, UserCheck, RefreshCw, Save, Calendar, Eye } from "lucide-react"
import AccessControl from "./access-control"
import styles from "../styles/admin-assign.module.css" // Import the new CSS module
import axiosInstance from "@/helper/axiosSetup"

const AdminAssignSpeech = () => {
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [subscriptionEndDate, setSubscriptionEndDate] = useState("")
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [stats, setStats] = useState({
    totalPatients: 0,
    assignedPatients: 0,
    unassignedPatients: 0,
    totalDoctors: 0,
    expiredAssignments: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch Speech patients from PatientSpeechAssignment collection
      console.log("Fetching Speech patients from PatientSpeechAssignment...")
      let patientsResponse
      try {
        patientsResponse = await axiosInstance.get("/speech/patient-assignments", {
          params: { page: 1, search: "" },
        })
        console.log("speech patients response:", patientsResponse.data)
      } catch (error) {
        console.error("speech patients fetch failed:", error)
        setMessage("Failed to fetch speech patients: " + (error.response?.data?.message || error.message))
        patientsResponse = { data: { assignments: [], patients: [] } }
      }

      // Fetch doctors in speech department
      console.log("Fetching speech doctors...")
      let doctorsResponse
      try {
        doctorsResponse = await axiosInstance.get("/doctor-student-assignment/doctors-by-department/speech")
        console.log("speech doctors response:", doctorsResponse.data)
      } catch (error) {
        console.error("Doctors fetch failed:", error)
        setMessage("Failed to fetch doctors: " + (error.response?.data?.message || error.message))
        doctorsResponse = { data: { doctors: [] } }
      }

      // Fetch current doctor-student assignments for speech department
      console.log("Fetching speech doctor-student assignments...")
      let assignmentsResponse
      try {
        assignmentsResponse = await axiosInstance.get("/doctor-student-assignment/all-assignments", {
          params: { department: "speech", page: 1, limit: 100 },
        })
        console.log("speech assignments response:", assignmentsResponse.data)
      } catch (error) {
        console.error("Assignments fetch failed:", error)
        setMessage("Failed to fetch assignments: " + (error.response?.data?.message || error.message))
        assignmentsResponse = { data: { assignments: [] } }
      }

      console.log("All responses received:", {
        patients: patientsResponse.data,
        doctors: doctorsResponse.data,
        assignments: assignmentsResponse.data,
      })

      // Set the data - patients from PatientSpeechAssignment
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



      if (doctorsData.length === 0) {
        setMessage(
          "No doctors found in speech department. Please ensure doctors are properly assigned to the speech department.",
        )
      }

      if (patientsData.length === 0) {
        setMessage(
          "No patients found in speech assignments. Please ensure patients are assigned to the speech department first.",
        )
      }
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

  // Add function to get unassigned patients
  const getUnassignedPatients = () => {
    return patients.filter((patientAssignment) => {
      const patient = patientAssignment.patient || patientAssignment.patientId
      const patientId = patient?._id
      const doctorAssignment = getAssignmentForPatient(patientId)
      return !doctorAssignment // Only return patients without doctor assignments
    })
  }

  const handleAssignStudent = async (e) => {
    e.preventDefault()

    // Reset errors
    setFormErrors({})

    // Validation
    const errors = {}

    if (!selectedPatient) {
      errors.patient = "Please select a patient"
    }

    if (!selectedDoctor) {
      errors.doctor = "Please select a doctor"
    }

    if (subscriptionEndDate && new Date(subscriptionEndDate) <= new Date()) {
      errors.subscriptionEndDate = "Subscription end date must be in the future"
    }

    // Check if patient is already assigned
    const existingAssignment = getAssignmentForPatient(selectedPatient)
    if (existingAssignment) {
      errors.patient = "This patient is already assigned to a doctor"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setMessage("Please fix the validation errors below")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await axiosInstance.post("/doctor-student-assignment/assign-student-to-doctor", {
        doctor: selectedDoctor,
        patient: selectedPatient,
        department: "speech",
        subscriptionEndDate: subscriptionEndDate || null,
        notes: notes,
      })

      setMessage("Student assigned successfully!")
      setSelectedPatient("")
      setSelectedDoctor("")
      setSubscriptionEndDate("")
      setNotes("")
      setFormErrors({})

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error("Error assigning student:", error)
      setMessage("Error assigning student: " + (error.response?.data?.message || error.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSubscriptionExpired = (endDate) => {
    if (!endDate) return false
    return new Date(endDate) < new Date()
  }

  if (loading && patients.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading speech assignments...</p>
      </div>
    )
  }

  return (
    <AccessControl allowedRoles={["admin"]}>
      <div className={styles.adminContainer}>
        {/* Main Header Card with Stats and Assignment Form */}
        <div className={styles.adminCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <h2 className={styles.pageTitle}>
                  <UserPlus className={styles.titleIcon} />
                  speech Department - Admin Assignment
                </h2>
                <p className={styles.pageSubtitle}>Assign speech students to doctors and manage subscriptions</p>
              </div>
              <div className={styles.headerActions}>
                <button
                  onClick={fetchData}
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
                <div className={styles.statNumber}>{stats.totalPatients}</div>
                <div className={styles.statLabel}>Total speech Patients</div>
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

          {/* Assignment Form - Integrated in the same card */}
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
                <UserPlus size={24} style={{ color: "#3b82f6" }} />
                Assign Speech Student to Doctor
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

            <form onSubmit={handleAssignStudent} className={styles.editForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Users size={16} style={{ marginRight: "0.5rem", display: "inline" }} />
                    Select Speech Patient *
                  </label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => {
                      setSelectedPatient(e.target.value)
                      if (formErrors.patient) {
                        setFormErrors((prev) => ({ ...prev, patient: null }))
                      }
                    }}
                    className={`${styles.formSelect} ${formErrors.patient ? "border-red-500" : ""}`}
                    required
                  >
                    <option value="">Choose an unassigned Speech patient...</option>
                    {getUnassignedPatients().map((assignment) => (
                      <option key={assignment._id} value={assignment.patient?._id || assignment.patientId?._id}>
                        {assignment.patient?.name || assignment.patientId?.name} -{" "}
                        {assignment.patient?.email || assignment.patientId?.email}
                      </option>
                    ))}
                  </select>
                  {formErrors.patient && (
                    <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.25rem", fontWeight: "500" }}>
                      {formErrors.patient}
                    </p>
                  )}
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", fontWeight: "500" }}>
                    📊 Unassigned Speech patients: {getUnassignedPatients().length} / {patients.length}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <UserCheck size={16} style={{ marginRight: "0.5rem", display: "inline" }} />
                    Select Speech Doctor *
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => {
                      setSelectedDoctor(e.target.value)
                      if (formErrors.doctor) {
                        setFormErrors((prev) => ({ ...prev, doctor: null }))
                      }
                    }}
                    className={`${styles.formSelect} ${formErrors.doctor ? "border-red-500" : ""}`}
                    required
                  >
                    <option value="">Choose an Speech doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name || doctor.username} - {doctor.email}
                      </option>
                    ))}
                  </select>
                  {formErrors.doctor && (
                    <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.25rem", fontWeight: "500" }}>
                      {formErrors.doctor}
                    </p>
                  )}
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", fontWeight: "500" }}>
                    👨‍⚕️ Available Speech doctors: {doctors.length}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Calendar size={16} style={{ marginRight: "0.5rem", display: "inline" }} />
                    Subscription End Date
                  </label>
                  <input
                    type="date"
                    value={subscriptionEndDate}
                    onChange={(e) => {
                      setSubscriptionEndDate(e.target.value)
                      if (formErrors.subscriptionEndDate) {
                        setFormErrors((prev) => ({ ...prev, subscriptionEndDate: null }))
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    className={`${styles.formInput} ${formErrors.subscriptionEndDate ? "border-red-500" : ""}`}
                  />
                  {formErrors.subscriptionEndDate && (
                    <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.25rem", fontWeight: "500" }}>
                      {formErrors.subscriptionEndDate}
                    </p>
                  )}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>
                    <Eye size={16} style={{ marginRight: "0.5rem", display: "inline" }} />
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={styles.formTextarea}
                    rows="4"
                    placeholder="Add any notes about this assignment..."
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "2rem",
                  paddingTop: "1.5rem",
                  borderTop: "2px solid #e5e7eb",
                }}
              >
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedPatient || !selectedDoctor}
                  className={styles.saveButton}
                  style={{
                    fontSize: "1rem",
                    padding: "0.875rem 2rem",
                    minWidth: "200px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Save className={styles.buttonIcon} />
                  {isSubmitting ? "Assigning..." : "Assign Speech Student to Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AccessControl>
  )
}

export default AdminAssignSpeech
