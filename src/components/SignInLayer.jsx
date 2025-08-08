"use client"
import { useState } from "react"
import CustomLink from '@/components/CustomLink'
import { useRouter } from "next/navigation"
import axios from "axios"
import { AlertTriangle, ShieldCheck, Stethoscope, Wallet, Mail, Lock, EyeOff, Eye, LogIn } from "lucide-react"
import styles from "@/styles/sign-in.module.css" // Import the new CSS Module

const SignInLayer = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!role) {
      setError("Please select a role")
      setLoading(false)
      return
    }

    const data = { email, password }
    const loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/authentication/signin/${role}`

    try {
      const response = await axios.post(loginUrl, data, {
        withCredentials: true,
      })

      const token = response.data.accessToken
      localStorage.setItem("token", token)

      // Redirect based on the role
      if (role === "admin") {
        router.push("/")
      } else if (role === "doctor") {
        router.push("/doctorportal")
      } else if (role === "accountant") {
        router.push("/accountantportal")
      } else if (role === "HeadDoctor") {
        router.push("/")
      }
    } catch (error) {
      console.error(error)
      setError(error.response?.data?.message || "Error during login. Please check your credentials.")
    } finally {
      setLoading(false)
    }
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
        </div>

        {/* Form Section */}
        <div>
          <h4 className={styles.formTitle}>Welcome Back</h4>
          <p className={styles.formSubtitle}>Please sign in to your account</p>

          {error && (
            <div className={styles.errorMessage}>
              <AlertTriangle size={20} /> {/* Replaced Icon */}
              {error}
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
                  <ShieldCheck size={20} style={{ marginBottom: "4px" }} /> {/* Replaced Icon */}
                  <div>Admin</div>
                </div>

                <div
                  className={`${styles.roleOption} ${role === "doctor" ? styles.active : ""}`}
                  onClick={() => setRole("doctor")}
                >
                  <Stethoscope size={20} style={{ marginBottom: "4px" }} /> {/* Replaced Icon */}
                  <div>Doctor</div>
                </div>
                <div
                  className={`${styles.roleOption} ${role === "accountant" ? styles.active : ""}`}
                  onClick={() => setRole("accountant")}
                >
                  <Wallet size={20} style={{ marginBottom: "4px" }} /> {/* Replaced Icon */}
                  <div>Accountant</div>
                </div>
                <div
                  className={`${styles.roleOption} ${role === "HeadDoctor" ? styles.active : ""}`}
                  onClick={() => setRole("HeadDoctor")}
                >
                  <Stethoscope size={20} style={{ marginBottom: "4px" }} /> {/* Replaced Icon */}
                  <div>Head Doctor</div>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.inputIcon} /> {/* Replaced Icon */}
                <input
                  type="email"
                  className={styles.formInput}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} /> {/* Replaced Icon */}
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.formInput}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} {/* Replaced Icon */}
                </button>
              </div>
            </div>

            {/* Form Options */}
            <div className={styles.formOptions}>
              <div className={styles.checkboxWrapper}>
                <input type="checkbox" id="remember" className={styles.formCheckbox} />
                <label htmlFor="remember" className={styles.checkboxLabel}>
                  Remember me
                </label>
              </div>
              <CustomLink href="#" className={styles.forgotLink}>
                Forgot Password?
              </CustomLink>
            </div>

            {/* Submit Button */}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={20} /> {/* Replaced Icon */}
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignInLayer
