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

//const doctors = ["alice", "bob", "charlie", "dave", "eve"];

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

/* const generateTimeString = (time, day) => {
  // Get today's date in UTC
  const today = new Date();
  const currentDayIndex = today.getUTCDay(); // Use UTC day
  const targetDayIndex = daysOfWeek.indexOf(day);

  // Calculate days until target day
  let daysUntilTarget = (targetDayIndex + 1 - currentDayIndex + 7) % 7; // +1 because Sunday=0 in getUTCDay but Sunday is last in our array
  if (daysUntilTarget === 0) daysUntilTarget = 7;

  // Create target date in UTC
  const targetDate = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + daysUntilTarget
    )
  );

  // Parse the time (e.g., "09:30" or "13:45")
  const [hours, minutes] = time
    .split(":")
    .map((num) => Number.parseInt(num, 10));

  // Set the time in UTC
  targetDate.setUTCHours(hours, minutes || 0, 0, 0);

  return targetDate.toISOString();
};

function convertUTCTo12Hour(utcTimestamp) {
  const date = new Date(utcTimestamp);

  // Get UTC hours and minutes (no timezone conversion)
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  // Convert to 12-hour format
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? "PM" : "AM";

  const formattedHour = hour12.toString().padStart(2, "0");
  const formattedMinute = minutes.toString().padStart(2, "0");

  return `${formattedHour}:${formattedMinute} ${ampm}`;
} */

export default function AppointmentBooking() {
  const [currentSelection, setCurrentSelection] = useState({
    doctor: "",
    department: "",
    day: "",
    start_time: "",
    end_time: "",
  });
  const [validationErrors, setValidationErrors] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Function to get Doctors using API
  const getDoctors = async () => {
    try {
      const response = await axiosInstance.get("/authentication/doctors/");
      //console.log("docc", response.data.doctors);
      setDoctors(response.data.doctors);
    } catch (error) {
      alert("Error fetching Doctors:", error);
    }
  };
  useEffect(() => {
    getDoctors();
  }, []);

  const addAppointment = async () => {
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

      const addedData = {
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
      //console.log("addData",addedData);

      // addedData to your backend API
      try {
        let response = await axiosInstance.post("/appointments/", addedData);

        if (response.status != 201) {
          alert("Failed to save appointments");
        } else {
          console.log("Appointments saved successfully", response.data);
          setCurrentSelection({
            department: "",
            day: "",
            doctor: "",
            start_time: "",
            end_time: "",
          });
          setValidationErrors([]);
        }
      } catch (error) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">
            Appointment Booking System
          </h1>
          <p className="lead text-muted">
            Select multiple appointment slots for different departments
          </p>
        </div>

        {/* Appointment Selection Form */}
        <div className="card shadow-sm mb-4">
          <div className={`card-header bg-primary text-white`}>
            <h5 className="card-title mb-0">
              <i className={`bi bi-plus-circle me-2`}></i>
              Add New Appointment Slot
            </h5>
          </div>
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
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.username}
                    </option>
                  ))}
                </select>
                {!currentSelection.doctor &&
                  validationErrors.some((error) =>
                    error.includes("fill in all fields")
                  ) && (
                    <div className="invalid-feedback">
                      Please select a doctor.
                    </div>
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
                  ) && (
                    <div className="invalid-feedback">Please select a day.</div>
                  )}
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
                className={`btn btn-primary btn-lg `}
                onClick={addAppointment}
              >
                <i className={`bi bi-plus-circle me-2`}></i>
                Add Appointment Slot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
