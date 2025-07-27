"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import axiosInstance from "../helper/axiosSetup"
import { Icon } from "@iconify/react"
import useSocket from "@/hooks/useSocket"
import { formatDistanceToNow } from "date-fns"
import styles from "./master-layout.module.css"
import Cookies from "js-cookie" // Import js-cookie
import {
  Search,
  Calendar,
  Clock,
  Check,
  User,
  CalendarDays,
  Filter,
  Users,
  Eye,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  CalendarIcon,
  ClockIcon,
  Phone,
  Mail,
} from "lucide-react"
import { notificationsIcons } from "@/utils/assignmentUtils"

const MasterLayout = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [userRole, setUserRole] = useState("")
  const [userName, setUserName] = useState("")
  const pathname = usePathname()
  const [sidebarActive, setSidebarActive] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = usePathname()

  const handleLogout = async () => {
    try {
      await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/logout`)
      localStorage.removeItem("token")
      Cookies.remove("refreshToken") // Clear refresh token cookie
      setUser(null)
      setLoading(true)
      window.location.href = "/sign-in"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // State for notifications
  const [notifications, setNotifications] = useState([])
  const [count, setCount] = useState(0)

  // Call useSocket directly at the top level of the component
  // This adheres to the Rules of Hooks
  useSocket(user?.id, ({ count, notifications }) => {
    setNotifications(notifications)
    setCount(count)
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleDropdownClick = (event) => {
      event.preventDefault()
      const clickedLink = event.currentTarget
      const clickedDropdown = clickedLink.closest(".dropdown")
      if (!clickedDropdown) return

      const isActive = clickedDropdown.classList.contains("open")
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown")
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open")
        const submenu = dropdown.querySelector(".sidebar-submenu")
        if (submenu) {
          submenu.style.maxHeight = "0px"
        }
      })

      if (!isActive) {
        clickedDropdown.classList.add("open")
        const submenu = clickedDropdown.querySelector(".sidebar-submenu")
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`
        }
      }
    }

    const dropdownTriggers = document.querySelectorAll(".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link")
    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick)
    })

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown")
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a")
        submenuLinks.forEach((link) => {
          if (link.getAttribute("href") === location || link.getAttribute("to") === location) {
            dropdown.classList.add("open")
            const submenu = dropdown.querySelector(".sidebar-submenu")
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`
            }
          }
        })
      })
    }

    openActiveDropdown()

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles.dropdownContainer}`)) {
        setIsNotificationOpen(false)
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)

    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick)
      })
      document.removeEventListener("click", handleClickOutside)
    }
  }, [location])

  const sidebarControl = () => {
    setSidebarActive(!sidebarActive)
  }

  const mobileMenuControl = () => {
    setMobileMenu(!mobileMenu)
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setLoading(false)
          return
        }

        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const userData = response.data
        setUser(userData)
        setUserRole(userData.role)
        setUserName(userData.name)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setLoading(false)
        if (error.response && error.response.status === 403) {
          try {
            const refreshResponse = await axiosInstance.post(
              `${process.env.NEXT_PUBLIC_API_URL}/authentication/refresh`,
              {},
              {
                withCredentials: true,
              },
            )
            const newAccessToken = refreshResponse.data.accessToken
            localStorage.setItem("token", newAccessToken)

            const retryResponse = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`, {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            })

            const userData = retryResponse.data
            setUser(userData)
            setUserRole(userData.role)
            setUserName(userData.name)
          } catch (refreshError) {
            console.error("Refresh token failed:", refreshError)
            window.location.href = "/sign-in"
          }
        }
      }
    }

    fetchUserData()
  }, [])

  const getNotifications = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/notification/byId/${user?.id}`)
      setNotifications(response.data.notifications || [])
      setCount(response.data.count || 0)
      console.log("Fetched notifications:", response.data.notifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    getNotifications()
  }, [user?.id])

  const notificationClick = async (noteId) => {
    try {
      axiosInstance.put(`${process.env.NEXT_PUBLIC_API_URL}/notification/read/${noteId}`).then((response) => {
        getNotifications()
        console.log("Notification marked as read:", response.data)
      })
    } catch (error) {
      console.error("Error handling notification click:", error)
    }
  }

  let profileLink = ""
  if (userRole === "patient") {
    profileLink = "/profile"
  } else if (userRole === "doctor") {
    profileLink = "/profile-doctor"
  } else if (userRole === "accountant") {
    profileLink = "/profile-accountant"
  }

  const toggleNotifications = (e) => {
    e.stopPropagation()
    setIsNotificationOpen(!isNotificationOpen)
    setIsProfileOpen(false)
  }

  const toggleProfile = (e) => {
    e.stopPropagation()
    setIsProfileOpen(!isProfileOpen)
    setIsNotificationOpen(false)
  }

  return (
    <section className={mobileMenu ? `${styles.overlay} ${styles.active}` : styles.overlay}>
      {/* Sidebar */}
      <aside
        className={
          sidebarActive
            ? `${styles.sidebar} ${styles.active}`
            : mobileMenu
              ? `${styles.sidebar} ${styles.sidebarOpen}`
              : styles.sidebar
        }
      >
        <button onClick={mobileMenuControl} type="button" className={styles.sidebarCloseBtn}>
          <Icon icon="radix-icons:cross-2" />
        </button>
        <div>
          <Link href="/" className={styles.sidebarLogo}>
            <div className={styles.logoIcon}>
              <Icon icon="medical-icon:i-rehabilitation" />
            </div>
            <div className={styles.logoText}>
              <div className={styles.logoTitle}>Rukn Alwatikon</div>
              <div className={styles.logoSubtitle}>Rehabilitation Center</div>
            </div>
          </Link>
        </div>
        <div className={styles.sidebarMenuArea}>
          <ul className={styles.sidebarMenu} id="sidebar-menu">
            <li className={styles.sidebarMenuGroupTitle}>Home</li>
            <li>
              <Link href="/" className={pathname === "/" ? styles.activePage : ""}>
                <Icon icon="solar:home-smile-angle-outline" className={styles.menuIcon} />
                <span>Statistics</span>
              </Link>
            </li>
            <li className={styles.sidebarMenuGroupTitle}>All Programs</li>
            <li>
              <Link href="/full-program" className={pathname === "/full-program" ? styles.activePage : ""}>
                <Icon icon="healthicons:rehabilitation" className={styles.menuIcon} />
                <span>Full Programs</span>
              </Link>
            </li>
            <li>
              <Link href="/single-session" className={pathname === "/single-session" ? styles.activePage : ""}>
                <Icon icon="healthicons:health-worker-form" className={styles.menuIcon} />
                <span>Single Programs</span>
              </Link>
            </li>
            <li>
              <Link href="/school" className={pathname === "/school" ? styles.activePage : ""}>
                <Icon icon="healthicons:school" className={styles.menuIcon} />
                <span>School Evaluations</span>
              </Link>
            </li>
            <li>
              <Link href="/Admin-Book-Appointment" className={pathname === "/Admin-Book-Appointment" ? styles.activePage : ""}>
                <Icon icon="healthicons:ui-user-profile" className={styles.menuIcon} />
                <span>Book New Appointment</span>
              </Link>
            </li>
            <li className={styles.sidebarMenuGroupTitle}>Full Program Schedule</li>
            <li>
              <Link href="/calendar-main" className={pathname === "/calendar-main" ? styles.activePage : ""}>
                <Icon icon="solar:calendar-outline" className={styles.menuIcon} />
                <span>Show Schedule</span>
              </Link>
            </li>
            <li>
              <Link
                href="/full-program-appointments"
                className={pathname === "/full-program-appointments" ? styles.activePage : ""}
              >
                <Icon icon="healthicons:appointments" className={styles.menuIcon} />
                <span>Update Schedule</span>
              </Link>
            </li>
            <li className={styles.sidebarMenuGroupTitle}>All Users</li>
            <li>
              <Link href="/student/list" className={pathname === "/student/list" ? styles.activePage : ""}>
                <Icon icon="healthicons:group-discussion-meetingx3" className={styles.menuIcon} />
                <span>All Students</span>
              </Link>
            </li>
            <li>
              <Link href="/doctor/list" className={pathname === "/doctor/list" ? styles.activePage : ""}>
                <Icon icon="healthicons:health-worker" className={styles.menuIcon} />
                <span>All Doctors</span>
              </Link>
            </li>
            <li>
              <Link href="/accountant/list" className={pathname === "/accountant/list" ? styles.activePage : ""}>
                <Icon icon="healthicons:money-bag" className={styles.menuIcon} />
                <span>All Accountants</span>
              </Link>
            </li>
            <li>
              <Link href="/department-list" className={pathname === "/department-list" ? styles.activePage : ""}>
                <Icon icon="healthicons:hospital" className={styles.menuIcon} />
                <span>All Departments</span>
              </Link>
            </li>
            <li className={styles.sidebarMenuGroupTitle}>Payment Reports</li>
            <li>
              <Link
                href="/Payment-Transactions"
                className={pathname === "/Payment-Transactions" ? styles.activePage : ""}
              >
                <Icon icon="healthicons:money-bag" className={styles.menuIcon} />
                <span>Payment Management System</span>
              </Link>
            </li>
            <li>
              <Link href="/table-data" className={pathname === "/table-data" ? styles.activePage : ""}>
                <Icon icon="healthicons:credit-card" className={styles.menuIcon} />
                <span>Checks Management System</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      <main className={sidebarActive ? `${styles.dashboardMain} ${styles.active}` : styles.dashboardMain}>
        <div className={styles.navbarHeader}>
          <div className={`${styles.row} ${styles.alignItemsCenter} ${styles.justifyContentBetween}`}>
            <div className={styles.colAuto}>
              <div className={`${styles.dFlex} ${styles.flexWrap} ${styles.alignItemsCenter} ${styles.gap4}`}>
                <button type="button" className={styles.sidebarToggle} onClick={sidebarControl}>
                  {sidebarActive ? (
                    <Icon icon="iconoir:arrow-right" className={`${styles.text2xl}`} />
                  ) : (
                    <Icon icon="heroicons:bars-3-solid" className={`${styles.text2xl}`} />
                  )}
                </button>
                <button onClick={mobileMenuControl} type="button" className={styles.sidebarMobileToggle}>
                  <Icon icon="heroicons:bars-3-solid" className={styles.textXl} />
                </button>
              </div>
            </div>
            <div className={styles.colAuto}>
              <div className={`${styles.dFlex} ${styles.flexWrap} ${styles.alignItemsCenter} ${styles.gap3}`}>
                {/* Notification Dropdown */}
                <div className={styles.dropdownContainer}>
                  <button
                    className={`${styles.hasIndicator} ${styles.w44px} ${styles.h44px} ${styles.dFlex} ${styles.justifyContentCenter} ${styles.alignItemsCenter} ${styles.positionRelative}`}
                    type="button"
                    onClick={toggleNotifications}
                    title="Notifications"
                  >
                    <Icon icon="healthicons:alert" className={`${styles.textPrimaryLight} ${styles.textXl}`} />
                    {count > 0 && (
                      <span className={styles.notificationBadge}>
                        {count > 10 ? "10+" : count}
                        <span className={styles.visuallyHidden}>unread messages</span>
                      </span>
                    )}
                  </button>
                  <div
                    className={`${styles.dropdownMenu} ${styles.dropdownMenuLg} ${isNotificationOpen ? styles.show : ""}`}
                  >
                    <div className={styles.notificationHeader}>
                      <div>
                        <h6 className={styles.notificationTitle}>Notifications</h6>
                      </div>
                      <span className={styles.notificationCount}>{notifications.length}</span>
                    </div>
                    <div className={styles.notificationList}>
                      {notifications?.length > 0 ? (
                        notifications.map((item) => (
                          <div
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (!item.isRead) {
                                notificationClick(item._id)
                              }
                            }}
                            key={item._id}
                            className={styles.notificationItem}
                          >
                            <div className={styles.notificationContent}>
                              <span className={`${styles.positionRelative} ${styles.notificationIcon}`}>
                                <Icon icon={notificationsIcons[item?.type]} className={styles.textXxl} />
                                {!item.isRead && <span className={styles.unreadDot} />}
                              </span>
                              <div className={styles.notificationText}>
                                <h6 className={`${styles.textMd} ${styles.fwSemibold} ${styles.mb4}`}>{item.title}</h6>
                                <p className={`${styles.mb0} ${styles.textSm} ${styles.textSecondaryLight}`}>
                                  {item.message}
                                </p>
                              </div>
                            </div>
                            <span className={`${styles.textSm} ${styles.notificationTime}`}>
                              {formatDistanceToNow(new Date(item.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className={`${styles.notificationItem} ${styles.textSecondaryLight}`}>
                          <div className={styles.notificationContent}>
                            <Icon icon="healthicons:alert-triangle" className={styles.textXl} />
                            <span>No notifications available</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Dropdown */}
                <div className={styles.dropdownContainer}>
                  <button
                    className={`${styles.profileDropdownBtn} ${styles.roundedCircle}`}
                    type="button"
                    onClick={toggleProfile}
                    title="Profile"
                  >
                    <Icon
                      icon="healthicons:ui-user-profile"
                      className={`${styles.w40px} ${styles.h40px} ${styles.textPrimaryLight}`}
                    />
                  </button>
                  <div
                    className={`${styles.dropdownMenu} ${styles.dropdownMenuSm} ${isProfileOpen ? styles.show : ""}`}
                  >
                    <div className={styles.profileHeader}>
                      <div className={styles.profileInfo}>
                        <h6 className={`${styles.textLg} ${styles.fwSemibold} ${styles.mb2}`}>
                          {userName || "Loading..."}
                        </h6>
                        <span className={`${styles.textSecondaryLight} ${styles.fwMedium} ${styles.textSm}`}>
                          {userRole || "Loading..."}
                        </span>
                      </div>
                      <button type="button" className={styles.profileCloseBtn} onClick={() => setIsProfileOpen(false)}>
                        <Icon icon="radix-icons:cross-1" className={styles.textXl} />
                      </button>
                    </div>
                    <ul className={styles.profileMenuList}>
                      {user && userRole !== "admin" && (
                        <li className={styles.profileMenuItem}>
                          <Link href={profileLink} className={styles.profileMenuLink}>
                            <Icon icon="healthicons:ui-user-profile" className={styles.textXl} />
                            My Profile
                          </Link>
                        </li>
                      )}
                      <li className={styles.profileMenuItem}>
                        {!user ? (
                          <Link href="/sign-in" className={styles.profileMenuLink}>
                            <Icon icon="healthicons:door-open" className={styles.textXl} />
                            Login
                          </Link>
                        ) : (
                          <Link href="#" className={styles.profileMenuLink} onClick={handleLogout}>
                            <Icon icon="healthicons:door-open" className={styles.textXl} />
                            Log Out
                          </Link>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Main Body */}
        <div className={styles.dashboardMainBody}>{children}</div>

        {/* Footer */}
        <footer className={styles.dFooter}>
          <div className={`${styles.row} ${styles.alignItemsCenter} ${styles.justifyContentBetween}`}>
            <div className={styles.colAuto}>
              <p className={styles.mb0}>© 2025 Rukn Alwatikon Center for Rehabilitation. All Rights Reserved.</p>
            </div>
            
          </div>
        </footer>
      </main>
    </section>
  )
}

export default MasterLayout
