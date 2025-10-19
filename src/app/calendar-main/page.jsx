"use client"
import RBACWrapper from "@/components/RBACWrapper"
import Breadcrumb from "@/components/Breadcrumb"
import CalendarMainLayer from "@/components/CalendarMainLayer"
import MasterLayout from "@/masterLayout/MasterLayout"
import DoctorHeader from "@/components/doctor-header"
import styles from "./styles/loading.module.css"
import { useRoleBasedAuth } from "@/hooks/useRoleBasedAuth"

function CalendarContent() {
  const { user, loading, logout } = useRoleBasedAuth()

  if (loading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading calendar...</p>
      </div>
    )
  }

  // Render for doctor role
  if (user.role === "doctor") {
    return (
      <div className={styles.doctorLayoutContainer}>
        <DoctorHeader user={user} loading={false} onLoginClick={() => {}} onLogout={logout} />
        <div>
          <CalendarMainLayer user={user} />
        </div>
      </div>
    )
  }

  // Render for admin/HeadDoctor roles
  return (
    <MasterLayout>
      <Breadcrumb heading="Calendar" title="Calendar" />
      <CalendarMainLayer user={user} />
    </MasterLayout>
  )
}

export default function CalendarMainPage() {
  return (
    <RBACWrapper>
      <CalendarContent />
    </RBACWrapper>
  )
}
