import React from "react";
import UnitCountSix from "./child/UnitCountSix";
import EarningStatistic from "./child/EarningStatistic";
import PatientVisitedDepartment from "./child/PatientVisitedbyDepartment";
import PatientVisitByGender from "./child/PatientVisitByGender";
import TopPerformanceTwo from "./child/TopPerformanceTwo";
import LatestAppointmentsOne from "./child/LatestAppointmentsOne";
import TotalIncome from "./child/TotalIncome";
import AvailableTreatments from "./child/AvailableTreatments";
import HealthReportsDocument from "./child/HealthReportsDocument";

const DashBoardLayerEight = () => {
  return (
    <>
      <div className='row gy-4'>
        <div className='col-xxxl-9'>
          <div className='row gy-4'>
            {/* UnitCountSix */}
            <UnitCountSix />
            {/* Earning Statistic */}
            <EarningStatistic />

            {/* PatientVisitedDepartment */}
            <PatientVisitedDepartment />

                        {/* TopPerformanceTwo */}
                        <TopPerformanceTwo />

            {/* PatientVisitByGender */}



          
          </div>
        </div>
        <div className='col-xxxl-3'>
          <div className='row gy-4'>
            {/* TotalIncome */}
            <TotalIncome />

            {/* AvailableTreatments */}
            <AvailableTreatments />

            {/* HealthReportsDocument */}
           {/*  <HealthReportsDocument /> */}
          </div>
        </div>
      </div>
      <div className='col-xxxl-12'>

      <div className='row gy-9'>
      <div className="col-12 mb-3 mt-3">
  <PatientVisitByGender />
</div>
<div className="col-12">
  <LatestAppointmentsOne />
</div>
        </div>
        </div>

    </>
  );
};

export default DashBoardLayerEight;
