"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Icon } from "@iconify/react/dist/iconify.js"
import axiosInstance from "@/helper/axiosSetup"
import SyncfusionDocx from "@/components/SyncfusionDocx"

const PatientExamEditor = () => {
  const params = useParams()
  const router = useRouter()
  const patientId = params.patientId

  const [patient, setPatient] = useState(null)
  const [allExams, setAllExams] = useState([]) // Stores all historical exams
  const [selectedExam, setSelectedExam] = useState(null) // The currently viewed exam
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedQuarter, setSelectedQuarter] = useState("")
  const [loading, setLoading] = useState(true) // Initial loading for all data

  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${patientId}`,
        )
        setPatient(response.data)
      } catch (error) {
        console.error("Error fetching patient data:", error)
      }
    }
    fetchPatientData()
  }, [patientId])

  // Fetch all historical exams and set the latest as default
  useEffect(() => {
    const fetchAllHistoricalExams = async () => {
      setLoading(true)
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/exams/${patientId}`, // New route for all exams
        )
        const exams = response.data
        setAllExams(exams)

        if (exams && exams.length > 0) {
          const sortedExams = [...exams].sort((a, b) => {
            if (a.year !== b.year) {
              return b.year - a.year
            }
            return b.quarterOfYear - a.quarterOfYear
          })
          const latestExam = sortedExams[0]
          setSelectedExam(latestExam)
          setSelectedYear(latestExam.year.toString())
          setSelectedQuarter(latestExam.quarterOfYear.toString())
        } else {
          setSelectedExam({ title: "", filePath: "", fileName: "" })
        }
      } catch (error) {
        console.error("Error fetching all historical exams:", error)
        setSelectedExam({ title: "", filePath: "", fileName: "" })
      } finally {
        setLoading(false)
      }
    }
    fetchAllHistoricalExams()
  }, [patientId])

  // Effect to update selected exam when year or quarter changes
  useEffect(() => {
    if (selectedYear && selectedQuarter && allExams.length > 0) {
      const foundExam = allExams.find(
        (e) => e.year.toString() === selectedYear && e.quarterOfYear.toString() === selectedQuarter,
      )
      setSelectedExam(foundExam || { title: "", filePath: "", fileName: "" })
    }
  }, [selectedYear, selectedQuarter, allExams])

  const handleDownloadDocument = () => {
    if (selectedExam && selectedExam.filePath) {
      window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/download-exam/${selectedExam.filePath}`,
        "_blank",
      )
    } else {
      alert("No document available for download.")
    }
  }

  if (!patient || loading) {
    return <div className="text-center py-4">Loading patient and exam data...</div>
  }

  const availableYears = [...new Set(allExams.map((e) => e.year))].sort((a, b) => b - a)
  const availableQuarters = [
    ...new Set(allExams.filter((e) => e.year.toString() === selectedYear).map((e) => e.quarterOfYear)),
  ].sort((a, b) => a - b)

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Special Education Exam - {patient.name}</h5>
                <small className="text-muted">Patient ID: {patient._id}</small>
              </div>
              <div className="d-flex gap-2">
                <button onClick={() => router.back()} className="btn btn-secondary">
                  <Icon icon="majesticons:arrow-left-line" className="me-1" />
                  Back
                </button>
                {selectedExam && selectedExam.filePath && (
                  <button onClick={handleDownloadDocument} className="btn btn-info">
                    <Icon icon="majesticons:download-line" className="me-1" />
                    Download
                  </button>
                )}
              </div>
            </div>

            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="selectYear" className="form-label">
                    Select Year
                  </label>
                  <select
                    id="selectYear"
                    className="form-control"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value)
                      setSelectedQuarter("")
                    }}
                    disabled={loading || allExams.length === 0}
                  >
                    <option value="">Select Year</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="selectQuarter" className="form-label">
                    Select Quarter
                  </label>
                  <select
                    id="selectQuarter"
                    className="form-control"
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    disabled={loading || !selectedYear || availableQuarters.length === 0}
                  >
                    <option value="">Select Quarter</option>
                    {availableQuarters.map((quarter) => (
                      <option key={quarter} value={quarter}>
                        Quarter {quarter}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <label className="form-label">Document Viewer</label>
                  {selectedExam && selectedExam.filePath ? (
                    <SyncfusionDocx
                      userData={{
                        docxId: selectedExam._id,
                        patientId,
                        filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/Special-Education/exam/${selectedExam.filePath}`,
                        fileName: selectedExam.fileName,
                        docxName: `Special-Education-exam-${patient.name}-${selectedYear}-Q${selectedQuarter}.docx`,
                      }}
                      planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/upload-exam`}
                    />
                  ) : (
                    <div
                      className="border rounded bg-light d-flex flex-column justify-content-center align-items-center text-muted"
                      style={{ height: "700px" }}
                    >
                      <Icon icon="majesticons:file-word-line" style={{ fontSize: "4rem", color: "#2b579a" }} />
                      <h4 className="mt-3 mb-2">No Document Available</h4>
                      <p className="text-center">
                        Select a year and quarter to view a historical exam, or upload a new one.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedExam && selectedExam.lastModified && (
                <div className="row mt-3">
                  <div className="col-12">
                    <small className="text-muted">
                      Last modified: {new Date(selectedExam.lastModified).toLocaleString()}
                    </small>
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

export default PatientExamEditor
