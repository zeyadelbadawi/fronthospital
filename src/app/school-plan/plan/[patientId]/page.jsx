"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import axiosInstance from "@/helper/axiosSetup";

import SyncfusionDocx from "@/components/SyncfusionDocx";

const PatientSchoolPlanEditor = () => {
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
      console.log("Student data fetched:", response.data); // Debugging line to check fetched patient data
      setPatient(response.data);
    } catch (error) {
      console.error("Error fetching Student data:", error);
    }
  };

  const fetchExistingPlan = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/school/plan/${patientId}`
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
        `${process.env.NEXT_PUBLIC_API_URL}/school/plan`,
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
    return <div className="text-center py-4">Loading Student data...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">School Plan - {patient.name}</h5>
                <small className="text-muted">Student ID: {patient._id}</small>
              </div>
            </div>

            <div className="card-body">
              {/* Document Viewer */}
              <div className="row ">
                <div className="col-12 ">
                  <label className="form-label">Document Viewer</label>
                  <SyncfusionDocx
                    userData={{
                      docxId: plan._id,
                      patientId,
                      filePath: `${
                        process.env.NEXT_PUBLIC_API_URL
                      }/uploads/school-plan/plan/${
                        plan.filePath || "school-plan.doc"
                      }`,
                      fileName:
                        plan.fileName || "school-plan.doc",
                      docxName: `school-plan-${patient.name}`,
                    }}
                    planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/school/upload-plan`}
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

export default PatientSchoolPlanEditor;