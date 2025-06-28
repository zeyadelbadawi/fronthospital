"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, CreditCard, FileText, DollarSign, Calendar, User, Clock, X, Plus } from "lucide-react"
import { useContentStore } from "../store/content-store"
import styles from "../styles/appointment-completion.module.css"
import axiosInstance from "@/helper/axiosSetup"

export function SpeechAppointmentCompletion() {
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [checks, setChecks] = useState([])
    const { activeContent } = useContentStore();
  const { appointmentId } = activeContent || {};  // Get the appointmentId from activeContent

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
      fetchAppointmentData();
    }
  }, [appointmentId]);


const fetchAppointmentData = async () => {
  setLoading(true);
  try {
    // Fetch data for the appointment using axios
    const response = await axiosInstance.get(`/full/appointments/${appointmentId}`); // Adjust the endpoint if needed
    setAppointment(response.data); // Set the appointment data
  } catch (error) {
    console.error("Error fetching appointment:", error);
  } finally {
    setLoading(false);
  }
}
  const handleCompleteAppointment = async () => {
    setSaving(true)
    try {
      // Mock API call to complete appointment
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAppointment((prev) => ({ ...prev, completed: true, status: "completed" }))
      setShowPaymentOptions(true)
      alert("Appointment marked as complete!")
    } catch (error) {
      console.error("Error completing appointment:", error)
      alert("Error completing appointment: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleFullProgramPayment = async () => {
    setSaving(true)
    try {
      // Mock API call to assign full program
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const paymentData = {
        patientId: appointment.patientId,
        appointmentId: appointment._id,
        paymentMethod: "full_payment",
        amount: FULL_PROGRAM_PRICE,
        status: "paid",
        paidAt: new Date().toISOString(),
      }

      console.log("Full program payment processed:", paymentData)

      setAppointment((prev) => ({
        ...prev,
        paymentStatus: "paid",
        fullProgramAssigned: true,
      }))

      alert(
        `Full program plan assigned! Patient paid $${FULL_PROGRAM_PRICE} and is now enrolled in the complete program.`,
      )
    } catch (error) {
      console.error("Error processing full payment:", error)
      alert("Error processing payment: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddCheck = () => {
    if (!newCheck.checkNumber || !newCheck.amount || !newCheck.dueDate) {
      alert("Please fill in all required fields (Check Number, Amount, Due Date)")
      return
    }

    const checkAmount = Number.parseFloat(newCheck.amount)
    if (isNaN(checkAmount) || checkAmount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    const totalChecksAmount = checks.reduce((sum, check) => sum + Number.parseFloat(check.amount), 0)
    const newTotalAmount = totalChecksAmount + checkAmount

    if (newTotalAmount > FULL_PROGRAM_PRICE) {
      alert(
        `Total amount cannot exceed $${FULL_PROGRAM_PRICE}. Current total: $${totalChecksAmount}, trying to add: $${checkAmount}`,
      )
      return
    }

    const checkData = {
      id: Date.now().toString(),
      ...newCheck,
      amount: checkAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    setChecks((prev) => [...prev, checkData])
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
      // Mock API call to save installment plan
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const installmentData = {
        patientId: appointment.patientId,
        appointmentId: appointment._id,
        paymentMethod: "installment",
        totalAmount: FULL_PROGRAM_PRICE,
        checks: checks,
        status: "installment_plan_created",
        createdAt: new Date().toISOString(),
      }

      console.log("Installment plan created:", installmentData)

      setAppointment((prev) => ({
        ...prev,
        paymentStatus: "installment_plan",
        fullProgramAssigned: true,
      }))

      alert(`Installment plan created with ${checks.length} checks totaling $${FULL_PROGRAM_PRICE}`)
    } catch (error) {
      console.error("Error creating installment plan:", error)
      alert("Error creating installment plan: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveCheck = (checkId) => {
    setChecks((prev) => prev.filter((check) => check.id !== checkId))
  }

  const handleBackToAppointments = () => {
    setActiveContent({
      department: "New-Evaulations-Appointments",
      type: "COMPLETE-Evaulations",
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
              <h1 className={styles.completionTitle}>Complete Appointment</h1>
              <div className={styles.appointmentDetails}>
                <div className={styles.appointmentDetail}>
                  <User className={styles.detailIcon} />
                  <span>{appointment.patientName}</span>
                </div>
                <div className={styles.appointmentDetail}>
                  <Calendar className={styles.detailIcon} />
                  <span>{new Date(appointment.date).toLocaleDateString()}</span>
                </div>
                <div className={styles.appointmentDetail}>
                  <Clock className={styles.detailIcon} />
                  <span>{appointment.time}</span>
                </div>
              </div>
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
          {!appointment.completed ? (
            <div className={styles.completionSection}>
              <div className={styles.sectionHeader}>
                <Check className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Mark Appointment as Complete</h2>
              </div>
              <div className={styles.appointmentSummary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Type:</span>
                  <span className={styles.summaryValue}>{appointment.type}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Program:</span>
                  <span className={styles.summaryValue}>{appointment.programKind}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Description:</span>
                  <span className={styles.summaryValue}>{appointment.description}</span>
                </div>
              </div>
              <button onClick={handleCompleteAppointment} disabled={saving} className={styles.completeButton}>
                <Check className={styles.buttonIcon} />
                {saving ? "Completing..." : "Mark as Complete"}
              </button>
            </div>
          ) : (
            <>
              {!appointment.fullProgramAssigned && showPaymentOptions && (
                <div className={styles.paymentSection}>
                  <div className={styles.sectionHeader}>
                    <CreditCard className={styles.sectionIcon} />
                    <h2 className={styles.sectionTitle}>Choose Payment Method</h2>
                  </div>

                  <div className={styles.paymentOptions}>
                    <div className={styles.paymentOption}>
                      <div className={styles.optionHeader}>
                        <h3 className={styles.optionTitle}>Full Payment</h3>
                        <span className={styles.optionPrice}>${FULL_PROGRAM_PRICE.toLocaleString()}</span>
                      </div>
                      <p className={styles.optionDescription}>
                        Pay the full amount now and get immediate access to the complete program plan. No additional
                        charges or fees.
                      </p>
                      <button onClick={handleFullProgramPayment} disabled={saving} className={styles.fullPaymentButton}>
                        <DollarSign className={styles.buttonIcon} />
                        {saving ? "Processing..." : "Pay Full Amount"}
                      </button>
                    </div>

                    <div className={styles.paymentOption}>
                      <div className={styles.optionHeader}>
                        <h3 className={styles.optionTitle}>Installment Plan</h3>
                        <span className={styles.optionPrice}>Using Checks</span>
                      </div>
                      <p className={styles.optionDescription}>
                        Create a payment plan using multiple checks. Total amount must equal $
                        {FULL_PROGRAM_PRICE.toLocaleString()}.
                      </p>
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
                  <div className={styles.sectionHeader}>
                    <FileText className={styles.sectionIcon} />
                    <h2 className={styles.sectionTitle}>Installment Plan - Check Details</h2>
                  </div>

                  <div className={styles.installmentSummary}>
                    <div className={styles.summaryRow}>
                      <span>Total Program Cost:</span>
                      <span className={styles.totalAmount}>${FULL_PROGRAM_PRICE.toLocaleString()}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Checks Added:</span>
                      <span>{checks.length}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Total Checks Amount:</span>
                      <span className={styles.checksAmount}>${getTotalChecksAmount().toLocaleString()}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Remaining Amount:</span>
                      <span className={styles.remainingAmount}>${getRemainingAmount().toLocaleString()}</span>
                    </div>
                  </div>

                  {checks.length > 0 && (
                    <div className={styles.checksContainer}>
                      <h3 className={styles.checksTitle}>Added Checks</h3>
                      <div className={styles.checksList}>
                        {checks.map((check, index) => (
                          <div key={check.id} className={styles.checkItem}>
                            <div className={styles.checkInfo}>
                              <div className={styles.checkNumber}>Check #{check.checkNumber}</div>
                              <div className={styles.checkDetails}>
                                <span>Amount: ${Number.parseFloat(check.amount).toLocaleString()}</span>
                                <span>Due: {new Date(check.dueDate).toLocaleDateString()}</span>
                                {check.bankName && <span>Bank: {check.bankName}</span>}
                              </div>
                              {check.notes && <div className={styles.checkNotes}>Notes: {check.notes}</div>}
                            </div>
                            <button onClick={() => handleRemoveCheck(check.id)} className={styles.removeCheckButton}>
                              <X className={styles.removeIcon} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!showAddCheck ? (
                    <button
                      onClick={() => setShowAddCheck(true)}
                      className={styles.addCheckButton}
                      disabled={getRemainingAmount() <= 0}
                    >
                      <Plus className={styles.buttonIcon} />
                      Add Check
                    </button>
                  ) : (
                    <div className={styles.addCheckForm}>
                      <h3 className={styles.formTitle}>Add New Check</h3>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Check Number *</label>
                          <input
                            type="text"
                            value={newCheck.checkNumber}
                            onChange={(e) => setNewCheck({ ...newCheck, checkNumber: e.target.value })}
                            className={styles.formInput}
                            placeholder="Enter check number"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Amount *</label>
                          <input
                            type="number"
                            value={newCheck.amount}
                            onChange={(e) => setNewCheck({ ...newCheck, amount: e.target.value })}
                            className={styles.formInput}
                            placeholder="0.00"
                            min="0"
                            max={getRemainingAmount()}
                            step="0.01"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Due Date *</label>
                          <input
                            type="date"
                            value={newCheck.dueDate}
                            onChange={(e) => setNewCheck({ ...newCheck, dueDate: e.target.value })}
                            className={styles.formInput}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Bank Name</label>
                          <input
                            type="text"
                            value={newCheck.bankName}
                            onChange={(e) => setNewCheck({ ...newCheck, bankName: e.target.value })}
                            className={styles.formInput}
                            placeholder="Bank name (optional)"
                          />
                        </div>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                          <label className={styles.formLabel}>Notes</label>
                          <textarea
                            value={newCheck.notes}
                            onChange={(e) => setNewCheck({ ...newCheck, notes: e.target.value })}
                            className={styles.formTextarea}
                            placeholder="Additional notes (optional)"
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className={styles.formActions}>
                        <button onClick={() => setShowAddCheck(false)} className={styles.cancelButton}>
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
                      <div className={styles.finalizeMessage}>
                        <Check className={styles.finalizeIcon} />
                        <span>All checks added! Total amount matches the program cost.</span>
                      </div>
                      <button onClick={handleSaveInstallmentPlan} disabled={saving} className={styles.finalizeButton}>
                        <FileText className={styles.buttonIcon} />
                        {saving ? "Creating Plan..." : "Create Installment Plan"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {appointment.fullProgramAssigned && (
                <div className={styles.completedSection}>
                  <div className={styles.completedMessage}>
                    <Check className={styles.completedIcon} />
                    <h2 className={styles.completedTitle}>Appointment Completed & Program Assigned</h2>
                    <p className={styles.completedDescription}>
                      This patient has been successfully enrolled in the full program plan. Payment status:{" "}
                      {appointment.paymentStatus === "paid" ? "Paid in Full" : "Installment Plan Created"}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
