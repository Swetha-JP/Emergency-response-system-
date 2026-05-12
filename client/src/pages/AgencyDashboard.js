import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { emergencyAPI, agencyAPI } from '../services/api';
import socketService from '../services/socket';
import MapComponent from '../components/MapComponent';
import './AgencyDashboard.css';

const AgencyDashboard = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    activeCases: 0,
    resolvedToday: 0,
    responseTime: '1.8m',
    totalRequests: 0
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    socketService.connect();

    socketService.onNewEmergency((data) => {
      toast.success(`🚨 New ${data.emergencyType || 'emergency'} request received!`, {
        autoClose: 5000,
        position: 'top-right'
      });
      fetchEmergencies();
    });

    fetchEmergencies();

    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchStats();
  }, [emergencies]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEmergencies = async () => {
    try {
      const response = await emergencyAPI.getAll();
      setEmergencies(response.data.data || []);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const activeCases = emergencies.filter(e => e.status === 'pending' || e.status === 'accepted').length;
      const resolvedToday = emergencies.filter(e => {
        if (e.status !== 'resolved') return false;
        const today = new Date().toDateString();
        const createdDate = new Date(e.created_at).toDateString();
        return today === createdDate;
      }).length;
      const totalRequests = emergencies.length;

      setStats({
        activeCases,
        resolvedToday,
        responseTime: '5.2m',
        totalRequests
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleAcceptEmergency = async (emergencyId) => {
    setLoading(true);
    try {
      await agencyAPI.updateStatus(emergencyId, { status: 'accepted' });
      
      socketService.emitAgencyResponse({
        emergencyId,
        status: 'accepted',
        agencyId: user?.id || 1
      });

      toast.success('✅ Emergency accepted successfully!', {
        autoClose: 3000
      });
      fetchEmergencies();
      fetchStats();
    } catch (error) {
      console.error('Accept error:', error);
      toast.error('❌ Failed to accept emergency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectEmergency = async (emergencyId) => {
    if (!window.confirm('Are you sure you want to reject this emergency?')) return;
    setLoading(true);
    try {
      await agencyAPI.updateStatus(emergencyId, { status: 'cancelled' });
      toast.warning('⚠️ Emergency rejected', {
        autoClose: 3000
      });
      fetchEmergencies();
      fetchStats();
    } catch (error) {
      toast.error('❌ Failed to reject emergency');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveEmergency = async (emergencyId) => {
    setLoading(true);
    try {
      await agencyAPI.updateStatus(emergencyId, { status: 'resolved' });
      toast.success('✅ Emergency marked as resolved!', {
        autoClose: 3000
      });
      fetchEmergencies();
      fetchStats();
    } catch (error) {
      toast.error('❌ Failed to resolve emergency');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmergencies = emergencies.filter(e => {
    if (activeTab === 'active') return e.status === 'pending' || e.status === 'accepted';
    if (activeTab === 'pending') return e.status === 'pending';
    if (activeTab === 'resolved') return e.status === 'resolved';
    return true;
  });

  const pendingCount = emergencies.filter(e => e.status === 'pending').length;

  const statsArray = [
    { label: 'Active Cases', value: stats.activeCases, icon: 'fa-exclamation-circle', color: 'var(--primary-red)' },
    { label: 'Resolved Today', value: stats.resolvedToday, icon: 'fa-check-circle', color: 'var(--success-green)' },
    { label: 'Response Time', value: stats.responseTime, icon: 'fa-clock', color: 'var(--secondary-blue)' },
    { label: 'Total Requests', value: stats.totalRequests, icon: 'fa-chart-line', color: 'var(--warning-yellow)' }
  ];

  return (
    <div className="agency-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <i className="fas fa-shield-alt"></i>
          <span>Agency Portal</span>
        </div>
        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-item active" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }}>
            <i className="fas fa-th-large"></i>
            <span>Dashboard</span>
          </a>
          <a href="#emergencies" className="nav-item" onClick={(e) => { e.preventDefault(); document.querySelector('.emergency-requests-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <i className="fas fa-bell"></i>
            <span>Emergencies</span>
            {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
          </a>
          <a href="#map" className="nav-item" onClick={(e) => { e.preventDefault(); document.querySelector('.map-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <i className="fas fa-map-marked-alt"></i>
            <span>Live Map</span>
          </a>
          <a href="#history" className="nav-item" onClick={(e) => { e.preventDefault(); window.location.href = '/agency/history'; }}>
            <i className="fas fa-history"></i>
            <span>History</span>
          </a>
          <a href="#analytics" className="nav-item" onClick={(e) => { e.preventDefault(); window.location.href = '/agency/analytics'; }}>
            <i className="fas fa-chart-bar"></i>
            <span>Analytics</span>
          </a>
          <a href="#settings" className="nav-item" onClick={(e) => { e.preventDefault(); window.location.href = '/agency/settings'; }}>
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </a>
        </nav>
        <div className="sidebar-footer">
          <a href="#logout" className="nav-item" onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </a>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Emergency Dashboard</h1>
            <p>Monitor and respond to emergency requests</p>
          </div>
          <div className="header-right">
            <button className="btn-icon" onClick={() => {
              toast.info(`You have ${pendingCount} pending emergency request(s)`);
              setActiveTab('pending');
            }}>
              <i className="fas fa-bell"></i>
              {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
            </button>
            <div className="user-profile" onClick={() => window.location.href = '/agency/profile'} style={{ cursor: 'pointer' }}>
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #457B9D, #E63946)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #E63946' }}>
                  <i className="fas fa-user" style={{ color: 'white', fontSize: '20px' }}></i>
                </div>
              )}
              <div className="user-info">
                <span className="user-name">{user?.name || 'Officer'}</span>
                <span className="user-role">{user?.userType === 'agency' ? 'Agency' : 'Department'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="stats-grid">
          {statsArray.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{backgroundColor: stat.color}}>
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <div className="stat-content">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="emergency-requests-section">
          <div className="section-header">
            <h2>Emergency Requests</h2>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                Active
              </button>
              <button 
                className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
              <button 
                className={`tab ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                Resolved
              </button>
            </div>
          </div>

          <div className="emergency-list">
            {filteredEmergencies.length === 0 ? (
              <div style={{textAlign: 'center', padding: '2rem', color: 'var(--dark-gray)'}}>
                <i className="fas fa-inbox" style={{fontSize: '3rem', marginBottom: '1rem'}}></i>
                <p>No emergencies found</p>
              </div>
            ) : (
              filteredEmergencies.map(emergency => (
                <div key={emergency.id} className={`incident-card ${emergency.status}`}>
                  <div className="incident-header">
                    <div className="incident-info">
                      <h3>{emergency.emergency_type || 'Emergency'}</h3>
                      <div className="incident-meta">
                        <span><i className="fas fa-map-marker-alt"></i> Lat: {parseFloat(emergency.latitude || 0).toFixed(4)}, Lng: {parseFloat(emergency.longitude || 0).toFixed(4)}</span>
                        <span><i className="fas fa-clock"></i> {new Date(emergency.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <span className={`incident-card-badge ${emergency.priority || 'active'}`}>
                      {emergency.status}
                    </span>
                  </div>
                  <div className="incident-actions">
                    {emergency.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-success btn-sm" 
                          onClick={() => handleAcceptEmergency(emergency.id)}
                          disabled={loading}
                        >
                          <i className="fas fa-check"></i> Accept
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleRejectEmergency(emergency.id)}
                          disabled={loading}
                        >
                          <i className="fas fa-times"></i> Reject
                        </button>
                      </>
                    )}
                    {emergency.status === 'accepted' && (
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => handleResolveEmergency(emergency.id)}
                        disabled={loading}
                      >
                        <i className="fas fa-check-double"></i> Mark Resolved
                      </button>
                    )}
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => {
                      setSelectedEmergency(emergency);
                      setShowDetailsModal(true);
                    }}>
                      <i className="fas fa-eye"></i> View Details
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${emergency.latitude},${emergency.longitude}`, '_blank')}>
                      <i className="fas fa-directions"></i> Navigate
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="agency-quick-actions">
          <div className="aqa-header">
            <div className="aqa-title-icon"><i className="fas fa-th-large"></i></div>
            <h2>Quick Actions</h2>
          </div>
          <div className="aqa-grid">
            {[
              { icon:'fa-history',      label:'Emergency History',  desc:'View all past cases',       href:'/agency/history',    color:'#3B82F6', bg:'#EFF6FF' },
              { icon:'fa-chart-bar',    label:'Analytics',          desc:'Performance insights',       href:'/agency/analytics',  color:'#8B5CF6', bg:'#EDE9FE' },
              { icon:'fa-user-circle',  label:'Agency Profile',     desc:'Manage your profile',        href:'/agency/profile',    color:'#0EA5E9', bg:'#F0F9FF' },
              { icon:'fa-cog',          label:'Settings',           desc:'Configure preferences',      href:'/agency/settings',   color:'#F59E0B', bg:'#FFFBEB' },
              { icon:'fa-bell',         label:'Pending Alerts',     desc:`${pendingCount} awaiting`,   onClick: () => setActiveTab('pending'), color:'#EF4444', bg:'#FEF2F2' },
              { icon:'fa-map-marked-alt', label:'Live Map',         desc:'View emergency locations',   onClick: () => document.querySelector('.map-section')?.scrollIntoView({ behavior:'smooth' }), color:'#22C55E', bg:'#F0FDF4' },
            ].map((a, i) => (
              <div key={i} className="aqa-card" onClick={() => a.href ? window.location.href = a.href : a.onClick?.()}>
                <div className="aqa-icon" style={{ background: a.bg, color: a.color }}>
                  <i className={`fas ${a.icon}`}></i>
                  {a.icon === 'fa-bell' && pendingCount > 0 && <span className="aqa-badge">{pendingCount}</span>}
                </div>
                <div className="aqa-info">
                  <span className="aqa-label">{a.label}</span>
                  <span className="aqa-desc">{a.desc}</span>
                </div>
                <i className="fas fa-chevron-right aqa-arrow"></i>
              </div>
            ))}
          </div>
        </div>

        {/* ── Emergency History Preview ── */}
        <div className="agency-history-preview">
          <div className="ahp-header">
            <div className="ahp-title-icon" style={{ background:'linear-gradient(135deg,#EF4444,#DC2626)' }}><i className="fas fa-ambulance"></i></div>
            <h2>Emergency History</h2>
            <button className="ahp-view-all" onClick={() => window.location.href = '/agency/history'}>
              View All <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="ahp-status-row">
            {[
              { label:'Active',   value: emergencies.filter(e => e.status==='pending'||e.status==='accepted').length, color:'#EF4444', bg:'#FEF2F2', icon:'fa-exclamation-circle' },
              { label:'Resolved', value: emergencies.filter(e => e.status==='resolved').length,  color:'#22C55E', bg:'#F0FDF4', icon:'fa-check-circle' },
              { label:'Cancelled',value: emergencies.filter(e => e.status==='cancelled').length, color:'#94A3B8', bg:'#F1F5F9', icon:'fa-ban' },
              { label:'Total',    value: emergencies.length, color:'#3B82F6', bg:'#EFF6FF', icon:'fa-chart-line' },
            ].map((s, i) => (
              <div key={i} className="ahp-stat">
                <div className="ahp-stat-icon" style={{ background: s.bg, color: s.color }}>
                  <i className={`fas ${s.icon}`}></i>
                </div>
                <span className="ahp-stat-val">{s.value}</span>
                <span className="ahp-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="ahp-list">
            {emergencies.length === 0 ? (
              <div className="ahp-empty"><i className="fas fa-inbox"></i><span>No emergency records yet</span></div>
            ) : (
              emergencies.slice(0, 4).map(e => (
                <div key={e.id} className="ahp-item">
                  <div className={`ahp-item-dot ahp-dot-${e.status}`}></div>
                  <div className="ahp-item-info">
                    <span className="ahp-item-type">{e.emergency_type?.toUpperCase() || 'EMERGENCY'}</span>
                    <span className="ahp-item-time">{new Date(e.created_at).toLocaleString()}</span>
                  </div>
                  <span className={`ahp-item-badge ahp-badge-${e.status}`}>{e.status}</span>
                </div>
              ))
            )}
            {emergencies.length > 4 && (
              <button className="ahp-more-btn" onClick={() => window.location.href = '/agency/history'}>
                +{emergencies.length - 4} more records <i className="fas fa-arrow-right"></i>
              </button>
            )}
          </div>
        </div>

        {/* ── Wildlife Status ── */}
        <div className="agency-wildlife-status">
          <div className="ahp-header">
            <div className="ahp-title-icon" style={{ background:'linear-gradient(135deg,#22C55E,#16A34A)' }}><i className="fas fa-paw"></i></div>
            <h2>Wildlife Reports</h2>
            <button className="ahp-view-all" onClick={() => window.location.href = '/wildlife/dashboard'}>
              Dashboard <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="aws-cards">
            <div className="aws-card" onClick={() => window.location.href = '/wildlife/dashboard'}>
              <div className="aws-card-icon" style={{ background:'linear-gradient(135deg,#8B5CF6,#7C3AED)' }}>
                <i className="fas fa-th-large"></i>
              </div>
              <div className="aws-card-body">
                <span className="aws-card-title">Wildlife Dashboard</span>
                <span className="aws-card-sub">Manage all wildlife reports</span>
              </div>
              <i className="fas fa-chevron-right aws-arrow"></i>
            </div>
            <div className="aws-card" onClick={() => window.location.href = '/wildlife/dashboard'}>
              <div className="aws-card-icon" style={{ background:'linear-gradient(135deg,#F59E0B,#D97706)' }}>
                <i className="fas fa-clock"></i>
              </div>
              <div className="aws-card-body">
                <span className="aws-card-title">Pending Reports</span>
                <span className="aws-card-sub">Review new sightings</span>
              </div>
              <i className="fas fa-chevron-right aws-arrow"></i>
            </div>
            <div className="aws-card" onClick={() => window.location.href = '/wildlife/dashboard'}>
              <div className="aws-card-icon" style={{ background:'linear-gradient(135deg,#22C55E,#16A34A)' }}>
                <i className="fas fa-check-double"></i>
              </div>
              <div className="aws-card-body">
                <span className="aws-card-title">Resolved Cases</span>
                <span className="aws-card-sub">Completed wildlife incidents</span>
              </div>
              <i className="fas fa-chevron-right aws-arrow"></i>
            </div>
          </div>
        </div>

        <div className="map-section">
          <h2>Live Emergency Map</h2>
          {emergencies.length > 0 && emergencies.some(e => e.latitude && e.longitude) ? (
            <MapComponent 
              latitude={parseFloat(emergencies.find(e => e.latitude)?.latitude || 28.6139)} 
              longitude={parseFloat(emergencies.find(e => e.longitude)?.longitude || 77.2090)}
              markers={emergencies.filter(e => e.latitude && e.longitude).map(e => ({
                latitude: parseFloat(e.latitude),
                longitude: parseFloat(e.longitude),
                popup: `${e.emergency_type?.toUpperCase()} - ${e.status}`
              }))}
              height="400px"
            />
          ) : (
            <div className="map-placeholder">
              <i className="fas fa-map-marked-alt"></i>
              <p>Interactive map will be displayed here</p>
              <small>Showing real-time emergency locations</small>
            </div>
          )}
        </div>
      </main>

      {/* Emergency Details Modal */}
      {showDetailsModal && selectedEmergency && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Emergency Details</h2>
              <button className="btn-close" onClick={() => setShowDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Emergency ID:</span>
                <span className="detail-value">#{selectedEmergency.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value emergency-type-badge">{selectedEmergency.emergency_type?.toUpperCase()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-badge ${selectedEmergency.status}`}>{selectedEmergency.status}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Priority:</span>
                <span className="detail-value priority-badge">{selectedEmergency.priority || 'Normal'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{selectedEmergency.description || 'No description provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">
                  Lat: {parseFloat(selectedEmergency.latitude || 0).toFixed(6)}, 
                  Lng: {parseFloat(selectedEmergency.longitude || 0).toFixed(6)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reported At:</span>
                <span className="detail-value">{new Date(selectedEmergency.created_at).toLocaleString()}</span>
              </div>
              {selectedEmergency.latitude && selectedEmergency.longitude && (
                <div className="detail-map">
                  <MapComponent 
                    latitude={parseFloat(selectedEmergency.latitude)} 
                    longitude={parseFloat(selectedEmergency.longitude)}
                    height="250px"
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedEmergency.latitude},${selectedEmergency.longitude}`, '_blank')}>
                <i className="fas fa-directions"></i> Get Directions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyDashboard;
