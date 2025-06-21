"use client"

import { useState, useEffect } from "react"
import { Icon } from "@iconify/react/dist/iconify.js"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"

const AllPatientsPhysicalTherapy = () => {
  const [assignments, setAssignments] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPhysicalTherapyPatients()
  }, [currentPage, search])

  const fetchPhysicalTherapyPatients = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(
        `/authentication/physical-therapy-assignments?page=${currentPage}&search=${search}`,
      )

      const assignmentsData = Array.isArray(response.data) ? response.data : response.data.assignments || []

      setAssignments(assignmentsData)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching physical therapy patients:", error)
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPhysicalTherapyPatients()
  }

  const getPatientProperty = (assignment, property) => {
    if (!assignment || !assignment.patient) return "N/A"
    return assignment.patient[property] || "N/A"
  }

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h6 className="text-lg mb-0">Physical Therapy Department Patients</h6>
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
          onClick={() => router.push("/physical-therapy/assign-patients")}
          className="btn btn-primary-600 radius-8 px-20 py-11"
        >
          Assign Patients
        </button>
      </div>

      <div className="card-body p-24">
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">No patients assigned to physical therapy</p>
            <button onClick={() => router.push("/physical-therapy/assign-patients")} className="btn btn-primary mt-2">
              Assign Patients
            </button>
          </div>
        ) : (
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Assigned Date</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, index) => (
                  <tr key={assignment._id || index}>
                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                    <td>{getPatientProperty(assignment, "name")}</td>
                    <td>{getPatientProperty(assignment, "email")}</td>
                    <td>{getPatientProperty(assignment, "phone")}</td>
                    <td>{assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString() : "N/A"}</td>
                    <td>
                      <span className={`badge ${assignment.status === "active" ? "bg-success" : "bg-secondary"}`}>
                        {assignment.status || "Unknown"}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center gap-10 justify-content-center">
                        <button
                          onClick={() => router.push(`/physical-therapy/plan/${assignment.patient?._id}`)}
                          type="button"
                          className="bg-primary-focus bg-hover-primary-200 text-primary-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          title="Patient Plan"
                          disabled={!assignment.patient?._id}
                        >
                          <Icon icon="majesticons:clipboard-list-line" className="icon text-xl" />
                        </button>
                        <button
                          onClick={() => router.push(`/physical-therapy/test/${assignment.patient?._id}`)}
                          type="button"
                          className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          title="Patient Test"
                          disabled={!assignment.patient?._id}
                        >
                          <Icon icon="majesticons:clipboard-check-line" className="icon text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
          <span className="text-gray-900">Showing {assignments.length} physical therapy department patients</span>
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

export default AllPatientsPhysicalTherapy
