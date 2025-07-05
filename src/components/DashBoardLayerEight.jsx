"use client"
import { useState } from "react"
import { Download, Plus, RefreshCw, BarChart3 } from "lucide-react"
import HomeComOne from "./child/HomeComOne";
import HomeComTo from "./child/HomeComTo";
import PatientVisitedDepartment from "./child/PatientVisitedbyDepartment";
import PatientVisitByGender from "./child/PatientVisitByGender";
import HomeComThree from "./child/HomeComThree";
import HomeComFour from "./child/HomeComFour";
import HomeComSix from "./child/HomeComSix";
import styles from "@/styles/home-components.module.css"

const DashBoardLayerEight = () => {
  
  return (
    <div className={styles.dashboardContainer}>
      <div className="container-fluid">
        {/* Dashboard Header */}
        <div className={`${styles.dashboardCard} mb-4`}>
          <div className={styles.cardHeader}>
            <div>
              <h4 className={styles.cardTitle} style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                <BarChart3 size={24} />
                Dashboard Overview
              </h4>
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
                Welcome back! Here's your latest data overview.
              </p>
            </div>
            
          </div>
        </div>

        {/* Statistics Cards Row */}
        <div className="row g-4 mb-4">
          <HomeComOne />
          <HomeComTo />
          <HomeComSix />
        </div>

        {/* Charts Row 1 */}
        <div className="row g-4 mb-4">
          <div className="col-xl-8 col-lg-7">
            <HomeComFour />
          </div>
          <div className="col-xl-4 col-lg-5">
            <HomeComThree />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="row g-4 mb-4">
          <PatientVisitByGender />
          <PatientVisitedDepartment />
        </div>
      </div>
    </div>
  )
}

export default DashBoardLayerEight
