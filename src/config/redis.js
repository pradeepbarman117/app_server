// const redis = require('redis');

// let redisClient;

// const initializeRedis = () => {
//   redisClient = redis.createClient({
//     url: 'redis://localhost:6379', // Update this URL if needed
//   });

//   redisClient.on('error', (err) => {
//     console.error('Redis error:', err);
//   });

//   redisClient.connect().then(() => {
//     console.log('Connected to Redis');
//   });

//   return redisClient;
// };

// const getRedisClient = () => {
//   if (!redisClient) {
//     throw new Error('Redis client not initialized');
//   }
//   return redisClient;
// };

// module.exports = { initializeRedis, getRedisClient };



const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection error', error);
  }
};

module.exports = { 
  redisClient, 
  connectRedis 
};