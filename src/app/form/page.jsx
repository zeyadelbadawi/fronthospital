"use client";

import { useSearchParams } from "next/navigation"; // For accessing URL query parameters
import Breadcrumb from "@/components/Breadcrumb";
import TextareaInputField from '@/components/child/TextareaInputField'
import MasterLayout from "@/masterLayout/MasterLayout";

const Page = () => {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('id');  // Get the patientId from query params

  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Input Form' />

        {/* Pass the patientId prop to TextareaInputField */}
        <TextareaInputField patientId={patientId} />
      </MasterLayout>
    </>
  );
};

export default Page;
