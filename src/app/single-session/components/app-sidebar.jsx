"use client"
import { useState, useEffect } from "react"
import {
  User,
  Calendar,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  Activity,
  Brain,
  Hand,
  GraduationCap,
  MessageSquare,
} from "lucide-react"
import { useContentStore } from "../store/content-store"
import { isAuthenticated, getCurrentUser, logout } from "../utils/auth-utils"
import styles from "../styles/sidebar.module.css"

const departments = [
  {
    id: "appointments",
    name: "Single Sessions Appointments",
    icon: Calendar,
    items: [{ id: "speech-appointments", name: "All Appointments", type: "appointments" }],
  },
  {
    id: "physical-therapy",
    name: "Physical Therapy Students",
    icon: Activity,
    items: [
      { id: "physical-therapy-patients", name: "All Students", type: "patients", therapyType: "physical-therapy" },
    ],
  },
  {
    id: "aba",
    name: "ABA Students",
    icon: Brain,
    items: [{ id: "aba-patients", name: "All Students", type: "patients", therapyType: "aba" }],
  },
  {
    id: "occupational-therapy",
    name: "Occupational Therapy Students",
    icon: Hand,
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
    items: [
      { id: "special-education-patients", name: "All Students", type: "patients", therapyType: "special-education" },
    ],
  },
  {
    id: "speech",
    name: "Speech Students",
    icon: MessageSquare,
    items: [{ id: "speech-patients", name: "All Students", type: "patients", therapyType: "speech" }],
  },
]

export function AppSidebar() {
  const [openSections, setOpenSections] = useState([])
  const [user, setUser] = useState(null)
  const setActiveContent = useContentStore((state) => state.setActiveContent)
  const [activeItem, setActiveItem] = useState(null)

  useEffect(() => {
    if (isAuthenticated()) {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }
  }, [])

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

  const handleLogout = () => {
    logout()
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
              <p className={styles.userId}>Single Sessions System</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.sidebarNav}>
        {departments.map((department) => {
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

      {/* Logout Button */}
      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut className={styles.logoutIcon} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
