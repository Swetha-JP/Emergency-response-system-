import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import socketService from '../services/socket';
import './FamilyTracking.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FamilyTracking = () => {
  const { emergencyId } = useParams();
  const [emergency, setEmergency] = useState(null);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('loading');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);   // true when receiving socket updates
  const intervalRef = useRef(null);
  const liveTimeoutRef = useRef(null);            // resets isLive if no socket update for 15s
  const isLiveRef = useRef(false);               // ref so fetchEmergency closure always reads latest

  // ── Initial fetch + polling fallback ──────────────────────────
  useEffect(() => {
    fetchEmergency();
    intervalRef.current = setInterval(fetchEmergency, 10000);
    return () => clearInterval(intervalRef.current);
  }, [emergencyId]); // eslint-disable-line

  // ── Socket.IO live location ────────────────────────────────────
  useEffect(() => {
    socketService.connect();

    // Join the specific tracking room for this emergency
    socketService.joinTrackingRoom(emergencyId);

    // Listen for real-time location pushes
    socketService.onLocationUpdate((data) => {
      if (String(data.emergencyId) !== String(emergencyId)) return;

      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      setLocation({ latitude: lat, longitude: lng });
      setLastUpdated(new Date());
      setIsLive(true);
      isLiveRef.current = true;

      // Mark as "not live" if no update arrives within 15 seconds
      clearTimeout(liveTimeoutRef.current);
      liveTimeoutRef.current = setTimeout(() => {
        setIsLive(false);
        isLiveRef.current = false;
      }, 15000);
    });

    return () => {
      socketService.disconnect();
      clearTimeout(liveTimeoutRef.current);
    };
  }, [emergencyId]);

  const fetchEmergency = async () => {
    try {
      const res = await axios.get(`${API_URL}/emergency/${emergencyId}`);
      const data = res.data.data;
      setEmergency(data);

      // Always set location from DB on first load.
      // After that, only update from REST if socket is not pushing live updates.
      if (data?.latitude && data?.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          if (!isLiveRef.current) {
            setLocation({ latitude: lat, longitude: lng });
            setLastUpdated(new Date());
          }
        }
      }

      setStatus('loaded');
    } catch (err) {
      console.error('Tracking fetch error:', err.message);
      setStatus('error');
    }
  };

  const statusColors = {
    pending:   '#FFB703',
    accepted:  '#457B9D',
    resolved:  '#06D6A0',
    cancelled: '#6c757d'
  };

  const typeIcons = {
    police:    'fa-shield-alt',
    ambulance: 'fa-ambulance',
    fire:      'fa-fire-extinguisher'
  };

  if (status === 'loading') {
    return (
      <div className="ft-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading live tracking...</p>
      </div>
    );
  }

  if (status === 'error' || !emergency) {
    return (
      <div className="ft-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h2>Tracking Not Found</h2>
        <p>This tracking link may be invalid or expired.</p>
      </div>
    );
  }

  return (
    <div className="family-tracking">
      <header className="ft-header">
        <div className="ft-brand">
          <i className="fas fa-shield-alt"></i>
          <span>Emergency Live Tracking</span>
        </div>
        <div className={`ft-live-badge ${isLive ? 'ft-live-active' : ''}`}>
          <span className="live-dot"></span>
          {isLive ? 'LIVE' : 'POLLING'}
        </div>
      </header>

      <div className="ft-content">
        {/* Status Banner */}
        <div className="ft-status-banner" style={{ borderLeftColor: statusColors[emergency.status] }}>
          <div className="ft-status-left">
            <div className="ft-type-icon" style={{ backgroundColor: statusColors[emergency.status] }}>
              <i className={`fas ${typeIcons[emergency.emergency_type] || 'fa-exclamation-circle'}`}></i>
            </div>
            <div>
              <h2>{emergency.emergency_type?.toUpperCase()} Emergency</h2>
              <p>Case #{emergency.id} · Reported {new Date(emergency.created_at).toLocaleString()}</p>
            </div>
          </div>
          <span className="ft-status-badge" style={{ backgroundColor: statusColors[emergency.status] }}>
            {emergency.status?.toUpperCase()}
          </span>
        </div>

        {/* Live location indicator */}
        {isLive && (
          <div className="ft-live-indicator">
            <span className="ft-live-pulse"></span>
            <span>Receiving live GPS updates from the user's device</span>
          </div>
        )}

        {/* Map */}
        <div className="ft-map-wrap">
          {location ? (
            <MapComponent
              latitude={location.latitude}
              longitude={location.longitude}
              height="420px"
              markers={[{
                latitude: location.latitude,
                longitude: location.longitude,
                popup: `🚨 ${emergency.emergency_type?.toUpperCase()} — ${emergency.status}`
              }]}
            />
          ) : (
            <div className="ft-no-map">
              <i className="fas fa-map-marked-alt"></i>
              <p>Waiting for location data...</p>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="ft-info-grid">
          <div className="ft-info-card">
            <i className="fas fa-map-marker-alt"></i>
            <div>
              <span>Last Known Location</span>
              <strong>
                {location
                  ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                  : 'Unavailable'}
              </strong>
            </div>
          </div>
          <div className="ft-info-card">
            <i className="fas fa-clock"></i>
            <div>
              <span>Last Updated</span>
              <strong>{lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</strong>
            </div>
          </div>
          <div className="ft-info-card">
            <i className="fas fa-satellite-dish"></i>
            <div>
              <span>Update Mode</span>
              <strong style={{ color: isLive ? '#22C55E' : '#F59E0B' }}>
                {isLive ? '⚡ Live Socket' : '🔄 Polling (10s)'}
              </strong>
            </div>
          </div>
          <div className="ft-info-card">
            <i className="fas fa-exclamation-circle"></i>
            <div>
              <span>Priority</span>
              <strong>{emergency.priority?.toUpperCase() || 'MEDIUM'}</strong>
            </div>
          </div>
        </div>

        {/* Open in Maps */}
        {location && (
          <div className="ft-actions">
            <a
              href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <i className="fas fa-map-marked-alt"></i> Open in Google Maps
            </a>
          </div>
        )}

        <p className="ft-note">
          <i className="fas fa-info-circle"></i>
          Location updates automatically via live socket when the user is active, or every 10 seconds via polling.
        </p>
      </div>
    </div>
  );
};

export default FamilyTracking;
