"use client"
import { useEffect, useState } from "react"
import { Activity, Brain, MessageSquare, Heart, GraduationCap, Users, FileText, Play, AlertCircle } from "lucide-react"
import SyncfusionDocx from "./SyncfusionDocx"
import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/full-programdavid.module.css"

const FullProgramComponent = ({ patientId }) => {
  const [activeTab, setActiveTab] = useState("physicalTherapy")
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const tabs = [
    {
      id: "physicalTherapy",
      label: "Physical Therapy",
      icon: Activity,
      description: "Movement and mobility rehabilitation",
    },
    {
      id: "occupationalTherapy",
      label: "Occupational Therapy",
      icon: Brain,
      description: "Daily living skills development",
    },
    {
      id: "speechTherapy",
      label: "Speech Therapy",
      icon: MessageSquare,
      description: "Communication and language skills",
    },
    {
      id: "behavioralTherapy",
      label: "Behavioral Therapy",
      icon: Heart,
      description: "Behavioral modification and support",
    },
    {
      id: "educationalProgram",
      label: "Educational Program",
      icon: GraduationCap,
      description: "Academic and learning support",
    },
    {
      id: "socialSkills",
      label: "Social Skills",
      icon: Users,
      description: "Social interaction and communication",
    },
  ]

  const studentVideos = ["/videos/sample1.mp4", "/videos/sample2.mp4"]

  useEffect(() => {
    console.log("patientId received in useEffect:", patientId)
    const fetchPlanData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching plan data for patientId:", patientId)
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/physicalTherapy/plan/${patientId}`)
        console.log("Plan data fetched:", response.data)
        setPlan(response.data)
      } catch (error) {
        console.error("Error fetching plan data:", error)
        setError("Error fetching plan data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      fetchPlanData()
    }
  }, [patientId])

  if (loading) {
    return (
      <div className={styles.programContainer}>
        <div className="container">
          <div className={styles.programCard}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <div className={styles.loadingText}>Loading program data...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.programContainer}>
        <div className="container">
          <div className={styles.programCard}>
            <div className={styles.errorContainer}>
              <AlertCircle className={styles.errorIcon} />
              <div className={styles.errorText}>{error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTabContent = (tab) => {
    if (tab.id === "physicalTherapy") {
      return (
        <div className={styles.tabContent}>
          <div className={styles.contentSection}>
            <h6 className={styles.sectionTitle}>
              <FileText size={20} />
              Program Files
            </h6>
            <div className={styles.filesContainer}>
              <div className={styles.fileCard}>
                <h6 style={{ color: "#4a5568", marginBottom: "1rem", fontWeight: "600" }}>Exam File</h6>
                {plan && plan._id && (
                  <SyncfusionDocx
                    userData={{
                      docxId: plan._id,
                      patientId,
                      filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/physical-therapy/plan/${plan.filePath || "physical-therapy-plan-defoult.docx"}`,
                      fileName: plan.fileName || "physical-therapy-plan-defoult.docx",
                      docxName: `physical-therapy-plan-${patientId}.docx`,
                    }}
                    planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/authentication/py/upload-plan`}
                  />
                )}
              </div>
              <div className={styles.fileCard}>
                <h6 style={{ color: "#4a5568", marginBottom: "1rem", fontWeight: "600" }}>Plan File</h6>
                {plan && plan._id && (
                  <SyncfusionDocx
                    userData={{
                      docxId: plan._id,
                      patientId,
                      filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/physical-therapy/plan/${plan.filePath || "physical-therapy-plan-defoult.docx"}`,
                      fileName: plan.fileName || "physical-therapy-plan-defoult.docx",
                      docxName: `physical-therapy-plan-${patientId}.docx`,
                    }}
                    planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/authentication/py/upload-plan`}
                  />
                )}
              </div>
            </div>
          </div>

          <div className={styles.contentSection}>
            <h6 className={styles.sectionTitle}>
              <Play size={20} />
              Student Progress Videos
            </h6>
            <div className={styles.videosContainer}>
              {studentVideos.map((videoUrl, index) => (
                <div key={index} className={styles.videoWrapper}>
                  <video className={styles.videoElement} controls preload="metadata">
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.tabContent}>
        <div className={styles.placeholderContent}>Content for {tab.label} will be available soon</div>
      </div>
    )
  }

  return (
    <div className={styles.programContainer}>
      <div className="container">
        <div className={styles.programCard}>
          <div className={styles.cardHeader}>
            <h4 className={styles.cardTitle}>Full Program</h4>
            <p className={styles.cardSubtitle}>Comprehensive therapy and educational programs</p>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.tabsContainer}>
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <div
                    key={tab.id}
                    className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className={styles.tabHeader}>
                      <IconComponent className={styles.tabIcon} />
                      <h6 className={styles.tabTitle}>{tab.label}</h6>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        opacity: 0.8,
                        fontSize: "0.9rem",
                        color: isActive ? "rgba(255, 255, 255, 0.9)" : "#718096",
                      }}
                    >
                      {tab.description}
                    </p>

                    {isActive && renderTabContent(tab)}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FullProgramComponent
