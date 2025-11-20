"use client"
import { useState, useEffect, Suspense } from "react"
import { UserPlus, AlertCircle, Users, UserCheck, RefreshCw, Save, Eye } from "lucide-react"
import dynamic from "next/dynamic"
import AccessControl from "./access-control"
import styles from "../styles/admin-assign.module.css"
import axiosInstance from "@/helper/axiosSetup"

const Select = dynamic(() => import("react-select"), {
  ssr: false,
  loading: () => <div className={styles.loadingSpinner}></div>,
})

// Department configuration
const DEPARTMENT_CONFIG = {
  aba: {
    name: "ABA",
    displayName: "ABA",
    endpoint: "aba",
    doctorEndpoint: "ABA",
  },
  speech: {
    name: "Speech",
    displayName: "Speech",
    endpoint: "speech",
    doctorEndpoint: "speech",
  },
  physicalTherapy: {
    name: "Physical Therapy",
    displayName: "Physical Therapy",
    endpoint: "physicalTherapy",
    doctorEndpoint: "physicalTherapy",
  },
  Psychotherapy: {
    name: "Psychotherapy",
    displayName: "Psychotherapy",
    endpoint: "Psychotherapy",
    doctorEndpoint: "Psychotherapy",
  },
  OccupationalTherapy: {
    name: "Occupational Therapy",
    displayName: "Occupational Therapy",
    endpoint: "OccupationalTherapy",
    doctorEndpoint: "OccupationalTherapy",
  },
  SpecialEducation: {
    name: "Special Education",
    displayName: "Special Education",
    endpoint: "SpecialEducation",
    doctorEndpoint: "SpecialEducation",
  },
}

