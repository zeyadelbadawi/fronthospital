import Link from "next/link";

const BannerInnerOne = () => {
  return (
    <div className='col-12'>
      <div className='nft-promo-card card radius-12 overflow-hidden position-relative z-1'>
        <img
          src='assets/images/nft/nft-gradient-bg.png'
          className='position-absolute start-0 top-0 w-100 h-100 z-n1'
          alt=''
        />
        <div className='nft-promo-card__inner d-flex align-items-center'>
          <div className='nft-promo-card__thumb w-100'>
            <img
              src='assets/images/nft/nf-card-img.png'
              alt=''
              className='w-100 h-100 object-fit-cover'
            />
          </div>
          <div className='flex-grow-1'>
            <h4 className='mb-16 text-white'>
              Discover The Largest NFTs Marketplace
            </h4>
            <p className='text-white text-md'>
              The largest NFT (Non-Fungible Token) marketplace is OpenSea.
              Established in 2017, OpenSea has grown to become the leading
              platform for buying, selling, and trading digital assets,
            </p>
            <div className='d-flex align-items-center flex-wrap mt-24 gap-16'>
              <Link
                href='#'
                className='btn rounded-pill border br-white text-white radius-8 px-32 py-11 hover-bg-white text-hover-neutral-900'
              >
                Explore
              </Link>
              <Link
                href='#'
                className='btn rounded-pill btn-primary-600 radius-8 px-28 py-11'
              >
                Create Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerInnerOne;
