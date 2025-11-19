import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import PaymentTransactionsTable from "@/components/PaymentTransactionsTable";


const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Payment Transactions' />

        {/* TableBasicLayer */}
        <PaymentTransactionsTable />
      </MasterLayout>
    </>
  );
};

export default Page;
