"use client"
import { useState, useEffect } from "react"
import axiosInstance from "../helper/axiosSetup"
import { useLanguage } from "../contexts/LanguageContext"
import {
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiDownloadLine,
  RiEyeLine,
  RiFileTextLine,
  RiMoneyDollarCircleLine,
  RiTimeLine,
  RiWallet3Line,
} from "react-icons/ri"
import styles from "../styles/FinancialRecords.module.css"

export default function FinancialRecordsMainLayer({ user }) {
  const { language, translations } = useLanguage()
  const t = translations[language]

  const [activeTab, setActiveTab] = useState("overview")
  const [moneyRecords, setMoneyRecords] = useState([])
  const [checkRecords, setCheckRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.id) {
      fetchFinancialData()
    }
  }, [user])

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Attempting to fetch financial data for user ID:", user?.id)

      const [moneyResponse, checksResponse] = await Promise.all([
        axiosInstance.get(`/authentication/money/patient/${user.id}`),
        axiosInstance.get(`/authentication/checks/patient/${user.id}`),
      ])

      console.log("Raw money response data:", moneyResponse.data)
      console.log("Raw checks response data:", checksResponse.data)

      const extractedMoneyData = Array.isArray(moneyResponse.data?.data?.records)
        ? moneyResponse.data.data.records
        : Array.isArray(moneyResponse.data)
          ? moneyResponse.data
          : []

      const extractedChecksData = Array.isArray(checksResponse.data?.data?.records)
        ? checksResponse.data.data.records
        : Array.isArray(checksResponse.data)
          ? checksResponse.data
          : []

      console.log("Extracted money data (should be array):", extractedMoneyData)
      console.log("Extracted checks data (should be array):", extractedChecksData)

      setMoneyRecords(extractedMoneyData)
      setCheckRecords(extractedChecksData)
    } catch (err) {
      console.error("Error fetching financial data:", err)
      setError("Failed to load financial records. Please try again.")
      setMoneyRecords([])
      setCheckRecords([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    const numAmount = Number(amount) || 0
    return new Intl.NumberFormat(language === "ar" ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2, // Ensure two decimal places
      maximumFractionDigits: 2, // Ensure two decimal places
    }).format(numAmount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-AE" : "en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      console.error("Error formatting date:", dateString, e)
      return "Invalid Date"
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "cleared":
        return styles.statusSuccess
      case "pending":
      case "deposited":
        return styles.statusWarning
      case "bounced":
      case "cancelled":
        return styles.statusError
      default:
        return styles.statusDefault
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "cleared":
        return <RiCheckboxCircleLine />
      case "pending":
      case "deposited":
        return <RiTimeLine />
      case "bounced":
      case "cancelled":
        return <RiErrorWarningLine />
      default:
        return <RiFileTextLine />
    }
  }

  const currentMoneyRecords = Array.isArray(moneyRecords) ? moneyRecords : []
  const currentCheckRecords = Array.isArray(checkRecords) ? checkRecords : []

  console.log("moneyRecords state before calculations:", currentMoneyRecords)
  console.log(
    "Type of moneyRecords state:",
    typeof currentMoneyRecords,
    Array.isArray(currentMoneyRecords) ? "(Array)" : "(Not Array)",
  )

  const totalPending = currentMoneyRecords
    .filter((record) => record?.status === "pending")
    .reduce((sum, record) => sum + (Number(record?.price) || 0), 0)

  const totalChecks = currentCheckRecords.reduce((sum, check) => sum + (Number(check?.amount) || 0), 0)

  const overdueChecks = currentCheckRecords.filter((check) => {
    if (!check?.dueDate) return false
    const dueDate = new Date(check.dueDate)
    const today = new Date()
    return dueDate < today && check.status === "pending"
  })

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <RiErrorWarningLine className={styles.errorIcon} />
        <p>{error}</p>
        <button onClick={fetchFinancialData} className={styles.retryButton}>
          {language === "ar" ? "إعادة المحاولة" : "Retry"}
        </button>
      </div>
    )
  }

  return (
    <div className={`${styles.financialContainer} ${language === "ar" ? styles.rtl : styles.ltr}`}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{language === "ar" ? "مدفوعاتي" : "My Invoices"}</h1>
        <p className={styles.pageSubtitle}>
          {language === "ar" ? "عرض تفصيلي لجميع المدفوعات والشيكات" : "Detailed view of all payments and checks"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
       
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <RiTimeLine />
          </div>
          <div className={styles.summaryContent}>
            <h3>{formatCurrency(totalPending)}</h3>
            <p>{language === "ar" ? "في الانتظار" : "Pending"}</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <RiWallet3Line />
          </div>
          <div className={styles.summaryContent}>
            <h3>{formatCurrency(totalChecks)}</h3>
            <p>{language === "ar" ? "إجمالي الشيكات" : "Total Checks"}</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <RiErrorWarningLine />
          </div>
          <div className={styles.summaryContent}>
            <h3>{overdueChecks.length}</h3>
            <p>{language === "ar" ? "شيكات متأخرة" : "Overdue Checks"}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabContainer}>
        <div className={styles.tabList}>
          <button
            className={`${styles.tab} ${activeTab === "overview" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <RiEyeLine />
            {language === "ar" ? "نظرة عامة" : "Overview"}
          </button>
          <button
            className={`${styles.tab} ${activeTab === "payments" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            <RiMoneyDollarCircleLine />
            {language === "ar" ? "المدفوعات" : "Payments"}
          </button>
          <button
            className={`${styles.tab} ${activeTab === "checks" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("checks")}
          >
            <RiFileTextLine />
            {language === "ar" ? "الشيكات" : "Checks"}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "overview" && (
          <div className={styles.overviewContent}>
            <div className={styles.recentActivity}>
              <h3>{language === "ar" ? "النشاط الأخير" : "Recent Activity"}</h3>
              <div className={styles.activityList}>
                {[...currentMoneyRecords, ...currentCheckRecords]
                  .sort((a, b) => new Date(b.createdAt || b.dueDate || 0) - new Date(a.createdAt || a.dueDate || 0))
                  .slice(0, 5)
                  .map((record, index) => (
                    <div key={record._id || index} className={styles.activityItem}>
                      <div className={`${styles.activityIcon} ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                      </div>
                      <div className={styles.activityDetails}>
                        <p className={styles.activityTitle}>
                          {record.invoiceId
                            ? `${language === "ar" ? "دفعة" : "Payment"} #${record.invoiceId || "N/A"}`
                            : `${language === "ar" ? "شيك" : "Check"} #${record.checkNumber || "N/A"}`}
                        </p>
                        <p className={styles.activityDate}>{formatDate(record.createdAt || record.dueDate)}</p>
                      </div>
                      <div className={styles.activityAmount}>{formatCurrency(record.price || record.amount)}</div>
                    </div>
                  ))}
                {currentMoneyRecords.length === 0 && currentCheckRecords.length === 0 && (
                  <p className={styles.noData}>{language === "ar" ? "لا توجد بيانات" : "No data available"}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h3>{language === "ar" ? "سجل المدفوعات" : "Payment History"}</h3>
            
            </div>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <div className={styles.tableRow}>
                  <div className={styles.tableCell}>{language === "ar" ? "رقم الفاتورة" : "Invoice ID"}</div>
                  <div className={styles.tableCell}>{language === "ar" ? "المبلغ" : "Amount"}</div>
                  <div className={styles.tableCell}>{language === "ar" ? "النوع" : "Type"}</div>
                  <div className={styles.tableCell}>{language === "ar" ? "الحالة" : "Status"}</div>
                  <div className={styles.tableCell}>{language === "ar" ? "التاريخ" : "Date"}</div>
                </div>
              </div>
              <div className={styles.tableBody}>
                {currentMoneyRecords.length > 0 ? (
                  currentMoneyRecords.map((record, index) => (
                    <div key={record._id || index} className={styles.tableRow}>
                      <div className={styles.tableCell}>#{record.invoiceId || "N/A"}</div>
                      <div className={styles.tableCell}>{formatCurrency(record.price)}</div>
                      <div className={styles.tableCell}>{record.programType || "N/A"}</div>
                      <div className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status || "Unknown"}
                        </span>
                      </div>
                      <div className={styles.tableCell}>{formatDate(record.createdAt)}</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.tableRow}>
                    <div className={styles.tableCell} style={{ textAlign: "center", gridColumn: "1 / -1" }}>
                      {language === "ar" ? "لا توجد مدفوعات" : "No payments found"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "checks" && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h3>{language === "ar" ? "إدارة الشيكات" : "Check Management"}</h3>
            
            </div>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <div className={styles.tableRow}>
                  <div className={styles.tableCell}>{language === "ar" ? "رقم الشيك" : "Check Number"}</div>
                  <div className={styles.tableCell}>{language === "ar" ? "المبلغ" : "Amount"}</div>
                  <div className={styles.tableCell}>{language === "ar" ? "تاريخ الاستحقاق" : "Due Date"}</div>
                  <div className={styles.tableCell}>{language === "ar" ? "البنك" : "Bank"}</div>
                  <div className={styles.tableCell}>{language === "ar" ? "الحالة" : "Status"}</div>
                </div>
              </div>
              <div className={styles.tableBody}>
                {currentCheckRecords.length > 0 ? (
                  currentCheckRecords.map((check, index) => (
                    <div key={check._id || index} className={styles.tableRow}>
                      <div className={styles.tableCell}>#{check.checkNumber || "N/A"}</div>
                      <div className={styles.tableCell}>{formatCurrency(check.amount)}</div>
                      <div className={styles.tableCell}>{formatDate(check.dueDate)}</div>
                      <div className={styles.tableCell}>{check.bankName || "N/A"}</div>
                      <div className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${getStatusColor(check.status)}`}>
                          {getStatusIcon(check.status)}
                          {check.status || "Unknown"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.tableRow}>
                    <div className={styles.tableCell} style={{ textAlign: "center", gridColumn: "1 / -1" }}>
                      {language === "ar" ? "لا توجد شيكات" : "No checks found"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
