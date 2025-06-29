'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const EditDoctorLayer = () => {
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [availability, setAvailability] = useState('Available');
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setDoctorId(params.get('id'));
    }
  }, []);

  useEffect(() => {
    if (doctorId) {
      const fetchDoctor = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/doctor/${doctorId}`);
          setDoctor(response.data);
          setUsername(response.data.username);
          setEmail(response.data.email);
          setPhone(response.data.phone);
          setTitle(response.data.title || '');
          setAvailability(response.data.availability || 'Available');
        } catch (error) {
          console.error('Error fetching doctor data:', error);
        }
      };

      fetchDoctor();
    }
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedDoctor = { username, email, phone, password, title, availability };

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-doctor/${doctorId}`, updatedDoctor);
      if (response.status === 200) {
        alert('Doctor updated successfully');
        router.push('/doctor-list');
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      alert('Error updating doctor');
    }
  };

  if (!doctor) return <div>Loading...</div>;

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-8 col-lg-10">
            <div className="card border">
              <div className="card-body">
                <h6 className="text-md text-primary-light mb-16">Edit Doctor</h6>

                <form onSubmit={handleSubmit}>
                  <div className="mb-20">
                    <label htmlFor="username" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Username <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter Username"
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
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="mb-20">
                    <label htmlFor="phone" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control radius-8"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="mb-20">
                    <label htmlFor="pass" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Password <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control radius-8"
                      id="pass"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                    />
                  </div>

                  <div className="mb-20">
  <label htmlFor="title" className="form-label">Title</label>
  <input
    id="title"
    type="text"
    className="form-control radius-8"
    value={title}
    onChange={e => setTitle(e.target.value)}
    placeholder="e.g. Cardiologist"
  />
</div>

<div className="mb-20">
  <label htmlFor="availability" className="form-label">Availability</label>
  <select
    id="availability"
    className="form-control radius-8"
    value={availability}
    onChange={e => setAvailability(e.target.value)}
  >
    <option>Available</option>
    <option>Not Available</option>
  </select>
</div>


                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <button
                      type="button"
                      className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                      onClick={() => router.push('/doctor-list')}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8">
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

export default EditDoctorLayer;
