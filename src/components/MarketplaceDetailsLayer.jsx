"use client"
import React, { useState, useEffect } from "react"
import { Calendar, Clock, User, DollarSign, FileText, Eye, EyeOff } from "lucide-react"
import axiosInstance from "../helper/axiosSetup"
import { useSearchParams } from "next/navigation"
import styles from "../styles/utility-components.module.css"

const MarketplaceDetailsLayer = () => {
  const [patientData, setPatientData] = useState(null)
  const [evaluations, setEvaluations] = useState([])
  const [pendingMoney, setPendingMoney] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeEvaluationIndex, setActiveEvaluationIndex] = useState(null)


  const searchParams = useSearchParams()
  const id = searchParams.get("id")


  return (
    <div className="row gy-4">
      <div className="col-12">
        <div className={styles.detailsContainer}>
          <div className={styles.detailsHeader}>
            <div className={styles.detailsHeaderContent}>
              <div className={styles.patientInfo}>
                <h4>{patientData?.name || "Name not available"}</h4>
                
              </div>
              <div className={styles.pendingMoney}>
                <h6>
                  <DollarSign size={16} style={{ display: "inline", marginRight: "4px" }} />
                  Pending Money
                </h6>
                <div className={styles.pendingAmount}>{pendingMoney != null ? pendingMoney : 0} SAR</div>
              </div>
            </div>
          </div>

          <div className={styles.detailsBody}>
            <div className={styles.aboutSection}>
              <h6>
                <User size={20} style={{ display: "inline", marginRight: "8px" }} />
                About
              </h6>
              <p className={styles.aboutText}>{patientData?.mydescription || "No description available."}</p>
            </div>

            <div className={styles.evaluationsSection}>
              <h6 className={styles.evaluationsTitle}>
                <FileText size={20} style={{ display: "inline", marginRight: "8px" }} />
                {patientData?.name}'s Programs
              </h6>

              <div style={{ overflowX: "auto" }}>
                <table className={styles.modernTable}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th scope="col">No.</th>
                      <th scope="col">Date</th>
                      <th scope="col">Time</th>
                      <th scope="col">Status</th>
                      <th scope="col">Student Note</th>
                      <th scope="col">Doctor Note</th>
                      <th scope="col">Payment</th>
                    </tr>
                  </thead>
                  
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceDetailsLayer
