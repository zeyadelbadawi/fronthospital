"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  User,
  Clock,
  Calendar,
  Brain,
  AlertCircle,
  Hash,
  Save,
  Loader2,
  Mail,
  Phone,
  FileText,
  ClipboardList,
} from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import SyncfusionDocx2 from "@/components/SyncfusionDocx2"
import { useContentStore } from "../store/content-store"
import styles from "../styles/unified-plan-editor.module.css"

// Configuration for different therapy plan types based on your actual backend
const PLAN_CONFIGS = {
  aba: {
    title: "ABA Therapy Plan",
    subtitle: "Applied Behavior Analysis Treatment Plan",
    apiEndpoint: "/abaS/plan",
    uploadEndpoint: "/abaS/upload-plan",
    assignmentsEndpoint: "/abaS/ABA-assignments",
    defaultFileName: "ABA-plan-defoult.docx",
    uploadPath: "ABAS/plan",
    planType: "ABA Therapy",
    icon: Brain,
    color: "#8B5CF6", // Purple
  },
  speech: {
    title: "Speech Therapy Plan",
    subtitle: "Speech Language Pathology Treatment Plan",
    apiEndpoint: "/speechS/plan",
    uploadEndpoint: "/speechS/upload-plan",
    assignmentsEndpoint: "/speechS/Speech-assignments",
    defaultFileName: "Speech-plan-defoult.docx",
    uploadPath: "SpeechS/plan",
    planType: "Speech Therapy",
    icon: Brain,
    color: "#10B981", // Green
  },
  "physical-therapy": {
    title: "Physical Therapy Plan",
    subtitle: "Physical Rehabilitation Treatment Plan",
    apiEndpoint: "/physicalTherapyS/plan",
    uploadEndpoint: "/physicalTherapyS/upload-plan",
    assignmentsEndpoint: "/physicalTherapyS/physical-therapy-assignments",
    defaultFileName: "physical-therapy-plan-defoult.docx",
    uploadPath: "physical-therapyS/plan",
    planType: "Physical Therapy",
    icon: Brain,
    color: "#F59E0B", // Orange
  },
  "occupational-therapy": {
    title: "Occupational Therapy Plan",
    subtitle: "Occupational Rehabilitation Treatment Plan",
    apiEndpoint: "/OccupationalTherapyS/plan",
    uploadEndpoint: "/OccupationalTherapyS/upload-plan",
    assignmentsEndpoint: "/OccupationalTherapyS/Occupational-therapy-assignments",
    defaultFileName: "Occupational-therapy-plan-defoult.docx",
    uploadPath: "Occupational-therapyS/plan",
    planType: "Occupational Therapy",
    icon: Brain,
    color: "#EF4444", // Red
  },
  "special-education": {
    title: "Special Education Plan",
    subtitle: "Individualized Education Program (IEP)",
    apiEndpoint: "/SpecialEducationS/plan",
    uploadEndpoint: "/SpecialEducationS/upload-plan",
    assignmentsEndpoint: "/SpecialEducationS/Special-Education-assignments",
    defaultFileName: "Special-education-plan-defoult.docx",
    uploadPath: "Special-EducationS/plan",
    planType: "Special Education",
    icon: Brain,
    color: "#3B82F6", // Blue
  },
}

