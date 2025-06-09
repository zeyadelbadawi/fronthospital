"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Icon } from "@iconify/react/dist/iconify.js"
import axiosInstance from "@/helper/axiosSetup"

const PatientPlanEditor = () => {
  const params = useParams()
  const router = useRouter()
  const patientId = params.patientId

  const [patient, setPatient] = useState(null)
  const [plan, setPlan] = useState({
    title: "",
    filePath: "",
    fileName: "",
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchPatientData()
    fetchExistingPlan()
  }, [patientId])

  const fetchPatientData = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${patientId}`)
      setPatient(response.data)
    } catch (error) {
      console.error("Error fetching patient data:", error)
    }
  }

  const fetchExistingPlan = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/speech-plan/${patientId}`)
      if (response.data) {
        setPlan(response.data)
      }
    } catch (error) {
      console.error("No existing plan found or error:", error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const planData = {
        ...plan,
        patient: patientId,
      }

      let response
      if (plan._id) {
        response = await axiosInstance.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/speech-plan/${plan._id}`, planData)
      } else {
        response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/speech-plan`, planData)
      }

      setPlan(response.data)
      alert("Plan saved successfully!")
    } catch (error) {
      console.error("Error saving plan:", error)
      alert("Error saving plan: " + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
    ]

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a Word document (.doc or .docx)")
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    const formData = new FormData()
    formData.append("document", file)
    formData.append("patientId", patientId)
    formData.append("documentType", "plan")

    try {
      setLoading(true)
      setUploadProgress(0)

      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/upload-word-document`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        },
      })

      setPlan((prev) => ({
        ...prev,
        title: response.data.title || file.name,
        filePath: response.data.filePath,
        fileName: response.data.fileName,
      }))

      alert("Document uploaded successfully!")
    } catch (error) {
      console.error("Error uploading document:", error)
      alert("Error uploading document: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
      setUploadProgress(0)
      event.target.value = ""
    }
  }

  const handleDownloadDocument = () => {
    if (plan.filePath) {
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/authentication/download-document/${plan.filePath}`, "_blank")
    }
  }

  const getDocumentViewerUrl = () => {
    if (!plan.filePath) return null

    const documentUrl = `${process.env.NEXT_PUBLIC_API_URL}/authentication/view-document/${plan.filePath}`

    // Use Microsoft Office Online Viewer
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`
  }

  const getGoogleDocsViewerUrl = () => {
    if (!plan.filePath) return null

    const documentUrl = `${process.env.NEXT_PUBLIC_API_URL}/authentication/view-document/${plan.filePath}`
    return `https://docs.google.com/gview?url=${encodeURIComponent(documentUrl)}&embedded=true`
  }

  if (!patient) {
    return <div className="text-center py-4">Loading patient data...</div>
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Speech Plan - {patient.name}</h5>
                <small className="text-muted">Patient ID: {patient._id}</small>
              </div>
              <div className="d-flex gap-2">
                <button onClick={() => router.back()} className="btn btn-secondary">
                  <Icon icon="majesticons:arrow-left-line" className="me-1" />
                  Back
                </button>
                {plan.filePath && (
                  <button onClick={handleDownloadDocument} className="btn btn-info">
                    <Icon icon="majesticons:download-line" className="me-1" />
                    Download
                  </button>
                )}
                <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                  {saving ? "Saving..." : "Save Plan"}
                </button>
              </div>
            </div>

            <div className="card-body">
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label">Upload Word Document</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                  {loading && (
                    <div className="mt-2">
                      <small className="text-info">Uploading document... {uploadProgress}%</small>
                      <div className="progress mt-1" style={{ height: "4px" }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}
                  <small className="text-muted">Upload a Word document to view it in the document viewer below</small>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label">Document Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={plan.title}
                    onChange={(e) => setPlan((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter document title..."
                  />
                </div>
              </div>

              {/* Document Viewer */}
              <div className="row">
                <div className="col-12">
                  <label className="form-label">Document Viewer</label>

                  {plan.filePath ? (
                    <div className="border rounded bg-light" style={{ height: "700px", overflow: "hidden" }}>
                      <div className="d-flex justify-content-between align-items-center p-2 bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                          <Icon icon="majesticons:file-word-line" className="text-primary" />
                          <span className="small fw-medium">{plan.fileName || "Document"}</span>
                        </div>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => {
                              const iframe = document.getElementById("documentViewer")
                              iframe.src = getGoogleDocsViewerUrl()
                            }}
                            title="Google Docs Viewer"
                          >
                            <Icon icon="majesticons:google-line" />
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => {
                              const iframe = document.getElementById("documentViewer")
                              iframe.src = getDocumentViewerUrl()
                            }}
                            title="Microsoft Office Viewer"
                          >
                            <Icon icon="majesticons:microsoft-line" />
                          </button>
                          <button className="btn btn-outline-primary" onClick={handleDownloadDocument} title="Download">
                            <Icon icon="majesticons:download-line" />
                          </button>
                        </div>
                      </div>

                      <iframe
                        id="documentViewer"
                        src={getGoogleDocsViewerUrl()}
                        style={{
                          width: "100%",
                          height: "calc(100% - 50px)",
                          border: "none",
                        }}
                        title="Document Viewer"
                      />
                    </div>
                  ) : (
                    <div
                      className="border rounded bg-light d-flex flex-column justify-content-center align-items-center text-muted"
                      style={{ height: "700px" }}
                    >
                      <Icon icon="majesticons:file-word-line" style={{ fontSize: "4rem", color: "#2b579a" }} />
                      <h4 className="mt-3 mb-2">No Document Uploaded</h4>
                      <p className="text-center">
                        Upload a Word document above to view it in the document viewer
                        <br />
                        The document will be displayed exactly as it appears in Microsoft Word
                      </p>
                      <div className="mt-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Icon icon="majesticons:check-circle-line" className="text-success" />
                          <small>Supports .doc and .docx files</small>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Icon icon="majesticons:check-circle-line" className="text-success" />
                          <small>Google Docs and Microsoft Office viewers</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Icon icon="majesticons:check-circle-line" className="text-success" />
                          <small>Download and view original document</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {plan.lastModified && (
                <div className="row mt-3">
                  <div className="col-12">
                    <small className="text-muted">Last modified: {new Date(plan.lastModified).toLocaleString()}</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientPlanEditor
