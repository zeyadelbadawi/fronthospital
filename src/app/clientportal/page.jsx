"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import axiosInstance from "../../helper/axiosSetup"
import Link from "next/link"
import {
  RiCalendarEventLine,
  RiGroupLine,
  RiCalendarCheckLine,
  RiFileListLine,
  RiShieldCheckLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
} from "react-icons/ri"
import Header from "../../components/Header"
import styles from "../../styles/ClientPortal.module.css"
import { useLanguage } from "../../contexts/LanguageContext"

// Lazy load heavy components
const PasswordStrength = dynamic(() => import("../../components/PasswordStrength"), {
  loading: () => <div className={styles.loadingSkeleton}></div>,
})

export default function ClientPortalPage() {
  const { language, translations } = useLanguage()
  const t = translations[language]

  // --- Auth & User State ---
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // --- Modal Visibility ---
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  // --- Login Form State ---
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginErrors, setLoginErrors] = useState({})
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // --- Signup Form State ---
  const [signName, setSignName] = useState("")
  const [signEmail, setSignEmail] = useState("")
  const [signPhone, setSignPhone] = useState("")
  const [signGender, setSignGender] = useState("")
  const [signPassword, setSignPassword] = useState("")
  const [signConfirm, setSignConfirm] = useState("")
  const [signupErrors, setSignupErrors] = useState({})
  const [signupLoading, setSignupLoading] = useState(false)
  const [showSignPassword, setShowSignPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // --- Toast State ---
  const [toast, setToast] = useState(null)

  // --- Memoized Validation Functions ---
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  const validatePhone = useCallback((phone) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }, [])

  const validatePassword = useCallback((password) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    let strength = 0
    if (minLength) strength++
    if (hasUpper) strength++
    if (hasLower) strength++
    if (hasNumber) strength++
    if (hasSpecial) strength++

    return { isValid: strength >= 3, strength }
  }, [])

  const validateName = useCallback((name) => {
    return name.trim().length >= 2 && /^[a-zA-Z\u0600-\u06FF\s]+$/.test(name)
  }, [])

  // --- Optimized Real-time Validation ---
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newErrors = {}

      if (loginEmail && !validateEmail(loginEmail)) {
        newErrors.email = t.validation.invalidEmail
      }

      if (loginPassword && loginPassword.length < 6) {
        newErrors.password = t.validation.passwordTooShort
      }

      setLoginErrors(newErrors)
    }, 300) // Debounce validation

    return () => clearTimeout(timeoutId)
  }, [loginEmail, loginPassword, validateEmail, t])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newErrors = {}

      if (signName && !validateName(signName)) {
        newErrors.name = t.validation.invalidName
      }

      if (signEmail && !validateEmail(signEmail)) {
        newErrors.email = t.validation.invalidEmail
      }

      if (signPhone && !validatePhone(signPhone)) {
        newErrors.phone = t.validation.invalidPhone
      }

      if (signPassword) {
        const passwordValidation = validatePassword(signPassword)
        setPasswordStrength(passwordValidation.strength)
        if (!passwordValidation.isValid) {
          newErrors.password = t.validation.weakPassword
        }
      }

      if (signConfirm && signPassword !== signConfirm) {
        newErrors.confirmPassword = t.validation.passwordMismatch
      }

      setSignupErrors(newErrors)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [
    signName,
    signEmail,
    signPhone,
    signPassword,
    signConfirm,
    validateName,
    validateEmail,
    validatePhone,
    validatePassword,
    t,
  ])

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

  // --- Login submit ---
  const onLogin = useCallback(
    async (e) => {
      e.preventDefault()

      if (Object.keys(loginErrors).length > 0) {
        showToast(t.messages.fixErrors, "error")
        return
      }

      setLoginLoading(true)

      try {
        const res = await axiosInstance.post("/authentication/signin/patient", {
          email: loginEmail,
          password: loginPassword,
        })
        localStorage.setItem("token", res.data.accessToken)
        setShowLoginModal(false)
        await loadProfile()
        showToast(t.messages.loginSuccess)

        // Reset form
        setLoginEmail("")
        setLoginPassword("")
        setLoginErrors({})
      } catch (err) {
        showToast(err.response?.data?.message || t.messages.loginFailed, "error")
      } finally {
        setLoginLoading(false)
      }
    },
    [loginErrors, loginEmail, loginPassword, showToast, loadProfile, t],
  )

  // --- Signup submit ---
  const onSignup = useCallback(
    async (e) => {
      e.preventDefault()

      if (Object.keys(signupErrors).length > 0) {
        showToast(t.messages.fixErrors, "error")
        return
      }

      if (!signGender) {
        showToast(t.messages.selectGender, "error")
        return
      }

      setSignupLoading(true)

      try {
        await axiosInstance.post("/authentication/signup/patient", {
          name: signName,
          email: signEmail,
          phone: signPhone,
          gender: signGender,
          password: signPassword,
        })

        showToast(t.messages.signupSuccess)
        setShowSignupModal(false)
        setShowLoginModal(true)

        // Reset form
        setSignName("")
        setSignEmail("")
        setSignPhone("")
        setSignGender("")
        setSignPassword("")
        setSignConfirm("")
        setSignupErrors({})
        setPasswordStrength(0)
      } catch (err) {
        showToast(err.response?.data?.message || t.messages.signupFailed, "error")
      } finally {
        setSignupLoading(false)
      }
    },
    [signupErrors, signGender, signName, signEmail, signPhone, signPassword, showToast, t],
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
            <Link key={idx} href={href} className={styles.serviceCard} onClick={handleCardClick(href)}>
              <Icon className={styles.serviceIcon} />
              <h3 className={styles.serviceTitle}>{label}</h3>
              <p className={styles.serviceDescription}>{description}</p>
            </Link>
          ))}
        </div>
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
                  <div className={styles.inputWrapper}>
                    <input
                      type="email"
                      className={`${styles.input} ${
                        loginErrors.email
                          ? styles.inputError
                          : loginEmail && !loginErrors.email
                            ? styles.inputSuccess
                            : ""
                      }`}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder={t.auth.emailPlaceholder}
                    />
                  </div>
                  {loginErrors.email && (
                    <div className={styles.errorMessage}>
                      <RiErrorWarningLine />
                      {loginErrors.email}
                    </div>
                  )}
                  {loginEmail && !loginErrors.email && (
                    <div className={styles.successMessage}>
                      <RiCheckLine />
                      {t.validation.validEmail}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.password}</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      className={`${styles.input} ${
                        loginErrors.password
                          ? styles.inputError
                          : loginPassword && !loginErrors.password
                            ? styles.inputSuccess
                            : ""
                      }`}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder={t.auth.passwordPlaceholder}
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{
                        position: "absolute",
                        right: language === "ar" ? "auto" : "1rem",
                        left: language === "ar" ? "1rem" : "auto",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      {showLoginPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <div className={styles.errorMessage}>
                      <RiErrorWarningLine />
                      {loginErrors.password}
                    </div>
                  )}
                </div>

                <div className={styles.checkbox}>
                  <input id="remember" type="checkbox" className={styles.checkboxInput} />
                  <label htmlFor="remember">{t.auth.rememberMe}</label>
                </div>

                <button
                  type="submit"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={loginLoading || Object.keys(loginErrors).length > 0}
                >
                  {loginLoading ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      {t.auth.signingIn}
                    </>
                  ) : (
                    t.auth.signIn
                  )}
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
                    className={`${styles.input} ${
                      signupErrors.name ? styles.inputError : signName && !signupErrors.name ? styles.inputSuccess : ""
                    }`}
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    required
                    placeholder={t.auth.fullNamePlaceholder}
                  />
                  {signupErrors.name && (
                    <div className={styles.errorMessage}>
                      <RiErrorWarningLine />
                      {signupErrors.name}
                    </div>
                  )}
                  {signName && !signupErrors.name && (
                    <div className={styles.successMessage}>
                      <RiCheckLine />
                      {t.validation.validName}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.email}</label>
                  <input
                    type="email"
                    className={`${styles.input} ${
                      signupErrors.email
                        ? styles.inputError
                        : signEmail && !signupErrors.email
                          ? styles.inputSuccess
                          : ""
                    }`}
                    value={signEmail}
                    onChange={(e) => setSignEmail(e.target.value)}
                    required
                    placeholder={t.auth.emailPlaceholder}
                  />
                  {signupErrors.email && (
                    <div className={styles.errorMessage}>
                      <RiErrorWarningLine />
                      {signupErrors.email}
                    </div>
                  )}
                  {signEmail && !signupErrors.email && (
                    <div className={styles.successMessage}>
                      <RiCheckLine />
                      {t.validation.validEmail}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.phone}</label>
                  <input
                    type="tel"
                    className={`${styles.input} ${
                      signupErrors.phone
                        ? styles.inputError
                        : signPhone && !signupErrors.phone
                          ? styles.inputSuccess
                          : ""
                    }`}
                    value={signPhone}
                    onChange={(e) => setSignPhone(e.target.value)}
                    required
                    placeholder={t.auth.phonePlaceholder}
                  />
                  {signupErrors.phone && (
                    <div className={styles.errorMessage}>
                      <RiErrorWarningLine />
                      {signupErrors.phone}
                    </div>
                  )}
                  {signPhone && !signupErrors.phone && (
                    <div className={styles.successMessage}>
                      <RiCheckLine />
                      {t.validation.validPhone}
                    </div>
                  )}
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
                  <div className={styles.inputWrapper}>
                    <input
                      type={showSignPassword ? "text" : "password"}
                      className={`${styles.input} ${
                        signupErrors.password
                          ? styles.inputError
                          : signPassword && !signupErrors.password
                            ? styles.inputSuccess
                            : ""
                      }`}
                      value={signPassword}
                      onChange={(e) => setSignPassword(e.target.value)}
                      required
                      placeholder={t.auth.createPasswordPlaceholder}
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignPassword(!showSignPassword)}
                      style={{
                        position: "absolute",
                        right: language === "ar" ? "auto" : "1rem",
                        left: language === "ar" ? "1rem" : "auto",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      {showSignPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  {signPassword && <PasswordStrength strength={passwordStrength} />}
                  {signupErrors.password && (
                    <div className={styles.errorMessage}>
                      <RiErrorWarningLine />
                      {signupErrors.password}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.confirmPassword}</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`${styles.input} ${
                        signupErrors.confirmPassword
                          ? styles.inputError
                          : signConfirm && !signupErrors.confirmPassword
                            ? styles.inputSuccess
                            : ""
                      }`}
                      value={signConfirm}
                      onChange={(e) => setSignConfirm(e.target.value)}
                      required
                      placeholder={t.auth.confirmPasswordPlaceholder}
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: "absolute",
                        right: language === "ar" ? "auto" : "1rem",
                        left: language === "ar" ? "1rem" : "auto",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      {showConfirmPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  {signupErrors.confirmPassword && (
                    <div className={styles.errorMessage}>
                      <RiErrorWarningLine />
                      {signupErrors.confirmPassword}
                    </div>
                  )}
                  {signConfirm && !signupErrors.confirmPassword && signPassword === signConfirm && (
                    <div className={styles.successMessage}>
                      <RiCheckLine />
                      {t.validation.passwordsMatch}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={signupLoading || Object.keys(signupErrors).length > 0 || !signGender}
                >
                  {signupLoading ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      {t.auth.creatingAccount}
                    </>
                  ) : (
                    t.auth.createAccount
                  )}
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
