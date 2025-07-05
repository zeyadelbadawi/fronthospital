"use client"
import { useEffect, useState } from "react"
import { Users, UserCheck, Calculator, TrendingUp, TrendingDown } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/styles/home-components.module.css"

const HomeComOne = () => {
  const [doctorData, setDoctorData] = useState({ totalDoctors: 0, joinedThisWeek: 0 })
  const [patientData, setPatientData] = useState({ totalPatients: 0, joinedThisWeek: 0 })
  const [accountantData, setAccountantData] = useState({ totalAccountants: 0, joinedThisWeek: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, accountantsRes, patientsRes] = await Promise.all([
          axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/doctors/count`),
          axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/accountants/count`),
          axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patients/count`),
        ])

        setDoctorData(doctorsRes.data)
        setAccountantData(accountantsRes.data)
        setPatientData(patientsRes.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="col-12">
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <span className={styles.loadingText}>Loading statistics...</span>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      title: "Total Students",
      total: patientData.totalPatients,
      thisWeek: patientData.joinedThisWeek,
      icon: Users,
      className: "students",
      growth: patientData.joinedThisWeek > 0 ? `+${patientData.joinedThisWeek}` : "0",
      isPositive: patientData.joinedThisWeek > 0,
    },
    {
      title: "Total Doctors",
      total: doctorData.totalDoctors,
      thisWeek: doctorData.joinedThisWeek,
      icon: UserCheck,
      className: "doctors",
      growth: doctorData.joinedThisWeek > 0 ? `+${doctorData.joinedThisWeek}` : "0",
      isPositive: doctorData.joinedThisWeek > 0,
    },
    {
      title: "Total Accountants",
      total: accountantData.totalAccountants,
      thisWeek: accountantData.joinedThisWeek,
      icon: Calculator,
      className: "accountants",
      growth: accountantData.joinedThisWeek > 0 ? `+${accountantData.joinedThisWeek}` : "0",
      isPositive: accountantData.joinedThisWeek > 0,
    },
  ]

  return (
    <>
      {statsData.map((stat, index) => (
        <div key={stat.title} className="col-xl-4 col-lg-6 col-md-6">
          <div className={styles.statsCard}>
            <div className={styles.statsHeader}>
              <div className={`${styles.statsIcon} ${styles[stat.className]}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h2 className={styles.statsNumber}>{stat.total.toLocaleString()}</h2>
            <p className={styles.statsLabel}>{stat.title}</p>
            <div className={`${styles.statsGrowth} ${!stat.isPositive ? styles.negative : ""}`}>
              {stat.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{stat.growth} this week</span>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default HomeComOne
