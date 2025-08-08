"use client"

import { useState, useCallback, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import styles from "../styles/docx-upload-form.module.css"
import axiosInstance from "@/helper/axiosSetup"
import { Upload, FileText, XCircle, RefreshCw, X } from "lucide-react"

// Form validation schema - Updated for doctor forms
const formSchema = z.object({
  document: z.any().refine((file) => file, "Document is required."),
  doctorId: z.string().min(1, "Doctor ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
  quarterOfYear: z.string().min(1, "Quarter is required"),
  year: z
    .string()
    .min(1, "Year is required")
    .refine(
      (val) => {
        const year = Number.parseInt(val)
        return year >= 2000 && year <= new Date().getFullYear() + 5
      },
      `Year must be between 2000 and ${new Date().getFullYear() + 5}`,
    ),
})

export default function DocxUploadForm({ variant = "regular", onSuccess, onClose, defaultValues }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileName, setFileName] = useState("")
  const [fileError, setFileError] = useState("")
  const [submitError, setSubmitError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [doctorName, setDoctorName] = useState("Loading Doctor Name...")
  const [departmentName, setDepartmentName] = useState("Loading Department...")

  const isPrevious = variant === "previous"



  // Convert default values to strings to match schema
  const processedDefaultValues = {
    ...defaultValues,
    quarterOfYear: defaultValues?.quarterOfYear ? String(defaultValues.quarterOfYear) : "",
    year: defaultValues?.year ? String(defaultValues.year) : "",
  }


  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: processedDefaultValues,
  })

  const watchedDocument = watch("document")
  const watchedQuarter = watch("quarterOfYear")
  const watchedYear = watch("year")

  // Log form values whenever they change
  useEffect(() => {
    const currentValues = getValues()
    console.log("📊 Form Values Changed:", {
      quarterOfYear: currentValues.quarterOfYear,
      quarterType: typeof currentValues.quarterOfYear,
      year: currentValues.year,
      yearType: typeof currentValues.year,
      doctorId: currentValues.doctorId,
      departmentId: currentValues.departmentId,
      hasDocument: !!currentValues.document,
    })
  }, [watchedQuarter, watchedYear, watchedDocument, getValues])

  // Log form errors whenever they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("❌ Form Validation Errors:", errors)
    }
  }, [errors])

  // Fetch doctor and department names
  useEffect(() => {
    const fetchNames = async () => {
      console.log("🔍 Fetching names for:", {
        doctorId: defaultValues.doctorId,
        departmentId: defaultValues.departmentId,
      })

      if (defaultValues.doctorId) {
        try {
          const response = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/doctor/${defaultValues.doctorId}`,
          )
          console.log("👨‍⚕️ Doctor API Response:", response.data)
          setDoctorName(response.data.username || "Unknown Doctor")
        } catch (error) {
          console.error("❌ Error fetching Doctor name:", error)
          setDoctorName("Unknown Doctor")
        }
      }

      if (defaultValues.departmentId) {
        try {
          const response = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_API_URL}/departments/department/${defaultValues.departmentId}`,
          )
          console.log("🏥 Department API Response:", response.data)
          setDepartmentName(response.data.name || "Unknown Department")
        } catch (error) {
          console.error("❌ Error fetching Department name:", error)
          setDepartmentName("Unknown Department")
        }
      }
    }
    fetchNames()
  }, [defaultValues.doctorId, defaultValues.departmentId])

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files ? event.target.files[0] : null
      console.log("📁 File selected:", file ? { name: file.name, size: file.size, type: file.type } : null)

      if (file) {
        if (
          file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
          !file.name.endsWith(".docx")
        ) {
          console.log("❌ Invalid file type:", file.type)
          setFileError("Only DOCX files are allowed.")
          setFileName("")
          setValue("document", null)
          return
        }
        if (file.size > 10 * 1024 * 1024) {
          console.log("❌ File too large:", file.size)
          setFileError("File size exceeds 10MB limit.")
          setFileName("")
          setValue("document", null)
          return
        }
        console.log("✅ File validation passed")
        setFileError("")
        setFileName(file.name)
        setValue("document", file)
        if (isPrevious) setUploadSuccess(false)
      } else {
        setFileName("")
        setValue("document", null)
      }
    },
    [setValue, isPrevious],
  )

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault()
      const file = event.dataTransfer.files ? event.dataTransfer.files[0] : null
      console.log("🎯 File dropped:", file?.name)
      if (file) {
        handleFileChange({ target: { files: [file] } })
      }
    },
    [handleFileChange],
  )

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
  }, [])

  const removeFile = useCallback(() => {
    console.log("🗑️ Removing file")
    setFileName("")
    setFileError("")
    setValue("document", null)
    if (isPrevious) setUploadSuccess(false)
  }, [setValue, isPrevious])

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const onSubmit = async (data) => {
    console.log("🚀 Form submission started")
    console.log("📋 Form data being submitted:", {
      doctorId: data.doctorId,
      departmentId: data.departmentId,
      quarterOfYear: data.quarterOfYear,
      quarterType: typeof data.quarterOfYear,
      year: data.year,
      yearType: typeof data.year,
      hasDocument: !!data.document,
      documentName: data.document?.name,
    })

    // Validate data before submission
    try {
      const validationResult = formSchema.safeParse(data)
      console.log("🔍 Manual validation result:", validationResult)

      if (!validationResult.success) {
        console.log("❌ Manual validation failed:", validationResult.error.issues)
        return
      }
    } catch (validationError) {
      console.error("❌ Validation error:", validationError)
      return
    }

    setIsSubmitting(true)
    setFileError("")
    setSubmitError(null)
    if (isPrevious) setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append("document", data.document)
      formData.append("doctorId", data.doctorId)
      formData.append("departmentId", data.departmentId)
      formData.append("quarterOfYear", data.quarterOfYear)
      formData.append("year", data.year)

      console.log("📦 FormData contents:")
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value)
      }

      // Frontend validation for existing plan
      console.log("🔍 Checking for existing plans...")
      const existingPlanCheck = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/doctorFile/get-plans/${data.doctorId}/${data.departmentId}?quarter=${data.quarterOfYear}&year=${data.year}`,
      )

      console.log("📋 Existing plan check response:", existingPlanCheck.data)

      if (existingPlanCheck.data.doctorFiles && existingPlanCheck.data.doctorFiles.length > 0) {
        console.log("❌ Plan already exists")
        setSubmitError(`A plan already exists for Q${data.quarterOfYear}/${data.year}.`)
        setIsSubmitting(false)
        return
      }

      console.log("📤 Uploading document...")
      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/doctorFile/upload-plan`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("✅ Upload response:", response.data)

      if (response.status !== 200) throw new Error("File upload failed")

      if (isPrevious) {
        setUploadSuccess(true)
        setTimeout(() => setUploadSuccess(false), 5000)
      }

      if (onSuccess) onSuccess(response.data)
    } catch (error) {
      console.error("❌ Upload failed:", error)
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      setSubmitError(error.response?.data?.message || error.message || "Failed to upload document. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = isPrevious
    ? Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i)
    : Array.from({ length: currentYear - 2000 + 6 }, (_, i) => 2000 + i)

  console.log("📅 Available years:", years)

  const getButtonText = () => {
    if (isSubmitting) {
      return isPrevious ? (
        <>
          <RefreshCw className={styles.spinnerBorder} /> Uploading...
        </>
      ) : (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Uploading...
        </>
      )
    }

    const prefix = isPrevious ? "Upload Previous " : "Upload "
    return `${prefix}Doctor Plan`
  }

  // For regular variant, we want to disable the selects but still submit their values
  // For previous variant, we want them to be editable
  const getSelectProps = () => {
    const props = isPrevious
      ? {} // Fully editable for previous variant
      : {
          disabled: true,
          style: { backgroundColor: "#f8f9fa", cursor: "not-allowed" },
        }

    console.log("🎛️ Select props:", { isPrevious, props })
    return props
  }

  // Log current form state
  const currentFormValues = getValues()
  console.log("📊 Current form state:", {
    values: currentFormValues,
    errors: errors,
    isSubmitting,
    isPrevious,
  })

  return (
    <div className={styles.uploadFormContainer}>
      {/* Close Button Header */}
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>{isPrevious ? "Upload Previous Doctor Plan" : "Upload Doctor Plan"}</h3>
        <button
          type="button"
          onClick={handleClose}
          className={styles.closeButton}
          disabled={isSubmitting}
          aria-label="Close upload form"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.uploadForm}>
        {/* File Upload Section */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>
            Document File <span className={styles.requiredIndicator}>*</span>
          </label>
          <div
            className={`${styles.fileDropArea} ${fileError || errors.document ? styles.invalid : ""} ${
              watchedDocument ? styles.hasFile : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("document-upload-input").click()}
          >
            {watchedDocument ? (
              <div className={styles.filePreview}>
                <FileText className={styles.fileIcon} />
                <span>{fileName}</span>
                <button type="button" onClick={removeFile} className={styles.removeFileButton}>
                  <XCircle size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload className={styles.uploadIcon} />
                <p className={styles.dropText}>Drop your DOCX file here, or click to browse</p>
                <p className={styles.maxSize}>Maximum file size: 10MB</p>
              </>
            )}
            <input
              id="document-upload-input"
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className={styles.hiddenInput}
            />
          </div>
          {fileError && <div className={styles.errorMessage}>{fileError}</div>}
          {errors.document && <div className={styles.errorMessage}>{errors.document.message}</div>}
          <p className={styles.formText}>Upload a DOCX document (Microsoft Word format only)</p>
        </div>

        {/* Form Fields - Add the missing doctor and department fields */}
        <div className={styles.formRow}>
          <div className="row">
            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Doctor ID</label>
                <Controller
                  name="doctorId"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`${styles.formInput} form-control ${errors.doctorId ? styles.invalid : ""}`}
                      placeholder="Enter doctor ID"
                      readOnly={true}
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  )}
                />
                {errors.doctorId && <div className={styles.errorMessage}>{errors.doctorId.message}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Department ID</label>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`${styles.formInput} form-control ${errors.departmentId ? styles.invalid : ""}`}
                      placeholder="Enter department ID"
                      readOnly={true}
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  )}
                />
                {errors.departmentId && <div className={styles.errorMessage}>{errors.departmentId.message}</div>}
              </div>
            </div>
          </div>
        </div>

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
                  render={({ field }) => {
                    console.log("🎛️ Quarter field render:", {
                      value: field.value,
                      valueType: typeof field.value,
                      name: field.name,
                      selectProps: getSelectProps(),
                    })
                    return (
                      <select
                        {...field}
                        className={`${styles.formSelect} form-select ${errors.quarterOfYear ? styles.invalid : ""}`}
                        {...getSelectProps()}
                        onChange={(e) => {
                          console.log("📅 Quarter changed:", e.target.value, typeof e.target.value)
                          field.onChange(e.target.value) // Ensure string value
                        }}
                      >
                        <option value="">Select quarter</option>
                        <option value="1">Q1 (Jan-Mar)</option>
                        <option value="2">Q2 (Apr-Jun)</option>
                        <option value="3">Q3 (Jul-Sep)</option>
                        <option value="4">Q4 (Oct-Dec)</option>
                      </select>
                    )
                  }}
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
                  render={({ field }) => {
                    console.log("🎛️ Year field render:", {
                      value: field.value,
                      valueType: typeof field.value,
                      name: field.name,
                      selectProps: getSelectProps(),
                    })
                    return (
                      <select
                        {...field}
                        className={`${styles.formSelect} form-select ${errors.year ? styles.invalid : ""}`}
                        {...getSelectProps()}
                        onChange={(e) => {
                          console.log("📅 Year changed:", e.target.value, typeof e.target.value)
                          field.onChange(e.target.value) // Ensure string value
                        }}
                      >
                        <option value="">Select year</option>
                        {years.map((year) => (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        ))}
                      </select>
                    )
                  }}
                />
                {errors.year && <div className={styles.errorMessage}>{errors.year.message}</div>}
              </div>
            </div>
          </div>
        </div>

        {submitError && <div className={styles.errorMessage}>{submitError}</div>}
        {isPrevious && uploadSuccess && <div className={styles.successMessage}>Document uploaded successfully!</div>}

        {isPrevious ? (
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={`${styles.submitButton} ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting || !watchedDocument}
              onClick={() => {
                console.log("🔘 Submit button clicked (Previous variant)")
                const currentValues = getValues()
                console.log("📊 Values at submit:", currentValues)
              }}
            >
              {getButtonText()}
            </button>
            <button type="button" onClick={handleClose} className={styles.cancelButton} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        ) : (
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={`${styles.submitButton} ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting || !watchedDocument}
              onClick={() => {
                console.log("🔘 Submit button clicked (Regular variant)")
                const currentValues = getValues()
                console.log("📊 Values at submit:", currentValues)
              }}
            >
              {getButtonText()}
            </button>
            <button type="button" onClick={handleClose} className={styles.cancelButton} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
