"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "../helper/axiosSetup";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import styles from "../styles/user-management.module.css";

const DepartmentListLayer = () => {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/departments", {
          params: { page: currentPage, search, limit: 10 },
        });
        setDepartments(response.data.departments);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, [currentPage, search]);

  const handleDelete = async (departmentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this department?");
    if (confirmDelete) {
      try {
        const response = await axiosInstance.delete(`/departments/delete-department/${departmentId}`);
        if (response.status === 200) {
          alert("Department deleted successfully");
          setDepartments(departments.filter((department) => department._id !== departmentId));
        }
      } catch (error) {
        console.error("Error deleting department:", error);
        alert("Error deleting department");
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

  const handleEdit = (departmentId) => {
    router.push(`/edit-department?id=${departmentId}`);
  };

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
                placeholder="Search departments..."
              />
              <Search className={styles.searchIcon} />
            </div>
            <Link href="/add-department" className={styles.addButton}>
              <Plus className={styles.addIcon} />
              Add New Department
            </Link>
          </div>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading departments...</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>#</th>
                    <th>Department Name</th>
                    <th>Description</th>
                    <th className={styles.actionsCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((department, index) => (
                    <tr key={department._id} className={styles.tableRow}>
                      <td className={styles.indexCell}>{index + 1}</td>
                      <td className={styles.nameCell}>{department.name}</td>
                      <td className={styles.descriptionCell}>{department.description}</td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEdit(department._id)}
                            title="Edit Department"
                          >
                            <Edit className={styles.actionIcon} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(department._id)}
                            title="Delete Department"
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

          {departments.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, departments.length)} of {departments.length} entries
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
  );
};

export default DepartmentListLayer;
