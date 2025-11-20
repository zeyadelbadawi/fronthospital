"use client"

import { useState, useEffect, useCallback, useMemo } from "react" // Import useMemo
import { useRouter } from "next/navigation"
import axios from "axios"
import Select from "react-select"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Users,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Briefcase,
  Calendar,
  Save,
} from "lucide-react"
import styles from "../styles/enhanced-forms.module.css"
import checkboxStyles from "../styles/common-checkbox.module.css" // New CSS module for checkboxes

const GenericUserForm = ({ role, mode, id }) => {
  const router = useRouter()
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [departments, setDepartments] = useState([]) // For doctor role

  const isEditMode = mode === "edit"
  const isDoctor = role === "doctor"
  const isPatient = role === "student" // Using 'student' as the role for patients
  const isAccountant = role === "accountant"

  // Memoize formConfig to prevent re-creation on every render
  const formConfig = useMemo(
    () => ({
      student: {
        add: {
          initial: { name: "", email: "", password: "", phone: "", address: "", gender: "" },
          required: ["name", "email", "password"],
          api: `${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/patient`,
          redirect: "/student/list",
          title: "Add New Student",
          subtitle: "Create a new student profile with complete information",
          infoTitle: "New Student Registration",
          infoText:
            "Please provide accurate information for the new student. Fields marked with an asterisk (*) are required for registration.",
        },
        edit: {
          initial: { name: "", email: "", phone: "", address: "", dateOfBirth: "", gender: "" },
          required: ["name", "email"],
          api: `${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-patient/${id}`,
          fetchApi: `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${id}`,
          redirect: "/student/list",
          title: "Edit Student Profile",
          subtitle: "Update student information and details",
          infoTitle: "Student Information",
          infoText: "Update the student's information. All information will be kept confidential and secure.",
        },
      },
      doctor: {
        add: {
          initial: {
            username: "",
            email: "",
            password: "",
            phone: "",
            departmentIds: [],
          },
          required: ["username", "email", "password", "departmentIds"],
          api: `${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/doctor`,
          redirect: "/doctor/list",
          title: "Add New Doctor",
          subtitle: "Register a new medical professional to the system",
          infoTitle: "Doctor Registration",
          infoText:
            "Please provide accurate professional information for the new doctor. All required fields must be completed for successful registration.",
        },
        edit: {
          initial: {
            username: "",
            email: "",
            phone: "",
            password: "",
            departmentIds: [],
          },
          required: ["username", "email", "departmentIds"],
          api: `${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-doctor/${id}`,
          fetchApi: `${process.env.NEXT_PUBLIC_API_URL}/authentication/doctor/${id}`,
          redirect: "/doctor/list",
          title: "Edit Doctor Profile",
          subtitle: "Update doctor information and professional details",
          infoTitle: "Doctor Information",
          infoText:
            "Update the doctor's professional information. Leave password field empty to keep the current password.",
        },
      },
      accountant: {
        add: {
          initial: { name: "", email: "", password: "" },
          required: ["name", "email", "password"],
          api: `${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/accountant`,
          redirect: "/accountant/list",
          title: "Add New Accountant",
          subtitle: "Register a new accounting professional to the system",
          infoTitle: "Accountant Registration",
          infoText:
            "Please provide accurate information for the new accountant. All fields are required for successful registration.",
        },
        edit: {
          initial: { name: "", email: "", password: "" },
          required: ["name", "email"],
          api: `${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-accountant/${id}`,
          fetchApi: `${process.env.NEXT_PUBLIC_API_URL}/authentication/accountant/${id}`,
          redirect: "/accountant/list",
          title: "Edit Accountant Profile",
          subtitle: "Update accountant information and access details",
          infoTitle: "Accountant Information",
          infoText: "Update the accountant's information. Leave password field empty to keep the current password.",
        },
      },
    }),
    [id],
  ) // id is a dependency for formConfig

  const currentConfig = formConfig[role]?.[mode]

  // Effect to initialize formData when currentConfig changes (i.e., role/mode/id changes)
  useEffect(() => {
    if (currentConfig) {
      setFormData(currentConfig.initial)
      setErrors({}) // Clear errors on config change
      setTouched({}) // Clear touched state on config change
    }
  }, [currentConfig]) // Only re-run when currentConfig object reference changes

  // Effect to fetch data for edit mode
  useEffect(() => {
    if (isEditMode && id && currentConfig?.fetchApi) {
      const fetchData = async () => {
        setLoading(true)
        try {
          const response = await axios.get(currentConfig.fetchApi)
          const data = response.data

          const initialEditData = { ...currentConfig.initial }

          // Populate form data, handling nested objects like departments
          Object.keys(initialEditData).forEach((key) => {
            if (key === "departmentIds" && data.departments) {
              initialEditData[key] = data.departments.map((dep) => dep._id)
            } else if (key === "password") {
              initialEditData[key] = "" // Password field is always empty on edit load
            } else if (key === "dateOfBirth" && data[key]) {
              initialEditData[key] = new Date(data[key]).toISOString().split("T")[0]
            } else if (key === "gender" && data[key]) {
              initialEditData[key] = data[key].toLowerCase()
            } else if (data[key] !== undefined) {
              initialEditData[key] = data[key]
            }
          })

          setFormData(initialEditData)
        } catch (error) {
          console.error(`Error fetching ${role} data:`, error)
          alert(`Error fetching ${role} data.`)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [isEditMode, id, currentConfig, role]) // Dependencies for fetching data

  // Effect to fetch departments for doctor role
  useEffect(() => {
    if (isDoctor) {
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
    }
  }, [isDoctor]) // Only re-run when isDoctor changes

  const validateField = useCallback(
    (name, value) => {
      switch (name) {
        case "name":
        case "username":
          return value.trim().length < 2
            ? `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least 2 characters`
            : ""
        case "email":
          return !/\S+@\S+\.\S+/.test(value) ? "Please enter a valid email address" : ""
        case "password":
          // Only validate password if it's provided (for edit) or required (for add)
          if (isEditMode && !value) return "" // Optional in edit mode
          return value.length < 6 ? "Password must be at least 6 characters" : ""
        case "phone":
          return value && !/^\+?[\d\s-()]+$/.test(value) ? "Please enter a valid phone number" : ""
        case "departmentIds":
          return Array.isArray(value) && value.length === 0 ? "At least one department is required" : ""
        default:
          return ""
      }
    },
    [isEditMode],
  )

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
    const fieldsToValidate = isEditMode ? Object.keys(formData) : currentConfig.required

    fieldsToValidate.forEach((key) => {
      const value = formData[key]
      if (currentConfig.required.includes(key)) {
        if (key === "departmentIds") {
          if (!Array.isArray(value) || value.length === 0) {
            newErrors[key] = "At least one department is required"
          } else {
            const error = validateField(key, value)
            if (error) newErrors[key] = error
          }
        } else if (key === "password" && isEditMode && !value) {
          // Password is optional in edit mode if left empty
        } else if (!value || (typeof value === "string" && value.trim() === "")) {
          newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`
        } else {
          const error = validateField(key, value)
          if (error) newErrors[key] = error
        }
      } else if (value) {
        // Validate optional fields if they have a value
        const error = validateField(key, value)
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
      const payload = { ...formData }
      if (isEditMode && !payload.password) {
        delete payload.password // Don't send empty password on edit
      }

      let response
      if (isEditMode) {
        response = await axios.put(currentConfig.api, payload)
      } else {
        response = await axios.post(currentConfig.api, payload)
      }

      if (response.status === 201 || response.status === 200) {
        alert(`${role.charAt(0).toUpperCase() + role.slice(1)} ${isEditMode ? "updated" : "added"} successfully`)
        router.push(currentConfig.redirect)
      }
    } catch (error) {
      console.error(`Error during ${role} ${mode}:`, error)
      alert(`Error during ${mode}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return "error"
    const value = formData[fieldName]
    if (touched[fieldName] && value && !errors[fieldName]) {
      if (Array.isArray(value)) {
        return value.length > 0 ? "success" : ""
      }
      return typeof value === "string" && value.trim() ? "success" : ""
    }
    return ""
  }

  const getProgress = () => {
    if (!currentConfig) return 0 // Handle case where config is not yet loaded
    const totalFields = Object.keys(currentConfig.initial).length
    const filledFields = Object.keys(formData).filter((key) => {
      const value = formData[key]
      if (key === "password" && isEditMode && !value) return true // Count empty password as filled in edit mode
      if (Array.isArray(value)) return value.length > 0
      return typeof value === "string" && value.trim().length > 0
    }).length
    return Math.round((filledFields / totalFields) * 100)
  }

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ]

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: `2px solid ${errors.gender ? "#dc2626" : state.isFocused ? "#3f3f87" : "#e2e8f0"}`,
      borderRadius: "0.75rem",
      padding: "0.5rem 0.75rem",
      backgroundColor: "white",
      backdropFilter: "blur(10px)",
      boxShadow: state.isFocused
        ? "0 0 0 4px rgba(63, 63, 135, 0.1), 0 4px 12px rgba(63, 63, 135, 0.15)"
        : "0 1px 3px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: state.isFocused ? "translateY(-1px)" : "translateY(0)",
      "&:hover": {
        borderColor: errors.gender ? "#dc2626" : "#d1d5db",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.75rem",
      border: "1px solid rgba(63, 63, 135, 0.2)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      zIndex: 9999,
      overflow: "hidden",
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "0.5rem",
      maxHeight: "200px",
    }),
    option: (provided, state) => ({
      ...provided,
      borderRadius: "8px",
      margin: "0.25rem 0",
      padding: "0.75rem 1rem",
      background: state.isSelected
        ? "linear-gradient(135deg, #3f3f87 0%, #2977ba 100%)"
        : state.isFocused
          ? "rgba(63, 63, 135, 0.1)"
          : "transparent",
      color: state.isSelected ? "white" : "#374151",
      cursor: "pointer",
      transition: "all 0.2s ease",
      fontWeight: state.isSelected ? "600" : "500",
      "&:hover": {
        background: state.isSelected ? "linear-gradient(135deg, #3f3f87 0%, #2977ba 100%)" : "rgba(63, 63, 135, 0.15)",
        transform: "translateX(4px)",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#374151",
      fontWeight: "500",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#94a3b8",
    }),
  }

  if (isEditMode && loading && !Object.keys(formData).length) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading {role} data...</p>
        </div>
      </div>
    )
  }

  if (!currentConfig) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Invalid configuration for this page.</p>
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
              <h1 className={styles.formTitle}>{currentConfig.title}</h1>
              <p className={styles.formSubtitle}>{currentConfig.subtitle}</p>
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
                <h3 className={styles.infoTitle}>{currentConfig.infoTitle}</h3>
              </div>
              <p className={styles.infoText}>{currentConfig.infoText}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                {/* Username/Name Field */}
                {(isDoctor || isAccountant || isPatient) && (
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor={isDoctor || isAccountant ? "username" : "name"} className={styles.formLabel}>
                        <User className={styles.labelIcon} />
                        {isDoctor || isAccountant ? "Username" : "Full Name"}{" "}
                        {currentConfig.required.includes(isDoctor || isAccountant ? "username" : "name") && (
                          <span className={styles.required}>*</span>
                        )}
                      </label>
                      <div className={styles.inputIcon}>
                        <input
                          type="text"
                          className={`${styles.formInput} ${styles[getFieldStatus(isDoctor || isAccountant ? "username" : "name")]}`}
                          id={isDoctor || isAccountant ? "username" : "name"}
                          name={isDoctor || isAccountant ? "username" : "name"}
                          value={formData[isDoctor || isAccountant ? "username" : "name"] || ""}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder={`Enter ${role}'s ${isDoctor || isAccountant ? "username" : "full name"}`}
                          required={currentConfig.required.includes(isDoctor || isAccountant ? "username" : "name")}
                        />
                        <User className={styles.inputIconElement} />
                      </div>
                      {errors[isDoctor || isAccountant ? "username" : "name"] && (
                        <div className={styles.errorMessage}>
                          <AlertCircle className={styles.errorIcon} />
                          {errors[isDoctor || isAccountant ? "username" : "name"]}
                        </div>
                      )}
                      {getFieldStatus(isDoctor || isAccountant ? "username" : "name") === "success" && (
                        <div className={styles.successMessage}>
                          <CheckCircle className={styles.successIcon} />
                          Looks good!
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>
                        <Mail className={styles.labelIcon} />
                        Email Address{" "}
                        {currentConfig.required.includes("email") && <span className={styles.required}>*</span>}
                      </label>
                      <div className={styles.inputIcon}>
                        <input
                          type="email"
                          className={`${styles.formInput} ${styles[getFieldStatus("email")]}`}
                          id="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="Enter email address"
                          required={currentConfig.required.includes("email")}
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
                )}

                {/* Password & Phone Field (or other fields for patient/doctor) */}
                <div className={styles.formRow}>
                  {/* Password Field */}
                  <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.formLabel}>
                      <Lock className={styles.labelIcon} />
                      {isEditMode ? "New Password" : "Password"}{" "}
                      {currentConfig.required.includes("password") && <span className={styles.required}>*</span>}
                    </label>
                    <div className={styles.inputIcon}>
                      <input
                        type="password"
                        className={`${styles.formInput} ${styles[getFieldStatus("password")]}`}
                        id="password"
                        name="password"
                        value={formData.password || ""}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder={isEditMode ? "Leave empty to keep current password" : "Enter secure password"}
                        required={currentConfig.required.includes("password") && !isEditMode}
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

                  {/* Phone Field (for patient and doctor) */}
                  {(isPatient || isDoctor) && (
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
                          value={formData.phone || ""}
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
                  )}
                </div>

                {/* Patient Specific Fields */}
                {isPatient && (
                  <>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="gender" className={styles.formLabel}>
                          <Users className={styles.labelIcon} />
                          Gender
                        </label>
                        <Select
                          options={genderOptions}
                          value={genderOptions.find((opt) => opt.value === formData.gender)}
                          onChange={(selectedOption) =>
                            handleInputChange({
                              target: {
                                name: "gender",
                                value: selectedOption?.value || "",
                              },
                            })
                          }
                          styles={customSelectStyles}
                          placeholder="Select Gender"
                          isClearable
                          isSearchable={false}
                        />
                        {errors.gender && (
                          <div className={styles.errorMessage}>
                            <AlertCircle className={styles.errorIcon} />
                            {errors.gender}
                          </div>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="dateOfBirth" className={styles.formLabel}>
                          <Calendar className={styles.labelIcon} />
                          Date of Birth
                        </label>
                        <div className={styles.inputIcon}>
                          <input
                            type="date"
                            className={`${styles.formInput} ${styles[getFieldStatus("dateOfBirth")]}`}
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth || ""}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            max={new Date().toISOString().split("T")[0]}
                          />
                          <Calendar className={styles.inputIconElement} />
                        </div>
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
                        value={formData.address || ""}
                        onChange={handleInputChange}
                        placeholder="Enter complete address (optional)"
                        rows={4}
                      />
                    </div>
                  </>
                )}

                {/* Doctor Specific Fields */}
                {isDoctor && (
                  <>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                        <label className={styles.formLabel}>
                          <Briefcase className={styles.labelIcon} />
                          Departments{" "}
                          {currentConfig.required.includes("departmentIds") && (
                            <span className={styles.required}>*</span>
                          )}
                        </label>
                        <div className={checkboxStyles.simpleCheckboxGroup}>
                          {departments.map((department) => (
                            <label
                              key={department._id}
                              className={`${checkboxStyles.simpleCheckboxItem} ${formData.departmentIds?.includes(department._id) ? checkboxStyles.selected : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.departmentIds?.includes(department._id) || false}
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
                            {formData.departmentIds?.length || 0} department(s) selected
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => router.push(currentConfig.redirect)}
                  disabled={loading}
                >
                  <X className={styles.buttonIcon} />
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton} disabled={loading}>
                  {isEditMode ? <Save className={styles.buttonIcon} /> : <Plus className={styles.buttonIcon} />}
                  {loading
                    ? isEditMode
                      ? "Saving..."
                      : "Adding..."
                    : isEditMode
                      ? "Save Changes"
                      : `Add ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenericUserForm
