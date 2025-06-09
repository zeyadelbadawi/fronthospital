"use client";

import WizardWithBesideLabel from "@/components/child/WizardWithBesideLabel";

import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";

const page = () => {

  return (
    <MasterLayout>

<Breadcrumb 
  heading="Edit Program" 
  title="Dashboard / Edit Program" 
/>

      <WizardWithBesideLabel />
    </MasterLayout>

  );
};

export default page;


