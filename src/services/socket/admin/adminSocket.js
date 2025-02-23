const { getSocketInstance } = require("../../../socket");

const emitAdminBalance = async (master) => {
  const io = getSocketInstance();
  
  // Broadcast to all clients
  io.emit("masterAdded", master);
  
  // Store in Redis for persistence
  await redisClient.hSet('masters', master.id.toString(), JSON.stringify(master));
};

const emitAdminBalanceUpdate = async (master) => {
  const io = getSocketInstance();
  
  // Broadcast to all clients
  io.emit("adminBalanceUpdate", master);
  
};


module.exports = {
  emitAdminBalanceUpdate,
};