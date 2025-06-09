"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import Link from "next/link";
import axios from 'axios'; // Make sure axios is imported
import { useRouter } from 'next/router'; // Import useRouter hook
import axiosInstance from "../helper/axiosSetup"; // Import the configured axios instance
import { Icon } from '@iconify/react'


const MasterLayout = ({ children }) => {
  // const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  let pathname = usePathname();
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  const location = usePathname(); // Hook to get the current route


  const handleLogout = async () => {
    try {
      // Send logout request to backend
      await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/logout`);
      localStorage.removeItem('token'); // Remove token
      setUser(null); // Reset user data on logout
      setLoading(true); // Set loading to true until logout is completed
      // Redirect to login page
      window.location.href = "/sign-in"; // Using window.location.href to avoid next/link issue after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });



    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location ||
            link.getAttribute("to") === location
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };






  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false); // If no token, stop loading and show placeholders
          return;
        }


        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data;
        setUser(userData);
        setUserRole(userData.role); // Get the role (admin, doctor, volunteer, or patient)
        setUserName(userData.name); // Get the name of the logged-in user
        setLoading(false); // Data fetched, stop loading

      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false); // Stop loading in case of error

        if (error.response && error.response.status === 403) {
          // If the token is expired, try refreshing the token
          try {
            const refreshResponse = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/refresh`, {}, {
              withCredentials: true, // Send cookies along with the request
            });
            const newAccessToken = refreshResponse.data.accessToken;
            localStorage.setItem('token', newAccessToken);  // Save the new access token
            // Retry fetching user data with the new token
            const retryResponse = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`, {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });
            const userData = retryResponse.data;
            setUser(userData);
            setUserRole(userData.role);
            setUserName(userData.name);
          } catch (refreshError) {
            console.error('Refresh token failed:', refreshError);
            // Redirect to login page if refresh fails
            <Link href="/sign-in"></Link>;
          }
        }
      }
    };

    fetchUserData();
  }, []);



  // Determine the profile link based on the role
  let profileLink = ' ';  // Default profile page

  if (userRole === 'patient') {
    profileLink = '/profile';
  } else if (userRole === 'volunteer') {
    profileLink = '/profile-volunteer';
  } else if (userRole === 'doctor') {
    profileLink = '/profile-doctor';
  } else if (userRole === 'accountant') {
    profileLink = '/profile-accountant';
  }
  // Logic for profile redirection based on user role
  const handleProfileRedirect = () => {
    if (userRole === 'patient') {
      <Link href="/profile"></Link>
    } else if (userRole === 'volunteer') {
      <Link href="/profile-volunteer"></Link>

    } else if (userRole === 'doctor') {
      <Link href="/profile-doctor"></Link>
    }
    else if (userRole === 'accountant') {
      <Link href="/profile-accountant"></Link>
    }
  };


  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
              ? "sidebar sidebar-open"
              : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type='button'
          className='sidebar-close-btn'
        >
          <Icon icon='radix-icons:cross-2' />
        </button>
        <div>
          <Link href='/' className='sidebar-logo'>
            <img
              src='assets/dlogo.png'
              alt='site logo'
              className='light-logo'
            />
            <img
              src='assets/dlogo.png'
              alt='site logo'
              className='dark-logo'
            />
            <img
              src='assets/dlogo.png'
              alt='site logo'
              className='logo-icon'
            />
          </Link>
        </div>
        <div className='sidebar-menu-area'>
          <ul className='sidebar-menu' id='sidebar-menu'>
            <li className='sidebar-menu-group-title'>Home</li>
            <li>
              <Link
                href='/'
                className={pathname === "/" ? "active-page" : ""}>
                <Icon icon='solar:home-smile-angle-outline' className='menu-icon' />
                <span>Statistics</span>
              </Link>
            </li>
            <li className='sidebar-menu-group-title'>Dashboards</li>
            <li>
              <Link
                href='/doctor-dashboard'
                className={pathname === "/doctor-dashboard" ? "active-page" : ""}>
                <Icon icon='bi:chat-dots' className='menu-icon' />
                <span>All Programs</span>
              </Link>
            </li>
            <li>
              <Link
                href='/profile-dashboard'
                className={pathname === "/profile-dashboard" ? "active-page" : ""}>
                <Icon icon='mage:email' className='menu-icon' />
                <span>Students Profile</span>
              </Link>
            </li>
            <li>
              <Link
                href='/doctor-dashboard2'
                className={pathname === "/doctor-dashboard2" ? "active-page" : ""}>
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'/>
                <span>Free Consultation requests</span>
              </Link>
            </li>
            <li>
              <Link
                href='/wizard'
                className={pathname === "/wizard" ? "active-page" : ""}>
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'/>
                <span>Book Appointment</span>
              </Link>
            </li>
            <li>
              <Link
                href='/calendar-main'
                className={pathname === "/calendar-main" ? "active-page" : ""}>
                <Icon icon='solar:calendar-outline' className='menu-icon' />
                <span>Calendar</span>
              </Link>
            </li>
            <li className='sidebar-menu-group-title'>All Users</li>
            <li>
              <Link
                href='/users-list'
                className={pathname === "/users-list" ? "active-page" : ""}>
                <Icon icon='hugeicons:student' className='menu-icon' />
                <span>All Students</span>
              </Link>
            </li>
            <li>
              <Link
                href='/doctor-list'
                className={pathname === "/doctor-list" ? "active-page" : ""}>
                <Icon icon='bi:chat-dots' className='menu-icon' />
                <span>All Doctors</span>
              </Link>
            </li>
            <li>
              <Link
                href='/accountant-list'
                className={pathname === "/accountant-list" ? "active-page" : ""}>
                <Icon icon='bi:chat-dots' className='menu-icon' />
                <span>All Accountants</span>
              </Link>
            </li>
            <li>
              <Link
                href='/volunteer-list'
                className={pathname === "/volunteer-list" ? "active-page" : ""}>
                <Icon icon='hugeicons:student' className='menu-icon' />
                <span>All volunteers Students</span>
              </Link>
            </li>      
            <li className='sidebar-menu-group-title'>payment reports</li>
              <li>
                <Link
                  href='/Payment-Transactions'
                  className={pathname === "/Payment-Transactions" ? "active-page" : ""}>
                  <Icon icon='bi:chat-dots' className='menu-icon' />
                  <span> Payment Transactions</span>
                </Link>
              </li>
              <li>
                <Link
                  href='/table-data'
                  className={pathname === "/table-data" ? "active-page" : ""}>
                  <Icon icon='bi:chat-dots' className='menu-icon' />
                  <span>Edit Payment Transactions</span>
                </Link>
              </li>
              <li>
                <Link
                  href='/Patient-Payments'
                  className={pathname === "/Patient-Payments" ? "active-page" : ""}>
                  <Icon icon='bi:chat-dots' className='menu-icon' />
                  <span>Patients Payment</span>
                </Link>
              </li>
              <ul className='sidebar-submenu'>
                <li>
                  <Link
                    href='/typography'
                    className={pathname === "/typography" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />
                    Typography
                  </Link>
                </li>
                <li>
                  <Link
                    href='/colors'
                    className={pathname === "/colors" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
                    Colors
                  </Link>
                </li>
                <li>
                  <Link
                    href='/button'
                    className={pathname === "/button" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-success-main w-auto' />{" "}
                    Button
                  </Link>
                </li>
                <li>
                  <Link
                    href='/dropdown'
                    className={pathname === "/dropdown" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-lilac-600 w-auto' />{" "}
                    Dropdown
                  </Link>
                </li>
                <li>
                  <Link
                    href='/alert'
                    className={pathname === "/alert" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
                    Alerts
                  </Link>
                </li>
                <li>
                  <Link
                    href='/card'
                    className={pathname === "/card" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
                    Card
                  </Link>
                </li>
                <li>
                  <Link
                    href='/carousel'
                    className={pathname === "/carousel" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
                    Carousel
                  </Link>
                </li>
                <li>
                  <Link
                    href='/avatar'
                    className={pathname === "/avatar" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-success-main w-auto' />{" "}
                    Avatars
                  </Link>
                </li>
                <li>
                  <Link
                    href='/progress'
                    className={pathname === "/progress" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                    Progress bar
                  </Link>
                </li>
                <li>
                  <Link
                    href='/tabs'
                    className={pathname === "/tabs" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
                    Tab &amp; Accordion
                  </Link>
                </li>
                <li>
                  <Link
                    href='/pagination'
                    className={pathname === "/pagination" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-danger-main w-auto' />
                    Pagination
                  </Link>
                </li>
                <li>
                  <Link
                    href='/badges'
                    className={pathname === "/badges" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
                    Badges
                  </Link>
                </li>
                <li>
                  <Link
                    href='/tooltip'
                    className={pathname === "/tooltip" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-lilac-600 w-auto' />{" "}
                    Tooltip &amp; Popover
                  </Link>
                </li>
                <li>
                  <Link
                    href='/videos'
                    className={pathname === "/videos" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-cyan w-auto' />{" "}
                    Videos
                  </Link>
                </li>
                <li>
                  <Link
                    href='/star-rating'
                    className={pathname === "/star-rating" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-indigo w-auto' />{" "}
                    Star Ratings
                  </Link>
                </li>
                <li>
                  <Link
                    href='/tags'
                    className={pathname === "/tags" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-purple w-auto' />{" "}
                    Tags
                  </Link>
                </li>
                <li>
                  <Link
                    href='/list'
                    className={pathname === "/list" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-red w-auto' />{" "}
                    List
                  </Link>
                </li>
                <li>
                  <Link
                    href='/calendar'
                    className={pathname === "/calendar" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-yellow w-auto' />{" "}
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link
                    href='/radio'
                    className={pathname === "/radio" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-orange w-auto' />{" "}
                    Radio
                  </Link>
                </li>
                <li>
                  <Link
                    href='/switch'
                    className={pathname === "/switch" ? "active-page" : ""}>
                    <i className='ri-circle-fill circle-icon text-pink w-auto' />{" "}
                    Switch
                  </Link>
                </li>
                <li>
                  <Link
                    href='/image-upload'
                    className={
                      pathname === "/image-upload" ? "active-page" : ""
                    }>
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                    Upload
                  </Link>
                </li>
              </ul>
            {/* Settings Dropdown */}
            <li className='dropdown'>
              <Link href='#'>
                <Icon
                  icon='icon-park-outline:setting-two'
                  className='menu-icon'
                />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className='navbar-header'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-4'>
                <button
                  type='button'
                  
                  className='sidebar-toggle'

                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon='iconoir:arrow-right'
                      className='icon text-2xl non-active'
                    />
                  ) : (
                    <Icon
                      icon='heroicons:bars-3-solid'
                      className='icon text-2xl non-active '
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type='button'
                  className='sidebar-mobile-toggle'
                >
                  <Icon icon='heroicons:bars-3-solid' className='icon' />
                </button>
                <form className='navbar-search'>
                  <input type='text' name='search' placeholder='Search' />
                  <Icon icon='ion:search-outline' className='icon' />
                </form>
              </div>
            </div>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-3'>
                {/* ThemeToggleButton */}
                <ThemeToggleButton />
                <div className='dropdown d-none d-sm-inline-block'>
                  <button
                    className='has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center'
                    type='button'
                    data-bs-toggle='dropdown'
                    title='Switch Language'       // <-- Tooltip on hover

                  >
<Icon icon="iconoir:language" className='icon' />

                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-sm'>
                    <div className='py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-0'>
                          Choose Your Language
                        </h6>
                      </div>
                    </div>
                    <div className='max-h-400-px overflow-y-auto scroll-sm pe-8'>
                      <div className='form-check style-check d-flex align-items-center justify-content-between mb-16'>
                        <label
                          className='form-check-label line-height-1 fw-medium text-secondary-light'
                          htmlFor='english'
                        >
                          <span className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                            <img
                              src='assets/images/flags/eng.webp'
                              alt=''
                              className='w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0'
                            />
                            <span className='text-md fw-semibold mb-0'>
                              English
                            </span>
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='crypto'
                          id='english'
                          defaultChecked
                        />
                      </div>
                      <div className='form-check style-check d-flex align-items-center justify-content-between'>
                        <label
                          className='form-check-label line-height-1 fw-medium text-secondary-light'
                          htmlFor='Arabic'
                        >
                          <span className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                            <img
                              src='assets/images/flags/ar.webp'
                              alt=''
                              className='w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0'
                            />
                            <span className='text-md fw-semibold mb-0'>
                              Arabic
                            </span>
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='crypto'
                          id='arabic'
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Language dropdown end */}
                <div className='dropdown'>
                  <button
                    className='has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center'
                    type='button'
                    data-bs-toggle='dropdown'
                    title='Messages'       // <-- Tooltip on hover

                  >
                    <Icon
                      icon='mage:email'
                      className='text-primary-light text-xl'
                    />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-lg p-0'>
                    <div className='m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-0'>
                          Message
                        </h6>
                      </div>
                      <span className='text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center'>
                        05
                      </span>
                    </div>
                    <div className='max-h-400-px overflow-y-auto scroll-sm pe-4'>
                      <Link
                        href='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-40-px h-40-px rounded-circle flex-shrink-0 position-relative'>
                            <img
                              src='assets/images/notification/profile-3.png'
                              alt=''
                            />
                            <span className='w-8-px h-8-px bg-success-main rounded-circle position-absolute end-0 bottom-0' />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Kathryn Murphy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-100-px'>
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className='d-flex flex-column align-items-end'>
                          <span className='text-sm text-secondary-light flex-shrink-0'>
                            12:30 PM
                          </span>
                          <span className='mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-warning-main rounded-circle'>
                            8
                          </span>
                        </div>
                      </Link>
                      <Link
                        href='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-40-px h-40-px rounded-circle flex-shrink-0 position-relative'>
                            <img
                              src='assets/images/notification/profile-4.png'
                              alt=''
                            />
                            <span className='w-8-px h-8-px  bg-neutral-300 rounded-circle position-absolute end-0 bottom-0' />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Kathryn Murphy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-100-px'>
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className='d-flex flex-column align-items-end'>
                          <span className='text-sm text-secondary-light flex-shrink-0'>
                            12:30 PM
                          </span>
                          <span className='mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-warning-main rounded-circle'>
                            2
                          </span>
                        </div>
                      </Link>
                      <Link
                        href='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-40-px h-40-px rounded-circle flex-shrink-0 position-relative'>
                            <img
                              src='assets/images/notification/profile-5.png'
                              alt=''
                            />
                            <span className='w-8-px h-8-px bg-success-main rounded-circle position-absolute end-0 bottom-0' />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Kathryn Murphy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-100-px'>
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className='d-flex flex-column align-items-end'>
                          <span className='text-sm text-secondary-light flex-shrink-0'>
                            12:30 PM
                          </span>
                          <span className='mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-neutral-400 rounded-circle'>
                            0
                          </span>
                        </div>
                      </Link>
                      <Link
                        href='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-40-px h-40-px rounded-circle flex-shrink-0 position-relative'>
                            <img
                              src='assets/images/notification/profile-6.png'
                              alt=''
                            />
                            <span className='w-8-px h-8-px bg-neutral-300 rounded-circle position-absolute end-0 bottom-0' />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Kathryn Murphy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-100-px'>
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className='d-flex flex-column align-items-end'>
                          <span className='text-sm text-secondary-light flex-shrink-0'>
                            12:30 PM
                          </span>
                          <span className='mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-neutral-400 rounded-circle'>
                            0
                          </span>
                        </div>
                      </Link>
                      <Link
                        href='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-40-px h-40-px rounded-circle flex-shrink-0 position-relative'>
                            <img
                              src='assets/images/notification/profile-7.png'
                              alt=''
                            />
                            <span className='w-8-px h-8-px bg-success-main rounded-circle position-absolute end-0 bottom-0' />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Kathryn Murphy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-100-px'>
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className='d-flex flex-column align-items-end'>
                          <span className='text-sm text-secondary-light flex-shrink-0'>
                            12:30 PM
                          </span>
                          <span className='mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-warning-main rounded-circle'>
                            8
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className='text-center py-12 px-16'>
                      <Link
                        href='#'
                        className='text-primary-600 fw-semibold text-md'
                      >
                        See All Messages
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Message dropdown end */}
                <div className='dropdown'>
                  <button
                    className='has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center'
                    type='button'
                    data-bs-toggle='dropdown'
                    title='Notifications'       // <-- Tooltip on hover

                  >
                    <Icon
                      icon='iconoir:bell'
                      className='text-primary-light text-xl'
                    />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-lg p-0'>
                    <div className='m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-0'>
                          Notifications
                        </h6>
                      </div>
                      <span className='text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center'>
                        05
                      </span>
                    </div>
                    <div className='max-h-400-px overflow-y-auto scroll-sm pe-4'>
                      <Link
                        href='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0'>
                            <Icon
                              icon='bitcoin-icons:verify-outline'
                              className='icon text-xxl'
                            />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Congratulations
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-200-px'>
                              Your profile has been Verified. Your profile has
                              been Verified
                            </p>
                          </div>
                        </div>
                        <span className='text-sm text-secondary-light flex-shrink-0'>
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        href='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0'>
                            <img
                              src='assets/images/notification/profile-1.png'
                              alt=''
                            />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Ronald Richards
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-200-px'>
                              You can stitch between artboards
                            </p>
                          </div>
                        </div>
                        <span className='text-sm text-secondary-light flex-shrink-0'>
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        href='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-44-px h-44-px bg-info-subtle text-info-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0'>
                            AM
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Arlene McCoy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-200-px'>
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className='text-sm text-secondary-light flex-shrink-0'>
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        href='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0'>
                            <img
                              src='assets/images/notification/profile-2.png'
                              alt=''
                            />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Annette Black
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-200-px'>
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className='text-sm text-secondary-light flex-shrink-0'>
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        href='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-44-px h-44-px bg-info-subtle text-info-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0'>
                            DR
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Darlene Robertson
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-200-px'>
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className='text-sm text-secondary-light flex-shrink-0'>
                          23 Mins ago
                        </span>
                      </Link>
                    </div>
                    <div className='text-center py-12 px-16'>
                      <Link
                        href='#'
                        className='text-primary-600 fw-semibold text-md'
                      >
                        See All Notification
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Notification dropdown end */}
                <div className='dropdown'>
                  <button
                    className='d-flex justify-content-center align-items-center rounded-circle'
                    type='button'
                    data-bs-toggle='dropdown'
                    title='Profile'       // <-- Tooltip on hover

                  >
                    <Icon icon='mdi:account-circle' className='w-40-px h-40-px object-fit-cover rounded-circle' />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-sm'>
                    <div className='py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-2'>
                          {userName || "Loading..."} {/* Use a placeholder if data is unavailable */}
                        </h6>
                        <span className='text-secondary-light fw-medium text-sm'>
                          {userRole || "Loading..."} {/* Placeholder for role */}
                        </span>
                      </div>

                      <button type='button' className='hover-text-danger'>
                        <Icon
                          icon='radix-icons:cross-1'
                          className='icon text-xl'
                        />
                      </button>
                    </div>
                    <ul className='to-top-list'>
                      <>
                        {/* Only show the profile button if the user is not admin */}
                        {user && userRole !== 'admin' && (
                          <li>
                            <Link
                              href={profileLink}
                              className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                            >
                              <Icon
                                icon="solar:user-linear"
                                className="icon text-xl"
                              />
                              My Profile
                            </Link>
                          </li>
                        )}
                      </>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          href='/email'
                        >
                          <Icon
                            icon='tabler:message-check'
                            className='icon text-xl'
                          />{" "}
                          Inbox
                        </Link>
                      </li>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          href='/company'
                        >
                          <Icon
                            icon='icon-park-outline:setting-two'
                            className='icon text-xl'
                          />
                          Setting
                        </Link>
                      </li>
                      <li>
                        {!user ? (
                          <Link href="/sign-in" className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                            <Icon icon='lucide:power' className='icon text-xl' />{" "}
                            Login
                          </Link>
                        ) : (
                          <Link
                            href='#'
                            className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3'
                            onClick={handleLogout} // Attach the handleLogout function here
                          >
                            <Icon icon='lucide:power' className='icon text-xl' />{" "}
                            Log Out
                          </Link>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className='dashboard-main-body'>{children}</div>

        {/* Footer section */}
        <footer className='d-footer'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <p className='mb-0'>© 2025 Rukn Alwatikon Center. All Rights Reserved.</p>
            </div>
            <div className='col-auto'>
              <p className='mb-0'>
                Made by <span className='text-primary-600'>Eng: Ziad Elbadawi</span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </section>
  );
};

export default MasterLayout;
