import React from 'react'

const DisplayHeadingFont = () => {
    return (
        <div className="col-md-6">
            <div className="card h-100 p-0">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Display Heading</h6>
                    <h6 className="text-lg fw-semibold mb-0">Font Size</h6>
                </div>
                <div className="card-body py-16 px-24">
                    <div className="d-flex align-items-center justify-content-between mb-16">
                        <h1>Display 1</h1>
                        <span className="text-md text-secondary-light fw-normal">60px</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-16">
                        <h2>Display 2</h2>
                        <span className="text-md text-secondary-light fw-normal">48px</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-16">
                        <h3>Display 3</h3>
                        <span className="text-md text-secondary-light fw-normal">36px</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-16">
                        <h4>Display 4</h4>
                        <span className="text-md text-secondary-light fw-normal">30px</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-16">
                        <h5>Display 5</h5>
                        <span className="text-md text-secondary-light fw-normal">24px</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                        <h6>Display 6</h6>
                        <span className="text-md text-secondary-light fw-normal">20px</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DisplayHeadingFont