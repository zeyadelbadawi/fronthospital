"use client"
import { useState, useEffect } from "react"
import axiosInstance from "../../helper/axiosSetup"
import Header from "../../components/Header"
import FinancialRecordsMainLayer from "../../components/FinancialRecordsMainLayer"
import Loader from "../../components/Loader"
import { LanguageProvider, useLanguage } from "../../contexts/LanguageContext"
import styles from "../../styles/FinancialRecords.module.css"

export default function FinancialRecordsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // --- Modal Visibility ---
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

  useEffect(() => {
    loadProfile()
  }, [])

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
      console.log("Fetched user data:", res.data)
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
          console.log("Fetched user data after refresh:", retry.data)
          setUser(retry.data)
        } catch {}
      }
    } finally {
      setLoading(false)
    }
  }

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
      // Reset form
      setLoginEmail("")
      setLoginPassword("")
    } catch (err) {
      alert(err.response?.data?.message || "Login failed")
    }
  }

  // --- Signup submit ---
  const onSignup = async (e) => {
    e.preventDefault()
    if (signPassword !== signConfirm) {
      alert("Passwords don't match")
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
      // Reset form
      setSignName("")
      setSignEmail("")
      setSignPhone("")
      setSignGender("")
      setSignPassword("")
      setSignConfirm("")
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed")
    }
  }

  if (loading) {
    return (
      <LanguageProvider>
        <div className={styles.loadingContainer}>
          <Loader />
        </div>
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <FinancialRecordsContent
        user={user}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        showSignupModal={showSignupModal}
        setShowSignupModal={setShowSignupModal}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        signName={signName}
        setSignName={setSignName}
        signEmail={signEmail}
        setSignEmail={setSignEmail}
        signPhone={signPhone}
        setSignPhone={setSignPhone}
        signGender={signGender}
        setSignGender={setSignGender}
        signPassword={signPassword}
        setSignPassword={setSignPassword}
        signConfirm={signConfirm}
        setSignConfirm={setSignConfirm}
        onLogin={onLogin}
        onSignup={onSignup}
      />
    </LanguageProvider>
  )
}

function FinancialRecordsContent({
  user,
  onLoginClick,
  onLogout,
  showLoginModal,
  setShowLoginModal,
  showSignupModal,
  setShowSignupModal,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  signName,
  setSignName,
  signEmail,
  setSignEmail,
  signPhone,
  setSignPhone,
  signGender,
  setSignGender,
  signPassword,
  setSignPassword,
  signConfirm,
  setSignConfirm,
  onLogin,
  onSignup,
}) {
  const { language, translations } = useLanguage()
  const t = translations[language]

  return (
    <div className={`${styles.pageContainer} ${language === "ar" ? styles.rtl : styles.ltr}`}>
      <Header user={user} loading={false} onLoginClick={onLoginClick} onLogout={onLogout} />

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
              <button className={styles.loginButton} onClick={onLoginClick}>
                {language === "ar" ? "تسجيل الدخول" : "Login"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
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

      {/* Signup Modal */}
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
    </div>
  )
}
