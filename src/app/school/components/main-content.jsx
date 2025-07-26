"use client"

import { SidebarInset, SidebarTrigger } from "./ui/sidebar"
import { useContentStore } from "../store/content-store"
import { SchoolAppointments } from "./school-appointments"

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
