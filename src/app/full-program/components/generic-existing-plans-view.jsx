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
    Psychotherapy: {
    name: "Psychotherapy",
    displayName: "Psychotherapy",
    endpoint: "Psychotherapy",
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

const GenericExistingPlansView = ({ department = "aba", patientId, onClose, onBackToUpload }) => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const config = DEPARTMENT_CONFIG[department]

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/${config.endpoint}/get-plans/${patientId}`,
      )
      // Sort plans by year (desc) and then quarter (desc)
      const sortedPlans = (response.data.plans || []).sort((a, b) => {
        if (b.year !== a.year) {
          return b.year - a.year
        }
        return b.quarterOfYear - a.quarterOfYear
      })
      setPlans(sortedPlans)
    } catch (err) {
      console.error(`Error fetching ${config.displayName} plans:`, err)
      setError("Failed to load existing plans. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [patientId, config.endpoint, config.displayName])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleDelete = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      return
    }
    try {
      await axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_URL}/${config.endpoint}/delete-plan/${planId}`)
      fetchPlans() // Refresh the list
    } catch (err) {
      console.error(`Error deleting ${config.displayName} plan:`, err)
      setError("Failed to delete plan. Please try again.")
    }
  }

  if (loading) {
    return <div className={styles.loadingMessage}>Loading existing plans...</div>
  }

  if (error) {
    return <div className={styles.errorMessageView}>{error}</div>
  }

  return (
    <div className={styles.existingDocumentsContainer}>
      <div className={styles.existingDocumentsHeader}>
        <h4>Existing {config.displayName} Plans</h4>
        <button onClick={onBackToUpload} className={styles.backButton}>
          Back to Upload
        </button>
      </div>
      {plans.length === 0 ? (
        <p className={styles.loadingMessage}>No existing {config.displayName} plans found for this Student.</p>
      ) : (
        <ul className={styles.documentList}>
          {plans.map((plan) => (
            <li key={plan._id} className={styles.documentItem}>
              <div className={styles.documentInfo}>
                <h3>{plan.documentName}</h3>
                <p>
                  Quarter: Q{plan.quarterOfYear}, Year: {plan.year}
                </p>
                <p>Uploaded Date: {new Date(plan.createdAt).toLocaleDateString()}</p>
              </div>
              <div className={styles.documentActions}>
                <button
                  onClick={() => handleDelete(plan._id)}
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
export const ExistingABAPlansView = (props) => <GenericExistingPlansView department="aba" {...props} />
export const ExistingSpeechPlansView = (props) => <GenericExistingPlansView department="speech" {...props} />
export const ExistingPhysicalPlansView = (props) => <GenericExistingPlansView department="physicalTherapy" {...props} />
export const ExistingPsychotherapyPlansView = (props) => <GenericExistingPlansView department="Psychotherapy" {...props} />

export const ExistingOccupationalPlansView = (props) => (
  <GenericExistingPlansView department="OccupationalTherapy" {...props} />
)
export const ExistingSpecialPlansView = (props) => <GenericExistingPlansView department="SpecialEducation" {...props} />

export default GenericExistingPlansView
