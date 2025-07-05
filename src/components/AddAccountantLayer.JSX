"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { User, Mail, Lock, AlertCircle, CheckCircle, Plus, X } from 'lucide-react'
import styles from "../styles/enhanced-forms.module.css"

const AddAccountantLayer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const router = useRouter()

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim().length < 2 ? "Name must be at least 2 characters" : ""
      case "email":
        return !/\S+@\S+\.\S+/.test(value) ? "Please enter a valid email address" : ""
      case "password":
        return value.length < 6 ? "Password must be at least 6 characters" : ""
      default:
        return ""
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`
      } else {
        const error = validateField(key, formData[key])
        if (error) newErrors[key] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/accountant`, formData)
      if (response.status === 201) {
        alert("Accountant added successfully")
        router.push("/accountant-list")
      }
    } catch (error) {
      console.error("Error during accountant registration:", error)
      alert("Error during registration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return "error"
    if (touched[fieldName] && formData[fieldName] && !errors[fieldName]) return "success"
    return ""
  }

  const getProgress = () => {
    const filledFields = Object.keys(formData).filter((key) => formData[key].trim()).length
    return Math.round((filledFields / Object.keys(formData).length) * 100)
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.formTitle}>Add New Accountant</h1>
              <p className={styles.formSubtitle}>Register a new accounting professional to the system</p>
            </div>
          </div>

          <div className={styles.formBody}>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${getProgress()}%` }}></div>
              </div>
              <div className={styles.progressText}>Form completion: {getProgress()}%</div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <Plus className={styles.infoIcon} />
                <h3 className={styles.infoTitle}>Accountant Registration</h3>
              </div>
              <p className={styles.infoText}>
                Please provide accurate information for the new accountant. All fields are required for successful
                registration.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    <User className={styles.labelIcon} />
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputIcon}>
                    <input
                      type="text"
                      className={`${styles.formInput} ${styles[getFieldStatus("name")]}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter accountant's full name"
                      required
                    />
                    <User className={styles.inputIconElement} />
                  </div>
                  {errors.name && (
                    <div className={styles.errorMessage}>
                      <AlertCircle className={styles.errorIcon} />
                      {errors.name}
                    </div>
                  )}
                  {getFieldStatus("name") === "success" && (
                    <div className={styles.successMessage}>
                      <CheckCircle className={styles.successIcon} />
                      Looks good!
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    <Mail className={styles.labelIcon} />
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputIcon}>
                    <input
                      type="email"
                      className={`${styles.formInput} ${styles[getFieldStatus("email")]}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter professional email address"
                      required
                    />
                    <Mail className={styles.inputIconElement} />
                  </div>
                  {errors.email && (
                    <div className={styles.errorMessage}>
                      <AlertCircle className={styles.errorIcon} />
                      {errors.email}
                    </div>
                  )}
                  {getFieldStatus("email") === "success" && (
                    <div className={styles.successMessage}>
                      <CheckCircle className={styles.successIcon} />
                      Valid email address
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.formLabel}>
                    <Lock className={styles.labelIcon} />
                    Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputIcon}>
                    <input
                      type="password"
                      className={`${styles.formInput} ${styles[getFieldStatus("password")]}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter secure password"
                      required
                    />
                    <Lock className={styles.inputIconElement} />
                  </div>
                  {errors.password && (
                    <div className={styles.errorMessage}>
                      <AlertCircle className={styles.errorIcon} />
                      {errors.password}
                    </div>
                  )}
                  {getFieldStatus("password") === "success" && (
                    <div className={styles.successMessage}>
                      <CheckCircle className={styles.successIcon} />
                      Strong password
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => router.push("/accountant-list")}
                  disabled={loading}
                >
                  <X className={styles.buttonIcon} />
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton} disabled={loading}>
                  <Plus className={styles.buttonIcon} />
                  {loading ? "Adding..." : "Add Accountant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddAccountantLayer
