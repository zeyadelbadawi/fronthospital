"use client"; // Ensure this is a client-side component

import React, { useEffect, useState } from "react";
import axiosInstance from '../helper/axiosSetup'; // Import your axios setup
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import the toast styles

const PayPage = () => {
  const [evaluationData, setEvaluationData] = useState(null);

  useEffect(() => {
    // Fetch evaluation data from localStorage
    const data = JSON.parse(localStorage.getItem('evaluationData'));

    if (data) {
      setEvaluationData(data); // Set the evaluation data in state if found
    } else {
      console.error("No evaluation data found.");
      // Redirect back to the wizard if data is missing
      window.location.href = '/wizard?step=1'; // Redirect to the first step if data is missing
    }
  }, []);

  const handleConfirmPayment = async () => {
    try {
      // Get the evaluationData from localStorage and parse it into an object
      const evaluationData = JSON.parse(localStorage.getItem("evaluationData"));
      
      // Check if evaluationData is not null and contains the necessary fields
      if (!evaluationData) {
        alert("No evaluation data found in localStorage.");
        return; // Exit if no evaluation data is found
      }
  
      const token = localStorage.getItem("token");
  
      const payload = {
        date: evaluationData.date,  // Access date correctly after parsing
        time: evaluationData.time,  // Access time correctly after parsing
        description: evaluationData.description,  // Access description correctly after parsing
        price: evaluationData.price,  // Access description correctly after parsing

        type: evaluationData.type,
        ...(evaluationData.services && { services: evaluationData.services }),
        ...(evaluationData.school && { school: evaluationData.school }),

        status: "Completed",  // Set the status to "Completed"
      };
  
      // Make the API call to save the evaluation
      await axiosInstance.post("/authentication/ev", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Directly call the payment API — do NOT call /ev again
      const res = await axiosInstance.post('/authentication/payment/evaluation',
      {
        type:  evaluationData.type,
        price: evaluationData.price
      },
      { headers: { Authorization: `Bearer ${token}` } }        );


  
      if (res.status === 201) {
        // Show success message using toast
        toast.success("Payment successful! Your evaluation has been recorded.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        setTimeout(() => {
          // Uncomment if you want to redirect after successful payment
          window.location.href = "/calendar-main-patient"; // Redirect to the final step
        }, 2000);
      }
    } catch (error) {
      console.error("Error during payment confirmation:", error);
      toast.error("Failed to complete payment. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  




  const handleConfirmcash = async () => {
    try {
      // Get the evaluationData from localStorage and parse it into an object
      const evaluationData = JSON.parse(localStorage.getItem("evaluationData"));
  
      // Check if evaluationData is not null and contains the necessary fields
      if (!evaluationData) {
        alert("No evaluation data found in localStorage.");
        return; // Exit if no evaluation data is found
      }
  
      const token = localStorage.getItem("token");
  
      const payload = {
        date: evaluationData.date,  // Access date correctly after parsing
        time: evaluationData.time,  // Access time correctly after parsing
        description: evaluationData.description,  // Access description correctly after parsing
        type: evaluationData.type,
price: evaluationData.price,
        status: "Cash",  // Set the status to "Pending"
        ...(evaluationData.school && { school: evaluationData.school }),
      };
  
      // Make the API call to save the evaluation
      await axiosInstance.post("/authentication/ev", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Directly call the payment API — do NOT call /ev again
      const res = await axiosInstance.post(
               '/authentication/payment/cash',
               {
                type:  evaluationData.type,
                price: evaluationData.price
              },

            { headers: { Authorization: `Bearer ${token}` } }        );
  
      if (res.status === 201) {
    
        toast.success("Payment successful! Your evaluation has been recorded.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        setTimeout(() => {
          // Uncomment if you want to redirect after successful payment
          window.location.href = "/calendar-main-patient"; // Redirect to the final step
        }, 2000);
      }
    } catch (error) {
      console.error("Error during payment confirmation:", error);
      toast.error("Failed to complete payment. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
              onClick={handleConfirmPayment} // Call the function to handle the confirmation
              className="btn btn-primary-600 px-32"
            >
              Confirm Payment
            </button>
            <button
              onClick={handleConfirmcash} // Call the function to handle the confirmation
              className="btn btn-info-600 px-32"
            >
              pay cash
            </button>
          </div>
          <div className="form-group text-center">
          
          </div>
        </div>
      </div>

      {/* Toast Container for Notifications */}
      <ToastContainer />
    </div>
  );
};

export default PayPage;
