

const { getSocketInstance } = require('../../../../socket');

const setupUserRequestSocket = () => {
    const io = getSocketInstance();

    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Clients register their userId (masterId or adminId) when connecting
        socket.on("register", (userId) => {
            if (!userId) return; // Guard against invalid userId
            socket.join(`userReq:${userId}`); // Join a room like "user:123"
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

const emitUserRequestAdded = async (request) => {
    const io = getSocketInstance();
    // Emit only to the requesting master and the admin
    const masterId = `userReq:${request.dataValues.masterList.dataValues.userId}`;
    const userId = `userReq:${request.dataValues.userList.dataValues.userId}`;
    
    io.to(masterId).emit("notify:master:user:request:added", request);
    
    io.to(masterId).emit("notify:master:user:amount:changed",request);

    io.to(userId).emit("notify:user:balance:changed",request);

    // io.emit("adminMasterRequestAdded", request);
    // io.emit("notify:admin:amount:changed",request);
};

const emitUserRequestUpdated = async (master,request) => {
    const io = getSocketInstance();
    // const userId = `userReq:${user}`;
    const masterId = `userReq:${master}`;
    
    io.to(masterId).emit("notify:master:user:request:updated", request);

    io.to(masterId).emit("notify:master:user:amount:updated",request);
    // io.emit("adminMasterRequestUpdated", request);
    // io.emit("notify:admin:amount:updated",request);
};


const emitUserBalance = async (id,updatedBalance) => {
    const io = getSocketInstance();
    const userId = `userReq:${id}`;
    
    io.to(userId).emit("notify:user:balance:updated", updatedBalance);
};


module.exports = {
    setupUserRequestSocket,
    emitUserRequestAdded,
    emitUserRequestUpdated,
    emitUserBalance
};