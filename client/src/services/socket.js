import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Emit emergency SOS
  emitSOS(data) {
    if (this.socket) {
      this.socket.emit('emergency:sos', data);
    }
  }

  // Listen for new emergencies (for agencies)
  onNewEmergency(callback) {
    if (this.socket) {
      this.socket.on('emergency:new', callback);
    }
  }

  // Emit location update
  emitLocationUpdate(data) {
    if (this.socket) {
      this.socket.emit('location:update', data);
    }
  }

  // Listen for location updates
  onLocationUpdate(callback) {
    if (this.socket) {
      this.socket.off('location:updated'); // prevent duplicate listeners
      this.socket.on('location:updated', callback);
    }
  }

  // Join a tracking room for a specific emergency (used by family tracking page)
  joinTrackingRoom(emergencyId) {
    if (this.socket) {
      this.socket.emit('track:join', { emergencyId });
    }
  }

  // Emit agency response
  emitAgencyResponse(data) {
    if (this.socket) {
      this.socket.emit('agency:response', data);
    }
  }

  // Listen for agency acceptance
  onAgencyAccepted(callback) {
    if (this.socket) {
      this.socket.on('agency:accepted', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

const socketService = new SocketService();
export default socketService;
