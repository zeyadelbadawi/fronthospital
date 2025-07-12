"use client"
import { useState, useEffect } from "react"
import {
  Folder,
  FolderOpen,
  FileText,
  Download,
  Eye,
  ChevronRight,
  ChevronDown,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
} from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import { getCurrentUser } from "@/app/full-program/utils/auth-utils"
import styles from "../styles/profile-view.module.css"
import DoctorPlanDocx from "./DoctorPlanDocx"

const DoctorProfilePlans = () => {
  const user = getCurrentUser()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedQuarter, setSelectedQuarter] = useState("all")
  const [viewingDocument, setViewingDocument] = useState(null)

  useEffect(() => {
    if (user?.id) {
      fetchAllPlans()
    }
  }, [user?.id])

  const fetchAllPlans = async () => {
    try {
      setLoading(true)
      setError(null)

      // First get doctor's departments
      const depsResponse = await axiosInstance.get(`/doctorFile/doctor-deps/${user?.id}`)
      const departments = depsResponse.data

      if (!departments || departments.length === 0) {
        setPlans([])
        return
      }

      // Fetch plans for each department
      const allPlans = []
      for (const dept of departments) {
        try {
          const plansResponse = await axiosInstance.get(`/doctorFile/get-plans/${user?.id}/${dept._id}`)
          if (plansResponse.data.doctorFiles && Array.isArray(plansResponse.data.doctorFiles)) {
            // Add department info to each plan
            const deptPlans = plansResponse.data.doctorFiles.map((plan) => ({
              ...plan,
              departmentId: dept,
            }))
            allPlans.push(...deptPlans)
          }
        } catch (deptError) {
          console.log(`No plans found for department ${dept.name}`)
        }
      }

      setPlans(allPlans)
    } catch (error) {
      console.error("Error fetching plans:", error)
      setError("Failed to load your plans. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const organizePlansIntoFolders = () => {
    const structure = {}

    plans.forEach((plan) => {
      const deptName = plan.departmentId.name
      const year = plan.year.toString()
      const quarter = `Q${plan.quarterOfYear}`

      if (!structure[deptName]) {
        structure[deptName] = {}
      }
      if (!structure[deptName][year]) {
        structure[deptName][year] = {}
      }
      if (!structure[deptName][year][quarter]) {
        structure[deptName][year][quarter] = []
      }

      structure[deptName][year][quarter].push(plan)
    })

    return structure
  }

  const getFilteredPlans = () => {
    let filtered = plans

    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          plan.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.departmentId.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedYear !== "all") {
      filtered = filtered.filter((plan) => plan.year.toString() === selectedYear)
    }

    if (selectedQuarter !== "all") {
      filtered = filtered.filter((plan) => plan.quarterOfYear.toString() === selectedQuarter)
    }

    return filtered
  }

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const handleDownload = async (plan) => {
    try {
      const response = await axiosInstance.get(plan.fullPath, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", plan.fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Failed to download file. Please try again.")
    }
  }

  const handleView = (plan) => {
    setViewingDocument({
      filePath: `${process.env.NEXT_PUBLIC_API_URL}${plan.fullPath}`,
      fileName: plan.fileName,
      plan: plan,
    })
  }

  const handleCloseViewer = () => {
    setViewingDocument(null)
  }

  const getUniqueYears = () => {
    const years = [...new Set(plans.map((plan) => plan.year.toString()))]
    return years.sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading your plans...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <AlertCircle size={48} color="#dc2626" />
        <p style={{ color: "#dc2626", fontSize: "1.125rem", fontWeight: "600" }}>{error}</p>
        <button onClick={fetchAllPlans} className={styles.saveButton} style={{ marginTop: "1rem" }}>
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    )
  }

  const folderStructure = organizePlansIntoFolders()
  const filteredPlans = getFilteredPlans()
  const uniqueYears = getUniqueYears()

  // If viewing a document, show the document viewer instead
  if (viewingDocument) {
    return (
      <div>
        {/* Header with close button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
          }}
        >
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText size={20} />
            {viewingDocument.fileName}
          </h3>
          <button
            onClick={handleCloseViewer}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ← Back to Plans
          </button>
        </div>
        {/* Document viewer */}
        <DoctorPlanDocx filePath={viewingDocument.filePath} />
      </div>
    )
  }

  return (
    <div>
      {/* Header with Stats */}
      <div style={{ marginBottom: "2rem" }}>
        {/* Search and Filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280",
              }}
            />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.formInput}
              style={{ paddingLeft: "3rem" }}
            />
          </div>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={styles.formInput}>
            <option value="all">All Years</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className={styles.formInput}
          >
            <option value="all">All Quarters</option>
            <option value="1">Q1</option>
            <option value="2">Q2</option>
            <option value="3">Q3</option>
            <option value="4">Q4</option>
          </select>
        </div>
      </div>

      {/* File Explorer */}
      <div
        style={{
          border: "2px solid #e2e8f0",
          borderRadius: "1rem",
          background: "white",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Folder size={20} color="#059669" />
          <span style={{ fontWeight: "700", color: "#374151" }}>My Plans</span>
          <button
            onClick={fetchAllPlans}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(5, 150, 105, 0.1)"
              e.currentTarget.style.color = "#059669"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none"
              e.currentTarget.style.color = "#6b7280"
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div style={{ padding: "1rem" }}>
          {Object.keys(folderStructure).length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#6b7280",
              }}
            >
              <FileText size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
              <p style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>No Plans Found</p>
              <p style={{ fontSize: "0.875rem" }}>You haven't uploaded any plans yet.</p>
            </div>
          ) : (
            Object.entries(folderStructure).map(([deptName, years]) => (
              <div key={deptName} style={{ marginBottom: "1rem" }}>
                {/* Department Folder */}
                <div
                  onClick={() => toggleFolder(deptName)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    cursor: "pointer",
                    borderRadius: "0.5rem",
                    transition: "all 0.2s",
                    background: expandedFolders.has(deptName) ? "rgba(5, 150, 105, 0.05)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!expandedFolders.has(deptName)) {
                      e.currentTarget.style.background = "rgba(5, 150, 105, 0.05)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!expandedFolders.has(deptName)) {
                      e.currentTarget.style.background = "transparent"
                    }
                  }}
                >
                  {expandedFolders.has(deptName) ? (
                    <ChevronDown size={16} color="#059669" />
                  ) : (
                    <ChevronRight size={16} color="#6b7280" />
                  )}
                  {expandedFolders.has(deptName) ? (
                    <FolderOpen size={20} color="#059669" />
                  ) : (
                    <Folder size={20} color="#6b7280" />
                  )}
                  <span style={{ fontWeight: "600", color: "#374151" }}>{deptName}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      background: "#f3f4f6",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "9999px",
                    }}
                  >
                    {Object.values(years).reduce(
                      (total, quarters) =>
                        total + Object.values(quarters).reduce((qTotal, files) => qTotal + files.length, 0),
                      0,
                    )}{" "}
                    files
                  </span>
                </div>

                {/* Year Folders */}
                {expandedFolders.has(deptName) && (
                  <div style={{ marginLeft: "2rem" }}>
                    {Object.entries(years)
                      .sort(([a], [b]) => Number.parseInt(b) - Number.parseInt(a))
                      .map(([year, quarters]) => (
                        <div key={`${deptName}-${year}`} style={{ marginBottom: "0.5rem" }}>
                          <div
                            onClick={() => toggleFolder(`${deptName}-${year}`)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.5rem",
                              cursor: "pointer",
                              borderRadius: "0.5rem",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(5, 150, 105, 0.05)"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent"
                            }}
                          >
                            {expandedFolders.has(`${deptName}-${year}`) ? (
                              <ChevronDown size={14} color="#059669" />
                            ) : (
                              <ChevronRight size={14} color="#6b7280" />
                            )}
                            {expandedFolders.has(`${deptName}-${year}`) ? (
                              <FolderOpen size={18} color="#059669" />
                            ) : (
                              <Folder size={18} color="#6b7280" />
                            )}
                            <span style={{ fontWeight: "500", color: "#374151" }}>{year}</span>
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: "0.75rem",
                                color: "#6b7280",
                              }}
                            >
                              {Object.values(quarters).reduce((total, files) => total + files.length, 0)} files
                            </span>
                          </div>

                          {/* Quarter Folders */}
                          {expandedFolders.has(`${deptName}-${year}`) && (
                            <div style={{ marginLeft: "2rem" }}>
                              {Object.entries(quarters)
                                .sort(([a], [b]) => Number.parseInt(a.slice(1)) - Number.parseInt(b.slice(1)))
                                .map(([quarter, files]) => (
                                  <div key={`${deptName}-${year}-${quarter}`} style={{ marginBottom: "0.5rem" }}>
                                    <div
                                      onClick={() => toggleFolder(`${deptName}-${year}-${quarter}`)}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        padding: "0.5rem",
                                        cursor: "pointer",
                                        borderRadius: "0.5rem",
                                        transition: "all 0.2s",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "rgba(5, 150, 105, 0.05)"
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "transparent"
                                      }}
                                    >
                                      {expandedFolders.has(`${deptName}-${year}-${quarter}`) ? (
                                        <ChevronDown size={12} color="#059669" />
                                      ) : (
                                        <ChevronRight size={12} color="#6b7280" />
                                      )}
                                      {expandedFolders.has(`${deptName}-${year}-${quarter}`) ? (
                                        <FolderOpen size={16} color="#059669" />
                                      ) : (
                                        <Folder size={16} color="#6b7280" />
                                      )}
                                      <span style={{ fontWeight: "500", color: "#374151" }}>{quarter}</span>
                                      <span
                                        style={{
                                          marginLeft: "auto",
                                          fontSize: "0.75rem",
                                          color: "#6b7280",
                                        }}
                                      >
                                        {files.length} files
                                      </span>
                                    </div>

                                    {/* Files */}
                                    {expandedFolders.has(`${deptName}-${year}-${quarter}`) && (
                                      <div style={{ marginLeft: "2rem" }}>
                                        {files.map((file) => (
                                          <div
                                            key={file._id}
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "0.5rem",
                                              padding: "0.75rem",
                                              borderRadius: "0.5rem",
                                              transition: "all 0.2s",
                                              border: "1px solid transparent",
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.background = "rgba(5, 150, 105, 0.05)"
                                              e.currentTarget.style.borderColor = "#e2e8f0"
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.background = "transparent"
                                              e.currentTarget.style.borderColor = "transparent"
                                            }}
                                          >
                                            <FileText size={16} color="#059669" />
                                            <div style={{ flex: 1 }}>
                                              <div
                                                style={{
                                                  fontWeight: "500",
                                                  color: "#374151",
                                                  fontSize: "0.875rem",
                                                }}
                                              >
                                                {file.fileName}
                                              </div>
                                              <div
                                                style={{
                                                  fontSize: "0.75rem",
                                                  color: "#6b7280",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: "0.5rem",
                                                }}
                                              >
                                                <Clock size={12} />
                                                {formatDate(file.createdAt)}
                                              </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                              <button
                                                onClick={() => handleView(file)}
                                                style={{
                                                  background: "none",
                                                  border: "none",
                                                  color: "#6b7280",
                                                  cursor: "pointer",
                                                  padding: "0.25rem",
                                                  borderRadius: "0.25rem",
                                                  transition: "all 0.2s",
                                                }}
                                                onMouseEnter={(e) => {
                                                  e.currentTarget.style.background = "rgba(5, 150, 105, 0.1)"
                                                  e.currentTarget.style.color = "#059669"
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.currentTarget.style.background = "none"
                                                  e.currentTarget.style.color = "#6b7280"
                                                }}
                                                title="View file"
                                              >
                                                <Eye size={14} />
                                              </button>
                                              <button
                                                onClick={() => handleDownload(file)}
                                                style={{
                                                  background: "none",
                                                  border: "none",
                                                  color: "#6b7280",
                                                  cursor: "pointer",
                                                  padding: "0.25rem",
                                                  borderRadius: "0.25rem",
                                                  transition: "all 0.2s",
                                                }}
                                                onMouseEnter={(e) => {
                                                  e.currentTarget.style.background = "rgba(5, 150, 105, 0.1)"
                                                  e.currentTarget.style.color = "#059669"
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.currentTarget.style.background = "none"
                                                  e.currentTarget.style.color = "#6b7280"
                                                }}
                                                title="Download file"
                                              >
                                                <Download size={14} />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorProfilePlans
