"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import axiosInstance from "@/helper/axiosSetup"
import CustomLink from '@/components/CustomLink'
import {
  Stethoscope,
  Calendar,
  GraduationCap,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
} from "lucide-react"
import DoctorHeader from "../../components/doctor-header"
import styles from "../../styles/DoctorPortal.module.css"
import { useDoctorLanguage } from "../../contexts/doctor-language-context"

// Lazy load heavy components
const DoctorPasswordStrength = dynamic(() => import("../../components/doctor-password-strength"), {
  loading: () => <div className={styles.loadingSkeleton}></div>,
})

export default function DoctorPortalPage() {
  const { language, translations } = useDoctorLanguage()
  const t = translations

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
  const [signUsername, setSignUsername] = useState("")
  const [signEmail, setSignEmail] = useState("")
  const [signPhone, setSignPhone] = useState("")
  const [signTitle, setSignTitle] = useState("")
  const [signAvailability, setSignAvailability] = useState("")
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

  const validateUsername = useCallback((username) => {
    return username.trim().length >= 3 && /^[a-zA-Z0-9_]+$/.test(username)
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

      if (signUsername && !validateUsername(signUsername)) {
        newErrors.username = t.validation.invalidUsername
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
    signUsername,
    signEmail,
    signPhone,
    signPassword,
    signConfirm,
    validateUsername,
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
      if (!user || user.role !== "doctor") {
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
        const res = await axiosInstance.post("/authentication/signin/doctor", {
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

      if (!signAvailability) {
        showToast(t.messages.selectAvailability, "error")
        return
      }

      setSignupLoading(true)

      try {
        await axiosInstance.post("/authentication/signup/doctor", {
          username: signUsername,
          email: signEmail,
          phone: signPhone,
          title: signTitle,
          availability: signAvailability,
          password: signPassword,
          departmentIds: [], // Empty for now, can be extended later
        })

        showToast(t.messages.signupSuccess)
        setShowSignupModal(false)
        setShowLoginModal(true)

        // Reset form
        setSignUsername("")
        setSignEmail("")
        setSignPhone("")
        setSignTitle("")
        setSignAvailability("")
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
    [signupErrors, signAvailability, signUsername, signEmail, signPhone, signTitle, signPassword, showToast, t],
  )

  // --- Memoized Static Content ---
  const services = useMemo(
    () => [
      {
        href: "/full-program",
        Icon: Stethoscope,
        label: t.services.fullProgram.title,
        description: t.services.fullProgram.description,
      },
      {
        href: "/single-session",
        Icon: Calendar,
        label: t.services.singleSession.title,
        description: t.services.singleSession.description,
      },
      {
        href: "/school",
        Icon: GraduationCap,
        label: t.services.schoolProgram.title,
        description: t.services.schoolProgram.description,
      },
      {
        href: "/calendar-main",
        Icon: Calendar,
        label: "weekly schedule",
        description: "t.services.calendar.description",
      },
      {
        href: "/doctorportal/profile-doctor",
        Icon: User,
        label: t.services.myProfile.title,
        description: t.services.myProfile.description,
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
    <div className={styles.container}>
      <DoctorHeader
        user={user}
        loading={loading}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <h3 className={styles.welcomeTitle}>{t.welcome.title}</h3>
          <p className={styles.welcomeSubtitle}>{t.welcome.subtitle}</p>
        </div>

        {/* Medical Guidelines */}
        <div className={styles.guidelinesCard}>
          <div className={styles.guidelinesTitle}>
            <ShieldCheck className={styles.guidelinesIcon} />
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
            <CustomLink key={idx} href={href} className={styles.serviceCard} onClick={handleCardClick(href)}>
              <Icon className={styles.serviceIcon} />
              <h3 className={styles.serviceTitle}>{label}</h3>
              <p className={styles.serviceDescription}>{description}</p>
            </CustomLink>
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
                  <label className={styles.label}>{t.auth.username}</label>
                  <input
                    type="text"
                    className={`${styles.input} ${
                      signupErrors.username
                        ? styles.inputError
                        : signUsername && !signupErrors.username
                          ? styles.inputSuccess
                          : ""
                    }`}
                    value={signUsername}
                    onChange={(e) => setSignUsername(e.target.value)}
                    required
                    placeholder={t.auth.usernamePlaceholder}
                  />
                  {signupErrors.username && (
                    <div className={styles.errorMessage}>
                      <AlertTriangle size={16} />
                      {signupErrors.username}
                    </div>
                  )}
                  {signUsername && !signupErrors.username && (
                    <div className={styles.successMessage}>
                      <Check size={16} />
                      {t.validation.validUsername}
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
                    placeholder={t.auth.phonePlaceholder}
                  />
                  {signupErrors.phone && (
                    <div className={styles.errorMessage}>
                      <AlertTriangle size={16} />
                      {signupErrors.phone}
                    </div>
                  )}
                  {signPhone && !signupErrors.phone && (
                    <div className={styles.successMessage}>
                      <Check size={16} />
                      {t.validation.validPhone}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.title}</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={signTitle}
                    onChange={(e) => setSignTitle(e.target.value)}
                    placeholder={t.auth.titlePlaceholder}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.availability}</label>
                  <select
                    className={styles.select}
                    value={signAvailability}
                    onChange={(e) => setSignAvailability(e.target.value)}
                    required
                  >
                    <option value="">{t.auth.selectAvailability}</option>
                    <option value="Available">{t.auth.available}</option>
                    <option value="Not Available">{t.auth.notAvailable}</option>
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignPassword(!showSignPassword)}
                      className={styles.passwordToggle}
                    >
                      {showSignPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {signPassword && <DoctorPasswordStrength strength={passwordStrength} />}
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
                  disabled={signupLoading || Object.keys(signupErrors).length > 0 || !signAvailability}
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
