// const { getSocketInstance } = require("../../../socket");

// const setupMasterSocket = () => {
//   const io = getSocketInstance();

//   io.on("connection", (socket) => {
//     console.log(`Client connected: ${socket.id}`);

//     // Example event to acknowledge the connection
//     socket.on("hello", () => {
//       socket.emit("message", "Hello from the server!");
//     });

//     socket.on("disconnect", () => {
//       console.log(`Client disconnected: ${socket.id}`);
//     });
//   });
// };

// // Emit real-time events for masters
// const emitMasterAdded = (master) => {
//   const io = getSocketInstance();
//   io.emit("masterAdded", master); // Notify all connected clients
// };

// const emitMasterUpdated = (master) => {
//   const io = getSocketInstance();
//   io.emit("masterUpdated", master); // Notify all connected clients
// };

// module.exports = {
//   setupMasterSocket,
//   emitMasterAdded,
//   emitMasterUpdated,
// };



const { getSocketInstance } = require("../../../socket");
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

const setupMasterSocket = () => {
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

const emitMasterAdded = async (master) => {
  const io = getSocketInstance();
  
  // Broadcast to all clients
  io.emit("masterAdded", master);
  
  // Store in Redis for persistence
  await redisClient.hSet('masters', master.id.toString(), JSON.stringify(master));
};

const emitMasterUpdated = async (master) => {
  const io = getSocketInstance();
  
  // Broadcast to all clients
  io.emit("masterUpdated", master);
  
  // Update in Redis
  await redisClient.hSet('masters', master.id.toString(), JSON.stringify(master));
};

const getMasterFromRedis = async (masterId) => {
  return JSON.parse(await redisClient.hGet('masters', masterId.toString()));
};

module.exports = {
  setupMasterSocket,
  emitMasterAdded,
  emitMasterUpdated,
  getMasterFromRedis
};