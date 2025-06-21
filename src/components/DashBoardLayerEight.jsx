import React from "react";
import HomeComOne from "./child/HomeComOne";
import HomeComTo from "./child/HomeComTo";
import PatientVisitedDepartment from "./child/PatientVisitedbyDepartment";
import PatientVisitByGender from "./child/PatientVisitByGender";
import HomeComThree from "./child/HomeComThree";
import HomeComSix from "./child/HomeComSix";
import HomeComFour from "./child/HomeComFour";
import HomeComFive from "./child/HomeComFive";

const DashBoardLayerEight = () => {
  return (
    <>
      <div className='row gy-4'>
        <div className='col-xxxl-9'>
          <div className='row gy-4'>
            {/* UnitCountSix */}
            <HomeComOne />
            {/* Earning Statistic */}
            <HomeComTo />

            {/* PatientVisitedDepartment */}
            <PatientVisitedDepartment />

                        {/* TopPerformanceTwo */}
                        <HomeComThree />

            {/* PatientVisitByGender */}



          
          </div>
        </div>
        <div className='col-xxxl-3'>
          <div className='row gy-4'>
            {/* TotalIncome */}
            <HomeComFour />

            {/* AvailableTreatments */}
            <HomeComFive />

          </div>
        </div>
      </div>
      <div className='col-xxxl-12'>

      <div className='row gy-9'>
      <div className="col-12 mb-3 mt-3">
  <PatientVisitByGender />
</div>
<div className="col-12">
  <HomeComSix />
</div>
        </div>
        </div>

    </>
  );
};

export default DashBoardLayerEight;
