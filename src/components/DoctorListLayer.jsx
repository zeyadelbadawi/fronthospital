"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "../helper/axiosSetup";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import styles from "../styles/user-management.module.css";

const DoctorListLayer = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/authentication/doctors`, {
          params: { page: currentPage, search, limit: 10 },
        });
        setDoctors(response.data.doctors);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [currentPage, search]);

  const handleDelete = async (doctorId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this doctor?");
    if (confirmDelete) {
      try {
        const response = await axiosInstance.delete(`/authentication/delete-doctor/${doctorId}`);
        if (response.status === 200) {
          alert("Doctor deleted successfully");
          setDoctors(doctors.filter((doctor) => doctor._id !== doctorId));
        }
      } catch (error) {
        console.error("Error deleting doctor:", error);
        alert("Error deleting doctor");
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

  const handleEdit = (doctorId) => {
    router.push(`/edit-doctor?id=${doctorId}`);
  };

  const handleView = (doctorId) => {
    router.push(`/view-doctor?id=${doctorId}`);
  };

// Function to format and sort multiple department names
const formatDepartments = (departments) => {
  return departments
    .map(department => department.name) // Get department names
    .sort((a, b) => a.localeCompare(b)) // Sort them alphabetically
    .join(", "); // Join them into a comma-separated string
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
                placeholder="Search doctors..."
              />
              <Search className={styles.searchIcon} />
            </div>
            <Link href="/add-doctor" className={styles.addButton}>
              <Plus className={styles.addIcon} />
              Add New Doctor
            </Link>
          </div>
        </div>
        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading doctors...</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Title</th>
                    <th>Availability</th>
                    <th>Department(s)</th> {/* Updated header */}
                    <th className={styles.actionsCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor, index) => (
                    <tr key={doctor._id} className={styles.tableRow}>
                      <td className={styles.indexCell}>{index + 1}</td>
                      <td className={styles.nameCell}>{doctor.username}</td>
                      <td className={styles.emailCell}>{doctor.email}</td>
                      <td className={styles.phoneCell}>{doctor.phone}</td>
                      <td className={styles.genderCell}>{doctor.title}</td>
                      <td className={styles.genderCell}>{doctor.availability}</td>
                      <td className={styles.departmentCell}>
                        {/* Display multiple departments */}
                        {doctor.departments && doctor.departments.length > 0
                          ? formatDepartments(doctor.departments)
                          : "No departments assigned"}
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.actionButton} ${styles.viewButton}`}
                            onClick={() => handleView(doctor._id)}
                            title="View Details">
                            <Eye className={styles.actionIcon} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEdit(doctor._id)}
                            title="Edit Doctor">
                            <Edit className={styles.actionIcon} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(doctor._id)}
                            title="Delete Doctor">
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
          {doctors.length > 0 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationInfo}>
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, doctors.length)} of {doctors.length}{" "}
                entries
              </span>
              <div className={styles.paginationButtons}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.active : ""}`}
                    onClick={() => handlePageChange(i + 1)}>
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
export default DoctorListLayer;
