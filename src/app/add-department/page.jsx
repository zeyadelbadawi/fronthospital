import AddDepartmentLayer from "@/components/AddDepartmentLayer";
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}

        <Breadcrumb 
  heading="Add Department" 
  title="Add Department" 
/>

        {/* AddUserLayer */}
        <AddDepartmentLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
