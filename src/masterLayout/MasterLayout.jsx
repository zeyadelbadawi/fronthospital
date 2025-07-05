"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import Link from "next/link";
import axiosInstance from "../helper/axiosSetup"; // Import the configured axios instance
import { Icon } from '@iconify/react'
import useSocket from "@/hooks/useSocket";
import { formatDistanceToNow } from "date-fns";


const MasterLayout = ({ children }) => {
  // const router = useRouter();
  const [user, setUser] = useState(null);
  let [isClick, setIsClick] = useState(false);
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
        setUserRole(userData.role); // Get the role (admin, doctor, or patient)
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


  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);

  useSocket(user?.id, ({ count, notifications }) => {
    setNotifications(notifications);
    setCount(count);
  });

  const getNotifications = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/notification/byId/${user?.id}`
      );
      setNotifications(response.data.notifications || []);
      setCount(response.data.count || 0);
      console.log("Fetched notifications:", response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    // Fetch initial data on mount
    if (!user?.id) return;

    getNotifications();
  }, [user?.id]);

  const notificationClick = async (noteId) => {
    try {
      axiosInstance
        .put(`${process.env.NEXT_PUBLIC_API_URL}/notification/read/${noteId}`)
        .then((response) => {
          getNotifications();
          console.log("Notification marked as read:", response.data);
        });
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  /* --------------end Notifications--------------- */


  // Determine the profile link based on the role
  let profileLink = ' ';  // Default profile page

  if (userRole === 'patient') {
    profileLink = '/profile';
  } else if (userRole === 'doctor') {
    profileLink = '/profile-doctor';
  } else if (userRole === 'accountant') {
    profileLink = '/profile-accountant';
  }
  // Logic for profile redirection based on user role
  const handleProfileRedirect = () => {
    if (userRole === 'patient') {
      <Link href="/profile"></Link>
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

          </Link>
        </div>
        <div className='sidebar-menu-area'>
          <ul className='sidebar-menu' id='sidebar-menu'>
            <li className='sidebar-menu-group-title' style={{ color: 'blue' }}>Home</li>
            <li>
              <Link
                href='/'
                className={pathname === "/" ? "active-page" : ""}>
                <Icon icon='solar:home-smile-angle-outline' className='menu-icon' />
                <span>Statistics</span>
              </Link>
            </li>
            <li className='sidebar-menu-group-title' style={{ color: 'blue' }}>All Programs</li>
            <li>
              <Link
                href='/full-program'
                className={pathname === "/full-program" ? "active-page" : ""}>
                <Icon icon='bi:chat-dots' className='menu-icon' />
                <span>full Programs</span>
              </Link>
            </li>
            <li>
              <Link
                href='/single-session'
                className={pathname === "/single-session" ? "active-page" : ""}>
                <Icon icon='bi:chat-dots' className='menu-icon' />
                <span>Single Programs</span>
              </Link>
            </li>
            <li>
              <Link
                href='/school'
                className={pathname === "/school" ? "active-page" : ""}>
                <Icon icon='bi:chat-dots' className='menu-icon' />
                <span>School Evaluations</span>
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
            <li className='sidebar-menu-group-title' style={{ color: 'blue' }}>Full Program schedule</li>
            <li>
              <Link
                href='/calendar-main'
                className={pathname === "/calendar-main" ? "active-page" : ""}>
                <Icon icon='solar:calendar-outline' className='menu-icon' />
                <span>Show schedule</span>
              </Link>
            </li>
            <li>
              <Link
                href='/full-program-appointments'
                className={pathname === "/full-program-appointments" ? "active-page" : ""}>
                <Icon icon='bi:chat-dots' className='menu-icon' />
                <span>update schedule</span>
              </Link>
            </li>
            <li className='sidebar-menu-group-title' style={{ color: 'blue' }}>All Users</li>
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

            <li className='sidebar-menu-group-title' style={{ color: 'blue' }}>payment reports</li>
            <li>
              <Link
                href='/Payment-Transactions'
                className={pathname === "/Payment-Transactions" ? "active-page" : ""}>
                <Icon icon='bi:chat-dots' className='menu-icon' />
                <span> Payment Management System</span>
              </Link>
            </li>
            <li>
              <Link
                href='/table-data'
                className={pathname === "/table-data" ? "active-page" : ""}>
                <Icon icon='bi:chat-dots' className='menu-icon' />
                <span>Checks Management System</span>
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

                {/* Language dropdown end */}

                {/* notification dropdown start */}


                {/* ------------------------------------------------------------------------------------------------ */}

                <div className="dropdown">
                  <button
                    className="has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center position-relative"
                    type="button"
                    onClick={() => setIsClick(!isClick)}
                    title="Notifications"
                  >
                    <Icon
                      icon="iconoir:bell"
                      className="text-primary-light text-xl"
                    />
                    {count > 0 && (
                      <span
                        className="position-absolute top-2 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.8rem", minWidth: "1rem" }}
                      >
                        {count > 10 ? "10+" : count}
                        <span className="visually-hidden">unread messages</span>
                      </span>
                    )}
                  </button>

                  <div
                    className={`zindex-100 dropdown-menu ${isClick ? "show" : ""
                      } dropdown-menu-lg p-0`}
                    style={{
                      left: "-360px",
                    }}
                  >
                    <div className="m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-0">
                          Notifications
                        </h6>
                      </div>
                      <span className="text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center">
                        {notifications.length}
                      </span>
                    </div>

                    <div className="max-h-400-px overflow-y-scroll scroll-sm pe-4">
                      {notifications?.map((item) => (
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!item.isRead) {
                              notificationClick(item._id);
                            }
                          }}
                          key={item._id}
                          className="cursor-pointer bg-hover-info-50 px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between  position-relative"
                        >
                          <div className="text-black d-flex align-items-center gap-3">
                            <span className="position-relative w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                              <Icon
                                icon="bitcoin-icons:verify-outline"
                                className="icon text-xxl"
                              />
                              {!item.isRead && (
                                <span
                                  className="position-absolute bg-danger rounded-circle"
                                  style={{
                                    width: "10px",
                                    height: "10px",
                                    top: "0px",
                                    left: "0px",
                                    transform: "translate(-20%, -20%)",
                                  }}
                                />
                              )}
                            </span>
                            <div>
                              <h6 className="text-md fw-semibold mb-4">
                                {item.title}
                              </h6>
                              <p className="mb-0 text-sm text-secondary-light">
                                {item.message}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-secondary-light ">
                            {formatDistanceToNow(new Date(item.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {/* <div className="d-flex flex-row h-100 align-items-start justify-content-start">
                            
                            <div className="m-1"></div>

                            {!item.isRead && (
                              <div className="ms-auto">
                                <div
                                  className="d-flex align-items-center justify-content-center border border-2"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <Check size={16} />
                                </div>
                              </div>
                            )}
                          </div> */}

                          {/*  <div className="d-flex h-100 align-items-start justify-content-between  ">
                            <div className="ms-auto d-flex flex-column align-items-end">
                              {!item.isRead && (
                                <div
                                  className="cursor-pointer d-flex align-items-center justify-content-center border border-2 mt-2"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <Check size={16} />
                                </div>
                              )}
                              <span className="text-sm text-secondary-light">
                                {formatDistanceToNow(new Date(item.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div> */}
                        </div>
                      ))}
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
