import DashBoardLayerEight from "@/components/DashBoardLayerEight";
import MasterLayout from "@/masterLayout/MasterLayout";
import { Breadcrumb } from "react-bootstrap";
import { ModelProvider } from "@/contexts/ModelContext";

export const metadata = {
  title: "Rukn Alwatikon Center",
  description:
    "Rukn Alwatikon Center in the UAE offers specialized rehabilitation, sensory therapy, speech and behavior support, and inclusive education services for students of determination. Empowering children to thrive with tailored care.",
};

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title="Rukn Alwatikon Center" />
        <ModelProvider>
          {/* DashBoardLayerOne */}
          <DashBoardLayerEight />
        </ModelProvider>
      </MasterLayout>
    </>
  );
};

export default Page;