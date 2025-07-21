"use client"
import { useState, useEffect } from "react"
import { Search, ClipboardList, ClipboardCheck, Brain, Calendar, User, X, Hash, FileText } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import { useContentStore } from "../store/content-store"
import PatientSchoolPlanEditor from "./patient-school-plan-editor"
import styles from "../styles/speech-upcoming-appointments.module.css"

const AllPatientsSchool = () => {
  const [programs, setPrograms] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPrograms, setTotalPrograms] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const setActiveContent = useContentStore((state) => state.setActiveContent)

  useEffect(() => {
    fetchSchoolPrograms()
  }, [currentPage, search])

  const fetchSchoolPrograms = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/school/school-programs?page=${currentPage}&search=${search}&limit=10`,
      )

      console.log("API Response:", response.data)

      // Handle both array and object responses
      const programsData = response.data.programs || response.data || []
      setPrograms(Array.isArray(programsData) ? programsData : [])
      setTotalPages(response.data.totalPages || 1)
      setTotalPrograms(response.data.totalPrograms || programsData.length || 0)
    } catch (error) {
      console.error("Error fetching school programs:", error)
      setPrograms([])
      setTotalPages(1)
      setTotalPrograms(0)
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
    fetchSchoolPrograms()
  }

  const handleBackToWelcome = () => {
    setActiveContent(null)
  }

  const handleViewPlan = (program) => {
    if (!program.patientId || !program.unicValue) {
      console.error("Missing patientId or unicValue:", program)
      showErrorMessage("Cannot open plan: Missing required information")
      return
    }

    console.log("Opening plan for:", {
      patientId: program.patientId,
      unicValue: program.unicValue,
    })

    // Set the selected program to open the plan editor component
    setSelectedProgram({
      patientId: program.patientId,
      unicValue: program.unicValue,
      patientName: program.patientName,
    })
  }

  const handleBackFromPlanEditor = () => {
    setSelectedProgram(null)
    // Refresh the programs list
    fetchSchoolPrograms()
  }

  const showErrorMessage = (message) => {
    // Simple error notification
    const toast = document.createElement("div")
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-weight: 500;
    `
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      document.body.removeChild(toast)
    }, 4000)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return "N/A"
    return timeString
  }

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return styles.active
      case "completed":
        return styles.completed
      case "pending":
        return styles.pending
      case "cancelled":
        return styles.cancelled
      default:
        return styles.unknown
    }
  }

  // Helper function to determine if a program is completed
  const isProgramCompleted = (program) => {
    return program.status?.toLowerCase() === "completed" || program.isCompleted === true
  }

  // Helper function to get the year from program data
  const getProgramYear = (program) => {
    if (program.createdAt) {
      return new Date(program.createdAt).getFullYear()
    }
    if (program.updatedAt) {
      return new Date(program.updatedAt).getFullYear()
    }
    return new Date().getFullYear()
  }

  // Helper function to get button class based on action type
  const getActionButtonClass = (isCompleted, planExists) => {
    if (isCompleted) {
      return `${styles.actionButton} ${styles.viewButton}`
    } else if (planExists) {
      return `${styles.actionButton} ${styles.editButton}`
    } else {
      return `${styles.actionButton} ${styles.createButton}`
    }
  }

  // If a program is selected, show the plan editor
  if (selectedProgram) {
    return (
      <PatientSchoolPlanEditor
        patientId={selectedProgram.patientId}
        unicValue={selectedProgram.unicValue}
        onBack={handleBackFromPlanEditor}
      />
    )
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
                Back to Dashboard
              </button>
              <div className={styles.titleSection}>
                <h2 className={styles.pageTitle}>All School Evaluation Sheets</h2>
                <p className={styles.pageSubtitle}>Manage individual School Evaluation Sheets for each Student</p>
              </div>
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
                    placeholder="Search Programs..."
                  />
                  <Search className={styles.searchIcon} />
                </div>
              </form>
            </div>
          </div>
          <div className={styles.filtersContainer}>
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{totalPrograms}</span>
                <span className={styles.statLabel}>Total Evaluations</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{programs.filter((p) => p.planExists).length}</span>
                <span className={styles.statLabel}>Evaluations With Sheets</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{programs.filter((p) => !p.planExists).length}</span>
                <span className={styles.statLabel}>Evaluations Need Sheets</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {programs.reduce((sum, p) => sum + (p.totalSessions || 1), 0)}
                </span>
                <span className={styles.statLabel}>Total Sessions</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading school programs...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className={styles.noData}>
              <div className={styles.emptyState}>
                <Brain className={styles.emptyIcon} />
                <h3>No School Programs Found</h3>
                <p>
                  {search
                    ? "No programs match your search criteria. Try adjusting your search terms."
                    : "No school programs are currently available."}
                </p>
                {search && (
                  <button
                    onClick={() => {
                      setSearch("")
                      setCurrentPage(1)
                      fetchSchoolPrograms()
                    }}
                    className={styles.clearSearchButton}
                  >
                    Clear Search
                  </button>
                )}
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
                        <Hash className={styles.headerIcon} />
                        Program ID
                      </div>
                    </th>
                    <th className={styles.textCenter}>
                      <div className={styles.headerCell}>
                        <Calendar className={styles.headerIcon} />
                        Number of Sessions
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Brain className={styles.headerIcon} />
                        Student Description
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <ClipboardCheck className={styles.headerIcon} />
                        Status
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <FileText className={styles.headerIcon} />
                        Sheet
                      </div>
                    </th>
                    <th className={styles.textCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((program, index) => {
                    const isCompleted = isProgramCompleted(program)
                    const programYear = getProgramYear(program)

                    // Calculate sequential number (reverse order so first created = 1)
                    const sequentialNumber = totalPrograms - (startIndex + index)

                    // Determine button text and title based on sheet status
                    let actionButtonText = ""
                    let actionButtonTitle = ""
                    if (isCompleted) {
                      actionButtonText = "View Plan"
                      actionButtonTitle = "View School Evaluation Sheet"
                    } else if (program.planExists) {
                      actionButtonText = "Edit Sheet"
                      actionButtonTitle = "Edit School Evaluation Sheet"
                    } else {
                      actionButtonText = "Create Sheet"
                      actionButtonTitle = "Create School Evaluation Sheet"
                    }

                    return (
                      <tr key={`${program.patientId}-${program.unicValue}` || index} className={styles.tableRow}>
                        <td className={styles.indexCell}>{startIndex + index + 1}</td>
                        <td className={styles.patientCell}>
                          <div className={styles.patientInfo}>
                            <span className={styles.patientName}>{program.patientName || "Unknown Student"}</span>
                          </div>
                        </td>
                        <td className={styles.uniqueValueCell}>
                          <div className={styles.uniqueValueInfo}>
                            <span className={styles.uniqueValue}>
                              {`School Evaluation ${sequentialNumber} (${programYear})`}
                            </span>
                          </div>
                        </td>
                        <td className={styles.sessionsCell}>
                          <div className={styles.sessionsInfo}>
                            <span className={styles.sessionsCount}>{program.totalSessions || 1}</span>
                            <span className={styles.sessionsLabel}>sessions</span>
                          </div>
                        </td>
                        <td className={styles.descriptionCell}>
                          <div className={styles.descriptionText} title={program.description}>
                            {program.description || "No description"}
                          </div>
                        </td>
                        <td className={styles.typeCell}>
                          <span className={`${styles.typeBadge} ${getStatusBadgeClass(program.status)}`}>
                            {program.status || "Unknown"}
                          </span>
                        </td>
                        <td className={styles.planStatusCell}>
                          <span
                            className={`${styles.planBadge} ${
                              isCompleted
                                ? styles.planCompleted
                                : program.planExists
                                  ? styles.planExists
                                  : styles.planMissing
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <ClipboardCheck className={styles.planIcon} />
                                Completed
                              </>
                            ) : program.planExists ? (
                              <>
                                <ClipboardCheck className={styles.planIcon} />
                                In Progress
                              </>
                            ) : (
                              <>
                                <ClipboardList className={styles.planIcon} />
                                Need Sheet
                              </>
                            )}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleViewPlan(program)}
                              className={getActionButtonClass(isCompleted, program.planExists)}
                              title={actionButtonTitle}
                              disabled={!program.patientId || !program.unicValue}
                            >
                              <ClipboardList className={styles.actionIcon} />
                              <span className={styles.actionText}>{actionButtonText}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {programs.length > 0 && totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {startIndex + 1} to {Math.min(endIndex, programs.length)} of {totalPrograms} Programs
              </span>
              <div className={styles.paginationButtons}>
                <button
                  className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ""}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  if (pageNum > totalPages) return null
                  return (
                    <button
                      key={pageNum}
                      className={`${styles.paginationButton} ${currentPage === pageNum ? styles.active : ""}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ""}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllPatientsSchool
