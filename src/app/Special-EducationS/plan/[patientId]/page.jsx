"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, User, FileText, Save, Clock, Mail, Phone, Calendar, Brain, Download, Upload, Eye, Edit3, CheckCircle, AlertCircle } from 'lucide-react'
import axiosInstance from "@/helper/axiosSetup"
import SyncfusionDocxCase from "@/components/SyncfusionDocxCase"
import styles from "../styles/patient-school-plan-editor.module.css"

const PatientPlanEditor = () => {
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
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/SpecialEducationS/plan/${patientId}`)

      console.log("Existing plan data fetched:", response.data)
      setPlan(response.data || { title: "", filePath: "", fileName: "" })
    } catch (error) {
      console.error("Error fetching plan data:", error)
      // Don't show error for missing plan as it's expected for new students
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
                Back to all Appointments
              </button>
              <div className={styles.studentInfo}>
                <h1 className={styles.planTitle}>
                  <Brain className={styles.titleIcon} />
                   Single Session Special Education
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


        {/* Main Content */}
        <div className={styles.planBody}>
          <div className={styles.documentSection}>
            <div className={styles.documentContainer}>
        <SyncfusionDocxCase
                            userData={{
                              docxId: plan._id,
                              patientId,
                              filePath: `${
                                process.env.NEXT_PUBLIC_API_URL
                              }/uploads/Special-EducationS/plan/${
                                plan.filePath || "Special-Education-plan-defoult.docx"
                              }`,
                              fileName:
                                plan.fileName || "Special-Education-plan-defoult.docx",
                              docxName: `Special-Education-plan-${patient.name}.docx`,
                            }}
                            planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/SpecialEducationS/upload-plan`}
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

export default PatientPlanEditor
