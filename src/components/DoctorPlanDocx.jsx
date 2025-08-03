"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { DocumentEditorContainerComponent, Toolbar, Inject } from "@syncfusion/ej2-react-documenteditor"
import axiosInstance from "@/helper/axiosSetup"

const DoctorPLanDocx = forwardRef(
  ({ filePath, doctorId, departmentId, documentId, fileName, quarterOfYear, year }, ref) => {
    console.log("filePath", filePath)
    const documentEditorContainerRef = useRef(null)

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

    // Load the document when the component mounts
    useEffect(() => {
      if (documentEditorContainerRef.current) {
        documentEditorContainerRef.current.documentEditor.open(filePath)
      }
    }, [filePath])

    // Function to download the document
    const onDownload = () => {
      const editor = documentEditorContainerRef.current
      if (editor && fileName) {
        editor.documentEditor.save(`${fileName.split(".")[0] || "doctor_plan"}_${doctorId}_${departmentId}`, "Docx")
      } else {
        console.warn("Cannot download: Document editor not ready or fileName is missing.")
      }
    }

    // Function to save the document as a blob
    const onSave = async () => {
      const editor = documentEditorContainerRef.current
      if (editor && documentId) {
        try {
          const documentContent = await editor.documentEditor.saveAsBlob("Docx")
          const formData = new FormData()
          formData.append(
            "document",
            documentContent,
            fileName || `${doctorId}_${departmentId}_${new Date().getTime()}.docx`,
          )
          formData.append("doctorId", doctorId)
          formData.append("departmentId", departmentId)
          formData.append("quarterOfYear", quarterOfYear)
          formData.append("year", year)
          // Send the form data to your server to update the existing document
          const response = await axiosInstance.put(
            `${process.env.NEXT_PUBLIC_API_URL}/doctorFile/update-plan/${documentId}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          )
          // Handle the response as needed
          if (response.status === 200) {
            console.log("Document saved successfully:", response.data)
            // alert("Document saved successfully!") // تم استبدالها بـ toast
          } else {
            console.error("Failed to save document:", response.data)
            // alert("Failed to save document.") // تم استبدالها بـ toast
          }
        } catch (error) {
          console.error("Error saving document:", error.response || error)
          // alert("Error saving document. Please try again.") // تم استبدالها بـ toast
          throw error // إعادة رمي الخطأ ليتم التعامل معه في المكون الأب
        }
      } else {
        console.warn("Cannot save: Document editor not ready or documentId is missing.")
        throw new Error("Document editor not ready or documentId is missing.") // رمي خطأ ليتم التعامل معه في المكون الأب
      }
    }

    // استخدام useImperativeHandle لتعريض الوظائف إلى المكون الأب
    useImperativeHandle(ref, () => ({
      onSave: onSave,
      onDownload: onDownload,
    }))

    return (
      <div className="h-full">
        <DocumentEditorContainerComponent
          id="container"
            height="1000px"
            width="auto"
          enableToolbar={true}
          ref={documentEditorContainerRef}
          autoResizeOnVisibilityChange={true}
          locale="en-US"
          serviceUrl={process.env.NEXT_PUBLIC_SYNCFUSION_SERVICE_URL}
          toolbarItems={[
            "Undo",
            "Redo",
            "Image",
            "Table",
            "Hyperlink",
            "Bookmark",
            "TableOfContents",
            "Header",
            "Footer",
            "PageSetup",
            "PageNumber",
            "Break",
            "InsertFootnote",
            "InsertEndnote",
            "Find",
            "Comments",
            "TrackChanges",
            "RestrictEditing",
            "FormFields",
            "UpdateFields",
          ]}
        >
          <Inject services={[Toolbar]} />
        </DocumentEditorContainerComponent>
      </div>
    )
  },
)

DoctorPLanDocx.displayName = "DoctorPLanDocx"

export default DoctorPLanDocx
