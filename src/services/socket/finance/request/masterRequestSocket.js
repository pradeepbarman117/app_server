

const { getSocketInstance } = require('../../../../socket');

const setupMasterRequestSocket = () => {
    const io = getSocketInstance();

    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Clients register their userId (masterId or adminId) when connecting
        socket.on("register", (userId) => {
            if (!userId) return; // Guard against invalid userId
            socket.join(`masterReq:${userId}`); // Join a room like "user:123"
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

const emitMasterRequestAdded = async (request) => {
    const io = getSocketInstance();
    // Emit only to the requesting master and the admin
    const masterId = `masterReq:${request.dataValues.masterList.dataValues.userId}`;
    io.to(masterId).emit("masterRequestAdded", request);
    io.emit("adminMasterRequestAdded", request);
    io.emit("notify:admin:amount:changed",request);
};

const emitMasterRequestUpdated = async (master,request) => {
    const io = getSocketInstance();
    const masterId = `masterReq:${master}`;
    
    io.to(masterId).emit("masterRequestUpdated", request);
    io.emit("adminMasterRequestUpdated", request);
    io.emit("notify:admin:amount:updated",request);
};

module.exports = {
    setupMasterRequestSocket,
    emitMasterRequestAdded,
    emitMasterRequestUpdated,
};