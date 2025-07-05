"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { User, Mail, Phone, Lock, Briefcase, AlertCircle, CheckCircle, Plus, X } from "lucide-react"
import styles from "../styles/enhanced-forms.module.css"

const AddDoctorLayer = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    title: "",
    availability: "Available",
    departmentIds: [], // Store multiple department IDs
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [departments, setDepartments] = useState([]) // Store departments
  const router = useRouter()

  useEffect(() => {
    // Fetch departments from the backend when the component loads
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/departments`)
        setDepartments(response.data.departments)
      } catch (error) {
        console.error("Error fetching departments:", error)
        alert("Error fetching departments. Please try again.")
      }
    }

    fetchDepartments()
  }, [])

  const validateField = (name, value) => {
    switch (name) {
      case "username":
        return value.trim().length < 2 ? "Username must be at least 2 characters" : ""
      case "email":
        return !/\S+@\S+\.\S+/.test(value) ? "Please enter a valid email address" : ""
      case "password":
        return value.length < 6 ? "Password must be at least 6 characters" : ""
      case "phone":
        return value && !/^\+?[\d\s-()]+$/.test(value) ? "Please enter a valid phone number" : ""
      case "departmentIds":
        return Array.isArray(value) && value.length === 0 ? "At least one department is required" : ""
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

  const handleDepartmentChange = (departmentId) => {
    const updatedDepartments = formData.departmentIds.includes(departmentId)
      ? formData.departmentIds.filter((id) => id !== departmentId)
      : [...formData.departmentIds, departmentId]

    setFormData((prev) => ({ ...prev, departmentIds: updatedDepartments }))

    // Validate immediately
    const error = validateField("departmentIds", updatedDepartments)
    setErrors((prev) => ({ ...prev, departmentIds: error }))
    setTouched((prev) => ({ ...prev, departmentIds: true }))
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
    const requiredFields = ["username", "email", "password", "departmentIds"]

    // Validate required fields
    requiredFields.forEach((key) => {
      const value = formData[key]

      // Handle array fields (like departmentIds) differently from string fields
      if (key === "departmentIds") {
        if (!Array.isArray(value) || value.length === 0) {
          newErrors[key] = "At least one department is required"
        } else {
          const error = validateField(key, value)
          if (error) newErrors[key] = error
        }
      } else {
        // Handle string fields
        if (!value || (typeof value === "string" && value.trim() === "")) {
          newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`
        } else {
          const error = validateField(key, value)
          if (error) newErrors[key] = error
        }
      }
    })

    // Validate optional fields
    Object.keys(formData).forEach((key) => {
      if (!requiredFields.includes(key) && formData[key]) {
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/doctor`, formData)
      if (response.status === 201) {
        alert("Doctor added successfully")
        router.push("/doctor-list")
      }
    } catch (error) {
      console.error("Error during doctor registration:", error)
      alert("Error during registration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return "error"

    const value = formData[fieldName]
    if (touched[fieldName] && value && !errors[fieldName]) {
      // For arrays, check if they have items
      if (Array.isArray(value)) {
        return value.length > 0 ? "success" : ""
      }
      // For strings, check if they're not empty
      return typeof value === "string" && value.trim() ? "success" : ""
    }
    return ""
  }

  const getProgress = () => {
    const totalFields = Object.keys(formData).filter((key) => {
      const value = formData[key]
      if (Array.isArray(value)) {
        // For arrays (like departmentIds), just check if it's not empty
        return value.length > 0
      } else if (typeof value === "string") {
        // For strings, trim and check if it's not empty
        return value.trim().length > 0
      } else {
        // For other types (like numbers), just check if it's not empty
        return value != null && value !== ""
      }
    }).length
    return Math.round((totalFields / Object.keys(formData).length) * 100)
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.formTitle}>Add New Doctor</h1>
              <p className={styles.formSubtitle}>Register a new medical professional to the system</p>
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
                <h3 className={styles.infoTitle}>Doctor Registration</h3>
              </div>
              <p className={styles.infoText}>
                Please provide accurate professional information for the new doctor. All required fields must be
                completed for successful registration.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="username" className={styles.formLabel}>
                      <User className={styles.labelIcon} />
                      Username <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputIcon}>
                      <input
                        type="text"
                        className={`${styles.formInput} ${styles[getFieldStatus("username")]}`}
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Enter doctor's username"
                        required
                      />
                      <User className={styles.inputIconElement} />
                    </div>
                    {errors.username && (
                      <div className={styles.errorMessage}>
                        <AlertCircle className={styles.errorIcon} />
                        {errors.username}
                      </div>
                    )}
                    {getFieldStatus("username") === "success" && (
                      <div className={styles.successMessage}>
                        <CheckCircle className={styles.successIcon} />
                        Username available!
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
                        placeholder="Enter professional email"
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
                </div>

                <div className={styles.formRow}>
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

                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.formLabel}>
                      <Phone className={styles.labelIcon} />
                      Phone Number
                    </label>
                    <div className={styles.inputIcon}>
                      <input
                        type="tel"
                        className={`${styles.formInput} ${styles[getFieldStatus("phone")]}`}
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Enter contact number"
                      />
                      <Phone className={styles.inputIconElement} />
                    </div>
                    {errors.phone && (
                      <div className={styles.errorMessage}>
                        <AlertCircle className={styles.errorIcon} />
                        {errors.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Simple Department Selection */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.formLabel}>
                      <Briefcase className={styles.labelIcon} />
                      Departments <span className={styles.required}>*</span>
                    </label>
                    <div className="simple-checkbox-group">
                      {departments.map((department) => (
                        <label
                          key={department._id}
                          className={`simple-checkbox-item ${formData.departmentIds.includes(department._id) ? "selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.departmentIds.includes(department._id)}
                            onChange={() => handleDepartmentChange(department._id)}
                          />
                          <span>{department.name}</span>
                        </label>
                      ))}
                    </div>
                    {errors.departmentIds && (
                      <div className={styles.errorMessage}>
                        <AlertCircle className={styles.errorIcon} />
                        {errors.departmentIds}
                      </div>
                    )}
                    {getFieldStatus("departmentIds") === "success" && (
                      <div className={styles.successMessage}>
                        <CheckCircle className={styles.successIcon} />
                        {formData.departmentIds.length} department(s) selected
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => router.push("/doctor-list")}
                  disabled={loading}
                >
                  <X className={styles.buttonIcon} />
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton} disabled={loading}>
                  <Plus className={styles.buttonIcon} />
                  {loading ? "Adding..." : "Add Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .simple-checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: #ffffff;
          max-height: 200px;
          overflow-y: auto;
        }

        .simple-checkbox-item {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .simple-checkbox-item:hover {
          background-color: #f8fafc;
        }

        .simple-checkbox-item.selected {
          background-color: #eff6ff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
        }

        .simple-checkbox-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .simple-checkbox-item span {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .simple-checkbox-item.selected span {
          color: #1d4ed8;
          font-weight: 600;
        }

        .simple-checkbox-group::-webkit-scrollbar {
          width: 6px;
        }

        .simple-checkbox-group::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .simple-checkbox-group::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
      `}</style>
    </div>
  )
}

export default AddDoctorLayer
