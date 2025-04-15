const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage with better debugging
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Make sure this path matches what your server.js is configured to serve
    const uploadDir = path.join(__dirname, '../uploads');
    console.log("Upload destination directory:", uploadDir);
    
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      console.log("Creating uploads directory:", uploadDir);
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Log file info
    console.log("Receiving file:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create a consistent filename format
    const ext = path.extname(file.originalname);
    const filename = `apt-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    console.log("Generated filename:", filename);
    cb(null, filename);
  }
});

// Set up file filter for images
const fileFilter = (req, file, cb) => {
  // Accept only image file types
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    console.log("Rejected file:", file.originalname, file.mimetype);
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create the multer instance with limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add error handling middleware
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred
    console.error("Multer error:", err.message);
    return res.status(400).json({ 
      message: `Upload error: ${err.message}`,
      code: err.code
    });
  } else if (err) {
    // An unknown error occurred
    console.error("Unknown upload error:", err.message);
    return res.status(500).json({ 
      message: `Upload failed: ${err.message}`
    });
  }
  
  next();
};

module.exports = upload;
module.exports.handleUploadErrors = handleUploadErrors;