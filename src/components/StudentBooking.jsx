"use client"
import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import dynamic from "next/dynamic"
import { useLanguage } from "@/contexts/LanguageContext"
import styles from "../styles/StudentBooking.module.css"
import InteractiveGuide from "./InteractiveGuide" // Import the new interactive guide
import styles2 from "../styles/AdminStudentBooking.module.css"
import { sendNotification, sendEmail } from "@/helper/notification-helper";

// Import Lucide React icons
import {
  School,
  Package,
  User,
  ClipboardList,
  Calendar,
  FileText,
  CreditCard,
  CheckCircle,
  PartyPopper,
  Clock,
  Check,
  XCircle,
  Info,
  HeartPulse,
  Brain,
  Hand,
  BookOpen,
  Mic,
  AlertCircle,
  Lightbulb,
} from "lucide-react"
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
  loading: () => (
    <div className={styles.ruknDocumentImportLoader}>
      <div className={styles.ruknDocumentImportContent}>
        <div className={styles.ruknDocumentImportIcon}>
          <FileText size={32} />
        </div>
        <h4 className={styles.ruknDocumentImportTitle}>
          {"تحميل محرر المستندات..." /* Arabic */ || "Loading Document Editor..." /* English */}
        </h4>
        <p className={styles.ruknDocumentImportSubtitle}>
          {
            "يرجى الانتظار بينما نقوم بتحضير محرر المستندات المتقدم..." /* Arabic */ ||
            "Please wait while we prepare the advanced document editor..." /* English */
          }
        </p>
        <div className={styles.ruknDocumentImportProgress}>
          <div className={styles.ruknDocumentImportProgressBar}></div>
        </div>
        <div className={styles.ruknDocumentImportTip}>
          <Lightbulb size={16} />
          <span>
            {
              "💡 نصيحة: ستتمكن من تحرير وحفظ مستند دراسة الحالة بمجرد اكتمال التحميل" /* Arabic */ ||
              "💡 Tip: You'll be able to edit and save your case study document once loading completes" /* English */
            }
          </span>
        </div>
      </div>
    </div>
  ),
})
// تحميل CSS للـ DatePicker بشكل منفصل
import("react-datepicker/dist/react-datepicker.css")
const StudentBooking = ({ currentStep, setCurrentStep, patientId, patientName,   patientEmail }) => {
  const { language, translations } = useLanguage()
  const t = translations[language]
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [description, setDescription] = useState("")
  // evaluationType will now store an object { value, label }
  const [evaluationType, setEvaluationType] = useState(null)
  const [plan, setPlan] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [assignmentError, setAssignmentError] = useState("")
  const [assignmentResults, setAssignmentResults] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [hasActiveFullProgram, setHasActiveFullProgram] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bookedSlots, setBookedSlots] = useState([])
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState("")
  const [showInteractiveGuide, setShowInteractiveGuide] = useState(false) // New state for interactive guide
  const [showCaseStudyCreation, setShowCaseStudyCreation] = useState(false)


  const [doctorIds, setDoctorIds] = useState([]);

  const getDoctorIds = async () => {
    try {
        const axiosInstance = await getAxiosInstance()
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/notification/doctor-ids`
      );
      const doctors = response?.data;
      setDoctorIds(doctors);
    } catch (error) {
      console.error("Error fetching doctor IDs:", error);
      setDoctorIds([]);
    }
  };
  useEffect(() => {
    getDoctorIds();
  }, []);


  // Check localStorage for interactive guide status on mount
  useEffect(() => {
    const hasSeenInteractiveGuide = localStorage.getItem("hasSeenInteractiveGuide")
    if (!hasSeenInteractiveGuide) {
      setShowInteractiveGuide(true)
      localStorage.setItem("hasSeenInteractiveGuide", "true")
    }
  }, [])
  // Options for evaluation type, now structured for react-select
  const evaluationTypeOptions = useMemo(
    () => [
      {
        value: "school_evaluation",
        label: (
          <>
            <School size={18} className={styles.iconInline} /> {language === "ar" ? "تقييم مدرسي" : "School Evaluation"}
          </>
        ),
        textLabel: language === "ar" ? "تقييم مدرسي" : "School Evaluation", // For display in select
      },
      {
        value: "full_package_evaluation",
        label: (
          <>
            <Package size={18} className={styles.iconInline} />{" "}
            {language === "ar" ? "تقييم الحزمة الكاملة" : "Full Package Evaluation"}
            {hasActiveFullProgram && (language === "ar" ? " (نشط بالفعل)" : " (Already Active)")}
          </>
        ),
        textLabel: language === "ar" ? "تقييم الحزمة الكاملة" : "Full Package Evaluation",
        isDisabled: hasActiveFullProgram,
      },
      {
        value: "single_session",
        label: (
          <>
            <User size={18} className={styles.iconInline} /> {language === "ar" ? "جلسة واحدة" : "Single Session"}
          </>
        ),
        textLabel: language === "ar" ? "جلسة واحدة" : "Single Session",
      },
    ],
    [language, hasActiveFullProgram],
  )
  // Update service options with translations
  const serviceOptions = useMemo(
    () => [
      {
        value: "physical_therapy",
        label: (
          <>
            <HeartPulse size={18} className={styles.iconInline} />{" "}
            {language === "ar" ? "العلاج الطبيعي" : "Physical Therapy"}
          </>
        ),
        price: 100,
      },
      {
        value: "ABA",
        label: (
          <>
            <Brain size={18} className={styles.iconInline} /> {language === "ar" ? "تحليل السلوك التطبيقي" : "ABA"}
          </>
        ),
        price: 300,
      },
      {
        value: "occupational_therapy",
        label: (
          <>
            <Hand size={18} className={styles.iconInline} />{" "}
            {language === "ar" ? "العلاج الوظيفي" : "Occupational Therapy"}
          </>
        ),
        price: 1200,
      },
      {
        value: "Psychotherapy",
        label: (
          <>
            <Hand size={18} className={styles.iconInline} />{" "}
            {language === "ar" ? "العلاج النفسي" : "Psychotherapy"}
          </>
        ),
        price: 1900,
      },
      {
        value: "special_education",
        label: (
          <>
            <BookOpen size={18} className={styles.iconInline} />{" "}
            {language === "ar" ? "التعليم الخاص" : "Special Education"}
          </>
        ),
        price: 500,
      },
      {
        value: "speech",
        label: (
          <>
            <Mic size={18} className={styles.iconInline} /> {language === "ar" ? "علاج النطق" : "Speech"}
          </>
        ),
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
    if (!date) {
      console.warn("formatTimeToHHMM received null or undefined date.")
      return null
    }
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("formatTimeToHHMM received an invalid Date object:", date)
      return null
    }
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
  // Reset form fields function
  const resetFormFields = useCallback(() => {
    setSelectedDay(null)
    setSelectedTime(null)
    setDescription("")
    setSelectedServices([])
    setTotalPrice(0)
    setProgramData((prev) => ({
      ...prev,
      programType: "",
      date: null,
      time: null,
      description: "",
      programKind: "",
      unicValue: "",
    }))
    setAssignmentError("")
    setAssignmentResults(null)
    setValidationErrors({})
    setBookedSlots([])
    setAvailabilityError("")
    setShowCaseStudyCreation(false)
  }, [])
  // في مكون StudentBooking.jsx

  // 1. أضف دالة جديدة لإعادة جلب بيانات الخطة أو تحديثها
  // يمكنك وضعها بعد تعريف `resetFormFields` أو في مكان مناسب آخر
  const refreshPlanData = useCallback(async () => {
    if (!patientId) return
    setIsLoading(true) // قد تحتاج إلى مؤشر تحميل مؤقت
    try {
      const axiosInstance = await getAxiosInstance()
      const planResponse = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-case-study/${patientId}`,
      )
      if (planResponse.status === 200) {
        setPlan(planResponse.data)
      }
    } catch (error) {
      console.error("Error refreshing plan data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [patientId, getAxiosInstance])

  // Move fetchBookedSlots here, before the useEffect that uses it
  const fetchBookedSlots = useCallback(
    async (date, programType) => {
      if (!date || !programType) return
      setIsLoadingAvailability(true)
      setAvailabilityError("")
      try {
        const axiosInstance = await getAxiosInstance()
        const formattedDate = date.toISOString().split("T")[0]
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/availability/booked-slots/${programType}/${formattedDate}`,
        )
        if (response.data.success) {
          setBookedSlots(response.data.bookedSlots)
        } else {
          setAvailabilityError("Failed to fetch availability")
        }
      } catch (error) {
        console.error("Error fetching booked slots:", error)
        setAvailabilityError("Error checking availability")
        setBookedSlots([])
      } finally {
        setIsLoadingAvailability(false)
      }
    },
    [getAxiosInstance],
  )
  // This useEffect now correctly references fetchBookedSlots after its definition
  useEffect(() => {
    // Ensure evaluationType is an object and has a value property
    const programTypeValue = evaluationType?.value
    if (selectedDay && programTypeValue) {
      let programType = programTypeValue
      if (programTypeValue === "full_package_evaluation") {
        programType = "full_program"
      }
      fetchBookedSlots(selectedDay, programType)
    } else {
      setBookedSlots([])
    }
  }, [selectedDay, evaluationType, fetchBookedSlots])
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
          axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-case-study/${patientId}`), // Updated endpoint for case study
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
        return 5000
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
      // Reset only if returning to step 0, but not on initial load
      // This prevents clearing user's selection if they just navigate back
      // This prevents clearing user's selection if they just navigate back
      // For a full reset on initial load, consider a separate effect or initial state
    }
    if (currentStep === 3) {
      // This was clearing evaluationType and description, which might not be desired
      // if the user is just reviewing payment. Removed for now.
      // This was clearing evaluationType and description, which might not be desired
      // if the user is just reviewing payment. Removed for now.
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
  // Generate all possible time slots (12:00 PM to 8:00 PM, every 30 minutes)
  const getAllPossibleTimeSlots = useCallback(() => {
    const slots = []
    for (let hour = 12; hour <= 20; hour++) {
      for (const minute of [0, 30]) {
        // Don't include 8:30 PM (stop at 8:00 PM)
        if (hour === 20 && minute === 30) break
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push({ hour, minute, timeString })
      }
    }
    return slots
  }, [])
  // Get available time slots for the selected date
  const getAvailableTimeSlots = useCallback(() => {
    const allSlots = getAllPossibleTimeSlots()
    return allSlots.filter((slot) => {
      const isBooked = bookedSlots.some((bookedSlot) => bookedSlot.time === slot.timeString)
      return !isBooked
    })
  }, [bookedSlots, getAllPossibleTimeSlots])
  // Get booked time slots for display
  const getBookedTimeSlots = useCallback(() => {
    const allSlots = getAllPossibleTimeSlots()
    return allSlots.filter((slot) => {
      const isBooked = bookedSlots.some((bookedSlot) => bookedSlot.time === slot.timeString)
      return isBooked
    })
  }, [bookedSlots, getAllPossibleTimeSlots])
  const verifyAvailabilityBeforePayment = useCallback(
    async (programTypeToVerify) => {
      try {
        const axiosInstance = await getAxiosInstance()
        // --- START DEBUGGING LOGS ---
        const formattedTime = formatTimeToHHMM(selectedTime)
        // --- END DEBUGGING LOGS ---
        const formattedDate = selectedDay.toISOString() // Use full ISO string for backend
     
        // Check if formattedTime is null or invalid before sending
        if (!formattedTime) {
          console.error("verifyAvailabilityBeforePayment: formattedTime is null or invalid. Aborting API call.")
          return false // Prevent API call with invalid time
        }
        const response = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_API_URL}/availability/verify-booking-availability`,
          {
            programType: programTypeToVerify,
            date: selectedDay.toISOString(),
            time: formattedTime,
          },
        )
        return response.data.available
      } catch (error) {
        console.error("Error verifying availability:", error)
        return false
      }
    },
    [getAxiosInstance, formatTimeToHHMM, selectedTime, selectedDay],
  )
  const validateStep = useCallback(
    (step) => {
      const errors = {}
      switch (step) {
        case 0:
          // Check evaluationType.value as it's now an object
          if (!evaluationType?.value) {
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
          // Check evaluationType.value for single_session
          if (evaluationType?.value === "single_session" && selectedServices.length === 0) {
            errors.services =
              language === "ar" ? "يرجى اختيار خدمة واحدة على الأقل" : "Please select at least one service"
          }
          break
        case 2:
          // For step 2, validate that a case study plan exists
          if (!plan?.hasCaseStudy) {
            errors.document =
              language === "ar" ? "يجب عليك إنهاء مستند الوورد أولاً" : "You must finish your word document first"
          }
          break
        default:
          break
      }
      setValidationErrors(errors)
      return Object.keys(errors).length === 0
    },
    [evaluationType, selectedDay, selectedTime, description, selectedServices, language, plan],
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
        // Use evaluationType.value here
        let programType = evaluationType.value
        if (evaluationType.value === "full_package_evaluation") {
          programType = "full_program"
        }
        const formattedTime = formatTimeToHHMM(selectedTime)
        const updatedProgramData = {
          ...programData,
          programType,
          date: selectedDay,
          time: formattedTime,
          description,
          programKind: evaluationType.value === "single_session" ? selectedServices.map((s) => s.value) : "",
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
    evaluationType, // evaluationType is now an object
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
      // Derive programType here, as it's needed for both verification and the main payload
      let programTypeForPayment = programData.programType // Use the programType from programData state
      if (programTypeForPayment === "full_package_evaluation") {
        programTypeForPayment = "full_program"
      }
      console.log("Program type for payment and verification:", programTypeForPayment) // Add this log
      // Verify availability before proceeding with payment
      const isAvailable = await verifyAvailabilityBeforePayment(programTypeForPayment) // Pass the derived programType
      if (!isAvailable) {
        alert(
          language === "ar"
            ? "عذراً، هذا الموعد لم يعد متاحاً. يرجى اختيار موعد آخر."
            : "Sorry, this time slot is no longer available. Please choose a different time.",
        )
        setCurrentStep(1) // Go back to the scheduling step
        return
      }
      const axiosInstance = await getAxiosInstance()
      let totalAmount = 0
      let initialPayment = 0
      if (programTypeForPayment === "full_program") {
        // Use programTypeForPayment here
        totalAmount = 5000
        initialPayment = 1000
      } else {
        totalAmount = getProgramPrice(programTypeForPayment) + totalPrice // Use programTypeForPayment here
        initialPayment = totalAmount
      }
      const formattedTime = formatTimeToHHMM(selectedTime)
      const programPayload = {
        ...programData,
        patientId,
        programKind: selectedServices.map((service) => service.value),
        programType: programTypeForPayment, // Use programTypeForPayment here
        time: formattedTime,
        totalAmount,
        paidAmount: initialPayment,
        remainingAmount: totalAmount - initialPayment,
        paymentStatus: initialPayment >= totalAmount ? "FULLY_PAID" : "PARTIALLY_PAID",
        paymentMethod: programTypeForPayment === "full_program" ? "MIXED" : "CASH", // Use programTypeForPayment here
      }
      const response = await axiosInstance.post("/authentication/saveProgram", programPayload)
      if (response.status === 200) {
        const programId = response.data.program._id
        if (programTypeForPayment === "single_session" || programTypeForPayment === "school_evaluation") {
          const moneyResponse = await axiosInstance.post("/authentication/saveMoneyRecord", {
            patientId,
            programId,
            price: totalAmount, // Full amount but pending
            status: "completed", // Changed from "completed" to "pending"
            invoiceId: `INV-${Math.random().toString(36).substring(2, 15)}`,
            programType: programTypeForPayment, // Use programTypeForPayment here
            comment: `Initial payment for ${programTypeForPayment} - Student: ${patientName}`, // Use programTypeForPayment here
            patientName,
          })
          if (moneyResponse.status === 200) {
            if (programTypeForPayment === "school_evaluation") {
              // Use programTypeForPayment here
              const assignmentResult = await createPatientSchoolAssignment(patientId, description)
              if (!assignmentResult.success) {
                setAssignmentError(assignmentResult.error)
              } else {
                setAssignmentResults({
                  totalAssigned: 1,
                  totalFailed: 0,
                  details: [{ assignment: { notes: assignmentResult.message || "School evaluation assigned" } }],
                })
              }
            }

            // Reset form fields after successful payment
            resetFormFields()
               await sendNotification({
            isList: false,
            title: `Booking New Appointment`,
            message: `You have booked a new appointment in ${programPayload.programType
              .replace(/_/g, " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")} at date: ${
              new Date(programPayload.date).toISOString().split("T")[0]
            } and time: ${programPayload.time}`,
            receiverId: patientId,
            rule: "Patient",
            type: "create",
          });

          if (doctorIds.length > 0) {
            await sendNotification({
              isList: true,
              title: `New ${programPayload.programType
                .replace(/_/g, " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")} Created`,
              message: `Create a new program to student: ${patientName}`,
              receiverIds: doctorIds,
              rule: "Doctor",
              type: "create",
            });
          }

          // send user email in token
          //  await sendEmail({
          //   to: `${patientEmail}`,
          //   filePath: "",
          //   subject: "Booking New Appointment",
          //   text: `We have created a new appointment in ${programPayload.programType
          //     .replace(/_/g, " ")
          //     .split(" ")
          //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          //     .join(" ")} for you, on date: ${
          //     new Date(programPayload.date).toISOString().split("T")[0]
          //   } and time: ${programPayload.time}`,
          // }); 
            setCurrentStep(4) // Move to complete step
          }
        } 
        else if (programTypeForPayment === "full_program"){

          const moneyResponse = await axiosInstance.post("/authentication/saveMoneyRecord", {
            patientId,
            programId,
            price: initialPayment, // Full amount but pending
            status: "completed", // Changed from "completed" to "pending"
            invoiceId: `INV-${Math.random().toString(36).substring(2, 15)}`,
            programType: programTypeForPayment, // Use programTypeForPayment here
            comment: `Initial 20% fees payment for ${programTypeForPayment} - Student: ${patientName}`, // Use programTypeForPayment here
            patientName,
          })
          if (moneyResponse.status === 200) {
              setCurrentStep(4) // Move to complete step
          }
        
        }
      }
    } catch (error) {
      console.error("Error saving program:", error)
      // Handle appointment conflict specifically
      if (error.response?.status === 409) {
        const errorData = error.response.data
        if (errorData.error === "APPOINTMENT_CONFLICT" || errorData.error === "DUPLICATE_APPOINTMENT") {
          alert(
            language === "ar"
              ? `عذراً، هذا الموعد محجوز بالفعل. يرجى اختيار وقت آخر.\n\nالموعد المتضارب: ${errorData.conflictingAppointment?.time || "غير محدد"}`
              : `Sorry, this time slot is already booked. Please choose a different time.\n\nConflicting appointment: ${errorData.conflictingAppointment?.time || "Unknown time"}`,
          )
          // Go back to the scheduling step
          setCurrentStep(1)
          // Refresh availability for the selected date
          if (selectedDay && evaluationType) {
            // Keep evaluationType here for fetching booked slots
            let programTypeForAvailability = evaluationType.value // Use evaluationType.value
            if (evaluationType.value === "full_package_evaluation") {
              programTypeForAvailability = "full_program"
            }
            fetchBookedSlots(selectedDay, programTypeForAvailability)
          }
          return
        }
      }
      // Handle other errors
      const errorMessage = error.response?.data?.message || "Payment processing failed. Please try again."
      alert(errorMessage)
    } finally {
      setIsProcessingPayment(false)
    }
  }, [
    isProcessingPayment,
    getAxiosInstance,
    programData, // Keep programData in dependencies
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
    language,
    selectedDay,
    evaluationType, // Keep evaluationType here for fetching booked slots
    fetchBookedSlots,
    verifyAvailabilityBeforePayment, // Keep verifyAvailabilityBeforePayment in dependencies
    resetFormFields, // Add resetFormFields to dependencies
  ])




  const steps = useMemo(
    () => [
      {
        number: 1,
        title: language === "ar" ? "اختر نوع التقييم" : "Select Evaluation Type",
        icon: <ClipboardList size={24} />,
      },
      {
        number: 2,
        title: language === "ar" ? "طلب التقييم" : "Request Evaluation",
        icon: <Calendar size={24} />,
      },
      {
        number: 3,
        title: language === "ar" ? "نموذج دراسه الحالة" : "Case Study",
        icon: <FileText size={24} />,
      },
      {
        number: 4,
        title: language === "ar" ? "الدفع" : "Payment",
        icon: <CreditCard size={24} />,
      },
      {
        number: 5,
        title: language === "ar" ? "مكتمل" : "Complete",
        icon: <CheckCircle size={24} />,
      },
    ],
    [language],
  )
  // Custom styles for react-select (for Services dropdown)
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
  // Custom styles for react-select (for Evaluation Type dropdown)
  const evaluationTypeSelectStyles = useMemo(
    () => ({
      control: (provided, state) => ({
        ...provided,
        border: `2px solid ${validationErrors.evaluationType ? "#ef4444" : state.isFocused ? "#00bcd4" : "#e2e8f0"}`,
        borderRadius: "12px",
        padding: "0.5rem 0.75rem",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        boxShadow: state.isFocused ? "0 0 0 4px rgba(0, 188, 212, 0.1), 0 4px 12px rgba(0, 188, 212, 0.15)" : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: state.isFocused ? "translateY(-1px)" : "translateY(0)",
        "&:hover": {
          borderColor: validationErrors.evaluationType ? "#ef4444" : "#00bcd4",
        },
      }),
      menu: (provided) => ({
        ...provided,
        borderRadius: "12px",
        border: "1px solid rgba(0, 188, 212, 0.2)",
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
          ? "rgba(0, 0, 0, 0.1)" // Transparent gray for selected background
          : state.isFocused
            ? "rgba(0, 188, 212, 0.1)" // Light cyan for focused
            : "transparent",
        color: state.isSelected ? "white" : "#374151",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: state.isSelected
            ? "rgba(0, 0, 0, 0.15)" // Slightly darker transparent gray on hover for selected
            : "rgba(0, 188, 212, 0.15)",
          transform: "translateX(4px)",
        },
        // Style for disabled options (e.g., "Full Package Evaluation" when active)
        opacity: state.isDisabled ? 0.5 : 1,
        cursor: state.isDisabled ? "not-allowed" : "pointer",
      }),
      singleValue: (provided) => ({
        ...provided,
        color: "#4a4a8a", // Color for the selected value in the control
        fontWeight: "600",
      }),
      placeholder: (provided) => ({
        ...provided,
        color: "#9ca3af",
        fontStyle: "italic",
      }),
    }),
    [validationErrors.evaluationType],
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
                  {currentStep > index ? <Check size={24} /> : step.icon}
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
                      ? "اختر نوع التقييم الذي يناسبك"
                      : "Choose the type of evaluation that best suits your needs"}
                  </p>
                </div>
                {assignmentError && <div className={styles.ruknErrorMessage}>{assignmentError}</div>}
                <div className={styles.ruknFormGroup}>
                  <label className={styles.ruknLabel}>
                    {language === "ar" ? "نوع التقييم *" : "Evaluation Type *"}
                  </label>
                  <div className={styles.ruknSelectWrapper}>
                    <Suspense fallback={<div className={styles.loadingSpinner}></div>}>
                      <Select
                        name="evaluationType"
                        options={evaluationTypeOptions}
                        value={evaluationType} // evaluationType is now an object
                        onChange={(selectedOption) => {
                          setEvaluationType(selectedOption) // Store the full object
                          setAssignmentError("")
                          setValidationErrors((prev) => ({ ...prev, evaluationType: null }))
                          // Reset scheduling fields when evaluation type changes
                          resetFormFields()
                        }}
                        placeholder={language === "ar" ? "اختر نوع التقييم..." : "Choose your evaluation type..."}
                        styles={evaluationTypeSelectStyles} // Use the new distinct styles
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        menuPosition="fixed"
                        isRtl={language === "ar"}
                        getOptionLabel={(option) => option.label} // Render JSX label
                        getOptionValue={(option) => option.value} // Use value for internal logic
                      />
                    </Suspense>
                  </div>
                  {validationErrors.evaluationType && (
                    <span className={styles.ruknErrorText}>{validationErrors.evaluationType}</span>
                  )}
                </div>
                <div className={`${styles.ruknButtonGroup} ${styles.end}`}>
                  <button
                    onClick={nextStep}
                    disabled={!evaluationType?.value} // Check evaluationType.value
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
                            setSelectedTime(null) // Reset time when date changes
                            setValidationErrors((prev) => ({ ...prev, selectedDay: null, selectedTime: null }))
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
                          maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
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
                          disabled={isLoadingAvailability}
                        />
                      </Suspense>
                    </div>
                    {validationErrors.selectedDay && (
                      <span className={styles.ruknErrorText}>{validationErrors.selectedDay}</span>
                    )}
                    <div className={styles.ruknDateNote}>
                      <Calendar size={16} className={styles.iconInline} />{" "}
                      {language === "ar"
                        ? "المواعيد متاحة أيام الجمعة والأحد فقط"
                        : "Appointments available on Fridays and Sundays only"}
                    </div>
                  </div>
                  {/* Time Picker Section */}
                  <div className={styles.ruknFormGroup}>
                    <label className={styles.ruknLabel}>{language === "ar" ? "اختر الوقت *" : "Select Time *"}</label>
                    {/* Show loading state */}
                    {isLoadingAvailability && (
                      <div className={styles.ruknAvailabilityLoading}>
                        <div className={styles.loadingSpinner}></div>
                        <span>
                          {language === "ar" ? "جارٍ التحقق من المواعيد المتاحة..." : "Checking availability..."}
                        </span>
                      </div>
                    )}
                    {/* Show error state */}
                    {availabilityError && <div className={styles.ruknAvailabilityError}>{availabilityError}</div>}
                    {/* Time Slots Grid */}
                    {selectedDay && !isLoadingAvailability && (
                      <div className={styles.ruknTimeSlotsGrid}>
                        {getAllPossibleTimeSlots().map((slot) => {
                          const isBooked = bookedSlots.some((bookedSlot) => bookedSlot.time === slot.timeString)
                          const isSelected = selectedTime && formatTimeToHHMM(selectedTime) === slot.timeString
                          return (
                            <button
                              key={slot.timeString}
                              type="button"
                              className={`${styles.ruknTimeSlot} ${isSelected ? styles.selected : ""
                                } ${isBooked ? styles.booked : styles.available}`}
                              onClick={() => {
                                if (!isBooked) {
                                  const timeDate = new Date()
                                  timeDate.setHours(slot.hour, slot.minute, 0, 0)
                                  setSelectedTime(timeDate)
                                  setValidationErrors((prev) => ({ ...prev, selectedTime: null }))
                                }
                              }}
                              disabled={isBooked}
                            >
                              <span className={styles.ruknTimeSlotTime}>
                                {slot.hour > 12 ? slot.hour - 12 : slot.hour}:{slot.minute.toString().padStart(2, "0")}{" "}
                                {slot.hour >= 12 ? "PM" : "AM"}
                              </span>
                              <span className={styles.ruknTimeSlotStatus}>
                                {isSelected
                                  ? language === "ar"
                                    ? "محدد"
                                    : "Selected"
                                  : isBooked
                                    ? language === "ar"
                                      ? "محجوز"
                                      : "Booked"
                                    : language === "ar"
                                      ? "متاح"
                                      : "Available"}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {validationErrors.selectedTime && (
                      <span className={styles.ruknErrorText}>{validationErrors.selectedTime}</span>
                    )}

                    <div className={styles.ruknTimeNote}>
                      <Clock size={16} className={styles.iconInline} />{" "}
                      {language === "ar"
                        ? "المواعيد متاحة من 12:00 ظهراً إلى 8:00 مساءً"
                        : "Appointments available from 12:00 PM to 8:00 PM"}
                    </div>
                  </div>
                </div>
                <div className={styles.ruknFormGroupdes}>
                  <label className={styles.ruknLabel}>{language === "ar" ? "الوصف *" : "Description *"}</label>
                  <textarea
                    className={`${styles.ruknTextarea} ${validationErrors.description ? styles.error : ""}`}
                    placeholder={
                      language === "ar"
                        ? "يرجى وصف احتياجاتك أو أي متطلبات تريد ابلاغنا بها..."
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
                {evaluationType?.value === "single_session" && ( // Check evaluationType.value
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
                          getOptionLabel={(e) => (
                            <>
                              {e.label} (${e.price})
                            </>
                          )} // Modified to render JSX label
                          onChange={handleServiceChange}
                          placeholder={language === "ar" ? "اختر خدماتك..." : "Choose your services..."}
                          styles={customSelectStyles} // Keep original styles for services
                          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
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
                {validationErrors.document && (
                  <div className={styles.ruknErrorMessage}>
                    <XCircle size={18} className={styles.iconInline} /> {validationErrors.document}
                  </div>
                )}

                {/* Show case study creation prompt if patient has no case study and creation mode is not active */}
                {!plan?.hasCaseStudy && !showCaseStudyCreation && (
                  <div className={styles2.ruknNoCaseStudyContainer}>
                    <div className={styles2.ruknNoCaseStudyIcon}>
                      <FileText size={48} />
                    </div>
                    <h4 className={styles2.ruknNoCaseStudyTitle}>
                      {language === "ar"
                        ? "مرحباً بك! لنبدأ بإنشاء ملفك الطبي"
                        : "Welcome! Let's Create Your Medical File"}
                    </h4>
                    <p className={styles2.ruknNoCaseStudyDescription}>
                      {language === "ar"
                        ? "هذه هي المرة الأولى التي تحجز فيها معنا! نحتاج إلى إنشاء ملف طبي خاص بك يحتوي على معلوماتك الصحية وخطة العلاج المناسبة لحالتك. هذا الملف سيساعد أطباءنا على تقديم أفضل رعاية ممكنة لك."
                        : "This is your first time booking with us! We need to create a personalized medical file that contains your health information and treatment plan tailored to your condition. This file will help our doctors provide you with the best possible care."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCaseStudyCreation(true)}
                      className={`${styles2.ruknButton} ${styles2.ruknButtonPrimary} ${styles2.ruknCreateCaseStudyButton}`}
                    >
                      <FileText size={20} />
                      {language === "ar" ? "إنشاء ملفي الطبي" : "Create My Medical File"}
                    </button>
                  </div>
                )}

                {/* Show document editor if patient has case study OR creation mode is active */}
                {(plan?.hasCaseStudy || showCaseStudyCreation) && (
                  <div className={styles.ruknDocumentContainer}>
                    <Suspense
                      fallback={
                        <div>{language === "ar" ? "جارٍ تحميل محرر المستندات..." : "Loading document editor..."}</div>
                      }
                    >
                      {plan && plan.hasCaseStudy && plan.caseStudyFile?.url ? (
                        <SyncfusionDocxCase
                          userData={{
                            docxId: plan.caseStudyFile.title,
                            patientId: patientId,
                            filePath: plan.caseStudyFile.url,
                            fileName: plan.caseStudyFile.filename || "case-study.docx",
                            docxName: `Case study of student: ${patientName}.docx`,
                          }}
                          planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/DrastHala/upload-plan`}
                          onDocumentSaved={refreshPlanData}
                        />
                      ) : (
                        <SyncfusionDocxCase
                          userData={{
                            docxId: "default",
                            patientId: patientId,
                            filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/DRAST-7ALA/plan/default.docx`,
                            fileName: "default.docx",
                            docxName: `Case study of student: ${patientName}.docx`,
                          }}
                          planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/DrastHala/upload-plan`}
                          onDocumentSaved={(updatedPlan) => {
                            refreshPlanData()
                            // Keep the creation mode active until the document is actually saved
                            if (updatedPlan?.hasCaseStudy) {
                              setShowCaseStudyCreation(false)
                            }
                          }}
                        />
                      )}
                    </Suspense>
                  </div>
                )}

                <div className={styles.ruknButtonGroup}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className={`${styles.ruknButton} ${styles.ruknButtonSecondary}`}
                  >
                    {language === "ar" ? "→ رجوع" : "← Back"}
                  </button>
                  <div className={styles.ruknTooltipContainer}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={!plan?.hasCaseStudy}
                      className={`${styles.ruknButton} ${styles.ruknButtonPrimary} ${!plan?.hasCaseStudy ? styles.disabled : ""}`}
                    >
                      {language === "ar" ? "المتابعة إلى الدفع ←" : "Proceed to Payment →"}
                    </button>
                    {!plan?.hasCaseStudy && (
                      <div className={styles.ruknTooltip}>
                        <div className={styles.ruknTooltipContent}>
                          <AlertCircle size={16} />
                          <span>
                            {language === "ar"
                              ? "يجب حفظ مستند دراسة الحالة أولاً لتفعيل هذا الزر"
                              : "You must save the case study document first to enable this button"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
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
                    <Info size={18} className={styles.iconInline} /> {language === "ar" ? "تحذير:" : "Warning:"}{" "}
                    {assignmentError}
                  </div>
                )}
                {assignmentResults && (
                  <div className={styles.ruknAssignmentResults}>
                    <h4>{language === "ar" ? "نتائج تعيين الخدمة" : "Service Assignment Results"}</h4>
                    <div className={styles.ruknAssignmentSummary}>
                      <p>
                        <Check size={18} className={styles.iconInline} />{" "}
                        {language === "ar" ? "تم التعيين بنجاح:" : "Successfully assigned:"}{" "}
                        {assignmentResults.totalAssigned}
                      </p>
                      {assignmentResults.totalFailed > 0 && (
                        <p>
                          <XCircle size={18} className={styles.iconInline} />{" "}
                          {language === "ar" ? "التعيينات الفاشلة:" : "Failed assignments:"}{" "}
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
                    onClick={async () => {
                      // First verify availability before processing payment
                      let programTypeForVerification = programData.programType // Get from programData
                      if (programTypeForVerification === "full_package_evaluation") {
                        programTypeForVerification = "full_program"
                      }
                      const isStillAvailable = await verifyAvailabilityBeforePayment(programTypeForVerification) // Pass the correct type
                      if (!isStillAvailable) {
                        alert(
                          language === "ar"
                            ? "عذراً، تم حجز هذا الموعد بواسطة مستخدم آخر. يرجى اختيار وقت آخر."
                            : "Sorry, this time slot has been booked by another user. Please choose a different time.",
                        )
                        setCurrentStep(1) // Go back to scheduling
                        return
                      }
                      handlePayment()
                    }}
                    disabled={isProcessingPayment}
                    className={`${styles.ruknButton} ${styles.ruknButtonSuccess}`}
                  >
                    <CreditCard size={20} />{" "}
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
                  <PartyPopper size={48} />
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
                        <Check size={16} className={styles.iconInline} /> {result.assignment.notes}
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.ruknNextSteps}>
                  <h4>{language === "ar" ? "ماذا بعد؟" : "What's Next?"}</h4>
                  <ul>
                    <li>
                      <Check size={16} className={styles.iconInline} />{" "}
                      {language === "ar"
                        ? "ستتلقى رسالة تأكيد بالبريد الإلكتروني قريبًا"
                        : "You'll receive a confirmation email shortly"}
                    </li>
                    <li>
                      <Check size={16} className={styles.iconInline} />{" "}
                      {language === "ar"
                        ? "سيتصل بك فريقنا قبل موعدك بـ 24 ساعة"
                        : "Our team will contact you 24 hours before your appointment"}
                    </li>
                    <li>
                      <Check size={16} className={styles.iconInline} />{" "}
                      {language === "ar" ? "يرجى الوصول قبل 15 دقيقة" : "Please arrive 15 minutes early"}
                    </li>
                    {programData.programType === "school_evaluation" && (
                      <li>
                        <Check size={16} className={styles.iconInline} />{" "}
                        {language === "ar"
                          ? "يمكنك الآن الوصول إلى بوابة التقييم المدرسي"
                          : "You can now access the school evaluation portal"}
                      </li>
                    )}
                    {assignmentResults && assignmentResults.totalAssigned > 0 && (
                      <li>
                        <Check size={16} className={styles.iconInline} />{" "}
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
      {/* Interactive Guide */}
      <InteractiveGuide
        isActive={showInteractiveGuide}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onClose={() => setShowInteractiveGuide(false)}
      />
    </div>
  )
}
export default StudentBooking
