'use client';
import { useEffect, useState } from 'react';
import axiosInstance from '@/helper/axiosSetup';
import { Icon } from '@iconify/react';
import PaymentEditModal from '@/components/PaymentEditModal';

const PaymentEdit = () => {
  const [payments, setPayments] = useState([]);
  const [filterType, setFilterType] = useState('day');
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axiosInstance.get('/authentication/payments');
        setPayments(res.data);
      } catch (err) {
        console.error('Error fetching payments:', err);
      }
    };
    fetchPayments();
  }, []);

  const filterByDate = (payment) => {
    if (!filterType || !filterDate) return true;
    const paymentDate = new Date(payment.date);
    const selected = new Date(filterDate);

    switch (filterType) {
      case 'day':
        return paymentDate.toDateString() === selected.toDateString();
      case 'month':
        return (
          paymentDate.getFullYear() === selected.getFullYear() &&
          paymentDate.getMonth() === selected.getMonth()
        );
      case 'year':
        return paymentDate.getFullYear() === parseInt(filterDate);
      default:
        return true;
    }
  };

  const renderDateInput = () => {
    switch (filterType) {
      case 'day':
        return (
          <input
            type="date"
            className="form-control form-control-sm"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        );
      case 'month':
        return (
          <input
            type="month"
            className="form-control form-control-sm"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        );
      case 'year':
        return (
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Enter year"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  const filteredPayments = payments
    .filter(filterByDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date DESC

  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="col-lg-12">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="card-title mb-0">Edit Payment Records</h5>
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select form-select-sm"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterDate('');
              }}
            >
              <option value="day">By Day</option>
              <option value="month">By Month</option>
              <option value="year">By Year</option>
            </select>
            {renderDateInput()}
          </div>
        </div>

        <div className="card-body">
          <div className="mb-3 fw-semibold text-primary">
            Total Amount: {totalAmount.toLocaleString()} EGP
          </div>

          <div className="table-responsive">
            <table className="table bordered-table mb-0">
              <thead className="custom-black-header">
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient Name</th>
                  <th className="text-center">Type</th>
                  <th className="text-center">Method</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th className="text-center">Status</th>
                  <th>Note</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="custom-row-border">
                    <td>#{p._id.slice(-6).toUpperCase()}</td>
                    <td className="text-center">{p.patient?.name || 'Unknown'}</td>
                    <td className="text-center">{p.type}</td>
                    <td className="text-center">{p.method}</td>
                    <td>{p.price} EGP</td>
                    <td>{new Date(p.date).toLocaleDateString()}</td>
                    <td className="text-center">
                      <span className={`px-24 py-4 rounded-pill fw-medium text-sm ${
                        p.status === 'Completed'
                          ? 'bg-success-focus text-success-main'
                          : 'bg-warning-focus text-warning-main'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.note}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-light me-1"
                        onClick={() => {
                          setSelectedPayment(p);
                          setShowEditModal(true);
                        }}
                      >
                        <Icon icon="lucide:edit" />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Delete this item?')) {
                            try {
                              await axiosInstance.delete(`/authentication/payments/${p._id}`);
                              setPayments((prev) =>
                                prev.filter((item) => item._id !== p._id)
                              );
                            } catch (err) {
                              console.error('Delete failed:', err);
                              alert('Failed to delete payment.');
                            }
                          }
                        }}
                        className="btn btn-sm btn-light text-danger"
                      >
                        <Icon icon="mingcute:delete-2-line" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">No payments found.</td>
                  </tr>
                )}
              </tbody>

              <style jsx>{`
                .custom-black-header th {
                  border-right: 1px solid gray !important;
                  border-top: 2px solid gray !important;
                  border-bottom: 2px solid gray !important;
                }
                .custom-black-header tr {
                  border-bottom: 2px solid gray !important;
                }
                .custom-row-border td {
                  border-right: 1px solid gray !important;
                  border-top: 1px solid gray !important;
                  border-bottom: 1px solid gray !important;
                }
              `}</style>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedPayment && (
        <PaymentEditModal
          show={showEditModal}
          onHide={() => {
            setSelectedPayment(null);
            setShowEditModal(false);
          }}
          payment={selectedPayment}
          onUpdate={(updated) => {
            setPayments((prev) =>
              prev.map((p) => (p._id === updated._id ? updated : p))
            );
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PaymentEdit;
