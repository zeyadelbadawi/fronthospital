"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/app/full-program/styles/docx-upload-form.module.css"
import { Trash2 } from "lucide-react" // Added icons

export default function ExistingPhysicalExamsView({ patientId, onClose, onBackToUpload }) {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExams = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/physicalTherapy/get-exams/${patientId}`)
      // Sort exams by year (desc) and then quarter (desc)
      const sortedExams = (response.data.exams || []).sort((a, b) => {
        if (b.year !== a.year) {
          return b.year - a.year
        }
        return b.quarterOfYear - a.quarterOfYear
      })
      setExams(sortedExams)
    } catch (err) {
      console.error("Error fetching physicalTherapy exams:", err)
      setError("Failed to load existing exams. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const handleDelete = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam? This action cannot be undone.")) {
      return
    }
    try {
      await axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_URL}/physicalTherapy/delete-exam/${examId}`)
      fetchExams() // Refresh the list
    } catch (err) {
      console.error("Error deleting physicalTherapy exam:", err)
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
        <h4>
          Existing physicalTherapy Exams 
        </h4>
        <button onClick={onBackToUpload} className={styles.backButton}>
          Back to Upload
        </button>
      </div>
      {exams.length === 0 ? (
        <p className={styles.loadingMessage}>No existing physicalTherapy exams found for this patient.</p>
      ) : (
        <ul className={styles.documentList}>
          {exams.map((exam) => (
            <li key={exam._id} className={styles.documentItem}>
              <div className={styles.documentInfo}>
                <h3>{exam.documentName}</h3>
                <p>
                  Quarter: Q{exam.quarterOfYear}, Year: {exam.year}
                </p>
                <p>Uploaded: {new Date(exam.createdAt).toLocaleDateString()}</p>
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
