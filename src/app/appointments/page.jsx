"use client";

import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../helper/axiosSetup";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { ModelContextInst } from "@/contexts/ModelContext";
import UpdateModel from "@/components/UpdateModel";
import Loader from "@/components/Loader";
import { convertUTCTo12Hour, convertUTCTo24Hour } from "@/helper/DateTime";
import AppointmentUpdate from "./updateAppointment";
import DeleteModel from "@/components/DeleteModel";
import DeleteAppointment from "./deleteAppointments";

/* function convertUTCTo12Hour(utcTimestamp) {
  const date = new Date(utcTimestamp);

  // Get UTC hours and minutes (no timezone conversion)
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  // Convert to 12-hour format
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? "PM" : "AM";

  const formattedHour = hour12.toString().padStart(2, "0");
  const formattedMinute = minutes.toString().padStart(2, "0");

  return `${formattedHour}:${formattedMinute} ${ampm}`;
}
 */
export default function AppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState(""); // State to store search query
  const [currentPage, setCurrentPage] = useState(1); // State to store current page
  const [totalPages, setTotalPages] = useState(1); // State to store total pages
  const [loading, setLoading] = useState(false); // State to indicate loading
  const router = useRouter(); // Next.js router
  const [currentId, setCurrentId] = useState();
  const [selectedAppointment, setSelectedAppointment] = useState({});
  const {
    openUpdateModal,
    showUpdateModal,
    closeUpdateModal,
    showDeleteModal,
    openDeleteModal,
    closeDeleteModal,
    setIsLoading,
    isLoading,
  } = useContext(ModelContextInst);

  // Function to fetch appointments from the API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/appointments/");
      setAppointments(response.data);
      console.log("Appointments fetched successfully:", response.data);
    } catch (error) {
      setLoading(false);
      alert("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);

  const onUpdateClose = () => {
    setIsLoading(false);
    setSelectedAppointment({});
    setCurrentId(null);
    closeUpdateModal();
  };

  const onDeleteClose = () => {
    setIsLoading(false);
    setCurrentId(null);
    closeDeleteModal();
  };

  return (
    <div className="card h-100 p-0 radius-12">
      {/* Card Header with Search and Add New Appointment Button */}
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex row align-items-center flex-wrap gap-3 justify-content-between">
        <div className="">
          <h1 className="fs-2">Appointments</h1>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3 justify-content-between">
          <div className="d-flex align-items-center flex-wrap gap-3">
            <form className="navbar-search">
              <input
                type="text"
                className="bg-base h-40-px w-auto"
                name="search"
                value={search}
                onChange={() => {}} // Update search query
                placeholder="Search"
              />
              <Icon icon="ion:search-outline" className="icon" />
            </form>
          </div>
          <Link
            href={"/appointments/add-appointments"}
            className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
          >
            <Icon
              icon="ic:baseline-plus"
              className="icon text-xl line-height-1"
            />
            Add New Appointment
          </Link>
        </div>
      </div>
      {/* Appointment Table */}
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">
                  <div className="d-flex align-items-center gap-10">
                    <div className="form-check style-check d-flex align-items-center"></div>
                    #
                  </div>
                </th>
                <th scope="col">Day</th>
                <th scope="col">Department</th>
                <th scope="col">Slot</th>
                <th scope="col">Doctor</th>

                <th scope="col" className="text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : (
                appointments.appointments?.map((appointment, index) => (
                  <tr key={appointment._id}>
                    <td>
                      <div className="d-flex align-items-center gap-10">
                        <div className="form-check style-check d-flex align-items-center"></div>
                        {index + 1}
                      </div>
                    </td>
                    <td>{appointment.day}</td>
                    <td>{appointment.department}</td>
                    <td>
                      {`${convertUTCTo12Hour(
                        appointment.start_time
                      )} : ${convertUTCTo12Hour(appointment.end_time)}`}
                    </td>
                    <td>{appointment.doctor.username}</td>

                    {/* Action Buttons */}
                    <td className="text-center">
                      <div className="d-flex align-items-center gap-10 justify-content-center">
                        <Link
                          href={`/appointments/${appointment._id}`}
                          className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                        >
                          <Icon
                            icon="majesticons:eye-line"
                            className="icon text-xl"
                          />
                        </Link>

                        <button
                          type="button"
                          className="bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          onClick={() => {
                            setCurrentId(appointment._id);
                            setSelectedAppointment({
                              doctor: appointment.doctor._id,
                              day: appointment.day,
                              department: appointment.department,
                              start_time: convertUTCTo24Hour(
                                appointment.start_time
                              ).split(" ")[0],
                              end_time: convertUTCTo24Hour(
                                appointment.end_time
                              ).split(" ")[0],
                            });
                            openUpdateModal();
                          }} // Edit button handler
                        >
                          <Icon icon="lucide:edit" className="menu-icon" />
                        </button>
                        <button
                          type="button"
                          className="remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          onClick={() => {
                            openDeleteModal();
                            setCurrentId(appointment._id);
                          }} // Call the delete handler
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
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
          <span>
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, appointments.length)} of{" "}
            {appointments.length} entries
          </span>
          <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <Link
                  className="page-link text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px  text-md"
                  href="#"
                  onClick={() => handlePageChange(i + 1)} // Handle page change
                >
                  {i + 1}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal for Appointment Details */}
      {/* Modal for User Actions */}
      <UpdateModel
        title="Update Appointment Slot"
        closeFun={onUpdateClose}
        color={"bg-warning"}
      >
        <AppointmentUpdate
          appointmentId={currentId}
          currentData={selectedAppointment}
        />
      </UpdateModel>

      <DeleteModel
        closeFun={onDeleteClose}
        color={"bg-danger"}
        title={"Delete Appointment Slot"}
      >
        <DeleteAppointment currentId={currentId} />
      </DeleteModel>
    </div>
  );
}

