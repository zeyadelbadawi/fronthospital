'use client';

import { useState } from "react";
import axios from "axios";  // To make HTTP requests

const AddUserLayer = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      email,
      password,
      phone,
      address,
      gender,
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/patient`, data);
      if (response.status === 201) {
        alert("Patient added successfully");
      }
    } catch (error) {
      console.error("Error during patient registration:", error);
      alert("Error during registration. Please try again.");
    }
  };

  return (
    <div className='card h-100 p-0 radius-12'>
      <div className='card-body p-24'>
        <div className='row justify-content-center'>
          <div className='col-xxl-6 col-xl-8 col-lg-10'>
            <div className='card border'>
              <div className='card-body'>
                <h6 className='text-md text-primary-light mb-16'>Add Student</h6>

                <form onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className='mb-20'>
                    <label htmlFor='name' className='form-label fw-semibold text-primary-light text-sm mb-8'>
                      Full Name <span className='text-danger-600'>*</span>
                    </label>
                    <input
                      type='text'
                      className='form-control radius-8'
                      id='name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}  // Update state
                      placeholder='Enter Full Name'
                    />
                  </div>

                  {/* Email */}
                  <div className='mb-20'>
                    <label htmlFor='email' className='form-label fw-semibold text-primary-light text-sm mb-8'>
                      Email <span className='text-danger-600'>*</span>
                    </label>
                    <input
                      type='email'
                      className='form-control radius-8'
                      id='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}  // Update state
                      placeholder='Enter email address'
                    />
                  </div>

                  {/* Password */}
                  <div className='mb-20'>
                    <label htmlFor='pass' className='form-label fw-semibold text-primary-light text-sm mb-8'>
                      Password <span className='text-danger-600'>*</span>
                    </label>
                    <input
                      type='password'
                      className='form-control radius-8'
                      id='pass'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}  // Update state
                      placeholder='Enter Password'
                    />
                  </div>

                  {/* Phone Number */}
                  <div className='mb-20'>
                    <label htmlFor='number' className='form-label fw-semibold text-primary-light text-sm mb-8'>
                      Phone
                    </label>
                    <input
                      type='tel'
                      className='form-control radius-8'
                      id='number'
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}  // Update state
                      placeholder='Enter phone number'
                    />
                  </div>

                  {/* Address */}
                  <div className='mb-20'>
                    <label htmlFor='address' className='form-label fw-semibold text-primary-light text-sm mb-8'>
                      Address
                    </label>
                    <textarea
                      className='form-control radius-8'
                      id='address'
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}  // Update state
                      placeholder='Write address...'
                    />
                  </div>

                  <div className="mb-20">
  <label htmlFor="gender" className="form-label">gender</label>
  <select
    id="gender"
    className="form-control radius-8"
    value={gender}
    onChange={e => setGender(e.target.value)}
  >
                          <option disabled value="">
                        -- Select Gender --
                      </option>
    <option>male</option>
    <option>female</option>
  </select>
</div>

             

                  <div className='d-flex align-items-center justify-content-center gap-3'>
                    <button
                      type='button'
                      className='border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8'
                      onClick={() => router.push('/users-list')}  // Redirect to users list

                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8'
                    >
                      Save
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

export default AddUserLayer;
