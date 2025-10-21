"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Calendar, User, Users, Activity, ChevronDown, Check, Loader, X, AlertCircle } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import { sendNotification } from "@/helper/notification-helper"
import { useToast } from "./toast"
import { LoadingOverlay } from "./loading-overlay"
import styles from "../styles/school-appointments-assignment.module.css"

export function SchoolAppointmentsAssignment() {
  // State management
  const [schoolPrograms, setSchoolPrograms] = useState([])
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [assigningAppointmentId, setAssigningAppointmentId] = useState(null)
  const [expandedProgramId, setExpandedProgramId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState(null)
  const [programInfo, setProgramInfo] = useState(null)

  const { showToast, ToastContainer } = useToast()

  // Fetch all doctors
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/doctors-for-assignment`,
      )
      setDoctors(response.data.doctors || [])
    } catch (error) {
      console.error("Error fetching doctors:", error)
      showToast("Failed to load doctors list", "error")
    }
  }, [showToast])

  // Fetch school programs with appointments
  const fetchSchoolPrograms = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs-optimized`,
        {
          params: {
            page: currentPage,
            search: search,
            limit: 100,
          },
        },
      )

      const programs = response.data.programs || []
      const paidPrograms = programs.filter((program) => program.paymentStatus === "FULLY_PAID")

      // Fetch appointments for each program
      const programsWithAppointments = await Promise.all(
        paidPrograms.map(async (program) => {
          try {
            const appointmentsResponse = await axiosInstance.get(
              `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs-with-appointments/${program.unicValue}`,
            )
            return {
              ...program,
              appointments: appointmentsResponse.data.appointments || [],
            }
          } catch (error) {
            console.error(`Error fetching appointments for ${program.unicValue}:`, error)
            return {
              ...program,
              appointments: [],
            }
          }
        }),
      )

      setSchoolPrograms(programsWithAppointments)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching school programs:", error)
      showToast("Failed to load school programs", "error")
      setSchoolPrograms([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, showToast])

  // Initial effects
  useEffect(() => {
    fetchDoctors()
    fetchSchoolPrograms()
  }, [])

  useEffect(() => {
    if (currentPage || search) {
      fetchSchoolPrograms()
    }
  }, [currentPage, search])

  const openAssignmentModal = useCallback((appointment, program) => {
    setSelectedAppointment(appointment)
    setSelectedDoctorId(appointment.assignedDoctor?._id || null)
    setProgramInfo(program)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setSelectedAppointment(null)
    setSelectedDoctorId(null)
    setProgramInfo(null)
  }, [])

  const handleAssignDoctor = useCallback(async () => {
    if (!selectedAppointment || !selectedDoctorId) {
      showToast("Please select a doctor", "error")
      return
    }

    setSaving(true)
    setAssigningAppointmentId(selectedAppointment._id)
    try {
      const response = await axiosInstance.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/${selectedAppointment._id}/assign-doctor`,
        { doctorId: selectedDoctorId },
      )

      if (response.status === 200) {
        // Update local state
        setSchoolPrograms((prev) =>
          prev.map((program) => ({
            ...program,
            appointments: program.appointments.map((apt) =>
              apt._id === selectedAppointment._id
                ? {
                    ...apt,
                    assignedDoctor: response.data.appointment.assignedDoctor,
                  }
                : apt,
            ),
          })),
        )

        const appointmentIndex = programInfo.appointments.findIndex((apt) => apt._id === selectedAppointment._id) + 1
        const { date, time } = formatDateTime(selectedAppointment.date)
        const studentName = programInfo.patientName || "Unknown Student"
        const programName = programInfo.programName || "School Evaluation"

        try {
          await sendNotification({
            receiverId: selectedDoctorId,
            rule: "Doctor",
            title: "New School Appointment Assignment",
            titleAr: "تعيين موعد جديد للتقييم المدرسي",
            message: `You have been assigned to Session #${appointmentIndex} of "${programName}" for student "${studentName}" on ${date} at ${time}`,
            messageAr: `تم تعيينك للجلسة #${appointmentIndex} من "${programName}" للطالب "${studentName}" في ${date} الساعة ${time}`,
            type: "assignment",
          })
          console.log("[v0] Notification sent to doctor successfully")
        } catch (notificationError) {
          console.error("[v0] Error sending notification:", notificationError)
          // Don't fail the assignment if notification fails
        }

        showToast("Doctor assigned successfully and notified!", "success")
        closeModal()
      }
    } catch (error) {
      console.error("Error assigning doctor:", error)
      const errorMessage = error.response?.data?.message || error.message
      showToast(`Failed to assign doctor: ${errorMessage}`, "error")
    } finally {
      setSaving(false)
      setAssigningAppointmentId(null)
    }
  }, [selectedAppointment, selectedDoctorId, programInfo, showToast, closeModal])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  const getPatientInfo = useCallback((program) => {
    return {
      name: program.patientName || "Unknown Patient",
      email: program.patientEmail || "",
      phone: program.patientPhone || "",
      id: program.patientId || "",
    }
  }, [])

  const formatDateTime = useCallback((isoDateString) => {
    if (!isoDateString) {
      return { date: "N/A", time: "N/A" }
    }
    try {
      const dateObj = new Date(isoDateString)
      if (isNaN(dateObj.getTime())) {
        return { date: "Invalid Date", time: "Invalid Date" }
      }
      return {
        date: dateObj.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: dateObj.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      }
    } catch (error) {
      console.error("Error formatting date/time:", error)
      return { date: "Error Date", time: "Error Time" }
    }
  }, [])

  const getAvailableDoctors = useCallback(() => {
    if (!selectedAppointment) return doctors
    return doctors.filter((doctor) => doctor._id !== selectedAppointment.assignedDoctor?._id)
  }, [doctors, selectedAppointment])

  // Single view - all programs with expandable appointments
  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <Activity style={{ display: "inline", marginRight: "8px", width: "28px", height: "28px" }} />
            Doctor Assignment Management
          </h1>
          <p className={styles.subtitle}>Assign doctors to school evaluation appointments</p>
        </div>

        <form onSubmit={handleSearch} style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  height: "20px",
                  color: "#6b7280",
                }}
              />
              <input
                type="text"
                placeholder="Search by Student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "40px",
                  padding: "12px 15px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1em",
                }}
              />
            </div>
          </div>
        </form>

        {loading ? (
          <div className={styles.loadingMessage}>
            <Loader style={{ animation: "spin 1s linear infinite", marginRight: "8px" }} />
            Loading school programs...
          </div>
        ) : schoolPrograms.length === 0 ? (
          <div className={styles.emptyState}>
            <Users style={{ width: "48px", height: "48px", marginBottom: "16px", color: "#d1d5db" }} />
            <h4>No School Programs Found</h4>
            <p>{search ? `No programs found matching "${search}".` : "No school programs have been created yet."}</p>
          </div>
        ) : (
          <div className={styles.programsList}>
            {schoolPrograms.map((program) => {
              const patientInfo = getPatientInfo(program)
              const isExpanded = expandedProgramId === program.unicValue
              const appointmentCount = program.appointments?.length || 0

              return (
                <div key={program.unicValue} className={styles.programCard}>
                  <div className={styles.programHeader}>
                    <div className={styles.programInfo}>
                      <h3 className={styles.programName}>
                        {patientInfo.name} - {program.programName}
                      </h3>
                      <p className={styles.programEmail}>{patientInfo.email}</p>
                    </div>
                    <button
                      onClick={() => setExpandedProgramId(isExpanded ? null : program.unicValue)}
                      className={`${styles.expandButton} ${isExpanded ? styles.expanded : ""}`}
                    >
                      {appointmentCount} Appointments
                      <ChevronDown style={{ width: "18px", height: "18px" }} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className={styles.appointmentsList}>
                      {program.appointments && program.appointments.length > 0 ? (
                        program.appointments.map((appointment, index) => {
                          const { date, time } = formatDateTime(appointment.date)
                          const assignedDoctor = appointment.assignedDoctor

                          return (
                            <div key={appointment._id} className={styles.appointmentItem}>
                              <div className={styles.appointmentInfo}>
                                <div className={styles.appointmentNumber}>{index + 1}</div>
                                <div className={styles.appointmentDetails}>
                                  <p className={styles.appointmentDate}>
                                    <Calendar
                                      style={{ display: "inline", marginRight: "6px", width: "16px", height: "16px" }}
                                    />
                                    {date} at {time}
                                  </p>
                                  <p className={styles.appointmentDescription}>
                                    <b>Description:</b> {appointment.description}
                                  </p>
                                  {assignedDoctor && (
                                    <p className={styles.assignedDoctorInfo}>
                                      <Check
                                        style={{ display: "inline", marginRight: "4px", width: "14px", height: "14px" }}
                                      />
                                      Assigned to: {assignedDoctor.username || assignedDoctor.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => openAssignmentModal(appointment, program)}
                                disabled={saving && assigningAppointmentId === appointment._id}
                                className={styles.assignButton}
                              >
                                {saving && assigningAppointmentId === appointment._id ? (
                                  <>
                                    <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
                                    Assigning...
                                  </>
                                ) : assignedDoctor ? (
                                  <>
                                    <Check size={16} />
                                    Change Doctor
                                  </>
                                ) : (
                                  <>
                                    <User size={16} />
                                    Assign Doctor
                                  </>
                                )}
                              </button>
                            </div>
                          )
                        })
                      ) : (
                        <div className={styles.emptyMessage}>No appointments found for this program</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "10px 16px",
                backgroundColor: currentPage === 1 ? "#e5e7eb" : "#3b82f6",
                color: currentPage === 1 ? "#9ca3af" : "white",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: page === currentPage ? "#3b82f6" : "#f3f4f6",
                    color: page === currentPage ? "white" : "#1f2937",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: page === currentPage ? "600" : "500",
                  }}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: "10px 16px",
                backgroundColor: currentPage === totalPages ? "#e5e7eb" : "#3b82f6",
                color: currentPage === totalPages ? "#9ca3af" : "white",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {modalOpen && selectedAppointment && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderContent}>
                <h3 className={styles.modalTitle}>Assign Doctor to Appointment</h3>
                <p className={styles.modalSubtitle}>
                  Session #{programInfo?.appointments?.findIndex((apt) => apt._id === selectedAppointment._id) + 1}
                </p>
              </div>
              <button onClick={closeModal} className={styles.closeButton} disabled={saving} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              {/* Appointment Details Card */}
              <div className={styles.detailsCard}>
                <h4 className={styles.detailsCardTitle}>Appointment Details</h4>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      <Calendar size={16} />
                      Date & Time
                    </span>
                    <p className={styles.detailValue}>
                      {formatDateTime(selectedAppointment.date).date} at {formatDateTime(selectedAppointment.date).time}
                    </p>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      <User size={16} />
                      Student Name
                    </span>
                    <p className={styles.detailValue}>{programInfo?.patientName || "Unknown"}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Description</span>
                    <p className={styles.detailValue}>{selectedAppointment.description}</p>
                  </div>
                  {selectedAppointment.assignedDoctor && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        <Check size={16} />
                        Currently Assigned
                      </span>
                      <p className={styles.detailValue}>
                        {selectedAppointment.assignedDoctor.username || selectedAppointment.assignedDoctor.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Doctor Selection */}
              <div className={styles.formSection}>
                <label className={styles.formLabel}>
                  Select Doctor <span className={styles.requiredIndicator}>*</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    value={selectedDoctorId || ""}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    disabled={saving}
                    className={styles.formSelect}
                  >
                    <option value="">-- Select a Doctor --</option>
                    {getAvailableDoctors().map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.displayName || doctor.username} ({doctor.email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} />
                </div>
                {selectedAppointment.assignedDoctor && getAvailableDoctors().length < doctors.length && (
                  <p className={styles.helperText}>
                    <AlertCircle size={14} />
                    The currently assigned doctor is excluded from the list
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <button onClick={closeModal} disabled={saving} className={styles.cancelButton}>
                Cancel
              </button>
              <button
                onClick={handleAssignDoctor}
                disabled={saving || !selectedDoctorId}
                className={styles.confirmButton}
              >
                {saving ? (
                  <>
                    <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Assign Doctor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {saving && <LoadingOverlay message="Assigning doctor..." />}
      <ToastContainer />
    </>
  )
}