const GenericAdminAssign = ({ department = "aba" }) => {
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [stats, setStats] = useState({
    totalPatients: 0,
    assignedPatients: 0,
    unassignedPatients: 0,
    totalDoctors: 0,
  })

  const config = DEPARTMENT_CONFIG[department]

  useEffect(() => {
    fetchData()
  }, [department])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch patients from department assignment collection
      let patientsResponse
      try {
        patientsResponse = await axiosInstance.get(`/${config.endpoint}/patient-assignments`, {
          params: { page: 1, search: "" },
        })
      } catch (error) {
        console.error(`${config.name} Students fetch failed:`, error)
        setMessage(`Failed to fetch ${config.name} Students: ` + (error.response?.data?.message || error.message))
        patientsResponse = { data: { assignments: [], patients: [] } }
      }

      // Fetch doctors in department
      let doctorsResponse
      try {
        doctorsResponse = await axiosInstance.get(
          `/doctor-student-assignment/doctors-by-department/${config.doctorEndpoint}`,
        )
      } catch (error) {
        console.error("Doctors fetch failed:", error)
        setMessage("Failed to fetch doctors: " + (error.response?.data?.message || error.message))
        doctorsResponse = { data: { doctors: [] } }
      }

      // Fetch current doctor-student assignments for department
      let assignmentsResponse
      try {
        assignmentsResponse = await axiosInstance.get("/doctor-student-assignment/all-assignments", {
          params: { department: config.doctorEndpoint, page: 1, limit: 100 },
        })
      } catch (error) {
        console.error("Assignments fetch failed:", error)
        setMessage("Failed to fetch assignments: " + (error.response?.data?.message || error.message))
        assignmentsResponse = { data: { assignments: [] } }
      }

      // Set the data
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

      setStats({
        totalPatients,
        assignedPatients,
        unassignedPatients,
        totalDoctors,
      })

      if (doctorsData.length === 0) {
        setMessage(
          `No doctors found in ${config.displayName} department. Please ensure doctors are properly assigned to the ${config.displayName} department.`,
        )
      }

      if (patientsData.length === 0) {
        setMessage(
          `No Students found in ${config.displayName} assignments. Please ensure Students are assigned to the ${config.displayName} department first.`,
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

  const getUnassignedPatients = () => {
    return patients.filter((patientAssignment) => {
      const patient = patientAssignment.patient || patientAssignment.patientId
      const patientId = patient?._id
      const doctorAssignment = getAssignmentForPatient(patientId)
      return !doctorAssignment
    })
  }

  const handleAssignStudent = async (e) => {
    e.preventDefault()

    setFormErrors({})

    const errors = {}

    if (!selectedPatient) {
      errors.patient = "Please select a Student"
    }

    if (!selectedDoctor) {
      errors.doctor = "Please select a doctor"
    }

    const existingAssignment = getAssignmentForPatient(selectedPatient)
    if (existingAssignment) {
      errors.patient = "This Student is already assigned to a doctor"
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
        department: config.doctorEndpoint,
        notes: notes,
      })

      setMessage("Student assigned successfully!")
      setSelectedPatient("")
      setSelectedDoctor("")
      setNotes("")
      setFormErrors({})

      await fetchData()
    } catch (error) {
      console.error("Error assigning student:", error)
      setMessage("Error assigning student: " + (error.response?.data?.message || error.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: `2px solid ${state.isFocused ? "#3b82f6" : "#e2e8f0"}`,
      borderRadius: "12px",
      padding: "0.5rem 0.75rem",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      boxShadow: state.isFocused ? "0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15)" : "none",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: state.isFocused ? "translateY(-1px)" : "translateY(0)",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "12px",
      border: "1px solid rgba(59, 130, 246, 0.2)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      zIndex: 9999,
      overflow: "hidden",
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "0.5rem",
      maxHeight: "250px",
    }),
    option: (provided, state) => ({
      ...provided,
      borderRadius: "8px",
      margin: "0.25rem 0",
      padding: "0.75rem 1rem",
      backgroundColor: state.isSelected
        ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
        : state.isFocused
          ? "rgba(59, 130, 246, 0.1)"
          : "transparent",
      color: state.isSelected ? "white" : "#374151",
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: state.isSelected
          ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
          : "rgba(59, 130, 246, 0.15)",
        transform: "translateX(4px)",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
      fontStyle: "italic",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#1f2937",
      fontWeight: "500",
    }),
  }

  const patientOptions = getUnassignedPatients().map((assignment) => ({
    value: assignment.patient?._id || assignment.patientId?._id,
    label: `${assignment.patient?.name || assignment.patientId?.name} - ${assignment.patient?.email || assignment.patientId?.email}`,
  }))

  const doctorOptions = doctors.map((doctor) => ({
    value: doctor._id,
    label: `Dr. ${doctor.name || doctor.username} - ${doctor.email}`,
  }))

  return (
    <AccessControl allowedRoles={["admin"]}>
      <div className={styles.adminContainer}>
        <div className={styles.adminCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <h2 className={styles.pageTitle}>
                  <UserPlus className={styles.titleIcon} />
                  {config.displayName} Department - Admin Assignment
                </h2>
                <p className={styles.pageSubtitle}>Assign {config.displayName} students to doctors</p>
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

            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.totalPatients}</div>
                <div className={styles.statLabel}>Total {config.displayName} Students</div>
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
                Assign {config.displayName} Student to Doctor
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
                    Select {config.displayName} Student *
                  </label>
                  <Suspense fallback={<div className={styles.loadingSpinner}></div>}>
                    <Select
                      value={patientOptions.find((option) => option.value === selectedPatient)}
                      onChange={(selectedOption) => {
                        setSelectedPatient(selectedOption?.value || "")
                        if (formErrors.patient) {
                          setFormErrors((prev) => ({ ...prev, patient: null }))
                        }
                      }}
                      options={patientOptions}
                      placeholder={`Choose an unassigned ${config.displayName} patient...`}
                      styles={customSelectStyles}
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      menuPosition="fixed"
                      isClearable
                    />
                  </Suspense>
                  {formErrors.patient && (
                    <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.25rem", fontWeight: "500" }}>
                      {formErrors.patient}
                    </p>
                  )}
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", fontWeight: "500" }}>
                    📊 Unassigned {config.displayName} patients: {getUnassignedPatients().length} / {patients.length}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <UserCheck size={16} style={{ marginRight: "0.5rem", display: "inline" }} />
                    Select {config.displayName} Doctor *
                  </label>
                  <Suspense fallback={<div className={styles.loadingSpinner}></div>}>
                    <Select
                      value={doctorOptions.find((option) => option.value === selectedDoctor)}
                      onChange={(selectedOption) => {
                        setSelectedDoctor(selectedOption?.value || "")
                        if (formErrors.doctor) {
                          setFormErrors((prev) => ({ ...prev, doctor: null }))
                        }
                      }}
                      options={doctorOptions}
                      placeholder={`Choose a ${config.displayName} doctor...`}
                      styles={customSelectStyles}
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      menuPosition="fixed"
                      isClearable
                    />
                  </Suspense>
                  {formErrors.doctor && (
                    <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.25rem", fontWeight: "500" }}>
                      {formErrors.doctor}
                    </p>
                  )}
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", fontWeight: "500" }}>
                    👨‍⚕️ Available {config.displayName} doctors: {doctors.length}
                  </p>
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
                  {isSubmitting ? "Assigning..." : `Assign ${config.displayName} Student to Doctor`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AccessControl>
  )
}

// Export individual components for backward compatibility
export const AdminAssignABA = (props) => <GenericAdminAssign department="aba" {...props} />
export const AdminAssignSpeech = (props) => <GenericAdminAssign department="speech" {...props} />
export const AdminAssignPhysicalTherapy = (props) => <GenericAdminAssign department="physicalTherapy" {...props} />
export const AdminAssignPsychotherapy = (props) => <GenericAdminAssign department="Psychotherapy" {...props} />
export const AdminAssignOccupationalTherapy = (props) => (
  <GenericAdminAssign department="OccupationalTherapy" {...props} />
)
export const AdminAssignSpecialEducation = (props) => <GenericAdminAssign department="SpecialEducation" {...props} />

export default GenericAdminAssign
