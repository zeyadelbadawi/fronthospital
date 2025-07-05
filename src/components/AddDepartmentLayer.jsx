"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../helper/axiosSetup";
import { Plus, X } from "lucide-react";
import styles from "../styles/enhanced-forms.module.css";

const AddDepartmentLayer = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim().length < 2 ? "Department name must be at least 2 characters" : "";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/departments/create-department", formData);
      if (response.status === 201) {
        alert("Department added successfully");
        router.push("/department-list");
      }
    } catch (error) {
      console.error("Error adding department:", error);
      alert("Error adding department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.formTitle}>Add New Department</h1>
              <p className={styles.formSubtitle}>Add a new department to the system</p>
            </div>
          </div>

          <div className={styles.formBody}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.formLabel}>
                      Department Name <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputIcon}>
                      <input
                        type="text"
                        className={`${styles.formInput} ${errors.name ? styles.error : ""}`}
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter department name"
                        required
                      />
                    </div>
                    {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="description" className={styles.formLabel}>
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className={styles.formInput}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter department description"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => router.push("/department-list")}
                  disabled={loading}
                >
                  <X className={styles.buttonIcon} />
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton} disabled={loading}>
                  <Plus className={styles.buttonIcon} />
                  {loading ? "Adding..." : "Add Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDepartmentLayer;
