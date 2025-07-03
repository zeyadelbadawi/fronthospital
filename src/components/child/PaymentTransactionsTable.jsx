'use client';
import { useEffect, useState } from 'react';
import axios from '@/helper/axiosSetup';

const PaymentTransactionsTable = () => {




  return (
    <div className="col-lg-12">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">

          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select form-select-sm"
            
            >
              <option value="">All</option>
              <option value="day">By Day</option>
              <option value="month">By Month</option>
              <option value="year">By Year</option>
            </select>
            <button
              className="btn btn-sm btn-outline-secondary"
              
            >
              Export CSV
            </button>
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
                  <th className="text-center">Payment Method</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th className="text-center">Status</th>
                  <th>Note</th>
                </tr>
              </thead>

              <tbody>
                {((payment) => (
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
