"use client"
import { useEffect, useState } from "react"
import { BarChart3 } from "lucide-react"
import dynamic from "next/dynamic"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/styles/home-components.module.css"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

const daysOfWeek = ["Sat", "Sun", "Mon", "Tues", "Wed", "Thurs", "Fri"]

function getWeekDates() {
  const now = new Date()
  const day = now.getDay()
  const offsetToSat = (day + 1) % 7
  const sat = new Date(now)
  sat.setDate(now.getDate() - offsetToSat)
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(sat)
    d.setDate(sat.getDate() + i)
    weekDates.push(d)
  }
  return weekDates
}

const PatientVisitByGender = () => {
  const [chartOptions, setChartOptions] = useState({})
  const [chartSeries, setChartSeries] = useState([])
  const [counts, setCounts] = useState({ male: 0, female: 0 })
  const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   const fetchVisits = async () => {
  //     try {
  //       const weekDates = getWeekDates()
  //       const fromDate = new Date(weekDates[0])
  //       fromDate.setHours(0, 0, 0, 0)
  //       const toDate = new Date(weekDates[6])
  //       toDate.setHours(23, 59, 59, 999)

  //       const { data } = await axiosInstance.get(
  //         `/authentication/patient-visits?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`,
  //       )

  //       const dailyMalePatients = Array(7)
  //         .fill(null)
  //         .map(() => new Set())
  //       const dailyFemalePatients = Array(7)
  //         .fill(null)
  //         .map(() => new Set())

  //       data.forEach((visit) => {
  //         const visitDate = new Date(visit.date)
  //         const dayIndex = weekDates.findIndex(
  //           (d) =>
  //             d.getFullYear() === visitDate.getFullYear() &&
  //             d.getMonth() === visitDate.getMonth() &&
  //             d.getDate() === visitDate.getDate(),
  //         )

  //         if (dayIndex === -1) return

  //         if (visit.gender === "male") {
  //           dailyMalePatients[dayIndex].add(visit.patient.toString())
  //         } else if (visit.gender === "female") {
  //           dailyFemalePatients[dayIndex].add(visit.patient.toString())
  //         }
  //       })

  //       const maleData = dailyMalePatients.map((set) => set.size)
  //       const femaleData = dailyFemalePatients.map((set) => set.size)
  //       const totalMale = maleData.reduce((a, b) => a + b, 0)
  //       const totalFemale = femaleData.reduce((a, b) => a + b, 0)

  //       setChartOptions({
  //         colors: ["#3b82f6", "#ec4899"],
  //         legend: { show: false },
  //         chart: {
  //           type: "bar",
  //           height: 300,
  //           toolbar: { show: false },
  //           background: "transparent",
  //           fontFamily: "Inter, sans-serif",
  //         },
  //         grid: {
  //           show: true,
  //           borderColor: "#f1f5f9",
  //           strokeDashArray: 2,
  //           padding: { top: 0, right: 0, bottom: 0, left: 0 },
  //         },
  //         plotOptions: {
  //           bar: {
  //             borderRadius: 6,
  //             columnWidth: "60%",
  //             borderRadiusApplication: "end",
  //           },
  //         },
  //         dataLabels: { enabled: false },
  //         states: { hover: { filter: { type: "none" } } },
  //         stroke: { show: true, width: 0, colors: ["transparent"] },
  //         xaxis: {
  //           categories: daysOfWeek,
  //           labels: {
  //             style: {
  //               colors: "#64748b",
  //               fontSize: "12px",
  //               fontWeight: 500,
  //             },
  //           },
  //           axisBorder: { show: false },
  //           axisTicks: { show: false },
  //         },
  //         yaxis: {
  //           labels: {
  //             style: {
  //               colors: "#64748b",
  //               fontSize: "12px",
  //               fontWeight: 500,
  //             },
  //           },
  //         },
  //         fill: { opacity: 1 },
  //         tooltip: {
  //           theme: "light",
  //           style: {
  //             fontSize: "12px",
  //             fontFamily: "Inter, sans-serif",
  //           },
  //         },
  //       })

  //       setChartSeries([
  //         { name: "Male", data: maleData },
  //         { name: "Female", data: femaleData },
  //       ])

  //       setCounts({ male: totalMale, female: totalFemale })
  //     } catch (error) {
  //       console.error("Error fetching patient visits:", error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchVisits()
  // }, [])

  if (loading) {
    return (
      <div className="col-12">
        <div className={styles.dashboardCard}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span className={styles.loadingText}>Loading gender statistics...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="col-12">
      <div className={styles.dashboardCard}>
        <div className={styles.cardHeader}>
          <h6 className={styles.cardTitle}>
            <BarChart3 size={20} />
            Students Visit By Gender
          </h6>
          <select
            className="form-select form-select-sm"
            style={{
              width: "auto",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "0.875rem",
              padding: "0.375rem 0.75rem",
            }}
          >
            <option>This Week</option>
          </select>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: "#3b82f6" }}></span>
              <span>Male</span>
              <span className={`${styles.legendValue} ${styles.textPrimary}`}>{counts.male}</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: "#ec4899" }}></span>
              <span>Female</span>
              <span className={styles.legendValue} style={{ color: "#ec4899" }}>
                {counts.female}
              </span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={300} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientVisitByGender
