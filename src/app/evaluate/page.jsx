"use client";

import EvaluateLayer from "@/components/child/EvaluateLayer";

import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";

const page = () => {

  return (
    <MasterLayout>

<Breadcrumb 
  heading="Edit Program" 
  title="Dashboard / Edit Program" 
/>

      <EvaluateLayer />
    </MasterLayout>

  );
};

export default page;


