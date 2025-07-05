"use client"
import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import dynamic from "next/dynamic"
import styles from "@/styles/home-components.module.css"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

const HomeComTo = () => {
  const [period, setPeriod] = useState("week")
  const [labels, setLabels] = useState([])
  const [series, setSeries] = useState([
    { name: "Paid", data: [] },
    { name: "Pending", data: [] },
  ])
  const [totals, setTotals] = useState({ paid: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  const chartOptions = {
    chart: {
      type: "area",
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
      fontFamily: "Inter, sans-serif",
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#10b981", "#f59e0b"],
    },
    fill: {
      type: "gradient",
      colors: ["#10b981", "#f59e0b"],
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: ["#10b98120", "#f59e0b20"],
        inverseColors: false,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    markers: {
      colors: ["#10b981", "#f59e0b"],
      strokeWidth: 2,
      size: 0,
      hover: { size: 6 },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 2,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    xaxis: {
      categories: labels,
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px",
          fontWeight: 500,
        },
        formatter: (value) => `${value.toLocaleString()} AED`,
      },
    },
    colors: ["#10b981", "#f59e0b"],
    tooltip: {
      theme: "light",
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
      },
    },
    legend: { show: false },
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const { data } = await axiosInstance.get("/authentication/income-trend", {
          params: { period },
        })

        setLabels(data.labels)
        setSeries([
          { name: "Paid", data: data.paidSeries },
          { name: "Pending", data: data.pendingSeries },
        ])
        setTotals({ paid: data.totalPaid, pending: data.totalPending })
      } catch (error) {
        console.error("Error fetching earning data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  if (loading) {
    return (
      <div className="col-12">
        <div className={styles.dashboardCard}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span className={styles.loadingText}>Loading earning statistics...</span>
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
            <TrendingUp size={20} />
            Earning Statistics
          </h6>
          <select
            className="form-select form-select-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              width: "auto",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "0.875rem",
              padding: "0.375rem 0.75rem",
            }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: "#10b981" }}></span>
              <span>Paid</span>
              <span className={`${styles.legendValue} ${styles.textSuccess}`}>{totals.paid.toLocaleString()} AED</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: "#f59e0b" }}></span>
              <span>Pending</span>
              <span className={`${styles.legendValue} ${styles.textWarning}`}>
                {totals.pending.toLocaleString()} AED
              </span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ReactApexChart options={chartOptions} series={series} type="area" height={300} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeComTo
