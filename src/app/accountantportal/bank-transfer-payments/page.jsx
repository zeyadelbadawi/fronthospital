"use client"
import { useEffect, useState, useCallback } from "react"
import AccountantHeader from "../../../components/accountant-header"
import { useAccountantLanguage } from "../../../contexts/accountant-language-context"
import axiosInstance from "@/helper/axiosSetup"
import styles from "./bank-transfer-payments.module.css"
import { Check, X, Calendar, Clock, User, DollarSign, AlertCircle, Building2, FileText, ImageIcon } from "lucide-react"
import BankTransferAccessControl from "./access-control"

export default function BankTransferPaymentsPage() {
  const { language } = useAccountantLanguage()

  // Auth & User State
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Bank Transfer Payments State
  const [bankTransferPayments, setBankTransferPayments] = useState([])
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)
  const [processingPaymentId, setProcessingPaymentId] = useState(null)

  const [selectedScreenshot, setSelectedScreenshot] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Optimized Profile Loading
  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await axiosInstance.get("/authentication/profile")
      setUser(res.data)
    } catch (err) {
      if (err.response?.status === 403) {
        try {
          const r = await axiosInstance.post("/authentication/refresh")
          localStorage.setItem("token", r.data.accessToken)
          const retry = await axiosInstance.get("/authentication/profile")
          setUser(retry.data)
        } catch (refreshError) {
          localStorage.removeItem("token")
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Fetch pending bank transfer payments
  const fetchBankTransferPayments = useCallback(async () => {
    setIsLoadingPayments(true)
    try {
      const response = await axiosInstance.get("/authentication/pending-bank-transfer-payments")
      if (response.data.success) {
        setBankTransferPayments(response.data.payments)
      }
    } catch (error) {
      console.error("Error fetching bank transfer payments:", error)
      alert("Error loading pending bank transfer payments")
    } finally {
      setIsLoadingPayments(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchBankTransferPayments()
    }
  }, [user, fetchBankTransferPayments])

  // Confirm payment handler
  const handleConfirmPayment = useCallback(
    async (payment) => {
      if (processingPaymentId) return

      const confirmMessage =
        language === "ar"
          ? `هل أنت متأكد من تأكيد التحويل البنكي بمبلغ ${payment.amount} درهم إماراتي للمريض ${payment.patientName}؟`
          : `Are you sure you want to confirm bank transfer of ${payment.amount} AED for patient ${payment.patientName}?`

      if (!window.confirm(confirmMessage)) return

      setProcessingPaymentId(payment.programId)
      try {
        const response = await axiosInstance.post("/authentication/confirm-bank-transfer-payment", {
          programId: payment.programId,
          programType: payment.programType,
          patientId: payment.patientId,
          patientName: payment.patientName,
          amount: payment.amount,
        })

        if (response.data.success) {
          alert(language === "ar" ? "تم تأكيد التحويل البنكي بنجاح" : "Bank transfer confirmed successfully")
          fetchBankTransferPayments() // Refresh the list
        }
      } catch (error) {
        console.error("Error confirming bank transfer:", error)
        alert(error.response?.data?.message || "Error confirming bank transfer")
      } finally {
        setProcessingPaymentId(null)
      }
    },
    [processingPaymentId, language, fetchBankTransferPayments],
  )

  // Cancel appointment handler
  const handleCancelAppointment = useCallback(
    async (payment) => {
      if (processingPaymentId) return

      const confirmMessage =
        language === "ar"
          ? `هل أنت متأكد من إلغاء موعد المريض ${payment.patientName}؟`
          : `Are you sure you want to cancel the appointment for patient ${payment.patientName}?`

      if (!window.confirm(confirmMessage)) return

      setProcessingPaymentId(payment.programId)
      try {
        const response = await axiosInstance.post("/authentication/cancel-bank-transfer-appointment", {
          programId: payment.programId,
          programType: payment.programType,
        })

        if (response.data.success) {
          alert(language === "ar" ? "تم إلغاء الموعد بنجاح" : "Appointment cancelled successfully")
          fetchBankTransferPayments() // Refresh the list
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error)
        alert(error.response?.data?.message || "Error cancelling appointment")
      } finally {
        setProcessingPaymentId(null)
      }
    },
    [processingPaymentId, language, fetchBankTransferPayments],
  )

  // Logout Handler
  const handleLogout = useCallback(async () => {
    try {
      await axiosInstance.post("/authentication/logout")
      localStorage.removeItem("token")
      setUser(null)
      window.location.href = "/accountantportal"
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getProgramTypeLabel = (programType) => {
    const labels = {
      full_program: language === "ar" ? "برنامج كامل" : "Full Program",
      single_session: language === "ar" ? "جلسة واحدة" : "Single Session",
      school_evaluation: language === "ar" ? "تقييم مدرسي" : "School Evaluation",
    }
    return labels[programType] || programType
  }

  const handleViewScreenshot = (screenshotPath) => {
    if (screenshotPath) {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      // Remove leading slash from screenshotPath if it exists
      const cleanPath = screenshotPath.startsWith("/") ? screenshotPath.slice(1) : screenshotPath
      const fullURL = `${baseURL}/${cleanPath}`
      setSelectedScreenshot(fullURL)
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedScreenshot(null)
  }

  return (
    <>
      <BankTransferAccessControl />

      <div className={styles.pageContainer}>
        <AccountantHeader
          user={user}
          loading={loading}
          onLoginClick={() => {
            window.location.href = "/accountantportal"
          }}
          onLogout={handleLogout}
        />

        <div className={styles.contentContainer}>
          <div className={styles.header}>
            <div className={styles.headerIcon}>
              <Building2 size={32} />
            </div>
            <div className={styles.headerText}>
              <h1 className={styles.title}>
                {language === "ar" ? "التحويلات البنكية المعلقة" : "Pending Bank Transfers"}
              </h1>
              <p className={styles.subtitle}>
                {language === "ar"
                  ? "إدارة وتأكيد التحويلات البنكية للمرضى"
                  : "Manage and confirm patient bank transfers"}
              </p>
            </div>
          </div>

          {isLoadingPayments ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>{language === "ar" ? "جارٍ التحميل..." : "Loading..."}</p>
            </div>
          ) : bankTransferPayments.length === 0 ? (
            <div className={styles.emptyState}>
              <AlertCircle size={48} className={styles.emptyIcon} />
              <h3>{language === "ar" ? "لا توجد تحويلات معلقة" : "No Pending Transfers"}</h3>
              <p>
                {language === "ar" ? "جميع التحويلات البنكية تم تأكيدها" : "All bank transfers have been confirmed"}
              </p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{language === "ar" ? "اسم المريض" : "Patient Name"}</th>
                    <th>{language === "ar" ? "نوع البرنامج" : "Program Type"}</th>
                    <th>{language === "ar" ? "التاريخ" : "Date"}</th>
                    <th>{language === "ar" ? "الوقت" : "Time"}</th>
                    <th>{language === "ar" ? "المبلغ" : "Amount"}</th>
                    <th>{language === "ar" ? "الوصف" : "Description"}</th>
                    <th>{language === "ar" ? "إيصال التحويل" : "Transfer Receipt"}</th>
                    <th>{language === "ar" ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {bankTransferPayments.map((payment) => (
                    <tr key={payment.programId}>
                      <td>
                        <div className={styles.patientCell}>
                          <User size={18} />
                          <span>{payment.patientName}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.programTypeBadge}>{getProgramTypeLabel(payment.programType)}</span>
                      </td>
                      <td>
                        <div className={styles.dateCell}>
                          <Calendar size={16} />
                          <span>{formatDate(payment.date)}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.timeCell}>
                          <Clock size={16} />
                          <span>{payment.time}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.amountCell}>
                          <DollarSign size={16} />
                          <span className={styles.amount}>{payment.amount} AED</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.descriptionCell}>
                          <FileText size={16} />
                          <span className={styles.description}>{payment.description || "N/A"}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleViewScreenshot(payment.transferScreenshot)}
                          className={styles.viewScreenshotButton}
                          disabled={!payment.transferScreenshot}
                          title={language === "ar" ? "عرض الإيصال" : "View Receipt"}
                        >
                          <ImageIcon size={18} />
                          {language === "ar" ? "عرض" : "View"}
                        </button>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            onClick={() => handleConfirmPayment(payment)}
                            disabled={processingPaymentId === payment.programId}
                            className={`${styles.actionButton} ${styles.confirmButton}`}
                            title={language === "ar" ? "تأكيد التحويل" : "Confirm Transfer"}
                          >
                            <Check size={18} />
                            {language === "ar" ? "تأكيد" : "Confirm"}
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(payment)}
                            disabled={processingPaymentId === payment.programId}
                            className={`${styles.actionButton} ${styles.cancelButton}`}
                            title={language === "ar" ? "إلغاء الموعد" : "Cancel Appointment"}
                          >
                            <X size={18} />
                            {language === "ar" ? "إلغاء" : "Cancel"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && selectedScreenshot && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.modalCloseButton} onClick={handleCloseModal}>
                <X size={24} />
              </button>
              <div className={styles.modalImageContainer}>
                <img
                  src={selectedScreenshot || "/placeholder.svg"}
                  alt="Bank Transfer Screenshot"
                  className={styles.modalImage}
                />
              </div>
              <div className={styles.modalFooter}>
                <p>{language === "ar" ? "إيصال التحويل البنكي" : "Bank Transfer Receipt"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
