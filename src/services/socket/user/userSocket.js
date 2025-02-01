
const { getSocketInstance } = require("../../../socket");
const redis = require('redis');


const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});


redisClient.connect().catch(console.error);

const setupUserSocket = () => {
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


const emitUserAdded = async (master) => {
  const io = getSocketInstance();
  
  // Broadcast to all clients
  io.emit("userAdded", master);
  
  // Store in Redis for persistence
  await redisClient.hSet('users', master.id.toString(), JSON.stringify(master));
};


const emitUserUpdated = async (master) => {
  const io = getSocketInstance();
  
  // Broadcast to all clients
  io.emit("userUpdated", master);
  
  // Update in Redis
  await redisClient.hSet('users', master.id.toString(), JSON.stringify(master));
};

const getUserFromRedis = async (userId) => {
  return JSON.parse(await redisClient.hGet('users', userId.toString()));
};

module.exports = {
    setupUserSocket,
    emitUserAdded,
    emitUserUpdated,
    getUserFromRedis
  };