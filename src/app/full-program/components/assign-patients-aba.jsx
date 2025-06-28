"use client"

import { useState, useEffect } from "react"
import { Search, Plus, X, User, Mail, Phone, Brain, Tag } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import { useContentStore } from "../store/content-store"
import styles from "../styles/speech-upcoming-appointments.module.css"

const AssignPatientsToAba = () => {
  const [patients, setPatients] = useState([])
  const [assignedPatients, setAssignedPatients] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()
  const setActiveContent = useContentStore((state) => state.setActiveContent)

  useEffect(() => {
    fetchPatients()
    fetchAssignedPatients()
  }, [currentPage, search])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patients?page=${currentPage}&search=${search}`,
      )
      console.log("Patients response:", response.data)
      setPatients(response.data.patients || [])
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignedPatients = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/aba/ABA-assignments`)
      const assignments = Array.isArray(response.data) ? response.data : response.data.assignments || []
      const patientIds = assignments.map((assignment) =>
        assignment.patient && typeof assignment.patient === "object" ? assignment.patient._id : assignment.patient,
      )
      setAssignedPatients(patientIds)
    } catch (error) {
      console.error("Error fetching assigned patients:", error)
    }
  }

  const handleAssignPatient = async (patientId) => {
    console.log("Assigning patient with ID:", patientId)
    if (!patientId) {
      alert("Invalid patient ID.")
      return
    }
    try {
      await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/aba/assign-to-ABA`, { patientId })
      setAssignedPatients([...assignedPatients, patientId])
      alert("Patient assigned to ABA department successfully!")
    } catch (error) {
      console.error("Error assigning patient:", error)
      alert("Error assigning patient to ABA department")
    }
  }

  const handleUnassignPatient = async (patientId) => {
    try {
      await axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_URL}/aba/unassign-from-ABA/${patientId}`)
      setAssignedPatients(assignedPatients.filter((id) => id !== patientId))
      alert("Patient unassigned from ABA department successfully!")
    } catch (error) {
      console.error("Error unassigning patient:", error)
      alert("Error unassigning patient from ABA department")
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPatients()
  }

  const handleBackToWelcome = () => {
    setActiveContent(null)
  }

  const itemsPerPage = 10
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return (
    <div className={styles.upcomingContainer}>
      <div className={styles.upcomingCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <button onClick={handleBackToWelcome} className={styles.backButton}>
                <X className={styles.backIcon} />
                Back to Welcome
              </button>
              <h2 className={styles.pageTitle}>Assign Patients to ABA Department</h2>
            </div>
            <div className={styles.headerActions}>
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

          <div className={styles.filtersContainer}>
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{patients.length}</span>
                <span className={styles.statLabel}>Total Patients</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{assignedPatients.length}</span>
                <span className={styles.statLabel}>Assigned</span>
              </div>
            </div>
            <button onClick={() => router.push("/physical-therapy/patients")} className={styles.appointmentButton}>
              <Brain className={styles.actionIcon} />
              View ABA Patients
            </button>
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
                        <Mail className={styles.headerIcon} />
                        Email
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Phone className={styles.headerIcon} />
                        Phone
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Tag className={styles.headerIcon} />
                        Disability Type
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Brain className={styles.headerIcon} />
                        Status
                      </div>
                    </th>
                    <th className={styles.textCenter}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients && patients.length > 0 ? (
                    patients.map((patient, index) => (
                      <tr key={patient._id} className={styles.tableRow}>
                        <td className={styles.indexCell}>{startIndex + index + 1}</td>
                        <td className={styles.patientCell}>
                          <div className={styles.patientInfo}>
                            <span className={styles.patientName}>{patient.name}</span>
                            <span className={styles.patientId}>ID: {patient._id?.slice(-8) || "N/A"}</span>
                          </div>
                        </td>
                        <td className={styles.dateCell}>
                          <div className={styles.dateInfo}>
                            <span className={styles.dateValue}>{patient.email}</span>
                          </div>
                        </td>
                        <td className={styles.timeCell}>
                          <span className={styles.timeValue}>{patient.phone}</span>
                        </td>
                        <td className={styles.descriptionCell}>
                          <div className={styles.descriptionText}>{patient.disabilityType || "Not specified"}</div>
                        </td>
                        <td className={styles.typeCell}>
                          <span
                            className={`${styles.typeBadge} ${
                              assignedPatients.includes(patient._id) ? styles.therapy : styles.assessment
                            }`}
                          >
                            {assignedPatients.includes(patient._id) ? "Assigned" : "Not Assigned"}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            {assignedPatients.includes(patient._id) ? (
                              <button
                                onClick={() => handleUnassignPatient(patient._id)}
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                title="Unassign from ABA Department"
                              >
                                <X className={styles.actionIcon} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAssignPatient(patient._id)}
                                className={`${styles.actionButton} ${styles.editButton}`}
                                title="Assign to ABA Department"
                              >
                                <Plus className={styles.actionIcon} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className={styles.noData}>
                        <div className={styles.emptyState}>
                          <Brain className={styles.emptyIcon} />
                          <h3>No patients found</h3>
                          <p>
                            {search
                              ? "No patients match your search criteria. Try adjusting your search terms."
                              : "No patients available for assignment."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {patients.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {startIndex + 1} to {Math.min(endIndex, patients.length)} of {patients.length} patients
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
    </div>
  )
}

export { AssignPatientsToAba }
