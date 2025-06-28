"use client";
// Todo :Add more component in toolbar of ej2-react-documenteditor
import { useEffect, useRef } from "react";
import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
} from "@syncfusion/ej2-react-documenteditor";
import axiosInstance from "@/helper/axiosSetup";
export default function SyncfusionDocx({ userData, planEndpoint }) {
  console.log("SyncfusionDocx", userData);
  const documentEditorContainerRef = useRef(null);

  // Load Syncfusion styles
  useEffect(() => {
    const head = document.head;
    const link1 = document.createElement("link");
    link1.rel = "stylesheet";
    link1.href = "https://cdn.syncfusion.com/ej2/23.1.36/material.css";
    link1.id = "syncfusion-style";

    head.appendChild(link1);

    return () => {
      const existing = document.getElementById("syncfusion-style");
      if (existing) head.removeChild(existing);
    };
  }, []);

  /*  const loadDocument = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/physical-therapy/view-plan/${userData.docxId}/${userData.filePath}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to load document");
      }

      // Convert the response to a Blob
      const documentBlob = await response.blob();

      // Load the document content into the DocumentEditor
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        const arrayBuffer = fileReader.result;
        // Open the document content into DocumentEditor
      };
      fileReader.readAsArrayBuffer(documentBlob); // Read the Blob as ArrayBuffer
    } catch (error) {
      console.error("Error loading document:", error);
    }
  }; */

  // Load the document when the component mounts
  useEffect(() => {
    if (documentEditorContainerRef.current) {
      documentEditorContainerRef.current.documentEditor.open(userData.filePath);
    }
  }, [userData.filePath]);

  // Function to download the document
  const onDownload = () => {
    const editor = documentEditorContainerRef.current;
    if (editor) {
      editor.documentEditor.save(
        `${userData.patientId + new Date().getSeconds()}`,
        "Docx"
      );
    }
  };

  // Function to save the document as a blob
  const onSave = async () => {
    const editor = documentEditorContainerRef.current;
    if (editor) {
      const documentContent = await editor.documentEditor.saveAsBlob("Docx");

      /* // Check if the document is empty
      const isEmpty = documentContent.size === 0;
      if (isEmpty) {
        alert("Cannot save an empty document");
        return;
      } */

      const formData = new FormData();
      formData.append(
        "document",
        documentContent,
        `${userData.patientId + new Date().getSeconds()}.docx`
      );
      formData.append("patientId", userData.patientId);

      // Send the form data to your server
      const response = await axiosInstance.post(planEndpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Handle the response as needed
      if (response.status === 200) {
        console.log("Document saved successfully:", response.data);
      } else {
        console.error("Error saving document:", response.statusText);
      }

      /* const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${userData.patientId + new Date().getSeconds()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); */
    }
  };

  const onChange = () => {};

  const DocxHeader = () => {
    return (
      <div className="bg-primary text-white py-2 px-4 d-flex justify-content-between align-items-center">
        <span className="ms-5">{userData.docxName}</span>
        <div className="ms-5 d-flex">
          <button
            onClick={onDownload}
            className="btn text-white d-flex align-items-center me-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="bi bi-download h4 bg-white"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 0a1 1 0 0 1 1 1v10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-5 5a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414L7 11.586V1a1 1 0 0 1 1-1z"
              />
            </svg>
            <span className="d-none d-sm-inline ms-2">Download</span>
          </button>
          <button
            onClick={onSave}
            className="btn text-white d-flex align-items-center me-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="bi bi-download h4 bg-white"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 0a1 1 0 0 1 1 1v10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-5 5a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414L7 11.586V1a1 1 0 0 1 1-1z"
              />
            </svg>
            <span className="d-none d-sm-inline ms-2">Save</span>
          </button>
          <button className="btn text-white d-flex align-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="bi bi-printer h4 bg-white"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M4.5 1a1 1 0 0 1 1 1V3h5V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V8h-5v5a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4h3V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-2v3a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V8h-3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V2a1 1 0 0 1 1-1h1z"
              />
            </svg>
            <span className="d-none d-sm-inline ms-2">Print</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <DocxHeader />
      <DocumentEditorContainerComponent
        id="container"
        height="100vh"
        enableToolbar={true}
        ref={documentEditorContainerRef}
        autoResizeOnVisibilityChange={true}
        locale="en-US"
        serviceUrl={process.env.NEXT_PUBLIC_SYNCFUSION_SERVICE_URL}
      >
        <Inject services={[Toolbar]} />
      </DocumentEditorContainerComponent>
    </div>
  );
}
