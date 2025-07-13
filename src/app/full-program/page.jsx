"use client"

import { useState, useEffect } from "react"
import AppSidebarUpdated from "./components/app-sidebar-updated"
import MainContentUpdated from "./components/main-content-updated"
import MasterLayout from "@/masterLayout/MasterLayout"
import { isAuthenticated } from "./utils/auth-utils"
import "./globals.css"
import styles from "./styles/globals.module.css"
import Breadcrumb from "@/components/Breadcrumb"

export default function FullProgramPage() {
  const [activeContent, setActiveContent] = useState("dashboard")
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedAbaPatientId, setSelectedAbaPatientId] = useState(null)
  const [selectedOccupationalPatientId, setSelectedOccupationalPatientId] = useState(null)
  const [selectedPhysicalPatientId, setSelectedPhysicalPatientId] = useState(null)
  const [selectedSpecialPatientId, setSelectedSpecialPatientId] = useState(null)
  const [selectedSpeechPatientId, setSelectedSpeechPatientId] = useState(null)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsAuth(authenticated)
      setLoading(false)

      if (!authenticated) {
        window.location.href = "/sign-in"
      }
    }

    checkAuth()
  }, [])

  const handleContentChange = (content, patientId = null) => {
    console.log("handleContentChange called with content:", content, "and patientId:", patientId)
    setActiveContent(content)
    if (content === "aba-plan-editor" || content === "aba-exam-editor") {
      setSelectedAbaPatientId(patientId)
    } 
    else if (content === "occupational-plan-editor" || content === "occupational-exam-editor") {
      setSelectedOccupationalPatientId(patientId)
    }
        else if (content === "physical-plan-editor" || content === "physical-exam-editor") {
      setSelectedPhysicalPatientId(patientId)
    }
        else if (content === "special-plan-editor" || content === "special-exam-editor") {
      setSelectedSpecialPatientId(patientId)
    }
        else if (content === "speech-plan-editor" || content === "speech-exam-editor") {
      setSelectedSpeechPatientId(patientId)
    }
    else
    {
      setSelectedAbaPatientId(null)
      setSelectedOccupationalPatientId(null)
      setSelectedSpeechPatientId(null)
      setSelectedSpecialPatientId(null)
      setSelectedPhysicalPatientId(null)


    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Healthcare System...</p>
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the Healthcare System.</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <MasterLayout>
        <Breadcrumb 
  heading="Full Program" 
  title="Full Program" 
/>
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
          onNavigateContent={handleContentChange} // NEW: Pass handleContentChange as onNavigateContent
        />
      </div>
    </MasterLayout>
  )
}
