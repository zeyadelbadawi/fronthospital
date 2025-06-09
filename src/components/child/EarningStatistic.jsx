"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/helper/axiosSetup";  // Import the configured axios instance
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EarningStatistic = () => {
  const [period, setPeriod] = useState("week");
  const [labels, setLabels] = useState([]);
  const [series, setSeries] = useState([
    { name: "Paid", data: [] },
    { name: "Pending", data: [] },
  ]);
  const [totals, setTotals] = useState({ paid: 0, pending: 0 });

  const chartOptions = {
    chart: {
      type: "area",
      height: 260,
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: false },
    },
    stroke: { curve: "smooth" },
    xaxis: { categories: labels },
    colors: ["#45B369", "#FF9F29"],
    tooltip: { theme: "dark" },
    legend: { show: false },
  };

  useEffect(() => {
    axiosInstance
      .get("/authentication/income-trend", { params: { period } })
      .then(({ data }) => {
        setLabels(data.labels);
        setSeries([
          { name: "Paid", data: data.paidSeries },
          { name: "Pending", data: data.pendingSeries },
        ]);
        setTotals({ paid: data.totalPaid, pending: data.totalPending });
      })
      .catch(console.error);
  }, [period]);

  return (
    <div className="col-xxl-12">
      <div className="card h-100">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h6 className="fw-bold text-lg mb-0">Earning Statistic</h6>
          <select
            className="form-select form-select-sm w-auto bg-base border-0 text-secondary-light"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
                        <option value="week">This Week</option>

            <option value="month">This Month</option>
          </select>
        </div>

        <div className="card-body p-24">
        <ul className="d-flex flex-wrap justify-content-center gap-4 mb-4">
  <li className="d-flex align-items-center gap-2">
    <span
      className="w-12-px h-8-px rounded-pill"
      style={{ backgroundColor: "#45B369" }}
    />
    <span className="text-secondary-light text-sm">
      Paid:
      <span className="fw-bold" style={{ color: "#45B369" }}>
        {totals.paid.toLocaleString()}&nbsp;AED
      </span>
    </span>
  </li>

  <li className="d-flex align-items-center gap-2">
    <span
      className="w-12-px h-8-px rounded-pill"
      style={{ backgroundColor: "#FF9F29" }}
    />
    <span className="text-secondary-light text-sm">
      Pending:
      <span className="fw-bold" style={{ color: "#FF9F29" }}>
        {totals.pending.toLocaleString()}&nbsp;AED
      </span>
    </span>
  </li>
</ul>


          <ReactApexChart
            options={chartOptions}
            series={series}
            type="area"
            height={260}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default EarningStatistic;
