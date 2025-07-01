"use client"

import { SidebarInset, SidebarTrigger } from "./ui/sidebar"
import { useContentStore } from "../store/content-store"
import { SpeechAppointments } from "./speech-appointments"

import AllPatientsSchool from "./all-patients-school"

import { WelcomeView } from "./welcome-view"
import styles from "../styles/main-content.module.css"

export function MainContent() {
  const { activeContent } = useContentStore()

  const renderContent = () => {
    if (!activeContent) {
      return <SpeechAppointments />
    }

    const { department, type } = activeContent




    if (department === "school-p") {
     if (type === "patients") {
        return <AllPatientsSchool />
      }
    }

    if (department === "school-up") {
      if (type === "appointments") {
         return <SpeechAppointments />
       }
     }

    return <WelcomeView />
  }

  return (
    <SidebarInset className={styles.mainContent}>
      
      <main className={styles.mainBody}>{renderContent()}</main>
    </SidebarInset>
  )
}
