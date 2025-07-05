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
  CheckSquare,
  Plus,
  Trash2,
  X,
  Save,
  AlertCircle,
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

  const itemsPerPage = 10

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showChecksModal, setShowChecksModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [paymentType, setPaymentType] = useState("")
  const [checks, setChecks] = useState([])
  const [saving, setSaving] = useState(false)

  // Validation states
  const [validationErrors, setValidationErrors] = useState({})
  const [checkValidationErrors, setCheckValidationErrors] = useState({})

  // Check form state
  const [newCheck, setNewCheck] = useState({
    checkNumber: "",
    bankName: "",
    amount: "",
    dueDate: "",
    notes: "",
  })

  const cashPrice = 4000
  const installmentPrice = 4500

  useEffect(() => {
    fetchActiveAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, search])

  const fetchPatientName = async (patientId) => {
    try {
      const response = await axiosInstance.get(`/authentication/patient/${patientId}`)
      return response.data.name || `Patient-${patientId}`
    } catch (error) {
      console.error("Error fetching patient name:", error)
      return `Patient-${patientId}`
    }
  }

  const fetchActiveAppointments = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get("/full/fullprogram")
      const data = response.data

      // Filter only active appointments
      const activeAppointments = data.filter((appointment) => appointment.status === "active")

      // Sort by date
      const sortedAppointments = activeAppointments.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`)
        const dateTimeB = new Date(`${b.date}T${b.time}`)
        return dateTimeB - dateTimeA
      })

      // Fetch patient names for all appointments
      const appointmentsWithNames = await Promise.all(
        sortedAppointments.map(async (appointment) => {
          const patientId = appointment.patientid || appointment.patientId
          const patientName = await fetchPatientName(patientId)
          return {
            ...appointment,
            patientName,
            patientId: patientId,
          }
        }),
      )

      console.log("Fetched active appointments with patient names:", appointmentsWithNames)
      setAppointments(appointmentsWithNames)
    } catch (error) {
      console.error("Error fetching active appointments:", error)
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

  const validatePaymentData = (appointment, paymentType) => {
    const errors = {}

    if (!appointment.patientId) {
      errors.patientId = "Patient ID is required"
    }

    if (!appointment.patientName) {
      errors.patientName = "Patient name is required"
    }

    if (!appointment._id) {
      errors.programId = "Program ID is required"
    }

    if (paymentType === "cash" && !cashPrice) {
      errors.price = "Cash price is required"
    }

    if (paymentType === "installment" && !installmentPrice) {
      errors.price = "Installment price is required"
    }

    return errors
  }

  const validateCheckData = (check) => {
    const errors = {}

    if (!check.checkNumber || check.checkNumber.trim() === "") {
      errors.checkNumber = "Check number is required"
    } else if (check.checkNumber.length < 3) {
      errors.checkNumber = "Check number must be at least 3 characters"
    }

    if (!check.bankName || check.bankName.trim() === "") {
      errors.bankName = "Bank name is required"
    } else if (check.bankName.length < 2) {
      errors.bankName = "Bank name must be at least 2 characters"
    }

    if (!check.amount || check.amount === "") {
      errors.amount = "Amount is required"
    } else if (Number.parseFloat(check.amount) <= 0) {
      errors.amount = "Amount must be greater than 0"
    } else if (Number.parseFloat(check.amount) > installmentPrice) {
      errors.amount = `Amount cannot exceed ${installmentPrice}`
    }

    if (!check.dueDate) {
      errors.dueDate = "Due date is required"
    } else {
      const selectedDate = new Date(check.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.dueDate = "Due date cannot be in the past"
      }
    }

    return errors
  }

  const validateChecksTotal = (checksArray) => {
    const total = checksArray.reduce((sum, check) => sum + Number.parseFloat(check.amount || 0), 0)
    if (total !== installmentPrice) {
      return `Total checks amount (${total}) must equal installment price (${installmentPrice})`
    }
    return null
  }

  const validateDuplicateCheckNumbers = (checksArray) => {
    const checkNumbers = checksArray.map((check) => check.checkNumber)
    const duplicates = checkNumbers.filter((num, index) => checkNumbers.indexOf(num) !== index)
    if (duplicates.length > 0) {
      return `Duplicate check numbers found: ${duplicates.join(", ")}`
    }
    return null
  }

  const handlePaymentSelection = (appointment) => {
    setSelectedAppointment(appointment)
    setPaymentType("")
    setValidationErrors({})
    setShowPaymentModal(true)
  }

  const handleCashPayment = async () => {
    // Validate payment data
    const errors = validatePaymentData(selectedAppointment, "cash")
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      alert("Please fix validation errors before proceeding")
      return
    }

    setSaving(true)
    try {
      const patientId = selectedAppointment.patientId
      const patientName = selectedAppointment.patientName

      // Create comprehensive comment for cash payment - ensure it's not empty
      const comment = `Cash payment for full program remaining balance - Patient: ${patientName || "Unknown"} (ID: ${patientId || "Unknown"}) - Session Date: ${selectedAppointment.date ? new Date(selectedAppointment.date).toLocaleDateString() : "Unknown"} at ${selectedAppointment.time || "Unknown"} - Description: ${selectedAppointment.description || "No description"} - Payment processed on: ${new Date().toLocaleString()}`

      // Create money record for cash payment
      const moneyData = {
        patientId: patientId,
        programId: selectedAppointment._id,
        price: cashPrice,
        status: "completed",
        invoiceId: `CASH-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        programType: "full_program_remaining",
        comment: comment, // Ensure comment is included and not empty
      }

      console.log("Cash payment data being sent:", moneyData)

      const response = await axiosInstance.post("/authentication/saveMoneyRecord", moneyData)

      if (response.status === 200) {
        // Update appointment status to completed
        await axiosInstance.put(`/full/fullprogram/${selectedAppointment._id}`, {
          status: "completed",
        })

        // Remove from active appointments list
        setAppointments(appointments.filter((app) => app._id !== selectedAppointment._id))

        setShowPaymentModal(false)
        setSelectedAppointment(null)
        setValidationErrors({})
        alert("Cash payment processed successfully!")
      }
    } catch (error) {
      console.error("Error processing cash payment:", error)
      alert("Error processing payment: " + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleInstallmentPayment = () => {
    // Validate payment data
    const errors = validatePaymentData(selectedAppointment, "installment")
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      alert("Please fix validation errors before proceeding")
      return
    }

    setShowPaymentModal(false)
    setShowChecksModal(true)
    setChecks([])
    setCheckValidationErrors({})
  }

  const addCheck = () => {
    // Validate check data
    const errors = validateCheckData(newCheck)
    if (Object.keys(errors).length > 0) {
      setCheckValidationErrors(errors)
      return
    }

    // Check for duplicate check numbers
    const existingCheckNumbers = checks.map((check) => check.checkNumber)
    if (existingCheckNumbers.includes(newCheck.checkNumber)) {
      setCheckValidationErrors({ checkNumber: "Check number already exists" })
      return
    }

    // Check if adding this amount would exceed the total
    const currentTotal = getTotalChecksAmount()
    const newAmount = Number.parseFloat(newCheck.amount)
    if (currentTotal + newAmount > installmentPrice) {
      setCheckValidationErrors({
        amount: `Adding this amount would exceed the total. Remaining: ${installmentPrice - currentTotal}`,
      })
      return
    }

    setChecks([...checks, { ...newCheck, id: Date.now() }])
    setNewCheck({
      checkNumber: "",
      bankName: "",
      amount: "",
      dueDate: "",
      notes: "",
    })
    setCheckValidationErrors({})
  }

  const removeCheck = (checkId) => {
    setChecks(checks.filter((check) => check.id !== checkId))
    setCheckValidationErrors({})
  }

  const getTotalChecksAmount = () => {
    return checks.reduce((total, check) => total + Number.parseFloat(check.amount || 0), 0)
  }

  const handleSaveChecks = async () => {
    // Comprehensive validation
    if (checks.length === 0) {
      alert("Please add at least one check")
      return
    }

    // Validate total amount
    const totalError = validateChecksTotal(checks)
    if (totalError) {
      alert(totalError)
      return
    }

    // Validate duplicate check numbers
    const duplicateError = validateDuplicateCheckNumbers(checks)
    if (duplicateError) {
      alert(duplicateError)
      return
    }

    // Validate each check individually
    for (let i = 0; i < checks.length; i++) {
      const checkErrors = validateCheckData(checks[i])
      if (Object.keys(checkErrors).length > 0) {
        alert(`Check ${i + 1} has validation errors: ${Object.values(checkErrors).join(", ")}`)
        return
      }
    }

    setSaving(true)
    try {
      const patientId = selectedAppointment.patientId
      const patientName = selectedAppointment.patientName

      // Create checks individually using the single check endpoint
      const checkPromises = checks.map(async (check) => {
        const checkData = {
          patientId: patientId,
          programId: selectedAppointment._id,
          moneyId: "000000000000000000000000", // Placeholder ObjectId - will be updated when check is processed
          checkNumber: check.checkNumber,
          amount: Number.parseFloat(check.amount),
          dueDate: check.dueDate,
          bankName: check.bankName,
          notes: check.notes || `Check for installment payment - Patient: ${patientName}`,
        }

        console.log("Creating individual check:", checkData)
        return axiosInstance.post("/checks", checkData)
      })

      await Promise.all(checkPromises)

      // Update appointment status to completed
      await axiosInstance.put(`/full/fullprogram/${selectedAppointment._id}`, {
        status: "completed",
      })

      // Remove from active appointments list
      setAppointments(appointments.filter((app) => app._id !== selectedAppointment._id))

      setShowChecksModal(false)
      setSelectedAppointment(null)
      setChecks([])
      setCheckValidationErrors({})
      alert("Installment checks saved successfully! Money records will be created when checks are processed.")
    } catch (error) {
      console.error("Error saving installment checks:", error)
      alert("Error saving installment checks: " + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const closeModals = () => {
    setShowPaymentModal(false)
    setShowChecksModal(false)
    setSelectedAppointment(null)
    setPaymentType("")
    setChecks([])
    setValidationErrors({})
    setCheckValidationErrors({})
    setNewCheck({
      checkNumber: "",
      bankName: "",
      amount: "",
      dueDate: "",
      notes: "",
    })
  }

  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex)

  return (
    <div className={styles.upcomingContainer}>
      <div className={styles.upcomingCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h2 className={styles.pageTitle}>Accountant Payment Dashboard</h2>
              <p className={styles.pageSubtitle}>Process payments for completed sessions</p>
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
            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <DollarSign className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{filteredAppointments.length}</div>
                  <div className={styles.statLabel}>Pending Payments</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CreditCard className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>${(filteredAppointments.length * cashPrice).toLocaleString()}</div>
                  <div className={styles.statLabel}>Total Cash Value</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CheckSquare className={styles.statIconSvg} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    ${(filteredAppointments.length * installmentPrice).toLocaleString()}
                  </div>
                  <div className={styles.statLabel}>Total Installment Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading pending payments...</p>
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
                        Patient
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
                        <Clock className={styles.headerIcon} />
                        Time
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <FileText className={styles.headerIcon} />
                        Description
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerCell}>
                        <DollarSign className={styles.headerIcon} />
                        Payment Options
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
                            <span className={styles.patientName}>{appointment.patientName}</span>
                            <span className={styles.patientId}>ID: {appointment.patientId}</span>
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
                        <td className={styles.timeCell}>
                          <span className={styles.timeValue}>{appointment.time}</span>
                        </td>
                        <td className={styles.descriptionCell}>
                          <div className={styles.descriptionText} title={appointment.description}>
                            {appointment.description}
                          </div>
                        </td>
                        <td className={styles.paymentCell}>
                          <div className={styles.paymentOptions}>
                            <div className={styles.paymentOption}>
                              <span className={styles.paymentLabel}>Cash:</span>
                              <span className={styles.paymentAmount}>${cashPrice}</span>
                            </div>
                            <div className={styles.paymentOption}>
                              <span className={styles.paymentLabel}>Installment:</span>
                              <span className={styles.paymentAmount}>${installmentPrice}</span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handlePaymentSelection(appointment)}
                              className={`${styles.actionButton} ${styles.paymentButton}`}
                              title="Process Payment"
                              disabled={saving}
                            >
                              <DollarSign className={styles.actionIcon} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className={styles.noData}>
                        <div className={styles.emptyState}>
                          <DollarSign className={styles.emptyIcon} />
                          <h3>No pending payments found</h3>
                          <p>{search ? "Try adjusting your search" : "All active appointments have been processed"}</p>
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

      {/* Payment Selection Modal */}
      {showPaymentModal && selectedAppointment && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Select Payment Method</h3>
              <button onClick={closeModals} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.paymentSelection}>
                <div className={styles.appointmentInfo}>
                  <h4>Patient: {selectedAppointment.patientName}</h4>
                  <p>Date: {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                  <p>Time: {selectedAppointment.time}</p>
                  {Object.keys(validationErrors).length > 0 && (
                    <div className={styles.validationErrors}>
                      <AlertCircle className={styles.errorIcon} />
                      <div>
                        {Object.entries(validationErrors).map(([field, error]) => (
                          <p key={field} className={styles.errorText}>
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.paymentMethods}>
                  <div
                    className={`${styles.paymentMethod} ${paymentType === "cash" ? styles.selected : ""}`}
                    onClick={() => setPaymentType("cash")}
                  >
                    <div className={styles.paymentMethodIcon}>
                      <DollarSign className={styles.paymentMethodIconSvg} />
                    </div>
                    <div className={styles.paymentMethodContent}>
                      <h5>Cash Payment</h5>
                      <p className={styles.paymentMethodPrice}>${cashPrice}</p>
                      <p className={styles.paymentMethodDesc}>Immediate payment completion</p>
                    </div>
                  </div>

                  <div
                    className={`${styles.paymentMethod} ${paymentType === "installment" ? styles.selected : ""}`}
                    onClick={() => setPaymentType("installment")}
                  >
                    <div className={styles.paymentMethodIcon}>
                      <CheckSquare className={styles.paymentMethodIconSvg} />
                    </div>
                    <div className={styles.paymentMethodContent}>
                      <h5>Installment (Checks)</h5>
                      <p className={styles.paymentMethodPrice}>${installmentPrice}</p>
                      <p className={styles.paymentMethodDesc}>Payment via multiple checks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModals} className={styles.cancelButton} disabled={saving}>
                Cancel
              </button>
              {paymentType === "cash" && (
                <button onClick={handleCashPayment} className={styles.cashButton} disabled={saving}>
                  <DollarSign className={styles.buttonIcon} />
                  {saving ? "Processing..." : "Process Cash Payment"}
                </button>
              )}
              {paymentType === "installment" && (
                <button onClick={handleInstallmentPayment} className={styles.installmentButton} disabled={saving}>
                  <CheckSquare className={styles.buttonIcon} />
                  Setup Installment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checks Management Modal */}
      {showChecksModal && selectedAppointment && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={`${styles.modal} ${styles.checksModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Manage Installment Checks</h3>
              <button onClick={closeModals} className={styles.closeButton}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.checksContainer}>
                <div className={styles.appointmentInfo}>
                  <h4>Patient: {selectedAppointment.patientName}</h4>
                  <p>Total Amount: ${installmentPrice}</p>
                  <p>Current Total: ${getTotalChecksAmount()}</p>
                  <p>Remaining: ${installmentPrice - getTotalChecksAmount()}</p>
                  <div className={styles.infoNote}>
                    <AlertCircle className={styles.infoIcon} />
                    <span>
                      Checks will be saved for tracking. Money records will be created when checks are processed.
                    </span>
                  </div>
                </div>

                {/* Add New Check Form */}
                <div className={styles.addCheckForm}>
                  <h5>Add New Check</h5>
                  <div className={styles.checkFormGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Check Number *</label>
                      <input
                        type="text"
                        value={newCheck.checkNumber}
                        onChange={(e) => setNewCheck({ ...newCheck, checkNumber: e.target.value })}
                        className={`${styles.formInput} ${checkValidationErrors.checkNumber ? styles.errorInput : ""}`}
                        placeholder="Enter check number"
                      />
                      {checkValidationErrors.checkNumber && (
                        <span className={styles.errorText}>{checkValidationErrors.checkNumber}</span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Bank Name *</label>
                      <input
                        type="text"
                        value={newCheck.bankName}
                        onChange={(e) => setNewCheck({ ...newCheck, bankName: e.target.value })}
                        className={`${styles.formInput} ${checkValidationErrors.bankName ? styles.errorInput : ""}`}
                        placeholder="Enter bank name"
                      />
                      {checkValidationErrors.bankName && (
                        <span className={styles.errorText}>{checkValidationErrors.bankName}</span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Amount *</label>
                      <input
                        type="number"
                        value={newCheck.amount}
                        onChange={(e) => setNewCheck({ ...newCheck, amount: e.target.value })}
                        className={`${styles.formInput} ${checkValidationErrors.amount ? styles.errorInput : ""}`}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                        max={installmentPrice - getTotalChecksAmount()}
                      />
                      {checkValidationErrors.amount && (
                        <span className={styles.errorText}>{checkValidationErrors.amount}</span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Due Date *</label>
                      <input
                        type="date"
                        value={newCheck.dueDate}
                        onChange={(e) => setNewCheck({ ...newCheck, dueDate: e.target.value })}
                        className={`${styles.formInput} ${checkValidationErrors.dueDate ? styles.errorInput : ""}`}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      {checkValidationErrors.dueDate && (
                        <span className={styles.errorText}>{checkValidationErrors.dueDate}</span>
                      )}
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.formLabel}>Notes</label>
                      <input
                        type="text"
                        value={newCheck.notes}
                        onChange={(e) => setNewCheck({ ...newCheck, notes: e.target.value })}
                        className={styles.formInput}
                        placeholder="Optional notes"
                        maxLength="200"
                      />
                    </div>
                  </div>
                  <button onClick={addCheck} className={styles.addCheckButton}>
                    <Plus className={styles.buttonIcon} />
                    Add Check
                  </button>
                </div>

                {/* Checks List */}
                {checks.length > 0 && (
                  <div className={styles.checksList}>
                    <h5>Added Checks ({checks.length})</h5>
                    <div className={styles.checksTable}>
                      {checks.map((check) => (
                        <div key={check.id} className={styles.checkItem}>
                          <div className={styles.checkDetails}>
                            <div className={styles.checkInfo}>
                              <span className={styles.checkNumber}>#{check.checkNumber}</span>
                              <span className={styles.checkBank}>{check.bankName}</span>
                            </div>
                            <div className={styles.checkMeta}>
                              <span className={styles.checkAmount}>${check.amount}</span>
                              <span className={styles.checkDate}>Due: {check.dueDate}</span>
                            </div>
                            {check.notes && <div className={styles.checkNotes}>{check.notes}</div>}
                          </div>
                          <button onClick={() => removeCheck(check.id)} className={styles.removeCheckButton}>
                            <Trash2 className={styles.removeCheckIcon} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className={styles.checksTotal}>
                      <strong>
                        Total: ${getTotalChecksAmount()} / ${installmentPrice}
                        {getTotalChecksAmount() !== installmentPrice && (
                          <span className={styles.totalWarning}>
                            {" "}
                            (Remaining: ${installmentPrice - getTotalChecksAmount()})
                          </span>
                        )}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModals} className={styles.cancelButton} disabled={saving}>
                Cancel
              </button>
              <button
                onClick={handleSaveChecks}
                className={styles.saveChecksButton}
                disabled={saving || checks.length === 0 || getTotalChecksAmount() !== installmentPrice}
              >
                <Save className={styles.buttonIcon} />
                {saving ? "Saving..." : "Save Checks Only"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
