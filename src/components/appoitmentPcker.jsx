"use client";

// Todo: send appointments to server
// Todo: add validation for slots in server
// Todo: add doctor id in model appointments

/* 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
   "bootstrap": "^5.3.7",
    "bootstrap-icons": "^1.13.1",
*/

import { useState } from "react";

const departments = [
  "ABA",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
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
const isEndTimeAfterStartTime = (startTime, endTime) => {
  if (!startTime || !endTime) return true;

  const startHour = Number.parseInt(startTime.split(":")[0]);
  const endHour = Number.parseInt(endTime.split(":")[0]);

  return endHour > startHour;
};

const isDuplicateTimeSlot = (
  appointments,
  department,
  day,
  startTime,
  endTime,
  excludeId = null
) => {
  return appointments.some(
    (apt) =>
      apt.id !== excludeId && // Exclude current appointment when editing
      apt.department === department &&
      apt.day === day &&
      // Check for exact time match
      ((formatTimeForComparison(apt.startTime) === startTime &&
        formatTimeForComparison(apt.endTime) === endTime) ||
        // Check for overlapping times
        (formatTimeForComparison(apt.startTime) < endTime &&
          formatTimeForComparison(apt.endTime) > startTime))
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
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [currentSelection, setCurrentSelection] = useState({
    department: "",
    day: "",
    startTime: "",
    endTime: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const addOrUpdateAppointment = () => {
    const errors = [];

    // Check if all fields are filled
    if (
      !currentSelection.department ||
      !currentSelection.day ||
      !currentSelection.startTime ||
      !currentSelection.endTime
    ) {
      errors.push("Please fill in all fields");
    }

    // Check if end time is after start time
    if (
      currentSelection.startTime &&
      currentSelection.endTime &&
      !isEndTimeAfterStartTime(
        currentSelection.startTime,
        currentSelection.endTime
      )
    ) {
      errors.push("End time must be after start time");
    }

    // Check for duplicate time slots
    if (
      currentSelection.department &&
      currentSelection.day &&
      currentSelection.startTime &&
      currentSelection.endTime
    ) {
      if (
        isDuplicateTimeSlot(
          selectedAppointments,
          currentSelection.department,
          currentSelection.day,
          currentSelection.startTime,
          currentSelection.endTime,
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
                  startTime: generateTimeString(
                    currentSelection.startTime,
                    currentSelection.day
                  ),
                  endTime: generateTimeString(
                    currentSelection.endTime,
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
          startTime: generateTimeString(
            currentSelection.startTime,
            currentSelection.day
          ),
          endTime: generateTimeString(
            currentSelection.endTime,
            currentSelection.day
          ),
        };
        setSelectedAppointments([...selectedAppointments, newAppointment]);
      }

      setCurrentSelection({
        department: "",
        day: "",
        startTime: "",
        endTime: "",
      });
      setValidationErrors([]);
    }
  };

  const onSend = async () => {
    console.log(selectedAppointments);
  };

  const editAppointment = (appointment) => {
    setCurrentSelection({
      department: appointment.department,
      day: appointment.day,
      startTime: formatTimeForComparison(appointment.startTime),
      endTime: formatTimeForComparison(appointment.endTime),
    });
    setEditingId(appointment.id);
    setValidationErrors([]);
  };

  const cancelEdit = () => {
    setCurrentSelection({
      department: "",
      day: "",
      startTime: "",
      endTime: "",
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
    currentSelection.startTime &&
    currentSelection.endTime &&
    isEndTimeAfterStartTime(
      currentSelection.startTime,
      currentSelection.endTime
    ) &&
    !isDuplicateTimeSlot(
      selectedAppointments,
      currentSelection.department,
      currentSelection.day,
      currentSelection.startTime,
      currentSelection.endTime,
      editingId
    );

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container col-8">
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
          <div
            className={`card-header text-white ${
              editingId ? "bg-warning" : "bg-primary"
            }`}
          >
            <h5 className="card-title mb-0">
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
              {/* Department Selection */}
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
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
                    currentSelection.startTime &&
                    currentSelection.endTime &&
                    !isEndTimeAfterStartTime(
                      currentSelection.startTime,
                      currentSelection.endTime
                    )
                      ? "is-invalid"
                      : ""
                  }`}
                  value={currentSelection.startTime}
                  onChange={(e) => {
                    setCurrentSelection({
                      ...currentSelection,
                      startTime: e.target.value,
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
                    currentSelection.startTime &&
                    currentSelection.endTime &&
                    !isEndTimeAfterStartTime(
                      currentSelection.startTime,
                      currentSelection.endTime
                    )
                      ? "is-invalid"
                      : ""
                  }`}
                  value={currentSelection.endTime}
                  onChange={(e) => {
                    setCurrentSelection({
                      ...currentSelection,
                      endTime: e.target.value,
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
              <div className="row g-3">
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
                                {formatDisplayTime(appointment.startTime)} -{" "}
                                {formatDisplayTime(appointment.endTime)}
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

/* "use client";

import { useState } from "react";

const departments = [
  "ABA",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
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
const isEndTimeAfterStartTime = (startTime, endTime) => {
  if (!startTime || !endTime) return true;

  const startHour = Number.parseInt(startTime.split(":")[0]);
  const endHour = Number.parseInt(endTime.split(":")[0]);

  return endHour > startHour;
};

const isDuplicateTimeSlot = (
  appointments,
  department,
  day,
  startTime,
  endTime,
  excludeId = null
) => {
  return appointments.some(
    (apt) =>
      apt.id !== excludeId && // Exclude current appointment when editing
      apt.department === department &&
      apt.day === day &&
      // Check for exact time match
      ((formatTimeForComparison(apt.startTime) === startTime &&
        formatTimeForComparison(apt.endTime) === endTime) ||
        // Check for overlapping times
        (formatTimeForComparison(apt.startTime) < endTime &&
          formatTimeForComparison(apt.endTime) > startTime))
  );
};

const formatTimeForComparison = (isoString) => {
  const date = new Date(isoString);
  return (
    date.getHours().toString().padStart(2, "0") +
    ":" +
    date.getMinutes().toString().padStart(2, "0")
  );
};

export default function AppointmentBooking() {
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [currentSelection, setCurrentSelection] = useState({
    department: "",
    day: "",
    startTime: "",
    endTime: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const generateTimeString = (time, day) => {
    const today = new Date();
    const targetDate = new Date(today);

    const currentDayIndex = today.getDay();
    const targetDayIndex = daysOfWeek.indexOf(day);

    let daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7;
    if (daysUntilTarget === 0) daysUntilTarget = 7;

    targetDate.setDate(today.getDate() + daysUntilTarget);

    const timeParts = time
      .trim()
      .toUpperCase()
      .match(/(\d+):(\d+)\s*(AM|PM)?/);
    if (!timeParts) throw new Error("Invalid time format");

    const [_, hourStr, minuteStr, meridian] = timeParts;
    let hours = Number.parseInt(hourStr, 10);
    const minutes = Number.parseInt(minuteStr, 10);

    if (meridian) {
      if (meridian === "PM" && hours < 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;
    }

    targetDate.setHours(hours, minutes, 0, 0);
    return targetDate.toISOString();
  };

  const addOrUpdateAppointment = () => {
    const errors = [];

    // Check if all fields are filled
    if (
      !currentSelection.department ||
      !currentSelection.day ||
      !currentSelection.startTime ||
      !currentSelection.endTime
    ) {
      errors.push("Please fill in all fields");
    }

    // Check if end time is after start time
    if (
      currentSelection.startTime &&
      currentSelection.endTime &&
      !isEndTimeAfterStartTime(
        currentSelection.startTime,
        currentSelection.endTime
      )
    ) {
      errors.push("End time must be after start time");
    }

    // Check for duplicate time slots
    if (
      currentSelection.department &&
      currentSelection.day &&
      currentSelection.startTime &&
      currentSelection.endTime
    ) {
      if (
        isDuplicateTimeSlot(
          selectedAppointments,
          currentSelection.department,
          currentSelection.day,
          currentSelection.startTime,
          currentSelection.endTime,
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
                  startTime: generateTimeString(
                    currentSelection.startTime,
                    currentSelection.day
                  ),
                  endTime: generateTimeString(
                    currentSelection.endTime,
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
          startTime: generateTimeString(
            currentSelection.startTime,
            currentSelection.day
          ),
          endTime: generateTimeString(
            currentSelection.endTime,
            currentSelection.day
          ),
        };
        setSelectedAppointments([...selectedAppointments, newAppointment]);
      }

      setCurrentSelection({
        department: "",
        day: "",
        startTime: "",
        endTime: "",
      });
      setValidationErrors([]);
    }
  };

  const editAppointment = (appointment) => {
    setCurrentSelection({
      department: appointment.department,
      day: appointment.day,
      startTime: formatTimeForComparison(appointment.startTime),
      endTime: formatTimeForComparison(appointment.endTime),
    });
    setEditingId(appointment.id);
    setValidationErrors([]);
  };

  const cancelEdit = () => {
    setCurrentSelection({
      department: "",
      day: "",
      startTime: "",
      endTime: "",
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
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isFormValid =
    currentSelection.department &&
    currentSelection.day &&
    currentSelection.startTime &&
    currentSelection.endTime &&
    isEndTimeAfterStartTime(
      currentSelection.startTime,
      currentSelection.endTime
    ) &&
    !isDuplicateTimeSlot(
      selectedAppointments,
      currentSelection.department,
      currentSelection.day,
      currentSelection.startTime,
      currentSelection.endTime,
      editingId
    );

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">
            Appointment Booking System
          </h1>
          <p className="lead text-muted">
            Select multiple appointment slots for different departments
          </p>
        </div>

      
        <div className="card shadow-sm mb-4">
          <div
            className={`card-header text-white ${
              editingId ? "bg-warning" : "bg-primary"
            }`}
          >
            <h5 className="card-title mb-0">
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
            
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
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

              
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-clock me-1"></i>
                  Start Time
                </label>
                <select
                  className={`form-select ${
                    currentSelection.startTime &&
                    currentSelection.endTime &&
                    !isEndTimeAfterStartTime(
                      currentSelection.startTime,
                      currentSelection.endTime
                    )
                      ? "is-invalid"
                      : ""
                  }`}
                  value={currentSelection.startTime}
                  onChange={(e) => {
                    setCurrentSelection({
                      ...currentSelection,
                      startTime: e.target.value,
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

             
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-clock me-1"></i>
                  End Time
                </label>
                <select
                  className={`form-select ${
                    currentSelection.startTime &&
                    currentSelection.endTime &&
                    !isEndTimeAfterStartTime(
                      currentSelection.startTime,
                      currentSelection.endTime
                    )
                      ? "is-invalid"
                      : ""
                  }`}
                  value={currentSelection.endTime}
                  onChange={(e) => {
                    setCurrentSelection({
                      ...currentSelection,
                      endTime: e.target.value,
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

        
        {selectedAppointments.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">
                Selected Appointment Slots ({selectedAppointments.length})
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {selectedAppointments.map((appointment) => (
                  <div key={appointment.id} className="col-12">
                    <div
                      className={`card border-start border-4 ${
                        editingId === appointment.id
                          ? "border-warning bg-warning bg-opacity-10"
                          : "border-primary"
                      }`}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex flex-wrap align-items-center gap-3">
                            <span
                              className={`badge fs-6 px-3 py-2 ${
                                editingId === appointment.id
                                  ? "bg-warning text-dark"
                                  : "bg-primary"
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
                                {formatDisplayTime(appointment.startTime)} -{" "}
                                {formatDisplayTime(appointment.endTime)}
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
                              className="btn btn-outline-primary btn-sm"
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
        )}

       
        {selectedAppointments.length === 0 && (
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
              <h3 className="text-muted mb-2">No appointments selected</h3>
              <p className="text-muted">
                Add your first appointment slot using the form above
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} */

/* "use client";
import React, { useState } from "react";
import { Calendar, Clock, Users, Plus, Trash2 } from "lucide-react";
export default function Appointment() {
  const departments = [
    "ABA",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
  ];

  const daysOfWeek = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
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

  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [currentSelection, setCurrentSelection] = useState({
    department: "",
    day: "",
    startTime: "",
    endTime: "",
  });

  return <div></div>;
} */

/*   "use client"

import { useState } from "react"


const departments = ["ABA", "Cardiology", "Dermatology", "Neurology", "Orthopedics", "Pediatrics"]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

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
]

// Validation functions
const isEndTimeAfterStartTime = (startTime, endTime) => {
  if (!startTime || !endTime) return true // Allow empty values

  const startHour = Number.parseInt(startTime.split(":")[0])
  const endHour = Number.parseInt(endTime.split(":")[0])

  return endHour > startHour
}

const isDuplicateTimeSlot = (
  appointments,
  department,
  day,
  startTime,
  endTime,
) => {
  return appointments.some(
    (apt) =>
      apt.department === department &&
      apt.day === day &&
      // Check for exact time match
      ((formatTimeForComparison(apt.startTime) === startTime && formatTimeForComparison(apt.endTime) === endTime) ||
        // Check for overlapping times
        (formatTimeForComparison(apt.startTime) < endTime && formatTimeForComparison(apt.endTime) > startTime)),
  )
}

const formatTimeForComparison = (isoString) => {
  const date = new Date(isoString)
  return date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0")
}

export default function AppointmentBooking() {
  const [selectedAppointments, setSelectedAppointments] = useState([])
  const [currentSelection, setCurrentSelection] = useState({
    department: "",
    day: "",
    startTime: "",
    endTime: "",
  })

  const [validationErrors, setValidationErrors] = useState([])

  const generateTimeString = (time, day) => {
    const today = new Date()
    const targetDate = new Date(today)

    const currentDayIndex = today.getDay()
    const targetDayIndex = daysOfWeek.indexOf(day)

    let daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7
    if (daysUntilTarget === 0) daysUntilTarget = 7

    targetDate.setDate(today.getDate() + daysUntilTarget)

    const timeParts = time
      .trim()
      .toUpperCase()
      .match(/(\d+):(\d+)\s*(AM|PM)?/)
    if (!timeParts) throw new Error("Invalid time format")

    const [_, hourStr, minuteStr, meridian] = timeParts
    let hours = Number.parseInt(hourStr, 10)
    const minutes = Number.parseInt(minuteStr, 10)

    if (meridian) {
      if (meridian === "PM" && hours < 12) hours += 12
      if (meridian === "AM" && hours === 12) hours = 0
    }

    targetDate.setHours(hours, minutes, 0, 0)
    return targetDate.toISOString()
  }

  const addAppointment = () => {
    const errors = []

    // Check if all fields are filled
    if (
      !currentSelection.department ||
      !currentSelection.day ||
      !currentSelection.startTime ||
      !currentSelection.endTime
    ) {
      errors.push("Please fill in all fields")
    }

    // Check if end time is after start time
    if (
      currentSelection.startTime &&
      currentSelection.endTime &&
      !isEndTimeAfterStartTime(currentSelection.startTime, currentSelection.endTime)
    ) {
      errors.push("End time must be after start time")
    }

    // Check for duplicate time slots
    if (currentSelection.department && currentSelection.day && currentSelection.startTime && currentSelection.endTime) {
      if (
        isDuplicateTimeSlot(
          selectedAppointments,
          currentSelection.department,
          currentSelection.day,
          currentSelection.startTime,
          currentSelection.endTime,
        )
      ) {
        errors.push(`Time slot already exists for ${currentSelection.department} on ${currentSelection.day}`)
      }
    }

    setValidationErrors(errors)

    if (errors.length === 0) {
      const newAppointment = {
        id: Date.now().toString(),
        department: currentSelection.department,
        day: currentSelection.day,
        startTime: generateTimeString(currentSelection.startTime, currentSelection.day),
        endTime: generateTimeString(currentSelection.endTime, currentSelection.day),
      }

      setSelectedAppointments([...selectedAppointments, newAppointment])
      setCurrentSelection({
        department: "",
        day: "",
        startTime: "",
        endTime: "",
      })
      setValidationErrors([])
    }
  }

  const removeAppointment = (id) => {
    setSelectedAppointments(selectedAppointments.filter((apt) => apt.id !== id))
  }

  const formatDisplayTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const isFormValid =
    currentSelection.department &&
    currentSelection.day &&
    currentSelection.startTime &&
    currentSelection.endTime &&
    isEndTimeAfterStartTime(currentSelection.startTime, currentSelection.endTime) &&
    !isDuplicateTimeSlot(
      selectedAppointments,
      currentSelection.department,
      currentSelection.day,
      currentSelection.startTime,
      currentSelection.endTime,
    )

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
       
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">Appointment Booking System</h1>
          <p className="lead text-muted">Select multiple appointment slots for different departments</p>
        </div>

       
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="card-title mb-0">
              <i className="bi bi-plus-circle me-2"></i>
              Add New Appointment Slot
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-4">
              
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-people me-1"></i>
                  Department
                </label>
                <select
                  className="form-select"
                  value={currentSelection.department}
                  onChange={(e) => setCurrentSelection({ ...currentSelection, department: e.target.value })}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

             
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar me-1"></i>
                  Day
                </label>
                <select
                  className="form-select"
                  value={currentSelection.day}
                  onChange={(e) => setCurrentSelection({ ...currentSelection, day: e.target.value })}
                >
                  <option value="">Select day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-clock me-1"></i>
                  Start Time
                </label>
                <select
                  className={`form-select ${currentSelection.startTime && currentSelection.endTime && !isEndTimeAfterStartTime(currentSelection.startTime, currentSelection.endTime) ? "is-invalid" : ""}`}
                  value={currentSelection.startTime}
                  onChange={(e) => {
                    setCurrentSelection({ ...currentSelection, startTime: e.target.value })
                    setValidationErrors([])
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

              
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-clock me-1"></i>
                  End Time
                </label>
                <select
                  className={`form-select ${currentSelection.startTime && currentSelection.endTime && !isEndTimeAfterStartTime(currentSelection.startTime, currentSelection.endTime) ? "is-invalid" : ""}`}
                  value={currentSelection.endTime}
                  onChange={(e) => {
                    setCurrentSelection({ ...currentSelection, endTime: e.target.value })
                    setValidationErrors([])
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

            <button
              className={`btn btn-primary btn-lg ${!isFormValid ? "disabled" : ""}`}
              onClick={addAppointment}
              disabled={!isFormValid}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add Appointment Slot
            </button>
          </div>
        </div>

        
        {selectedAppointments.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">Selected Appointment Slots ({selectedAppointments.length})</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {selectedAppointments.map((appointment) => (
                  <div key={appointment.id} className="col-12">
                    <div className="card border-start border-primary border-4">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex flex-wrap align-items-center gap-3">
                            <span className="badge bg-primary fs-6 px-3 py-2">{appointment.department}</span>
                            <div className="d-flex align-items-center text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              <small>{appointment.day}</small>
                            </div>
                            <div className="d-flex align-items-center text-muted">
                              <i className="bi bi-clock me-1"></i>
                              <small>
                                {formatDisplayTime(appointment.startTime)} - {formatDisplayTime(appointment.endTime)}
                              </small>
                            </div>
                          </div>
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
                ))}
              </div>
            </div>
          </div>
        )}

       
        {selectedAppointments.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-code-square me-2"></i>
                Generated Request Data
              </h5>
            </div>
            <div className="card-body">
              <pre className="bg-light p-3 rounded border overflow-auto" style={{ fontSize: "0.875rem" }}>
                {JSON.stringify(
                  selectedAppointments.map((apt) => ({
                    department: apt.department,
                    day: apt.day,
                    startTime: apt.startTime,
                    endTime: apt.endTime,
                  })),
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        )}

        
        {selectedAppointments.length === 0 && (
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
              <h3 className="text-muted mb-2">No appointments selected</h3>
              <p className="text-muted">Add your first appointment slot using the form above</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} */

/* 

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface AppointmentSlot {
  id: string
  department: string
  day: string
  startTime: string
  endTime: string
}


export default function AppointmentBooking() {
  

  const generateTimeString = (time: string, day: string) => {
    // Create a date string for the selected day and time
    const today = new Date()
    const dayIndex = daysOfWeek.indexOf(day)
    const targetDate = new Date(today)

    // Calculate days until target day
    const currentDay = today.getDay()
    const daysUntilTarget = (dayIndex + 1 - currentDay + 7) % 7
    targetDate.setDate(today.getDate() + daysUntilTarget)

    // Set the time
    const [hours, minutes] = time.split(":")
    targetDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

    return targetDate.toISOString()
  }

  const addAppointment = () => {
    if (currentSelection.department && currentSelection.day && currentSelection.startTime && currentSelection.endTime) {
      const newAppointment: AppointmentSlot = {
        id: Date.now().toString(),
        department: currentSelection.department,
        day: currentSelection.day,
        startTime: generateTimeString(currentSelection.startTime, currentSelection.day),
        endTime: generateTimeString(currentSelection.endTime, currentSelection.day),
      }

      setSelectedAppointments([...selectedAppointments, newAppointment])
      setCurrentSelection({
        department: "",
        day: "",
        startTime: "",
        endTime: "",
      })
    }
  }

  const removeAppointment = (id: string) => {
    setSelectedAppointments(selectedAppointments.filter((apt) => apt.id !== id))
  }

  const formatDisplayTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Appointment Booking System</h1>
          <p className="mt-2 text-gray-600">Select multiple appointment slots for different departments</p>
        </div>

       // Appointment Selection Form 
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Appointment Slot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              // Department Selection 
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Department</label>
                <Select
                  value={currentSelection.department}
                  onValueChange={(value) => setCurrentSelection({ ...currentSelection, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {dept}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              // Day Selection 
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Day</label>
                <Select
                  value={currentSelection.day}
                  onValueChange={(value) => setCurrentSelection({ ...currentSelection, day: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {day}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              // Start Time Selection 
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Time</label>
                <Select
                  value={currentSelection.startTime}
                  onValueChange={(value) => setCurrentSelection({ ...currentSelection, startTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {slot.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

             // End Time Selection 
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Time</label>
                <Select
                  value={currentSelection.endTime}
                  onValueChange={(value) => setCurrentSelection({ ...currentSelection, endTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {slot.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={addAppointment}
              className="w-full md:w-auto"
              disabled={
                !currentSelection.department ||
                !currentSelection.day ||
                !currentSelection.startTime ||
                !currentSelection.endTime
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment Slot
            </Button>
          </CardContent>
        </Card>

        // Selected Appointments Display 
        {selectedAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Appointment Slots ({selectedAppointments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {appointment.department}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {appointment.day}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {formatDisplayTime(appointment.startTime)} - {formatDisplayTime(appointment.endTime)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAppointment(appointment.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        // JSON Output Display 
        {selectedAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Request Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(
                  selectedAppointments.map((apt) => ({
                    department: apt.department,
                    day: apt.day,
                    startTime: apt.startTime,
                    endTime: apt.endTime,
                  })),
                  null,
                  2,
                )}
              </pre>
            </CardContent>
          </Card>
        )}

        {selectedAppointments.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments selected</h3>
              <p className="text-gray-600">Add your first appointment slot using the form above</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
 */