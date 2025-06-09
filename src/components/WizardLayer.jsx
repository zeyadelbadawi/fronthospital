import React from "react";
import NumberingWizardWithLabel from "./child/NumberingWizardWithLabel";

const WizardLayer = ({ currentStep, setCurrentStep }) => {
  return (
    <div className="row gy-4">
      {/* Pass currentStep and setCurrentStep as props to NumberingWizardWithLabel */}
      <NumberingWizardWithLabel currentStep={currentStep} setCurrentStep={setCurrentStep} />
    </div>
  );
};

export default WizardLayer;
