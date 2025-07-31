"use client"
import Link from "next/link"
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
  useSocket(user?.id, ({ count, notifications: newNotifications }) => {
    setNotifications(newNotifications || [])
    setUnreadCount(count || 0)
  })

  // Function to fetch notifications from the backend
  const getNotifications = async () => {
    try {
      if (!user?.id) return // Ensure user ID is available
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/notification/byId/${user?.id}`)
      const fetchedNotifications = response.data.notifications || []
      setNotifications(fetchedNotifications)
      setUnreadCount(fetchedNotifications.filter((notif) => !notif.isRead).length)
      console.log("Fetched doctor notifications:", fetchedNotifications)
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
      console.log(`Notification ${notificationId} marked as read.`)
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
    console.log("Mark all as read (local update).")
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

  return (
    <header className={styles.header}>
      <Link href="/doctorportal" className={styles.logoContainer}>
        <img src={logoSrc || "/placeholder.svg"} className={styles.logo} alt="Rukn Elwatikon Medical Center Logo" />
      </Link>

      <div className={styles.titleContainer}>
        <h3 className={styles.title}>{title}</h3>
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
                      notifications.map((notification) => (
                        <div
                          key={notification._id} // Use _id from backend
                          className={`${styles.notificationItem} ${!notification.isRead ? styles.unreadNotification : ""}`}
                          onClick={() => handleNotificationClick(notification._id)} // Use _id for click handler
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
                  <span className={styles.doctorName}>Dr. {user.name}</span>
                  <span className={styles.doctorRole}>Medical Professional</span>
                </span>
                <ChevronDown className={styles.chevronIcon} />
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <Link
                    href="/doctorportal/doctor-schedule"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Schedule
                  </Link>
                  <Link
                    href="/doctorportal/profile-doctor"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href="/doctorportal/help-support"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Help & Support
                  </Link>
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
            Doctor Login
          </button>
        )}
      </div>
    </header>
  )
}
