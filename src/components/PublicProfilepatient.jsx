'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Lock, FileText, Activity, DollarSign, Eye, EyeOff, Save, X, CheckCircle, Clock, CreditCard, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';
import FullProgramComponent from './FullProgramComponent';
import styles from '../styles/profile-view.module.css';

const PublicProfilepatient = ({patientID}) => {
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
  const [evaluations, setEvaluations] = useState([]);
  const [service, setService] = useState('');
  const [evolutionNote, setEvolutionNote] = useState('');
  const [numberOfWeeks, setNumberOfWeeks] = useState('');
  const [sessionsPerWeek, setSessionsPerWeek] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showEvaluationSummary, setShowEvaluationSummary] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentType, setPaymentType] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState('edit-profile');
  const [loading, setLoading] = useState(true);

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
      
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/mark-all-sessions-completed/${patientId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const payments = pendingSessions.map(session => ({
        patient: patientId,
        method: 'cash',
        price: Math.floor(session.price * 0.9),
        type: 'session',
        referenceId: session._id,
        note: 'This is One-Time Payment with 10% Discount'
      }));
      
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

  const handlePayPerSession = (sessionId) => {
    const paymentData = {
      paymentType: 'per-session',
      selectedSession: sessionId,
    };
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
    router.push('/pay2');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must log in to access this page');
      router.push('/sign-in');
      return;
    }

    try {
      const decodedToken = jwt_decode(token);
      const userRole = decodedToken?.role;
      const userId = decodedToken?.id;
      
      if (!userRole || !userId || userRole !== 'patient') {
        toast.error('You must be a patient to access this page');
        router.push('/sign-in');
        return;
      }
      
      setPatientId(userId);

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
          setService(data.service || '');
          setEvolutionNote(data.evolutionNote || '');
          setNumberOfWeeks(data.numberOfWeeks || 0);
          setSessionsPerWeek(data.sessionsPerWeek || 0);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching patient data:', error);
          setLoading(false);
        }
      };

      const fetchEvaluations = async () => {
        try {
          const evalResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/evaluations/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEvaluations(evalResponse.data);
        } catch (error) {
          console.error('Error fetching evaluations:', error);
        }
      };

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

      fetchPatient();
      fetchEvaluations();
      fetchSessions();
    } catch (error) {
      console.error('Invalid token:', error);
      toast.error('Invalid or expired token');
      router.push('/sign-in');
    }
  }, [router]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedPatient = { name, email, phone, address, dateOfBirth };
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-patient/${patientId}`, updatedPatient);
      if (response.status === 200) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Error updating profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/patient-password/${patientId}`, { password: newPassword });
      if (response.status === 200) {
        toast.success('Password updated successfully');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error updating password');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading your profile...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Profile not found</div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer className={styles.toastContainer} />
      <div className={styles.container}>
        <div className={styles.profileWrapper}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}></div>
            <div className={styles.profileContent}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <h2 className={styles.profileName}>{name}</h2>
                <p className={styles.profileEmail}>{email}</p>
                <div className={styles.profileBadge}>
                  <User className={styles.profileBadgeIcon} />
                  Student
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3 className={styles.infoTitle}>
                  <User className={styles.infoTitleIcon} />
                  Personal Information
                </h3>
                <ul className={styles.infoList}>
                  <li className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <User className={styles.infoLabelIcon} />
                      Full Name
                    </span>
                    <span className={styles.infoValue}>{name}</span>
                  </li>
                  <li className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <Mail className={styles.infoLabelIcon} />
                      Email
                    </span>
                    <span className={styles.infoValue}>{email}</span>
                  </li>
                  <li className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <Phone className={styles.infoLabelIcon} />
                      Phone
                    </span>
                    <span className={styles.infoValue}>{phone}</span>
                  </li>
                  <li className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <Activity className={styles.infoLabelIcon} />
                      Disability Type
                    </span>
                    <span className={`${styles.infoValue} ${!disabilityType ? styles.notProvided : ''}`}>
                      {disabilityType || 'Not provided'}
                    </span>
                  </li>
                  <li className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <Calendar className={styles.infoLabelIcon} />
                      Date of Birth
                    </span>
                    <span className={`${styles.infoValue} ${!dateOfBirth ? styles.notProvided : ''}`}>
                      {dateOfBirth || 'Not provided'}
                    </span>
                  </li>
                  <li className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <MapPin className={styles.infoLabelIcon} />
                      Address
                    </span>
                    <span className={`${styles.infoValue} ${!address ? styles.notProvided : ''}`}>
                      {address || 'Not provided'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            <div className={styles.contentHeader}>
              <h1 className={styles.contentTitle}>Student Profile</h1>
              <p className={styles.contentSubtitle}>Manage your profile, view evaluations, and track sessions</p>
            </div>

            <div className={styles.tabsContainer}>
              <ul className={styles.tabsList}>
                <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === 'edit-profile' ? styles.active : ''}`}
                    onClick={() => setActiveTab('edit-profile')}
                  >
                    <Edit3 className={styles.tabIcon} />
                    Edit Profile
                  </button>
                </li>
                <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === 'change-password' ? styles.active : ''}`}
                    onClick={() => setActiveTab('change-password')}
                  >
                    <Lock className={styles.tabIcon} />
                    Change Password
                  </button>
                </li>
                <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === 'evaluations' ? styles.active : ''}`}
                    onClick={() => setActiveTab('evaluations')}
                  >
                    <FileText className={styles.tabIcon} />
                    My Evaluation
                  </button>
                </li>
                <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === 'sessions' ? styles.active : ''}`}
                    onClick={() => setActiveTab('sessions')}
                  >
                    <Activity className={styles.tabIcon} />
                    My Sessions
                  </button>
                </li>
                <li className={styles.tabItem}>
                  <button
                    className={`${styles.tabButton} ${activeTab === 'full-program' ? styles.active : ''}`}
                    onClick={() => setActiveTab('full-program')}
                  >
                    <Stethoscope className={styles.tabIcon} />
                    Full Program
                  </button>
                </li>
              </ul>
            </div>

            <div className={styles.tabContent}>
              {/* Edit Profile Tab */}
              <div className={`${styles.tabPane} ${activeTab === 'edit-profile' ? styles.active : ''}`}>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name" className={styles.formLabel}>
                        <User className={styles.labelIcon} />
                        Full Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        className={styles.formInput}
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Full Name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>
                        <Mail className={styles.labelIcon} />
                        Email <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="email"
                        className={styles.formInput}
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="phone" className={styles.formLabel}>
                        <Phone className={styles.labelIcon} />
                        Phone Number <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="tel"
                        className={styles.formInput}
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="dateOfBirth" className={styles.formLabel}>
                        <Calendar className={styles.labelIcon} />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        className={styles.formInput}
                        id="dateOfBirth"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup + ' ' + styles.fullWidth}>
                    <label htmlFor="address" className={styles.formLabel}>
                      <MapPin className={styles.labelIcon} />
                      Address
                    </label>
                    <textarea
                      className={styles.formTextarea}
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter address"
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => router.push('/dashboard')}
                    >
                      <X className={styles.buttonIcon} />
                      Cancel
                    </button>
                    <button type="submit" className={styles.saveButton}>
                      <Save className={styles.buttonIcon} />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Change Password Tab */}
              <div className={`${styles.tabPane} ${activeTab === 'change-password' ? styles.active : ''}`}>
                <form onSubmit={handlePasswordChange} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="your-password" className={styles.formLabel}>
                      <Lock className={styles.labelIcon} />
                      New Password <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.passwordContainer}>
                      <input
                        type={passwordVisible ? "text" : "password"}
                        className={styles.formInput}
                        id="your-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter New Password"
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={togglePasswordVisibility}
                      >
                        {passwordVisible ? 
                          <EyeOff className={styles.passwordToggleIcon} /> : 
                          <Eye className={styles.passwordToggleIcon} />
                        }
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="confirm-password" className={styles.formLabel}>
                      <Lock className={styles.labelIcon} />
                      Confirm Password <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.passwordContainer}>
                      <input
                        type={confirmPasswordVisible ? "text" : "password"}
                        className={styles.formInput}
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {confirmPasswordVisible ? 
                          <EyeOff className={styles.passwordToggleIcon} /> : 
                          <Eye className={styles.passwordToggleIcon} />
                        }
                      </button>
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelButton}>
                      <X className={styles.buttonIcon} />
                      Cancel
                    </button>
                    <button type="submit" className={styles.saveButton}>
                      <Save className={styles.buttonIcon} />
                      Save Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Evaluations Tab */}
              <div className={`${styles.tabPane} ${activeTab === 'evaluations' ? styles.active : ''}`}>
                <div className={styles.evaluationSection}>
                  <div className={styles.evaluationHeader}>
                    <h4 className={styles.evaluationTitle}>
                      📋 Booked Evaluation Summary
                    </h4>
                    <button
                      className={styles.toggleButton}
                      onClick={() => setShowEvaluationSummary(prev => !prev)}
                    >
                      <span>{showEvaluationSummary ? 'Hide' : 'Show'}</span>
                      {showEvaluationSummary ? 
                        <ChevronUp size={16} /> : 
                        <ChevronDown size={16} />
                      }
                    </button>
                  </div>
                  {showEvaluationSummary && (
                    <div className={`${styles.slideDown}`}>
                      {evaluations.length > 0 ? (
                        evaluations.map((evaluation, index) => (
                          <div key={index} className={styles.evaluationCard}>
                            <h6 className={styles.evaluationSuccess}>
                              <CheckCircle size={20} />
                              You've successfully booked your evaluation!
                            </h6>
                            <div className={styles.evaluationDetails}>
                              <div className={styles.evaluationDetail}>
                                <Calendar size={16} />
                                <span className={styles.evaluationLabel}>Date:</span>
                                <span>{new Date(evaluation.date).toLocaleDateString()}</span>
                              </div>
                              <div className={styles.evaluationDetail}>
                                <Clock size={16} />
                                <span className={styles.evaluationLabel}>Time:</span>
                                <span>{evaluation.time}</span>
                              </div>
                              <div className={styles.evaluationDetail} style={{gridColumn: '1 / -1'}}>
                                <FileText size={16} />
                                <span className={styles.evaluationLabel}>Description:</span>
                                <span>{evaluation.description}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{padding: '2rem', textAlign: 'center', color: '#6b7280'}}>
                          No evaluation booked yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <hr style={{margin: '2rem 0', border: 'none', borderTop: '2px solid #e5e7eb'}} />

                <h4 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e40af'}}>
                  🩺 Doctor's Evaluation Summary
                </h4>
                {service || evolutionNote ? (
                  <div className={styles.doctorSummary}>
                    <div className={styles.summaryGrid}>
                      <div className={styles.summaryItem}>
                        <Activity size={16} />
                        <span className={styles.summaryLabel}>Disability Type:</span>
                        <span>{disabilityType || 'N/A'}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <Stethoscope size={16} />
                        <span className={styles.summaryLabel}>Service:</span>
                        <span>{service || 'N/A'}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <Calendar size={16} />
                        <span className={styles.summaryLabel}>Weeks:</span>
                        <span>{numberOfWeeks}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <Clock size={16} />
                        <span className={styles.summaryLabel}>Sessions Per Week:</span>
                        <span>{sessionsPerWeek}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <FileText size={16} />
                        <span className={styles.summaryLabel}>Total Sessions:</span>
                        <span>{sessionsPerWeek * numberOfWeeks}</span>
                      </div>
                    </div>
                    <div className={styles.doctorNotes}>
                      <div className={styles.summaryItem}>
                        <FileText size={16} />
                        <span className={styles.summaryLabel}>Doctor's Notes:</span>
                      </div>
                      <div className={styles.notesContainer}>
                        {evolutionNote || <em>No notes added yet.</em>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{color: '#6b7280', marginBottom: '2rem'}}>No evaluation summary available yet.</div>
                )}

                <h5 style={{marginTop: '2.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  📅 Your Scheduled Sessions
                </h5>
                <div className={styles.sessionsTable}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Price</th>
                        <th>Payment</th>
                        <th>Completed</th>
                      </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                      {sessions.map((session, index) => (
                        <tr key={session._id}>
                          <td>{index + 1}</td>
                          <td>{new Date(session.date).toLocaleDateString()}</td>
                          <td>{session.time}</td>
                          <td>{session.price} EGP</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles[session.status.toLowerCase()]}`}>
                              {session.status}
                            </span>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${session.done ? styles.done : styles.pending}`}>
                              {session.done ? '✔️ Yes' : '❌ No'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {sessions.length > 0 && (
                  <div className={styles.paymentOptions}>
                    <h4 className={styles.paymentTitle}>
                      💳 Payment Options
                    </h4>
                    <div className={styles.paymentGrid}>
                      {sessions.filter(s => s.status === 'Pending').length >= 3 && (
                        <div className={`${styles.paymentCard} ${styles.success}`}>
                          <h6 className={`${styles.paymentCardTitle} ${styles.success}`}>
                            <DollarSign size={20} />
                            One-Time Payment (10% Discount)
                          </h6>
                          <p className={styles.paymentDescription}>
                            Pay for all sessions now and get a 10% discount on the total price.
                          </p>
                          <p className={styles.paymentTotal}>
                            Total: {Math.floor(totalPrice * 0.9)} EGP
                          </p>
                          <button 
                            className={`${styles.paymentButton} ${styles.success}`} 
                            onClick={() => handlePayAllSessions('one-time')}
                          >
                            <CreditCard size={16} />
                            Pay Now
                          </button>
                        </div>
                      )}
                      <div className={`${styles.paymentCard} ${styles.primary}`}>
                        <h6 className={`${styles.paymentCardTitle} ${styles.primary}`}>
                          <CreditCard size={20} />
                          Pay per Session
                        </h6>
                        <p className={styles.paymentDescription}>
                          Pay for each session before attending.
                        </p>
                        <div>
                          {sessions
                            .filter(session => session.status === 'Pending')
                            .map((session, index) => (
                              <div key={session._id} className={styles.sessionPayment}>
                                <span className={styles.sessionInfo}>
                                  {index + 1}. {new Date(session.date).toLocaleDateString()} - {session.time}
                                </span>
                                <button
                                  className={styles.sessionPayButton}
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
                )}
              </div>

              {/* Sessions Tab */}
              <div className={`${styles.tabPane} ${activeTab === 'sessions' ? styles.active : ''}`}>
                <h5 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <FileText size={20} />
                  Session Notes
                </h5>
                {sessions.length > 0 ? (
                  <>
                    <div className={styles.sessionTabs}>
                      {sessions.map((session, index) => (
                        <button
                          key={index}
                          className={`${styles.sessionTab} ${selectedSession === index ? styles.active : ''}`}
                          onClick={() => setSelectedSession(index)}
                        >
                          Session {index + 1}
                        </button>
                      ))}
                    </div>
                    <div className={styles.sessionContent}>
                      {sessions.map((session, index) => (
                        <div
                          key={index}
                          style={{display: selectedSession === index || selectedSession === null && index === 0 ? 'block' : 'none'}}
                        >
                          <div className={styles.sessionDetailsCard}>
                            <h6 className={styles.sessionDetailsTitle}>
                              <Activity size={20} />
                              Session {index + 1} Details
                            </h6>
                            <div className={styles.sessionDetailsGrid}>
                              <div className={styles.sessionDetail}>
                                <span className={styles.sessionDetailLabel}>Date:</span>
                                <span className={styles.sessionDetailValue}>
                                  {new Date(session.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className={styles.sessionDetail}>
                                <span className={styles.sessionDetailLabel}>Time:</span>
                                <span className={styles.sessionDetailValue}>{session.time || 'N/A'}</span>
                              </div>
                              <div className={styles.sessionDetail}>
                                <span className={styles.sessionDetailLabel}>Price:</span>
                                <span className={styles.sessionDetailValue}>{session.price || 0} EGP</span>
                              </div>
                              <div className={styles.sessionDetail}>
                                <span className={styles.sessionDetailLabel}>Payment:</span>
                                <span className={styles.sessionDetailValue}>
                                  <span className={`${styles.statusBadge} ${styles[session.status.toLowerCase()]}`}>
                                    {session.status}
                                  </span>
                                </span>
                              </div>
                              <div className={styles.sessionDetail}>
                                <span className={styles.sessionDetailLabel}>Completed:</span>
                                <span className={styles.sessionDetailValue}>
                                  <span className={`${styles.statusBadge} ${session.done ? styles.done : styles.pending}`}>
                                    {session.done ? '✔️ Yes' : '❌ No'}
                                  </span>
                                </span>
                              </div>
                              <div className={styles.sessionNoteContainer}>
                                <span className={styles.sessionDetailLabel}>Session Note:</span>
                                <div className={styles.sessionNote}>
                                  {session.note ? session.note : <em>No note provided.</em>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{textAlign: 'center', color: '#6b7280', padding: '2rem'}}>
                    No sessions yet.
                  </div>
                )}
              </div>

              {/* Full Program Tab */}
              <div className={`${styles.tabPane} ${activeTab === 'full-program' ? styles.active : ''}`}>
                <FullProgramComponent patientId={patientID} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicProfilepatient;
