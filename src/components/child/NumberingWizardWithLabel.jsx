"use client"

import { useState, useEffect } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import Select from "react-select"
import SyncfusionDocx from "@/components/SyncfusionDocx"

const NumberingWizardWithLabel = ({ currentStep, setCurrentStep, patientId, patientName }) => {
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [description, setDescription] = useState("")
  const [evaluationType, setEvaluationType] = useState("")
  const [blurred, setBlurred] = useState(false)
  const router = useRouter()
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState("")
  const [plan, setPlan] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [assignmentError, setAssignmentError] = useState("")
  const [assignmentResults, setAssignmentResults] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  const [programData, setProgramData] = useState({
    programType: "",
    patientId,
    date: selectedDay,
    time: selectedTime,
    description: "",
    programKind: "",
    unicValue: "",
  })

  const serviceOptions = [
    { value: "physical_therapy", label: "Physical Therapy", price: 100 },
    { value: "ABA", label: "ABA", price: 300 },
    { value: "occupational_therapy", label: "Occupational Therapy", price: 1200 },
    { value: "special_education", label: "Special Education", price: 500 },
    { value: "speech", label: "Speech", price: 230 },
  ]

  const handleServiceChange = (selectedOptions = []) => {
    setSelectedServices(selectedOptions)
    const newPrice = selectedOptions.reduce((total, option) => total + option.price, 0)
    setTotalPrice(newPrice)
    // Clear validation error when services are selected
    if (selectedOptions.length > 0) {
      setValidationErrors((prev) => ({ ...prev, services: null }))
    }
  }

  useEffect(() => {
    console.log("patientId received in useEffect:", patientId)
    const fetchPlanData = async () => {
      try {
        console.log("Fetching plan data for patientId:", patientId)
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/DrastHala/plan/${patientId}`)
        console.log("Plan data fetched:", response.data)
        setPlan(response.data)
      } catch (error) {
        console.error("Error fetching plan data:", error)
      }
    }

    if (patientId) {
      fetchPlanData()
    }
  }, [patientId])

  const getProgramPrice = (programType) => {
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
  }

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

  const filterWeekdays = (date) => {
    const day = date.getDay()
    return day === 0 || day === 5
  }

  // Enhanced validation functions
  const validateStep = (step) => {
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
  }

  // Enhanced assignment creation function
  const createPatientSchoolAssignment = async (patientId, description) => {
    try {
      const checkResponse = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/school/school-assignments?search=${patientId}`,
      )

      const existingAssignments = checkResponse.data.assignments || []
      const isAlreadyAssigned = existingAssignments.some(
        (assignment) => assignment.patient && assignment.patient._id === patientId,
      )

      if (isAlreadyAssigned) {
        console.log("Patient already assigned to school program")
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
        console.log("Patient successfully assigned to school program:", response.data)
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
  }

  // Auto-assignment function for full program
  const autoAssignToAllDepartments = async (patientId, description) => {
    const departments = [
      { endpoint: "/aba/assign-to-ABA", name: "ABA" },
      { endpoint: "/speech/assign-to-Speech", name: "Speech" },
      { endpoint: "/SpecialEducation/assign-to-Special-Education" },
      { endpoint: "/physicalTherapy/assign-to-physical", name: "Physical Therapy" },
      { endpoint: "/OccupationalTherapy/assign-to-Occupational", name: "Occupational Therapy" },
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
          console.log(`Successfully assigned to ${dept.name}:`, response.data)
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

    setAssignmentResults(assignmentResults)
    if (assignmentResults.totalFailed > 0) {
      setAssignmentError(`${assignmentResults.totalFailed} department assignments failed`)
    }
  }

  const nextStep = async () => {
    console.log("patientId in nextStep:", patientId)

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

        const updatedProgramData = {
          ...programData,
          programType,
          date: selectedDay,
          time: selectedTime,
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
  }

  const handlePayment = async () => {
    if (isProcessingPayment) return

    setIsProcessingPayment(true)
    setAssignmentError("")
    setAssignmentResults(null)

    try {
      const programType = programData.programType
      let totalAmount = 0
      let initialPayment = 0

      // تحديد المبالغ حسب نوع البرنامج
      if (programType === "full_program") {
        totalAmount = 5000 // إجمالي الـ Full Program
        initialPayment = 1000 // الدفعة الأولى في الـ Wizard
      } else {
        // School أو Single Session - نفس اللوجيك القديم
        totalAmount = getProgramPrice(programType) + totalPrice
        initialPayment = totalAmount // دفع كامل
      }

      // Save the program first
      const programPayload = {
        ...programData,
        patientId,
        programKind: selectedServices.map((service) => service.value),
        programType,
        totalAmount,
        paidAmount: initialPayment,
        remainingAmount: totalAmount - initialPayment,
        paymentStatus: initialPayment >= totalAmount ? "FULLY_PAID" : "PARTIALLY_PAID",
        paymentMethod: programType === "full_program" ? "MIXED" : "CASH",
      }

      const response = await axiosInstance.post("/authentication/saveProgram", programPayload)

      if (response.status === 200) {
        const programId = response.data.program._id

        // Save money record للدفعة الأولى
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
          console.log("Payment and money record saved successfully")

          // Assignment logic - فقط للـ School و Single Session
          if (programType !== "full_program") {
            // Auto-assign to all departments for full program (القديم)
            if (programType === "full_program") {
              console.log("Auto-assigning patient to all departments for full program")
              await autoAssignToAllDepartments(patientId, description)
            }

            // If this is a school evaluation, create PatientSchoolAssignment
            if (programType === "school_evaluation") {
              console.log("Creating school assignment for patient:", patientId)
              const assignmentResult = await createPatientSchoolAssignment(patientId, description)
              if (!assignmentResult.success) {
                setAssignmentError(assignmentResult.error)
                console.error("School assignment failed:", assignmentResult.error)
              } else {
                console.log("School assignment created successfully")
              }
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
  }

  const steps = [
    { number: 1, title: "Select Evaluation Type", icon: "📋" },
    { number: 2, title: "Request Evaluation", icon: "📅" },
    { number: 3, title: "Word Document", icon: "📄" },
    { number: 4, title: "Payment", icon: "💳" },
    { number: 5, title: "Complete", icon: "✅" },
  ]

  return (
    <>
      <style jsx>{`
        .rukn-booking-wizard {
          min-height: 100vh;
          background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
          padding: 2rem 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .rukn-wizard-container {
          max-width: 64rem;
          margin: 0 auto;
        }

        .rukn-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .rukn-header-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          background-color: #2563eb;
          border-radius: 50%;
          margin-bottom: 1rem;
        }

        .rukn-header-icon span {
          font-size: 1.5rem;
          color: white;
        }

        .rukn-main-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
          margin-top: 0;
        }

        .rukn-sub-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 0.5rem;
          margin-top: 0;
        }

        .rukn-description {
          color: #6b7280;
          margin: 0;
        }

        .rukn-progress-card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .rukn-steps-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          position: relative;
        }

        .rukn-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .rukn-step-circle {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }

        .rukn-step-circle.active {
          background-color: #2563eb;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .rukn-step-circle.inactive {
          background-color: #e5e7eb;
          color: #6b7280;
        }

        .rukn-step-title {
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
          padding: 0 0.5rem;
        }

        .rukn-step-title.active {
          color: #2563eb;
        }

        .rukn-step-title.inactive {
          color: #6b7280;
        }

        .rukn-step-line {
          position: absolute;
          height: 2px;
          width: 4rem;
          top: 1.5rem;
          left: calc(50% + 1.5rem);
          transition: all 0.3s ease;
        }

        .rukn-step-line.active {
          background-color: #2563eb;
        }

        .rukn-step-line.inactive {
          background-color: #e5e7eb;
        }

        .rukn-main-card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .rukn-card-content {
          padding: 2rem;
        }

        .rukn-step-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .rukn-step-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .rukn-step-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
          margin-top: 0;
        }

        .rukn-step-header p {
          color: #6b7280;
          margin: 0;
        }

        .rukn-form-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rukn-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .rukn-form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .rukn-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .rukn-select,
        .rukn-input,
        .rukn-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1rem;
          color: #374151;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .rukn-select:focus,
        .rukn-input:focus,
        .rukn-textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .rukn-select.error,
        .rukn-input.error,
        .rukn-textarea.error {
          border-color: #ef4444;
        }

        .rukn-textarea {
          resize: none;
          min-height: 6rem;
        }

        .rukn-service-total {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #eff6ff;
          border-radius: 0.5rem;
        }

        .rukn-service-total p {
          color: #1e40af;
          font-weight: 600;
          margin: 0;
        }

        .rukn-button-group {
          display: flex;
          justify-content: space-between;
          padding-top: 1.5rem;
        }

        .rukn-button-group.end {
          justify-content: flex-end;
        }

        .rukn-button {
          padding: 0.75rem 2rem;
          font-weight: 600;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
        }

        .rukn-button-primary {
          background-color: #2563eb;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .rukn-button-primary:hover:not(:disabled) {
          background-color: #1d4ed8;
        }

        .rukn-button-primary:disabled {
          background-color: #d1d5db;
          cursor: not-allowed;
        }

        .rukn-button-secondary {
          background-color: #e5e7eb;
          color: #374151;
        }

        .rukn-button-secondary:hover {
          background-color: #d1d5db;
        }

        .rukn-button-success {
          background-color: #059669;
          color: white;
          padding: 1rem 3rem;
          font-size: 1.125rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .rukn-button-success:hover:not(:disabled) {
          background-color: #047857;
        }

        .rukn-button-success:disabled {
          background-color: #d1d5db;
          cursor: not-allowed;
        }

        .rukn-payment-summary {
          background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .rukn-payment-summary h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          margin-top: 0;
        }

        .rukn-payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .rukn-payment-row span:first-child {
          color: #6b7280;
        }

        .rukn-payment-row span:last-child {
          font-weight: 600;
        }

        .rukn-payment-total {
          display: flex;
          justify-content: space-between;
          font-size: 1.125rem;
          font-weight: 700;
          color: #2563eb;
          padding-top: 0.5rem;
          border-top: 1px solid #e5e7eb;
          margin-top: 0.5rem;
        }

        .rukn-payment-center {
          text-align: center;
        }

        .rukn-payment-note {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.75rem;
          margin-bottom: 0;
        }

        .rukn-success-container {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .rukn-success-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 6rem;
          height: 6rem;
          background-color: #dcfce7;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
        }

        .rukn-success-icon span {
          font-size: 2.5rem;
        }

        .rukn-success-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
          margin-top: 0;
        }

        .rukn-success-message {
          font-size: 1.125rem;
          color: #6b7280;
          margin-bottom: 1.5rem;
          margin-top: 0;
        }

        .rukn-next-steps {
          background: #f0fdf4;
          border-radius: 0.5rem;
          padding: 1.5rem;
          max-width: 28rem;
          margin: 0 auto;
        }

        .rukn-next-steps h4 {
          font-weight: 600;
          color: #166534;
          margin-bottom: 0.5rem;
          margin-top: 0;
        }

        .rukn-next-steps ul {
          font-size: 0.875rem;
          color: #15803d;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .rukn-next-steps li {
          margin-bottom: 0.25rem;
        }

        .rukn-footer {
          text-align: center;
          margin-top: 2rem;
          color: #6b7280;
        }

        .rukn-footer p {
          font-size: 0.875rem;
          margin: 0;
        }

        .rukn-document-container {
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .rukn-error-message {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .rukn-warning-message {
          background-color: #fffbeb;
          border: 1px solid #fed7aa;
          color: #d97706;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .rukn-assignment-results {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          color: #0c4a6e;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .rukn-assignment-summary p {
          margin: 0.25rem 0;
        }

        .rukn-assignment-final-results {
          background: #f0fdf4;
          border: 1px solid #22c55e;
          color: #166534;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .rukn-service-assignment {
          margin: 0.5rem 0;
          font-size: 0.875rem;
        }

        .rukn-error-text {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
        }

        @media (max-width: 767px) {
          .rukn-steps-container {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .rukn-step {
            flex: 0 0 calc(50% - 0.5rem);
          }

          .rukn-step-line {
            display: none;
          }

          .rukn-button-group {
            flex-direction: column;
            gap: 1rem;
          }

          .rukn-button-group.end {
            align-items: stretch;
          }
        }
      `}</style>

      <div className="rukn-booking-wizard">
        <div className="rukn-wizard-container">
          {/* Header */}
          <div className="rukn-header">
            <h4 className="rukn-sub-title">Book Your Appointment</h4>
          </div>

          {/* Progress Steps */}
          <div className="rukn-progress-card">
            <div className="rukn-steps-container">
              {steps.map((step, index) => (
                <div key={step.number} className="rukn-step">
                  <div className={`rukn-step-circle ${currentStep >= index ? "active" : "inactive"}`}>
                    {currentStep > index ? "✓" : step.icon}
                  </div>
                  <span className={`rukn-step-title ${currentStep >= index ? "active" : "inactive"}`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`rukn-step-line ${currentStep > index ? "active" : "inactive"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="rukn-main-card">
            <div className="rukn-card-content">
              {/* Step 1: Select Evaluation Type */}
              {currentStep === 0 && (
                <div className="rukn-step-content">
                  <div className="rukn-step-header">
                    <h3>Select Evaluation Type</h3>
                    <p>Choose the type of evaluation that best suits your needs</p>
                  </div>

                  {assignmentError && <div className="rukn-error-message">{assignmentError}</div>}

                  <div className="rukn-form-group">
                    <label className="rukn-label">Evaluation Type *</label>
                    <select
                      className={`rukn-select ${validationErrors.evaluationType ? "error" : ""}`}
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
                      <option value="full_package_evaluation">📦 Full Package Evaluation</option>
                      <option value="single_session">👤 Single Session</option>
                    </select>
                    {validationErrors.evaluationType && (
                      <span className="rukn-error-text">{validationErrors.evaluationType}</span>
                    )}
                  </div>

                  <div className="rukn-button-group end">
                    <button onClick={nextStep} disabled={!evaluationType} className="rukn-button rukn-button-primary">
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Request Evaluation */}
              {currentStep === 1 && (
                <div className="rukn-step-content">
                  <div className="rukn-step-header">
                    <h3>Schedule Your Appointment</h3>
                    <p>Select your preferred date, time, and provide details</p>
                  </div>

                  <div className="rukn-form-grid">
                    <div className="rukn-form-group">
                      <label className="rukn-label">Select Day *</label>
                      <DatePicker
                        selected={selectedDay}
                        onChange={(date) => {
                          setSelectedDay(date)
                          setValidationErrors((prev) => ({ ...prev, selectedDay: null }))
                        }}
                        filterDate={filterWeekdays}
                        placeholderText="Choose a date"
                        className={`rukn-input ${validationErrors.selectedDay ? "error" : ""}`}
                        dateFormat="MMMM dd, yyyy"
                        calendarClassName="custom-calendar"
                        minDate={new Date()}
                      />
                      {validationErrors.selectedDay && (
                        <span className="rukn-error-text">{validationErrors.selectedDay}</span>
                      )}
                    </div>

                    <div className="rukn-form-group">
                      <label className="rukn-label">Select Time *</label>
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
                        className={`rukn-input ${validationErrors.selectedTime ? "error" : ""}`}
                        placeholderText="Choose a time"
                        filterTime={(time) => {
                          const hour = time.getHours()
                          return hour >= 12 && hour <= 20
                        }}
                      />
                      {validationErrors.selectedTime && (
                        <span className="rukn-error-text">{validationErrors.selectedTime}</span>
                      )}
                    </div>
                  </div>

                  <div className="rukn-form-group">
                    <label className="rukn-label">Description *</label>
                    <textarea
                      className={`rukn-textarea ${validationErrors.description ? "error" : ""}`}
                      placeholder="Please describe your needs or any specific requirements..."
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value)
                        setValidationErrors((prev) => ({ ...prev, description: null }))
                      }}
                    />
                    {validationErrors.description && (
                      <span className="rukn-error-text">{validationErrors.description}</span>
                    )}
                  </div>

                  {evaluationType === "single_session" && (
                    <div className="rukn-form-group">
                      <label className="rukn-label">Select Services *</label>
                      <Select
                        isMulti
                        name="services"
                        options={serviceOptions}
                        getOptionLabel={(e) => `${e.label} ($${e.price})`}
                        onChange={handleServiceChange}
                        placeholder="Choose your services..."
                        className={validationErrors.services ? "error" : ""}
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
                      {validationErrors.services && (
                        <span className="rukn-error-text">{validationErrors.services}</span>
                      )}
                      {totalPrice > 0 && (
                        <div className="rukn-service-total">
                          <p>Selected Services Total: ${totalPrice}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rukn-button-group">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(0)}
                      className="rukn-button rukn-button-secondary"
                    >
                      ← Back
                    </button>
                    <button type="button" onClick={nextStep} className="rukn-button rukn-button-primary">
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Word Document */}
              {currentStep === 2 && (
                <div className="rukn-step-content">
                  <div className="rukn-step-header">
                    <h3>Review & Edit Document</h3>
                    <p>Review and customize your treatment plan document</p>
                  </div>

                  <div className="rukn-document-container">
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
                  </div>

                  <div className="rukn-button-group">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="rukn-button rukn-button-secondary"
                    >
                      ← Back
                    </button>
                    <button type="button" onClick={() => setCurrentStep(3)} className="rukn-button rukn-button-primary">
                      Proceed to Payment →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 3 && (
                <div className="rukn-step-content">
                  <div className="rukn-step-header">
                    <h3>Complete Payment</h3>
                    <p>Secure payment processing for your appointment</p>
                  </div>

                  {assignmentError && <div className="rukn-warning-message">Warning: {assignmentError}</div>}

                  {assignmentResults && (
                    <div className="rukn-assignment-results">
                      <h4>Service Assignment Results</h4>
                      <div className="rukn-assignment-summary">
                        <p>✅ Successfully assigned: {assignmentResults.totalAssigned}</p>
                        {assignmentResults.totalFailed > 0 && (
                          <p>❌ Failed assignments: {assignmentResults.totalFailed}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="rukn-payment-summary">
                    <h4>Payment Summary</h4>
                    {programData.programType === "full_program" ? (
                      <>
                        <div className="rukn-payment-row">
                          <span>Full Program Total:</span>
                          <span>5,000 EGP</span>
                        </div>
                        <div className="rukn-payment-row">
                          <span>Initial Payment (Today):</span>
                          <span>1,000 EGP</span>
                        </div>
                        <div className="rukn-payment-row">
                          <span>Remaining (After Consultation):</span>
                          <span>4,000 EGP</span>
                        </div>
                        <div className="rukn-payment-total">
                          <span>Paying Now:</span>
                          <span>1,000 EGP</span>
                        </div>
                        <p className="rukn-payment-note">
                          You'll complete the remaining payment after your consultation with the doctor.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="rukn-payment-row">
                          <span>Program Fee:</span>
                          <span>${getProgramPrice(programData.programType)}</span>
                        </div>
                        {totalPrice > 0 && (
                          <div className="rukn-payment-row">
                            <span>Additional Services:</span>
                            <span>${totalPrice}</span>
                          </div>
                        )}
                        <div className="rukn-payment-total">
                          <span>Total Amount:</span>
                          <span>${getProgramPrice(programData.programType) + totalPrice}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="rukn-payment-center">
                    <button
                      type="button"
                      onClick={handlePayment}
                      disabled={isProcessingPayment}
                      className="rukn-button rukn-button-success"
                    >
                      💳 {isProcessingPayment ? "Processing..." : "Complete Payment"}
                    </button>
                    <p className="rukn-payment-note">Secure payment processing • SSL encrypted</p>
                  </div>
                </div>
              )}

              {/* Step 5: Complete */}
              {currentStep === 4 && (
                <div className="rukn-success-container">
                  <div className="rukn-success-icon">
                    <span>🎉</span>
                  </div>
                  <h3 className="rukn-success-title">Congratulations!</h3>
                  <p className="rukn-success-message">
                    Your appointment has been successfully booked at Rukn Elwatikon Rehabilitation Center.
                    {programData.programType === "school_evaluation" &&
                      " You have been assigned to our school evaluation program."}
                  </p>

                  {assignmentResults && (
                    <div className="rukn-assignment-final-results">
                      <h4>Service Assignments</h4>
                      <p>You have been automatically assigned to {assignmentResults.totalAssigned} service(s).</p>
                      {assignmentResults.details.map((result, index) => (
                        <div key={index} className="rukn-service-assignment">
                          ✅ {result.assignment.notes}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="rukn-next-steps">
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
    </>
  )
}

export default NumberingWizardWithLabel
