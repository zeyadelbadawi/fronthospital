"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "./components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { MainContent } from "./components/main-content"
import { SchoolLoadingProgress } from "./components/school-loading-progress"
import { isAuthenticated, hasSchoolAccess } from "./utils/auth-utils"
import MasterLayout from "@/masterLayout/MasterLayout"
import Breadcrumb from "@/components/Breadcrumb"
import { DoctorLanguageProvider } from "../../contexts/doctor-language-context"
import DoctorHeader from "../../components/doctor-header"
import axiosInstance from "@/helper/axiosSetup"

import "./globals.css"
import styles from "./styles/globals.module.css"

export default function SchoolPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [accessGranted, setAccessGranted] = useState(false)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const router = useRouter()

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
      const schoolAccess = hasSchoolAccess()

      // If not authenticated or doesn't have school access, redirect immediately
      if (!authenticated || !schoolAccess) {
        router.replace("/error")
        return
      }

      // If access is granted, fetch user data
      setAccessGranted(true)
      await fetchUserData()
    }

    checkAccess()
  }, [router])

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  // Don't render anything until access is verified
  if (!accessGranted) {
    return null
  }

  // Show loading progress if access is granted but still loading
  if (isLoading) {
    return <SchoolLoadingProgress onComplete={handleLoadingComplete} />
  }

  // Show user loading state
  if (isLoadingUser) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading user information...</p>
      </div>
    )
  }

  // Render for doctor role - use DoctorHeader layout
  if (userRole === "doctor") {
    return (
      <DoctorLanguageProvider>
        <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
          <DoctorHeader user={user} loading={false} onLoginClick={() => {}} onLogout={handleDoctorLogout} />
          <div style={{ padding: "2rem" }}>
            <div className={styles.appContainer}>
              <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <MainContent />
              </SidebarProvider>
            </div>
          </div>
        </div>
      </DoctorLanguageProvider>
    )
  }

  // Render for all other roles - use MasterLayout
  return (
    <MasterLayout>
      <Breadcrumb heading="School Evaluations" title="School Evaluation" />
      <div className={styles.appContainer}>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <MainContent />
        </SidebarProvider>
      </div>
    </MasterLayout>
  )
}
