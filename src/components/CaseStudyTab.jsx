"use client"

import { useState, useEffect, Suspense } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { FileText, Lightbulb } from "lucide-react"
import styles from "../styles/case-study-tab.module.css"
import { useLanguage } from "@/contexts/LanguageContext" // Import language context
import dynamic from "next/dynamic" // Import dynamic for lazy loading

// Dynamic import for SyncfusionDocxCase with loading fallback
const SyncfusionDocxCase = dynamic(() => import("./SyncfusionDocxCase2"), {
  ssr: false,
  loading: () => (
    <div className={styles.ruknDocumentImportLoader}>
      <div className={styles.ruknDocumentImportContent}>
        <div className={styles.ruknDocumentImportIcon}>
          <FileText size={32} />
        </div>
        <h4 className={styles.ruknDocumentImportTitle}>
          {"تحميل ملف دراسة الحالة الخاصة بك..." /* Arabic */ || "Loading Your Case Study..." /* English */}
        </h4>
        <p className={styles.ruknDocumentImportSubtitle}>
          {
            "يرجى الانتظار بينما نقوم بتحضير ملف دراسة الحالة الخاصة بك..." /* Arabic */ ||
              "Please wait while we prepare Your Case Study..." /* English */
          }
        </p>
        <div className={styles.ruknDocumentImportProgress}>
          <div className={styles.ruknDocumentImportProgressBar}></div>
        </div>
        <div className={styles.ruknDocumentImportTip}>
          <Lightbulb size={16} />
          <span>
            {
              "💡 نصيحة: ستتمكن من تحرير وحفظ مستند دراسة الحالة بمجرد اكتمال التحميل" /* Arabic */ ||
                "💡 Tip: You'll be able to edit and save your case study document once loading completes" /* English */
            }
          </span>
        </div>
      </div>
    </div>
  ),
})

