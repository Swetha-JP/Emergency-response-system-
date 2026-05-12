import React, { useState, useEffect } from 'react';
import { emergencyAPI } from '../services/api';
import { toast } from 'react-toastify';
import './AgencyHistory.css';

const AgencyHistory = () => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await emergencyAPI.getAll();
      setHistory(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load history');
    }
  };

  const filteredHistory = history.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  return (
    <div className="agency-history-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1>Emergency History</h1>
          <p>View all past emergency requests</p>
        </div>
      </header>

      <div className="page-content">
        <div className="filter-bar">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({history.length})
          </button>
          <button className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`} onClick={() => setFilter('resolved')}>
            Resolved ({history.filter(e => e.status === 'resolved').length})
          </button>
          <button className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
            Cancelled ({history.filter(e => e.status === 'cancelled').length})
          </button>
        </div>

        <div className="history-grid">
          {filteredHistory.map(item => (
            <div key={item.id} className="history-card">
              <div className="history-card-header">
                <span className={`status-badge ${item.status}`}>{item.status}</span>
                <span className="date">{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <h3>{item.emergency_type?.toUpperCase()}</h3>
              <p>{item.description}</p>
              <div className="history-meta">
                <span><i className="fas fa-map-marker-alt"></i> {parseFloat(item.latitude || 0).toFixed(4)}, {parseFloat(item.longitude || 0).toFixed(4)}</span>
                <span><i className="fas fa-clock"></i> {new Date(item.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgencyHistory;
