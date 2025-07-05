"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { User, Mail, Phone, MapPin, Calendar, Users, AlertCircle, CheckCircle, Save, X } from "lucide-react"
import styles from "../styles/enhanced-forms.module.css"

const EditUserLayer = () => {
  const router = useRouter()
  const [patient, setPatient] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    disabilityType: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  })
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const patientId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") : null

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true)
    }
  }, [])

  useEffect(() => {
    if (isClient && patientId) {
      const fetchPatient = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${patientId}`)
          const data = response.data
          setPatient(data)
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            disabilityType: data.disabilityType || "",
            address: data.address || "",
            dateOfBirth: data.dateOfBirth || "",
            gender: data.gender || "",
          })
        } catch (error) {
          console.error("Error fetching Student data:", error)
        }
      }
      fetchPatient()
    }
  }, [isClient, patientId])

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim().length < 2 ? "Name must be at least 2 characters" : ""
      case "email":
        return !/\S+@\S+\.\S+/.test(value) ? "Please enter a valid email address" : ""
      case "phone":
        return value && !/^\+?[\d\s-()]+$/.test(value) ? "Please enter a valid phone number" : ""
      default:
        return ""
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Validate field on change if it's been touched
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

    // Validate all fields
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      setLoading(false)
      return
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-patient/${patientId}`,
        formData,
      )
      if (response.status === 200) {
        alert("Student updated successfully")
        router.push("/users-list")
      }
    } catch (error) {
      console.error("Error updating Student:", error)
      alert("Error updating Student")
    } finally {
      setLoading(false)
    }
  }

  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return "error"
    if (touched[fieldName] && formData[fieldName] && !errors[fieldName]) return "success"
    return ""
  }

  if (!patient) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading student data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.formTitle}>Edit Student Profile</h1>
              <p className={styles.formSubtitle}>Update student information and details</p>
            </div>
          </div>

          <div className={styles.formBody}>
            <div className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <User className={styles.infoIcon} />
                <h3 className={styles.infoTitle}>Student Information</h3>
              </div>
              <p className={styles.infoText}>
                Please fill in the required fields marked with an asterisk (*). All information will be kept
                confidential and secure.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formRow}>
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
                        placeholder="Enter full name"
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
                        placeholder="Enter email address"
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
                        placeholder="Enter phone number"
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

                  <div className={styles.formGroup}>
                    <label htmlFor="gender" className={styles.formLabel}>
                      <Users className={styles.labelIcon} />
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className={styles.formSelect}
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="dateOfBirth" className={styles.formLabel}>
                      <Calendar className={styles.labelIcon} />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className={styles.formInput}
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="disabilityType" className={styles.formLabel}>
                      <User className={styles.labelIcon} />
                      Disability Type
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      id="disabilityType"
                      name="disabilityType"
                      value={formData.disabilityType}
                      onChange={handleInputChange}
                      placeholder="Enter disability type"
                    />
                  </div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="address" className={styles.formLabel}>
                    <MapPin className={styles.labelIcon} />
                    Address
                  </label>
                  <textarea
                    className={styles.formTextarea}
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    rows={4}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => router.push("/users-list")}
                  disabled={loading}
                >
                  <X className={styles.buttonIcon} />
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton} disabled={loading}>
                  <Save className={styles.buttonIcon} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditUserLayer
