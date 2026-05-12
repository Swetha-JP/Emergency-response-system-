import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './AgencyProfile.css';

const AgencyProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setProfilePic(parsed.profilePic || null);
      setFormData({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        address: parsed.address || ''
      });
    }
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData, profilePic };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    toast.success('✅ Profile updated successfully!');
  };

  return (
    <div className="agency-profile-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1>Profile</h1>
          <p>Manage your account information</p>
        </div>
      </header>

      <div className="page-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profilePic ? (
                <img src={profilePic} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
              <input 
                type="file" 
                id="photoUpload" 
                accept="image/*" 
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <button className="btn-change-photo" onClick={() => document.getElementById('photoUpload').click()}>
                <i className="fas fa-camera"></i>
              </button>
            </div>
            <div className="profile-info">
              <h2>{user?.name || 'Agency Name'}</h2>
              <p>{user?.userType === 'agency' ? 'Agency Account' : 'Department'}</p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              <i className={`fas ${isEditing ? 'fa-save' : 'fa-edit'}`}></i>
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          <div className="profile-body">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={!isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                disabled={!isEditing}
                className="form-input"
                rows="3"
              />
            </div>

            {isEditing && (
              <div className="form-actions">
                <button className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <h3>Account Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <i className="fas fa-calendar-alt"></i>
              <div>
                <span className="stat-label">Member Since</span>
                <span className="stat-value">Jan 2024</span>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-check-circle"></i>
              <div>
                <span className="stat-label">Total Resolved</span>
                <span className="stat-value">0</span>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-star"></i>
              <div>
                <span className="stat-label">Rating</span>
                <span className="stat-value">4.8/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyProfile;
