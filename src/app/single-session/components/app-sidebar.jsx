"use client"
import { useState, useEffect } from "react"
import {
  User,
  Calendar,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Activity,
  Brain,
  Hand,
  GraduationCap,
  MessageSquare,
} from "lucide-react"
import { useContentStore } from "../store/content-store"
import { isAuthenticated, getCurrentUser, isDoctor } from "../utils/auth-utils"
import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/sidebar.module.css"

const departments = [
  {
    id: "appointments",
    name: "Single Sessions Appointments",
    icon: Calendar,
    items: [{ id: "speech-appointments", name: "All Appointments", type: "appointments" }],
    alwaysShow: true, // Always show appointments regardless of department
  },
  {
    id: "physical-therapy",
    name: "Physical Therapy Students",
    icon: Activity,
    departmentName: "PT",
    items: [
      { id: "physical-therapy-patients", name: "All Students", type: "patients", therapyType: "physical-therapy" },
    ],
  },
  {
    id: "aba",
    name: "ABA Students",
    icon: Brain,
    departmentName: "ABA",
    items: [{ id: "aba-patients", name: "All Students", type: "patients", therapyType: "aba" }],
  },
  {
    id: "occupational-therapy",
    name: "Occupational Therapy Students",
    icon: Hand,
    departmentName: "OT",
    items: [
      {
        id: "occupational-therapy-patients",
        name: "All Students",
        type: "patients",
        therapyType: "occupational-therapy",
      },
    ],
  },
  {
    id: "special-education",
    name: "Special Education Students",
    icon: GraduationCap,
    departmentName: "Special Education",
    items: [
      { id: "special-education-patients", name: "All Students", type: "patients", therapyType: "special-education" },
    ],
  },
  {
    id: "speech",
    name: "Speech Students",
    icon: MessageSquare,
    departmentName: "Speech",
    items: [{ id: "speech-patients", name: "All Students", type: "patients", therapyType: "speech" }],
  },
]

export function AppSidebar() {
  const [openSections, setOpenSections] = useState([])
  const [user, setUser] = useState(null)
  const [doctorDepartments, setDoctorDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const setActiveContent = useContentStore((state) => state.setActiveContent)
  const [activeItem, setActiveItem] = useState(null)

  useEffect(() => {
    if (isAuthenticated()) {
      const currentUser = getCurrentUser()
      setUser(currentUser)
      // If user is a doctor, fetch their assigned departments
      if (currentUser?.role === "doctor") {
        fetchDoctorDepartments(currentUser.id)
      }
    }
  }, [])

  const fetchDoctorDepartments = async (doctorId) => {
    setLoadingDepartments(true)
    try {
      console.log("Fetching departments for doctor:", doctorId)
      // First, get the doctor's information including their departments
      const doctorResponse = await axiosInstance.get(`/authentication/doctor/${doctorId}`)
      const doctorData = doctorResponse.data
      console.log("Doctor data:", doctorData)

      if (doctorData && doctorData.departments && doctorData.departments.length > 0) {
        // Extract department names from the populated departments
        const departmentNames = doctorData.departments.map((dept) => dept.name)
        console.log("Doctor's assigned departments:", departmentNames)
        setDoctorDepartments(departmentNames)
      } else {
        console.log("No departments found for doctor")
        setDoctorDepartments([])
      }
    } catch (error) {
      console.error("Error fetching doctor departments:", error)
      // Fallback: try to get assignments from doctor-student-assignment
      try {
        console.log("Trying fallback method...")
        const assignmentsResponse = await axiosInstance.get(`/doctor-student-assignment/doctor-assignments/${doctorId}`)
        const assignments = assignmentsResponse.data?.assignments || []
        // Extract unique departments from assignments
        const departments = [...new Set(assignments.map((assignment) => assignment.department))]
        console.log("Departments from assignments:", departments)
        setDoctorDepartments(departments)
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError)
        // If all fails, set empty array (show no departments)
        setDoctorDepartments([])
      }
    } finally {
      setLoadingDepartments(false)
    }
  }

  // Helper function to check if doctor is assigned to a department
  const isDoctorAssignedToDepartment = (departmentName) => {
    if (!isDoctor()) return true // Non-doctors see all
    if (loadingDepartments) return true // Show all while loading

    // Map department names to match database values
    const departmentMap = {
      ABA: ["ABA", "Applied Behavior Analysis", "Behavioral Analysis"],
      Speech: ["Speech", "speech", "Speech Therapy", "Speech-Language Pathology"],
      PT: ["PT", "Physical Therapy", "physicalTherapy", "Physiotherapy"],
      OT: ["OT", "Occupational Therapy", "OccupationalTherapy"],
      "Special Education": ["Special Education", "SpecialEducation", "Special Ed", "SPED"],
    }

    // Check if any of the mapped names match the doctor's departments
    return (
      departmentMap[departmentName]?.some((name) =>
        doctorDepartments.some(
          (deptName) =>
            deptName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(deptName.toLowerCase()),
        ),
      ) || false
    )
  }

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => {
      if (prev.includes(sectionId)) {
        return prev.filter((id) => id !== sectionId)
      } else {
        return [...prev, sectionId]
      }
    })
  }

  const handleItemClick = (departmentId, itemType, itemId, therapyType = null) => {
    setActiveContent({
      department: departmentId,
      type: itemType,
      therapyType: therapyType,
    })
    setActiveItem(itemId)
  }

  if (!isAuthenticated()) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.loginPrompt}>
            <User className={styles.loginIcon} />
            <h3>Access Required</h3>
            <p>Please log in to access the Single Sessions System.</p>
          </div>
        </div>
      </div>
    )
  }

  // Filter departments based on user role and doctor department assignments
  const filteredDepartments = departments.filter((department) => {
    // Always show appointments section
    if (department.alwaysShow) {
      return true
    }

    // For doctors, check department assignments
    if (isDoctor() && department.departmentName) {
      return isDoctorAssignedToDepartment(department.departmentName)
    }

    // For non-doctors, show all departments
    return true
  })

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        {user && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <User className={styles.userAvatarIcon} />
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userRole}>{user.role} Dashboard</p>
              {isDoctor() && (
                <p className={styles.userDepartments}>
                  {loadingDepartments ? "Loading..." : `Assigned to ${doctorDepartments.length} Departments`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.sidebarNav}>
        {loadingDepartments && isDoctor() && (
          <div className={styles.loadingMessage}>
            <div className={styles.loadingSpinner}></div>
            <span>Loading your departments...</span>
          </div>
        )}

        {filteredDepartments.map((department) => {
          const isOpen = openSections.includes(department.id)
          return (
            <div key={department.id} className={styles.navSection}>
              <button onClick={() => toggleSection(department.id)} className={styles.sectionHeader}>
                <div className={styles.sectionHeaderContent}>
                  <department.icon className={styles.sectionIcon} />
                  <span className={styles.sectionTitle}>{department.name}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className={styles.expandIcon} />
                ) : (
                  <ChevronRight className={styles.expandIcon} />
                )}
              </button>
              {isOpen && (
                <div className={styles.sectionItems}>
                  {department.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(department.id, item.type, item.id, item.therapyType)}
                      className={`${styles.navItem} ${styles.subNavItem} ${activeItem === item.id ? styles.active : ""}`}
                    >
                      {item.type === "assign-patient" ? (
                        <User className={styles.navIcon} />
                      ) : item.type === "appointments" ? (
                        <Calendar className={styles.navIcon} />
                      ) : (
                        <ClipboardCheck className={styles.navIcon} />
                      )}
                      <span className={styles.navLabel}>{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
