'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "../helper/axiosSetup";  // Import the configured axios instance

const VolunteerListLayer = () => {
  const [volunteers, setVolunteers] = useState([]); // State to store volunteers
  const [search, setSearch] = useState(''); // State to store search query
  const [currentPage, setCurrentPage] = useState(1); // State to store current page
  const [totalPages, setTotalPages] = useState(1); // State to store total pages
  const [loading, setLoading] = useState(false); // State to indicate loading
  const router = useRouter(); // Next.js router

  // Fetch volunteers when component mounts or when page/search changes
  useEffect(() => {
    const fetchVolunteers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/authentication/volunteers`, {

          params: {
            page: currentPage,
            search: search,
            limit: 10
          }
        });
        setVolunteers(response.data.volunteers);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers(); // Call the fetch function
  }, [currentPage, search]);



  const handleDelete = async (volunteerId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this volunteer?');
  
    if (confirmDelete) {
      try {
        const response = await axiosInstance.delete(`/authentication/delete-volunteer/${volunteerId}`);
        if (response.status === 200) {
          alert('Volunteer deleted successfully');
          // Remove the volunteer from the UI (filter out the deleted volunteer)
          setVolunteers(volunteers.filter(volunteer => volunteer._id !== volunteerId));
        }
      } catch (error) {
        console.error('Error deleting volunteer:', error);
        alert('Error deleting volunteer');
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

  const handleEdit = (volunteerId) => {
    // Redirect to the Edit page for volunteers with volunteer ID as a query param
    router.push(`/edit-volunteer?id=${volunteerId}`);
  };

  const handleView = (volunteerId) => {
    // Redirect to the View Profile page for volunteers with volunteer ID as a query parameter
    router.push(`/view-volunteer?id=${volunteerId}`);
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
          href='/add-volunteer'
          className='btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2'
        >
          <Icon
            icon='ic:baseline-plus'
            className='icon text-xl line-height-1'
          />
          Add New Volunteer
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
                <th scope='col'>Volunteer Type</th>
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
                volunteers.map((volunteer, index) => (
                  <tr key={volunteer._id}>
                    <td>
                      <div className='d-flex align-items-center gap-10'>
                        <div className='form-check style-check d-flex align-items-center'>
                        </div>
                        {index + 1}
                      </div>
                    </td>
                    <td>{new Date(volunteer.createdAt).toLocaleDateString()}</td>
                    <td>{volunteer.name}</td>
                    <td>{volunteer.email}</td>
                    <td>{volunteer.phone}</td>
                    <td>{volunteer.volunteerType || 'Not specified'}</td>
                    <td className='text-center'>
                      <div className='d-flex align-items-center gap-10 justify-content-center'>
                        <button
                          type='button'
                          className='bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                          onClick={() => handleView(volunteer._id)}  // View button handler
                        >
                          <Icon
                            icon='majesticons:eye-line'
                            className='icon text-xl'
                          />
                        </button>
                        <button
                          type='button'
                          className='bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                          onClick={() => handleEdit(volunteer._id)}  // Edit button handler
                        >
                          <Icon icon='lucide:edit' className='menu-icon' />
                        </button>
                        <button
                          type='button'
                          className='remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                          onClick={() => handleDelete(volunteer._id)}  // Delete button handler
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
          <span>Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, volunteers.length)} of {volunteers.length} entries</span>
          <ul className='pagination d-flex flex-wrap align-items-center gap-2 justify-content-center'>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <Link
                  className='page-link text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md'
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

export default VolunteerListLayer;
