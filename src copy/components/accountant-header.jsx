"use client"
import CustomLink from "@/components/CustomLink"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, Globe, Bell, CheckCircle, XCircle, Info, AlertCircle, Mail, Package } from "lucide-react"
import styles from "../styles/AccountantHeader.module.css"
import { useAccountantLanguage } from "../contexts/accountant-language-context"
import axiosInstance from "../helper/axiosSetup"
import useSocket from "@/hooks/useSocket"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

export default function AccountantHeader({
  user,
  loading,
  onLoginClick,
  onLogout,
  logoSrc = "/images/rukn-logo.png",
  title = "Rukn Elwatikon Center - Accountant Portal",
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const notificationsRef = useRef(null)
  const { language, toggleLanguage } = useAccountantLanguage()

  const isRTL = language === "ar"

  const [notifications, setNotifications] = useState([])
  const [count, setCount] = useState(0)

  useSocket(user?.id, ({ count, notifications }) => {
    console.log("[v0] Received notifications via socket:", notifications)
    setNotifications(notifications)
    setCount(count)
  })

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

  const handleNotificationClick = async (noteId) => {
    try {
      axiosInstance.put(`${process.env.NEXT_PUBLIC_API_URL}/notification/read/${noteId}`).then((response) => {
        getNotifications()
      })
    } catch (error) {
      console.error("Error handling notification click:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
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

  const getNotificationIcon = (type) => {
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
        return <Mail className={styles.notificationItemIcon} />
      case "payment":
      case "confirmed":
        return <Package className={styles.notificationItemIcon} />
      default:
        return <Bell className={styles.notificationItemIcon} />
    }
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
      <CustomLink href="/accountantportal" className={styles.logoContainer}>
        <img src={logoSrc || "/placeholder.svg"} className={styles.logo} alt="Rukn Elwatikon Center Logo" />
      </CustomLink>

      <div className={styles.titleContainer}>
        <h4 className={styles.title}>{language === "ar" ? "مركز ركن الواثقون المالي - بوابة المحاسب" : title}</h4>
      </div>

      <div className={styles.userSection}>
        {/* Language Switcher */}
        <button className={styles.languageButton} onClick={toggleLanguage}>
          <Globe size={18} />
          <span>{language === "en" ? "العربية" : "English"}</span>
        </button>

        {!loading && user && user.role === "accountant" ? (
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
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`${styles.notificationItem} ${!notification.isRead ? styles.unreadNotification : ""}`}
                          onClick={() => handleNotificationClick(notification._id)}
                        >
                          {!notification.isRead && <span className={styles.unreadDot} />}
                          {getNotificationIcon(notification.type)}
                          <div className={styles.notificationContent}>
                            <p className={styles.notificationMessage}>
                              {language === "ar"
                                ? notification.messageAr || notification.message
                                : notification.message}
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
                </div>
              )}
            </div>

            <div className={styles.dropdown} ref={dropdownRef}>
              <button className={styles.dropdownButton} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span className={styles.accountantInfo}>
                  <span className={styles.accountantName}>
                    {" "}
                    {language === "ar" ? "مرحبا :" : "Welcome :"} {user.name}
                  </span>
                  <span className={styles.accountantRole}>
                    {language === "ar" ? "محاسب مالي" : "Financial Accountant"}
                  </span>
                </span>
                <ChevronDown className={styles.chevronIcon} />
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <CustomLink
                    href="/accountant-dashboard"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    {language === "ar" ? "لوحة القيادة" : "Dashboard"}
                  </CustomLink>
                  <CustomLink
                    href="/accountant-profile"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    {language === "ar" ? "إعدادات الملف الشخصي" : "Profile Settings"}
                  </CustomLink>
                  <CustomLink
                    href="/financial-reports"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    {language === "ar" ? "التقارير المالية" : "Financial Reports"}
                  </CustomLink>
                  <hr className={styles.dropdownDivider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={() => {
                      setDropdownOpen(false)
                      onLogout()
                    }}
                  >
                    {language === "ar" ? "تسجيل الخروج" : "Sign Out"}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button className={styles.loginButton} onClick={onLoginClick}>
            {language === "ar" ? "دخول" : "Login"}
          </button>
        )}
      </div>
    </header>
  )
}
