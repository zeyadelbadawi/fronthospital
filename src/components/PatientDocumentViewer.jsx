"use client"

import { useEffect, useRef, forwardRef, useCallback, useState, useImperativeHandle } from "react"
import { DocumentEditorContainerComponent, Toolbar, Inject } from "@syncfusion/ej2-react-documenteditor"
import styles from "@/styles/syncfusion-docx.module.css"


const PatientDocumentViewer = forwardRef(
  ({ filePath,  }, ref) => {
    console.log("filePath", filePath)
    const documentEditorContainerRef = useRef(null)
    const [isLoading, setIsLoading] = useState (true)


    // Load Syncfusion styles
    useEffect(() => {
      const head = document.head
      const link1 = document.createElement("link")
      link1.rel = "stylesheet"
      link1.href = "https://cdn.syncfusion.com/ej2/23.1.36/material.css"
      link1.id = "syncfusion-style"
        head.appendChild(link1)

            // Add custom CSS for read-only mode and hide properties panel
    const customStyle = document.createElement("style")
    customStyle.id = "syncfusion-custom-style"
    customStyle.textContent = `
      .e-documenteditor-container .e-toolbar {
        display: none !important;
      }
      .e-de-ctn-properties,
      .e-de-ctn-properties-pane,
      .e-properties-panel,
      .e-de-properties-pane,
      .e-de-prop-pane,
      .e-de-ctn-prop-pane {
        display: none !important;
        width: 0 !important;
        visibility: hidden !important;
      }
      .e-de-cxt-menu {
        display: none !important;
      }
      .e-de-resize-handle {
        display: none !important;
      }
      .e-de-cursor-line {
        display: none !important;
      }
  
      .e-de-container-main {
        width: 100% !important;
      }
      .e-de-main-container {
        width: 100% !important;
      }
      .e-de-editor-container {
        width: 100% !important;
      }
      /* Hide any right-side panels or properties */
      .e-de-ctn .e-de-ctn-properties,
      .e-de-ctn .e-de-properties-pane,
      .e-de-ctn .e-properties-panel {
        display: none !important;
      }
      /* Ensure document takes full width */
      .e-de-ctn .e-de-main-container .e-de-editor-container {
        width: 100% !important;
        margin-right: 0 !important;
      }
    `
    head.appendChild(customStyle)
      return () => {
        const existing = document.getElementById("syncfusion-style")
        if (existing) head.removeChild(existing)
      }
    }, [])

    // Load the document when the component mounts
    useEffect(() => {
      if (documentEditorContainerRef.current) {
        documentEditorContainerRef.current.documentEditor.open(filePath)
      }
    }, [filePath])

 const handleDocumentChange = useCallback(() => {
    console.log("Document changed - setting read-only mode")
    if (documentEditorContainerRef.current) {
      try {
        // Set read-only mode as per Syncfusion documentation
        documentEditorContainerRef.current.documentEditor.isReadOnly = true
        setIsLoading(false)
        console.log("Document set to read-only mode successfully")
      } catch (err) {
        console.error("Error setting read-only mode:", err)
        setIsLoading(false)
      }
    }
  }, [])


    const handleCreated = useCallback(() => {
    console.log("Document editor created")
    if (documentEditorContainerRef.current && filePath) {
      try {
        // Hide properties pane programmatically
        if (documentEditorContainerRef.current.documentEditor) {
          documentEditorContainerRef.current.documentEditor.showPropertiesPane = false
        }
        documentEditorContainerRef.current.documentEditor.open(filePath)
      } catch (error) {
        console.error("Error opening document:", error)
        setIsLoading(false)
      }
    }
  }, [filePath])


    return (
      <div className="h-full">
       {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading document...</p>
        </div>
      )}
       
        <DocumentEditorContainerComponent
          id="container"
            height="1000px"
            width="auto"
          enableToolbar={false}
            ref={documentEditorContainerRef}
          autoResizeOnVisibilityChange={true}
          restrictEditing={false}
          locale="en-US"
          serviceUrl={process.env.NEXT_PUBLIC_SYNCFUSION_SERVICE_URL}
                  documentChange={handleDocumentChange}
        created={handleCreated}

        >
          <Inject services={[Toolbar]} />
        </DocumentEditorContainerComponent>
      </div>
    )
  },
)

PatientDocumentViewer.displayName = "PatientPLanDocx"

export default PatientDocumentViewer
