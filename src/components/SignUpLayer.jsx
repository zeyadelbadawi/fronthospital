"use client"
import { useState } from "react"
import { Icon } from "@iconify/react/dist/iconify.js"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"

const SignUpLayer = () => {
  const [role, setRole] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    dateOfBirth: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!role) {
      setError("Please select a role")
      setLoading(false)
      return
    }

    try {
      const signupUrl = `${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/${role}`
      const response = await axios.post(signupUrl, formData, {
        withCredentials: true,
      })

      console.log("signup=>>>>", response.data)

      // Redirect to sign-in page after successful registration
      router.push("/sign-in")
    } catch (error) {
      console.error(error)
      setError(error.response?.data?.message || "Error during registration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .auth-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          max-width: 520px;
          width: 100%;
          padding: 48px 40px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .brand-section {
          text-align: center;
          margin-bottom: 32px;
        }

        .brand-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          border-radius: 16px;
          margin-bottom: 20px;
          box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
        }

        .brand-logo .icon {
          font-size: 36px;
          color: white;
        }

        .brand-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 6px;
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
        }

        .form-title {
          font-size: 22px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
          text-align: center;
        }

        .form-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
          text-align: center;
        }

        .role-selection {
          margin-bottom: 24px;
        }

        .role-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 12px;
          text-align: center;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .role-option {
          padding: 14px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          font-size: 13px;
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

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 18px;
          z-index: 2;
        }

        .form-input {
          width: 100%;
          height: 48px;
          padding: 0 14px 0 46px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: #f9fafb;
          font-size: 14px;
          color: #111827;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #1e40af;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .password-toggle:hover {
          color: #1e40af;
          background: #f3f4f6;
        }

        .password-hint {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .submit-btn {
          width: 100%;
          height: 50px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
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
          width: 18px;
          height: 18px;
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
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .signin-link {
          text-align: center;
          font-size: 13px;
          color: #6b7280;
        }

        .signin-link a {
          color: #1e40af;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .signin-link a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        @media (max-width: 580px) {
          .auth-card {
            padding: 28px 20px;
            margin: 10px;
          }
          
          .brand-title {
            font-size: 20px;
          }
          
          .form-title {
            font-size: 18px;
          }
          
          .role-grid {
            grid-template-columns: 1fr;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .form-input {
            height: 44px;
            padding: 0 12px 0 42px;
          }
          
          .input-icon {
            left: 12px;
            font-size: 16px;
          }
          
          .password-toggle {
            right: 12px;
            font-size: 16px;
          }
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-card">
          {/* Brand Section */}
          <div className="brand-section">
            <div className="brand-logo">
              <Icon icon="medical-icon:health-services" className="icon" />
            </div>
            <h1 className="brand-title">Rukn Alwatekon Center</h1>
            <p className="brand-subtitle">Professional Healthcare Management System</p>
          </div>

          {/* Form Section */}
          <div>
            <h2 className="form-title">Create Your Account</h2>
            <p className="form-subtitle">Join our healthcare management system</p>

            {error && (
              <div className="error-message">
                <Icon icon="heroicons:exclamation-triangle" />
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="role-selection">
              <h3 className="role-title">Select Your Role</h3>
              <div className="role-grid">
                <div className={`role-option ${role === "patient" ? "active" : ""}`} onClick={() => setRole("patient")}>
                  <Icon icon="hugeicons:student" style={{ fontSize: "18px", marginBottom: "4px" }} />
                  <div>Patient</div>
                </div>
                <div className={`role-option ${role === "doctor" ? "active" : ""}`} onClick={() => setRole("doctor")}>
                  <Icon icon="healthicons:doctor" style={{ fontSize: "18px", marginBottom: "4px" }} />
                  <div>Doctor</div>
                </div>
              </div>
            </div>

            {role && (
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-wrapper">
                      <Icon icon="f7:person" className="input-icon" />
                      <input
                        type="text"
                        name="name"
                        className="form-input"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-wrapper">
                      <Icon icon="bx:phone" className="input-icon" />
                      <input
                        type="tel"
                        name="phone"
                        className="form-input"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <Icon icon="mage:email" className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Patient-specific fields */}
                {role === "patient" && (
                  <>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <div className="input-wrapper">
                          <Icon icon="bi:calendar" className="input-icon" />
                          <input
                            type="date"
                            name="dateOfBirth"
                            className="form-input"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Address</label>
                        <div className="input-wrapper">
                          <Icon icon="fluent:home-16-regular" className="input-icon" />
                          <input
                            type="text"
                            name="address"
                            className="form-input"
                            placeholder="Enter your address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <Icon icon="solar:lock-password-outline" className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-input"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      <Icon icon={showPassword ? "heroicons:eye-slash" : "heroicons:eye"} />
                    </button>
                  </div>
                  <div className="password-hint">Password must be at least 8 characters long</div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Icon icon="heroicons:user-plus" />
                      Create Account
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Sign In Link */}
            <div className="signin-link">
              Already have an account? <Link href="/sign-in">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUpLayer
