"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Stethoscope, User } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/styles/home-components.module.css"

const HomeComThree = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/doctors`)
        setDoctors(res.data?.doctors?.slice(0, 6) || [])
      } catch (err) {
        console.error(err)
        setError("Failed to load doctors")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  if (loading) {
    return (
      <div className="col-xl-4 col-lg-6">
        <div className={styles.dashboardCard}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span className={styles.loadingText}>Loading doctors...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="col-xl-4 col-lg-6">
        <div className={styles.dashboardCard}>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="col-xl-4 col-lg-6">
      <div className={styles.dashboardCard}>
        <div className={styles.cardHeader}>
          <h6 className={styles.cardTitle}>
            <Stethoscope size={20} />
            Doctors List
          </h6>
          <Link
            href="/doctor-list"
            className="text-decoration-none d-flex align-items-center gap-1"
            style={{ color: "#3b82f6", fontSize: "0.875rem", fontWeight: "500" }}
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.cardBody}>
          {doctors.length === 0 ? (
            <div className="text-center py-4" style={{ color: "#64748b" }}>
              No doctors found
            </div>
          ) : (
            <div className={styles.doctorsList}>
              {doctors.map((doc) => (
                <div key={doc._id} className={styles.doctorItem}>
                  <div className={styles.doctorInfo}>
                    <div className={styles.doctorAvatar}>
                      <User size={18} />
                    </div>
                    <div className={styles.doctorDetails}>
                      <h6>Dr. {doc.username}</h6>
                      <span>{doc.title || "General Practitioner"}</span>
                    </div>
                  </div>
                  <span
                    className={`${styles.statusBadge} ${
                      doc.availability === "Available" ? styles.available : styles.unavailable
                    }`}
                  >
                    {doc.availability || "Not Set"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomeComThree
