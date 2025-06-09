'use client';
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import axiosInstance from '@/helper/axiosSetup'

const LatestAppointmentsOne = () => {
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    axiosInstance
      .get('/authentication/latest-appointments')
      .then(({ data }) => setAppointments(data))
      .catch(err => console.error('Failed to load latest appointments:', err))
  }, [])
  

  const formatDate = iso =>
    new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="col-xxl-12">
      <div className="card h-100">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
          <h6 className="text-lg fw-semibold mb-0">Latest Appointments</h6>
          <Link href="#" className="text-primary-600 hover-text-primary d-flex align-items-center gap-1">
            View All
            <iconify-icon icon="solar:alt-arrow-right-linear" className="icon" />
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table mb-0 rounded-0 border-0">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Session/Evaluation</th>
                  <th>Program Type</th>
                  <th>Date</th>
                  <th>Time</th>
                                    <th>doctor</th>

                  <th>Status</th>

                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app.id}>
                    <td>{app.studentName}</td>
                    <td>{app.itemName}</td>
                    <td>{app.programType}</td>
                    <td>{formatDate(app.date)}</td>
                    <td>{app.time}</td>
                    <td>{app.doctor ? `Dr. ${app.doctor}` : 'Admin'}</td>

                    <td>
                      <span
                        className={`px-10 py-4 radius-8 fw-medium text-sm ${
                          app.status === 'Completed'
                            ? 'bg-success-focus text-success-main'
                            : 'bg-warning-focus text-warning-main'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LatestAppointmentsOne
