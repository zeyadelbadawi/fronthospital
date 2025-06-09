'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react/dist/iconify.js";

const AdminVolunteerProfileLayer = () => {
  const router = useRouter();
  const [volunteer, setVolunteer] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [volunteerType, setVolunteerType] = useState('');
  const [availableHours, setAvailableHours] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [volunteerId, setVolunteerId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setVolunteerId(params.get('id'));
    }
  }, []);

  useEffect(() => {
    if (volunteerId) {
      const fetchVolunteer = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/volunteer/${volunteerId}`);
          setVolunteer(response.data);
          setName(response.data.name);
          setEmail(response.data.email);
          setPhone(response.data.phone);
          setVolunteerType(response.data.volunteerType || '');
          setAvailableHours(response.data.availableHours || '');
        } catch (error) {
          console.error('Error fetching volunteer data:', error);
        }
      };

      fetchVolunteer();
    }
  }, [volunteerId]);



  

  // Handle form submission for profile updates
  // Handle form submission for profile updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedVolunteer = { name, email, phone, volunteerType, availableHours };

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-volunteer/${volunteerId}`, updatedVolunteer);
      if (response.status === 200) {
        alert('Volunteer updated successfully');
        router.push('/volunteer-list'); // Redirect to volunteer list
      }
    } catch (error) {
      console.error('Error updating volunteer:', error);
      alert('Error updating volunteer');
    }
  };


  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/volunteer-password/${volunteerId}`, { password: newPassword });
      if (response.status === 200) {
        alert('Password updated successfully');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Error updating password');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };




  if (!volunteer) return <div>Loading...</div>;

  return (
    <div className="row gy-4">
      <div className="col-lg-4">
        <div className="user-grid-card position-relative border radius-16 overflow-hidden bg-base h-100">
          <img
            src="assets/images/user-grid/user-grid-bg1.png"
            alt=""
            className="w-100 object-fit-cover"
          />
          <div className="pb-24 ms-16 mb-24 me-16 mt--100">
            <div className="text-center border border-top-0 border-start-0 border-end-0">
              <img
                src="assets/images/user-grid/user-grid-img14.png"
                alt=""
                className="border br-white border-width-2-px w-200-px h-200-px rounded-circle object-fit-cover"
              />
              <h6 className="mb-0 mt-16">{name}</h6>
              <span className="text-secondary-light mb-16">{email}</span>
            </div>
            <div className="mt-24">
              <h6 className="text-xl mb-16">Volunteer Info</h6>
              <ul>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-md fw-semibold text-primary-light">Full Name</span>
                  <span className="w-70 text-secondary-light fw-medium">: {name}</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-md fw-semibold text-primary-light">Email</span>
                  <span className="w-70 text-secondary-light fw-medium">: {email}</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-md fw-semibold text-primary-light">Phone Number</span>
                  <span className="w-70 text-secondary-light fw-medium">: {phone}</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-md fw-semibold text-primary-light">Volunteer Type</span>
                  <span className="w-70 text-secondary-light fw-medium">: {volunteerType || 'Not specified'}</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-md fw-semibold text-primary-light">Available Hours</span>
                  <span className="w-70 text-secondary-light fw-medium">: {availableHours || 'Not specified'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="card h-100">
          <div className="card-body p-24">
            <ul className="nav border-gradient-tab nav-pills mb-20 d-inline-flex" id="pills-tab" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link d-flex align-items-center px-24 active"
                  id="pills-edit-profile-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-edit-profile"
                  type="button"
                  role="tab"
                  aria-controls="pills-edit-profile"
                  aria-selected="true"
                >
                  Edit Profile
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link d-flex align-items-center px-24"
                  id="pills-change-passwork-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-change-passwork"
                  type="button"
                  role="tab"
                  aria-controls="pills-change-passwork"
                  aria-selected="false"
                  tabIndex={-1}
                >
                  Change Password
                </button>
              </li>
            </ul>
            <div className="tab-content" id="pills-tabContent">
              <div className="tab-pane fade show active" id="pills-edit-profile" role="tabpanel" aria-labelledby="pills-edit-profile-tab" tabIndex={0}>
              <form onSubmit={handleSubmit}>
                  <div className="mb-20">
                    <label htmlFor="name" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Full Name <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}  // Update state
                      placeholder="Enter Full Name"
                    />
                  </div>
                  <div className="mb-20">
                    <label htmlFor="email" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Email <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control radius-8"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}  // Update state
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="mb-20">
                    <label htmlFor="phone" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Phone Number <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control radius-8"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}  // Update state
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="mb-20">
                    <label htmlFor="volunteerType" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Volunteer Type
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      id="volunteerType"
                      value={volunteerType}
                      onChange={(e) => setVolunteerType(e.target.value)}  // Update state
                      placeholder="Enter volunteer type"
                    />
                  </div>
                  <div className="mb-20">
                    <label htmlFor="availableHours" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Available Hours
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      id="availableHours"
                      value={availableHours}
                      onChange={(e) => setAvailableHours(e.target.value)}  // Update state
                      placeholder="Enter available hours"
                    />
                  </div>
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <button
                      type="button"
                      className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                      onClick={() => router.push('/volunteer-list')}  // Redirect to volunteer list
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
              {/* Password Change Section */}
              <div className="tab-pane fade" id="pills-change-passwork" role="tabpanel" aria-labelledby="pills-change-passwork-tab" tabIndex="0">
              <form onSubmit={handlePasswordChange}>
                  {/* New Password */}
                  <div className="mb-20">
                    <label htmlFor="your-password" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      New Password <span className="text-danger-600">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        className="form-control radius-8"
                        id="your-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter New Password*"
                      />
                      <span
                        className={`toggle-password ${passwordVisible ? "ri-eye-off-line" : "ri-eye-line"} cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                        onClick={togglePasswordVisibility}
                      ></span>
                    </div>
                  </div>
                  <div className="mb-20">
                    <label htmlFor="confirm-password" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Confirm Password <span className="text-danger-600">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        type={confirmPasswordVisible ? "text" : "password"}
                        className="form-control radius-8"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password*"
                      />
                      <span
                        className={`toggle-password ${confirmPasswordVisible ? "ri-eye-off-line" : "ri-eye-line"} cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                        onClick={toggleConfirmPasswordVisibility}
                      ></span>
                    </div>
                  </div>

                  

                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <button type="button" className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8">
                      Save Password
                    </button>
                  </div>
                </form>
              </div>             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVolunteerProfileLayer;
