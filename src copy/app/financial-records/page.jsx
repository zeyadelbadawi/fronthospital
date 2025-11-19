"use client"
import { useState } from "react"
import Header from "../../components/Header"
import FinancialRecordsMainLayer from "../../components/FinancialRecordsMainLayer"
import Loader from "../../components/Loader"
import AuthModals from "@/components/AuthModals"
import { LanguageProvider, useLanguage } from "../../contexts/LanguageContext"
import { useRoleBasedAuth } from "@/hooks/useRoleBasedAuth"
import RBACWrapper from "@/components/RBACWrapper"
import styles from "../../styles/FinancialRecords.module.css"

function FinancialRecordsContent() {
  const { language } = useLanguage()
  const { user, loading, logout } = useRoleBasedAuth()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader />
      </div>
    )
  }

  return (
    <div className={`${styles.pageContainer} ${language === "ar" ? styles.rtl : styles.ltr}`}>
      <Header user={user} loading={false} onLoginClick={() => setShowLoginModal(true)} onLogout={logout} />

      <main className={styles.mainContent}>
        {user && user.role === "patient" ? (
          <FinancialRecordsMainLayer user={user} />
        ) : (
          <div className={styles.authRequired}>
            <div className={styles.authCard}>
              <h2>{language === "ar" ? "مطلوب تسجيل الدخول" : "Authentication Required"}</h2>
              <p>
                {language === "ar"
                  ? "يرجى تسجيل الدخول لعرض سجلاتك المالية"
                  : "Please log in to view your financial records."}
              </p>
              <button className={styles.loginButton} onClick={() => setShowLoginModal(true)}>
                {language === "ar" ? "تسجيل الدخول" : "Login"}
              </button>
            </div>
          </div>
        )}
      </main>

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

export default function FinancialRecordsPage() {
  return (
    <LanguageProvider>
      <RBACWrapper loadingMessage="Loading financial records...">
        <FinancialRecordsContent />
      </RBACWrapper>
    </LanguageProvider>
  )
}
