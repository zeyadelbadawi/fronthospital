"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axiosInstance from "@/helper/axiosSetup"
import SyncfusionDocx from "@/components/SyncfusionDocx"
import DocxUploadFormSpecialExam from "./docx-upload-form-special-exam"
import DocxUploadFormSpecialExamPrevious from "./docx-upload-form-special-exam-previous" // New import
import CloseQuarterFormSpecialExam from "./close-quarter-form-special-exam.jsx"
import styles from "../../full-program/styles/aba-plan-editor.module.css"
import {
  ArrowLeft,
  FileText,
  Clock,
  Calendar,
  Brain,
  UploadCloud,
  Loader2,
  Save,
  Download,
  XCircle,
} from "lucide-react"

export default function SpecialExamView({ patientId, onBack }) {
  const [patient, setPatient] = useState(null)
  const [allExams, setAllExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString())
  const [selectedQuarter, setSelectedQuarter] = useState(() => Math.ceil((new Date().getMonth() + 1) / 3).toString())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isUploadPreviousModalOpen, setIsUploadPreviousModalOpen] = useState(false) // State for previous upload modal
  const [showCloseQuarterModal, setShowCloseQuarterModal] = useState(false)
  const docxEditorRef = useRef(null)
  const [currentQuarter, setCurrentQuarter] = useState({ quarter: 0, year: 0 })

  const currentYear = new Date().getFullYear().toString()
  const currentMonth = new Date().getMonth() + 1
  const currentQuarterCalc = Math.ceil(currentMonth / 3).toString()

  const department = "SpecialEducation"

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${patientId}`,
        )
        setPatient(response.data)
      } catch (error) {
        console.error("Error fetching patient data:", error)
        setError("Failed to fetch patient data.")
      }
    }
    if (patientId) {
      fetchPatientData()
    }
  }, [patientId])

  const getCurrentQuarter = () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    let quarter
    if (month <= 3) quarter = 1
    else if (month <= 6) quarter = 2
    else if (month <= 9) quarter = 3
    else quarter = 4
    return { quarter, year }
  }

  const determineActiveQuarter = async () => {
    const { quarter: currentCalendarQ, year: currentCalendarY } = getCurrentQuarter()
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/get-exams/${patientId}?last=true`,
      )
      const latestExam = response?.data?.exams

      if (latestExam) {
        setCurrentQuarter({ quarter: latestExam.quarterOfYear, year: latestExam.year })
        setSelectedExam(latestExam)
      } else {
        setCurrentQuarter({ quarter: currentCalendarQ, year: currentCalendarY })
        setSelectedExam(null)
      }
    } catch (err) {
      console.error("Error determining active quarter:", err)
      setError("Failed to determine active quarter.")
      setCurrentQuarter({ quarter: currentCalendarQ, year: currentCalendarY })
      setSelectedExam(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllHistoricalExams = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/exams/${patientId}`)
      const exams = response.data || []
      setAllExams(exams)

      if (exams.length > 0) {
        const sortedExams = [...exams].sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year
          return b.quarterOfYear - a.quarterOfYear
        })
        const latestExam = sortedExams[0]

        setSelectedExam(latestExam)
        setSelectedYear(latestExam.year?.toString() || currentYear)
        setSelectedQuarter(latestExam.quarterOfYear?.toString() || currentQuarterCalc)
      } else {
        setSelectedExam(null)
        setSelectedYear(currentYear)
        setSelectedQuarter(currentQuarterCalc)
      }
    } catch (err) {
      console.error("Failed to fetch historical exams:", err)
      setError("Failed to load historical exams. Please try again.")
      setSelectedExam(null)
      setSelectedYear(currentYear)
      setSelectedQuarter(currentQuarterCalc)
    } finally {
      setLoading(false)
    }
  }, [patientId, currentYear, currentQuarterCalc])

  useEffect(() => {
    if (patientId) {
      fetchAllHistoricalExams()
      determineActiveQuarter()
    }
  }, [patientId, fetchAllHistoricalExams])

  useEffect(() => {
    if (selectedYear && selectedQuarter && allExams.length > 0) {
      const foundExam = allExams.find(
        (p) => p.year?.toString() === selectedYear && p.quarterOfYear?.toString() === selectedQuarter,
      )
      setSelectedExam(foundExam || null)
    } else if (allExams.length === 0) {
      setSelectedExam(null)
    }
  }, [selectedYear, selectedQuarter, allExams])

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value)
  }

  const handleQuarterChange = (e) => {
    setSelectedQuarter(e.target.value)
  }

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false)
    setIsUploadPreviousModalOpen(false) // Close the previous upload modal
    fetchAllHistoricalExams() // Refresh the list of exams
  }

  const handleRetry = () => {
    fetchAllHistoricalExams()
  }

  const handleSaveContent = async (documentContentBlob) => {
    if (!selectedExam) {
      alert("No Exam selected to save.")
      return
    }

    try {
      const formData = new FormData()
      formData.append(
        "document",
        documentContentBlob,
        selectedExam.fileName || `${patientId}_Q${selectedExam.quarterOfYear}_${selectedExam.year}.docx`,
      )
      formData.append("patientId", patientId)
      formData.append("quarterOfYear", selectedExam.quarterOfYear)
      formData.append("year", selectedExam.year)
      formData.append("title", selectedExam.title || `SpecialEducation Exam for ${patient?.name || patientId}`)

      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_URL}/${department.toLowerCase()}/exam/${selectedExam._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      alert(response.data.message || "Document saved successfully!")
      fetchAllHistoricalExams()
    } catch (err) {
      console.error("Failed to save document:", err)
      alert(err.response?.data?.message || "Failed to save document. Please try again.")
    }
  }

  const handleDownloadContent = async (blobContent) => {
    if (!selectedExam) {
      alert("No exam selected to download.")
      return
    }

    try {
      const url = window.URL.createObjectURL(blobContent)
      const a = document.createElement("a")
      a.href = url
      a.download = `${selectedExam.title || "exam"}_Q${selectedExam.quarterOfYear}_${selectedExam.year}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
      alert("Document downloaded successfully!")
    } catch (err) {
      console.error("Failed to download document:", err)
      alert("Failed to download document. Please try again.")
    }
  }

  const handleCloseQuarterSuccess = async (closedQuarterData) => {
    setShowCloseQuarterModal(false)
    await fetchAllHistoricalExams()
  }

  const displayQuarter = selectedExam ? selectedExam.quarterOfYear : selectedQuarter
  const displayYear = selectedExam ? selectedExam.year : selectedYear

  if (loading) {
    return (
      <div className={styles.documentPage}>
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.loadingSpinner} />
          <p>Loading exams...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.documentPage}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <i className="bi bi-exclamation-triangle"></i>
          </div>
          <h4>Something went wrong</h4>
          <p className="text-muted mb-4">{error}</p>
          <button className="btn btn-primary" onClick={handleRetry}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.documentPage}>
      <div className={styles.container}>
        {selectedExam ? (
          <div className={styles.planEditorContainer}>
            <div className={styles.planEditorCard}>
              <div className={styles.planHeader}>
                <div className={styles.headerTopRow}>
                  <button onClick={onBack} className={styles.headerActionButton}>
                    <ArrowLeft className={styles.backIcon} />
                    Back to Dashboard
                  </button>
                  <div className={styles.topRightActions}>
                    <button className={styles.headerActionButton} onClick={() => setShowCloseQuarterModal(true)}>
                      <XCircle className={styles.backIcon} />
                      Close the Quarter
                    </button>
                    {/* New button for previous exam upload */}
                    <button className={styles.headerActionButton} onClick={() => setIsUploadPreviousModalOpen(true)}>
                      <UploadCloud className={styles.backIcon} />
                      Upload Previous Exam
                    </button>
                  </div>
                </div>
                <div className={styles.headerBottomRow}>
                  <div className={styles.studentInfo}>
                    <h3 className={styles.planTitle}>
                      <Brain className={styles.titleIcon} />
                      <span>SpecialEducation Exam for</span>
                      <span className={styles.patientNameSuperHighlight}>{patient?.name || patientId}</span>
                      <span>
                        Q{displayQuarter}/{displayYear}
                      </span>
                    </h3>
                    <div className={styles.studentDetails}>
                      {selectedExam?.fileName && (
                        <div className={styles.studentDetail}>
                          <FileText className={styles.detailIcon} />
                          <span>{selectedExam.fileName}</span>
                        </div>
                      )}
                      {selectedExam?.createdAt && (
                        <div className={styles.studentDetail}>
                          <Calendar className={styles.detailIcon} />
                          <span>Created: {new Date(selectedExam.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {displayQuarter && displayYear && (
                        <div className={styles.studentDetail}>
                          <span>
                            Quarter: Q{displayQuarter}/{displayYear}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.documentActions}>
                    <button
                      className="btn btn-success d-flex align-items-center gap-1"
                      onClick={() => docxEditorRef.current?.onSave()}
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      className="btn btn-info d-flex align-items-center gap-1"
                      onClick={() => docxEditorRef.current?.onDownload()}
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.planBody}>
                <SyncfusionDocx
                  ref={docxEditorRef}
                  documentUrl={`${process.env.NEXT_PUBLIC_API_URL}${selectedExam?.fullPath}`}
                  docxName={`${selectedExam.title || "SpecialEducation-exam"}-${patient?.name || patientId}-Q${selectedExam.quarterOfYear}-${selectedExam.year}`}
                  patientName={patient?.name || patientId}
                  onSaveContent={handleSaveContent}
                  onDownloadContent={handleDownloadContent}
                />
                {selectedExam?.lastModified && (
                  <div className={styles.documentFooter}>
                    <div className={styles.lastModified}>
                      <Clock className={styles.clockIcon} />
                      <span>Last modified: {new Date(selectedExam.lastModified).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noDocumentContainer}>
            <div className={styles.noDocumentCard}>
              <div className={styles.noDocumentIcon}>
                <i className="bi bi-file-earmark-plus"></i>
              </div>
              <h3>No Document Found</h3>
              <p className="text-muted mb-4">
                We couldn't find any documents for your account for Q{displayQuarter}/{displayYear}. Please upload a
                DOCX document to get started.
              </p>
              <div className={styles.userInfo}>
                <div className={styles.infoItem}>
                  <strong>Patient ID:</strong> {patientId}
                </div>
                <div className={styles.infoItem}>
                  <strong>Department:</strong> {department}
                </div>
                {displayQuarter && displayYear && (
                  <div className={styles.infoItem}>
                    <strong>Current Selection:</strong> Q{displayQuarter}/{displayYear}
                  </div>
                )}
              </div>
              <button onClick={() => setIsUploadModalOpen(true)} className={styles.uploadButton}>
                <UploadCloud size={20} /> Upload Exam for Q{displayQuarter}/{displayYear}
              </button>
            </div>
          </div>
        )}
        {isUploadModalOpen && (
          <div className={styles.modalOverlay}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className={`modal-content ${styles.modalContent}`}>
                <div className="modal-header">
                  <h5 className="modal-title">Upload Document</h5>
                  <button type="button" className="btn-close" onClick={() => setIsUploadModalOpen(false)}></button>
                </div>
                <div className="modal-body p-0">
                  <DocxUploadFormSpecialExam
                    onSuccess={handleUploadSuccess}
                    onClose={() => setIsUploadModalOpen(false)}
                    defaultValues={{
                      patientId: patientId,
                      quarterOfYear: selectedQuarter,
                      year: selectedYear,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {isUploadPreviousModalOpen && ( // Modal for previous exam upload
          <div className={styles.modalOverlay}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className={`modal-content ${styles.modalContent}`}>
                <div className="modal-header">
                  <h5 className="modal-title">Upload Previous Special Exam</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsUploadPreviousModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-body p-0">
                  <DocxUploadFormSpecialExamPrevious
                    onSuccess={handleUploadSuccess}
                    onClose={() => setIsUploadPreviousModalOpen(false)}
                    defaultValues={{
                      patientId: patientId,
                      quarterOfYear: "", // Allow user to select
                      year: "", // Allow user to select
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {showCloseQuarterModal && (
          <div className={styles.modalOverlay}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className={`modal-content ${styles.modalContent}`}>
                <div className="modal-header">
                  <h5 className="modal-title">Close Quarter</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCloseQuarterModal(false)}></button>
                </div>
                <div className="modal-body p-0">
                  <CloseQuarterFormSpecialExam
                    onSuccess={handleCloseQuarterSuccess}
                    onClose={() => setShowCloseQuarterModal(false)}
                    defaultValues={{
                      patientId: patientId,
                      quarterOfYear: displayQuarter,
                      year: displayYear,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
