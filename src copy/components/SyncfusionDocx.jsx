"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { DocumentEditorContainerComponent, Toolbar, Inject } from "@syncfusion/ej2-react-documenteditor"
import { Download, Save, Printer, FileText, Maximize2 } from "lucide-react"
import styles from "@/styles/syncfusion-docx.module.css"

const SyncfusionDocx = forwardRef(
  ({ documentUrl, docxName, patientName, onSaveContent, onDownloadContent, onEditorReady }, ref) => {
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

    useEffect(() => {
      if (documentEditorContainerRef.current && documentUrl) {
        const editor = documentEditorContainerRef.current
        editor.documentEditor.open(documentUrl)

        setTimeout(() => {
          if (editor.documentEditor) {
            editor.documentEditor.zoomFactor = 1
          }
        }, 1000) // Small delay to ensure document is loaded

        if (onEditorReady) {
          onEditorReady(editor.documentEditor)
        }
      }
    }, [documentUrl, onEditorReady]) // Depend on documentUrl and onEditorReady

    // Function to download the document
    const handleDownload = () => {
      const editor = documentEditorContainerRef.current
      if (editor && onDownloadContent) {
        editor.documentEditor
          .saveAsBlob("Docx")
          .then((blob) => {
            onDownloadContent(blob)
          })
          .catch((err) => {
            console.error("Error generating blob for download:", err)
            showErrorMessage("Error preparing document for download.")
          })
      } else if (editor && docxName) {
        editor.documentEditor.save(docxName || "document", "Docx")
      } else {
        showErrorMessage("Cannot download: Document editor not ready or download handler missing.")
      }
    }

    // Function to save the document as a blob
    const handleSave = async () => {
      const editor = documentEditorContainerRef.current
      if (editor && onSaveContent) {
        try {
          // Changed to save as Docx Blob instead of SFDT string
          const documentContentBlob = await editor.documentEditor.saveAsBlob("Docx")
          await onSaveContent(documentContentBlob) // Pass the Blob to the parent handler
          showSuccessMessage("Document saved successfully!")
        } catch (error) {
          console.error("Error saving document:", error)
          showErrorMessage("Error saving document: " + (error.message || "Unknown error"))
        }
      } else {
        showErrorMessage("Cannot save: Document editor not ready or save handler missing.")
      }
    }

    // Function to print the document
    const onPrint = () => {
      const editor = documentEditorContainerRef.current
      if (editor) {
        editor.documentEditor.print()
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


    useImperativeHandle(ref, () => ({
      onSave: handleSave,
      onDownload: handleDownload,
    }))

    return (
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
    )
  },
)

SyncfusionDocx.displayName = "SyncfusionDocx"

export default SyncfusionDocx
