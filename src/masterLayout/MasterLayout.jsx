"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import CustomLink from "@/components/CustomLink" // Changed from Link
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
  CreditCard,
  Receipt,
  AlertTriangle,
  DoorOpen,
  LucideCamera as FileVideoCamera,
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

      const isStaffSubdomain = typeof window !== "undefined" && window.location.hostname.startsWith("stuff.")
      const redirectUrl = isStaffSubdomain
        ? "http://stuff.localhost:3000/sign-in"
        : "http://localhost:3000/clientportal"

      // For production, use the actual domain
      if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
        const domain = window.location.hostname
        const isStaff = domain.startsWith("stuff.")
        const baseDomain = isStaff ? domain : domain
        const protocol = window.location.protocol
        const redirectUrl = isStaff ? `${protocol}//${domain}/sign-in` : `${protocol}//${domain}/clientportal`
        window.location.href = redirectUrl
      } else {
        window.location.href = redirectUrl
      }
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

    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > CustomLink",
    ) // Changed from Link
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
        // Handle both username (for admin/doctor/HeadDoctor) and name (for patient/accountant)
        setUserName(userData.username || userData.name || "")
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
            setUserName(userData.username || userData.name || "")
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

  const mobileMenuControl = () => {
    setMobileMenu(!mobileMenu)
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
          <X />
        </button>
        <div>
          <CustomLink href="/" className={styles.sidebarLogo}>
            {" "}
            {/* Changed to CustomLink */}
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
          </CustomLink>{" "}
          {/* Changed to CustomLink */}
        </div>
        <div className={styles.sidebarMenuArea}>
          <ul className={styles.sidebarMenu} id="sidebar-menu">
            <li className={styles.sidebarMenuGroupTitle}>Home</li>
            <li>
              <CustomLink href="/" className={pathname === "/" ? styles.activePage : ""}>
                {" "}
                {/* Changed to CustomLink */}
                <Home className={styles.menuIcon} />
                <span>Statistics</span>
              </CustomLink>{" "}
              {/* Changed to CustomLink */}
            </li>
            <li className={styles.sidebarMenuGroupTitle}>All Programs</li>
            <li>
              <CustomLink href="/full-program" className={pathname === "/full-program" ? styles.activePage : ""}>
                {" "}
                {/* Changed to CustomLink */}
                <Activity className={styles.menuIcon} />
                <span>Full Programs</span>
              </CustomLink>{" "}
              {/* Changed to CustomLink */}
            </li>
            <li>
              <CustomLink href="/single-session" className={pathname === "/single-session" ? styles.activePage : ""}>
                {" "}
                {/* Changed to CustomLink */}
                <FileText className={styles.menuIcon} />
                <span>Single Programs</span>
              </CustomLink>{" "}
              {/* Changed to CustomLink */}
            </li>
            <li>
              <CustomLink href="/school" className={pathname === "/school" ? styles.activePage : ""}>
                {" "}
                {/* Changed to CustomLink */}
                <GraduationCap className={styles.menuIcon} />
                <span>School Evaluations</span>
              </CustomLink>{" "}
              {/* Changed to CustomLink */}
            </li>
            <li>
              <CustomLink
                href="/Admin-Book-Appointment"
                className={pathname === "/Admin-Book-Appointment" ? styles.activePage : ""}
              >
                {" "}
                {/* Changed to CustomLink */}
                <UserPlus className={styles.menuIcon} />
                <span>Book New Appointment</span>
              </CustomLink>{" "}
              {/* Changed to CustomLink */}
            </li>
            <li className={styles.sidebarMenuGroupTitle}>Full Program Schedule</li>
            <li>
              <CustomLink href="/calendar-main" className={pathname === "/calendar-main" ? styles.activePage : ""}>
                {" "}
                {/* Changed to CustomLink */}
                <Calendar className={styles.menuIcon} />
                <span>Show Schedule</span>
              </CustomLink>{" "}
              {/* Changed to CustomLink */}
            </li>
            <li>
              <CustomLink
                href="/full-program-appointments"
                className={pathname === "/full-program-appointments" ? styles.activePage : ""}
              >
                {" "}
                {/* Changed to CustomLink */}
                <CalendarDays className={styles.menuIcon} />
                <span>Update Schedule</span>
              </CustomLink>{" "}
              {/* Changed to CustomLink */}
            </li>
            <li className={styles.sidebarMenuGroupTitle}>All Users</li>
            <li>
              <CustomLink href="/student/list" className={pathname === "/student/list" ? styles.activePage : ""}>
                {" "}
                {/* Changed to CustomLink */}
                <Users className={styles.menuIcon} />
                <span>All Students</span>
              </CustomLink>{" "}
              {/* Changed to CustomLink */}
            </li>
            <li>
              <CustomLink href="/drive-link" className={pathname === "/drive-link" ? styles.activePage : ""}>
                {" "}
                {/* Changed to CustomLink */}
                <FileVideoCamera className={styles.menuIcon} />
                <span>Student Media</span>
              </CustomLink>{" "}
              {/* Changed to CustomLink */}
            </li>
            <li>
              <CustomLink href="/doctor/list" className={pathname === "/doctor/list" ? styles.activePage : ""}>
                {" "}
                {/* Changed to CustomLink */}
                <Stethoscope className={styles.menuIcon} />
                <span>All Doctors</span>
              </CustomLink>{" "}
              {/* Changed to CustomLink */}
            </li>
            {/* Hide "All Accountants" for HeadDoctor */}
            {!isHeadDoctor && (
              <li>
                <CustomLink
                  href="/accountant/list"
                  className={pathname === "/accountant/list" ? styles.activePage : ""}
                >
                  {" "}
                  {/* Changed to CustomLink */}
                  <Calculator className={styles.menuIcon} />
                  <span>All Accountants</span>
                </CustomLink>{" "}
                {/* Changed to CustomLink */}
              </li>
            )}

            {/* Hide Payment Reports section for HeadDoctor */}
            {!isHeadDoctor && (
              <>
                <li className={styles.sidebarMenuGroupTitle}>Payment Reports</li>
                <li>
                  <CustomLink
                    href="/Payment-Transactions"
                    className={pathname === "/Payment-Transactions" ? styles.activePage : ""}
                  >
                    {" "}
                    {/* Changed to CustomLink */}
                    <CreditCard className={styles.menuIcon} />
                    <span>Payment Management System</span>
                  </CustomLink>{" "}
                  {/* Changed to CustomLink */}
                </li>
                <li>
                  <CustomLink href="/checks" className={pathname === "/checks" ? styles.activePage : ""}>
                    {" "}
                    {/* Changed to CustomLink */}
                    <Receipt className={styles.menuIcon} />
                    <span>Checks Management System</span>
                  </CustomLink>{" "}
                  {/* Changed to CustomLink */}
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
                {!loading && userRole !== "doctor" && (
                  <button
                    type="button"
                    className={styles.sidebarToggle}
                    onClick={() => setSidebarActive(!sidebarActive)}
                  >
                    {sidebarActive ? (
                      <ArrowRight className={`${styles.text2xl}`} />
                    ) : (
                      <Menu className={`${styles.text2xl}`} />
                    )}
                  </button>
                )}
                <button onClick={mobileMenuControl} type="button" className={styles.sidebarMobileToggle}>
                  <Menu className={styles.textXl} />
                </button>

                {/* Add Header Logo */}
              </div>
            </div>

            {/* Centered Header Logo */}
            <div className={styles.headerLogoCenter}>
              <CustomLink href="/" className={styles.headerLogo}>
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
              </CustomLink>
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
                        notifications.slice(0, 7).map((item) => (
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
                    {notifications?.length > 7 && (
                      <CustomLink href="/notifications" className={styles.viewAllNotifications}>
                        Show All Notifications
                      </CustomLink>
                    )}
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
                    {user && (userRole === "admin" || userRole === "HeadDoctor") && (
                      <div className={styles.profileHeader}>
                        <div className={styles.profileInfo}>
                          <h6 className={`${styles.textLg} ${styles.fwSemibold} ${styles.mb2}`}>
                            {userName || "Loading..."}
                          </h6>
                          <span className={`${styles.fwLarg} ${styles.textMd}`}>
                            <b className={`${styles.fwLarg} ${styles.textSm}`}>Role:</b> {userRole || "Loading..."}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={styles.profileCloseBtn}
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <X className={styles.textXl} />
                        </button>
                      </div>
                    )}
                    <ul className={styles.profileMenuList}>
                      {user && userRole !== "admin" && (
                        <li className={styles.profileMenuItem}>
                          <CustomLink href={profileLink} className={styles.profileMenuLink}>
                            {" "}
                            {/* Changed to CustomLink */}
                            <User className={styles.textXl} />
                            My Profile
                          </CustomLink>
                        </li>
                      )}
                      <li className={styles.profileMenuItem}>
                        {!user ? (
                          <CustomLink href="/sign-in" className={styles.profileMenuLink}>
                            {" "}
                            {/* Changed to CustomLink */}
                            <DoorOpen className={styles.textXl} />
                            Login
                          </CustomLink>
                        ) : (
                          <CustomLink href="#" className={styles.profileMenuLink} onClick={handleLogout}>
                            {" "}
                            {/* Changed to CustomLink */}
                            <DoorOpen className={styles.textXl} />
                            Log Out
                          </CustomLink>
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
              <p className={styles.mb0}>
                © 2025 Rukn Alwatikon Center for Rehabilitation people of determination. All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </section>
  )
}

export default MasterLayout
