"use client"
import { useEffect, useState } from "react"
import axiosInstance from "../../helper/axiosSetup"
import Link from "next/link"
import {
  RiCalendarEventLine,
  RiGroupLine,
  RiCalendarCheckLine,
  RiFileListLine,
  RiShieldCheckLine,
} from "react-icons/ri"
import Header from "../../components/Header"
import styles from "../../styles/ClientPortal.module.css"

export default function ClientPortalPage() {
  // --- Auth & User State ---
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

  // --- Logout Handler ---
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

  // --- Card click guard ---
  const handleCardClick = (href) => (e) => {
    if (!user || user.role !== "patient") {
      e.preventDefault()
      setShowLoginModal(true)
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
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed")
    }
  }

  // --- Static content ---
  const disclaimerLines = [
    "PLEASE NOTE THAT THIS IS NOT AN EMERGENCY SERVICE.",
    "In case of an emergency, call 999 (police), 998 (ambulance), or go to the nearest A&E facility.",
    "If you are unable to attend or wish to reschedule, please provide at least 24 hours' notice; otherwise a cancellation fee may apply.",
    "All correspondence is confidential. Please do not disclose your appointment or personal information outside this office.",
    "For in-person appointments, arrive 15 minutes early to complete any necessary paperwork.",
    "If you have insurance, bring your policy details (insurer name, policy number, subscriber ID).",
    "For telemedicine, ensure you have a stable internet connection, a compatible device, and a quiet private space.",
  ]

  const services = [
    {
      href: "/wizard",
      Icon: RiCalendarEventLine,
      label: "Book Appointment",
      description: "Schedule your next appointment with our specialists",
    },
    {
      href: "/profile",
      Icon: RiGroupLine,
      label: "My Profile",
      description: "View and update your personal information",
    },
    {
      href: "/calendar-main-patient",
      Icon: RiCalendarCheckLine,
      label: "My Appointments",
      description: "View your upcoming and past appointments",
    },
    {
      href: "/my-invoices",
      Icon: RiFileListLine,
      label: "My Invoices",
      description: "Access your billing information and payment history",
    },
  ]

  return (
    <div className={styles.container}>
      <Header user={user} loading={loading} onLoginClick={() => setShowLoginModal(true)} onLogout={handleLogout} />

      <main className={styles.main}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <h4 className={styles.welcomeTitle}>Welcome to Your Health Portal</h4>
        
        </div>

        {/* Disclaimer */}
        <div className={styles.disclaimerCard}>
          <div className={styles.disclaimerTitle}>
            <RiShieldCheckLine />
            Important Information
          </div>
          {disclaimerLines.map((line, i) => (
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
              <h2 className={styles.modalTitle}>Welcome Back</h2>
              <button className={styles.closeButton} onClick={() => setShowLoginModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={onLogin} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                <div className={styles.checkbox}>
                  <input id="remember" type="checkbox" className={styles.checkboxInput} />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Sign In
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
                  Don't have an account? Register here
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
              <h2 className={styles.modalTitle}>Create Account</h2>
              <button className={styles.closeButton} onClick={() => setShowSignupModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={onSignup} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={signEmail}
                    onChange={(e) => setSignEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    className={styles.input}
                    value={signPhone}
                    onChange={(e) => setSignPhone(e.target.value)}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Gender</label>
                  <select
                    className={styles.select}
                    value={signGender}
                    onChange={(e) => setSignGender(e.target.value)}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={signPassword}
                    onChange={(e) => setSignPassword(e.target.value)}
                    required
                    placeholder="Create a password"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={signConfirm}
                    onChange={(e) => setSignConfirm(e.target.value)}
                    required
                    placeholder="Confirm your password"
                  />
                </div>
                <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Create Account
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
                  Already have an account? Sign in here
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
