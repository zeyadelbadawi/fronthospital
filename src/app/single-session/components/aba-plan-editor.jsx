"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User, Save, FileText, Clock } from "lucide-react";
import axiosInstance from "@/helper/axiosSetup";
import usePlan from "@/hooks/usePlan";
import SyncfusionDocx from "@/components/SyncfusionDocx";
import { useContentStore } from "../store/content-store";
import styles from "../styles/physical-therapy-plan.module.css";

export function AbaPlanEditor({ patientId }) {
  const { plan, loading } = usePlan(patientId);
  const [patient, setPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const setActiveContent = useContentStore((state) => state.setActiveContent);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${patientId}`
      );
      console.log("Patient data fetched:", response.data);
      setPatient(response.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const planData = {
        ...plan,
        patient: patientId,
      };
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/aba/plan`,
        planData
      );
      console.log("Plan saved:", response.data);
      alert("Plan saved successfully!");
    } catch (error) {
      console.error("Error saving plan:", error);
      alert(
        "Error saving plan: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBackToPatients = () => {
    setActiveContent({
      department: "aba",
      type: "patients",
    });
  };

  if (loading) {
    return (
      <div className={styles.planEditorContainer}>
        <div className={styles.planEditorCard}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Loading plan data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className={styles.planEditorContainer}>
        <div className={styles.planEditorCard}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Loading patient data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.planEditorContainer}>
      <div className={styles.planEditorCard}>
        <div className={styles.planHeader}>
          <div className={styles.planHeaderLeft}>
            <button
              onClick={handleBackToPatients}
              className={styles.backButton}
            >
              <ArrowLeft className={styles.backIcon} />
              Back to Patients
            </button>
            <div className={styles.patientInfo}>
              <h1 className={styles.planTitle}>ABA Plan - {patient.name}</h1>
              <div className={styles.patientDetails}>
                <div className={styles.patientDetail}>
                  <User className={styles.detailIcon} />
                  <span>{patient.name}</span>
                </div>
                <div className={styles.patientDetail}>
                  <span className={styles.patientId}>
                    Patient ID: {patient._id}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.planHeaderRight}>
            <button
              onClick={handleSave}
              disabled={saving}
              className={styles.saveButton}
            >
              <Save className={styles.buttonIcon} />
              {saving ? "Saving..." : "Save Plan"}
            </button>
          </div>
        </div>

        <div className={styles.planBody}>
          <div className={styles.documentSection}>
            <div className={styles.documentHeader}>
              <FileText className={styles.documentIcon} />
              <h2 className={styles.documentTitle}>ABA Plan Document</h2>
            </div>

            <div className={styles.documentViewer}>
              {plan ? (
                <SyncfusionDocx
                  userData={{
                    docxId: plan._id,
                    patientId,
                    filePath: plan.filePath
                      ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/ABA/plan/${plan.filePath}`
                      : `${process.env.NEXT_PUBLIC_API_URL}/uploads/ABA/plan/ABA-plan-defoult.docx`,
                    fileName: plan.fileName || "ABA-plan-defoult.docx",
                    docxName: `ABA-plan-${patient.name}.docx`,
                    isList: false,
                    notifyEmail: true,
                    notifyNto: true,
                    rule: "Patient",
                    to: patient.email,
                    title: "ABA Plan",
                    message: "Your aba plan has been updated",
                  }}
                  planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/aba/upload-plan`}
                />
              ) : (
                <div className={styles.documentPlaceholder}>
                  <FileText className={styles.placeholderIcon} />
                  <h3 className={styles.placeholderTitle}>ABA Plan Document</h3>
                  <p className={styles.placeholderText}>
                    The ABA plan document will be displayed here once loaded.
                  </p>
                  <div className={styles.documentInfo}>
                    <p>
                      <strong>Patient:</strong> {patient.name}
                    </p>
                    <p>
                      <strong>Patient ID:</strong> {patient._id}
                    </p>
                    <p>
                      <strong>Department:</strong> ABA
                    </p>
                  </div>
                </div>
              )}
            </div>

            {plan?.lastModified && (
              <div className={styles.documentFooter}>
                <Clock className={styles.footerIcon} />
                <span className={styles.lastModified}>
                  Last modified: {new Date(plan.lastModified).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
