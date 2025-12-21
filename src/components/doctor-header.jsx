"use client"
import CustomLink from "@/components/CustomLink"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, Bell, CheckCircle, XCircle, Info, AlertCircle, Mail, Calendar, Package } from "lucide-react"
import styles from "../styles/DoctorHeader.module.css"
import axiosInstance from "../helper/axiosSetup" // Import axiosInstance
import useSocket from "@/hooks/useSocket" // Import useSocket
import { formatDistanceToNow } from "date-fns" // Import date-fns for relative time

export default function DoctorHeader({
  user,
  loading,
  onLoginClick,
  onLogout,
  logoSrc = "/images/rukn-logo.png",
  title = "Rukn Elwatikon Center - Doctor Portal",
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const notificationsRef = useRef(null)

  // State for notifications, initialized empty as they will be fetched
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0) // Renamed from 'count' for clarity

  // Use useSocket hook for real-time updates
  useSocket(user?.id, (data) => {
    if (data && data.notifications) {
      setNotifications(data.notifications || [])
      setUnreadCount(data.count || 0)
    }
  })

  // Function to fetch notifications from the backend
  const getNotifications = async () => {
    try {
      if (!user?.id) {
        return // Ensure user ID is available
      }
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/notification/byId/${user?.id}`)
      const fetchedNotifications = response.data.notifications || []
      setNotifications(fetchedNotifications)
      setUnreadCount(fetchedNotifications.filter((notif) => !notif.isRead).length)
    } catch (error) {
      console.error("Error fetching doctor notifications:", error)
    }
  }

  // Fetch notifications on component mount or when user ID changes
  useEffect(() => {
    if (user?.id) {
      getNotifications()
    }
  }, [user?.id])

  // Function to mark a specific notification as read
  const handleNotificationClick = async (notificationId) => {
    try {
      await axiosInstance.put(`${process.env.NEXT_PUBLIC_API_URL}/notification/read/${notificationId}`)
      // After marking as read, refetch notifications to update the UI
      getNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Function to mark all notifications as read (locally and then refetch)
  const markAllAsRead = async () => {
    // Optimistically update UI first
    setNotifications((prevNotifications) => prevNotifications.map((notif) => ({ ...notif, isRead: true })))
    setUnreadCount(0)
    setNotificationsOpen(false) // Close the dropdown

    // In a real scenario, you might have a backend endpoint to mark all as read.
    // For now, we'll just refetch to ensure consistency after a short delay
    // or if individual mark-as-read calls are made.
    // If there's no "mark all as read" endpoint, individual clicks will handle it.
    // For this example, we'll just rely on individual clicks or a full refetch.
    // If you need a backend "mark all as read" endpoint, let me know!
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const getNotificationIcon = (type) => {
    // Using specific icons for better context, similar to previous iteration
    // You can adjust these based on actual notification types from your backend
    switch (type) {
      case "new":
        return <Mail className={styles.notificationItemIcon} />
      case "success":
        return <CheckCircle className={`${styles.notificationItemIcon} ${styles.successIcon}`} />
      case "error":
        return <XCircle className={`${styles.notificationItemIcon} ${styles.errorIcon}`} />
      case "info":
        return <Info className={`${styles.notificationItemIcon} ${styles.infoIcon}`} />
      case "warning":
        return <AlertCircle className={`${styles.notificationItemIcon} ${styles.warningIcon}`} />
      case "appointment":
        return <Calendar className={styles.notificationItemIcon} />
      case "supply":
        return <Package className={styles.notificationItemIcon} />
      default:
        return <Bell className={styles.notificationItemIcon} />
    }
  }

  // Get doctor name - try different possible fields
  const getDoctorName = () => {
    if (user?.username) {
      return user.username
    }
    if (user?.name) {
      return user.name
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user?.firstName) {
      return user.firstName
    }
    return "Doctor" // Fallback
  }

  return (
    <header className={styles.header}>
      <CustomLink href="/doctorportal" className={styles.logoContainer}>
        <img src={logoSrc || "/placeholder.svg"} className={styles.logo} alt="Rukn Elwatikon Medical Center Logo" />
      </CustomLink>

      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.userSection}>
        {!loading && user && user.role === "doctor" ? (
          <>
            <div className={styles.notificationDropdown} ref={notificationsRef}>
              <button
                className={styles.notificationButton}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
              >
                <Bell className={styles.bellIcon} />
                {unreadCount > 0 && <span className={styles.notificationCount}>{unreadCount}</span>}
              </button>
              {notificationsOpen && (
                <div className={styles.notificationDropdownMenu}>
                  <div className={styles.notificationHeader}>
                    <h4 className={styles.notificationTitle}>Notifications</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className={styles.markAllReadButton}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className={styles.notificationList}>
                    {notifications.length > 0 ? (
                      notifications.slice(0, 7).map((notification) => (
                        <div
                          key={notification._id}
                          className={`${styles.notificationItem} ${!notification.isRead ? styles.unreadNotification : ""}`}
                          onClick={() => handleNotificationClick(notification._id)}
                        >
                          {!notification.isRead && <span className={styles.unreadDot} />}
                          {getNotificationIcon(notification.type)}
                          <div className={styles.notificationContent}>
                            <p className={styles.notificationMessage}>{notification.message}</p>
                            <span className={styles.notificationTimestamp}>
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles.noNotifications}>You're all caught up! No new notifications.</p>
                    )}
                  </div>
                  {notifications.length > 7 && (
                    <CustomLink href="/notifications" className={styles.viewAllButton}>
                      Show All Notifications
                    </CustomLink>
                  )}
                </div>
              )}
            </div>

            <div className={styles.dropdown} ref={dropdownRef}>
              <button
                className={styles.dropdownButton}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
              >
                <span className={styles.doctorInfo}>
                  <span className={styles.doctorName}>Dr. {getDoctorName()}</span>
                </span>
                <ChevronDown className={styles.chevronIcon} />
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <CustomLink
                    href="/calendar-main"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    weekly schedule
                  </CustomLink>
                  <CustomLink
                    href="/doctorportal/profile-doctor"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile Settings
                  </CustomLink>

                  <hr className={styles.dropdownDivider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={() => {
                      setDropdownOpen(false)
                      onLogout()
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button className={styles.loginButton} onClick={onLoginClick}>
            Login
          </button>
        )}
      </div>
    </header>
  )
}
