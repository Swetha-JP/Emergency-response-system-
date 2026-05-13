import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { emergencyAPI } from '../services/api';
import emergencyContactsService from '../services/emergencyContacts';
import socketService from '../services/socket';
import locationService from '../services/location';
import { getSuggestedType } from '../services/aiClassifier';
import './UserDashboard.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LiveMap = ({ latitude, longitude, accuracy }) => {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    if (!divRef.current) return;
    mapRef.current = L.map(divRef.current, { zoomControl: true, attributionControl: true, fadeAnimation: false, zoomAnimation: false }).setView([latitude, longitude], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(mapRef.current);
    markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current).bindPopup(`<b>📍 Your Location</b><br/>${latitude.toFixed(5)}, ${longitude.toFixed(5)}`).openPopup();
    if (accuracy && accuracy < 5000) {
      circleRef.current = L.circle([latitude, longitude], { radius: accuracy, color: '#EF4444', fillOpacity: 0.08, weight: 1 }).addTo(mapRef.current);
    }
    const timers = [50, 150, 300, 600, 1200].map(t => setTimeout(() => mapRef.current?.invalidateSize(true), t));
    const ro = new ResizeObserver(() => mapRef.current?.invalidateSize(true));
    ro.observe(divRef.current);
    return () => { timers.forEach(clearTimeout); ro.disconnect(); mapRef.current?.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const latlng = [latitude, longitude];
    markerRef.current.setLatLng(latlng);
    markerRef.current.setPopupContent(`<b>📍 Your Location</b><br/>${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    mapRef.current.setView(latlng, 16, { animate: true, duration: 0.5 });
    if (circleRef.current) { circleRef.current.setLatLng(latlng); if (accuracy) circleRef.current.setRadius(accuracy); }
  }, [latitude, longitude, accuracy]);

  return (
    <div style={{ width: '100%', height: '320px', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <div ref={divRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [trackingLink, setTrackingLink] = useState(null);
  const [autoAssigned, setAutoAssigned] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchEmergencyHistory();
    socketService.connect();
    socketService.onAgencyAccepted(() => toast.success('✅ Emergency accepted by agency!'));

    let wId = null;

    // getBestPosition samples GPS for up to 15s, calling onUpdate every time
    // accuracy improves — map updates live as GPS locks in from ±300m → ±50m → ±15m
    locationService.getBestPosition(
      (position) => {
        // Called every time a better reading arrives
        setLocation(position);
        setLocationLoading(false);
      },
      15000
    )
    .then((bestPosition) => {
      // Final best position after 15s (or earlier if ≤20m accuracy reached)
      setLocation(bestPosition);
      setLocationLoading(false);

      // Continue watching after the initial acquisition phase
      wId = locationService.watchPosition(
        (refined) => {
          setLocation(prev => {
            if (!prev) return refined;
            if (prev.accuracy - refined.accuracy > 5) return refined;
            const latDiff = Math.abs(refined.latitude - prev.latitude);
            const lngDiff = Math.abs(refined.longitude - prev.longitude);
            if (latDiff > 0.00005 || lngDiff > 0.00005) return refined;
            return prev;
          });
        },
        () => {}
      );
    })
    .catch(() => {
      setLocationLoading(false);
      // Fallback: plain watchPosition if getBestPosition fails
      wId = locationService.watchPosition(
        (position) => { setLocation(position); setLocationLoading(false); },
        () => setLocationLoading(false)
      );
    });

    return () => {
      socketService.disconnect();
      if (wId) locationService.clearWatch(wId);
    };
  }, []); // eslint-disable-line

  const fetchEmergencyHistory = async () => {
    try { const r = await emergencyAPI.getAll(); setEmergencyHistory(r.data.data || []); } catch {}
  };

  const handleSOSClick = async () => {
    setEmergencyActive(true);
    if (location) { toast.success('📍 Location ready! Describe your emergency.'); return; }
    setLoading(true);
    try {
      const position = await locationService.getCurrentPosition();
      setLocation(position); setLocationLoading(false);
    } catch (error) {
      toast.error(error.message || 'Failed to get location. Please enable GPS.');
    } finally { setLoading(false); }
  };

  const handleDescriptionChange = (e) => {
    const text = e.target.value; setDescription(text);
    if (text.length > 5) { const s = getSuggestedType(text); setAiSuggestion(s.type ? s : null); }
    else setAiSuggestion(null);
  };

  const handleSendEmergency = async () => {
    const finalType = selectedType || aiSuggestion?.type;
    if (!finalType || !location) { toast.error('Please select or describe your emergency type'); return; }
    setLoading(true);
    try {
      const emergencyData = { userId: user?.id, emergencyType: finalType, description: description || `Emergency request from ${user?.name}`, latitude: location.latitude, longitude: location.longitude, priority: 'urgent' };
      const response = await emergencyAPI.create(emergencyData);
      const emergencyId = response.data.data.id;
      const wasAutoAssigned = response.data.autoAssigned;
      setAutoAssigned(wasAutoAssigned);
      socketService.emitSOS({ ...emergencyData, emergencyId });
      try {
        const notifyRes = await emergencyContactsService.notifyContacts(user?.id, { emergencyId, ...emergencyData });
        const link = notifyRes.trackingLink || `${window.location.origin}/track/${emergencyId}`;
        setTrackingLink(link);
        if (notifyRes.notified > 0) toast.info(`📱 ${notifyRes.notified} family contact(s) notified`);
      } catch { setTrackingLink(`${window.location.origin}/track/${emergencyId}`); }
      const id = locationService.watchPosition(
        (newLocation) => { setLocation(newLocation); socketService.emitLocationUpdate({ emergencyId, ...newLocation }); },
        (error) => console.error('Location tracking error:', error)
      );
      // store watch id in a ref so it can be cleared on unmount if needed
      console.log('Emergency location watch started, id:', id);
      toast.success(wasAutoAssigned ? '🚨 Emergency sent! Nearest agency auto-assigned.' : '🚨 Emergency request sent! Help is on the way.');
      fetchEmergencyHistory();
    } catch { toast.error('Failed to send emergency request'); }
    finally { setLoading(false); }
  };

  const emergencyTypes = [
    { id: 'police',    name: 'Police',       icon: 'fa-shield-alt',       color: '#1D4ED8', bg: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' },
    { id: 'ambulance', name: 'Ambulance',    icon: 'fa-ambulance',         color: '#DC2626', bg: 'linear-gradient(135deg,#DC2626,#EF4444)' },
    { id: 'fire',      name: 'Fire Service', icon: 'fa-fire-extinguisher', color: '#EA580C', bg: 'linear-gradient(135deg,#EA580C,#F97316)' },
  ];

  return (
    <div className="user-dashboard">
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="container-fluid">
          <div className="header-content">
            <div className="header-brand">
              <div className="brand-icon-wrap"><i className="fas fa-shield-alt"></i></div>
              <div>
                <span className="brand-name">SafeGuard</span>
                <span className="brand-tagline">Emergency Platform</span>
              </div>
            </div>
            <div className="header-right-group">
              <div className="header-user-chip">
                <div className="header-avatar">{user?.name?.[0]?.toUpperCase() || 'T'}</div>
                <span className="header-username">{user?.name || 'Tourist'}</span>
              </div>
              <button className="header-logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }} title="Logout">
                <i className="fas fa-sign-out-alt"></i>
                <span className="logout-text">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="container-fluid">

          {/* ── Welcome ── */}
          <div className="welcome-section">
            <div className="welcome-text">
              <h1>Hello, {user?.name?.split(' ')[0] || 'Tourist'} 👋</h1>
              <p>Your safety is our priority. Press SOS if you need help.</p>
            </div>
            <div className={`safety-badge ${emergencyActive ? 'danger' : 'safe'}`}>
              <span className="safety-dot"></span>
              {emergencyActive ? 'Emergency Active' : 'You are Safe'}
            </div>
          </div>

          {/* ── SOS Section ── */}
          <div className="sos-section">
            <div className="sos-container">
              <div className="sos-rings">
                <div className="sos-ring r1"></div>
                <div className="sos-ring r2"></div>
                <div className="sos-ring r3"></div>
              </div>
              <button
                className={`btn-sos ${emergencyActive ? 'sos-active' : ''}`}
                onClick={handleSOSClick}
                disabled={emergencyActive || loading}
              >
                {loading
                  ? <i className="fas fa-spinner fa-spin"></i>
                  : emergencyActive
                    ? <><i className="fas fa-check"></i><span>SENT</span></>
                    : <span>SOS</span>
                }
              </button>
              {emergencyActive && (
                <div className="sos-active-indicator">
                  <i className="fas fa-satellite-dish"></i>
                  <span>Emergency Alert Active</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Emergency Type Selection ── */}
          {emergencyActive && (
            <div className="emergency-type-section">
              <div className="ets-header">
                <div className="ets-icon"><i className="fas fa-exclamation-triangle"></i></div>
                <div>
                  <h2>Describe Your Emergency</h2>
                  <p>Type a description or select the emergency type below</p>
                </div>
              </div>

              <div className="description-input-wrap">
                <textarea
                  className="description-input"
                  placeholder="e.g. 'someone is bleeding', 'there is a fire', 'I was robbed'..."
                  value={description}
                  onChange={handleDescriptionChange}
                  rows={3}
                />
                {aiSuggestion && (
                  <div className="ai-suggestion">
                    <div className="ai-icon"><i className="fas fa-robot"></i></div>
                    <div className="ai-text">
                      <span>AI suggests: <strong>{aiSuggestion.label}</strong></span>
                      <span className="ai-conf">{aiSuggestion.confidence}% confidence</span>
                    </div>
                    <button className="btn-use-ai" onClick={() => setSelectedType(aiSuggestion.type)}>
                      Use this
                    </button>
                  </div>
                )}
              </div>

              <p className="type-select-label">Or select manually:</p>
              <div className="emergency-types-grid">
                {emergencyTypes.map(type => (
                  <div
                    key={type.id}
                    className={`emergency-type-card ${selectedType === type.id ? 'selected' : ''}`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="emergency-type-icon" style={{ background: type.bg }}>
                      <i className={`fas ${type.icon}`}></i>
                    </div>
                    <h3>{type.name}</h3>
                    {selectedType === type.id && <div className="type-check"><i className="fas fa-check"></i></div>}
                  </div>
                ))}
              </div>

              {(selectedType || aiSuggestion?.type) && !trackingLink && (
                <button className="btn btn-primary btn-lg mt-lg send-alert-btn" onClick={handleSendEmergency} disabled={loading}>
                  {loading
                    ? <><i className="fas fa-spinner fa-spin"></i> Sending Alert...</>
                    : <><i className="fas fa-paper-plane"></i> Send {(selectedType || aiSuggestion?.type)?.toUpperCase()} Alert</>
                  }
                </button>
              )}
            </div>
          )}

          {/* ── Tracking Link ── */}
          {trackingLink && (
            <div className="tracking-link-box">
              <div className="tracking-link-header">
                <div className="track-icon"><i className="fas fa-location-arrow"></i></div>
                <div>
                  <span className="track-title">Share Live Tracking</span>
                  <span className="track-sub">Family can follow your location in real-time</span>
                </div>
                {autoAssigned && (
                  <div className="auto-assign-chip">
                    <i className="fas fa-check-circle"></i> Agency Assigned
                  </div>
                )}
              </div>
              <div className="tracking-link-row">
                <input readOnly value={trackingLink} className="tracking-link-input" />
                <button className="btn-copy" onClick={() => { navigator.clipboard.writeText(trackingLink); toast.success('Tracking link copied!'); }}>
                  <i className="fas fa-copy"></i> Copy
                </button>
              </div>
              <a href={trackingLink} target="_blank" rel="noopener noreferrer" className="btn-open-track">
                <i className="fas fa-external-link-alt"></i> Open Tracking Page
              </a>
            </div>
          )}

          {/* ── Map Section ── */}
          <div className="map-section">
            <div className="section-title-row">
              <div className="section-title-icon"><i className="fas fa-map-marked-alt"></i></div>
              <h2>Your Live Location</h2>
              {location && (
                <span className="gps-chip" style={{
                  background:  location.accuracy <= 20  ? '#DCFCE7' :
                               location.accuracy <= 50  ? '#D1FAE5' :
                               location.accuracy <= 150 ? '#FEF3C7' : '#FEE2E2',
                  color:       location.accuracy <= 20  ? '#15803D' :
                               location.accuracy <= 50  ? '#059669' :
                               location.accuracy <= 150 ? '#B45309' : '#DC2626',
                  borderColor: location.accuracy <= 20  ? '#86EFAC' :
                               location.accuracy <= 50  ? '#6EE7B7' :
                               location.accuracy <= 150 ? '#FDE68A' : '#FECACA',
                }}>
                  <i className={`fas ${location.accuracy <= 50 ? 'fa-crosshairs' : 'fa-satellite-dish'}`}
                     style={{ animation: location.accuracy > 50 ? 'spin 2s linear infinite' : 'none' }}
                  ></i>
                  ±{Math.round(location.accuracy || 0)}m
                  {location.accuracy > 50 && (
                    <span style={{ fontSize:'0.62rem', marginLeft:'4px', opacity:0.85 }}>
                      {location.accuracy > 150 ? 'acquiring…' : 'refining…'}
                    </span>
                  )}
                </span>
              )}
            </div>
            {locationLoading ? (
              <div className="map-skeleton">
                <div className="map-skeleton-inner">
                  <i className="fas fa-satellite-dish"></i>
                  <p>Acquiring GPS signal...</p>
                </div>
              </div>
            ) : location ? (
              <LiveMap latitude={location.latitude} longitude={location.longitude} accuracy={location.accuracy} />
            ) : (
              <div className="map-skeleton">
                <div className="map-skeleton-inner">
                  <i className="fas fa-map-marker-alt"></i>
                  <p>Location unavailable — please enable GPS</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Quick Access Numbers ── */}
          <div className="quick-access-section">
            <div className="section-title-row">
              <div className="section-title-icon"><i className="fas fa-phone-alt"></i></div>
              <h2>Emergency Helplines</h2>
            </div>
            <div className="quick-numbers-grid">
              {[
                { href:'tel:100',  icon:'fa-shield-alt',       label:'Police',         value:'100',  grad:'linear-gradient(135deg,#1D4ED8,#3B82F6)' },
                { href:'tel:102',  icon:'fa-ambulance',         label:'Ambulance',      value:'102',  grad:'linear-gradient(135deg,#DC2626,#EF4444)' },
                { href:'tel:101',  icon:'fa-fire-extinguisher', label:'Fire',           value:'101',  grad:'linear-gradient(135deg,#EA580C,#F97316)' },
                { href:'tel:1091', icon:'fa-female',            label:'Women Helpline', value:'1091', grad:'linear-gradient(135deg,#7C3AED,#8B5CF6)' },
              ].map((n, i) => (
                <a key={i} href={n.href} className="number-card">
                  <div className="number-icon" style={{ background: n.grad }}>
                    <i className={`fas ${n.icon}`}></i>
                  </div>
                  <span className="number-label">{n.label}</span>
                  <span className="number-value">{n.value}</span>
                  <div className="number-call-hint"><i className="fas fa-phone-alt"></i> Tap to call</div>
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="quick-actions-section">
            <div className="section-title-row">
              <div className="section-title-icon"><i className="fas fa-th-large"></i></div>
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              {[
                { icon:'fa-hospital',        label:'Nearby Hospitals',    href:'/nearby-hospitals',    color:'#EF4444', bg:'#FEF2F2' },
                { icon:'fa-address-book',    label:'Emergency Contacts',  href:'/emergency-contacts',  color:'#F59E0B', bg:'#FFFBEB' },
                { icon:'fa-paw',             label:'Report Wildlife',      href:'/wildlife/report',     color:'#8B5CF6', bg:'#EDE9FE' },
                { icon:'fa-users',           label:'Connected Agencies',   href:'/agencies',            color:'#0EA5E9', bg:'#F0F9FF' },
                { icon:'fa-map-marked-alt',  label:'Family Tracking',      href:`/track/${trackingLink ? trackingLink.split('/').pop() : ''}`, color:'#22C55E', bg:'#F0FDF4' },
                { icon:'fa-file-medical',    label:'My Reports',           href:'/wildlife/my-reports', color:'#6366F1', bg:'#EEF2FF' },
              ].map((a, i) => (
                <div key={i} className="action-card" onClick={() => navigate(a.href)}>
                  <div className="action-icon-wrap" style={{ background: a.bg, color: a.color }}>
                    <i className={`fas ${a.icon}`}></i>
                  </div>
                  <span className="action-label">{a.label}</span>
                  <i className="fas fa-chevron-right action-arrow"></i>
                </div>
              ))}
            </div>
          </div>

          {/* ── Emergency Status & History ── */}
          <div className="status-section">
            <div className="section-title-row">
              <div className="section-title-icon" style={{ background:'linear-gradient(135deg,#EF4444,#DC2626)' }}><i className="fas fa-ambulance"></i></div>
              <h2>Emergency Status</h2>
              <button className="section-view-all" onClick={() => navigate('/emergency-history')}>
                View All <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <div className="status-cards-grid">
              <div className="status-card">
                <div className="status-card-icon" style={{ background: emergencyActive ? 'linear-gradient(135deg,#EF4444,#DC2626)' : 'linear-gradient(135deg,#22C55E,#16A34A)' }}>
                  <i className={`fas ${emergencyActive ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
                </div>
                <div className="status-card-content">
                  <div className="status-card-title">Current Status</div>
                  <div className="status-card-value">{emergencyActive ? 'Emergency' : 'Safe'}</div>
                </div>
              </div>
              <div className="status-card">
                <div className="status-card-icon" style={{ background: location ? 'linear-gradient(135deg,#22C55E,#16A34A)' : 'linear-gradient(135deg,#94A3B8,#64748B)' }}>
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="status-card-content">
                  <div className="status-card-title">GPS Location</div>
                  <div className="status-card-value">{location ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
              <div className="status-card" onClick={() => navigate('/emergency-history')} style={{ cursor:'pointer' }}>
                <div className="status-card-icon" style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>
                  <i className="fas fa-history"></i>
                </div>
                <div className="status-card-content">
                  <div className="status-card-title">Total Cases</div>
                  <div className="status-card-value">{emergencyHistory.length}</div>
                </div>
              </div>
              <div className="status-card">
                <div className="status-card-icon" style={{ background: 'linear-gradient(135deg,#3B82F6,#2563EB)' }}>
                  <i className="fas fa-clock"></i>
                </div>
                <div className="status-card-content">
                  <div className="status-card-title">Avg Response</div>
                  <div className="status-card-value">~5 min</div>
                </div>
              </div>
            </div>

            {/* Emergency History Preview */}
            <div className="history-preview-list">
              {emergencyHistory.length === 0 ? (
                <div className="history-preview-empty">
                  <i className="fas fa-inbox"></i>
                  <span>No emergency history yet</span>
                </div>
              ) : (
                emergencyHistory.slice(0, 3).map((item) => (
                  <div key={item.id} className="history-preview-item">
                    <div className="hpi-icon" style={{
                      background: item.emergency_type === 'police' ? '#EFF6FF' : item.emergency_type === 'ambulance' ? '#FEF2F2' : '#FFF7ED',
                      color: item.emergency_type === 'police' ? '#1D4ED8' : item.emergency_type === 'ambulance' ? '#DC2626' : '#EA580C'
                    }}>
                      <i className={`fas ${item.emergency_type === 'police' ? 'fa-shield-alt' : item.emergency_type === 'ambulance' ? 'fa-ambulance' : 'fa-fire-extinguisher'}`}></i>
                    </div>
                    <div className="hpi-info">
                      <span className="hpi-type">{item.emergency_type?.toUpperCase()}</span>
                      <span className="hpi-date">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`hpi-status hpi-status-${item.status}`}>{item.status}</span>
                  </div>
                ))
              )}
              {emergencyHistory.length > 3 && (
                <button className="history-preview-more" onClick={() => navigate('/emergency-history')}>
                  View {emergencyHistory.length - 3} more <i className="fas fa-arrow-right"></i>
                </button>
              )}
            </div>
          </div>

          {/* ── Wildlife Status & History ── */}
          <div className="status-section wildlife-status-section">
            <div className="section-title-row">
              <div className="section-title-icon" style={{ background:'linear-gradient(135deg,#22C55E,#16A34A)' }}><i className="fas fa-paw"></i></div>
              <h2>Wildlife Status</h2>
              <button className="section-view-all" onClick={() => navigate('/wildlife/my-reports')}>
                View All <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <div className="status-cards-grid">
              <div className="status-card" onClick={() => navigate('/wildlife/my-reports')} style={{ cursor:'pointer' }}>
                <div className="status-card-icon" style={{ background:'linear-gradient(135deg,#8B5CF6,#7C3AED)' }}>
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <div className="status-card-content">
                  <div className="status-card-title">My Reports</div>
                  <div className="status-card-value">View</div>
                </div>
              </div>
              <div className="status-card" onClick={() => navigate('/wildlife/report')} style={{ cursor:'pointer' }}>
                <div className="status-card-icon" style={{ background:'linear-gradient(135deg,#22C55E,#16A34A)' }}>
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className="status-card-content">
                  <div className="status-card-title">New Report</div>
                  <div className="status-card-value">Submit</div>
                </div>
              </div>
              <div className="status-card">
                <div className="status-card-icon" style={{ background:'linear-gradient(135deg,#F59E0B,#D97706)' }}>
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="status-card-content">
                  <div className="status-card-title">Report Type</div>
                  <div className="status-card-value">Wildlife</div>
                </div>
              </div>
              <div className="status-card">
                <div className="status-card-icon" style={{ background:'linear-gradient(135deg,#0EA5E9,#0284C7)' }}>
                  <i className="fas fa-leaf"></i>
                </div>
                <div className="status-card-content">
                  <div className="status-card-title">Department</div>
                  <div className="status-card-value">Forest</div>
                </div>
              </div>
            </div>
            <div className="wildlife-quick-links">
              <button className="wql-btn" onClick={() => navigate('/wildlife/report')}>
                <i className="fas fa-camera"></i> Report Sighting
              </button>
              <button className="wql-btn wql-btn-outline" onClick={() => navigate('/wildlife/my-reports')}>
                <i className="fas fa-list"></i> My Submissions
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
