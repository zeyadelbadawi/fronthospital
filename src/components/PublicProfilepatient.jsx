"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { toast, ToastContainer } from "react-toastify"
import { User, Mail, Phone, MapPin, Calendar, Edit3, Lock, Activity, Eye, EyeOff, Save, X, GraduationCap, Link } from 'lucide-react'
import styles from "../styles/profile-view.module.css"
import FullProgramTab from "./FullProgramTab"
import SchoolTab from "./SchoolTab"
import SingleProgramTab from "./SingleProgramTab"
import CaseStudyTab from "./CaseStudyTab"
import { useLanguage } from "../contexts/LanguageContext"

const PublicProfilepatient = ({ patientID }) => {
  const router = useRouter()
  const [patient, setPatient] = useState(null)
  const [patientId, setPatientId] = useState(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("edit-profile")
  const [loading, setLoading] = useState(true)
  const [fullProgramData, setFullProgramData] = useState([])
  const [fullProgramLoading, setFullProgramLoading] = useState(false)
  const [fullProgramError, setFullProgramError] = useState(null)
  const [schoolData, setSchoolData] = useState([])
  const [schoolLoading, setSchoolLoading] = useState(false)
  const [schoolError, setSchoolError] = useState(null)

  const { language, translations } = useLanguage()
  const t = translations?.[language] || translations?.en || {}

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem("token")
        const decodedToken = jwtDecode(token)

        const userId = decodedToken?.id
        const patientResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${userId}`)
        setPatient(patientResponse.data)
      } catch (error) {
        console.error("Error fetching Student or session data", error)
      }
    }
    fetchPatientData()
  }, [])
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("You must log in to access this page")
      router.push("/sign-in")
      return
    }

    try {
      const decodedToken = jwtDecode(token) // Use jwtDecode here
      const userRole = decodedToken?.role
      const userId = decodedToken?.id

      if (!userRole || !userId || userRole !== "patient") {
        toast.error("You must be a Student to access this page")
        router.push("/sign-in")
        return
      }

      setPatientId(userId)

      const fetchPatient = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = response.data
          setPatient(data)
          setName(data.name)
          setEmail(data.email)
          setPhone(data.phone)
          setAddress(data.address)
          setDateOfBirth(data.dateOfBirth || "")
          setLoading(false)
        } catch (error) {
          console.error("Error fetching Student data:", error)
          setLoading(false)
        }
      }
      fetchPatient()
    } catch (error) {
      console.error("Invalid token:", error)
      toast.error("Invalid or expired token")
      router.push("/sign-in")
    }
  }, [router])

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const updatedPatient = { name, email, phone, address, dateOfBirth }
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-patient/${patientId}`,
        updatedPatient,
      )
      if (response.status === 200) {
        toast.success("Profile updated successfully")
      }
    } catch (error) {
      console.error("Error updating Student:", error)
      toast.error("Error updating profile")
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match!")
      return
    }
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-password/${patientId}`,
        { password: newPassword },
      )
      if (response.status === 200) {
        toast.success("Password updated successfully")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error("Error updating password")
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>{t?.profile?.loading || "Loading profile..."}</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>{t?.profile?.noData || "Profile not found"}</div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer className={styles.toastContainer} />
      <div className={` ${language === "ar" ? "rtl" : "ltr"}`}>
        <div className={styles.profileWrapper}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}></div>
            <div className={styles.profileContent}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
                <h2 className={styles.profileName}>{name}</h2>
                <p className={styles.profileEmail}>{email}</p>
                <div className={styles.profileBadge}>
                  <User className={styles.profileBadgeIcon} />
                  {t?.profile?.student || "Student"}
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3 className={styles.infoTitle}>
                  <User className={styles.infoTitleIcon} />
                  {t?.profile?.personalInfo || "Personal Information"}
                </h3>
                <ul className={styles.infoList}>
                  <li className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <User className={styles.infoLabelIcon} />
                      {t?.profile?.fullName || "Full Name"}{" "}
                    </span>
                    <span className={styles.infoValue}>{name}</span>
                  </li>
                  <li className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <Mail className={styles.infoLabelIcon} />
                      {t?.profile?.emailAddress || "Email"}
                    </span>
                    <span className={styles.infoValue}>{email}</span>
                  </li>
                  <li className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <Phone className={styles.infoLabelIcon} />
                      {t?.profile?.phoneNumber || "Phone Number"}
                    </span>
                    <span className={styles.infoValue}>{phone}</span>
                  </li>

                  <li className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <Calendar className={styles.infoLabelIcon} />
                      {t?.profile?.dateOfBirth || "Date of Birth"}
                    </span>
                    <span className={`${styles.infoValue} ${!dateOfBirth ? styles.notProvided : ""}`}>
                      {dateOfBirth || t?.profile?.notProvided || "Not provided"}
                    </span>
                  </li>
                  <li className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <MapPin className={styles.infoLabelIcon} />
                      {t?.profile?.address || "Address"}
                    </span>
                    <span className={`${styles.infoValue} ${!address ? styles.notProvided : ""}`}>
                      {address || t?.profile?.notProvided || "Not provided"}
                    </span>
                  </li>
                  {/* NEW: Google Drive Link */}
                  {patient.driveLink && (
                    <li className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <Link className={styles.infoLabelIcon} />
                        Google Drive
                      </span>
                      <span className={styles.infoValue}>
                        <a
                          href={patient.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.driveLink} // Apply a specific style for the link
                        >
                          {patient.driveLink}
                        </a>
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            <div className={styles.contentHeader}>
              <h1 className={styles.contentTitle}>{t?.profile?.title || "Student Profile"}</h1>
              <p className={styles.contentSubtitle}>
                {t?.profile?.manageProfile || "Manage your profile, view evaluations, and track sessions"}
              </p>
            </div>

            <div className={styles.tabsContainer}>
              <ul className={styles.tabsList}>
                <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === "edit-profile" ? styles.active : ""}`}
                    onClick={() => setActiveTab("edit-profile")}
                  >
                    <Edit3 className={styles.tabIcon} />
                    {t?.profile?.editProfile || "Edit Profile"}
                  </button>
                </li>
                <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === "change-password" ? styles.active : ""}`}
                    onClick={() => setActiveTab("change-password")}
                  >
                    <Lock className={styles.tabIcon} />
                    {t?.profile?.changePassword || "Change Password"}
                  </button>
                </li>

                <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === "full-program" ? styles.active : ""}`}
                    onClick={() => setActiveTab("full-program")}
                  >
                    <Activity className={styles.tabIcon} />
                    {t?.profile?.fullProgram || "Full Program"}
                  </button>
                </li>

                <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === "school" ? styles.active : ""}`}
                    onClick={() => setActiveTab("school")}
                  >
                    <GraduationCap className={styles.tabIcon} />
                    {t?.profile?.school || "School"}
                  </button>
                </li>

                <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === "single" ? styles.active : ""}`}
                    onClick={() => setActiveTab("single")}
                  >
                    <GraduationCap className={styles.tabIcon} />
                    {t?.profile?.single || "Single"}
                  </button>
                </li>

                <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === "case" ? styles.active : ""}`}
                    onClick={() => setActiveTab("case")}
                  >
                    <GraduationCap className={styles.tabIcon} />
                    {t?.profile?.caseStudy || "Case Study"}
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
                      <label htmlFor="name" className={styles.formLabel}>
                        <User className={styles.labelIcon} />
                        {t?.profile?.fullName || "Full Name"}{" "}
                        <span className={styles.required}>{t?.profile?.required || "*"}</span>
                      </label>
                      <input
                        type="text"
                        className={styles.formInput}
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t?.profile?.enterFullName || "Enter Full Name"}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>
                        <Mail className={styles.labelIcon} />
                        {t?.profile?.emailAddress || "Email"}{" "}
                        <span className={styles.required}>{t?.profile?.required || "*"}</span>
                      </label>
                      <input
                        type="email"
                        className={styles.formInput}
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t?.profile?.enterEmail || "Enter email address"}
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="phone" className={styles.formLabel}>
                        <Phone className={styles.labelIcon} />
                        {t?.profile?.phoneNumber || "Phone Number"}{" "}
                        <span className={styles.required}>{t?.profile?.required || "*"}</span>
                      </label>
                      <input
                        type="tel"
                        className={styles.formInput}
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t?.profile?.enterPhone || "Enter phone number"}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="dateOfBirth" className={styles.formLabel}>
                        <Calendar className={styles.labelIcon} />
                        {t?.profile?.dateOfBirth || "Date of Birth"}
                      </label>
                      <input
                        type="date"
                        className={styles.formInput}
                        id="dateOfBirth"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup + " " + styles.fullWidth}>
                    <label htmlFor="address" className={styles.formLabel}>
                      <MapPin className={styles.labelIcon} />
                      {t?.profile?.address || "Address"}
                    </label>
                    <textarea
                      className={styles.formTextarea}
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t?.profile?.enterAddress || "Enter address"}
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelButton} onClick={() => router.push("/dashboard")}>
                      <X className={styles.buttonIcon} />
                      {t?.profile?.cancel || "Cancel"}
                    </button>
                    <button type="submit" className={styles.saveButton}>
                      <Save className={styles.buttonIcon} />
                      {t?.profile?.saveChanges || "Save Changes"}
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
                      {t?.profile?.newPassword || "New Password"}{" "}
                      <span className={styles.required}>{t?.profile?.required || "*"}</span>
                    </label>
                    <div className={styles.passwordContainer}>
                      <input
                        type={passwordVisible ? "text" : "password"}
                        className={styles.formInput}
                        id="your-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t?.profile?.enterNewPassword || "Enter New Password"}
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
                      {t?.profile?.confirmPassword || "Confirm Password"}{" "}
                      <span className={styles.required}>{t?.profile?.required || "*"}</span>
                    </label>
                    <div className={styles.passwordContainer}>
                      <input
                        type={confirmPasswordVisible ? "text" : "password"}
                        className={styles.formInput}
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t?.profile?.confirmPasswordPlaceholder || "Confirm Password"}
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
                      {t?.profile?.cancel || "Cancel"}
                    </button>
                    <button type="submit" className={styles.saveButton}>
                      <Save className={styles.buttonIcon} />
                      {t?.profile?.savePassword || "Save Password"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Full Program Tab */}
              <div className={`${styles.tabPane} ${activeTab === "full-program" ? styles.active : ""}`}>
                <FullProgramTab
                  patientId={patientId}
                  fullProgramData={fullProgramData}
                  setFullProgramData={setFullProgramData}
                  loading={fullProgramLoading}
                  setLoading={setFullProgramLoading}
                  error={fullProgramError}
                  setError={setFullProgramError}
                  language={language}
                  translations={t}
                />
              </div>

              {/* School Tab */}
              <div className={`${styles.tabPane} ${activeTab === "school" ? styles.active : ""}`}>
                <SchoolTab
                  patientId={patientId}
                  schoolData={schoolData}
                  setSchoolData={setSchoolData}
                  loading={schoolLoading}
                  setLoading={setSchoolLoading}
                  error={schoolError}
                  setError={setSchoolError}
                  language={language}
                  translations={t}
                />
              </div>

              <div className={`${styles.tabPane} ${activeTab === "single" ? styles.active : ""}`}>
                <SingleProgramTab patientId={patientId} language={language} translations={t} />
              </div>

              <div className={`${styles.tabPane} ${activeTab === "case" ? styles.active : ""}`}>
                <CaseStudyTab patientId={patientId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PublicProfilepatient
