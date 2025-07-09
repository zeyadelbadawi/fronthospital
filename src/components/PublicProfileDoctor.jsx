"use client"
import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  FileText,
  Building2,
  Clock,
} from "lucide-react"

import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/profile-view.module.css"
import DoctorProfilePlans from "./doctor-profile-plans"
import { getCurrentUser } from "@/app/full-program/utils/auth-utils"
const PublicProfileDoctor = () => {
  const user = getCurrentUser()
  const [activeTab, setActiveTab] = useState("profile")
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    specialization: "",
    experience: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/authentication/doctor/${user?.id}`)
      const profileData = response.data
      setProfile(profileData)
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split("T")[0] : "",
        specialization: profileData.specialization || "",
        experience: profileData.experience || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      await axiosInstance.put(`/authentication/doctor/${user?.id}`, formData)
      await fetchProfile()
      setEditing(false)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long!")
      return
    }

    try {
      setSaving(true)
      await axiosInstance.put(`/authentication/change-password/${user?.id}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      alert("Password changed successfully!")
    } catch (error) {
      console.error("Error changing password:", error)
      alert("Failed to change password. Please check your current password.")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInitials = (name) => {
    // Add safety check for undefined/null name
    if (!name || typeof name !== "string") {
      return "DR" // Default initials
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Profile not found</p>
        </div>
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
              <div className={styles.avatar}>{getInitials(profile?.name || "Doctor")}</div>
              <h2 className={styles.profileName}>{profile?.name || "Loading..."}</h2>
              <p className={styles.profileEmail}>{profile?.email || "Loading..."}</p>
              <div className={styles.profileBadge}>
                <Shield className={styles.profileBadgeIcon} />
                Doctor
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.infoTitle}>
                <User className={styles.infoTitleIcon} />
                Quick Info
              </h3>
              <ul className={styles.infoList}>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Phone className={styles.infoLabelIcon} />
                    Phone
                  </span>
                  <span className={`${styles.infoValue} ${!profile.phone ? styles.notProvided : ""}`}>
                    {profile.phone || "Not provided"}
                  </span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <MapPin className={styles.infoLabelIcon} />
                    Address
                  </span>
                  <span className={`${styles.infoValue} ${!profile.address ? styles.notProvided : ""}`}>
                    {profile.address || "Not provided"}
                  </span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Building2 className={styles.infoLabelIcon} />
                    Departments
                  </span>
                  <span className={styles.infoValue}>
                    {profile.departments?.map((dept) => dept.name).join(", ") || "Not assigned"}
                  </span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Calendar className={styles.infoLabelIcon} />
                    Experience
                  </span>
                  <span className={`${styles.infoValue} ${!profile.experience ? styles.notProvided : ""}`}>
                    {profile.experience || "Not provided"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Doctor Profile</h1>
            <p className={styles.contentSubtitle}>Manage your profile information and settings</p>
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <ul className={styles.tabsList}>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "profile" ? styles.active : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <Edit3 className={styles.tabIcon} />
                  Edit Profile
                </button>
              </li>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "password" ? styles.active : ""}`}
                  onClick={() => setActiveTab("password")}
                >
                  <Lock className={styles.tabIcon} />
                  Change Password
                </button>
              </li>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "plans" ? styles.active : ""}`}
                  onClick={() => setActiveTab("plans")}
                >
                  <FileText className={styles.tabIcon} />
                  My Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {/* Profile Tab */}
            <div className={`${styles.tabPane} ${activeTab === "profile" ? styles.active : ""}`}>
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <User className={styles.labelIcon} />
                      Full Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={!editing}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Mail className={styles.labelIcon} />
                      Email Address <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!editing}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Phone className={styles.labelIcon} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className={styles.formInput}
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Calendar className={styles.labelIcon} />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Shield className={styles.labelIcon} />
                      Specialization
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.specialization}
                      onChange={(e) => handleInputChange("specialization", e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Clock className={styles.labelIcon} />
                      Experience
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      disabled={!editing}
                      placeholder="e.g., 5 years"
                    />
                  </div>
                </div>

                <div className={styles.formGroup + " " + styles.fullWidth}>
                  <label className={styles.formLabel}>
                    <MapPin className={styles.labelIcon} />
                    Address
                  </label>
                  <textarea
                    className={styles.formTextarea}
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!editing}
                    rows={3}
                  />
                </div>

                <div className={styles.formActions}>
                  {editing ? (
                    <>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => {
                          setEditing(false)
                          fetchProfile()
                        }}
                        disabled={saving}
                      >
                        <X className={styles.buttonIcon} />
                        Cancel
                      </button>
                      <button type="button" className={styles.saveButton} onClick={handleSaveProfile} disabled={saving}>
                        <Save className={styles.buttonIcon} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </>
                  ) : (
                    <button type="button" className={styles.saveButton} onClick={() => setEditing(true)}>
                      <Edit3 className={styles.buttonIcon} />
                      Edit Profile
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Password Tab */}
            <div className={`${styles.tabPane} ${activeTab === "password" ? styles.active : ""}`}>
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Lock className={styles.labelIcon} />
                    Current Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className={styles.formInput}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className={styles.passwordToggleIcon} />
                      ) : (
                        <Eye className={styles.passwordToggleIcon} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Lock className={styles.labelIcon} />
                    New Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className={styles.formInput}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className={styles.passwordToggleIcon} />
                      ) : (
                        <Eye className={styles.passwordToggleIcon} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Lock className={styles.labelIcon} />
                    Confirm New Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={styles.formInput}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
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
                    className={styles.saveButton}
                    onClick={handleChangePassword}
                    disabled={
                      saving ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    }
                  >
                    <Lock className={styles.buttonIcon} />
                    {saving ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* Plans Tab */}
            <div className={`${styles.tabPane} ${activeTab === "plans" ? styles.active : ""}`}>
              <DoctorProfilePlans />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicProfileDoctor
