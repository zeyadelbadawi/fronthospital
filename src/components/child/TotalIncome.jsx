"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axiosInstance from "@/helper/axiosSetup";  // Import the configured axios instance

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const TotalIncome = () => {
  const [netIncome, setNetIncome] = useState(0);
  const [pendingMoney, setPendingMoney] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [series, setSeries] = useState([0, 0]);

  // **Exact copy of your static hook options**, but with proper labels:
  const [chartOptions] = useState({
    colors: ["#FF9F29", "#45B369"],
    labels: ["Net Income", "Pending Money"],
    legend: { show: false },
    chart: {
      type: "donut",
      height: 260,
      sparkline: { enabled: true },    // collapses all extra whitespace
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: "bottom" },
        },
      },
    ],
  });

  useEffect(() => {
    axiosInstance.get("/authentication/income-summary")
      .then(({ data }) => {
        setNetIncome(data.netIncome);
        setPendingMoney(data.pendingMoney);
        setTotalIncome(data.totalIncome);
        setSeries([data.netIncome, data.pendingMoney]);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="col-xxl-12 col-xl-6">
      <div className="card h-100 radius-8 border-0" style={{ minHeight: '592px' }}>
        <div className="card-header border-bottom d-flex align-items-center flex-wrap gap-2 justify-content-between">
          <h6 className="mb-2 fw-bold text-lg">Total Income</h6>
          <select className="form-select form-select-sm w-auto bg-base border-0 text-secondary-light" disabled>
            <option>This Month</option>
          </select>
        </div>
        <div className="card-body p-24">
          <div className="position-relative">
            <div id="statisticsDonutChart" className="mt-36 flex-grow-1 apexcharts-tooltip-z-none title-style circle-none">
              <ReactApexChart
                options={chartOptions}
                series={series}
                type="donut"
                height={260}
              />
            </div>
            <div className="text-center position-absolute top-50 start-50 translate-middle">
              <span className="text-secondary-light">Income</span>
              <h6>{totalIncome.toLocaleString()}&nbsp;AED</h6>
            </div>
          </div>
          <ul className="row gy-4 mt-3">
            <li className="col-6 d-flex flex-column align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="w-12-px h-8-px rounded-pill bg-warning-600" />
                <span className="text-secondary-light text-sm fw-normal">Net Income</span>
              </div>
              <h6 className="text-primary-light fw-bold mb-0">{netIncome.toLocaleString()}&nbsp;AED</h6>
            </li>
            <li className="col-6 d-flex flex-column align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="w-12-px h-8-px rounded-pill bg-success-600" />
                <span className="text-secondary-light text-sm fw-normal">Pending Money</span>
              </div>
              <h6 className="text-primary-light fw-bold mb-0">{pendingMoney.toLocaleString()}&nbsp;AED</h6>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TotalIncome;
