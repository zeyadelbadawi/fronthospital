"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axiosInstance from "@/helper/axiosSetup";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const daysOfWeek = ["Sat", "Sun", "Mon", "Tues", "Wed", "Thurs", "Fri"];

function getWeekDates() {
  // Get current date and calculate Sat-Fri range of the current week
  // Assuming week starts Saturday
  const now = new Date();
  const day = now.getDay(); // Sunday=0, Saturday=6
  const offsetToSat = (day + 1) % 7; // distance from Saturday
  const sat = new Date(now);
  sat.setDate(now.getDate() - offsetToSat);
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sat);
    d.setDate(sat.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
}

const PatientVisitByGender = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);
  const [counts, setCounts] = useState({ male: 0, female: 0 });

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        // 1. Fetch patient visits for this week
        const weekDates = getWeekDates();

        // Prepare date range filter: from Sat 00:00 to Fri 23:59:59
        const fromDate = new Date(weekDates[0]);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(weekDates[6]);
        toDate.setHours(23, 59, 59, 999);

        // Fetch visits from backend with date filter - you'll need to implement API support for this
        // Assuming your API supports query params: ?from=ISODate&to=ISODate
        const { data } = await axiosInstance.get(
          `/authentication/patient-visits?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`
        );

        /*
          data = [
            {
              _id, patient, gender, date, time, evaluation?, session?
            },
            ...
          ]
        */

        // 2. Process data: for each day, count unique patients by gender

        // Create a map: dayIndex -> Set of patientIds per gender
        const dailyMalePatients = Array(7).fill(null).map(() => new Set());
        const dailyFemalePatients = Array(7).fill(null).map(() => new Set());

        data.forEach((visit) => {
          const visitDate = new Date(visit.date);
          // Find day index 0-6 for Sat-Fri
          const dayIndex = weekDates.findIndex(
            (d) =>
              d.getFullYear() === visitDate.getFullYear() &&
              d.getMonth() === visitDate.getMonth() &&
              d.getDate() === visitDate.getDate()
          );
          if (dayIndex === -1) return; // ignore out-of-range

          if (visit.gender === "male") {
            dailyMalePatients[dayIndex].add(visit.patient.toString());
          } else if (visit.gender === "female") {
            dailyFemalePatients[dayIndex].add(visit.patient.toString());
          }
        });

        // 3. Convert Sets to counts per day
        const maleData = dailyMalePatients.map((set) => set.size);
        const femaleData = dailyFemalePatients.map((set) => set.size);

        // 4. Total counts for summary UI
        const totalMale = maleData.reduce((a, b) => a + b, 0);
        const totalFemale = femaleData.reduce((a, b) => a + b, 0);

        // 5. Update chart options & series
        setChartOptions({
          colors: ["#d1258c", "#174a90"],
          legend: { show: false },
          chart: {
            type: "bar",
            height: 260,
            toolbar: { show: false },
          },
          grid: {
            show: true,
            borderColor: "#D1D5DB",
            strokeDashArray: 4,
            position: "back",
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
              columnWidth: 20,
            },
          },
          dataLabels: { enabled: false },
          states: { hover: { filter: { type: "none" } } },
          stroke: { show: true, width: 0, colors: ["transparent"] },
          xaxis: { categories: daysOfWeek },
          fill: { opacity: 1, width: 18 },
        });

        setChartSeries([
          { name: "Female", data: femaleData },
          { name: "Male", data: maleData },
        ]);

        setCounts({ male: totalMale, female: totalFemale });
      } catch (error) {
        console.error("Error fetching patient visits:", error);
      }
    };

    fetchVisits();
  }, []);

  return (
    <div className="col-xxl-12">
      <div className="card h-100">
        <div className="card-header">
          <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
            <h6 className="mb-2 fw-bold text-lg mb-0">Students Visit By Gender</h6>
            <select className="form-select form-select-sm w-auto bg-base border-0 text-secondary-light">
              <option>This Week</option>
            </select>
          </div>
        </div>
        <div className="card-body p-24">
          <ul className="d-flex flex-wrap align-items-center justify-content-center my-3 gap-3">
            <li className="d-flex align-items-center gap-2">
            <span
  className="w-12-px h-8-px rounded-pill"
  style={{ backgroundColor: '#174a90' }}
/>
              <span className="text-secondary-light text-sm fw-semibold">
                Male: <span className="text-primary-light fw-bold">{counts.male}</span>
              </span>
            </li>
            <li className="d-flex align-items-center gap-2">
            <span
  className="w-12-px h-8-px rounded-pill"
  style={{ backgroundColor: '#d1258c' }}
/>
              <span className="text-secondary-light text-sm fw-semibold">
                Female: <span className="text-primary-light fw-bold">{counts.female}</span>
              </span>
            </li>
          </ul>
          <div id="paymentStatusChart" className="margin-16-minus y-value-left">
            <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={260} width={"100%"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientVisitByGender;
