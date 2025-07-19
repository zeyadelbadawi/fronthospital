"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  Activity,
  BookOpen,
  GraduationCap,
  FileText,
  Users,
} from "lucide-react"
import styles from "../styles/profile-view.module.css"
import FullProgramTab from "./FullProgramTab"
import SchoolTab from "./SchoolTab"
import SingleProgramTab from "./SingleProgramTab"
import CaseStudyTab from "./CaseStudyTab"

const AdminPatientProfileLayer = () => {
  const router = useRouter()
  const [patient, setPatient] = useState(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [disabilityType, setDisabilityType] = useState("")
  const [address, setAddress] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [patientId, setPatientId] = useState(null)
  const [activeTab, setActiveTab] = useState("edit-profile")
  const [loading, setLoading] = useState(true)

  // States for program data
  const [fullProgramData, setFullProgramData] = useState([])
  const [schoolData, setSchoolData] = useState([])
  const [fullProgramLoading, setFullProgramLoading] = useState(false)
  const [schoolLoading, setSchoolLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      setPatientId(params.get("id"))
    }
  }, [])

  useEffect(() => {
    if (patientId) {
      const fetchPatient = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${patientId}`)
          setPatient(response.data)
          setName(response.data.name)
          setEmail(response.data.email)
          setPhone(response.data.phone)
          setDisabilityType(response.data.disabilityType || "")
          setAddress(response.data.address)
          setDateOfBirth(response.data.dateOfBirth || "")
          setLoading(false)
        } catch (error) {
          console.error("Error fetching Student data:", error)
          setLoading(false)
        }
      }
      fetchPatient()
    }
  }, [patientId])

  // Fetch Full Program Data
  const fetchFullProgramData = async () => {
    if (!patientId) return

    setFullProgramLoading(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/full/patient/${patientId}`)
      setFullProgramData(response.data)
    } catch (error) {
      console.error("Error fetching full program data:", error)
      setFullProgramData([])
    } finally {
      setFullProgramLoading(false)
    }
  }

  // Fetch School Data
  const fetchSchoolData = async () => {
    if (!patientId) return

    setSchoolLoading(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/school/patient/${patientId}`)
      setSchoolData(response.data)
    } catch (error) {
      console.error("Error fetching school data:", error)
      setSchoolData([])
    } finally {
      setSchoolLoading(false)
    }
  }

  // Load data when switching to specific tabs
  useEffect(() => {
    if (activeTab === "full-program" && fullProgramData.length === 0) {
      fetchFullProgramData()
    }
    if (activeTab === "school" && schoolData.length === 0) {
      fetchSchoolData()
    }
  }, [activeTab, patientId])

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const updatedPatient = { name, email, phone, disabilityType, address, dateOfBirth }
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-patient/${patientId}`,
        updatedPatient,
      )
      if (response.status === 200) {
        alert("Student updated successfully")
        router.push("/users-list")
      }
    } catch (error) {
      console.error("Error updating Student:", error)
      alert("Error updating Student")
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
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-password/${patientId}`,
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading student profile...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Student profile not found</div>
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
              <div className={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
              <h2 className={styles.profileName}>{name}</h2>
              <p className={styles.profileEmail}>{email}</p>
              <div className={styles.profileBadge}>
                <User className={styles.profileBadgeIcon} />
                Student
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.infoTitle}>
                <User className={styles.infoTitleIcon} />
                Personal Information
              </h3>
              <ul className={styles.infoList}>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <User className={styles.infoLabelIcon} />
                    Full Name
                  </span>
                  <span className={styles.infoValue}>{name}</span>
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
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Activity className={styles.infoLabelIcon} />
                    Disability Type
                  </span>
                  <span className={`${styles.infoValue} ${!disabilityType ? styles.notProvided : ""}`}>
                    {disabilityType || "Not provided"}
                  </span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Calendar className={styles.infoLabelIcon} />
                    Date of Birth
                  </span>
                  <span className={`${styles.infoValue} ${!dateOfBirth ? styles.notProvided : ""}`}>
                    {dateOfBirth || "Not provided"}
                  </span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <MapPin className={styles.infoLabelIcon} />
                    Address
                  </span>
                  <span className={`${styles.infoValue} ${!address ? styles.notProvided : ""}`}>
                    {address || "Not provided"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Student Profile Management</h1>
            <p className={styles.contentSubtitle}>Manage student information, view programs, and track progress</p>
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
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "full-program" ? styles.active : ""}`}
                  onClick={() => setActiveTab("full-program")}
                >
                  <Users className={styles.tabIcon} />
                  Full Program
                </button>
              </li>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "school" ? styles.active : ""}`}
                  onClick={() => setActiveTab("school")}
                >
                  <GraduationCap className={styles.tabIcon} />
                  School
                </button>
              </li>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "single-program" ? styles.active : ""}`}
                  onClick={() => setActiveTab("single-program")}
                >
                  <BookOpen className={styles.tabIcon} />
                  Single Program
                </button>
              </li>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "case-study" ? styles.active : ""}`}
                  onClick={() => setActiveTab("case-study")}
                >
                  <FileText className={styles.tabIcon} />
                  Case Study
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
                      Full Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Full Name"
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
                <div className={styles.formRow}>
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
                  <div className={styles.formGroup}>
                    <label htmlFor="disabilityType" className={styles.formLabel}>
                      <Activity className={styles.labelIcon} />
                      Disability Type
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      id="disabilityType"
                      value={disabilityType}
                      onChange={(e) => setDisabilityType(e.target.value)}
                      placeholder="Enter disability type"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="dateOfBirth" className={styles.formLabel}>
                      <Calendar className={styles.labelIcon} />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className={styles.formInput}
                      id="dateOfBirth"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="address" className={styles.formLabel}>
                      <MapPin className={styles.labelIcon} />
                      Address
                    </label>
                    <textarea
                      className={styles.formTextarea}
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter address"
                      style={{ minHeight: "120px" }}
                    />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => router.push("/users-list")}>
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

            {/* Full Program Tab */}
            <div className={`${styles.tabPane} ${activeTab === "full-program" ? styles.active : ""}`}>
              <FullProgramTab
                patientId={patientId}
                fullProgramData={fullProgramData}
                loading={fullProgramLoading}
                isAdminView={true}
              />
            </div>

            {/* School Tab */}
            <div className={`${styles.tabPane} ${activeTab === "school" ? styles.active : ""}`}>
              <SchoolTab patientId={patientId} schoolData={schoolData} loading={schoolLoading} isAdminView={true} />
            </div>

            {/* Single Program Tab */}
            <div className={`${styles.tabPane} ${activeTab === "single-program" ? styles.active : ""}`}>
              <SingleProgramTab patientId={patientId} isAdminView={true} />
            </div>

            {/* Case Study Tab */}
            <div className={`${styles.tabPane} ${activeTab === "case-study" ? styles.active : ""}`}>
              <CaseStudyTab patientId={patientId} isAdminView={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPatientProfileLayer
