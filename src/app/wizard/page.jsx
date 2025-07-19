"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import Header from "@/components/Header"
import NumberingWizardWithLabel from "@/components/child/NumberingWizardWithLabel"
import { useLanguage } from "@/contexts/LanguageContext"
import styles from "./wizard.module.css"

export default function Page() {
  const { language, translations } = useLanguage()
  const t = translations[language]

  // --- Auth & User State for Header ---
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // --- Modal Visibility for Header Login/Signup ---
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  // --- Login Form State ---
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // --- Signup Form State ---
  const [signName, setSignName] = useState("")
  const [signEmail, setSignEmail] = useState("")
  const [signPhone, setSignPhone] = useState("")
  const [signGender, setSignGender] = useState("")
  const [signPassword, setSignPassword] = useState("")
  const [signConfirm, setSignConfirm] = useState("")

  // --- Fetch current user profile if token exists ---
  const loadProfile = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Fetched user data:", res.data) // Add this line
      setUser(res.data)
    } catch (err) {
      if (err.response?.status === 403) {
        try {
          const r = await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/refresh`,
            {},
            { withCredentials: true },
          )
          localStorage.setItem("token", r.data.accessToken)
          const retry = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`, {
            headers: { Authorization: `Bearer ${r.data.accessToken}` },
          })
          console.log("Fetched user data after refresh:", retry.data) // Add this line
          setUser(retry.data)
        } catch {}
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  // --- Header Handlers ---
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/authentication/logout", {}, { withCredentials: true })
      localStorage.removeItem("token")
      setUser(null)
      setShowLoginModal(false)
      setShowSignupModal(false)
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  // --- Login submit ---
  const onLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/signin/patient`, {
        email: loginEmail,
        password: loginPassword,
      })
      localStorage.setItem("token", res.data.accessToken)
      setShowLoginModal(false)
      await loadProfile()
    } catch (err) {
      alert(err.response?.data?.message || "Login failed")
    }
  }

  // --- Signup submit ---
  const onSignup = async (e) => {
    e.preventDefault()
    if (signPassword !== signConfirm) {
      alert("Passwords don’t match")
      return
    }
    try {
      await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/patient`, {
        name: signName,
        email: signEmail,
        phone: signPhone,
        gender: signGender,
        password: signPassword,
      })
      alert("Registration successful—please log in")
      setShowSignupModal(false)
      setShowLoginModal(true)
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed")
    }
  }

  // --- Wizard Step Logic ---
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
      <Header user={user} loading={loading} onLoginClick={() => setShowLoginModal(true)} onLogout={handleLogout} />

      <div className={styles.wizardContainer}>
        <NumberingWizardWithLabel
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          patientId={user?.id}
          patientName={user?.name}
        />
      </div>

      {/* Update modals with new styling and translations */}
      {showLoginModal && (
        <div className={styles.modal} onClick={() => setShowLoginModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{t.auth.welcomeBack}</h2>
              <button className={styles.closeButton} onClick={() => setShowLoginModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={onLogin} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.email}</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={t.auth.emailPlaceholder}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.password}</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t.auth.passwordPlaceholder}
                    required
                  />
                </div>
                <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
                  {t.auth.signIn}
                </button>
              </form>
              <div className={styles.textCenter}>
                <button
                  className={styles.linkButton}
                  onClick={() => {
                    setShowLoginModal(false)
                    setShowSignupModal(true)
                  }}
                >
                  {t.auth.noAccount}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Similar updates for signup modal */}
      {showSignupModal && (
        <div className={styles.modal} onClick={() => setShowSignupModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{t.auth.createAccount}</h2>
              <button className={styles.closeButton} onClick={() => setShowSignupModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={onSignup} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.fullName}</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    placeholder={t.auth.fullNamePlaceholder}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.email}</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={signEmail}
                    onChange={(e) => setSignEmail(e.target.value)}
                    placeholder={t.auth.emailPlaceholder}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.phone}</label>
                  <input
                    type="tel"
                    className={styles.input}
                    value={signPhone}
                    onChange={(e) => setSignPhone(e.target.value)}
                    placeholder={t.auth.phonePlaceholder}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.gender}</label>
                  <select
                    className={styles.select}
                    value={signGender}
                    onChange={(e) => setSignGender(e.target.value)}
                    required
                  >
                    <option value="">{t.auth.selectGender}</option>
                    <option value="male">{t.auth.male}</option>
                    <option value="female">{t.auth.female}</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.password}</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={signPassword}
                    onChange={(e) => setSignPassword(e.target.value)}
                    placeholder={t.auth.createPasswordPlaceholder}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.confirmPassword}</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={signConfirm}
                    onChange={(e) => setSignConfirm(e.target.value)}
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    required
                  />
                </div>
                <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
                  {t.auth.createAccount}
                </button>
              </form>
              <div className={styles.textCenter}>
                <button
                  className={styles.linkButton}
                  onClick={() => {
                    setShowSignupModal(false)
                    setShowLoginModal(true)
                  }}
                >
                  {t.auth.haveAccount}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showLoginModal || showSignupModal) && (
        <div
          className={styles.modalBackdrop}
          onClick={() => {
            setShowLoginModal(false)
            setShowSignupModal(false)
          }}
        />
      )}
    </div>
  )
}
