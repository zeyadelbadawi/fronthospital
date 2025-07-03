"use client"
import { SidebarInset, useSidebar } from "./ui/sidebar"
import { useContentStore } from "../store/content-store"
import { AppointmentsManagement } from "./appointments"
import AllPatientsPhysicalTherapy from "./all-patients-physical-therapy"
import AllPatientsOccupationalTherapy from "./all-patients-occupational-therapy"
import AllPatientsSpecialEducation from "./all-patients-Special-Education"
import AllPatientsSpeech from "./all-patients-speech"
import AllPatientsAba from "./all-patients-aba"
import { useEffect, useState } from "react"
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
    const { department, type } = activeContent

    if (department === "appontmentupcoming") {
      if (type === "appointments") {
        return <AppointmentsManagement />
      } 
         }
     

    if (department === "physical-therapy") {
      if (type === "patients") {
        return <AllPatientsPhysicalTherapy />
      }
 
    }

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

    if (department === "speech") {
 if (type === "patients") {
        return <AllPatientsSpeech />
 }
    }



    return <AppointmentsManagement />
  }

  return (
    <SidebarInset className={styles.mainContent}>
    
      <main className={styles.mainBody}>{renderContent()}</main>
    </SidebarInset>
  )
}
