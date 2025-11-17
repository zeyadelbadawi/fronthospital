"use client"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import axiosInstance from "@/helper/axiosSetup"
import { User, Mail, Phone, MapPin, Calendar, Edit3, Lock, Eye, EyeOff, Save, X, Stethoscope, Calculator, Users, GraduationCap, BookOpen, FileText, Shield, Link } from 'lucide-react'
import styles from "../styles/profile-view.module.css"
import FullProgramTab from "./FullProgramTab"
import SchoolTab from "./SchoolTab"
import SingleProgramTab from "./SingleProgramTab"
import CaseStudyTab from "./CaseStudyTab"
import DoctorProfilePlans from "./doctor-profile-plans"

const GenericUserProfile = ({ role, id }) => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("edit-profile")
  const [formData, setFormData] = useState({})
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordVisible, setPasswordVisible] = useState({
    new: false,
    confirm: false,
  })

  // Student-specific states
  const [fullProgramData, setFullProgramData] = useState([])
  const [schoolData, setSchoolData] = useState([])
  const [fullProgramLoading, setFullProgramLoading] = useState(false)
  const [schoolLoading, setSchoolLoading] = useState(false)

  // Additional states for tab components compatibility
  const [schoolError, setSchoolError] = useState(null)
  const [fullProgramError, setFullProgramError] = useState(null)

  // Mock translations object for compatibility
  const translations = {
    profile: {
      loading: "Loading...",
      singleProgram: "Single Program",
      completed: "Completed",
      inProgress: "In Progress",
      upcoming: "Upcoming",
      missed: "Missed",
      active: "Active",
      unknown: "Unknown",
      noPrograms: "No Programs Found",
      failedToLoadSchoolData: "Failed to load school data. Please try again.",
      tryAgain: "Try Again",
      viewDetails: "View Details",
      at: "at",
      files: "files",
      departments: "departments",
      programName: "Program",
      accessFiles: "You can access your files",
      initialEvaluation: "Initial Evaluation",
      programActive: "Your program is active!",
      programEnded: "This program has ended",
      programEndedMessage: "Your program subscription ended",
      accessFilesStill: "You can still access your files",
      backToFiles: "Back to Files",
      viewDocument: "View Document",
      downloadDocument: "Download Document",
      schoolPlan: "School Plan",
      schoolProgram: "School Program",
      of: "of",
      sessionsCompleted: "sessions completed",
      appointments: "Appointments",
      schoolPlans: "School Plans",
      modified: "Modified",
      noPlansAvailable: "No Plans Available",
      yourPlanNotCreated: "Your plan didn't created yet",
      plansWillBeAvailableAfterCompletion: "Plans will be available after your program is completed",
      plansWillBeAvailableAfterAllAppointments: "Plans will be available after all appointments are completed",
      plansNotAvailableForCancelled: "Plans are not available for cancelled programs",
      noSchools: "No schools found",
      noSchoolProgramsYet: "You don't have any school programs yet.",
      invalidDate: "Invalid Date",
      noTime: "No time",
      invalidTime: "Invalid Time",
      failedToDownload: "Failed to download file. Please try again.",
      programScheduledUpcoming: "Program scheduled - First appointment is upcoming",
      programCancelledMissed: "Program cancelled - First appointment was missed",
      programCompletedAllFinished: "Program completed - All appointments finished",
      programActive: "Program active",
      programActiveNextUpcoming: "Program active - Next appointment is upcoming",
      programActiveNextReady: "Program active - Next appointment is ready",
      programActiveInProgress: "Program active - In progress",
      programStatusUnknown: "Program status unknown",
      noAppointmentsFound: "No appointments found",
      invalidAppointmentDateTime: "Invalid appointment date/time",
      upcomingEvaluation: "Upcoming Evaluation Session",
      arriveEarly:
        "Please arrive 15 minutes early for your appointment. This session will help us assess your needs and create a personalized program for you.",
      evaluationScheduled: "Your evaluation session is scheduled",
      missedEvaluation: "Missed Evaluation Session",
      missedEvaluationMessage: "You missed your evaluation session",
      rescheduleEvaluation:
        "Please contact us to reschedule your evaluation session. This is important to start your personalized program.",
    },
  }

  const isStudent = role === "student"
  const isDoctor = role === "doctor"
  const isAccountant = role === "accountant"

  // Configuration object for different roles
  const profileConfig = {
    student: {
      apiEndpoints: {
        fetch: `/authentication/patient/${id}`,
        update: `/authentication/edit-patient/${id}`,
        password: `/authentication/patient-password/${id}`,
      },
      fields: {
        primary: ["name", "email", "phone"],
        secondary: ["address", "dateOfBirth", "gender"],
      },
      tabs: ["edit-profile", "change-password", "full-program", "school", "single-program", "case-study"],
      icon: User,
      badge: "Student",
      title: "Student Profile Management",
      subtitle: "Manage student information, view programs, and track progress",
      listRedirect: "/student/list",
    },
    doctor: {
      apiEndpoints: {
        fetch: `/authentication/doctor/${id}`,
        update: `/authentication/edit-doctor/${id}`,
        password: `/authentication/doctor-password/${id}`,
      },
      fields: {
        primary: ["username", "email", "phone"],
        secondary: ["title", "availability"],
      },
      tabs: ["edit-profile", "change-password", "my-plans"],
      icon: Stethoscope,
      badge: "Doctor",
      title: "Doctor Profile Management",
      subtitle: "Manage doctor information and professional details",
      listRedirect: "/doctor/list",
    },
    accountant: {
      apiEndpoints: {
        fetch: `/authentication/accountant/${id}`,
        update: `/authentication/edit-accountant/${id}`,
        password: `/authentication/accountant-password/${id}`,
      },
      fields: {
        primary: ["name", "email"],
        secondary: [],
      },
      tabs: ["edit-profile", "change-password"],
      icon: Calculator,
      badge: "Accountant",
      title: "Accountant Profile Management",
      subtitle: "Update accountant information and security settings",
      listRedirect: "/accountant/list",
    },
  }

  const currentConfig = profileConfig[role]

  useEffect(() => {
    if (id && role) {
      const fetchUser = async () => {
        try {
          const apiEndpoint = profileConfig[role]?.apiEndpoints?.fetch
          if (!apiEndpoint) {
            console.error(`No fetch endpoint configured for role: ${role}`)
            setLoading(false)
            return
          }

          const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}${apiEndpoint}`)
          const userData = response.data
          setUser(userData)

          // Initialize form data based on role
          const currentConfig = profileConfig[role]
          const initialFormData = {}
          currentConfig.fields.primary.forEach((field) => {
            initialFormData[field] = userData[field] || ""
          })
          currentConfig.fields.secondary.forEach((field) => {
            initialFormData[field] = userData[field] || ""
          })
          if (role === "student" && userData.driveLink) {
            initialFormData.driveLink = userData.driveLink
          }

          setFormData(initialFormData)
          setLoading(false)
        } catch (error) {
          console.error(`Error fetching ${role} data:`, error)
          setLoading(false)
        }
      }
      fetchUser()
    }
  }, [id, role]) // Remove currentConfig from dependencies and use id, role instead

  // Fetch student-specific data
  const fetchFullProgramData = async () => {
    if (!id || !isStudent) return
    setFullProgramLoading(true)
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-full-programs/${id}`)
      setFullProgramData(response.data)
      setFullProgramError(null)
    } catch (error) {
      console.error("Error fetching full program data:", error)
      setFullProgramError("Failed to load full program data. Please try again.")
      setFullProgramData([])
    } finally {
      setFullProgramLoading(false)
    }
  }

  const fetchSchoolData = async () => {
    if (!id || !isStudent) return
    setSchoolLoading(true)
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/schoolhandling/school-programs/by-patient/${id}`)
      setSchoolData(response.data.appointments || response.data)
      setSchoolError(null)
    } catch (error) {
      console.error("Error fetching school data:", error)
      setSchoolError(
        error.response?.data?.message ||
        error.message ||
        "Failed to load school data. Please try again."
      )
      setSchoolData([])
    } finally {
      setSchoolLoading(false)
    }
  }


  // Load data when switching to specific tabs
  useEffect(() => {
    if (activeTab === "full-program" && fullProgramData.length === 0 && id && isStudent) {
      fetchFullProgramData()
    }
    if (activeTab === "school" && schoolData.length === 0 && id && isStudent) {
      fetchSchoolData()
    }
  }, [activeTab, id, isStudent]) // Remove the fullProgramData.length and schoolData.length dependencies

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
      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_URL}${currentConfig.apiEndpoints.update}`,
        formData,
      )
      if (response.status === 200) {
        alert(`${role.charAt(0).toUpperCase() + role.slice(1)} updated successfully`)
        router.push(currentConfig.listRedirect)
      }
    } catch (error) {
      console.error(`Error updating ${role}:`, error)
      alert(`Error updating ${role}`)
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
      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_URL}${currentConfig.apiEndpoints.password}`,
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

  const getInitials = (name) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getDisplayName = () => {
    if (isDoctor && formData.username) {
      return `Dr. ${formData.username}`
    }
    return formData.name || formData.username || "Unknown"
  }

  const getTabConfig = () => {
    const baseTabConfig = {
      "edit-profile": { icon: Edit3, label: "Edit Profile" },
      "change-password": { icon: Lock, label: "Change Password" },
    }

    if (isStudent) {
      return {
        ...baseTabConfig,
        "full-program": { icon: Users, label: "Full Program" },
        school: { icon: GraduationCap, label: "School" },
        "single-program": { icon: BookOpen, label: "Single Program" },
        "case-study": { icon: FileText, label: "Case Study" },
      }
    }

    if (isDoctor) {
      return {
        ...baseTabConfig,
        "my-plans": { icon: FileText, label: "My Plans" },
      }
    }

    return baseTabConfig
  }

  if (loading && !user) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading {role} profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !currentConfig) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>{role} profile not found</p>
        </div>
      </div>
    )
  }

  const IconComponent = currentConfig.icon
  const tabConfig = getTabConfig()

  return (
    <div className={styles.container}>
      <div className={styles.profileWrapper}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}></div>
          <div className={styles.profileContent}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>{getInitials(getDisplayName())}</div>
              <h2 className={styles.profileName}>{getDisplayName()}</h2>
              <p className={styles.profileEmail}>{formData.email}</p>
              <div className={styles.profileBadge}>
                <IconComponent className={styles.profileBadgeIcon} />
                {currentConfig.badge}
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.infoTitle}>
                <IconComponent className={styles.infoTitleIcon} />
                {isStudent ? "Personal Information" : isDoctor ? "Doctor Information" : "Professional Information"}
              </h3>
              <ul className={styles.infoList}>
                {currentConfig.fields.primary.map((field) => (
                  <li key={field} className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      {field === "name" || field === "username" ? (
                        <User className={styles.infoLabelIcon} />
                      ) : field === "email" ? (
                        <Mail className={styles.infoLabelIcon} />
                      ) : field === "phone" ? (
                        <Phone className={styles.infoLabelIcon} />
                      ) : (
                        <User className={styles.infoLabelIcon} />
                      )}
                      {field === "username" ? "Username" : field.charAt(0).toUpperCase() + field.slice(1)}
                    </span>
                    <span className={styles.infoValue}>{formData[field] || "N/A"}</span>
                  </li>
                ))}
                {isStudent && (
                  <>
                    <li className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <Link className={styles.infoLabelIcon} />
                        Google Drive
                      </span>
                      <span className={styles.infoValue}>
                        {formData.driveLink ? (
                          <button
                            onClick={() => window.open(formData.driveLink, '_blank', 'noopener,noreferrer')}
                            className={styles.driveButton}
                            type="button"
                          >
                            <Link className={styles.driveLinkIcon} />
                            {formData?.openDriveFolder || "Open Drive Folder"}
                          </button>
                        ) : (
                          <span className={styles.noMediaPlaceholder}>
                            {formData?.noMediaYet || "No media available yet"}
                          </span>
                        )}
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>{currentConfig.title}</h1>
            <p className={styles.contentSubtitle}>{currentConfig.subtitle}</p>
          </div>

          <div className={styles.tabsContainer}>
            <ul className={styles.tabsList}>
              {currentConfig.tabs.map((tab) => {
                const TabIcon = tabConfig[tab]?.icon || User
                return (
                  <li key={tab} className={styles.tabItem}>
                    <button
                      className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      <TabIcon className={styles.tabIcon} />
                      {tabConfig[tab]?.label || tab}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className={styles.tabContent}>
            {/* Edit Profile Tab */}
            <div className={`${styles.tabPane} ${activeTab === "edit-profile" ? styles.active : ""}`}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  {currentConfig.fields.primary.map((field) => (
                    <div key={field} className={styles.formGroup}>
                      <label htmlFor={field} className={styles.formLabel}>
                        {field === "name" || field === "username" ? (
                          <User className={styles.labelIcon} />
                        ) : field === "email" ? (
                          <Mail className={styles.labelIcon} />
                        ) : field === "phone" ? (
                          <Phone className={styles.labelIcon} />
                        ) : (
                          <User className={styles.labelIcon} />
                        )}
                        {field === "username" ? "Username" : field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                        <span className={styles.required}>*</span>
                      </label>
                      <input
                        type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                        className={styles.formInput}
                        id={field}
                        name={field}
                        value={formData[field] || ""}
                        onChange={handleInputChange}
                        placeholder={`Enter ${field === "username" ? "username" : field}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Student-specific fields */}
                {isStudent && (
                  <>
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
                          name="dateOfBirth"
                          value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split("T")[0] : ""}
                          onChange={handleInputChange}
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
                          name="address"
                          value={formData.address || ""}
                          onChange={handleInputChange}
                          placeholder="Enter address"
                          style={{ minHeight: "120px" }}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => router.push(currentConfig.listRedirect)}
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

            {/* Change Password Tab */}
            <div className={`${styles.tabPane} ${activeTab === "change-password" ? styles.active : ""}`}>
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

            {/* Student-specific tabs */}
            {isStudent && (
              <>
                <div className={`${styles.tabPane} ${activeTab === "full-program" ? styles.active : ""}`}>
                  <FullProgramTab
                    patientId={id}
                    fullProgramData={fullProgramData}
                    setFullProgramData={setFullProgramData}
                    loading={fullProgramLoading}
                    setLoading={setFullProgramLoading}
                    error={fullProgramError}
                    setError={setFullProgramError}
                    language="en"
                    translations={translations}
                  />
                </div>

                <div className={`${styles.tabPane} ${activeTab === "school" ? styles.active : ""}`}>
                  <SchoolTab
                    patientId={id}
                    schoolData={schoolData}
                    setSchoolData={setSchoolData}
                    loading={schoolLoading}
                    setLoading={setSchoolLoading}
                    error={schoolError}
                    setError={setSchoolError}
                    language="en"
                    translations={translations}
                  />
                </div>

                <div className={`${styles.tabPane} ${activeTab === "single-program" ? styles.active : ""}`}>
                  <SingleProgramTab patientId={id} language="en" translations={translations} />
                </div>

                <div className={`${styles.tabPane} ${activeTab === "case-study" ? styles.active : ""}`}>
                  <CaseStudyTab patientId={id} isAdminView={true} />
                </div>
              </>
            )}

            {/* Doctor-specific tabs */}
            {isDoctor && (
              <div className={`${styles.tabPane} ${activeTab === "my-plans" ? styles.active : ""}`}>
                <DoctorProfilePlans />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenericUserProfile
