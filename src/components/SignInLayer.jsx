"use client"
import { useState, useEffect } from "react"
import CustomLink from "@/components/CustomLink"
import { useRouter } from "next/navigation"
import axios from "axios"
import axiosInstance from "@/helper/axiosSetup"
import { AlertTriangle, ShieldCheck, Stethoscope, Wallet, Mail, Lock, EyeOff, Eye, LogIn, Shield } from "lucide-react"
import styles from "@/styles/sign-in.module.css"

const SignInLayer = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setCheckingAuth(false)
        return
      }

      try {
        const response = await axiosInstance.get("/authentication/profile")
        const userRole = response.data.role

        // Redirect based on role
        if (userRole === "admin" || userRole === "HeadDoctor") {
          router.push("/")
        } else if (userRole === "doctor") {
          router.push("/doctorportal")
        } else if (userRole === "accountant") {
          router.push("/accountantportal")
        } else if (userRole === "patient") {
          router.push("/clientportal")
        } else {
          // Unknown role, clear token and allow login
          localStorage.removeItem("token")
          setCheckingAuth(false)
        }
      } catch (error) {
        // Token invalid or expired, allow login
        localStorage.removeItem("token")
        setCheckingAuth(false)
      }
    }

    checkExistingAuth()
  }, [router])

  useEffect(() => {
    const checkLockout = () => {
      const lockoutData = localStorage.getItem(`lockout_${email}`)
      if (lockoutData) {
        const { time, attempts } = JSON.parse(lockoutData)
        const lockoutEnd = new Date(time).getTime() + 15 * 60 * 1000 // 15 minutes
        const now = Date.now()

        if (now < lockoutEnd) {
          setIsLocked(true)
          setLockoutTime(lockoutEnd)
          setFailedAttempts(attempts)
        } else {
          localStorage.removeItem(`lockout_${email}`)
          setIsLocked(false)
          setFailedAttempts(0)
        }
      }
    }

    if (email) {
      checkLockout()
    }
  }, [email])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const sanitizeInput = (input) => {
    return input.replace(/[<>]/g, "").trim()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (isLocked) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000 / 60)
      setError(`Account is locked. Please try again in ${remainingTime} minutes.`)
      setLoading(false)
      return
    }

    if (!role) {
      setError("Please select a role")
      setLoading(false)
      return
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    const data = { email: sanitizedEmail, password }
    const loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/authentication/signin/${role}`

    try {
      const response = await axios.post(loginUrl, data, {
        withCredentials: true,
      })

      const token = response.data.accessToken
      localStorage.setItem("token", token)

      localStorage.removeItem(`lockout_${sanitizedEmail}`)
      setFailedAttempts(0)

      // Redirect based on the role
      if (role === "admin" || role === "HeadDoctor") {
        router.push("/")
      } else if (role === "doctor") {
        router.push("/doctorportal")
      } else if (role === "accountant") {
        router.push("/accountantportal")
      } else if (role === "patient") {
        router.push("/clientportal")
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error(error)

      const errorMessage = error.response?.data?.message || "Error during login. Please check your credentials."
      setError(errorMessage)

      // Track failed attempts for privileged roles
      if (["admin", "doctor", "accountant", "HeadDoctor"].includes(role)) {
        const newFailedAttempts = failedAttempts + 1
        setFailedAttempts(newFailedAttempts)

        if (newFailedAttempts >= 5) {
          const lockoutData = {
            time: new Date().toISOString(),
            attempts: newFailedAttempts,
          }
          localStorage.setItem(`lockout_${sanitizedEmail}`, JSON.stringify(lockoutData))
          setIsLocked(true)
          setLockoutTime(Date.now() + 15 * 60 * 1000)
          setError("Too many failed attempts. Account locked for 15 minutes.")
        } else {
          setError(`${errorMessage} (${5 - newFailedAttempts} attempts remaining)`)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className={styles.loadingSpinner} style={{ margin: "0 auto 1rem" }}></div>
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Brand Section */}
        <div className={styles.brandSection}>
          <div className={styles.brandLogo}>
            <img src="/images/rukn-logo.png" alt="Brand Logo" className={styles.logoImage} />
          </div>
          <h3 className={styles.brandTitle}>Rukn Alwatekon Center</h3>
          <p className={styles.brandSubtitle}>Professional Healthcare Management System</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "0.5rem",
              color: "#10b981",
              fontSize: "0.875rem",
            }}
          >
            <Shield size={16} />
            <span>Secure Login Protected</span>
          </div>
        </div>

        {/* Form Section */}
        <div>
          <h4 className={styles.formTitle}>Welcome Back</h4>
          <p className={styles.formSubtitle}>Please sign in to your account</p>

          {error && (
            <div className={styles.errorMessage}>
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {isLocked && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                color: "#991b1b",
                fontSize: "0.875rem",
              }}
            >
              <strong>Security Alert:</strong> Account temporarily locked due to multiple failed login attempts.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Your Role</label>
              <div className={styles.roleGrid}>
                <div
                  className={`${styles.roleOption} ${role === "admin" ? styles.active : ""}`}
                  onClick={() => setRole("admin")}
                >
                  <ShieldCheck size={20} style={{ marginBottom: "4px" }} />
                  <div>Admin</div>
                </div>

                <div
                  className={`${styles.roleOption} ${role === "doctor" ? styles.active : ""}`}
                  onClick={() => setRole("doctor")}
                >
                  <Stethoscope size={20} style={{ marginBottom: "4px" }} />
                  <div>Doctor</div>
                </div>
                <div
                  className={`${styles.roleOption} ${role === "accountant" ? styles.active : ""}`}
                  onClick={() => setRole("accountant")}
                >
                  <Wallet size={20} style={{ marginBottom: "4px" }} />
                  <div>Accountant</div>
                </div>
                <div
                  className={`${styles.roleOption} ${role === "HeadDoctor" ? styles.active : ""}`}
                  onClick={() => setRole("HeadDoctor")}
                >
                  <Stethoscope size={20} style={{ marginBottom: "4px" }} />
                  <div>Head Doctor</div>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.inputIcon} />
                <input
                  type="email"
                  className={styles.formInput}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  maxLength={255}
                  disabled={isLocked}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.formInput}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  maxLength={128}
                  disabled={isLocked}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Form Options */}
            <div className={styles.formOptions}>
              <div className={styles.checkboxWrapper}>
                <input type="checkbox" id="remember" className={styles.formCheckbox} disabled={isLocked} />
                <label htmlFor="remember" className={styles.checkboxLabel}>
                  Remember me
                </label>
              </div>
              <CustomLink href="#" className={styles.forgotLink}>
                Forgot Password?
              </CustomLink>
            </div>

            {/* Submit Button */}
            <button type="submit" className={styles.submitBtn} disabled={loading || isLocked}>
              {loading ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem",
              backgroundColor: "#f0f9ff",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
              color: "#0369a1",
              textAlign: "center",
            }}
          >
            This is a secure login portal. All login attempts are monitored and logged for security purposes.
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInLayer
