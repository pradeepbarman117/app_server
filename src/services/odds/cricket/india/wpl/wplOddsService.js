const axios = require('axios');
const { getSocketInstance } = require("../../../../../socket");
const redis = require('redis');
const { theOddsApi } = require('../../../../../config/oddsAPI/oddsAPI');

// Redis setup for ODI Services
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch(console.error);


const fetchWplMatches = async ()=>{
    try{
        const response = await theOddsApi.get('/wpl/matches');
    }catch(err){
        console.error(err);
    }
}



// setup socket for ODI INT with real-time
const setupWplSocket = () => {
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

const emitWPLMatch = async (master) => {
  const io = getSocketInstance();
  
  // Broadcast to all clients
  io.emit("new-wpl-added", master);
  
  // Store in Redis for persistence
  await redisClient.hSet('intODI', master.id.toString(), JSON.stringify(master));
};

const emitWplUpdated = async (master) => {
  const io = getSocketInstance();
  
  // Broadcast to all clients
  io.emit("odiIntUpdated", master);
  
  // Update in Redis
  await redisClient.hSet('wpl', master.id.toString(), JSON.stringify(master));
};




module.exports = {
    setupWplSocket,
    emitWPLMatch,
    emitWplUpdated
}