"use client"

import { useState } from "react"
import Header from "@/components/Header"
import PublicProfilepatient from "@/components/PublicProfilepatient"
import AuthModals from "@/components/AuthModals"
import { useRoleBasedAuth } from "@/hooks/useRoleBasedAuth"
import RBACWrapper from "@/components/RBACWrapper"

function ProfileContent() {
  const { user, loading, logout } = useRoleBasedAuth()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  return (
    <>
      <Header user={user} loading={loading} onLoginClick={() => setShowLoginModal(true)} onLogout={logout} />

      <PublicProfilepatient patientID={user?.id} />

      <AuthModals
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        showSignupModal={showSignupModal}
        setShowSignupModal={setShowSignupModal}
        onLoginSuccess={() => window.location.reload()}
      />
    </>
  )
}

export default function Page() {
  return (
    <RBACWrapper loadingMessage="Loading profile...">
      <ProfileContent />
    </RBACWrapper>
  )
}
