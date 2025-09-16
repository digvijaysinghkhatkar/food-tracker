import { io } from 'socket.io-client';
import { Platform } from 'react-native';

class SocketService {
  socket = null;
  
  connect() {
    // Use localhost for development, adjust for production
    const serverURL = Platform.OS === 'web' 
      ? 'http://localhost:5000' 
      : 'http://localhost:5000';
    
    this.socket = io(serverURL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔗 Connected to server:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚫 Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();