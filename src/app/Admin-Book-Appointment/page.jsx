"use client"
import RBACWrapper from "@/components/RBACWrapper"
import AdminStudentBooking from "@/components/AdminStudentBooking"
import { useState } from "react"
import styles from "./Admin-Book-Appointment.module.css"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"

function AdminBookAppointmentContent({ user }) {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <MasterLayout>
      <Breadcrumb heading="Book New Appointments" title="Book New Appointments" />
      <div className={styles.wizardContainer}>
        <AdminStudentBooking
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          adminId={user?.id}
          adminName={user?.name}
        />
      </div>
    </MasterLayout>
  )
}

export default function AdminBookAppointmentPage() {
  return <RBACWrapper>{({ user }) => <AdminBookAppointmentContent user={user} />}</RBACWrapper>
}
