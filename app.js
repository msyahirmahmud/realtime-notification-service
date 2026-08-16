/**
 * Real-Time Notification & Room Event Hub Engine
 */

const EventEmitter = require('events');

class NotificationHub extends EventEmitter {
  constructor() {
    super();
    this.rooms = {}; // roomName -> Set of userIds
    this.history = [];
    this.typing = {}; // roomName -> Set of typing userIds
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

  emitTypingStatus(userId, roomName, isTyping = true) {
    if (!this.typing[roomName]) this.typing[roomName] = new Set();
    if (isTyping) {
      this.typing[roomName].add(userId);
    } else {
      this.typing[roomName].delete(userId);
    }
    const payload = { userId, roomName, isTyping, timestamp: new Date().toISOString() };
    this.emit('typing_status', payload);
    return payload;
  }

  getTypingUsers(roomName) {
    return Array.from(this.typing[roomName] || []);
  }

  broadcast(roomName, message, senderId = 'system') {
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
