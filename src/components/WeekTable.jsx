"use client";

import { convertUTCTo12Hour } from "@/helper/DateTime";
import { useState, useMemo } from "react";

// Sample appointments data
/* const sampleAppointments = [
  {
    _id: "6863d146131d50f524a560a7",
    doctor: "Dr. Ali",
    department: "ABA",
    day: "Tuesday",
    start_time: "2025-01-07T10:00:00.000Z",
    end_time: "2025-01-07T11:00:00.000Z",
  },
  {
    _id: "6863d146131d50f524a560a8",
    doctor: "Dr. Sarah",
    department: "Cardiology",
    day: "Tuesday",
    start_time: "2025-01-07T10:00:00.000Z",
    end_time: "2025-01-07T11:00:00.000Z",
  },
  {
    _id: "6863d146131d50f524a560a9",
    doctor: "Dr. Johnson",
    department: "Neurology",
    day: "Monday",
    start_time: "2025-01-06T14:00:00.000Z",
    end_time: "2025-01-06T15:30:00.000Z",
  },
  {
    _id: "6863d146131d50f524a560b0",
    doctor: "Dr. Brown",
    department: "Orthopedics",
    day: "Wednesday",
    start_time: "2025-01-08T09:00:00.000Z",
    end_time: "2025-01-08T10:00:00.000Z",
  },
  {
    _id: "6863d146131d50f524a560b1",
    doctor: "Dr. Davis",
    department: "Pediatrics",
    day: "Wednesday",
    start_time: "2025-01-08T09:00:00.000Z",
    end_time: "2025-01-08T10:00:00.000Z",
  },
  {
    _id: "6863d146131d50f524a560b2",
    doctor: "Dr. Wilson",
    department: "Dermatology",
    day: "Thursday",
    start_time: "2025-01-09T16:00:00.000Z",
    end_time: "2025-01-09T17:00:00.000Z",
  },
  {
    _id: "6863d146131d50f524a560b3",
    doctor: "Dr. Miller",
    department: "Psychiatry",
    day: "Friday",
    start_time: "2025-01-10T11:00:00.000Z",
    end_time: "2025-01-10T12:00:00.000Z",
  },
  {
    _id: "6863d146131d50f524a560b4",
    doctor: "Dr. Garcia",
    department: "ABA",
    day: "Friday",
    start_time: "2025-01-10T11:00:00.000Z",
    end_time: "2025-01-10T12:00:00.000Z",
  },
  {
    _id: "6863d146131d50f524a560b5",
    doctor: "Dr. Smith",
    department: "ABA",
    day: "Tuesday",
    start_time: "2025-01-07T14:00:00.000Z",
    end_time: "2025-01-07T15:00:00.000Z",
  },
  {
    _id: "6863d146131d50f524a560b6",
    doctor: "Dr. Jones",
    department: "Cardiology",
    day: "Monday",
    start_time: "2025-01-06T09:00:00.000Z",
    end_time: "2025-01-06T10:00:00.000Z",
  },
]; */

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const departments = [
  "PhysicalTherapy",
  "ABA",
  "OccupationalTherapy",
  "SpecialEducation",
  "Speech",
  "ay7aga",
];

