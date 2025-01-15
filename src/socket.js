const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, { cors: { origin: '*' } });
  console.log('WebSocket initialized');
  return io;
};

const getSocketInstance = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { initSocket, getSocketInstance };
