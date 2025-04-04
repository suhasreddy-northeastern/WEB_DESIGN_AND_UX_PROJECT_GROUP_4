// utils/redisClient.js
const redis = require('redis');

// Create Redis client with the newer API (Redis v4+)
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
});

// Handle events
redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

module.exports = {
  // Helper methods that match our original API
  getAsync: async (key) => await redisClient.get(key),
  setexAsync: async (key, seconds, value) => await redisClient.setEx(key, seconds, value),
  delAsync: async (key) => await redisClient.del(key),
  redisClient,
};