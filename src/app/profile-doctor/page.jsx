import Breadcrumb from "@/components/Breadcrumb";
import PublicProfileDoctor from "@/components/PublicProfileDoctor";
import MasterLayout from "@/masterLayout/MasterLayout";

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='your Profile' />

        {/* ViewProfileLayer */}
        <PublicProfileDoctor />
      </MasterLayout>
    </>
  );
};

export default Page;
