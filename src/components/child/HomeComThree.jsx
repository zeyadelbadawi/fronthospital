"use client"
import { useEffect, useState } from "react"
import { Stethoscope, User, Users } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/styles/home-components.module.css"

const HomeComThree = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statistics, setStatistics] = useState({
    totalDoctors: 0,
    departmentDistribution: [],
  })

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const { data } = await axiosInstance.get("/authentication/doctors-dashboard")


        setDoctors(data.doctors || [])
        setStatistics(
          data.statistics || {
            totalDoctors: 0,
            departmentDistribution: [],
          },
        )
        setError("")
      } catch (err) {
        console.error("Error fetching doctors:", err)
        setError("Failed to load doctors")
        setDoctors([])
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Helper function to format departments display
  const formatDepartments = (departments) => {
    if (!departments || departments.length === 0) {
      return "No Department"
    }

    if (departments.length === 1) {
      return departments[0].name
    } else if (departments.length === 2) {
      return `${departments[0].name}, ${departments[1].name}`
    } else {
      return `${departments[0].name} +${departments.length - 1} more`
    }
  }

  // Helper function to get avatar color based on department count
  const getAvatarColor = (departmentCount) => {
    if (departmentCount === 0) return "linear-gradient(135deg, #3f3f87, #2a2a5c)" // Purple shades for no department
    if (departmentCount === 1) return "linear-gradient(135deg, #2977ba, #1a4b6e)" // Blue shades for one department
    if (departmentCount === 2) return "linear-gradient(135deg, #cc2889, #8a1c5f)" // Pink shades for two departments
    return "linear-gradient(135deg, #3f3f87, #cc2889)" // Purple to pink for more
  }

  if (loading) {
    return (
      <div className={styles.dashboardCard}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <span className={styles.loadingText}>Loading doctors...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.dashboardCard}>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    )
  }

  return (
    <div className={styles.dashboardCard}>
      <div className={styles.cardHeader}>
        <h6 className={styles.cardTitle}>
          <Stethoscope size={20} />
          Doctors & Departments
        </h6>
      </div>
      <div className={styles.cardBody}>
        {/* Doctors List */}
        {doctors.length === 0 ? (
          <div className={`${styles.textAlignC} ${styles.paddingY4}`} style={{ color: "#64748b" }}>
            <Users size={48} style={{ color: "#cbd5e1", marginBottom: "1rem" }} />
            <div>No doctors found</div>
          </div>
        ) : (
          <div className={styles.doctorsList}>
            {doctors.map((doc) => (
              <div key={doc._id} className={styles.doctorItem}>
                <div
                  className={`${styles.doctorInfo} ${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap3}`}
                >
                  <div
                    className={styles.doctorAvatar}
                    style={{
                      background: getAvatarColor(doc.departments?.length || 0),
                    }}
                  >
                    <User size={18} />
                  </div>
                  <div className={styles.doctorDetails}>
                    <h6>Dr. {doc.username}</h6>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "#64748b",
                        display: "block",
                        marginTop: "2px",
                        lineHeight: "1.3",
                      }}
                    >
                      {formatDepartments(doc.departments)}
                    </span>
                  </div>
                </div>
                <div className={`${styles.flexContainer} ${styles.flexColumn} ${styles.alignItemsEnd} ${styles.gap1}`}>
                  {doc.departments && doc.departments.length > 0 && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        padding: "4px 8px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {doc.departments.length} dept{doc.departments.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeComThree
