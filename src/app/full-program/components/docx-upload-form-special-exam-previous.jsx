"use client"

import { useState, useCallback, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import styles from "@/app/full-program/styles/docx-upload-form.module.css"

import axiosInstance from "@/helper/axiosSetup"
import { Upload, FileText, XCircle, RefreshCw } from "lucide-react" // Added RefreshCw for spinner
import ExistingSpecialExamsView from "./existing-special-exams-view"

// Form validation schema for SpecialEducation
const formSchema = z.object({
  document: z.any().refine((file) => file, "Document is required."),
  patientId: z.string().min(1, "Patient ID is required"),
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

export default function DocxUploadFormSpecialExamPrevious({ onSuccess, onClose, defaultValues, onSwitchForm }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileName, setFileName] = useState("")
  const [fileError, setFileError] = useState("")
  const [submitError, setSubmitError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [patientName, setPatientName] = useState("Loading Patient Name...")
  const [viewMode, setViewMode] = useState("upload")

  useEffect(() => {
    const fetchPatientName = async () => {
      if (defaultValues.patientId) {
        try {
          const response = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${defaultValues.patientId}`,
          )
          setPatientName(response.data.name || "Unknown Patient")
        } catch (error) {
          console.error("Error fetching patient name:", error)
          setPatientName("Unknown Patient")
        }
      } else {
        setPatientName("N/A")
      }
    }
    fetchPatientName()
  }, [defaultValues.patientId])

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  })

  const watchedDocument = watch("document")

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files ? event.target.files[0] : null
      if (file) {
        if (
          file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
          !file.name.endsWith(".docx")
        ) {
          setFileError("Only DOCX files are allowed.")
          setFileName("")
          setValue("document", null)
          return
        }
        if (file.size > 10 * 1024 * 1024) {
          setFileError("File size exceeds 10MB limit.")
          setFileName("")
          setValue("document", null)
          return
        }
        setFileError("")
        setFileName(file.name)
        setValue("document", file)
        setUploadSuccess(false)
      } else {
        setFileName("")
        setValue("document", null)
      }
    },
    [setValue],
  )

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault()
      const file = event.dataTransfer.files ? event.dataTransfer.files[0] : null
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
    setFileName("")
    setFileError("")
    setValue("document", null)
    setUploadSuccess(false)
  }, [setValue])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setFileError("")
    setSubmitError(null)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append("document", data.document)
      formData.append("patientId", data.patientId)
      formData.append("quarterOfYear", data.quarterOfYear)
      formData.append("year", data.year)

      // Check for existing exam
      const existingExamCheck = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/get-exams/${data.patientId}?quarter=${data.quarterOfYear}&year=${data.year}`,
      )

      if (
        existingExamCheck.data.exams &&
        (Array.isArray(existingExamCheck.data.exams)
          ? existingExamCheck.data.exams.length > 0
          : existingExamCheck.data.exams)
      ) {
        setSubmitError(`A exam already exists for Q${data.quarterOfYear}/${data.year}.`)
        setIsSubmitting(false)
        return
      }

      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/upload-exam`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.status !== 200) throw new Error("File upload failed")

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 5000)

      if (onSuccess) onSuccess(response.data)
    } catch (error) {
      console.error("Upload failed:", error)
      setSubmitError(error.response?.data?.message || error.message || "Failed to upload document. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i)

  if (viewMode === "existing") {
    return (
      <ExistingSpecialExamsView
        patientId={defaultValues.patientId}
        onClose={onClose}
        onBackToUpload={() => setViewMode("upload")}
      />
    )
  }

  return (
    <div className={styles.uploadFormContainer}>
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
        {/* Form Fields */}
        <div className={styles.formRow}>
          <div className="row">
            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Patient Name</label>
                <input
                  type="text"
                  value={patientName}
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
                    >
                      <option value="">Select quarter</option>
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
        {submitError && <div className={styles.errorMessage}>{submitError}</div>}
        {uploadSuccess && <div className={styles.successMessage}>Document uploaded successfully!</div>}
        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={`${styles.submitButton} ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting || !watchedDocument}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className={styles.spinnerBorder} /> Uploading...
              </>
            ) : (
              "Upload Previous Special Education Exam"
            )}
          </button>
          <button
            type="button"
            className={`${styles.secondaryButton}`}
            onClick={() => setViewMode("existing")}
            disabled={!defaultValues.patientId}
          >
            Existing Exams
          </button>
          {onSwitchForm && (
            <button type="button" className={`${styles.secondaryButton}`} onClick={() => onSwitchForm("plan")}>
              Switch to Plan Upload
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
