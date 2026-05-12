import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { wildlifeAPI } from '../services/api';
import socketService from '../services/socket';
import './WildlifeDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const statusConfig = {
  Pending:  { color:'#F59E0B', bg:'#FEF3C7', icon:'fa-clock' },
  Accepted: { color:'#3B82F6', bg:'#DBEAFE', icon:'fa-check-circle' },
  Rejected: { color:'#EF4444', bg:'#FEE2E2', icon:'fa-times-circle' },
  Resolved: { color:'#22C55E', bg:'#DCFCE7', icon:'fa-check-double' },
};

const MiniMap = ({ lat, lng }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !lat || !lng) return;
    const map = L.map(ref.current, { zoomControl:false, attributionControl:false }).setView([lat, lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([lat, lng]).addTo(map);
    setTimeout(() => map.invalidateSize(), 100);
    return () => map.remove();
  }, [lat, lng]);
  return <div ref={ref} style={{ height:'140px', borderRadius:'12px', overflow:'hidden' }} />;
};

const WildlifeDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchReports();
    socketService.connect();
    const socket = socketService.socket;
    if (socket) {
      socket.on('wildlife:new', () => {
        toast.success('🐾 New wildlife report received!');
        fetchReports();
      });
    }
    return () => socketService.disconnect();
  }, []); // eslint-disable-line

  const fetchReports = async () => {
    try {
      const res = await wildlifeAPI.getAllReports();
      setReports(res.data.data || []);
    } catch { toast.error('Failed to load wildlife reports'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await wildlifeAPI.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      fetchReports();
      if (selected?.report_id === id) setSelected(prev => ({ ...prev, status }));
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = filter === 'All' ? reports : reports.filter(r => r.status === filter);
  const counts = { All: reports.length, Pending: reports.filter(r=>r.status==='Pending').length, Accepted: reports.filter(r=>r.status==='Accepted').length, Resolved: reports.filter(r=>r.status==='Resolved').length };

  return (
    <div className="wld-page">
      <header className="wld-header">
        <div className="wld-header-left">
          <div className="wld-brand-icon"><i className="fas fa-paw"></i></div>
          <div>
            <h1>Wildlife Rescue Dashboard</h1>
            <p>Forest Department — Incident Management</p>
          </div>
        </div>
        <div className="wld-stats-row">
          {Object.entries(counts).map(([k,v]) => (
            <div key={k} className="wld-stat-chip">
              <span className="wld-stat-val">{v}</span>
              <span className="wld-stat-lbl">{k}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="wld-body">
        {/* Filter tabs */}
        <div className="wld-filters">
          {['All','Pending','Accepted','Resolved','Rejected'].map(f => (
            <button key={f} className={`wld-filter-btn ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
              {f} {f !== 'All' && <span className="wld-filter-count">{reports.filter(r=>r.status===f).length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="wld-loading"><i className="fas fa-spinner fa-spin"></i><p>Loading reports...</p></div>
        ) : filtered.length === 0 ? (
          <div className="wld-empty"><i className="fas fa-paw"></i><p>No {filter !== 'All' ? filter.toLowerCase() : ''} reports found</p></div>
        ) : (
          <div className="wld-grid">
            {filtered.map(r => {
              const sc = statusConfig[r.status] || statusConfig.Pending;
              return (
                <div key={r.report_id} className="wld-card" onClick={() => setSelected(r)}>
                  <div className="wld-card-img">
                    <img src={`${API_BASE}${r.image_url}`} alt={r.incident_type} onError={e => { e.target.src='https://via.placeholder.com/300x180?text=No+Image'; }} />
                    <div className="wld-card-status" style={{ background:sc.bg, color:sc.color }}>
                      <i className={`fas ${sc.icon}`}></i> {r.status}
                    </div>
                  </div>
                  <div className="wld-card-body">
                    <div className="wld-card-type"><i className="fas fa-exclamation-triangle"></i>{r.incident_type}</div>
                    <p className="wld-card-desc">{r.description || 'No description'}</p>
                    <div className="wld-card-meta">
                      <span><i className="fas fa-user"></i>{r.user_name || 'Tourist'}</span>
                      <span><i className="fas fa-clock"></i>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.status === 'Pending' && (
                      <div className="wld-card-actions" onClick={e => e.stopPropagation()}>
                        <button className="wld-btn accept" onClick={() => updateStatus(r.report_id,'Accepted')}><i className="fas fa-check"></i> Accept</button>
                        <button className="wld-btn reject" onClick={() => updateStatus(r.report_id,'Rejected')}><i className="fas fa-times"></i> Reject</button>
                      </div>
                    )}
                    {r.status === 'Accepted' && (
                      <div className="wld-card-actions" onClick={e => e.stopPropagation()}>
                        <button className="wld-btn resolve" onClick={() => updateStatus(r.report_id,'Resolved')}><i className="fas fa-check-double"></i> Mark Resolved</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="wld-modal-overlay" onClick={() => setSelected(null)}>
          <div className="wld-modal" onClick={e => e.stopPropagation()}>
            <div className="wld-modal-header">
              <h2><i className="fas fa-paw"></i> Report #{selected.report_id}</h2>
              <button className="wld-modal-close" onClick={() => setSelected(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="wld-modal-body">
              <img src={`${API_BASE}${selected.image_url}`} alt="Report" className="wld-modal-img" onError={e => { e.target.src='https://via.placeholder.com/600x300?text=No+Image'; }} />
              <div className="wld-modal-info">
                <div className="wld-info-row"><span>Type</span><strong>{selected.incident_type}</strong></div>
                <div className="wld-info-row"><span>Status</span>
                  <span className="wld-modal-status" style={{ background:statusConfig[selected.status]?.bg, color:statusConfig[selected.status]?.color }}>
                    {selected.status}
                  </span>
                </div>
                <div className="wld-info-row"><span>Reporter</span><strong>{selected.user_name || 'Tourist'}</strong></div>
                <div className="wld-info-row"><span>Date</span><strong>{new Date(selected.created_at).toLocaleString()}</strong></div>
                {selected.description && <div className="wld-info-row"><span>Description</span><strong>{selected.description}</strong></div>}
              </div>
              {selected.latitude && selected.longitude && (
                <div className="wld-modal-map">
                  <p className="wld-map-label"><i className="fas fa-map-marker-alt"></i> Incident Location</p>
                  <MiniMap lat={parseFloat(selected.latitude)} lng={parseFloat(selected.longitude)} />
                  <a href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`} target="_blank" rel="noopener noreferrer" className="wld-gmaps-link">
                    <i className="fas fa-external-link-alt"></i> Open in Google Maps
                  </a>
                </div>
              )}
              <div className="wld-modal-actions">
                {selected.status === 'Pending' && <>
                  <button className="wld-btn accept" onClick={() => updateStatus(selected.report_id,'Accepted')}><i className="fas fa-check"></i> Accept Case</button>
                  <button className="wld-btn reject" onClick={() => updateStatus(selected.report_id,'Rejected')}><i className="fas fa-times"></i> Reject Case</button>
                </>}
                {selected.status === 'Accepted' && (
                  <button className="wld-btn resolve" onClick={() => updateStatus(selected.report_id,'Resolved')}><i className="fas fa-check-double"></i> Mark Resolved</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WildlifeDashboard;
