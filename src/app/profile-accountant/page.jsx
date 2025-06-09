import Breadcrumb from "@/components/Breadcrumb";
import PublicProfileAccountant from "@/components/PublicProfileAccountant";
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
        <Breadcrumb title='your Profile' />

        {/* PublicProfileAccountant */}
        <PublicProfileAccountant />
      </MasterLayout>
    </>
  );
};

export default Page;
