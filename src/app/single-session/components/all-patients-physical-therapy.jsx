"use client"

import { useState, useEffect } from "react"
import { Search, ClipboardList, ClipboardCheck, Users } from 'lucide-react'
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/all-patients.module.css"

const AllPatientsPhysicalTherapy = () => {
  const [assignments, setAssignments] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPhysicalTherapyPatients()
  }, [currentPage, search])

  const fetchPhysicalTherapyPatients = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/physicalTherapy/physical-therapy-assignments?page=${currentPage}&search=${search}`,
      )

      const assignmentsData = Array.isArray(response.data) ? response.data : response.data.assignments || []

      setAssignments(assignmentsData)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching physical therapy patients:", error)
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPhysicalTherapyPatients()
  }

  const getPatientProperty = (assignment, property) => {
    if (!assignment || !assignment.patient) return "N/A"
    return assignment.patient[property] || "N/A"
  }

  return (
    <div className={styles.patientsContainer}>
      <div className={styles.patientsCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.pageTitle}>Physical Therapy Department Patients</h2>
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
          <button
            onClick={() => router.push("/physical-therapy/assign-patients")}
            className={styles.primaryButton}
          >
            <Users className={styles.buttonIcon} />
            Assign Patients
          </button>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading patients...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Users size={48} />
              </div>
              <h3 className={styles.emptyTitle}>No patients assigned</h3>
              <p className={styles.emptyDescription}>
                No patients are currently assigned to the physical therapy department.
              </p>
              <button
                onClick={() => router.push("/physical-therapy/assign-patients")}
                className={styles.primaryButton}
              >
                Assign Patients
              </button>
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
                    <th>Assigned Date</th>
                    <th>Status</th>
                    <th className={styles.textCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment, index) => (
                    <tr key={assignment._id || index} className={styles.tableRow}>
                      <td>{(currentPage - 1) * 10 + index + 1}</td>
                      <td className={styles.patientName}>{getPatientProperty(assignment, "name")}</td>
                      <td className={styles.patientInfo}>{getPatientProperty(assignment, "email")}</td>
                      <td className={styles.patientInfo}>{getPatientProperty(assignment, "phone")}</td>
                      <td className={styles.patientInfo}>
                        {assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            assignment.status === "active" ? styles.statusActive : styles.statusInactive
                          }`}
                        >
                          {assignment.status || "Unknown"}
                        </span>
                      </td>
                      <td className={styles.textCenter}>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => router.push(`/physical-therapy/plan/${assignment.patient?._id}`)}
                            className={`${styles.actionButton} ${styles.planButton}`}
                            title="Patient Plan"
                            disabled={!assignment.patient?._id}
                          >
                            <ClipboardList className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() => router.push(`/physical-therapy/test/${assignment.patient?._id}`)}
                            className={`${styles.actionButton} ${styles.testButton}`}
                            title="Patient Test"
                            disabled={!assignment.patient?._id}
                          >
                            <ClipboardCheck className={styles.actionIcon} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.paginationContainer}>
            <span className={styles.paginationInfo}>
              Showing {assignments.length} physical therapy department patients
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

export default AllPatientsPhysicalTherapy
