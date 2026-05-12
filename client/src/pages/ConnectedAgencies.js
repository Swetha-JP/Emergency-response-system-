import React from 'react';
import './ConnectedAgencies.css';

const ConnectedAgencies = () => {

  const agencies = [
    {
      id: 1, name: 'Police Department', type: 'police',
      description: 'Crime, theft, and security emergencies handled with rapid response.',
      icon: 'fa-shield-alt',
      gradient: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
      services: ['Crime Reporting', 'Theft Investigation', 'Security Patrol', 'Emergency Response'],
      contact: '100', email: 'police@agency.com'
    },
    {
      id: 2, name: 'Ambulance Services', type: 'ambulance',
      description: 'Medical emergencies and critical health situations attended immediately.',
      icon: 'fa-ambulance',
      gradient: 'linear-gradient(135deg,#DC2626,#EF4444)',
      services: ['Emergency Medical Care', 'Patient Transport', 'First Aid', 'Critical Care'],
      contact: '102', email: 'ambulance@agency.com'
    },
    {
      id: 3, name: 'Fire Department', type: 'fire',
      description: 'Fire accidents, rescue operations and disaster response teams.',
      icon: 'fa-fire-extinguisher',
      gradient: 'linear-gradient(135deg,#EA580C,#F97316)',
      services: ['Fire Fighting', 'Rescue Operations', 'Disaster Response', 'Safety Training'],
      contact: '101', email: 'fire@agency.com'
    }
  ];

  return (
    <div className="connected-agencies-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1>Connected Agencies</h1>
          <p>All emergency services in one platform</p>
        </div>
      </header>

      <div className="page-content">
        <div className="agencies-grid">
          {agencies.map(agency => (
            <div key={agency.id} className="agency-card">
              <div className="agency-header" style={{ background: agency.gradient }}>
                <div className="agency-icon">
                  <i className={`fas ${agency.icon}`}></i>
                </div>
                <h2>{agency.name}</h2>
                <span className="hotline-lbl">Hotline</span>
                <span className="hotline-num">{agency.contact}</span>
              </div>

              <div className="agency-body">
                <h3>{agency.name}</h3>
                <p>{agency.description}</p>
                <span className="agency-body-label">Services</span>
                <ul className="services-list">
                  {agency.services.map((service, index) => (
                    <li key={index}>
                      <i className="fas fa-check"></i>
                      {service}
                    </li>
                  ))}
                </ul>
                <div className="agency-contact">
                  <div className="contact-item">
                    <i className="fas fa-phone-alt"></i>
                    <span>Hotline: {agency.contact}</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <span>{agency.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="info-section">
          <div className="info-card">
            <i className="fas fa-clock"></i>
            <h3>24/7 Availability</h3>
            <p>All agencies are available round the clock for emergency response</p>
          </div>
          <div className="info-card">
            <i className="fas fa-map-marked-alt"></i>
            <h3>Real-time Tracking</h3>
            <p>Track emergency response teams in real-time with GPS</p>
          </div>
          <div className="info-card">
            <i className="fas fa-users"></i>
            <h3>Coordinated Response</h3>
            <p>Multiple agencies can coordinate for complex emergencies</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectedAgencies;
