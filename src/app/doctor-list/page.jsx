import Breadcrumb from "@/components/Breadcrumb";
import DoctorListLayer from "@/components/DoctorListLayer";
import MasterLayout from "@/masterLayout/MasterLayout";

export const metadata = {
  title: "WowDash NEXT JS - Admin Dashboard Multipurpose Bootstrap 5 Template",
  description:
    "Wowdash NEXT JS is a developer-friendly, ready-to-use admin template designed for building attractive, scalable, and high-performing web applications.",
};

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}

        <Breadcrumb 
  heading="All Doctors" 
  title="Dashboard / All Doctors" 
/>

        {/* UsersListLayer */}
        <DoctorListLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
