"use client"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { RiGlobalLine, RiArrowDownSLine } from "react-icons/ri"
import { Bell, CheckCircle, XCircle, Info, AlertCircle, Mail, Calendar, Package } from "lucide-react" // Import Lucide icons
import styles from "../styles/Header.module.css"
import { useLanguage } from "../contexts/LanguageContext"

export default function Header({
  user,
  loading,
  onLoginClick,
  onLogout,
  logoSrc = "/images/rukn-logo.png",
  title = "Rukn Elwatikon Center Client Portal",
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const notificationsRef = useRef(null)
  const { language, toggleLanguage } = useLanguage()

  const isRTL = language === "ar"

  // Helper function to format date and time
  const formatDateTime = (date) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
    return new Intl.DateTimeFormat("en-US", options).format(date)
  }

  // Dummy notifications for demonstration
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "new",
      message: "New message from support regarding your appointment.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isRead: false,
    },
    {
      id: 2,
      type: "success",
      message: "Your payment for the full program was successful.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
    },
    {
      id: 3,
      type: "error",
      message: "Failed to load your recent activities. Please try again.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: false,
    },
    {
      id: 4,
      type: "info",
      message: "Reminder: Your next session is tomorrow at 10:00 AM.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: true, // Example of a read notification
    },
    {
      id: 5,
      type: "warning",
      message: "Your subscription is expiring soon. Renew now!",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      isRead: false,
    },
  ])

  const getNotificationIcon = (type) => {
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
      case "payment":
        return <Package className={styles.notificationItemIcon} />
      default:
        return <Bell className={styles.notificationItemIcon} />
    }
  }

  const handleNotificationClick = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)),
    )
    // Optionally, you can navigate or perform other actions here
  }

  const markAllAsRead = () => {
    setNotifications((prevNotifications) => prevNotifications.map((notif) => ({ ...notif, isRead: true })))
    setNotificationsOpen(false)
  }

  const unreadCount = notifications.filter((notif) => !notif.isRead).length

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

  return (
    <header className={`${styles.header} ${isRTL ? styles.rtl : styles.ltr}`}>
      <Link href="/clientportal" className={styles.logoContainer}>
        <img src={logoSrc || "/placeholder.svg"} className={styles.logo} alt="Rukn Elwatikon Center Logo" />
      </Link>

      <div className={styles.titleContainer}>
        <h3 className={styles.title}>{language === "ar" ? "بوابة مركز ركن الواثقون للطلاب" : title}</h3>
      </div>

      <div className={styles.userSection}>
        {/* Language Switcher */}
        <button className={styles.languageButton} onClick={toggleLanguage}>
          <RiGlobalLine />
          <span>{language === "en" ? "العربية" : "English"}</span>
        </button>

        {!loading && user && user.role === "patient" ? (
          <>
            <div className={styles.notificationDropdown} ref={notificationsRef}>
              <button
                className={styles.notificationButton}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label={language === "ar" ? "الإشعارات" : "Notifications"}
              >
                <Bell className={styles.bellIcon} />
                {unreadCount > 0 && <span className={styles.notificationCount}>{unreadCount}</span>}
              </button>
              {notificationsOpen && (
                <div className={styles.notificationDropdownMenu}>
                  <div className={styles.notificationHeader}>
                    <h4 className={styles.notificationTitle}>{language === "ar" ? "الإشعارات" : "Notifications"}</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className={styles.markAllReadButton}>
                        {language === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}
                      </button>
                    )}
                  </div>
                  <div className={styles.notificationList}>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`${styles.notificationItem} ${!notification.isRead ? styles.unreadNotification : ""}`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          {!notification.isRead && <span className={styles.unreadDot} />}
                          {getNotificationIcon(notification.type)}
                          <div className={styles.notificationContent}>
                            <p className={styles.notificationMessage}>{notification.message}</p>
                            <span className={styles.notificationTimestamp}>
                              {formatDateTime(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles.noNotifications}>
                        {language === "ar" ? "لا توجد إشعارات جديدة." : "You're all caught up! No new notifications."}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.dropdown} ref={dropdownRef}>
              <button
                className={styles.dropdownButton}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label={language === "ar" ? "قائمة المستخدم" : "User menu"}
              >
                {user.name}
                <RiArrowDownSLine />
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <Link href="/student-calendar" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    {language === "ar" ? "مواعيدي" : "My Appointments"}
                  </Link>
                  <Link href="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    {language === "ar" ? "الملف الشخصي" : "My Profile"}
                  </Link>
                  <hr className={styles.dropdownDivider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={() => {
                      setDropdownOpen(false)
                      onLogout()
                    }}
                  >
                    {language === "ar" ? "تسجيل الخروج" : "Log out"}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button className={styles.loginButton} onClick={onLoginClick}>
            {language === "ar" ? "تسجيل الدخول" : "Login"}
          </button>
        )}
      </div>
    </header>
  )
}
