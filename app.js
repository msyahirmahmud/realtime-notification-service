/**
 * Real-Time Notification & Room Event Hub Engine
 */

const EventEmitter = require('events');

class NotificationHub extends EventEmitter {
  constructor() {
    super();
    this.rooms = {}; // roomName -> Set of userIds
    this.history = [];
    this.userLogs = {}; // senderId -> array of timestamps
  }

  joinRoom(userId, roomName) {
    if (!this.rooms[roomName]) this.rooms[roomName] = new Set();
    this.rooms[roomName].add(userId);
    this.emit('user_joined', { userId, roomName, timestamp: new Date().toISOString() });
    return true;
  }

  leaveRoom(userId, roomName) {
    if (this.rooms[roomName]) {
      this.rooms[roomName].delete(userId);
      this.emit('user_left', { userId, roomName, timestamp: new Date().toISOString() });
      return true;
    }
    return false;
  }

  checkRateLimit(senderId, limit = 5) {
    const now = Date.now();
    if (!this.userLogs[senderId]) this.userLogs[senderId] = [];
    // Filter timestamps within last 1 second window
    this.userLogs[senderId] = this.userLogs[senderId].filter(t => now - t < 1000);

    if (this.userLogs[senderId].length >= limit) {
      return false; // Rate limit exceeded
    }

    this.userLogs[senderId].push(now);
    return true;
  }

  broadcast(roomName, message, senderId = 'system') {
    if (!this.checkRateLimit(senderId)) {
      throw new Error(`Rate limit exceeded for user: ${senderId}`);
    }

    const payload = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      roomName,
      senderId,
      message,
      timestamp: new Date().toISOString()
    };
    this.history.push(payload);
    this.emit('message', payload);
    return payload;
  }

  getRoomMembers(roomName) {
    return Array.from(this.rooms[roomName] || []);
  }

  getHistory(roomName) {
    return this.history.filter(h => h.roomName === roomName);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationHub;
}
