const { getSocketInstance } = require('../../../../socket');
const redis = require('redis');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

const setupMasterRequestSocket = () => {
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

const emitMasterRequestAdded = async (request) => {
    const io = getSocketInstance();
    console.log(request,'request');
    // Broadcast to all clients
    io.emit("masterRequestAdded", request);

    // Store in Redis for persistence
    // await redisClient.hSet('masters:request', request.id.toString(), JSON.stringify(request));
};

const emitMasterRequestUpdated = async (request) => {
    const io = getSocketInstance();

    // Broadcast to all clients
    io.emit("masterRequestUpdated", request);

    // Update in Redis
    // await redisClient.hSet('masters:request', master.id.toString(), JSON.stringify(master));
};

const getMasterRequestFromRedis = async (masterId) => {
    return JSON.parse(await redisClient.hGet('masters:request', masterId.toString()));
};

module.exports = {
    setupMasterRequestSocket,
    emitMasterRequestAdded,
    emitMasterRequestUpdated,
    getMasterRequestFromRedis
};