"use client"
import { useState, useEffect } from "react"
import { User, Calendar, ClipboardCheck, ChevronDown, ChevronRight, Users } from "lucide-react"
import { useContentStore } from "../store/content-store"
import { isAuthenticated, getCurrentUser, logout } from "../utils/auth-utils"
import styles from "../styles/sidebar.module.css"

const departments = [
  {
    id: "school-up",
    name: "School Evaluation Appointments Management",
    icon: Calendar,
    items: [{ id: "Up-appointments", name: "All Appointments", type: "appointments" }],
  },
  {
    id: "school-assign",
    name: "Doctor Assignment",
    icon: Users,
    items: [{ id: "assign-doctors", name: "Assign Doctors to Appointments", type: "assign-doctors" }],
    roles: ["admin", "headdoctor"], // Only show for admin and head doctor
  },
  {
    id: "school-p",
    name: "Evaluations sheets Management",
    icon: ClipboardCheck,
    items: [{ id: "School-patients", name: "All Evaluations sheets", type: "patients" }],
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

  const handleItemClick = (departmentId, itemType, itemId) => {
    setActiveContent({
      department: departmentId,
      type: itemType,
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
            <p>Please log in to access the School Evaluation System.</p>
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
              <p className={styles.userId}>School Evaluation System</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.sidebarNav}>
        {departments.map((department) => {
          if (department.roles && !department.roles.includes(user?.role)) {
            return null
          }

          const isOpen = openSections.includes(department.id)
          return (
            <div key={department.id} className={styles.navSection}>
              <>
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
                        onClick={() => handleItemClick(department.id, item.type, item.id)}
                        className={`${styles.navItem} ${styles.subNavItem} ${activeItem === item.id ? styles.active : ""}`}
                      >
                        {item.type === "assign-patient" ? (
                          <User className={styles.navIcon} />
                        ) : item.type === "appointments" ? (
                          <Calendar className={styles.navIcon} />
                        ) : item.type === "assign-doctors" ? (
                          <Users className={styles.navIcon} />
                        ) : (
                          <ClipboardCheck className={styles.navIcon} />
                        )}
                        <span className={styles.navLabel}>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
