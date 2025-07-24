"use client"
import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import dynamic from "next/dynamic"
import { useLanguage } from "@/contexts/LanguageContext"
import styles from "../styles/StudentBooking.module.css"

// Dynamic imports للمكونات الثقيلة
const DatePicker = dynamic(() => import("react-datepicker"), {
  ssr: false,
  loading: () => <div className={styles.loadingSpinner}></div>,
})

const Select = dynamic(() => import("react-select"), {
  ssr: false,
  loading: () => <div className={styles.loadingSpinner}></div>,
})

const SyncfusionDocxCase = dynamic(() => import("@/components/SyncfusionDocxCase"), {
  ssr: false,
  loading: () => <div>Loading document editor...</div>,
})

// تحميل CSS للـ DatePicker بشكل منفصل
import("react-datepicker/dist/react-datepicker.css")

const StudentBooking = ({ currentStep, setCurrentStep, patientId, patientName }) => {
  const { language, translations } = useLanguage()
  const t = translations[language]

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

  // Update service options with translations
  const serviceOptions = useMemo(
    () => [
      {
        value: "physical_therapy",
        label: language === "ar" ? "العلاج الطبيعي" : "Physical Therapy",
        price: 100,
      },
      {
        value: "ABA",
        label: language === "ar" ? "تحليل السلوك التطبيقي" : "ABA",
        price: 300,
      },
      {
        value: "occupational_therapy",
        label: language === "ar" ? "العلاج الوظيفي" : "Occupational Therapy",
        price: 1200,
      },
      {
        value: "special_education",
        label: language === "ar" ? "التعليم الخاص" : "Special Education",
        price: 500,
      },
      {
        value: "speech",
        label: language === "ar" ? "علاج النطق" : "Speech",
        price: 230,
      },
    ],
    [language],
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

  // Enhanced date filtering - only allow Fridays and Sundays
  const filterWeekdays = useCallback((date) => {
    const day = date.getDay()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Only allow Fridays (5) and Sundays (0) and dates from today onwards
    return (day === 0 || day === 5) && date >= today
  }, [])

  // Enhanced time filtering - only allow specific time slots
  const filterTime = useCallback((time) => {
    const hour = time.getHours()
    const minute = time.getMinutes()

    // Only allow times between 12:00 PM and 8:00 PM
    // And only allow 30-minute intervals (00 and 30 minutes)
    return hour >= 12 && hour <= 20 && (minute === 0 || minute === 30)
  }, [])

  // Generate available time slots
  const getAvailableTimeSlots = useCallback(() => {
    const slots = []
    for (let hour = 12; hour <= 20; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 20 && minute === 30) break // Don't include 8:30 PM

        const time = new Date()
        time.setHours(hour, minute, 0, 0)

        const timeString = time.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })

        slots.push({
          value: time,
          label: timeString,
          hour,
          minute,
        })
      }
    }
    return slots
  }, [language])

  const validateStep = useCallback(
    (step) => {
      const errors = {}
      switch (step) {
        case 0:
          if (!evaluationType) {
            errors.evaluationType = language === "ar" ? "يرجى اختيار نوع التقييم" : "Please select an evaluation type"
          }
          break
        case 1:
          if (!selectedDay) {
            errors.selectedDay = language === "ar" ? "يرجى اختيار التاريخ" : "Please select a date"
          }
          if (!selectedTime) {
            errors.selectedTime = language === "ar" ? "يرجى اختيار الوقت" : "Please select a time"
          }
          if (!description.trim()) {
            errors.description = language === "ar" ? "يرجى تقديم وصف" : "Please provide a description"
          }
          if (evaluationType === "single_session" && selectedServices.length === 0) {
            errors.services =
              language === "ar" ? "يرجى اختيار خدمة واحدة على الأقل" : "Please select at least one service"
          }
          break
        case 2:
          break
        default:
          break
      }
      setValidationErrors(errors)
      return Object.keys(errors).length === 0
    },
    [evaluationType, selectedDay, selectedTime, description, selectedServices, language],
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
          return { success: true, message: "Student already assigned to school program" }
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
          return { success: true, message: "Student already assigned to school program" }
        }
        return {
          success: false,
          error: error.response?.data?.message || "Failed to assign Student to school program",
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
          comment: `Initial payment for ${programType} - Student: ${patientName}`,
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
      {
        number: 1,
        title: language === "ar" ? "اختر نوع التقييم" : "Select Evaluation Type",
        icon: "📋",
      },
      {
        number: 2,
        title: language === "ar" ? "طلب التقييم" : "Request Evaluation",
        icon: "📅",
      },
      {
        number: 3,
        title: language === "ar" ? "مستند وورد" : "Word Document",
        icon: "📄",
      },
      {
        number: 4,
        title: language === "ar" ? "الدفع" : "Payment",
        icon: "💳",
      },
      {
        number: 5,
        title: language === "ar" ? "مكتمل" : "Complete",
        icon: "✅",
      },
    ],
    [language],
  )

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: `2px solid ${validationErrors.services ? "#ef4444" : state.isFocused ? "#e91e63" : "#e2e8f0"}`,
      borderRadius: "12px",
      padding: "0.5rem 0.75rem",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      boxShadow: state.isFocused ? "0 0 0 4px rgba(233, 30, 99, 0.1), 0 4px 12px rgba(233, 30, 99, 0.15)" : "none",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: state.isFocused ? "translateY(-1px)" : "translateY(0)",
      "&:hover": {
        borderColor: validationErrors.services ? "#ef4444" : "#e91e63",
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "12px",
      border: "1px solid rgba(233, 30, 99, 0.2)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      zIndex: 9999,
      overflow: "hidden",
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "0.5rem",
      maxHeight: "200px",
    }),
    option: (provided, state) => ({
      ...provided,
      borderRadius: "8px",
      margin: "0.25rem 0",
      padding: "0.75rem 1rem",
      backgroundColor: state.isSelected
        ? "linear-gradient(135deg, #e91e63 0%, #4a4a8a 100%)"
        : state.isFocused
          ? "rgba(233, 30, 99, 0.1)"
          : "transparent",
      color: state.isSelected ? "white" : "#374151",
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: state.isSelected
          ? "linear-gradient(135deg, #e91e63 0%, #4a4a8a 100%)"
          : "rgba(233, 30, 99, 0.15)",
        transform: "translateX(4px)",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "rgba(233, 30, 99, 0.1)",
      borderRadius: "6px",
      border: "1px solid rgba(233, 30, 99, 0.2)",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#e91e63",
      fontWeight: "600",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#e91e63",
      "&:hover": {
        backgroundColor: "#e91e63",
        color: "white",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
      fontStyle: "italic",
    }),
  }

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
    <div className={`${styles.ruknBookingWizard} ${language === "ar" ? styles.rtl : styles.ltr}`}>
      <div className={styles.ruknWizardContainer}>
        {/* Header */}
        <div className={styles.ruknHeader}>
          <h4 className={styles.ruknSubTitle}>{language === "ar" ? "احجز موعدك" : "Book Your Appointment"}</h4>
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
                  <h3>{language === "ar" ? "اختر نوع التقييم" : "Select Evaluation Type"}</h3>
                  <p>
                    {language === "ar"
                      ? "اختر نوع التقييم الذي يناسب احتياجاتك"
                      : "Choose the type of evaluation that best suits your needs"}
                  </p>
                </div>

                {assignmentError && <div className={styles.ruknErrorMessage}>{assignmentError}</div>}

                <div className={styles.ruknFormGroup}>
                  <label className={styles.ruknLabel}>
                    {language === "ar" ? "نوع التقييم *" : "Evaluation Type *"}
                  </label>
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
                    <option value="">
                      {language === "ar" ? "اختر نوع التقييم..." : "Choose your evaluation type..."}
                    </option>
                    <option value="school_evaluation">
                      🏫 {language === "ar" ? "تقييم مدرسي" : "School Evaluation"}
                    </option>
                    <option value="full_package_evaluation" disabled={hasActiveFullProgram}>
                      📦 {language === "ar" ? "تقييم الحزمة الكاملة" : "Full Package Evaluation"}
                      {hasActiveFullProgram && (language === "ar" ? " (نشط بالفعل)" : " (Already Active)")}
                    </option>
                    <option value="single_session">👤 {language === "ar" ? "جلسة واحدة" : "Single Session"}</option>
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
                    {language === "ar" ? "متابعة ←" : "Continue →"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Request Evaluation */}
            {currentStep === 1 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>{language === "ar" ? "جدولة موعدك" : "Schedule Your Appointment"}</h3>
                  <p>
                    {language === "ar"
                      ? "اختر التاريخ والوقت المفضلين وقدم التفاصيل"
                      : "Select your preferred date, time, and provide details"}
                  </p>
                </div>

                <div className={styles.ruknFormGrid}>
                  <div className={styles.ruknFormGroup}>
                    <label className={styles.ruknLabel}>{language === "ar" ? "اختر اليوم *" : "Select Day *"}</label>
                    <div className={styles.ruknDatePickerWrapper}>
                      <Suspense fallback={<div className={styles.loadingSpinner}></div>}>
                        <DatePicker
                          selected={selectedDay}
                          onChange={(date) => {
                            setSelectedDay(date)
                            setValidationErrors((prev) => ({ ...prev, selectedDay: null }))
                          }}
                          filterDate={filterWeekdays}
                          placeholderText={
                            language === "ar"
                              ? "اختر تاريخاً (الجمعة أو الأحد فقط)"
                              : "Choose a date (Fridays & Sundays only)"
                          }
                          className={`${styles.ruknDatePicker} ${validationErrors.selectedDay ? styles.error : ""}`}
                          dateFormat="EEEE, MMMM dd, yyyy"
                          minDate={new Date()}
                          maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 3 months ahead
                          showPopperArrow={false}
                          popperClassName={styles.ruknDatePickerPopper}
                          calendarClassName={styles.ruknDatePickerCalendar}
                          dayClassName={(date) => {
                            const day = date.getDay()
                            if (day === 0 || day === 5) {
                              return styles.ruknAvailableDay
                            }
                            return styles.ruknUnavailableDay
                          }}
                        />
                      </Suspense>
                    </div>
                    {validationErrors.selectedDay && (
                      <span className={styles.ruknErrorText}>{validationErrors.selectedDay}</span>
                    )}
                    <div className={styles.ruknDateNote}>
                      {language === "ar"
                        ? "📅 المواعيد متاحة أيام الجمعة والأحد فقط"
                        : "📅 Appointments available on Fridays and Sundays only"}
                    </div>
                  </div>

                  <div className={styles.ruknFormGroup}>
                    <label className={styles.ruknLabel}>{language === "ar" ? "اختر الوقت *" : "Select Time *"}</label>
                    <div className={styles.ruknTimePickerWrapper}>
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
                          timeCaption={language === "ar" ? "الوقت" : "Time"}
                          minTime={new Date().setHours(12, 0)}
                          maxTime={new Date().setHours(20, 0)}
                          dateFormat="h:mm aa"
                          className={`${styles.ruknTimePicker} ${validationErrors.selectedTime ? styles.error : ""}`}
                          placeholderText={
                            language === "ar" ? "اختر وقتاً (12:00 ظ - 8:00 م)" : "Choose time (12:00 PM - 8:00 PM)"
                          }
                          filterTime={filterTime}
                          showPopperArrow={false}
                          popperClassName={styles.ruknTimePickerPopper}
                          timeClassName={(time) => {
                            const hour = time.getHours()
                            const minute = time.getMinutes()
                            if (hour >= 12 && hour <= 20 && (minute === 0 || minute === 30)) {
                              return styles.ruknAvailableTime
                            }
                            return styles.ruknUnavailableTime
                          }}
                        />
                      </Suspense>
                    </div>
                    {validationErrors.selectedTime && (
                      <span className={styles.ruknErrorText}>{validationErrors.selectedTime}</span>
                    )}
                    {selectedTime && (
                      <div className={styles.ruknTimeNote}>
                        {language === "ar" ? "🕐 الوقت المحدد:" : "🕐 Selected time:"} {formatTimeToHHMM(selectedTime)}
                      </div>
                    )}
                    <div className={styles.ruknTimeNote}>
                      {language === "ar"
                        ? "⏰ المواعيد متاحة من 12:00 ظهراً إلى 8:00 مساءً (كل 30 دقيقة)"
                        : "⏰ Appointments available from 12:00 PM to 8:00 PM (every 30 minutes)"}
                    </div>
                  </div>
                </div>

                <div className={styles.ruknFormGroup}>
                  <label className={styles.ruknLabel}>{language === "ar" ? "الوصف *" : "Description *"}</label>
                  <textarea
                    className={`${styles.ruknTextarea} ${validationErrors.description ? styles.error : ""}`}
                    placeholder={
                      language === "ar"
                        ? "يرجى وصف احتياجاتك أو أي متطلبات محددة..."
                        : "Please describe your needs or any specific requirements..."
                    }
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
                    <label className={styles.ruknLabel}>
                      {language === "ar" ? "اختر الخدمات *" : "Select Services *"}
                    </label>
                    <div className={styles.ruknSelectWrapper}>
                      <Suspense fallback={<div className={styles.loadingSpinner}></div>}>
                        <Select
                          isMulti
                          name="services"
                          options={serviceOptions}
                          getOptionLabel={(e) => `${e.label} ($${e.price})`}
                          onChange={handleServiceChange}
                          placeholder={language === "ar" ? "اختر خدماتك..." : "Choose your services..."}
                          styles={customSelectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          isRtl={language === "ar"}
                        />
                      </Suspense>
                    </div>
                    {validationErrors.services && (
                      <span className={styles.ruknErrorText}>{validationErrors.services}</span>
                    )}
                    {totalPrice > 0 && (
                      <div className={styles.ruknServiceTotal}>
                        <p>
                          {language === "ar" ? "إجمالي الخدمات المحددة:" : "Selected Services Total:"} ${totalPrice}
                        </p>
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
                    {language === "ar" ? "→ رجوع" : "← Back"}
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`${styles.ruknButton} ${styles.ruknButtonPrimary}`}
                  >
                    {language === "ar" ? "متابعة ←" : "Continue →"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Word Document */}
            {currentStep === 2 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>{language === "ar" ? "مراجعة وتعديل المستند" : "Review & Edit Document"}</h3>
                  <p>
                    {language === "ar"
                      ? "راجع وخصص مستند خطة العلاج الخاص بك"
                      : "Review and customize your treatment plan document"}
                  </p>
                </div>

                <div className={styles.ruknDocumentContainer}>
                  <Suspense
                    fallback={
                      <div>{language === "ar" ? "جارٍ تحميل محرر المستندات..." : "Loading document editor..."}</div>
                    }
                  >
                    {plan && plan._id ? (
                      <SyncfusionDocxCase
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
                      <SyncfusionDocxCase
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
                    {language === "ar" ? "→ رجوع" : "← Back"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className={`${styles.ruknButton} ${styles.ruknButtonPrimary}`}
                  >
                    {language === "ar" ? "المتابعة إلى الدفع ←" : "Proceed to Payment →"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 3 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>{language === "ar" ? "إكمال الدفع" : "Complete Payment"}</h3>
                  <p>
                    {language === "ar"
                      ? "معالجة الدفع الآمنة لموعدك"
                      : "Secure payment processing for your appointment"}
                  </p>
                </div>

                {assignmentError && (
                  <div className={styles.ruknWarningMessage}>
                    {language === "ar" ? "تحذير:" : "Warning:"} {assignmentError}
                  </div>
                )}

                {assignmentResults && (
                  <div className={styles.ruknAssignmentResults}>
                    <h4>{language === "ar" ? "نتائج تعيين الخدمة" : "Service Assignment Results"}</h4>
                    <div className={styles.ruknAssignmentSummary}>
                      <p>
                        ✅ {language === "ar" ? "تم التعيين بنجاح:" : "Successfully assigned:"}{" "}
                        {assignmentResults.totalAssigned}
                      </p>
                      {assignmentResults.totalFailed > 0 && (
                        <p>
                          ❌ {language === "ar" ? "التعيينات الفاشلة:" : "Failed assignments:"}{" "}
                          {assignmentResults.totalFailed}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.ruknPaymentSummary}>
                  <h4>{language === "ar" ? "ملخص الدفع" : "Payment Summary"}</h4>
                  {programData.programType === "full_program" ? (
                    <>
                      <div className={styles.ruknPaymentRow}>
                        <span>{language === "ar" ? "إجمالي البرنامج الكامل:" : "Full Program Total:"}</span>
                        <span>5,000 EGP</span>
                      </div>
                      <div className={styles.ruknPaymentRow}>
                        <span>{language === "ar" ? "الدفعة الأولية (اليوم):" : "Initial Payment (Today):"}</span>
                        <span>1,000 EGP</span>
                      </div>
                      <div className={styles.ruknPaymentRow}>
                        <span>
                          {language === "ar" ? "المتبقي (بعد الاستشارة):" : "Remaining (After Consultation):"}
                        </span>
                        <span>4,000 EGP</span>
                      </div>
                      <div className={styles.ruknPaymentTotal}>
                        <span>{language === "ar" ? "الدفع الآن:" : "Paying Now:"}</span>
                        <span>1,000 EGP</span>
                      </div>
                      <p className={styles.ruknPaymentNote}>
                        {language === "ar"
                          ? "ستكمل الدفعة المتبقية بعد استشارتك مع الطبيب."
                          : "You'll complete the remaining payment after your consultation with the doctor."}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className={styles.ruknPaymentRow}>
                        <span>{language === "ar" ? "رسوم البرنامج:" : "Program Fee:"}</span>
                        <span>${getProgramPrice(programData.programType)}</span>
                      </div>
                      {totalPrice > 0 && (
                        <div className={styles.ruknPaymentRow}>
                          <span>{language === "ar" ? "خدمات إضافية:" : "Additional Services:"}</span>
                          <span>${totalPrice}</span>
                        </div>
                      )}
                      <div className={styles.ruknPaymentTotal}>
                        <span>{language === "ar" ? "المبلغ الإجمالي:" : "Total Amount:"}</span>
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
                    💳{" "}
                    {isProcessingPayment
                      ? language === "ar"
                        ? "جارٍ المعالجة..."
                        : "Processing..."
                      : language === "ar"
                        ? "إكمال الدفع"
                        : "Complete Payment"}
                  </button>
                  <p className={styles.ruknPaymentNote}>
                    {language === "ar" ? "معالجة الدفع الآمنة • SSL مشفر" : "Secure payment processing • SSL encrypted"}
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Complete */}
            {currentStep === 4 && (
              <div className={styles.ruknSuccessContainer}>
                <div className={styles.ruknSuccessIcon}>
                  <span>🎉</span>
                </div>
                <h3 className={styles.ruknSuccessTitle}>{language === "ar" ? "تهانينا!" : "Congratulations!"}</h3>
                <p className={styles.ruknSuccessMessage}>
                  {language === "ar"
                    ? "تم حجز موعدك بنجاح في مركز ركن الوطن للتأهيل."
                    : "Your appointment has been successfully booked at Rukn Elwatikon Rehabilitation Center."}
                  {programData.programType === "school_evaluation" &&
                    (language === "ar"
                      ? " لقد تم تعيينك في برنامج التقييم المدرسي الخاص بنا."
                      : " You have been assigned to our school evaluation program.")}
                </p>

                {assignmentResults && (
                  <div className={styles.ruknAssignmentFinalResults}>
                    <h4>{language === "ar" ? "تعيينات الخدمة" : "Service Assignments"}</h4>
                    <p>
                      {language === "ar" ? "لقد تم تعيينك تلقائيًا إلى" : "You have been automatically assigned to"}{" "}
                      {assignmentResults.totalAssigned} {language === "ar" ? "خدمة (خدمات)." : "service(s)."}
                    </p>
                    {assignmentResults.details.map((result, index) => (
                      <div key={index} className={styles.ruknServiceAssignment}>
                        ✅ {result.assignment.notes}
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.ruknNextSteps}>
                  <h4>{language === "ar" ? "ماذا بعد؟" : "What's Next?"}</h4>
                  <ul>
                    <li>
                      •{" "}
                      {language === "ar"
                        ? "ستتلقى رسالة تأكيد بالبريد الإلكتروني قريبًا"
                        : "You'll receive a confirmation email shortly"}
                    </li>
                    <li>
                      •{" "}
                      {language === "ar"
                        ? "سيتصل بك فريقنا قبل موعدك بـ 24 ساعة"
                        : "Our team will contact you 24 hours before your appointment"}
                    </li>
                    <li>• {language === "ar" ? "يرجى الوصول قبل 15 دقيقة" : "Please arrive 15 minutes early"}</li>
                    {programData.programType === "school_evaluation" && (
                      <li>
                        •{" "}
                        {language === "ar"
                          ? "يمكنك الآن الوصول إلى بوابة التقييم المدرسي"
                          : "You can now access the school evaluation portal"}
                      </li>
                    )}
                    {assignmentResults && assignmentResults.totalAssigned > 0 && (
                      <li>
                        •{" "}
                        {language === "ar"
                          ? "يمكنك عرض تعيينات الخدمة الخاصة بك في بوابات الأقسام المعنية"
                          : "You can view your service assignments in the respective department portals"}
                      </li>
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

export default StudentBooking