/* 

const UsersListLayer = () => {
  
 

  // Fetch patients when component mounts or when page/search changes
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/authentication/patients`, {

          params: {
            page: currentPage,
            search: search,
            limit: 10
          }
        });
        setPatients(response.data.patients);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching Students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients(); // Call the fetch function
  }, [currentPage, search]);

  const handleDelete = async (patientId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this Student?');
  
    if (confirmDelete) {
      try {
        const response = await axiosInstance.delete(`/authentication/delete-patient/${patientId}`);

        if (response.status === 200) {
          alert('Student deleted successfully');
          // Remove the patient from the UI (filter out the deleted patient)
          setPatients(patients.filter(patient => patient._id !== patientId));
        }
      } catch (error) {
        console.error('Error deleting Student:', error);
        alert('Error deleting Student');
      }
    }
  };
  

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);  // Reset to first page when search query changes
  };

  // Handle pagination change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEdit = (patientId) => {
    // Redirect to the Edit page with patient ID as a query param
    router.push(`/edit-user?id=${patientId}`);
  };

  const handleView = (patientId) => {
    // Redirect to the View Profile page with patient ID as a query parameter
    router.push(`/view-profile?id=${patientId}`);
  };

  return (
    <div className='card h-100 p-0 radius-12'>
      <div className='card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between'>
        <div className='d-flex align-items-center flex-wrap gap-3'>
          
          <form className='navbar-search'>
            <input
              type='text'
              className='bg-base h-40-px w-auto'
              name='search'
              value={search}
              onChange={handleSearchChange}  // Update search query
              placeholder='Search'
            />
            <Icon icon='ion:search-outline' className='icon' />
          </form>
        </div>
        <Link
          href='/add-user'
          className='btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2'
        >
          <Icon
            icon='ic:baseline-plus'
            className='icon text-xl line-height-1'
          />
          Add New Student
        </Link>
      </div>
      <div className='card-body p-24'>
        <div className='table-responsive scroll-sm'>
          <table className='table bordered-table sm-table mb-0'>
            <thead>
              <tr>
                <th scope='col'>
                  <div className='d-flex align-items-center gap-10'>
                    <div className='form-check style-check d-flex align-items-center'>
                
                    </div>
                    #
                  </div>
                </th>
                <th scope='col'>Join Date</th>
                <th scope='col'>Name</th>
                <th scope='col'>Email</th>
                <th scope='col'>Phone</th>
                <th scope='col'>gender</th>

                <th scope='col' className='text-center'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center">Loading...</td>
                </tr>
              ) : (
                patients.map((patient, index) => (
                  <tr key={patient._id}>
                    <td>
                      <div className='d-flex align-items-center gap-10'>
                        <div className='form-check style-check d-flex align-items-center'>
                        
                        </div>
                        {index + 1}
                      </div>
                    </td>
                    <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.gender  || '0'}</td>

                    <td className='text-center'>
                      <div className='d-flex align-items-center gap-10 justify-content-center'>
                      <button
  type='button'
  className='bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
  onClick={() => handleView(patient._id)}  // Call the View button handler
>
  <Icon
    icon='majesticons:eye-line'
    className='icon text-xl'
  />
</button>

                        <button
                          type='button'
                          className='bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                          onClick={() => handleEdit(patient._id)}  // Edit button handler
                        >
                          <Icon icon='lucide:edit' className='menu-icon' />
                        </button>
                        <button
  type='button'
  className='remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
  onClick={() => handleDelete(patient._id)}  // Call the delete handler
>
  <Icon icon='fluent:delete-24-regular' className='menu-icon' />
</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24'>
          <span>Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, patients.length)} of {patients.length} entries</span>
          <ul className='pagination d-flex flex-wrap align-items-center gap-2 justify-content-center'>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <Link
                  className='page-link text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px  text-md'
                  href="#"
                  onClick={() => handlePageChange(i + 1)}  // Handle page change
                >
                  {i + 1}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UsersListLayer;
 */
