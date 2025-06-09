'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import axiosInstance from "@/helper/axiosSetup"; // Import the configured axios instance

const TopPerformanceTwo = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/authentication/doctors`
        )
        // take at most 7
        setDoctors(res.data?.doctors?.slice(0, 7) || [])
      } catch (err) {
        console.error(err)
        setError('Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  if (loading) return <div>Loading doctors…</div>
  if (error)   return <div className="text-danger">{error}</div>

  return (
    <div className="col-xxl-4">
      <div className="card">
        <div className="card-header border-bottom"  style={{ minHeight: '70px' }} >
          <div className="d-flex align-items-center justify-content-between">
            <h6 className="fw-bold text-lg mb-0">Doctors List</h6>
            <Link
              href="/doctor-list"
              className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
            >
              View All
              <iconify-icon
                icon="solar:alt-arrow-right-linear"
                className="icon"
              />
            </Link>
          </div>
        </div>
        <div className="card-body">
          {doctors.length === 0 ? (
            <div className="text-center py-16">No doctors found</div>
          ) : (
            <div className="d-flex flex-column gap-24">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  className="d-flex align-items-center justify-content-between gap-3"
                >
                  <div className="flex-grow-1">
                    <h6 className="text-md mb-0">Dr.&nbsp;{doc.username}</h6>
                    <span className="text-sm text-secondary-light fw-medium">
                      {doc.title || '—'}
                    </span>
                  </div>
                  <span
                    className={`px-10 py-4 radius-8 fw-medium text-sm ${
                      doc.availability === 'Available'
                        ? 'bg-success-focus text-success-main'
                        : 'bg-danger-focus text-danger-main'
                    }`}
                  >
                    {doc.availability || 'Not Set'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopPerformanceTwo
