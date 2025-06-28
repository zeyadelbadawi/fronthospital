"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/helper/axiosSetup";
import { convertUTCTo12Hour, convertUTCTo24Hour } from "@/helper/DateTime";
import { Icon } from "@iconify/react/dist/iconify.js";
import Loader from "@/components/Loader";

export default function StudentsAppointmentDepartment({ params }) {
  const [studentsByDepartment, setStudentsByDepartment] = useState([]);
  const [studentsAppointment, setStudentsAppointment] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const id = params.id;

  const ProgramEndpoints = {
    PhysicalTherapy: "physical-therapy-assignments",
    ABA: "ABA-assignments",
    OccupationalTherapy: "Occupational-therapy-assignments",
    SpecialEducation: "Special-Education-assignments",
    Speech: "Speech-assignments",
    ay7aga: "Ay7aga-assignments",
  };
  const finAppointmentById = async () => {
    try {
      setLoading(true);
      // Handle fetching a single appointment by ID
      const response = await axiosInstance.get(`/appointments/findById/${id}`);
      setCurrentAppointment(response?.data?.appointment);
      console.log("Appointment by id fetched successfully:", response.data);
    } catch (error) {
      setLoading(false);
      alert("Error fetching appointment by id:", error.response.data.error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    finAppointmentById();
  }, [id]);

  const fetchStudentsByDepartment = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/students-appointment/${
          ProgramEndpoints[currentAppointment?.department]
        }/${currentAppointment?.department}/${currentAppointment._id}`
      );
      setStudentsByDepartment(response.data);
      console.log("Students in departments without appointment", response.data);
    } catch (error) {
      setLoading(false);
      alert(
        "Error fetching students in departments without appointment:",
        error.response.data.error
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAppointmentDepartment = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/students-appointment/${currentAppointment?.department}/${currentAppointment?._id}`
      );
      setStudentsAppointment(response?.data?.studentsAppointment);
      console.log(
        "student in appointment successfully:",
        response.data.studentsAppointment
      );
    } catch (error) {
      setLoading(false);
      alert(
        "Error fetching student in appointment :",
        error.response.data.error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAppointment !== null) {
      fetchStudentsByDepartment();
      fetchStudentsAppointmentDepartment();
    }
  }, [currentAppointment?.department]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const onAddStudent = async (addedData) => {
    try {
      setButtonLoading(true);
      const response = await axiosInstance.post(
        `/students-appointment/`,
        addedData
      );

      if (response.status === 201) {
      }
      //setStudentsAppointment(response.data);
      console.log(
        "Students added to appointment successfully:",
        response.data.studentsAppointment
      );
    } catch (error) {
      setButtonLoading(false);
      alert("Error adding students to appointment:", error.response.data.error);
    } finally {
      setButtonLoading(false);
      fetchStudentsByDepartment();
      fetchStudentsAppointmentDepartment();
    }
  };

  const onDeleteStudent = async (id) => {
    try {
      setButtonLoading(true);
      const response = await axiosInstance.delete(
        `/students-appointment/${id}`
      );
      //setStudentsAppointment(response.data);
      console.log(
        "Students deleted from appointment successfully:",
        response.data.studentsAppointment
      );
    } catch (error) {
      setButtonLoading(false);
      alert(
        "Error deleting students from appointment:",
        error.response.data.error
      );
    } finally {
      setButtonLoading(false);
      fetchStudentsByDepartment();
      fetchStudentsAppointmentDepartment();
    }
  };

  return loading ? (
    <div className="vh-100 d-flex justify-content-center align-content-center">
      <Loader />
    </div>
  ) : (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
        rel="stylesheet"
      />

      <div className="min-vh-100 bg-light p-4">
        {/* Header Section */}
        <div className="mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h1 className="fs-1 fw-bold text-dark mb-3">
                Students Appointment Management
              </h1>
              <div
                className="card border-primary"
                style={{
                  background:
                    "linear-gradient(135deg, #f8f9ff 0%, #e6f0ff 100%)",
                }}
              >
                <div className="card-body py-3">
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="bg-primary rounded-circle"
                        style={{ width: "8px", height: "8px" }}
                      ></div>
                      <span className="fw-semibold text-dark">
                        Dr. {currentAppointment?.doctor?.username}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="bg-success rounded-circle"
                        style={{ width: "8px", height: "8px" }}
                      ></div>
                      <span className="text-muted">
                        {currentAppointment?.day}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="bg-info rounded-circle"
                        style={{ width: "8px", height: "8px" }}
                      ></div>
                      <span className="text-muted">
                        {currentAppointment?.department}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="bg-warning rounded-circle"
                        style={{ width: "8px", height: "8px" }}
                      ></div>
                      <span className="text-muted">{`${convertUTCTo12Hour(
                        currentAppointment?.start_time
                      )}: ${convertUTCTo12Hour(
                        currentAppointment?.end_time
                      )}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "250px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="row g-4">
          {/* Available Students Table */}
          <div className="col-12 col-xl-6">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-primary bg-opacity-10 rounded">
                    <i className="bi bi-people-fill text-primary fs-5"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-1 fw-semibold">
                      Available Students
                    </h5>
                    <p className="text-muted small mb-0">
                      Students in {currentAppointment?.department} Department
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-uppercase small fw-medium text-muted"
                        >
                          #
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-uppercase small fw-medium text-muted"
                        >
                          Student Name
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center text-uppercase small fw-medium text-muted"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="3" className="text-center py-5">
                            <div className="d-flex justify-content-center align-items-center">
                              <div
                                className="spinner-border text-primary me-3"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                              <span className="text-muted">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        studentsByDepartment.assignments?.map(
                          (student, index) => (
                            <tr key={student.patient._id}>
                              <td className="px-4 py-3">
                                <span className="fw-medium text-dark">
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <div className="d-flex align-items-center">
                                  <div
                                    className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{ width: "32px", height: "32px" }}
                                  >
                                    <span className="small fw-medium text-primary">
                                      {student.patient.name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="fw-medium text-dark">
                                    {student.patient.name}
                                  </span>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="d-flex align-items-center gap-10 justify-content-center">
                                  <button
                                    type="button"
                                    className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                    onClick={() =>
                                      onAddStudent({
                                        department:
                                          currentAppointment.department,
                                        appointmentId: id,
                                        patientId: student.patient._id,
                                      })
                                    }
                                  >
                                    <Icon
                                      icon="fluent:add-24-regular"
                                      className="menu-icon"
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center p-4 bg-light border-top">
                  <small className="text-muted">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, studentsByDepartment.length)} of{" "}
                    {studentsByDepartment.length} entries
                  </small>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li
                          key={i}
                          className={`page-item ${
                            currentPage === i + 1 ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Appointed Students Table */}
          <div className="col-12 col-xl-6">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-success bg-opacity-10 rounded">
                    <i className="bi bi-calendar-check-fill text-success fs-5"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-1 fw-semibold">
                      Appointed Students
                    </h5>
                    <p className="text-muted small mb-0">
                      Students with appointments in{" "}
                      {currentAppointment?.department}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-uppercase small fw-medium text-muted"
                        >
                          #
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-uppercase small fw-medium text-muted"
                        >
                          Student Name
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center text-uppercase small fw-medium text-muted"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="3" className="text-center py-5">
                            <div className="d-flex justify-content-center align-items-center">
                              <div
                                className="spinner-border text-success me-3"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                              <span className="text-muted">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        studentsAppointment?.map((student, index) => (
                          <tr key={student._id}>
                            <td className="px-4 py-3">
                              <span className="fw-medium text-dark">
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="d-flex align-items-center">
                                <div
                                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                                  style={{ width: "32px", height: "32px" }}
                                >
                                  <span className="small fw-medium text-success">
                                    {student.patientId.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <span className="fw-medium text-dark">
                                  {student.patientId.name}
                                </span>
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="d-flex align-items-center gap-10 justify-content-center">
                                <button
                                  type="button"
                                  className="remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                  onClick={() => onDeleteStudent(student._id)}
                                >
                                  <Icon
                                    icon="fluent:delete-24-regular"
                                    className="menu-icon"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center p-4 bg-light border-top">
                  <small className="text-muted">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, studentsByDepartment.length)} of{" "}
                    {studentsByDepartment.length} entries
                  </small>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li
                          key={i}
                          className={`page-item ${
                            currentPage === i + 1 ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
