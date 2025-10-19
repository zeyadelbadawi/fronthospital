"use client"

import React, { useState, useEffect } from "react"
import axiosInstance from "@/helper/axiosSetup"
import { convertUTCTo12Hour } from "@/helper/DateTime"
import Loader from "@/components/Loader"
import styles from "@/styles/appointment-detail.module.css"
import { Users, CalendarCheck, Plus, Trash2, Timer, Calendar, FileText } from "lucide-react"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"
import PatientAssignmentWarningModal from "@/components/PatientAssignmentWarningModal"
import toastStyles from "@/styles/toast.module.css" // Import toast styles
import AppointmentAccessControl from "./access-control"

export default function StudentsAppointmentDepartment({ params }) {
  const [studentsByDepartment, setStudentsByDepartment] = useState({})
  const [studentsAppointment, setStudentsAppointment] = useState([])
  const [currentAppointment, setCurrentAppointment] = useState(null)
  const [search, setSearch] = useState("")
  const [currentPage1, setCurrentPage1] = useState(1)
  const [currentPage2, setCurrentPage2] = useState(1)
  const [totalPages1, setTotalPages1] = useState(1)
  const [totalPages2, setTotalPages2] = useState(1)
  const [loading, setLoading] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [conflictDetails, setConflictDetails] = useState(null)
  const [pendingAssignment, setPendingAssignment] = useState(null)

  // Toast state
  const [toastMessage, setToastMessage] = useState({ type: "", message: "", visible: false })

  // Toast function
  const showToast = (type, message) => {
    setToastMessage({ type, message, visible: true })
    setTimeout(() => {
      setToastMessage((prev) => ({ ...prev, visible: false }))
    }, 3000) // Hide after 3 seconds
  }

  const resolvedParams = React.use(params)
  const id = resolvedParams.id

  const ProgramEndpoints = {
    PhysicalTherapy: "physical-therapy-assignments",
    ABA: "ABA-assignments",
    OccupationalTherapy: "Occupational-therapy-assignments",
    SpecialEducation: "Special-Education-assignments",
    Speech: "Speech-assignments",
  }

  const finAppointmentById = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/appointments/findById/${id}`)
      setCurrentAppointment(response?.data?.appointment)
    } catch (error) {
      setLoading(false)
      showToast("error", `Error fetching appointment details: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    finAppointmentById()
  }, [id])

  const fetchStudentsByDepartment = async () => {
    if (!currentAppointment?.department || !currentAppointment?._id || !currentAppointment?.doctor?._id) return
    try {
      setLoading(true)
      // NEW: Use doctor-specific endpoint instead of department-specific
      const response = await axiosInstance.get(
        `/students-appointment/doctor-patients/${currentAppointment.doctor._id}/${currentAppointment.department}/${currentAppointment._id}`,
      )
      setStudentsByDepartment(response.data)
      setTotalPages1(Math.ceil((response?.data?.assignments?.length || 0) / 10))
    } catch (error) {
      setLoading(false)
      showToast("error", `Error fetching doctor's available students: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentsAppointmentDepartment = async () => {
    if (!currentAppointment?.department || !currentAppointment?._id) return
    try {
      setLoading(true)
      const response = await axiosInstance.get(
        `/students-appointment/${currentAppointment.department}/${currentAppointment._id}`,
      )
      setStudentsAppointment(response?.data?.studentsAppointment || [])
      setTotalPages2(Math.ceil((response?.data?.studentsAppointment?.length || 0) / 10))
    } catch (error) {
      setLoading(false)
      showToast("error", `Error fetching appointed students: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentAppointment !== null && currentAppointment?.doctor?._id) {
      fetchStudentsByDepartment()
      fetchStudentsAppointmentDepartment()
    }
  }, [currentAppointment]) // The dependency remains the same, but now we check for doctor._id in the condition

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage1(1)
    setCurrentPage2(1)
  }

  const onAddStudent = async (addedData) => {
    try {
      setButtonLoading(true)
      const response = await axiosInstance.post(`/students-appointment/`, addedData)
      if (response.status === 201) {
        showToast("success", "Student added to appointment successfully!")
      }
    } catch (error) {
      setButtonLoading(false)

      // Check if it's a conflict error (status 409)
      if (error.response?.status === 409 && error.response?.data?.conflictDetails) {
        const conflictData = error.response.data.conflictDetails
        setConflictDetails(conflictData)
        setPendingAssignment(addedData)
        setShowWarningModal(true)
        return // Don't show alert, show modal instead
      }

      showToast("error", `Error adding student to appointment: ${error.response?.data?.error || error.message}`)
    } finally {
      setButtonLoading(false)
      fetchStudentsByDepartment()
      fetchStudentsAppointmentDepartment()
    }
  }

  const onDeleteStudent = async (studentAppointmentId) => {
    try {
      setButtonLoading(true)
      const response = await axiosInstance.delete(`/students-appointment/${studentAppointmentId}`)
      showToast("success", "Student removed from appointment successfully!")
    } catch (error) {
      setButtonLoading(false)
      showToast("error", `Error removing student from appointment: ${error.response?.data?.error || error.message}`)
    } finally {
      setButtonLoading(false)
      fetchStudentsByDepartment()
      fetchStudentsAppointmentDepartment()
    }
  }

  const handleWarningModalClose = () => {
    setShowWarningModal(false)
    setConflictDetails(null)
    setPendingAssignment(null)
  }

  const handleProceedWithAssignment = async () => {
    if (!pendingAssignment) return

    try {
      setButtonLoading(true)
      // Add forceAssign flag to proceed with the assignment
      const response = await axiosInstance.post(`/students-appointment/`, {
        ...pendingAssignment,
        forceAssign: true,
      })

      if (response.status === 201) {
        showToast("success", "Student assigned to appointment (forced) successfully!")
      }
    } catch (error) {
      showToast("error", `Error assigning student to appointment: ${error.response?.data?.error || error.message}`)
    } finally {
      setButtonLoading(false)
      setShowWarningModal(false)
      setConflictDetails(null)
      setPendingAssignment(null)
      fetchStudentsByDepartment()
      fetchStudentsAppointmentDepartment()
    }
  }

  const filteredStudentsByDepartment =
    studentsByDepartment.assignments?.filter((student) =>
      student.patient.name.toLowerCase().includes(search.toLowerCase()),
    ) || []

  const filteredStudentsAppointment =
    studentsAppointment.filter((student) => student.patientId.name.toLowerCase().includes(search.toLowerCase())) || []

  const startIndex1 = (currentPage1 - 1) * 10
  const endIndex1 = startIndex1 + 10
  const paginatedStudentsByDepartment = filteredStudentsByDepartment.slice(startIndex1, endIndex1)

  const startIndex2 = (currentPage2 - 1) * 10
  const endIndex2 = startIndex2 + 10
  const paginatedStudentsAppointment = filteredStudentsAppointment.slice(startIndex2, endIndex2)

  return (
    <AppointmentAccessControl>
      {loading ? (
        <div className={styles.appointmentDetailContainer}>
          <Loader text="Loading appointment details..." />
        </div>
      ) : (
        <>
          {/* Toast Notification */}
          {toastMessage.visible && (
            <div className={`${toastStyles.toast} ${toastStyles[toastMessage.type]}`}>{toastMessage.message}</div>
          )}

          {/* MasterLayout */}
          <MasterLayout>
            {/* Breadcrumb */}
            <Breadcrumb heading="Students Appointment Management" title="Students Appointment Management" />
            <div className={styles.appointmentDetailContainer}>
              {/* Header Section */}
              <div className={styles.headerSection}>
                <div className={styles.headerContent}>
                  <div className={styles.titleSection}>
                    <h1 className={styles.pageTitle}>Students Appointment Management</h1>
                    <div className={styles.appointmentInfoCard}>
                      <div className={styles.appointmentInfoContent}>
                        <p className={styles.pageSubTitle}>Appointment Details:</p>

                        <div className={styles.infoItem}>
                          <Users className={`${styles.headerIconSvg} ${styles.ziadIconSvg}`} />
                          <span className={styles.infoTextMuted}>
                            <span className={styles.ziad}>Doctor Name:</span> {currentAppointment?.doctor?.username}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <Calendar className={`${styles.headerIconSvg} ${styles.ziadIconSvg}`} />
                          <span className={styles.infoTextMuted}>
                            <span className={styles.ziad}>Appointment Day: </span> {currentAppointment?.day}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <FileText className={`${styles.headerIconSvg} ${styles.ziadIconSvg}`} />
                          <span className={styles.infoTextMuted}>
                            <span className={styles.ziad}>Department: </span> {currentAppointment?.department}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <Timer className={`${styles.headerIconSvg} ${styles.ziadIconSvg}`} />
                          <span className={styles.infoTextMuted}>
                            {" "}
                            <span className={styles.ziad}>Appointment time: </span>{" "}
                            {` From ${convertUTCTo12Hour(currentAppointment?.start_time)} To ${convertUTCTo12Hour(
                              currentAppointment?.end_time,
                            )}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className={styles.mainContent}>
                {/* Available Students Table */}
                <div className={styles.studentCard}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.headerIcon} ${styles.primaryIcon}`}>
                      <Users className={`${styles.headerIconSvg} ${styles.primaryIconSvg}`} />
                    </div>
                    <div className={styles.headerText}>
                      <h5 className={styles.cardTitle}>Available Students</h5>
                      <p className={styles.cardSubtitle}>
                        Dr. {currentAppointment?.doctor?.username}'s Students in {currentAppointment?.department}
                      </p>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.tableContainer}>
                      <table className={styles.studentsTable}>
                        <thead className={styles.tableHeader}>
                          <tr>
                            <th className={styles.centerHeader}>#</th>
                            <th>Student Name</th>
                            <th className={styles.centerHeader}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={3} className={styles.loadingRow}>
                                <div className={styles.loadingContent}>
                                  <div className={styles.loadingSpinner}></div>
                                  <span className={styles.loadingText}>Loading...</span>
                                </div>
                              </td>
                            </tr>
                          ) : paginatedStudentsByDepartment.length === 0 ? (
                            <tr>
                              <td colSpan={3} className={styles.emptyRow}>
                                No available students found.
                              </td>
                            </tr>
                          ) : (
                            paginatedStudentsByDepartment.map((student, index) => (
                              <tr key={student.patient._id} className={styles.tableRow}>
                                <td className={styles.indexCell}>{startIndex1 + index + 1}</td>
                                <td className={styles.studentCell}>
                                  <div className={styles.studentInfo}>
                                    <div className={`${styles.studentAvatar} ${styles.primaryAvatar}`}>
                                      <span className={`${styles.avatarText} ${styles.primaryAvatarText}`}>
                                        {student.patient.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <span className={styles.studentName}>{student.patient.name}</span>
                                  </div>
                                </td>
                                <td className={styles.actionCell}>
                                  <button
                                    type="button"
                                    className={`${styles.actionButton} ${styles.addButton}`}
                                    onClick={() =>
                                      onAddStudent({
                                        department: currentAppointment.department,
                                        appointmentId: id,
                                        patientId: student.patient._id,
                                      })
                                    }
                                    disabled={buttonLoading}
                                  >
                                    {buttonLoading ? (
                                      <div className={styles.loadingSpinner}></div>
                                    ) : (
                                      <Plus className={styles.actionIcon} />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className={styles.paginationContainer}>
                      <small className={styles.paginationInfo}>
                        Showing {startIndex1 + 1} to {Math.min(endIndex1, filteredStudentsByDepartment.length)} of{" "}
                        {filteredStudentsByDepartment.length} entries
                      </small>
                      <div className={styles.paginationList}>
                        {Array.from({ length: totalPages1 }, (_, i) => (
                          <button
                            key={i}
                            className={`${styles.paginationButton} ${currentPage1 === i + 1 ? styles.paginationActive : ""}`}
                            onClick={() => setCurrentPage1(i + 1)}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointed Students Table */}
                <div className={styles.studentCard}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.headerIcon} ${styles.successIcon}`}>
                      <CalendarCheck className={`${styles.headerIconSvg} ${styles.successIconSvg}`} />
                    </div>
                    <div className={styles.headerText}>
                      <h5 className={styles.cardTitle}>Appointed Students</h5>
                      <p className={styles.cardSubtitle}>
                        Students with appointments in {currentAppointment?.department}
                      </p>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.tableContainer}>
                      <table className={styles.studentsTable}>
                        <thead className={styles.tableHeader}>
                          <tr>
                            <th className={styles.centerHeader}>#</th>
                            <th>Student Name</th>
                            <th className={styles.centerHeader}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={3} className={styles.loadingRow}>
                                <div className={styles.loadingContent}>
                                  <div className={`${styles.loadingSpinner} ${styles.loadingSpinnerSuccess}`}></div>
                                  <span className={styles.loadingText}>Loading...</span>
                                </div>
                              </td>
                            </tr>
                          ) : paginatedStudentsAppointment.length === 0 ? (
                            <tr>
                              <td colSpan={3} className={styles.emptyRow}>
                                No appointed students found.
                              </td>
                            </tr>
                          ) : (
                            paginatedStudentsAppointment.map((student, index) => (
                              <tr key={student._id} className={styles.tableRow}>
                                <td className={styles.indexCell}>{startIndex2 + index + 1}</td>
                                <td className={styles.studentCell}>
                                  <div className={styles.studentInfo}>
                                    <div className={`${styles.studentAvatar} ${styles.successAvatar}`}>
                                      <span className={`${styles.avatarText} ${styles.successAvatarText}`}>
                                        {student.patientId.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <span className={styles.studentName}>{student.patientId.name}</span>
                                  </div>
                                </td>
                                <td className={styles.actionCell}>
                                  <button
                                    type="button"
                                    className={`${styles.actionButton} ${styles.removeButton}`}
                                    onClick={() => onDeleteStudent(student._id)}
                                    disabled={buttonLoading}
                                  >
                                    {buttonLoading ? (
                                      <div className={styles.loadingSpinner}></div>
                                    ) : (
                                      <Trash2 className={styles.actionIcon} />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className={styles.paginationContainer}>
                      <small className={styles.paginationInfo}>
                        Showing {startIndex2 + 1} to {Math.min(endIndex2, filteredStudentsAppointment.length)} of{" "}
                        {filteredStudentsAppointment.length} entries
                      </small>
                      <div className={styles.paginationList}>
                        {Array.from({ length: totalPages2 }, (_, i) => (
                          <button
                            key={i}
                            className={`${styles.paginationButton} ${currentPage2 === i + 1 ? styles.paginationActive : ""}`}
                            onClick={() => setCurrentPage2(i + 1)}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Warning Modal - Updated to handle multiple appointments */}
            <PatientAssignmentWarningModal
              show={showWarningModal}
              onClose={handleWarningModalClose}
              onProceed={handleProceedWithAssignment}
              patientName={
                pendingAssignment
                  ? paginatedStudentsByDepartment.find((s) => s.patient._id === pendingAssignment.patientId)?.patient
                      ?.name || "Unknown Student"
                  : ""
              }
              existingAppointments={conflictDetails?.existingAppointments || []}
              totalConflicts={conflictDetails?.totalConflicts || 0}
            />
          </MasterLayout>
        </>
      )}
    </AppointmentAccessControl>
  )
}
