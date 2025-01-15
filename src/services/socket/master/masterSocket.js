const { getSocketInstance } = require("../../../socket");

const setupMasterSocket = () => {
  const io = getSocketInstance();

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Example event to acknowledge the connection
    socket.on("hello", () => {
      socket.emit("message", "Hello from the server!");
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

// Emit real-time events for masters
const emitMasterAdded = (master) => {
  const io = getSocketInstance();
  io.emit("masterAdded", master); // Notify all connected clients
};

const emitMasterUpdated = (master) => {
  const io = getSocketInstance();
  io.emit("masterUpdated", master); // Notify all connected clients
};

module.exports = {
  setupMasterSocket,
  emitMasterAdded,
  emitMasterUpdated,
};
