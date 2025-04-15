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

// Updated allowedOrigins list - ensure all your frontend URLs are here
const allowedOrigins = [
  'http://localhost:3000',
  'https://web-design-and-ux-project-group-4-xqoa.vercel.app',
  'https://homefit-group4.vercel.app',
  'https://web-design-and-ux-project-group-4.onrender.com',
  // Add your actual deployed frontend URL if different from above
];

// Improved CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS middleware before route handlers
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ✅ Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session middleware using MongoDB
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
    // Set secure to false in development, true in production
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// ✅ Connect to MongoDB
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
    '/api/user/create',  // Added signup/create endpoint to allowed paths
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
  console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
});

module.exports = app;