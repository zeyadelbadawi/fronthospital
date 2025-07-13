"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/app/full-program/styles/docx-upload-form.module.css"
import {Trash2 } from "lucide-react" // Added icons

export default function ExistingSpecialPlansView({ patientId, onClose, onBackToUpload }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/get-plans/${patientId}`)
      // Sort plans by year (desc) and then quarter (desc)
      const sortedPlans = (response.data.plans || []).sort((a, b) => {
        if (b.year !== a.year) {
          return b.year - a.year
        }
        return b.quarterOfYear - a.quarterOfYear
      })
      setPlans(sortedPlans)
    } catch (err) {
      console.error("Error fetching SpecialEducation plans:", err)
      setError("Failed to load existing plans. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleDelete = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      return
    }
    try {
      await axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/delete-plan/${planId}`)
      fetchPlans() // Refresh the list
    } catch (err) {
      console.error("Error deleting SpecialEducation plan:", err)
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
        <h4>
          Existing Special Education Plans
        </h4>
        <button onClick={onBackToUpload} className={styles.backButton}>
          Back to Upload
        </button>
      </div>
      {plans.length === 0 ? (
        <p className={styles.loadingMessage}>No existing Special Education plans found for this patient.</p>
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
