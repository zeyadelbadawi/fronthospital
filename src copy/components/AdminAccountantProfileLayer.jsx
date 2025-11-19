"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { User, Mail, Lock, Eye, EyeOff, Save, X, Edit, Shield, Calculator, Briefcase } from "lucide-react"
import styles from "../styles/profile-view.module.css"

const AdminAccountantProfileLayer = () => {
  const router = useRouter()
  const [accountant, setAccountant] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordVisible, setPasswordVisible] = useState({
    new: false,
    confirm: false,
  })
  const [accountantId, setAccountantId] = useState(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      setAccountantId(params.get("id"))
    }
  }, [])

  useEffect(() => {
    if (accountantId) {
      const fetchAccountant = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/accountant/${accountantId}`,
          )
          const data = response.data
          setAccountant(data)
          setFormData({
            name: data.name || "",
            email: data.email || "",
          })
        } catch (error) {
          console.error("Error fetching accountant data:", error)
        }
      }
      fetchAccountant()
    }
  }, [accountantId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const togglePasswordVisibility = (field) => {
    setPasswordVisible((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-accountant/${accountantId}`,
        formData,
      )
      if (response.status === 200) {
        alert("Accountant updated successfully")
        router.push("/accountant-list")
      }
    } catch (error) {
      console.error("Error updating Accountant:", error)
      alert("Error updating Accountant")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords don't match!")
      return
    }
    setLoading(true)
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/accountant-password/${accountantId}`,
        { password: passwordData.newPassword },
      )
      if (response.status === 200) {
        alert("Password updated successfully")
        setPasswordData({ newPassword: "", confirmPassword: "" })
      }
    } catch (error) {
      console.error("Error updating password:", error)
      alert("Error updating password")
    } finally {
      setLoading(false)
    }
  }

  if (!accountant) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading accountant profile...</p>
        </div>
      </div>
    )
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileWrapper}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}></div>
          <div className={styles.profileContent}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>{getInitials(formData.name)}</div>
              <h2 className={styles.profileName}>{formData.name}</h2>
              <p className={styles.profileEmail}>{formData.email}</p>
              <div className={styles.profileBadge}>
                <Calculator className={styles.profileBadgeIcon} />
                Accountant
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.infoTitle}>
                <Briefcase className={styles.infoTitleIcon} />
                Professional Information
              </h3>
              <ul className={styles.infoList}>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <User className={styles.infoLabelIcon} />
                    Name
                  </span>
                  <span className={styles.infoValue}>{formData.name}</span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Mail className={styles.infoLabelIcon} />
                    Email
                  </span>
                  <span className={styles.infoValue}>{formData.email}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Accountant Profile Management</h1>
            <p className={styles.contentSubtitle}>Update accountant information and security settings</p>
          </div>

          <div className={styles.tabsContainer}>
            <ul className={styles.tabsList}>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "profile" ? styles.active : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <Edit className={styles.tabIcon} />
                  Edit Profile
                </button>
              </li>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "password" ? styles.active : ""}`}
                  onClick={() => setActiveTab("password")}
                >
                  <Shield className={styles.tabIcon} />
                  Change Password
                </button>
              </li>
            </ul>
          </div>

          <div className={styles.tabContent}>
            {/* Profile Tab */}
            <div className={`${styles.tabPane} ${activeTab === "profile" ? styles.active : ""}`}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    <User className={styles.labelIcon} />
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    <Mail className={styles.labelIcon} />
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    className={styles.formInput}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => router.push("/accountant-list")}
                    disabled={loading}
                  >
                    <X className={styles.buttonIcon} />
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveButton} disabled={loading}>
                    <Save className={styles.buttonIcon} />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Tab */}
            <div className={`${styles.tabPane} ${activeTab === "password" ? styles.active : ""}`}>
              <form onSubmit={handlePasswordSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.formLabel}>
                    <Lock className={styles.labelIcon} />
                    New Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={passwordVisible.new ? "text" : "password"}
                      className={styles.formInput}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => togglePasswordVisibility("new")}
                    >
                      {passwordVisible.new ? (
                        <EyeOff className={styles.passwordToggleIcon} />
                      ) : (
                        <Eye className={styles.passwordToggleIcon} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.formLabel}>
                    <Lock className={styles.labelIcon} />
                    Confirm Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={passwordVisible.confirm ? "text" : "password"}
                      className={styles.formInput}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {passwordVisible.confirm ? (
                        <EyeOff className={styles.passwordToggleIcon} />
                      ) : (
                        <Eye className={styles.passwordToggleIcon} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setPasswordData({ newPassword: "", confirmPassword: "" })}
                    disabled={loading}
                  >
                    <X className={styles.buttonIcon} />
                    Clear
                  </button>
                  <button type="submit" className={styles.saveButton} disabled={loading}>
                    <Shield className={styles.buttonIcon} />
                    {loading ? "Updating..." : "Update Password"}
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

export default AdminAccountantProfileLayer
