import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './AgencySettings.css';

const AgencySettings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    autoAccept: false,
    language: 'en'
  });

  const handleSave = () => {
    toast.success('✅ Settings saved successfully!');
  };

  return (
    <div className="agency-settings-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1>Settings</h1>
          <p>Configure your agency preferences</p>
        </div>
      </header>

      <div className="page-content">
        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="setting-item">
            <div>
              <h4>Push Notifications</h4>
              <p>Receive alerts for new emergencies</p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({...settings, notifications: e.target.checked})} />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div>
              <h4>Sound Alerts</h4>
              <p>Play sound when emergency arrives</p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={settings.soundAlerts} onChange={(e) => setSettings({...settings, soundAlerts: e.target.checked})} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Emergency Handling</h3>
          <div className="setting-item">
            <div>
              <h4>Auto Accept</h4>
              <p>Automatically accept emergencies</p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={settings.autoAccept} onChange={(e) => setSettings({...settings, autoAccept: e.target.checked})} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Language</h3>
          <select value={settings.language} onChange={(e) => setSettings({...settings, language: e.target.value})} className="language-select">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        <button className="btn btn-primary btn-lg" onClick={handleSave}>
          <i className="fas fa-save"></i> Save Settings
        </button>
      </div>
    </div>
  );
};

export default AgencySettings;
