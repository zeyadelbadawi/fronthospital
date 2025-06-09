'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const EditVolunteerLayer = () => {
  const router = useRouter();
  const [volunteer, setVolunteer] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [volunteerType, setVolunteerType] = useState('');
  const [availableHours, setAvailableHours] = useState('');

  const [isClient, setIsClient] = useState(false);
  const volunteerId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
    }
  }, []);

  useEffect(() => {
    if (isClient && volunteerId) {
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
  }, [isClient, volunteerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedVolunteer = { name, email, phone, volunteerType, availableHours };

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-volunteer/${volunteerId}`, updatedVolunteer);
      if (response.status === 200) {
        alert('Volunteer updated successfully');
        router.push('/volunteer-list');
      }
    } catch (error) {
      console.error('Error updating volunteer:', error);
      alert('Error updating volunteer');
    }
  };

  if (!volunteer) return <div>Loading...</div>;

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-8 col-lg-10">
            <div className="card border">
              <div className="card-body">
                <h6 className="text-md text-primary-light mb-16">Edit Volunteer</h6>
                <form onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className="mb-20">
                    <label htmlFor="name" className="form-label fw-semibold text-primary-light text-sm mb-8">Full Name</label>
                    <input type="text" className="form-control radius-8" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Full Name" />
                  </div>

                  {/* Email */}
                  <div className="mb-20">
                    <label htmlFor="email" className="form-label fw-semibold text-primary-light text-sm mb-8">Email</label>
                    <input type="email" className="form-control radius-8" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" />
                  </div>

                  {/* Phone */}
                  <div className="mb-20">
                    <label htmlFor="phone" className="form-label fw-semibold text-primary-light text-sm mb-8">Phone</label>
                    <input type="tel" className="form-control radius-8" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
                  </div>

                  {/* Volunteer Type */}
                  <div className="mb-20">
                    <label htmlFor="volunteerType" className="form-label fw-semibold text-primary-light text-sm mb-8">Volunteer Type</label>
                    <input type="text" className="form-control radius-8" id="volunteerType" value={volunteerType} onChange={(e) => setVolunteerType(e.target.value)} placeholder="Enter volunteer type" />
                  </div>

                  {/* Available Hours */}
                  <div className="mb-20">
                    <label htmlFor="availableHours" className="form-label fw-semibold text-primary-light text-sm mb-8">Available Hours</label>
                    <input type="text" className="form-control radius-8" id="availableHours" value={availableHours} onChange={(e) => setAvailableHours(e.target.value)} placeholder="Enter available hours" />
                  </div>

                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <button type="button" className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8" onClick={() => router.push('/volunteer-list')}>Cancel</button>
                    <button type="submit" className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8">Save</button>
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

export default EditVolunteerLayer;
