"use client"

import { useState } from "react"
import { X, Edit2, Upload, Lock, Loader2 } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/sheet-action-modal.module.css"

const SheetActionModal = ({ isOpen, onClose, program, onOpenEditor, onRefresh }) => {
  const [loading, setLoading] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState(false)

  const handleLockSheet = async () => {
    if (!program) return

    setLoading(true)
    try {
      const response = await axiosInstance.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/school/plan/${program.patientId}/${encodeURIComponent(program.unicValue)}/lock`,
      )

      if (response.status === 200) {
        showSuccessMessage("Sheet locked successfully! It cannot be changed anymore.")
        await new Promise((resolve) => setTimeout(resolve, 1500))
        onRefresh()
        onClose()
      }
    } catch (error) {
      console.error("Error locking sheet:", error)
      showErrorMessage("Failed to lock sheet. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChangeSheet = () => {
    setShowChangeModal(true)
  }

  const showSuccessMessage = (message) => {
    const toast = document.createElement("div")
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1001;
      font-weight: 500;
    `
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      document.body.removeChild(toast)
    }, 4000)
  }

  const showErrorMessage = (message) => {
    const toast = document.createElement("div")
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1001;
      font-weight: 500;
    `
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      document.body.removeChild(toast)
    }, 4000)
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Manage Sheet</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X className={styles.closeIcon} />
            </button>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.studentInfo}>
              <p className={styles.studentName}>{program?.patientName}</p>
              <p className={styles.programId}>{program?.programName}</p>
            </div>

            <div className={styles.optionsContainer}>
              <button className={`${styles.optionButton} ${styles.editButton}`} onClick={onOpenEditor}>
                <Edit2 className={styles.optionIcon} />
                <div className={styles.optionContent}>
                  <p className={styles.optionTitle}>Edit Sheet</p>
                  <p className={styles.optionDescription}>Open the sheet in the editor to make changes</p>
                </div>
              </button>

              <button className={`${styles.optionButton} ${styles.changeButton}`} onClick={handleChangeSheet}>
                <Upload className={styles.optionIcon} />
                <div className={styles.optionContent}>
                  <p className={styles.optionTitle}>Change Sheet</p>
                  <p className={styles.optionDescription}>Replace the current sheet with a new one</p>
                </div>
              </button>

              <button
                className={`${styles.optionButton} ${styles.lockButton}`}
                onClick={handleLockSheet}
                disabled={loading}
              >
                <Lock className={styles.optionIcon} />
                <div className={styles.optionContent}>
                  <p className={styles.optionTitle}>Save Forever</p>
                  <p className={styles.optionDescription}>Lock this sheet permanently - it cannot be changed</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showChangeModal && (
        <SheetChangeModal
          isOpen={showChangeModal}
          onClose={() => setShowChangeModal(false)}
          program={program}
          onSuccess={() => {
            setShowChangeModal(false)
            onRefresh()
            onClose()
          }}
        />
      )}
    </>
  )
}

const SheetChangeModal = ({ isOpen, onClose, program, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
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
      validateAndSetFile(droppedFiles[0])
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-word.document.macroEnabled.12",
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      showErrorMessage("Please upload a valid Word document (.doc or .docx)")
      setFile(null)
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      showErrorMessage("File size must be less than 10MB")
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("document", file)

      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/school/upload-plan/${program.patientId}/${encodeURIComponent(program.unicValue)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        },
      )

      if (response.status === 200) {
        showSuccessMessage("Sheet replaced successfully!")
        await new Promise((resolve) => setTimeout(resolve, 1500))
        onSuccess()
      }
    } catch (error) {
      console.error("Error replacing sheet:", error)
      showErrorMessage("Failed to replace sheet. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const showSuccessMessage = (message) => {
    const toast = document.createElement("div")
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1002;
      font-weight: 500;
    `
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      document.body.removeChild(toast)
    }, 4000)
  }

  const showErrorMessage = (message) => {
    const toast = document.createElement("div")
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1002;
      font-weight: 500;
    `
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      document.body.removeChild(toast)
    }, 4000)
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.changeModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Replace Sheet</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div
            className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className={styles.uploadContent}>
              <Upload className={styles.uploadIcon} />
              <h3 className={styles.uploadTitle}>Drag and drop your new file here</h3>
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

          {file && (
            <div className={styles.filePreview}>
              <p className={styles.fileName}>{file.name}</p>
              <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button className={styles.uploadSubmitButton} onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <Loader2 className={`${styles.buttonIcon} ${styles.spinning}`} />
                Replacing...
              </>
            ) : (
              <>
                <Upload className={styles.buttonIcon} />
                Replace Sheet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SheetActionModal
