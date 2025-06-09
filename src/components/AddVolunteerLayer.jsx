'use client';

import { useState } from "react";
import axios from "axios";  // To make HTTP requests
import { useRouter } from "next/navigation";

const AddVolunteerLayer = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [volunteerType, setVolunteerType] = useState("");
  const [availableHours, setAvailableHours] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      email,
      password,
      phone,
      volunteerType,
      availableHours,
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/volunteer`, data);
      if (response.status === 201) {
        alert("Volunteer added successfully");
        router.push('/volunteer-list');  // Redirect to volunteers list
      }
    } catch (error) {
      console.error("Error during volunteer registration:", error);
      alert("Error during registration. Please try again.");
    }
  };

  return (
    <div className='card h-100 p-0 radius-12'>
      <div className='card-body p-24'>
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

          {/* Password */}
          <div className="mb-20">
            <label htmlFor="pass" className="form-label fw-semibold text-primary-light text-sm mb-8">Password</label>
            <input type="password" className="form-control radius-8" id="pass" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" />
          </div>

          {/* Phone Number */}
          <div className="mb-20">
            <label htmlFor="number" className="form-label fw-semibold text-primary-light text-sm mb-8">Phone</label>
            <input type="tel" className="form-control radius-8" id="number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
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
  );
};

export default AddVolunteerLayer;
