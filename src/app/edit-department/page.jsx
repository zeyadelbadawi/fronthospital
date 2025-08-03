import EditDepartmentLayer from "@/components/EditDepartmentLayer";
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";


const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb 
  heading="Edit Department" 
  title="Edit Department" 
/>
        {/* EditDoctorLayer  */}
        <EditDepartmentLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
