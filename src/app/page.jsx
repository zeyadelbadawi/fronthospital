import DashBoardLayerEight from "@/components/DashBoardLayerEight";
import MasterLayout from "@/masterLayout/MasterLayout";
import { ModelProvider } from "@/contexts/ModelContext";

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        <ModelProvider>
          {/* DashBoardLayerOne */}
          <DashBoardLayerEight />
        </ModelProvider>
      </MasterLayout>
    </>
  );
};

export default Page;
