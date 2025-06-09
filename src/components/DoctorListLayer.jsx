'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "../helper/axiosSetup";  // Import the configured axios instance


const DoctorListLayer = () => {
  const [doctors, setDoctors] = useState([]); 
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/authentication/doctors`, {
          params: { page: currentPage, search, limit: 10 }
        });
        setDoctors(response.data.doctors);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [currentPage, search]);


  const handleDelete = async (doctorId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this doctor?');
    if (confirmDelete) {
      try {
        const response = await axiosInstance.delete(`/authentication/delete-doctor/${doctorId}`);
        if (response.status === 200) {
          alert('Doctor deleted successfully');
          setDoctors(doctors.filter(doctor => doctor._id !== doctorId));
        }
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Error deleting doctor');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEdit = (doctorId) => {
    router.push(`/edit-doctor?id=${doctorId}`);
  };

  const handleView = (doctorId) => {
    router.push(`/view-doctor?id=${doctorId}`);
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
              onChange={handleSearchChange}
              placeholder='Search'
            />
            <Icon icon='ion:search-outline' className='icon' />
          </form>
        </div>
        <Link href='/add-doctor' className='btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2'>
          <Icon icon='ic:baseline-plus' className='icon text-xl line-height-1' />
          Add New Doctor
        </Link>
      </div>
      <div className='card-body p-24'>
        <div className='table-responsive scroll-sm'>
          <table className='table bordered-table sm-table mb-0'>
            <thead>
              <tr>
                <th scope='col'>#</th>
                <th scope='col'>Username</th>
                <th scope='col'>Email</th>
                <th scope='col'>Phone</th>
                <th scope='col'>title</th>
                <th scope='col'>availability</th>

                <th scope='col' className='text-center'>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center">Loading...</td>
                </tr>
              ) : (
                doctors.map((doctor, index) => (
                  <tr key={doctor._id}>
                    <td>{index + 1}</td>
                    <td>{doctor.username}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.phone}</td>
                    <td>{doctor.title}</td>
                    <td>{doctor.availability}</td>

                    <td className='text-center'>
                      <div className='d-flex align-items-center gap-10 justify-content-center'>
                        <button
                          type='button'
                          className='bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                          onClick={() => handleView(doctor._id)}
                        >
                          <Icon icon='majesticons:eye-line' className='icon text-xl' />
                        </button>
                        <button
                          type='button'
                          className='bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                          onClick={() => handleEdit(doctor._id)}
                        >
                          <Icon icon='lucide:edit' className='menu-icon' />
                        </button>
                        <button
                          type='button'
                          className='remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                          onClick={() => handleDelete(doctor._id)}
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
          <span>Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, doctors.length)} of {doctors.length} entries</span>
          <ul className='pagination d-flex flex-wrap align-items-center gap-2 justify-content-center'>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <Link
                  className='page-link text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md'
                  href="#"
                  onClick={() => handlePageChange(i + 1)}
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

export default DoctorListLayer;
