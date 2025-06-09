"use client";
import { useState, useEffect } from "react";
import axiosInstance from "../helper/axiosSetup";
import { useRouter } from "next/navigation";

const DoctorDashboard = () => {
  const [evaluations, setEvaluations] = useState([]);      // all evaluations
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch all evaluations (optionally still searching by name)
  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/authentication/allevaluations', {
          params: { search },
        });
        setEvaluations(response.data.evaluations);
      } catch (err) {
        console.error("Error fetching evaluations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [search]);

  const handleEdit = (evaluation) => {
    router.push(`/evaluate?id=${evaluation._id}`);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center gap-3">
        <input
          type="text"
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Name"
        />
      </div>
      <div className="card-body p-24">
        <div className="table-responsive">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th className="text-center">Student Name</th>
                <th className="text-center">Program Type</th>
                <th className="text-center">Status</th>
                <th className="text-center">payment</th>
                <th className="text-center">Last Session Date</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center">Loading...</td>
                </tr>
              ) : (
                evaluations.map((evaluation, idx) => (
                  <tr key={evaluation._id}>
                    <td className="text-center">{idx + 1}</td>
                    <td className="text-center">{evaluation.patient?.name}</td>
                    <td className="text-center">
                      {evaluation.type === "full_package_evaluation" ? "Full Package Evaluation"
                        : evaluation.type === "single_session" ? "Single Session"
                        : evaluation.type === "school_evaluation" ? "School Evaluation"
                        : evaluation.type === "free_medical_consultation" ? "Free Medical Consultation"
                        : "Unknown Type"}
                    </td>
                    <td className="text-center">
                      <span className={
                        evaluation.done
                          ? "bg-success-focus text-success-600 border border-success-main px-24 py-4 radius-4 fw-medium text-sm"
                          : "bg-warning text-gray-500 border border-gray-300 px-24 py-4 radius-4 fw-medium text-sm"
                      }>
                        {evaluation.done ? "Completed" : "Uncompleted"}
                      </span>
                    </td>
                    <td className="text-center">{evaluation.status || "No Service Selected"}</td>
                    <td className="text-center">
                      {evaluation.latestSessionDate
                        ? new Date(evaluation.latestSessionDate).toLocaleDateString()
                        : "5/9/2025"}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleEdit(evaluation)}
                      >
                        Edit Evaluation & Sessions
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
