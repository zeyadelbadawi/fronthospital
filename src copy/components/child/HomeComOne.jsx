"use client"
import { useEffect, useState } from "react"
import { Users, Stethoscope, Briefcase } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/styles/home-components.module.css"

const HomeComOne = ({ isHeadDoctor }) => {
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalDoctors: 0,
    totalAccountants: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true)
        const { data } = await axiosInstance.get("/authentication/dashboard-statistics")
        setStatistics(data.statistics)
        setError("")
      } catch (err) {
        console.error("Error fetching dashboard statistics:", err)
        setError("Failed to load statistics")
        setStatistics({ totalStudents: 0, totalDoctors: 0, totalAccountants: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  if (loading) {
    return (
      <>
        <div className={`${styles.gridCol} ${styles.col4}`}>
          <div className={styles.dashboardCard}>
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <span className={styles.loadingText}>Loading students...</span>
            </div>
          </div>
        </div>
        <div className={`${styles.gridCol} ${styles.col4}`}>
          <div className={styles.dashboardCard}>
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <span className={styles.loadingText}>Loading doctors...</span>
            </div>
          </div>
        </div>
        <div className={`${styles.gridCol} ${styles.col4}`}>
          <div className={styles.dashboardCard}>
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <span className={styles.loadingText}>Loading accountants...</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className={`${styles.gridCol} ${styles.col4}`}>
          <div className={styles.dashboardCard}>
            <div className={styles.errorMessage}>{error}</div>
          </div>
        </div>
        <div className={`${styles.gridCol} ${styles.col4}`}>
          <div className={styles.dashboardCard}>
            <div className={styles.errorMessage}>{error}</div>
          </div>
        </div>
        <div className={`${styles.gridCol} ${styles.col4}`}>
          <div className={styles.dashboardCard}>
            <div className={styles.errorMessage}>{error}</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={`${styles.gridCol} ${styles.col4}`}>
        <div className={styles.statsCard}>
          <div
            className={`${styles.statsHeader} ${styles.flexContainer} ${styles.alignItemsCenter} ${styles.justifyContentBetween}`}
          >
            <h6 className={styles.statsNumber}>{statistics.totalStudents}</h6>
            <div className={`${styles.statsIcon} ${styles.students}`}>
              <Users size={24} />
            </div>
          </div>
          <p className={styles.statsLabel}>Total Students</p>
          <div className={`${styles.statsGrowth} ${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap1}`}>
            <span>+1.2%</span>
            <span>vs last month</span>
          </div>
        </div>
      </div>

      <div className={`${styles.gridCol} ${styles.col4}`}>
        <div className={styles.statsCard}>
          <div
            className={`${styles.statsHeader} ${styles.flexContainer} ${styles.alignItemsCenter} ${styles.justifyContentBetween}`}
          >
            <h6 className={styles.statsNumber}>{statistics.totalDoctors}</h6>
            <div className={`${styles.statsIcon} ${styles.doctors}`}>
              <Stethoscope size={24} />
            </div>
          </div>
          <p className={styles.statsLabel}>Total Doctors</p>
          <div className={`${styles.statsGrowth} ${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap1}`}>
            <span>+0.8%</span>
            <span>vs last month</span>
          </div>
        </div>
      </div>

      {/* This card is now always rendered, regardless of isHeadDoctor */}
      <div className={`${styles.gridCol} ${styles.col4}`}>
        <div className={styles.statsCard}>
          <div
            className={`${styles.statsHeader} ${styles.flexContainer} ${styles.alignItemsCenter} ${styles.justifyContentBetween}`}
          >
            <h6 className={styles.statsNumber}>{statistics.totalAccountants}</h6>
            <div className={`${styles.statsIcon} ${styles.accountants}`}>
              <Briefcase size={24} />
            </div>
          </div>
          <p className={styles.statsLabel}>Total Accountants</p>
          <div className={`${styles.statsGrowth} ${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap1}`}>
            <span>+0.5%</span>
            <span>vs last month</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeComOne
