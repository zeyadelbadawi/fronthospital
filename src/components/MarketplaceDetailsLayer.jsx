"use client";
import React, { useState, useEffect } from 'react'; // Make sure to import React

import { Icon } from "@iconify/react/dist/iconify.js";
import axiosInstance from "../helper/axiosSetup"; // Import the configured axios instance
import { useSearchParams } from "next/navigation"; // Import useSearchParams from next/navigation

const MarketplaceDetailsLayer = () => {
  const [patientData, setPatientData] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [pendingMoney, setPendingMoney] = useState(0); // Store the total pending money for the patient
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // To store error messages (if any)

  const [activeEvaluationIndex, setActiveEvaluationIndex] = useState(null); // To track the index of the evaluation being toggled
  const [sessions, setSessions] = useState([]); // Store sessions for the active evaluation
  const [sessionError, setSessionError] = useState(""); // Store error if no sessions found for evaluation

  const searchParams = useSearchParams(); // Use useSearchParams to access query params
  const id = searchParams.get('id'); // Get the patient ID from the URL query

  // Fetch Data for the specific patient based on the patient ID from the URL
  useEffect(() => {
    if (!id) {
      setError("Student ID is missing in the URL.");
      setLoading(false);
      return;
    }

    const fetchPatientData = async () => {
      try {
        // Fetch patient data based on patient ID from the URL
        const patientResponse = await axiosInstance.get(`/authentication/patient/${id}`);
        const evaluationsResponse = await axiosInstance.get(`/authentication/evv/${id}`);
        const pendingMoneyResponse = await axiosInstance.get(`/authentication/patient-pending-money/${id}`); // Use the correct route here

        // Ensure patient data exists
        if (!patientResponse.data) {
          setError("Student data not found.");
          setLoading(false);
          return;
        }
        console.log('Fetched Student data:', patientResponse.data);

        setPatientData(patientResponse.data);
        setEvaluations(evaluationsResponse.data.evaluations);
        console.log("setPatientData:", patientResponse.data);

        // Check if there are pending money records and calculate the total
        if (pendingMoneyResponse.data && pendingMoneyResponse.data.length > 0) {
          const totalPendingMoney = pendingMoneyResponse.data.reduce((acc, record) => acc + record.price, 0);
          setPendingMoney(totalPendingMoney);  // Set the total pending money for the patient
        } else {
          setPendingMoney(0);  // If no records are found, set pending money to 0
        }

        setLoading(false);  // Stop the loading state once data is fetched
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setPatientData({});
                setEvaluations([]);
                setPendingMoney(0);
      setLoading(false);  // Even on error, stop loading
      }
    };

    fetchPatientData();
  }, [id]); // Fetch data when `id` is available

  const toggleSessionsVisibility = async (index, evaluationId) => {
    // If the same evaluation is clicked, hide the sessions
    if (activeEvaluationIndex === index) {
      setActiveEvaluationIndex(null);
      setSessions([]);
      setSessionError(""); // Reset session error
    } else {
      setActiveEvaluationIndex(index);
      // Fetch sessions related to this evaluation
      try {
        const sessionsResponse = await axiosInstance.get(`/authentication/evaluation-sessions/${evaluationId}`);
        if (sessionsResponse.data.length === 0) {
          setSessionError("No sessions for this Program");
        } else {
          setSessions(sessionsResponse.data); // Set the fetched sessions to the state
          setSessionError(""); // Clear any error message
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessionError("An error occurred while fetching sessions.");
      }
    }
  };

  // If the data is still loading, show a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  // If there's an error, display the error message


  return (
    <>
      <div className="row gy-4">
        <div className="col-xxl-12 col-lg-8">
          <div className="card h-100 p-0 radius-12">
            <div className="card-body px-24 py-32">
              <div className="d-flex align-items-center justify-content-between mb-24">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 d-flex flex-column">
                  <h4 className="mb-4">{patientData.name || "Name not available"}</h4>
                    <span className="text-md mb-0 fw-medium text-neutral-500 d-block">
                    Last Visit: {patientData.lastvisit
                        ? new Date(patientData.lastvisit).toLocaleDateString('en-CA')
                       : "— No visits yet"}                    </span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-12">
                  <h6 className="text-secondary-light">Pending Money: </h6>
                  <h6 className="text-md fw-semibold rounded-pill bg-info-focus text-info-main border br-success px-12 py-12 line-height-1 d-flex align-items-center gap-1">
                  {pendingMoney != null ? pendingMoney : 0} SAR
                  </h6>
                </div>
              </div>
              <h6 className="mb-16">About</h6>
              <p className="text-secondary-light">
                {patientData.mydescription || "No description available."}
              </p>

              {/* Table Start */}
              <div className="border radius-12 p-24">
                <h6 className="text-md mb-16">{patientData.name}'s Programs</h6>
                <div className="table-responsive scroll-sm">
                  <table className="table bordered-table rounded-table sm-table mb-0">
                    <thead>
                      <tr>
                        <th scope="col">No.</th>
                        <th className="text-center">Evaluation Type</th>
                        <th className="text-center">Date</th>
                        <th className="text-center">Time</th>
                        <th className="text-center">Status</th>
                        <th >Student Evaluation Note</th>
                        <th >Doctor Evaluation Note</th>
                        <th className="text-center">Payment Status</th>
                        <th className="text-center">Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                                          {evaluations.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="text-center">No evaluations for this Student.</td>
                       </tr>
                      ) : (
                        evaluations.map((evaluation, index) => (
                          <React.Fragment key={evaluation._id}>
                            <tr>
                              <td>
                                <h6 className="text-md mb-4">{index + 1}</h6>
                              </td>
                              <td >
                              <h6 className="text-md mb-4 text-center">
                                  {evaluation.type === "full_package_evaluation" ? "Full Package Evaluation" :
                                  evaluation.type === "single_session" ? "Single Session" :
                                  evaluation.type === "school_evaluation" ? "School Evaluation" :
                                  evaluation.type === "free_medical_consultation" ? "Free Medical Consultation" :
                                  "Unknown Type"
                                  }
                                </h6>
                              </td>

                              <td>
                                <h6 className="text-md mb-4 text-center">{new Date(evaluation.date).toLocaleDateString('en-CA')}</h6>
                              </td>
                              <td>
                                <h6 className="text-md mb-4 text-center">{evaluation.time}</h6>
                              </td>
                              <td>
                                <h6 className="text-md mb-4 text-center">{evaluation.done ? "Completed" : "Pending"}</h6>
                              </td>
                              <td>
                                <h6 className="text-md mb-4 ">{evaluation.description}</h6> {/* Patient's Evaluation Note */}
                              </td>
                              <td>
                                <h6 className="text-md mb-4 ">{evaluation.evolutionNote}</h6> {/* Doctor's Evaluation Note */}
                              </td>
                              <td>
                                <h6 className="text-md mb-4 text-center">cash</h6> {/* Static payment method "cash" */}
                              </td>
                              <td>
                                <button
                                  className="btn btn-info btn-sm"
                                  onClick={() => toggleSessionsVisibility(index, evaluation._id)}
                                >
                                  {activeEvaluationIndex === index ? "Hide Sessions" : "Show Sessions"}
                                </button>
                              </td>
                            </tr>
                            {activeEvaluationIndex === index && (sessions.length > 0 ? (
                              <tr>
                                <td colSpan="9">
                                  <div className="table-responsive">
                                    <table className="table table-bordered mt-3">
                                      <thead>
                                        <tr>
                                          <th>Session Name</th>
                                          <th>Date</th>
                                          <th>Time</th>
                                          <th>Doctor Note</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {sessions.map((session) => (
                                          <tr key={session._id}>
                                            <td>{session.Sessionname}</td>
                                            <td>{new Date(session.date).toLocaleDateString('en-CA')}</td>
                                            <td>{session.time}</td>
                                            <td>{session.note}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              <tr>
                                <td colSpan="9" className="text-center text-danger">{sessionError}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Table End */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketplaceDetailsLayer;
