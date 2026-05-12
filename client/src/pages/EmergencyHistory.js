import React, { useState, useEffect } from 'react';
import { emergencyAPI } from '../services/api';
import { toast } from 'react-toastify';
import './EmergencyHistory.css';

const EmergencyHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await emergencyAPI.getAll();
      setHistory(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFB703',
      accepted: '#457B9D',
      resolved: '#06D6A0',
      cancelled: '#6C757D'
    };
    return colors[status] || '#6C757D';
  };

  const getTypeIcon = (type) => {
    const icons = {
      police: 'fa-shield-alt',
      ambulance: 'fa-ambulance',
      fire: 'fa-fire-extinguisher'
    };
    return icons[type] || 'fa-exclamation-circle';
  };

  return (
    <div className="emergency-history-page">
      <header className="page-header">
        <div className="container-fluid">
          <button className="btn-back" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1>Emergency History</h1>
        </div>
      </header>

      <div className="page-content">
        <div className="container-fluid">
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-history"></i>
              <h2>No Emergency History</h2>
              <p>You haven't made any emergency requests yet</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-card">
                  <div className="history-card-header">
                    <div className="history-type">
                      <div className="type-icon">
                        <i className={`fas ${getTypeIcon(item.emergency_type)}`}></i>
                      </div>
                      <div>
                        <h3>{item.emergency_type?.toUpperCase()}</h3>
                        <p className="history-date">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="history-card-body">
                    <p><strong>Description:</strong> {item.description}</p>
                    <p><strong>Priority:</strong> {item.priority}</p>
                    <p><strong>Location:</strong> {item.latitude}, {item.longitude}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyHistory;
