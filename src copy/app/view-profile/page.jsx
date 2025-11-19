import Breadcrumb from "@/components/Breadcrumb";
import AdminPatientProfileLayer from "@/components/AdminPatientProfileLayer";
import MasterLayout from "@/masterLayout/MasterLayout";

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}

        <Breadcrumb 
  heading="Student Profile" 
  title="Student Profile" 
/>


        {/* ViewProfileLayer */}
        <AdminPatientProfileLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
