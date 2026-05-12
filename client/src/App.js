import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styles
import './styles/global.css';
import './styles/buttons.css';
import './styles/cards.css';

// Pages
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import AgencyDashboard from './pages/AgencyDashboard';
import AgencyHistory from './pages/AgencyHistory';
import AgencyAnalytics from './pages/AgencyAnalytics';
import AgencySettings from './pages/AgencySettings';
import AgencyProfile from './pages/AgencyProfile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ConnectedAgencies from './pages/ConnectedAgencies';
import EmergencyHistory from './pages/EmergencyHistory';
import EmergencyContacts from './pages/EmergencyContacts';
import NearbyHospitals from './pages/NearbyHospitals';
import FamilyTracking from './pages/FamilyTracking';
import WildlifeReport from './pages/WildlifeReport';
import MyWildlifeReports from './pages/MyWildlifeReports';
import WildlifeDashboard from './pages/WildlifeDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/agencies" element={<ConnectedAgencies />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/agency/dashboard" element={<AgencyDashboard />} />
          <Route path="/agency/history" element={<AgencyHistory />} />
          <Route path="/agency/analytics" element={<AgencyAnalytics />} />
          <Route path="/agency/settings" element={<AgencySettings />} />
          <Route path="/agency/profile" element={<AgencyProfile />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/emergency-history" element={<EmergencyHistory />} />
          <Route path="/emergency-contacts" element={<EmergencyContacts />} />
          <Route path="/nearby-hospitals" element={<NearbyHospitals />} />
          <Route path="/track/:emergencyId" element={<FamilyTracking />} />
          <Route path="/wildlife/report" element={<WildlifeReport />} />
          <Route path="/wildlife/my-reports" element={<MyWildlifeReports />} />
          <Route path="/wildlife/dashboard" element={<WildlifeDashboard />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
