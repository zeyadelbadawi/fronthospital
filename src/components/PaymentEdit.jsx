'use client';
import { useEffect, useState } from 'react';
import axiosInstance from '@/helper/axiosSetup';
import { Icon } from '@iconify/react';
import PaymentEditModal from '@/components/PaymentEditModal';

const PaymentEdit = () => {
 
  return (
    <div className="col-lg-12">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="card-title mb-0">Edit Payment Records</h5>
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select form-select-sm"
            >
              <option value="day">By Day</option>
              <option value="month">By Month</option>
              <option value="year">By Year</option>
            </select>
          </div>
        </div>

        <div className="card-body">
          <div className="mb-3 fw-semibold text-primary">
            Total Amount:  EGP
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
                {((p) => (
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

export default PaymentEdit;
