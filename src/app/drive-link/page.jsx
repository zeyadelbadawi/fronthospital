import StudentForm from "@/components/StudentForm";
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";


const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb 
  heading="Google Drive link" 
  title="Google Drive link" 
/>
        {/* EditDoctorLayer  */}
        <StudentForm />
      </MasterLayout>
    </>
  );
};

export default Page;
