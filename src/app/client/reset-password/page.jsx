"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import styles from "@/styles/ClientPortal.module.css"
import { RiLockLine, RiArrowLeftLine, RiCheckLine, RiErrorWarningLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri"
import axiosInstance from "@/helper/axiosSetup"

function ResetPasswordForm() {
  const { language, translations } = useLanguage()
  const t = translations[language]

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [token, setToken] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      setError(t.auth.invalidResetLink)
    } else {
      setToken(tokenParam)
    }
  }, [searchParams, t])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    if (password !== confirmPassword) {
      setError(t.auth.passwordsDoNotMatch)
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError(t.auth.passwordTooShort)
      setLoading(false)
      return
    }

    try {
      const response = await axiosInstance.post("/authentication/reset-password", {
        token,
        newPassword: password,
      })

      if (response.data) {
        setMessage(response.data.message || t.auth.resetSuccess)
        setTimeout(() => {
          router.push("/clientportal")
        }, 2000)
      }
    } catch (err) {
      console.error("Error:", err)
      setError(err.response?.data?.message || t.auth.resetFailed)
    } finally {
      setLoading(false)
    }
  }

  if (!token && !error) {
    return (
      <div className={`${styles.container} ${language === "ar" ? styles.rtl : styles.ltr}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>{t.auth.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${language === "ar" ? styles.rtl : styles.ltr}`}>
      <div className={styles.modal} style={{ position: "fixed" }}>
        <div className={styles.modalContent} style={{ maxWidth: "480px" }}>
          <div className={styles.modalHeader}>
            <h4 className={styles.modalTitle}>{t.auth.resetPasswordTitle}</h4>
          </div>

          <div className={styles.modalBody}>
            <p
              style={{
                color: "#64748b",
                marginBottom: "2rem",
                textAlign: "center",
                fontSize: "1rem",
              }}
            >
              {t.auth.resetPasswordSubtitle}
            </p>

            {message && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "2px solid #10b981",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <RiCheckLine style={{ color: "#10b981", fontSize: "1.5rem", flexShrink: 0, marginTop: "0.125rem" }} />
                <div>
                  <p style={{ color: "#10b981", fontSize: "0.95rem", margin: 0, marginBottom: "0.25rem" }}>{message}</p>
                  <p style={{ color: "#059669", fontSize: "0.875rem", margin: 0 }}>
                    {language === "ar" ? "جاري التوجيه لتسجيل الدخول..." : "Redirecting to login..."}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "2px solid #ef4444",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <RiErrorWarningLine style={{ color: "#ef4444", fontSize: "1.5rem", flexShrink: 0 }} />
                <p style={{ color: "#ef4444", fontSize: "0.95rem", margin: 0 }}>{error}</p>
              </div>
            )}

            {!message && (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.newPassword}</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={styles.input}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder={t.auth.enterNewPassword}
                      disabled={loading || !token}
                      style={{
                        paddingLeft: language === "ar" ? "3rem" : "3rem",
                        paddingRight: language === "ar" ? "3rem" : "3rem",
                      }}
                    />
                    <RiLockLine
                      style={{
                        position: "absolute",
                        left: language === "ar" ? "auto" : "1rem",
                        right: language === "ar" ? "1rem" : "auto",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#64748b",
                        fontSize: "1.25rem",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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
                        fontSize: "1.25rem",
                      }}
                    >
                      {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.5rem" }}>
                    {t.auth.passwordMinLength}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.auth.confirmPassword}</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={styles.input}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder={t.auth.confirmNewPassword}
                      disabled={loading || !token}
                      style={{
                        paddingLeft: language === "ar" ? "3rem" : "3rem",
                        paddingRight: language === "ar" ? "3rem" : "3rem",
                      }}
                    />
                    <RiLockLine
                      style={{
                        position: "absolute",
                        left: language === "ar" ? "auto" : "1rem",
                        right: language === "ar" ? "1rem" : "auto",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#64748b",
                        fontSize: "1.25rem",
                      }}
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
                        fontSize: "1.25rem",
                      }}
                    >
                      {showConfirmPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  style={{ marginTop: "1rem" }}
                >
                  {loading ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      {t.auth.resetting}
                    </>
                  ) : (
                    t.auth.resetPassword
                  )}
                </button>
              </form>
            )}

            <div className={styles.textCenter} style={{ marginTop: "1.5rem" }}>
              <Link href="/clientportal" className={styles.linkButton}>
                <RiArrowLeftLine
                  style={{
                    display: "inline",
                    marginRight: language === "ar" ? "0" : "0.5rem",
                    marginLeft: language === "ar" ? "0.5rem" : "0",
                  }}
                />
                {t.auth.backToLogin}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
