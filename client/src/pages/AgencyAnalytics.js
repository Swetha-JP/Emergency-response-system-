import React, { useState, useEffect } from 'react';
import { emergencyAPI } from '../services/api';
import './AgencyAnalytics.css';

const AgencyAnalytics = () => {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await emergencyAPI.getAll();
      const data = response.data.data || [];
      setStats({
        total: data.length,
        resolved: data.filter(e => e.status === 'resolved').length,
        pending: data.filter(e => e.status === 'pending').length,
        cancelled: data.filter(e => e.status === 'cancelled').length
      });
    } catch (error) {
      console.error('Failed to load analytics');
    }
  };

  const performanceData = [
    { label: 'Total Requests', value: stats.total, icon: 'fa-chart-line', color: '#457B9D' },
    { label: 'Resolved', value: stats.resolved, icon: 'fa-check-circle', color: '#06D6A0' },
    { label: 'Pending', value: stats.pending, icon: 'fa-clock', color: '#FFB703' },
    { label: 'Cancelled', value: stats.cancelled, icon: 'fa-times-circle', color: '#E63946' }
  ];

  return (
    <div className="agency-analytics-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1>Analytics & Reports</h1>
          <p>Performance metrics and insights</p>
        </div>
      </header>

      <div className="page-content">
        <div className="analytics-grid">
          {performanceData.map((item, index) => (
            <div key={index} className="analytics-card">
              <div className="analytics-icon" style={{ backgroundColor: item.color }}>
                <i className={`fas ${item.icon}`}></i>
              </div>
              <div className="analytics-content">
                <h3>{item.value}</h3>
                <p>{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="charts-section">
          <div className="chart-card">
            <h3>Response Rate</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total * 100) : 0}%` }}></div>
            </div>
            <p>{stats.total > 0 ? Math.round(stats.resolved / stats.total * 100) : 0}% Success Rate</p>
          </div>

          <div className="chart-card">
            <h3>Average Response Time</h3>
            <div className="time-display">
              <i className="fas fa-stopwatch"></i>
              <span>5.2 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyAnalytics;
