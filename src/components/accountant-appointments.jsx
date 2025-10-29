"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Calendar,
  Clock,
  User,
  FileText,
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  Plus,
  Minus,
} from "lucide-react"
import styles from "../styles/accountant-appointments.module.css"
import axiosInstance from "@/helper/axiosSetup"
import { useAccountantLanguage } from "../contexts/accountant-language-context"
import { sendNotification } from "@/helper/notification-helper"

export function AccountantAppointments() {
  const { language } = useAccountantLanguage()
  const isRTL = language === "ar"

  // Translations
  const t = {
    en: {
      title: "Accountant Dashboard",
      subtitle: "Manage payments and financial records",
      searchPlaceholder: "Search appointments...",
      filters: {
        status: "Status",
        allStatus: "All Status",
        active: "Active",
        notActive: "Not Active",
        paymentStatus: "Payment Status",
        allPayments: "All Payments",
        pending: "Pending",
        partiallyPaid: "Partially Paid",
        fullyPaid: "Fully Paid",
        clearFilters: "Clear Filters",
      },
      stats: {
        total: "Total",
        pending: "Pending",
        partial: "Partial",
        completed: "Completed",
      },
      table: {
        patient: "Student",
        date: "Date",
        programType: "Program Type",
        paymentStatus: "Payment Status",
        remaining: "Remaining",
        actions: "Actions",
      },
      badges: {
        fullyPaid: "Fully Paid",
        partiallyPaid: "Partially Paid",
        pending: "Pending",
        unknown: "Unknown",
      },
      actions: {
        viewDetails: "View Details",
        processPayment: "Process Payment",
      },
      emptyState: {
        title: "No appointments found",
        description: "Try adjusting your search or filters",
        noActive: "No active appointments requiring payment at this time",
      },
      pagination: {
        showing: "Showing",
        to: "to",
        of: "of",
        appointments: "appointments",
      },
      modals: {
        completePayment: "Complete Payment",
        paymentSummary: "Payment Summary",
        patient: "Student:",
        program: "Program:",
        alreadyPaid: "Already Paid:",
        remainingAmount: "Remaining Amount:",
        paymentMethod: "Payment Method",
        cashPayment: "Cash Payment (4,000 AED)",
        installmentPayment: "Installment Payment (Checks)",
        checkDetails: "Check Details",
        addCheck: "Add Check",
        total: "Total",
        min: "Min",
        checkNumber: "Check #",
        amount: "Amount (AED) *",
        checkNumberField: "Check Number *",
        bankName: "Bank Name",
        dueDate: "Due Date *",
        enterAmount: "Enter amount",
        enterCheckNumber: "Enter check number",
        enterBankName: "Enter bank name",
        cancel: "Cancel",
        processing: "Processing...",
        completePaymentButton: "Complete Payment",
        appointmentDetails: "Appointment Details",
        patientName: "Student Name:",
        time: "Time:",
        totalAmount: "Total Amount:",
        paidAmount: "Paid Amount:",
        description: "Description:",
        subscriptionEndDate: "Subscription End Date:",
        close: "Close",
      },
      loading: "Loading appointments...",
      messages: {
        paymentSuccess: "Payment completed successfully! Student has been assigned to all departments.",
        paymentError: "Error completing payment: ",
        validationErrors: "Please fix the following errors:",
        minAmount: "Total check amount ({amount} AED) must be at least 4000 AED",
        checkAmountRequired: "Check {number}: Amount is required and must be greater than 0",
        checkNumberRequired: "Check {number}: Check number is required",
        dueDateRequired: "Check {number}: Due date is required",
      },
    },
    ar: {
      title: "لوحة قيادة المحاسب",
      subtitle: "إدارة المدفوعات والسجلات المالية",
      searchPlaceholder: "البحث في المواعيد...",
      filters: {
        status: "الحالة",
        allStatus: "جميع الحالات",
        active: "نشط",
        notActive: "غير نشط",
        paymentStatus: "حالة الدفع",
        allPayments: "جميع المدفوعات",
        pending: "معلق",
        partiallyPaid: "مدفوع جزئياً",
        fullyPaid: "مدفوع بالكامل",
        clearFilters: "مسح المرشحات",
      },
      stats: {
        total: "الإجمالي",
        pending: "معلق",
        partial: "جزئي",
        completed: "مكتمل",
      },
      table: {
        patient: "الطالب",
        date: "التاريخ",
        programType: "نوع البرنامج",
        paymentStatus: "حالة الدفع",
        remaining: "المتبقي",
        actions: "الإجراءات",
      },
      badges: {
        fullyPaid: "مدفوع بالكامل",
        partiallyPaid: "مدفوع جزئياً",
        pending: "معلق",
        unknown: "غير معروف",
      },
      actions: {
        viewDetails: "عرض التفاصيل",
        processPayment: "معالجة الدفع",
      },
      emptyState: {
        title: "لم يتم العثور على مواعيد",
        description: "حاول تعديل البحث أو المرشحات",
        noActive: "لا توجد مواعيد نشطة تتطلب دفع في هذا الوقت",
      },
      pagination: {
        showing: "عرض",
        to: "إلى",
        of: "من",
        appointments: "موعد",
      },
      modals: {
        completePayment: "إكمال الدفع",
        paymentSummary: "ملخص الدفع",
        patient: "الطالب:",
        program: "البرنامج:",
        alreadyPaid: "مدفوع مسبقاً:",
        remainingAmount: "المبلغ المتبقي:",
        paymentMethod: "طريقة الدفع",
        cashPayment: "دفع نقدي (4,000 درهم امراتي)",
        installmentPayment: "دفع بالأقساط (شيكات)",
        checkDetails: "تفاصيل الشيكات",
        addCheck: "إضافة شيك",
        total: "الإجمالي",
        min: "الحد الأدنى",
        checkNumber: "شيك رقم",
        amount: "المبلغ (درهم امراتي) *",
        checkNumberField: "رقم الشيك *",
        bankName: "اسم البنك",
        dueDate: "تاريخ الاستحقاق *",
        enterAmount: "أدخل المبلغ",
        enterCheckNumber: "أدخل رقم الشيك",
        enterBankName: "أدخل اسم البنك",
        cancel: "إلغاء",
        processing: "جاري المعالجة...",
        completePaymentButton: "إكمال الدفع",
        appointmentDetails: "تفاصيل الموعد",
        patientName: "اسم الطالب:",
        time: "الوقت:",
        totalAmount: "المبلغ الإجمالي:",
        paidAmount: "المبلغ المدفوع:",
        description: "الوصف:",
        subscriptionEndDate: "تاريخ انتهاء الاشتراك:",
        close: "إغلاق",
      },
      loading: "جاري تحميل المواعيد...",
      messages: {
        paymentSuccess: "تم إكمال الدفع بنجاح! تم تعيين الطالب لجميع الأقسام.",
        paymentError: "خطأ في إكمال الدفع: ",
        validationErrors: "يرجى إصلاح الأخطاء التالية:",
        minAmount: "إجمالي مبلغ الشيكات ({amount} درهم امراتي) يجب أن يكون 4000 درهم امراتي على الأقل",
        checkAmountRequired: "الشيك {number}: المبلغ مطلوب ويجب أن يكون أكبر من 0",
        checkNumberRequired: "الشيك {number}: رقم الشيك مطلوب",
        dueDateRequired: "الشيك {number}: تاريخ الاستحقاق مطلوب",
      },
    },
  }

  const translations = t[language]

  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState("active")
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all")
  const itemsPerPage = 10

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [checkDetails, setCheckDetails] = useState([
    { amount: "", checkNumber: "", bankName: "", dueDate: "" },
    { amount: "", checkNumber: "", bankName: "", dueDate: "" },
  ])
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchActiveAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, search, filterStatus, filterPaymentStatus])

  const fetchPatientName = async (patientId) => {
    try {
      const response = await axiosInstance.get(`/authentication/patient/${patientId}`)
      return response.data.name || `Student-${patientId}`
    } catch (error) {
      console.error("Error fetching Student name:", error)
      return `Student-${patientId}`
    }
  }

  const fetchActiveAppointments = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get("/full/fullprogram")
      const data = response.data
      const activeAppointments = data.filter(
        (appointment) =>
          appointment.status === "active" &&
          appointment.programType === "full_program" &&
          (appointment.paymentStatus === "PARTIALLY_PAID" || appointment.paymentStatus === "FULLY_PAID"),
      )
      const appointmentsWithNames = await Promise.all(
        activeAppointments.map(async (appointment) => {
          const patientName = await fetchPatientName(appointment.patientid)
          return {
            ...appointment,
            patientName: patientName,
          }
        }),
      )
      // Sort by date
      const sortedAppointments = appointmentsWithNames.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`)
        const dateTimeB = new Date(`${b.date}T${b.time}`)
        return dateTimeB - dateTimeA
      })
      setAppointments(sortedAppointments)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments
    // Search filter
    if (search) {
      filtered = filtered.filter(
        (appointment) =>
          (appointment.patientName && appointment.patientName.toLowerCase().includes(search.toLowerCase())) ||
          (appointment.description && appointment.description.toLowerCase().includes(search.toLowerCase())),
      )
    }
    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === filterStatus)
    }
    // Payment status filter
    if (filterPaymentStatus !== "all") {
      filtered = filtered.filter((appointment) => appointment.paymentStatus === filterPaymentStatus)
    }
    setFilteredAppointments(filtered)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    filterAppointments()
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const getPaymentStatusBadge = (appointment) => {
    const { paymentStatus, paymentPercentage } = appointment
    switch (paymentStatus) {
      case "FULLY_PAID":
        return <span className={`${styles.statusBadge} ${styles.fullyPaid}`}>{translations.badges.fullyPaid}</span>
      case "PARTIALLY_PAID":
        return (
          <span className={`${styles.statusBadge} ${styles.partiallyPaid}`}>
            {translations.badges.partiallyPaid} ({paymentPercentage}%)
          </span>
        )
      case "PENDING":
        return <span className={`${styles.statusBadge} ${styles.pending}`}>{translations.badges.pending}</span>
      default:
        return <span className={`${styles.statusBadge} ${styles.pending}`}>{translations.badges.unknown}</span>
    }
  }

  const getRemainingAmount = (appointment) => {
    // Use the actual remaining amount from the appointment data
    if (appointment.remainingAmount !== undefined) {
      return appointment.remainingAmount
    }
    // Fallback calculation if remainingAmount is not available
    const totalAmount = appointment.totalAmount || (appointment.programType === "full_program" ? 5000 : 0)
    const paidAmount = appointment.paidAmount || 0
    return Math.max(0, totalAmount - paidAmount)
  }

  const handleProcessPayment = (appointment) => {
    setSelectedAppointment(appointment)
    setPaymentMethod("cash")
    // Reset check details with empty values for customization
    setCheckDetails([
      { amount: "", checkNumber: "", bankName: "", dueDate: "" },
      { amount: "", checkNumber: "", bankName: "", dueDate: "" },
    ])
    setShowPaymentModal(true)
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowViewModal(true)
  }

  // Add new check
  const addCheck = () => {
    setCheckDetails([...checkDetails, { amount: "", checkNumber: "", bankName: "", dueDate: "" }])
  }

  // Remove check
  const removeCheck = (index) => {
    if (checkDetails.length > 1) {
      const newChecks = checkDetails.filter((_, i) => i !== index)
      setCheckDetails(newChecks)
    }
  }

  // Calculate total check amount
  const getTotalCheckAmount = () => {
    return checkDetails.reduce((total, check) => total + (Number.parseFloat(check.amount) || 0), 0)
  }

  // Validate check details
  const validateCheckDetails = () => {
    const errors = []
    let totalAmount = 0
    checkDetails.forEach((check, index) => {
      if (!check.amount || Number.parseFloat(check.amount) <= 0) {
        errors.push(translations.messages.checkAmountRequired.replace("{number}", index + 1))
      }
      if (!check.checkNumber.trim()) {
        errors.push(translations.messages.checkNumberRequired.replace("{number}", index + 1))
      }
      if (!check.dueDate) {
        errors.push(translations.messages.dueDateRequired.replace("{number}", index + 1))
      }
      totalAmount += Number.parseFloat(check.amount) || 0
    })
    if (totalAmount < 4000) {
      errors.push(translations.messages.minAmount.replace("{amount}", totalAmount))
    }
    return errors
  }

  const handleCompletePayment = async () => {
    if (!selectedAppointment) return
    // Validate installment details if needed
    if (paymentMethod === "installment") {
      const validationErrors = validateCheckDetails()
      if (validationErrors.length > 0) {
        alert(translations.messages.validationErrors + "\n" + validationErrors.join("\n"))
        return
      }
    }
    setProcessing(true)
    try {
      const totalCheckAmount = getTotalCheckAmount()
      const paymentData = {
        appointmentId: selectedAppointment._id,
        paymentMethod: paymentMethod,
        amount: paymentMethod === "cash" ? 4000 : totalCheckAmount,
        patientId: selectedAppointment.patientid,
        patientName: selectedAppointment.patientName,
        checkDetails: paymentMethod === "installment" ? checkDetails : null,
      }
      const response = await axiosInstance.post("/authentication/completeFullProgramPayment", paymentData)
      if (response.status === 200) {
        // Assign to departments if the payment is successful, regardless of the payment method
        await assignToAllDepartments(
          response.data.patientId,
          response.data.programDescription,
          selectedAppointment.patientName,
        )

        await sendPaymentNotification(
          selectedAppointment.patientid,
          selectedAppointment.patientName,
          paymentMethod,
          checkDetails,
        )

        alert(translations.messages.paymentSuccess)
        setShowPaymentModal(false)
        setSelectedAppointment(null)
        fetchActiveAppointments() // Refresh the list
      }
    } catch (error) {
      console.error("Error completing payment:", error)
      alert(translations.messages.paymentError + (error.response?.data?.message || error.message))
    } finally {
      setProcessing(false)
    }
  }

  const sendPaymentNotification = async (patientId, patientName, paymentMethod, checkDetails) => {
    try {
      if (paymentMethod === "cash") {
        // Cash payment - program is fully paid
        const notificationTitle = language === "ar" ? "تم تأكيد الدفع النقدي" : "Cash Payment Confirmed"
        const notificationMessage =
          language === "ar"
            ? `تم تأكيد دفع برنامجك بالكامل بنجاح. مبروك! يمكنك الآن البدء في برنامجك الكامل.`
            : `Your full program payment has been confirmed successfully. Congratulations! You can now start your full program.`

        await sendNotification({
          isList: false,
          receiverId: patientId,
          rule: "Patient",
          title: notificationTitle,
          titleAr: "تم تأكيد الدفع النقدي",
          message: notificationMessage,
          messageAr: `تم تأكيد دفع برنامجك بالكامل بنجاح. مبروك! يمكنك الآن البدء في برنامجك الكامل.`,
          type: "confirmed",
        })
      } else if (paymentMethod === "installment") {
        // Installment payment - program started with checks to be paid
        const numberOfChecks = checkDetails.filter((check) => check.amount && check.amount > 0).length
        const notificationTitle = language === "ar" ? "تم بدء البرنامج" : "Program Started"
        const notificationMessage =
          language === "ar"
            ? `تم بدء برنامجك بنجاح! لديك ${numberOfChecks} شيك${numberOfChecks > 1 ? "ات" : ""} يجب دفعها. تاريخ الاستحقاق الأول: ${checkDetails[0]?.dueDate || "قريباً"}`
            : `Your program has been started successfully! You have ${numberOfChecks} check${numberOfChecks > 1 ? "s" : ""} to pay. First due date: ${checkDetails[0]?.dueDate || "Soon"}`

        await sendNotification({
          isList: false,
          receiverId: patientId,
          rule: "Patient",
          title: notificationTitle,
          titleAr: "تم بدء البرنامج",
          message: notificationMessage,
          messageAr: `تم بدء برنامجك بنجاح! لديك ${numberOfChecks} شيك${numberOfChecks > 1 ? "ات" : ""} يجب دفعها. تاريخ الاستحقاق الأول: ${checkDetails[0]?.dueDate || "قريباً"}`,
          type: "confirmed",
        })
      }

      console.log("[v0] Payment notification sent successfully to patient:", patientId)
    } catch (error) {
      console.error("[v0] Error sending payment notification:", error)
      // Don't throw error - payment was successful, notification failure shouldn't block the flow
    }
  }

  // Add this new function to handle assignments to all 5 departments
  const assignToAllDepartments = async (patientId, description, patientName) => {
    const departments = [
      { endpoint: "/aba/assign-to-ABA", name: "ABA" },
      { endpoint: "/speech/assign-to-Speech", name: "Speech" },
      { endpoint: "/SpecialEducation/assign-to-Special-Education", name: "Special Education" },
      { endpoint: "/physicalTherapy/assign-to-physical", name: "Physical Therapy" },
      { endpoint: "/OccupationalTherapy/assign-to-Occupational", name: "Occupational Therapy" },
    ]

    const assignmentResults = {
      totalAssigned: 0,
      totalFailed: 0,
      details: [],
    }

    for (const dept of departments) {
      try {
        const assignmentData = {
          patientId: patientId,
          notes: description || `Full program assignment for ${patientName} - ${dept.name}`,
        }
        const response = await axiosInstance.post(dept.endpoint, assignmentData)
        if (response.status === 201) {
          assignmentResults.totalAssigned++
          assignmentResults.details.push({
            department: dept.name,
            success: true,
            assignment: response.data,
          })
        }
      } catch (error) {
        assignmentResults.totalFailed++
        assignmentResults.details.push({
          department: dept.name,
          success: false,
          error: error.response?.data?.message || `Failed to assign to ${dept.name}`,
        })
        console.error(`Error assigning to ${dept.name}:`, error)
      }
    }
    if (assignmentResults.totalFailed > 0) {
      console.warn(`${assignmentResults.totalFailed} department assignments failed`)
    }
    return assignmentResults
  }

  const closeModals = () => {
    setShowPaymentModal(false)
    setShowViewModal(false)
    setSelectedAppointment(null)
    setPaymentMethod("cash")
    setCheckDetails([
      { amount: "", checkNumber: "", bankName: "", dueDate: "" },
      { amount: "", checkNumber: "", bankName: "", dueDate: "" },
    ])
  }

  const updateCheckDetail = (index, field, value) => {
    const updatedChecks = [...checkDetails]
    updatedChecks[index][field] = value
    setCheckDetails(updatedChecks)
  }

  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex)

  // Statistics
  const stats = {
    total: appointments.length,
    pending: appointments.filter((app) => app.paymentStatus === "PENDING").length,
    partial: appointments.filter((app) => app.paymentStatus === "PARTIALLY_PAID").length,
    completed: appointments.filter((app) => app.paymentStatus === "FULLY_PAID").length,
  }

  return (
    <div className={`${styles.upcomingContainer} ${isRTL ? styles.rtl : styles.ltr}`}>
      <div className={styles.upcomingCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h2 className={styles.pageTitle}>{translations.title}</h2>
              <p className={styles.pageSubtitle}>{translations.subtitle}</p>
            </div>
            <div className={styles.headerActions}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.searchInputContainer}>
                  <input
                    type="text"
                    className={styles.searchInput}
                    name="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={translations.searchPlaceholder}
                  />
                  <Search className={styles.searchIcon} />
                </div>
              </form>
            </div>
          </div>
          <div className={styles.filtersContainer}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>{translations.filters.status}</label>
                <select
                  className={styles.filterSelect}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">{translations.filters.allStatus}</option>
                  <option value="active">{translations.filters.active}</option>
                  <option value="not active">{translations.filters.notActive}</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>{translations.filters.paymentStatus}</label>
                <select
                  className={styles.filterSelect}
                  value={filterPaymentStatus}
                  onChange={(e) => setFilterPaymentStatus(e.target.value)}
                >
                  <option value="all">{translations.filters.allPayments}</option>
                  <option value="PENDING">{translations.filters.pending}</option>
                  <option value="PARTIALLY_PAID">{translations.filters.partiallyPaid}</option>
                  <option value="FULLY_PAID">{translations.filters.fullyPaid}</option>
                </select>
              </div>
              {(filterStatus !== "active" || filterPaymentStatus !== "all") && (
                <button
                  onClick={() => {
                    setFilterStatus("active")
                    setFilterPaymentStatus("all")
                  }}
                  className={styles.clearFiltersButton}
                >
                  {translations.filters.clearFilters}
                </button>
              )}
            </div>
            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Calendar className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.total}</div>
                  <div className={styles.statLabel}>{translations.stats.total}</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AlertCircle className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.pending}</div>
                  <div className={styles.statLabel}>{translations.stats.pending}</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Clock className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.partial}</div>
                  <div className={styles.statLabel}>{translations.stats.partial}</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CheckCircle className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.completed}</div>
                  <div className={styles.statLabel}>{translations.stats.completed}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>{translations.loading}</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.appointmentsTable}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th>#</th>
                    <th>
                      <div className={styles.headerCell}>
                        <User className={styles.headerIcon} />
                        {translations.table.patient}
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Calendar className={styles.headerIcon} />
                        {translations.table.date}
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <FileText className={styles.headerIcon} />
                        {translations.table.programType}
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <DollarSign className={styles.headerIcon} />
                        {translations.table.paymentStatus}
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <DollarSign className={styles.headerIcon} />
                        {translations.table.remaining}
                      </div>
                    </th>
                    <th className={styles.textCenter}>{translations.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments && currentAppointments.length > 0 ? (
                    currentAppointments.map((appointment, index) => (
                      <tr key={appointment._id} className={styles.tableRow}>
                        <td className={styles.indexCell}>{startIndex + index + 1}</td>
                        <td className={styles.patientCell}>
                          <div className={styles.patientInfo}>
                            <span className={styles.patientName}>
                              {appointment.patientName || `Student-${appointment.patientid}`}
                            </span>
                          </div>
                        </td>
                        <td className={styles.dateCell}>
                          <div className={styles.dateInfo}>
                            <span className={styles.dateValue}>
                              {new Date(appointment.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className={styles.dateYear}>{new Date(appointment.date).getFullYear()}</span>
                          </div>
                        </td>
                        <td className={styles.programTypeCell}>
                          <span className={`${styles.programBadge} ${styles[appointment.programType]}`}>
                            {appointment.programType?.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className={styles.paymentStatusCell}>{getPaymentStatusBadge(appointment)}</td>
                        <td className={styles.remainingCell}>
                          <span
                            className={`${styles.remainingAmount} ${appointment.paymentStatus === "FULLY_PAID" ? styles.fullyPaidAmount : ""}`}
                          >
                            {appointment.paymentStatus === "FULLY_PAID" ? "0" : getRemainingAmount(appointment)}{" "}
                            {language === "ar" ? "درهم امراتي" : "AED"}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleViewDetails(appointment)}
                              className={`${styles.actionButton} ${styles.viewButton}`}
                              title={translations.actions.viewDetails}
                            >
                              <Eye className={styles.actionIcon} />
                            </button>
                            {appointment.programType === "full_program" &&
                              appointment.paymentStatus !== "FULLY_PAID" && (
                                <button
                                  onClick={() => handleProcessPayment(appointment)}
                                  className={`${styles.actionButton} ${styles.payButton}`}
                                  title={translations.actions.processPayment}
                                >
                                  <CreditCard className={styles.actionIcon} />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className={styles.noData}>
                        <div className={styles.emptyState}>
                          <DollarSign className={styles.emptyIcon} />
                          <h3>{translations.emptyState.title}</h3>
                          <p>
                            {search || filterStatus !== "active" || filterPaymentStatus !== "all"
                              ? translations.emptyState.description
                              : translations.emptyState.noActive}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {filteredAppointments.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                {translations.pagination.showing} {startIndex + 1} {translations.pagination.to}{" "}
                {Math.min(endIndex, filteredAppointments.length)} {translations.pagination.of}{" "}
                {filteredAppointments.length} {translations.pagination.appointments}
              </span>
              <div className={styles.paginationButtons}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.active : ""}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Payment Modal */}
      {showPaymentModal && selectedAppointment && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{translations.modals.completePayment}</h3>
              <button onClick={closeModals} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.paymentSummary}>
                <h4>{translations.modals.paymentSummary}</h4>
                <div className={styles.summaryRow}>
                  <span>{translations.modals.patient}</span>
                  <span>{selectedAppointment.patientName}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>{translations.modals.program}</span>
                  <span>{language === "ar" ? "البرنامج الكامل" : "Full Program"}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>{translations.modals.alreadyPaid}</span>
                  <span>1,000 {language === "ar" ? "درهم امراتي" : "AED"}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>{translations.modals.remainingAmount}</span>
                  <span className={styles.remainingHighlight}>4,000 {language === "ar" ? "درهم امراتي" : "AED"}</span>
                </div>
              </div>
              <div className={styles.paymentMethodSection}>
                <h4>{translations.modals.paymentMethod}</h4>
                <div className={styles.paymentOptions}>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>{translations.modals.cashPayment}</span>
                  </label>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="installment"
                      checked={paymentMethod === "installment"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>{translations.modals.installmentPayment}</span>
                  </label>
                </div>
              </div>
              {paymentMethod === "installment" && (
                <div className={styles.checkDetailsSection}>
                  <div className={styles.checkHeader}>
                    <h4>{translations.modals.checkDetails}</h4>
                    <div className={styles.checkActions}>
                      <button onClick={addCheck} className={styles.addCheckButton} type="button">
                        <Plus className={styles.buttonIcon} />
                        {translations.modals.addCheck}
                      </button>
                      <div className={styles.totalAmount}>
                        {translations.modals.total}: {getTotalCheckAmount()} {language === "ar" ? "درهم امراتي" : "AED"}{" "}
                        ({translations.modals.min}: 4,000 {language === "ar" ? "درهم امراتي" : "AED"})
                      </div>
                    </div>
                  </div>
                  {checkDetails.map((check, index) => (
                    <div key={index} className={styles.checkForm}>
                      <div className={styles.checkFormHeader}>
                        <h5>
                          {translations.modals.checkNumber} {index + 1}
                        </h5>
                        {checkDetails.length > 1 && (
                          <button onClick={() => removeCheck(index)} className={styles.removeCheckButton} type="button">
                            <Minus className={styles.buttonIcon} />
                          </button>
                        )}
                      </div>
                      <div className={styles.checkFormGrid}>
                        <div className={styles.formGroup}>
                          <label>{translations.modals.amount}</label>
                          <input
                            type="number"
                            value={check.amount}
                            onChange={(e) => updateCheckDetail(index, "amount", e.target.value)}
                            className={styles.formInput}
                            placeholder={translations.modals.enterAmount}
                            min="1"
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>{translations.modals.checkNumberField}</label>
                          <input
                            type="text"
                            value={check.checkNumber}
                            onChange={(e) => updateCheckDetail(index, "checkNumber", e.target.value)}
                            className={styles.formInput}
                            placeholder={translations.modals.enterCheckNumber}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>{translations.modals.bankName}</label>
                          <input
                            type="text"
                            value={check.bankName}
                            onChange={(e) => updateCheckDetail(index, "bankName", e.target.value)}
                            className={styles.formInput}
                            placeholder={translations.modals.enterBankName}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>{translations.modals.dueDate}</label>
                          <input
                            type="date"
                            value={check.dueDate}
                            onChange={(e) => updateCheckDetail(index, "dueDate", e.target.value)}
                            className={styles.formInput}
                            min={new Date().toISOString().split("T")[0]}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModals} className={styles.cancelButton} disabled={processing}>
                {translations.modals.cancel}
              </button>
              <button onClick={handleCompletePayment} className={styles.completeButton} disabled={processing}>
                <CreditCard className={styles.buttonIcon} />
                {processing
                  ? translations.modals.processing
                  : paymentMethod === "cash"
                    ? `${translations.modals.completePaymentButton} (4,000 ${language === "ar" ? "درهم امراتي" : "AED"})`
                    : `${translations.modals.completePaymentButton} (${getTotalCheckAmount()} ${language === "ar" ? "درهم امراتي" : "AED"})`}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Details Modal */}
      {showViewModal && selectedAppointment && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{translations.modals.appointmentDetails}</h3>
              <button onClick={closeModals} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <label>{translations.modals.patientName}</label>
                  <span>{selectedAppointment.patientName}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>{translations.table.date}:</label>
                  <span>
                    {new Date(selectedAppointment.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label>{translations.modals.time}</label>
                  <span>{selectedAppointment.time}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>{translations.table.programType}:</label>
                  <span>{selectedAppointment.programType?.replace("_", " ").toUpperCase()}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>{translations.modals.totalAmount}</label>
                  <span>
                    {selectedAppointment.totalAmount} {language === "ar" ? "درهم امراتي" : "AED"}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label>{translations.modals.paidAmount}</label>
                  <span>
                    {selectedAppointment.paidAmount} {language === "ar" ? "درهم امراتي" : "AED"}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label>{translations.table.remaining}:</label>
                  <span>
                    {selectedAppointment.remainingAmount} {language === "ar" ? "درهم امراتي" : "AED"}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label>{translations.table.paymentStatus}:</label>
                  {getPaymentStatusBadge(selectedAppointment)}
                </div>
                <div className={styles.detailItem}>
                  <label>{translations.modals.description}</label>
                  <span>{selectedAppointment.description}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>{translations.modals.subscriptionEndDate}</label>
                  <span>
                    {selectedAppointment.subscriptionEndDate
                      ? new Date(selectedAppointment.subscriptionEndDate).toLocaleDateString(
                        language === "ar" ? "ar-EG" : "en-US",
                      )
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModals} className={styles.cancelButton}>
                {translations.modals.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
