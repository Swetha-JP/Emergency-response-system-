import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { wildlifeAPI } from '../services/api';
import socketService from '../services/socket';
import './MyWildlifeReports.css';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const statusConfig = {
  Pending:  { color:'#F59E0B', bg:'#FEF3C7', icon:'fa-clock' },
  Accepted: { color:'#3B82F6', bg:'#DBEAFE', icon:'fa-check-circle' },
  Rejected: { color:'#EF4444', bg:'#FEE2E2', icon:'fa-times-circle' },
  Resolved: { color:'#22C55E', bg:'#DCFCE7', icon:'fa-check-double' },
};

const MyWildlifeReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchReports();
    socketService.connect();
    // Listen for status updates
    const socket = socketService.socket;
    if (socket) {
      socket.on(`wildlife:status:${user.id}`, (data) => {
        toast.info(`Wildlife report #${data.reportId} status: ${data.status}`);
        fetchReports();
      });
    }
    return () => socketService.disconnect();
  }, []); // eslint-disable-line

  const fetchReports = async () => {
    try {
      const res = await wildlifeAPI.getMyReports(user.id);
      setReports(res.data.data || []);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mwr-page">
      <header className="mwr-header">
        <button className="mwr-back" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1><i className="fas fa-paw"></i> My Wildlife Reports</h1>
          <p>{reports.length} report{reports.length !== 1 ? 's' : ''} submitted</p>
        </div>
        <button className="mwr-new-btn" onClick={() => navigate('/wildlife/report')}>
          <i className="fas fa-plus"></i> New Report
        </button>
      </header>

      <div className="mwr-content">
        {loading ? (
          <div className="mwr-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="mwr-empty">
            <div className="mwr-empty-icon"><i className="fas fa-paw"></i></div>
            <h3>No Reports Yet</h3>
            <p>You haven't submitted any wildlife reports</p>
            <button className="mwr-new-btn" onClick={() => navigate('/wildlife/report')}>
              <i className="fas fa-plus"></i> Submit First Report
            </button>
          </div>
        ) : (
          <div className="mwr-grid">
            {reports.map(r => {
              const sc = statusConfig[r.status] || statusConfig.Pending;
              return (
                <div key={r.report_id} className="mwr-card">
                  <div className="mwr-card-img">
                    <img src={`${API_BASE}${r.image_url}`} alt={r.incident_type} onError={e => { e.target.src = 'https://via.placeholder.com/300x200?text=Image'; }} />
                    <div className="mwr-status-chip" style={{ background: sc.bg, color: sc.color }}>
                      <i className={`fas ${sc.icon}`}></i> {r.status}
                    </div>
                  </div>
                  <div className="mwr-card-body">
                    <div className="mwr-type-badge">
                      <i className="fas fa-exclamation-triangle"></i>
                      {r.incident_type}
                    </div>
                    <p className="mwr-desc">{r.description || 'No description provided'}</p>
                    <div className="mwr-meta">
                      <span><i className="fas fa-calendar-alt"></i> {new Date(r.created_at).toLocaleDateString()}</span>
                      {r.latitude && r.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                          target="_blank" rel="noopener noreferrer"
                          className="mwr-map-link"
                        >
                          <i className="fas fa-map-marker-alt"></i> View on Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWildlifeReports;
