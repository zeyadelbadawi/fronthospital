"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Slider from "react-slick";

function SampleNextArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      onClick={onClick}
      type='button'
      className={`${className} slick-next slick-arrow`}
      style={{}}
    >
      <Icon icon='ic:outline-keyboard-arrow-right' className='menu-icon' />
    </button>
  );
}
function SamplePrevArrow(props) {
  const { className, onClick } = props;

  return (
    <button
      onClick={onClick}
      type='button'
      className={`${className} slick-prev slick-arrow`}
      style={{}}
    >
      <Icon icon='ic:outline-keyboard-arrow-left' className='menu-icon' />
    </button>
  );
}

const CarouselWithArrows = () => {
  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };
  return (
    <div className='col-sm-6'>
      <div className='card p-0 overflow-hidden position-relative radius-12'>
        <div className='card-header py-16 px-24 bg-base border border-end-0 border-start-0 border-top-0'>
          <h6 className='text-lg mb-0'>Carousel With Arrows</h6>
        </div>
        <div className='card-body p-0 arrow-carousel'>
          <Slider {...settings}>
            <div className='gradient-overlay bottom-0 start-0 h-100'>
              <img
                src='assets/images/carousel/carousel-img2.png'
                alt=''
                className='w-100 h-100 object-fit-cover'
              />
              <div className='position-absolute start-50 translate-middle-x bottom-0 pb-24 z-1 text-center w-100 max-w-440-px'>
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
              <div className='position-absolute start-50 translate-middle-x bottom-0 pb-24 z-1 text-center w-100 max-w-440-px'>
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
                src='assets/images/carousel/carousel-img3.png'
                alt=''
                className='w-100 h-100 object-fit-cover'
              />
              <div className='position-absolute start-50 translate-middle-x bottom-0 pb-24 z-1 text-center w-100 max-w-440-px'>
                <h5 className='card-title text-white text-lg mb-6'>
                  Carousel Slide Three
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

export default CarouselWithArrows;
