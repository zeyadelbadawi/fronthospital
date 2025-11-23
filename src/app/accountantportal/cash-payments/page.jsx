"use client"
import { useEffect, useState, useCallback } from "react"
import AccountantHeader from "../../../components/accountant-header"
import { useAccountantLanguage } from "../../../contexts/accountant-language-context"
import axiosInstance from "@/helper/axiosSetup"
import styles from "./cash-payments.module.css"
import { Check, X, Calendar, Clock, User, DollarSign, AlertCircle } from "lucide-react"

export default function CashPaymentsPage() {
  const { language } = useAccountantLanguage()

  // Auth & User State
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cash Payments State
  const [cashPayments, setCashPayments] = useState([])
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)
  const [processingPaymentId, setProcessingPaymentId] = useState(null)

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

  // Fetch pending cash payments
  const fetchCashPayments = useCallback(async () => {
    setIsLoadingPayments(true)
    try {
      const response = await axiosInstance.get("/authentication/pending-cash-payments")
      if (response.data.success) {
        setCashPayments(response.data.payments)
      }
    } catch (error) {
      console.error("Error fetching cash payments:", error)
      alert("Error loading pending cash payments")
    } finally {
      setIsLoadingPayments(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchCashPayments()
    }
  }, [user, fetchCashPayments])

  // Confirm payment handler
  const handleConfirmPayment = useCallback(
    async (payment) => {
      if (processingPaymentId) return

      const confirmMessage =
        language === "ar"
          ? `هل أنت متأكد من تأكيد دفع ${payment.amount}   للطالب درهم امراتي ${payment.patientName}؟`
          : `Are you sure you want to confirm payment of ${payment.amount} AED for Student ${payment.patientName}?`

      if (!window.confirm(confirmMessage)) return

      setProcessingPaymentId(payment.programId)
      try {
        const response = await axiosInstance.post("/authentication/confirm-cash-payment", {
          programId: payment.programId,
          programType: payment.programType,
          patientId: payment.patientId,
          patientName: payment.patientName,
          amount: payment.amount,
        })

        if (response.data.success) {
          alert(language === "ar" ? "تم تأكيد الدفع بنجاح" : "Payment confirmed successfully")
          fetchCashPayments() // Refresh the list
        }
      } catch (error) {
        console.error("Error confirming payment:", error)
        alert(error.response?.data?.message || "Error confirming payment")
      } finally {
        setProcessingPaymentId(null)
      }
    },
    [processingPaymentId, language, fetchCashPayments],
  )

  // Cancel appointment handler
  const handleCancelAppointment = useCallback(
    async (payment) => {
      if (processingPaymentId) return

      const confirmMessage =
        language === "ar"
          ? `هل أنت متأكد من إلغاء موعد الطالب ${payment.patientName}؟`
          : `Are you sure you want to cancel the appointment for Student ${payment.patientName}?`

      if (!window.confirm(confirmMessage)) return

      setProcessingPaymentId(payment.programId)
      try {
        const response = await axiosInstance.post("/authentication/cancel-cash-appointment", {
          programId: payment.programId,
          programType: payment.programType,
        })

        if (response.data.success) {
          alert(language === "ar" ? "تم إلغاء الموعد بنجاح" : "Appointment cancelled successfully")
          fetchCashPayments() // Refresh the list
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error)
        alert(error.response?.data?.message || "Error cancelling appointment")
      } finally {
        setProcessingPaymentId(null)
      }
    },
    [processingPaymentId, language, fetchCashPayments],
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

  return (
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
          <h1 className={styles.title}>{language === "ar" ? "المدفوعات النقدية المعلقة" : "Pending Cash Payments"}</h1>
          <p className={styles.subtitle}>
            {language === "ar" ? "إدارة المدفوعات النقدية في المركز" : "Manage cash payments at the center"}
          </p>
        </div>

        {isLoadingPayments ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>{language === "ar" ? "جارٍ التحميل..." : "Loading..."}</p>
          </div>
        ) : cashPayments.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} className={styles.emptyIcon} />
            <h3>{language === "ar" ? "لا توجد مدفوعات معلقة" : "No Pending Payments"}</h3>
            <p>{language === "ar" ? "جميع المدفوعات النقدية تم تأكيدها" : "All cash payments have been confirmed"}</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{language === "ar" ? "اسم الطالب" : "Student Name"}</th>
                  <th>{language === "ar" ? "نوع البرنامج" : "Program Type"}</th>
                  <th>{language === "ar" ? "التاريخ" : "Date"}</th>
                  <th>{language === "ar" ? "الوقت" : "Time"}</th>
                  <th>{language === "ar" ? "المبلغ" : "Amount"}</th>
                  <th>{language === "ar" ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {cashPayments.map((payment) => (
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
                      <div className={styles.actionsCell}>
                        <button
                          onClick={() => handleConfirmPayment(payment)}
                          disabled={processingPaymentId === payment.programId}
                          className={`${styles.actionButton} ${styles.confirmButton}`}
                          title={language === "ar" ? "تأكيد الدفع" : "Confirm Payment"}
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
    </div>
  )
}
