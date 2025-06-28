"use client"

import { SidebarInset, SidebarTrigger } from "./ui/sidebar"
import { useContentStore } from "../store/content-store"
import { SpeechAppointments } from "./speech-appointments"

import AllPatientsSpeech from "./all-patients-speech"

import { WelcomeView } from "./welcome-view"
import styles from "../styles/main-content.module.css"

export function MainContent() {
  const { activeContent } = useContentStore()

  const renderContent = () => {
    if (!activeContent) {
      return <SpeechAppointments />
    }

    const { department, type } = activeContent




    if (department === "speech") {
     if (type === "patients") {
        return <AllPatientsSpeech />
      }
                else if (type === "appointments") {
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
