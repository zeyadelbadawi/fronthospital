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

export function AccountantAppointments() {
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
  }, []) // [^2]

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
      // Filter for active appointments and fetch patient names
      const activeAppointments = data.filter(
        (appointment) => appointment.status === "active" && appointment.programType === "full_program",
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
        return <span className={`${styles.statusBadge} ${styles.fullyPaid}`}>Fully Paid</span>
      case "PARTIALLY_PAID":
        return (
          <span className={`${styles.statusBadge} ${styles.partiallyPaid}`}>Partially Paid ({paymentPercentage}%)</span>
        )
      case "PENDING":
        return <span className={`${styles.statusBadge} ${styles.pending}`}>Pending</span>
      default:
        return <span className={`${styles.statusBadge} ${styles.pending}`}>Unknown</span>
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
        errors.push(`Check ${index + 1}: Amount is required and must be greater than 0`)
      }
      if (!check.checkNumber.trim()) {
        errors.push(`Check ${index + 1}: Check number is required`)
      }
      if (!check.dueDate) {
        errors.push(`Check ${index + 1}: Due date is required`)
      }
      totalAmount += Number.parseFloat(check.amount) || 0
    })
    if (totalAmount < 4000) {
      errors.push(`Total check amount (${totalAmount} AED) must be at least 4000 AED`)
    }
    return errors
  }

  const handleCompletePayment = async () => {
    if (!selectedAppointment) return
    // Validate installment details if needed
    if (paymentMethod === "installment") {
      const validationErrors = validateCheckDetails()
      if (validationErrors.length > 0) {
        alert("Please fix the following errors:\n" + validationErrors.join("\n"))
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
        alert("Payment completed successfully! Student has been assigned to all departments.")
        setShowPaymentModal(false)
        setSelectedAppointment(null)
        fetchActiveAppointments() // Refresh the list
      }
    } catch (error) {
      console.error("Error completing payment:", error)
      alert("Error completing payment: " + (error.response?.data?.message || error.message))
    } finally {
      setProcessing(false)
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
      { endpoint: "/Psychotherapy/assign-to-Psychotherapy", name: "Psychotherapy" },

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
    <div className={styles.upcomingContainer}>
      <div className={styles.upcomingCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h2 className={styles.pageTitle}>Accountant Dashboard</h2>
              <p className={styles.pageSubtitle}>Manage payments and financial records</p>
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
                    placeholder="Search appointments..."
                  />
                  <Search className={styles.searchIcon} />
                </div>
              </form>
            </div>
          </div>
          <div className={styles.filtersContainer}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <select
                  className={styles.filterSelect}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="not active">Not Active</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Payment Status</label>
                <select
                  className={styles.filterSelect}
                  value={filterPaymentStatus}
                  onChange={(e) => setFilterPaymentStatus(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="FULLY_PAID">Fully Paid</option>
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
                  Clear Filters
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
                  <div className={styles.statLabel}>Total</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AlertCircle className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.pending}</div>
                  <div className={styles.statLabel}>Pending</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Clock className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.partial}</div>
                  <div className={styles.statLabel}>Partial</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CheckCircle className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.completed}</div>
                  <div className={styles.statLabel}>Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading appointments...</p>
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
                        Student
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <Calendar className={styles.headerIcon} />
                        Date
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <FileText className={styles.headerIcon} />
                        Program Type
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <DollarSign className={styles.headerIcon} />
                        Payment Status
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <DollarSign className={styles.headerIcon} />
                        Remaining
                      </div>
                    </th>
                    <th className={styles.textCenter}>Actions</th>
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
                              {new Date(appointment.date).toLocaleDateString("en-US", {
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
                            {appointment.paymentStatus === "FULLY_PAID" ? "0" : getRemainingAmount(appointment)} AED
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleViewDetails(appointment)}
                              className={`${styles.actionButton} ${styles.viewButton}`}
                              title="View Details"
                            >
                              <Eye className={styles.actionIcon} />
                            </button>
                            {appointment.programType === "full_program" &&
                              appointment.paymentStatus !== "FULLY_PAID" && (
                                <button
                                  onClick={() => handleProcessPayment(appointment)}
                                  className={`${styles.actionButton} ${styles.payButton}`}
                                  title="Process Payment"
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
                          <h3>No appointments found</h3>
                          <p>
                            {search || filterStatus !== "active" || filterPaymentStatus !== "all"
                              ? "Try adjusting your search or filters"
                              : "No active appointments requiring payment at this time"}
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAppointments.length)} of{" "}
                {filteredAppointments.length} appointments
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
              <h3 className={styles.modalTitle}>Complete Payment</h3>
              <button onClick={closeModals} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.paymentSummary}>
                <h4>Payment Summary</h4>
                <div className={styles.summaryRow}>
                  <span>Student:</span>
                  <span>{selectedAppointment.patientName}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Program:</span>
                  <span>Full Program</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Already Paid:</span>
                  <span>1,000 AED</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Remaining Amount:</span>
                  <span className={styles.remainingHighlight}>4,000 AED</span>
                </div>
              </div>
              <div className={styles.paymentMethodSection}>
                <h4>Payment Method</h4>
                <div className={styles.paymentOptions}>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Cash Payment (4,000 AED)</span>
                  </label>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="installment"
                      checked={paymentMethod === "installment"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Installment Payment (Checks)</span>
                  </label>
                </div>
              </div>
              {paymentMethod === "installment" && (
                <div className={styles.checkDetailsSection}>
                  <div className={styles.checkHeader}>
                    <h4>Check Details</h4>
                    <div className={styles.checkActions}>
                      <button onClick={addCheck} className={styles.addCheckButton} type="button">
                        <Plus className={styles.buttonIcon} />
                        Add Check
                      </button>
                      <div className={styles.totalAmount}>Total: {getTotalCheckAmount()} AED (Min: 4,000 AED)</div>
                    </div>
                  </div>
                  {checkDetails.map((check, index) => (
                    <div key={index} className={styles.checkForm}>
                      <div className={styles.checkFormHeader}>
                        <h5>Check #{index + 1}</h5>
                        {checkDetails.length > 1 && (
                          <button onClick={() => removeCheck(index)} className={styles.removeCheckButton} type="button">
                            <Minus className={styles.buttonIcon} />
                          </button>
                        )}
                      </div>
                      <div className={styles.checkFormGrid}>
                        <div className={styles.formGroup}>
                          <label>Amount (AED) *</label>
                          <input
                            type="number"
                            value={check.amount}
                            onChange={(e) => updateCheckDetail(index, "amount", e.target.value)}
                            className={styles.formInput}
                            placeholder="Enter amount"
                            min="1"
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Check Number *</label>
                          <input
                            type="text"
                            value={check.checkNumber}
                            onChange={(e) => updateCheckDetail(index, "checkNumber", e.target.value)}
                            className={styles.formInput}
                            placeholder="Enter check number"
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Bank Name</label>
                          <input
                            type="text"
                            value={check.bankName}
                            onChange={(e) => updateCheckDetail(index, "bankName", e.target.value)}
                            className={styles.formInput}
                            placeholder="Enter bank name"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Due Date *</label>
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
                Cancel
              </button>
              <button onClick={handleCompletePayment} className={styles.completeButton} disabled={processing}>
                <CreditCard className={styles.buttonIcon} />
                {processing
                  ? "Processing..."
                  : paymentMethod === "cash"
                    ? "Complete Payment (4,000&nbsp;AED)"
                    : `Complete Payment (${getTotalCheckAmount()}&nbsp;AED)`}
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
              <h3 className={styles.modalTitle}>Appointment Details</h3>
              <button onClick={closeModals} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <label>Student Name:</label>
                  <span>{selectedAppointment.patientName}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Date:</label>
                  <span>{new Date(selectedAppointment.date).toLocaleDateString()}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Time:</label>
                  <span>{selectedAppointment.time}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Program Type:</label>
                  <span>{selectedAppointment.programType?.replace("_", " ").toUpperCase()}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Total Amount:</label>
                  <span>{selectedAppointment.totalAmount} AED</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Paid Amount:</label>
                  <span>{selectedAppointment.paidAmount} AED</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Remaining Amount:</label>
                  <span>{selectedAppointment.remainingAmount} AED</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Payment Status:</label>
                  {getPaymentStatusBadge(selectedAppointment)}
                </div>
                <div className={styles.detailItem}>
                  <label>Description:</label>
                  <span>{selectedAppointment.description}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Subscription End Date:</label>
                  <span>
                    {selectedAppointment.subscriptionEndDate
                      ? new Date(selectedAppointment.subscriptionEndDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModals} className={styles.cancelButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
