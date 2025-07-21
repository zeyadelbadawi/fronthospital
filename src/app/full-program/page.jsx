"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppSidebarUpdated from "./components/app-sidebar-updated"
import MainContentUpdated from "./components/main-content-updated"
import MasterLayout from "@/masterLayout/MasterLayout"
import { isAuthenticated, getCurrentUserRole } from "./utils/auth-utils"
import { FullProgramLoadingProgress } from "./components/full-program-loading-progress"
import "./globals.css"
import styles from "./styles/globals.module.css"
import Breadcrumb from "@/components/Breadcrumb"
import axiosInstance from "@/helper/axiosSetup"

export default function FullProgramPage() {
  const [activeContent, setActiveContent] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [accessGranted, setAccessGranted] = useState(false)
  const [selectedAbaPatientId, setSelectedAbaPatientId] = useState(null)
  const [selectedOccupationalPatientId, setSelectedOccupationalPatientId] = useState(null)
  const [selectedPhysicalPatientId, setSelectedPhysicalPatientId] = useState(null)
  const [selectedSpecialPatientId, setSelectedSpecialPatientId] = useState(null)
  const [selectedSpeechPatientId, setSelectedSpeechPatientId] = useState(null)
  const router = useRouter()

  // States for the subscription checker
  const [isCheckingSubscriptions, setIsCheckingSubscriptions] = useState(false)
  const [subscriptionCheckMessage, setSubscriptionCheckMessage] = useState("")
  const [subscriptionCheckError, setSubscriptionCheckError] = useState(false)

  // Function to trigger the manual subscription checker
  const handleManualSubscriptionCheck = async () => {
    setIsCheckingSubscriptions(true)
    setSubscriptionCheckMessage("")
    setSubscriptionCheckError(false)
    try {
      const response = await axiosInstance.post("/manualSubscriptionChecker/manual-check-subscriptions")
      setSubscriptionCheckMessage(response.data.message || "Subscription check completed.")
      setSubscriptionCheckError(false)
      console.log("Subscription check results:", response.data.results)
    } catch (error) {
      console.error("Error triggering manual subscription check:", error)
      setSubscriptionCheckMessage(error.response?.data?.message || "Failed to perform subscription check.")
      setSubscriptionCheckError(true)
    } finally {
      setIsCheckingSubscriptions(false)
    }
  }

  useEffect(() => {
    const checkAccess = () => {
      const authenticated = isAuthenticated()
      const userRole = getCurrentUserRole()

      // Allowed roles for full program: admin, doctor, student, accountant
      const allowedRoles = ["admin", "doctor", "student", "accountant"]

      // If not authenticated or role not allowed, redirect immediately
      if (!authenticated || !allowedRoles.includes(userRole)) {
        router.replace("/error")
        return
      }

      // If access is granted, allow loading to proceed
      setAccessGranted(true)
    }

    checkAccess()
  }, [router])

  const handleLoadingComplete = async () => {
    setIsLoading(false)
    // Trigger the subscription check after loading is complete
    console.log("Triggering automatic subscription check after loading...")
    await handleManualSubscriptionCheck()
  }

  const handleContentChange = (content, patientId = null) => {
    console.log("handleContentChange called with content:", content, "and patientId:", patientId)
    setActiveContent(content)
    if (content === "aba-plan-editor" || content === "aba-exam-editor") {
      setSelectedAbaPatientId(patientId)
    } else if (content === "occupational-plan-editor" || content === "occupational-exam-editor") {
      setSelectedOccupationalPatientId(patientId)
    } else if (content === "physical-plan-editor" || content === "physical-exam-editor") {
      setSelectedPhysicalPatientId(patientId)
    } else if (content === "special-plan-editor" || content === "special-exam-editor") {
      setSelectedSpecialPatientId(patientId)
    } else if (content === "speech-plan-editor" || content === "speech-exam-editor") {
      setSelectedSpeechPatientId(patientId)
    } else {
      setSelectedAbaPatientId(null)
      setSelectedOccupationalPatientId(null)
      setSelectedSpeechPatientId(null)
      setSelectedSpecialPatientId(null)
      setSelectedPhysicalPatientId(null)
    }
  }

  // Don't render anything until access is verified
  if (!accessGranted) {
    return null
  }

  // Show loading progress if access is granted
  if (isLoading) {
    return <FullProgramLoadingProgress onComplete={handleLoadingComplete} />
  }

  // Render the actual page content
  return (
    <MasterLayout>
      <Breadcrumb heading="Full Program" title="Full Program" />
      <div className={styles.appContainer}>
        <AppSidebarUpdated onContentChange={handleContentChange} />
        <MainContentUpdated
          activeContent={activeContent}
          selectedAbaPatientId={selectedAbaPatientId}
          selectedOccupationalPatientId={selectedOccupationalPatientId}
          selectedPhysicalPatientId={selectedPhysicalPatientId}
          selectedSpecialPatientId={selectedSpecialPatientId}
          selectedSpeechPatientId={selectedSpeechPatientId}
          onBackToDashboard={() => handleContentChange("dashboard")}
          onNavigateContent={handleContentChange}
        />
      </div>
    </MasterLayout>
  )
}
