const { redisClient } = require("../../../config/redis");
const { getSocketInstance } = require("../../../socket");

const setupUserSocket = () => {
  const io = getSocketInstance();

  io.on("connection", (socket) => {

    socket.on("register", (userId) => {
      if (!userId) return; // Guard against invalid userId
      socket.join(`userCreated:${userId}`); // Join a room like "user:123"
      console.log(userId,'userId......')
    });

    socket.on("hello", () => {
      socket.emit("message", "Hello from the server!");
    });

    socket.on("disconnect", () => {

      // No explicit cleanup needed; Socket.IO handles leaving rooms
    });
  });
};

const emitUserAdded = async (master_Id,master) => {
  const io = getSocketInstance();
  const masterId = `userCreated:${master_Id}`;

  // Broadcast to requested clients
  io.to(masterId).emit("userAdded", master);
  io.emit('notify:admin:user:added',master);

  // Store in Redis for persistence
  await redisClient.hSet("users", master.id.toString(), JSON.stringify(master));
};

const emitUserUpdated = async (master) => {
  const io = getSocketInstance();

  // Broadcast to all clients
  io.emit("userUpdated", master);
  io.emit('notify:admin:user:updated');

  // Update in Redis
  await redisClient.hSet("users", master.id.toString(), JSON.stringify(master));
};

const getUserFromRedis = async (userId) => {
  return JSON.parse(await redisClient.hGet("users", userId.toString()));
};

module.exports = {
  setupUserSocket,
  emitUserAdded,
  emitUserUpdated,
  getUserFromRedis,
};
