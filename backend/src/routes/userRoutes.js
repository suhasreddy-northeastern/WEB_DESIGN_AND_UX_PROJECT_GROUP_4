//routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUserCreation, validateUserUpdate } = require('../middleware/validateRequest');
const upload = require('../middleware/uploadMiddleware');
const { submitPreferences, getMatches } = require('../controllers/userController');

// 🔐 Session-based auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Session not found' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.session.user?.type === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admins only' });
  }
};

const isBroker = (req, res, next) => {
  if (req.session.user?.type === 'broker') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Brokers only' });
  }
};

const isUser = (req, res, next) => {
  if (req.session.user?.type === 'user') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Users only' });
  }
};

// ✅ Auth routes
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);
router.get('/session', userController.getSession);
router.post('/create', validateUserCreation, userController.createUser);

// ✅ Admin-only route
router.get('/users', isAuthenticated, isAdmin, userController.getAllUsers);

// ✅ Protected user routes
router.put('/edit', isAuthenticated, validateUserUpdate, userController.updateUser);
router.delete('/delete', isAuthenticated, userController.deleteUser);
router.get('/getAll', isAuthenticated, userController.getAllUsers);
router.post('/uploadImage', isAuthenticated, upload.single('image'), userController.uploadImage);
router.post('/save', isAuthenticated, isUser, userController.toggleSaveApartment);
router.get('/saved', isAuthenticated, isUser, userController.getSavedApartments);


// ✅ User Preferences and Matching
router.post('/preferences', isAuthenticated, isUser, submitPreferences);
router.get('/preferences/latest', isAuthenticated, isUser, userController.getLatestPreference);
router.get('/matches/:prefId', isAuthenticated, isUser, getMatches);

module.exports = router;
