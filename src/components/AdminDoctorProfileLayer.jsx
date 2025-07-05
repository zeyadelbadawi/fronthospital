"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Edit3, Lock, Eye, EyeOff, Save, X, Stethoscope } from "lucide-react"
import styles from "../styles/profile-view.module.css"

const AdminDoctorProfileLayer = () => {
  const router = useRouter()
  const [doctor, setDoctor] = useState(null)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [doctorId, setDoctorId] = useState(null)
  const [activeTab, setActiveTab] = useState("edit-profile")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      setDoctorId(params.get("id"))
    }
  }, [])

  useEffect(() => {
    if (doctorId) {
      const fetchDoctor = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/doctor/${doctorId}`)
          setDoctor(response.data)
          setUsername(response.data.username)
          setEmail(response.data.email)
          setPhone(response.data.phone)
          setLoading(false)
        } catch (error) {
          console.error("Error fetching doctor data:", error)
          setLoading(false)
        }
      }
      fetchDoctor()
    }
  }, [doctorId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const updatedDoctor = { username, email, phone }
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-doctor/${doctorId}`,
        updatedDoctor,
      )
      if (response.status === 200) {
        alert("Doctor updated successfully")
        router.push("/doctor-list")
      }
    } catch (error) {
      console.error("Error updating doctor:", error)
      alert("Error updating doctor")
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!")
      return
    }
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/doctor-password/${doctorId}`,
        { password: newPassword },
      )
      if (response.status === 200) {
        alert("Password updated successfully")
        setPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      alert("Error updating password")
    }
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading doctor profile...</div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Doctor profile not found</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileWrapper}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}></div>
          <div className={styles.profileContent}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>Dr. {username.charAt(0).toUpperCase()}</div>
              <h2 className={styles.profileName}>Dr. {username}</h2>
              <p className={styles.profileEmail}>{email}</p>
              <div className={styles.profileBadge}>
                <Stethoscope className={styles.profileBadgeIcon} />
                Doctor
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.infoTitle}>
                <Stethoscope className={styles.infoTitleIcon} />
                Doctor Information
              </h3>
              <ul className={styles.infoList}>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <User className={styles.infoLabelIcon} />
                    Username
                  </span>
                  <span className={styles.infoValue}>{username}</span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Mail className={styles.infoLabelIcon} />
                    Email
                  </span>
                  <span className={styles.infoValue}>{email}</span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Phone className={styles.infoLabelIcon} />
                    Phone
                  </span>
                  <span className={styles.infoValue}>{phone}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Doctor Profile Management</h1>
            <p className={styles.contentSubtitle}>Manage doctor information and account settings</p>
          </div>

          <div className={styles.tabsContainer}>
            <ul className={styles.tabsList}>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "edit-profile" ? styles.active : ""}`}
                  onClick={() => setActiveTab("edit-profile")}
                >
                  <Edit3 className={styles.tabIcon} />
                  Edit Profile
                </button>
              </li>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "change-password" ? styles.active : ""}`}
                  onClick={() => setActiveTab("change-password")}
                >
                  <Lock className={styles.tabIcon} />
                  Change Password
                </button>
              </li>
            </ul>
          </div>

          <div className={styles.tabContent}>
            {/* Edit Profile Tab */}
            <div className={`${styles.tabPane} ${activeTab === "edit-profile" ? styles.active : ""}`}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="username" className={styles.formLabel}>
                      <User className={styles.labelIcon} />
                      Username <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter Username"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>
                      <Mail className={styles.labelIcon} />
                      Email <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      className={styles.formInput}
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.formLabel}>
                    <Phone className={styles.labelIcon} />
                    Phone Number <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    className={styles.formInput}
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => router.push("/doctor-list")}>
                    <X className={styles.buttonIcon} />
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    <Save className={styles.buttonIcon} />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Tab */}
            <div className={`${styles.tabPane} ${activeTab === "change-password" ? styles.active : ""}`}>
              <form onSubmit={handlePasswordChange} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="your-password" className={styles.formLabel}>
                    <Lock className={styles.labelIcon} />
                    New Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={passwordVisible ? "text" : "password"}
                      className={styles.formInput}
                      id="your-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter New Password"
                    />
                    <button type="button" className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                      {passwordVisible ? (
                        <EyeOff className={styles.passwordToggleIcon} />
                      ) : (
                        <Eye className={styles.passwordToggleIcon} />
                      )}
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="confirm-password" className={styles.formLabel}>
                    <Lock className={styles.labelIcon} />
                    Confirm Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      className={styles.formInput}
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                    />
                    <button type="button" className={styles.passwordToggle} onClick={toggleConfirmPasswordVisibility}>
                      {confirmPasswordVisible ? (
                        <EyeOff className={styles.passwordToggleIcon} />
                      ) : (
                        <Eye className={styles.passwordToggleIcon} />
                      )}
                    </button>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelButton}>
                    <X className={styles.buttonIcon} />
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    <Save className={styles.buttonIcon} />
                    Save Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDoctorProfileLayer
