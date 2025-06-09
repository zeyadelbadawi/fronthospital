'use client';

import React, { useEffect, useState } from "react";
import Calendar from "./child/Calendar";              // your calendar component
import { Icon } from "@iconify/react/dist/iconify.js";
import axiosInstance from "../helper/axiosSetup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CalendarMainLayer = () => {
  // merged events (evaluations + sessions)
  const [events, setEvents] = useState([]);
  // only future events for the sidebar
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);


  // map your API’s type keys to the labels you actually want
   const TYPE_LABELS = {
     full_package_evaluation: "Full Package",
     single_session:             "Single Session",
     school_evaluation:          "School Evaluation",
     free_medical_consultation:  "Free Medical Consultation",
 };

  useEffect(() => {
    loadPatients();
    fetchEvents();
  }, []);

  // get patients without evaluations
  const loadPatients = () => {
    const token = localStorage.getItem("token");
    axiosInstance
      .get("/authentication/patients-without-evaluations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setPatients(res.data))
      .catch(err => console.error("Error fetching patients:", err));
  };

  // fetch both evaluations and their sessions, merge into one list
  const fetchEvents = async () => {
    const token = localStorage.getItem("token");
    try {
      // 1) fetch evaluations
      const evalRes = await axiosInstance.get("/authentication/calendar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedEvals = evalRes.data.sort((a, b) => {
        const da = new Date(a.date), db = new Date(b.date);
        if (da - db !== 0) return da - db;
        return new Date(a.time) - new Date(b.time);
      });

      const merged = [];

      for (let ev of sortedEvals) {
        // push the evaluation itself
        merged.push({
          _id: ev._id,
          title: ev.title,                   // "Patient: Name"
          date: ev.date,
          time: ev.time,
          description: ev.description,
          rawTypeName: "Evaluation",
                typee: ev.type,

        });

        // 2) fetch sessions for this evaluation
        const sessRes = await axiosInstance.get(
          `/authentication/sessions/${ev._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        for (let s of sessRes.data) {
          merged.push({
            _id: s._id,
            title: ev.title,                 // keep patient name here
            date: s.date,
            time: s.time,
            description: s.note || "",
            rawTypeName: s.Sessionname,      // session name from database
            typee: ev.type,

          });
        }
      }

      // final sort of merged list
      merged.sort((a, b) => {
        const da = new Date(a.date), db = new Date(b.date);
        if (da - db !== 0) return da - db;
        return new Date(a.time) - new Date(b.time);
      });

      setEvents(merged);

      // filter upcoming
      const now = new Date();
      setUpcomingEvents(
        merged.filter(ev => {
          const d = new Date(ev.date);
          const t = new Date(ev.time);
          return d > now || (d.toDateString() === now.toDateString() && t >= now);
        })
      );

    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };



  const handleDeleteClick = async id => {
    const token = localStorage.getItem("token");
    try {
      await axiosInstance.delete(`/authentication/ev/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEvents();
      setSuccessMessage("Deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting evaluation:", err);
    }
  };


  const separatorStyle = {
    border: 'none',
    borderTop: '10px solid #181818',
    margin: '12px 0'
  };


  return (
    <>
      <div className="row gy-4 align-items-stretch">

        <div className="col-xxl-3 col-lg-4">
          <div className="card d-flex flex-column h-100">
            <div className="card-body p-24 d-flex flex-column flex-grow-1">    {successMessage && (
              <div className="alert alert-success mb-4">
                {successMessage}
              </div>
            )}

              <h6>Upcoming Appointments</h6>
              <hr style={separatorStyle} />

              <div
                style={{
                  maxHeight: "850px",    // tweak so that 5 items fit exactly
                  overflowY: "auto",
                  minHeight: 0           // still needed if parent is flex
                }}
              >                {upcomingEvents.length ? (
                 upcomingEvents.map((ev, idx) => {
                       let sessionLabel = null;
                        if (ev.rawTypeName.toLowerCase() === "evaluation") {
                          // the base evaluation always shows Session 1
                          sessionLabel = "Session 1";
                        } else if (ev.rawTypeName && /\d+/.test(ev.rawTypeName)) {
                          // actual session rows: parse the stored number and +1
                          const num = parseInt(ev.rawTypeName.match(/(\d+)/)[1], 10);
                          sessionLabel = `Session ${num + 1}`;
                       }
                
                    return (
                                    
                  <React.Fragment key={`${ev._id}-${idx}`}>
                    <div className="event-item d-flex align-items-start gap-3 py-3">
                      <div className="fw-bold me-2">{idx + 1} -</div>
                      <div className="flex-grow-1">
                                 {/* 2️⃣ badge */}
             {/* only render a badge when sessionLabel !== null */}
             {sessionLabel && (
               <div className="text-xl mb-2">
                 <span className="badge bg-success">{sessionLabel}</span>
               </div>
             )}
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
                        <div className="fw-semibold text-md mt-2">
                          {ev.title}
                        </div>
                        <div className="text-sm mt-1">
                                Type: { TYPE_LABELS[ev.typee] || ev.typee }
                        </div>
                        {ev.description && (
                          <div className="text-sm mt-1">
                            <strong>Description:</strong> {ev.description}
                          </div>
                        )}
                        <div className="mt-2">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteClick(ev._id)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 4) Proper 1px HR between items */}
                    {idx < upcomingEvents.length - 1 && (
                      <hr
                        style={{
                          border: "none",
                          borderTop: "1px solid #ccc",
                          margin: "0",
                        }}
                      />
                    )}
                  </React.Fragment>
    );
  })

              ) : (
                <p>No upcoming appointments.</p>
              )}
              </div>
            </div>
          </div>
        </div>


        {/* calendar */}
        <div className="col-xxl-9 col-lg-8">
          <div className="card h-100 p-0">
            <div className="card-body p-24">
              <Calendar evaluations={events} />
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default CalendarMainLayer;
