"use client"
import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import dynamic from "next/dynamic"
import styles from "../styles/StudentBooking.module.css"
import styles2 from "../styles/AdminStudentBooking.module.css"

import InteractiveGuide from "./InteractiveGuide"
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
  Users,
  UserPlus,
  ArrowLeft,
} from "lucide-react"
import { sendNotification } from "@/helper/notification-helper"

// Dynamic imports for heavy components
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
        <h4 className={styles.ruknDocumentImportTitle}>Loading Document Editor...</h4>
        <p className={styles.ruknDocumentImportSubtitle}>
          Please wait while we prepare the advanced document editor...
        </p>
        <div className={styles.ruknDocumentImportProgress}>
          <div className={styles.ruknDocumentImportProgressBar}></div>
        </div>
        <div className={styles.ruknDocumentImportTip}>
          <Lightbulb size={16} />
          <span>💡 Tip: You'll be able to edit and save your case study document once loading completes</span>
        </div>
      </div>
    </div>
  ),
})

// Load CSS for DatePicker separately
import("react-datepicker/dist/react-datepicker.css")

const AdminStudentBooking = ({ currentStep, setCurrentStep }) => {
  // Patient Selection State (NEW)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientSelectionMode, setPatientSelectionMode] = useState("buttons") // "buttons" | "existing" | "new"
  const [allPatients, setAllPatients] = useState([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [showCaseStudyCreation, setShowCaseStudyCreation] = useState(false)

  const [doctorIds, setDoctorIds] = useState([])
  const [adminHeadDoctorIds, setAdminHeadDoctorIds] = useState({ adminIds: [], headDoctorIds: [] })

  const getDoctorIds = async () => {
    try {
      const axiosInstance = await getAxiosInstance()
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/notification/doctor-ids`)
      const doctors = response?.data
      setDoctorIds(doctors)
    } catch (error) {
      console.error("Error fetching doctor IDs:", error)
      setDoctorIds([])
    }
  }

  const getAdminHeadDoctorIds = async () => {
    try {
      const axiosInstance = await getAxiosInstance()
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/notification/admin-headdoctor-ids`)
      setAdminHeadDoctorIds(response.data)
    } catch (error) {
      console.error("Error fetching admin and head doctor IDs:", error)
      setAdminHeadDoctorIds({ adminIds: [], headDoctorIds: [] })
    }
  }

  useEffect(() => {
    getDoctorIds()
    getAdminHeadDoctorIds()
  }, [])

  // New Patient Form State
  const [newPatientForm, setNewPatientForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    address: "",
  })

  // Existing booking states (same as StudentBooking)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [description, setDescription] = useState("")
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
  const [showInteractiveGuide, setShowInteractiveGuide] = useState(false)

  // Check localStorage for interactive guide status on mount
  useEffect(() => {
    const hasSeenInteractiveGuide = localStorage.getItem("hasSeenAdminInteractiveGuide")
    if (!hasSeenInteractiveGuide) {
      setShowInteractiveGuide(true)
      localStorage.setItem("hasSeenAdminInteractiveGuide", "true")
    }
  }, [])

  // Options for evaluation type
  const evaluationTypeOptions = useMemo(
    () => [
      {
        value: "school_evaluation",
        label: (
          <>
            <School size={18} className={styles.iconInline} /> School Evaluation
          </>
        ),
        textLabel: "School Evaluation",
      },
      {
        value: "full_package_evaluation",
        label: (
          <>
            <Package size={18} className={styles.iconInline} /> Full Package Evaluation
            {hasActiveFullProgram && " (Already Active)"}
          </>
        ),
        textLabel: "Full Package Evaluation",
        isDisabled: hasActiveFullProgram,
      },
      {
        value: "single_session",
        label: (
          <>
            <User size={18} className={styles.iconInline} /> Single Session
          </>
        ),
        textLabel: "Single Session",
      },
    ],
    [hasActiveFullProgram],
  )

  // Service options
  const serviceOptions = useMemo(
    () => [
      {
        value: "physical_therapy",
        label: (
          <>
            <HeartPulse size={18} className={styles.iconInline} /> Physical Therapy
          </>
        ),
        price: 100,
      },
      {
        value: "Psychotherapy",
        label: (
          <>
            <HeartPulse size={18} className={styles.iconInline} /> Psychotherapy
          </>
        ),
        price: 1900,
      },
      {
        value: "ABA",
        label: (
          <>
            <Brain size={18} className={styles.iconInline} /> ABA
          </>
        ),
        price: 300,
      },
      {
        value: "occupational_therapy",
        label: (
          <>
            <Hand size={18} className={styles.iconInline} /> Occupational Therapy
          </>
        ),
        price: 1200,
      },
      {
        value: "special_education",
        label: (
          <>
            <BookOpen size={18} className={styles.iconInline} /> Special Education
          </>
        ),
        price: 500,
      },
      {
        value: "speech",
        label: (
          <>
            <Mic size={18} className={styles.iconInline} /> Speech
          </>
        ),
        price: 230,
      },
    ],
    [],
  )

  const [programData, setProgramData] = useState({
    programType: "",
    patientId: selectedPatient?.id,
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
    if (selectedOptions.length > 0) {
      setValidationErrors((prev) => ({ ...prev, services: null }))
    }
  }, [])

  // Lazy loading for axios instance
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

  // Refresh plan data function
  const refreshPlanData = useCallback(async () => {
    if (!selectedPatient?.id) return
    setIsLoading(true)
    try {
      const axiosInstance = await getAxiosInstance()
      const planResponse = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-case-study/${selectedPatient.id}`,
      )
      if (planResponse.status === 200) {
        setPlan(planResponse.data)
      }
    } catch (error) {
      console.error("Error refreshing plan data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedPatient?.id, getAxiosInstance])

  // Fetch all patients function
  const fetchAllPatients = useCallback(async () => {
    setIsLoadingPatients(true)
    try {
      const axiosInstance = await getAxiosInstance()
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patients`, {
        params: { limit: 1000 }, // Get all patients
      })
      if (response.data.patients) {
        setAllPatients(response.data.patients)
      }
    } catch (error) {
      console.error("Error fetching Students:", error)
      alert("Error fetching Students data")
    } finally {
      setIsLoadingPatients(false)
    }
  }, [getAxiosInstance])

  // Create new patient function
  const createNewPatient = useCallback(
    async (patientData) => {
      try {
        const axiosInstance = await getAxiosInstance()
        const response = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/patient`,
          patientData,
        )
        if (response.status === 201) {
          // Fetch the created patient data
          const patientsResponse = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/patients`,
            {
              params: { search: patientData.email, limit: 1 },
            },
          )
          if (patientsResponse.data.patients && patientsResponse.data.patients.length > 0) {
            const newPatient = patientsResponse.data.patients[0]
            setSelectedPatient({
              id: newPatient._id,
              name: newPatient.name,
              email: newPatient.email,
              phone: newPatient.phone,
            })
            setPatientSelectionMode("buttons")
            return true
          }
        }
        return false
      } catch (error) {
        console.error("Error creating new Student:", error)
        throw error
      }
    },
    [getAxiosInstance],
  )

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

  // Update booked slots when date or evaluation type changes
  useEffect(() => {
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

  // Fetch data when selected patient changes
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      if (!selectedPatient?.id) return
      setIsLoading(true)
      try {
        const axiosInstance = await getAxiosInstance()
        const [planResponse, programResponse] = await Promise.allSettled([
          axiosInstance.get(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-case-study/${selectedPatient.id}`,
          ),
          axiosInstance.get(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/check-active-full-program/${selectedPatient.id}`,
          ),
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

    // Reset states when no patient is selected
    if (!selectedPatient?.id) {
      setPlan(null)
      setHasActiveFullProgram(false)
      setShowCaseStudyCreation(false)
      setIsLoading(false)
      return
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [selectedPatient?.id, getAxiosInstance, selectedPatient])

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

  // Enhanced date filtering - only allow Fridays and Sundays
  const filterWeekdays = useCallback((date) => {
    const day = date.getDay()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return (day === 0 || day === 5) && date >= today
  }, [])

  // Generate all possible time slots
  const getAllPossibleTimeSlots = useCallback(() => {
    const slots = []
    for (let hour = 12; hour <= 20; hour++) {
      for (const minute of [0, 30]) {
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

  // Verify availability before payment
  const verifyAvailabilityBeforePayment = useCallback(
    async (programTypeToVerify) => {
      try {
        const axiosInstance = await getAxiosInstance()
        const formattedTime = formatTimeToHHMM(selectedTime)

        const formattedDate = selectedDay.toISOString()

        if (!formattedTime) {
          console.error("verifyAvailabilityBeforePayment: formattedTime is null or invalid. Aborting API call.")
          return false
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

  // Validation function
  const validateStep = useCallback(
    (step) => {
      const errors = {}
      switch (step) {
        case 0: // Patient Selection
          if (!selectedPatient) {
            errors.selectedPatient = "Please select a Student"
          }
          break
        case 1: // Evaluation Type
          if (!evaluationType?.value) {
            errors.evaluationType = "Please select an evaluation type"
          }
          break
        case 2: // Request Evaluation
          if (!selectedDay) {
            errors.selectedDay = "Please select a date"
          }
          if (!selectedTime) {
            errors.selectedTime = "Please select a time"
          }
          if (!description.trim()) {
            errors.description = "Please provide a description"
          }
          if (evaluationType?.value === "single_session" && selectedServices.length === 0) {
            errors.services = "Please select at least one service"
          }
          break
        case 3: // Case Study
          if (!plan?.hasCaseStudy) {
            errors.document = "You must finish your word document first"
          }
          break
        default:
          break
      }
      setValidationErrors(errors)
      return Object.keys(errors).length === 0
    },
    [selectedPatient, evaluationType, selectedDay, selectedTime, description, selectedServices, plan],
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
          notes: description || `School evaluation assignment for ${selectedPatient?.name}`,
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
    [getAxiosInstance, selectedPatient?.name],
  )

  // Next step function
  const nextStep = useCallback(async () => {
    if (!validateStep(currentStep)) {
      return
    }
    if (currentStep < 5) {
      // Updated to 5 steps (0-4)
      try {
        let programType = evaluationType?.value
        if (evaluationType?.value === "full_package_evaluation") {
          programType = "full_program"
        }
        const formattedTime = formatTimeToHHMM(selectedTime)
        const updatedProgramData = {
          ...programData,
          programType,
          patientId: selectedPatient?.id,
          date: selectedDay,
          time: formattedTime,
          description,
          programKind: evaluationType?.value === "single_session" ? selectedServices.map((s) => s.value) : "",
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
    selectedPatient?.id,
  ])

  const sendNotificationToAdminsAndHeadDoctors = useCallback(
    async (title, message, type = "create") => {
      try {
        const { adminIds, headDoctorIds } = adminHeadDoctorIds

        // Send to all admins
        if (adminIds.length > 0) {
          await sendNotification({
            isList: true,
            title,
            message,
            receiverIds: adminIds,
            rule: "Admin",
            type,
          })
        }

        // Send to all head doctors
        if (headDoctorIds.length > 0) {
          await sendNotification({
            isList: true,
            title,
            message,
            receiverIds: headDoctorIds,
            rule: "HeadDoctor",
            type,
          })
        }
      } catch (error) {
        console.error("Error sending notifications to admins and head doctors:", error)
      }
    },
    [adminHeadDoctorIds],
  ) // Depend only on adminHeadDoctorIds

  // Handle payment function (MODIFIED for admin - pending status)
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
      // Verify availability before proceeding with payment
      const isAvailable = await verifyAvailabilityBeforePayment(programTypeForPayment) // Pass the derived programType
      if (!isAvailable) {
        alert("Sorry, this time slot is no longer available. Please choose a different time.")
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
        patientId: selectedPatient?.id,
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
            patientId: selectedPatient?.id,
            programId,
            price: totalAmount, // Full amount but pending
            status: "completed", // Changed from "completed" to "pending"
            invoiceId: `INV-${Math.random().toString(36).substring(2, 15)}`,
            programType: programTypeForPayment, // Use programTypeForPayment here
            comment: `Initial payment for ${programTypeForPayment} - Student: ${selectedPatient?.name}`, // Use programTypeForPayment here
            patientName: selectedPatient?.name,
          })
          if (moneyResponse.status === 200) {
            if (programTypeForPayment === "school_evaluation") {
              // Use programTypeForPayment here
              const assignmentResult = await createPatientSchoolAssignment(selectedPatient?.id, description)
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
              message: `We have created a new appointment in ${programPayload.programType
                .replace(/_/g, " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")} for you, on date: ${
                new Date(programPayload.date).toISOString().split("T")[0]
              } and time: ${programPayload.time}`,
              receiverId: selectedPatient?.id,
              rule: "Patient",
              type: "create",
            })

            if (doctorIds.length > 0) {
              await sendNotification({
                isList: true,
                title: `New ${programPayload.programType
                  .replace(/_/g, " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")} Created`,
                message: `Create a new program to student: ${selectedPatient?.name}`,
                receiverIds: doctorIds,
                rule: "Doctor",
                type: "create",
              })
            }

            const formattedProgramType = programPayload.programType
              .replace(/_/g, " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
            const formattedDate = new Date(programPayload.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })

            await sendNotificationToAdminsAndHeadDoctors(
              "New Appointment Booked (from the center)",
              `Patient ${selectedPatient?.name} has booked a ${formattedProgramType} appointment on ${formattedDate} at ${programPayload.time}.`,
              "create",
            )

            // await sendEmail({
            //   to: `${selectedPatient?.email}`,
            //   filePath: "",
            //   subject: "Booking New Appointment",
            //   text: `We have booked a new appointment in ${programPayload.programType
            //     .replace(/_/g, " ")
            //     .split(" ")
            //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            //     .join(" ")} for you at date: ${
            //     new Date(programPayload.date).toISOString().split("T")[0]
            //   } and time: ${programPayload.time}`,
            // });

            setCurrentStep(5) // Move to complete step
          }
        } else if (programTypeForPayment === "full_program") {
          const moneyResponse = await axiosInstance.post("/authentication/saveMoneyRecord", {
            patientId: selectedPatient?.id,
            programId,
            price: initialPayment, // Full amount but pending
            status: "completed", // Changed from "completed" to "pending"
            invoiceId: `INV-${Math.random().toString(36).substring(2, 15)}`,
            programType: programTypeForPayment, // Use programTypeForPayment here
            comment: `Initial 20% fees payment for ${programTypeForPayment} - Student: ${selectedPatient?.name}`, // Use programTypeForPayment here
            patientName: selectedPatient?.name,
          })
          if (moneyResponse.status === 200) {
            const formattedDate = new Date(programPayload.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })

            await sendNotificationToAdminsAndHeadDoctors(
              "New Appointment Booked (from the center)",
              `Patient ${selectedPatient?.name} has booked a Full Package Evaluation appointment on ${formattedDate} at ${programPayload.time}.`,
              "create",
            )

            setCurrentStep(5) // Move to complete step
            resetFormFields()
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
            `Sorry, this time slot is already booked. Please choose a different time.\n\nConflicting appointment: ${errorData.conflictingAppointment?.time || "Unknown time"}`,
          )
          // Go back to the scheduling step
          setCurrentStep(0)
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
    selectedPatient?.id,
    selectedServices,
    selectedPatient?.name,
    createPatientSchoolAssignment,
    description,
    setCurrentStep,
    selectedDay,
    evaluationType, // Keep evaluationType here for fetching booked slots
    fetchBookedSlots,
    verifyAvailabilityBeforePayment, // Keep verifyAvailabilityBeforePayment in dependencies
    resetFormFields, // Add resetFormFields to dependencies
    adminHeadDoctorIds,
    sendNotificationToAdminsAndHeadDoctors,
  ])

  // Steps configuration (UPDATED with 6 steps)
  const steps = useMemo(
    () => [
      {
        number: 1,
        title: "Select Student",
        icon: <Users size={24} />,
      },
      {
        number: 2,
        title: "Select Evaluation Type",
        icon: <ClipboardList size={24} />,
      },
      {
        number: 3,
        title: "Request Evaluation",
        icon: <Calendar size={24} />,
      },
      {
        number: 4,
        title: "Case Study",
        icon: <FileText size={24} />,
      },
      {
        number: 5,
        title: "Payment",
        icon: <CreditCard size={24} />,
      },
      {
        number: 6,
        title: "Complete",
        icon: <CheckCircle size={24} />,
      },
    ],
    [],
  )

  // Custom styles for react-select (Services dropdown)
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

  // Custom styles for evaluation type select
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
          ? "rgba(0, 0, 0, 0.1)"
          : state.isFocused
            ? "rgba(0, 188, 212, 0.1)"
            : "transparent",
        color: state.isSelected ? "white" : "#374151",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: state.isSelected ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 188, 212, 0.15)",
          transform: "translateX(4px)",
        },
        opacity: state.isDisabled ? 0.5 : 1,
        cursor: state.isDisabled ? "not-allowed" : "pointer",
      }),
      singleValue: (provided) => ({
        ...provided,
        color: "#4a4a8a",
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

  // Patient selection dropdown styles
  const patientSelectStyles = useMemo(
    () => ({
      control: (provided, state) => ({
        ...provided,
        border: `2px solid ${validationErrors.selectedPatient ? "#ef4444" : state.isFocused ? "#10b981" : "#e2e8f0"}`,
        borderRadius: "12px",
        padding: "0.5rem 0.75rem",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        boxShadow: state.isFocused ? "0 0 0 4px rgba(16, 185, 129, 0.1), 0 4px 12px rgba(16, 185, 129, 0.15)" : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: state.isFocused ? "translateY(-1px)" : "translateY(0)",
        "&:hover": {
          borderColor: validationErrors.selectedPatient ? "#ef4444" : "#10b981",
        },
      }),
      menu: (provided) => ({
        ...provided,
        borderRadius: "12px",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        zIndex: 9999,
        overflow: "hidden",
      }),
      menuList: (provided) => ({
        ...provided,
        padding: "0.5rem",
        maxHeight: "300px",
      }),
      option: (provided, state) => ({
        ...provided,
        borderRadius: "8px",
        margin: "0.25rem 0",
        padding: "0.75rem 1rem",
        backgroundColor: state.isSelected
          ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
          : state.isFocused
            ? "rgba(16, 185, 129, 0.1)"
            : "transparent",
        color: state.isSelected ? "white" : "#374151",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: state.isSelected
            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
            : "rgba(16, 185, 129, 0.15)",
          transform: "translateX(4px)",
        },
      }),
      singleValue: (provided) => ({
        ...provided,
        color: "#059669",
        fontWeight: "600",
      }),
      placeholder: (provided) => ({
        ...provided,
        color: "#9ca3af",
        fontStyle: "italic",
      }),
    }),
    [validationErrors.selectedPatient],
  )

  // Handle new patient form submission
  const handleNewPatientSubmit = async (e) => {
    e.preventDefault()
    if (newPatientForm.password !== newPatientForm.confirmPassword) {
      alert("Passwords don't match")
      return
    }
    try {
      const success = await createNewPatient({
        name: newPatientForm.name,
        email: newPatientForm.email,
        phone: newPatientForm.phone,
        gender: newPatientForm.gender,
        password: newPatientForm.password,
        dateOfBirth: newPatientForm.dateOfBirth,
        address: newPatientForm.address,
      })
      if (success) {
        setShowNewPatientModal(false)
        setNewPatientForm({
          name: "",
          email: "",
          phone: "",
          gender: "",
          password: "",
          confirmPassword: "",
          dateOfBirth: "",
          address: "",
        })
        alert("Student created successfully")
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create Student")
    }
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
    <div className={`${styles.ruknBookingWizard} ${styles.ltr}`}>
      <div className={styles.ruknWizardContainer}>
        {/* Header */}
        <div className={styles.ruknHeader}>
          <h4 className={styles.ruknSubTitle}>Book Student Appointment - Admin Panel</h4>
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
            {/* Step 0: Patient Selection (NEW) */}
            {currentStep === 0 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>Select Student</h3>
                  <p>Choose an existing Student or create a new Student to book an appointment</p>
                </div>

                {/* Selected Patient Display */}
                {selectedPatient && (
                  <div className={styles.ruknFormGroup}>
                    <div className={styles2.ruknSelectedPatientCard}>
                      <div className={styles2.ruknSelectedPatientInfo}>
                        <Users size={20} className={styles.iconInline} />
                        <div>
                          <h4>Selected Student:</h4>
                          <p>
                            <strong>{selectedPatient.name}</strong> - {selectedPatient.email}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatient(null)
                          setPatientSelectionMode("buttons")
                          setValidationErrors((prev) => ({ ...prev, selectedPatient: null }))
                        }}
                        className={styles2.ruknChangePatientButton}
                      >
                        Change Student
                      </button>
                    </div>
                  </div>
                )}

                {/* Patient Selection Mode: Buttons */}
                {patientSelectionMode === "buttons" && !selectedPatient && (
                  <div className={styles.ruknFormGroup}>
                    <div className={styles2.ruknPatientSelectionButtons}>
                      <button
                        type="button"
                        onClick={() => {
                          setPatientSelectionMode("existing")
                          fetchAllPatients()
                        }}
                        className={`${styles.ruknButton} ${styles.ruknButtonSecondary} ${styles2.ruknPatientButton}`}
                      >
                        <Users size={20} />
                        Existing Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewPatientModal(true)}
                        className={`${styles.ruknButton} ${styles.ruknButtonPrimary} ${styles2.ruknPatientButton}`}
                      >
                        <UserPlus size={20} />
                        New Patient
                      </button>
                    </div>
                  </div>
                )}

                {/* Patient Selection Mode: Existing Patient */}
                {patientSelectionMode === "existing" && (
                  <div className={styles.ruknFormGroup}>
                    <label className={styles.ruknLabel}>Select Existing Patient *</label>
                    <div className={styles.ruknSelectWrapper}>
                      <Suspense fallback={<div className={styles.loadingSpinner}></div>}>
                        <Select
                          name="selectedPatient"
                          options={allPatients.map((patient) => ({
                            value: patient._id,
                            label: `${patient.name} - ${patient.email}`,
                          }))}
                          value={
                            selectedPatient && selectedPatient.id
                              ? {
                                  value: selectedPatient.id,
                                  label: `${selectedPatient.name} - ${selectedPatient.email}`,
                                }
                              : undefined
                          }
                          onChange={(selectedOption) => {
                            if (selectedOption) {
                              const patient = allPatients.find((p) => p._id === selectedOption.value)
                              if (patient) {
                                setSelectedPatient({
                                  id: patient._id,
                                  name: patient.name,
                                  email: patient.email,
                                  phone: patient.phone,
                                })
                              } else {
                                setSelectedPatient(null)
                              }
                              setValidationErrors((prev) => ({ ...prev, selectedPatient: null }))
                            }
                          }}
                          placeholder={isLoadingPatients ? "Loading Students..." : "Search and select Student..."}
                          styles={patientSelectStyles}
                          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                          menuPosition="fixed"
                          isLoading={isLoadingPatients}
                          isDisabled={isLoadingPatients}
                          isSearchable={true}
                          filterOption={(option, inputValue) => {
                            if (!option.data) return false
                            const searchValue = inputValue.toLowerCase()
                            return option.data.label.toLowerCase().includes(searchValue)
                          }}
                        />
                      </Suspense>
                    </div>
                    {validationErrors.selectedPatient && (
                      <span className={styles.ruknErrorText}>{validationErrors.selectedPatient}</span>
                    )}
                    <div className={styles.ruknButtonGroup} style={{ marginTop: "1rem" }}>
                      <button
                        type="button"
                        onClick={() => setPatientSelectionMode("buttons")}
                        className={`${styles.ruknButton} ${styles.ruknButtonSecondary}`}
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {validationErrors.selectedPatient && (
                  <div className={styles.ruknErrorMessage}>{validationErrors.selectedPatient}</div>
                )}

                <div className={`${styles.ruknButtonGroup} ${styles.end}`}>
                  <button
                    onClick={nextStep}
                    disabled={!selectedPatient}
                    className={`${styles.ruknButton} ${styles.ruknButtonPrimary}`}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Select Evaluation Type */}
            {currentStep === 1 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>Select Evaluation Type</h3>
                  <p>Choose the type of evaluation that best suits the Student's needs</p>
                </div>
                {assignmentError && <div className={styles.ruknErrorMessage}>{assignmentError}</div>}
                <div className={styles.ruknFormGroup}>
                  <label className={styles.ruknLabel}>Evaluation Type *</label>
                  <div className={styles.ruknSelectWrapper}>
                    <Suspense fallback={<div className={styles.loadingSpinner}></div>}>
                      <Select
                        name="evaluationType"
                        options={evaluationTypeOptions}
                        value={evaluationType}
                        onChange={(selectedOption) => {
                          setEvaluationType(selectedOption)
                          setAssignmentError("")
                          setValidationErrors((prev) => ({ ...prev, evaluationType: null }))
                          resetFormFields()
                        }}
                        placeholder="Choose your evaluation type..."
                        styles={evaluationTypeSelectStyles}
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        menuPosition="fixed"
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                      />
                    </Suspense>
                  </div>
                  {validationErrors.evaluationType && (
                    <span className={styles.ruknErrorText}>{validationErrors.evaluationType}</span>
                  )}
                </div>
                <div className={styles.ruknButtonGroup}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(0)}
                    className={`${styles.ruknButton} ${styles.ruknButtonSecondary}`}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!evaluationType?.value}
                    className={`${styles.ruknButton} ${styles.ruknButtonPrimary}`}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Request Evaluation */}
            {currentStep === 2 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>Schedule Appointment</h3>
                  <p>Select preferred date, time, and provide details</p>
                </div>
                <div className={styles.ruknFormGrid}>
                  <div className={styles.ruknFormGroup}>
                    <label className={styles.ruknLabel}>Select Day *</label>
                    <div className={styles.ruknDatePickerWrapper}>
                      <Suspense fallback={<div className={styles.loadingSpinner}></div>}>
                        <DatePicker
                          selected={selectedDay}
                          onChange={(date) => {
                            setSelectedDay(date)
                            setSelectedTime(null)
                            setValidationErrors((prev) => ({ ...prev, selectedDay: null, selectedTime: null }))
                          }}
                          filterDate={filterWeekdays}
                          placeholderText="Choose a date (Fridays & Sundays only)"
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
                      <Calendar size={16} className={styles.iconInline} /> Appointments available on Fridays and Sundays
                      only
                    </div>
                  </div>

                  {/* Time Picker Section */}
                  <div className={styles.ruknFormGroup}>
                    <label className={styles.ruknLabel}>Select Time *</label>
                    {isLoadingAvailability && (
                      <div className={styles.ruknAvailabilityLoading}>
                        <div className={styles.loadingSpinner}></div>
                        <span>Checking availability...</span>
                      </div>
                    )}
                    {availabilityError && <div className={styles.ruknAvailabilityError}>{availabilityError}</div>}
                    {selectedDay && !isLoadingAvailability && (
                      <div className={styles.ruknTimeSlotsGrid}>
                        {getAllPossibleTimeSlots().map((slot) => {
                          const isBooked = bookedSlots.some((bookedSlot) => bookedSlot.time === slot.timeString)
                          const isSelected = selectedTime && formatTimeToHHMM(selectedTime) === slot.timeString
                          return (
                            <button
                              key={slot.timeString}
                              type="button"
                              className={`${styles.ruknTimeSlot} ${
                                isSelected ? styles.selected : ""
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
                                {isSelected ? "Selected" : isBooked ? "Booked" : "Available"}
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
                      <Clock size={16} className={styles.iconInline} /> Appointments available from 12:00 PM to 8:00 PM
                    </div>
                  </div>
                </div>
                <div className={styles.ruknFormGroupdes}>
                  <label className={styles.ruknLabel}>Description *</label>
                  <textarea
                    className={`${styles.ruknTextarea} ${validationErrors.description ? styles.error : ""}`}
                    placeholder="Please describe Student's needs or any specific requirements..."
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
                {evaluationType?.value === "single_session" && (
                  <div className={styles.ruknFormGroup}>
                    <label className={styles.ruknLabel}>Select Services *</label>
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
                          )}
                          onChange={handleServiceChange}
                          placeholder="Choose your services..."
                          styles={customSelectStyles}
                          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                          menuPosition="fixed"
                        />
                      </Suspense>
                    </div>
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
                    onClick={() => setCurrentStep(1)}
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

            {/* Step 3: Case Study */}
            {currentStep === 3 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>Review & Edit Document</h3>
                  <p>Review and customize the Student's treatment plan document</p>
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
                    <h4 className={styles2.ruknNoCaseStudyTitle}>No Case Study Found for This Student</h4>
                    <p className={styles2.ruknNoCaseStudyDescription}>
                      Student {selectedPatient?.name} doesn't have a case study yet. You can create a new case study
                      using the default template.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCaseStudyCreation(true)}
                      className={`${styles.ruknButton} ${styles.ruknButtonPrimary} ${styles2.ruknCreateCaseStudyButton}`}
                    >
                      <FileText size={20} />
                      Create Case Study
                    </button>
                  </div>
                )}

                {/* Show document editor if patient has case study OR creation mode is active */}
                {(plan?.hasCaseStudy || showCaseStudyCreation) && (
                  <div className={styles.ruknDocumentContainer}>
                    <Suspense fallback={<div>Loading document editor...</div>}>
                      {plan && plan.hasCaseStudy && plan.caseStudyFile?.url ? (
                        <SyncfusionDocxCase
                          userData={{
                            docxId: plan.caseStudyFile.title,
                            patientId: selectedPatient?.id,
                            filePath: plan.caseStudyFile.url,
                            fileName: plan.caseStudyFile.filename || "case-study.docx",
                            docxName: `Case study of student: ${selectedPatient?.name}.docx`,
                          }}
                          planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/DrastHala/upload-plan`}
                          onDocumentSaved={refreshPlanData}
                        />
                      ) : (
                        <SyncfusionDocxCase
                          userData={{
                            docxId: "default",
                            patientId: selectedPatient?.id,
                            filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/DRAST-7ALA/plan/default.docx`,
                            fileName: "default.docx",
                            docxName: `Case study of student: ${selectedPatient?.name}.docx`,
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
                    onClick={() => setCurrentStep(2)}
                    className={`${styles.ruknButton} ${styles.ruknButtonSecondary}`}
                  >
                    ← Back
                  </button>
                  <div className={styles.ruknTooltipContainer}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      disabled={!plan?.hasCaseStudy}
                      className={`${styles.ruknButton} ${styles.ruknButtonPrimary} ${!plan?.hasCaseStudy ? styles.disabled : ""}`}
                    >
                      Proceed to Payment →
                    </button>
                    {!plan?.hasCaseStudy && (
                      <div className={styles.ruknTooltip}>
                        <div className={styles.ruknTooltipContent}>
                          <AlertCircle size={16} />
                          <span>You must save the case study document first to enable this button</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div className={styles.ruknStepContent}>
                <div className={styles.ruknStepHeader}>
                  <h3>Create Booking</h3>
                  <p>Review booking details and create appointment for Student</p>
                </div>
                {assignmentError && (
                  <div className={styles.ruknWarningMessage}>
                    <Info size={18} className={styles.iconInline} /> Warning: {assignmentError}
                  </div>
                )}
                {assignmentResults && (
                  <div className={styles.ruknAssignmentResults}>
                    <h4>Service Assignment Results</h4>
                    <div className={styles.ruknAssignmentSummary}>
                      <p>
                        <Check size={18} className={styles.iconInline} /> Successfully assigned:{" "}
                        {assignmentResults.totalAssigned}
                      </p>
                      {assignmentResults.totalFailed > 0 && (
                        <p>
                          <XCircle size={18} className={styles.iconInline} /> Failed assignments:{" "}
                          {assignmentResults.totalFailed}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className={styles.ruknPaymentSummary}>
                  <h4>Booking Summary</h4>
                  <div className={styles.ruknPaymentRow}>
                    <span>Student:</span>
                    <span>{selectedPatient?.name}</span>
                  </div>
                  <div className={styles.ruknPaymentRow}>
                    <span>Evaluation Type:</span>
                    <span>{evaluationType?.textLabel}</span>
                  </div>
                  <div className={styles.ruknPaymentRow}>
                    <span>Date:</span>
                    <span>{selectedDay?.toLocaleDateString()}</span>
                  </div>
                  <div className={styles.ruknPaymentRow}>
                    <span>Time:</span>
                    <span>{formatTimeToHHMM(selectedTime)}</span>
                  </div>
                  {programData.programType === "full_program" ? (
                    <>
                      <div className={styles.ruknPaymentRow}>
                        <span>Full Program Total:</span>
                        <span>5,000 AED</span>
                      </div>
                      <div className={styles.ruknPaymentRow}>
                        <span>Payment Status:</span>
                        <span style={{ color: "#09851aff", fontWeight: "600" }}>Completed</span>
                      </div>
                      <div className={styles.ruknPaymentTotal}>
                        <span>Amount Due:</span>
                        <span>1,000 AED</span>
                      </div>
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
                      <div className={styles.ruknPaymentRow}>
                        <span>Payment Status:</span>
                        <span style={{ color: "#09851aff", fontWeight: "600" }}>Completed</span>
                      </div>
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
                    onClick={async () => {
                      let programTypeForVerification = programData.programType
                      if (programTypeForVerification === "full_package_evaluation") {
                        programTypeForVerification = "full_program"
                      }
                      const isStillAvailable = await verifyAvailabilityBeforePayment(programTypeForVerification)
                      if (!isStillAvailable) {
                        alert("Sorry, this time slot has been booked by another user. Please choose a different time.")
                        setCurrentStep(2)
                        return
                      }
                      handlePayment()
                    }}
                    disabled={isProcessingPayment}
                    className={`${styles.ruknButton} ${styles.ruknButtonSuccess}`}
                  >
                    <Calendar size={20} /> {isProcessingPayment ? "Creating Booking..." : "Create Booking"}
                  </button>
                </div>
                <div className={styles.ruknButtonGroup}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className={`${styles.ruknButton} ${styles.ruknButtonSecondary}`}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Complete */}
            {currentStep === 5 && (
              <div className={styles.ruknSuccessContainer}>
                <div className={styles.ruknSuccessIcon}>
                  <PartyPopper size={48} />
                </div>
                <h3 className={styles.ruknSuccessTitle}>Booking Created!</h3>
                <p className={styles.ruknSuccessMessage}>
                  Appointment booking has been successfully created for Student {selectedPatient?.name} at Rukn
                  Elwatikon Rehabilitation Center.
                  {programData.programType === "school_evaluation" &&
                    " Student has been assigned to the school evaluation program."}
                </p>
                {assignmentResults && (
                  <div className={styles.ruknAssignmentFinalResults}>
                    <h4>Service Assignments</h4>
                    <p>Student has been automatically assigned to {assignmentResults.totalAssigned} service(s).</p>
                    {assignmentResults.details.map((result, index) => (
                      <div key={index} className={styles.ruknServiceAssignment}>
                        <Check size={16} className={styles.iconInline} /> {result.assignment.notes}
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.ruknNextSteps}>
                  <h4>What's Next?</h4>
                  <ul>
                    <li>
                      <Check size={16} className={styles.iconInline} /> Booking created with Completed payment status
                    </li>
                    <li>
                      <Check size={16} className={styles.iconInline} /> Accountant can update payment status later
                    </li>
                    <li>
                      <Check size={16} className={styles.iconInline} /> Student will receive email confirmation
                    </li>
                    {programData.programType === "school_evaluation" && (
                      <li>
                        <Check size={16} className={styles.iconInline} /> Student can access the school evaluation
                        portal
                      </li>
                    )}
                    {assignmentResults && assignmentResults.totalAssigned > 0 && (
                      <li>
                        <Check size={16} className={styles.iconInline} /> Service assignments can be viewed in
                        respective department portals
                      </li>
                    )}
                  </ul>
                </div>
                <div className={styles.ruknButtonGroup}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(0)
                      setSelectedPatient(null)
                      setPatientSelectionMode("buttons")
                      setEvaluationType(null)
                      resetFormFields()
                    }}
                    className={`${styles.ruknButton} ${styles.ruknButtonPrimary}`}
                  >
                    Book New Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Patient Modal */}
      {showNewPatientModal && (
        <div className={styles2.modal} onClick={() => setShowNewPatientModal(false)}>
          <div className={styles2.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles2.modalHeader}>
              <h2 className={styles2.modalTitle}>Create New Student</h2>
              <button className={styles2.closeButton} onClick={() => setShowNewPatientModal(false)}>
                ×
              </button>
            </div>
            <div className={styles2.modalBody}>
              <form onSubmit={handleNewPatientSubmit} className={styles2.form}>
                <div className={styles2.formGroup}>
                  <label className={styles2.label}>Full Name</label>
                  <input
                    type="text"
                    className={styles2.input}
                    value={newPatientForm.name}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className={styles2.formGroup}>
                  <label className={styles2.label}>Email Address</label>
                  <input
                    type="email"
                    className={styles2.input}
                    value={newPatientForm.email}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className={styles2.formGroup}>
                  <label className={styles2.label}>Phone Number</label>
                  <input
                    type="tel"
                    className={styles2.input}
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className={styles2.formGroup}>
                  <label className={styles2.label}>Gender</label>
                  <select
                    className={styles2.select}
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className={styles2.formGroup}>
                  <label className={styles2.label}>Date of Birth</label>
                  <input
                    type="date"
                    className={styles2.input}
                    value={newPatientForm.dateOfBirth}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className={styles2.formGroup}>
                  <label className={styles2.label}>Address</label>
                  <input
                    type="text"
                    className={styles2.input}
                    value={newPatientForm.address}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <div className={styles2.formGroup}>
                  <label className={styles2.label}>Password</label>
                  <input
                    type="password"
                    className={styles2.input}
                    value={newPatientForm.password}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, password: e.target.value })}
                    placeholder="Create a strong password"
                    required
                  />
                </div>
                <div className={styles2.formGroup}>
                  <label className={styles2.label}>Confirm Password</label>
                  <input
                    type="password"
                    className={styles2.input}
                    value={newPatientForm.confirmPassword}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                <button type="submit" className={`${styles2.button} ${styles2.buttonPrimary}`}>
                  Create Student
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Guide */}
      <InteractiveGuide
        isActive={showInteractiveGuide}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onClose={() => setShowInteractiveGuide(false)}
      />

      {/* Modal Backdrop */}
      {showNewPatientModal && <div className={styles2.modalBackdrop} onClick={() => setShowNewPatientModal(false)} />}
    </div>
  )
}

export default AdminStudentBooking
