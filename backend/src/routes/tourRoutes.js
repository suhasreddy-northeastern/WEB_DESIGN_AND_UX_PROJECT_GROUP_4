// routes/tourRoutes.js
const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const checkAuth = require('../middleware/checkAuth');

// User routes
router.post('/schedule', checkAuth('user'), tourController.scheduleTour);
router.get('/user', checkAuth('user'), tourController.getUserTours);
router.put('/cancel/:tourId', checkAuth('user'), tourController.cancelTour);

// Broker routes
router.get('/broker', checkAuth('broker'), tourController.getBrokerTours);
router.put('/status/:tourId', checkAuth('broker'), tourController.updateTourStatus);

module.exports = router;