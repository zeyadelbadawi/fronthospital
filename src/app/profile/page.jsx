"use client"

import { useState } from "react"
import Header from "@/components/Header"
import PublicProfilepatient from "@/components/PublicProfilepatient"
import AuthModals from "@/components/AuthModals"
import { usePatientAuth } from "@/hooks/usePatientAuth"

export default function Page() {
  const { user, loading, loadProfile, handleLogout } = usePatientAuth()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  return (
    <>
      <Header user={user} loading={loading} onLoginClick={() => setShowLoginModal(true)} onLogout={handleLogout} />

      <PublicProfilepatient patientID={user?.id} />

      <AuthModals
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        showSignupModal={showSignupModal}
        setShowSignupModal={setShowSignupModal}
        onLoginSuccess={loadProfile}
      />
    </>
  )
}
