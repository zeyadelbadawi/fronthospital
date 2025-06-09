'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "../helper/axiosSetup";  // Import the configured axios instance

const PatientProfilesListLayer = () => {
  const [patients, setPatients] = useState([]); // State to store patients
  const [search, setSearch] = useState(''); // State to store search query
  const [currentPage, setCurrentPage] = useState(1); // State to store current page
  const [totalPages, setTotalPages] = useState(1); // State to store total pages
  const [loading, setLoading] = useState(false); // State to indicate loading
  const router = useRouter(); // Next.js router

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
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients(); // Call the fetch function
  }, [currentPage, search]);

  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);  // Reset to first page when search query changes
  };

  // Handle pagination change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };



  const handleView = (patientId) => {
    // Redirect to the View Profile page with patient ID as a query parameter
    router.push(`/marketplace-details?id=${patientId}`);
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
                <th scope='col'>Disability Type</th>
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
                    <td>{patient.disabilityType || 'Un Evaluated yet'}</td>
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

export default PatientProfilesListLayer;
