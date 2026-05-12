import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const features = [
    { icon: 'fa-hand-paper',     color: 'linear-gradient(135deg,#EF4444,#DC2626)', title: 'One-Tap SOS',           desc: 'Instant emergency alert with a single press. No typing, no delay.' },
    { icon: 'fa-map-marker-alt', color: 'linear-gradient(135deg,#3B82F6,#2563EB)', title: 'Live GPS Tracking',     desc: 'Real-time location shared with responders and family instantly.' },
    { icon: 'fa-robot',          color: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', title: 'AI Incident Detection', desc: 'Smart keyword analysis predicts emergency type automatically.' },
    { icon: 'fa-language',       color: 'linear-gradient(135deg,#F59E0B,#D97706)', title: 'Multilingual Support',  desc: 'Available in English, Spanish, French, Hindi and more.' },
    { icon: 'fa-users',          color: 'linear-gradient(135deg,#22C55E,#16A34A)', title: 'Family Live Tracking',  desc: 'Share a live tracking link so family can follow in real-time.' },
    { icon: 'fa-chart-line',     color: 'linear-gradient(135deg,#1D4ED8,#1E3A8A)', title: 'Admin Analytics',       desc: 'Comprehensive monitoring, reports, and department metrics.' },
  ];

  const steps = [
    { n: '1', icon: 'fa-hand-pointer',  title: 'Raise Alert',       desc: 'Tap the SOS button on your dashboard' },
    { n: '2', icon: 'fa-route',         title: 'Auto Route',        desc: 'System routes to nearest agency' },
    { n: '3', icon: 'fa-shield-alt',    title: 'Agency Responds',   desc: 'Responders accept and mobilize' },
    { n: '4', icon: 'fa-satellite-dish',title: 'Live Tracking',     desc: 'Track help arriving in real-time' },
  ];

  const agencies = [
    { icon: 'fa-shield-alt',      gradient: 'linear-gradient(135deg,#1D4ED8,#2563EB)', title: 'Police Department',  desc: 'Crime, theft, and security emergencies handled with rapid response.', hotline: '100', services: ['Crime Reporting','Theft Investigation','Security Patrol','Emergency Response'] },
    { icon: 'fa-ambulance',       gradient: 'linear-gradient(135deg,#DC2626,#EF4444)', title: 'Ambulance Services', desc: 'Medical emergencies and critical health situations attended immediately.', hotline: '102', services: ['Emergency Medical Care','Patient Transport','First Aid','Critical Care'] },
    { icon: 'fa-fire-extinguisher',gradient:'linear-gradient(135deg,#EA580C,#F97316)', title: 'Fire Department',    desc: 'Fire accidents, rescue operations and disaster response teams.', hotline: '101', services: ['Fire Fighting','Rescue Operations','Disaster Response','Safety Training'] },
  ];

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <div className="navbar-brand">
              <i className="fas fa-shield-alt"></i>
              <span>SafeGuard</span>
            </div>
            <div className="navbar-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#agencies">Agencies</a>
              <Link to="/login" className="btn btn-outline-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg-image">
          <div className="grid-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <i className="fas fa-circle"></i>
                Live Emergency Platform
              </div>
              <h1 className="hero-title">
                Tourist Emergency<br />
                <span className="text-gradient">Assistance in Real Time</span>
              </h1>
              <p className="hero-subtitle">
                Integrated Multi-Agency Coordination Platform — connecting tourists with Police, Ambulance, and Fire services instantly with live GPS tracking and AI-powered routing.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  <i className="fas fa-rocket"></i> Get Started Free
                </Link>
                <a href="#how-it-works" className="btn btn-outline-secondary btn-lg">
                  <i className="fas fa-play-circle"></i> See How It Works
                </a>
              </div>
              <div className="hero-stats">
                {[['24/7','Available'],['<2min','Response'],['3+','Agencies'],['100%','Free']].map(([v,l],i) => (
                  <div className="stat-item" key={i}>
                    <span className="stat-value">{v}</span>
                    <span className="stat-label">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-image">
              <div className="hero-phone-card">
                <div className="phone-header">
                  <span className="phone-title">🛡️ SafeGuard</span>
                  <span className="phone-status">Live</span>
                </div>
                <div className="sos-demo">
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button className="btn-sos">SOS</button>
                    <div className="sos-pulse"></div>
                  </div>
                  <div className="phone-features">
                    {[['fa-map-marker-alt','GPS Location Shared'],['fa-shield-alt','Police Notified'],['fa-user-friends','Family Alerted']].map(([ic,txt],i) => (
                      <div className="phone-feature" key={i}>
                        <i className={`fas ${ic}`}></i>
                        <span>{txt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-row">
            {[['10,000+','Tourists Protected'],['3','Emergency Agencies'],['< 2 min','Avg Response Time'],['99.9%','Platform Uptime']].map(([v,l],i) => (
              <div className="stats-row-item" key={i}>
                <span className="stats-row-value">{v}</span>
                <span className="stats-row-label">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag"><i className="fas fa-star"></i> Features</div>
            <h2>Everything You Need to Stay Safe</h2>
            <p>A complete emergency response system built for tourists and travelers worldwide</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon" style={{ background: f.color }}>
                  <i className={`fas ${f.icon}`}></i>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Process</div>
            <h2>How It Works</h2>
            <p>Get emergency help in 4 simple steps — no app download required</p>
          </div>
          <div className="steps-container">
            {steps.map((s, i, arr) => (
              <React.Fragment key={i}>
                <div className="step-item">
                  <div className="step-number">{s.n}</div>
                  <div className="step-icon"><i className={`fas ${s.icon}`}></i></div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
                {i < arr.length - 1 && <div className="step-connector"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Agencies */}
      <section id="agencies" className="agencies-section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Partners</div>
            <h2>Connected Emergency Agencies</h2>
            <p>All three major emergency services coordinated in one unified platform</p>
          </div>
          <div className="agencies-grid">
            {agencies.map((a, i) => (
              <div className="agency-card" key={i}>
                <div className="agency-card-left" style={{ background: a.gradient }}>
                  <div className="agency-card-icon"><i className={`fas ${a.icon}`}></i></div>
                  <div className="agency-hotline">
                    <span className="hotline-label">Hotline</span>
                    <span className="hotline-number">{a.hotline}</span>
                  </div>
                </div>
                <div className="agency-card-right">
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                  <div className="agency-services-row">
                    {a.services.map((s, j) => (
                      <span className="agency-service-tag" key={j}>
                        <i className="fas fa-check"></i>{s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Stay Safe?</h2>
            <p>Join thousands of tourists who trust SafeGuard for emergency assistance</p>
            <Link to="/register" className="btn btn-xl">
              <i className="fas fa-rocket"></i> Get Started — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4><i className="fas fa-shield-alt"></i> SafeGuard Platform</h4>
              <p>Your safety is our mission. Available 24/7 for all emergencies. Built for tourists, powered by real-time technology.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#agencies">Agencies</a>
              <Link to="/register">Register</Link>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <a href="#help">Help Center</a>
              <a href="#contact">Contact Us</a>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
            <div className="footer-section">
              <h4>Emergency Numbers</h4>
              <p><i className="fas fa-phone"></i> Police: 100</p>
              <p><i className="fas fa-phone"></i> Ambulance: 102</p>
              <p><i className="fas fa-phone"></i> Fire: 101</p>
              <p><i className="fas fa-phone"></i> Women: 1091</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 SafeGuard Emergency Platform. All rights reserved. Built with ❤️ for tourist safety.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
