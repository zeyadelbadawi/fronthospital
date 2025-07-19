"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { FileText, AlertCircle, Download, Eye } from "lucide-react"
import PatientDocumentViewer from "./PatientDocumentViewer"
import styles from "../styles/case-study-tab.module.css"

const CaseStudyTab = ({ patientId }) => {
  const [caseStudyData, setCaseStudyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showViewer, setShowViewer] = useState(false)

  useEffect(() => {
    if (patientId) {
      fetchCaseStudy()
    }
  }, [patientId])

  const fetchCaseStudy = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-case-study/${patientId}`,
      )

      console.log("Case study response:", response.data) // Debug log
      setCaseStudyData(response.data)
    } catch (err) {
      console.error("Error fetching case study:", err)
      if (err.response?.status === 404) {
        setError(err.response.data.message || "لم يتم إنشاء ملف دراسة الحالة بعد")
      } else {
        setError("حدث خطأ في تحميل ملف دراسة الحالة")
        toast.error("حدث خطأ في تحميل ملف دراسة الحالة")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = () => {
    setShowViewer(true)
  }

  const handleCloseViewer = () => {
    setShowViewer(false)
  }

  const handleDownload = () => {
    if (caseStudyData?.caseStudyFile?.url) {
      const link = document.createElement("a")
      link.href = caseStudyData.caseStudyFile.url
      link.download = caseStudyData.caseStudyFile.filename || "case-study.pdf"
      link.target = "_blank" // Open in new tab
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("تم بدء تحميل الملف")
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>جاري تحميل ملف دراسة الحالة...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <AlertCircle size={48} />
          </div>
          <h3 className={styles.errorTitle}>ملف دراسة الحالة غير متوفر</h3>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.errorInfo}>
            <p>سيتم إنشاء ملف دراسة الحالة من قبل الفريق الطبي بعد:</p>
            <ul className={styles.errorList}>
              <li>إجراء التقييم الأولي</li>
              <li>مراجعة التاريخ الطبي</li>
              <li>تحليل الاحتياجات الخاصة</li>
              <li>وضع خطة العلاج المناسبة</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (!caseStudyData?.hasCaseStudy) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <FileText size={48} />
          </div>
          <h3 className={styles.errorTitle}>لم يتم إنشاء ملف دراسة الحالة بعد</h3>
          <p className={styles.errorMessage}>ملف دراسة الحالة الخاص بك قيد الإعداد من قبل الفريق الطبي</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FileText size={24} />
          </div>
          <div className={styles.headerText}>
            <h2 className={styles.headerTitle}>ملف دراسة الحالة</h2>
            <p className={styles.headerSubtitle}>عرض وتحميل ملف دراسة الحالة الخاص بك</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.documentCard}>
          <div className={styles.documentHeader}>
            <div className={styles.documentIcon}>
              <FileText size={32} />
            </div>
            <div className={styles.documentInfo}>
              <h3 className={styles.documentTitle}>
                {caseStudyData.caseStudyFile.title || caseStudyData.caseStudyFile.filename || "ملف دراسة الحالة"}
              </h3>
              <p className={styles.documentPatient}>المريض: {caseStudyData.patientName}</p>
              {caseStudyData.caseStudyFile.uploadDate && (
                <p className={styles.documentDate}>
                  تاريخ الإنشاء: {new Date(caseStudyData.caseStudyFile.uploadDate).toLocaleDateString("ar-EG")}
                </p>
              )}
            </div>
          </div>

          <div className={styles.documentActions}>
            <button onClick={handleViewDocument} className={`${styles.actionButton} ${styles.viewButton}`}>
              <Eye size={16} />
              عرض الملف
            </button>
            <button onClick={handleDownload} className={`${styles.actionButton} ${styles.downloadButton}`}>
              <Download size={16} />
              تحميل الملف
            </button>
          </div>
        </div>

        
      </div>

      {showViewer && caseStudyData?.caseStudyFile && (
        <PatientDocumentViewer
          documentUrl={caseStudyData.caseStudyFile.url}
          documentName={caseStudyData.caseStudyFile.filename || caseStudyData.caseStudyFile.title || "ملف دراسة الحالة"}
          patientName={caseStudyData.patientName}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  )
}

export default CaseStudyTab