const UnifiedPlanEditor = ({ patientId, therapyType, onBack }) => {
  const [patient, setPatient] = useState(null)
  const [plan, setPlan] = useState({
    title: "",
    filePath: "",
    fileName: "",
    planContent: "",
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [planStats, setPlanStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    lastUpdated: null,
  })

  const setActiveContent = useContentStore((state) => state.setActiveContent)

  // Get configuration for current therapy type
  const config = PLAN_CONFIGS[therapyType]

  useEffect(() => {
    if (!config) {
      console.error(`Invalid therapy type: ${therapyType}`)
      return
    }
    if (patientId) {
      console.log("Loading data for:", { patientId, therapyType })
      fetchPatientData()
      fetchExistingPlan()
      fetchPlanStats()
    }
  }, [patientId, therapyType])

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

  const fetchExistingPlan = async () => {
    try {
      console.log("Fetching plan for:", { patientId, therapyType })
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}${config.apiEndpoint}/${patientId}`)
      console.log("Existing plan data fetched:", response.data)

      const planData = response.data || {
        title: config.title,
        filePath: "",
        fileName: "",
        planContent: "",
      }

      setPlan(planData)
    } catch (error) {
      console.error("Error fetching plan data:", error)
      // Don't show error for missing plan as it's expected for new programs
      setPlan({
        title: config.title,
        filePath: "",
        fileName: "",
        planContent: "",
      })
    }
  }

  const fetchPlanStats = async () => {
    try {
      // Use the correct assignments endpoint from your backend
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}${config.assignmentsEndpoint}`)

      const assignments = response.data || []
      // Filter assignments for this specific patient
      const patientAssignments = Array.isArray(assignments)
        ? assignments.filter((assignment) => assignment.patient?._id === patientId)
        : []

      const stats = {
        totalSessions: patientAssignments.length,
        completedSessions: patientAssignments.filter((assignment) => assignment.status === "completed").length,
        upcomingSessions: patientAssignments.filter((assignment) => assignment.status !== "completed").length,
        lastUpdated: patientAssignments.length > 0 ? patientAssignments[0].updatedAt : null,
      }

      setPlanStats(stats)
    } catch (error) {
      console.error("Error fetching plan stats:", error)
      // Set default stats if API call fails
      setPlanStats({
        totalSessions: 0,
        completedSessions: 0,
        upcomingSessions: 0,
        lastUpdated: null,
      })
    }
  }

  // SAVE FUNCTION - Similar to patient-school-plan-editor.jsx
  const handleSave = async () => {
    if (!patientId || !config) {
      showErrorMessage("Missing required information to save plan")
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

      // Get document content as blob
      const documentContent = await editorContainer.documentEditor.saveAsBlob("Docx")
      console.log("Document blob created:", documentContent)

      if (!documentContent || documentContent.size === 0) {
        console.error("Document content is empty")
        showErrorMessage("Cannot save an empty document")
        return
      }

      // Create FormData
      const formData = new FormData()

      // Create a proper file name
      const fileName = `${patientId}_${therapyType}_${new Date().getTime()}.docx`

      // Append the document blob with proper filename
      formData.append("document", documentContent, fileName)
      formData.append("patientId", patientId)

      console.log("FormData prepared:", {
        fileName,
        patientId: patientId,
        blobSize: documentContent.size,
        endpoint: `${process.env.NEXT_PUBLIC_API_URL}${config.uploadEndpoint}/${patientId}`,
      })

      // Send the form data to server
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}${config.uploadEndpoint}/${patientId}`,
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

        showSuccessMessage("Plan saved successfully!")
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
    } else {
      // Navigate back to the appropriate patient list
      setActiveContent({
        department: therapyType,
        type: "patients",
        therapyType: therapyType,
      })
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

  if (!config) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} />
        <h3>Invalid Therapy Type</h3>
        <p>The requested therapy type configuration could not be found.</p>
        <button onClick={handleBackToList} className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          Go Back
        </button>
      </div>
    )
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
        <div className={styles.planHeader} style={{ borderTopColor: config.color }}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <button onClick={handleBackToList} className={styles.backButton}>
                <ArrowLeft className={styles.backIcon} />
                Back to {config.planType} Students
              </button>
              <div className={styles.studentInfo}>
                <h1 className={styles.planTitle}>
                  <config.icon className={styles.titleIcon} style={{ color: config.color }} />
                  {config.title}
                </h1>
                <p className={styles.planSubtitle}>{config.subtitle}</p>
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
                    Save Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Student Information Panel */}
        <div className={styles.studentInfoContainer}>
          <div className={styles.studentInfoCard}>
            <h3 className={styles.studentInfoTitle}>Student Information</h3>
            <div className={styles.studentInfoGrid}>
              <div className={styles.studentInfoItem}>
                <User className={styles.studentInfoIcon} />
                <div className={styles.studentInfoContent}>
                  <span className={styles.studentInfoLabel}>Student Name</span>
                  <span className={styles.studentInfoValue}>{patient.name}</span>
                </div>
              </div>
             
              {patient.email && (
                <div className={styles.studentInfoItem}>
                  <Mail className={styles.studentInfoIcon} />
                  <div className={styles.studentInfoContent}>
                    <span className={styles.studentInfoLabel}>Email</span>
                    <span className={styles.studentInfoValue}>{patient.email}</span>
                  </div>
                </div>
              )}
              {patient.phone && (
                <div className={styles.studentInfoItem}>
                  <Phone className={styles.studentInfoIcon} />
                  <div className={styles.studentInfoContent}>
                    <span className={styles.studentInfoLabel}>Phone Number</span>
                    <span className={styles.studentInfoValue}>{patient.phone}</span>
                  </div>
                </div>
              )}
              <div className={styles.studentInfoItem}>
                <Brain className={styles.studentInfoIcon} />
                <div className={styles.studentInfoContent}>
                  <span className={styles.studentInfoLabel}>Therapy Type</span>
                  <span
                    className={`${styles.studentInfoValue} ${styles.therapyBadge}`}
                    style={{ backgroundColor: config.color + "20", color: config.color }}
                  >
                    {config.planType}
                  </span>
                </div>
              </div>
        
            </div>
          </div>

          
        </div>

        {/* Main Content */}
        <div className={styles.planBody}>
          <div className={styles.documentSection}>
            <div className={styles.documentContainer}>
              <SyncfusionDocx2
                userData={{
                  docxId: plan._id,
                  patientId,
                  filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/${config.uploadPath}/${
                    plan.filePath || config.defaultFileName
                  }`,
                  fileName: plan.fileName || config.defaultFileName,
                  docxName: `${therapyType}-plan-${patient.name}-${new Date().getTime()}`,
                }}
                planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}${config.uploadEndpoint}/${patientId}`}
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

export default UnifiedPlanEditor
