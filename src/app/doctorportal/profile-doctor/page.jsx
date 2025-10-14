"use client"
import RBACWrapper from "@/components/RBACWrapper"
import PublicProfileDoctor from "@/components/PublicProfileDoctor"
import DoctorHeader from "../../../components/doctor-header"

function ProfileDoctorContent({ user, handleLogout }) {
  return (
    <>
      <DoctorHeader user={user} loading={false} onLoginClick={() => {}} onLogout={handleLogout} />
      <PublicProfileDoctor />
    </>
  )
}

export default function ProfileDoctorPage() {
  return (
    <RBACWrapper>
      {({ user, handleLogout }) => <ProfileDoctorContent user={user} handleLogout={handleLogout} />}
    </RBACWrapper>
  )
}
