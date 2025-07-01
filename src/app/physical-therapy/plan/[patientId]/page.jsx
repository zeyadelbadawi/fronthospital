"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import axiosInstance from "@/helper/axiosSetup";

import SyncfusionDocx from "@/components/SyncfusionDocx";

const PatientPlanEditor = () => {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId;

  const [patient, setPatient] = useState(null);
  const [plan, setPlan] = useState({
    title: "",
    filePath: "",
    fileName: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchPatientData();
    fetchExistingPlan();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${patientId}`
      );
      console.log("Patient data fetched:", response.data); // Debugging line to check fetched patient data
      setPatient(response.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const fetchExistingPlan = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/physicalTherapy/plan/${patientId}`
      );
      console.log("Existing plan data fetched:", response.data); // Debugging line to check fetched plan data
      setPlan(response.data || { title: "", filePath: "", fileName: "" }); // Fallback to an empty object if no data is found
    } catch (error) {
      console.error("Error fetching plan data:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const planData = {
        ...plan,
        patient: patientId,
      };
      // her !!
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/physicalTherapy/plan`,
        planData
      );
      setPlan(response.data);
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
  if (!patient) {
    return <div className="text-center py-4">Loading patient data...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Physical Therapy Plan - {patient.name}</h5>
                <small className="text-muted">Patient ID: {patient._id}</small>
              </div>
            </div>

            <div className="card-body">
              {/* Document Viewer */}
              <div className="row ">
                <div className="col-12 ">
                  <label className="form-label">Document Viewer</label>
                  <SyncfusionDocx
                    userData={{
                      docxId: plan._id || "no-data",
                      patientId,
                      filePath: `${
                        process.env.NEXT_PUBLIC_API_URL
                      }/uploads/physical-therapy/plan/${
                        plan.filePath || "physical-therapy-plan-defoult.docx"
                      }`,
                      fileName:
                        plan.fileName || "physical-therapy-plan-defoult.docx",
                      docxName: `physical-therapy-plan-${patient.name}.docx`,
                      isList: false,
                      notifyEmail: true,
                      notifyNto: true,
                      rule: "Patient",
                      to: patient.email,
                      title: "Physical Therapy Plan",
                      message: "Your physical therapy plan has been updated",
                    }}
                    planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/physicalTherapy/upload-plan`}
                  />
                </div>
              </div>

              {plan.lastModified && (
                <div className="row mt-3">
                  <div className="col-12">
                    <small className="text-muted">
                      Last modified:{" "}
                      {new Date(plan.lastModified).toLocaleString()}
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPlanEditor;
