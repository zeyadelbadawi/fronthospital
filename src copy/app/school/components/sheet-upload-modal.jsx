"use client"

import { useState } from "react"
import { Upload, X, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/sheet-upload-modal.module.css"

const SheetUploadModal = ({ isOpen, onClose, patientId, unicValue, patientName, onUploadSuccess }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0]
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (selectedFile) => {
    setError(null)

    // Check file type
    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-word.document.macroEnabled.12",
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a valid Word document (.doc or .docx)")
      setFile(null)
      return
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError("File size must be less than 10MB")
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("document", file)
      formData.append("patientId", patientId)

      console.log("[v0] Starting upload for patientId:", patientId, "unicValue:", unicValue)

      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/school/upload-plan/${patientId}/${encodeURIComponent(unicValue)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        },
      )

      console.log("[v0] Upload response:", response.data)

      if (response.status === 200) {
        console.log("[v0] Upload successful, plan created:", response.data.plan)
        showSuccessMessage("Sheet uploaded successfully!")
        setFile(null)

        setTimeout(() => {
          console.log("[v0] Closing modal and calling onUploadSuccess")
          onClose()
          if (onUploadSuccess) {
            onUploadSuccess()
          }
        }, 2000) // Increased from 1500 to 2000ms
      }
    } catch (err) {
      console.error("[v0] Error uploading file:", err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to upload sheet. Please try again."
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const showSuccessMessage = (message) => {
    const toast = document.createElement("div")
    toast.className = styles.successToast
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add(styles.show)
    }, 100)

    setTimeout(() => {
      toast.classList.remove(styles.show)
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 3000)
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.modalTitle}>Upload School Evaluation Sheet</h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
              <X className={styles.closeIcon} />
            </button>
          </div>
          <p className={styles.modalSubtitle}>Upload a Word document (.doc or .docx) for {patientName}</p>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Upload Area */}
          <div
            className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className={styles.uploadContent}>
              <Upload className={styles.uploadIcon} />
              <h3 className={styles.uploadTitle}>Drag and drop your file here</h3>
              <p className={styles.uploadSubtitle}>or</p>
              <label className={styles.uploadButton}>
                <span>Browse Files</span>
                <input
                  type="file"
                  accept=".doc,.docx,.DOC,.DOCX"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
              </label>
              <p className={styles.uploadHint}>Supported formats: .doc, .docx (Max 10MB)</p>
            </div>
          </div>

          {/* File Preview */}
          {file && (
            <div className={styles.filePreview}>
              <div className={styles.fileInfo}>
                <div className={styles.fileIcon}>
                  <CheckCircle className={styles.fileCheckIcon} />
                </div>
                <div className={styles.fileDetails}>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                className={styles.removeButton}
                onClick={() => setFile(null)}
                disabled={uploading}
                aria-label="Remove file"
              >
                <X className={styles.removeIcon} />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle className={styles.errorIcon} />
              <p>{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              The uploaded sheet will be saved and can be edited later using the editor. It will work exactly the same
              as sheets created from the editor.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button className={styles.uploadSubmitButton} onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <Loader2 className={`${styles.buttonIcon} ${styles.spinning}`} />
                Uploading...
              </>
            ) : (
              <>
                <Upload className={styles.buttonIcon} />
                Upload Sheet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SheetUploadModal
