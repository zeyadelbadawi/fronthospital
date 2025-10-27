"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import styles from "@/styles/ClientPortal.module.css"
import { RiMailLine, RiArrowLeftLine, RiCheckLine, RiErrorWarningLine } from "react-icons/ri"
import axiosInstance from "@/helper/axiosSetup"

export default function ForgotPasswordPage() {
  const { language, translations } = useLanguage()
  const t = translations[language]

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await axiosInstance.post("/authentication/forgot-password", {
        email,
      })

      if (response.data) {
        setMessage(response.data.message || t.auth.resetEmailSent)
        setEmail("")
      }
    } catch (err) {
      console.error("Error:", err)
      setError(err.response?.data?.message || t.auth.sendEmailFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.container} ${language === "ar" ? styles.rtl : styles.ltr}`}>
      <div className={styles.modal} style={{ position: "fixed" }}>
        <div className={styles.modalContent} style={{ maxWidth: "480px" }}>
          <div className={styles.modalHeader}>
            <h4 className={styles.modalTitle}>{t.auth.forgotPasswordTitle}</h4>
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
              {t.auth.forgotPasswordSubtitle}
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
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <RiCheckLine style={{ color: "#10b981", fontSize: "1.5rem", flexShrink: 0 }} />
                <p style={{ color: "#10b981", fontSize: "0.95rem", margin: 0 }}>{message}</p>
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

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t.auth.emailAddress}</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t.auth.enterYourEmail}
                    disabled={loading}
                    style={{
                      paddingLeft: language === "ar" ? "1rem" : "3rem",
                      paddingRight: language === "ar" ? "3rem" : "1rem",
                    }}
                  />
                  <RiMailLine
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
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${styles.button} ${styles.buttonPrimary}`}
                style={{ marginTop: "1rem" }}
              >
                {loading ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    {t.auth.sending}
                  </>
                ) : (
                  t.auth.sendResetLink
                )}
              </button>
            </form>

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
