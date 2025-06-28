"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/helper/axiosSetup";
import { convertUTCTo12Hour, generateTimeString } from "@/helper/DateTime";

const departments = [
  "PhysicalTherapy",
  "ABA",
  "OccupationalTherapy",
  "SpecialEducation",
  "Speech",
  "ay7aga",
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
/* ---------------------------------- */
const isEndTimeAfterStartTime = (startTime, endTime) => {
  if (!startTime || !endTime) return true;

  const startHour = Number.parseInt(startTime.split(":")[0]);
  const startMinute = Number.parseInt(startTime.split(":")[1]);
  const endHour = Number.parseInt(endTime.split(":")[0]);
  const endMinute = Number.parseInt(endTime.split(":")[1]);

  // Convert to minutes for accurate comparison
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  // Check if end time is after start time AND has at least 30 minutes difference
  const timeDifference = endTotalMinutes - startTotalMinutes;
  return timeDifference >= 30;
};

export default function AppointmentUpdate({ appointmentId, currentData }) {
  console.log("ddd", appointmentId, currentData);
  const [currentSelection, setCurrentSelection] = useState({
    department: "",
    doctor: "",
    day: "",
    start_time: "",
    end_time: "",
  });
  const [validationErrors, setValidationErrors] = useState([]);

  const [doctors, setDoctors] = useState([]);

  const getDoctors = async () => {
    try {
      const response = await axiosInstance.get("/authentication/doctors/");
      setDoctors(response.data.doctors);
    } catch (error) {
      alert("Error fetching Doctors:", error);
    }
  };

  useEffect(() => {
    getDoctors();
  }, []);

  useEffect(() => {
    setCurrentSelection(
      currentData || {
        department: "",
        doctor: "",
        day: "",
        start_time: "",
        end_time: "",
      }
    );
  }, [currentData]);

  const updateAppointment = async () => {
    const errors = [];

    // Check if all fields are filled
    if (
      !currentSelection.doctor ||
      !currentSelection.department ||
      !currentSelection.day ||
      !currentSelection.start_time ||
      !currentSelection.end_time
    ) {
      errors.push("Please fill in all fields");
    }

    // Check if end time is after start time with minimum 30 minutes
    if (
      currentSelection.start_time &&
      currentSelection.end_time &&
      !isEndTimeAfterStartTime(
        currentSelection.start_time,
        currentSelection.end_time
      )
    ) {
      errors.push("End time must be at least 30 minutes after start time");
    }

    setValidationErrors(errors);

    if (errors.length === 0) {
      /* console.log(
        "Appointment added:",
        generateTimeString(currentSelection.start_time, currentSelection.day),
        "--",
        generateTimeString(currentSelection.end_time, currentSelection.day)
      );
      console.log(
        "Appointment added:",
        convertUTCTo12Hour(
          generateTimeString(currentSelection.start_time, currentSelection.day)
        ),
        ":",
        convertUTCTo12Hour(
          generateTimeString(currentSelection.end_time, currentSelection.day)
        )
      ); */

      const updateData = {
        doctor: currentSelection.doctor,
        department: currentSelection.department,
        day: currentSelection.day,
        start_time: generateTimeString(
          currentSelection.start_time,
          currentSelection.day
        ),
        end_time: generateTimeString(
          currentSelection.end_time,
          currentSelection.day
        ),
      };
      /* console.log(updateData); */

      // addedData to your backend API
      try {
        const response = await axiosInstance.put(
          `/appointments/${appointmentId}`,
          updateData
        );

        if (response.status !== 201) {
          alert("Failed to update appointment");
        }

        console.log("Appointment updated successfully:", response.data);

        setCurrentSelection({
          department: "",
          doctor: "",
          day: "",
          start_time: "",
          end_time: "",
        });
        setValidationErrors([]);

      } catch (error) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <div className="card mb-4 m-4">
      <div className="card-body">
        <div className="row g-3 mb-4">
          {/* Doctors Selection with validation */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-people me-1"></i>
              Doctor
            </label>
            <select
              className={`form-select ${
                !currentSelection.doctor &&
                validationErrors.some((error) =>
                  error.includes("fill in all fields")
                )
                  ? "is-invalid"
                  : ""
              }`}
              value={currentSelection.doctor}
              onChange={(e) => {
                setCurrentSelection({
                  ...currentSelection,
                  doctor: e.target.value,
                });
                setValidationErrors([]);
              }}
            >
              <option value="">Select doctor</option>
              {doctors?.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.username}
                </option>
              ))}
            </select>
            {!currentSelection.doctor &&
              validationErrors.some((error) =>
                error.includes("fill in all fields")
              ) && (
                <div className="invalid-feedback">Please select a doctor.</div>
              )}
          </div>
          {/* Department Selection with validation */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-people me-1"></i>
              Department
            </label>
            <select
              className={`form-select ${
                !currentSelection.department &&
                validationErrors.some((error) =>
                  error.includes("fill in all fields")
                )
                  ? "is-invalid"
                  : ""
              }`}
              value={currentSelection.department}
              onChange={(e) => {
                setCurrentSelection({
                  ...currentSelection,
                  department: e.target.value,
                });
                setValidationErrors([]);
              }}
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {!currentSelection.department &&
              validationErrors.some((error) =>
                error.includes("fill in all fields")
              ) && (
                <div className="invalid-feedback">
                  Please select a department.
                </div>
              )}
          </div>

          {/* Day Selection with validation */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-calendar me-1"></i>
              Day
            </label>
            <select
              className={`form-select ${
                !currentSelection.day &&
                validationErrors.some((error) =>
                  error.includes("fill in all fields")
                )
                  ? "is-invalid"
                  : ""
              }`}
              value={currentSelection.day}
              onChange={(e) => {
                setCurrentSelection({
                  ...currentSelection,
                  day: e.target.value,
                });
                setValidationErrors([]);
              }}
            >
              <option value="">Select day</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            {!currentSelection.day &&
              validationErrors.some((error) =>
                error.includes("fill in all fields")
              ) && <div className="invalid-feedback">Please select a day.</div>}
          </div>

          {/* Start Time Selection */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-clock me-1"></i>
              Start Time
            </label>
            <div className="input-group">
              <input
                type="time"
                className={`form-control ${
                  !currentSelection.start_time &&
                  validationErrors.some((error) =>
                    error.includes("fill in all fields")
                  )
                    ? "is-invalid"
                    : ""
                } ${
                  currentSelection.start_time &&
                  currentSelection.end_time &&
                  !isEndTimeAfterStartTime(
                    currentSelection.start_time,
                    currentSelection.end_time
                  )
                    ? "is-invalid"
                    : ""
                }`}
                value={currentSelection.start_time}
                onChange={(e) => {
                  setCurrentSelection({
                    ...currentSelection,
                    start_time: e.target.value,
                  });
                  setValidationErrors([]);
                }}
              />
            </div>
            {!currentSelection.start_time &&
              validationErrors.some((error) =>
                error.includes("fill in all fields")
              ) && (
                <div className="invalid-feedback d-block">
                  Please select a start time.
                </div>
              )}
          </div>

          {/* End Time Selection */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-clock me-1"></i>
              End Time
            </label>
            <div className="input-group">
              <input
                type="time"
                className={`form-control  ${
                  !currentSelection.end_time &&
                  validationErrors.some((error) =>
                    error.includes("fill in all fields")
                  )
                    ? "is-invalid"
                    : ""
                } ${
                  currentSelection.start_time &&
                  currentSelection.end_time &&
                  !isEndTimeAfterStartTime(
                    currentSelection.start_time,
                    currentSelection.end_time
                  )
                    ? "is-invalid"
                    : ""
                }`}
                value={currentSelection.end_time}
                onChange={(e) => {
                  setCurrentSelection({
                    ...currentSelection,
                    end_time: e.target.value,
                  });
                  setValidationErrors([]);
                }}
              />
            </div>
            {!currentSelection.end_time &&
              validationErrors.some((error) =>
                error.includes("fill in all fields")
              ) && (
                <div className="invalid-feedback d-block">
                  Please select an end time.
                </div>
              )}
          </div>
        </div>

        {/* Enhanced Validation Errors with Bootstrap Alerts */}
        {validationErrors.length > 0 && (
          <div className="mb-4">
            {validationErrors.map((error, index) => (
              <div
                key={index}
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Error:</strong> {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setValidationErrors(
                      validationErrors.filter((_, i) => i !== index)
                    )
                  }
                  aria-label="Close"
                ></button>
              </div>
            ))}
          </div>
        )}

        <div className="d-flex gap-2">
          <button
            className={`btn btn-warning btn-lg `}
            onClick={updateAppointment}
          >
            <i className={`bi bi-pencil-square me-2`}></i>
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
