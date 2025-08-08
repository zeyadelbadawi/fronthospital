"use client"; 

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { UserPlus, User, Link, CloudUpload, CheckCircle, AlertCircle, Info } from 'lucide-react'; // Lucide React icons
import styles from "../styles/student-form.module.css"; // Import the new CSS module

// Validation schema 
const schema = yup.object().shape({
  studentId: yup.string().required("Please select a student"),
  note: yup
    .string()
    .required("Note is required")
    .url("Note must be a valid URL")
    .test("is-google-drive", "Note must be a Google Drive link", (value) => {
      if (!value) return false;
      
      // check google drive url validation 
      const googleDrivePatterns = [
        /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/,
        /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/,
        /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9_-]+/,
        /^https:\/\/docs\.google\.com\/presentation\/d\/[a-zA-Z0-9_-]+/,
        /^https:\/\/drive\.google\.com\/open\?id=[a-zA-Z0-9_-]+/,
        /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/
      ];
      
      return googleDrivePatterns.some(pattern => pattern.test(value));
    }),
});

const StudentForm = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDriveLink, setExistingDriveLink] = useState(null); // New state for existing link
  const [fetchLinkLoading, setFetchLinkLoading] = useState(false); // New state for fetching link

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue, // To set form values programmatically
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const selectedStudentId = watch("studentId"); // Watch for changes in selected student
  const noteValue = watch("note");
  const isNoteValid = noteValue && !errors.note && noteValue.trim() !== "";

  // Fetch all students on component mount
  useEffect(() => {
  const fetchStudents = async () => {
    try {
      setIsLoading(true);

      let allStudents = [];
      let page = 1;
      let totalPages = 1; // will be updated after first call

      do {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/authentication/patients`,
          {
            params: {
              page,
              limit: 10, // backend default, can adjust if needed
              search: "" // or pass a search term if you have one
            }
          }
        );

        allStudents = [...allStudents, ...res.data.patients];
        totalPages = res.data.totalPages;
        page++;
      } while (page <= totalPages);

      setStudents(allStudents);
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchStudents();
}, []);

  // Fetch existing drive link when a student is selected
  useEffect(() => {
    const fetchPatientDriveLink = async () => {
      if (selectedStudentId) {
        setFetchLinkLoading(true);
        setExistingDriveLink(null); // Clear previous link
        setValue("note", ""); // Clear note input when student changes
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${selectedStudentId}`);
          if (res.data && res.data.driveLink) {
            setExistingDriveLink(res.data.driveLink);
            setValue("note", res.data.driveLink, { shouldValidate: true }); // Pre-fill and validate
          }
        } catch (err) {
          console.error("Error fetching Student drive link:", err);
          setExistingDriveLink(null);
        } finally {
          setFetchLinkLoading(false);
        }
      } else {
        setExistingDriveLink(null);
        setValue("note", "");
      }
    };

    fetchPatientDriveLink();
  }, [selectedStudentId, setValue]); // Re-run when selectedStudentId changes

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Send the drive link to the new backend endpoint
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-drive-link/${data.studentId}`,
        { driveLink: data.note }
      );
      
      alert(response.data.message);
      reset(); // Reset form after successful submission
      setExistingDriveLink(null); // Clear existing link state
      
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Error submitting form: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.formWrapper} ${styles.row} ${styles.justifyContentCenter}`}>
        <div className={`${styles.col12} ${styles.colMd8} ${styles.colLg6}`}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <div className={styles.headerContent}>
                <h5 className={styles.formTitle}>
                  <UserPlus className={styles.labelIcon} />
                  Student Assignment Form
                </h5>
                <p className={styles.formSubtitle}>Assign a Google Drive link to a student.</p>
              </div>
            </div>
            
            <div className={styles.formBody}>
              <form onSubmit={handleSubmit(onSubmit)} className={styles.formGrid}>
                {/* Student Selection */}
                <div className={styles.formGroup}>
                  <label htmlFor="studentId" className={styles.formLabel}>
                    <User className={styles.labelIcon} />
                    Select Student <span className={styles.required}>*</span>
                  </label>
                  
                  <select
                    id="studentId"
                    className={`${styles.formSelect} ${errors.studentId ? styles.error : ""}`}
                    {...register("studentId")}
                    disabled={isLoading || isSubmitting}
                  >
                    <option value="">
                      {isLoading ? "Loading students..." : "-- Choose a student --"}
                    </option>
                    
                    {!isLoading && Array.isArray(students) && students.length > 0 ? (
                      students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name}
                        </option>
                      ))
                    ) : !isLoading ? (
                      <option disabled>No students available</option>
                    ) : null}
                  </select>
                  
                  {errors.studentId && (
                    <div className={styles.errorMessage}>
                      <AlertCircle className={styles.errorIcon} />
                      {errors.studentId.message}
                    </div>
                  )}
                </div>

                {/* Note Input */}
                <div className={styles.formGroup}>
                  <label htmlFor="note" className={styles.formLabel}>
                    <Link className={styles.labelIcon} />
                    Google Drive Note URL <span className={styles.required}>*</span>
                  </label>
                  
                  <div className={styles.inputGroup}>
                    <span className={styles.inputGroupText}>
                      <CloudUpload />
                    </span>
                    <input
                      type="url"
                      id="note"
                      className={`${styles.formInput} ${
                        errors.note 
                          ? styles.error 
                          : isNoteValid 
                          ? styles.success 
                          : ""
                      }`}
                      {...register("note")}
                      placeholder="https://drive.google.com/file/d/..."
                      disabled={isSubmitting || fetchLinkLoading}
                    />
                    
                    {/* Success feedback with green checkmark */}
                    {isNoteValid && (
                      <span className={`${styles.inputGroupText} ${styles.success}`}>
                        <CheckCircle />
                      </span>
                    )}
                  </div>
                  
                  {/* Error feedback */}
                  {errors.note && (
                    <div className={styles.errorMessage}>
                      <AlertCircle className={styles.errorIcon} />
                      {errors.note.message}
                    </div>
                  )}
                  
                  {/* Success feedback message */}
                  {isNoteValid && (
                    <div className={styles.successMessage}>
                      <CheckCircle className={styles.successIcon} />
                      Valid Google Drive link detected!
                    </div>
                  )}

                  {/* Display existing link info */}
                  {fetchLinkLoading ? (
                    <div className={styles.infoCard}>
                      <div className={styles.infoCardHeader}>
                        <Info className={styles.infoIcon} />
                        <h6 className={styles.infoTitle}>Loading existing link...</h6>
                      </div>
                    </div>
                  ) : selectedStudentId && existingDriveLink ? (
                    <div className={styles.infoCard}>
                      <div className={styles.infoCardHeader}>
                        <Info className={styles.infoIcon} />
                        <h6 className={styles.infoTitle}>Existing Drive Link:</h6>
                      </div>
                      <p className={styles.infoText}>
                        <a href={existingDriveLink} target="_blank" rel="noopener noreferrer">
                          {existingDriveLink}
                        </a>
                      </p>
                      <p className={styles.infoText}>
                        Submitting this form will **update/overwrite** the existing link.
                      </p>
                    </div>
                  ) : selectedStudentId && !existingDriveLink && !fetchLinkLoading ? (
                    <div className={styles.infoCard}>
                      <div className={styles.infoCardHeader}>
                        <Info className={styles.infoIcon} />
                        <h6 className={styles.infoTitle}>No existing Drive Link found for this student.</h6>
                      </div>
                      <p className={styles.infoText}>
                        You can add a new Google Drive link for this student.
                      </p>
                    </div>
                  ) : null}

                  <div className={styles.formText}>
                    <Info className={styles.labelIcon} />
                    Only Google Drive links are accepted (docs, sheets, presentations, or files)
                  </div>
                  
                  {/* Accepted formats helper */}
                  <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                      <Info className={styles.infoIcon} />
                      <h6 className={styles.infoTitle}>Accepted Formats:</h6>
                    </div>
                    <ul className={styles.infoText}>
                      <li><CheckCircle className={styles.successIcon} /> drive.google.com/file/d/...</li>
                      <li><CheckCircle className={styles.successIcon} /> docs.google.com/document/d/...</li>
                      <li><CheckCircle className={styles.successIcon} /> docs.google.com/spreadsheets/d/...</li>
                      <li><CheckCircle className={styles.successIcon} /> docs.google.com/presentation/d/...</li>
                    </ul>
                  </div>
                </div>

                {/* Submit Button */}
                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={!isValid || isSubmitting || isLoading || fetchLinkLoading}
                  >
                    {isSubmitting ? (
                      <>
                        <span className={styles.loadingSpinnerSmall} role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className={styles.buttonIcon} />
                        Confirm Assignment
                      </>
                    )}
                  </button>
                </div>

                {/* Loading State for initial student fetch */}
                {isLoading && (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className={styles.loadingText}>Loading students...</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
