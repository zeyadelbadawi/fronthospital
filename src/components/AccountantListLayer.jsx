"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axiosInstance from "../helper/axiosSetup"
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import styles from "../styles/user-management.module.css"

const AccountantListLayer = () => {
  const [accountants, setAccountants] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchAccountants = async () => {
      setLoading(true)
      try {
        const response = await axiosInstance.get(`/authentication/accountants`, {
          params: { page: currentPage, search, limit: 10 },
        })
        setAccountants(response.data.accountants)
        setTotalPages(response.data.totalPages)
      } catch (error) {
        console.error("Error fetching accountants:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAccountants()
  }, [currentPage, search])

  const handleDelete = async (accountantId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Accountant?")
    if (confirmDelete) {
      try {
        const response = await axiosInstance.delete(`/authentication/delete-accountant/${accountantId}`)
        if (response.status === 200) {
          alert("Accountant deleted successfully")
          setAccountants(accountants.filter((accountant) => accountant._id !== accountantId))
        }
      } catch (error) {
        console.error("Error deleting Accountant:", error)
        alert("Error deleting Accountant")
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

  const handleEdit = (accountantId) => {
    router.push(`/edit-accountant?id=${accountantId}`)
  }

  const handleView = (accountantId) => {
    router.push(`/view-accountant?id=${accountantId}`)
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
                placeholder="Search accountants..."
              />
              <Search className={styles.searchIcon} />
            </div>
            <Link href="/add-accountant" className={styles.addButton}>
              <Plus className={styles.addIcon} />
              Add New Accountant
            </Link>
          </div>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading accountants...</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th className={styles.actionsCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {accountants.map((accountant, index) => (
                    <tr key={accountant._id} className={styles.tableRow}>
                      <td className={styles.indexCell}>{index + 1}</td>
                      <td className={styles.nameCell}>{accountant.name}</td>
                      <td className={styles.emailCell}>{accountant.email}</td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.actionButton} ${styles.viewButton}`}
                            onClick={() => handleView(accountant._id)}
                            title="View Details"
                          >
                            <Eye className={styles.actionIcon} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEdit(accountant._id)}
                            title="Edit Accountant"
                          >
                            <Edit className={styles.actionIcon} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(accountant._id)}
                            title="Delete Accountant"
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

          {accountants.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, accountants.length)} of{" "}
                {accountants.length} entries
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

export default AccountantListLayer
