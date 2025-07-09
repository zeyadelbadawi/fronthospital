"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import styles from "../styles/docx-upload-form.module.css";
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
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "File is required")
    .refine(
      (file) =>
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Only DOCX files are allowed"
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB"
    ),
});

export default function DocxUploadForm({ onSuccess, defaultValues = {} }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: defaultValues.doctorId || "",
      departmentId: defaultValues.departmentId || "",
      quarterOfYear: "",
      year: new Date().getFullYear().toString(),
      file: undefined,
    },
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    setUploadedFile(file);
    setValue("file", file);
    trigger("file");
  };

  const removeFile = () => {
    setUploadedFile(null);
    setValue("file", undefined);
    trigger("file");
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/doctorFile/upload-plan/`,
        {
          doctorId: data.doctorId,
          departmentId: data.departmentId,
          quarterOfYear: data.quarterOfYear,
          year: data.year,
          document: data.file,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      /* console.log("Form submitted:", {
        doctorId: data.doctorId,
        departmentId: data.departmentId,
        quarterOfYear: data.quarterOfYear,
        year: data.year,
        fileName: data.file.name,
        fileSize: data.file.size,
      }); */

      if (response.status !== 200) {
        throw new Error("Failed to upload document");
      } else {
        console.log("Upload successful:", response?.data);

        // Reset form after successful submission
        reset();
        setUploadedFile(null);

        // Call success callback
        if (onSuccess) {
          onSuccess(data);
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const dropZoneClasses = `${styles.customDropZone} ${
    dragActive ? styles.dragActive : ""
  }`;

  return (
    <div className={styles.modalUploadForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* File Upload Section */}
        <div className="mb-4">
          <label className="form-label fw-bold">Document File</label>

          {!uploadedFile ? (
            <div
              className={dropZoneClasses}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <i
                className={`bi bi-cloud-upload ${styles.customUploadIcon} mb-3`}
              ></i>
              <div>
                <p className={`${styles.customUploadText} mb-2`}>
                  Drop your DOCX file here, or click to browse
                </p>
                <p className={styles.customUploadSubtext}>
                  Maximum file size: 10MB
                </p>
              </div>
              <input
                id="file-input"
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="d-none"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          ) : (
            <div className={`${styles.customFilePreview} p-3 border rounded`}>
              <div className="d-flex align-items-center">
                <i
                  className={`bi bi-file-earmark-word ${styles.customFileIcon} me-3`}
                ></i>
                <div>
                  <p className="fw-medium mb-0">{uploadedFile.name}</p>
                  <p className="text-muted small mb-0">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-outline-danger btn-sm ${styles.customRemoveBtn}`}
                onClick={removeFile}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          )}

          <div className="form-text">
            Upload a DOCX document (Microsoft Word format only)
          </div>
          {errors.file && (
            <div className="text-danger small mt-1">{errors.file.message}</div>
          )}
        </div>

        {/* Form Fields */}
        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <label className="form-label">Doctor ID</label>
            <Controller
              name="doctorId"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`form-control ${
                    errors.doctorId ? "is-invalid" : ""
                  }`}
                  placeholder="Enter doctor ID"
                />
              )}
            />
            {errors.doctorId && (
              <div className="invalid-feedback">{errors.doctorId.message}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Department ID</label>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`form-control ${
                    errors.departmentId ? "is-invalid" : ""
                  }`}
                  placeholder="Enter department ID"
                />
              )}
            />
            {errors.departmentId && (
              <div className="invalid-feedback">
                {errors.departmentId.message}
              </div>
            )}
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <label className="form-label">Quarter of Year</label>
            <Controller
              name="quarterOfYear"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`form-select ${
                    errors.quarterOfYear ? "is-invalid" : ""
                  }`}
                >
                  <option value="">Select quarter</option>
                  <option value="1">Q1 (Jan-Mar)</option>
                  <option value="2">Q2 (Apr-Jun)</option>
                  <option value="3">Q3 (Jul-Sep)</option>
                  <option value="4">Q4 (Oct-Dec)</option>
                </select>
              )}
            />
            {errors.quarterOfYear && (
              <div className="invalid-feedback">
                {errors.quarterOfYear.message}
              </div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Year</label>
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`form-select ${errors.year ? "is-invalid" : ""}`}
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
              <div className="invalid-feedback">{errors.year.message}</div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className={`btn ${styles.customSubmitBtn} w-100 py-3`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Uploading...
            </>
          ) : (
            "Upload Document"
          )}
        </button>
      </form>
    </div>
  );
}