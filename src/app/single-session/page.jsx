"use client"


import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "./components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { MainContent } from "./components/main-content"
import { SingleLoadingProgress } from "./components/single-loading-progress"
import { isAuthenticated, hasSchoolAccess } from "./utils/auth-utils"
import MasterLayout from "@/masterLayout/MasterLayout"
import Breadcrumb from "@/components/Breadcrumb"

import "./globals.css"
import styles from "./styles/globals.module.css"




export default function FullProgramPage() {
  
  
    const [isLoading, setIsLoading] = useState(true)
    const [accessGranted, setAccessGranted] = useState(false)
    const router = useRouter()
  
    useEffect(() => {
      const checkAccess = () => {
        const authenticated = isAuthenticated()
        const schoolAccess = hasSchoolAccess()
  
        // If not authenticated or doesn't have school access, redirect immediately
        if (!authenticated || !schoolAccess) {
          router.replace("/error")
          return
        }
  
        // If access is granted, allow loading to proceed
        setAccessGranted(true)
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
  
    // Show loading progress if access is granted
    if (isLoading) {
      return <SingleLoadingProgress onComplete={handleLoadingComplete} />
    }

  return (
      <>

          <MasterLayout>

    <div className={styles.appContainer}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <MainContent />
      </SidebarProvider>
    </div>
              </MasterLayout>
    </>
  )
}
