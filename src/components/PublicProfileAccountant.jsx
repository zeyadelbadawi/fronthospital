'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import jwt_decode from 'jwt-decode';
import { User, Mail, Edit3, Lock, Eye, EyeOff, Save, X, Calculator } from 'lucide-react';
import styles from '../styles/profile-view.module.css';

const PublicProfileAccountant = () => {
  const router = useRouter();
  const [accountant, setAccountant] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [accountantId, setAccountantId] = useState(null);
  const [activeTab, setActiveTab] = useState('edit-profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must log in to access this page');
      router.push('/sign-in');
      return;
    }

    try {
      const decodedToken = jwt_decode(token);
      const userRole = decodedToken?.role;
      const userId = decodedToken?.id;
      
      if (!userRole || !userId || userRole !== 'accountant') {
        alert('You must be a accountant to access this page');
        router.push('/sign-in');
        return;
      }
      
      setAccountantId(userId);

      const fetchAccountant = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/accountant/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAccountant(response.data);
          setName(response.data.name);
          setEmail(response.data.email);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching Accountant data:', error);
          setLoading(false);
        }
      };

      fetchAccountant();
    } catch (error) {
      console.error('Invalid token:', error);
      alert('Invalid or expired token');
      router.push('/sign-in');
    }
  }, [router]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/accountant-password/${accountantId}`, { password: newPassword });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedAccountant = { name, email };
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/authentication/edit-accountant/${accountantId}`, updatedAccountant);
      if (response.status === 200) {
        alert('Accountant updated successfully');
      }
    } catch (error) {
      console.error('Error updating Accountant:', error);
      alert('Error updating Accountant');
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

  if (!accountant) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Profile not found</div>
      </div>
    );
  }

  return (
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
                <Calculator className={styles.profileBadgeIcon} />
                Accountant
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.infoTitle}>
                <Calculator className={styles.infoTitleIcon} />
                Accountant Information
              </h3>
              <ul className={styles.infoList}>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <User className={styles.infoLabelIcon} />
                    Name
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
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Accountant Profile</h1>
            <p className={styles.contentSubtitle}>Manage your professional profile and account settings</p>
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
                      Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Name"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileAccountant;
