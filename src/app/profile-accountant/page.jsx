import Breadcrumb from "@/components/Breadcrumb";
import PublicProfileAccountant from "@/components/PublicProfileAccountant";
import MasterLayout from "@/masterLayout/MasterLayout";


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
