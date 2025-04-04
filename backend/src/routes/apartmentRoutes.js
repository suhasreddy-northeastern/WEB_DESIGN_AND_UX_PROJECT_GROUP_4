const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { generateTitleController } = require('../controllers/apartmentController');


const {
  createApartment,
  getAllApartments
} = require('../controllers/apartmentController');

// POST: Create new apartment listing
router.post('/', createApartment);

// generate Title
router.post('/generate-title', generateTitleController);


// GET: Get all apartments
router.get('/', getAllApartments);

// POST: Upload apartment images (max 5 images)
router.post('/upload-images', upload.array('images', 5), (req, res) => {
  try {
    const fileUrls = req.files.map(file => `/images/${file.filename}`);
    res.status(200).json({ imageUrls: fileUrls });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

module.exports = router;
