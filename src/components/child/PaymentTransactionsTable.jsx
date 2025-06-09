'use client';
import { useEffect, useState } from 'react';
import axios from '@/helper/axiosSetup';

const PaymentTransactionsTable = () => {
  const [payments, setPayments] = useState([]);
  const [filterType, setFilterType] = useState('day');
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get('/authentication/payments');
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

  const filteredPayments = payments.filter(filterByDate);
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + (payment.price || 0), 0);

  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      alert('No payments to export.');
      return;
    }

    const confirmMsg = `Are you sure you want to export all payments ${
      filterType ? `for ${filterType} "${filterDate}"` : ''
    }?`;

    if (!window.confirm(confirmMsg)) return;

    const header = ['Invoice ID', 'Patient Name', 'Type', 'Method', 'Amount', 'Date', 'Status', 'Note'];
    const rows = filteredPayments.map((p) => [
      `#${p._id.slice(-6).toUpperCase()}`,
      p.patient?.name || 'Unknown',
      p.type,
      p.method,
      `${p.price} EGP`,
      new Date(p.date).toLocaleDateString(),
      p.status,
      p.note,
    ]);

    const csvContent =
      [header, ...rows]
        .map((row) => row.map((val) => `"${val}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_export_${filterType || 'all'}_${filterDate || 'all'}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="col-lg-12">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">

          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select form-select-sm"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterDate('');
              }}
            >
              <option value="">All</option>
              <option value="day">By Day</option>
              <option value="month">By Month</option>
              <option value="year">By Year</option>
            </select>
            {renderDateInput()}
            <button
              className="btn btn-sm btn-outline-secondary"
              
              onClick={handleExportCSV}
            >
              Export CSV
            </button>
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
                  <th className="text-center">Payment Method</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th className="text-center">Status</th>
                  <th>Note</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="custom-row-border">
                    <td>#{payment._id.slice(-6).toUpperCase()}</td>
                    <td className="text-center">{payment.patient?.name || 'Unknown'}</td>
                    <td className="text-center">{payment.type}</td>
                    <td className="text-center">{payment.method}</td>
                    <td>{payment.price} EGP</td>
                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="text-center">
                      
                      
                      <span
                        className={`px-24 py-4 rounded-pill fw-medium text-sm ${
                          payment.status === 'Completed'
                            ? 'bg-success-focus text-success-main'
                            : 'bg-warning-focus text-warning-main'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td>{payment.note}</td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No payments found.
                    </td>
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
    </div>
  );
};

export default PaymentTransactionsTable;
