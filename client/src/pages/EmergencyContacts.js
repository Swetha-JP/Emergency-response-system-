import React from 'react';
import './EmergencyContacts.css';

const EmergencyContacts = () => {
  const localResources = [
    { name: 'City Police Control Room', number: '555-0100', icon: 'fa-user-shield', color: '#457B9D' },
    { name: 'City Fire Department', number: '555-0101', icon: 'fa-fire-extinguisher', color: '#FF6B35' },
    { name: 'Central Hospital Emergency', number: '555-0200', icon: 'fa-hospital', color: '#E63946' },
    { name: 'Metro Hospital', number: '555-0201', icon: 'fa-ambulance', color: '#06D6A0' },
    { name: 'City Medical Center', number: '555-0202', icon: 'fa-plus-square', color: '#9D4EDD' },
    { name: 'Traffic Control Center', number: '555-0300', icon: 'fa-traffic-light', color: '#FFB703' },
    { name: 'Community Hospital', number: '555-0203', icon: 'fa-hospital-alt', color: '#20C997' },
    { name: 'Regional Medical Center', number: '555-0204', icon: 'fa-clinic-medical', color: '#FD7E14' },
    { name: 'City General Hospital', number: '555-0205', icon: 'fa-briefcase-medical', color: '#6610F2' },
    { name: 'Women & Children Hospital', number: '555-0206', icon: 'fa-user-nurse', color: '#E83E8C' },
    { name: 'Emergency Medical Services', number: '555-0207', icon: 'fa-ambulance', color: '#17A2B8' },
    { name: 'City Ambulance Service', number: '555-0208', icon: 'fa-truck-medical', color: '#DC3545' },
  ];

  const contacts = [
    { name: 'Police', number: '100', icon: 'fa-shield-alt', color: '#457B9D' },
    { name: 'Ambulance', number: '102', icon: 'fa-ambulance', color: '#E63946' },
    { name: 'Fire Service', number: '101', icon: 'fa-fire-extinguisher', color: '#FF6B35' },
    { name: 'Women Helpline', number: '1091', icon: 'fa-female', color: '#9D4EDD' },
    { name: 'Child Helpline', number: '1098', icon: 'fa-child', color: '#06D6A0' },
    { name: 'Disaster Management', number: '108', icon: 'fa-exclamation-triangle', color: '#FFB703' },
    { name: 'Senior Citizen Helpline', number: '14567', icon: 'fa-user-clock', color: '#17A2B8' },
    { name: 'Tourist Helpline', number: '1363', icon: 'fa-map-marked-alt', color: '#20C997' },
    { name: 'Railway Helpline', number: '139', icon: 'fa-train', color: '#6C757D' },
    { name: 'Road Accident Emergency', number: '1073', icon: 'fa-car-crash', color: '#DC3545' },
    { name: 'Blood Bank', number: '1910', icon: 'fa-tint', color: '#E83E8C' },
    { name: 'Poison Control', number: '1066', icon: 'fa-skull-crossbones', color: '#6610F2' },
  ];

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="emergency-contacts-page">
      <header className="page-header">
        <div className="container-fluid">
          <button className="btn-back" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1>Emergency Contacts</h1>
        </div>
      </header>

      <div className="page-content">
        <div className="container-fluid">
          {/* Local Resources Section */}
          <div className="section-header">
            <h2>Local Emergency Resources</h2>
            <p>Direct phone numbers for local emergency services (Sample Data)</p>
          </div>
          <div className="contacts-grid">
            {localResources.map((contact, index) => (
              <div key={index} className="contact-card" onClick={() => handleCall(contact.number)}>
                <div className="contact-icon" style={{ backgroundColor: contact.color }}>
                  <i className={`fas ${contact.icon}`}></i>
                </div>
                <h3>{contact.name}</h3>
                <p className="contact-number">{contact.number}</p>
                <button className="btn-call">
                  <i className="fas fa-phone-alt"></i> Call Now
                </button>
              </div>
            ))}
          </div>

          {/* Emergency Contacts Section */}
          <div className="section-header" style={{ marginTop: 'var(--space-3xl)' }}>
            <h2>Emergency Contacts</h2>
            <p>National emergency helpline numbers</p>
          </div>
          <div className="contacts-grid">
            {contacts.map((contact, index) => (
              <div key={index} className="contact-card" onClick={() => handleCall(contact.number)}>
                <div className="contact-icon" style={{ backgroundColor: contact.color }}>
                  <i className={`fas ${contact.icon}`}></i>
                </div>
                <h3>{contact.name}</h3>
                <p className="contact-number">{contact.number}</p>
                <button className="btn-call">
                  <i className="fas fa-phone-alt"></i> Call Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
