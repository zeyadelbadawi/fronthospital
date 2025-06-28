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

import AllPatientsPhysicalTherapy from "./all-patients-physical-therapy"
import AllPatientsOccupationalTherapy from "./all-patients-occupational-therapy"
import AllPatientsSpecialEducation from "./all-patients-Special-Education"
import AllPatientsSpeech from "./all-patients-speech"



import { PatientsView } from "./patients-view"
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
      else if (type === "COMPLETE-Evaulations") {
        return <SpeechAppointmentCompletion appointmentId={activeContent.appointmentId} />
      }else if (type === "appointments") {
        return <SpeechAppointments />
      }
      
 
    }


    return <WelcomeView />
  }

  return (
    <SidebarInset className={styles.mainContent}>
      <header className={styles.mainHeader}>
        <div className={styles.headerTitle}>
          <h5>
            Full Program Management
          </h5>
        </div>
      </header>
      <main className={styles.mainBody}>{renderContent()}</main>
    </SidebarInset>
  )
}
