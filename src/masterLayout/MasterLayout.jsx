"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import ThemeToggleButton from "../helper/ThemeToggleButton"
import Link from "next/link"
import axiosInstance from "../helper/axiosSetup"
import { Icon } from "@iconify/react"
import useSocket from "@/hooks/useSocket"
import { formatDistanceToNow } from "date-fns"

const MasterLayout = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isClick, setIsClick] = useState(false)
  const [userRole, setUserRole] = useState("")
  const [userName, setUserName] = useState("")
  const pathname = usePathname()
  const [sidebarActive, seSidebarActive] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = usePathname()

  const handleLogout = async () => {
    try {
      await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/logout`)
      localStorage.removeItem("token")
      setUser(null)
      setLoading(true)
      window.location.href = "/sign-in"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

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

    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick)
      })
    }
  }, [location])

  const sidebarControl = () => {
    seSidebarActive(!sidebarActive)
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

  const [notifications, setNotifications] = useState([])
  const [count, setCount] = useState(0)

  useSocket(user?.id, ({ count, notifications }) => {
    setNotifications(notifications)
    setCount(count)
  })

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

  let profileLink = " "
  if (userRole === "patient") {
    profileLink = "/profile"
  } else if (userRole === "doctor") {
    profileLink = "/profile-doctor"
  } else if (userRole === "accountant") {
    profileLink = "/profile-accountant"
  }

  const handleProfileRedirect = () => {
    if (userRole === "patient") {
      window.location.href = "/profile"
    } else if (userRole === "doctor") {
      window.location.href = "/profile-doctor"
    } else if (userRole === "accountant") {
      window.location.href = "/profile-accountant"
    }
  }

  return (
    <>
      <style jsx global>{`
        /* Modern Master Layout Styles */
        .overlay {
          position: relative;
          min-height: 100vh;
          background: #f8fafc;
        }

        .overlay.active::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        /* Modern Sidebar */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transform: translateX(-100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          overflow-y: auto;
        }

        .sidebar.active,
        .sidebar.sidebar-open {
          transform: translateX(0);
        }

        .sidebar-close-btn {
          display: none;
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          border: none;
          background: #f1f5f9;
          border-radius: 8px;
          color: #64748b;
          font-size: 18px;
          cursor: pointer;
          z-index: 1001;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          text-decoration: none;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .sidebar-menu-area {
          padding: 1rem 0;
        }

        .sidebar-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar-menu-group-title {
          padding: 0.75rem 1.5rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #3b82f6 !important;
          margin-bottom: 0.5rem;
        }

        .sidebar-menu li {
          margin-bottom: 0.25rem;
        }

        .sidebar-menu a {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          color: #64748b;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
          border-radius: 0;
          position: relative;
        }

        /* Removed hover effect for sidebar menu links */
        .sidebar-menu a.active-page {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #ffffff;
          position: relative;
        }

        .sidebar-menu a.active-page::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #ffffff;
        }

        .menu-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        /* Main Dashboard */
        .dashboard-main {
          margin-left: 0;
          min-height: 100vh;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        .dashboard-main.active {
          margin-left: 280px;
        }

        /* Modern Navbar */
        .navbar-header {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 1rem 1.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .sidebar-toggle,
        .sidebar-mobile-toggle {
          width: 40px;
          height: 40px;
          border: none;
          background: #f8fafc;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-in-out;
        }

        /* Removed hover effects for sidebar toggle buttons */

        .sidebar-mobile-toggle {
          display: none;
        }

        .navbar-search {
          position: relative;
          width: 300px;
        }

        .navbar-search input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          background: #f8fafc;
          transition: all 0.2s ease-in-out;
        }

        .navbar-search input:focus {
          outline: none;
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .navbar-search .icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          width: 18px;
          height: 18px;
        }

        /* Notification Dropdown */
        .has-indicator {
          position: relative;
          width: 40px;
          height: 40px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        /* Removed hover effect for notification button */

        .dropdown-menu {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          padding: 0;
          min-width: 400px;
        }

        .dropdown-menu.show {
          display: block;
        }

        /* Profile Dropdown */
        .dropdown button[data-bs-toggle="dropdown"] {
          width: 40px;
          height: 40px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        /* Removed hover effect for profile dropdown button */

        /* Dashboard Body */
        .dashboard-main-body {
          flex: 1;
          padding: 1.5rem;
          background: #f8fafc;
        }

        /* Footer */
        .d-footer {
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          padding: 1rem 1.5rem;
          margin-top: auto;
        }

        .d-footer p {
          margin: 0;
          font-size: 0.875rem;
          color: #64748b;
        }

        .text-primary-600 {
          color: #3b82f6 !important;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .dashboard-main.active {
            margin-left: 0;
          }
          .navbar-search {
            width: 200px;
          }
        }

        @media (max-width: 768px) {
          .sidebar-close-btn {
            display: flex;
          }
          .sidebar-mobile-toggle {
            display: flex;
          }
          .sidebar-toggle {
            display: none;
          }
          .navbar-search {
            width: 150px;
          }
          .navbar-search input {
            padding: 0.5rem 0.75rem 0.5rem 2rem;
          }
          .dropdown-menu {
            min-width: 300px;
          }
          .dashboard-main-body {
            padding: 1rem;
          }
        }

        @media (max-width: 576px) {
          .navbar-header {
            padding: 0.75rem 1rem;
          }
          .navbar-search {
            display: none;
          }
          .dropdown-menu {
            min-width: 280px;
            left: -250px !important;
          }
        }

        /* Utility Classes */
        .w-40-px { width: 40px; }
        .h-40-px { height: 40px; }
        .w-44-px { width: 44px; }
        .h-44-px { height: 44px; }
        .text-xl { font-size: 1.25rem; }
        .text-xxl { font-size: 1.5rem; }
        .text-2xl { font-size: 1.75rem; }
        .text-lg { font-size: 1.125rem; }
        .text-md { font-size: 1rem; }
        .text-sm { font-size: 0.875rem; }
        .fw-semibold { font-weight: 600; }
        .fw-medium { font-weight: 500; }
        .rounded-circle { border-radius: 50%; }
        .bg-neutral-200 { background-color: #e5e7eb; }
        .bg-primary-50 { background-color: #eff6ff; }
        .bg-success-subtle { background-color: #dcfce7; }
        .text-primary-light { color: #3b82f6; }
        .text-success-main { color: #16a34a; }
        .text-secondary-light { color: #64748b; }
        .text-black { color: #1e293b; }
        .bg-danger { background-color: #dc2626; }
        .bg-base { background-color: #ffffff; }
        .cursor-pointer { cursor: pointer; }
        .position-relative { position: relative; }
        .position-absolute { position: absolute; }
        .d-flex { display: flex; }
        .align-items-center { align-items: center; }
        .justify-content-center { justify-content: center; }
        .justify-content-between { justify-content: space-between; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        .mb-0 { margin-bottom: 0; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-16 { margin-bottom: 1rem; }
        .py-8 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-12 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .px-0 { padding-left: 0; padding-right: 0; }
        .px-16 { padding-left: 1rem; padding-right: 1rem; }
        .px-24 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .m-16 { margin: 1rem; }
        .pe-4 { padding-right: 1rem; }
        .radius-8 { border-radius: 8px; }
        .max-h-400-px { max-height: 400px; }
        .overflow-y-scroll { overflow-y: auto; }
        .flex-shrink-0 { flex-shrink: 0; }
        .zindex-100 { z-index: 100; }
        .top-2 { top: 0.5rem; }
        .start-100 { left: 100%; }
        .translate-middle { transform: translate(-50%, -50%); }
        .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `}</style>

      <section className={mobileMenu ? "overlay active" : "overlay"}>
        {/* Sidebar */}
        <aside className={sidebarActive ? "sidebar active" : mobileMenu ? "sidebar sidebar-open" : "sidebar"}>
          <button onClick={mobileMenuControl} type="button" className="sidebar-close-btn">
            <Icon icon="radix-icons:cross-2" />
          </button>

          <div>
            <Link href="/" className="sidebar-logo">
              🏥 Medical Center
            </Link>
          </div>

          <div className="sidebar-menu-area">
            <ul className="sidebar-menu" id="sidebar-menu">
              <li className="sidebar-menu-group-title">Home</li>
              <li>
                <Link href="/" className={pathname === "/" ? "active-page" : ""}>
                  <Icon icon="solar:home-smile-angle-outline" className="menu-icon" />
                  <span>Statistics</span>
                </Link>
              </li>

              <li className="sidebar-menu-group-title">All Programs</li>
              <li>
                <Link href="/full-program" className={pathname === "/full-program" ? "active-page" : ""}>
                  <Icon icon="bi:chat-dots" className="menu-icon" />
                  <span>Full Programs</span>
                </Link>
              </li>
              <li>
                <Link href="/single-session" className={pathname === "/single-session" ? "active-page" : ""}>
                  <Icon icon="bi:chat-dots" className="menu-icon" />
                  <span>Single Programs</span>
                </Link>
              </li>
              <li>
                <Link href="/school" className={pathname === "/school" ? "active-page" : ""}>
                  <Icon icon="bi:chat-dots" className="menu-icon" />
                  <span>School Evaluations</span>
                </Link>
              </li>
              <li>
                <Link href="/profile-dashboard" className={pathname === "/profile-dashboard" ? "active-page" : ""}>
                  <Icon icon="mage:email" className="menu-icon" />
                  <span>Students Profile</span>
                </Link>
              </li>

              <li className="sidebar-menu-group-title">Full Program Schedule</li>
              <li>
                <Link href="/calendar-main" className={pathname === "/calendar-main" ? "active-page" : ""}>
                  <Icon icon="solar:calendar-outline" className="menu-icon" />
                  <span>Show Schedule</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/full-program-appointments"
                  className={pathname === "/full-program-appointments" ? "active-page" : ""}
                >
                  <Icon icon="bi:chat-dots" className="menu-icon" />
                  <span>Update Schedule</span>
                </Link>
              </li>

              <li className="sidebar-menu-group-title">All Users</li>
              <li>
                <Link href="/users-list" className={pathname === "/users-list" ? "active-page" : ""}>
                  <Icon icon="hugeicons:student" className="menu-icon" />
                  <span>All Students</span>
                </Link>
              </li>
              <li>
                <Link href="/doctor-list" className={pathname === "/doctor-list" ? "active-page" : ""}>
                  <Icon icon="bi:chat-dots" className="menu-icon" />
                  <span>All Doctors</span>
                </Link>
              </li>
              <li>
                <Link href="/accountant-list" className={pathname === "/accountant-list" ? "active-page" : ""}>
                  <Icon icon="bi:chat-dots" className="menu-icon" />
                  <span>All Accountants</span>
                </Link>
              </li>
              <li>
                <Link href="/department-list" className={pathname === "/department-list" ? "active-page" : ""}>
                  <Icon icon="bi:chat-dots" className="menu-icon" />
                  <span>All Departments</span>
                </Link>
              </li>

              <li className="sidebar-menu-group-title">Payment Reports</li>
              <li>
                <Link
                  href="/Payment-Transactions"
                  className={pathname === "/Payment-Transactions" ? "active-page" : ""}
                >
                  <Icon icon="bi:chat-dots" className="menu-icon" />
                  <span>Payment Management System</span>
                </Link>
              </li>
              <li>
                <Link href="/table-data" className={pathname === "/table-data" ? "active-page" : ""}>
                  <Icon icon="bi:chat-dots" className="menu-icon" />
                  <span>Checks Management System</span>
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        <main className={sidebarActive ? "dashboard-main active" : "dashboard-main"}>
          <div className="navbar-header">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
                <div className="d-flex flex-wrap align-items-center gap-4">
                  <button type="button" className="sidebar-toggle" onClick={sidebarControl}>
                    {sidebarActive ? (
                      <Icon icon="iconoir:arrow-right" className="icon text-2xl non-active" />
                    ) : (
                      <Icon icon="heroicons:bars-3-solid" className="icon text-2xl non-active" />
                    )}
                  </button>
                  <button onClick={mobileMenuControl} type="button" className="sidebar-mobile-toggle">
                    <Icon icon="heroicons:bars-3-solid" className="icon" />
                  </button>
                  <form className="navbar-search">
                    <input type="text" name="search" placeholder="Search" />
                    <Icon icon="ion:search-outline" className="icon" />
                  </form>
                </div>
              </div>
              <div className="col-auto">
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <ThemeToggleButton />

                  {/* Notification Dropdown */}
                  <div className="dropdown">
                    <button
                      className="has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center position-relative"
                      type="button"
                      onClick={() => setIsClick(!isClick)}
                      title="Notifications"
                    >
                      <Icon icon="iconoir:bell" className="text-primary-light text-xl" />
                      {count > 0 && (
                        <span
                          className="position-absolute top-2 start-100 translate-middle badge rounded-pill bg-danger"
                          style={{ fontSize: "0.8rem", minWidth: "1rem" }}
                        >
                          {count > 10 ? "10+" : count}
                          <span className="visually-hidden">unread messages</span>
                        </span>
                      )}
                    </button>
                    <div
                      className={`zindex-100 dropdown-menu ${isClick ? "show" : ""} dropdown-menu-lg p-0`}
                      style={{
                        left: "-360px",
                      }}
                    >
                      <div className="m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                        <div>
                          <h6 className="text-lg text-primary-light fw-semibold mb-0">Notifications</h6>
                        </div>
                        <span className="text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center">
                          {notifications.length}
                        </span>
                      </div>
                      <div className="max-h-400-px overflow-y-scroll scroll-sm pe-4">
                        {notifications?.map((item) => (
                          <div
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (!item.isRead) {
                                notificationClick(item._id)
                              }
                            }}
                            key={item._id}
                            className="cursor-pointer px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between position-relative"
                          >
                            <div className="text-black d-flex align-items-center gap-3">
                              <span className="position-relative w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                                <Icon icon="bitcoin-icons:verify-outline" className="icon text-xxl" />
                                {!item.isRead && (
                                  <span
                                    className="position-absolute bg-danger rounded-circle"
                                    style={{
                                      width: "10px",
                                      height: "10px",
                                      top: "0px",
                                      left: "0px",
                                      transform: "translate(-20%, -20%)",
                                    }}
                                  />
                                )}
                              </span>
                              <div>
                                <h6 className="text-md fw-semibold mb-4">{item.title}</h6>
                                <p className="mb-0 text-sm text-secondary-light">{item.message}</p>
                              </div>
                            </div>
                            <span className="text-sm text-secondary-light">
                              {formatDistanceToNow(new Date(item.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Profile Dropdown */}
                  <div className="dropdown">
                    <button
                      className="d-flex justify-content-center align-items-center rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      title="Profile"
                    >
                      <Icon icon="mdi:account-circle" className="w-40-px h-40-px object-fit-cover rounded-circle" />
                    </button>
                    <div className="dropdown-menu to-top dropdown-menu-sm">
                      <div className="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                        <div>
                          <h6 className="text-lg text-primary-light fw-semibold mb-2">{userName || "Loading..."}</h6>
                          <span className="text-secondary-light fw-medium text-sm">{userRole || "Loading..."}</span>
                        </div>
                        <button type="button">
                          <Icon icon="radix-icons:cross-1" className="icon text-xl" />
                        </button>
                      </div>
                      <ul className="to-top-list">
                        <>
                          {user && userRole !== "admin" && (
                            <li>
                              <Link
                                href={profileLink}
                                className="dropdown-item text-black px-0 py-8 d-flex align-items-center gap-3"
                              >
                                <Icon icon="solar:user-linear" className="icon text-xl" />
                                My Profile
                              </Link>
                            </li>
                          )}
                        </>
                        <li>
                          {!user ? (
                            <Link
                              href="/sign-in"
                              className="dropdown-item text-black px-0 py-8 d-flex align-items-center gap-3"
                            >
                              <Icon icon="lucide:power" className="icon text-xl" />
                              Login
                            </Link>
                          ) : (
                            <Link
                              href="#"
                              className="dropdown-item text-black px-0 py-8 d-flex align-items-center gap-3"
                              onClick={handleLogout}
                            >
                              <Icon icon="lucide:power" className="icon text-xl" />
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
          <div className="dashboard-main-body">{children}</div>

          {/* Footer */}
          <footer className="d-footer">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
                <p className="mb-0">© 2025 Rukn Alwatikon Center. All Rights Reserved.</p>
              </div>
              <div className="col-auto">
                <p className="mb-0">
                  Made by <span className="text-primary-600">Eng: Ziad Elbadawi</span>
                </p>
              </div>
            </div>
          </footer>
        </main>
      </section>
    </>
  )
}

export default MasterLayout
