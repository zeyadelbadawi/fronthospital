"use client";
// Todo :Add more component in toolbar of ej2-react-documenteditor
import { useEffect, useRef } from "react";
import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
} from "@syncfusion/ej2-react-documenteditor";
import axiosInstance from "@/helper/axiosSetup";
export default function SyncfusionDocx({ userData, planEndpoint, email }) {
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

  // Load the document when the component mounts
  useEffect(() => {
    if (documentEditorContainerRef.current && userData.filePath) {
      documentEditorContainerRef.current.documentEditor.open(userData.filePath);
    }
  }, [userData.filePath]);



  const sendEmail = async (filePath) => {
    try {
      
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/email/send-email`,
        {
          to: userData.to,
          filePath,
          subject: userData.title || "School Plan Document",
          text: userData.message || "Please find the attached school plan document.",
        }
      );
      
    } catch (error) {
      console.error("Error while sending email:", error);
    }
  };

  const sendNotification = async () => {
    try {
      let response;
      
      if (userData.isList) {
        response = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_API_URL}/notification/send`,
          {
            receiverIds: userData.doctorIds,
            rule: userData.rule,
            title: userData.title || "School Plan Updated",
            message: userData.message || "A school plan has been updated.",
          }
        );
      } else {
        response = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_API_URL}/notification/send`,
          {
            receiverId: userData.patientId,
            rule: userData.rule,
            title: userData.title || "School Plan Updated",
            message: userData.message || "Your school plan has been updated.",
          }
        );
      }
      
    } catch (error) {
      console.error("Error while sending notification:", error);
    }
  };


  

  return (
    <div>
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
