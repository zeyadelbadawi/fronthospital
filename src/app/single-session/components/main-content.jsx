"use client"

import { SidebarInset, useSidebar } from "./ui/sidebar"
import { useContentStore } from "../store/content-store"
import { SpeechAppointments } from "./speech-appointments"
import { SpeechUpcomingAppointments } from "./speech-upcoming-appointments"

import AllPatientsPhysicalTherapy from "./all-patients-physical-therapy"
import AllPatientsOccupationalTherapy from "./all-patients-occupational-therapy"
import AllPatientsSpecialEducation from "./all-patients-Special-Education"
import AllPatientsSpeech from "./all-patients-speech"
import AllPatientsAba from "./all-patients-aba"

import { useEffect, useState } from "react"
import { WelcomeView } from "./welcome-view"
import styles from "../styles/main-content.module.css"

export function MainContent() {
  const { activeContent } = useContentStore()
  const { setOpen } = useSidebar()
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  useEffect(() => {
    if (activeContent?.type === "upcoming-appointments") {
      setOpen(false) // Hide sidebar for upcoming appointments
    } else {
      setOpen(true) // Show sidebar for other content
    }
  }, [activeContent, setOpen])

  const renderContent = () => {
    if (!activeContent) {
      return <WelcomeView />
    }
    const { department, type } = activeContent

    if (department === "appontmentupcoming") {
      if (type === "appointments") {
        return <SpeechAppointments />
      } 
         }
     

    // Handle Physical Therapy
    if (department === "physical-therapy") {
      if (type === "assign-patient") {
        return <AssignPatientsToPhysicalTherapy />
      } else if (type === "patients") {
        return <AllPatientsPhysicalTherapy />
      }
 
    }

    // Handle other departments (you can expand these)
    if (department === "aba") {
      if (type === "patients") {
        return <AllPatientsAba />
      }
    }

    if (department === "occupational-therapy") {
   if (type === "patients") {
        return <AllPatientsOccupationalTherapy />
      }
    }

    if (department === "special-education") {
  if (type === "patients") {
        return <AllPatientsSpecialEducation />
      }
    }

    // Handle Speech
    if (department === "speech") {
 if (type === "patients") {
        return <AllPatientsSpeech />
 }
    }



    return <WelcomeView />
  }

  return (
    <SidebarInset className={styles.mainContent}>
      <header className={styles.mainHeader}>
        <div className={styles.headerTitle}>
          <h5>
            Single Session Program Management
          </h5>
        </div>
      </header>
      <main className={styles.mainBody}>{renderContent()}</main>
    </SidebarInset>
  )
}
