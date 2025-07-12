"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Icon } from "@iconify/react/dist/iconify.js"
import axiosInstance from "@/helper/axiosSetup"

import SyncfusionDocx from "@/components/SyncfusionDocx"

const PatientPlanEditor = () => {
  const params = useParams()
  const router = useRouter()
  const patientId = params.patientId

  const [patient, setPatient] = useState(null)
  const [allPlans, setAllPlans] = useState([]) // Stores all historical plans
  const [selectedPlan, setSelectedPlan] = useState(null) // The currently viewed plan
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
        // Consider adding a toast notification for errors
      }
    }
    fetchPatientData()
  }, [patientId])

  // Fetch all historical plans and set the latest as default
  useEffect(() => {
    const fetchAllHistoricalPlans = async () => {
      setLoading(true)
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/plans/${patientId}`, // New route for all plans
        )
        const plans = response.data
        setAllPlans(plans)

        if (plans && plans.length > 0) {
          // Sort plans to find the latest one by year and quarter
          const sortedPlans = [...plans].sort((a, b) => {
            if (a.year !== b.year) {
              return b.year - a.year // Descending year
            }
            return b.quarterOfYear - a.quarterOfYear // Descending quarter
          })
          const latestPlan = sortedPlans[0]
          setSelectedPlan(latestPlan)
          setSelectedYear(latestPlan.year.toString())
          setSelectedQuarter(latestPlan.quarterOfYear.toString())
        } else {
          setSelectedPlan({ title: "", filePath: "", fileName: "" }) // No plans found, set empty
        }
      } catch (error) {
        console.error("Error fetching all historical plans:", error)
        setSelectedPlan({ title: "", filePath: "", fileName: "" }) // Fallback to empty
        // Consider adding a toast notification for errors
      } finally {
        setLoading(false)
      }
    }
    fetchAllHistoricalPlans()
  }, [patientId])

  // Effect to update selected plan when year or quarter changes
  useEffect(() => {
    if (selectedYear && selectedQuarter && allPlans.length > 0) {
      const foundPlan = allPlans.find(
        (p) => p.year.toString() === selectedYear && p.quarterOfYear.toString() === selectedQuarter,
      )
      setSelectedPlan(foundPlan || { title: "", filePath: "", fileName: "" })
    }
  }, [selectedYear, selectedQuarter, allPlans])

  const handleDownloadDocument = () => {
    if (selectedPlan && selectedPlan.filePath) {
      window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/download-plan/${selectedPlan.filePath}`,
        "_blank",
      )
    } else {
      alert("No document available for download.")
    }
  }

  if (!patient || loading) {
    return <div className="text-center py-4">Loading patient and plan data...</div>
  }

  const availableYears = [...new Set(allPlans.map((p) => p.year))].sort((a, b) => b - a)
  const availableQuarters = [
    ...new Set(allPlans.filter((p) => p.year.toString() === selectedYear).map((p) => p.quarterOfYear)),
  ].sort((a, b) => a - b)

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Special Education Plan - {patient.name}</h5>
                <small className="text-muted">Patient ID: {patient._id}</small>
              </div>
              <div className="d-flex gap-2">
                <button onClick={() => router.back()} className="btn btn-secondary">
                  <Icon icon="majesticons:arrow-left-line" className="me-1" />
                  Back
                </button>
                {selectedPlan && selectedPlan.filePath && (
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
                      setSelectedQuarter("") // Reset quarter when year changes
                    }}
                    disabled={loading || allPlans.length === 0}
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
                  {selectedPlan && selectedPlan.filePath ? (
                    <SyncfusionDocx
                      userData={{
                        docxId: selectedPlan._id,
                        patientId,
                        filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/Special-Education/plan/${selectedPlan.filePath}`,
                        fileName: selectedPlan.fileName,
                        docxName: `Special-Education-plan-${patient.name}-${selectedYear}-Q${selectedQuarter}.docx`,
                      }}
                      planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/SpecialEducation/upload-plan`}
                    />
                  ) : (
                    <div
                      className="border rounded bg-light d-flex flex-column justify-content-center align-items-center text-muted"
                      style={{ height: "700px" }}
                    >
                      <Icon icon="majesticons:file-word-line" style={{ fontSize: "4rem", color: "#2b579a" }} />
                      <h4 className="mt-3 mb-2">No Document Available</h4>
                      <p className="text-center">
                        Select a year and quarter to view a historical plan, or upload a new one.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedPlan && selectedPlan.lastModified && (
                <div className="row mt-3">
                  <div className="col-12">
                    <small className="text-muted">
                      Last modified: {new Date(selectedPlan.lastModified).toLocaleString()}
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

export default PatientPlanEditor
