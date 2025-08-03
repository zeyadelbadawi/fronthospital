"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/helper/axiosSetup"
import { Search, Plus, Eye, Edit, Trash2, Download, Calendar, User, FileText, X, Save } from "lucide-react"
import styles from "@/styles/payment-management.module.css"

const PaymentTransactionsTable = ({ language = "en" }) => {
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [programTypeFilter, setProgramTypeFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create")
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Form state
  const [formData, setFormData] = useState({
    patientId: "",
    programId: "",
    price: "",
    status: "completed",
    invoiceId: "",
    programType: "",
    comment: "",
  })

  const [formErrors, setFormErrors] = useState({})

  // Translation object
  const translations = {
    en: {
      title: "Payment Management System",
      subtitle: "Manage and track all payment transactions",
      searchPlaceholder: "Search by Student name, invoice ID, or program...",
      status: "Status",
      allStatuses: "All Statuses",
      completed: "Completed",
      pending: "Pending",
      cancelled: "Cancelled",
      programType: "Program Type",
      allPrograms: "All Programs",
      speechTherapy: "Speech Therapy",
      physicalTherapy: "Physical Therapy",
      occupationalTherapy: "Occupational Therapy",
      abaTherapy: "ABA Therapy",
      specialEducation: "Special Education",
      clearFilters: "Clear Filters",
      addPayment: "Add Payment",
      exportCSV: "Export CSV",
      totalAmount: "Total Amount (AED)",
      totalRecords: "Total Records",
      uniqueStudents: "Unique Students",
      noPaymentRecords: "No Payment Records Found",
      noPaymentMessage:
        "No payment records match your current filters. Try adjusting your search criteria or add a new payment record.",
      invoiceId: "Invoice ID",
      student: "Student",
      amount: "Amount",
      date: "Date",
      actions: "Actions",
      viewDetails: "View Details",
      editPayment: "Edit Payment",
      deletePayment: "Delete Payment",
      showing: "Showing",
      to: "to",
      of: "of",
      records: "records",
      addNewPayment: "Add New Payment",
      editPaymentTitle: "Edit Payment",
      paymentDetails: "Payment Details",
      patientId: "Student ID",
      programId: "Program ID",
      selectStudent: "Select a student",
      studentNotFound: "Student not found",
      enterProgramId: "Enter program ID",
      enterAmount: "Enter amount",
      enterInvoiceId: "Enter invoice ID",
      selectProgramType: "Select program type",
      enterComment: "Enter comment or notes",
      cancel: "Cancel",
      createPayment: "Create Payment",
      updatePayment: "Update Payment",
      deleteConfirm: "Are you sure you want to delete this payment record?",
      loadingPayments: "Loading payment records...",
      comment: "Comment",
      patientIdRequired: "Student ID is required",
      programIdRequired: "Program ID is required",
      validPriceRequired: "Valid price is required",
      invoiceIdRequired: "Invoice ID is required",
      programTypeRequired: "Program type is required",
      commentRequired: "Comment is required",
      currency: "AED",
    },
    ar: {
      title: "نظام إدارة المدفوعات",
      subtitle: "إدارة وتتبع جميع معاملات الدفع",
      searchPlaceholder: "البحث بالاسم أو رقم الفاتورة أو البرنامج...",
      status: "الحالة",
      allStatuses: "جميع الحالات",
      completed: "مكتمل",
      pending: "معلق",
      cancelled: "ملغي",
      programType: "نوع البرنامج",
      allPrograms: "جميع البرامج",
      speechTherapy: "علاج النطق",
      physicalTherapy: "العلاج الطبيعي",
      occupationalTherapy: "العلاج الوظيفي",
      abaTherapy: "علاج ABA",
      specialEducation: "التعليم الخاص",
      clearFilters: "مسح المرشحات",
      addPayment: "إضافة دفعة",
      exportCSV: "تصدير CSV",
      totalAmount: "المبلغ الإجمالي (درهم اماراتي)",
      totalRecords: "إجمالي السجلات",
      uniqueStudents: "الطلاب الفريدون",
      noPaymentRecords: "لم يتم العثور على سجلات دفع",
      noPaymentMessage: "لا توجد سجلات دفع تطابق المرشحات الحالية. جرب تعديل معايير البحث أو أضف سجل دفع جديد.",
      invoiceId: "رقم الفاتورة",
      student: "الطالب",
      amount: "المبلغ",
      date: "التاريخ",
      actions: "الإجراءات",
      viewDetails: "عرض التفاصيل",
      editPayment: "تعديل الدفعة",
      deletePayment: "حذف الدفعة",
      showing: "عرض",
      to: "إلى",
      of: "من",
      records: "سجل",
      addNewPayment: "إضافة دفعة جديدة",
      editPaymentTitle: "تعديل الدفعة",
      paymentDetails: "تفاصيل الدفعة",
      patientId: "رقم الطالب",
      programId: "رقم البرنامج",
      selectStudent: "اختر طالباً",
      studentNotFound: "الطالب غير موجود",
      enterProgramId: "أدخل رقم البرنامج",
      enterAmount: "أدخل المبلغ",
      enterInvoiceId: "أدخل رقم الفاتورة",
      selectProgramType: "اختر نوع البرنامج",
      enterComment: "أدخل تعليق أو ملاحظات",
      cancel: "إلغاء",
      createPayment: "إنشاء دفعة",
      updatePayment: "تحديث الدفعة",
      deleteConfirm: "هل أنت متأكد من حذف سجل الدفع هذا؟",
      loadingPayments: "جاري تحميل سجلات الدفع...",
      comment: "التعليق",
      patientIdRequired: "رقم الطالب مطلوب",
      programIdRequired: "رقم البرنامج مطلوب",
      validPriceRequired: "سعر صحيح مطلوب",
      invoiceIdRequired: "رقم الفاتورة مطلوب",
      programTypeRequired: "نوع البرنامج مطلوب",
      commentRequired: "التعليق مطلوب",
      currency: "درهم اماراتي",
    },
  }

  const t = translations[language]
  const isRTL = language === "ar"

  useEffect(() => {
    fetchPayments()
    fetchStudents()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get("/money")
      if (response.data.success) {
        setPayments(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
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
    if (!formData.price || Number(formData.price) <= 0) errors.price = t.validPriceRequired
    if (!formData.invoiceId.trim()) errors.invoiceId = t.invoiceIdRequired
    if (!formData.programType.trim()) errors.programType = t.programTypeRequired
    if (!formData.comment.trim()) errors.comment = t.commentRequired

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
      }

      if (modalMode === "create") {
        const response = await axiosInstance.post("/money", payload)
        if (response.data.success) {
          setPayments((prev) => [response.data.data, ...prev])
          setShowModal(false)
          resetForm()
        }
      } else if (modalMode === "edit" && selectedPayment) {
        const response = await axiosInstance.put(`/money/${selectedPayment._id}`, payload)
        if (response.data.success) {
          setPayments((prev) => prev.map((p) => (p._id === selectedPayment._id ? response.data.data : p)))
          setShowModal(false)
          resetForm()
        }
      }
    } catch (error) {
      console.error("Error saving payment:", error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return

    try {
      const response = await axiosInstance.delete(`/money/${id}`)
      if (response.data.success) {
        setPayments((prev) => prev.filter((p) => p._id !== id))
      }
    } catch (error) {
      console.error("Error deleting payment:", error)
    }
  }

  const openModal = (mode, payment) => {
    setModalMode(mode)
    setSelectedPayment(payment || null)
    if (payment && (mode === "edit" || mode === "view")) {
      setFormData({
        patientId: payment.patientId._id,
        programId: payment.programId,
        price: payment.price.toString(),
        status: payment.status,
        invoiceId: payment.invoiceId,
        programType: payment.programType,
        comment: payment.comment,
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
      price: "",
      status: "completed",
      invoiceId: "",
      programType: "",
      comment: "",
    })
    setFormErrors({})
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.patientId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.programType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || payment.status === statusFilter
    const matchesProgram = !programTypeFilter || payment.programType === programTypeFilter

    return matchesSearch && matchesStatus && matchesProgram
  })

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.price, 0)
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)

  const exportToCSV = () => {
    const headers = [t.invoiceId, t.student, t.programType, t.amount, t.status, t.date, t.comment]
    const csvData = filteredPayments.map((payment) => [
      payment.invoiceId,
      payment.patientId.name,
      payment.programType,
      payment.price,
      t[payment.status] || payment.status,
      new Date(payment.createdAt).toLocaleDateString(language === "ar" ? "ar-AE" : "en-US"),
      payment.comment,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "payment-transactions.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer} dir={isRTL ? "rtl" : "ltr"}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>{t.loadingPayments}</p>
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
              <div className={styles.pageTitle}>{t.title}</div>
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
                  <option value="completed">{t.completed}</option>
                  <option value="pending">{t.pending}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>{t.programType}</label>
                <select
                  value={programTypeFilter}
                  onChange={(e) => setProgramTypeFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">{t.allPrograms}</option>
                  <option value="Speech Therapy">{t.speechTherapy}</option>
                  <option value="Physical Therapy">{t.physicalTherapy}</option>
                  <option value="Occupational Therapy">{t.occupationalTherapy}</option>
                  <option value="ABA Therapy">{t.abaTherapy}</option>
                  <option value="Special Education">{t.specialEducation}</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setStatusFilter("")
                  setProgramTypeFilter("")
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
                {t.addPayment}
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
                <span className={styles.headerIcon3}> AED</span>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{totalAmount.toLocaleString()}</div>
                <div className={styles.statLabel}>{t.totalAmount}</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FileText className={styles.statIconSvg} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{filteredPayments.length}</div>
                <div className={styles.statLabel}>{t.totalRecords}</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <User className={styles.statIconSvg} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{new Set(filteredPayments.map((p) => p.patientId._id)).size}</div>
                <div className={styles.statLabel}>{t.uniqueStudents}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className={styles.cardBody}>
          {filteredPayments.length === 0 ? (
            <div className={styles.noData}>
              <div className={styles.emptyState}>
                <FileText className={styles.emptyIcon} />
                <h3>{t.noPaymentRecords}</h3>
                <p>{t.noPaymentMessage}</p>
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
                          <FileText className={styles.headerIcon} />
                          {t.invoiceId}
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
                          <Calendar className={styles.headerIcon} />
                          {t.programType}
                        </div>
                      </th>
                      <th>
                        <div className={styles.headerCell}>{t.amount}</div>
                      </th>
                      <th>{t.status}</th>
                      <th>{t.date}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayments.map((payment, index) => (
                      <tr key={payment._id} className={styles.tableRow}>
                        <td className={styles.indexCell}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className={styles.patientCell}>
                          <div className={styles.patientInfo}>
                            <div className={styles.patientName}>{payment.invoiceId}</div>
                            <div className={styles.patientId}>ID: {payment._id.slice(-6).toUpperCase()}</div>
                          </div>
                        </td>
                        <td className={styles.patientCell}>
                          <div className={styles.patientInfo}>
                            <div className={styles.patientName}>{payment.patientId.name}</div>
                            <div className={styles.patientId}>{payment.patientId.email}</div>
                          </div>
                        </td>
                        <td className={styles.servicesCell}>
                          <div className={styles.departmentBadges}>
                            <span className={`${styles.departmentBadge} ${styles.speech}`}>
                              {language === "ar"
                                ? payment.programType === "Speech Therapy"
                                  ? t.speechTherapy
                                  : payment.programType === "Physical Therapy"
                                    ? t.physicalTherapy
                                    : payment.programType === "Occupational Therapy"
                                      ? t.occupationalTherapy
                                      : payment.programType === "ABA Therapy"
                                        ? t.abaTherapy
                                        : payment.programType === "Special Education"
                                          ? t.specialEducation
                                          : payment.programType
                                : payment.programType}
                            </span>
                          </div>
                        </td>
                        <td className={styles.dateCell}>
                          <div className={styles.dateInfo}>
                            <div className={styles.appointmentDate}>
                              <span className={styles.dateValue}>
                                {payment.price.toLocaleString()} {t.currency}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.typeCell}>
                          <span
                            className={`${styles.typeBadge} ${
                              payment.status === "completed"
                                ? styles.completed
                                : payment.status === "pending"
                                  ? styles.pending
                                  : styles.assessment
                            }`}
                          >
                            {t[payment.status] || payment.status}
                          </span>
                        </td>
                        <td className={styles.dateCell}>
                          <div className={styles.dateInfo}>
                            <div className={styles.appointmentDate}>
                              <Calendar className={styles.dateIcon} />
                              <span className={styles.dateValue}>
                                {new Date(payment.createdAt).toLocaleDateString(language === "ar" ? "ar-AE" : "en-US")}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => openModal("view", payment)}
                              className={`${styles.actionButton} ${styles.viewButton}`}
                              title={t.viewDetails}
                            >
                              <Eye className={styles.actionIcon} />
                            </button>
                            <button
                              onClick={() => openModal("edit", payment)}
                              className={`${styles.actionButton} ${styles.editButton}`}
                              title={t.editPayment}
                            >
                              <Edit className={styles.actionIcon} />
                            </button>
                            <button
                              onClick={() => handleDelete(payment._id)}
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              title={t.deletePayment}
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
                    {Math.min(currentPage * itemsPerPage, filteredPayments.length)} {t.of} {filteredPayments.length}{" "}
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
                  ? t.addNewPayment
                  : modalMode === "edit"
                    ? t.editPaymentTitle
                    : t.paymentDetails}
              </h3>
              <button onClick={() => setShowModal(false)} className={styles.closeButton}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.modalContent}>
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
                  <label>
                    {t.amount} ({t.currency})
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    className={styles.formInput}
                    disabled={modalMode === "view"}
                    placeholder={t.enterAmount}
                    min="0"
                    step="0.01"
                  />
                  {formErrors.price && <span className="text-red-500 text-sm">{formErrors.price}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>{t.invoiceId}</label>
                  <input
                    type="text"
                    value={formData.invoiceId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, invoiceId: e.target.value }))}
                    className={styles.formInput}
                    disabled={modalMode === "view"}
                    placeholder={t.enterInvoiceId}
                  />
                  {formErrors.invoiceId && <span className="text-red-500 text-sm">{formErrors.invoiceId}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>{t.programType}</label>
                  <select
                    value={formData.programType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, programType: e.target.value }))}
                    className={styles.formInput}
                    disabled={modalMode === "view"}
                  >
                    <option value="">{t.selectProgramType}</option>
                    <option value="Speech Therapy">{t.speechTherapy}</option>
                    <option value="Physical Therapy">{t.physicalTherapy}</option>
                    <option value="Occupational Therapy">{t.occupationalTherapy}</option>
                    <option value="ABA Therapy">{t.abaTherapy}</option>
                    <option value="Special Education">{t.specialEducation}</option>
                  </select>
                  {formErrors.programType && <span className="text-red-500 text-sm">{formErrors.programType}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>{t.status}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className={styles.formInput}
                    disabled={modalMode === "view"}
                  >
                    <option value="completed">{t.completed}</option>
                    <option value="pending">{t.pending}</option>
                    <option value="cancelled">{t.cancelled}</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>{t.comment}</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                    className={styles.formTextarea}
                    disabled={modalMode === "view"}
                    placeholder={t.enterComment}
                    rows={3}
                  />
                  {formErrors.comment && <span className="text-red-500 text-sm">{formErrors.comment}</span>}
                </div>

                {modalMode !== "view" && (
                  <div className={styles.modalActions}>
                    <button type="button" onClick={() => setShowModal(false)} className={styles.cancelButton}>
                      {t.cancel}
                    </button>
                    <button type="submit" className={styles.completeActionButton}>
                      <Save className="w-4 h-4" />
                      {modalMode === "create" ? t.createPayment : t.updatePayment}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentTransactionsTable
