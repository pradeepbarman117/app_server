const axios = require('axios');
const { getSocketInstance } = require("../../../../../socket");
const redis = require('redis');

// Redis setup for ODI Services
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch(console.error);

// setup socket for ODI INT with real-time
const setupODISocket = () => {
    const io = getSocketInstance();
    
    io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);
  
      socket.on("hello", () => {
        socket.emit("message", "Hello from the server!");
      });
  
      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
};


const emitODI = async (master) => {
  const io = getSocketInstance();
  
  // Broadcast to all clients
  io.emit("newOdiAdded", master);
  
  // Store in Redis for persistence
  await redisClient.hSet('intODI', master.id.toString(), JSON.stringify(master));
};


const emitODIUpdated = async (master) => {
  const io = getSocketInstance();
  
  // Broadcast to all clients
  io.emit("odiIntUpdated", master);
  
  // Update in Redis
  await redisClient.hSet('masters', master.id.toString(), JSON.stringify(master));
};


module.exports = {
    setupODISocket,
    emitODI,
    emitODIUpdated
}