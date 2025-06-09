"use client";
import Slider from "react-slick";

const CarouselWithPagination = () => {
  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
  };
  return (
    <div className='col-sm-6'>
      <div className='card p-0 overflow-hidden position-relative radius-12'>
        <div className='card-header py-16 px-24 bg-base border border-end-0 border-start-0 border-top-0'>
          <h6 className='text-lg mb-0'>Carousel With Pagination</h6>
        </div>
        <div className='card-body p-0 pagination-carousel dots-style-circle dots-positioned'>
          <Slider {...settings}>
            <div className='gradient-overlay bottom-0 start-0 h-100'>
              <img
                src='assets/images/carousel/carousel-img3.png'
                alt=''
                className='w-100 h-100 object-fit-cover'
              />
              <div className='position-absolute start-50 translate-middle-x bottom-0 pb-64 z-1 text-center w-100 max-w-440-px'>
                <h5 className='card-title text-white text-lg mb-6'>
                  Carousel Slide One
                </h5>
                <p className='card-text text-white mx-auto text-sm'>
                  User Interface (UI) and User Experience (UX) Design play key
                  roles in the experience users have when{" "}
                </p>
              </div>
            </div>
            <div className='gradient-overlay bottom-0 start-0 h-100'>
              <img
                src='assets/images/carousel/carousel-img4.png'
                alt=''
                className='w-100 h-100 object-fit-cover'
              />
              <div className='position-absolute start-50 translate-middle-x bottom-0 pb-64 z-1 text-center w-100 max-w-440-px'>
                <h5 className='card-title text-white text-lg mb-6'>
                  Carousel Slide Two
                </h5>
                <p className='card-text text-white mx-auto text-sm'>
                  User Interface (UI) and User Experience (UX) Design play key
                  roles in the experience users have when{" "}
                </p>
              </div>
            </div>
            <div className='gradient-overlay bottom-0 start-0 h-100'>
              <img
                src='assets/images/carousel/carousel-img1.png'
                alt=''
                className='w-100 h-100 object-fit-cover'
              />
              <div className='position-absolute start-50 translate-middle-x bottom-0 pb-64 z-1 text-center w-100 max-w-440-px'>
                <h5 className='card-title text-white text-lg mb-6'>
                  Carousel Slide Three
                </h5>
                <p className='card-text text-white mx-auto text-sm'>
                  User Interface (UI) and User Experience (UX) Design play key
                  roles in the experience users have when{" "}
                </p>
              </div>
            </div>
            <div className='gradient-overlay bottom-0 start-0 h-100'>
              <img
                src='assets/images/carousel/carousel-img2.png'
                alt=''
                className='w-100 h-100 object-fit-cover'
              />
              <div className='position-absolute start-50 translate-middle-x bottom-0 pb-64 z-1 text-center w-100 max-w-440-px'>
                <h5 className='card-title text-white text-lg mb-6'>
                  Carousel Slide Four
                </h5>
                <p className='card-text text-white mx-auto text-sm'>
                  User Interface (UI) and User Experience (UX) Design play key
                  roles in the experience users have when{" "}
                </p>
              </div>
            </div>
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default CarouselWithPagination;
