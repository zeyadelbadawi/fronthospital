import PaymentTransactionsTable from "@/components/PaymentTransactionsTable"
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";


const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb 
  heading="Payment Managment System" 
  title="Payment Managment System" 
/>
        <PaymentTransactionsTable />
      </MasterLayout>
    </>
  );
};

export default Page;
