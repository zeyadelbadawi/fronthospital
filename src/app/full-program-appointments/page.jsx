"use client"
import RBACWrapper from "@/components/RBACWrapper"
import AppointmentPage from "@/app/appointments/appointment-page"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"
import { ModelProvider } from "@/contexts/ModelContext"

function FullProgramAppointmentsContent() {
  return (
    <MasterLayout>
      <Breadcrumb heading="Full Program Appointments" title="Full Program Appointments" />
      <ModelProvider>
        <AppointmentPage />
      </ModelProvider>
    </MasterLayout>
  )
}

export default function FullProgramAppointmentsPage() {
  return (
    <RBACWrapper>
      <FullProgramAppointmentsContent />
    </RBACWrapper>
  )
}
