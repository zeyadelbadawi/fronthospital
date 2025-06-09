import Link from "next/link";
import React from "react";

const AvailableTreatments = () => {
  return (
    <div className='col-xxl-12 col-xl-6'>
      <div className='card'>
        <div className='card-header'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Available Treatments</h6>
          </div>
        </div>
        <div className='card-body'>

          <div className='d-flex align-items-center justify-content-between gap-3 mb-24'>
            <div className='d-flex align-items-center gap-12'>
              <div className='w-40-px h-40-px rounded-circle flex-shrink-0 bg-info-50 d-flex justify-content-center align-items-center'>
                <img
                  src='assets/images/home-eight/treatment-icon1.png'
                  alt=''
                  className=''
                />
              </div>
              <div className='flex-grow-1'>
                <h6 className='text-md mb-0 fw-normal'>School Integration Preparation</h6>
                <span className='text-sm text-secondary-light fw-normal'>
                  57 Doctors
                </span>
              </div>
            </div>
          </div>

          <div className='d-flex align-items-center justify-content-between gap-3 mb-24'>
            <div className='d-flex align-items-center gap-12'>
              <div className='w-40-px h-40-px rounded-circle flex-shrink-0 bg-success-50 d-flex justify-content-center align-items-center'>
                <img
                  src='assets/images/home-eight/treatment-icon2.png'
                  alt=''
                  className=''
                />
              </div>
              <div className='flex-grow-1'>
                <h6 className='text-md mb-0 fw-normal'>Physical Therapy</h6>
                <span className='text-sm text-secondary-light fw-normal'>
                  85 Doctors
                </span>
              </div>
            </div>
          </div>

          <div className='d-flex align-items-center justify-content-between gap-3 mb-24'>
            <div className='d-flex align-items-center gap-12'>
              <div className='w-40-px h-40-px rounded-circle flex-shrink-0 bg-lilac-50 d-flex justify-content-center align-items-center'>
                <img
                  src='assets/images/home-eight/treatment-icon3.png'
                  alt=''
                  className=''
                />
              </div>
              <div className='flex-grow-1'>
                <h6 className='text-md mb-0 fw-normal'>Speech Delay Therapy</h6>
                <span className='text-sm text-secondary-light fw-normal'>
                  60 Doctors
                </span>
              </div>
            </div>
          </div>

          <div className='d-flex align-items-center justify-content-between gap-3 mb-24'>
            <div className='d-flex align-items-center gap-12'>
              <div className='w-40-px h-40-px rounded-circle flex-shrink-0 bg-warning-50 d-flex justify-content-center align-items-center'>
                <img
                  src='assets/images/home-eight/treatment-icon4.png'
                  alt=''
                  className=''
                />
              </div>
              <div className='flex-grow-1'>
                <h6 className='text-md mb-0 fw-normal'>Learning Difficulties Support</h6>
                <span className='text-sm text-secondary-light fw-normal'>
                  120 Doctors
                </span>
              </div>
            </div>
          </div>

          <div className='d-flex align-items-center justify-content-between gap-3 mb-24'>
            <div className='d-flex align-items-center gap-12'>
              <div className='w-40-px h-40-px rounded-circle flex-shrink-0 bg-danger-50 d-flex justify-content-center align-items-center'>
                <img
                  src='assets/images/home-eight/treatment-icon5.png'
                  alt=''
                  className=''
                />
              </div>
              <div className='flex-grow-1'>
                <h6 className='text-md mb-0 fw-normal'>functional sensory therapy </h6>
                <span className='text-sm text-secondary-light fw-normal'>
                  25 Doctors
                </span>
              </div>
            </div>
          </div>

          <div className='d-flex align-items-center justify-content-between gap-3 mb-24'>
            <div className='d-flex align-items-center gap-12'>
              <div className='w-40-px h-40-px rounded-circle flex-shrink-0 bg-primary-50 d-flex justify-content-center align-items-center'>
                <img
                  src='assets/images/home-eight/treatment-icon6.png'
                  alt=''
                  className=''
                />
              </div>
              <div className='flex-grow-1'>
                <h6 className='text-md mb-0 fw-normal'>Special Education Services</h6>
                <span className='text-sm text-secondary-light fw-normal'>
                  95 Doctors
                </span>
              </div>
            </div>
          </div>

          {/* New: ABA Behavior Modification Sessions */}
          <div className='d-flex align-items-center justify-content-between gap-3 mb-24'>
            <div className='d-flex align-items-center gap-12'>
              <div className='w-40-px h-40-px rounded-circle flex-shrink-0 bg-info-50 d-flex justify-content-center align-items-center'>
                <img
                  src='assets/images/home-eight/treatment-icon6.png' 
                  alt='ABA Behavior Modification Sessions Icon'
                  className=''
                />
              </div>
              <div className='flex-grow-1'>
                <h6 className='text-md mb-0 fw-normal'>ABA Behavior Modification</h6>
              
              </div>
            </div>
          </div>

          {/* New: Psychoeducational Assessment */}
          

        </div>
      </div>
    </div>
  );
};

export default AvailableTreatments;
