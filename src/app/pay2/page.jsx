'use client';

import Breadcrumb from "@/components/Breadcrumb";
import PayPage2 from "@/components/PayPage2";
import MasterLayout from "@/masterLayout/MasterLayout";
import React, { useEffect, useState } from 'react';



const Page = () => {
  // Mock-up data, you can get this from the previous page or state management
  const paymentData = {
    paymentType: 'per-session',  // Or 'one-time'
    selectedSession: 'session_id_here',  // Provide session ID if needed
  };

  // Store data in localStorage for PayPage2 component
  useEffect(() => {
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
  }, []);

  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Form Validation' />

        {/* PayPage2 for payment confirmation */}
        <PayPage2 />
      </MasterLayout>
    </>
  );
};

export default Page;