// Styles object
const styles = {
  container: {
    backgroundColor: "#f8f9fa",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    minHeight: "100vh",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    transition: "all 0.2s ease-in-out",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#ffffff",
  },
  cardHover: {
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  table: {
    borderRadius: "0.375rem",
    overflow: "hidden",
  },
  tableCell: {
    height: "80px",
    transition: "background-color 0.2s ease-in-out",
    verticalAlign: "middle",
  },
  appointmentCard: {
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
  },
  modal: {
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1050,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  modalContent: {
    borderRadius: "0.5rem",
    border: "none",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    borderRadius: "0.5rem 0.5rem 0 0",
    padding: "1rem 1.5rem",
  },
};
const colorMap = {
  ABA: { bg: "#3b82f6", border: "#2563eb", text: "#ffffff" },
  ay7aga: { bg: "#ef4444", border: "#dc2626", text: "#ffffff" },
  PhysicalTherapy: { bg: "#10b981", border: "#059669", text: "#ffffff" },
  OccupationalTherapy: {
    bg: "#f59e0b",
    border: "#d97706",
    text: "#ffffff",
  },
  SpecialEducation: { bg: "#06b6d4", border: "#0891b2", text: "#ffffff" },
  Speech: { bg: "#6b7280", border: "#4b5563", text: "#ffffff" },
};
export default function ImprovedCalendar({ evaluations }) {
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Department color mapping
  const getDepartmentColors = (department) => {
    return (
      colorMap[department] || {
        bg: "#3b82f6",
        border: "#2563eb",
        text: "#ffffff",
      }
    );
  };

  // Group appointments by day and department
  const groupedAppointments = useMemo(() => {
    const grouped = {};

    // Initialize the structure
    daysOfWeek.forEach((day) => {
      grouped[day] = {};
      departments.forEach((dept) => {
        grouped[day][dept] = [];
      });
    });

    // Group appointments
    evaluations.forEach((appointment) => {
      if (
        grouped[appointment.day] &&
        grouped[appointment.day][appointment.department]
      ) {
        grouped[appointment.day][appointment.department].push(appointment);
      }
    });

    return grouped;
  }, [evaluations]);

  // Handle cell click
  const handleCellClick = (day, department) => {
    const appointments = groupedAppointments[day][department];
    if (appointments.length > 0) {
      setSelectedAppointments(appointments);
      setSelectedCell({ day, department });
      setShowModal(true);
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    return convertUTCTo12Hour(dateString);
  };

  // Get appointment summary for cell
  const getAppointmentSummary = (appointments) => {
    if (appointments.length === 0) return null;

    return appointments;
    /* if (appointments.length === 1) {
      return {
        title: "Dr. " + appointments[0].doctor.username,
        subtitle: formatTime(appointments[0].start_time),
        count: 1,
      };
    }
    return {
      title: `${appointments.length} Appointments`,
      subtitle: `${appointments.length} doctors`,
      count: appointments.length,
    }; */
  };

  return (
    <div style={styles.container}>
      <div className="container-fluid py-4" style={{ maxWidth: "1400px" }}>
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <h1 className="h3 mb-0 text-primary fw-bold">Weekly Schedule</h1>
              {/* <div className="d-flex align-items-center gap-3 flex-wrap">
                <div className="badge bg-primary text-white px-3 py-2">
                  {evaluations.length} Total Appointments
                </div>
                <div className="badge bg-success text-white px-3 py-2">
                  {new Set(evaluations.map((a) => a.doctor)).size} Doctors
                </div>
                <div className="badge bg-info text-white px-3 py-2">
                  {departments.length} Departments
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm" style={styles.card}>
              <div className="card-body p-0">
                <div className="table-responsive" style={styles.table}>
                  <table className="table table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th
                          className="text-center py-3 fw-bold text-primary"
                          style={{ width: "120px", borderTop: "none" }}
                        >
                          Day / Department
                        </th>
                        {departments.map((department) => (
                          <th
                            key={department}
                            className="text-center py-3 fw-bold text-primary"
                            style={{ borderTop: "none" }}
                          >
                            <div className="d-flex flex-column align-items-center">
                              <span
                                className="badge mb-1"
                                style={{
                                  backgroundColor:
                                    getDepartmentColors(department).bg,
                                  color: getDepartmentColors(department).text,
                                  fontWeight: "500",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ●
                              </span>
                              <span>{department}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {daysOfWeek.map((day) => (
                        <tr key={day}>
                          <td
                            className="text-center align-middle bg-light fw-bold text-primary py-3"
                            style={styles.tableCell}
                          >
                            {day}
                          </td>
                          {departments.map((department) => {
                            const appointments =
                              groupedAppointments[day][department];
                            const summary = getAppointmentSummary(appointments);
                            const colors = getDepartmentColors(department);
                            const cellKey = `${day}-${department}`;

                            console.log("yy", summary);

                            return (
                              <td
                                key={cellKey}
                                className="p-2 align-middle text-center position-relative"
                                style={{
                                  ...styles.tableCell,
                                  cursor:
                                    appointments.length > 0
                                      ? "pointer"
                                      : "default",
                                  backgroundColor:
                                    appointments.length > 0
                                      ? `${colors.bg}10`
                                      : "transparent",
                                }}
                                onClick={() => handleCellClick(day, department)}
                                onMouseEnter={(e) => {
                                  if (appointments.length > 0) {
                                    e.currentTarget.style.backgroundColor =
                                      "rgba(59, 130, 246, 0.05)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    appointments.length > 0
                                      ? `${colors.bg}10`
                                      : "transparent";
                                }}
                              >
                                {summary && (
                                  <div className="h-100 p-1 d-flex flex-column justify-content-center">
                                    <div
                                      className="card border-0 shadow-sm h-100"
                                      style={{
                                        ...styles.appointmentCard,
                                        backgroundColor: colors.bg,
                                        color: colors.text,
                                        transform:
                                          hoveredCard === cellKey
                                            ? "translateY(-2px)"
                                            : "translateY(0)",
                                        boxShadow:
                                          hoveredCard === cellKey
                                            ? "0 4px 12px rgba(0,0,0,0.15)"
                                            : "0 1px 3px rgba(0,0,0,0.1)",
                                      }}
                                      onMouseEnter={() =>
                                        setHoveredCard(cellKey)
                                      }
                                      onMouseLeave={() => setHoveredCard(null)}
                                    >
                                      <div
                                        className="card-body p-2 d-flex flex-column justify-content-center h-100"
                                        style={{ color: "white" }}
                                      >
                                        {summary.map((item, index) => (
                                          <div
                                            key={index}
                                            className="fw-bold"
                                            style={{ fontSize: "0.85rem" }}
                                          >
                                            Dr. {item.doctor.username}:{" "}
                                            {convertUTCTo12Hour(
                                              item.start_time
                                            )}{" "}
                                            -{" "}
                                            {convertUTCTo12Hour(item.end_time)}
                                          </div>
                                        ))}

                                        {/*  <div
                                          className="small opacity-75"
                                          style={{ fontSize: "0.75rem" }}
                                        >
                                          {summary.subtitle}
                                        </div>
                                        {summary.count > 1 && (
                                          <span
                                            className="badge bg-light text-dark rounded-pill m-2"
                                            style={{
                                              fontSize: "0.7rem",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {summary.count}
                                          </span>
                                        )} */}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics 
        <div className="row mt-4">
          <div className="col-md-3 mb-3">
            <div
              className="card text-center border-primary"
              style={styles.card}
            >
              <div className="card-body">
                <h5 className="card-title text-primary">
                  {evaluations.length}
                </h5>
                <p className="card-text text-muted">Total Appointments</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div
              className="card text-center border-success"
              style={styles.card}
            >
              <div className="card-body">
                <h5 className="card-title text-success">
                  {new Set(evaluations.map((a) => a.doctor)).size}
                </h5>
                <p className="card-text text-muted">Doctors</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div
              className="card text-center border-warning"
              style={styles.card}
            >
              <div className="card-body">
                <h5 className="card-title text-warning">
                  {departments.length}
                </h5>
                <p className="card-text text-muted">Departments</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-center border-info" style={styles.card}>
              <div className="card-body">
                <h5 className="card-title text-info">
                  {Object.values(groupedAppointments).reduce(
                    (acc, dayData) =>
                      acc +
                      Object.values(dayData).reduce(
                        (dayAcc, appointments) => dayAcc + appointments.length,
                        0
                      ),
                    0
                  )}
                </h5>
                <p className="card-text text-muted">Scheduled Slots</p>
              </div>
            </div>
          </div>
        </div>*/}

        {/* Department Summary 
        <div className="row mt-4">
          <div className="col-12">
            <div className="card" style={styles.card}>
              <div className="card-body">
                <h6 className="card-title mb-3">Department Summary</h6>
                <div className="row">
                  {departments.map((dept) => {
                    const deptAppointments = evaluations.filter(
                      (app) => app.department === dept
                    );
                    const colors = getDepartmentColors(dept);
                    return (
                      <div key={dept} className="col-md-3 mb-3">
                        <div
                          className="card h-100"
                          style={{
                            ...styles.card,
                            borderLeft: `4px solid ${colors.bg}`,
                          }}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="card-title mb-1">{dept}</h6>
                                <p className="card-text text-muted mb-0">
                                  {deptAppointments.length} appointments
                                </p>
                              </div>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: colors.bg,
                                  color: colors.text,
                                  fontWeight: "500",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {deptAppointments.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>*/}

        {/* Modal for Appointment Details */}
        {showModal && selectedAppointments.length > 0 && selectedCell && (
          <div style={styles.modal} onClick={() => setShowModal(false)}>
            <div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header" style={styles.modalHeader}>
                <h5
                  className="modal-title"
                  style={{ color: "#1f2937", fontWeight: "600" }}
                >
                  {selectedCell.day} - {selectedCell.department} Department
                  <span
                    className={`badge ms-2`}
                    style={{
                      backgroundColor: getDepartmentColors(
                        selectedCell.department
                      ).bg,
                    }}
                  >
                    {selectedAppointments.length} Appointments
                  </span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body" style={{ padding: "1.5rem" }}>
                <div className="row">
                  {selectedAppointments.map((appointment, index) => (
                    <div key={appointment._id} className="col-md-6 mb-3">
                      <div
                        className="card h-100"
                        style={{
                          ...styles.card,
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.2s ease-in-out",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 1px 3px rgba(0, 0, 0, 0.1)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <div
                          className="card-body"
                          style={{
                            padding: "1rem",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h6
                              className="card-title mb-0"
                              style={{ fontWeight: "600", color: "#1f2937" }}
                            >
                              Dr. {appointment.doctor.username}
                            </h6>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: getDepartmentColors(
                                  appointment.department
                                ).bg,
                                color: getDepartmentColors(
                                  appointment.department
                                ).text,
                                fontWeight: "500",
                                fontSize: "0.75rem",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.375rem",
                              }}
                            >
                              {appointment.department}
                            </span>
                          </div>
                          <div className="card-text">
                            <div style={{ marginBottom: "0.5rem" }}>
                              <strong style={{ color: "#374151" }}>Day:</strong>{" "}
                              <span style={{ color: "#6b7280" }}>
                                {appointment.day}
                              </span>
                            </div>
                            <div style={{ marginBottom: "0.5rem" }}>
                              <strong style={{ color: "#374151" }}>
                                Time:
                              </strong>{" "}
                              <span style={{ color: "#6b7280" }}>
                                {formatTime(appointment.start_time)} -{" "}
                                {formatTime(appointment.end_time)}
                              </span>
                            </div>
                            <div style={{ marginBottom: "0" }}>
                              <strong style={{ color: "#374151" }}>ID:</strong>{" "}
                              <span
                                style={{
                                  color: "#6b7280",
                                  fontFamily: "monospace",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {appointment._id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="modal-footer"
                style={{
                  padding: "1rem 1.5rem",
                  borderTop: "1px solid #e5e7eb",
                  backgroundColor: "#f8fafc",
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    fontWeight: "500",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}