'use client';

import React, { useEffect, useState } from "react";
import Calendar from "./child/Calendar";
import axiosInstance from "../helper/axiosSetup";
import "react-datepicker/dist/react-datepicker.css";

const CalendarMainLayerPatient = () => {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [successMessage, setSuccessMessage] = useState("");

  const evalTypeLabels = {
    full_package_evaluation: "Full Package",
    single_session: "Single Session",
    school_evaluation: "School Evaluation",
    free_medical_consultation: "Free Medical Consultation",
  };

  useEffect(() => {
    fetchEvents();
  }, []);



  const fetchEvents = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axiosInstance.get("/authentication/calendar/patient", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data;

      // sort
      all.sort((a, b) => {
        const da = new Date(a.date), db = new Date(b.date);
        if (da - db !== 0) return da - db;
        return new Date(a.time) - new Date(b.time);
      });
      setEvents(all);

      // split upcoming/past
      const now = new Date(), up = [], past = [];
      all.forEach(ev => {
        const d = new Date(ev.date), t = new Date(ev.time);
        if (d > now || (d.toDateString() === now.toDateString() && t >= now)) {
          up.push(ev);
        } else {
          past.push(ev);
        }
      });
      setUpcomingEvents(up);
      setPastEvents(past);

    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };



  const displayEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  return (
    <>
      <div className="row gy-4 align-items-stretch">
        {/* sidebar */}
        <div className="col-xxl-3 col-lg-4">
        <div 
  className="card d-flex flex-column h-100" 
  style={{ borderRadius: 0 }}
>            <div className="card-body p-24 d-flex flex-column flex-grow-1">
              {successMessage && (
                <div className="alert alert-success mb-4">
                  {successMessage}
                </div>
              )}

              <h6>My Appointments</h6>
<br></br>
              <ul className="nav nav-tabs nav-fill mb-3">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "upcoming" ? "active" : ""}`}
                    onClick={() => setActiveTab("upcoming")}
                  >
                    Upcoming
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "past" ? "active" : ""}`}
                    onClick={() => setActiveTab("past")}
                  >
                    Past
                  </button>
                </li>
              </ul>

              <div style={{ maxHeight: "800px", overflowY: "auto", minHeight: 0 }}>
                {displayEvents.length ? (
                  displayEvents.map((ev, idx) => {
                     let sessionLabel;
                      if (ev.sessionName) {
                        const match = ev.sessionName.match(/(\d+)/);
                       const num = match ? parseInt(match[1], 10) : 1;
                        sessionLabel = `Session ${num + 1}`;
                     } else {
                       sessionLabel = "Session 1";
                      }
                    const label = evalTypeLabels[ev.evalType] || ev.evalType;
                    return (
                      <React.Fragment key={`${activeTab}-${ev._id}-${idx}`}>
                        <div className="event-item d-flex align-items-start gap-3 py-3">
                          <div className="fw-bold me-2">{idx + 1} -</div>
                          <div className="flex-grow-1">
                            {/* show the mapped evaluation type */}
                          
                            <div className="text-xl mb-2">
            <span className="badge bg-success">
           {sessionLabel}
            </span>
          </div>
                            <div className="text-xl mb-1">
                              Type: {label}
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              <span className="w-12 h-12 bg-warning rounded-circle" />
                              <span className="text-secondary">
                                {new Date(ev.date).toLocaleDateString()} at{" "}
                                {new Date(ev.time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {activeTab === "upcoming" && (
                              <div className="mt-2">

                              </div>
                            )}
                          </div>
                        </div>
                        {idx < displayEvents.length - 1 && (
                          <hr
                            style={{
                              border: "none",
                              borderTop: "1px solid #ccc",
                              margin: 0,
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <p>No {activeTab} appointments.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* calendar */}
        <div className="col-xxl-9 col-lg-8">
          <div className="card h-100 p-0"
                        style={{ borderRadius: 0 }}
                        >
            <div className="card-body p-24"
              >
              <Calendar evaluations={events} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarMainLayerPatient;
