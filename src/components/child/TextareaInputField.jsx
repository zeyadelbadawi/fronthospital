"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "../../helper/axiosSetup"; // Import axiosInstance
import { Modal } from "react-bootstrap"; // Bootstrap modal for confirmation
import Swal from "sweetalert2"; // Import SweetAlert2

const TextareaInputField = ({ patientId }) => {
  const [sessions, setSessions] = useState([]);
  const [updatedSession, setUpdatedSession] = useState({});
  const [activeTab, setActiveTab] = useState(0); // Track the active tab
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [currentSessionId, setCurrentSessionId] = useState(null); // Session ID to update
  const [patientName, setPatientName] = useState(""); // Patient name state

  useEffect(() => {
    if (!patientId) return;

    const fetchPatientData = async () => {
      try {
        // Fetch patient data to get the patient's name
        const patientResponse = await axiosInstance.get(`/authentication/patient/${patientId}`);
        setPatientName(patientResponse.data.name); // Set the patient's name

        // Fetch patient sessions
        const sessionResponse = await axiosInstance.get(`/authentication/sessions/${patientId}`);
        setSessions(sessionResponse.data);
      } catch (err) {
        console.error("Error fetching patient data or sessions:", err);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleSessionUpdate = async () => {
    try {
      await axiosInstance.put(`/authentication/edit-session/${currentSessionId}`, updatedSession);
      showSuccessAlert("Session updated successfully");
      setShowModal(false); // Close the modal after successful update
    } catch (err) {
      console.error("Error updating session:", err);
    }
  };

  const handleTabClick = (index) => {
    setActiveTab(index); // Update the active tab when a tab is clicked
  };

  const handleUpdateButtonClick = (sessionId) => {
    setCurrentSessionId(sessionId);
    setShowModal(true); // Show confirmation modal
  };

  const handleCheckboxChange = async (sessionId, currentDoneStatus) => {
    // If the session is already done, show a confirmation alert and prevent further changes
    if (currentDoneStatus) {
      return;
    }

    // Show SweetAlert confirmation
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Once you mark the session as 'Done', you will not be able to edit anything except the 'Note'.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, mark it Done",
    });

    // If confirmed, update the session status to 'done' in the database
    if (result.isConfirmed) {
      const sessionToUpdate = sessions.find((session) => session._id === sessionId);
      sessionToUpdate.done = true;

      try {
        await axiosInstance.put(`/authentication/edit-session/${sessionId}`, {
          done: true, // Save the done status in the database
        });
        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session._id === sessionId ? { ...session, done: true } : session
          )
        );
        Swal.fire("Done!", "The session has been marked as Done.", "success");
      } catch (err) {
        console.error("Error updating session status:", err);
      }
    }
  };

  const updateNoteOnly = async (sessionId, newNote) => {
    try {
      await axiosInstance.put(`/authentication/edit-session/${sessionId}`, {
        note: newNote, // Only update the note field
      });
      showSuccessAlert("Note updated successfully");
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: "Success!",
      text: message,
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
    });
  };

  if (!patientId || !patientName) return <div>Loading...</div>;

  // Title update based on the active session
  const activeSession = sessions[activeTab];
  const sessionTitle = activeSession
    ? `Patient: ${patientName} - Session ${activeTab + 1}${activeSession.done ? " (Completed)" : ""}`
    : "No Sessions Available.";

  return (
    <div className="container py-5">
      {/* Display dynamic session title */}
      <h3 className="text-center text-primary mb-4" style={styles.sessionTitle}>
        {sessionTitle}
      </h3>
      <br />

      <div className="tabs-container mb-4">
        {/* Tabs */}
        <ul className="nav nav-pills flex-column flex-sm-row mb-4">
          {sessions.map((session, index) => (
            <li key={session._id} className="nav-item" style={styles.tabListItem}>
              <a
                href="#"
                className={`nav-link ${activeTab === index ? "active" : ""} ${session.done ? "Completed" : ""}`}
                onClick={() => handleTabClick(index)}
                style={session.done ? styles.completedTab : styles.inactiveTab}
              >
                <span className="me-2">Session {index + 1}</span>
                {session.done ? (
                  <Icon icon="mdi:check-circle" className="done-icon" />
                ) : (
                  <Icon icon="mdi:clock" className="pending-icon" />
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* Tab Content */}
        <div className="tab-content mt-4">
          {sessions.map((session, index) => (
            <div
              key={session._id}
              className={`tab-pane fade ${activeTab === index ? "show active" : ""}`}
              style={styles.tabContent}
            >
              <div className="session-tab-content card p-3 mb-3 shadow-sm">
                {/* Done Checkbox - Hide if status is "pending" */}
                {session.status === "Completed" && (
                  <div className="form-group mb-3" style={styles.doneCheckbox}>
<label className="font-weight-bold">Mark as Done:&nbsp;</label>
                    <input
                      type="checkbox"
                      checked={session.done}
                      onChange={() => handleCheckboxChange(session._id, session.done)}
                      className="form-check-input custom-checkbox"
                      disabled={session.done} // Disable checkbox if session is done
                    />                  </div>
                )}

                {session.status === "Pending" && (
                  <div className="form-group mb-3" style={styles.doneCheckbox}>
                 
                {/* DON'T SHOW Mark as Done WHEN status IS Pending */}


                  </div>
                )}

                {/* Update Time */}
                <div className="form-group">
                  <label>Update Time:</label>
                  <input
                    type="time"
                    defaultValue={session.time}
                    onChange={(e) =>
                      setUpdatedSession({ ...updatedSession, time: e.target.value })
                    }
                    className="form-control"
                    disabled={session.done} // Disable input if session is marked as done
                  />
                </div>

                {/* Update Date */}
                <div className="form-group">
                  <label>Update Date:</label>
                  <input
                    type="date"
                    defaultValue={session.date}
                    onChange={(e) =>
                      setUpdatedSession({ ...updatedSession, date: e.target.value })
                    }
                    className="form-control"
                    disabled={session.done} // Disable input if session is marked as done
                  />
                </div>

                {/* Add Note */}
                <div className="form-group">
                  <label>Add Note:</label>
                  <textarea
                    rows="4"
                    cols="50"
                    defaultValue={session.note}
                    onChange={(e) =>
                      setUpdatedSession({ ...updatedSession, note: e.target.value })
                    }
                    className="form-control"
                    disabled={session.done ? false : true} // Enable note editing only if session is done
                  />
                </div>

                {/* Update Price - Hide if status is "completed" */}
                {session.status !== "Completed" && (
                  <div className="form-group">
                    <label>Update Price:</label>
                    <input
                      type="number"
                      defaultValue={session.price}
                      onChange={(e) =>
                        setUpdatedSession({ ...updatedSession, price: e.target.value })
                      }
                      className="form-control"
                      disabled={session.done} // Disable input if session is marked as done
                    />
                    <br></br>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (session.done) {
                      updateNoteOnly(session._id, updatedSession.note); // Update note if session is done
                    } else {
                      handleUpdateButtonClick(session._id); // Handle regular update if not done
                    }
                  }}
                  disabled={session.done && !updatedSession.note} // Ensure note is updated before button action
                  className="btn btn-success mt-2 w-100"
                  style={styles.updateButton}
                >
                  {session.done ? "Update Note" : "Update Session"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Session Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to update this session?</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSessionUpdate}>Confirm Update</button>
        </Modal.Footer>
      </Modal>
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

export default TextareaInputField;
