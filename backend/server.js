const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo'); 
const userRoutes = require('./src/routes/userRoutes');
const apartmentRoutes = require('./src/routes/apartmentRoutes'); 
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require('cors');
require('dotenv').config();
require('./src/utils/redisClient');

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Enable CORS with credentials
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// ✅ Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session middleware using MongoDB
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// ✅ Connect to MongoDB
require('./src/config/db');


// Serve static images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/apartments', apartmentRoutes);


// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
