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
  const [sessions, setSessions] = useState([])
  const [sessionError, setSessionError] = useState("")

  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  useEffect(() => {
    if (!id) {
      setError("Student ID is missing in the URL.")
      setLoading(false)
      return
    }

    const fetchPatientData = async () => {
      try {
        const patientResponse = await axiosInstance.get(`/authentication/patient/${id}`)
        const evaluationsResponse = await axiosInstance.get(`/authentication/evv/${id}`)
        const pendingMoneyResponse = await axiosInstance.get(`/authentication/patient-pending-money/${id}`)

        if (!patientResponse.data) {
          setError("Student data not found.")
          setLoading(false)
          return
        }

        console.log("Fetched Student data:", patientResponse.data)
        setPatientData(patientResponse.data)
        setEvaluations(evaluationsResponse.data.evaluations)

        if (pendingMoneyResponse.data && pendingMoneyResponse.data.length > 0) {
          const totalPendingMoney = pendingMoneyResponse.data.reduce((acc, record) => acc + record.price, 0)
          setPendingMoney(totalPendingMoney)
        } else {
          setPendingMoney(0)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching patient data:", err)
        setPatientData({})
        setEvaluations([])
        setPendingMoney(0)
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [id])

  const toggleSessionsVisibility = async (index, evaluationId) => {
    if (activeEvaluationIndex === index) {
      setActiveEvaluationIndex(null)
      setSessions([])
      setSessionError("")
    } else {
      setActiveEvaluationIndex(index)
      try {
        const sessionsResponse = await axiosInstance.get(`/authentication/evaluation-sessions/${evaluationId}`)
        if (sessionsResponse.data.length === 0) {
          setSessionError("No sessions for this Program")
        } else {
          setSessions(sessionsResponse.data)
          setSessionError("")
        }
      } catch (error) {
        console.error("Error fetching sessions:", error)
        setSessionError("An error occurred while fetching sessions.")
      }
    }
  }

  const getEvaluationTypeDisplay = (type) => {
    const types = {
      full_package_evaluation: "Full Package Evaluation",
      single_session: "Single Session",
      school_evaluation: "School Evaluation",
      free_medical_consultation: "Free Medical Consultation",
    }
    return types[type] || "Unknown Type"
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.modernLoader}></div>
        Loading patient details...
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h6 className={styles.errorTitle}>Error</h6>
          <p className={styles.errorDescription}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="row gy-4">
      <div className="col-12">
        <div className={styles.detailsContainer}>
          <div className={styles.detailsHeader}>
            <div className={styles.detailsHeaderContent}>
              <div className={styles.patientInfo}>
                <h4>{patientData?.name || "Name not available"}</h4>
                <div className={styles.lastVisit}>
                  <Calendar size={16} style={{ display: "inline", marginRight: "8px" }} />
                  Last Visit:{" "}
                  {patientData?.lastvisit
                    ? new Date(patientData.lastvisit).toLocaleDateString("en-CA")
                    : "— No visits yet"}
                </div>
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
                      <th scope="col">Evaluation Type</th>
                      <th scope="col">Date</th>
                      <th scope="col">Time</th>
                      <th scope="col">Status</th>
                      <th scope="col">Student Note</th>
                      <th scope="col">Doctor Note</th>
                      <th scope="col">Payment</th>
                      <th scope="col">Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.length === 0 ? (
                      <tr>
                        <td colSpan="9" className={styles.loadingState}>
                          No evaluations for this Student.
                        </td>
                      </tr>
                    ) : (
                      evaluations.map((evaluation, index) => (
                        <React.Fragment key={evaluation._id}>
                          <tr className={styles.tableRow}>
                            <td className={styles.tableCell}>
                              <div style={{ fontWeight: "600" }}>{index + 1}</div>
                            </td>
                            <td className={styles.tableCell}>
                              <div style={{ fontWeight: "500" }}>{getEvaluationTypeDisplay(evaluation.type)}</div>
                            </td>
                            <td className={styles.tableCell}>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Calendar size={14} />
                                {new Date(evaluation.date).toLocaleDateString("en-CA")}
                              </div>
                            </td>
                            <td className={styles.tableCell}>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Clock size={14} />
                                {evaluation.time}
                              </div>
                            </td>
                            <td className={styles.tableCell}>
                              <span className={evaluation.done ? styles.statusCompleted : styles.statusPending}>
                                {evaluation.done ? "Completed" : "Pending"}
                              </span>
                            </td>
                            <td className={styles.tableCell}>
                              <div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {evaluation.description || "—"}
                              </div>
                            </td>
                            <td className={styles.tableCell}>
                              <div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {evaluation.evolutionNote || "—"}
                              </div>
                            </td>
                            <td className={styles.tableCell}>
                              <span className={styles.statusCompleted}>Cash</span>
                            </td>
                            <td className={styles.tableCell}>
                              <button
                                className={styles.toggleButton}
                                onClick={() => toggleSessionsVisibility(index, evaluation._id)}
                              >
                                {activeEvaluationIndex === index ? (
                                  <>
                                    <EyeOff size={14} style={{ marginRight: "4px" }} />
                                    Hide Sessions
                                  </>
                                ) : (
                                  <>
                                    <Eye size={14} style={{ marginRight: "4px" }} />
                                    Show Sessions
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                          {activeEvaluationIndex === index && (
                            <tr>
                              <td colSpan="9" style={{ padding: "0" }}>
                                {sessions.length > 0 ? (
                                  <div className={styles.sessionsTable}>
                                    <table
                                      className={styles.modernTable}
                                      style={{ margin: "16px", width: "calc(100% - 32px)" }}
                                    >
                                      <thead className={styles.tableHeader}>
                                        <tr>
                                          <th>Session Name</th>
                                          <th>Date</th>
                                          <th>Time</th>
                                          <th>Doctor Note</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {sessions.map((session) => (
                                          <tr key={session._id} className={styles.tableRow}>
                                            <td className={styles.tableCell}>{session.Sessionname}</td>
                                            <td className={styles.tableCell}>
                                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Calendar size={14} />
                                                {new Date(session.date).toLocaleDateString("en-CA")}
                                              </div>
                                            </td>
                                            <td className={styles.tableCell}>
                                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Clock size={14} />
                                                {session.time}
                                              </div>
                                            </td>
                                            <td className={styles.tableCell}>{session.note || "—"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className={styles.noSessions}>{sessionError}</div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
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
