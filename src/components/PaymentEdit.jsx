"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/helper/axiosSetup"
import { Search, Plus, Eye, Edit, Trash2, Download, Calendar, User, X, Save, CreditCard, Clock, AlertTriangle, CheckCircle, XCircle, Building } from 'lucide-react'
import styles from "@/styles/checks-management.module.css"

const PaymentEdit = ({ language = "en" }) => {
  const [checks, setChecks] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [overdueFilter, setOverdueFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create")
  const [selectedCheck, setSelectedCheck] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Form state
  const [formData, setFormData] = useState({
    patientId: "",
    programId: "",
    moneyId: "",
    checkNumber: "",
    amount: "",
    dueDate: "",
    bankName: "",
    notes: "",
  })

  // Status update form
  const [statusData, setStatusData] = useState({
    status: "pending",
    bouncedReason: "",
  })

  const [formErrors, setFormErrors] = useState({})

  // Translation object
  const translations = {
    en: {
      title: "Checks Management System",
      subtitle: "Manage and track all check payments ",
      searchPlaceholder: "Search by Student name, check number, or bank...",
      status: "Status",
      allStatuses: "All Statuses",
      pending: "Pending",
      deposited: "Deposited",
      cleared: "Cleared",
      bounced: "Bounced",
      cancelled: "Cancelled",
      overdue: "Overdue",
      allChecks: "All Checks",
      overdueOnly: "Overdue Only",
      notOverdue: "Not Overdue",
      clearFilters: "Clear Filters",
      addCheck: "Add Check",
      exportCSV: "Export CSV",
      totalAmount: "Total Amount (AED)",
      totalChecks: "Total Checks",
      overdueChecks: "Overdue Checks",
      noChecksFound: "No Checks Found",
      noChecksMessage: "No checks match your current filters. Try adjusting your search criteria or add a new check.",
      checkNumber: "Check Number",
      student: "Student",
      amount: "Amount",
      dueDate: "Due Date",
      bank: "Bank",
      daysUntilDue: "Days Until Due",
      actions: "Actions",
      viewDetails: "View Details",
      updateStatus: "Update Status",
      editCheck: "Edit Check",
      deleteCheck: "Delete Check",
      showing: "Showing",
      to: "to",
      of: "of",
      records: "records",
      addNewCheck: "Add New Check",
      editCheckTitle: "Edit Check",
      updateCheckStatus: "Update Check Status",
      checkDetails: "Check Details",
      patientId: "Patient ID",
      programId: "Program ID",
      moneyRecordId: "Money Record ID",
      selectStudent: "Select a student",
      studentNotFound: "Student not found",
      enterProgramId: "Enter program ID",
      enterMoneyRecordId: "Enter money record ID",
      enterCheckNumber: "Enter check number (3-20 alphanumeric)",
      enterAmount: "Enter amount",
      enterBankName: "Enter bank name",
      enterNotes: "Enter notes or comments",
      bouncedReason: "Bounced Reason",
      enterBouncedReason: "Enter reason for bounced check",
      cancel: "Cancel",
      createCheck: "Create Check",
      updateCheck: "Update Check",
      updateStatusBtn: "Update Status",
      deleteConfirm: "Are you sure you want to delete this check?",
      loadingChecks: "Loading checks...",
      daysOverdue: "days overdue",
      days: "days",
      invoice: "Invoice",
      patientIdRequired: "Patient ID is required",
      programIdRequired: "Program ID is required",
      moneyIdRequired: "Money record ID is required",
      checkNumberRequired: "Check number is required",
      checkNumberInvalid: "Check number must be 3-20 alphanumeric characters",
      validAmountRequired: "Valid amount is required",
      dueDateRequired: "Due date is required",
      dueDatePast: "Due date cannot be in the past",
      currency: "AED",
    },
    ar: {
      title: "نظام إدارة الشيكات",
      subtitle: "إدارة وتتبع جميع مدفوعات الشيكات",
      searchPlaceholder: "البحث بالاسم أو رقم الشيك أو البنك...",
      status: "الحالة",
      allStatuses: "جميع الحالات",
      pending: "معلق",
      deposited: "مودع",
      cleared: "مقبول",
      bounced: "مرتد",
      cancelled: "ملغي",
      overdue: "متأخر",
      allChecks: "جميع الشيكات",
      overdueOnly: "المتأخرة فقط",
      notOverdue: "غير متأخرة",
      clearFilters: "مسح المرشحات",
      addCheck: "إضافة شيك",
      exportCSV: "تصدير CSV",
      totalAmount: "المبلغ الإجمالي (درهم اماراتي)",
      totalChecks: "إجمالي الشيكات",
      overdueChecks: "الشيكات المتأخرة",
      noChecksFound: "لم يتم العثور على شيكات",
      noChecksMessage: "لا توجد شيكات تطابق المرشحات الحالية. جرب تعديل معايير البحث أو أضف شيكاً جديداً.",
      checkNumber: "رقم الشيك",
      student: "الطالب",
      amount: "المبلغ",
      dueDate: "تاريخ الاستحقاق",
      bank: "البنك",
      daysUntilDue: "أيام حتى الاستحقاق",
      actions: "الإجراءات",
      viewDetails: "عرض التفاصيل",
      updateStatus: "تحديث الحالة",
      editCheck: "تعديل الشيك",
      deleteCheck: "حذف الشيك",
      showing: "عرض",
      to: "إلى",
      of: "من",
      records: "سجل",
      addNewCheck: "إضافة شيك جديد",
      editCheckTitle: "تعديل الشيك",
      updateCheckStatus: "تحديث حالة الشيك",
      checkDetails: "تفاصيل الشيك",
      patientId: "رقم المريض",
      programId: "رقم البرنامج",
      moneyRecordId: "رقم سجل المال",
      selectStudent: "اختر طالباً",
      studentNotFound: "الطالب غير موجود",
      enterProgramId: "أدخل رقم البرنامج",
      enterMoneyRecordId: "أدخل رقم سجل المال",
      enterCheckNumber: "أدخل رقم الشيك (3-20 حرف أو رقم)",
      enterAmount: "أدخل المبلغ",
      enterBankName: "أدخل اسم البنك",
      enterNotes: "أدخل الملاحظات أو التعليقات",
      bouncedReason: "سبب الارتداد",
      enterBouncedReason: "أدخل سبب ارتداد الشيك",
      cancel: "إلغاء",
      createCheck: "إنشاء شيك",
      updateCheck: "تحديث الشيك",
      updateStatusBtn: "تحديث الحالة",
      deleteConfirm: "هل أنت متأكد من حذف هذا الشيك؟",
      loadingChecks: "جاري تحميل الشيكات...",
      daysOverdue: "يوم متأخر",
      days: "أيام",
      invoice: "فاتورة",
      patientIdRequired: "رقم المريض مطلوب",
      programIdRequired: "رقم البرنامج مطلوب",
      moneyIdRequired: "رقم سجل المال مطلوب",
      checkNumberRequired: "رقم الشيك مطلوب",
      checkNumberInvalid: "رقم الشيك يجب أن يكون 3-20 حرف أو رقم",
      validAmountRequired: "مبلغ صحيح مطلوب",
      dueDateRequired: "تاريخ الاستحقاق مطلوب",
      dueDatePast: "تاريخ الاستحقاق لا يمكن أن يكون في الماضي",
      currency: "درهم اماراتي",
    },
  }

  const t = translations[language]
  const isRTL = language === "ar"

  useEffect(() => {
    fetchChecks()
    fetchStudents()
  }, [])

  const fetchChecks = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get("/checks")
      if (response.data.success) {
        setChecks(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching checks:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/authentication/patients")
      if (response.data.patients) {
        setStudents(response.data.patients)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.patientId.trim()) errors.patientId = t.patientIdRequired
    if (!formData.programId.trim()) errors.programId = t.programIdRequired
    if (!formData.moneyId.trim()) errors.moneyId = t.moneyIdRequired
    if (!formData.checkNumber.trim()) errors.checkNumber = t.checkNumberRequired
    else if (!/^[a-zA-Z0-9]{3,20}$/.test(formData.checkNumber.trim())) {
      errors.checkNumber = t.checkNumberInvalid
    }
    if (!formData.amount || Number(formData.amount) <= 0) errors.amount = t.validAmountRequired
    if (!formData.dueDate) errors.dueDate = t.dueDateRequired
    else if (new Date(formData.dueDate) < new Date()) {
      errors.dueDate = t.dueDatePast
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      }

      if (modalMode === "create") {
        const response = await axiosInstance.post("/checks", payload)
        if (response.data.success) {
          setChecks((prev) => [response.data.data, ...prev])
          setShowModal(false)
          resetForm()
        }
      } else if (modalMode === "edit" && selectedCheck) {
        const response = await axiosInstance.put(`/checks/${selectedCheck._id}`, payload)
        if (response.data.success) {
          setChecks((prev) => prev.map((c) => (c._id === selectedCheck._id ? response.data.data : c)))
          setShowModal(false)
          resetForm()
        }
      }
    } catch (error) {
      console.error("Error saving check:", error)
    }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    if (!selectedCheck) return

    try {
      const response = await axiosInstance.put(`/checks/${selectedCheck._id}/status`, statusData)
      if (response.data.success) {
        setChecks((prev) => prev.map((c) => (c._id === selectedCheck._id ? response.data.data : c)))
        setShowModal(false)
      }
    } catch (error) {
      console.error("Error updating check status:", error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return

    try {
      const response = await axiosInstance.delete(`/checks/${id}`)
      if (response.data.success) {
        setChecks((prev) => prev.filter((c) => c._id !== id))
      }
    } catch (error) {
      console.error("Error deleting check:", error)
    }
  }

  const openModal = (mode, check) => {
    setModalMode(mode)
    setSelectedCheck(check || null)
    if (check && (mode === "edit" || mode === "view")) {
      setFormData({
        patientId: check.patientId._id,
        programId: check.programId,
        moneyId: check.moneyId._id,
        checkNumber: check.checkNumber,
        amount: check.amount.toString(),
        dueDate: check.dueDate.split("T")[0],
        bankName: check.bankName,
        notes: check.notes,
      })
    } else if (check && mode === "status") {
      setStatusData({
        status: check.status,
        bouncedReason: check.bouncedReason || "",
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      patientId: "",
      programId: "",
      moneyId: "",
      checkNumber: "",
      amount: "",
      dueDate: "",
      bankName: "",
      notes: "",
    })
    setFormErrors({})
  }

  const filteredChecks = checks.filter((check) => {
    const matchesSearch =
      check.patientId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.checkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.bankName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || check.status === statusFilter
    const matchesOverdue =
      !overdueFilter || (overdueFilter === "true" && check.isOverdue) || (overdueFilter === "false" && !check.isOverdue)

    return matchesSearch && matchesStatus && matchesOverdue
  })

  const totalAmount = filteredChecks.reduce((sum, check) => sum + check.amount, 0)
  const overdueChecks = filteredChecks.filter((c) => c.isOverdue).length
  const paginatedChecks = filteredChecks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredChecks.length / itemsPerPage)

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "deposited":
        return <Building className="w-4 h-4" />
      case "cleared":
        return <CheckCircle className="w-4 h-4" />
      case "bounced":
        return <XCircle className="w-4 h-4" />
      case "cancelled":
        return <X className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const exportToCSV = () => {
    const headers = [t.checkNumber, t.student, t.amount, t.dueDate, t.bank, t.status, t.daysUntilDue]
    const csvData = filteredChecks.map((check) => [
      check.checkNumber,
      check.patientId.name,
      check.amount,
      new Date(check.dueDate).toLocaleDateString(language === "ar" ? "ar-AE" : "en-US"),
      check.bankName,
      t[check.status] || check.status,
      check.daysUntilDue,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "checks-management.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer} dir={isRTL ? "rtl" : "ltr"}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>{t.loadingChecks}</p>
      </div>
    )
  }

  return (
    <div className={styles.upcomingContainer} dir={isRTL ? "rtl" : "ltr"}>
      <div className={styles.upcomingCard}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <div className={styles.pageTitle}>
                <CreditCard className="w-8 h-8" />
                {t.title}
              </div>
              <p className={styles.pageSubtitle}>{t.subtitle}</p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.searchForm}>
                <div className={styles.searchInputContainer}>
                  <Search className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersContainer}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>{t.status}</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">{t.allStatuses}</option>
                  <option value="pending">{t.pending}</option>
                  <option value="deposited">{t.deposited}</option>
                  <option value="cleared">{t.cleared}</option>
                  <option value="bounced">{t.bounced}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>{t.overdue}</label>
                <select
                  value={overdueFilter}
                  onChange={(e) => setOverdueFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">{t.allChecks}</option>
                  <option value="true">{t.overdueOnly}</option>
                  <option value="false">{t.notOverdue}</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setStatusFilter("")
                  setOverdueFilter("")
                  setSearchTerm("")
                }}
                className={styles.clearFiltersButton}
              >
                {t.clearFilters}
              </button>
              <button
                onClick={() => openModal("create")}
                className={`${styles.clearFiltersButton} bg-green-600 hover:bg-green-700`}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addCheck}
              </button>
              <button onClick={exportToCSV} className={`${styles.clearFiltersButton} bg-blue-600 hover:bg-blue-700`}>
                <Download className="w-4 h-4 mr-2" />
                {t.exportCSV}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                          <span  className={styles.headerIcon3}> AED</span>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{totalAmount.toLocaleString()}</div>
                <div className={styles.statLabel}>{t.totalAmount}</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CreditCard className={styles.statIconSvg} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{filteredChecks.length}</div>
                <div className={styles.statLabel}>{t.totalChecks}</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AlertTriangle className={styles.statIconSvg} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{overdueChecks}</div>
                <div className={styles.statLabel}>{t.overdueChecks}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className={styles.cardBody}>
          {filteredChecks.length === 0 ? (
            <div className={styles.noData}>
              <div className={styles.emptyState}>
                <CreditCard className={styles.emptyIcon} />
                <h3>{t.noChecksFound}</h3>
                <p>{t.noChecksMessage}</p>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.appointmentsTable}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th>#</th>
                      <th>
                        <div className={styles.headerCell}>
                          <CreditCard className={styles.headerIcon} />
                          {t.checkNumber}
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <User className={styles.headerIcon} />
                          {t.student}
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <span  className={styles.headerIcon2}> AED</span>
                          {t.amount}
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <Calendar className={styles.headerIcon} />
                          {t.dueDate}
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>
                          <Building className={styles.headerIcon} />
                          {t.bank}
                        </div>
                      </th>
                      <th>{t.status}</th>
                      <th>{t.daysUntilDue}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedChecks.map((check, index) => (
                      <tr key={check._id} className={`${styles.tableRow} ${check.isOverdue ? "bg-red-50" : ""}`}>
                        <td className={styles.indexCell}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className={styles.patientCell}>
                          <div className={styles.patientInfo}>
                            <div className={styles.patientName}>{check.checkNumber}</div>
                            <div className={styles.patientId}>
                              {t.invoice}: {check.moneyId.invoiceId}
                            </div>
                          </div>
                        </td>
                        <td className={styles.patientCell}>
                          <div className={styles.patientInfo}>
                            <div className={styles.patientName}>{check.patientId.name}</div>
                            <div className={styles.patientId}>{check.patientId.email}</div>
                          </div>
                        </td>
                        <td className={styles.dateCell}>
                          <div className={styles.dateInfo}>
                            <div className={styles.appointmentDate}>
                              <span className={styles.dateValue}>
                                {check.amount.toLocaleString()} {t.currency}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.dateCell}>
                          <div className={styles.dateInfo}>
                            <div className={styles.appointmentDate}>
                              <Calendar className={styles.dateIcon} />
                              <span
                                className={`${styles.dateValue} ${check.isOverdue ? "text-red-600 font-bold" : ""}`}
                              >
                                {new Date(check.dueDate).toLocaleDateString(language === "ar" ? "ar-AE" : "en-US")}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.servicesCell}>
                          <div className={styles.departmentBadges}>
                            <span className={`${styles.departmentBadge} ${styles.speech}`}>
                              {check.bankName || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className={styles.typeCell}>
                          <span
                            className={`${styles.typeBadge} ${
                              check.status === "cleared"
                                ? styles.completed
                                : check.status === "deposited"
                                  ? styles.active
                                  : check.status === "bounced"
                                    ? styles.assessment
                                    : check.status === "cancelled"
                                      ? styles.assessment
                                      : styles.pending
                            }`}
                          >
                            {getStatusIcon(check.status)}
                            {t[check.status] || check.status}
                          </span>
                        </td>
                        <td className={styles.dateCell}>
                          <div className={styles.dateInfo}>
                            <div className={styles.appointmentDate}>
                              <Clock className={styles.dateIcon} />
                              <span
                                className={`${styles.dateValue} ${
                                  check.daysUntilDue < 0
                                    ? "text-red-600 font-bold"
                                    : check.daysUntilDue <= 3
                                      ? "text-orange-600 font-semibold"
                                      : ""
                                }`}
                              >
                                {check.daysUntilDue < 0
                                  ? `${Math.abs(check.daysUntilDue)} ${t.daysOverdue}`
                                  : `${check.daysUntilDue} ${t.days}`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => openModal("view", check)}
                              className={`${styles.actionButton} ${styles.viewButton}`}
                              title={t.viewDetails}
                            >
                              <Eye className={styles.actionIcon} />
                            </button>
                            <button
                              onClick={() => openModal("status", check)}
                              className={`${styles.actionButton} ${styles.rescheduleButton}`}
                              title={t.updateStatus}
                            >
                              <Edit className={styles.actionIcon} />
                            </button>
                            <button
                              onClick={() => openModal("edit", check)}
                              className={`${styles.actionButton} ${styles.editButton}`}
                              title={t.editCheck}
                            >
                              <Edit className={styles.actionIcon} />
                            </button>
                            <button
                              onClick={() => handleDelete(check._id)}
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              title={t.deleteCheck}
                              disabled={check.status !== "pending"}
                            >
                              <Trash2 className={styles.actionIcon} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.paginationContainer}>
                  <div className={styles.paginationInfo}>
                    {t.showing} {(currentPage - 1) * itemsPerPage + 1} {t.to}{" "}
                    {Math.min(currentPage * itemsPerPage, filteredChecks.length)} {t.of} {filteredChecks.length}{" "}
                    {t.records}
                  </div>
                  <div className={styles.paginationButtons}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`${styles.paginationButton} ${currentPage === page ? styles.active : ""}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                {modalMode === "create"
                  ? t.addNewCheck
                  : modalMode === "edit"
                    ? t.editCheckTitle
                    : modalMode === "status"
                      ? t.updateCheckStatus
                      : t.checkDetails}
              </h3>
              <button onClick={() => setShowModal(false)} className={styles.closeButton}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalContent}>
              {modalMode === "status" ? (
                <form onSubmit={handleStatusUpdate}>
                  <div className={styles.formGroup}>
                    <label>{t.status}</label>
                    <select
                      value={statusData.status}
                      onChange={(e) => setStatusData((prev) => ({ ...prev, status: e.target.value }))}
                      className={styles.formInput}
                    >
                      <option value="pending">{t.pending}</option>
                      <option value="deposited">{t.deposited}</option>
                      <option value="cleared">{t.cleared}</option>
                      <option value="bounced">{t.bounced}</option>
                      <option value="cancelled">{t.cancelled}</option>
                    </select>
                  </div>
                  {statusData.status === "bounced" && (
                    <div className={styles.formGroup}>
                      <label>{t.bouncedReason}</label>
                      <textarea
                        value={statusData.bouncedReason}
                        onChange={(e) => setStatusData((prev) => ({ ...prev, bouncedReason: e.target.value }))}
                        className={styles.formTextarea}
                        placeholder={t.enterBouncedReason}
                        rows={3}
                      />
                    </div>
                  )}
                  <div className={styles.modalActions}>
                    <button type="button" onClick={() => setShowModal(false)} className={styles.cancelButton}>
                      {t.cancel}
                    </button>
                    <button type="submit" className={styles.completeActionButton}>
                      <Save className="w-4 h-4" />
                      {t.updateStatusBtn}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label>{t.student}</label>
                    {modalMode === "view" || modalMode === "edit" ? (
                      <input
                        type="text"
                        value={
                          modalMode === "edit" || modalMode === "view"
                            ? students.find((s) => s._id === formData.patientId)?.name || t.studentNotFound
                            : ""
                        }
                        className={styles.formInput}
                        disabled
                        placeholder={t.student}
                      />
                    ) : (
                      <select
                        value={formData.patientId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, patientId: e.target.value }))}
                        className={styles.formInput}
                        disabled={modalMode === "view"}
                      >
                        <option value="">{t.selectStudent}</option>
                        {students.map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.name} - {student.email}
                          </option>
                        ))}
                      </select>
                    )}
                    {formErrors.patientId && <span className="text-red-500 text-sm">{formErrors.patientId}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t.programId}</label>
                    <input
                      type="text"
                      value={formData.programId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, programId: e.target.value }))}
                      className={styles.formInput}
                      disabled={modalMode === "view" || modalMode === "edit"}
                      placeholder={t.enterProgramId}
                    />
                    {formErrors.programId && <span className="text-red-500 text-sm">{formErrors.programId}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t.moneyRecordId}</label>
                    <input
                      type="text"
                      value={formData.moneyId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, moneyId: e.target.value }))}
                      className={styles.formInput}
                      disabled={modalMode === "view" || modalMode === "edit"}
                      placeholder={t.enterMoneyRecordId}
                    />
                    {formErrors.moneyId && <span className="text-red-500 text-sm">{formErrors.moneyId}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t.checkNumber}</label>
                    <input
                      type="text"
                      value={formData.checkNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, checkNumber: e.target.value }))}
                      className={styles.formInput}
                      disabled={modalMode === "view" || modalMode === "edit"}
                      placeholder={t.enterCheckNumber}
                    />
                    {formErrors.checkNumber && <span className="text-red-500 text-sm">{formErrors.checkNumber}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      {t.amount} ({t.currency})
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      className={styles.formInput}
                      disabled={modalMode === "view"}
                      placeholder={t.enterAmount}
                      min="0"
                      step="0.01"
                    />
                    {formErrors.amount && <span className="text-red-500 text-sm">{formErrors.amount}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t.dueDate}</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                      className={styles.formInput}
                      disabled={modalMode === "view"}
                    />
                    {formErrors.dueDate && <span className="text-red-500 text-sm">{formErrors.dueDate}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t.bank}</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
                      className={styles.formInput}
                      disabled={modalMode === "view"}
                      placeholder={t.enterBankName}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{language === "ar" ? "الملاحظات" : "Notes"}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      className={styles.formTextarea}
                      disabled={modalMode === "view"}
                      placeholder={t.enterNotes}
                      rows={3}
                    />
                  </div>

                  {modalMode !== "view" && (
                    <div className={styles.modalActions}>
                      <button type="button" onClick={() => setShowModal(false)} className={styles.cancelButton}>
                        {t.cancel}
                      </button>
                      <button type="submit" className={styles.completeActionButton}>
                        <Save className="w-4 h-4" />
                        {modalMode === "create" ? t.createCheck : t.updateCheck}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentEdit
