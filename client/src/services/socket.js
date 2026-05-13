import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      // Start with polling, upgrade to websocket — more reliable on Render free tier
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id, '| transport:', this.socket.io.engine.transport.name);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emitSOS(data) {
    if (this.socket?.connected) this.socket.emit('emergency:sos', data);
  }

  onNewEmergency(callback) {
    if (this.socket) {
      this.socket.off('emergency:new');
      this.socket.on('emergency:new', callback);
    }
  }

  emitLocationUpdate(data) {
    if (this.socket?.connected) this.socket.emit('location:update', data);
  }

  onLocationUpdate(callback) {
    if (this.socket) {
      this.socket.off('location:updated');
      this.socket.on('location:updated', callback);
    }
  }

  joinTrackingRoom(emergencyId) {
    if (this.socket?.connected) {
      this.socket.emit('track:join', { emergencyId });
    }
  }

  emitAgencyResponse(data) {
    if (this.socket?.connected) this.socket.emit('agency:response', data);
  }

  onAgencyAccepted(callback) {
    if (this.socket) {
      this.socket.off('agency:accepted');
      this.socket.on('agency:accepted', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) this.socket.removeAllListeners();
  }
}

const socketService = new SocketService();
export default socketService;
