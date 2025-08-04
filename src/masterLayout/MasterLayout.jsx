"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import axiosInstance from "../helper/axiosSetup"
import {
  X,
  ArrowRight,
  Menu,
  Bell,
  User,
  Home,
  Activity,
  FileText,
  GraduationCap,
  UserPlus,
  Calendar,
  CalendarDays,
  Users,
  Stethoscope,
  Calculator,
  Building,
  CreditCard,
  Receipt,
  AlertTriangle,
  Heart,
  DoorOpen,
} from "lucide-react"
import useSocket from "@/hooks/useSocket"
import { formatDistanceToNow } from "date-fns"
import styles from "./master-layout.module.css"
import Cookies from "js-cookie"
import Image from "next/image"
import { notificationsIcons } from "@/utils/assignmentUtils"
import { Icon } from "@iconify/react"


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

  // Header scroll state
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const handleLogout = async () => {
    try {
      await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/logout`)
      localStorage.removeItem("token")
      Cookies.remove("refreshToken")
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
  useSocket(user?.id, ({ count, notifications }) => {
    setNotifications(notifications)
    setCount(count)
  })

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show header when at top of page
      if (currentScrollY === 0) {
        setIsHeaderVisible(true)
      }
      // Hide header when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false)
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [lastScrollY])

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
        setUserName(userData.username)
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
            setUserName(userData.username)
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

  // Helper function to check if user is HeadDoctor
  const isHeadDoctor = userRole === "HeadDoctor"

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
          <X />
        </button>
        <div>
          <Link href="/" className={styles.sidebarLogo}>
            <div className={styles.logoImageContainer}>
              <Image
                src="/images/rukn-logo.png"
                alt="Rukn Alwatikon Rehabilitation Center"
                width={60}
                height={60}
                className={styles.logoImage}
                priority
              />
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
                <Home className={styles.menuIcon} />
                <span>Statistics</span>
              </Link>
            </li>
            <li className={styles.sidebarMenuGroupTitle}>All Programs</li>
            <li>
              <Link href="/full-program" className={pathname === "/full-program" ? styles.activePage : ""}>
                <Activity className={styles.menuIcon} />
                <span>Full Programs</span>
              </Link>
            </li>
            <li>
              <Link href="/single-session" className={pathname === "/single-session" ? styles.activePage : ""}>
                <FileText className={styles.menuIcon} />
                <span>Single Programs</span>
              </Link>
            </li>
            <li>
              <Link href="/school" className={pathname === "/school" ? styles.activePage : ""}>
                <GraduationCap className={styles.menuIcon} />
                <span>School Evaluations</span>
              </Link>
            </li>
            <li>
              <Link
                href="/Admin-Book-Appointment"
                className={pathname === "/Admin-Book-Appointment" ? styles.activePage : ""}
              >
                <UserPlus className={styles.menuIcon} />
                <span>Book New Appointment</span>
              </Link>
            </li>
            <li className={styles.sidebarMenuGroupTitle}>Full Program Schedule</li>
            <li>
              <Link href="/calendar-main" className={pathname === "/calendar-main" ? styles.activePage : ""}>
                <Calendar className={styles.menuIcon} />
                <span>Show Schedule</span>
              </Link>
            </li>
            <li>
              <Link
                href="/full-program-appointments"
                className={pathname === "/full-program-appointments" ? styles.activePage : ""}
              >
                <CalendarDays className={styles.menuIcon} />
                <span>Update Schedule</span>
              </Link>
            </li>
            <li className={styles.sidebarMenuGroupTitle}>All Users</li>
            <li>
              <Link href="/student/list" className={pathname === "/student/list" ? styles.activePage : ""}>
                <Users className={styles.menuIcon} />
                <span>All Students</span>
              </Link>
            </li>
            <li>
              <Link href="/doctor/list" className={pathname === "/doctor/list" ? styles.activePage : ""}>
                <Stethoscope className={styles.menuIcon} />
                <span>All Doctors</span>
              </Link>
            </li>
            {/* Hide "All Accountants" for HeadDoctor */}
            {!isHeadDoctor && (
              <li>
                <Link href="/accountant/list" className={pathname === "/accountant/list" ? styles.activePage : ""}>
                  <Calculator className={styles.menuIcon} />
                  <span>All Accountants</span>
                </Link>
              </li>
            )}
            {/* Hide "All Departments" for HeadDoctor */}
            {!isHeadDoctor && (
              <li>
                <Link href="/department-list" className={pathname === "/department-list" ? styles.activePage : ""}>
                  <Building className={styles.menuIcon} />
                  <span>All Departments</span>
                </Link>
              </li>
            )}
            {/* Hide Payment Reports section for HeadDoctor */}
            {!isHeadDoctor && (
              <>
                <li className={styles.sidebarMenuGroupTitle}>Payment Reports</li>
                <li>
                  <Link
                    href="/Payment-Transactions"
                    className={pathname === "/Payment-Transactions" ? styles.activePage : ""}
                  >
                    <CreditCard className={styles.menuIcon} />
                    <span>Payment Management System</span>
                  </Link>
                </li>
                <li>
                  <Link href="/table-data" className={pathname === "/table-data" ? styles.activePage : ""}>
                    <Receipt className={styles.menuIcon} />
                    <span>Checks Management System</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </aside>

      <main className={sidebarActive ? `${styles.dashboardMain} ${styles.active}` : styles.dashboardMain}>
        <div
          className={`${styles.navbarHeader} ${isHeaderVisible ? styles.headerVisible : styles.headerHidden} ${sidebarActive ? styles.navbarHeaderActive : ""}`}
        >
          <div className={`${styles.row} ${styles.alignItemsCenter} ${styles.justifyContentBetween}`}>
            <div className={styles.colAuto}>
              <div className={`${styles.dFlex} ${styles.flexWrap} ${styles.alignItemsCenter} ${styles.gap4}`}>
                <button type="button" className={styles.sidebarToggle} onClick={sidebarControl}>
                  {sidebarActive ? (
                    <ArrowRight className={`${styles.text2xl}`} />
                  ) : (
                    <Menu className={`${styles.text2xl}`} />
                  )}
                </button>
                <button onClick={mobileMenuControl} type="button" className={styles.sidebarMobileToggle}>
                  <Menu className={styles.textXl} />
                </button>

                {/* Add Header Logo */}
                
              </div>
            </div>

            {/* Centered Header Logo */}
            <div className={styles.headerLogoCenter}>
              <Link href="/" className={styles.headerLogo}>
                <div className={styles.headerLogoImageContainer}>
                  <Image
                    src="/images/rukn-logo.png"
                    alt="Rukn Alwatikon Rehabilitation Center"
                    width={50}
                    height={50}
                    className={styles.headerLogoImage}
                    priority
                  />
                </div>
              </Link>
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
                    <Bell className={`${styles.textPrimaryLight} ${styles.textXl}`} />
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
                            <AlertTriangle className={styles.textXl} />
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
                    <User className={`${styles.w40px} ${styles.h40px} ${styles.textPrimaryLight}`} />
                  </button>
                  <div
                    className={`${styles.dropdownMenu} ${styles.dropdownMenuSm} ${isProfileOpen ? styles.show : ""}`}
                  >
                    <div className={styles.profileHeader}>
                      <div className={styles.profileInfo}>
                        <h6 className={`${styles.textLg} ${styles.fwSemibold} ${styles.mb2}`}>
                          {userName || "Loading..."}
                        </h6>
                        <span className={` ${styles.fwLarg} ${styles.textMd}`}>
                          <b className={` ${styles.fwLarg} ${styles.textSm}`}>Role:</b> {userRole || "Loading..."}
                        </span>
                      </div>
                      <button type="button" className={styles.profileCloseBtn} onClick={() => setIsProfileOpen(false)}>
                        <X className={styles.textXl} />
                      </button>
                    </div>
                    <ul className={styles.profileMenuList}>
                      {user && userRole !== "admin" && (
                        <li className={styles.profileMenuItem}>
                          <Link href={profileLink} className={styles.profileMenuLink}>
                            <User className={styles.textXl} />
                            My Profile
                          </Link>
                        </li>
                      )}
                      <li className={styles.profileMenuItem}>
                        {!user ? (
                          <Link href="/sign-in" className={styles.profileMenuLink}>
                            <DoorOpen className={styles.textXl} />
                            Login
                          </Link>
                        ) : (
                          <Link href="#" className={styles.profileMenuLink} onClick={handleLogout}>
                            <DoorOpen className={styles.textXl} />
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
              <p className={styles.mb0}>© 2025 Rukn Alwatikon Center for Rehabilitation people of determination. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </section>
  )
}

export default MasterLayout
