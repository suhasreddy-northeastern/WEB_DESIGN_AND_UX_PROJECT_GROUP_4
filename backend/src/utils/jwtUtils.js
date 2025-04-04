// src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Secret key from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      fullName: user.fullName 
    }, 
    JWT_SECRET, 
    { 
      expiresIn: '1h' 
    }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      next();
    } else {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateJWT
};