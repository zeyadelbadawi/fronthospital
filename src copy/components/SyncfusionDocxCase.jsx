"use client"
// Todo :Add more component in toolbar of ej2-react-documenteditor
import { useEffect, useRef, useState } from "react"
import { DocumentEditorContainerComponent, Toolbar, Inject } from "@syncfusion/ej2-react-documenteditor"
import axiosInstance from "@/helper/axiosSetup"
import { Download, Save, Printer, FileText, CheckCircle, AlertCircle, RefreshCw, Lightbulb } from "lucide-react" // Add Lucide icons
import docxStyles from "../styles/SyncfusionDocxCase.module.css" // Import new CSS module
import { toast } from "react-toastify"
import { useLanguage } from "@/contexts/LanguageContext" // Import language context

// 1. استقبل الـ prop الجديدة في تعريف المكون
export default function SyncfusionDocx({ userData, planEndpoint, email, onDocumentSaved }) {
  // أضف onDocumentSaved هنا
  const documentEditorContainerRef = useRef(null)
  const { language } = useLanguage() // Get current language

  // Loading states
  const [isDocumentLoading, setIsDocumentLoading] = useState(true)
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingError, setLoadingError] = useState(null)
  const [documentReady, setDocumentReady] = useState(false)

  // Loading steps based on language
  const getLoadingSteps = () => {
    return language === "ar"
      ? [
          "تحضير محرر المستندات...",
          "تحميل مستند دراسة الحالة...",
          "تطبيق التنسيقات والأنماط...",
          "تجهيز أدوات التحرير...",
          "اكتمال التحميل!",
        ]
      : [
          "Preparing document editor...",
          "Loading case study document...",
          "Applying formats and styles...",
          "Setting up editing tools...",
          "Loading complete!",
        ]
  }

  // Toast messages based on language
  const getToastMessages = () => {
    return language === "ar"
      ? {
          saving: "🔄 جاري حفظ المستند...",
          saveSuccess: "✅ تم حفظ مستند دراسة الحالة بنجاح! يمكنك الآن المتابعة للدفع.",
          saveError: "❌ حدث خطأ أثناء حفظ المستند. يرجى المحاولة مرة أخرى.",
          networkError: "❌ فشل في حفظ المستند. تحقق من اتصال الإنترنت وحاول مرة أخرى.",
          downloadSuccess: "📥 تم تحميل المستند بنجاح!",
          printSuccess: "🖨️ تم فتح نافذة الطباعة",
          emailWarning: "⚠️ تم حفظ المستند بنجاح، لكن فشل في إرسال البريد الإلكتروني.",
          notificationWarning: "⚠️ تم حفظ المستند بنجاح، لكن فشل في إرسال الإشعار.",
        }
      : {
          saving: "🔄 Saving document...",
          saveSuccess: "✅ Case study document saved successfully! You can now proceed to payment.",
          saveError: "❌ Error occurred while saving document. Please try again.",
          networkError: "❌ Failed to save document. Check your internet connection and try again.",
          downloadSuccess: "📥 Document downloaded successfully!",
          printSuccess: "🖨️ Print dialog opened",
          emailWarning: "⚠️ Document saved successfully, but failed to send email.",
          notificationWarning: "⚠️ Document saved successfully, but failed to send notification.",
        }
  }

  // Load Syncfusion styles
  useEffect(() => {
    const head = document.head
    const link1 = document.createElement("link")
    link1.rel = "stylesheet"
    link1.href = "https://cdn.syncfusion.com/ej2/23.1.36/material.css"
    link1.id = "syncfusion-style"

    head.appendChild(link1)

    return () => {
      const existing = document.getElementById("syncfusion-style")
      if (existing) head.removeChild(existing)
    }
  }, [])

  // Simulate loading steps
  useEffect(() => {
    const steps = getLoadingSteps()
    let currentStep = 0

    const stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        setLoadingStep(currentStep + 1)
        currentStep++
      } else {
        clearInterval(stepInterval)
        // Simulate final loading delay
        setTimeout(() => {
          setIsDocumentLoading(false)
          setDocumentReady(true)
        }, 800)
      }
    }, 1000) // Each step takes 1 second

    return () => clearInterval(stepInterval)
  }, [language])

  // Load the document when the component mounts
  useEffect(() => {
    if (documentEditorContainerRef.current && userData.filePath && documentReady) {
      try {
        documentEditorContainerRef.current.documentEditor.open(userData.filePath)
      } catch (error) {
        console.error("Error loading document:", error)
        setLoadingError(error.message)
      }
    }
  }, [userData.filePath, documentReady])

  // Function to download the document
  const onDownload = () => {
    const editor = documentEditorContainerRef.current
    if (editor) {
      editor.documentEditor.save(`${userData.patientId + new Date().getSeconds()}`, "Docx")

      // Show download success toast
      const messages = getToastMessages()
      toast.success(messages.downloadSuccess, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  // 2. استدعي onDocumentSaved بعد نجاح الحفظ
  const onSave = async () => {
    const editor = documentEditorContainerRef.current
    if (editor) {
      const messages = getToastMessages()

      try {
        // Show loading toast
        const loadingToastId = toast.loading(messages.saving, {
          position: "top-right",
        })

        const documentContent = await editor.documentEditor.saveAsBlob("Docx")

        const formData = new FormData()
        formData.append("document", documentContent, `${userData.patientId + new Date().getSeconds()}.docx`)
        formData.append("patientId", userData.patientId)

        const response = await axiosInstance.post(planEndpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        if (response.status === 200) {
          // Dismiss loading toast
          toast.dismiss(loadingToastId)

          // Show success toast with enhanced styling
          toast.success(messages.saveSuccess, {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "custom-success-toast",
            bodyClassName: "custom-success-toast-body",
            progressClassName: "custom-success-toast-progress",
          })

          // Send notifications and email
          await Promise.all([sendNotification(), sendEmail(response.data.filePath)])

          if (onDocumentSaved) {
            // تحقق مما إذا كانت الدالة موجودة قبل استدعائها
            onDocumentSaved() // استدعاء الدالة لتحديث حالة الأب
          }
        } else {
          // Dismiss loading toast
          toast.dismiss(loadingToastId)

          // Show error toast
          toast.error(messages.saveError, {
            position: "top-right",
            autoClose: 5000,
          })

          console.error("Error saving document:", response.statusText)
        }
      } catch (error) {
        // Show error toast
        toast.error(messages.networkError, {
          position: "top-right",
          autoClose: 5000,
        })

        console.error("Error during save operation:", error)
      }
    }
  }

  const sendEmail = async (filePath) => {
    const messages = getToastMessages()

    try {
      // Send the form data to your server
      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/email/send-email`, {
        to: userData.to,
        filePath,
        subject: userData.title,
        text: userData.message,
      })
    } catch (error) {
      // Show email error toast (optional, non-blocking)
      toast.warning(messages.emailWarning, {
        position: "top-right",
        autoClose: 4000,
      })
    }
  }

  const sendNotification = async () => {
    const messages = getToastMessages()

    try {
      let response
      if (userData.isList) {
        response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/notification/send`, {
          receiverIds: userData.doctorIds,
          rule: userData.rule,
          title: userData.title,
          message: userData.message,
        })
      } else {
        // Send the form data to your server
        response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/notification/send`, {
          receiverId: userData.patientId,
          rule: userData.rule,
          title: userData.title,
          message: userData.message,
        })
      }
    } catch (error) {
      // Show notification error toast (optional, non-blocking)
      toast.warning(messages.notificationWarning, {
        position: "top-right",
        autoClose: 4000,
      })
    }
  }

  const onChange = () => {}

  // Function to handle print
  const onPrint = () => {
    const editor = documentEditorContainerRef.current
    if (editor) {
      editor.documentEditor.print()

      // Show print toast
      const messages = getToastMessages()
      toast.info(messages.printSuccess, {
        position: "top-right",
        autoClose: 2000,
      })
    }
  }

  // Function to retry loading
  const retryLoading = () => {
    setLoadingError(null)
    setIsDocumentLoading(true)
    setLoadingStep(0)
    setDocumentReady(false)
  }

  const DocxHeader = () => {
    return (
      <div className={docxStyles.docxHeader}>
        <span className={docxStyles.docxTitle}>{userData.docxName}</span>
        <div className={docxStyles.docxButtonContainer}>
          <button onClick={onDownload} className={docxStyles.docxButton} disabled={isDocumentLoading}>
            <Download size={20} />
            <span>{language === "ar" ? "تحميل" : "Download"}</span>
          </button>
          <button onClick={onSave} className={docxStyles.docxButton} disabled={isDocumentLoading}>
            <Save size={20} />
            <span>{language === "ar" ? "حفظ" : "Save"}</span>
          </button>
          <button onClick={onPrint} className={docxStyles.docxButton} disabled={isDocumentLoading}>
            <Printer size={20} />
            <span>{language === "ar" ? "طباعة" : "Print"}</span>
          </button>
        </div>
      </div>
    )
  }

  // Loading Component
  
  return (
    <div>
      <DocxHeader />
      <div className={docxStyles.documentEditorContainer}>
     
          <DocumentEditorContainerComponent
            id="container"
            height="100%" // Set height to 100% to fill parent div
            enableToolbar={true}
            ref={documentEditorContainerRef}
            autoResizeOnVisibilityChange={true}
            locale="en-US"
            serviceUrl={process.env.NEXT_PUBLIC_SYNCFUSION_SERVICE_URL}
          >
            <Inject services={[Toolbar]} />
          </DocumentEditorContainerComponent>
      </div>
    </div>
  )
}
