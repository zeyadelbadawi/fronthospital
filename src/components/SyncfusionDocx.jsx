"use client"

import { useEffect, useRef } from "react"
import { DocumentEditorContainerComponent, Toolbar, Inject } from "@syncfusion/ej2-react-documenteditor"
import { Download, Save, Printer, FileText, Maximize2 } from "lucide-react"
import axiosInstance from "@/helper/axiosSetup"
import styles from "@/styles/syncfusion-docx.module.css"

export default function SyncfusionDocx({ userData, planEndpoint }) {
  console.log("SyncfusionDocx", userData)
  const documentEditorContainerRef = useRef(null)

  // Load Syncfusion styles with custom overrides
  useEffect(() => {
    const head = document.head
    const link1 = document.createElement("link")
    link1.rel = "stylesheet"
    link1.href = "https://cdn.syncfusion.com/ej2/23.1.36/material.css"
    link1.id = "syncfusion-style"
    head.appendChild(link1)

    // Add custom CSS overrides for Syncfusion components
    const customStyle = document.createElement("style")
    customStyle.id = "syncfusion-custom-style"
    customStyle.textContent = `
      .e-documenteditor-container .e-toolbar {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
        border-bottom: 2px solid #e5e7eb !important;
        padding: 0.75rem 1rem !important;
      }
      
      .e-documenteditor-container .e-toolbar .e-btn {
        background: white !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 0.5rem !important;
        color: #374151 !important;
        margin: 0 0.25rem !important;
        transition: all 0.3s ease !important;
      }
      
      .e-documenteditor-container .e-toolbar .e-btn:hover {
        background: #f3f4f6 !important;
        border-color: #d1d5db !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      }
      
      .e-documenteditor-container .e-toolbar .e-btn.e-active {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
        color: white !important;
        border-color: #3b82f6 !important;
      }
      
      .e-documenteditor-container {
        border-radius: 0 0 1rem 1rem !important;
        overflow: hidden !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      }
      
      .e-documenteditor {
        background: #fafbfc !important;
      }
      
      .e-documenteditor .e-content {
        background: white !important;
      }
    `
    head.appendChild(customStyle)

    return () => {
      const existing = document.getElementById("syncfusion-style")
      const customExisting = document.getElementById("syncfusion-custom-style")
      if (existing) head.removeChild(existing)
      if (customExisting) head.removeChild(customExisting)
    }
  }, [])

  // Load the document and set zoom to 75%
  useEffect(() => {
    if (documentEditorContainerRef.current && userData.filePath) {
      const editor = documentEditorContainerRef.current

      // Open the document
      editor.documentEditor.open(userData.filePath)

      // Set zoom to 75% after document loads
      setTimeout(() => {
        if (editor.documentEditor) {
          editor.documentEditor.zoomFactor = 0.75
        }
      }, 1000) // Small delay to ensure document is loaded
    }
  }, [userData.filePath])

  // Function to download the document
  const onDownload = () => {
    const editor = documentEditorContainerRef.current
    if (editor) {
      editor.documentEditor.save(`${userData.patientId}_${new Date().getTime()}`, "Docx")
    }
  }

  // Function to save the document as a blob
  const onSave = async () => {
    const editor = documentEditorContainerRef.current
    if (editor) {
      try {
        const documentContent = await editor.documentEditor.saveAsBlob("Docx")

        const formData = new FormData()
        formData.append("document", documentContent, `${userData.patientId}_${new Date().getTime()}.docx`)
        formData.append("patientId", userData.patientId)

        // Send the form data to your server
        const response = await axiosInstance.post(planEndpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        if (response.status === 200) {
          console.log("Document saved successfully:", response.data)
          showSuccessMessage("Document saved successfully!")
        } else {
          console.error("Error saving document:", response.statusText)
          showErrorMessage("Error saving document")
        }
      } catch (error) {
        console.error("Error saving document:", error)
        showErrorMessage("Error saving document: " + error.message)
      }
    }
  }

  // Function to print the document
  const onPrint = () => {
    const editor = documentEditorContainerRef.current
    if (editor) {
      editor.documentEditor.print()
    }
  }

  // Function to toggle zoom between 75% and 100%
  const toggleZoom = () => {
    const editor = documentEditorContainerRef.current
    if (editor) {
      const currentZoom = editor.documentEditor.zoomFactor
      editor.documentEditor.zoomFactor = currentZoom === 0.75 ? 1.0 : 0.75
    }
  }

  const showSuccessMessage = (message) => {
    const toast = document.createElement("div")
    toast.className = styles.successToast
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add(styles.show)
    }, 100)

    setTimeout(() => {
      toast.classList.remove(styles.show)
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 3000)
  }

  const showErrorMessage = (message) => {
    const toast = document.createElement("div")
    toast.className = styles.errorToast
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add(styles.show)
    }, 100)

    setTimeout(() => {
      toast.classList.remove(styles.show)
      setTimeout(() => document.body.removeChild(toast), 4000)
    }, 4000)
  }

  const DocxHeader = () => {
    return (
      <div className={styles.docxHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.documentIcon}>
              <FileText className={styles.documentIconSvg} />
            </div>
            <div className={styles.documentInfo}>
              <h3 className={styles.documentTitle}>{userData.docxName || "Treatment Plan"}</h3>
              <p ></p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button onClick={toggleZoom} className={styles.actionButton} title="Toggle Zoom">
              <Maximize2 className={styles.actionIcon} />
              <span className={styles.actionText}>Zoom</span>
            </button>
            <button onClick={onDownload} className={styles.actionButton} title="Download Document">
              <Download className={styles.actionIcon} />
              <span className={styles.actionText}>Download</span>
            </button>
            <button onClick={onSave} className={styles.actionButton} title="Save Document">
              <Save className={styles.actionIcon} />
              <span className={styles.actionText}>Save</span>
            </button>
            <button onClick={onPrint} className={styles.actionButton} title="Print Document">
              <Printer className={styles.actionIcon} />
              <span className={styles.actionText}>Print</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.docxContainer}>
      <DocxHeader />
      <div className={styles.editorWrapper}>
        <DocumentEditorContainerComponent
          id="container"
          height="1000px"
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
