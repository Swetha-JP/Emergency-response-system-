import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { wildlifeAPI } from '../services/api';
import './WildlifeReport.css';

const WildlifeReport = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ incidentType: '', description: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) { toast.error('GPS not supported'); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocLoading(false);
        toast.success('Location captured!');
      },
      () => { toast.error('Could not get location'); setLocLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { toast.error('Please upload an image'); return; }
    if (!form.incidentType) { toast.error('Please select incident type'); return; }
    if (!location) { toast.error('Please capture your location'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('image', image);
      fd.append('userId', user.id);
      fd.append('incidentType', form.incidentType);
      fd.append('description', form.description);
      fd.append('latitude', location.latitude);
      fd.append('longitude', location.longitude);

      await wildlifeAPI.createReport(fd);
      toast.success('Wildlife report submitted successfully!');
      setTimeout(() => navigate('/wildlife/my-reports'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wr-page">
      <header className="wr-header">
        <button className="wr-back" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="wr-header-text">
          <h1><i className="fas fa-paw"></i> Report Wildlife Emergency</h1>
          <p>Help protect wildlife — report injured or dangerous animals</p>
        </div>
      </header>

      <div className="wr-content">
        <form className="wr-form" onSubmit={handleSubmit}>

          {/* Image Upload */}
          <div className="wr-section">
            <div className="wr-section-label">
              <i className="fas fa-camera"></i> Upload Photo <span className="req">*</span>
            </div>
            <div className="wr-upload-area" onClick={() => fileRef.current.click()}>
              {preview ? (
                <div className="wr-preview-wrap">
                  <img src={preview} alt="Preview" className="wr-preview-img" />
                  <div className="wr-preview-overlay">
                    <i className="fas fa-camera"></i>
                    <span>Change Photo</span>
                  </div>
                </div>
              ) : (
                <div className="wr-upload-placeholder">
                  <div className="wr-upload-icon"><i className="fas fa-cloud-upload-alt"></i></div>
                  <p>Click to upload image</p>
                  <span>JPG, PNG, WEBP — max 5MB</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} hidden />
            </div>
          </div>

          {/* Incident Type */}
          <div className="wr-section">
            <div className="wr-section-label">
              <i className="fas fa-exclamation-triangle"></i> Incident Type <span className="req">*</span>
            </div>
            <div className="wr-type-grid">
              {[
                { value: 'Injured Animal',            icon: 'fa-heart-broken',    color: '#EF4444', bg: '#FEF2F2' },
                { value: 'Dangerous Animal Sighting', icon: 'fa-exclamation-circle', color: '#F59E0B', bg: '#FFFBEB' },
                { value: 'Animal in Distress',        icon: 'fa-paw',             color: '#8B5CF6', bg: '#EDE9FE' },
                { value: 'Poaching Activity',         icon: 'fa-ban',             color: '#DC2626', bg: '#FEE2E2' },
              ].map(t => (
                <button
                  key={t.value} type="button"
                  className={`wr-type-btn ${form.incidentType === t.value ? 'selected' : ''}`}
                  style={{ '--tc': t.color, '--tb': t.bg }}
                  onClick={() => setForm({ ...form, incidentType: t.value })}
                >
                  <div className="wr-type-icon" style={{ background: t.color }}>
                    <i className={`fas ${t.icon}`}></i>
                  </div>
                  <span>{t.value}</span>
                  {form.incidentType === t.value && <i className="fas fa-check-circle wr-check"></i>}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="wr-section">
            <div className="wr-section-label">
              <i className="fas fa-map-marker-alt"></i> Location <span className="req">*</span>
            </div>
            {location ? (
              <div className="wr-location-box success">
                <i className="fas fa-check-circle"></i>
                <div>
                  <span className="wr-loc-title">Location Captured</span>
                  <span className="wr-loc-coords">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</span>
                </div>
                <button type="button" className="wr-reloc-btn" onClick={fetchLocation}>
                  <i className="fas fa-redo"></i>
                </button>
              </div>
            ) : (
              <button type="button" className="wr-loc-btn" onClick={fetchLocation} disabled={locLoading}>
                {locLoading
                  ? <><i className="fas fa-spinner fa-spin"></i> Getting location...</>
                  : <><i className="fas fa-crosshairs"></i> Capture My Location</>
                }
              </button>
            )}
          </div>

          {/* Description */}
          <div className="wr-section">
            <div className="wr-section-label">
              <i className="fas fa-align-left"></i> Description <span className="opt">(optional)</span>
            </div>
            <textarea
              className="wr-textarea"
              placeholder="Describe what you saw — animal type, behavior, exact location details..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>

          <button type="submit" className="wr-submit-btn" disabled={submitting}>
            {submitting
              ? <><i className="fas fa-spinner fa-spin"></i> Submitting Report...</>
              : <><i className="fas fa-paper-plane"></i> Submit Wildlife Report</>
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default WildlifeReport;
