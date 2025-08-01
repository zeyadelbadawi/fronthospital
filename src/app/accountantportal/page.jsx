"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { CreditCard, FileCheck, DollarSign, User, Shield, Eye, EyeOff, Check, X, AlertTriangle } from "lucide-react"
import AccountantHeader from "../../components/accountant-header"
import styles from "../../styles/AccountantPortal.module.css"
import { useAccountantLanguage } from "../../contexts/accountant-language-context"
import axiosInstance from "@/helper/axiosSetup"
// Lazy load heavy components
const AccountantPasswordStrength = dynamic(() => import("../../components/accountant-password-strength"), {
  loading: () => <div className={styles.loadingSkeleton}></div>,
})

export default function AccountantPortalPage() {
  const { language, translations } = useAccountantLanguage()
  const t = translations[language]
  const isRTL = language === "ar"

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
    }, 300)

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
  }, [signName, signEmail, signPassword, signConfirm, validateName, validateEmail, validatePassword, t])

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
      console.log("Profile loaded:", res.data)

      // Store user data in localStorage for other components to use
      localStorage.setItem("user", JSON.stringify(res.data))
      setUser(res.data)
    } catch (err) {
      console.error("Profile loading error:", err)
      if (err.response?.status === 403) {
        try {
          const r = await axiosInstance.post("/authentication/refresh")
          localStorage.setItem("token", r.data.accessToken)
          const retry = await axiosInstance.get("/authentication/profile")
          console.log("Profile loaded after refresh:", retry.data)

          // Store user data in localStorage
          localStorage.setItem("user", JSON.stringify(retry.data))
          setUser(retry.data)
        } catch (refreshError) {
          console.error("Refresh failed:", refreshError)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      } else {
        // If profile loading fails, clear everything
        localStorage.removeItem("token")
        localStorage.removeItem("user")
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
      localStorage.removeItem("user")
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
      if (!user || user.role !== "accountant") {
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
        const res = await axiosInstance.post("/authentication/signin/accountant", {
          email: loginEmail,
          password: loginPassword,
        })

        console.log("Login response:", res.data)

        localStorage.setItem("token", res.data.accessToken)

        // Store user data immediately
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user))
          setUser(res.data.user)
        }

        setShowLoginModal(false)

        // Load fresh profile data
        await loadProfile()
        showToast(t.messages.loginSuccess)

        // Reset form
        setLoginEmail("")
        setLoginPassword("")
        setLoginErrors({})
      } catch (err) {
        console.error("Login error:", err)
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

      setSignupLoading(true)

      try {
        await axiosInstance.post("/authentication/signup/accountant", {
          name: signName,
          email: signEmail,
          password: signPassword,
        })

        showToast(t.messages.signupSuccess)
        setShowSignupModal(false)
        setShowLoginModal(true)

        // Reset form
        setSignName("")
        setSignEmail("")
        setSignPassword("")
        setSignConfirm("")
        setSignupErrors({})
        setPasswordStrength(0)
      } catch (err) {
        console.error("Signup error:", err)
        showToast(err.response?.data?.message || t.messages.signupFailed, "error")
      } finally {
        setSignupLoading(false)
      }
    },
    [signupErrors, signName, signEmail, signPassword, showToast, t],
  )

  // --- Memoized Static Content ---
  const services = useMemo(
    () => [
      {
        href: "/accountantportal/Payment-Transactions",
        Icon: CreditCard,
        label: t.services.paymentManagement.title,
        description: t.services.paymentManagement.description,
      },
      {
        href: "/accountantportal/checks",
        Icon: FileCheck,
        label: t.services.checksManagement.title,
        description: t.services.checksManagement.description,
      },
      {
        href: "/accountantportal/full-program-payment",
        Icon: DollarSign,
        label: t.services.fullProgramPayment.title,
        description: t.services.fullProgramPayment.description,
      },
      {
        href: "/accountantportal/profile-accountant",
        Icon: User,
        label: t.services.myProfile.title,
        description: t.services.myProfile.description,
      },
    ],
    [t],
  )

  if (loading) {
    return (
      <div className={`${styles.container} ${isRTL ? styles.rtl : styles.ltr}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>{t.common.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${isRTL ? styles.rtl : styles.ltr}`}>
      <AccountantHeader
        user={user}
        loading={loading}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>{t.welcome.title}</h1>
          <p className={styles.welcomeSubtitle}>{t.welcome.subtitle}</p>
        </div>

        {/* Financial Guidelines */}
        <div className={styles.guidelinesCard}>
          <div className={styles.guidelinesTitle}>
            <Shield className={styles.guidelinesIcon} />
            {t.guidelines.title}
          </div>
          {t.guidelines.lines.map((line, i) => (
            <p key={i} className={styles.guidelinesText}>
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
              <h4 className={styles.modalTitle}>{t.auth.welcomeBack}</h4>
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
                      <AlertTriangle size={16} />
                      {loginErrors.email}
                    </div>
                  )}
                  {loginEmail && !loginErrors.email && (
                    <div className={styles.successMessage}>
                      <Check size={16} />
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className={styles.passwordToggle}
                    >
                      {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <div className={styles.errorMessage}>
                      <AlertTriangle size={16} />
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
              <h4 className={styles.modalTitle}>{t.auth.createAccount}</h4>
              <button className={styles.closeButton} onClick={() => setShowSignupModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={onSignup} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.name}</label>
                  <input
                    type="text"
                    className={`${styles.input} ${
                      signupErrors.name ? styles.inputError : signName && !signupErrors.name ? styles.inputSuccess : ""
                    }`}
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    required
                    placeholder={t.auth.namePlaceholder}
                  />
                  {signupErrors.name && (
                    <div className={styles.errorMessage}>
                      <AlertTriangle size={16} />
                      {signupErrors.name}
                    </div>
                  )}
                  {signName && !signupErrors.name && (
                    <div className={styles.successMessage}>
                      <Check size={16} />
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
                      <AlertTriangle size={16} />
                      {signupErrors.email}
                    </div>
                  )}
                  {signEmail && !signupErrors.email && (
                    <div className={styles.successMessage}>
                      <Check size={16} />
                      {t.validation.validEmail}
                    </div>
                  )}
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignPassword(!showSignPassword)}
                      className={styles.passwordToggle}
                    >
                      {showSignPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {signPassword && <AccountantPasswordStrength strength={passwordStrength} />}
                  {signupErrors.password && (
                    <div className={styles.errorMessage}>
                      <AlertTriangle size={16} />
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.passwordToggle}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {signupErrors.confirmPassword && (
                    <div className={styles.errorMessage}>
                      <AlertTriangle size={16} />
                      {signupErrors.confirmPassword}
                    </div>
                  )}
                  {signConfirm && !signupErrors.confirmPassword && signPassword === signConfirm && (
                    <div className={styles.successMessage}>
                      <Check size={16} />
                      {t.validation.passwordsMatch}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={signupLoading || Object.keys(signupErrors).length > 0}
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
          {toast.type === "error" ? <X size={20} /> : <Check size={20} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className={styles.toastClose}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
