"use client";

import { useState, useEffect } from "react";
import DocxUploadForm from "./docx-upload-form";
//import UserComponent from "./user-component"
import styles from "../styles/document-page.module.css";
import axiosInstance from "@/helper/axiosSetup";
import DoctorPlanDocx from "@/components/DoctorPlanDocx";
import CloseQuarterForm from "./close-quarter-form";
import {
  ArrowLeft,
  User,
  FileText,
  Clock,
  Calendar,
  Brain,
  XCircle,
  Upload,
} from "lucide-react";
export default function DoctorPlan({ doctorId, departmentId }) {
  const [hasDocument, setHasDocument] = useState(null); // null = loading, true = has doc, false = no doc
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCloseQuarterModal, setShowCloseQuarterModal] = useState(false);

  // Check if user has uploaded document
  const checkUserDocument = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/doctorFile/get-plans/${doctorId}/${departmentId}?last=true`
      );

      console.log("Doctor Plans Response:", response?.data);

      setHasDocument(response?.data?.doctorFiles);
    } catch (err) {
      console.error("Error checking document:", err);
      setError(err.message);
      setHasDocument(false); // Default to no document on error
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful upload
  const handleUploadSuccess = () => {
    checkUserDocument();
    setShowModal(false);
    setHasDocument(true);
    // Optionally refresh the page or update state
  };

  const handleCloseQuarterSuccess = () => {
    setShowCloseQuarterModal(false);
    alert("Quarter closed successfully!");
  };

  // Retry checking document
  const handleRetry = () => {
    checkUserDocument();
  };

  useEffect(() => {
    checkUserDocument();
  }, []);

  const handleBackToList = () => {
    // Add your back navigation logic here
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className={styles.documentPage}>
        <div className="container">
          <div className={styles.loadingContainer}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3">Checking document status...</h4>
            <p className="text-muted">
              Please wait while we verify your documents.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.documentPage}>
        <div className="container">
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h4>Something went wrong</h4>
            <p className="text-muted mb-4">{error}</p>
            <button className="btn btn-primary" onClick={handleRetry}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.documentPage}>
      <div className="container">
        {/* Header */}
        <div className={styles.pageHeader}>
          <h1>Document Management</h1>
          <p className="lead">Manage your medical documents and reports</p>
        </div>

        {/* Main Content */}
        {!hasDocument ? (
          // No Document Found - Show Upload Message
          <div className={styles.noDocumentContainer}>
            <div className={styles.noDocumentCard}>
              <div className={styles.noDocumentIcon}>
                <i className="bi bi-file-earmark-plus"></i>
              </div>
              <h3>No Document Found</h3>
              <p className="text-muted mb-4">
                We couldn't find any documents for your account. Please upload a
                DOCX document to get started.
              </p>
              <div className={styles.userInfo}>
                <div className={styles.infoItem}>
                  <strong>Doctor ID:</strong> {doctorId}
                </div>
                <div className={styles.infoItem}>
                  <strong>Department ID:</strong> {departmentId}
                </div>
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-cloud-upload me-2"></i>
                Upload Document
              </button>
              <button
                className="btn btn-outline-secondary ms-3"
                onClick={handleRetry}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        ) : (
          // Document Found - Show with PatientPlanEditor styling
          <div className={styles.planEditorContainer}>
            <div className={styles.planEditorCard}>
              {/* Header with PatientPlanEditor styling */}
              <div className={styles.planHeader}>
                <div className={styles.headerContent}>
                  <div className={styles.headerLeft}>
                    <button
                      onClick={handleBackToList}
                      className={styles.backButton}
                    >
                      <ArrowLeft className={styles.backIcon} />
                      Back to Dashboard
                    </button>
                    <div className={styles.studentInfo}>
                      <h1 className={styles.planTitle}>
                        <Brain className={styles.titleIcon} />
                        Doctor Plan Document
                      </h1>
                      <div className={styles.studentDetails}>
                        {hasDocument?.fileName && (
                          <div className={styles.studentDetail}>
                            <FileText className={styles.detailIcon} />
                            <span>{hasDocument.fileName}</span>
                          </div>
                        )}
                        {hasDocument?.createdAt && (
                          <div className={styles.studentDetail}>
                            <Calendar className={styles.detailIcon} />
                            <span>
                              Created:{" "}
                              {new Date(
                                hasDocument.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        <div className={styles.documentActions}>
                          <button
                            className="btn btn-primary d-flex align-items-center gap-1"
                            onClick={() => setShowCloseQuarterModal(true)}
                          >
                            <XCircle className="me-2" size={16} />
                            Close the Quarter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className={styles.planBody}>
                <div className={styles.documentSection}>
                  <div className={styles.documentContainer}>
                    {/* Replace this component as needed */} 
                    <div className="">{`${process.env.NEXT_PUBLIC_API_URL}${hasDocument?.fullPath}`}</div>
                    <DoctorPlanDocx
                      filePath={`${process.env.NEXT_PUBLIC_API_URL}${hasDocument?.fullPath}`}
                    />
                  </div>
                  {hasDocument?.lastModified && (
                    <div className={styles.documentFooter}>
                      <div className={styles.lastModified}>
                        <Clock className={styles.clockIcon} />
                        <span>
                          Last modified:{" "}
                          {new Date(hasDocument.lastModified).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Close Modal */}
        {showCloseQuarterModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className={`modal-content ${styles.customModalContent}`}>
                <div className="modal-header">
                  <h5 className="modal-title">Close Quarter</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCloseQuarterModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-0">
                  <CloseQuarterForm
                    onSuccess={handleUploadSuccess}
                    defaultValues={{
                      doctorId: doctorId,
                      departmentId: departmentId,
                      quarterOfYear: hasDocument?.quarterOfYear,
                      year: hasDocument?.year,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {showModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className={`modal-content ${styles.customModalContent}`}>
                <div className="modal-header">
                  <h5 className="modal-title">Upload Document</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-0">
                  <DocxUploadForm
                    onSuccess={handleUploadSuccess}
                    defaultValues={{
                      doctorId: doctorId,
                      departmentId: departmentId,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
