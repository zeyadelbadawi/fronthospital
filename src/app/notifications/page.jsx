"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { Bell, CheckCircle, XCircle, Info, AlertCircle, Mail, Calendar, Package, Trash2, Check } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import useSocket from "@/hooks/useSocket"
import { notificationsIcons } from "@/utils/assignmentUtils"
import { Icon } from "@iconify/react"
import { useLanguage } from "@/contexts/LanguageContext"
import MasterLayout from "@/masterLayout/MasterLayout"
import styles from "./notifications.module.css"

export default function NotificationsPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, unread, read
  const [selectedIds, setSelectedIds] = useState([])

  const isRTL = language === "ar"

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/sign-in")
          return
        }

        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(response.data)
      } catch (error) {
        console.error("Error fetching user:", error)
        router.push("/sign-in")
      }
    }
    fetchUser()
  }, [router])

  // Socket integration for real-time notifications
  useSocket(user?.id, ({ notifications: socketNotifications }) => {
    setNotifications(socketNotifications || [])
    applyFilter(filter, socketNotifications || [])
  })

  // Fetch notifications
  const getNotifications = async () => {
    try {
      if (!user?.id) return
      setLoading(true)
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/notification/byId/${user.id}`)
      const fetchedNotifications = response.data.notifications || []
      setNotifications(fetchedNotifications)
      applyFilter(filter, fetchedNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      getNotifications()
    }
  }, [user?.id])

  // Apply filter
  const applyFilter = (filterType, notifList = notifications) => {
    let filtered = notifList
    if (filterType === "unread") {
      filtered = notifList.filter((n) => !n.isRead)
    } else if (filterType === "read") {
      filtered = notifList.filter((n) => n.isRead)
    }
    setFilteredNotifications(filtered)
  }

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    applyFilter(newFilter)
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`${process.env.NEXT_PUBLIC_API_URL}/notification/read/${notificationId}`)
      await getNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead)
      await Promise.all(
        unreadNotifications.map((n) =>
          axiosInstance.put(`${process.env.NEXT_PUBLIC_API_URL}/notification/read/${n._id}`),
        ),
      )
      await getNotifications()
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  // Delete selected notifications
  const deleteSelected = async () => {
    if (selectedIds.length === 0) return
    try {
      await Promise.all(
        selectedIds.map((id) => axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_URL}/notification/${id}`)),
      )
      setSelectedIds([])
      await getNotifications()
    } catch (error) {
      console.error("Error deleting notifications:", error)
    }
  }

  // Toggle selection
  const toggleSelection = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  // Select all
  const selectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredNotifications.map((n) => n._id))
    }
  }

  // Get notification icon
  const getNotificationIcon = (type) => {
    if (notificationsIcons[type]) {
      return <Icon icon={notificationsIcons[type]} className={styles.notificationIcon} />
    }

    switch (type) {
      case "create":
      case "new":
        return <Mail className={styles.notificationIcon} />
      case "successfully":
      case "success":
        return <CheckCircle className={`${styles.notificationIcon} ${styles.successIcon}`} />
      case "unsuccessfully":
      case "error":
        return <XCircle className={`${styles.notificationIcon} ${styles.errorIcon}`} />
      case "update":
      case "info":
        return <Info className={`${styles.notificationIcon} ${styles.infoIcon}`} />
      case "reschedule":
      case "warning":
        return <AlertCircle className={`${styles.notificationIcon} ${styles.warningIcon}`} />
      case "appointment":
        return <Calendar className={styles.notificationIcon} />
      case "payment":
        return <Package className={styles.notificationIcon} />
      default:
        return <Bell className={styles.notificationIcon} />
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading && !user) {
    return (
      <MasterLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </MasterLayout>
    )
  }

  return (
    <MasterLayout>
      <div className={`${styles.notificationsPage} ${isRTL ? styles.rtl : styles.ltr}`}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerTitle}>
              <Bell className={styles.headerIcon} />
              <h1>{language === "ar" ? "الإشعارات" : "Notifications"}</h1>
            </div>
            <div className={styles.headerStats}>
              <span className={styles.totalCount}>
                {language === "ar" ? `الإجمالي: ${notifications.length}` : `Total: ${notifications.length}`}
              </span>
              {unreadCount > 0 && (
                <span className={styles.unreadCount}>
                  {language === "ar" ? `غير مقروء: ${unreadCount}` : `Unread: ${unreadCount}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className={styles.actionsBar}>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
              onClick={() => handleFilterChange("all")}
            >
              {language === "ar" ? "الكل" : "All"}
            </button>
            <button
              className={`${styles.filterButton} ${filter === "unread" ? styles.active : ""}`}
              onClick={() => handleFilterChange("unread")}
            >
              {language === "ar" ? "غير مقروء" : "Unread"}
            </button>
            <button
              className={`${styles.filterButton} ${filter === "read" ? styles.active : ""}`}
              onClick={() => handleFilterChange("read")}
            >
              {language === "ar" ? "مقروء" : "Read"}
            </button>
          </div>

          <div className={styles.actionButtons}>
            {selectedIds.length > 0 && (
              <button className={styles.deleteButton} onClick={deleteSelected}>
                <Trash2 className={styles.buttonIcon} />
                {language === "ar" ? `حذف (${selectedIds.length})` : `Delete (${selectedIds.length})`}
              </button>
            )}
            {unreadCount > 0 && (
              <button className={styles.markAllButton} onClick={markAllAsRead}>
                <Check className={styles.buttonIcon} />
                {language === "ar" ? "تحديد الكل كمقروء" : "Mark All as Read"}
              </button>
            )}
            <button
              className={`${styles.selectAllButton} ${selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0 ? styles.active : ""}`}
              onClick={selectAll}
            >
              {language === "ar" ? "تحديد الكل" : "Select All"}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className={styles.notificationsList}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>{language === "ar" ? "جاري التحميل..." : "Loading notifications..."}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className={styles.emptyState}>
              <Bell className={styles.emptyIcon} />
              <h3>{language === "ar" ? "لا توجد إشعارات" : "No Notifications"}</h3>
              <p>
                {filter === "unread"
                  ? language === "ar"
                    ? "أنت بخير! لا توجد إشعارات غير مقروءة."
                    : "You're all caught up! No unread notifications."
                  : filter === "read"
                    ? language === "ar"
                      ? "لا توجد إشعارات مقروءة بعد."
                      : "No read notifications yet."
                    : language === "ar"
                      ? "لا توجد إشعارات لعرضها."
                      : "No notifications to display."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`${styles.notificationCard} ${!notification.isRead ? styles.unread : ""} ${
                  selectedIds.includes(notification._id) ? styles.selected : ""
                }`}
              >
                <div className={styles.selectionCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notification._id)}
                    onChange={() => toggleSelection(notification._id)}
                    className={styles.checkbox}
                  />
                </div>

                <div className={styles.iconContainer}>{getNotificationIcon(notification.type)}</div>

                <div
                  className={styles.notificationContent}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className={styles.notificationHeader}>
                    <h3 className={styles.notificationTitle}>
                      {language === "ar" ? notification.titleAr || notification.title : notification.title}
                    </h3>
                    {!notification.isRead && <span className={styles.unreadBadge}></span>}
                  </div>
                  <p className={styles.notificationMessage}>
                    {language === "ar" ? notification.messageAr || notification.message : notification.message}
                  </p>
                  <span className={styles.notificationTime}>
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: language === "ar" ? ar : undefined,
                    })}
                  </span>
                </div>

                {!notification.isRead && (
                  <button
                    className={styles.markReadButton}
                    onClick={() => markAsRead(notification._id)}
                    title={language === "ar" ? "تحديد كمقروء" : "Mark as read"}
                  >
                    <Check className={styles.checkIcon} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </MasterLayout>
  )
}
