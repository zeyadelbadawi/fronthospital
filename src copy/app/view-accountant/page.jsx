import Breadcrumb from "@/components/Breadcrumb";
import AdminAccountantProfileLayer from "@/components/AdminAccountantProfileLayer";
import MasterLayout from "@/masterLayout/MasterLayout";


const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}

        <Breadcrumb 
  heading="Accountant Profile" 
  title="Accountant Profile" 
/>

        {/* AdminAccountantProfileLayer */}
        <AdminAccountantProfileLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
