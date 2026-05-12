import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'tourist'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType
      });

      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Registration successful!');

      // Redirect based on user type
      if (user.userType === 'tourist') {
        navigate('/user/dashboard');
      } else if (user.userType === 'agency') {
        navigate('/agency/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background"></div>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <i className="fas fa-user-plus"></i>
            <h1>Create Account</h1>
            <p>Register for emergency assistance</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>User Type</label>
              <div className="user-type-selector">
                <button
                  type="button"
                  className={`user-type-btn ${formData.userType === 'tourist' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, userType: 'tourist'})}
                >
                  <i className="fas fa-user"></i>
                  Tourist
                </button>
                <button
                  type="button"
                  className={`user-type-btn ${formData.userType === 'agency' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, userType: 'agency'})}
                >
                  <i className="fas fa-shield-alt"></i>
                  Agency
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-group">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-group">
                <i className="fas fa-phone"></i>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{width: '100%'}} disabled={loading}>
              <i className="fas fa-user-plus"></i>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Login Here</Link></p>
          </div>
        </div>

        <div className="auth-info">
          <h2>Join Our Platform</h2>
          <p>Get instant access to emergency services with real-time tracking and multi-agency coordination.</p>
          <div className="info-features">
            <div className="info-feature">
              <i className="fas fa-check-circle"></i>
              <span>24/7 Emergency Support</span>
            </div>
            <div className="info-feature">
              <i className="fas fa-check-circle"></i>
              <span>Real-time Location Sharing</span>
            </div>
            <div className="info-feature">
              <i className="fas fa-check-circle"></i>
              <span>Instant Response</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
