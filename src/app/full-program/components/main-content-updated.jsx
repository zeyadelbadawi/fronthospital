"use client"
import { useState, useEffect } from "react"
import axiosInstance from "@/helper/axiosSetup"
import { getCurrentUser } from "../utils/auth-utils"
import {
  User,
  Shield,
  Heart,
  Users,
  Brain,
  MessageSquare,
  Activity,
  Palette,
  BookOpen,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import AccessControl from "./access-control"
import AssignPatientsABADoctor from "./assign-patients-aba-doctor"
import AssignPatientsOccupationalTherapyDoctor from "./assign-patients-occupational-therapy-doctor"
import AssignPatientsPhysicalTherapyDoctor from "./assign-patients-physical-therapy-doctor"
import AssignPatientsSpecialEducationDoctor from "./assign-patients-special-education-doctor"
import AssignPatientsSpeechDoctor from "./assign-patients-speech-doctor"
import AllPatientsABA from "./all-patients-aba"
import AllPatientsSpeech from "./all-patients-speech"
import AllPatientsPhysicalTherapy from "./all-patients-physical-therapy"
import AllPatientsOccupationalTherapy from "./all-patients-occupational-therapy"
import AllPatientsSpecialEducation from "./all-patients-special-education"
import AdminAssignPhysicalTherapy from "./admin-assign-physical-therapy"
import AdminAssignOccupationalTherapy from "./admin-assign-occupational-therapy"
import AdminAssignSpecialEducation from "./admin-assign-special-education"
import AdminAssignSpeech from "./admin-assign-speech"
import AdminAssignABA from "./admin-assign-aba"
import DoctorPlan from "./DoctorPlan" // Added this import
import styles from "../styles/speech-upcoming-appointments.module.css"
import { DoctorAppointments } from "./doctor-appointments"
import { AccountantAppointments } from "./accountant-appointments"

const MainContentUpdated = ({ activeContent }) => {
  const user = getCurrentUser()
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    departments: [],
    loading: true,
    error: null,
  })

  // Added state for doctor departments
  const [doctorDepartment, setDoctorDepartment] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    const fetchDashboardData = async () => {
      try {
        setDashboardData((prev) => ({ ...prev, loading: true, error: null }))
        // Fetch different data based on user role
        if (user?.role === "admin") {
          await fetchAdminDashboardData()
        } else if (user?.role === "doctor") {
          await fetchDoctorDashboardData()
        } else {
          await fetchPatientDashboardData()
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load dashboard data",
        }))
      }
    }
    fetchDashboardData()
  }, [user?.id, user?.role])

  // Added useEffect to fetch doctor departments
  useEffect(() => {
    if (user?.role === "doctor" && user?.id) {
      fetchDoctorDepartments()
    }
  }, [user?.id, user?.role])

  // Added function to fetch doctor departments
  const fetchDoctorDepartments = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/doctorFile/doctor-deps/${user?.id}`)
      console.log("Doctor Department Response:", response?.data)
      setDoctorDepartment(response?.data)
    } catch (error) {
      console.error("Error fetching doctor department:", error)
    }
  }

  // Updated utility function to get department ID by name
  const getDepartmentIdByName = (name) => {
    if (!doctorDepartment || !Array.isArray(doctorDepartment)) {
      console.log("No doctor departments available")
      return null
    }

    // Map the display names to actual database names
    const departmentNameMap = {
      ABA: "ABA",
      Speech: "speech",
      "Physical Therapy": "physicalTherapy",
      "Occupational Therapy": "OccupationalTherapy",
      "Special Education": "SpecialEducation",
    }

    // Get the database name for the requested department
    const dbName = departmentNameMap[name] || name

    // Find department by exact database name match
    const department = doctorDepartment.find((dept) => {
      const deptName = dept.name || ""
      return deptName === dbName
    })

    console.log(`Department search for "${name}" (DB: "${dbName}"):`, department)
    return department ? department._id : null
  }

  const fetchAdminDashboardData = async () => {
    try {
      // Fetch all patients count
      const patientsResponse = await axiosInstance.get("/authentication/patients")
      const totalPatients = patientsResponse.data.totalPatients || patientsResponse.data.patients?.length || 0

      // Fetch all doctors count
      const doctorsResponse = await axiosInstance.get("/authentication/doctors")
      const totalDoctors = doctorsResponse.data.totalDoctors || doctorsResponse.data.doctors?.length || 0

      // Fetch department-specific data with both assignments and doctors
      const departmentData = await Promise.all([
        // ABA Department
        Promise.all([
          axiosInstance.get("/aba/patient-assignments").catch(() => ({ data: { pagination: { totalItems: 0 } } })),
          axiosInstance
            .get("/doctor-student-assignment/doctors-by-department/ABA")
            .catch(() => ({ data: { doctors: [] } })),
        ]).then(([assignmentsRes, doctorsRes]) => ({
          name: "ABA",
          assignments: assignmentsRes.data.pagination?.totalItems || 0,
          patients: assignmentsRes.data.pagination?.totalItems || 0,
          doctors: doctorsRes.data.doctors?.length || 0,
        })),

        // Speech Department
        Promise.all([
          axiosInstance.get("/speech/patient-assignments").catch(() => ({ data: { pagination: { totalItems: 0 } } })),
          axiosInstance
            .get("/doctor-student-assignment/doctors-by-department/Speech")
            .catch(() => ({ data: { doctors: [] } })),
        ]).then(([assignmentsRes, doctorsRes]) => ({
          name: "Speech",
          assignments: assignmentsRes.data.pagination?.totalItems || 0,
          patients: assignmentsRes.data.pagination?.totalItems || 0,
          doctors: doctorsRes.data.doctors?.length || 0,
        })),

        // Physical Therapy Department
        Promise.all([
          axiosInstance
            .get("/physicalTherapy/patient-assignments")
            .catch(() => ({ data: { pagination: { totalItems: 0 } } })),
          axiosInstance
            .get("/doctor-student-assignment/doctors-by-department/PT")
            .catch(() => ({ data: { doctors: [] } })),
        ]).then(([assignmentsRes, doctorsRes]) => ({
          name: "PT",
          assignments: assignmentsRes.data.pagination?.totalItems || 0,
          patients: assignmentsRes.data.pagination?.totalItems || 0,
          doctors: doctorsRes.data.doctors?.length || 0,
        })),

        // Occupational Therapy Department
        Promise.all([
          axiosInstance
            .get("/OccupationalTherapy/patient-assignments")
            .catch(() => ({ data: { pagination: { totalItems: 0 } } })),
          axiosInstance
            .get("/doctor-student-assignment/doctors-by-department/OT")
            .catch(() => ({ data: { doctors: [] } })),
        ]).then(([assignmentsRes, doctorsRes]) => ({
          name: "OT",
          assignments: assignmentsRes.data.pagination?.totalItems || 0,
          patients: assignmentsRes.data.pagination?.totalItems || 0,
          doctors: doctorsRes.data.doctors?.length || 0,
        })),

        // Special Education Department
        Promise.all([
          axiosInstance
            .get("/SpecialEducation/patient-assignments")
            .catch(() => ({ data: { pagination: { totalItems: 0 } } })),
          axiosInstance
            .get("/doctor-student-assignment/doctors-by-department/Special Education")
            .catch(() => ({ data: { doctors: [] } })),
        ]).then(([assignmentsRes, doctorsRes]) => ({
          name: "Special Education",
          assignments: assignmentsRes.data.pagination?.totalItems || 0,
          patients: assignmentsRes.data.pagination?.totalItems || 0,
          doctors: doctorsRes.data.doctors?.length || 0,
        })),
      ])

      // Calculate total assignments across all departments
      setDashboardData({
        stats: [
          { label: "Full Program Students", value: totalPatients.toString(), icon: Users, color: "blue" },
          { label: "Active Doctors", value: totalDoctors.toString(), icon: User, color: "green" },
          { label: "Departments", value: "5", icon: Shield, color: "purple" },
        ],
        departments: departmentData,
        loading: false,
        error: null,
      })
    } catch (error) {
      throw error
    }
  }

  const fetchDoctorDashboardData = async () => {
    try {
      const doctorId = user.id
      // For doctors, we'll try to get their assignments from different departments
      // Since we don't have a unified doctor assignment endpoint, we'll use the existing endpoints
      let myAssignments = []
      let totalPatients = 0

      // Try to fetch from different department assignment endpoints
      try {
        // This would need to be implemented in your backend to filter by doctor
        // For now, we'll use placeholder data
        const appointmentsResponse = await axiosInstance.get("/authentication/appointments", {
          params: { limit: 100 },
        })
        myAssignments = appointmentsResponse.data.appointments || []
        totalPatients = myAssignments.length
      } catch (error) {
        console.log("Could not fetch doctor assignments:", error)
        // Use placeholder data
        totalPatients = 0
        myAssignments = []
      }

      // Calculate today's sessions
      const today = new Date().toDateString()
      const todaySessions = myAssignments.filter(
        (assignment) => new Date(assignment.date).toDateString() === today,
      ).length

      // Calculate this week's sessions
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const thisWeekSessions = myAssignments.filter((assignment) => new Date(assignment.date) >= weekStart).length

      // Calculate completed sessions
      const completedSessions = myAssignments.filter(
        (assignment) => assignment.status === "completed" || assignment.status === "active",
      ).length

      setDashboardData({
        stats: [
          { label: "My Patients", value: totalPatients.toString(), icon: Users, color: "blue" },
          { label: "Today's Sessions", value: todaySessions.toString(), icon: Heart, color: "green" },
          { label: "This Week", value: thisWeekSessions.toString(), icon: Activity, color: "purple" },
          { label: "Completed Sessions", value: completedSessions.toString(), icon: Shield, color: "red" },
        ],
        departments: [], // Doctors don't need department overview
        loading: false,
        error: null,
      })
    } catch (error) {
      throw error
    }
  }

  const fetchPatientDashboardData = async () => {
    try {
      const patientId = user.id
      // For patients, we can try to get their data
      let mySessions = 0
      let completedSessions = 0
      let upcomingSessions = 0

      try {
        // Try to get patient's appointments/sessions
        const appointmentsResponse = await axiosInstance.get("/authentication/appointments", {
          params: { search: user.name || "", limit: 100 },
        })
        const myAppointments = appointmentsResponse.data.appointments || []
        mySessions = myAppointments.length

        // Calculate completed and upcoming
        const now = new Date()
        completedSessions = myAppointments.filter((apt) => new Date(apt.date) < now).length
        upcomingSessions = myAppointments.filter((apt) => new Date(apt.date) >= now).length
      } catch (error) {
        console.log("Could not fetch patient data:", error)
      }

      setDashboardData({
        stats: [
          { label: "My Sessions", value: mySessions.toString(), icon: Heart, color: "blue" },
          { label: "Completed", value: completedSessions.toString(), icon: Shield, color: "green" },
          { label: "Upcoming", value: upcomingSessions.toString(), icon: Activity, color: "purple" },
          { label: "Progress", value: "75%", icon: Users, color: "red" },
        ],
        departments: [],
        loading: false,
        error: null,
      })
    } catch (error) {
      throw error
    }
  }

  // Create a separate refresh function that can be called manually
  const handleRefreshDashboard = async () => {
    if (!user?.id) return
    try {
      setDashboardData((prev) => ({ ...prev, loading: true, error: null }))
      if (user?.role === "admin") {
        await fetchAdminDashboardData()
      } else if (user?.role === "doctor") {
        await fetchDoctorDashboardData()
      } else {
        await fetchPatientDashboardData()
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setDashboardData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load dashboard data",
      }))
    }
  }

  const getDepartmentCards = () => {
    if (user?.role !== "admin" || !dashboardData.departments.length) {
      return [
        {
          title: "ABA Department",
          description: "Applied Behavior Analysis therapy and interventions",
          icon: Brain,
          color: "blue",
          stats: { patients: 0, doctors: 0, sessions: 0 },
        },
        {
          title: "Speech Therapy",
          description: "Speech and language pathology services",
          icon: MessageSquare,
          color: "green",
          stats: { patients: 0, doctors: 0, sessions: 0 },
        },
        {
          title: "Physical Therapy",
          description: "Physical rehabilitation and movement therapy",
          icon: Activity,
          color: "purple",
          stats: { patients: 0, doctors: 0, sessions: 0 },
        },
        {
          title: "Occupational Therapy",
          description: "Daily living skills and occupational rehabilitation",
          icon: Palette,
          color: "orange",
          stats: { patients: 0, doctors: 0, sessions: 0 },
        },
        {
          title: "Special Education",
          description: "Specialized educational support and interventions",
          icon: BookOpen,
          color: "red",
          stats: { patients: 0, doctors: 0, sessions: 0 },
        },
      ]
    }

    // Map real data to department cards
    const iconMap = {
      ABA: Brain,
      Speech: MessageSquare,
      PT: Activity,
      OT: Palette,
      "Special Education": BookOpen,
    }

    const colorMap = {
      ABA: "blue",
      Speech: "green",
      PT: "purple",
      OT: "orange",
      "Special Education": "red",
    }

    const descriptionMap = {
      ABA: "Applied Behavior Analysis therapy and interventions",
      Speech: "Speech and language pathology services",
      PT: "Physical rehabilitation and movement therapy",
      OT: "Daily living skills and occupational rehabilitation",
      "Special Education": "Specialized educational support and interventions",
    }

    return dashboardData.departments.map((dept) => ({
      title:
        dept.name === "PT"
          ? "Physical Therapy"
          : dept.name === "OT"
            ? "Occupational Therapy"
            : dept.name === "ABA"
              ? "ABA Department"
              : dept.name === "Speech"
                ? "Speech Therapy"
                : dept.name,
      description: descriptionMap[dept.name] || `${dept.name} department services`,
      icon: iconMap[dept.name] || BookOpen,
      color: colorMap[dept.name] || "blue",
      stats: {
        patients: dept.patients,
        doctors: dept.doctors, // Now showing real doctor count from the API
        sessions: dept.assignments,
      },
    }))
  }

  const renderContent = () => {
    switch (activeContent) {
      case "dashboard":
        return (
          <div className={styles.upcomingContainer}>
            <div className={styles.upcomingCard}>
              <div className={styles.cardHeader}>
                <div className={styles.headerContent}>
                  <div className={styles.titleSection}>
                    <h1 className={styles.pageTitle}>
                      <Shield className={styles.titleIcon} />
                      Healthcare Dashboard
                    </h1>
                    <p className={styles.pageSubtitle}>Welcome back, {user?.role}! Here's your system overview.</p>
                  </div>
                  <div className={styles.headerActions}>
                    <button
                      onClick={handleRefreshDashboard}
                      disabled={dashboardData.loading}
                      className={`${styles.actionButton} ${styles.viewButton}`}
                      title="Refresh Dashboard"
                    >
                      <RefreshCw className={`${styles.actionIcon} ${dashboardData.loading ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>
                {/* Loading State */}
                {dashboardData.loading ? (
                  <div className={styles.statsContainer}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={styles.statItem}>
                        <div className={styles.statIcon}>
                          <div className={styles.loadingSpinner}></div>
                        </div>
                        <div className={styles.statContent}>
                          <div className={styles.statNumber}>...</div>
                          <div className={styles.statLabel}>Loading...</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Stats Container */
                  <div className={styles.statsContainer}>
                    {dashboardData.stats.map((stat, index) => (
                      <div key={index} className={styles.statItem}>
                        <div className={styles.statIcon}>
                          <stat.icon className={styles.statIconSvg} />
                        </div>
                        <div className={styles.statContent}>
                          <div className={styles.statNumber}>{stat.value}</div>
                          <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.cardBody}>
                {/* Error Display */}
                {dashboardData.error && (
                  <div
                    style={{
                      marginBottom: "2rem",
                      padding: "1rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      display: "flex",
                      alignItems: "center",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <AlertCircle style={{ marginRight: "0.75rem", flexShrink: 0 }} size={20} />
                    <span style={{ fontWeight: "500" }}>{dashboardData.error}</span>
                  </div>
                )}
                {user?.role === "admin" && (
                  <>
                    <div style={{ marginBottom: "2rem" }}>
                      <h2 className={styles.sectionTitle}>
                        <Heart className={styles.sectionIcon} />
                        Department Overview
                      </h2>
                      <div className={styles.sectionDivider}></div>
                    </div>
                    <div className={styles.departmentGrid}>
                      {getDepartmentCards().map((dept, index) => (
                        <div key={index} className={styles.departmentCard}>
                          <div className={styles.departmentHeader}>
                            <div className={styles.departmentIcon}>
                              <dept.icon className={styles.departmentIconSvg} />
                            </div>
                            <div className={styles.departmentInfo}>
                              <h3 className={styles.departmentTitle}>{dept.title}</h3>
                              <p className={styles.departmentDescription}>{dept.description}</p>
                            </div>
                          </div>
                          <div className={styles.departmentStats}>
                            <div className={styles.departmentStat}>
                              <span className={styles.departmentStatValue}>{dept.stats.patients}</span>
                              <span className={styles.departmentStatLabel}>Patients</span>
                            </div>
                            <div className={styles.departmentStat}>
                              <span className={styles.departmentStatValue}>{dept.stats.doctors}</span>
                              <span className={styles.departmentStatLabel}>Doctors</span>
                            </div>
                            <div className={styles.departmentStat}>
                              <span className={styles.departmentStatValue}>{dept.stats.sessions}</span>
                              <span className={styles.departmentStatLabel}>Assignments</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )

      case "all-patients":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                      <h1 className={styles.pageTitle}>
                        <Users className={styles.titleIcon} />
                        All Patients
                      </h1>
                      <p className={styles.pageSubtitle}>
                        Comprehensive patient management interface for administrators.
                      </p>
                    </div>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>Patient Management</h3>
                    <p>This feature is currently under development. Please check back soon.</p>
                  </div>
                </div>
              </div>
            </div>
          </AccessControl>
        )

      case "doctor-appointments":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <DoctorAppointments />
          </AccessControl>
        )

      case "accountant-appointments":
        return (
          <AccessControl allowedRoles={["admin", "accountant"]}>
            <AccountantAppointments />
          </AccessControl>
        )

      // ABA Department Cases
      case "all-patients-aba":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatientsABA />
          </AccessControl>
        )

      case "assign-patients-aba":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            <AssignPatientsABADoctor />
          </AccessControl>
        )

      case "admin-assign-aba":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AdminAssignABA />
          </AccessControl>
        )

      case "aba-assignments-table":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatientsABA />
          </AccessControl>
        )

      // Added ABA Doctor Plan case
      case "doctor-plan-aba":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            {(() => {
              console.log("Checking ABA access...")
              console.log("User role:", user?.role)
              console.log("Doctor departments:", doctorDepartment)

              if (user?.role !== "doctor") {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Access Denied</h3>
                          <p>Only doctors can access department plans.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              if (!doctorDepartment || doctorDepartment.length === 0) {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Loading...</h3>
                          <p>Loading your department information...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              // Check if doctor has access to ABA
              const hasAccess = doctorDepartment.some((dept) => {
                const deptName = dept.name || ""
                return deptName === "ABA"
              })

              console.log("ABA access check result:", hasAccess)

              if (hasAccess) {
                const departmentId = getDepartmentIdByName("ABA")
                console.log("ABA department ID:", departmentId)

                return <DoctorPlan doctorId={user?.id} departmentId={departmentId} />
              } else {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Access Denied</h3>
                          <p>You don't have access to ABA department plans.</p>
                          <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                            Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            })()}
          </AccessControl>
        )

      // Speech Department Cases
      case "all-patients-speech":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatientsSpeech />
          </AccessControl>
        )

      case "assign-patients-speech":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            <AssignPatientsSpeechDoctor />
          </AccessControl>
        )

      case "admin-assign-speech":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AdminAssignSpeech />
          </AccessControl>
        )

      case "speech-assignments-table":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatientsSpeech />
          </AccessControl>
        )

      // Added Speech Doctor Plan case
      case "doctor-plan-speech":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            {(() => {
              console.log("Checking Speech access...")
              console.log("User role:", user?.role)
              console.log("Doctor departments:", doctorDepartment)

              if (user?.role !== "doctor") {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Access Denied</h3>
                          <p>Only doctors can access department plans.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              if (!doctorDepartment || doctorDepartment.length === 0) {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Loading...</h3>
                          <p>Loading your department information...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              // Check if doctor has access to Speech
              const hasAccess = doctorDepartment.some((dept) => {
                const deptName = dept.name || ""
                return deptName === "speech"
              })

              console.log("Speech access check result:", hasAccess)

              if (hasAccess) {
                const departmentId = getDepartmentIdByName("Speech")
                console.log("Speech department ID:", departmentId)

                return <DoctorPlan doctorId={user?.id} departmentId={departmentId} />
              } else {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Access Denied</h3>
                          <p>You don't have access to Speech department plans.</p>
                          <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                            Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            })()}
          </AccessControl>
        )

      // Physical Therapy Department Cases
      case "all-patients-physical-therapy":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatientsPhysicalTherapy />
          </AccessControl>
        )

      case "assign-patients-physical-therapy":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            <AssignPatientsPhysicalTherapyDoctor />
          </AccessControl>
        )

      case "admin-assign-physical-therapy":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AdminAssignPhysicalTherapy />
          </AccessControl>
        )

      case "physical-therapy-assignments-table":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatientsPhysicalTherapy />
          </AccessControl>
        )

      // Added Physical Therapy Doctor Plan case
      case "doctor-plan-physical-therapy":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            {(() => {
              console.log("Checking Physical Therapy access...")
              console.log("User role:", user?.role)
              console.log("Doctor departments:", doctorDepartment)

              if (user?.role !== "doctor") {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Access Denied</h3>
                          <p>Only doctors can access department plans.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              if (!doctorDepartment || doctorDepartment.length === 0) {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Loading...</h3>
                          <p>Loading your department information...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              // Check if doctor has access to Physical Therapy
              const hasAccess = doctorDepartment.some((dept) => {
                const deptName = dept.name || ""
                return deptName === "physicalTherapy"
              })

              console.log("Physical Therapy access check result:", hasAccess)

              if (hasAccess) {
                const departmentId = getDepartmentIdByName("Physical Therapy")
                console.log("Physical Therapy department ID:", departmentId)

                return <DoctorPlan doctorId={user?.id} departmentId={departmentId} />
              } else {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Access Denied</h3>
                          <p>You don't have access to Physical Therapy department plans.</p>
                          <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                            Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            })()}
          </AccessControl>
        )

      // Occupational Therapy Department Cases
      case "all-patients-occupational-therapy":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatientsOccupationalTherapy />
          </AccessControl>
        )

      case "assign-patients-occupational-therapy":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            <AssignPatientsOccupationalTherapyDoctor />
          </AccessControl>
        )

      case "admin-assign-occupational-therapy":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AdminAssignOccupationalTherapy />
          </AccessControl>
        )

      case "occupational-therapy-assignments-table":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatientsOccupationalTherapy />
          </AccessControl>
        )

      // Added Occupational Therapy Doctor Plan case
      case "doctor-plan-occupational-therapy":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            {(() => {
              console.log("Checking Occupational Therapy access...")
              console.log("User role:", user?.role)
              console.log("Doctor departments:", doctorDepartment)

              if (user?.role !== "doctor") {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Access Denied</h3>
                          <p>Only doctors can access department plans.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              if (!doctorDepartment || doctorDepartment.length === 0) {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Loading...</h3>
                          <p>Loading your department information...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              // Check if doctor has access to Occupational Therapy
              const hasAccess = doctorDepartment.some((dept) => {
                const deptName = dept.name || ""
                return deptName === "OccupationalTherapy"
              })

              console.log("Occupational Therapy access check result:", hasAccess)

              if (hasAccess) {
                const departmentId = getDepartmentIdByName("Occupational Therapy")
                console.log("Occupational Therapy department ID:", departmentId)

                return <DoctorPlan doctorId={user?.id} departmentId={departmentId} />
              } else {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Access Denied</h3>
                          <p>You don't have access to Occupational Therapy department plans.</p>
                          <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                            Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            })()}
          </AccessControl>
        )

      // Special Education Department Cases
      case "all-patients-special-education":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatientsSpecialEducation />
          </AccessControl>
        )

      case "assign-patients-special-education":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            <AssignPatientsSpecialEducationDoctor />
          </AccessControl>
        )

      case "admin-assign-special-education":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AdminAssignSpecialEducation />
          </AccessControl>
        )

      case "special-education-assignments-table":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatientsSpecialEducation />
          </AccessControl>
        )

      // Added Special Education Doctor Plan case
      case "doctor-plan-special-education":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            {(() => {
              console.log("Checking Special Education access...")
              console.log("User role:", user?.role)
              console.log("Doctor departments:", doctorDepartment)

              if (user?.role !== "doctor") {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Access Denied</h3>
                          <p>Only doctors can access department plans.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              if (!doctorDepartment || doctorDepartment.length === 0) {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Loading...</h3>
                          <p>Loading your department information...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              // Check if doctor has access to Special Education
              const hasAccess = doctorDepartment.some((dept) => {
                const deptName = dept.name || ""
                return deptName === "SpecialEducation"
              })

              console.log("Special Education access check result:", hasAccess)

              if (hasAccess) {
                const departmentId = getDepartmentIdByName("Special Education")
                console.log("Special Education department ID:", departmentId)

                return <DoctorPlan doctorId={user?.id} departmentId={departmentId} />
              } else {
                return (
                  <div className={styles.upcomingContainer}>
                    <div className={styles.upcomingCard}>
                      <div className={styles.cardBody}>
                        <div className={styles.comingSoon}>
                          <Shield className={styles.comingSoonIcon} />
                          <h3>Access Denied</h3>
                          <p>You don't have access to Special Education department plans.</p>
                          <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                            Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            })()}
          </AccessControl>
        )

      default:
        return (
          <div className={styles.upcomingContainer}>
            <div className={styles.upcomingCard}>
              <div className={styles.cardHeader}>
                <div className={styles.headerContent}>
                  <div className={styles.titleSection}>
                    <h1 className={styles.pageTitle}>
                      <Shield className={styles.titleIcon} />
                      Welcome to Healthcare System
                    </h1>
                    <p className={styles.pageSubtitle}>
                      Select an option from the sidebar to get started with patient management.
                    </p>
                  </div>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.welcomeMessage}>
                  <Shield className={styles.welcomeIcon} />
                  <h3>Getting Started</h3>
                  <p>
                    Use the navigation menu on the left to access different sections of the healthcare management
                    system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return <div className={styles.mainContent}>{renderContent()}</div>
}

export default MainContentUpdated
