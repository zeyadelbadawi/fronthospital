"use client"
import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import dynamic from "next/dynamic"
import styles from "./NumberingWizardWithLabel.module.css"

// Dynamic imports للمكونات الثقيلة
const DatePicker = dynamic(() => import("react-datepicker"), {
  ssr: false,
  loading: () => <div className={styles.loadingSpinner}></div>,
})

const Select = dynamic(() => import("react-select"), {
  ssr: false,
  loading: () => <div className={styles.loadingSpinner}></div>,
})

const SyncfusionDocx = dynamic(() => import("@/components/SyncfusionDocx"), {
  ssr: false,
  loading: () => <div>Loading document editor...</div>,
})

// تحميل CSS للـ DatePicker بشكل منفصل
import("react-datepicker/dist/react-datepicker.css")

const NumberingWizardWithLabel = ({ currentStep, setCurrentStep, patientId, patientName }) => {
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [description, setDescription] = useState("")
  const [evaluationType, setEvaluationType] = useState("")
  const [plan, setPlan] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [assignmentError, setAssignmentError] = useState("")
  const [assignmentResults, setAssignmentResults] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [hasActiveFullProgram, setHasActiveFullProgram] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Memoized service options
  const serviceOptions = useMemo(
    () => [
      { value: "physical_therapy", label: "Physical Therapy", price: 100 },
      { value: "ABA", label: "ABA", price: 300 },
      { value: "occupational_therapy", label: "Occupational Therapy", price: 1200 },
      { value: "special_education", label: "Special Education", price: 500 },
      { value: "speech", label: "Speech", price: 230 },
    ],
    [],
  )

  const [programData, setProgramData] = useState({
    programType: "",
    patientId,
    date: selectedDay,
    time: selectedTime,
    description: "",
    programKind: "",
    unicValue: "",
  })

  // Helper function to format time to HH:MM
  const formatTimeToHHMM = useCallback((date) => {
    if (!date) return null
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }, [])

  const handleServiceChange = useCallback((selectedOptions = []) => {
    setSelectedServices(selectedOptions)
    const newPrice = selectedOptions.reduce((total, option) => total + option.price, 0)
    setTotalPrice(newPrice)
    // Clear validation error when services are selected
    if (selectedOptions.length > 0) {
      setValidationErrors((prev) => ({ ...prev, services: null }))
    }
  }, [])

  // Lazy loading للـ axios instance
  const getAxiosInstance = useCallback(async () => {
    const { default: axiosInstance } = await import("@/helper/axiosSetup")
    return axiosInstance
  }, [])

  // تحسين استدعاءات API
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (!patientId) return

      setIsLoading(true)
      try {
        const axiosInstance = await getAxiosInstance()

        // استدعاء البيانات بشكل متوازي
        const [planResponse, programResponse] = await Promise.allSettled([
          axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/DrastHala/plan/${patientId}`),
          axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/check-active-full-program/${patientId}`),
        ])

        if (isMounted) {
          if (planResponse.status === "fulfilled") {
            setPlan(planResponse.value.data)
          }

          if (programResponse.status === "fulfilled") {
            setHasActiveFullProgram(programResponse.value.data.hasActiveFullProgram)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [patientId, getAxiosInstance])

  const getProgramPrice = useCallback((programType) => {
    switch (programType) {
      case "full_program":
        return 1000
      case "single_session":
        return 100
      case "school_evaluation":
        return 400
      default:
        return 0
    }
  }, [])

  useEffect(() => {
    if (currentStep === 0) {
      setSelectedServices([])
      setAssignmentError("")
      setAssignmentResults(null)
      setValidationErrors({})
    }
    if (currentStep === 3) {
      setEvaluationType("")
      setDescription("")
    }
  }, [currentStep])

  const filterWeekdays = useCallback((date) => {
    const day = date.getDay()
    return day === 0 || day === 5
  }, [])

  // Enhanced validation functions
  const validateStep = useCallback(
    (step) => {
      const errors = {}
      switch (step) {
        case 0:
          if (!evaluationType) {
            errors.evaluationType = "Please select an evaluation type"
          }
          break
        case 1:
          if (!selectedDay) {
            errors.selectedDay = "Please select a date"
          }
          if (!selectedTime) {
            errors.selectedTime = "Please select a time"
          }
          if (!description.trim()) {
            errors.description = "Please provide a description"
          }
          if (evaluationType === "single_session" && selectedServices.length === 0) {
            errors.services = "Please select at least one service"
          }
          break
        case 2:
          // Document step is optional
          break
        default:
          break
      }
      setValidationErrors(errors)
      return Object.keys(errors).length === 0
    },
    [evaluationType, selectedDay, selectedTime, description, selectedServices],
  )

  // Enhanced assignment creation function
  const createPatientSchoolAssignment = useCallback(
    async (patientId, description) => {
      try {
        const axiosInstance = await getAxiosInstance()
        const checkResponse = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/school/school-assignments?search=${patientId}`,
        )
        const existingAssignments = checkResponse.data.assignments || []
        const isAlreadyAssigned = existingAssignments.some(
          (assignment) => assignment.patient && assignment.patient._id === patientId,
        )

        if (isAlreadyAssigned) {
          return { success: true, message: "Patient already assigned to school program" }
        }

        const assignmentData = {
          patientId: patientId,
          notes: description || `School evaluation assignment for ${patientName}`,
        }

        const response = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_API_URL}/school/assign-to-school`,
          assignmentData,
        )

        if (response.status === 201) {
          return { success: true, data: response.data }
        }
      } catch (error) {
        console.error("Error creating school assignment:", error)
        if (error.response?.status === 400 && error.response?.data?.message?.includes("already assigned")) {
          return { success: true, message: "Patient already assigned to school program" }
        }
        return {
          success: false,
          error: error.response?.data?.message || "Failed to assign patient to school program",
        }
      }
    },
    [getAxiosInstance, patientName],
  )

  const nextStep = useCallback(async () => {
    if (!validateStep(currentStep)) {
      return
    }

    if (currentStep < 4) {
      try {
        let programType = ""
        if (evaluationType === "full_package_evaluation") {
          programType = "full_program"
        } else if (evaluationType === "single_session") {
          programType = "single_session"
        } else if (evaluationType === "school_evaluation") {
          programType = "school_evaluation"
        }

        const formattedTime = formatTimeToHHMM(selectedTime)

        const updatedProgramData = {
          ...programData,
          programType,
          date: selectedDay,
          time: formattedTime,
          description,
          programKind: evaluationType === "single_session" ? selectedServices.map((s) => s.value) : "",
        }

        setProgramData(updatedProgramData)
        setCurrentStep(currentStep + 1)
      } catch (error) {
        console.error("Error saving program:", error)
        alert("An error occurred while processing your request. Please try again.")
      }
    }
  }, [
    currentStep,
    validateStep,
    evaluationType,
    selectedDay,
    selectedTime,
    formatTimeToHHMM,
    programData,
    description,
    selectedServices,
    setCurrentStep,
  ])

  const handlePayment = useCallback(async () => {
    if (isProcessingPayment) return
    setIsProcessingPayment(true)
    setAssignmentError("")
    setAssignmentResults(null)

    try {
      const axiosInstance = await getAxiosInstance()
      const programType = programData.programType
      let totalAmount = 0
      let initialPayment = 0

      if (programType === "full_program") {
        totalAmount = 5000
        initialPayment = 1000
      } else {
        totalAmount = getProgramPrice(programType) + totalPrice
        initialPayment = totalAmount
      }

      const formattedTime = formatTimeToHHMM(selectedTime)

      const programPayload = {
        ...programData,
        patientId,
        programKind: selectedServices.map((service) => service.value),
        programType,
        time: formattedTime,
        totalAmount,
        paidAmount: initialPayment,
        remainingAmount: totalAmount - initialPayment,
        paymentStatus: initialPayment >= totalAmount ? "FULLY_PAID" : "PARTIALLY_PAID",
        paymentMethod: programType === "full_program" ? "MIXED" : "CASH",
      }

      const response = await axiosInstance.post("/authentication/saveProgram", programPayload)

      if (response.status === 200) {
        const programId = response.data.program._id

        const moneyResponse = await axiosInstance.post("/authentication/saveMoneyRecord", {
          patientId,
          programId,
          price: initialPayment,
          status: "completed",
          invoiceId: `INV-${Math.random().toString(36).substring(2, 15)}`,
          programType,
          comment: `Initial payment for ${programType} - Patient: ${patientName}`,
          patientName,
        })

        if (moneyResponse.status === 200) {
          if (programType === "school_evaluation") {
            const assignmentResult = await createPatientSchoolAssignment(patientId, description)
            if (!assignmentResult.success) {
              setAssignmentError(assignmentResult.error)
            }
          }
          setCurrentStep(4)
        }
      }
    } catch (error) {
      console.error("Error saving program:", error)
      alert("Payment processing failed. Please try again.")
    } finally {
      setIsProcessingPayment(false)
    }
  }, [
    isProcessingPayment,
    getAxiosInstance,
    programData,
    getProgramPrice,
    totalPrice,
    formatTimeToHHMM,
    selectedTime,
    patientId,
    selectedServices,
    patientName,
    createPatientSchoolAssignment,
    description,
    setCurrentStep,
  ])

  const steps = useMemo(
    () => [
      { number: 1, title: "Select Evaluation Type", icon: "📋" },
      { number: 2, title: "Request Evaluation", icon: "📅" },
      { number: 3, title: "Word Document", icon: "📄" },
      { number: 4, title: "Payment", icon: "💳" },
      { number: 5, title: "Complete", icon: "✅" },
    ],
    [],
  )

  if (isLoading) {
    return (
      <div className={styles.ruknBookingWizard}>
        <div className={styles.ruknWizardContainer}>
          <div className={styles.ruknMainCard}>
            <div className={styles.ruknCardContent}>
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.ruknBookingWizard}>
      <div className={styles.ruknWizardContainer}>
        {/* Header */}
        <div className={styles.ruknHeader}>
          <h4 className={styles.ruknSubTitle}>Book Your Appointment</h4>
        </div>

        {/* Progress Steps */}
        <div className={styles.ruknProgressCard}>
          <div className={styles.ruknStepsContainer}>
            {steps.map((step, index) => (
              <div key={step.number} className={styles.ruknStep}>
                <div className={`${styles.ruknStepCircle} ${currentStep >= index ? styles.active : styles.inactive}`}>
                  {currentStep > index ? "✓" : step.icon}
                </div>
                <span className={`${styles.ruknStepTitle} ${currentStep >= index ? styles.active : styles.inactive}`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`${styles.ruknStepLine} ${currentStep > index ? styles.active : styles.inactive}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className={styles.ruknMainCard}>
          <div className={styles.ruknCardContent}>
            {/* Step 1: Select Evaluation Type */}
            {currentStep === 0 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>Select Evaluation Type</h3>
                  <p>Choose the type of evaluation that best suits your needs</p>
                </div>

                {assignmentError && <div className={styles.ruknErrorMessage}>{assignmentError}</div>}

                <div className={styles.ruknFormGroup}>
                  <label className={styles.ruknLabel}>Evaluation Type *</label>
                  <select
                    className={`${styles.ruknSelect} ${validationErrors.evaluationType ? styles.error : ""}`}
                    value={evaluationType}
                    onChange={(e) => {
                      const type = e.target.value
                      setEvaluationType(type)
                      setAssignmentError("")
                      setValidationErrors((prev) => ({ ...prev, evaluationType: null }))
                    }}
                  >
                    <option value="">Choose your evaluation type...</option>
                    <option value="school_evaluation">🏫 School Evaluation</option>
                    <option value="full_package_evaluation" disabled={hasActiveFullProgram}>
                      📦 Full Package Evaluation {hasActiveFullProgram && "(Already Active)"}
                    </option>
                    <option value="single_session">👤 Single Session</option>
                  </select>
                  {validationErrors.evaluationType && (
                    <span className={styles.ruknErrorText}>{validationErrors.evaluationType}</span>
                  )}
                </div>

                <div className={`${styles.ruknButtonGroup} ${styles.end}`}>
                  <button
                    onClick={nextStep}
                    disabled={!evaluationType}
                    className={`${styles.ruknButton} ${styles.ruknButtonPrimary}`}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Request Evaluation */}
            {currentStep === 1 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>Schedule Your Appointment</h3>
                  <p>Select your preferred date, time, and provide details</p>
                </div>

                <div className={styles.ruknFormGrid}>
                  <div className={styles.ruknFormGroup}>
                    <label className={styles.ruknLabel}>Select Day *</label>
                    <Suspense fallback={<div className={styles.loadingSpinner}></div>}>
                      <DatePicker
                        selected={selectedDay}
                        onChange={(date) => {
                          setSelectedDay(date)
                          setValidationErrors((prev) => ({ ...prev, selectedDay: null }))
                        }}
                        filterDate={filterWeekdays}
                        placeholderText="Choose a date"
                        className={`${styles.ruknInput} ${validationErrors.selectedDay ? styles.error : ""}`}
                        dateFormat="MMMM dd, yyyy"
                        calendarClassName="custom-calendar"
                        minDate={new Date()}
                      />
                    </Suspense>
                    {validationErrors.selectedDay && (
                      <span className={styles.ruknErrorText}>{validationErrors.selectedDay}</span>
                    )}
                  </div>

                  <div className={styles.ruknFormGroup}>
                    <label className={styles.ruknLabel}>Select Time *</label>
                    <Suspense fallback={<div className={styles.loadingSpinner}></div>}>
                      <DatePicker
                        selected={selectedTime}
                        onChange={(date) => {
                          setSelectedTime(date)
                          setValidationErrors((prev) => ({ ...prev, selectedTime: null }))
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        timeCaption="Time"
                        minTime={new Date().setHours(12, 0)}
                        maxTime={new Date().setHours(20, 0)}
                        dateFormat="h:mm aa"
                        className={`${styles.ruknInput} ${validationErrors.selectedTime ? styles.error : ""}`}
                        placeholderText="Choose a time"
                        filterTime={(time) => {
                          const hour = time.getHours()
                          return hour >= 12 && hour <= 20
                        }}
                      />
                    </Suspense>
                    {validationErrors.selectedTime && (
                      <span className={styles.ruknErrorText}>{validationErrors.selectedTime}</span>
                    )}
                    {selectedTime && (
                      <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
                        Selected time: {formatTimeToHHMM(selectedTime)}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.ruknFormGroup}>
                  <label className={styles.ruknLabel}>Description *</label>
                  <textarea
                    className={`${styles.ruknTextarea} ${validationErrors.description ? styles.error : ""}`}
                    placeholder="Please describe your needs or any specific requirements..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      setValidationErrors((prev) => ({ ...prev, description: null }))
                    }}
                  />
                  {validationErrors.description && (
                    <span className={styles.ruknErrorText}>{validationErrors.description}</span>
                  )}
                </div>

                {evaluationType === "single_session" && (
                  <div className={styles.ruknFormGroup}>
                    <label className={styles.ruknLabel}>Select Services *</label>
                    <Suspense fallback={<div className={styles.loadingSpinner}></div>}>
                      <Select
                        isMulti
                        name="services"
                        options={serviceOptions}
                        getOptionLabel={(e) => `${e.label} ($${e.price})`}
                        onChange={handleServiceChange}
                        placeholder="Choose your services..."
                        className={validationErrors.services ? styles.error : ""}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            border: validationErrors.services ? "2px solid #ef4444" : "2px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            padding: "0.25rem",
                            "&:hover": { borderColor: validationErrors.services ? "#ef4444" : "#3b82f6" },
                            "&:focus": { borderColor: validationErrors.services ? "#ef4444" : "#3b82f6" },
                          }),
                        }}
                      />
                    </Suspense>
                    {validationErrors.services && (
                      <span className={styles.ruknErrorText}>{validationErrors.services}</span>
                    )}
                    {totalPrice > 0 && (
                      <div className={styles.ruknServiceTotal}>
                        <p>Selected Services Total: ${totalPrice}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.ruknButtonGroup}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(0)}
                    className={`${styles.ruknButton} ${styles.ruknButtonSecondary}`}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`${styles.ruknButton} ${styles.ruknButtonPrimary}`}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Word Document */}
            {currentStep === 2 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>Review & Edit Document</h3>
                  <p>Review and customize your treatment plan document</p>
                </div>

                <div className={styles.ruknDocumentContainer}>
                  <Suspense fallback={<div>Loading document editor...</div>}>
                    {plan && plan._id ? (
                      <SyncfusionDocx
                        userData={{
                          docxId: plan._id,
                          patientId: patientId,
                          filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/DRAST-7ALA/plan/${plan.filePath}`,
                          fileName: plan.fileName || "default.docx",
                          docxName: `Case study of student: ${patientName}.docx`,
                        }}
                        planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/DrastHala/upload-plan`}
                      />
                    ) : (
                      <SyncfusionDocx
                        userData={{
                          docxId: "default",
                          patientId: patientId,
                          filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/DRAST-7ALA/plan/default.docx`,
                          fileName: "default.docx",
                        }}
                        planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/DrastHala/upload-plan`}
                      />
                    )}
                  </Suspense>
                </div>

                <div className={styles.ruknButtonGroup}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className={`${styles.ruknButton} ${styles.ruknButtonSecondary}`}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className={`${styles.ruknButton} ${styles.ruknButtonPrimary}`}
                  >
                    Proceed to Payment →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 3 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>Complete Payment</h3>
                  <p>Secure payment processing for your appointment</p>
                </div>

                {assignmentError && <div className={styles.ruknWarningMessage}>Warning: {assignmentError}</div>}

                {assignmentResults && (
                  <div className={styles.ruknAssignmentResults}>
                    <h4>Service Assignment Results</h4>
                    <div className={styles.ruknAssignmentSummary}>
                      <p>✅ Successfully assigned: {assignmentResults.totalAssigned}</p>
                      {assignmentResults.totalFailed > 0 && (
                        <p>❌ Failed assignments: {assignmentResults.totalFailed}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.ruknPaymentSummary}>
                  <h4>Payment Summary</h4>
                  {programData.programType === "full_program" ? (
                    <>
                      <div className={styles.ruknPaymentRow}>
                        <span>Full Program Total:</span>
                        <span>5,000 EGP</span>
                      </div>
                      <div className={styles.ruknPaymentRow}>
                        <span>Initial Payment (Today):</span>
                        <span>1,000 EGP</span>
                      </div>
                      <div className={styles.ruknPaymentRow}>
                        <span>Remaining (After Consultation):</span>
                        <span>4,000 EGP</span>
                      </div>
                      <div className={styles.ruknPaymentTotal}>
                        <span>Paying Now:</span>
                        <span>1,000 EGP</span>
                      </div>
                      <p className={styles.ruknPaymentNote}>
                        You'll complete the remaining payment after your consultation with the doctor.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className={styles.ruknPaymentRow}>
                        <span>Program Fee:</span>
                        <span>${getProgramPrice(programData.programType)}</span>
                      </div>
                      {totalPrice > 0 && (
                        <div className={styles.ruknPaymentRow}>
                          <span>Additional Services:</span>
                          <span>${totalPrice}</span>
                        </div>
                      )}
                      <div className={styles.ruknPaymentTotal}>
                        <span>Total Amount:</span>
                        <span>${getProgramPrice(programData.programType) + totalPrice}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className={styles.ruknPaymentCenter}>
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className={`${styles.ruknButton} ${styles.ruknButtonSuccess}`}
                  >
                    💳 {isProcessingPayment ? "Processing..." : "Complete Payment"}
                  </button>
                  <p className={styles.ruknPaymentNote}>Secure payment processing • SSL encrypted</p>
                </div>
              </div>
            )}

            {/* Step 5: Complete */}
            {currentStep === 4 && (
              <div className={styles.ruknSuccessContainer}>
                <div className={styles.ruknSuccessIcon}>
                  <span>🎉</span>
                </div>
                <h3 className={styles.ruknSuccessTitle}>Congratulations!</h3>
                <p className={styles.ruknSuccessMessage}>
                  Your appointment has been successfully booked at Rukn Elwatikon Rehabilitation Center.
                  {programData.programType === "school_evaluation" &&
                    " You have been assigned to our school evaluation program."}
                </p>

                {assignmentResults && (
                  <div className={styles.ruknAssignmentFinalResults}>
                    <h4>Service Assignments</h4>
                    <p>You have been automatically assigned to {assignmentResults.totalAssigned} service(s).</p>
                    {assignmentResults.details.map((result, index) => (
                      <div key={index} className={styles.ruknServiceAssignment}>
                        ✅ {result.assignment.notes}
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.ruknNextSteps}>
                  <h4>What's Next?</h4>
                  <ul>
                    <li>• You'll receive a confirmation email shortly</li>
                    <li>• Our team will contact you 24 hours before your appointment</li>
                    <li>• Please arrive 15 minutes early</li>
                    {programData.programType === "school_evaluation" && (
                      <li>• You can now access the school evaluation portal</li>
                    )}
                    {assignmentResults && assignmentResults.totalAssigned > 0 && (
                      <li>• You can view your service assignments in the respective department portals</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NumberingWizardWithLabel
