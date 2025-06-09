'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Icon } from "@iconify/react/dist/iconify.js";
import jwt_decode from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const PublicProfilepatient = () => {
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [disabilityType, setDisabilityType] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [evaluations, setEvaluations] = useState([]);  // Store evaluations
  const [service, setService] = useState('');
  const [evolutionNote, setEvolutionNote] = useState('');
  const [numberOfWeeks, setNumberOfWeeks] = useState('');
  const [sessionsPerWeek, setSessionsPerWeek] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showEvaluationSummary, setShowEvaluationSummary] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentType, setPaymentType] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);



  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwt_decode(token);
        const userId = decodedToken?.id;

        const patientResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${userId}`);
        setPatient(patientResponse.data);

        const sessionResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/sessions/${userId}`);
        setSessions(sessionResponse.data);
        const pending = sessionResponse.data.filter(s => s.status === 'Pending');
        setTotalPrice(pending.reduce((acc, s) => acc + s.price, 0));

      } catch (error) {
        console.error("Error fetching patient or session data", error);
      }
    };

    fetchPatientData();
  }, []);

  const handlePayAllSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwt_decode(token);
      const patientId = decodedToken.id;
  
      const pendingSessions = sessions.filter(session => session.status === 'Pending');
  
      if (pendingSessions.length === 0) {
        toast.error('No pending sessions to pay for!');
        return;
      }
  
      // Update session statuses
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/mark-all-sessions-completed/${patientId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // Prepare payment data
      const payments = pendingSessions.map(session => ({
        patient: patientId, // ✅ correct field name
        method: 'cash',
        price: Math.floor(session.price * 0.9),
        type: 'session',
        referenceId: session._id,
        note: 'This is One-Time Payment with 10% Discount'
      }));
  
      // Send payment records
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/payments/bulk`, { payments }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      toast.success('Payment completed and sessions updated!');
      router.push('/profile');
    } catch (error) {
      console.error('Error in One-Time Payment:', error);
      toast.error('Payment failed!');
    }
  };
  



  // Handle Pay Now for a specific session
  const handlePayPerSession = (sessionId) => {
    // Store the actual session ID from the session data
    const paymentData = {
      paymentType: 'per-session',
      selectedSession: sessionId, // Use the actual session _id
    };

    localStorage.setItem('paymentData', JSON.stringify(paymentData)); // Save payment data
    router.push('/pay2');
  };


  // Check if the user is logged in and has the "patient" role
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token retrieved from localStorage:', token);

    if (!token) {
      alert('You must log in to access this page');
      router.push('/sign-in');  // Redirect to login if not logged in
      return;
    }

    // Decode the token to check the role
    try {
      console.log('Decoding token...');
      const decodedToken = jwt_decode(token);
      console.log('Decoded token:', decodedToken);

      const userRole = decodedToken?.role;
      const userId = decodedToken?.id;

      if (!userRole || !userId || userRole !== 'patient') {
        alert('You must be a patient to access this page');
        router.push('/sign-in');  // Redirect if user is not a patient
        return;
      }

      setPatientId(userId);  // Store the patient ID from the token

      // Fetch patient data
      // Fetch patient data
      const fetchPatient = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const data = response.data;
          setPatient(data);
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone);
          setDisabilityType(data.disabilityType || '');
          setAddress(data.address);
          setDateOfBirth(data.dateOfBirth || '');

          // ✅ Optionally, set individual state variables for display
          setService(data.service || '');
          setEvolutionNote(data.evolutionNote || '');
          setNumberOfWeeks(data.numberOfWeeks || 0);
          setSessionsPerWeek(data.sessionsPerWeek || 0);

        } catch (error) {
          console.error('Error fetching patient data:', error);
        }
      };
      fetchPatient();

      const fetchEvaluations = async () => {
        try {
          const evalResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/evaluations/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEvaluations(evalResponse.data);  // Set evaluations data
        } catch (error) {
          console.error('Error fetching evaluations:', error);
        }
      };

      fetchEvaluations();

      const fetchSessions = async () => {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/sessions/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSessions(res.data);
        } catch (err) {
          console.error("Error fetching sessions:", err);
        }
      };
      fetchSessions();



    }

    catch (error) {
      console.error('Invalid token:', error);
      alert('Invalid or expired token');
      router.push('/sign-in');
    }
  }, [router]);

  // Password visibility toggle
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  // Handle form submission for profile updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedPatient = { name, email, phone, address, dateOfBirth };

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-patient/${patientId}`, updatedPatient);
      if (response.status === 200) {
        alert('Patient updated successfully');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Error updating patient');
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-password/${patientId}`, { password: newPassword });
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

  // Loading state until patient data is fetched
  if (!patient) return <div>Loading...</div>;

  return (
    <>

      {/* Toast Container for displaying messages */}
      <ToastContainer />
      <div className="row gy-4">
        <div className="col-lg-4">
          <div className="user-grid-card position-relative border radius-16 overflow-hidden bg-base h-100">
            <img src="assets/images/user-grid/user-grid-bg1.png" alt="" className="w-100 object-fit-cover" />
            <div className="pb-24 ms-16 mb-24 me-16 mt--100">
              <div className="text-center border border-top-0 border-start-0 border-end-0">
                <img src="assets/images/user-grid/user-grid-img14.png" alt="" className="border br-white border-width-2-px w-200-px h-200-px rounded-circle object-fit-cover" />
                <h6 className="mb-0 mt-16">{name}</h6>
                <span className="text-secondary-light mb-16">{email}</span>
              </div>
              <div className="mt-24">
                <h6 className="text-xl mb-16">Personal Info</h6>
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
                    <span className="w-30 text-md fw-semibold text-primary-light">Disability Type</span>
                    <span className="w-70 text-secondary-light fw-medium">: {disabilityType || 'Not provided'}</span>
                  </li>
                  <li className="d-flex align-items-center gap-1 mb-12">
                    <span className="w-30 text-md fw-semibold text-primary-light">Date of Birth</span>
                    <span className="w-70 text-secondary-light fw-medium">: {dateOfBirth || 'Not provided'}</span>
                  </li>
                  <li className="d-flex align-items-center gap-1">
                    <span className="w-30 text-md fw-semibold text-primary-light">Address</span>
                    <span className="w-70 text-secondary-light fw-medium">: {address || 'Not provided'}</span>
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
                  <button className="nav-link d-flex align-items-center px-24 active" id="pills-edit-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-edit-profile" type="button" role="tab" aria-controls="pills-edit-profile" aria-selected="true">
                    Edit Profile
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link d-flex align-items-center px-24" id="pills-change-passwork-tab" data-bs-toggle="pill" data-bs-target="#pills-change-passwork" type="button" role="tab" aria-controls="pills-change-passwork" aria-selected="false" tabIndex={-1}>
                    Change Password
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link d-flex align-items-center px-24" id="pills-evaluations-tab" data-bs-toggle="pill" data-bs-target="#pills-evaluations" type="button" role="tab" aria-controls="pills-evaluations" aria-selected="false">
                    My Evaluation
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link d-flex align-items-center px-24" id="pills-sessions-tab" data-bs-toggle="pill" data-bs-target="#pills-sessions" type="button" role="tab" aria-controls="pills-sessions" aria-selected="false">
                    My Sessions
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
                      <input type="text" className="form-control radius-8" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Full Name" />
                    </div>
                    <div className="mb-20">
                      <label htmlFor="email" className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Email <span className="text-danger-600">*</span>
                      </label>
                      <input type="email" className="form-control radius-8" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" />
                    </div>
                    <div className="mb-20">
                      <label htmlFor="phone" className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Phone Number <span className="text-danger-600">*</span>
                      </label>
                      <input type="tel" className="form-control radius-8" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
                    </div>

                    <div className="mb-20">
                      <label htmlFor="address" className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Address
                      </label>
                      <textarea className="form-control radius-8" id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" />
                    </div>
                    <div className="mb-20">
                      <label htmlFor="dateOfBirth" className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Date of Birth
                      </label>
                      <input type="date" className="form-control radius-8" id="dateOfBirth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                    </div>
                    <div className="d-flex align-items-center justify-content-center gap-3">
                      <button type="button" className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8" onClick={() => router.push('/users-list')}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
                <div className="tab-pane fade" id="pills-change-passwork" role="tabpanel" aria-labelledby="pills-change-passwork-tab" tabIndex="0">
                  <form onSubmit={handlePasswordChange}>
                    <div className="mb-20">
                      <label htmlFor="your-password" className="form-label fw-semibold text-primary-light text-sm mb-8">
                        New Password <span className="text-danger-600">*</span>
                      </label>
                      <div className="position-relative">
                        <input type={passwordVisible ? "text" : "password"} className="form-control radius-8" id="your-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter New Password*" />
                        <span onClick={togglePasswordVisibility}></span>
                      </div>
                    </div>
                    <div className="mb-20">
                      <label htmlFor="confirm-password" className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Confirm Password <span className="text-danger-600">*</span>
                      </label>
                      <div className="position-relative">
                        <input type={confirmPasswordVisible ? "text" : "password"} className="form-control radius-8" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password*" />
                        <span onClick={toggleConfirmPasswordVisibility}></span>
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

                <div className="tab-pane fade" id="pills-evaluations" role="tabpanel" aria-labelledby="pills-evaluations-tab" tabIndex="0">
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
                      <h4 className="mb-0">
                        📋 Booked Evaluation Summary
                      </h4>
                      <button
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                        onClick={() => setShowEvaluationSummary(prev => !prev)}
                        aria-label="Toggle evaluation summary"
                      >
                        <span className="me-1">{showEvaluationSummary ? 'Hide' : 'Show'}</span>
                        <span style={{ fontSize: '1rem' }}>
                          {showEvaluationSummary ? '▲' : '▼'}
                        </span>
                      </button>
                    </div>

                    {showEvaluationSummary && (
                      <>
                        {evaluations.length > 0 ? (
                          evaluations.map((evaluation, index) => (
                            <div key={index} className="card bg-light border p-20 radius-12 mb-24">
                              <h6 className="mb-3 text-success">✅ You’ve successfully booked your evaluation!</h6>
                              <div className="row gy-2">
                                <div className="col-sm-6"><strong>Date:</strong> {new Date(evaluation.date).toLocaleDateString()}</div>
                                <div className="col-sm-6"><strong>Time:</strong> {evaluation.time}</div>
                                <div className="col-12"><strong>Description:</strong> {evaluation.description}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-muted">No evaluation booked yet.</div>
                        )}
                      </>
                    )}
                  </div>

                  <hr className="my-32" />
                  <h4 className="mb-20">🩺 Doctor’s Evaluation Summary</h4>

                  {service || evolutionNote ? (
                    <div className="bg-white p-20 border radius-12 shadow-sm mb-32">
                      <div className="row gy-3">
                        <div className="col-sm-6"><strong>Disability Type:</strong> {disabilityType || 'N/A'}</div>
                        <div className="col-sm-6"><strong>Service:</strong> {service || 'N/A'}</div>
                        <div className="col-sm-6"><strong>Weeks:</strong> {numberOfWeeks}</div>
                        <div className="col-sm-6"><strong>Sessions Per Week:</strong> {sessionsPerWeek}</div>
                        <div className="col-sm-6"><strong>Total Sessions:</strong> {sessionsPerWeek * numberOfWeeks}</div>

                        <div className="col-12 mt-7">
                          <strong>Doctor’s Notes:</strong>
                          <div className="bg-light border radius-8 p-12 mt-10">
                            {evolutionNote || <em>No notes added yet.</em>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted mb-4">No evaluation summary available yet.</div>
                  )}
                  {/* 📅 Scheduled Sessions Table */}

                  <h5 className="mt-40 mb-20">📅 Your Scheduled Sessions</h5>
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped text-sm">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Price</th>
                          <th>Payment</th>
                          <th>Completed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session, index) => (
                          <tr key={session._id}>
                            <td>{index + 1}</td>
                            <td>{new Date(session.date).toLocaleDateString()}</td>
                            <td>{session.time}</td>
                            <td>{session.price} EGP</td>
                            <td>{session.status}</td>
                            <td>{session.done ? '✔️' : '❌'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>


                  {/* 💳 Payment Options */}
                  {sessions.length > 0 && (
                    <>
                      <div className="container py-5">
                        <h4 className="mt-40 mb-16">💳 Payment Options</h4>
                        <div className="row g-3">
  {sessions.filter(s => s.status === 'Pending').length >= 3 && (
    <div className="col-md-6">
      <div className="card border border-success p-16 radius-12">
        <h6 className="text-success mb-2">One-Time Payment (10% Discount)</h6>
        <p className="text-muted small mb-2">
          Pay for all sessions now and get a 10% discount on the total price.
        </p>
        <p><strong>
          Total: {Math.floor(totalPrice * 0.9)} EGP
        </strong></p>
        <button className="btn btn-success btn-sm mt-2" onClick={() => handlePayAllSessions('one-time')}>Pay Now</button>
      </div>
    </div>
  )}

  <div className={sessions.filter(s => s.status === 'Pending').length < 3 ? 'col-md-12' : 'col-md-6'}>
    <div className="card border border-primary p-16 radius-12">
      <h6 className="text-primary mb-2">Pay per Session</h6>
      <p className="text-muted small">Pay for each session before attending.</p>

      {sessions
        .filter(session => session.status === 'Pending')
        .map((session, index) => (
          <div key={session._id} className="d-flex justify-content-between align-items-center mb-2">
            <span>{index + 1}- {new Date(session.date).toLocaleDateString()} - {session.time}</span>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => handlePayPerSession(session._id)}
            >
              Pay Now
            </button>
          </div>
        ))}
    </div>
  </div>
</div>

                      </div>

                    </>
                  )}
                </div>

                <div className="tab-pane fade" id="pills-sessions" role="tabpanel" aria-labelledby="pills-sessions-tab" tabIndex="0">
                  <h5 className="mb-20">Session Notes</h5>

                  {sessions.length > 0 ? (
                    <div className="nav nav-tabs mb-3" id="sessionTabs" role="tablist">
                      {sessions.map((session, index) => (
                        <button
                          key={index}
                          className={`nav-link ${index === 0 ? 'active' : ''}`}
                          id={`session-tab-${index}`}
                          data-bs-toggle="tab"
                          data-bs-target={`#session-pane-${index}`}
                          type="button"
                          role="tab"
                          aria-controls={`session-pane-${index}`}
                          aria-selected={index === 0}
                        >
                          Session {index + 1}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted">No sessions yet.</div>
                  )}

                  <div className="tab-content" id="sessionTabContent">
                    {sessions.map((session, index) => (
                      <div
                        key={index}
                        className={`tab-pane fade ${index === 0 ? 'show active' : ''}`}
                        id={`session-pane-${index}`}
                        role="tabpanel"
                        aria-labelledby={`session-tab-${index}`}
                      >
                        <div className="card border radius-16 p-20 mb-32 bg-light">
                          <h6 className="mb-3 text-primary">Session {index + 1} Details</h6>
                          <div className="row gy-2">
                            <div className="col-md-6">
                              <strong>Date:</strong> <div>{new Date(session.date).toLocaleDateString()}</div>
                            </div>
                            <div className="col-md-6">
                              <strong>Time:</strong> <div>{session.time || 'N/A'}</div>
                            </div>
                            <div className="col-md-6">
                              <strong>Price:</strong> <div>{session.price || 0} EGP</div>
                            </div>
                            <div className="col-md-6">
                              <strong>payment:</strong> <div>{session.status}</div>
                            </div>
                            <div className="col-md-6">
                              <strong>Completed:</strong> <div>{session.done ? '✔️ Yes' : '❌ No'}</div>
                            </div>
                            <div className="col-12 mt-3">
                              <strong>Session Note:</strong>
                              <div className="bg-white p-12 radius-8 border mt-2" style={{ minHeight: "80px" }}>
                                {session.note ? session.note : <em>No note provided.</em>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  );
};

export default PublicProfilepatient;
