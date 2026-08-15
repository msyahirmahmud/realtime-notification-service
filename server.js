const http = require('http');
const NotificationHub = require('./app');

const hub = new NotificationHub();
const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'healthy', activeRooms: Object.keys(hub.rooms).length }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`Notification Hub running on port ${PORT}`));
}

module.exports = { server, hub };
