"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";  // Import useSearchParams or useRouter
import DatePicker from "react-datepicker"; // To use date picker
import "react-datepicker/dist/react-datepicker.css"; // To import the styles
import axiosInstance from "@/helper/axiosSetup"; // Import the configured axios instance
import Swal from "sweetalert2"; // Import SweetAlert2
import { Icon } from "@iconify/react";
import { Modal } from "react-bootstrap"; // Bootstrap modal for confirmation
import { Overlay, Tooltip } from "react-bootstrap";
import jwtDecode from 'jwt-decode';

const WizardWithBesideLabel = ({ }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState("");
  const [selectedevtime, setSelectedevtime] = useState("");
  const [selectedevdate, setSelectedevdate] = useState("");
  const [newSessionCreated, setNewSessionCreated] = useState(false); // Define the state
  const [patientFullDescription, setPatientFullDescription] = useState("");
  const [evaluationType, setEvaluationType] = useState('');

  // this ref will point at the “Mark session as complete” checkbox
  const doneRef = useRef(null);
  // whether we’re showing the “you must mark as done” hint
  const [showHint, setShowHint] = useState(false);


  const [evolutionNote, setEvolutionNote] = useState("");
  const [dates, setDates] = useState([]); // Store 16 dates for each session
  const [prices, setPrices] = useState([]); // Declare prices state
  const [times, setTimes] = useState([]); // New state to store time for each session
  const [evaluationDone, setEvaluationDone] = useState(false); // Track if evaluation is marked as 'done'
  const [isDisabled, setIsDisabled] = useState(false); // Disable checkbox once it's checked
  const [sessions, setSessions] = useState([]);  // Track sessions for the selected evaluation
  const [sessionDone, setSessionDone] = useState(false); // Track if a session is marked as 'done'

  const router = useRouter();

  const searchParams = useSearchParams();
  const evaluationId = searchParams?.get("id");  // Extract evaluationId from URL

  // at top of your component
  const [selectedRecord, setSelectedRecord] = useState({
    type: '',   // nothing chosen yet
    id: ''    // matches the placeholder
  });




  function getDoctorId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = jwtDecode(token);   // { id, role, iat, exp }
    return payload.role === 'doctor' ? payload.id : null;
  }



  const getLoggedInUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  };

  const user = getLoggedInUser();
  console.log(user);  // Check if the user data is available and correct

  const doctorId = user?.role === 'doctor' ? user._id : null;



  const handlePatientFullDescriptionChange = (e) => {
    setPatientFullDescription(e.target.value);
  };

  const fetchSessions = useCallback(async () => {
    if (!evaluationId) return;
    try {
      const { data } = await axiosInstance.get(`/authentication/sessions/${evaluationId}`);
      setSessions(data);

      // Set the state variables after fetching session data
      setDates(data.map(s => s.date));
      setTimes(data.map(s => s.time));
      setPrices(data.map(s => s.price));
      setSessionDone(data.map(s => s.done)); // Assuming the session data has a 'done' flag

    } catch (e) {
      console.error("Error fetching sessions:", e);
    }
  }, [evaluationId]);

  useEffect(() => { fetchSessions() }, [fetchSessions]);


  // Log evaluationId whenever it changes

  const services = [
    "Psychoeducational Assessment",
    "ABA Behavior Modification Sessions",
    "Special Education Services",
    "Individual Sessions",
    "School Integration Preparation",
    "Learning Difficulties",
    "Speech Delay",
    "Physical Therapy",
    "Functional Sensory Therapy"
  ];
  useEffect(() => { fetchSessions() }, [fetchSessions]);


  useEffect(() => {
    if (!evaluationId) return;

    const fetchEvaluation = async () => {
      try {
        const { data } = await axiosInstance.get(`/authentication/evaluation/${evaluationId}`);
        const patientId = data.patient;

        // assuming your API returns { service, evolutionNote, done, … }
        setEvaluationType(data.type);            // ← grab the type

        setSelectedService(data.service || "");
        setEvolutionNote(data.evolutionNote || "");
        setEvaluationDone(!!data.done);
        setSelectedevtime(data.time || "");
        setSelectedevdate(data.date || null);
        setIsDisabled(!!data.done);

        // Step 1: Fetch the patient's description using the patientId
        const patientResponse = await axiosInstance.get(`/authentication/patient/${patientId}`);
        console.log("Student Data:", patientResponse); // Check the API response

        // Step 2: Set the patient description if it exists
        setPatientFullDescription(patientResponse.data.mydescription || ""); // Set the patient's description (if it exists)

      } catch (err) {
        console.error("Failed to load evaluation:", err);
      }
    };

    fetchEvaluation();
  }, [evaluationId]);


  // after your fetchSessions (so sessions[] is up to date)
  const sessionIndex = sessions.findIndex(s => s._id === selectedRecord.id);
  const nextSessionNum = sessionIndex >= 0 ? sessionIndex + 2 : 1; // Start at 1 if no sessions exist

  // now see if that “Session N” already exists on the server:
  const nextSessionKey = `Session ${nextSessionNum}`;
  const alreadyCreated = nextSessionNum != null
    && sessions.some(s => s.Sessionname === nextSessionKey);


  const handleSaveTab1 = async () => {
    // common payload
    const payload = {
      date: selectedevdate,
      time: selectedevtime,
      note: evolutionNote,
      patientDescription: patientFullDescription, // Include the description

    };

    try {
      if (selectedRecord.type === 'evaluation') {
        // save the evaluation and always go next
        await axiosInstance.put(`/authentication/sdnevaluation/${evaluationId}`, {
          service: selectedService,
          evolutionNote,
          date: selectedevdate,
          time: selectedevtime,
          patientDescription: patientFullDescription, // Send patient description

        });
        Swal.fire("evaluation Saved!", "", "success");
        if (evaluationType !== 'free_medical_consultation') {
          setCurrentStep(2);
        }
      } else {
        // save the session
        await axiosInstance.put(
          `/authentication/edit-session/${selectedRecord.id}`,
          payload
        );
        Swal.fire("Session saved!", "", "success");

        // only move to tab 2 if they actually marked it done
        if (sessionDone) {
          setCurrentStep(2);
        } else {
          // not done yet — show the hint
          setShowHint(true);
          setTimeout(() => setShowHint(false), 5000);
        }
      }


    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not save.", "error");
    }
  };








  const handleMarkDone = async () => {
    if (isDisabled) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Once marked as done, you will not be able to change it back to undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, mark as done!',
    });

    if (result.isConfirmed) {
      try {

        const doctorId = getDoctorId();

        // Ensure doctorId is used in the request
        const response = await axiosInstance.put(`/authentication/done-evaluation/${evaluationId}`, {
          done: true,
          doctor: doctorId, // This is where you're passing the doctorId
        });

        if (response.status === 200) {
          setEvaluationDone(true);
          setIsDisabled(true);

          Swal.fire(
            'Marked as Done!',
            'The evaluation has been marked as completed.',
            'success'
          );
          console.log("Evaluation marked as done successfully!");
        } else {
          console.log("Failed to update evaluation status.");
        }
      } catch (error) {
        console.error("Error marking evaluation as done:", error);
        Swal.fire(
          'Error!',
          'There was an issue marking the evaluation as done. Please try again.',
          'error'
        );
      }
    }
  };





  // … inside your WizardWithBesideLabel component …

  // 1) New helper to mark the selected *session* done
  const handleMarkDoneSession = async () => {
    if (sessionDone) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Once marked done you can't undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, mark done",
    });

    if (!result.isConfirmed) return;

    try {

      const doctorId = getDoctorId();

      const sessionId = selectedRecord.id;
      const response = await axiosInstance.put(
        `/authentication/done-session/${sessionId}`,
        {
          done: true,
          doctor: doctorId, // This is where you're passing the doctorId
        }
      );

      if (response.status === 200) {
        setSessionDone(true);
        setIsDisabled(true);
        Swal.fire("Done!", "This session is now marked complete.", "success");
      } else {
        console.error("Failed:", response);
        Swal.fire("Oops", "Could not mark session done.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };


  const handleSavetab3 = async () => {
    try {
      // No existing sessions, create new sessions based on weeks and sessions per week
      const sessionData = {
        evaluation: evaluationId,
        Sessionname: `Session ${nextSessionNum}`,
        date: dates[0] || null,  // Set to null if no date is selected
        time: times[0] || null,    // Set to empty if no time is selected
        price: prices[0] || null,  // Set to empty if no price is selected
      };

      console.log("Sending session data:", sessionData);

      // Create new session with 'done' flag set to false
      await axiosInstance.post('/authentication/create-session', sessionData);
      await fetchSessions(); // Refresh session data

      Swal.fire('Session Created!', `Session ${nextSessionNum + 1} created successfully.`, 'success');

      // Lock out further creations to prevent multiple session creation
      setNewSessionCreated(true);
    } catch (error) {
      console.error("Error saving sessions:", error);
      Swal.fire({
        title: 'Error!',
        text: 'There was an error while saving the sessions. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };





  useEffect(() => {
    if (selectedRecord.type === 'evaluation') {
      // fetch main evaluation (as you already do)
      axiosInstance.get(`/authentication/evaluation/${evaluationId}`)
        .then(({ data }) => {
          setSelectedevdate(data.date);
          setSelectedevtime(data.time);
          setEvolutionNote(data.evolutionNote);
          setSelectedService(data.service);
          setEvaluationDone(data.done);
          setIsDisabled(data.done);
        })
        .catch(console.error);
    } else {
      // find the session in your sessions array
      const sess = sessions.find(s => s._id === selectedRecord.id);
      if (!sess) return;
      setSelectedevdate(new Date(sess.date));
      setSelectedevtime(sess.time);
      setEvolutionNote(sess.note || '');
      setIsDisabled(sess.done);
      setSessionDone(sess.done || false); // Ensure false if not done

    }
  }, [selectedRecord, sessions]);






  const handleTimeChange = (index, time) => {
    const newTimes = [...times];
    newTimes[index] = time;
    setTimes(newTimes);
  };

  const handleDateChange = (index, date) => {
    const newDates = [...dates];
    newDates[index] = date;
    setDates(newDates);
  };

  const handlePriceChange = (index, price) => {
    const newPrices = [...prices];
    newPrices[index] = price;
    setPrices(newPrices);
  };

  const handleSaveSessionChanges = async (index) => {
    const sessionData = {
      date: dates[index],
      time: times[index],
      price: prices[index],
    };

    try {
      // Send the updated session data to the backend
      await axiosInstance.put(`/authentication/edit-session/${sessions[index]._id}`, sessionData);

      // Show success message if the session is saved successfully
      Swal.fire({
        title: 'Session Updated!',
        text: 'The session has been updated successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      });

    } catch (error) {
      console.error("Error updating session:", error);
      // Show error message if there was an issue saving the session
      Swal.fire({
        title: 'Error!',
        text: 'There was an error while saving the session. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="col-md-12">
      <div className="card">
        <div className="card-body">
          <h6 className="mb-4 text-xl">Evaluation Section</h6>
          <div className="form-wizard">
            <form action="#" method="post">
              <div className="form-wizard-header overflow-x-auto scroll-sm pb-8 my-32">
                <ul className="list-unstyled form-wizard-list style-three">

                  <li
                    className={`form-wizard-list__item d-flex align-items-center gap-8 ${currentStep === 0 && "active"}`}
                  >
                    <div className="form-wizard-list__line">
                      <span className="count">1</span>
                    </div>
                    <span className="text text-xs fw-semibold">Select Session</span>
                  </li>
                  <li
                    className={`form-wizard-list__item d-flex align-items-center gap-8 ${currentStep === 1 && "active"}`}
                  >
                    <div className="form-wizard-list__line">
                      <span className="count">2</span>
                    </div>
                    <span className="text text-xs fw-semibold">Evaluation Details</span>
                  </li>
                  {evaluationType !== 'free_medical_consultation' && (
    <li className={`form-wizard-list__item ${currentStep === 2 ? 'active' : ''}`}>
      <span className="count">3</span>
      <span>&nbsp;Book New Session</span>
    </li>
  )}
                </ul>
              </div>
              {/* Tab 0  */}

              <fieldset className={`wizard-fieldset ${currentStep === 0 && "show"}`}>
                <h6 className="text-md text-neutral-800">Select Session</h6>
                <div className="row gy-3">
                  <div className="col-sm-12">
                    <label className="form-label">Select Session</label>
                    <select
                      className="form-control wizard-required"
                      value={selectedRecord.id}
                      onChange={e => {
                        const id = e.target.value;
                        const type = id === evaluationId ? 'evaluation' : 'session';
                        setSelectedRecord({ id, type });
                        setCurrentStep(1);
                      }}
                    >
                      {/* a placeholder you can’t pick */}
                      <option disabled value="">
                        -- choose Session --
                      </option>

                      {/* first real option = the main evaluation */}
                      <option value={evaluationId}>
                        1 –  Evaluation Program (session 1)
                      </option>

                      {/* then one per session */}
                      {sessions.map((sess, idx) => (
                        <option key={sess._id} value={sess._id}>
                          {idx + 2} – Session {idx + 2}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group text-end">
                  <button
                    onClick={() => setCurrentStep(1)}
                    type="button"
                    className="form-wizard-next-btn btn btn-info-700 px-32"
                  >
                    Next
                  </button>
                </div>
              </fieldset>

              {/* First Tab - Order Details */}
              <fieldset className={`wizard-fieldset ${currentStep === 1 && "show"}`}>
                <div className="row gy-3">

                  {selectedRecord.type === 'evaluation' ? (
                    <>
                      {/* ——— Main Evaluation Form ——— */}
                      <h6 className="text-md text-neutral-800">Evaluation Details</h6>

                      <div className="form-check col-12">
                        {!evaluationDone ? (
                          <>
                            <input
                              ref={doneRef}
                              type="checkbox"
                              className="form-check-input"
                              checked={evaluationDone}
                              onChange={handleMarkDone}
                              id="evaluationDone"
                              disabled={isDisabled}

                            />
                            <label className="form-check-label" htmlFor="evaluationDone">
                              <b> Mark as done

                              </b>
                            </label>
                          </>
                        ) : (
                          <div className="alert alert-success" role="alert">
                            <strong>Program Completed!</strong>
                          </div>
                        )}
                      </div>

                      <div className="col-12">
                        <label className="form-label">Student Full Description</label>
                        <textarea
                          className="form-control wizard-required"
                          rows={6}
                          placeholder="Student Full Description"
                          value={patientFullDescription} // Bind the value to the state
                          onChange={handlePatientFullDescriptionChange} // Update the state on change
                          disabled={evaluationDone} // Disable if evaluation is done
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label">Date</label>
                        <br></br>
                        <DatePicker
                          selected={selectedevdate}
                          onChange={date => setSelectedevdate(date)}
                          className="form-control"
                          placeholderText="Select Date"
                          dateFormat="MM/dd/yyyy"
                          disabled={evaluationDone} // Disable if evaluation is done

                        />
                      </div>

                      <div className="col-sm-6">
                        <label className="form-label">Time</label>
                        <input
                          type="time"
                          value={selectedevtime}
                          onChange={e => setSelectedevtime(e.target.value)}
                          className="form-control"
                          disabled={evaluationDone} // Disable if evaluation is done

                        />
                      </div>

                      <div className="col-sm-9">
                        <label className="form-label">Service</label>
                        <select
                          value={selectedService}
                          onChange={e => setSelectedService(e.target.value)}
                          className="form-control wizard-required"
                          disabled={evaluationDone} // Disable if evaluation is done

                        >
                          {services.map(svc => (
                            <option key={svc} value={svc}>{svc}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Evolution Note</label>
                        <textarea
                          value={evolutionNote}
                          onChange={e => setEvolutionNote(e.target.value)}
                          className="form-control wizard-required"
                          rows={4}
                          placeholder="Enter Evolution Note"
                          disabled={evaluationDone} // Disable if evaluation is done

                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* ——— Session Edit Form ——— */}
                      <h6 className="text-md text-neutral-800">Session Details</h6>

                      <div className="form-check col-12">
                        {!sessionDone ? (
                          <>
                            <input
                              ref={doneRef}
                              type="checkbox"
                              className="form-check-input"
                              checked={sessionDone}
                              onChange={handleMarkDoneSession}
                              id="sessionDone"
                              disabled={isDisabled || evaluationDone}

                            />
                            <label className="form-check-label" htmlFor="sessionDone">
                              Mark session as complete
                            </label>
                          </>
                        ) : (
                          <div className="alert alert-success" role="alert">
                            <strong>Session Completed!</strong>
                          </div>
                        )}
                      </div>







                      <div className="col-sm-12">
                        <label className="form-label">Date</label>
                        <br></br>
                        <DatePicker
                          selected={selectedevdate}
                          onChange={date => setSelectedevdate(date)}
                          className="form-control"
                          placeholderText="Select Date"
                          dateFormat="MM/dd/yyyy"
                          disabled={evaluationDone || sessionDone} // Disable if evaluation or session is done
                        />
                      </div>

                      <div className="col-sm-12">
                        <label className="form-label">Time</label>
                        <input
                          type="time"
                          value={selectedevtime}
                          onChange={e => setSelectedevtime(e.target.value)}
                          className="form-control"
                          disabled={evaluationDone || sessionDone} // Disable if evaluation or session is done
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Session Note</label>
                        <textarea
                          value={evolutionNote}
                          onChange={e => setEvolutionNote(e.target.value)}
                          className="form-control"
                          rows={3}
                          placeholder="Enter Session Note"
                          disabled={evaluationDone || sessionDone} // Disable if evaluation or session is done

                        />
                      </div>


                    </>
                  )}

                  <div className="form-group text-end col-12">
                    <button
                      onClick={handleSaveTab1}
                      type="button"
                      className="form-wizard-next-btn btn btn-primary px-32"
                    >
                      {evaluationType === 'free_medical_consultation' ? 'Save' :
                        (selectedRecord.type === 'session' && !sessionDone ? 'Save' : 'Save and Next')}
                    </button>


                  </div>
                  <Overlay
                    target={doneRef.current}
                    show={showHint}
                    placement="right"
                  >
                    <Tooltip id="hint-tooltip">
                      please mark this session as completed first, to book a new session.
                    </Tooltip>
                  </Overlay>
                </div>
              </fieldset>
              {/* Dynamic Date Pickers */}

              {evaluationType !== 'free_medical_consultation' && (

                <fieldset className={`wizard-fieldset ${currentStep === 2 && "show"}`}
                  style={{
                    padding: '30px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                    marginBottom: '30px'
                  }}
                >
                  {/* Dynamically change the title */}
                  <h6 className="text-md text-neutral-800" style={{
                    fontWeight: '600',
                    fontSize: '20px',
                    marginBottom: '20px',
                    color: '#343a40'
                  }}>
                    {/* Change the title based on evaluationDone or alreadyCreated */}
                    {evaluationDone && sessionDone ? "Program Completed" : alreadyCreated ? "Session Already Created" : "Schedule a New Session"}
                  </h6>

                  {/* Show the Program Completed message only if evaluation is done and session is not done */}
                  {evaluationDone && !sessionDone ? (
                    <div className="alert alert-info">
                      <strong>Program Completed</strong>
                      <br />
                      This program is completed and no new sessions can be booked.
                    </div>
                  ) : evaluationDone && sessionDone ? (
                    <div className="alert alert-info">
                      <strong>Program Completed</strong>
                      <br />
                      This program is fully completed, and no further actions can be taken.
                    </div>

                  ) : alreadyCreated && !evaluationDone ? (
                    <div className="alert alert-info">
                      <strong>Session {nextSessionNum + 1}</strong> has been created.
                    </div>

                  ) : alreadyCreated && !evaluationDone ? (
                    <div className="alert alert-info">
                      <strong>Session {nextSessionNum + 1}</strong> has been created.
                    </div>
                  ) : (
                    <div className="row gy-3">
                      <div className="col-md-6" style={{ padding: '10px' }}>
                        <div
                          style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease-in-out'
                          }}
                        >
                          <label className="form-label text-sm fw-semibold mb-2">
                            Session Date
                          </label>
                          <DatePicker
                            onChange={date => handleDateChange(0, date)}
                            className="form-control mb-3"
                            placeholderText="Select Date"
                            dateFormat="MM/dd/yyyy"
                          />

                          <label className="form-label text-sm fw-semibold mb-2">
                            Time
                          </label>
                          <input
                            type="time"
                            onChange={e => handleTimeChange(0, e.target.value)}
                            className="form-control mb-3"
                          />

                          <label className="form-label text-sm fw-semibold mb-2">
                            Price
                          </label>
                          <input
                            type="number"
                            onChange={e => handlePriceChange(0, e.target.value)}
                            className="form-control mb-3"
                            placeholder="Enter session price"
                          />
                        </div>
                      </div>

                      <div className="form-group text-end col-12 mt-4">
                        <button
                          onClick={handleSavetab3}
                          type="button"
                          className="wizard-fieldset-next-btn btn btn-success px-4"
                        >
                          Add Session {nextSessionNum + 1}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Back Button Logic */}
                  <div className="form-group text-end col-12 mt-4">
                    {evaluationDone && sessionDone ? (
                      <button
                        onClick={() => router.push('/doctor-dashboard')} // Navigate to /doctor-dashboard
                        className="btn btn-secondary px-4"
                      >
                        Back to Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentStep(0)} // Navigate back to Tab 0
                        className="btn btn-secondary px-4"
                      >
                        Back to Select Session Tab
                      </button>
                    )}
                  </div>
                </fieldset>

              )}


            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline CSS styles
const styles = {
  sessionTitle: {
    fontSize: "2rem", // Larger font size for session title
    fontWeight: "bold", // Bold the title
    color: "#007bff", // Text color
    textShadow: "2px 2px 4px rgba(0, 123, 255, 0.5)", // Shadow for a 3D effect
    marginBottom: "20px", // Spacing below the title
  },
  activeTab: {
    backgroundColor: "#0069d9",
    color: "#fff",
    borderColor: "#0062cc",
    boxShadow: "0 0 10px rgba(0, 123, 255, 0.5)",
    marginRight: "10px", // Add space between tabs
    fontSize: "1.2rem", // Increase font size
    fontWeight: "bold", // Make font bold
    padding: "10px 15px", // Add padding to make the tab more prominent
  },
  inactiveTab: {
    backgroundColor: "#0069d9",
    color: "#fff",
    borderColor: "#0062cc",
    boxShadow: "0 0 10px rgba(0, 123, 255, 0.5)",
    marginRight: "10px", // Add space between tabs
    fontSize: "1.2rem", // Increase font size
    fontWeight: "bold", // Make font bold
    padding: "10px 15px", // Add padding to make the tab more prominent
  },
  completedTab: {
    backgroundColor: "#28a745",
    color: "#fff",
    borderColor: "#28a745",
    boxShadow: "0 0 10px rgba(40, 167, 69, 0.5)",
    marginRight: "10px", // Add space between tabs
    fontSize: "1.2rem", // Increase font size
    fontWeight: "bold", // Make font bold
    padding: "10px 15px", // Add padding to make the tab more prominent
  },
  tabContent: {
    borderTop: "1px solid #ddd",
  },
  updateButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    borderColor: "#28a745",
    transition: "background-color 0.3s ease",
    padding: "12px 20px", // Increase button size
    fontSize: "1.1rem", // Make button text larger
    fontWeight: "bold", // Make button text bold
    borderRadius: "5px",
  },
  tabListItem: {
    marginRight: "10px", // Add space between the tabs

  },
  doneCheckbox: {
    marginBottom: "20px", // Make space between Done checkbox and the other fields
    fontSize: "1.5rem", // Increase the size of checkbox label
    color: "#28a745", // Green for the 'Done' text
  },
};
export default WizardWithBesideLabel;
