"use client";

import { convertUTCTo12Hour, generateTimeString } from "@/helper/DateTime";
import { useState, useMemo, useEffect } from "react";
import axiosInstance from "@/helper/axiosSetup";
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function WeekTable() {
  const [appointments, setAppointments] = useState([]);

  const getCalendarEvents = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/`
      );
      if (response.status == 200) {
        setAppointments(response?.data?.appointments);
        console.log("Get appointments success", response.data.appointments);
      }
    } catch (error) {
      console.log("error to get appointments", error.response);
    }
  };

  useEffect(() => {
    getCalendarEvents();
  }, []);

  // Group appointments by day and time slot
  const groupedAppointments = useMemo(() => {
    const grouped = {};

    appointments.forEach((appointment) => {
      const day = appointment.day;
      const timeSlot = `${appointment.start_time}-${appointment.end_time}`;

      if (!grouped[day]) {
        grouped[day] = {};
      }

      if (!grouped[day][timeSlot]) {
        grouped[day][timeSlot] = [];
      }

      grouped[day][timeSlot].push(appointment);
    });

    return grouped;
  }, [appointments]);

  // Get department color
  const getDepartmentColor = (department) => {
    const colors = {
      PhysicalTherapy: "primary",
      ABA: "danger",
      OccupationalTherapy: "success",
      SpecialEducation: "warning",
      Speech: "info",
      ay7aga: "secondary",
    };
    return colors[department] || "primary";
  };

  return (
    <div id="week-table" className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0 text-primary fw-bold">
              Professional Calendar
            </h1>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th
                        className="text-center py-3 fw-bold text-primary"
                        style={{ width: "14.28%" }}
                      >
                        Time Slot
                      </th>
                      {daysOfWeek.map((day) => (
                        <th
                          key={day}
                          className="text-center py-3 fw-bold text-primary"
                          style={{ width: "14.28%" }}
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Generate time slots */}
                    {Array.from({ length: 9 }, (_, hour) => {
                      const timeHour = hour + 8; // Start from 8 AM
                      const timeSlots = groupedAppointments;

                      return (
                        <tr key={hour} style={{ height: "80px" }}>
                          <td className="text-center align-middle bg-light fw-semibold text-muted">
                            {convertUTCTo12Hour(
                              generateTimeString(`${timeHour}:00`, "Monday")
                            ) + " - "}

                            {convertUTCTo12Hour(
                              generateTimeString(`${timeHour + 1}:00`, "Monday")
                            )}
                          </td>
                          {daysOfWeek.map((day) => (
                            <td
                              key={`${day}-${hour}`}
                              className="p-2 align-top position-relative"
                            >
                              {groupedAppointments[day] &&
                                Object.entries(groupedAppointments[day]).map(
                                  ([timeSlot, appointmentGroup]) => {
                                    const startTime = new Date(
                                      appointmentGroup[0].start_time
                                    );
                                    const appointmentHour =
                                      startTime.getUTCHours();

                                    if (
                                      appointmentHour >= timeHour &&
                                      appointmentHour < timeHour + 1
                                    ) {
                                      return (
                                        <div key={timeSlot} className="mb-2 ">
                                          <div
                                            className={`card border-0 shadow-sm bg-${getDepartmentColor(
                                              appointmentGroup[0].department
                                            )} bg-opacity-10 m-2`}
                                          >
                                            <div className="card-body p-2 m-2">
                                              <div className="d-flex justify-content-between align-items-start mb-1">
                                                <small className="fw-bold text-dark">
                                                  {convertUTCTo12Hour(
                                                    appointmentGroup[0]
                                                      .start_time
                                                  )}{" "}
                                                  -{" "}
                                                  {convertUTCTo12Hour(
                                                    appointmentGroup[0].end_time
                                                  )}
                                                </small>
                                                <span
                                                  className={`badge bg-${getDepartmentColor(
                                                    appointmentGroup[0]
                                                      .department
                                                  )} rounded-pill`}
                                                >
                                                  {appointmentGroup.length}
                                                </span>
                                              </div>
                                              {appointmentGroup.map(
                                                (appointment, index) => (
                                                  <div
                                                    key={appointment._id}
                                                    className={`${
                                                      index > 0
                                                        ? "border-top pt-1 mt-1"
                                                        : ""
                                                    }`}
                                                  >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                      <div>
                                                        <div
                                                          className="fw-semibold text-dark"
                                                          style={{
                                                            fontSize: "0.85rem",
                                                          }}
                                                        >
                                                          {
                                                            appointment.doctor
                                                              .username
                                                          }
                                                        </div>
                                                        <div
                                                          className="text-muted"
                                                          style={{
                                                            fontSize: "0.75rem",
                                                          }}
                                                        >
                                                          {
                                                            appointment.department
                                                          }
                                                        </div>
                                                      </div>
                                                      <span
                                                        className={`badge bg-${getDepartmentColor(
                                                          appointment.department
                                                        )} text-white`}
                                                        style={{
                                                          fontSize: "0.7rem",
                                                        }}
                                                      >
                                                        {appointment.department}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }
                                )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
