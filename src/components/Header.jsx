"use client"
import CustomLink from "@/components/CustomLink"
import { useState, useRef, useEffect } from "react"
import { RiGlobalLine, RiArrowDownSLine } from "react-icons/ri"
import { Bell, CheckCircle, XCircle, Info, AlertCircle, Mail, Calendar, Package } from "lucide-react"
import styles from "../styles/Header.module.css"
import { useLanguage } from "../contexts/LanguageContext"
import axiosInstance from "../helper/axiosSetup"
import useSocket from "@/hooks/useSocket"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { notificationsIcons } from "@/utils/assignmentUtils"

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

  // Replace the static notifications state with dynamic state
  const [notifications, setNotifications] = useState([])
  const [count, setCount] = useState(0)

  // Add socket integration for real-time notifications
  useSocket(user?.id, ({ count, notifications }) => {

    setNotifications(notifications)
    setCount(count)
  })

  // Add dynamic notification fetching function
  const getNotifications = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/notification/byId/${user?.id}`)
      setNotifications(response.data.notifications || [])
      setCount(response.data.count || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  // Add useEffect to fetch notifications when user changes
  useEffect(() => {
    if (!user?.id) return
    getNotifications()
  }, [user?.id])

  useEffect(() => {
    console.log("Language changed to:", language)
  }, [language])

  // Replace handleNotificationClick with dynamic version
  const handleNotificationClick = async (noteId) => {
    try {
      axiosInstance.put(`${process.env.NEXT_PUBLIC_API_URL}/notification/read/${noteId}`).then((response) => {
        getNotifications()
      })
    } catch (error) {
      console.error("Error handling notification click:", error)
    }
  }

  // Update markAllAsRead to work with dynamic notifications
  const markAllAsRead = async () => {
    try {
      // Mark all notifications as read via API
      const unreadNotifications = notifications.filter((notif) => !notif.isRead)
      await Promise.all(
        unreadNotifications.map((notif) =>
          axiosInstance.put(`${process.env.NEXT_PUBLIC_API_URL}/notification/read/${notif._id}`),
        ),
      )
      getNotifications()
      setNotificationsOpen(false)
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  // Update getNotificationIcon to use dynamic icons from assignmentUtils
  const getNotificationIcon = (type) => {
    const iconName = notificationsIcons[type] || "bell"

    switch (type) {
      case "create":
      case "new":
        return <Mail className={styles.notificationItemIcon} />
      case "successfully":
      case "success":
        return <CheckCircle className={`${styles.notificationItemIcon} ${styles.successIcon}`} />
      case "unsuccessfully":
      case "error":
        return <XCircle className={`${styles.notificationItemIcon} ${styles.errorIcon}`} />
      case "update":
      case "info":
        return <Info className={`${styles.notificationItemIcon} ${styles.infoIcon}`} />
      case "reschedule":
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

  // Update unreadCount to work with dynamic data
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
      <CustomLink href="/clientportal" className={styles.logoContainer}>
        <img src={logoSrc || "/placeholder.svg"} className={styles.logo} alt="Rukn Elwatikon Center Logo" />
      </CustomLink>

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
                {count > 0 && <span className={styles.notificationCount}>{count > 10 ? "10+" : count}</span>}
              </button>
              {notificationsOpen && (
                <div className={styles.notificationDropdownMenu}>
                  <div className={styles.notificationHeader}>
                    <h4 className={styles.notificationTitle}>{language === "ar" ? "الإشعارات" : "Notifications"}</h4>
                    {count > 0 && (
                      <button onClick={markAllAsRead} className={styles.markAllReadButton}>
                        {language === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}
                      </button>
                    )}
                  </div>
                  <div className={styles.notificationList}>
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification._id}
                          className={`${styles.notificationItem} ${!notification.isRead ? styles.unreadNotification : ""}`}
                          onClick={() => handleNotificationClick(notification._id)}
                        >
                          {!notification.isRead && <span className={styles.unreadDot} />}
                          {getNotificationIcon(notification.type)}
                          <div className={styles.notificationContent}>
                            <p className={styles.notificationMessage}>
                              {(() => {
                                const msg =
                                  language === "ar"
                                    ? notification.messageAr || notification.message
                                    : notification.message
                              
                                return msg
                              })()}
                            </p>
                            <span className={styles.notificationTimestamp}>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: language === "ar" ? ar : undefined,
                              })}
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
                  {notifications.length > 5 && (
                    <CustomLink href="/notifications" className={styles.viewAllButton}>
                      {language === "ar" ? "عرض جميع الإشعارات" : "Show All Notifications"}
                    </CustomLink>
                  )}
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
                  <CustomLink
                    href="/student-calendar"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    {language === "ar" ? "مواعيدي" : "My Appointments"}
                  </CustomLink>
                  <CustomLink href="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    {language === "ar" ? "الملف الشخصي" : "My Profile"}
                  </CustomLink>
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
