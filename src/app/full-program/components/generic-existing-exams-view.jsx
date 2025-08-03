"use client"

import { useState, useEffect, useCallback } from "react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/docx-upload-form.module.css"
import { Trash2 } from "lucide-react"

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
  physicalTherapy: {
    name: "Physical Therapy",
    displayName: "Physical Therapy",
    endpoint: "physicalTherapy",
  },
  OccupationalTherapy: {
    name: "Occupational Therapy",
    displayName: "Occupational Therapy",
    endpoint: "OccupationalTherapy",
  },
  SpecialEducation: {
    name: "Special Education",
    displayName: "Special Education",
    endpoint: "SpecialEducation",
  },
}

const GenericExistingExamsView = ({ department = "aba", patientId, onClose, onBackToUpload }) => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const config = DEPARTMENT_CONFIG[department]

  const fetchExams = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/${config.endpoint}/get-exams/${patientId}`,
      )
      // Sort exams by year (desc) and then quarter (desc)
      const sortedExams = (response.data.exams || []).sort((a, b) => {
        if (b.year !== a.year) {
          return b.year - a.year
        }
        return b.quarterOfYear - a.quarterOfYear
      })
      setExams(sortedExams)
    } catch (err) {
      console.error(`Error fetching ${config.displayName} exams:`, err)
      setError("Failed to load existing exams. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [patientId, config.endpoint, config.displayName])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const handleDelete = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam? This action cannot be undone.")) {
      return
    }
    try {
      await axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_URL}/${config.endpoint}/delete-exam/${examId}`)
      fetchExams() // Refresh the list
    } catch (err) {
      console.error(`Error deleting ${config.displayName} exam:`, err)
      setError("Failed to delete exam. Please try again.")
    }
  }

  if (loading) {
    return <div className={styles.loadingMessage}>Loading existing exams...</div>
  }

  if (error) {
    return <div className={styles.errorMessageView}>{error}</div>
  }

  return (
    <div className={styles.existingDocumentsContainer}>
      <div className={styles.existingDocumentsHeader}>
        <h4>Existing {config.displayName} Exams</h4>
        <button onClick={onBackToUpload} className={styles.backButton}>
          Back to Upload
        </button>
      </div>
      {exams.length === 0 ? (
        <p className={styles.loadingMessage}>No existing {config.displayName} exams found for this Student.</p>
      ) : (
        <ul className={styles.documentList}>
          {exams.map((exam) => (
            <li key={exam._id} className={styles.documentItem}>
              <div className={styles.documentInfo}>
                <h3>{exam.documentName}</h3>
                <p>
                  Quarter: Q{exam.quarterOfYear}, Year: {exam.year}
                </p>
                <p>Uploaded Date: {new Date(exam.createdAt).toLocaleDateString()}</p>
              </div>
              <div className={styles.documentActions}>
                <button
                  onClick={() => handleDelete(exam._id)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Export individual components for backward compatibility
export const ExistingABAExamsView = (props) => <GenericExistingExamsView department="aba" {...props} />
export const ExistingSpeechExamsView = (props) => <GenericExistingExamsView department="speech" {...props} />
export const ExistingPhysicalExamsView = (props) => <GenericExistingExamsView department="physicalTherapy" {...props} />
export const ExistingOccupationalExamsView = (props) => (
  <GenericExistingExamsView department="OccupationalTherapy" {...props} />
)
export const ExistingSpecialExamsView = (props) => <GenericExistingExamsView department="SpecialEducation" {...props} />

export default GenericExistingExamsView
