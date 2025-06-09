import Link from "next/link";

const BasicDropdownPrimary = () => {
  return (
    <div className='col-xl-6'>
      <div className='card h-100 p-0'>
        <div className='card-header border-bottom bg-base py-16 px-24'>
          <h6 className='text-lg fw-semibold mb-0'>Basic Dropdown Primary</h6>
        </div>
        <div className='card-body p-24'>
          <div className='d-flex flex-wrap align-items-center gap-3'>
            <div className='dropdown'>
              <button
                className='btn btn-primary-600 not-active px-18 py-11 dropdown-toggle toggle-icon'
                type='button'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                {" "}
                Default Action{" "}
              </button>
              <ul className='dropdown-menu'>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Action
                  </Link>
                </li>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Primary action
                  </Link>
                </li>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Something else
                  </Link>
                </li>
              </ul>
            </div>
            <div className='dropdown'>
              <button
                className='btn btn-outline-primary-600 not-active px-18 py-11 dropdown-toggle toggle-icon'
                type='button'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                {" "}
                Outline Action{" "}
              </button>
              <ul className='dropdown-menu'>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Action
                  </Link>
                </li>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Primary action
                  </Link>
                </li>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Something else
                  </Link>
                </li>
              </ul>
            </div>
            <div className='dropdown'>
              <button
                className='btn btn-primary-600 bg-primary-50 border-primary-50 text-primary-600 hover-text-primary not-active px-18 py-11 dropdown-toggle toggle-icon'
                type='button'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                {" "}
                Focus Action{" "}
              </button>
              <ul className='dropdown-menu'>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Action
                  </Link>
                </li>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Primary action
                  </Link>
                </li>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Something else
                  </Link>
                </li>
              </ul>
            </div>
            <div className='dropdown'>
              <button
                className='btn text-primary-600 hover-text-primary px-18 py-11 dropdown-toggle toggle-icon'
                type='button'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                {" "}
                Focus Action{" "}
              </button>
              <ul className='dropdown-menu'>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Action
                  </Link>
                </li>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Primary action
                  </Link>
                </li>
                <li>
                  <Link
                    className='dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900'
                    href='#'
                  >
                    Something else
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicDropdownPrimary;
