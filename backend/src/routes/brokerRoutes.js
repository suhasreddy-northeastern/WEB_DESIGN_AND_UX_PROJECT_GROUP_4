const express = require('express');
const router = express.Router();
const brokerController = require('../controllers/brokerController');
const checkAuth = require('../middleware/checkAuth');
const { updateBrokerProfile } = require('../controllers/brokerController');


// ✅ Middleware to ensure broker is approved
const checkApprovedBroker = (req, res, next) => {
  if (!req.user.isApproved) {
    return res.status(403).json({ error: 'Broker not approved yet by admin' });
  }
  next();
};

// Middleware stack for approved brokers
const brokerMiddleware = [checkAuth('broker'), checkApprovedBroker];

// ----------------- 👤 Broker Profile -----------------

// Update broker's profile (name, phone, etc.)
router.put('/profile', brokerMiddleware, updateBrokerProfile);

// ----------------- 📊 Dashboard Routes -----------------

// Get dashboard stats for the broker
router.get('/stats', brokerMiddleware, brokerController.getBrokerStats);

// Get listing performance metrics
router.get('/listing-performance', brokerMiddleware, brokerController.getListingPerformance);

// ----------------- 🏠 Listing Management -----------------

// View all listings posted by broker
router.get('/listings', brokerMiddleware, brokerController.getBrokerListings);

// Toggle active/inactive status of a listing
router.put('/listings/:id/toggle-active', brokerMiddleware, brokerController.toggleListingActive);

// Delete a listing
router.delete('/listings/:id', brokerMiddleware, brokerController.deleteListing);

// ----------------- 📩 Inquiry Management -----------------

// View all inquiries received for broker's listings
router.get('/inquiries', brokerMiddleware, brokerController.getBrokerInquiries);

// Reply to a specific inquiry
router.post('/inquiries/:id/reply', brokerMiddleware, brokerController.replyToInquiry);

module.exports = router;
