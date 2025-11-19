"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import styles from "../styles/close-quarter-form.module.css"
import axiosInstance from "@/helper/axiosSetup"
import { sendNotification } from "@/helper/notification-helper"
import { getCurrentUserId } from "@/app/full-program/utils/auth-utils"
import { CalendarCheck, TriangleAlert, X } from "lucide-react"

// Department configuration
const DEPARTMENT_CONFIG = {
  aba: {
    name: "ABA",
    displayName: "ABA",
    endpoint: "aba",
  },
  speech: {
    name: "Speech",
    displayName: "Speech",
    endpoint: "speech",
  },
  physical: {
    name: "Physical Therapy",
    displayName: "Physical Therapy",
    endpoint: "physicalTherapy",
  },
  occupational: {
    name: "Occupational Therapy",
    displayName: "Occupational Therapy",
    endpoint: "OccupationalTherapy",
  },
  special: {
    name: "Special Education",
    displayName: "Special Education",
    endpoint: "SpecialEducation",
  },
  Psychotherapy: {
    name: "Psychotherapy",
    displayName: "Psychotherapy",
    endpoint: "Psychotherapy",
  },
}

// Form validation schema
const formSchema = z.object({
  patientId: z.string().min(1, "Student ID is required"),
  quarterOfYear: z.string().min(1, "Quarter is required"),
  year: z
    .string()
    .min(1, "Year is required")
    .refine(
      (val) => {
        const year = Number.parseInt(val)
        const currentYear = new Date().getFullYear()
        return year >= 2000 && year <= currentYear + 5
      },
      `Year must be between 2000 and ${new Date().getFullYear() + 5}`,
    ),
})

