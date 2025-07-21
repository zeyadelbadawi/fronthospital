"use client"
import { useEffect, useState } from "react"
import { PieChart } from "lucide-react"
import dynamic from "next/dynamic"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/styles/home-components.module.css"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

const HomeComFour = () => {
  const [netIncome, setNetIncome] = useState(0)
  const [pendingMoney, setPendingMoney] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const [series, setSeries] = useState([0, 0])
  const [loading, setLoading] = useState(true)

  const chartOptions = {
    colors: ["#10b981", "#f59e0b"],
    labels: ["Net Income", "Pending Money"],
    legend: { show: false },
    chart: {
      type: "donut",
      height: 250,
      fontFamily: "Inter, sans-serif",
    },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: false,
          },
        },
      },
    },
    tooltip: {
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
      },
      y: {
        formatter: (value) => `${value.toLocaleString()} AED`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 200 },
        },
      },
    ],
  }

  // useEffect(() => {
  //   const fetchIncomeData = async () => {
  //     try {
  //       const { data } = await axiosInstance.get("/authentication/income-summary")
  //       setNetIncome(data.netIncome)
  //       setPendingMoney(data.pendingMoney)
  //       setTotalIncome(data.totalIncome)
  //       setSeries([data.netIncome, data.pendingMoney])
  //     } catch (error) {
  //       console.error("Error fetching income data:", error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchIncomeData()
  // }, [])

  if (loading) {
    return (
      <div className="col-xl-8 col-lg-6">
        <div className={styles.dashboardCard}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span className={styles.loadingText}>Loading income data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="col-xl-8 col-lg-6">
      <div className={styles.dashboardCard}>
        <div className={styles.cardHeader}>
          <h6 className={styles.cardTitle}>
            <PieChart size={20} />
            Total Income
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
            <option>This Month</option>
          </select>
        </div>
        <div className={styles.cardBody}>
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className={styles.chartContainer} style={{ position: "relative", height: "250px" }}>
                <ReactApexChart options={chartOptions} series={series} type="donut" height={250} />
                <div className={styles.incomeCenter}>
                  <div className={styles.incomeCenterLabel}>Total Income</div>
                  <h6 className={styles.incomeCenterValue}>{totalIncome.toLocaleString()} AED</h6>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className={styles.chartLegend} style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <div className={styles.legendItem} style={{ marginBottom: "1rem" }}>
                  <span className={styles.legendDot} style={{ backgroundColor: "#10b981" }}></span>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Net Income</div>
                    <div className={`${styles.legendValue} ${styles.textSuccess}`} style={{ fontSize: "1.125rem" }}>
                      {netIncome.toLocaleString()} AED
                    </div>
                  </div>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ backgroundColor: "#f59e0b" }}></span>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Pending Money</div>
                    <div className={`${styles.legendValue} ${styles.textWarning}`} style={{ fontSize: "1.125rem" }}>
                      {pendingMoney.toLocaleString()} AED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeComFour
