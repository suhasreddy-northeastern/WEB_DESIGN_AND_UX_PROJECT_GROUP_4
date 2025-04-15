const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo'); 
const userRoutes = require('./src/routes/userRoutes');
const apartmentRoutes = require('./src/routes/apartmentRoutes'); 
const brokerRoutes = require('./src/routes/brokerRoutes'); 
const adminRoutes = require('./src/routes/adminRoutes');
const systemRoutes = require('./src/routes/systemRoutes');
const tourRoutes = require('./src/routes/tourRoutes'); 
const systemController = require('./src/controllers/systemController');
const SystemSettings = require('./src/models/SystemSettings');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require('cors');
require('dotenv').config();
require('./src/utils/redisClient');

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// ⚠️ ALLOW ALL ORIGINS: This is less secure but will fix your CORS issues
app.use((req, res, next) => {
  // Allow requests from any origin
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware using MongoDB with more permissive settings for cross-origin cookies
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_for_development',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    httpOnly: true,
    secure: true, // Keep true for security, but ensure your site is HTTPS
    sameSite: 'none', // Important for cross-origin requests
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// Connect to MongoDB
require('./src/config/db');

// Initialize system settings
(async () => {
  try {
    await systemController.initSystemSettings();
    console.log('System settings initialized successfully');
  } catch (err) {
    console.error('Failed to initialize system settings:', err);
  }
})();

// Add the system routes
app.use('/api/system', systemRoutes);
app.use('/api/admin', adminRoutes);

// Add maintenance mode middleware for non-admin routes
app.use(async (req, res, next) => {
  // ALWAYS allow these paths regardless of maintenance mode
  const allowedPaths = [
    '/api/user/login',
    '/api/user/logout',
    '/api/user/create',
    '/api/user/session',
    '/api/system/maintenance-status',
    '/api-docs'
  ];
  
  // If the path is in the allowed list, always proceed
  if (allowedPaths.includes(req.path) || req.path.startsWith('/api-docs')) {
    return next();
  }
  
  // Skip middleware for admin routes
  if (req.path.startsWith('/api/admin')) {
    return next();
  }
  
  try {
    // Get current maintenance status
    const settings = await SystemSettings.findOne({ key: 'maintenanceMode' });
    
    if (settings && settings.value.enabled) {
      // Check if user is an admin
      if (req.session.user && req.session.user.type === 'admin') {
        // Allow admin users to bypass maintenance mode
        return next();
      }
      
      // Block non-admin access during maintenance with JSON response
      return res.status(503).json({
        error: 'Service Unavailable',
        message: settings.value.message || 'Site is under maintenance',
        estimatedTime: settings.value.estimatedTime || null
      });
    }
    
    // Continue if not in maintenance mode
    next();
  } catch (err) {
    console.error('Error checking maintenance mode:', err);
    // Continue in case of errors with the settings check
    next();
  }
});

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'images')));

const uploadsDir = path.join(__dirname, 'src/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/broker', brokerRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/system', systemRoutes);

// For the /api/admin/set-maintenance-mode endpoint specifically
app.use('/api/admin', systemRoutes);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`CORS enabled for: ALL ORIGINS`);
});

module.exports = app;