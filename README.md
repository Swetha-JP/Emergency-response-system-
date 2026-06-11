# 🚨 Integrated Tourist Emergency Assistance & Multi-Agency Coordination Platform

## 📋 Overview

A centralized digital emergency response platform connecting tourists with multiple emergency agencies (Police, Ambulance, Fire) in real-time, featuring live GPS tracking, AI-based incident classification, and unified coordination dashboard.

## 🎯 Problem Statement

Tourists face emergencies (medical, theft, fire, disasters) with:
- Separate emergency numbers for each agency
- No centralized coordination
- No real-time victim tracking
- Communication delays between agencies
- Unfamiliarity with local emergency systems

## ✨ Key Features

### 👤 User Features
- One-tap SOS button
- Automatic GPS location capture
- Incident category selection
- Real-time status tracking
- Multilingual interface
- Emergency contact sharing
- Web + Mobile access

### 🚓 Agency Dashboard (Police/Ambulance/Fire)
- Real-time emergency feed
- Map-based live tracking
- Accept/Reject assignment
- Status update controls
- Case history

### 🧑‍💼 Admin Features
- Monitor all incidents
- Analytics & reports
- Agency performance tracking
- System management

## 🛠️ Technology Stack

### Frontend
- **Web**: React.js
- **Mobile**: React Native
- **Styling**: CSS3, Custom Design System
- **Icons**: React Icons / Font Awesome

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.io

### Database
- **Primary**: PostgreSQL (ACID compliance, relational integrity)

### Maps & Location
- **Service**: OpenStreetMap (Free)
- **Library**: Leaflet.js

### Hosting (Free Tier)
- **Backend**: Render / Railway
- **Frontend**: Vercel / Netlify

## 📁 Project Structure

```
FSD/
├── client/                 # Frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   ├── assets/        # Images, icons
│   │   ├── services/      # API services
│   │   └── utils/         # Helper functions
│   └── package.json
│
├── server/                # Backend application
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Helper functions
│   └── package.json
│
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v13+)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd FSD
```

2. **Setup Backend**
```bash
cd server
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

3. **Setup Frontend**
```bash
cd client
npm install
npm start
```

4. **Database Setup**
```bash
# Create PostgreSQL database
createdb emergency_platform

# Run migrations
cd server
npm run migrate
```

## 🎨 Design System

### Color Palette
- **Primary**: #E63946 (Emergency Red)
- **Secondary**: #457B9D (Trust Blue)
- **Success**: #06D6A0 (Active Green)
- **Warning**: #FFB703 (Alert Yellow)
- **Dark**: #1D3557 (Navy)
- **Light**: #F1FAEE (Off-white)

### Typography
- **Headings**: Poppins
- **Body**: Inter

## 📊 System Workflow

1. Tourist presses SOS button
2. Location captured automatically
3. Incident type selected/auto-classified
4. Alert sent to central server
5. System routes to appropriate agency
6. Agencies see request in dashboard
7. Live tracking begins
8. Status updates shown to user

## ✅ Advantages Over Existing Systems

- ✅ Centralized multi-agency coordination
- ✅ Faster response time
- ✅ Real-time GPS tracking
- ✅ AI-based incident routing
- ✅ Tourist-friendly interface
- ✅ Comprehensive monitoring
- ✅ Scalable architecture

## 📈 Future Enhancements

- AI-powered incident prediction
- Voice-based SOS activation
- Offline emergency mode
- Integration with smart wearables
- Multi-language voice support
- Blockchain-based incident logging

