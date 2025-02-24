const { getSocketInstance } = require("../../../socket");


const setupAdminSocket = () => {
  const io = getSocketInstance();

  io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Clients register their userId (masterId or adminId) when connecting
      socket.on("register", (adminId) => {
          if (!adminId) return; // Guard against invalid userId
          socket.join(`admin:${adminId}`); // Join a room like "user:123"
      });

      socket.on("hello", () => {
          socket.emit("message", "Hello from the server!");
      });

      socket.on("disconnect", () => {
          console.log(`Client disconnected: ${socket.id}`);
          // No explicit cleanup needed; Socket.IO handles leaving rooms
      });
  });
};


const emitAdminBalance = async (master) => {
  const io = getSocketInstance();
  
  // Broadcast to all clients
  io.emit("masterAdded", master);
  
  // Store in Redis for persistence
  await redisClient.hSet('masters', master.id.toString(), JSON.stringify(master));
};

const emitAdminBalanceUpdate = async (adminId,adminBalance) => {
  const io = getSocketInstance();
  // Broadcast to all clients
  io.to(`admin:${adminId}`).emit("adminBalanceUpdate", adminBalance);
  
};


module.exports = {
  emitAdminBalanceUpdate,
  setupAdminSocket
};