const CaseStudyTab = ({ patientId, patientName }) => {
  // Add patientName prop
  const { language } = useLanguage() // Get current language
  const [caseStudyData, setCaseStudyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCaseStudyCreation, setShowCaseStudyCreation] = useState(false) // New state for creation mode

  useEffect(() => {
    if (patientId) {
      fetchCaseStudy()
    }
  }, [patientId])

  const fetchCaseStudy = async () => {
    try {
      setLoading(true)
      setError(null)
      setShowCaseStudyCreation(false) // Reset creation mode on new fetch

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-case-study/${patientId}`,
      )

      console.log("Case study response:", response.data) // Debug log
      setCaseStudyData(response.data)
    } catch (err) {
      console.error("Error fetching case study:", err)
      if (err.response?.status === 404) {
        setError(
          err.response.data.message ||
            (language === "ar" ? "لم يتم إنشاء ملف دراسة الحالة بعد" : "Case study file not yet created"),
        )
      } else {
        setError(language === "ar" ? "حدث خطأ في تحميل ملف دراسة الحالة" : "Error loading case study file")
        toast.error(language === "ar" ? "حدث خطأ في تحميل ملف دراسة الحالة" : "Error loading case study file")
      }
    } finally {
      setLoading(false)
    }
  }

  // No longer needed as SyncfusionDocxCase handles view/download
  // const handleViewDocument = () => { setShowViewer(true) }
  // const handleCloseViewer = () => { setShowViewer(false) }
  // const handleDownload = () => { ... }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>
            {language === "ar" ? "جاري تحميل ملف دراسة الحالة..." : "Loading case study file..."}
          </p>
        </div>
      </div>
    )
  }

  // If no case study exists or 404 error, and not in creation mode, show prompt
  if (
    (error && error.includes("لم يتم إنشاء ملف دراسة الحالة بعد")) ||
    (!caseStudyData?.hasCaseStudy && !showCaseStudyCreation)
  ) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          {" "}
          {/* Reusing errorContainer for styling */}
          <div className={styles.errorIcon}>
            <FileText size={48} />
          </div>
          <h3 className={styles.errorTitle}>
            {language === "ar" ? "مرحباً بك! لنبدأ بإنشاء ملفك الطبي" : "Welcome! Let's Create Your Medical File"}
          </h3>
          <p className={styles.errorMessage}>
            {language === "ar"
              ? "هذه هي المرة الأولى التي تحجز فيها معنا! نحتاج إلى إنشاء ملف طبي خاص بك يحتوي على معلوماتك الصحية وخطة العلاج المناسبة لحالتك. هذا الملف سيساعد أطباءنا على تقديم أفضل رعاية ممكنة لك."
              : "This is your first time booking with us! We need to create a personalized medical file that contains your health information and treatment plan tailored to your condition. This file will help our doctors provide you with the best possible care."}
          </p>
          <button
            type="button"
            onClick={() => setShowCaseStudyCreation(true)}
            className={`${styles.actionButton} ${styles.viewButton}`} // Reusing button styles
          >
            <FileText size={20} />
            {language === "ar" ? "إنشاء ملفي الطبي" : "Create My Medical File"}
          </button>
        </div>
      </div>
    )
  }

  // If case study exists or creation mode is active, show SyncfusionDocxCase
  return (
    <div className={styles.container}>
      

      <div className={styles.content}>
        <div className={styles.ruknDocumentContainer}>
          {" "}
          {/* Reusing style from StudentBooking */}
          <Suspense
            fallback={
              <div className={styles.ruknDocumentImportLoader}>
                <div className={styles.ruknDocumentImportContent}>
                  <div className={styles.ruknDocumentImportIcon}>
                    <FileText size={32} />
                  </div>
                  <h4 className={styles.ruknDocumentImportTitle}>
                    {"تحميل محرر المستندات..." /* Arabic */ || "Loading Document Editor..." /* English */}
                  </h4>
                  <p className={styles.ruknDocumentImportSubtitle}>
                    {
                      "يرجى الانتظار بينما نقوم بتحضير محرر المستندات المتقدم..." /* Arabic */ ||
                        "Please wait while we prepare the advanced document editor..." /* English */
                    }
                  </p>
                  <div className={styles.ruknDocumentImportProgress}>
                    <div className={styles.ruknDocumentImportProgressBar}></div>
                  </div>
                  <div className={styles.ruknDocumentImportTip}>
                    <Lightbulb size={16} />
                    <span>
                      {
                        "💡 نصيحة: ستتمكن من تحرير وحفظ مستند دراسة الحالة بمجرد اكتمال التحميل" /* Arabic */ ||
                          "💡 Tip: You'll be able to edit and save your case study document once loading completes" /* English */
                      }
                    </span>
                  </div>
                </div>
              </div>
            }
          >
            {caseStudyData?.hasCaseStudy && caseStudyData.caseStudyFile?.url ? (
              <SyncfusionDocxCase
                userData={{
                  docxId: caseStudyData.caseStudyFile.title,
                  patientId: patientId,
                  filePath: caseStudyData.caseStudyFile.url,
                  fileName: caseStudyData.caseStudyFile.filename || "case-study.docx",
                                    docxName: ` `, // Use patientName prop

                }}
                planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/DrastHala/upload-plan`}
                onDocumentSaved={fetchCaseStudy} // Callback to refresh data
                readOnly={true} // Set to read-only for existing documents
              />
            ) : (
              <SyncfusionDocxCase
                userData={{
                  docxId: "default",
                  patientId: patientId,
                  filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/DRAST-7ALA/plan/default.docx`,
                  fileName: "default.docx",
                  docxName: ` `, // Use patientName prop
                }}
                planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/DrastHala/upload-plan`}
                onDocumentSaved={(updatedPlan) => {
                  fetchCaseStudy() // Refresh data
                  // If a new document is saved, exit creation mode
                  if (updatedPlan?.hasCaseStudy) {
                    setShowCaseStudyCreation(false)
                  }
                }}
                readOnly={false} // Not read-only for new creation
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default CaseStudyTab
