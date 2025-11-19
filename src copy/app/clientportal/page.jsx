"use client"
import RBACWrapper from "@/components/RBACWrapper"
import { useCallback, useMemo } from "react"
import CustomLink from "@/components/CustomLink"
import NProgress from "nprogress"
import {
  RiCalendarEventLine,
  RiGroupLine,
  RiCalendarCheckLine,
  RiFileListLine,
  RiShieldCheckLine,
  RiCheckLine,
  RiCloseLine,
} from "react-icons/ri"
import Header from "../../components/Header"
import styles from "../../styles/ClientPortal.module.css"
import { useLanguage } from "../../contexts/LanguageContext"
import { useState } from "react"
import AuthModals from "../../components/AuthModals"

function ClientPortalContent({ user, handleLogout }) {
  const { language, translations } = useLanguage()
  const t = translations[language]

  // --- Modal Visibility ---
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  // --- Toast State ---
  const [toast, setToast] = useState(null)

  // --- Refresh Trigger State ---
  const [refreshKey, setRefreshKey] = useState(0)

  // --- Toast Function ---
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }, [])

  // --- Refresh Auth State After Login ---
  const handleLoginSuccess = useCallback(() => {
    // Trigger a re-render by updating the refresh key
    setRefreshKey((prev) => prev + 1)
    // Force page reload to refresh user context
    window.location.reload()
  }, [])

  // --- Card click guard ---
  const handleCardClick = useCallback(
    (href) => (e) => {
      if (!user || user.role !== "patient") {
        e.preventDefault()
        // Stop nprogress since we're not actually navigating
        if (typeof window !== "undefined" && window.__doneNProgress) {
          window.__doneNProgress()
        } else {
          NProgress.done()
        }
        setShowLoginModal(true)
      }
    },
    [user],
  )

  // --- Memoized Static Content ---
  const services = useMemo(
    () => [
      {
        href: "/Book-Appointment",
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

  return (
    <div className={`${styles.container} ${language === "ar" ? styles.rtl : styles.ltr}`}>
      <Header user={user} loading={false} onLoginClick={() => setShowLoginModal(true)} onLogout={handleLogout} />

      <main className={styles.main}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <h4 className={styles.welcomeTitle}>{t.welcome.title}</h4>
        </div>

        {/* Disclaimer */}
        <div className={styles.disclaimerCard}>
          <div className={styles.disclaimerTitle}>
            <RiShieldCheckLine />
            {t.disclaimer.title}
          </div>
          {t.disclaimer.lines.map((line, i) => (
            <p key={i} className={styles.disclaimerText}>
              {line}
            </p>
          ))}
        </div>

        {/* Services Grid */}
        <div className={styles.servicesGrid}>
          {services.map(({ href, Icon, label, description }, idx) => (
            <CustomLink key={idx} href={href} className={styles.serviceCard} onClick={handleCardClick(href)}>
              <Icon className={styles.serviceIcon} />
              <h3 className={styles.serviceTitle}>{label}</h3>
              <p className={styles.serviceDescription}>{description}</p>
            </CustomLink>
          ))}
        </div>
      </main>

      <AuthModals
        showLoginModal={showLoginModal}
        showSignupModal={showSignupModal}
        setShowLoginModal={setShowLoginModal}
        setShowSignupModal={setShowSignupModal}
        onLoginSuccess={handleLoginSuccess}
        showToast={showToast}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === "error" ? <RiCloseLine /> : <RiCheckLine />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "none",
              border: "none",
              marginLeft: "auto",
              cursor: "pointer",
              color: "inherit",
            }}
          >
            <RiCloseLine />
          </button>
        </div>
      )}
    </div>
  )
}

export default function ClientPortalPage() {
  return (
    <RBACWrapper allowedRoles={["patient"]} loadingMessage="Loading client portal...">
      {({ user, handleLogout }) => <ClientPortalContent user={user} handleLogout={handleLogout} />}
    </RBACWrapper>
  )
}
