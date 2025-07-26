import Breadcrumb from "@/components/Breadcrumb";
import DepartmentListLayer from "@/components/DepartmentListLayer";
import MasterLayout from "@/masterLayout/MasterLayout";

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}

        <Breadcrumb 
  heading="All Departments" 
  title=" All Departments" 
/>

        {/* UsersListLayer */}
        <DepartmentListLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
