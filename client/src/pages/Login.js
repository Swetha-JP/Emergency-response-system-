import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login successful!');

      if (user.userType === 'tourist') {
        navigate('/user/dashboard');
      } else if (user.userType === 'agency') {
        navigate('/agency/dashboard');
      } else if (user.userType === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
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
            <i className="fas fa-shield-alt"></i>
            <h1>Welcome Back</h1>
            <p>Login to access emergency services</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-footer">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="forgot-link">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              <i className="fas fa-sign-in-alt"></i>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Register Now</Link></p>
          </div>
        </div>

        <div className="auth-info">
          <h2>Emergency Assistance Platform</h2>
          <p>Your safety is our priority. Access emergency services 24/7 with real-time coordination.</p>
          <div className="info-features">
            <div className="info-feature">
              <i className="fas fa-check-circle"></i>
              <span>One-tap SOS</span>
            </div>
            <div className="info-feature">
              <i className="fas fa-check-circle"></i>
              <span>Live GPS Tracking</span>
            </div>
            <div className="info-feature">
              <i className="fas fa-check-circle"></i>
              <span>Multi-Agency Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
