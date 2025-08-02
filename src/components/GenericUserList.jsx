"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axiosInstance from "../helper/axiosSetup"
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import styles from "../styles/user-management.module.css"

const GenericUserList = ({ role }) => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isPatient = role === "student" // Using 'student' as the role for patients
  const isDoctor = role === "doctor"
  const isAccountant = role === "accountant"

  const apiEndpoints = {
    student: {
      fetch: `/authentication/patients`,
      delete: `/authentication/delete-patient`,
      add: `/student/add`,
      edit: `/student/edit`,
      view: `/student/view`,
      title: "Students",
    },
    doctor: {
      fetch: `/authentication/doctors`,
      delete: `/authentication/delete-doctor`,
      add: `/doctor/add`,
      edit: `/doctor/edit`,
      view: `/doctor/view`,
      title: "Doctors",
    },
    accountant: {
      fetch: `/authentication/accountants`,
      delete: `/authentication/delete-accountant`,
      add: `/accountant/add`,
      edit: `/accountant/edit`,
      view: `/accountant/view`,
      title: "Accountants",
    },
  }

  const currentEndpoints = apiEndpoints[role]

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(currentEndpoints.fetch, {
        params: { page: currentPage, search, limit: 10 },
      })
      const dataKey = {
        student: "patients",
        doctor: "doctors",
        accountant: "accountants",
      }[role]
      setUsers(response.data[dataKey] || [])
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error(`Error fetching ${role}s:`, error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, role, currentEndpoints.fetch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${role}?`)
    if (confirmDelete) {
      try {
        const response = await axiosInstance.delete(`${currentEndpoints.delete}/${userId}`)
        if (response.status === 200) {
          alert(`${role.charAt(0).toUpperCase() + role.slice(1)} deleted successfully`)
          setUsers(users.filter((user) => user._id !== userId))
        }
      } catch (error) {
        console.error(`Error deleting ${role}:`, error)
        alert(`Error deleting ${role}`)
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

  const handleEdit = (userId) => {
    router.push(`/${role}/edit/${userId}`)
  }

  const handleView = (userId) => {
    router.push(`/${role}/view/${userId}`)
  }

  // Function to format and sort multiple department names for doctors
  const formatDepartments = (departments) => {
    return (
      departments
        ?.map((department) => department.name)
        .sort((a, b) => a.localeCompare(b))
        .join(", ") || "N/A"
    )
  }

  const getTableHeaders = () => {
    if (isPatient) {
      return ["#", "Name", "Email", "Phone", "Gender","member since", "Action"]
    } else if (isDoctor) {
      return ["#", "Username", "Email", "Phone", "Availability", "Department(s)", "Action"]
    } else if (isAccountant) {
      return ["#", "Name", "Email", "Action"]
    }
    return []
  }

  const renderTableRow = (user, index) => {
    if (isPatient) {
      return (
        <>
          <td className={styles.indexCell}>{index + 1}</td>
          <td className={styles.nameCell}>{user.name}</td>
          <td className={styles.emailCell}>{user.email}</td>
          <td className={styles.phoneCell}>{user.phone}</td>
          <td className={styles.genderCell}>{user.gender || "N/A"}</td>
                    <td className={styles.dateCell}>{new Date(user.createdAt).toLocaleDateString()}</td>

        </>
      )
    } else if (isDoctor) {
      return (
        <>
          <td className={styles.indexCell}>{index + 1}</td>
          <td className={styles.nameCell}>{user.username}</td>
          <td className={styles.emailCell}>{user.email}</td>
          <td className={styles.phoneCell}>{user.phone}</td>
          <td className={styles.genderCell}>{user.availability || "N/A"}</td>
          <td className={styles.departmentCell}>{formatDepartments(user.departments)}</td>
        </>
      )
    } else if (isAccountant) {
      return (
        <>
          <td className={styles.indexCell}>{index + 1}</td>
          <td className={styles.nameCell}>{user.name}</td>
          <td className={styles.emailCell}>{user.email}</td>
        </>
      )
    }
    return null
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
                placeholder={`Search ${role}s...`}
              />
              <Search className={styles.searchIcon} />
            </div>
            <Link href={currentEndpoints.add} className={styles.addButton}>
              <Plus className={styles.addIcon} />
              Add New {role.charAt(0).toUpperCase() + role.slice(1)}
            </Link>
          </div>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading {role}s...</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    {getTableHeaders().map((header, index) => (
                      <th key={index} className={header === "Action" ? styles.actionsCell : ""}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user._id} className={styles.tableRow}>
                      {renderTableRow(user, index)}
                      <td className={styles.actionsCell}>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.actionButton} ${styles.viewButton}`}
                            onClick={() => handleView(user._id)}
                            title="View Details"
                          >
                            <Eye className={styles.actionIcon} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEdit(user._id)}
                            title={`Edit ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                          >
                            <Edit className={styles.actionIcon} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(user._id)}
                            title={`Delete ${role.charAt(0).toUpperCase() + role.slice(1)}`}
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

          {users.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, users.length)} of {users.length}{" "}
                entries
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

export default GenericUserList
