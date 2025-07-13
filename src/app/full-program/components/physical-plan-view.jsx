"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axiosInstance from "@/helper/axiosSetup"
import SyncfusionDocx from "@/components/SyncfusionDocx"
import DocxUploadFormPhysical from "./docx-upload-form-physical"
import DocxUploadFormPhysicalPlanPrevious from "./docx-upload-form-physical-plan-previous" // New import
import CloseQuarterFormPhysical from "./close-quarter-form-physical"
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

export default function PhysicalPlanView({ patientId, onBack }) {
  const [patient, setPatient] = useState(null)
  const [allPlans, setAllPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
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

  const department = "physicalTherapy"

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
        `${process.env.NEXT_PUBLIC_API_URL}/physicalTherapy/get-plans/${patientId}?last=true`,
      )
      const latestPlan = response?.data?.plans

      if (latestPlan) {
        setCurrentQuarter({ quarter: latestPlan.quarterOfYear, year: latestPlan.year })
        setSelectedPlan(latestPlan)
      } else {
        setCurrentQuarter({ quarter: currentCalendarQ, year: currentCalendarY })
        setSelectedPlan(null)
      }
    } catch (err) {
      console.error("Error determining active quarter:", err)
      setError("Failed to determine active quarter.")
      setCurrentQuarter({ quarter: currentCalendarQ, year: currentCalendarY })
      setSelectedPlan(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllHistoricalPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/physicalTherapy/plans/${patientId}`)
      const plans = response.data || []
      setAllPlans(plans)

      if (plans.length > 0) {
        const sortedPlans = [...plans].sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year
          return b.quarterOfYear - a.quarterOfYear
        })
        const latestPlan = sortedPlans[0]

        setSelectedPlan(latestPlan)
        setSelectedYear(latestPlan.year?.toString() || currentYear)
        setSelectedQuarter(latestPlan.quarterOfYear?.toString() || currentQuarterCalc)
      } else {
        setSelectedPlan(null)
        setSelectedYear(currentYear)
        setSelectedQuarter(currentQuarterCalc)
      }
    } catch (err) {
      console.error("Failed to fetch historical plans:", err)
      setError("Failed to load historical plans. Please try again.")
      setSelectedPlan(null)
      setSelectedYear(currentYear)
      setSelectedQuarter(currentQuarterCalc)
    } finally {
      setLoading(false)
    }
  }, [patientId, currentYear, currentQuarterCalc])

  useEffect(() => {
    if (patientId) {
      fetchAllHistoricalPlans()
      determineActiveQuarter()
    }
  }, [patientId, fetchAllHistoricalPlans])

  useEffect(() => {
    if (selectedYear && selectedQuarter && allPlans.length > 0) {
      const foundPlan = allPlans.find(
        (p) => p.year?.toString() === selectedYear && p.quarterOfYear?.toString() === selectedQuarter,
      )
      setSelectedPlan(foundPlan || null)
    } else if (allPlans.length === 0) {
      setSelectedPlan(null)
    }
  }, [selectedYear, selectedQuarter, allPlans])

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false)
    setIsUploadPreviousModalOpen(false) // Close the previous upload modal
    fetchAllHistoricalPlans() // Refresh the list of plans
  }

  const handleRetry = () => {
    fetchAllHistoricalPlans()
  }

  const handleSaveContent = async (documentContentBlob) => {
    if (!selectedPlan) {
      alert("No plan selected to save.")
      return
    }

    try {
      const formData = new FormData()
      formData.append(
        "document",
        documentContentBlob,
        selectedPlan.fileName || `${patientId}_Q${selectedPlan.quarterOfYear}_${selectedPlan.year}.docx`,
      )
      formData.append("patientId", patientId)
      formData.append("quarterOfYear", selectedPlan.quarterOfYear)
      formData.append("year", selectedPlan.year)
      formData.append("title", selectedPlan.title || `physicalTherapy Plan for ${patient?.name || patientId}`)

      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_URL}/${department.toLowerCase()}/plan/${selectedPlan._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      alert(response.data.message || "Document saved successfully!")
      fetchAllHistoricalPlans()
    } catch (err) {
      console.error("Failed to save document:", err)
      alert(err.response?.data?.message || "Failed to save document. Please try again.")
    }
  }

  const handleDownloadContent = async (blobContent) => {
    if (!selectedPlan) {
      alert("No plan selected to download.")
      return
    }

    try {
      const url = window.URL.createObjectURL(blobContent)
      const a = document.createElement("a")
      a.href = url
      a.download = `${selectedPlan.title || "plan"}_Q${selectedPlan.quarterOfYear}_${selectedPlan.year}.docx`
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
    await fetchAllHistoricalPlans()
  }

  const getUniqueYears = () => {
    const years = new Set(allPlans.map((p) => p.year?.toString()).filter(Boolean))
    years.add(currentYear)
    return Array.from(years).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
  }

  const getUniqueQuartersForYear = (year) => {
    const quarters = new Set(
      allPlans
        .filter((p) => p.year?.toString() === year)
        .map((p) => p.quarterOfYear?.toString())
        .filter(Boolean),
    )
    if (year === currentYear || quarters.size === 0) {
      return ["1", "2", "3", "4"].sort()
    }
    return Array.from(quarters).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
  }

  const availableYears = getUniqueYears()
  const availableQuarters = getUniqueQuartersForYear(selectedYear)

  const displayQuarter = selectedPlan ? selectedPlan.quarterOfYear : selectedQuarter
  const displayYear = selectedPlan ? selectedPlan.year : selectedYear

  if (loading) {
    return (
      <div className={styles.documentPage}>
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.loadingSpinner} />
          <p>Loading plans...</p>
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
        {selectedPlan ? (
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
                    {/* New button for previous plan upload */}
                    <button className={styles.headerActionButton} onClick={() => setIsUploadPreviousModalOpen(true)}>
                      <UploadCloud className={styles.backIcon} />
                      Upload Previous Plan
                    </button>
                  </div>
                </div>
                <div className={styles.headerBottomRow}>
                  <div className={styles.studentInfo}>
                    <h3 className={styles.planTitle}>
                      <Brain className={styles.titleIcon} />
                      <span>physical Therapy Plan for</span>
                      <span className={styles.patientNameSuperHighlight}>{patient?.name || patientId}</span>
                      <span>
                        Q{displayQuarter}/{displayYear}
                      </span>
                    </h3>
                    <div className={styles.studentDetails}>
                      {selectedPlan?.fileName && (
                        <div className={styles.studentDetail}>
                          <FileText className={styles.detailIcon} />
                          <span>{selectedPlan.fileName}</span>
                        </div>
                      )}
                      {selectedPlan?.createdAt && (
                        <div className={styles.studentDetail}>
                          <Calendar className={styles.detailIcon} />
                          <span>Created: {new Date(selectedPlan.createdAt).toLocaleDateString()}</span>
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
                  documentUrl={`${process.env.NEXT_PUBLIC_API_URL}${selectedPlan?.fullPath}`}
                  docxName={`${selectedPlan.title || "physicalTherapy-plan"}-${patient?.name || patientId}-Q${selectedPlan.quarterOfYear}-${selectedPlan.year}`}
                  patientName={patient?.name || patientId}
                  onSaveContent={handleSaveContent}
                  onDownloadContent={handleDownloadContent}
                />
                {selectedPlan?.lastModified && (
                  <div className={styles.documentFooter}>
                    <div className={styles.lastModified}>
                      <Clock className={styles.clockIcon} />
                      <span>Last modified: {new Date(selectedPlan.lastModified).toLocaleString()}</span>
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
                <UploadCloud size={20} /> Upload Plan for Q{displayQuarter}/{displayYear}
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
                  <DocxUploadFormPhysical
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
        {isUploadPreviousModalOpen && ( // Modal for previous plan upload
          <div className={styles.modalOverlay}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className={`modal-content ${styles.modalContent}`}>
                <div className="modal-header">
                  <h5 className="modal-title">Upload Previous physicalTherapy Plan</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsUploadPreviousModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-body p-0">
                  <DocxUploadFormPhysicalPlanPrevious
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
                  <CloseQuarterFormPhysical
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
