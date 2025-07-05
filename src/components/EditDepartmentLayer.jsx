"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../helper/axiosSetup";
import { Save, X } from "lucide-react";
import styles from "../styles/enhanced-forms.module.css";

const EditDepartmentLayer = () => {
  const [department, setDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDepartment = async () => {
      const params = new URLSearchParams(window.location.search);
      const departmentId = params.get("id");
      try {
        const response = await axiosInstance.get(`/departments/department/${departmentId}`);
        const data = response.data;
        setDepartment(data);
        setFormData({
          name: data.name || "",
          description: data.description || "",
        });
      } catch (error) {
        console.error("Error fetching department data:", error);
      }
    };
    fetchDepartment();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.put(`/departments/edit-department/${department._id}`, formData);
      if (response.status === 200) {
        alert("Department updated successfully");
        router.push("/department-list");
      }
    } catch (error) {
      console.error("Error updating department:", error);
      alert("Error updating department");
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
              <h1 className={styles.formTitle}>Edit Department</h1>
              <p className={styles.formSubtitle}>Update department details</p>
            </div>
          </div>

          <div className={styles.formBody}>
            {department && (
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
                          className={styles.formInput}
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter department name"
                          required
                        />
                      </div>
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
                    <Save className={styles.buttonIcon} />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDepartmentLayer;
