'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from "../helper/axiosSetup"; // Import Axios setup

const PayPage2 = () => {
  const router = useRouter();
  const [paymentType, setPaymentType] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    // Retrieve payment data from localStorage
    const paymentData = JSON.parse(localStorage.getItem('paymentData'));
    if (paymentData) {
      setPaymentType(paymentData.paymentType);
      setSelectedSession(paymentData.selectedSession);
    }

      }, []);

      const confirmPayment = async () => {
        try {
          const paymentData = JSON.parse(localStorage.getItem('paymentData'));
      
          if (!paymentData || !selectedSession) {
            throw new Error('No session selected for payment');
          }
      
          // Step 1: Mark the session as completed
          const response = await axiosInstance.put(`/authentication/edit-session-status/${selectedSession}`, {
            status: 'Completed',
          });
      
          if (response.status === 200) {
            // ✅ Step 2: Record the payment
            await axiosInstance.post('/authentication/payment/per-session', {
              sessionId: selectedSession,
            });
      
            localStorage.removeItem('paymentData');
            router.push('/profile');
          }
        } catch (error) {
          console.error("Error confirming payment:", error);
        }
      };
      
  return (
    <div className="col-md-12">
      <div className="card">
        <div className="card-body">
          <h6 className="mb-4 text-xl">Payment</h6>
          <p className="text-neutral-500">Please confirm your payment.</p>

          {/* Payment Confirmation Button */}
          <div className="form-group text-center">
            <button
              className="btn btn-primary-600 px-32"
              onClick={confirmPayment}
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPage2;
