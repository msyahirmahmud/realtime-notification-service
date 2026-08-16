const assert = require('assert');
const { test, describe } = require('node:test');
const NotificationHub = require('../app.js');

describe('Real-Time Notification Service Unit Tests', () => {
  test('joinRoom adds user to specified room', () => {
    const hub = new NotificationHub();
    hub.joinRoom('user-1', 'general');
    const members = hub.getRoomMembers('general');
    assert.strictEqual(members.length, 1);
    assert.strictEqual(members[0], 'user-1');
  });

  test('checkRateLimit blocks excessive event flooding', () => {
    const hub = new NotificationHub();
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(hub.checkRateLimit('spammer', 5), true);
    }
    assert.strictEqual(hub.checkRateLimit('spammer', 5), false);
  });

  test('broadcast emits message event and records history', () => {
    const hub = new NotificationHub();
    let emitted = null;
    hub.on('message', msg => { emitted = msg; });

    hub.joinRoom('user-1', 'general');
    const msg = hub.broadcast('general', 'Hello world!', 'user-1');

    assert.notStrictEqual(emitted, null);
    assert.strictEqual(emitted.message, 'Hello world!');
    assert.strictEqual(hub.getHistory('general').length, 1);
  });

  test('leaveRoom removes user from room', () => {
    const hub = new NotificationHub();
    hub.joinRoom('user-1', 'general');
    hub.leaveRoom('user-1', 'general');
    assert.strictEqual(hub.getRoomMembers('general').length, 0);
  });
});
