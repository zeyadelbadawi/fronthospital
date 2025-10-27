"use client"
import RBACWrapper from "@/components/RBACWrapper"
import { useMemo } from "react"
import { RiCalendarEventLine, RiGroupLine, RiCalendarCheckLine, RiFileListLine } from "react-icons/ri"
import { useLanguage } from "../../contexts/LanguageContext"

function ClientPortalContent({ user, handleLogout }) {
  const { language, translations } = useLanguage()
  const t = translations[language]

  const services = useMemo(
    () => [
      {
        href: "/book-appointment",
        Icon: RiCalendarEventLine,
        label: t.services.bookAppointment.title,
        description: t.services.bookAppointment.description,
      },
      {
        href: "/profile",
        Icon: RiGroupLine,
        label: t.services.myProfile.title,
        description: t.services.myProfile.description,
      },
      {
        href: "/student-calendar",
        Icon: RiCalendarCheckLine,
        label: t.services.myAppointments.title,
        description: t.services.myAppointments.description,
      },
      {
        href: "/financial-records",
        Icon: RiFileListLine,
        label: t.services.myInvoices.title,
        description: t.services.myInvoices.description,
      },
    ],
    [t],
  )
}

export default function ClientPortalPage() {
  return (
    <RBACWrapper allowedRoles={["patient"]} loadingMessage="Loading client portal...">
      {({ user, handleLogout }) => <ClientPortalContent user={user} handleLogout={handleLogout} />}
    </RBACWrapper>
  )
}
