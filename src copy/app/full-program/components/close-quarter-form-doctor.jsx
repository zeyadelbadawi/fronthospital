"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import styles from "../styles/close-quarter-form.module.css"
import axiosInstance from "@/helper/axiosSetup"
import { CalendarCheck, TriangleAlert, X } from "lucide-react"

// Form validation schema
const formSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
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

export default function CloseQuarterForm({ onSuccess, onClose, defaultValues = {} }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [doctorName, setDoctorName] = useState("Loading Doctor Name...")
  const [departmentName, setDepartmentName] = useState("Loading Department...")

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: defaultValues.doctorId || "",
      departmentId: defaultValues.departmentId || "",
      quarterOfYear: defaultValues.quarterOfYear?.toString() || "",
      year: defaultValues.year?.toString() || new Date().getFullYear().toString(),
    },
  })

  // Fetch doctor and department names
  useEffect(() => {
    const fetchNames = async () => {
      if (defaultValues.doctorId) {
        try {
          const response = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/doctor/${defaultValues.doctorId}`,
          )
          setDoctorName(response.data.username || "Unknown Doctor")
        } catch (error) {
          console.error("Error fetching Doctor name:", error)
          setDoctorName("Unknown Doctor")
        }
      }

      if (defaultValues.departmentId) {
        try {
          const response = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_API_URL}/departments/department/${defaultValues.departmentId}`,
          )
          setDepartmentName(response.data.name || "Unknown Department")
        } catch (error) {
          console.error("Error fetching Department name:", error)
          setDepartmentName("Unknown Department")
        }
      }
    }
    fetchNames()
  }, [defaultValues.doctorId, defaultValues.departmentId])

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/doctorFile/close-and-generate-next-plan`,
        {
          doctorId: data.doctorId,
          departmentId: data.departmentId,
          quarterToClose: Number.parseInt(data.quarterOfYear),
          yearToClose: Number.parseInt(data.year),
        },
      )

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
      {/* Close Button Header */}
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Close Quarter & Generate Next Plan</h3>
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
                Current Plan Quarter: Q{defaultValues.quarterOfYear} ({defaultValues.year})
              </p>
              <p className={styles.quarterInfoSubtitle}>
                Doctor: {doctorName} | Department: {departmentName}
              </p>
            </div>
          </div>

          <p className={styles.formText}>
            Select the quarter and year you want to close. A new plan for the next quarter will be automatically
            generated for this Doctor.
          </p>
        </div>

        {/* Form Fields */}
        <div className={styles.formRow}>
          <div className="row">
            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  className={`${styles.formInput} form-control`}
                  readOnly={true}
                  style={{ backgroundColor: "#f8f9fa" }}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Department</label>
                <input
                  type="text"
                  value={departmentName}
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
              for the *next* quarter for this Doctor. This action cannot be undone. Ensure you have completed the
              current quarter's plan.
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
              "Close Quarter & Generate Next Plan"
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
