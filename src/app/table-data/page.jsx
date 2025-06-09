import Breadcrumb from "@/components/Breadcrumb";
import PaymentEdit from "@/components/PaymentEdit";
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
  heading="Edit Payment Transactions" 
  title="Dashboard / Edit Payment" 
/>
        {/* TableDataLayer */}
        <PaymentEdit />
      </MasterLayout>
    </>
  );
};

export default Page;
