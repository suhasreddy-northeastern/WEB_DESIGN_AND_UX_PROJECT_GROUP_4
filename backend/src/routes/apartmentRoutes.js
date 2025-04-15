const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { generateTitleController } = require('../controllers/apartmentController');
const checkAuth = require('../middleware/checkAuth');
const {
  createApartment,
  getAllApartments,
  updateApartment,
  getNearbyApartments,
  getApartmentById,
  uploadImages,
  debugUploads,
  getBrokerApartments,
  getFeaturedApartments
} = require('../controllers/apartmentController');

const checkApprovedBroker = require('../middleware/checkApprovedBroker');

// ------------------------------------------------------------
// 🏠 APARTMENT LISTINGS
// ------------------------------------------------------------

// ✅ Create apartment (only approved brokers)
router.post('/', checkAuth('broker'), checkApprovedBroker, createApartment);

// ✅ Update apartment (only approved brokers)
router.put('/:id', checkAuth('broker'), checkApprovedBroker, updateApartment);

// ✅ Get all apartments (public)
router.get('/', getAllApartments);

// ✅ Get a specific apartment by ID (public)
router.get('/detail/:id', getApartmentById);

// ✅ Get apartments near location (public)
router.get('/nearby', getNearbyApartments);

// ✅ Get broker's apartments (private)
router.get('/broker', checkAuth('broker'), getBrokerApartments);

// ✅ Get featured apartments for homepage (public)
router.get('/featured', getFeaturedApartments);

// ------------------------------------------------------------
// 🧠 AI TITLE GENERATOR
// ------------------------------------------------------------

router.post('/generate-title', generateTitleController);

// ------------------------------------------------------------
// 🖼️ IMAGE UPLOAD (max 5 images)
// ------------------------------------------------------------

router.post('/upload-images', upload.array('images', 5), uploadImages);

// ------------------------------------------------------------
// 🛠️ DEBUGGING ENDPOINTS
// ------------------------------------------------------------

// Debug endpoint to check uploads directory
router.get('/debug-uploads', debugUploads);

module.exports = router;