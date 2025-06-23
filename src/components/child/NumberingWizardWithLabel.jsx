"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import axiosInstance from '../../helper/axiosSetup';
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import Select from "react-select";                // ← add this
import SyncfusionDocx from "@/components/SyncfusionDocx";

// define your options once
const serviceOptions = [
  { value: "service_a", label: "Functional Sensory Therapy" },
  { value: "service_b", label: "Physical Therapy" },
  { value: "service_c", label: "ABA Behavior Modification Sessions  " },
  { value: "service_d", label: "Speech Delay Therapy" },
  { value: "service_f", label: "Psychoeducational Assessment" },
  { value: "service_g", label: "Learning Difficulties Support" },
  { value: "service_h", label: "School Integration Preparation" },
  { value: "service_i", label: "Special Education Services" },

];

const TYPE_PRICES = {
  school_evaluation: 500,
  full_package_evaluation: 700,
  free_medical_consultation: 0,
};

// per-service prices
const SERVICE_PRICES = {
  service_a: 100,
  service_b: 200,
  service_c: 300,
  service_d: 500,
  service_f: 280,
  service_g: 300,
  service_h: 300,
  service_i: 300,

};

const NumberingWizardWithLabel = ({ currentStep, setCurrentStep, patientId, patientName }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [description, setDescription] = useState("");
  const [evaluationType, setEvaluationType] = useState("");
  const [blurred, setBlurred] = useState(false);
  const router = useRouter();
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]); // ← NEW
  const [selectedSchool, setSelectedSchool] = useState("");
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    console.log("patientId received in useEffect:", patientId); // Log patientId
    const fetchPlanData = async () => {
      try {
        console.log("Fetching plan data for patientId:", patientId); // Log before API call
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/DrastHala/plan/${patientId}`
        );
        console.log("Plan data fetched:", response.data); // Log API response
        setPlan(response.data); // Store the fetched plan in the state
      } catch (error) {
        console.error("Error fetching plan data:", error);
      }
    };

    if (patientId) {
      fetchPlanData(); // Fetch plan data when patientId changes
    }
  }, [patientId]); // Dependency on patientId






  useEffect(() => {
    if (currentStep === 0) {
      setSelectedServices([]);

    }
    if (currentStep === 3) {
      setEvaluationType("");
      setDescription("");
    }
  }, [currentStep]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Fetch evaluations for the logged-in user
      axiosInstance
        .get(`/authentication/evaluations/${token}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const { evaluations, hasPendingEvaluation } = response.data;

          if (hasPendingEvaluation) {
            setIsAlreadyBooked(true); // If there's a pending evaluation
            setBlurred(true); // Apply blur to the page
          } else {
            setIsAlreadyBooked(false); // No pending evaluation
            setBlurred(false); // Remove blur if evaluation is completed
          }
        })
        .catch((error) => {
          console.error("Error fetching evaluations:", error);
        });
    }
  }, []);



  const filterWeekdays = (date) => {
    const day = date.getDay();
    return day === 0 || day === 5; // 0 = Sunday, 5 = Friday
  };

  const nextStep = () => {
    if (currentStep < 4) { // Ensure that the max step is 4 (since you have 5 steps in total)
      setCurrentStep(currentStep + 1); // Increment the current step
    }
  };



  const handlePayClick = (e) => {
    e.preventDefault(); // Prevent the default behavior (form submission, etc.)

    if (isAlreadyBooked) {
      return; // Prevent further action if already booked
    }

    const computePrice = () => {
      if (evaluationType === "single_session") {
        return selectedServices
          .reduce((sum, svc) => sum + (SERVICE_PRICES[svc] || 0), 0);
      }
      return TYPE_PRICES[evaluationType] ?? 0;
    };

    const price = computePrice();

    const payload = {
      date: selectedDay,
      time: selectedTime,
      description: description,
      type: evaluationType,
      price,                             // ← here

      ...(evaluationType === "single_session" && selectedServices.length > 0 && {
        services: selectedServices
      }),

      ...(evaluationType === "school_evaluation" && { school: selectedSchool }),



    };
    localStorage.setItem("evaluationData", JSON.stringify(payload));

    router.push("/pay"); // Navigate to the pay page after success

  };

  const handleConfirmPayment = async () => {
    try {

      const token = localStorage.getItem("token");


      const computePrice = () => {
        if (evaluationType === "single_session") {
          return selectedServices
            .reduce((sum, svc) => sum + (SERVICE_PRICES[svc] || 0), 0);
        }
        return TYPE_PRICES[evaluationType] ?? 0;
      };

      const price = computePrice();

      const payload = {
        date: selectedDay,
        time: selectedTime,
        description: description,
        type: evaluationType,

        status: "Pending",  // Set the status to "Pending"



      };

      // Make the API call to save the evaluation
      const res = await axiosInstance.post("/authentication/ev", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });



      if (res.status === 201) {
        // Show success message using toast
        toast.success("Your Medical Consultation Request has been recorded.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        setTimeout(() => {
          // Uncomment if you want to redirect after successful payment
          window.location.href = "/profile"; // Redirect to the final step
        }, 2000);
      }
    } catch (error) {
      console.error("Error during Request confirmation:", error);
      toast.error("Failed to complete Request. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };




  return (
    <div className={`col-md-12 ${blurred ? "blurred" : ""}`}>
      {isAlreadyBooked && (
        <div className="already-booked-message">
          <h4>Please wait until your Current Program to be done.</h4>
        </div>
      )}
      <div className="card">
        <div className="card-body">
          <h6 className="mb-4 text-xl">Book An Appointment</h6>
          <p className="text-neutral-500">Fill up your details and proceed to the next steps.</p>

          {/* Form Wizard Start */}
          <div className="form-wizard">
            <form action="#" method="post">
              <div className="form-wizard-header overflow-x-auto scroll-sm pb-8 my-32">
                <ul className="list-unstyled form-wizard-list">
                  <li className={`form-wizard-list__item ${currentStep === 0 ? "active" : ""}`}>
                    <div className="form-wizard-list__line">
                      <span className="count">1</span>
                    </div>
                    <span className="text text-xs fw-semibold">Select Evaluation Type</span>
                  </li>
                  <li className={`form-wizard-list__item ${currentStep === 1 ? "active" : ""}`}>
                    <div className="form-wizard-list__line">
                      <span className="count">2</span>
                    </div>
                    <span className="text text-xs fw-semibold">Request Evaluation</span>
                  </li>
                  <li className={`form-wizard-list__item ${currentStep === 2 ? "active" : ""}`}>
                    <div className="form-wizard-list__line">
                      <span className="count">3</span>
                    </div>
                    <span className="text text-xs fw-semibold">Word Document</span>
                  </li>
                  {evaluationType !== "free_medical_consultation" && (
                    <li className={`form-wizard-list__item ${currentStep === 3 ? "active" : ""}`}>
                      <div className="form-wizard-list__line">
                        <span className="count">4</span>
                      </div>
                      <span className="text text-xs fw-semibold">Pay</span>
                    </li>
                  )}
                  <li className={`form-wizard-list__item ${currentStep === 4 ? "active" : ""}`}>
                    <div className="form-wizard-list__line">
                      <span className="count">5</span>
                    </div>
                    <span className="text text-xs fw-semibold">Complete</span>
                  </li>

                </ul>
              </div>


              <fieldset className={`wizard-fieldset ${currentStep === 0 && "show"}`}>
                <h6 className="text-md text-neutral-800">Select Evaluation Type</h6>
                <div className="row gy-3">
                  <div className="col-sm-12">
                    <label className="form-label">Select Evaluation type</label>
                    <select
                      className="form-control wizard-required"
                      value={evaluationType}
                      onChange={e => {
                        const type = e.target.value;
                        setEvaluationType(type);   // store the choice
                        if (type) setCurrentStep(1); // jump to Tab 1
                      }}
                    >
                      <option value="">Select Evaluation Type</option>
                      <option value="school_evaluation">1- School Evaluation</option>
                      <option value="full_package_evaluation">2- Full Package Evaluation</option>
                      <option value="single_session">3- Single Session</option>
                      <option value="free_medical_consultation">4- Free Medical Consultation</option>
                    </select>
                  </div>
                </div>
                <div className="form-group text-end">
                  <button
                    onClick={nextStep} // Call nextStep directly
                    type="button"
                    className="btn btn-secondary px-32"
                    disabled={false /* or whatever condition you need */}
                  >
                    Next
                  </button>
                </div>
              </fieldset>



              {/* Request Evaluation Tab */}
              <fieldset className={`wizard-fieldset ${currentStep === 1 && "show"}`}>
                <h6 className="text-md text-neutral-500">Request Evaluation</h6>
                <div className="row gy-3">
                  <div className="col-sm-6">
                    <label className="form-label">Select Day*</label>
                    <div className="position-relative">
                      <DatePicker
                        selected={selectedDay}
                        onChange={(date) => setSelectedDay(date)}
                        filterDate={filterWeekdays}
                        placeholderText="Select a day"
                        className="form-control wizard-required"
                        dateFormat="MM/dd/yyyy"
                        calendarClassName="custom-calendar"
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label">Select Time*</label>
                    <div className="position-relative">
                      <DatePicker
                        selected={selectedTime}
                        onChange={(date) => setSelectedTime(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        timeCaption="Time"
                        minTime={new Date().setHours(12, 0)}
                        maxTime={new Date().setHours(20, 0)}
                        dateFormat="h:mm aa"
                        className="form-control wizard-required"
                        placeholderText="Select a time"
                        filterTime={(time) => {
                          const hour = time.getHours();
                          return hour >= 12 && hour <= 20;
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-sm-12">
                    <label className="form-label">Description*</label>
                    <div className="position-relative">
                      <textarea
                        className="form-control wizard-required"
                        placeholder="Write your description"
                        required=""
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group d-flex justify-content-between">
                    {/* Back: go from step 1 → 0 */}
                    <button
                      type="button"
                      onClick={() => setCurrentStep(0)} // Go back to the previous step
                      className="btn btn-secondary px-32"
                    >
                      Back
                    </button>

                    {/* Next: your existing handler */}
                    <button
                      type="button"
                      onClick={nextStep} // Use the nextStep function to go to the next step
                      className="btn btn-info-600 px-32"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </fieldset>

              <fieldset className={`wizard-fieldset ${currentStep === 2 && "show"}`}>
                <div className="row">
                  <div className="col-sm-12">
                    {plan && plan._id ? (
                      <SyncfusionDocx
                        userData={{
                          docxId: plan._id,
                          patientId: patientId,
                          filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/DRAST-7ALA/plan/${plan.filePath}`,
                          fileName: plan.fileName || "default.docx",
                          docxName: `Case study of student: ${patientName}.docx`,
                        }}
                        planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/DrastHala/upload-plan`}
                      />
                    ) : (
                      // If no plan is found, render default file
                      <SyncfusionDocx
                        userData={{
                          docxId: "default",  // You can set a default ID or handle it as needed
                          patientId: patientId,
                          filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/DRAST-7ALA/plan/default.docx`, // Default file path
                          fileName: "default.docx",  // Default file name
                         // docxName: `physical-therapy-plan-${patientName}.docx`,
                        }}
                        planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/DrastHala/upload-plan`}
                      />
                    )}
                  </div>
                </div>
                <div className="form-group d-flex justify-content-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)} // Go back to the previous tab
                    className="btn btn-secondary px-32"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)} // Proceed to the next tab
                    className="btn btn-info-600 px-32"
                  >
                    Next
                  </button>
                </div>
              </fieldset>

              {/* Pay Tab */}
              <fieldset className={`wizard-fieldset ${currentStep === 3 && "show"}`}>
                <h6 className="text-md text-neutral-500">Payment</h6>
                <div className="form-group text-center">
                  <button
                    onClick={handlePayClick}
                    className="btn btn-info-600 px-32"
                  >
                    Pay
                  </button>
                </div>
              </fieldset>

              {/* Complete Tab */}
              <fieldset className={`wizard-fieldset ${currentStep === 4 && "show"}`}>
                <div className="text-center mb-40">
                  <img
                    src="assets/images/gif/success-img3.gif"
                    alt=""
                    className="gif-image mb-24"
                  />
                  <h6 className="text-md text-neutral-600">Congratulations</h6>
                  <p className="text-neutral-400 text-sm mb-0">
                    Well done! You have successfully completed.
                  </p>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberingWizardWithLabel;
