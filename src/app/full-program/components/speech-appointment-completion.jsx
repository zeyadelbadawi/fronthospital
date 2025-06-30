"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Check,
  CreditCard,
  FileText,
  DollarSign,
  X,
  Plus,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Banknote,
  Receipt,
  Calculator,
} from "lucide-react"
import { useContentStore } from "../store/content-store"
import styles from "../styles/appointment-completion.module.css"
import axiosInstance from "@/helper/axiosSetup"

export function SpeechAppointmentCompletion() {
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [checks, setChecks] = useState([])
  const [validationErrors, setValidationErrors] = useState({})
  const { activeContent } = useContentStore()
  const { appointmentId } = activeContent || {}

  const [newCheck, setNewCheck] = useState({
    checkNumber: "",
    amount: "",
    dueDate: "",
    bankName: "",
    notes: "",
  })
  const [showAddCheck, setShowAddCheck] = useState(false)
  const setActiveContent = useContentStore((state) => state.setActiveContent)

  // Full program plan price
  const FULL_PROGRAM_PRICE = 5000

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentData()
    }
  }, [appointmentId])

  const fetchAppointmentData = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/full/appointments/${appointmentId}`)
      setAppointment(response.data)

      // If appointment has installment plan, fetch existing checks
      if (response.data.paymentStatus === "installment_plan" && response.data.moneyRecordId) {
        await fetchExistingChecks(response.data.moneyRecordId)
      }
    } catch (error) {
      console.error("Error fetching appointment:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingChecks = async (moneyId) => {
    try {
      const response = await axiosInstance.get(`/checks/money/${moneyId}`)
      if (response.data.success) {
        setChecks(
          response.data.data.map((check) => ({
            id: check._id,
            checkNumber: check.checkNumber,
            amount: check.amount,
            dueDate: check.dueDate.split("T")[0], // Format for input
            bankName: check.bankName || "",
            notes: check.notes || "",
            status: check.status,
            createdAt: check.createdAt,
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching existing checks:", error)
    }
  }

  const validateCheckForm = () => {
    const errors = {}

    // Check number validation
    if (!newCheck.checkNumber.trim()) {
      errors.checkNumber = "Check number is required"
    } else if (!/^[a-zA-Z0-9]{3,20}$/.test(newCheck.checkNumber.trim())) {
      errors.checkNumber = "Check number must be 3-20 alphanumeric characters"
    } else if (checks.some((check) => check.checkNumber === newCheck.checkNumber.trim())) {
      errors.checkNumber = "Check number already exists"
    }

    // Amount validation
    if (!newCheck.amount) {
      errors.amount = "Amount is required"
    } else {
      const amount = Number.parseFloat(newCheck.amount)
      if (isNaN(amount) || amount <= 0) {
        errors.amount = "Amount must be greater than 0"
      } else if (!/^\d{1,6}(\.\d{1,2})?$/.test(newCheck.amount.toString())) {
        errors.amount = "Invalid amount format"
      }
    }

    // Due date validation
    if (!newCheck.dueDate) {
      errors.dueDate = "Due date is required"
    } else {
      const dueDate = new Date(newCheck.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        errors.dueDate = "Due date cannot be in the past"
      }
    }

    // Bank name validation (optional but if provided, check length)
    if (newCheck.bankName && newCheck.bankName.length > 100) {
      errors.bankName = "Bank name cannot exceed 100 characters"
    }

    // Notes validation (optional but if provided, check length)
    if (newCheck.notes && newCheck.notes.length > 500) {
      errors.notes = "Notes cannot exceed 500 characters"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCompleteAppointment = async () => {
    setSaving(true)
    try {
      const response = await axiosInstance.put(`/full/fullprogram/${appointmentId}`, {
        status: "active",
      })

      setAppointment(response.data)
      alert("Appointment marked as complete!")
    } catch (error) {
      console.error("Error completing appointment:", error)
      alert("Error completing appointment: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelAppointment = async () => {
    setCancelling(true)
    try {
      const response = await axiosInstance.put(`/full/fullprogram/${appointmentId}`, {
        status: "cancelled",
      })

      setAppointment(response.data)
      alert("Appointment cancelled successfully!")
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      alert("Error cancelling appointment: " + error.message)
    } finally {
      setCancelling(false)
    }
  }

  const handleFullProgramPayment = async () => {
    setSaving(true)
    try {
      // Generate a unique invoice ID
      const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Prepare the payment data for Money table
      const paymentData = {
        patientId: appointment.patientid,
        programId: appointment._id,
        price: FULL_PROGRAM_PRICE,
        status: "completed",
        invoiceId: invoiceId,
        programType: "full program",
        comment: `This is the complete fees of full program for patient ${appointment.patientName || "N/A"}`,
      }

      // Save payment record to Money table
      const paymentResponse = await axiosInstance.post("/money", paymentData)
      console.log("Payment record saved:", paymentResponse.data)

      // Update appointment status
      const appointmentResponse = await axiosInstance.put(`/full/fullprogram/${appointmentId}`, {
        status: "active",
        paymentStatus: "paid",
        fullProgramAssigned: true,
        paymentCompleted: true,
        invoiceId: invoiceId,
        moneyRecordId: paymentResponse.data.data._id,
      })

      setAppointment(appointmentResponse.data)

      alert(
        `Full program payment completed successfully!\nInvoice ID: ${invoiceId}\nPatient: ${appointment.patientName}\nAmount: $${FULL_PROGRAM_PRICE.toLocaleString()}`,
      )
    } catch (error) {
      console.error("Error processing full payment:", error)
      alert("Error processing payment: " + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleAddCheck = async () => {
    // Clear previous validation errors
    setValidationErrors({})

    // Validate form
    if (!validateCheckForm()) {
      return
    }

    const checkAmount = Number.parseFloat(newCheck.amount)
    const totalChecksAmount = checks.reduce((sum, check) => sum + Number.parseFloat(check.amount), 0)
    const newTotalAmount = totalChecksAmount + checkAmount

    if (newTotalAmount > FULL_PROGRAM_PRICE) {
      setValidationErrors({
        amount: `Total amount cannot exceed $${FULL_PROGRAM_PRICE}. Current total: $${totalChecksAmount}, trying to add: $${checkAmount}`,
      })
      return
    }

    // Add to local state first for immediate UI feedback
    const tempCheckData = {
      id: `temp-${Date.now()}`,
      checkNumber: newCheck.checkNumber.trim(),
      amount: checkAmount,
      dueDate: newCheck.dueDate,
      bankName: newCheck.bankName.trim(),
      notes: newCheck.notes.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    setChecks((prev) => [...prev, tempCheckData])
    setNewCheck({
      checkNumber: "",
      amount: "",
      dueDate: "",
      bankName: "",
      notes: "",
    })
    setShowAddCheck(false)
  }

  const handleSaveInstallmentPlan = async () => {
    const totalAmount = checks.reduce((sum, check) => sum + Number.parseFloat(check.amount), 0)
    if (totalAmount !== FULL_PROGRAM_PRICE) {
      alert(`Total checks amount ($${totalAmount}) must equal the full program price ($${FULL_PROGRAM_PRICE})`)
      return
    }

    if (checks.length === 0) {
      alert("Please add at least one check")
      return
    }

    setSaving(true)
    try {
      // Generate a unique invoice ID for the installment plan
      const invoiceId = `INV-INST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Prepare the installment payment data for Money table
      const installmentPaymentData = {
        patientId: appointment.patientid,
        programId: appointment._id,
        price: FULL_PROGRAM_PRICE,
        status: "installment_plan",
        invoiceId: invoiceId,
        programType: "full program",
        comment: `Installment plan created for full program for patient ${appointment.patientName || "N/A"} - ${checks.length} checks totaling $${FULL_PROGRAM_PRICE.toLocaleString()}`,
      }

      // Save installment payment record to Money table
      const paymentResponse = await axiosInstance.post("/money", installmentPaymentData)
      const moneyRecordId = paymentResponse.data.data._id

      // Save each check to the Checks table
      const checkPromises = checks.map((check) =>
        axiosInstance.post("/checks", {
          patientId: appointment.patientid,
          programId: appointment._id,
          moneyId: moneyRecordId,
          checkNumber: check.checkNumber,
          amount: check.amount,
          dueDate: check.dueDate,
          bankName: check.bankName,
          notes: check.notes,
        }),
      )

      await Promise.all(checkPromises)

      // Update appointment status
      const appointmentResponse = await axiosInstance.put(`/full/fullprogram/${appointmentId}`, {
        status: "active",
        paymentStatus: "installment_plan",
        fullProgramAssigned: true,
        paymentCompleted: true,
        invoiceId: invoiceId,
        moneyRecordId: moneyRecordId,
      })

      setAppointment(appointmentResponse.data)

      alert(
        `Installment plan created successfully!\nInvoice ID: ${invoiceId}\nPatient: ${appointment.patientName}\nChecks: ${checks.length}\nTotal Amount: $${FULL_PROGRAM_PRICE.toLocaleString()}`,
      )
    } catch (error) {
      console.error("Error creating installment plan:", error)
      alert("Error creating installment plan: " + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveCheck = async (checkId) => {
    // If it's a temporary check (not saved to database yet)
    if (checkId.toString().startsWith("temp-")) {
      setChecks((prev) => prev.filter((check) => check.id !== checkId))
      return
    }

    // If it's a saved check, call API to delete it
    try {
      const response = await axiosInstance.delete(`/checks/${checkId}`)
      if (response.data.success) {
        setChecks((prev) => prev.filter((check) => check.id !== checkId))
      } else {
        alert("Error removing check: " + response.data.message)
      }
    } catch (error) {
      console.error("Error removing check:", error)
      alert("Error removing check: " + (error.response?.data?.message || error.message))
    }
  }

  const handleBackToAppointments = () => {
    setActiveContent({
      department: "New-Evaulations-Appointments",
      type: "upcoming-Evaulations",
    })
  }

  const getTotalChecksAmount = () => {
    return checks.reduce((sum, check) => sum + Number.parseFloat(check.amount), 0)
  }

  const getRemainingAmount = () => {
    return FULL_PROGRAM_PRICE - getTotalChecksAmount()
  }

  if (loading) {
    return (
      <div className={styles.completionContainer}>
        <div className={styles.completionCard}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Loading appointment details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className={styles.completionContainer}>
        <div className={styles.completionCard}>
          <div className={styles.errorContainer}>
            <h3>Appointment not found</h3>
            <button onClick={handleBackToAppointments} className={styles.backButton}>
              Back to Appointments
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.completionContainer}>
      <div className={styles.completionCard}>
        <div className={styles.completionHeader}>
          <div className={styles.headerLeft}>
            <button onClick={handleBackToAppointments} className={styles.backButton}>
              <ArrowLeft className={styles.backIcon} />
              Back to Appointments
            </button>
            <div className={styles.appointmentInfo}>
              <h3 className={styles.completionTitlec}>
                {appointment.status === "cancelled"
                  ? "Cancelled Appointment"
                  : appointment.status === "active"
                    ? "Active Appointment - Payment"
                    : "Complete Appointment"}
              </h3>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.programPrice}>
              <DollarSign className={styles.priceIcon} />
              <div className={styles.priceInfo}>
                <span className={styles.priceLabel}>Full Program Plan</span>
                <span className={styles.priceAmount}>${FULL_PROGRAM_PRICE.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.completionBody}>
          {/* Status: "not active" - Show Complete and Cancel buttons */}
          {appointment.status === "not active" && (
            <div className={styles.completionSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Is Appointment Completed?</h3>
                <Check className={styles.sectionIcon} />
              </div>

              <div className={styles.appointmentSummary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Student Name:</span>
                  <span className={styles.summaryValue}>{appointment.patientName || "N/A"}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Date:</span>
                  <span className={styles.summaryValue}>{new Date(appointment.date).toLocaleDateString()}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Time:</span>
                  <span className={styles.summaryValue}>{appointment.time}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Description:</span>
                  <span className={styles.summaryValue}>{appointment.description}</span>
                </div>
              </div>

              <div className={styles.buttonContainer}>
                <button onClick={handleCompleteAppointment} disabled={saving} className={styles.completeButton}>
                  <Check className={styles.buttonIcon} />
                  {saving ? "Completing..." : "Mark as Complete"}
                </button>
                <button onClick={handleCancelAppointment} disabled={cancelling} className={styles.cancelButtonRed}>
                  <X className={styles.buttonIcon} />
                  {cancelling ? "Cancelling..." : "Cancel Appointment"}
                </button>
              </div>
            </div>
          )}

          {/* Status: "active" - Show Enhanced Payment Options and Checks */}
          {appointment.status === "active" && (
            <>
              {(!appointment.fullProgramAssigned || !appointment.paymentCompleted) && (
                <div className={styles.paymentSection}>
                  <div className={styles.paymentHeader}>
                    <div className={styles.paymentHeaderContent}>
                      <div className={styles.paymentHeaderIcon}>
                        <CreditCard className={styles.paymentHeaderIconSvg} />
                      </div>
                      <div className={styles.paymentHeaderText}>
                        <h2 className={styles.paymentTitle}>Choose Payment Method</h2>
                        <p className={styles.paymentSubtitle}>
                          Select how you would like to process the payment for this program
                        </p>
                      </div>
                    </div>
                    <div className={styles.paymentHeaderPrice}>
                      <span className={styles.paymentHeaderPriceLabel}>Total Amount</span>
                      <span className={styles.paymentHeaderPriceValue}>${FULL_PROGRAM_PRICE.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className={styles.paymentOptions}>
                    <div className={styles.paymentOptionCard}>
                      <div className={styles.paymentOptionHeader}>
                        <div className={styles.paymentOptionIcon}>
                          <Banknote className={styles.paymentOptionIconSvg} />
                        </div>
                        <div className={styles.paymentOptionBadge}>Recommended</div>
                      </div>
                      <div className={styles.paymentOptionContent}>
                        <h3 className={styles.paymentOptionTitle}>Full Payment</h3>
                        <div className={styles.paymentOptionPrice}>
                          <span className={styles.paymentOptionAmount}>${FULL_PROGRAM_PRICE.toLocaleString()}</span>
                          <span className={styles.paymentOptionDiscount}>Save 5%</span>
                        </div>
                        <ul className={styles.paymentOptionFeatures}>
                          <li>
                            <CheckCircle className={styles.featureIcon} /> Immediate program access
                          </li>
                          <li>
                            <CheckCircle className={styles.featureIcon} /> No additional fees
                          </li>
                          <li>
                            <CheckCircle className={styles.featureIcon} /> Priority support
                          </li>
                          <li>
                            <CheckCircle className={styles.featureIcon} /> Complete materials included
                          </li>
                        </ul>
                      </div>
                      <button onClick={handleFullProgramPayment} disabled={saving} className={styles.fullPaymentButton}>
                        <DollarSign className={styles.buttonIcon} />
                        {saving ? "Processing Payment..." : "Pay Full Amount"}
                      </button>
                    </div>

                    <div className={styles.paymentOptionCard}>
                      <div className={styles.paymentOptionHeader}>
                        <div className={styles.paymentOptionIcon}>
                          <Receipt className={styles.paymentOptionIconSvg} />
                        </div>
                      </div>
                      <div className={styles.paymentOptionContent}>
                        <h3 className={styles.paymentOptionTitle}>Installment Plan</h3>
                        <div className={styles.paymentOptionPrice}>
                          <span className={styles.paymentOptionAmount}>Multiple Checks</span>
                          <span className={styles.paymentOptionFlexible}>Flexible</span>
                        </div>
                        <ul className={styles.paymentOptionFeatures}>
                          <li>
                            <CheckCircle className={styles.featureIcon} /> Flexible payment schedule
                          </li>
                          <li>
                            <CheckCircle className={styles.featureIcon} /> Multiple check options
                          </li>
                          <li>
                            <CheckCircle className={styles.featureIcon} /> Custom due dates
                          </li>
                          <li>
                            <CheckCircle className={styles.featureIcon} /> Easy management
                          </li>
                        </ul>
                      </div>
                      <button onClick={() => setPaymentMethod("installment")} className={styles.installmentButton}>
                        <FileText className={styles.buttonIcon} />
                        Create Installment Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "installment" && (
                <div className={styles.installmentSection}>
                  <div className={styles.installmentHeader}>
                    <div className={styles.installmentHeaderContent}>
                      <div className={styles.installmentHeaderIcon}>
                        <Receipt className={styles.installmentHeaderIconSvg} />
                      </div>
                      <div className={styles.installmentHeaderText}>
                        <h2 className={styles.installmentTitle}>Installment Plan - Check Management</h2>
                        <p className={styles.installmentSubtitle}>Create and manage payment checks for the program</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.installmentSummaryCard}>
                    <div className={styles.summaryCardHeader}>
                      <Calculator className={styles.summaryCardIcon} />
                      <h3 className={styles.summaryCardTitle}>Payment Summary</h3>
                    </div>
                    <div className={styles.summaryGrid}>
                      <div className={styles.summaryGridItem}>
                        <span className={styles.summaryGridLabel}>Total Program Cost</span>
                        <span className={`${styles.summaryGridValue} ${styles.totalAmount}`}>
                          ${FULL_PROGRAM_PRICE.toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.summaryGridItem}>
                        <span className={styles.summaryGridLabel}>Checks Added</span>
                        <span className={styles.summaryGridValue}>{checks.length}</span>
                      </div>
                      <div className={styles.summaryGridItem}>
                        <span className={styles.summaryGridLabel}>Total Checks Amount</span>
                        <span className={`${styles.summaryGridValue} ${styles.checksAmount}`}>
                          ${getTotalChecksAmount().toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.summaryGridItem}>
                        <span className={styles.summaryGridLabel}>Remaining Amount</span>
                        <span className={`${styles.summaryGridValue} ${styles.remainingAmount}`}>
                          ${getRemainingAmount().toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {getRemainingAmount() > 0 && (
                      <div className={styles.summaryAlert}>
                        <AlertCircle className={styles.summaryAlertIcon} />
                        <span className={styles.summaryAlertText}>
                          You need to add ${getRemainingAmount().toLocaleString()} more in checks to complete the
                          payment plan
                        </span>
                      </div>
                    )}
                  </div>

                  {checks.length > 0 && (
                    <div className={styles.checksContainer}>
                      <div className={styles.checksHeader}>
                        <h3 className={styles.checksTitle}>
                          <Receipt className={styles.checksTitleIcon} />
                          Added Checks ({checks.length})
                        </h3>
                      </div>
                      <div className={styles.checksList}>
                        {checks.map((check, index) => (
                          <div key={check.id} className={styles.checkCard}>
                            <div className={styles.checkCardHeader}>
                              <div className={styles.checkCardNumber}>
                                <Banknote className={styles.checkCardIcon} />
                                <span className={styles.checkNumber}>Check #{check.checkNumber}</span>
                              </div>
                              <div className={styles.checkCardAmount}>
                                ${Number.parseFloat(check.amount).toLocaleString()}
                              </div>
                            </div>
                            <div className={styles.checkCardBody}>
                              <div className={styles.checkDetailsGrid}>
                                <div className={styles.checkDetailItem}>
                                  <Calendar className={styles.checkDetailIcon} />
                                  <div className={styles.checkDetailContent}>
                                    <span className={styles.checkDetailLabel}>Due Date</span>
                                    <span className={styles.checkDetailValue}>
                                      {new Date(check.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                {check.bankName && (
                                  <div className={styles.checkDetailItem}>
                                    <CreditCard className={styles.checkDetailIcon} />
                                    <div className={styles.checkDetailContent}>
                                      <span className={styles.checkDetailLabel}>Bank</span>
                                      <span className={styles.checkDetailValue}>{check.bankName}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {check.notes && (
                                <div className={styles.checkNotes}>
                                  <FileText className={styles.checkNotesIcon} />
                                  <span className={styles.checkNotesText}>{check.notes}</span>
                                </div>
                              )}
                            </div>
                            <div className={styles.checkCardActions}>
                              <div className={styles.checkStatus}>
                                <span className={styles.checkStatusBadge}>{check.status}</span>
                              </div>
                              <button onClick={() => handleRemoveCheck(check.id)} className={styles.removeCheckButton}>
                                <X className={styles.removeIcon} />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!showAddCheck ? (
                    <div className={styles.addCheckSection}>
                      <button
                        onClick={() => setShowAddCheck(true)}
                        className={styles.addCheckButton}
                        disabled={getRemainingAmount() <= 0}
                      >
                        <Plus className={styles.buttonIcon} />
                        Add New Check
                      </button>
                      {getRemainingAmount() <= 0 && (
                        <p className={styles.addCheckDisabledText}>
                          All checks have been added. Total amount matches the program cost.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className={styles.addCheckForm}>
                      <div className={styles.addCheckFormHeader}>
                        <h3 className={styles.addCheckFormTitle}>
                          <Plus className={styles.addCheckFormIcon} />
                          Add New Check
                        </h3>
                        <p className={styles.addCheckFormSubtitle}>
                          Enter the check details below. Remaining amount: ${getRemainingAmount().toLocaleString()}
                        </p>
                      </div>

                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            <Banknote className={styles.formLabelIcon} />
                            Check Number *
                          </label>
                          <input
                            type="text"
                            value={newCheck.checkNumber}
                            onChange={(e) => {
                              setNewCheck({ ...newCheck, checkNumber: e.target.value })
                              if (validationErrors.checkNumber) {
                                setValidationErrors((prev) => ({ ...prev, checkNumber: null }))
                              }
                            }}
                            className={`${styles.formInput} ${validationErrors.checkNumber ? styles.formInputError : ""}`}
                            placeholder="Enter check number (3-20 alphanumeric)"
                          />
                          {validationErrors.checkNumber && (
                            <span className={styles.errorMessage}>{validationErrors.checkNumber}</span>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            <DollarSign className={styles.formLabelIcon} />
                            Amount *
                          </label>
                          <input
                            type="number"
                            value={newCheck.amount}
                            onChange={(e) => {
                              setNewCheck({ ...newCheck, amount: e.target.value })
                              if (validationErrors.amount) {
                                setValidationErrors((prev) => ({ ...prev, amount: null }))
                              }
                            }}
                            className={`${styles.formInput} ${validationErrors.amount ? styles.formInputError : ""}`}
                            placeholder="0.00"
                            min="0"
                            max={getRemainingAmount()}
                            step="0.01"
                          />
                          {validationErrors.amount && (
                            <span className={styles.errorMessage}>{validationErrors.amount}</span>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            <Calendar className={styles.formLabelIcon} />
                            Due Date *
                          </label>
                          <input
                            type="date"
                            value={newCheck.dueDate}
                            onChange={(e) => {
                              setNewCheck({ ...newCheck, dueDate: e.target.value })
                              if (validationErrors.dueDate) {
                                setValidationErrors((prev) => ({ ...prev, dueDate: null }))
                              }
                            }}
                            className={`${styles.formInput} ${validationErrors.dueDate ? styles.formInputError : ""}`}
                            min={new Date().toISOString().split("T")[0]}
                          />
                          {validationErrors.dueDate && (
                            <span className={styles.errorMessage}>{validationErrors.dueDate}</span>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            <CreditCard className={styles.formLabelIcon} />
                            Bank Name
                          </label>
                          <input
                            type="text"
                            value={newCheck.bankName}
                            onChange={(e) => {
                              setNewCheck({ ...newCheck, bankName: e.target.value })
                              if (validationErrors.bankName) {
                                setValidationErrors((prev) => ({ ...prev, bankName: null }))
                              }
                            }}
                            className={`${styles.formInput} ${validationErrors.bankName ? styles.formInputError : ""}`}
                            placeholder="Bank name (optional)"
                            maxLength={100}
                          />
                          {validationErrors.bankName && (
                            <span className={styles.errorMessage}>{validationErrors.bankName}</span>
                          )}
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                          <label className={styles.formLabel}>
                            <FileText className={styles.formLabelIcon} />
                            Notes
                          </label>
                          <textarea
                            value={newCheck.notes}
                            onChange={(e) => {
                              setNewCheck({ ...newCheck, notes: e.target.value })
                              if (validationErrors.notes) {
                                setValidationErrors((prev) => ({ ...prev, notes: null }))
                              }
                            }}
                            className={`${styles.formTextarea} ${validationErrors.notes ? styles.formInputError : ""}`}
                            placeholder="Additional notes (optional)"
                            rows={3}
                            maxLength={500}
                          />
                          {validationErrors.notes && (
                            <span className={styles.errorMessage}>{validationErrors.notes}</span>
                          )}
                        </div>
                      </div>

                      <div className={styles.formActions}>
                        <button
                          onClick={() => {
                            setShowAddCheck(false)
                            setValidationErrors({})
                          }}
                          className={styles.cancelButton}
                        >
                          <X className={styles.buttonIcon} />
                          Cancel
                        </button>
                        <button onClick={handleAddCheck} className={styles.saveCheckButton}>
                          <Plus className={styles.buttonIcon} />
                          Add Check
                        </button>
                      </div>
                    </div>
                  )}

                  {checks.length > 0 && getRemainingAmount() === 0 && (
                    <div className={styles.finalizeSection}>
                      <div className={styles.finalizeHeader}>
                        <CheckCircle className={styles.finalizeIcon} />
                        <div className={styles.finalizeHeaderText}>
                          <h3 className={styles.finalizeTitle}>Ready to Create Installment Plan</h3>
                          <p className={styles.finalizeDescription}>
                            All checks have been added and the total amount matches the program cost.
                          </p>
                        </div>
                      </div>
                      <div className={styles.finalizeSummary}>
                        <div className={styles.finalizeSummaryItem}>
                          <span className={styles.finalizeSummaryLabel}>Total Checks:</span>
                          <span className={styles.finalizeSummaryValue}>{checks.length}</span>
                        </div>
                        <div className={styles.finalizeSummaryItem}>
                          <span className={styles.finalizeSummaryLabel}>Total Amount:</span>
                          <span className={styles.finalizeSummaryValue}>${FULL_PROGRAM_PRICE.toLocaleString()}</span>
                        </div>
                      </div>
                      <button onClick={handleSaveInstallmentPlan} disabled={saving} className={styles.finalizeButton}>
                        <FileText className={styles.buttonIcon} />
                        {saving ? "Creating Installment Plan..." : "Create Installment Plan"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {appointment.fullProgramAssigned && appointment.paymentCompleted && (
                <div className={styles.completedSection}>
                  <div className={styles.completedHeader}>
                    <div className={styles.completedIconContainer}>
                      <CheckCircle className={styles.completedMainIcon} />
                    </div>
                    <div className={styles.completedHeaderText}>
                      <h2 className={styles.completedMainTitle}>Payment Completed Successfully!</h2>
                      <p className={styles.completedMainSubtitle}>
                        This appointment has been completed and payment has been processed successfully
                      </p>
                    </div>
                  </div>

                  <div className={styles.completedContent}>
                    <div className={styles.completedAlert}>
                      <div className={styles.completedAlertIcon}>
                        <CheckCircle className={styles.completedAlertIconSvg} />
                      </div>
                      <div className={styles.completedAlertContent}>
                        <h3 className={styles.completedAlertTitle}>Appointment & Payment Status: Completed</h3>
                        <p className={styles.completedAlertDescription}>
                          The appointment has been successfully completed and the payment has been processed. The
                          patient is now enrolled in the full program.
                        </p>
                      </div>
                    </div>

                    <div className={styles.completedDetailsCard}>
                      <div className={styles.completedCardHeader}>
                        <h3 className={styles.completedCardTitle}>Payment Summary</h3>
                        <span className={styles.completedStatusBadge}>
                          {appointment.paymentStatus === "paid" ? "Paid in Full" : "Installment Plan"}
                        </span>
                      </div>

                      <div className={styles.completedDetailsGrid}>
                        <div className={styles.completedDetailItem}>
                          <div className={styles.completedDetailIcon}>
                            <User className={styles.completedDetailIconSvg} />
                          </div>
                          <div className={styles.completedDetailContent}>
                            <span className={styles.completedDetailLabel}>Patient Name</span>
                            <span className={styles.completedDetailValue}>{appointment.patientName || "N/A"}</span>
                          </div>
                        </div>

                        <div className={styles.completedDetailItem}>
                          <div className={styles.completedDetailIcon}>
                            <DollarSign className={styles.completedDetailIconSvg} />
                          </div>
                          <div className={styles.completedDetailContent}>
                            <span className={styles.completedDetailLabel}>Program Cost</span>
                            <span className={styles.completedDetailValue}>${FULL_PROGRAM_PRICE.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className={styles.completedDetailItem}>
                          <div className={styles.completedDetailIcon}>
                            <Receipt className={styles.completedDetailIconSvg} />
                          </div>
                          <div className={styles.completedDetailContent}>
                            <span className={styles.completedDetailLabel}>Invoice ID</span>
                            <span className={styles.completedDetailValue}>{appointment.invoiceId || "N/A"}</span>
                          </div>
                        </div>

                        <div className={styles.completedDetailItem}>
                          <div className={styles.completedDetailIcon}>
                            <Calendar className={styles.completedDetailIconSvg} />
                          </div>
                          <div className={styles.completedDetailContent}>
                            <span className={styles.completedDetailLabel}>Completion Date</span>
                            <span className={styles.completedDetailValue}>{new Date().toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.completedProgramInfo}>
                        <div className={styles.completedProgramHeader}>
                          <CheckCircle className={styles.completedProgramIcon} />
                          <span className={styles.completedProgramText}>Full Program Enrollment</span>
                        </div>
                        <div className={styles.completedProgramDetails}>
                          <p className={styles.completedProgramNote}>
                            The patient has been successfully enrolled in the complete speech therapy program. All
                            materials and sessions are now available.
                          </p>
                          <div className={styles.completedProgramMeta}>
                            <span className={styles.completedProgramDate}>
                              Enrolled on: {new Date().toLocaleDateString()}
                            </span>
                            <span className={styles.completedProgramStatus}>
                              Status: {appointment.paymentStatus === "paid" ? "Fully Paid" : "Installment Plan Active"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.completedActionsCard}>
                      <div className={styles.completedActionsIcon}>
                        <CheckCircle className={styles.completedActionsIconSvg} />
                      </div>
                      <div className={styles.completedActionsContent}>
                        <h3 className={styles.completedActionsTitle}>Next Steps Available</h3>
                        <ul className={styles.completedActionsList}>
                          <li>Access to all program materials</li>
                          <li>Schedule follow-up sessions</li>
                          <li>Download payment receipt</li>
                          <li>Contact support for assistance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Status: "cancelled" - Show Enhanced Cancelled Placeholder */}
          {appointment.status === "cancelled" && (
            <div className={styles.cancelledSection}>
              <div className={styles.cancelledHeader}>
                <div className={styles.cancelledIconContainer}>
                  <X className={styles.cancelledIcon} />
                </div>
                <div className={styles.cancelledHeaderText}>
                  <h2 className={styles.cancelledTitle}>Appointment Cancelled</h2>
                  <p className={styles.cancelledSubtitle}>This program has been cancelled and is no longer active</p>
                </div>
              </div>

              <div className={styles.cancelledContent}>
                <div className={styles.cancelledAlert}>
                  <div className={styles.alertIcon}>
                    <X className={styles.alertIconSvg} />
                  </div>
                  <div className={styles.alertContent}>
                    <h3 className={styles.alertTitle}>Program Status: Cancelled</h3>
                    <p className={styles.alertDescription}>
                      This appointment has been cancelled and cannot be completed. No payment processing or program
                      enrollment is available for this appointment.
                    </p>
                  </div>
                </div>

                <div className={styles.appointmentDetailsCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Appointment Details</h3>
                    <span className={styles.statusBadge}>Cancelled</span>
                  </div>

                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailIcon}>
                        <User className={styles.detailIconSvg} />
                      </div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Student Name</span>
                        <span className={styles.detailValue}>{appointment.patientName || "N/A"}</span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <div className={styles.detailIcon}>
                        <Calendar className={styles.detailIconSvg} />
                      </div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Date</span>
                        <span className={styles.detailValue}>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <div className={styles.detailIcon}>
                        <Clock className={styles.detailIconSvg} />
                      </div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Time</span>
                        <span className={styles.detailValue}>{appointment.time}</span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <div className={styles.detailIcon}>
                        <FileText className={styles.detailIconSvg} />
                      </div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Description</span>
                        <span className={styles.detailValue}>{appointment.description}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cancellationInfo}>
                    <div className={styles.cancellationHeader}>
                      <X className={styles.cancellationIcon} />
                      <span className={styles.cancellationText}>Cancellation Information</span>
                    </div>
                    <div className={styles.cancellationDetails}>
                      <p className={styles.cancellationNote}>
                        This appointment was cancelled and is no longer available for completion or payment processing.
                      </p>
                      <div className={styles.cancellationMeta}>
                        <span className={styles.cancellationDate}>
                          Cancelled on:{" "}
                          {appointment.updatedAt ? new Date(appointment.updatedAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.actionRestrictedCard}>
                  <div className={styles.restrictedIcon}>
                    <X className={styles.restrictedIconSvg} />
                  </div>
                  <div className={styles.restrictedContent}>
                    <h3 className={styles.restrictedTitle}>Actions Not Available</h3>
                    <ul className={styles.restrictedList}>
                      <li>Cannot mark as complete</li>
                      <li>Cannot process payments</li>
                      <li>Cannot create installment plans</li>
                      <li>Cannot enroll in program</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
