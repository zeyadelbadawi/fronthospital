"use client"
import { Icon } from "@iconify/react/dist/iconify.js"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"

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

      console.log("login=>>>>", response.data)
      const token = response.data.accessToken
      localStorage.setItem("token", token)

      // Redirect based on the role
      if (role === "admin") {
        router.push("/")
      } else if (role === "patient") {
        router.push("/")
      } else if (role === "doctor") {
        router.push("/doctorportal")
      } else if (role === "accountant") {
        router.push("/accountantportal")
      }
    } catch (error) {
      console.error(error)
      setError(error.response?.data?.message || "Error during login. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .auth-card {
          background: #ffffff;
          border-radius: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          width: 80%;
          padding: 48px 40px;
        }

        .brand-section {
          text-align: center;
          margin-bottom: 40px;
        }

        .brand-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 160px;
          height: 160px;
          border-radius: 20px;
          margin-bottom: 24px;
          box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
        }

        .brand-logo .icon {
          font-size: 40px;
          color: white;
        }

        .brand-title {
          font-size: 28px;
          font-weight: 700;
          color: #454492;
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 32px;
        }

        .form-title {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
          text-align: center;
        }

        .form-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 32px;
          text-align: center;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 20px;
          z-index: 2;
        }

        .form-input {
          width: 100%;
          height: 56px;
          padding: 0 16px 0 52px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          font-size: 16px;
          color: #111827;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #1e40af;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(30, 64, 175, 0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 20px;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .password-toggle:hover {
          color: #1e40af;
          background: #f3f4f6;
        }

        .form-select {
          width: 100%;
          height: 56px;
          padding: 0 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          font-size: 16px;
          color: #111827;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .form-select:focus {
          outline: none;
          border-color: #1e40af;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(30, 64, 175, 0.1);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
        }

        .form-checkbox:checked {
          background: #1e40af;
          border-color: #1e40af;
        }

        .checkbox-label {
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .forgot-link {
          font-size: 14px;
          color: #1e40af;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .forgot-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          height: 56px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .signup-link {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }

        .signup-link a {
          color: #1e40af;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .signup-link a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .role-option {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .role-option:hover {
          border-color: #1e40af;
          background: #eff6ff;
        }

        .role-option.active {
          border-color: #1e40af;
          background: #1e40af;
          color: white;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 32px 24px;
            margin: 10px;
          }
          
          .brand-title {
            font-size: 24px;
          }
          
          .form-title {
            font-size: 20px;
          }
          
          .role-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-card">
          {/* Brand Section */}
          <div className="brand-section">
            <div className="brand-logo">
  <img src="/images/rukn-logo.png" alt="Brand Logo" className="logo-image" />
            </div>
            <h3 className="brand-title">Rukn Alwatekon Center</h3>
            <p className="brand-subtitle">Professional Healthcare Management System</p>
          </div>

          {/* Form Section */}
          <div>
            <h4 className="form-title">Welcome Back</h4>
            <p className="form-subtitle">Please sign in to your account</p>

            {error && (
              <div className="error-message">
                <Icon icon="heroicons:exclamation-triangle" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label">Select Your Role</label>
                <div className="role-grid">
                  <div className={`role-option ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")}>
                    <Icon icon="eos-icons:admin" style={{ fontSize: "20px", marginBottom: "4px" }} />
                    <div>Admin</div>
                  </div>
                  <div
                    className={`role-option ${role === "patient" ? "active" : ""}`}
                    onClick={() => setRole("patient")}
                  >
                    <Icon icon="hugeicons:student" style={{ fontSize: "20px", marginBottom: "4px" }} />
                    <div>Patient</div>
                  </div>
                  <div className={`role-option ${role === "doctor" ? "active" : ""}`} onClick={() => setRole("doctor")}>
                    <Icon icon="healthicons:doctor" style={{ fontSize: "20px", marginBottom: "4px" }} />
                    <div>Doctor</div>
                  </div>
                  <div
                    className={`role-option ${role === "accountant" ? "active" : ""}`}
                    onClick={() => setRole("accountant")}
                  >
                    <Icon icon="mdi:account-cash" style={{ fontSize: "20px", marginBottom: "4px" }} />
                    <div>Accountant</div>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Icon icon="mage:email" className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Icon icon="solar:lock-password-outline" className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    <Icon icon={showPassword ? "heroicons:eye-slash" : "heroicons:eye"} />
                  </button>
                </div>
              </div>

              {/* Form Options */}
              <div className="form-options">
                <div className="checkbox-wrapper">
                  <input type="checkbox" id="remember" className="form-checkbox" />
                  <label htmlFor="remember" className="checkbox-label">
                    Remember me
                  </label>
                </div>
                <Link href="#" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Signing In...
                  </>  
                ) : (
                  <>
                    <Icon icon="heroicons:arrow-right-on-rectangle" />
                    Sign In
                  </>
                )}
              </button>
            </form>          
          </div>
        </div>
      </div>
    </>
  )
}

export default SignInLayer
