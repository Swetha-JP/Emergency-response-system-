const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const emergencyRoutes  = require('./routes/emergencyRoutes');
const authRoutes       = require('./routes/authRoutes');
const agencyRoutes     = require('./routes/agencyRoutes');
const uploadRoutes     = require('./routes/uploadRoutes');
const contactsRoutes   = require('./routes/contactsRoutes');
const analyticsRoutes  = require('./routes/analyticsRoutes');
const wildlifeRoutes   = require('./routes/wildlifeRoutes');

const app    = express();
const server = http.createServer(app);

// ── Allowed origins list ─────────────────────────────────────
const getAllowedOrigins = () => {
  const origins = new Set(['http://localhost:3000', 'http://localhost:5000']);
  const env = process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || '';
  env.split(',').map(o => o.trim()).filter(Boolean).forEach(o => origins.add(o));
  // Always allow the service's own URL
  if (process.env.RENDER_EXTERNAL_URL) origins.add(process.env.RENDER_EXTERNAL_URL);
  return [...origins];
};

const corsOptions = {
  origin: function (origin, callback) {
    // Allow same-origin requests (no origin header) and OPTIONS preflight
    if (!origin) return callback(null, true);
    const allowed = getAllowedOrigins();
    if (allowed.some(o => origin === o || origin.startsWith(o))) {
      return callback(null, true);
    }
    console.warn('CORS blocked:', origin, '| Allowed:', allowed);
    callback(null, true); // In production, allow all to avoid blocking — tighten later
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// ── Socket.IO ────────────────────────────────────────────────
const io = socketIo(server, {
  cors: corsOptions,
  // Allow both polling and websocket — polling first for Render compatibility
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// ── Uploads directory ────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Middleware ───────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// ── Request logger (production debug) ───────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`${req.method} ${req.path} | origin: ${req.headers.origin || 'same-origin'}`);
    }
    next();
  });
}

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/agency',    agencyRoutes);
app.use('/api/upload',    uploadRoutes);
app.use('/api/contacts',  contactsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wildlife',  wildlifeRoutes);

// Make io accessible in controllers
app.set('io', io);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Emergency Platform API is running',
    env: process.env.NODE_ENV,
    db: !!process.env.DATABASE_URL ? 'neon' : 'local',
    time: new Date().toISOString()
  });
});

// ── Serve React frontend in production ───────────────────────
// Path: server/src/server.js → ../../client/build = client/build from repo root
const clientBuild = path.join(__dirname, '../../client/build');
console.log('Looking for React build at:', clientBuild);
console.log('Build exists:', fs.existsSync(clientBuild));

if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild, {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
  }));

  // SPA fallback — all non-API routes serve index.html
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(clientBuild, 'index.html'));
  });

  console.log('✅ Serving React frontend from:', clientBuild);
} else {
  console.warn('⚠️  React build not found at:', clientBuild);
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.status(200).send(`
        <html><body>
          <h2>SafeGuard API is running</h2>
          <p>Frontend build not found. Check build process.</p>
          <p>Expected path: ${clientBuild}</p>
          <a href="/api/health">API Health Check</a>
        </body></html>
      `);
    }
  });
}

// ── Socket.IO Events ─────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id, '| transport:', socket.conn.transport.name);

  socket.on('emergency:sos', (data) => {
    console.log('SOS received:', data?.emergencyType);
    io.emit('emergency:new', data);
  });

  socket.on('location:update', async (data) => {
    const { emergencyId, latitude, longitude } = data;
    io.emit('location:updated', data);
    io.to(`track_${emergencyId}`).emit('location:updated', data);

    if (emergencyId && latitude && longitude) {
      try {
        const pool = require('./config/database');
        await pool.query(
          'UPDATE emergency_requests SET latitude=$1, longitude=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3',
          [latitude, longitude, emergencyId]
        );
      } catch (err) {
        console.warn('Location DB update failed:', err.message);
      }
    }
  });

  socket.on('agency:response', (data) => {
    io.to(String(data.userId)).emit('agency:accepted', data);
  });

  socket.on('track:join', ({ emergencyId }) => {
    socket.join(`track_${emergencyId}`);
  });

  socket.on('chat:join', ({ emergencyId, userId }) => {
    socket.join(`emergency_${emergencyId}`);
  });

  socket.on('chat:send', (message) => {
    io.to(`emergency_${message.emergencyId}`).emit('chat:message', message);
  });

  socket.on('path:update', (data) => {
    io.to(`emergency_${data.emergencyId}`).emit('path:updated', data);
  });

  socket.on('battery:low', (data) => {
    io.to(`emergency_${data.emergencyId}`).emit('battery:alert', data);
  });

  socket.on('riskzone:entered', (data) => {
    io.emit('riskzone:alert', data);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', socket.id, reason);
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err.message);
  });
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Neon PostgreSQL' : 'Local PostgreSQL'}`);
  console.log(`🌐 Allowed origins: ${getAllowedOrigins().join(', ')}\n`);
});

module.exports = { app, io };
