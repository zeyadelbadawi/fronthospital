"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import StudentBooking from "@/components/StudentBooking"
import AuthModals from "@/components/AuthModals"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRoleBasedAuth } from "@/hooks/useRoleBasedAuth"
import RBACWrapper from "@/components/RBACWrapper"
import styles from "./Book-Appointment.module.css"

function BookAppointmentContent() {
  const { language } = useLanguage()
  const { user, loading, logout } = useRoleBasedAuth()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (router.isReady) {
      const step = router.query.step ? Number(router.query.step) : 1
      if (step >= 1 && step <= 3) setCurrentStep(step)
    }
  }, [router.isReady, router.query])

  return (
    <div className={`${styles.wizardPage} ${language === "ar" ? styles.rtl : styles.ltr}`}>
      <Header user={user} loading={loading} onLoginClick={() => setShowLoginModal(true)} onLogout={logout} />

      <div className={styles.wizardContainer}>
        <StudentBooking
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          patientId={user?.id}
          patientName={user?.name}
          patientEmail={user?.email}
        />
      </div>

      <AuthModals
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        showSignupModal={showSignupModal}
        setShowSignupModal={setShowSignupModal}
        onLoginSuccess={() => window.location.reload()}
      />
    </div>
  )
}

export default function Page() {
  return (
    <RBACWrapper loadingMessage="Loading appointment booking...">
      <BookAppointmentContent />
    </RBACWrapper>
  )
}
