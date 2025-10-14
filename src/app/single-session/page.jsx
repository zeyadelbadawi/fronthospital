"use client"

import { useState } from "react"
import RBACWrapper from "@/components/RBACWrapper"
import { SidebarProvider } from "./components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { MainContent } from "./components/main-content"
import { SingleLoadingProgress } from "./components/single-loading-progress"
import MasterLayout from "@/masterLayout/MasterLayout"
import Breadcrumb from "@/components/Breadcrumb"
import { DoctorLanguageProvider } from "../../contexts/doctor-language-context"
import DoctorHeader from "../../components/doctor-header"

import "./globals.css"
import styles from "./styles/globals.module.css"

function SingleSessionPageContent({ user, handleLogout }) {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  // Show loading progress on initial load
  if (isLoading) {
    return <SingleLoadingProgress onComplete={handleLoadingComplete} />
  }

  if (user?.role === "doctor") {
    return (
      <DoctorLanguageProvider>
        <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
          <DoctorHeader user={user} loading={false} onLoginClick={() => {}} onLogout={handleLogout} />
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

  return (
    <MasterLayout>
      <Breadcrumb heading="Single Session" title="Single Session" />
      <div className={styles.appContainer}>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <MainContent />
        </SidebarProvider>
      </div>
    </MasterLayout>
  )
}

export default function SingleSessionPage() {
  return (
    <RBACWrapper allowedRoles={["admin", "doctor", "headdoctor"]} loadingMessage="Loading single session page...">
      <SingleSessionPageContent />
    </RBACWrapper>
  )
}
