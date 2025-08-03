"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import axiosInstance from "@/helper/axiosSetup"
import PublicProfileDoctor from "@/components/PublicProfileDoctor";

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
import DoctorHeader from "../../../components/doctor-header"
import styles from "../../../styles/DoctorPortal.module.css"
import { useDoctorLanguage } from "../../../contexts/doctor-language-context"

// Lazy load heavy components
const DoctorPasswordStrength = dynamic(() => import("../../../components/doctor-password-strength"), {
  loading: () => <div className={styles.loadingSkeleton}></div>,
})



export default function doctorpage() {


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
  return (
    <>
      {/* MasterLayout */}
      <DoctorHeader
        user={user}
        loading={loading}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />
        {/* ViewProfileLayer */}
        <PublicProfileDoctor />
    </>
  );
};

