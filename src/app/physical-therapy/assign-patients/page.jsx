"use client"

import { useState, useEffect } from "react"
import { Icon } from "@iconify/react/dist/iconify.js"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"

const AssignPatientsToPhysicalTherapy = () => {
  const [patients, setPatients] = useState([])
  const [assignedPatients, setAssignedPatients] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()

  useEffect(() => {
    fetchPatients()
    fetchAssignedPatients()
  }, [currentPage, search])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      // Make sure this is the correct endpoint to fetch all patients
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patients?page=${currentPage}&search=${search}`)
      console.log("Patients response:", response.data)  // Log the response
      setPatients(response.data.patients || []);  // Use fallback in case of missing data
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoading(false)
    }
  }
  
  
  const fetchAssignedPatients = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/physical-therapy-assignments`)
      const assignments = Array.isArray(response.data) ? response.data : response.data.assignments || []

      const patientIds = assignments.map((assignment) =>
        assignment.patient && typeof assignment.patient === "object" ? assignment.patient._id : assignment.patient,
      )

      setAssignedPatients(patientIds)
    } catch (error) {
      console.error("Error fetching assigned patients:", error)
    }
  }

  const handleAssignPatient = async (patientId) => {
    console.log("Assigning patient with ID:", patientId)
  
    if (!patientId) {
      alert("Invalid patient ID.")
      return
    }
  
    try {
      await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/assign-to-physical`, { patientId })
      setAssignedPatients([...assignedPatients, patientId])
      alert("Patient assigned to physical therapy department successfully!")
    } catch (error) {
      console.error("Error assigning patient:", error)
      alert("Error assigning patient to physical therapy department")
    }
  }

  const handleUnassignPatient = async (patientId) => {
    try {
      await axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_URL}/authentication/unassign-from-physical/${patientId}`)
      setAssignedPatients(assignedPatients.filter((id) => id !== patientId))
      alert("Patient unassigned from physical therapy department successfully!")
    } catch (error) {
      console.error("Error unassigning patient:", error)
      alert("Error unassigning patient from physical therapy department")
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPatients()
  }

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-lg mb-0">Assign Patients to Physical Therapy Department</h6>
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="bg-base h-40-px w-auto"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
            />
            <Icon icon="ion:search-outline" className="icon" />
          </form>
        </div>
        <button
          onClick={() => router.push("/physical-therapy/patients")}
          className="btn btn-primary-600 radius-8 px-20 py-11"
        >
          View Physical Therapy Patients
        </button>
      </div>

      <div className="card-body p-24">
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Disability Type</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
  {patients && patients.length > 0 ? (
    patients.map((patient, index) => (
      <tr key={patient._id}>
        <td>{(currentPage - 1) * 10 + index + 1}</td>
        <td>{patient.name}</td>
        <td>{patient.email}</td>
        <td>{patient.phone}</td>
        <td>{patient.disabilityType || "Not specified"}</td>
        <td>
          <span
            className={`badge ${assignedPatients.includes(patient._id) ? "bg-success" : "bg-secondary"}`}
          >
            {assignedPatients.includes(patient._id) ? "Assigned" : "Not Assigned"}
          </span>
        </td>
        <td className="text-center">
          {assignedPatients.includes(patient._id) ? (
            <button
              onClick={() => handleUnassignPatient(patient._id)}
              className="bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
              title="Unassign from Physical Therapy Department"
            >
              <Icon icon="majesticons:close-line" className="icon text-xl" />
            </button>
          ) : (
            <button
              onClick={() => handleAssignPatient(patient._id)}
              className="bg-success-focus bg-hover-success-200 text-success-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
              title="Assign to Physical Therapy Department"
            >
              <Icon icon="majesticons:plus-line" className="icon text-xl" />
            </button>
          )}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="text-center">No patients found.</td>
    </tr>
  )}
</tbody>

            </table>
          </div>
        )}

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
          <span className="text-gray-900">
            Showing {patients.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{" "}
            {Math.min(currentPage * 10, patients.length)} of {patients.length} patients
          </span>
          <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button
                  className="page-link text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AssignPatientsToPhysicalTherapy
