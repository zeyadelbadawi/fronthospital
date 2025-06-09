'use client';

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AddAccountantLayer = () => {
  const [name, setname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { name, email, password };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/accountant`, data);
      if (response.status === 201) {
        alert("accountant added successfully");
        router.push('/accountant-list');
      }
    } catch (error) {
      console.error("Error during accountant registration:", error);
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
                <h6 className='text-md text-primary-light mb-16'>Add Accountant</h6>

                <form onSubmit={handleSubmit}>
                  <div className='mb-20'>
                    <label htmlFor='name' className='form-label fw-semibold text-primary-light text-sm mb-8'>
                    name <span className='text-danger-600'>*</span>
                    </label>
                    <input
                      type='text'
                      className='form-control radius-8'
                      id='name'
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                      placeholder='Enter name'
                    />
                  </div>

                  <div className='mb-20'>
                    <label htmlFor='email' className='form-label fw-semibold text-primary-light text-sm mb-8'>
                      Email <span className='text-danger-600'>*</span>
                    </label>
                    <input
                      type='email'
                      className='form-control radius-8'
                      id='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='Enter email address'
                    />
                  </div>

                  
                  <div className='mb-20'>
                    <label htmlFor='pass' className='form-label fw-semibold text-primary-light text-sm mb-8'>
                      Password <span className='text-danger-600'>*</span>
                    </label>
                    <input
                      type='password'
                      className='form-control radius-8'
                      id='pass'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder='Enter Password'
                    />
                  </div>

                  <div className='d-flex align-items-center justify-content-center gap-3'>
                    <button
                      type='button'
                      className='border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8'
                      onClick={() => router.push('/accountant-list')}
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

export default AddAccountantLayer;
