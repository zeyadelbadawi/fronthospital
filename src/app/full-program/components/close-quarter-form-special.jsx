"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import styles from "@/app/full-program/styles/close-quarter-form.module.css"
import axiosInstance from "@/helper/axiosSetup"
import { CalendarCheck, TriangleAlert } from "lucide-react"

// Form validation schema for SpecialEducation
const formSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
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

export default function CloseQuarterFormSpecial({ onSuccess, onClose, defaultValues = {} }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

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

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/close-and-generate-next-plan`, {
        patientId: data.patientId,
        quarterToClose: Number.parseInt(data.quarterOfYear),
        yearToClose: Number.parseInt(data.year),
      })

      if (response.status !== 200) {
        throw new Error(response.data?.message || "Failed to close quarter and generate next plan")
      }

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

  return (
    <div className={styles.closeQuarterForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Quarter Selection Section */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>Quarter Selection</label>

          <div className={styles.quarterInfoBox}>
            <CalendarCheck className={styles.quarterIcon} />
            <div className={styles.quarterInfoContent}>
              <p className={styles.quarterInfoTitle}>Select Quarter and Year to Close</p>
              <p className={styles.quarterInfoSubtitle}>
                Current Plan Quarter: Q{defaultValues.quarterOfYear} ({defaultValues.year})
              </p>
            </div>
          </div>

          <p className={styles.formText}>
            Select the quarter and year you want to close. A new plan for the next quarter will be automatically
            generated for this patient.
          </p>
        </div>

        {/* Form Fields */}
        <div className={styles.formRow}>
          <div className="row">
            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Patient ID</label>
                <Controller
                  name="patientId"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`${styles.formInput} form-control ${errors.patientId ? styles.invalid : ""}`}
                      placeholder="Enter patient ID"
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
                  value="SpecialEducation"
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
              for the *next* quarter for this patient. This action cannot be undone. Ensure you have completed the
              current quarter's plan.
            </div>
          </div>
        </div>

        {submitError && <div className={styles.errorMessage}>{submitError}</div>}

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
            "Close Quarter & Generate Next Plan"
          )}
        </button>
      </form>
    </div>
  )
}
