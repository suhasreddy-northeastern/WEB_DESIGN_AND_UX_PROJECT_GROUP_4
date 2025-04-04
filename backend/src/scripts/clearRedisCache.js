// scripts/clearRedisCache.js
const { redisClient } = require('../utils/redisClient');

// Clear all Redis cache
const clearAllCache = async () => {
  try {
    // Make sure Redis is connected
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    
    // Use the FLUSHALL command
    await redisClient.flushAll();
    console.log('Successfully cleared all Redis cache');
    
    // Close connection when done
    await redisClient.quit();
    process.exit(0);
  } catch (error) {
    console.error('Error with Redis operation:', error);
    process.exit(1);
  }
};

// If this script is called directly
if (require.main === module) {
  clearAllCache();
}

module.exports = { clearAllCache };