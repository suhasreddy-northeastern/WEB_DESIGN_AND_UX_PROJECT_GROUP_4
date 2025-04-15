const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const checkAuth = require('../middleware/checkAuth');

// Public route to check if system is in maintenance mode
router.get('/maintenance-status', systemController.getMaintenanceStatus);

// Admin-only routes
router.post('/set-maintenance-mode', checkAuth('admin'), systemController.setMaintenanceMode);

module.exports = router;