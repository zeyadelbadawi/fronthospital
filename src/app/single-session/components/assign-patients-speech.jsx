"use client"

import { useState, useEffect } from "react"
import { Search, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/assign-patients.module.css"

const AssignPatientsToSpeech = () => {
  const [patients, setPatients] = useState([])
  const [assignedPatients, setAssignedPatients] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()

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
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/speech/Speech-assignments`,
      )
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
      await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/speech/assign-to-Speech`, { patientId })
      setAssignedPatients([...assignedPatients, patientId])
      alert("Patient assigned to Speech department successfully!")
    } catch (error) {
      console.error("Error assigning patient:", error)
      alert("Error assigning patient to Speech department")
    }
  }

  const handleUnassignPatient = async (patientId) => {
    try {
      await axiosInstance.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/speech/unassign-from-Speech/${patientId}`,
      )
      setAssignedPatients(assignedPatients.filter((id) => id !== patientId))
      alert("Patient unassigned from Speech department successfully!")
    } catch (error) {
      console.error("Error unassigning patient:", error)
      alert("Error unassigning patient from Speech department")
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

  return (
    <div className={styles.assignPatientsContainer}>
      <div className={styles.assignPatientsCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
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
          <button onClick={() => router.push("/physical-therapy/patients")} className={styles.primaryButton}>
            View Speech Patients
          </button>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading...</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.patientsTable}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th>#</th>
                    <th>Name</th>
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
                              assignedPatients.includes(patient._id) ? styles.assigned : styles.notAssigned
                            }`}
                          >
                            {assignedPatients.includes(patient._id) ? "Assigned" : "Not Assigned"}
                          </span>
                        </td>
                        <td className={styles.textCenter}>
                          {assignedPatients.includes(patient._id) ? (
                            <button
                              onClick={() => handleUnassignPatient(patient._id)}
                              className={`${styles.actionButton} ${styles.unassign}`}
                              title="Unassign from Speech Department"
                            >
                              <X className={styles.actionIcon} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAssignPatient(patient._id)}
                              className={`${styles.actionButton} ${styles.assign}`}
                              title="Assign to Speech Department"
                            >
                              <Plus className={styles.actionIcon} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className={styles.noData}>
                        No patients found.
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

export { AssignPatientsToSpeech }
