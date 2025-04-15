const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require('fs');

const { 
  changePassword, 
  updateBrokerProfile, 
  updateNotificationSettings,
  getNotificationSettings
} = require('../controllers/brokerController');

// Configure multer to preserve file extensions
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Get original file extension
    const ext = path.extname(file.originalname);
    // Generate unique filename with original extension
    cb(null, `license-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Accept only certain file types
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPEG, and PNG files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const brokerController = require('../controllers/brokerController');
const checkAuth = require('../middleware/checkAuth');
const checkApprovedBroker = require('../middleware/checkApprovedBroker');
const User = require('../models/User'); 



// Configure multer for profile image uploads
const profileImageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Get original file extension
    const ext = path.extname(file.originalname);
    // Generate unique filename with original extension
    cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});

const profileImageUpload = multer({ 
  storage: profileImageStorage,
  fileFilter: function(req, file, cb) {
    // Accept only image file types
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/gif'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ----------------- 🛠️ Settings Routes -----------------

// Update broker's profile with image upload support
router.put('/profile', checkAuth('broker'), profileImageUpload.single('profileImage'), updateBrokerProfile);

// Change password
router.put('/change-password', checkAuth('broker'), changePassword);

// Update notification settings
router.put('/notification-settings', checkAuth('broker'), updateNotificationSettings);

// Get notification settings
router.get('/notification-settings', checkAuth('broker'), getNotificationSettings);

// ✅ Public route: Register a new broker
router.post('/register', upload.single("licenseDocument"), brokerController.registerBroker);

// ✅ Combined middleware stack for approved brokers
const brokerMiddleware = [checkAuth('broker'), checkApprovedBroker];

// ----------------- 👤 Broker Profile -----------------

// Update broker's profile (name, phone, etc.)
router.put('/profile', brokerMiddleware, updateBrokerProfile);

// Get current broker info (used for refreshing state on frontend)
router.get('/me', checkAuth('broker'), async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Broker not found' });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching broker profile:", err);
    res.status(500).json({ message: "Failed to fetch broker profile" });
  }
});

// ----------------- 📊 Dashboard Routes -----------------

router.get('/stats', brokerMiddleware, brokerController.getBrokerStats);
router.get('/listing-performance', brokerMiddleware, brokerController.getListingPerformance);

// ----------------- 🏠 Listing Management -----------------

router.get('/listings', brokerMiddleware, brokerController.getBrokerListings);
router.put('/listings/:id/toggle-active', brokerMiddleware, brokerController.toggleListingActive);
router.get('/listings/:id', brokerMiddleware, brokerController.getBrokerListingById);
router.delete('/listings/:id', brokerMiddleware, brokerController.deleteListing);

// ----------------- 📩 Inquiry Management -----------------

router.get('/inquiries', brokerMiddleware, brokerController.getBrokerInquiries);
router.post('/inquiries/:id/reply', brokerMiddleware, brokerController.replyToInquiry);

// Add a route to view license documents without extension
router.get('/view-document/:filename', checkAuth('admin'), (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  res.sendFile(filePath);
});

module.exports = router;