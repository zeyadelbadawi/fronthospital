"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppSidebarUpdated from "./components/app-sidebar-updated"
import MainContentUpdated from "./components/main-content-updated"
import MasterLayout from "@/masterLayout/MasterLayout"
import { DoctorLanguageProvider } from "../../contexts/doctor-language-context"
import DoctorHeader from "../../components/doctor-header"
import { isAuthenticated, getCurrentUserRole } from "./utils/auth-utils"
import { FullProgramLoadingProgress } from "./components/full-program-loading-progress"
import UserRoleLoader from "./components/user-role-loader"
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
  const [selectedPsychotherapyPatientId, setSelectedPsychotherapyPatientId] = useState(null)

  // New states for user management
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

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
    } catch (error) {
      console.error("Error triggering manual subscription check:", error)
      setSubscriptionCheckMessage(error.response?.data?.message || "Failed to perform subscription check.")
      setSubscriptionCheckError(true)
    } finally {
      setIsCheckingSubscriptions(false)
    }
  }

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setIsLoadingUser(false)
        return
      }

      const response = await axiosInstance.get("/authentication/profile")
      const userData = response.data
      setUser(userData)
      setUserRole(userData.role)
    } catch (error) {
      console.error("Error fetching user data:", error)
      // Handle token refresh if needed
      if (error.response?.status === 403) {
        try {
          const refreshResponse = await axiosInstance.post("/authentication/refresh")
          localStorage.setItem("token", refreshResponse.data.accessToken)

          const retryResponse = await axiosInstance.get("/authentication/profile")
          const userData = retryResponse.data
          setUser(userData)
          setUserRole(userData.role)
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError)
          router.replace("/sign-in")
          return
        }
      }
    } finally {
      setIsLoadingUser(false)
    }
  }

  // Handle logout for doctor
  const handleDoctorLogout = async () => {
    try {
      await axiosInstance.post("/authentication/logout")
      localStorage.removeItem("token")
      setUser(null)
      setUserRole(null)
      router.push("/sign-in")
    } catch (error) {
      console.error("Logout failed:", error)
      // Force logout even if API call fails
      localStorage.removeItem("token")
      setUser(null)
      setUserRole(null)
      router.push("/sign-in")
    }
  }

  useEffect(() => {
    const checkAccess = async () => {
      const authenticated = isAuthenticated()
      const currentUserRole = getCurrentUserRole()

      // Allowed roles for full program: admin, doctor, student, accountant
      const allowedRoles = ["admin", "doctor", "student", "accountant"]

      // If not authenticated or role not allowed, redirect immediately
      if (!authenticated || !allowedRoles.includes(currentUserRole)) {
        router.replace("/error")
        return
      }

      // If access is granted, fetch user data
      setAccessGranted(true)
      await fetchUserData()
    }

    checkAccess()
  }, [router])

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

  // Don't render anything until access is verified
  if (!accessGranted) {
    return null
  }

  // Show loading progress if access is granted but still loading
  if (isLoading) {
    return <FullProgramLoadingProgress onComplete={handleLoadingComplete} />
  }

  // Show user loading state
  if (isLoadingUser) {
    return <UserRoleLoader />
  }

  // Render for doctor role - use DoctorHeader layout
  if (userRole === "doctor") {
    return (
      <DoctorLanguageProvider>
        <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
          <DoctorHeader user={user} loading={false} onLoginClick={() => {}} onLogout={handleDoctorLogout} />
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

  // Render for all other roles - use MasterLayout
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
