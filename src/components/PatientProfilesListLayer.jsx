"use client"
import { useState, useEffect } from "react"
import { Search, Eye, Calendar, Phone, Mail, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axiosInstance from "../helper/axiosSetup"
import styles from "../styles/utility-components.module.css"

const PatientProfilesListLayer = () => {
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
        console.error("Error fetching patients:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [currentPage, search])

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleView = (patientId) => {
    router.push(`/marketplace-details?id=${patientId}`)
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.listHeader}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            name="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search patients..."
          />
          <Search className={styles.searchIcon} size={20} />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.modernTable}>
          <thead className={styles.tableHeader}>
            <tr>
              <th scope="col">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <User size={16} />#
                </div>
              </th>
              <th scope="col">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={16} />
                  Join Date
                </div>
              </th>
              <th scope="col">Name</th>
              <th scope="col">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={16} />
                  Email
                </div>
              </th>
              <th scope="col">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone size={16} />
                  Phone
                </div>
              </th>
              <th scope="col">Disability Type</th>
              <th scope="col" style={{ textAlign: "center" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className={styles.loadingState}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                    <div className={styles.modernLoader}></div>
                    Loading patients...
                  </div>
                </td>
              </tr>
            ) : (
              patients.map((patient, index) => (
                <tr key={patient._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
                      {(currentPage - 1) * 10 + index + 1}
                    </div>
                  </td>
                  <td className={styles.tableCell}>{new Date(patient.createdAt).toLocaleDateString()}</td>
                  <td className={styles.tableCell}>
                    <div style={{ fontWeight: "600", color: "#374151" }}>{patient.name}</div>
                  </td>
                  <td className={styles.tableCell}>{patient.email}</td>
                  <td className={styles.tableCell}>{patient.phone}</td>
                  <td className={styles.tableCell}>
                    <span className={patient.disabilityType ? styles.statusCompleted : styles.statusPending}>
                      {patient.disabilityType || "Un Evaluated yet"}
                    </span>
                  </td>
                  <td className={styles.tableCell} style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.viewButton}`}
                      onClick={() => handleView(patient._id)}
                      title="View Patient Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.paginationInfo}>
          Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, patients.length)} of {patients.length}{" "}
          entries
        </span>
        <ul className={styles.paginationList}>
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i} className={`${styles.paginationItem} ${currentPage === i + 1 ? styles.paginationActive : ""}`}>
              <Link
                className={styles.paginationLink}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(i + 1)
                }}
              >
                {i + 1}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default PatientProfilesListLayer
