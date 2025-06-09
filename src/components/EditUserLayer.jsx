'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const EditUserLayer = () => {
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [disabilityType, setDisabilityType] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState("");
  // Use a state to check if window object is available
  const [isClient, setIsClient] = useState(false);
  const patientId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
    }
  }, []);

  useEffect(() => {
    if (isClient && patientId) {
      const fetchPatient = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${patientId}`);
          setPatient(response.data);
          setName(response.data.name);
          setEmail(response.data.email);
          setPhone(response.data.phone);
          setDisabilityType(response.data.disabilityType || '');
          setAddress(response.data.address);
          setDateOfBirth(response.data.dateOfBirth || '');
          setGender(response.data.gender ) ;

        } catch (error) {
          console.error('Error fetching Student data:', error);
        }
      };
      fetchPatient(); // Fetch patient data if patientId exists
    }
  }, [isClient, patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedPatient = { name, email, phone, disabilityType, address, dateOfBirth, gender };

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-patient/${patientId}`, updatedPatient);
      if (response.status === 200) {
        alert('Student updated successfully');
        router.push('/users-list'); // Redirect back to the patient list page
      }
    } catch (error) {
      console.error('Error updating Student:', error);
      alert('Error updating Student');
    }
  };

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-8 col-lg-10">
            <div className="card border">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Full Name */}
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

                  {/* Email */}
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

                  {/* Phone */}
                  <div className="mb-20">
                    <label htmlFor="phone" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Phone
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

                  {/* Disability Type */}
                  <div className="mb-20">
                    <label htmlFor="disabilityType" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Disability Type
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      id="disabilityType"
                      value={disabilityType}
                      onChange={(e) => setDisabilityType(e.target.value)}  // Update state
                      placeholder="Enter disability type"
                    />
                  </div>

                  {/* Address */}
                  <div className="mb-20">
                    <label htmlFor="address" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Address
                    </label>
                    <textarea
                      className="form-control radius-8"
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}  // Update state
                      placeholder="Enter address"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="mb-20">
                    <label htmlFor="dateOfBirth" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="form-control radius-8"
                      id="dateOfBirth"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}  // Update state
                    />
                  </div>

                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <button type="button" className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                      onClick={() => router.push('/users-list')}  // Redirect to users list

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

export default EditUserLayer;
