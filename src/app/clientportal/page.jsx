"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import axiosInstance from "../../helper/axiosSetup"
import CustomLink from "@/components/CustomLink"
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
import AuthModals from "../../components/AuthModals"

export default function ClientPortalPage() {
  const { language, translations } = useLanguage()
  const t = translations[language]

  // --- Auth & User State ---
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // --- Modal Visibility ---
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  // --- Toast State ---
  const [toast, setToast] = useState(null)

  // --- Toast Function ---
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }, [])

  // --- Optimized Profile Loading ---
  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await axiosInstance.get("/authentication/profile")
      setUser(res.data)
    } catch (err) {
      if (err.response?.status === 403) {
        try {
          const r = await axiosInstance.post("/authentication/refresh")
          localStorage.setItem("token", r.data.accessToken)
          const retry = await axiosInstance.get("/authentication/profile")
          setUser(retry.data)
        } catch (refreshError) {
          localStorage.removeItem("token")
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // --- Logout Handler ---
  const handleLogout = useCallback(async () => {
    try {
      await axiosInstance.post("/authentication/logout")
      localStorage.removeItem("token")
      setUser(null)
      setShowLoginModal(false)
      setShowSignupModal(false)
      showToast(t.messages.logoutSuccess)
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }, [showToast, t])

  // --- Card click guard ---
  const handleCardClick = useCallback(
    (href) => (e) => {
      if (!user || user.role !== "patient") {
        e.preventDefault()
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>{t.common.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${language === "ar" ? styles.rtl : styles.ltr}`}>
      <Header user={user} loading={loading} onLoginClick={() => setShowLoginModal(true)} onLogout={handleLogout} />

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
        onLoginSuccess={loadProfile}
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
