"use client"

import { useState } from "react"
import RBACWrapper from "@/components/RBACWrapper"
import AppSidebarUpdated from "./components/app-sidebar-updated"
import MainContentUpdated from "./components/main-content-updated"
import MasterLayout from "@/masterLayout/MasterLayout"
import { DoctorLanguageProvider } from "../../contexts/doctor-language-context"
import DoctorHeader from "../../components/doctor-header"
import { FullProgramLoadingProgress } from "./components/full-program-loading-progress"
import "./globals.css"
import styles from "./styles/globals.module.css"
import Breadcrumb from "@/components/Breadcrumb"
import axiosInstance from "@/helper/axiosSetup"

function FullProgramPageContent({ user, handleLogout }) {
  const [activeContent, setActiveContent] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAbaPatientId, setSelectedAbaPatientId] = useState(null)
  const [selectedOccupationalPatientId, setSelectedOccupationalPatientId] = useState(null)
  const [selectedPhysicalPatientId, setSelectedPhysicalPatientId] = useState(null)
  const [selectedSpecialPatientId, setSelectedSpecialPatientId] = useState(null)
  const [selectedSpeechPatientId, setSelectedSpeechPatientId] = useState(null)
  const [selectedPsychotherapyPatientId, setSelectedPsychotherapyPatientId] = useState(null)

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
    } catch (error) {
      console.error("Error triggering manual subscription check:", error)
      setSubscriptionCheckMessage(error.response?.data?.message || "Failed to perform subscription check.")
      setSubscriptionCheckError(true)
    } finally {
      setIsCheckingSubscriptions(false)
    }
  }

  const handleLoadingComplete = async () => {
    setIsLoading(false)
    // Trigger the subscription check after loading is complete
    await handleManualSubscriptionCheck()
  }

  const handleContentChange = (content, patientId = null) => {
    setActiveContent(content)
    if (content === "aba-plan-editor" || content === "aba-exam-editor") {
      setSelectedAbaPatientId(patientId)
    } else if (content === "occupational-plan-editor" || content === "occupational-exam-editor") {
      setSelectedOccupationalPatientId(patientId)
    } else if (content === "physical-plan-editor" || content === "physical-exam-editor") {
      setSelectedPhysicalPatientId(patientId)
    } else if (content === "Psychotherapy-plan-editor" || content === "Psychotherapy-exam-editor") {
      setSelectedPsychotherapyPatientId(patientId)
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
      setSelectedPsychotherapyPatientId(null)
    }
  }

  // Show loading progress on initial load
  if (isLoading) {
    return <FullProgramLoadingProgress onComplete={handleLoadingComplete} />
  }

  if (user?.role === "doctor") {
    return (
      <DoctorLanguageProvider>
        <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
          <DoctorHeader user={user} loading={false} onLoginClick={() => {}} onLogout={handleLogout} />
          <div style={{ padding: "2rem" }}>
            <div className={styles.appContainer}>
              <AppSidebarUpdated onContentChange={handleContentChange} />
              <MainContentUpdated
                activeContent={activeContent}
                selectedAbaPatientId={selectedAbaPatientId}
                selectedOccupationalPatientId={selectedOccupationalPatientId}
                selectedPhysicalPatientId={selectedPhysicalPatientId}
                selectedPsychotherapyPatientId={selectedPsychotherapyPatientId}
                selectedSpecialPatientId={selectedSpecialPatientId}
                selectedSpeechPatientId={selectedSpeechPatientId}
                onBackToDashboard={() => handleContentChange("dashboard")}
                onNavigateContent={handleContentChange}
              />
            </div>
          </div>
        </div>
      </DoctorLanguageProvider>
    )
  }

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
          selectedPsychotherapyPatientId={selectedPsychotherapyPatientId}
          selectedSpecialPatientId={selectedSpecialPatientId}
          selectedSpeechPatientId={selectedSpeechPatientId}
          onBackToDashboard={() => handleContentChange("dashboard")}
          onNavigateContent={handleContentChange}
        />
      </div>
    </MasterLayout>
  )
}

export default function FullProgramPage() {
  return (
    <RBACWrapper allowedRoles={["admin", "doctor", "headdoctor"]} loadingMessage="Loading full program page...">
      <FullProgramPageContent />
    </RBACWrapper>
  )
}
