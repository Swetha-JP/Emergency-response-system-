const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const emergencyRoutes = require('./routes/emergencyRoutes');
const authRoutes = require('./routes/authRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contactsRoutes = require('./routes/contactsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const wildlifeRoutes = require('./routes/wildlifeRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      const allowed = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
        .split(',').map(o => o.trim());
      if (allowed.some(o => origin.startsWith(o))) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
      .split(',').map(o => o.trim());
    if (allowed.some(o => origin.startsWith(o))) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wildlife', wildlifeRoutes);

// Make io accessible in controllers
app.set('io', io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Emergency Platform API is running' });
});

// Socket.IO for real-time communication
const chatRooms = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Emergency SOS event
  socket.on('emergency:sos', (data) => {
    console.log('Emergency SOS received:', data);
    io.emit('emergency:new', data);
  });

  // Location update — broadcast to tracking page AND update DB
  socket.on('location:update', async (data) => {
    const { emergencyId, latitude, longitude } = data;

    // Broadcast to all clients watching this emergency
    io.emit('location:updated', data);
    io.to(`track_${emergencyId}`).emit('location:updated', data);

    // Persist latest location back to emergency_requests so REST polling also gets it
    if (emergencyId && latitude && longitude) {
      try {
        const pool = require('./config/database');
        await pool.query(
          'UPDATE emergency_requests SET latitude = $1, longitude = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
          [latitude, longitude, emergencyId]
        );
      } catch (err) {
        console.warn('Live location DB update failed:', err.message);
      }
    }
  });

  // Agency response
  socket.on('agency:response', (data) => {
    io.to(data.userId).emit('agency:accepted', data);
  });

  // Family tracking page joins a room for a specific emergency
  socket.on('track:join', ({ emergencyId }) => {
    socket.join(`track_${emergencyId}`);
    console.log(`Tracking client joined room: track_${emergencyId}`);
  });

  // Chat events
  socket.on('chat:join', ({ emergencyId, userId }) => {
    socket.join(`emergency_${emergencyId}`);
    console.log(`User ${userId} joined chat for emergency ${emergencyId}`);
  });

  socket.on('chat:send', (message) => {
    io.to(`emergency_${message.emergencyId}`).emit('chat:message', message);
  });

  // Path tracking
  socket.on('path:update', (data) => {
    io.to(`emergency_${data.emergencyId}`).emit('path:updated', data);
  });

  // Battery alert
  socket.on('battery:low', (data) => {
    io.to(`emergency_${data.emergencyId}`).emit('battery:alert', data);
  });

  // Risk zone alert
  socket.on('riskzone:entered', (data) => {
    io.emit('riskzone:alert', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };
