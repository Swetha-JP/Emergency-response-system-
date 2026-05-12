import React from 'react';
import './NearbyHospitals.css';

const NearbyHospitals = () => {
  const hospitals = [
    { name: 'AIIMS Hospital', distance: '2.5 km', address: 'Ansari Nagar, New Delhi', phone: '011-26588500', rating: 4.5 },
    { name: 'Apollo Hospital', distance: '3.8 km', address: 'Sarita Vihar, New Delhi', phone: '011-26825858', rating: 4.7 },
    { name: 'Max Super Speciality', distance: '4.2 km', address: 'Saket, New Delhi', phone: '011-26515050', rating: 4.6 },
    { name: 'Fortis Hospital', distance: '5.1 km', address: 'Vasant Kunj, New Delhi', phone: '011-42776222', rating: 4.4 },
    { name: 'Safdarjung Hospital', distance: '3.0 km', address: 'Safdarjung, New Delhi', phone: '011-26165060', rating: 4.2 },
    { name: 'Ram Manohar Lohia', distance: '4.5 km', address: 'Baba Kharak Singh Marg', phone: '011-23365525', rating: 4.3 },
  ];

  return (
    <div className="nearby-hospitals-page">
      <header className="page-header">
        <div className="container-fluid">
          <button className="btn-back" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1>Nearby Hospitals</h1>
        </div>
      </header>

      <div className="page-content">
        <div className="container-fluid">
          <div className="hospitals-list">
            {hospitals.map((hospital, index) => (
              <div key={index} className="hospital-card">
                <div className="hospital-icon">
                  <i className="fas fa-hospital"></i>
                </div>
                <div className="hospital-info">
                  <h3>{hospital.name}</h3>
                  <p className="hospital-address">
                    <i className="fas fa-map-marker-alt"></i> {hospital.address}
                  </p>
                  <p className="hospital-distance">
                    <i className="fas fa-route"></i> {hospital.distance} away
                  </p>
                  <div className="hospital-rating">
                    <i className="fas fa-star"></i>
                    <span>{hospital.rating}</span>
                  </div>
                </div>
                <div className="hospital-actions">
                  <button className="btn-action btn-call" onClick={() => window.location.href = `tel:${hospital.phone}`}>
                    <i className="fas fa-phone-alt"></i>
                  </button>
                  <button className="btn-action btn-directions">
                    <i className="fas fa-directions"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyHospitals;
