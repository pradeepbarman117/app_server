// const { Server } = require('socket.io');
// let io;

// const initSocket = (server) => {
//   try {
//     io = new Server(server, { 
//       cors: { 
//         origin: '*',
//         methods: ["GET", "POST"]
//       } 
//     });
//     console.log('WebSocket initialized successfully');
//     return io;
//   } catch (error) {
//     console.error('Socket initialization failed:', error);
//     throw error;
//   }
// };

// const getSocketInstance = () => {
//   if (!io) throw new Error('Socket.IO not initialized');
//   return io;
// };

// module.exports = { initSocket, getSocketInstance };




// const { Server } = require('socket.io');
// const { getRedisClient } = require('./config/redis');

// let io;

// const initSocket = (server) => {
//   try {
//     io = new Server(server, { 
//       cors: { 
//         origin: '*',
//         methods: ["GET", "POST"]
//       } 
//     });
//     console.log('WebSocket initialized successfully');

//     const redisClient = getRedisClient();

//     // Subscribe to Redis channels
//     redisClient.on('message', (channel, message) => {
//       console.log(`Message from Redis channel ${channel}: ${message}`);
//       io.emit(channel, JSON.parse(message)); // Broadcast message to all connected clients
//     });

//     io.on('connection', (socket) => {
//       console.log(`Client connected: ${socket.id}`);
//       socket.on('subscribeToChannel', (channel) => {
//         console.log(`Subscribing to channel: ${channel}`);
//         redisClient.subscribe(channel); // Subscribe to the Redis channel
//       });

//       socket.on('disconnect', () => {
//         console.log(`Client disconnected: ${socket.id}`);
//       });
//     });

//     return io;
//   } catch (error) {
//     console.error('Socket initialization failed:', error);
//     throw error;
//   }
// };

// const getSocketInstance = () => {
//   if (!io) throw new Error('Socket.IO not initialized');
//   return io;
// };

// module.exports = { initSocket, getSocketInstance };





// const { Server } = require('socket.io');
// const redis = require('redis');
// const { createAdapter } = require('@socket.io/redis-adapter');

// let io;

// const initSocket = async (server) => {
//   // Redis clients
//   const pubClient = redis.createClient({
//     url: process.env.REDIS_URL || 'redis://localhost:6379'
//   });
//   const subClient = pubClient.duplicate();

//   try {
//     await Promise.all([
//       pubClient.connect(),
//       subClient.connect()
//     ]);

//     io = new Server(server, { 
//       cors: { 
//         origin: '*',
//         methods: ["GET", "POST"]
//       }
//     });

//     // Setup Redis adapter
//     io.adapter(createAdapter(pubClient, subClient));

//     console.log('WebSocket initialized with Redis adapter');
//     return io;
//   } catch (error) {
//     console.error('Socket initialization failed:', error);
//     throw error;
//   }
// };

// const getSocketInstance = () => {
//   if (!io) throw new Error('Socket.IO not initialized');
//   return io;
// };

// module.exports = { initSocket, getSocketInstance };



const { Server } = require('socket.io');
const redis = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

let io;

const initSocket = async (server) => {
  const pubClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      connectTimeout: 5000, // 5 second connection timeout
      reconnectStrategy: (retries) => {
        if (retries > 5) return false;
        return Math.min(retries * 50, 2000);
      }
    }
  });
  
  const subClient = pubClient.duplicate();

  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);

    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ["GET", "POST"]
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8 // 100 MB
    });

    io.adapter(createAdapter(pubClient, subClient));

    // Error handling
    pubClient.on('error', (err) => {
      console.error('Redis Pub Client Error:', err);
    });

    subClient.on('error', (err) => {
      console.error('Redis Sub Client Error:', err);
    });

    console.log('WebSocket initialized with Redis adapter');
    return io;
  } catch (error) {
    console.error('Socket initialization failed:', error);
    throw error;
  }
};

const getSocketInstance = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { initSocket, getSocketInstance };