const GenericCloseQuarterForm = ({
  department = "aba",
  type = "plan", // "plan" or "exam"
  onSuccess,
  onClose,
  defaultValues = {},
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const config = DEPARTMENT_CONFIG[department]
  const isExam = type === "exam"

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: defaultValues.patientId || "",
      quarterOfYear: defaultValues.quarterOfYear?.toString() || "",
      year: defaultValues.year?.toString() || new Date().getFullYear().toString(),
    },
  })

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const sendQuarterClosedNotification = async (patientId, quarterNumber, yearNumber, docType, departmentName) => {
    try {
      const docTypeLabel = docType === "exam" ? "Exam" : "Plan"
      const docTypeLower = docType === "exam" ? "exam" : "plan"
      const docTypeArabic = docType === "exam" ? "اختبار" : "خطه"

      await sendNotification({
        isList: false,
        receiverId: patientId,
        rule: "Patient",
        title: `Your ${docTypeLabel} is Ready`,
        titleAr: `${docTypeLabel} الخاص بك جاهز`,
        message: `Your ${docTypeLower} of ${departmentName} for quarter ${quarterNumber} of year ${yearNumber} is now ready and you can view it in your profile`,
        messageAr: `${docTypeArabic} الخاص بك في قسم ${departmentName} للربع ${quarterNumber} للسنة ${yearNumber} جاهز الآن ويمكنك عرضه في ملفك الشخصي`,
        type: "successfully",
      })
    } catch (error) {
      console.error("Failed to send notification:", error)
      // Don't throw error - notification failure shouldn't block quarter closing
    }
  }

  const sendAdminHeadDoctorNotification = async (
    doctorName,
    patientName,
    quarterNumber,
    yearNumber,
    docType,
    departmentName,
  ) => {
    try {
      const docTypeLabel = docType === "exam" ? "Exam" : "Plan"
      const docTypeLower = docType === "exam" ? "exam" : "plan"
      const docTypeArabic = docType === "exam" ? "اختبار" : "خطه"

      // Fetch all admin and head doctor IDs
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/notification/admin-headdoctor-ids`)
      const { adminIds, headDoctorIds } = response.data
      const allReceiverIds = [...adminIds, ...headDoctorIds]

      if (allReceiverIds.length === 0) {
        console.warn("No admins or head doctors found to notify")
        return
      }

      // Send bulk notification to all admins and head doctors
      await sendNotification({
        isList: true,
        receiverIds: allReceiverIds,
        rule: "Admin", // Using Admin as the rule for both admins and head doctors
        title: `${docTypeLabel} Closed`,
        titleAr: `تم إغلاق ${docTypeLabel}`,
        message: `Dr ${doctorName} closed the ${docTypeLower} of ${departmentName} for Student ${patientName} for quarter ${quarterNumber} of year ${yearNumber}`,
        messageAr: `د. ${doctorName} أغلق ${docTypeArabic} قسم ${departmentName} للطالب ${patientName} للربع ${quarterNumber} من السنة ${yearNumber}`,
        type: "update",
      })
    } catch (error) {
      console.error("Failed to send admin/head doctor notification:", error)
      // Don't throw error - notification failure shouldn't block quarter closing
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const endpoint = isExam
        ? `${process.env.NEXT_PUBLIC_API_URL}/${config.endpoint}/close-and-generate-next-exam`
        : `${process.env.NEXT_PUBLIC_API_URL}/${config.endpoint}/close-and-generate-next-plan`

      const response = await axiosInstance.post(endpoint, {
        patientId: data.patientId,
        quarterToClose: Number.parseInt(data.quarterOfYear),
        yearToClose: Number.parseInt(data.year),
      })

      if (response.status !== 200) {
        throw new Error(response.data?.message || `Failed to close quarter and generate next ${type}`)
      }

      const doctorId = getCurrentUserId()
      let doctorName = "Doctor"
      let patientName = "Patient"

      try {
        // Fetch doctor info
        const doctorResponse = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/authentication/doctor/${doctorId}`,
        )
        const doctor = doctorResponse.data
        doctorName =
          doctor.fullName ||
          (doctor.firstName && doctor.lastName ? `${doctor.firstName} ${doctor.lastName}` : null) ||
          doctor.firstName ||
          doctor.lastName ||
          doctor.name ||
          doctor.username ||
          "Doctor"
      } catch (err) {
        console.warn("Could not fetch doctor name:", err)
      }

      try {
        // Fetch patient info
        const patientResponse = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${data.patientId}`,
        )
        const patient = patientResponse.data
        patientName =
          patient.name ||
          (patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : null) ||
          patient.firstName ||
          patient.lastName ||
          patient.username ||
          "Patient"
      } catch (err) {
        console.warn("Could not fetch patient name:", err)
      }

      // Send notification to patient
      await sendQuarterClosedNotification(data.patientId, data.quarterOfYear, data.year, type, config.displayName)

      // Send notification to all admins and head doctors
      await sendAdminHeadDoctorNotification(
        doctorName,
        patientName,
        data.quarterOfYear,
        data.year,
        type,
        config.displayName,
      )

      if (onSuccess) onSuccess(data)
      alert(`Quarter Closed: Quarter ${data.quarterOfYear}/${data.year} closed successfully!`)
      if (onClose) onClose()
    } catch (error) {
      console.error("Close quarter failed:", error)
      setSubmitError(error.response?.data?.message || error.message || "Failed to close quarter. Please try again.")
      alert(error.response?.data?.message || error.message || "Failed to close quarter. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()
  let maxYearInDropdown = currentYear + 1
  if (defaultValues.year && Number.parseInt(defaultValues.year) > maxYearInDropdown) {
    maxYearInDropdown = Number.parseInt(defaultValues.year)
  }
  maxYearInDropdown += 2

  const years = Array.from({ length: maxYearInDropdown - 2000 + 1 }, (_, i) => 2000 + i)

  const getFormTitle = () => {
    const docType = isExam ? "Exam" : "Plan"
    return `Close Quarter & Generate Next ${docType}`
  }

  return (
    <div className={styles.closeQuarterForm}>
      {/* Close Button Header */}
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>{getFormTitle()}</h3>
        <button
          type="button"
          onClick={handleClose}
          className={styles.closeButton}
          disabled={isSubmitting}
          aria-label="Close form"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.uploadForm}>
        {/* Quarter Selection Section */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>Quarter Selection</label>

          <div className={styles.quarterInfoBox}>
            <CalendarCheck className={styles.quarterIcon} />
            <div className={styles.quarterInfoContent}>
              <p className={styles.quarterInfoTitle}>Select Quarter and Year to Close</p>
              <p className={styles.quarterInfoSubtitle}>
                Current {isExam ? "Exam" : "Plan"} Quarter: Q{defaultValues.quarterOfYear} ({defaultValues.year})
              </p>
            </div>
          </div>

          <p className={styles.formText}>
            Select the quarter and year you want to close. A new {type} for the next quarter will be automatically
            generated for this Student.
          </p>
        </div>

        {/* Form Fields */}
        <div className={styles.formRow}>
          <div className="row">
            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Student ID</label>
                <Controller
                  name="patientId"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`${styles.formInput} form-control ${errors.patientId ? styles.invalid : ""}`}
                      placeholder="Enter Student ID"
                      readOnly={true}
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  )}
                />
                {errors.patientId && <div className={styles.errorMessage}>{errors.patientId.message}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Department</label>
                <input
                  type="text"
                  value={config.displayName}
                  className={`${styles.formInput} form-control`}
                  readOnly={true}
                  style={{ backgroundColor: "#f8f9fa" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className="row">
            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Quarter of Year</label>
                <Controller
                  name="quarterOfYear"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`${styles.formSelect} form-select ${errors.quarterOfYear ? styles.invalid : ""}`}
                      readOnly={true}
                      style={{ backgroundColor: "#f8f9fa" }}
                    >
                      <option value="">Select quarter to close</option>
                      <option value="1">Q1 (Jan-Mar)</option>
                      <option value="2">Q2 (Apr-Jun)</option>
                      <option value="3">Q3 (Jul-Sep)</option>
                      <option value="4">Q4 (Oct-Dec)</option>
                    </select>
                  )}
                />
                {errors.quarterOfYear && <div className={styles.errorMessage}>{errors.quarterOfYear.message}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Year</label>
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`${styles.formSelect} form-select ${errors.year ? styles.invalid : ""}`}
                      readOnly={true}
                      style={{ backgroundColor: "#f8f9fa" }}
                    >
                      <option value="">Select year</option>
                      {years.map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.year && <div className={styles.errorMessage}>{errors.year.message}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className={styles.formRow}>
          <div className={styles.warningNotice}>
            <TriangleAlert className={styles.warningIcon} />
            <div className={styles.warningContent}>
              <strong>Important:</strong> Closing this quarter will automatically generate a new default DOCX document
              for the *next* quarter for this Student. This action cannot be undone. Ensure you have completed the
              current quarter's {type}.
            </div>
          </div>
        </div>

        {submitError && <div className={styles.errorMessage}>{submitError}</div>}

        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={`${styles.submitButton} ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Closing Quarter...
              </>
            ) : (
              `Close Quarter & Generate Next ${isExam ? "Exam" : "Plan"}`
            )}
          </button>
          <button type="button" onClick={handleClose} className={styles.cancelButton} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// Export individual components for backward compatibility - Plans
