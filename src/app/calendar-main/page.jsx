import Breadcrumb from "@/components/Breadcrumb";
import CalendarMainLayer from "@/components/CalendarMainLayer";
import MasterLayout from "@/masterLayout/MasterLayout";


const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb 
  heading="Calendar" 
  title="Calendar" 
/>

        {/* CalendarMainLayer */}
        <CalendarMainLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
