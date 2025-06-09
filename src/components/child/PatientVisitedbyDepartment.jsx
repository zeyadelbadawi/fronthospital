"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axiosInstance from "@/helper/axiosSetup"; // Import the configured axios instance

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const TYPE_META = [
  {
    key: "free_medical_consultation",
    label: "Free Medical Consultation",
    colorClass: "text-primary-600",
  },
  {
    key: "full_package_evaluation",
    label: "Full Package Evaluation",
    colorClass: "text-warning-600",
  },
  {
    key: "school_evaluation",
    label: "School Evaluation",
    colorClass: "text-danger-600",
  },
  {
    key: "single_session",
    label: "Single Session",
    colorClass: "text-success-600",
  },

];

export default function PatientVisitedDepartment() {
  const [series, setSeries] = useState([0, 0, 0, 0]);
  const [options] = useState({
    chart: { type: "radialBar", height: 300 },
    stroke: { lineCap: "round" },
    plotOptions: {
      radialBar: {
        hollow: { size: "1%" },
        track: { margin: 20 },
        dataLabels: {
          name: { fontSize: "20px" },
          value: { fontSize: "26px" },
        },
      },
    },
    labels: TYPE_META.map((t) => t.label),
    colors: ["#3D7FF9", "#ff9f29", "#16a34a", "#e02b32"],
  });

  useEffect(() => {
    axiosInstance
      .get("/authentication/evaluations/stats")
      .then(({ data }) => {
        const { counts, total } = data;
        const pct = TYPE_META.map(({ key }) =>
          total ? Math.round((counts[key] / total) * 100) : 0
        );
        setSeries(pct);
      })
      .catch((err) => {
        console.error("Failed loading stats:", err);
      });
  }, []);

  return (
    <div className="col-xxl-8">
      <div className="card h-100">
        <div className="card-header">
          <h6 className="mb-0 fw-bold">Students Visited by Program type</h6>
        </div>
        <div className="card-body p-24 d-flex align-items-center gap-16">
          <div id="radialMultipleBar" style={{ flex: 1 }}>
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={400}
            />
          </div>
          <ul className="d-flex flex-column gap-12">
            {TYPE_META.map((t, i) => (
              <li key={t.key}>
                <span className="text-lg">
                  {t.label}:{" "}
                  <span className={`${t.colorClass} fw-semibold`}>
                    {series[i] ?? 0}%  
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