export const CloseQuarterFormABA = (props) => <GenericCloseQuarterForm department="aba" type="plan" {...props} />
export const CloseQuarterFormSpeech = (props) => <GenericCloseQuarterForm department="speech" type="plan" {...props} />
export const CloseQuarterFormPhysical = (props) => (
  <GenericCloseQuarterForm department="physicalTherapy" type="plan" {...props} />
)
export const CloseQuarterFormPsychotherapy = (props) => (
  <GenericCloseQuarterForm department="Psychotherapy" type="plan" {...props} />
)
export const CloseQuarterFormOccupationalTherapy = (props) => (
  <GenericCloseQuarterForm department="OccupationalTherapy" type="plan" {...props} />
)
export const CloseQuarterFormSpecial = (props) => (
  <GenericCloseQuarterForm department="SpecialEducation" type="plan" {...props} />
)

// Export individual components for backward compatibility - Exams
export const CloseQuarterFormABAExam = (props) => <GenericCloseQuarterForm department="aba" type="exam" {...props} />
export const CloseQuarterFormSpeechExam = (props) => (
  <GenericCloseQuarterForm department="speech" type="exam" {...props} />
)
export const CloseQuarterFormPhysicalExam = (props) => (
  <GenericCloseQuarterForm department="physicalTherapy" type="exam" {...props} />
)
export const CloseQuarterFormPsychotherapyExam = (props) => (
  <GenericCloseQuarterForm department="Psychotherapy" type="exam" {...props} />
)
export const CloseQuarterFormOccupationalTherapyExam = (props) => (
  <GenericCloseQuarterForm department="OccupationalTherapy" type="exam" {...props} />
)
export const CloseQuarterFormSpecialExam = (props) => (
  <GenericCloseQuarterForm department="SpecialEducation" type="exam" {...props} />
)

export default GenericCloseQuarterForm
