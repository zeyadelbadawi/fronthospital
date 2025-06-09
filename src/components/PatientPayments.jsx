'use client';
import { useEffect, useState } from 'react';
import axios from '@/helper/axiosSetup';
import 'bootstrap/dist/css/bootstrap.min.css';

const PatientPayments = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [payments, setPayments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('/authentication/patients?limit=100');
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error('Failed to fetch patients', err);
      }
    };
    fetchPatients();
  }, []);

  const fetchDataForPatient = async (patientId) => {
    if (!patientId) return;
    setLoading(true);

    try {
      const paymentRes = await axios.get('/authentication/payments');
      const filtered = (paymentRes.data || []).filter(p => p.patient?._id === patientId);

      const sessionRes = await axios.get(`/authentication/sessions/${patientId}`);
      const pendingSessions = (sessionRes.data || []).filter(s => s.status === 'Pending');

      setPayments(filtered);
      setSessions(pendingSessions);
    } catch (err) {
      console.error('Failed to load payment/session data', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = () => patients.find(p => p._id === selectedPatientId);

  const renderTable = ({ title, color, data, columns }) => (
    <div className="col-lg-6">
      <div className="card h-100 border-0 shadow-sm rounded-4 p-3">
        <h6 className={`fw-bold mb-3 text-${color}`}>{title}</h6>
        <div className="table-responsive">
          <table className="table table-sm table-bordered align-middle">
            <thead className="table-light">
              <tr>
                {columns.map((col, i) => (
                  <th key={i}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data : (
                <tr>
                  <td colSpan={columns.length} className="text-center text-muted">
                    No {title.toLowerCase()}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const completedRows = payments.map((p) => (
    <tr key={p._id}>
      <td>#{p._id.slice(-6).toUpperCase()}</td>
      <td>{p.type}</td>
      <td>{p.method}</td>
      <td>{p.price} EGP</td>
      <td>{new Date(p.date).toLocaleDateString()}</td>
      <td><span className="badge bg-success">Completed</span></td>
      <td>{p.note}</td>
    </tr>
  ));

  const pendingRows = sessions.map((s, i) => (
    <tr key={`pending-${s._id || i}`}>
      <td>Pending-{i + 1}</td>
      <td>session</td>
      <td>pending</td>
      <td>{s.price || 0} EGP</td>
      <td>{new Date(s.date).toLocaleDateString()}</td>
      <td><span className="badge bg-warning text-dark">Pending</span></td>
    </tr>
  ));

  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <select
            className="form-select form-select-sm w-auto"
            value={selectedPatientId}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedPatientId(value);
              fetchDataForPatient(value);
            }}
          >
            <option value="">Select Patient</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {loading && <p className="text-muted">Loading patient data...</p>}

        {!loading && selectedPatientId && (
          <>
            <div className="row mb-4 text-center">
              <div className="col-md-6 mb-2">
                <div className="fs-5 fw-semibold text-success">
                  Total Paid: {payments.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()} EGP
                </div>
              </div>
              <div className="col-md-6 mb-2">
                <div className="fs-5 fw-semibold text-warning">
                  Total Pending: {sessions.reduce((sum, s) => sum + (s.price || 0), 0).toLocaleString()} EGP
                </div>
              </div>
            </div>

            <div className="row g-4">
              {renderTable({
                title: 'Pending Payments',
                color: 'warning',
                data: pendingRows,
                columns: ['ID', 'Type', 'Method', 'Amount', 'Date', 'Status']
              })}
              {renderTable({
                title: 'Completed Payments',
                color: 'success',
                data: completedRows,
                columns: ['Invoice ID', 'Type', 'Method', 'Amount', 'Date', 'Status', 'Note']
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientPayments;
