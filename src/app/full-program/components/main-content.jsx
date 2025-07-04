"use client"

import { SidebarInset, useSidebar } from "./ui/sidebar"
import { useContentStore } from "../store/content-store"
import { AssignPatientsToPhysicalTherapy } from "./assign-patients-physical-therapy"
import { AssignPatientsToAba } from "./assign-patients-aba"
import { AssignPatientsToOccupationalTherapy } from "./AssignTo-OccupationalTherapy"
import { AssignPatientsToSpecialEducation } from "./assign-patients-Special-Education"
import { AssignPatientsToSpeech } from "./assign-patients-speech"
import { SpeechAppointments } from "./speech-appointments"
import { SpeechUpcomingAppointments } from "./speech-upcoming-appointments"
import { useEffect, useState } from "react"
import { SpeechAppointmentCompletion } from "./speech-appointment-completion"
import { DoctorAppointments } from "./doctor-appointments"
import { AccountantAppointments } from "./accountant-appointments"

import AllPatientsPhysicalTherapy from "./all-patients-physical-therapy"
import AllPatientsOccupationalTherapy from "./all-patients-occupational-therapy"
import AllPatientsSpecialEducation from "./all-patients-Special-Education"
import AllPatientsSpeech from "./all-patients-speech"



import { WelcomeView } from "./welcome-view"
import styles from "../styles/main-content.module.css"
import AllPatientsAba from "./all-patients-aba"

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
      if (type === "assign-patient") {
        return <AssignPatientsToAba />
      } else if (type === "patients") {
        return <AllPatientsAba />
      }
    }

    if (department === "occupational-therapy") {
      if (type === "assign-patient") {
        return <AssignPatientsToOccupationalTherapy />
      } else if (type === "patients") {
        return <AllPatientsOccupationalTherapy />
      }
    }

    if (department === "special-education") {
      if (type === "assign-patient") {
        return <AssignPatientsToSpecialEducation />
      } else if (type === "patients") {
        return <AllPatientsSpecialEducation />
      }
    }

    if (department === "speech") {
      if (type === "assign-patient") {
        return <AssignPatientsToSpeech />
      } else if (type === "patients") {
        return <AllPatientsSpeech />
      }
                else if (type === "appointments") {
        return <SpeechAppointments />
      }
    }
    if (department === "New-Evaulations-Appointments") {
      if (type === "upcoming-Evaulations") {
        return <SpeechUpcomingAppointments />
      }
      else if (type === "doctor") {
        return <DoctorAppointments />
      }else if (type === "accountant") {
        return <AccountantAppointments />
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
