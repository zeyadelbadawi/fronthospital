"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import axiosInstance from "../../helper/axiosSetup"
import CustomLink from "@/components/CustomLink"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import ReCAPTCHA from "react-google-recaptcha"
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
  const [rememberMe, setRememberMe] = useState(false)
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
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState(null)
  const [signupErrors, setSignupErrors] = useState({})
  const [signupLoading, setSignupLoading] = useState(false)
  const [showSignPassword, setShowSignPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const [emailCheckLoading, setEmailCheckLoading] = useState(false)
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false)
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState(null)
  const [phoneAvailable, setPhoneAvailable] = useState(null)
  const [usernameAvailable, setUsernameAvailable] = useState(null)

  // --- Toast State ---
  const [toast, setToast] = useState(null)

  // --- Memoized Validation Functions ---
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  const validatePhone = useCallback((phone) => {
    if (!phone) return false
    // Phone number should be in international format with country code
    return phone.length >= 10
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

  useEffect(() => {
    if (!signEmail || !validateEmail(signEmail)) {
      setEmailAvailable(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setEmailCheckLoading(true)
      try {
        const response = await axiosInstance.post("/authentication/check-email", {
          email: signEmail,
        })
        setEmailAvailable(response.data.available)
      } catch (error) {
        console.error("Email check error:", error)
        setEmailAvailable(null)
      } finally {
        setEmailCheckLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [signEmail, validateEmail])

  useEffect(() => {
    if (!signPhone || !validatePhone(signPhone)) {
      setPhoneAvailable(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setPhoneCheckLoading(true)
      try {
        const response = await axiosInstance.post("/authentication/check-phone", {
          phone: signPhone,
        })
        setPhoneAvailable(response.data.available)
      } catch (error) {
        console.error("Phone check error:", error)
        setPhoneAvailable(null)
      } finally {
        setPhoneCheckLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [signPhone, validatePhone])

  useEffect(() => {
    if (!signName || !validateName(signName)) {
      setUsernameAvailable(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setUsernameCheckLoading(true)
      try {
        const response = await axiosInstance.post("/authentication/check-username", {
          username: signName,
        })
        setUsernameAvailable(response.data.available)
      } catch (error) {
        console.error("Username check error:", error)
        setUsernameAvailable(null)
      } finally {
        setUsernameCheckLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [signName, validateName])

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
      } else if (usernameAvailable === false) {
        newErrors.name = "Username is already taken"
      }

      if (signEmail && !validateEmail(signEmail)) {
        newErrors.email = t.validation.invalidEmail
      } else if (emailAvailable === false) {
        newErrors.email = "Email is already registered"
      }

      if (signPhone && !validatePhone(signPhone)) {
        newErrors.phone = t.validation.invalidPhone
      } else if (phoneAvailable === false) {
        newErrors.phone = "Phone number is already registered"
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
    emailAvailable,
    phoneAvailable,
    usernameAvailable,
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
          rememberMe: rememberMe,
        })
        localStorage.setItem("token", res.data.accessToken)
        setShowLoginModal(false)
        await loadProfile()
        showToast(t.messages.loginSuccess)

        // Reset form
        setLoginEmail("")
        setLoginPassword("")
        setRememberMe(false)
        setLoginErrors({})
      } catch (err) {
        showToast(err.response?.data?.message || t.messages.loginFailed, "error")
      } finally {
        setLoginLoading(false)
      }
    },
    [loginErrors, loginEmail, loginPassword, rememberMe, showToast, loadProfile, t],
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

      if (!termsAccepted) {
        showToast("You must accept the terms and conditions", "error")
        return
      }

      if (!captchaToken) {
        showToast("Please complete the CAPTCHA verification", "error")
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
          confirmPassword: signConfirm,
          termsAccepted: termsAccepted,
          captchaToken: captchaToken,
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
        setTermsAccepted(false)
        setCaptchaToken(null)
        setSignupErrors({})
        setPasswordStrength(0)
        setEmailAvailable(null)
        setPhoneAvailable(null)
        setUsernameAvailable(null)
      } catch (err) {
        showToast(err.response?.data?.message || t.messages.signupFailed, "error")
      } finally {
        setSignupLoading(false)
      }
    },
    [
      signupErrors,
      signGender,
      signName,
      signEmail,
      signPhone,
      signPassword,
      signConfirm,
      termsAccepted,
      captchaToken,
      showToast,
      t,
    ],
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
                  <input
                    id="remember"
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
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

              <div className={styles.textCenter} style={{ marginTop: "0.5rem" }}>
                <a
                  href="/clientportal/forgot-password"
                  className={styles.linkButton}
                  style={{ fontSize: "0.875rem", color: "#64748b" }}
                >
                  {t.auth.forgotPassword}
                </a>
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
                  {usernameCheckLoading && <div className={styles.loadingText}>Checking availability...</div>}
                  {signupErrors.name && (
                    <div className={styles.errorMessage}>
                      <RiErrorWarningLine />
                      {signupErrors.name}
                    </div>
                  )}
                  {signName && !signupErrors.name && usernameAvailable === true && !usernameCheckLoading && (
                    <div className={styles.successMessage}>
                      <RiCheckLine />
                      Username is available
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
                        : signEmail && !signupErrors.email && emailAvailable === true
                          ? styles.inputSuccess
                          : ""
                    }`}
                    value={signEmail}
                    onChange={(e) => setSignEmail(e.target.value)}
                    required
                    placeholder={t.auth.emailPlaceholder}
                  />
                  {emailCheckLoading && <div className={styles.loadingText}>Checking availability...</div>}
                  {signupErrors.email && (
                    <div className={styles.errorMessage}>
                      <RiErrorWarningLine />
                      {signupErrors.email}
                    </div>
                  )}
                  {signEmail && !signupErrors.email && emailAvailable === true && !emailCheckLoading && (
                    <div className={styles.successMessage}>
                      <RiCheckLine />
                      Email is available
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.phone}</label>
                  <PhoneInput
                    international
                    defaultCountry="AE"
                    value={signPhone}
                    onChange={setSignPhone}
                    className={`${styles.phoneInput} ${
                      signupErrors.phone
                        ? styles.inputError
                        : signPhone && !signupErrors.phone && phoneAvailable === true
                          ? styles.inputSuccess
                          : ""
                    }`}
                    placeholder="Enter phone number"
                  />
                  {phoneCheckLoading && <div className={styles.loadingText}>Checking availability...</div>}
                  {signupErrors.phone && (
                    <div className={styles.errorMessage}>
                      <RiErrorWarningLine />
                      {signupErrors.phone}
                    </div>
                  )}
                  {signPhone && !signupErrors.phone && phoneAvailable === true && !phoneCheckLoading && (
                    <div className={styles.successMessage}>
                      <RiCheckLine />
                      Phone number is available
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

                <div className={styles.checkbox}>
                  <input
                    id="terms"
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                  />
                  <label htmlFor="terms">
                    I accept the{" "}
                    <a href="/terms" target="_blank" className={styles.link} rel="noreferrer">
                      terms and conditions
                    </a>
                  </label>
                </div>

                <div className={styles.captchaContainer}>
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                    onChange={(token) => setCaptchaToken(token)}
                    onExpired={() => setCaptchaToken(null)}
                  />
                </div>

                <button
                  type="submit"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={
                    signupLoading ||
                    Object.keys(signupErrors).length > 0 ||
                    !signGender ||
                    !termsAccepted ||
                    !captchaToken ||
                    emailAvailable === false ||
                    phoneAvailable === false ||
                    usernameAvailable === false
                  }
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
