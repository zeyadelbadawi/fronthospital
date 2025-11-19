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
  const [loading, setLoading] = useState(false)

  const chartOptions = {
    colors: ["#2977ba", "#cc2889"], // Updated colors
    labels: ["Net Income", "Pending Money"],
    legend: { show: false },
    chart: {
      type: "donut",
      height: 280,
      fontFamily: "Inter, sans-serif",
    },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "65%", // Adjusted size for visual match
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
        breakpoint: 1200,
        options: {
          chart: { height: 250 },
          plotOptions: {
            pie: {
              donut: { size: "60%" },
            },
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: { height: 220 },
        },
      },
    ],
  }

  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        setLoading(true)
        const { data } = await axiosInstance.get("/authentication/income-summary")

        setNetIncome(data.netIncome)
        setPendingMoney(data.pendingMoney)
        setTotalIncome(data.totalIncome)
        setSeries([data.netIncome, data.pendingMoney])

      } catch (error) {
        console.error("Error fetching income data:", error)
        // Set default values in case of error
        setNetIncome(0)
        setPendingMoney(0)
        setTotalIncome(0)
        setSeries([0, 0])
      } finally {
        setLoading(false)
      }
    }

    fetchIncomeData()
  }, [])

  if (loading) {
    return (
      <div className={styles.dashboardCard}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <span className={styles.loadingText}>Loading income data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboardCard}>
      <div className={styles.cardHeader}>
        <h6 className={styles.cardTitle}>
          <PieChart size={20} />
          Total Income
        </h6>
        <select className={styles.customSelect}>
          <option>This Month</option>
        </select>
      </div>
      <div className={styles.cardBody}>
        <div className={`${styles.gridRow} ${styles.alignItemsCenter} ${styles.gap3}`}>
          {/* Chart Column */}
          <div className={`${styles.gridCol} ${styles.colLg5} ${styles.colMd12} ${styles.col12}`}>
            <div className={styles.chartContainer} style={{ position: "relative", height: "280px" }}>
              <ReactApexChart options={chartOptions} series={series} type="donut" height={280} />
              <div className={styles.incomeCenter}>
                <div className={styles.incomeCenterLabel}>Total Income</div>
                <h6 className={styles.incomeCenterValue}>{totalIncome.toLocaleString()} AED</h6>
              </div>
            </div>
          </div>

          {/* Legend Column */}
          <div className={`${styles.gridCol} ${styles.colLg7} ${styles.colMd12} ${styles.col12}`}>
            <div className={`${styles.flexContainer} ${styles.flexColumn} ${styles.gap3}`}>
              <div className={`${styles.homeComFourLegendItem} ${styles.homeComFourLegendItemBlue}`}>
                <div
                  className={`${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap2} ${styles.marginBottom4}`}
                >
                  <span className={styles.legendDot} style={{ backgroundColor: "#2977ba" }}></span>
                  <span className={styles.homeComFourLegendItemTextBlue}>Net Income</span>
                </div>
                <div
                  className={`${styles.legendValue} ${styles.textPrimary}`}
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#2977ba",
                  }}
                >
                  {netIncome.toLocaleString()} AED
                </div>
              </div>

              <div className={`${styles.homeComFourLegendItem} ${styles.homeComFourLegendItemPink}`}>
                <div
                  className={`${styles.flexContainer} ${styles.alignItemsCenter} ${styles.gap2} ${styles.marginBottom4}`}
                >
                  <span className={styles.legendDot} style={{ backgroundColor: "#cc2889" }}></span>
                  <span className={styles.homeComFourLegendItemTextPink}>Pending Money</span>
                </div>
                <div
                  className={`${styles.legendValue} ${styles.textWarning}`}
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#cc2889",
                  }}
                >
                  {pendingMoney.toLocaleString()} AED
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
