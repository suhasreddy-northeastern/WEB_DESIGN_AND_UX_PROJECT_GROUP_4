// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Ensure images directory exists
const imagePath = path.join(__dirname, '../../images');
if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagePath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `apt-${uniqueSuffix}${path.extname(file.originalname)}`);
  }  
});

// File filter for image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, GIF, and SVG are allowed.'), false);
  }
};


const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // Default to 5MB if not specified
  }
});

module.exports = upload;