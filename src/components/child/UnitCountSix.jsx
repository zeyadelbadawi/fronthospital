"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const UnitCountSix = () => {
  const [doctorData, setDoctorData] = useState({ totalDoctors: 0, joinedThisWeek: 0 });
  const [volunteerData, setVolunteerData] = useState({ totalVolunteers: 0, joinedThisWeek: 0 });
  const [patientData, setPatientData] = useState({ totalPatients: 0, joinedThisWeek: 0 });
  const [AccountantData, setAccountantData] = useState({ totalAccountants: 0, joinedThisWeek: 0 });

  useEffect(() => {
    // Fetch doctor data
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/doctors/count`)
      .then(response => setDoctorData(response.data))
      .catch(error => console.error("Error fetching doctor data:", error));
    
      // Fetch accountant data
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/accountants/count`)
      .then(response => setAccountantData(response.data))
      .catch(error => console.error("Error fetching accountant data:", error));

    // Fetch volunteer data
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/volunteers/count`)
      .then(response => setVolunteerData(response.data))
      .catch(error => console.error("Error fetching volunteer data:", error));

    // Fetch patient data
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patients/count`)
      .then(response => setPatientData(response.data))
      .catch(error => console.error("Error fetching patient data:", error));
  }, []);

  return (
    <>

<div className='col-xxl-4 col-xl-4 col-sm-6'>
        <div className='card p-3 shadow-2 radius-8 h-100 bg-gradient-end-1'>
          <div className='card-body p-0'>
            <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
              <div className='d-flex align-items-center gap-2'>
                <span className='mb-0 w-48-px h-48-px bg-primary-100 text-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                  <i className='ri-group-fill' />
                </span>
                <div>
                  <h6 className='fw-semibold mb-2'>{patientData.totalPatients}</h6>
                  <span className='fw-medium text-secondary-light text-sm'>
                    Students
                  </span>
                </div>
              </div>
            </div>
            <p className='text-sm mb-0'>
              <span className='text-primary-600'>{patientData.joinedThisWeek}</span> Students joined this week
            </p>
          </div>
        </div>
      </div>

      <div className='col-xxl-4 col-xl-4 col-sm-6'>
        <div className='card p-3 shadow-2 radius-8 h-100 bg-gradient-end-6'>
          <div className='card-body p-0'>
            <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
              <div className='d-flex align-items-center gap-2'>
                <span className='mb-0 w-48-px h-48-px bg-cyan-100 text-cyan-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                  <i className='ri-group-fill' />
                </span>
                <div>
                  <h6 className='fw-semibold mb-2'>{doctorData.totalDoctors}</h6>
                  <span className='fw-medium text-secondary-light text-sm'>
                    Doctors
                  </span>
                </div>
              </div>
            </div>
            <p className='text-sm mb-0'>
              <span className='text-cyan-600'>{doctorData.joinedThisWeek}</span> Doctors joined this week
            </p>
          </div>
        </div>
      </div>




      <div className='col-xxl-4 col-xl-4 col-sm-6'>
        <div className='card p-3 shadow-2 radius-8 h-100 bg-gradient-end-1'>
          <div className='card-body p-0'>
            <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
              <div className='d-flex align-items-center gap-2'>
                <span className='mb-0 w-48-px h-48-px bg-success-100 text-success-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                <i className='ri-group-fill' />
                </span>
                <div>
                  <h6 className='fw-semibold mb-2'>{AccountantData.totalAccountants}</h6>
                  <span className='fw-medium text-secondary-light text-sm'>
                    Accountants
                  </span>
                </div>
              </div>
            </div>
            <p className='text-sm mb-0'>
            <span className='text-success-600'>{AccountantData.joinedThisWeek}</span> Accountants joined this week
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnitCountSix;
