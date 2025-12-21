"use client"
import { useState, useEffect } from "react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/doctor-profile-plans.module.css"
import { ChevronDown, ChevronRight, FileText, ClipboardCheck, Download, Eye } from "lucide-react"
import DoctorPlanDocx from "./DoctorPlanDocx"

export default function DoctorProfilePlans({ doctorId }) {
  const [plansData, setPlansData] = useState({})
  const [loading, setLoading] = useState(true)
  const [expandedDepartments, setExpandedDepartments] = useState({})
  const [expandedYears, setExpandedYears] = useState({})
  const [expandedQuarters, setExpandedQuarters] = useState({})
  const [expandedStudents, setExpandedStudents] = useState({})
  const [viewingDocument, setViewingDocument] = useState(null)
  const [documentLoading, setDocumentLoading] = useState(false)

  useEffect(() => {
    fetchDoctorStudentPlans()
  }, [doctorId])

  const fetchDoctorStudentPlans = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/doctor-student-plans/${doctorId}`)

      if (response.data.success) {
        setPlansData(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching doctor student plans:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDepartment = (dept) => {
    setExpandedDepartments((prev) => ({
      ...prev,
      [dept]: !prev[dept],
    }))
  }

  const toggleYear = (dept, year) => {
    const key = `${dept}-${year}`
    setExpandedYears((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const toggleQuarter = (dept, year, quarter) => {
    const key = `${dept}-${year}-${quarter}`
    setExpandedQuarters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const toggleStudent = (dept, year, quarter, student) => {
    const key = `${dept}-${year}-${quarter}-${student}`
    setExpandedStudents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleDownload = async (fullPath, fileName) => {
    if (!fullPath) return

    try {
      const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}${fullPath}`

      const response = await axiosInstance.get(fileUrl, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName || "document.pdf")
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("  Error downloading file:", error)
      alert("Failed to download file. Please try again.")
    }
  }

  const handleView = async (fullPath, fileName, type) => {
    if (!fullPath) return

    try {
      setDocumentLoading(true)
      const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}${fullPath}`
  
      const response = await axiosInstance.get(fileUrl, {
        responseType: "blob",
      })

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result
        setViewingDocument({
          filePath: base64data,
          fileName: fileName || `${type} Document`,
          type: type,
        })
        setDocumentLoading(false)
      }
      reader.onerror = () => {
        alert("Failed to load the file. Please try again.")
        setDocumentLoading(false)
      }
      reader.readAsDataURL(response.data)
    } catch (error) {
      console.error("  Error loading file:", error)
      alert("Failed to load the file. Please try again.")
      setDocumentLoading(false)
    }
  }

  const handleCloseViewer = () => {
    setViewingDocument(null)
  }

  const getDepartmentDisplayName = (dept) => {
    const names = {
      ABA: "ABA Department",
      speech: "Speech Department",
      OccupationalTherapy: "Occupational Therapy Department",
      SpecialEducation: "Special Education Department",
      physicalTherapy: "Physical Therapy Department",
    }
    return names[dept] || dept
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading student plans and exams...</p>
      </div>
    )
  }

  if (Object.keys(plansData).length === 0) {
    return (
      <div className={styles.emptyState}>
        <FileText size={48} className={styles.emptyIcon} />
        <h3>No Student Plans or Exams</h3>
        <p>You don't have any assigned students with plans or exams yet.</p>
      </div>
    )
  }

  if (documentLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading document...</p>
      </div>
    )
  }

  if (viewingDocument) {
    return (
      <div>
        <div className={styles.viewerHeader}>
          <h3 className={styles.viewerTitle}>
            <FileText size={20} />
            {viewingDocument.fileName}
          </h3>
          <button onClick={handleCloseViewer} className={styles.closeViewerBtn}>
            ← Back to Plans
          </button>
        </div>
        <DoctorPlanDocx filePath={viewingDocument.filePath} />
      </div>
    )
  }

  return (
    <div className={styles.plansContainer}>
      <div className={styles.plansHeader}>
        <h2>My Students' Plans and Exams</h2>
        <p>View all plans and exams for your assigned students organized by department, year, and quarter</p>
      </div>

      <div className={styles.plansContent}>
        {Object.keys(plansData)
          .sort()
          .map((department) => (
            <div key={department} className={styles.departmentSection}>
              <div className={styles.departmentHeader} onClick={() => toggleDepartment(department)}>
                {expandedDepartments[department] ? (
                  <ChevronDown className={styles.chevron} />
                ) : (
                  <ChevronRight className={styles.chevron} />
                )}
                <h3>{getDepartmentDisplayName(department)}</h3>
              </div>

              {expandedDepartments[department] && (
                <div className={styles.departmentContent}>
                  {Object.keys(plansData[department])
                    .sort((a, b) => b - a)
                    .map((year) => {
                      const yearKey = `${department}-${year}`
                      return (
                        <div key={year} className={styles.yearSection}>
                          <div className={styles.yearHeader} onClick={() => toggleYear(department, year)}>
                            {expandedYears[yearKey] ? (
                              <ChevronDown className={styles.chevron} />
                            ) : (
                              <ChevronRight className={styles.chevron} />
                            )}
                            <h4>Year {year}</h4>
                          </div>

                          {expandedYears[yearKey] && (
                            <div className={styles.yearContent}>
                              {Object.keys(plansData[department][year])
                                .sort((a, b) => {
                                  return Number.parseInt(a.slice(1)) - Number.parseInt(b.slice(1))
                                })
                                .map((quarter) => {
                                  const quarterKey = `${department}-${year}-${quarter}`
                                  return (
                                    <div key={quarter} className={styles.quarterSection}>
                                      <div
                                        className={styles.quarterHeader}
                                        onClick={() => toggleQuarter(department, year, quarter)}
                                      >
                                        {expandedQuarters[quarterKey] ? (
                                          <ChevronDown className={styles.chevron} />
                                        ) : (
                                          <ChevronRight className={styles.chevron} />
                                        )}
                                        <h5>{quarter}</h5>
                                      </div>

                                      {expandedQuarters[quarterKey] && (
                                        <div className={styles.quarterContent}>
                                          {Object.keys(plansData[department][year][quarter])
                                            .sort()
                                            .map((studentName) => {
                                              const studentData = plansData[department][year][quarter][studentName]
                                              const studentKey = `${department}-${year}-${quarter}-${studentName}`

                                              return (
                                                <div key={studentName} className={styles.studentSection}>
                                                  <div
                                                    className={styles.studentHeader}
                                                    onClick={() =>
                                                      toggleStudent(department, year, quarter, studentName)
                                                    }
                                                  >
                                                    {expandedStudents[studentKey] ? (
                                                      <ChevronDown className={styles.chevron} />
                                                    ) : (
                                                      <ChevronRight className={styles.chevron} />
                                                    )}
                                                    <h6>{studentName}</h6>
                                                  </div>

                                                  {expandedStudents[studentKey] && (
                                                    <div className={styles.studentContent}>
                                                      {studentData.plan && (
                                                        <div className={styles.documentItem}>
                                                          <FileText className={styles.docIcon} />
                                                          <div className={styles.docInfo}>
                                                            <p className={styles.docTitle}>Plan</p>
                                                            <p className={styles.docSubtitle}>
                                                              {studentData.plan.title}
                                                            </p>
                                                            {studentData.plan.fileName && (
                                                              <p className={styles.docFileName}>
                                                                {studentData.plan.fileName}
                                                              </p>
                                                            )}
                                                          </div>
                                                          {studentData.plan.fullPath && (
                                                            <div className={styles.documentActions}>
                                                              <button
                                                                className={styles.viewBtn}
                                                                onClick={() =>
                                                                  handleView(
                                                                    studentData.plan.fullPath,
                                                                    studentData.plan.fileName,
                                                                    "Plan",
                                                                  )
                                                                }
                                                                title="View file"
                                                              >
                                                                <Eye size={16} />
                                                              </button>
                                                              <button
                                                                className={styles.downloadBtn}
                                                                onClick={() =>
                                                                  handleDownload(
                                                                    studentData.plan.fullPath,
                                                                    studentData.plan.fileName,
                                                                  )
                                                                }
                                                                title="Download file"
                                                              >
                                                                <Download size={16} />
                                                              </button>
                                                            </div>
                                                          )}
                                                        </div>
                                                      )}

                                                      {studentData.exam && (
                                                        <div className={styles.documentItem}>
                                                          <ClipboardCheck className={styles.docIcon} />
                                                          <div className={styles.docInfo}>
                                                            <p className={styles.docTitle}>Exam</p>
                                                            <p className={styles.docSubtitle}>
                                                              {studentData.exam.title}
                                                            </p>
                                                            {studentData.exam.fileName && (
                                                              <p className={styles.docFileName}>
                                                                {studentData.exam.fileName}
                                                              </p>
                                                            )}
                                                          </div>
                                                          {studentData.exam.fullPath && (
                                                            <div className={styles.documentActions}>
                                                              <button
                                                                className={styles.viewBtn}
                                                                onClick={() =>
                                                                  handleView(
                                                                    studentData.exam.fullPath,
                                                                    studentData.exam.fileName,
                                                                    "Exam",
                                                                  )
                                                                }
                                                                title="View file"
                                                              >
                                                                <Eye size={16} />
                                                              </button>
                                                              <button
                                                                className={styles.downloadBtn}
                                                                onClick={() =>
                                                                  handleDownload(
                                                                    studentData.exam.fullPath,
                                                                    studentData.exam.fileName,
                                                                  )
                                                                }
                                                                title="Download file"
                                                              >
                                                                <Download size={16} />
                                                              </button>
                                                            </div>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              )
                                            })}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
