"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/helper/axiosSetup";

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

const timeSlots = [
  { label: "9:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "1:00 PM", value: "13:00" },
  { label: "2:00 PM", value: "14:00" },
  { label: "3:00 PM", value: "15:00" },
  { label: "4:00 PM", value: "16:00" },
  { label: "5:00 PM", value: "17:00" },
];

// Validation functions
const isEndTimeAfterStartTime = (start_time, end_time) => {
  if (!start_time || !end_time) return true;

  const startHour = Number.parseInt(start_time.split(":")[0]);
  const endHour = Number.parseInt(end_time.split(":")[0]);

  return endHour > startHour;
};

const isDuplicateTimeSlot = (
  appointments,
  department,
  day,
  start_time,
  end_time,
  excludeId = null
) => {
  return appointments.some(
    (apt) =>
      apt.id !== excludeId && // Exclude current appointment when editing
      apt.department === department &&
      apt.day === day &&
      // Check for exact time match
      ((formatTimeForComparison(apt.start_time) === start_time &&
        formatTimeForComparison(apt.end_time) === end_time) ||
        // Check for overlapping times
        (formatTimeForComparison(apt.start_time) < end_time &&
          formatTimeForComparison(apt.end_time) > start_time))
  );
};

const generateTimeString = (time, day) => {
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

  // Parse the time (e.g., "09:00" or "13:00")
  const [hours, minutes] = time
    .split(":")
    .map((num) => Number.parseInt(num, 10));

  // Set the time in UTC
  targetDate.setUTCHours(hours, minutes || 0, 0, 0);

  return targetDate.toISOString();
};

const formatTimeForComparison = (isoString) => {
  const date = new Date(isoString);
  // Use UTC methods to get consistent time
  return (
    date.getUTCHours().toString().padStart(2, "0") +
    ":" +
    date.getUTCMinutes().toString().padStart(2, "0")
  );
};

export default function AppointmentBooking() {
  const [doctors, setDoctors] = useState([]);
  // Fetch doctors from the API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axiosInstance.get("/authentication/doctors");
        setDoctors(response.data);
        console.log("Doctors fetched successfully:", response.data);
      } catch (error) {
        alert("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [currentSelection, setCurrentSelection] = useState({
    department: "",
    day: "",
    start_time: "",
    end_time: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const addOrUpdateAppointment = () => {
    const errors = [];

    // Check if all fields are filled
    if (
      !currentSelection.department ||
      !currentSelection.day ||
      !currentSelection.start_time ||
      !currentSelection.end_time
    ) {
      errors.push("Please fill in all fields");
    }

    // Check if end time is after start time
    if (
      currentSelection.start_time &&
      currentSelection.end_time &&
      !isEndTimeAfterStartTime(
        currentSelection.start_time,
        currentSelection.end_time
      )
    ) {
      errors.push("End time must be after start time");
    }

    // Check for duplicate time slots
    if (
      currentSelection.department &&
      currentSelection.day &&
      currentSelection.start_time &&
      currentSelection.end_time
    ) {
      if (
        isDuplicateTimeSlot(
          selectedAppointments,
          currentSelection.department,
          currentSelection.day,
          currentSelection.start_time,
          currentSelection.end_time,
          editingId // Exclude current appointment when editing
        )
      ) {
        errors.push(
          `Time slot already exists for ${currentSelection.department} on ${currentSelection.day}`
        );
      }
    }

    setValidationErrors(errors);

    if (errors.length === 0) {
      if (editingId) {
        // Update existing appointment
        setSelectedAppointments(
          selectedAppointments.map((apt) =>
            apt.id === editingId
              ? {
                  ...apt,
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
                }
              : apt
          )
        );
        setEditingId(null);
      } else {
        // Add new appointment
        const newAppointment = {
          id: Date.now().toString(),
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
        setSelectedAppointments([...selectedAppointments, newAppointment]);
      }

      setCurrentSelection({
        department: "",
        day: "",
        start_time: "",
        end_time: "",
      });
      setValidationErrors([]);
    }
  };

  const onSend = async () => {
    console.log("Selected Appointments:", selectedAppointments);
    const appointments = selectedAppointments.map(({ id, ...rest }) => ({
      ...rest,
      doctor: "68598f6206c1113a888c6811",
    }));
    console.log("Formatted Appointments for API:", appointments);
    try {
      const response = await axiosInstance.post("/appointments/", appointments);

      if (!response.ok) {
        alert("Failed to save appointments");
      }

      const data = await response.data;
      console.log("Appointments saved successfully:", data);
      // Optionally, reset the form or show a success message
    } catch (error) {
      alert("Error saving appointments:", error);
    }
  };

  const editAppointment = (appointment) => {
    setCurrentSelection({
      department: appointment.department,
      day: appointment.day,
      start_time: formatTimeForComparison(appointment.start_time),
      end_time: formatTimeForComparison(appointment.end_time),
    });
    setEditingId(appointment.id);
    setValidationErrors([]);
  };

  const cancelEdit = () => {
    setCurrentSelection({
      department: "",
      day: "",
      start_time: "",
      end_time: "",
    });
    setEditingId(null);
    setValidationErrors([]);
  };

  const removeAppointment = (id) => {
    setSelectedAppointments(
      selectedAppointments.filter((apt) => apt.id !== id)
    );
    if (editingId === id) {
      cancelEdit();
    }
  };

  const formatDisplayTime = (isoString) => {
    const date = new Date(isoString);
    // Format using UTC time to match what was stored
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    // Convert to 12-hour format
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const isFormValid =
    currentSelection.department &&
    currentSelection.day &&
    currentSelection.start_time &&
    currentSelection.end_time &&
    isEndTimeAfterStartTime(
      currentSelection.start_time,
      currentSelection.end_time
    ) &&
    !isDuplicateTimeSlot(
      selectedAppointments,
      currentSelection.department,
      currentSelection.day,
      currentSelection.start_time,
      currentSelection.end_time,
      editingId
    );

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container ">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">Appointment Booking System</h1>
          <p className="lead text-muted">
            Select multiple appointment slots for different departments
          </p>
        </div>

        {/* Appointment Selection Form */}
        <div className="card shadow-sm mb-4">
          <div
            className={`card-header text-white ${
              editingId ? "bg-warning" : "bg-primary"
            }`}
          >
            <h5 className="card-title mb-0 text-white">
              <i
                className={`bi ${
                  editingId ? "bi-pencil-square" : "bi-plus-circle"
                } me-2`}
              ></i>
              {editingId ? "Edit Appointment Slot" : "Add New Appointment Slot"}
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-4">
              {/* Doctor Selection */}
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold ">
                  <i className="bi bi-person me-1"></i>
                  Doctor
                </label>
                <select
                  className="form-select"
                  value={currentSelection.doctor}
                  onChange={(e) =>
                    setCurrentSelection({
                      ...currentSelection,
                      doctor: e.target.value,
                    })
                  }
                >
                  <option value="">Select doctor</option>
                  {doctors.doctors?.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.email_1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Selection */}
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold ">
                  <i className="bi bi-people me-1"></i>
                  Department
                </label>
                <select
                  className="form-select"
                  value={currentSelection.department}
                  onChange={(e) =>
                    setCurrentSelection({
                      ...currentSelection,
                      department: e.target.value,
                    })
                  }
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Selection */}
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar me-1"></i>
                  Day
                </label>
                <select
                  className="form-select"
                  value={currentSelection.day}
                  onChange={(e) =>
                    setCurrentSelection({
                      ...currentSelection,
                      day: e.target.value,
                    })
                  }
                >
                  <option value="">Select day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time Selection */}
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-clock me-1"></i>
                  Start Time
                </label>
                <select
                  className={`form-select ${
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
                >
                  <option value="">Start time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* End Time Selection */}
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-clock me-1"></i>
                  End Time
                </label>
                <select
                  className={`form-select ${
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
                >
                  <option value="">End time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Please fix the following errors:</strong>
                <ul className="mb-0 mt-2">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="d-flex gap-2">
              <button
                className={`btn ${
                  editingId ? "btn-warning" : "btn-primary"
                } btn-lg ${!isFormValid ? "disabled" : ""}`}
                onClick={addOrUpdateAppointment}
                disabled={!isFormValid}
              >
                <i
                  className={`bi ${
                    editingId ? "bi-check-circle" : "bi-plus-circle"
                  } me-2`}
                ></i>
                {editingId ? "Update Appointment" : "Add Appointment Slot"}
              </button>

              {editingId && (
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={cancelEdit}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Selected Appointments Display */}
        {selectedAppointments.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white py-4">
              <h5 className="card-title mb-0">
                Selected Appointment Slots ({selectedAppointments.length})
              </h5>
            </div>
            <div
              className="card-body"
              style={{ maxHeight: "400px", overflowY: "scroll" }}
            >
              <div className="row g-3 fs-5">
                {selectedAppointments.map((appointment) => (
                  <div key={appointment.id} className="col-12">
                    <div
                      className={`card border-start border ${
                        editingId === appointment.id
                          ? "border-warning bg-warning bg-opacity-10"
                          : "border-dark border-opacity-25"
                      }`}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex flex-wrap align-items-center gap-3">
                            <span
                              className={`badge  px-3 py-2 ${
                                editingId === appointment.id
                                  ? "bg-warning text-dark"
                                  : "bg-dark bg-opacity-75"
                              }`}
                            >
                              {appointment.department}
                            </span>
                            <div className="d-flex align-items-center text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              <small>{appointment.day}</small>
                            </div>
                            <div className="d-flex align-items-center text-muted">
                              <i className="bi bi-clock me-1"></i>
                              <small>
                                {formatTimeForComparison(
                                  appointment.start_time
                                )}{" "}
                                -{" "}
                                {formatTimeForComparison(appointment.end_time)}
                              </small>
                            </div>
                            {editingId === appointment.id && (
                              <span className="badge bg-warning text-dark">
                                <i className="bi bi-pencil me-1"></i>
                                Editing
                              </span>
                            )}
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => editAppointment(appointment)}
                              disabled={editingId === appointment.id}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeAppointment(appointment.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* JSON Output Display 
        {selectedAppointments.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-code-square me-2"></i>
                Generated Request Data
              </h5>
            </div>
            <div className="card-body">
              <pre
                className="bg-light p-3 rounded border overflow-auto"
                style={{ fontSize: "0.875rem" }}
              >
                {JSON.stringify(
                  selectedAppointments.map((apt) => ({
                    department: apt.department,
                    day: apt.day,
                    startTime: apt.startTime,
                    endTime: apt.endTime,
                  })),
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}*/}

        {/* Empty State */}
        {selectedAppointments.length === 0 && (
          <div className="card shadow-sm my-4">
            <div className="card-body text-center py-5">
              <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
              <h3 className="text-muted mb-2">No appointments selected</h3>
              <p className="text-muted">
                Add your first appointment slot using the form above
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          className={`btn btn-success btn-lg`}
          onClick={onSend}
          disabled={!selectedAppointments.length > 0}
        >
          <i className={`bi bi-send-fill me-2`}></i>
          Save
        </button>
      </div>
    </div>
  );
}
