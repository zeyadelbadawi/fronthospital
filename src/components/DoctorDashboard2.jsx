"use client";
import { useState, useEffect } from "react";
import axiosInstance from "../helper/axiosSetup"; // Import the configured axios instance
import { useRouter } from "next/navigation"; // To handle routing
import { Modal, Button } from "react-bootstrap"; // Bootstrap modal for editing
import { Icon } from "@iconify/react/dist/iconify.js";
import Swal from "sweetalert2"; // Import SweetAlert2

const DoctorDashboard2 = () => {
    const [evaluations, setevaluations] = useState([]); // All evaluations from API
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [showModal, setShowModal] = useState(false); // To show/hide the modal
    const [currentEvaluation, setCurrentEvaluation] = useState(null); // Store current evaluation for editing
    const [newDate, setNewDate] = useState(""); // New date input for editing
    const [newTime, setNewTime] = useState(""); // New time input for editing

    // Fetch evaluations from the backend
    const fetchEvaluations = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/authentication/allevaluations-free', {
                params: {
                    type: 'free_medical_consultation', // Only fetch free medical consultation evaluations
                },
            });

            const { evaluations } = response.data;
            // Set evaluations
            setevaluations(evaluations);
        } catch (err) {
            console.error("Error fetching evaluations:", err);
        } finally {
            setLoading(false);
        }
    };

    // Call fetchEvaluations on component mount
    useEffect(() => {
        fetchEvaluations();
    }, []); // Empty dependency array ensures it runs once when component mounts

    const handleAccept = async (evaluation) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to accept this consultation?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, accept it!',
            cancelButtonText: 'No, cancel!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Logic for accepting the consultation
                    await axiosInstance.post(`/authentication/acceptConsultation/${evaluation._id}`);
                    Swal.fire('Accepted!', 'Consultation has been accepted.', 'success');
                    fetchEvaluations(); // Reload evaluations
                } catch (err) {
                    console.error("Error accepting consultation:", err);
                }
            }
        });
    };

    const handleDecline = async (evaluation) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to decline this consultation?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, decline it!',
            cancelButtonText: 'No, cancel!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Logic for declining the consultation
                    await axiosInstance.post(`/authentication/declineConsultation/${evaluation._id}`);
                    Swal.fire('Declined!', 'Consultation has been declined.', 'error');
                    fetchEvaluations(); // Reload evaluations
                } catch (err) {
                    console.error("Error declining consultation:", err);
                }
            }
        });
    };



    const handleEdit = (evaluation) => {
        setCurrentEvaluation(evaluation);
        setNewDate(evaluation.date);  // Assuming `evaluation.date` is the field to edit
        setNewTime(evaluation.time);  // Assuming `evaluation.time` is the field to edit
        setShowModal(true); // Show the modal to edit
    };

    const handleSaveChanges = async () => {

        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to save the changes to this consultation?",
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                
        try {
            // Logic to save the edited date and time
            await axiosInstance.post(`/authentication/editConsultation/${currentEvaluation._id}`, {
                date: newDate,
                time: newTime,
            });
            Swal.fire('Updated!', 'Consultation has been updated.', 'success');
            setShowModal(false); // Close the modal
            fetchEvaluations(); // Reload the evaluations after saving changes
        } catch (err) {
            console.error("Error updating consultation:", err);
        }
    }
});
};
    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Name"
                    />
                </div>
            </div>
            <div className="card-body p-24">
                <div className="table-responsive">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr>
                                <th className="text-center">no.</th>
                                <th className="text-center">Patient Name</th>
                                <th className="text-center">Patient Number</th>
                                <th className="text-center">Program Type</th>
                                <th className="text-center">Date</th>
                                <th className="text-center">Time</th>
                                <th className="text-center">Evaluation Description</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center">Loading...</td></tr>
                            ) : (
                                evaluations.map((evaluation, index) => (
                                    <tr key={evaluation._id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{evaluation.patient?.name}</td>
                                        <td className="text-center">{evaluation.patient?.phone}</td>
                                        <td className="text-center">
                                            {evaluation.type === "free_medical_consultation" ? "Free Medical Consultation" : "Other"}
                                        </td>
                                        <td className="text-center">
                                            {new Date(evaluation.date).toLocaleDateString('en-CA')}
                                        </td>
                                        <td className="text-center">
                                            {evaluation.time}
                                        </td>
                                        <td className="text-center">{evaluation.description}</td>
                                        <td className='text-center'>
                                            <div className='d-flex align-items-center gap-10 justify-content-center'>
                                                <button
                                                    type='button'
                                                    className='remove-item-btn bg-success-focus bg-hover-success-200 text-success-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                                                    onClick={() => handleAccept(evaluation)}
                                                >
                                                    <Icon
                                                        icon='fluent:checkmark-24-regular'
                                                        className='menu-icon'                                                     
                                                    />
                                                </button>

                                                <button
                                                    type='button'
                                                    className='remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                                                    onClick={() => handleDecline(evaluation)}
                                                >
                                                    <Icon
                                                        icon='fluent:delete-24-regular'
                                                        className='menu-icon'                                                     />
                                                </button>
                                                <button
                                                    type='button'
                                                    className='bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                                                    onClick={() => handleEdit(evaluation)}
                                                >
                                                    <Icon icon='lucide:edit' className='menu-icon' />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Consultation Date & Time</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <label>Date:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                        />
                    </div>
                    <div className="mt-3">
                        <label>Time:</label>
                        <input
                            type="time"
                            className="form-control"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DoctorDashboard2;
