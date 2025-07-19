"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import jwt_decode from "jwt-decode"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Lock,
  Activity,
  Eye,
  EyeOff,
  Save,
  X,
  GraduationCap,
} from "lucide-react"
import styles from "../styles/profile-view.module.css"
import FullProgramTab from "./FullProgramTab"
import SchoolTab from "./SchoolTab"
import SingleProgramTab from "./SingleProgramTab"
import CaseStudyTab from "./CaseStudyTab"

const PublicProfilepatient = ({ patientID }) => {
  const router = useRouter()
  const [patient, setPatient] = useState(null)
  const [patientId, setPatientId] = useState(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [disabilityType, setDisabilityType] = useState("")
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

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem("token")
        const decodedToken = jwt_decode(token)
        const userId = decodedToken?.id
        const patientResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${userId}`)
        setPatient(patientResponse.data)
      } catch (error) {
        console.error("Error fetching patient or session data", error)
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
      const decodedToken = jwt_decode(token)
      const userRole = decodedToken?.role
      const userId = decodedToken?.id

      if (!userRole || !userId || userRole !== "patient") {
        toast.error("You must be a patient to access this page")
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
          setDisabilityType(data.disabilityType || "")
          setAddress(data.address)
          setDateOfBirth(data.dateOfBirth || "")
          setLoading(false)
        } catch (error) {
          console.error("Error fetching patient data:", error)
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
      console.error("Error updating patient:", error)
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
        <div className={styles.loadingText}>Loading your profile...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Profile not found</div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer className={styles.toastContainer} />
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
              <h1 className={styles.contentTitle}>Student Profile</h1>
              <p className={styles.contentSubtitle}>Manage your profile, view evaluations, and track sessions</p>
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
                    <Activity className={styles.tabIcon} />
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
                    className={`${styles.tabButton} ${activeTab === "single" ? styles.active : ""}`}
                    onClick={() => setActiveTab("single")}
                  >
                    <GraduationCap className={styles.tabIcon} />
                    Single
                  </button>
                </li>

          <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === "case" ? styles.active : ""}`}
                    onClick={() => setActiveTab("case")}
                  >
                    <GraduationCap className={styles.tabIcon} />
                    case stydy
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
                  </div>
                  <div className={styles.formGroup + " " + styles.fullWidth}>
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
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelButton} onClick={() => router.push("/dashboard")}>
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
                  setFullProgramData={setFullProgramData}
                  loading={fullProgramLoading}
                  setLoading={setFullProgramLoading}
                  error={fullProgramError}
                  setError={setFullProgramError}
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
                />
              </div>

              <div className={`${styles.tabPane} ${activeTab === "single" ? styles.active : ""}`}>
                <SingleProgramTab
                  patientId={patientId}

                />
              </div>

              <div className={`${styles.tabPane} ${activeTab === "case" ? styles.active : ""}`}>
                <CaseStudyTab
                  patientId={patientId}

                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PublicProfilepatient
