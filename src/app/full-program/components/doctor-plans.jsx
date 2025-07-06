"use client"

import { useState, useEffect } from "react"
import { Search, ClipboardList, ClipboardCheck, Users, Brain, Calendar, Phone, Mail, User, X } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import { useContentStore } from "../store/content-store"
import styles from "../styles/speech-upcoming-appointments.module.css"

const AllPlansOfDoctor = () => {
  const [assignments, setAssignments] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const setActiveContent = useContentStore((state) => state.setActiveContent)

  useEffect(() => {
    fetchphysicalTherapyPatients()
  }, [currentPage, search])

  /* const fetchphysicalTherapyPatients = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/physicalTherapy/physical-therapy-assignments?page=${currentPage}&search=${search}`,
      )

      const assignmentsData = Array.isArray(response.data) ? response.data : response.data.assignments || []

      setAssignments(assignmentsData)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching physical therapy Students:", error)
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
    fetchphysicalTherapyPatients()
  }

  const handleBackToWelcome = () => {
    setActiveContent(null)
  }

  const getPatientProperty = (assignment, property) => {
    if (!assignment || !assignment.patient) return "N/A"
    return assignment.patient[property] || "N/A"
  }*/

  const handlePlanClick = (patientId) => {
    setActiveContent({
      department: "physicalTherapy",
      type: "plan",
      patientId: patientId,
    })
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
              <h2 className={styles.pageTitle}>physicalTherapy Department Students</h2>
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
                    placeholder="Search Students..."
                  />
                  <Search className={styles.searchIcon} />
                </div>
              </form>
            </div>
          </div>

          <div className={styles.filtersContainer}>
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{assignments.length}</span>
                <span className={styles.statLabel}>Total Students</span>
              </div>
            </div>
            <button onClick={() => router.push("/physical-therapy/assign-patients")} className={styles.primaryButton}>
              <Users className={styles.buttonIcon} />
              Assign New Students
            </button>
          </div>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading physical Therapy Students...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className={styles.noData}>
              <div className={styles.emptyState}>
                <Brain className={styles.emptyIcon} />
                <h3>No physical Therapy Students Found</h3>
                <p>
                  {search
                    ? "No Students match your search criteria. Try adjusting your search terms."
                    : "No Students are currently assigned to the physical Therapy department."}
                </p>
              </div>
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
                        Student Name
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
                        <Calendar className={styles.headerIcon} />
                        Assigned Date
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Brain className={styles.headerIcon} />
                        Status
                      </div>
                    </th>
                    <th className={styles.textCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment, index) => (
                    <tr key={assignment._id || index} className={styles.tableRow}>
                      <td className={styles.indexCell}>{startIndex + index + 1}</td>
                      <td className={styles.patientCell}>
                        <div className={styles.patientInfo}>
                          <span className={styles.patientName}>{getPatientProperty(assignment, "name")}</span>
                          <span className={styles.patientId}>ID: {assignment.patient?._id?.slice(-8) || "N/A"}</span>
                        </div>
                      </td>
                      <td className={styles.dateCell}>
                        <div className={styles.dateInfo}>
                          <span className={styles.dateValue}>{getPatientProperty(assignment, "email")}</span>
                        </div>
                      </td>
                      <td className={styles.timeCell}>
                        <span className={styles.timeValue}>{getPatientProperty(assignment, "phone")}</span>
                      </td>
                      <td className={styles.descriptionCell}>
                        <div className={styles.descriptionText}>
                          {assignment.assignedDate
                            ? new Date(assignment.assignedDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </td>
                      <td className={styles.typeCell}>
                        <span
                          className={`${styles.typeBadge} ${
                            assignment.status === "active" ? styles.therapy : styles.assessment
                          }`}
                        >
                          {assignment.status || "Unknown"}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => router.push(`/physical-therapy/plan/${assignment.patient?._id}`)}
                            className={`${styles.actionButton} ${styles.editButton}`}
                            title="Student Plan"
                            disabled={!assignment.patient?._id}
                          >
                            <ClipboardList className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() => router.push(`/physical-therapy/test/${assignment.patient?._id}`)}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            title="Student Test"
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

          {assignments.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {startIndex + 1} to {Math.min(endIndex, assignments.length)} of {assignments.length} Students
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

export default AllPlansOfDoctor
