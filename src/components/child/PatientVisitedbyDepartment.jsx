"use client"
import { useState, useEffect } from "react"
import { Target } from "lucide-react"
import dynamic from "next/dynamic"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/styles/home-components.module.css"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

const TYPE_META = [
  {
    key: "free_medical_consultation",
    label: "Free Medical Consultation",
    color: "#3b82f6",
  },
  {
    key: "full_package_evaluation",
    label: "Full Package Evaluation",
    color: "#f59e0b",
  },
  {
    key: "school_evaluation",
    label: "School Evaluation",
    color: "#ef4444",
  },
  {
    key: "single_session",
    label: "Single Session",
    color: "#10b981",
  },
]

export default function PatientVisitedDepartment() {
  const [series, setSeries] = useState([0, 0, 0, 0])
  const [loading, setLoading] = useState(true)

  const options = {
    chart: {
      type: "radialBar",
      height: 350,
      background: "transparent",
      fontFamily: "Inter, sans-serif",
    },
    stroke: { lineCap: "round" },
    plotOptions: {
      radialBar: {
        hollow: { size: "30%" },
        track: {
          margin: 10,
          background: "#f8fafc",
        },
        dataLabels: {
          name: {
            fontSize: "14px",
            color: "#374151",
            fontWeight: 500,
          },
          value: {
            fontSize: "16px",
            color: "#1f2937",
            fontWeight: 600,
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    labels: TYPE_META.map((t) => t.label),
    colors: TYPE_META.map((t) => t.color),
    legend: { show: false },
    tooltip: {
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
      },
      y: {
        formatter: (val) => `${val}%`,
      },
    },
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get("/authentication/evaluations/stats")
        const { counts, total } = data
        const pct = TYPE_META.map(({ key }) => (total ? Math.round((counts[key] / total) * 100) : 0))
        setSeries(pct)
      } catch (err) {
        console.error("Failed loading stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="col-12">
        <div className={styles.dashboardCard}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span className={styles.loadingText}>Loading department statistics...</span>
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
            <Target size={20} />
            Students Visited by Program Type
          </h6>
        </div>
        <div className={styles.cardBody}>
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className={styles.chartContainer} style={{ height: "350px" }}>
                <ReactApexChart options={options} series={series} type="radialBar" height={350} />
              </div>
            </div>
            <div className="col-lg-4">
              <div className={styles.departmentLegend}>
                {TYPE_META.map((t, i) => (
                  <div key={t.key} className={styles.departmentLegendItem}>
                    <div className="d-flex align-items-center gap-2">
                      <span className={styles.legendDot} style={{ backgroundColor: t.color }}></span>
                      <span style={{ fontSize: "0.875rem", color: "#374151" }}>{t.label}</span>
                    </div>
                    <span className={styles.departmentPercentage} style={{ color: t.color, fontWeight: "600" }}>
                      {series[i] ?? 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
