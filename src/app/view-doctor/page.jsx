import Breadcrumb from "@/components/Breadcrumb";
import AdminDoctorProfileLayer from "@/components/AdminDoctorProfileLayer";
import MasterLayout from "@/masterLayout/MasterLayout";



const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>

        <Breadcrumb 
  heading="Doctor Profile" 
  title="Doctor Profile" 
/>

        {/* ViewProfileLayer */}
        <AdminDoctorProfileLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
