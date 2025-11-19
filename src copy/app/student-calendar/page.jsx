"use client"

import { useState } from "react"
import Header from "@/components/Header"
import StudentCalendarMainLayer from "@/components/StudentCalendarMainLayer"
import AuthModals from "@/components/AuthModals"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { useRoleBasedAuth } from "@/hooks/useRoleBasedAuth"
import RBACWrapper from "@/components/RBACWrapper"

function StudentCalendarContent() {
  const { user, loading, logout } = useRoleBasedAuth()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  return (
    <LanguageProvider>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%)" }}>
        <Header user={user} loading={loading} onLoginClick={() => setShowLoginModal(true)} onLogout={logout} />

        <StudentCalendarMainLayer />

        <AuthModals
          showLoginModal={showLoginModal}
          setShowLoginModal={setShowLoginModal}
          showSignupModal={showSignupModal}
          setShowSignupModal={setShowSignupModal}
          onLoginSuccess={() => window.location.reload()}
        />
      </div>
    </LanguageProvider>
  )
}

export default function Page() {
  return (
    <RBACWrapper loadingMessage="Loading calendar...">
      <StudentCalendarContent />
    </RBACWrapper>
  )
}
