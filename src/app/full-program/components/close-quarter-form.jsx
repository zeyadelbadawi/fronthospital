"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import styles from "../styles/close-quarter-form.module.css";
import axiosInstance from "@/helper/axiosSetup";

// Form validation schema
const formSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
  quarterOfYear: z.string().min(1, "Quarter is required"),
  year: z
    .string()
    .min(1, "Year is required")
    .refine((val) => {
      const year = Number.parseInt(val);
      const currentYear = new Date().getFullYear();
      return year >= 2000 && year <= currentYear;
    }, `Year must be between 2000 and ${new Date().getFullYear()}`),
});

export default function CloseQuarterForm({
  onSuccess,
  onClose,
  defaultValues = {},
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: defaultValues.doctorId || "",
      departmentId: defaultValues.departmentId || "",
      quarterOfYear: defaultValues.quarterOfYear.toString() || "",
      year:
        defaultValues.year.toString() || new Date().getFullYear().toString(),
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add form fields
      formData.append("doctorId", data.doctorId);
      formData.append("departmentId", data.departmentId);
      formData.append("quarterOfYear", data.quarterOfYear);
      formData.append("year", data.year);

      // Fetch the default .docx file
      const fileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads/defoult.docx`);
      const blob = await fileResponse.blob();

      // Append it to formData
      formData.append("document", blob, "default-template.docx");

      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/doctorFile/upload-plan`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status !== 200) throw new Error("Failed to close quarter");

      if (onSuccess) onSuccess(data);
    } catch (error) {
      console.error("Close quarter failed:", error);
      alert("Failed to close quarter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/doctorFile/upload-plan`,
        {
          doctorId: data.doctorId,
          departmentId: data.departmentId,
          quarterOfYear: data.quarterOfYear,
          year: data.year,
          defaultDocument: true, // Always generate default document
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (response.status !== 200) {
        throw new Error("Failed to close quarter")
      } else {
        console.log("Quarter closed successfully:", response?.data)

        // Call success callback
        if (onSuccess) {
          onSuccess(data)
        }
      }
    } catch (error) {
      console.error("Close quarter failed:", error)
      alert("Failed to close quarter. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  } */

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const getCurrentQuarter = () => {
    const month = new Date().getMonth() + 1;
    if (month <= 3) return "1";
    if (month <= 6) return "2";
    if (month <= 9) return "3";
    return "4";
  };

  return (
    <div className={styles.closeQuarterForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form Header 
        <div className={styles.formHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <i className={`bi bi-calendar-x ${styles.titleIcon}`}></i>
              <h4 className={styles.formTitle}>Close Quarter</h4>
            </div>
            <button type="button" className={styles.closeButton} onClick={onClose}>
              <i className={`bi bi-x ${styles.closeIcon}`}></i>
            </button>
          </div>
          <p className={styles.formDescription}>Generate a comprehensive document for the selected quarter period</p>
          <hr className={styles.headerDivider} />
        </div>*/}

        {/* Quarter Selection Section - Simple Info Display */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>Quarter Selection</label>

          <div className={styles.quarterInfoBox}>
            <i className={`bi bi-calendar-check ${styles.quarterIcon}`}></i>
            <div className={styles.quarterInfoContent}>
              <p className={styles.quarterInfoTitle}>
                Select Quarter and Year to Close
              </p>
              <p className={styles.quarterInfoSubtitle}>
                Current Quarter: Q{defaultValues.quarterOfYear} (
                {defaultValues.year})
              </p>
            </div>
          </div>

          <div className={styles.formText}>
            Select the quarter and year you want to close and generate document
            for
          </div>
        </div>

        {/* Form Fields */}
        <div className={styles.formRow}>
          <div className="row">
            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Doctor ID</label>
                <Controller
                  name="doctorId"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`${styles.formInput} form-control ${
                        errors.doctorId ? styles.invalid : ""
                      }`}
                      placeholder="Enter doctor ID"
                      readOnly={!!defaultValues.doctorId}
                      style={{
                        backgroundColor: defaultValues.doctorId
                          ? "#f8f9fa"
                          : "white",
                      }}
                    />
                  )}
                />
                {errors.doctorId && (
                  <div className={styles.errorMessage}>
                    {errors.doctorId.message}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Department ID</label>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`${styles.formInput} form-control ${
                        errors.departmentId ? styles.invalid : ""
                      }`}
                      placeholder="Enter department ID"
                      readOnly={!!defaultValues.departmentId}
                      style={{
                        backgroundColor: defaultValues.departmentId
                          ? "#f8f9fa"
                          : "white",
                      }}
                    />
                  )}
                />
                {errors.departmentId && (
                  <div className={styles.errorMessage}>
                    {errors.departmentId.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className="row">
            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Quarter of Year</label>
                <Controller
                  name="quarterOfYear"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`${styles.formSelect} form-select ${
                        errors.quarterOfYear ? styles.invalid : ""
                      }`}
                    >
                      <option value="">Select quarter to close</option>
                      <option value="1">Q1 (Jan-Mar)</option>
                      <option value="2">Q2 (Apr-Jun)</option>
                      <option value="3">Q3 (Jul-Sep)</option>
                      <option value="4">Q4 (Oct-Dec)</option>
                    </select>
                  )}
                />
                {errors.quarterOfYear && (
                  <div className={styles.errorMessage}>
                    {errors.quarterOfYear.message}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className={styles.formColumn}>
                <label className={styles.formLabel}>Year</label>
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`${styles.formSelect} form-select ${
                        errors.year ? styles.invalid : ""
                      }`}
                    >
                      <option value="">Select year</option>
                      {years.map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.year && (
                  <div className={styles.errorMessage}>
                    {errors.year.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Notice - Styled like form text */}
        <div className={styles.formRow}>
          <div className={styles.warningNotice}>
            <i
              className={`bi bi-exclamation-triangle-fill ${styles.warningIcon}`}
            ></i>
            <div className={styles.warningContent}>
              <strong>Important:</strong> Closing a quarter will generate a
              default DOCX document with all activities for the selected period.
              This action cannot be undone.
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`${styles.submitButton} ${isSubmitting ? "loading" : ""}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Closing Quarter...
            </>
          ) : (
            "Close Quarter & Generate Document"
          )}
        </button>
      </form>
    </div>
  );
}