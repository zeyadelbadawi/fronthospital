import DashBoardLayerEight from "@/components/DashBoardLayerEight";
import MasterLayout from "@/masterLayout/MasterLayout";
import { Breadcrumb } from "react-bootstrap";
import { ModelProvider } from "@/contexts/ModelContext";

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
        <Breadcrumb title="RUKN ALWATIKON CENTER" />
        <ModelProvider>
          {/* DashBoardLayerOne */}
          <DashBoardLayerEight />
        </ModelProvider>
      </MasterLayout>
    </>
  );
};

export default Page;