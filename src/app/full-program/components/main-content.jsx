"use client"

import { SidebarInset, SidebarTrigger } from "./ui/sidebar"
import { useContentStore } from "../store/content-store"
import { AssignPatientsToPhysicalTherapy } from "./assign-patients-physical-therapy"
import { PatientsView } from "./patients-view"
import { WelcomeView } from "./welcome-view"
import styles from "../styles/main-content.module.css"

export function MainContent() {
  const activeContent = useContentStore((state) => state.activeContent)

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
        return <PatientsView department="Physical Therapy" />
      }
    }

    // Handle other departments (you can expand these)
    if (department === "aba") {
      if (type === "assign-patient") {
        return <div className={styles.contentPlaceholder}>ABA Assign Patient - Coming Soon</div>
      } else if (type === "patients") {
        return <PatientsView department="ABA" />
      }
    }

    if (department === "occupational-therapy") {
      if (type === "assign-patient") {
        return <div className={styles.contentPlaceholder}>Occupational Therapy Assign Patient - Coming Soon</div>
      } else if (type === "patients") {
        return <PatientsView department="Occupational Therapy" />
      }
    }

    if (department === "special-education") {
      if (type === "assign-patient") {
        return <div className={styles.contentPlaceholder}>Special Education Assign Patient - Coming Soon</div>
      } else if (type === "patients") {
        return <PatientsView department="Special Education" />
      }
    }

    if (department === "speech") {
      if (type === "assign-patient") {
        return <div className={styles.contentPlaceholder}>Speech Assign Patient - Coming Soon</div>
      } else if (type === "patients") {
        return <PatientsView department="Speech" />
      }
    }

    return <WelcomeView />
  }

  return (
    <SidebarInset className={styles.mainContent}>
      <header className={styles.mainHeader}>
        <SidebarTrigger className={styles.sidebarTrigger} />
        <div className={styles.headerTitle}>
          <h4>
            {activeContent
              ? `${activeContent.department.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} - ${activeContent.type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
              : "Full Program Management"}
          </h4>
        </div>
      </header>
      <main className={styles.mainBody}>{renderContent()}</main>
    </SidebarInset>
  )
}
