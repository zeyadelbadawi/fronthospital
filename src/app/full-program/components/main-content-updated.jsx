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
  Sparkle,
} from "lucide-react"
import AccessControl from "./access-control"
import {
  AssignPatientsABADoctor,
  AssignPatientsSpeechDoctor,
  AssignPatientsPhysicalTherapyDoctor,
  AssignPatientsOccupationalTherapyDoctor,
  AssignPatientsSpecialEducationDoctor,
  AssignPatientsPsychotherapyDoctor,
} from "./generic-assign-patients-doctor"
import AllPatients from "./all-patients"
import GenericAdminAssign from "./generic-admin-assign" // New import for generic component
import DoctorPlan from "./DoctorPlan"
import styles from "../styles/speech-upcoming-appointments.module.css"
import { DoctorAppointments } from "./doctor-appointments"
import { AccountantAppointments } from "./accountant-appointments"
import { usePathname } from "next/navigation"
import GenericPlanView from "./generic-plan-view"
import GenericExamView from "./generic-exam-view"
import { EditDepartments } from "./edit-departments" // Added import

// Added onNavigateContent as a new prop
const MainContentUpdated = ({
  activeContent,
  selectedAbaPatientId,
  selectedOccupationalPatientId,
  selectedPhysicalPatientId,
  selectedPsychotherapyPatientId,
  selectedSpecialPatientId,
  selectedSpeechPatientId,
  onBackToDashboard,
  onNavigateContent,
}) => {
  const user = getCurrentUser()
  const pathname = usePathname()
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    departments: [],
    loading: true,
    error: null,
  })

  const [doctorDepartment, setDoctorDepartment] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    const fetchDashboardData = async () => {
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
    fetchDashboardData()
  }, [user?.id, user?.role])

  useEffect(() => {
    if (user?.role === "doctor" && user?.id) {
      fetchDoctorDepartments()
    }
  }, [user?.id, user?.role])

  const fetchDoctorDepartments = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/doctorFile/doctor-deps/${user?.id}`)
      setDoctorDepartment(response?.data)
    } catch (error) {
      console.error("Error fetching doctor department:", error)
    }
  }

  const getDepartmentIdByName = (name) => {
    if (!doctorDepartment || !Array.isArray(doctorDepartment)) {
      return null
    }

    const departmentNameMap = {
      ABA: "ABA",
      Speech: "speech",
      Psychotherapy: "Psychotherapy",
      "Physical Therapy": "physicalTherapy",
      "Occupational Therapy": "OccupationalTherapy",
      "Special Education": "SpecialEducation",
    }

    const dbName = departmentNameMap[name] || name

    const department = doctorDepartment.find((dept) => {
      const deptName = dept.name || ""
      return deptName === dbName
    })

    return department ? department._id : null
  }

  const fetchAdminDashboardData = async () => {
    try {
      const patientsResponse = await axiosInstance.get("/authentication/patients")
      const totalPatients = patientsResponse.data.totalPatients || patientsResponse.data.patients?.length || 0

      const doctorsResponse = await axiosInstance.get("/authentication/doctors")
      const totalDoctors = doctorsResponse.data.totalDoctors || doctorsResponse.data.doctors?.length || 0

      const departmentData = await Promise.all([
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

        Promise.all([
          axiosInstance
            .get("/Psychotherapy/patient-assignments")
            .catch(() => ({ data: { pagination: { totalItems: 0 } } })),
          axiosInstance
            .get("/doctor-student-assignment/doctors-by-department/Psychotherapy")
            .catch(() => ({ data: { doctors: [] } })),
        ]).then(([assignmentsRes, doctorsRes]) => ({
          name: "Psychotherapy",
          assignments: assignmentsRes.data.pagination?.totalItems || 0,
          patients: assignmentsRes.data.pagination?.totalItems || 0,
          doctors: doctorsRes.data.doctors?.length || 0,
        })),

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
      let myAssignments = []
      let totalPatients = 0

      try {
        const appointmentsResponse = await axiosInstance.get("/authentication/appointments", {
          params: { limit: 100 },
        })
        myAssignments = appointmentsResponse.data.appointments || []
        totalPatients = myAssignments.length
      } catch (error) {
        totalPatients = 0
        myAssignments = []
      }

      const today = new Date().toDateString()
      const todaySessions = myAssignments.filter(
        (assignment) => new Date(assignment.date).toDateString() === today,
      ).length

      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const thisWeekSessions = myAssignments.filter((assignment) => new Date(assignment.date) >= weekStart).length

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
        departments: [],
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
      let mySessions = 0
      let completedSessions = 0
      let upcomingSessions = 0

      try {
        const appointmentsResponse = await axiosInstance.get("/authentication/appointments", {
          params: { search: user.name || "", limit: 100 },
        })
        const myAppointments = appointmentsResponse.data.appointments || []
        mySessions = myAppointments.length

        const now = new Date()
        completedSessions = myAppointments.filter((apt) => new Date(apt.date) < now).length
        upcomingSessions = myAppointments.filter((apt) => new Date(apt.date) >= now).length
      } catch (error) {}

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
          title: "Psychotherapy",
          description: "Psychotherapy rehabilitation and movement therapy",
          icon: Sparkle,
          color: "yellow",
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

    const iconMap = {
      ABA: Brain,
      Speech: MessageSquare,
      PT: Activity,
      OT: Palette,
      Psychotherapy: Sparkle,
      "Special Education": BookOpen,
    }

    const colorMap = {
      ABA: "blue",
      Speech: "green",
      PT: "purple",
      OT: "orange",
      Psychotherapy: "yellow",
      "Special Education": "red",
    }

    const descriptionMap = {
      ABA: "Applied Behavior Analysis therapy and interventions",
      Speech: "Speech and language pathology services",
      PT: "Physical rehabilitation and movement therapy",
      OT: "Daily living skills and occupational rehabilitation",
      Psychotherapy: "Psychotherapy rehabilitation therapy",
      "Special Education": "Specialized educational support and interventions",
    }

    return dashboardData.departments.map((dept) => ({
      title:
        dept.name === "PT"
          ? "Physical Therapy"
          : dept.name === "Psychotherapy"
            ? "Psychotherapy"
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
        doctors: dept.doctors,
        sessions: dept.assignments,
      },
    }))
  }

  const renderContent = () => {
    // Handle initial/dashboard view based on user role
    if (activeContent === "dashboard") {
      if (user?.role === "doctor" || user?.role === "accountant") {
        return (
          <div className={styles.upcomingContainer}>
            <div className={styles.upcomingCard}>
              <div className={styles.cardHeader}>
                <div className={styles.headerContent}>
                  <div className={styles.titleSection}>
                    <h1 className={styles.pageTitle}>
                      <Shield className={styles.titleIcon} />
                      Welcome, {user?.role}
                    </h1>
                    <p className={styles.pageSubtitle}>Select an option from the sidebar to get started.</p>
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
      } else if (user?.role === "admin") {
        // Admin role, show full dashboard
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
                      <h3 className={styles.sectionTitle}>Department Overview</h3>
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
                              <h4 className={styles.departmentTitle}>{dept.title}</h4>
                              <p className={styles.departmentDescription}>{dept.description}</p>
                            </div>
                          </div>
                          <div className={styles.departmentStats}>
                            <div className={styles.departmentStat}>
                              <span className={styles.departmentStatValue}>{dept.stats.patients}</span>
                              <span className={styles.departmentStatLabel}>Students</span>
                            </div>
                            <div className={styles.departmentStat}>
                              <span className={styles.departmentStatValue}>{dept.stats.doctors}</span>
                              <span className={styles.departmentStatLabel}>Doctors</span>
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
      }
    }

    // If activeContent is not 'dashboard' or the initial welcome, proceed with the switch
    switch (activeContent) {
      case "dashboard": // This case is now handled by the if-else if block above, so it can be removed or return null
        return null // Should not be reached if the logic above is correct.

      case "edit-departments":
        return <EditDepartments />

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
                        All Students
                      </h1>
                      <p className={styles.pageSubtitle}>
                        Comprehensive Student management interface for administrators.
                      </p>
                    </div>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>Student Management</h3>
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

      case "all-patients-aba":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients onViewPlan={onNavigateContent} onViewExam={onNavigateContent} contentType="all-patients-aba" />
          </AccessControl>
        )

      case "assign-patients-aba":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            {/* Corrected: Pass onNavigateContent directly */}
            <AssignPatientsABADoctor onViewAbaPlan={onNavigateContent} onViewAbaExam={onNavigateContent} />{" "}
            {/* Pass onViewAbaExam */}
          </AccessControl>
        )

      case "admin-assign-aba":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <GenericAdminAssign department="aba" />
          </AccessControl>
        )

      case "aba-assignments-table":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients contentType="all-patients-aba" onViewPlan={onNavigateContent} onViewExam={onNavigateContent} />
          </AccessControl>
        )

      case "aba-plan-editor":
        const hasAccessABA = doctorDepartment?.some((dept) => dept.name === "ABA")

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department plans.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if ((user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessABA) && selectedAbaPatientId) {
          return <GenericPlanView department="aba" patientId={selectedAbaPatientId} onBack={onBackToDashboard} />
        } else if ((user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessABA) && !selectedAbaPatientId) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My ABA Students" to view their plan.</p>
                  </div>
                </div>
              </div>
            </div>
          )
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

      case "aba-exam-editor": // NEW CASE FOR ABA EXAM EDITOR
        const hasAccessABAExam = doctorDepartment?.some((dept) => dept.name === "ABA")

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department exams.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if ((user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessABAExam) && selectedAbaPatientId) {
          return <GenericExamView department="aba" patientId={selectedAbaPatientId} onBack={onBackToDashboard} />
        } else if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessABAExam) &&
          !selectedAbaPatientId
        ) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My ABA Students" to view their exam.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>You don't have access to ABA department exams.</p>
                    <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                      Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

      case "doctor-plan-aba":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            {(() => {
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

              const hasAccess = doctorDepartment.some((dept) => {
                const deptName = dept.name || ""
                return deptName === "ABA"
              })

              if (hasAccess) {
                const departmentId = getDepartmentIdByName("ABA")

                return <DoctorPlan doctorId={user?.id} departmentId={departmentId} />
              } else {
                return (
                  <div className={styles.upcomingContainer}>
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
                )
              }
            })()}
          </AccessControl>
        )

      case "all-patients-speech":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients
              contentType="all-patients-speech"
              onViewPlan={onNavigateContent}
              onViewExam={onNavigateContent}
            />
          </AccessControl>
        )

      case "assign-patients-speech":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            <AssignPatientsSpeechDoctor
              onViewSpeechPlan={onNavigateContent}
              onViewSpeechExam={onNavigateContent}
            />{" "}
          </AccessControl>
        )

      case "admin-assign-speech":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <GenericAdminAssign department="speech" />
          </AccessControl>
        )

      case "speech-assignments-table":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients
              contentType="all-patients-speech"
              onViewPlan={onNavigateContent}
              onViewExam={onNavigateContent}
            />
          </AccessControl>
        )

      case "speech-plan-editor":
        const hasAccessSpeech = doctorDepartment?.some((dept) => dept.name?.toLowerCase() === "speech")

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department plans.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if ((user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessSpeech) && selectedSpeechPatientId) {
          return <GenericPlanView department="speech" patientId={selectedSpeechPatientId} onBack={onBackToDashboard} />
        } else if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessSpeech) &&
          !selectedSpeechPatientId
        ) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My Speech Students" to view their plan.</p>
                  </div>
                </div>
              </div>
            </div>
          )
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

      case "speech-exam-editor":
        const hasAccessSpeechExam = doctorDepartment?.some((dept) => dept.name?.toLowerCase() === "speech")

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department exams.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if ((user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessSpeechExam) && selectedSpeechPatientId) {
          return <GenericExamView department="speech" patientId={selectedSpeechPatientId} onBack={onBackToDashboard} />
        } else if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessSpeechExam) &&
          !selectedSpeechPatientId
        ) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My Speech Students" to view their exam.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>You don't have access to Speech department exams.</p>
                    <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                      Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

      case "doctor-plan-speech":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            {(() => {
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

              const hasAccess = doctorDepartment.some((dept) => {
                const deptName = dept.name || ""
                return deptName === "speech"
              })

              if (hasAccess) {
                const departmentId = getDepartmentIdByName("Speech")

                return <DoctorPlan doctorId={user?.id} departmentId={departmentId} />
              } else {
                return (
                  <div className={styles.upcomingContainer}>
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
                )
              }
            })()}
          </AccessControl>
        )

      case "all-patients-physical-therapy":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients
              contentType="all-patients-physical-therapy"
              onViewPlan={onNavigateContent}
              onViewExam={onNavigateContent}
            />
          </AccessControl>
        )

      case "assign-patients-physical-therapy":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            <AssignPatientsPhysicalTherapyDoctor
              onViewPhysicalPlan={onNavigateContent}
              onViewPhysicalExam={onNavigateContent}
            />{" "}
          </AccessControl>
        )

      case "admin-assign-physical-therapy":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <GenericAdminAssign department="physicalTherapy" />
          </AccessControl>
        )

      case "physical-therapy-assignments-table":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients
              contentType="all-patients-physical-therapy"
              onViewPlan={onNavigateContent}
              onViewExam={onNavigateContent}
            />
          </AccessControl>
        )

      case "physical-plan-editor":
        const hasAccessPhysical = doctorDepartment?.some((dept) => dept.name === "physicalTherapy")

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department plans.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if ((user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessPhysical) && selectedPhysicalPatientId) {
          return (
            <GenericPlanView department="physical" patientId={selectedPhysicalPatientId} onBack={onBackToDashboard} />
          )
        } else if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessPhysical) &&
          !selectedPhysicalPatientId
        ) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My Physical therapy Students" to view their plan.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>You don't have access to Physical therapy department plans.</p>
                    <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                      Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

      case "physical-exam-editor":
        const hasAccessPhysicalExam = doctorDepartment?.some((dept) => dept.name === "physicalTherapy")

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department exams.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessPhysicalExam) &&
          selectedPhysicalPatientId
        ) {
          return (
            <GenericExamView department="physical" patientId={selectedPhysicalPatientId} onBack={onBackToDashboard} />
          )
        } else if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessPhysicalExam) &&
          !selectedPhysicalPatientId
        ) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My Physical therapy Students" to view their exam.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>You don't have access to physical Therapy department exams.</p>
                    <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                      Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

      case "doctor-plan-physical-therapy":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            {(() => {
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

              const hasAccess = doctorDepartment.some((dept) => {
                const deptName = dept.name || ""
                return deptName === "physicalTherapy"
              })

              if (hasAccess) {
                const departmentId = getDepartmentIdByName("Physical Therapy")

                return <DoctorPlan doctorId={user?.id} departmentId={departmentId} />
              } else {
                return (
                  <div className={styles.upcomingContainer}>
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
                )
              }
            })()}
          </AccessControl>
        )

      case "all-patients-Psychotherapy":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients
              contentType="all-patients-Psychotherapy"
              onViewPlan={onNavigateContent}
              onViewExam={onNavigateContent}
            />
          </AccessControl>
        )

      case "assign-patients-Psychotherapy":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            <AssignPatientsPsychotherapyDoctor
              onViewPsychotherapyPlan={onNavigateContent}
              onViewPsychotherapyExam={onNavigateContent}
            />{" "}
          </AccessControl>
        )

      case "admin-assign-Psychotherapy":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <GenericAdminAssign department="Psychotherapy" />
          </AccessControl>
        )

      case "Psychotherapy-assignments-table":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients
              contentType="all-patients-Psychotherapy"
              onViewPlan={onNavigateContent}
              onViewExam={onNavigateContent}
            />
          </AccessControl>
        )

      case "Psychotherapy-plan-editor":
        const hasAccessPsycho = doctorDepartment?.some((dept) => dept.name?.toLowerCase() === "psychotherapy")

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department plans.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessPsycho) &&
          selectedPsychotherapyPatientId
        ) {
          return (
            <GenericPlanView
              department="psychotherapy"
              patientId={selectedPsychotherapyPatientId}
              onBack={onBackToDashboard}
            />
          )
        } else if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessPsycho) &&
          !selectedPsychotherapyPatientId
        ) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My Psychotherapy Students" to view their plan.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>You don't have access to Psychotherapy department plans.</p>
                    <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                      Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

      case "Psychotherapy-exam-editor":
        const hasAccessPsychoExam = doctorDepartment?.some((dept) => dept.name?.toLowerCase() === "psychotherapy")

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department exams.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessPsychoExam) &&
          selectedPsychotherapyPatientId
        ) {
          return (
            <GenericExamView
              department="Psychotherapy"
              patientId={selectedPsychotherapyPatientId}
              onBack={onBackToDashboard}
            />
          )
        } else if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessPsychoExam) &&
          !selectedPsychotherapyPatientId
        ) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My Psychotherapy Students" to view their exam.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>You don't have access to Psychotherapy department exams.</p>
                    <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                      Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

      case "all-patients-occupational-therapy":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients
              contentType="all-patients-occupational-therapy"
              onViewPlan={onNavigateContent}
              onViewExam={onNavigateContent}
            />
          </AccessControl>
        )

      case "assign-patients-occupational-therapy":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            <AssignPatientsOccupationalTherapyDoctor
              onViewoccupationalPlan={onNavigateContent}
              onViewoccupationalExam={onNavigateContent}
            />{" "}
          </AccessControl>
        )

      case "admin-assign-occupational-therapy":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <GenericAdminAssign department="OccupationalTherapy" />
          </AccessControl>
        )

      case "occupational-therapy-assignments-table":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients
              contentType="all-patients-occupational-therapy"
              onViewPlan={onNavigateContent}
              onViewExam={onNavigateContent}
            />
          </AccessControl>
        )

      case "occupational-plan-editor":
        const hasAccessOccupational = doctorDepartment?.some(
          (dept) => dept.name?.toLowerCase() === "occupational therapy",
        )

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department plans.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessOccupational) &&
          selectedOccupationalPatientId
        ) {
          return (
            <GenericPlanView
              department="occupational"
              patientId={selectedOccupationalPatientId}
              onBack={onBackToDashboard}
            />
          )
        } else if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessOccupational) &&
          !selectedOccupationalPatientId
        ) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My Occupational Therapy Students" to view their plan.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>You don't have access to Occupational therapy department plans.</p>
                    <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                      Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

      case "occupational-exam-editor":
        const hasAccessOccupationalExam = doctorDepartment?.some(
          (dept) => dept.name?.toLowerCase() === "occupational therapy",
        )

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department exams.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessOccupationalExam) &&
          selectedOccupationalPatientId
        ) {
          return (
            <GenericExamView
              department="occupational"
              patientId={selectedOccupationalPatientId}
              onBack={onBackToDashboard}
            />
          )
        } else if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessOccupationalExam) &&
          !selectedOccupationalPatientId
        ) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My Occupational therapy Students" to view their exam.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>You don't have access to Occupational Therapy department exams.</p>
                    <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                      Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

      case "doctor-plan-occupational-therapy":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            {(() => {
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

              const hasAccess = doctorDepartment.some((dept) => {
                const deptName = dept.name || ""
                return deptName === "OccupationalTherapy"
              })

              if (hasAccess) {
                const departmentId = getDepartmentIdByName("Occupational Therapy")

                return <DoctorPlan doctorId={user?.id} departmentId={departmentId} />
              } else {
                return (
                  <div className={styles.upcomingContainer}>
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
                )
              }
            })()}
          </AccessControl>
        )

      case "all-patients-special-education":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients
              contentType="all-patients-special-education"
              onViewPlan={onNavigateContent}
              onViewExam={onNavigateContent}
            />
          </AccessControl>
        )

      case "assign-patients-special-education":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            <AssignPatientsSpecialEducationDoctor
              onViewSpecialPlan={onNavigateContent}
              onViewSpecialExam={onNavigateContent}
            />{" "}
          </AccessControl>
        )

      case "admin-assign-special-education":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <GenericAdminAssign department="SpecialEducation" />
          </AccessControl>
        )

      case "special-education-assignments-table":
        return (
          <AccessControl allowedRoles={["admin"]}>
            <AllPatients
              contentType="all-patients-special-education"
              onViewPlan={onNavigateContent}
              onViewExam={onNavigateContent}
            />
          </AccessControl>
        )

      case "special-plan-editor":
        const hasAccessSpecial = doctorDepartment?.some((dept) => dept.name?.toLowerCase() === "special education")

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department plans.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if ((user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessSpecial) && selectedSpecialPatientId) {
          return (
            <GenericPlanView department="special" patientId={selectedSpecialPatientId} onBack={onBackToDashboard} />
          )
        } else if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessSpecial) &&
          !selectedSpecialPatientId
        ) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My Special Education Students" to view their plan.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>You don't have access to SpecialEducation department plans.</p>
                    <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                      Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

      case "special-exam-editor":
        const hasAccessSpecialExam = doctorDepartment?.some((dept) => dept.name?.toLowerCase() === "special education")

        if (user?.role !== "doctor" && user?.role !== "admin" && user?.role !== "HeadDoctor") {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>Only doctors, admins, and head doctors can access department exams.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        if (user?.role === "doctor" && (!doctorDepartment || doctorDepartment.length === 0)) {
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

        if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessSpecialExam) &&
          selectedSpecialPatientId
        ) {
          return (
            <GenericExamView department="special" patientId={selectedSpecialPatientId} onBack={onBackToDashboard} />
          )
        } else if (
          (user?.role === "admin" || user?.role === "HeadDoctor" || hasAccessSpecialExam) &&
          !selectedSpecialPatientId
        ) {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Users className={styles.comingSoonIcon} />
                    <h3>No Student Selected</h3>
                    <p>Please select a Student from "My Special Education Students" to view their exam.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className={styles.upcomingContainer}>
              <div className={styles.upcomingCard}>
                <div className={styles.cardBody}>
                  <div className={styles.comingSoon}>
                    <Shield className={styles.comingSoonIcon} />
                    <h3>Access Denied</h3>
                    <p>You don't have access to SpecialEducation department exams.</p>
                    <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
                      Your departments: {doctorDepartment.map((d) => d.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

      case "doctor-plan-special-education":
        return (
          <AccessControl allowedRoles={["doctor"]}>
            {(() => {
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

              const hasAccess = doctorDepartment.some((dept) => {
                const deptName = dept.name || ""
                return deptName === "SpecialEducation"
              })

              if (hasAccess) {
                const departmentId = getDepartmentIdByName("Special Education")

                return <DoctorPlan doctorId={user?.id} departmentId={departmentId} />
              } else {
                return (
                  <div className={styles.upcomingContainer}>
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
                      Select an option from the sidebar to get started with Student management.
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
