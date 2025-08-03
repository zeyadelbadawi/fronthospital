"use client"
import Breadcrumb from "@/components/Breadcrumb"
import PublicProfileDoctor from "@/components/PublicProfileDoctor"
import { useDoctorLanguage } from "@/contexts/doctor-language-context"

const DoctorProfilePageContent = ({ user }) => {
  const { language } = useDoctorLanguage() // This hook is now called within the provider's scope

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb title={language === "en" ? "Your Profile" : "ملفك الشخصي"} />

      {/* ViewProfileLayer */}
      <PublicProfileDoctor user={user} />
    </>
  )
}

export default DoctorProfilePageContent
