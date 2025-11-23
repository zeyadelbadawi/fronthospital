"use client"
import { useState, useEffect } from "react"
import { Home, Users, Brain, MessageSquare, Activity, Palette, BookOpen, Settings, ChevronDown, ChevronRight, User, Shield, Calendar, DollarSign, FileText, Sparkle } from 'lucide-react'
import { isAuthenticated, getCurrentUser } from "../utils/auth-utils"
import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/sidebar.module.css"

const AppSidebarUpdated = ({ onContentChange }) => {
  const [activeItem, setActiveItem] = useState("dashboard")
  const [user, setUser] = useState(null)
  const [doctorDepartments, setDoctorDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    aba: true,
    speech: false,
    pt: false,
    ot: false,
    se: false,
    Psychotherapy: false,
  })

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
      // First, get the doctor's information including their departments
      const doctorResponse = await axiosInstance.get(`/authentication/doctor/${doctorId}`)
      const doctorData = doctorResponse.data

      if (doctorData && doctorData.departments && doctorData.departments.length > 0) {
        // Extract department names from the populated departments
        const departmentNames = doctorData.departments.map((dept) => dept.name)
        setDoctorDepartments(departmentNames)
      } else {
        setDoctorDepartments([])
      }
    } catch (error) {
      console.error("Error fetching doctor departments:", error)
      // Fallback: try to get assignments from doctor-student-assignment
      try {
        const assignmentsResponse = await axiosInstance.get(`/doctor-student-assignment/doctor-assignments/${doctorId}`)
        const assignments = assignmentsResponse.data?.assignments || []
        // Extract unique departments from assignments
        const departments = [...new Set(assignments.map((assignment) => assignment.department))]
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

  const handleItemClick = (itemId, content) => {
    setActiveItem(itemId)
    onContentChange(content)
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  if (!isAuthenticated()) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.loginPrompt}>
            <Shield className={styles.loginIcon} />
            <h3>Access Required</h3>
            <p>Please log in to access the healthcare management system.</p>
          </div>
        </div>
      </div>
    )
  }

  // Helper function to check if doctor is assigned to a department
  const isDoctorAssignedToDepartment = (departmentName) => {
    if (user?.role !== "doctor") return true // Non-doctors see all
    if (loadingDepartments) return true // Show all while loading
    // Map department names to match database values
    const departmentMap = {
      ABA: ["ABA", "Applied Behavior Analysis", "Behavioral Analysis"],
      Speech: ["Speech", "speech", "Speech Therapy", "Speech-Language Pathology"],
      PT: ["PT", "Physical Therapy", "physicalTherapy", "Physiotherapy"],
      Psychotherapy: ["Psychotherapy", "psychotherapy", "Psycho therapy"],

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

  const menuSections = [
    {
      id: "main",
      title: "Main",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: Home,
          content: "dashboard",
          roles: ["admin", "doctor", "accountant"],
        },
        {
          id: "doctor-appointments",
          label: "Evaluation Appointments",
          icon: Calendar,
          content: "doctor-appointments",
          roles: ["admin"],
        },
        {
          id: "accountant-appointments",
          label: "Program Payments",
          icon: DollarSign,
          content: "accountant-appointments",
          roles: ["admin", "accountant"],
        },
        {
          id: "edit-departments",
          label: "Edit Student Departments",
          icon: Settings,
          content: "edit-departments",
          roles: ["admin", "headdoctor"],
        },
      ],
    },
    {
      id: "aba",
      title: "ABA Department",
      icon: Brain,
      expandable: true,
      expanded: expandedSections.aba,
      roles: ["admin", "doctor"],
      departmentName: "ABA",
      items: [
        {
          id: "all-patients-aba",
          label: "All ABA Students",
          icon: Users,
          content: "all-patients-aba",
          roles: ["admin"],
        },
        {
          id: "assign-patients-aba",
          label: "My ABA Students",
          icon: User,
          content: "assign-patients-aba",
          roles: ["doctor"],
        },
        // {
        //   id: "doctor-plan-aba", // Added Plans for ABA
        //   label: "Current Plan",
        //   icon: FileText,
        //   content: "doctor-plan-aba",
        //   roles: ["doctor"],
        // },

        {
          id: "admin-assign-aba",
          label: "Assign Student to Doctor",
          icon: Settings,
          content: "admin-assign-aba",
          roles: ["admin"],
        },

      ],
    },
    {
      id: "speech",
      title: "Speech Department",
      icon: MessageSquare,
      expandable: true,
      expanded: expandedSections.speech,
      roles: ["admin", "doctor"],
      departmentName: "Speech",
      items: [
        {
          id: "all-patients-speech",
          label: "All Speech Students",
          icon: Users,
          content: "all-patients-speech",
          roles: ["admin"],
        },
        {
          id: "assign-patients-speech",
          label: "My Speech Students",
          icon: User,
          content: "assign-patients-speech",
          roles: ["doctor"],
        },
        // {
        //   id: "doctor-plan-speech", // Added Plans for Speech
        //   label: "Current Plan",
        //   icon: FileText,
        //   content: "doctor-plan-speech",
        //   roles: ["doctor"],
        // },

        {
          id: "admin-assign-speech",
          label: "Assign Student to Doctors",
          icon: Settings,
          content: "admin-assign-speech",
          roles: ["admin"],
        },

      ],
    },
    {
      id: "pt",
      title: "Physical Therapy",
      icon: Activity,
      expandable: true,
      expanded: expandedSections.pt,
      roles: ["admin", "doctor"],
      departmentName: "PT",
      items: [
        {
          id: "all-patients-physical-therapy",
          label: "All PT Students",
          icon: Users,
          content: "all-patients-physical-therapy",
          roles: ["admin"],
        },
        {
          id: "assign-patients-physical-therapy",
          label: "My PT Students",
          icon: User,
          content: "assign-patients-physical-therapy",
          roles: ["doctor"],
        },
        // {
        //   id: "doctor-plan-physical-therapy", // Added Plans for Physical Therapy
        //   label: "Current Plan",
        //   icon: FileText,
        //   content: "doctor-plan-physical-therapy",
        //   roles: ["doctor"],
        // },

        {
          id: "admin-assign-physical-therapy",
          label: "Assign Student to Doctors",
          icon: Settings,
          content: "admin-assign-physical-therapy",
          roles: ["admin"],
        },

      ],
    },
    {
      id: "Psychotherapy",
      title: "Psychotherapy",
      icon: Sparkle,
      expandable: true,
      expanded: expandedSections.Psychotherapy,
      roles: ["admin", "doctor"],
      departmentName: "Psychotherapy",
      items: [
        {
          id: "all-patients-Psychotherapy",
          label: "All Psychotherapy Students",
          icon: Users,
          content: "all-patients-Psychotherapy",
          roles: ["admin"],
        },
        {
          id: "assign-patients-Psychotherapy",
          label: "My Psychotherapy Students",
          icon: User,
          content: "assign-patients-Psychotherapy",
          roles: ["doctor"],
        },


        {
          id: "admin-assign-Psychotherapy",
          label: "Assign Student to Doctors",
          icon: Settings,
          content: "admin-assign-Psychotherapy",
          roles: ["admin"],
        },

      ],
    },
    {
      id: "ot",
      title: "Occupational Therapy",
      icon: Palette,
      expandable: true,
      expanded: expandedSections.ot,
      roles: ["admin", "doctor"],
      departmentName: "OT",
      items: [
        {
          id: "all-patients-occupational-therapy",
          label: "All OT Students",
          icon: Users,
          content: "all-patients-occupational-therapy",
          roles: ["admin"],
        },
        {
          id: "assign-patients-occupational-therapy",
          label: "My OT Students",
          icon: User,
          content: "assign-patients-occupational-therapy",
          roles: ["doctor"],
        },
        // {
        //   id: "doctor-plan-occupational-therapy", // Added Plans for Occupational Therapy
        //   label: "Current Plan",
        //   icon: FileText,
        //   content: "doctor-plan-occupational-therapy",
        //   roles: ["doctor"],
        // },

        {
          id: "admin-assign-occupational-therapy",
          label: "Assign Student to Doctors",
          icon: Settings,
          content: "admin-assign-occupational-therapy",
          roles: ["admin"],
        },

      ],
    },
    {
      id: "se",
      title: "Special Education",
      icon: BookOpen,
      expandable: true,
      expanded: expandedSections.se,
      roles: ["admin", "doctor"],
      departmentName: "Special Education",
      items: [
        {
          id: "all-patients-special-education",
          label: "All SE Students",
          icon: Users,
          content: "all-patients-special-education",
          roles: ["admin"],
        },
        {
          id: "assign-patients-special-education",
          label: "My SE Students",
          icon: User,
          content: "assign-patients-special-education",
          roles: ["doctor"],
        },
        // {
        //   id: "doctor-plan-special-education", // Added Plans for Special Education
        //   label: "Current Plan",
        //   icon: FileText,
        //   content: "doctor-plan-special-education",
        //   roles: ["doctor"],
        // },

        {
          id: "admin-assign-special-education",
          label: "Assign Student to Doctors",
          icon: Settings,
          content: "admin-assign-special-education",
          roles: ["admin"],
        },

      ],
    },
  ]

  // Filter sections based on user role and doctor department assignments
  const filteredSections = menuSections.filter((section) => {
    // Check role permissions first
    if (section.roles && !section.roles.includes(user?.role)) {
      return false
    }
    // For doctors, also check department assignments
    if (user?.role === "doctor" && section.departmentName) {
      return isDoctorAssignedToDepartment(section.departmentName)
    }
    // For non-department sections or non-doctors, check if any items are accessible
    if (!section.departmentName) {
      return section.items?.some((item) => item.roles.includes(user?.role)) || section.roles?.includes(user?.role)
    }
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
              <p className={styles.userRole}> {user.role} Dashboard</p>
              {user.role === "doctor" && (
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
        {loadingDepartments && user?.role === "doctor" && (
          <div className={styles.loadingMessage}>
            <div className={styles.loadingSpinner}></div>
            <span>Loading your departments...</span>
          </div>
        )}

        {filteredSections.map((section) => (
          <div key={section.id} className={styles.navSection}>
            {section.expandable ? (
              <>
                <button onClick={() => toggleSection(section.id)} className={styles.sectionHeader}>
                  <div className={styles.sectionHeaderContent}>
                    <section.icon className={styles.sectionIcon} />
                    <span className={styles.sectionTitle}>{section.title}</span>
                  </div>
                  {section.expanded ? (
                    <ChevronDown className={styles.expandIcon} />
                  ) : (
                    <ChevronRight className={styles.expandIcon} />
                  )}
                </button>
                {section.expanded && (
                  <div className={styles.sectionItems}>
                    {section.items
                      ?.filter((item) => item.roles.includes(user?.role))
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item.id, item.content)}
                          className={`${styles.navItem} ${styles.subNavItem} ${activeItem === item.id ? styles.active : ""
                            }`}
                        >
                          <item.icon className={styles.navIcon} />
                          <span className={styles.navLabel}>{item.label}</span>
                        </button>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.sectionItems}>
                {section.items
                  ?.filter((item) => item.roles.includes(user?.role))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id, item.content)}
                      className={`${styles.navItem} ${activeItem === item.id ? styles.active : ""}`}
                    >
                      <item.icon className={styles.navIcon} />
                      <span className={styles.navLabel}>{item.label}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}

    </div>
  )
}

export default AppSidebarUpdated
