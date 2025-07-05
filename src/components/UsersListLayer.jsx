"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axiosInstance from "../helper/axiosSetup"
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import styles from "../styles/user-management.module.css"

const UsersListLayer = () => {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true)
      try {
        const response = await axiosInstance.get(`/authentication/patients`, {
          params: {
            page: currentPage,
            search: search,
            limit: 10,
          },
        })
        setPatients(response.data.patients)
        setTotalPages(response.data.totalPages)
      } catch (error) {
        console.error("Error fetching Students:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [currentPage, search])

  const handleDelete = async (patientId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Student?")
    if (confirmDelete) {
      try {
        const response = await axiosInstance.delete(`/authentication/delete-patient/${patientId}`)
        if (response.status === 200) {
          alert("Student deleted successfully")
          setPatients(patients.filter((patient) => patient._id !== patientId))
        }
      } catch (error) {
        console.error("Error deleting Student:", error)
        alert("Error deleting Student")
      }
    }
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleEdit = (patientId) => {
    router.push(`/edit-user?id=${patientId}`)
  }

  const handleView = (patientId) => {
    router.push(`/view-profile?id=${patientId}`)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                name="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search students..."
              />
              <Search className={styles.searchIcon} />
            </div>
            <Link href="/add-user" className={styles.addButton}>
              <Plus className={styles.addIcon} />
              Add New Student
            </Link>
          </div>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading students...</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>#</th>
                    <th>Join Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th className={styles.actionsCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient, index) => (
                    <tr key={patient._id} className={styles.tableRow}>
                      <td className={styles.indexCell}>{index + 1}</td>
                      <td className={styles.dateCell}>{new Date(patient.createdAt).toLocaleDateString()}</td>
                      <td className={styles.nameCell}>{patient.name}</td>
                      <td className={styles.emailCell}>{patient.email}</td>
                      <td className={styles.phoneCell}>{patient.phone}</td>
                      <td className={styles.genderCell}>{patient.gender || "N/A"}</td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.actionButton} ${styles.viewButton}`}
                            onClick={() => handleView(patient._id)}
                            title="View Details"
                          >
                            <Eye className={styles.actionIcon} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEdit(patient._id)}
                            title="Edit Student"
                          >
                            <Edit className={styles.actionIcon} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(patient._id)}
                            title="Delete Student"
                          >
                            <Trash2 className={styles.actionIcon} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {patients.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, patients.length)} of{" "}
                {patients.length} entries
              </span>
              <div className={styles.paginationButtons}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.active : ""}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UsersListLayer
