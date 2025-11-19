"use client"
import { SidebarInset, useSidebar } from "./ui/sidebar"
import { useContentStore } from "../store/content-store"
import { AppointmentsManagement } from "./appointments"
import UnifiedPatientsManagement from "./unified-patients-management"
import { AppointmentAssignmentManager } from "./appointment-assignment-manager"
import { useEffect } from "react"
import styles from "../styles/main-content.module.css"

export function MainContent() {
  const { activeContent } = useContentStore()
  const { setOpen } = useSidebar()

  useEffect(() => {
    if (activeContent?.type === "upcoming-appointments") {
      setOpen(false) // Hide sidebar for upcoming appointments
    } else {
      setOpen(true) // Show sidebar for other content
    }
  }, [activeContent, setOpen])

  const renderContent = () => {
    if (!activeContent) {
      return <AppointmentsManagement />
    }

    const { department, type, therapyType } = activeContent

    if (department === "appointments" && type === "manage-assignments") {
      return <AppointmentAssignmentManager />
    }

    // Handle appointments
    if (department === "appointments" && type === "appointments") {
      return <AppointmentsManagement />
    }

    // Handle all patient management with unified component
    if (type === "patients" && therapyType) {
      return <UnifiedPatientsManagement therapyType={therapyType} />
    }

    // Default fallback
    return <AppointmentsManagement />
  }

  return (
    <SidebarInset className={styles.mainContent}>
      <main className={styles.mainBody}>{renderContent()}</main>
    </SidebarInset>
  )
}
