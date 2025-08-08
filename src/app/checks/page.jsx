import ChecksComponent from "@/components/checks"
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";


const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb 
  heading="Checks Managment System" 
  title="Checks Managment System" 
/>
        <ChecksComponent />
      </MasterLayout>
    </>
  );
};

export default Page;
