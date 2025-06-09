import Breadcrumb from "@/components/Breadcrumb";
import FormLayoutLayer from "@/components/FormLayoutLayer";
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
        <Breadcrumb title='Input Layout' />

        {/* FormLayoutLayer */}
        <FormLayoutLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
