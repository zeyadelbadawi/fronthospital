"use client"

import { useState, useEffect, useRef } from "react" // إضافة useRef
import DocxUploadForm from "./docx-upload-form-doctor"
import styles from "../styles/document-page.module.css" // إعادة استيراد ملف الأنماط
import axiosInstance from "@/helper/axiosSetup"
import DoctorPlanDocx from "@/components/DoctorPlanDocx"
import CloseQuarterForm from "./close-quarter-form-doctor"
import { ArrowLeft, FileText, Clock, Calendar, Brain, XCircle, Save, Download } from "lucide-react" // إضافة أيقونات Save و Download

export default function DoctorPlan({ doctorId, departmentId }) {
  const [hasDocument, setHasDocument] = useState(null) // null = loading, true = has doc, false = no doc
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCloseQuarterModal, setShowCloseQuarterModal] = useState(false)
  const [currentQuarter, setCurrentQuarter] = useState(null)
  const [allPlans, setAllPlans] = useState([])
  const docxEditorRef = useRef(null) // إنشاء مرجع لمكون DoctorPlanDocx

  // Helper function to get current quarter based on current date
  const getCurrentQuarter = () => {
    const now = new Date()
    const month = now.getMonth() + 1 // 1-12
    const year = now.getFullYear()
    let quarter
    if (month <= 3) quarter = 1
    else if (month <= 6) quarter = 2
    else if (month <= 9) quarter = 3
    else quarter = 4
    return { quarter, year }
  }

  // دالة محسّنة لتحديد الربع النشط للعرض
  const determineActiveQuarter = async () => {
    const { quarter: currentCalendarQ, year: currentCalendarY } = getCurrentQuarter()
    setIsLoading(true)
    setError(null)

    try {
      // 1. جلب أحدث خطة على الإطلاق للطبيب والقسم
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/doctorFile/get-plans/${doctorId}/${departmentId}?last=true`,
      )
      const latestPlan = response?.data?.doctorFiles // ستكون null إذا لم تكن هناك خطط

      if (latestPlan) {
        // إذا كانت هناك خطة حديثة، فاجعلها المستند النشط الحالي
        setCurrentQuarter({ quarter: latestPlan.quarterOfYear, year: latestPlan.year })
        setHasDocument(latestPlan)
      } else {
        // إذا لم تكن هناك خطط، اقترح الربع التقويمي الحالي للتحميل
        setCurrentQuarter({ quarter: currentCalendarQ, year: currentCalendarY })
        setHasDocument(false) // لا يوجد مستند لهذا الربع
      }
    } catch (err) {
      console.error("Error determining active quarter:", err)
      setError("Failed to determine active quarter.")
      // العودة إلى الربع التقويمي الحالي في حالة وجود خطأ
      setCurrentQuarter({ quarter: currentCalendarQ, year: currentCalendarY })
      setHasDocument(false) // افترض عدم وجود مستند في حالة الخطأ
    } finally {
      setIsLoading(false)
    }
  }

  // التعامل مع التحميل الناجح (للتحميلات الأولية/التاريخية)
  const handleUploadSuccess = () => {
    determineActiveQuarter() // إعادة تشغيل لتحديث الحالة وجلب المستند الذي تم تحميله حديثاً
    setShowModal(false)
  }

  // التعامل مع إغلاق الربع بنجاح (يؤدي إلى إنشاء خطة الربع التالي في الخلفية)
  const handleCloseQuarterSuccess = async (closedQuarterData) => {
    setShowCloseQuarterModal(false)
    // إعادة تحديد الربع النشط ليعكس الخطة التي تم إنشاؤها حديثاً
    await determineActiveQuarter()
  }

  // إعادة محاولة التحقق من المستند
  const handleRetry = () => {
    determineActiveQuarter() // إعادة تشغيل لتحديث الحالة
  }

  useEffect(() => {
    const initializeQuarterManagement = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // أولاً، حدد الربع النشط
        await determineActiveQuarter()
      } catch (error) {
        console.error("Error initializing quarter management:", error)
        setError("Failed to initialize quarter management")
        setIsLoading(false)
      }
    }
    if (doctorId && departmentId) {
      initializeQuarterManagement()
    }
  }, [doctorId, departmentId])

  const handleBackToList = () => {
    window.history.back()
  }

  const fetchAllPlans = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/doctorFile/get-plans/${doctorId}/${departmentId}`,
      )
      setAllPlans(response?.data?.doctorFiles || [])
    } catch (error) {
      console.error("Error fetching all plans:", error)
    }
  }


  // وظائف الحفظ والتنزيل التي ستستدعيها الأزرار الجديدة
  const handleSaveDocument = async () => {
    if (docxEditorRef.current && hasDocument?._id) {
      await docxEditorRef.current.onSave() // استدعاء وظيفة onSave المعرضة
    } else {
      alert("Document editor not ready or document ID is missing for save.")
    }
  }

  const handleDownloadDocument = () => {
    if (docxEditorRef.current && hasDocument?.fileName) {
      docxEditorRef.current.onDownload() // استدعاء وظيفة onDownload المعرضة
    } else {
      alert("Document editor not ready or file name is missing for download.")
    }
  }

  if (isLoading) {
    return (
      <div className={styles.documentPage}>
        <div className="container">
          <div className={styles.loadingContainer}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3">Checking document status...</h4>
            <p className="text-muted">Please wait while we verify your documents.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.documentPage}>
        <div className="container">
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h4>Something went wrong</h4>
            <p className="text-muted mb-4">{error}</p>
            <button className="btn btn-primary" onClick={handleRetry}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.documentPage}>
      <div className="container">
        {/* Header */}
        {/* Main Content */}
        {!hasDocument ? (
          // لا يوجد مستند - عرض رسالة التحميل
          <div className={styles.noDocumentContainer}>
            <div className={styles.noDocumentCard}>
              <div className={styles.noDocumentIcon}>
                <i className="bi bi-file-earmark-plus"></i>
              </div>
              <h3>No Document Found</h3>
              <p className="text-muted mb-4">
                We couldn't find any documents for your account for Q{currentQuarter?.quarter}/{currentQuarter?.year}.
                Please upload a DOCX document to get started.
              </p>
              <div className={styles.userInfo}>
                <div className={styles.infoItem}>
                  <strong>Doctor ID:</strong> {doctorId}
                </div>
                <div className={styles.infoItem}>
                  <strong>Department ID:</strong> {departmentId}
                </div>
                {currentQuarter && (
                  <div className={styles.infoItem}>
                    <strong>Current Quarter:</strong> Q{currentQuarter.quarter}/{currentQuarter.year}
                  </div>
                )}
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
                <i className="bi bi-cloud-upload me-2"></i>
                Upload Document for Q{currentQuarter?.quarter}/{currentQuarter?.year}
              </button>
              <button className="btn btn-outline-secondary ms-3" onClick={handleRetry}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>

            </div>
          </div>
        ) : (
          // تم العثور على مستند - عرضه بتصميم PatientPlanEditor
          <div className={styles.planEditorContainer}>
            <div className={styles.planEditorCard}>
              {/* Header بتصميم PatientPlanEditor */}
              <div className={styles.planHeader}>
                <div className={styles.headerTopRow}>
                  <button onClick={handleBackToList} className={styles.backButton}>
                    <ArrowLeft className={styles.backIcon} />
                    Back to Dashboard
                  </button>
                  <div className={styles.topRightActions}>
                    <button
                      className="btn btn-primary d-flex align-items-center gap-1"
                      onClick={() => setShowCloseQuarterModal(true)}
                    >
                      <XCircle className="me-2" size={16} />
                      Close the Quarter
                    </button>
                  </div>
                </div>
                <div className={styles.headerBottomRow}>
                  <div className={styles.studentInfo}>
                    <h1 className={styles.planTitle}>
                      <Brain className={styles.titleIcon} />
                      Doctor Plan Document
                    </h1>
                    <div className={styles.studentDetails}>
                      {hasDocument?.fileName && (
                        <div className={styles.studentDetail}>
                          <FileText className={styles.detailIcon} />
                          <span>{hasDocument.fileName}</span>
                        </div>
                      )}
                      {hasDocument?.createdAt && (
                        <div className={styles.studentDetail}>
                          <Calendar className={styles.detailIcon} />
                          <span>Created: {new Date(hasDocument.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {currentQuarter && (
                        <div className={styles.studentDetail}>
                          <span>
                            Quarter: Q{currentQuarter.quarter}/{currentQuarter.year}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.documentActions}>
                    {/* أزرار الحفظ والتنزيل الجديدة هنا */}
                    <button className="btn btn-success d-flex align-items-center gap-1" onClick={handleSaveDocument}>
                      <Save className="me-2" size={16} />
                      Save
                    </button>
                    <button className="btn btn-info d-flex align-items-center gap-1" onClick={handleDownloadDocument}>
                      <Download className="me-2" size={16} />
                      Download
                    </button>
                  </div>
                </div>
              </div>
              {/* المحتوى الرئيسي */}
              <div className={styles.planBody}>
                <div className={styles.documentSection}>
                  <div className={styles.documentContainer}>
                    {/* هذا السطر يعرض المسار فقط، وليس المستند نفسه */}
                    <div className="text-muted mb-2">
                      Document Path: {`${process.env.NEXT_PUBLIC_API_URL}${hasDocument?.fullPath}`}
                    </div>
                    <DoctorPlanDocx
                      ref={docxEditorRef} // تمرير المرجع إلى DoctorPlanDocx
                      filePath={`${process.env.NEXT_PUBLIC_API_URL}${hasDocument?.fullPath}`}
                      doctorId={doctorId}
                      departmentId={departmentId}
                      documentId={hasDocument?._id}
                      fileName={hasDocument?.fileName}
                      quarterOfYear={hasDocument?.quarterOfYear} // إضافة هذا السطر
                      year={hasDocument?.year} // إضافة هذا السطر
                    />
                  </div>
                  {hasDocument?.lastModified && (
                    <div className={styles.documentFooter}>
                      <div className={styles.lastModified}>
                        <Clock className={styles.clockIcon} />
                        <span>Last modified: {new Date(hasDocument.lastModified).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Close Modal */}
        {showCloseQuarterModal && (
          <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className={`modal-content ${styles.customModalContent}`}>
                <div className="modal-header">
                  <h5 className="modal-title">Close Quarter</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCloseQuarterModal(false)}></button>
                </div>
                <div className="modal-body p-0">
                  <CloseQuarterForm
                    onSuccess={handleCloseQuarterSuccess}
                    onClose={() => setShowCloseQuarterModal(false)}
                    defaultValues={{
                      doctorId: doctorId,
                      departmentId: departmentId,
                      quarterOfYear: hasDocument?.quarterOfYear || currentQuarter?.quarter, // تمرير الربع الذي يتم إغلاقه
                      year: hasDocument?.year || currentQuarter?.year, // تمرير السنة التي يتم إغلاقها
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {showModal && (
          <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className={`modal-content ${styles.customModalContent}`}>
                <div className="modal-header">
                  <h5 className="modal-title">Upload Document</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-0">
                  <DocxUploadForm
                    onSuccess={handleUploadSuccess}
                    onClose={() => setShowModal(false)}
                    defaultValues={{
                      doctorId: doctorId,
                      departmentId: departmentId,
                      quarterOfYear: currentQuarter?.quarter,
                      year: currentQuarter?.year,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
