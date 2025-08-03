"use client"
import Breadcrumb from "@/components/Breadcrumb"
import CalendarMainLayer from "@/components/CalendarMainLayer"
import MasterLayout from "@/masterLayout/MasterLayout"
import DoctorHeader from "@/components/doctor-header"
import UserRoleLoader from "./components/user-role-loader"
import styles from "./styles/loading.module.css"

const Page = () => {
  const handleLoginClick = () => {
    window.location.href = "/sign-in"
  }

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token")
      window.location.href = "/sign-in"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <UserRoleLoader>
      {({ user: loadedUser, loading }) => {
        // If user is a doctor, show DoctorHeader layout
        if (loadedUser?.role === "doctor") {
          return (
            <div className={styles.doctorLayoutContainer}>
              <DoctorHeader
                user={loadedUser}
                loading={loading}
                onLoginClick={handleLoginClick}
                onLogout={handleLogout}
                title="Rukn Elwatikon Center - Calendar Schedule"
              />
              <div>
                
                <CalendarMainLayer user={loadedUser} />
              </div>
            </div>
          )
        }

        // For all other users (admin, accountant, student, etc.), show MasterLayout
        return (
          <MasterLayout>
            <Breadcrumb heading="Calendar" title="Calendar" />
            <CalendarMainLayer user={loadedUser} />
          </MasterLayout>
        )
      }}
    </UserRoleLoader>
  )
}

export default Page
