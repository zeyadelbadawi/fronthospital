"use client"

import { SidebarInset } from "./ui/sidebar"
import { useContentStore } from "../store/content-store"
import { SchoolAppointments } from "./school-appointments"
import { SchoolAppointmentsAssignment } from "./school-appointments-assignment"

import AllPatientsSchool from "./all-patients-school"
import styles from "../styles/main-content.module.css"

export function MainContent() {
  const { activeContent } = useContentStore()

  const renderContent = () => {
    if (!activeContent) {
      return <SchoolAppointments />
    }

    const { department, type } = activeContent

    if (department === "school-up") {
      if (type === "appointments") {
        return <SchoolAppointments />
      }
    }

    if (department === "school-assign") {
      if (type === "assign-doctors") {
        return <SchoolAppointmentsAssignment />
      }
    }

    if (department === "school-p") {
      if (type === "patients") {
        return <AllPatientsSchool />
      }
    }

    return <SchoolAppointments />
  }

  return (
    <SidebarInset className={styles.mainContent}>
      <main className={styles.mainBody}>{renderContent()}</main>
    </SidebarInset>
  )
}
