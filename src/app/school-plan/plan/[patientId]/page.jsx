"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, User, FileText, Save, Clock, Mail, Phone, Calendar, Brain, Download, Upload, Eye, Edit3, CheckCircle, AlertCircle } from 'lucide-react'
import axiosInstance from "@/helper/axiosSetup"
import SyncfusionDocx from "@/components/SyncfusionDocx2"
import styles from "../styles/patient-school-plan-editor.module.css"

const PatientSchoolPlanEditor = () => {
  const params = useParams()
  const router = useRouter()
  const patientId = params.patientId

  const [patient, setPatient] = useState(null)
  const [plan, setPlan] = useState({
    title: "",
    filePath: "",
    fileName: "",
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [planStats, setPlanStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    lastUpdated: null,
  })

  useEffect(() => {
    fetchPatientData()
    fetchExistingPlan()
    fetchPlanStats()
  }, [patientId])

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
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/school/plan/${patientId}`)

      console.log("Existing plan data fetched:", response.data)
      setPlan(response.data || { title: "", filePath: "", fileName: "" })
    } catch (error) {
      console.error("Error fetching plan data:", error)
      // Don't show error for missing plan as it's expected for new students
    }
  }

  const fetchPlanStats = async () => {
    try {
      // Fetch appointment statistics for this patient
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/by-patient/${patientId}`,
      )

      const appointments = response.data.appointments || []
      const stats = {
        totalSessions: appointments.length,
        completedSessions: appointments.filter((app) => app.status === "completed").length,
        upcomingSessions: appointments.filter((app) => app.status !== "completed").length,
        lastUpdated: appointments.length > 0 ? appointments[0].updatedAt : null,
      }

      setPlanStats(stats)
    } catch (error) {
      console.error("Error fetching plan stats:", error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const planData = {
        ...plan,
        patient: patientId,
        lastModified: new Date().toISOString(),
      }

      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/school/plan`, planData)

      setPlan(response.data)
      showSuccessMessage("Plan saved successfully!")
      await fetchPlanStats() // Refresh stats after saving
    } catch (error) {
      console.error("Error saving plan:", error)
      showErrorMessage("Error saving plan: " + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleBackToList = () => {
    router.back()
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
                Back to School Evaluation Students
              </button>
              <div className={styles.studentInfo}>
                <h1 className={styles.planTitle}>
                  <Brain className={styles.titleIcon} />
                  School Evaluation Plan
                </h1>
                <div className={styles.studentDetails}>
                  <div className={styles.studentDetail}>
                    <User className={styles.detailIcon} />
                    <span className={styles.studentName}>{patient.name}</span>
                  </div>
                  <div className={styles.studentDetail}>
                    <span className={styles.studentId}>ID: {patient._id}</span>
                  </div>
                  {patient.email && (
                    <div className={styles.studentDetail}>
                      <Mail className={styles.detailIcon} />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  {patient.phone && (
                    <div className={styles.studentDetail}>
                      <Phone className={styles.detailIcon} />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
         
 
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Calendar className={styles.statIconSvg} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{planStats.totalSessions}</div>
              <div className={styles.statLabel}>Total Sessions</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.completedIcon}`}>
              <CheckCircle className={styles.statIconSvg} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{planStats.completedSessions}</div>
              <div className={styles.statLabel}>Completed</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.upcomingIcon}`}>
              <Clock className={styles.statIconSvg} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{planStats.upcomingSessions}</div>
              <div className={styles.statLabel}>Upcoming</div>
            </div>
          </div>
   
        </div>

        {/* Main Content */}
        <div className={styles.planBody}>
          <div className={styles.documentSection}>
            <div className={styles.documentContainer}>
              <SyncfusionDocx
                userData={{
                  docxId: plan._id,
                  patientId,
                  filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/school-plan/plan/${
                    plan.filePath || "school-plan.doc"
                  }`,
                  fileName: plan.fileName || "school-plan.doc",
                  docxName: `school-plan-${patient.name}`,
                }}
                planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/school/upload-plan`}
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

          {/* Additional Information Panel */}
         
        </div>
      </div>
    </div>
  )
}

export default PatientSchoolPlanEditor
