const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { generateTitleController } = require('../controllers/apartmentController');
const {
  createApartment,
  getAllApartments,
  updateApartment
} = require('../controllers/apartmentController');

const checkApprovedBroker = require('../middleware/checkApprovedBroker');

// ------------------------------------------------------------
// 🏠 APARTMENT LISTINGS
// ------------------------------------------------------------

// ✅ Create apartment (only approved brokers)
router.post('/', checkApprovedBroker, createApartment);

// ✅ Update apartment (only approved brokers)
router.put('/:id', checkApprovedBroker, updateApartment);

// ✅ Get all apartments (public)
router.get('/', getAllApartments);

// ------------------------------------------------------------
// 🧠 AI TITLE GENERATOR
// ------------------------------------------------------------

router.post('/generate-title', generateTitleController);

// ------------------------------------------------------------
// 🖼️ IMAGE UPLOAD (max 5 images)
// ------------------------------------------------------------

router.post('/upload-images', upload.array('images', 5), (req, res) => {
  try {
    const fileUrls = req.files.map(file => `/uploads/images/${file.filename}`);
    res.status(200).json({ imageUrls: fileUrls });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

module.exports = router;
