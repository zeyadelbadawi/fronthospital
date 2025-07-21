"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, User, Clock, Calendar, Brain, AlertCircle, Hash, Save, Loader2 } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import SyncfusionDocx from "@/components/SyncfusionDocx2"
import styles from "../styles/patient-school-plan-editor.module.css"

const PatientSchoolPlanEditor = ({ patientId, unicValue, onBack }) => {
  const [patient, setPatient] = useState(null)
  const [plan, setPlan] = useState({
    title: "",
    filePath: "",
    fileName: "",
    programDescription: "",
    planContent: "",
  })
  const [programInfo, setProgramInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [planStats, setPlanStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    lastUpdated: null,
  })

  useEffect(() => {
    if (patientId && unicValue) {
      console.log("Loading data for:", { patientId, unicValue })
      fetchPatientData()
      fetchExistingPlan()
      fetchPlanStats()
      fetchProgramInfo()
    }
  }, [patientId, unicValue])

  const fetchPatientData = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${patientId}`)
      console.log("Student data fetched:", response.data)
      setPatient(response.data)
    } catch (error) {
      console.error("Error fetching Student data:", error)
      showErrorMessage("Failed to load student data")
    } finally {
      setLoading(false)
    }
  }

  const fetchProgramInfo = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/school/program-info/${patientId}/${encodeURIComponent(unicValue)}`,
      )

      console.log("Program info fetched:", response.data)
      if (response.data.program) {
        setProgramInfo({
          unicValue: response.data.program.unicValue,
          description: response.data.program.description,
          date: response.data.program.date,
          time: response.data.program.time,
          status: response.data.program.status,
        })
      }
    } catch (error) {
      console.error("Error fetching program info:", error)
      showErrorMessage("Failed to load program information")
    }
  }

  const fetchExistingPlan = async () => {
    try {
      console.log("Fetching plan for:", { patientId, unicValue })
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/school/plan/${patientId}/${encodeURIComponent(unicValue)}`,
      )
      console.log("Existing plan data fetched:", response.data)

      const planData = response.data || {
        title: "School Program Plan",
        filePath: "",
        fileName: "",
        programDescription: "",
        planContent: "",
      }

      setPlan(planData)
    } catch (error) {
      console.error("Error fetching plan data:", error)
      // Don't show error for missing plan as it's expected for new programs
      setPlan({
        title: "School Program Plan",
        filePath: "",
        fileName: "",
        programDescription: "",
        planContent: "",
      })
    }
  }

  const fetchPlanStats = async () => {
    try {
      // Fetch appointment statistics for this specific program
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/by-patient/${patientId}`,
      )

      const appointments = response.data.appointments || []
      // Filter appointments for this specific unicValue
      const programAppointments = appointments.filter((app) => app.unicValue === unicValue)

      const stats = {
        totalSessions: programAppointments.length,
        completedSessions: programAppointments.filter((app) => app.status === "completed").length,
        upcomingSessions: programAppointments.filter((app) => app.status !== "completed").length,
        lastUpdated: programAppointments.length > 0 ? programAppointments[0].updatedAt : null,
      }

      setPlanStats(stats)
    } catch (error) {
      console.error("Error fetching plan stats:", error)
    }
  }

  // SAVE FUNCTION - Same as before but without navigation
  const handleSave = async () => {
    if (!patientId || !unicValue) {
      showErrorMessage("Missing required information to save Sheet")
      return
    }

    setSaving(true)
    try {
      console.log("Starting save process...")

      // Get the SyncfusionDocx component reference
      const syncfusionComponent = document.querySelector("#container")
      if (!syncfusionComponent) {
        showErrorMessage("Document editor not found")
        return
      }

      // Get the document editor instance
      const editorContainer = syncfusionComponent.ej2_instances?.[0]
      if (!editorContainer || !editorContainer.documentEditor) {
        showErrorMessage("Document editor not available")
        return
      }

      console.log("Getting document content...")

      // Get document content as blob - same as SyncfusionDocx2.jsx
      const documentContent = await editorContainer.documentEditor.saveAsBlob("Docx")
      console.log("Document blob created:", documentContent)

      if (!documentContent || documentContent.size === 0) {
        console.error("Document content is empty")
        showErrorMessage("Cannot save an empty document")
        return
      }

      // Create FormData - same as SyncfusionDocx2.jsx
      const formData = new FormData()

      // Create a proper file name
      const fileName = `${patientId}_${new Date().getTime()}.docx`

      // Append the document blob with proper filename
      formData.append("document", documentContent, fileName)
      formData.append("patientId", patientId)

      // DON'T append title to FormData to avoid array issue
      // Let the backend use its default title value

      console.log("FormData prepared:", {
        fileName,
        patientId: patientId,
        blobSize: documentContent.size,
        endpoint: `${process.env.NEXT_PUBLIC_API_URL}/school/upload-plan/${patientId}/${encodeURIComponent(unicValue)}`,
        note: "Title not included in FormData to avoid array casting issue",
      })

      // Send the form data to server - same endpoint as SyncfusionDocx2.jsx
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/school/upload-plan/${patientId}/${encodeURIComponent(unicValue)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 seconds timeout
        },
      )

      console.log("Save response:", response.data)

      // Handle the response
      if (response.status === 200) {
        console.log("Document saved successfully:", response.data)

        // Update local state with saved data
        if (response.data.plan) {
          setPlan((prevPlan) => ({
            ...prevPlan,
            ...response.data.plan,
            _id: response.data.plan._id,
          }))
        }

        showSuccessMessage("Sheet saved successfully!")
        await fetchPlanStats() // Refresh stats after saving
      } else {
        console.error("Error saving document:", response.statusText)
        showErrorMessage("Error saving document. Please try again.")
      }
    } catch (error) {
      console.error("Error in handleSave:", error)

      if (error.response) {
        console.error("Server response:", error.response.data)
        showErrorMessage(`Error saving document: ${error.response.data.message || error.message}`)
      } else if (error.request) {
        console.error("No response received:", error.request)
        showErrorMessage("No response from server. Please check your connection.")
      } else {
        console.error("Error setting up request:", error.message)
        showErrorMessage(`Error: ${error.message}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePlanContentChange = (content) => {
    setPlan((prevPlan) => ({
      ...prevPlan,
      planContent: content,
    }))
  }

  const handleBackToList = () => {
    if (onBack) {
      onBack()
    }
  }

  const showSuccessMessage = (message) => {
    const toast = document.createElement("div")
    toast.className = styles.successToast
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add(styles.show)
    }, 100)

    setTimeout(() => {
      toast.classList.remove(styles.show)
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 3000)
  }

  const showErrorMessage = (message) => {
    const toast = document.createElement("div")
    toast.className = styles.errorToast
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add(styles.show)
    }, 100)

    setTimeout(() => {
      toast.classList.remove(styles.show)
      setTimeout(() => document.body.removeChild(toast), 4000)
    }, 4000)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading student data...</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} />
        <h3>Student Not Found</h3>
        <p>The requested student could not be found.</p>
        <button onClick={handleBackToList} className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className={styles.planEditorContainer}>
      <div className={styles.planEditorCard}>
        {/* Header */}
        <div className={styles.planHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <button onClick={handleBackToList} className={styles.backButton}>
                <ArrowLeft className={styles.backIcon} />
                Back to All Sheets
              </button>
              <div className={styles.studentInfo}>
                <h1 className={styles.planTitle}>
                  <Brain className={styles.titleIcon} />
                  School Evaluation Sheet
                </h1>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button onClick={handleSave} className={styles.saveButton} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className={`${styles.saveIcon} ${styles.spinning}`} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className={styles.saveIcon} />
                    Save Sheet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Program Information Panel */}
        {programInfo && (
          <div className={styles.groupInfoContainer}>
            <div className={styles.groupInfoCard}>
              <h3 className={styles.groupInfoTitle}>Program Information</h3>
              <div className={styles.groupInfoGrid}>
                <div className={styles.groupInfoItem}>
                  <User className={styles.groupInfoIcon} />
                  <div className={styles.groupInfoContent}>
                    <span className={styles.groupInfoLabel}>Student Name</span>
                    <span className={styles.groupInfoValue}>{patient.name}</span>
                  </div>
                </div>
                <div className={styles.groupInfoItem}>
                  <Hash className={styles.groupInfoIcon} />
                  <div className={styles.groupInfoContent}>
                    <span className={styles.groupInfoLabel}>Program ID</span>
                    <span className={styles.groupInfoValue}>{programInfo.unicValue}</span>
                  </div>
                </div>
                <div className={styles.groupInfoItem}>
                  <Calendar className={styles.groupInfoIcon} />
                  <div className={styles.groupInfoContent}>
                    <span className={styles.groupInfoLabel}>Last Appointment Date</span>
                    <span className={styles.groupInfoValue}>{formatDate(programInfo.date)}</span>
                  </div>
                </div>
                <div className={styles.groupInfoItem}>
                  <Clock className={styles.groupInfoIcon} />
                  <div className={styles.groupInfoContent}>
                    <span className={styles.groupInfoLabel}>Last Appointment Time</span>
                    <span className={styles.groupInfoValue}>{formatDate(programInfo.time)}</span>
                  </div>
                </div>
                <div className={styles.groupInfoItem}>
                  <Brain className={styles.groupInfoIcon} />
                  <div className={styles.groupInfoContent}>
                    <span className={styles.groupInfoLabel}>Evaluation Status</span>
                    <span
                      className={`${styles.groupInfoValue} ${styles.statusBadge} ${styles[programInfo.status?.toLowerCase()]}`}
                    >
                      {programInfo.status || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={styles.planBody}>
          <div className={styles.documentSection}>
            <div className={styles.documentContainer}>
              <SyncfusionDocx
                userData={{
                  docxId: plan._id,
                  patientId,
                  unicValue,
                  filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/school-plan/plan/${
                    plan.filePath || "school-plan.doc"
                  }`,
                  fileName: plan.fileName || "school-plan.doc",
                  docxName: `school-plan-${patient.name}-${programInfo?.unicValue || "program"}`,
                }}
                planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/school/upload-plan/${patientId}/${encodeURIComponent(unicValue)}`}
                onContentChange={handlePlanContentChange}
              />
            </div>

            {plan.lastModified && (
              <div className={styles.documentFooter}>
                <div className={styles.lastModified}>
                  <Clock className={styles.clockIcon} />
                  <span>Last modified: {new Date(plan.lastModified).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientSchoolPlanEditor
