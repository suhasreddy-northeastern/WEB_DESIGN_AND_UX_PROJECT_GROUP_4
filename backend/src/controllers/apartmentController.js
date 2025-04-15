const Apartment = require("../models/Apartment");
const Preference = require("../models/Preference");
const Inquiry = require("../models/Inquiry");
const User = require("../models/User");
const { generateListingTitle } = require("../services/groqTitle");
const { calculateMatchScore } = require("../utils/matchScoring");
const { getMatchExplanation } = require("../services/groqService");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

// 📦 Create Apartment
exports.createApartment = async (req, res) => {
  try {
    // Add broker email and ID from session
    const brokerEmail = req.session?.user?.email;
    const brokerId = req.session?.user?._id;
    
    if (!brokerEmail || !brokerId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Check if user is a broker
    if (req.session.user.type !== 'broker') {
      return res.status(403).json({ message: "Only brokers can create listings" });
    }

    // Format location data if provided
    let formattedData = { ...req.body };
    if (req.body.location) {
      // Ensure coordinates are proper numbers
      if (req.body.location.coordinates && Array.isArray(req.body.location.coordinates)) {
        formattedData.location = {
          type: 'Point',
          coordinates: [
            parseFloat(req.body.location.coordinates[0]),
            parseFloat(req.body.location.coordinates[1])
          ],
          address: req.body.location.address || ''
        };
      }
    }

    // Debug logging for image URLs
    if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
      console.log("Processing image URLs for new apartment:", req.body.imageUrls);
    }

    const apartmentData = {
      ...formattedData,
      brokerEmail,
      broker: brokerId 
    };

    console.log("Creating apartment with data:", {
      ...apartmentData,
      imageUrls: apartmentData.imageUrls?.length || 0
    });

    const apartment = await Apartment.create(apartmentData);
    res.status(201).json(apartment);
  } catch (error) {
    console.error("Error creating apartment:", error);
    res.status(400).json({ message: error.message });
  }
};

// 📄 Get All Apartments
exports.getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ isActive: true });
    res.status(200).json(apartments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Get Apartments Near Location
exports.getNearbyApartments = async (req, res) => {
  try {
    const { longitude, latitude, radius = 5 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ message: "Missing location coordinates" });
    }

    // Convert string values to numbers
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const radiusInKm = parseFloat(radius);

    // Find apartments within the radius (in kilometers)
    const apartments = await Apartment.find({
      isActive: true,
      'location.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radiusInKm * 1000 // Convert km to meters
        }
      }
    });

    res.status(200).json(apartments);
  } catch (error) {
    console.error("Error finding nearby apartments:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🎯 Get Matches by User Email (with full results)
exports.getMatchesByUserEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Missing user email" });

    const latestPref = await Preference.findOne({ userEmail: email }).sort({
      submittedAt: -1,
    });
    if (!latestPref)
      return res.status(404).json({ message: "No preferences found" });

    // Start with the base query
    let query = { isActive: true };
    
    // Add location query if location preference exists
    if (latestPref.locationPreference && latestPref.locationPreference.center) {
      const [lng, lat] = latestPref.locationPreference.center;
      const radius = latestPref.locationPreference.radius || 5; // default 5km
      
      query['location.coordinates'] = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }
    
    const apartments = await Apartment.find(query);

    const scored = await Promise.all(
      apartments.map(async (apartment) => {
        const score = calculateMatchScore(latestPref, apartment);
        const explanation = await getMatchExplanation(latestPref, apartment);
        return {
          apartment,
          matchScore: score,
          explanation,
        };
      })
    );

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.status(200).json(scored);
  } catch (err) {
    console.error("Match error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✨ Generate Listing Title (AI)
exports.generateTitleController = async (req, res) => {
  try {
    const title = await generateListingTitle(req.body.apartment);
    res.status(200).json({ title });
  } catch (error) {
    console.error("Title generation error:", error);
    res.status(500).json({ error: "Failed to generate title" });
  }
};

// ✏️ Update Apartment Listing
exports.updateApartment = async (req, res) => {
  try {
    const apartmentId = req.params.id;
    const brokerEmail = req.session?.user?.email;
    const brokerId = req.session?.user?._id;

    if (!brokerEmail || !brokerId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Check if the listing belongs to the logged-in broker
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment || apartment.brokerEmail !== brokerEmail) {
      return res.status(403).json({ message: "Not authorized to update this listing" });
    }

    // Format location data if provided
    let formattedData = { ...req.body };
    if (req.body.location) {
      // Ensure coordinates are proper numbers
      if (req.body.location.coordinates && Array.isArray(req.body.location.coordinates)) {
        formattedData.location = {
          type: 'Point',
          coordinates: [
            parseFloat(req.body.location.coordinates[0]),
            parseFloat(req.body.location.coordinates[1])
          ],
          address: req.body.location.address || apartment.location?.address || ''
        };
      }
    }

    // Make sure to preserve the broker reference
    formattedData.broker = brokerId;
    formattedData.brokerEmail = brokerEmail;

    // Update apartment with provided data
    const updated = await Apartment.findByIdAndUpdate(apartmentId, formattedData, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update apartment" });
  }
};

// 🔍 Get a specific apartment by ID
exports.getApartmentById = async (req, res) => {
  try {
    const apartmentId = req.params.id;
    
    const apartment = await Apartment.findById(apartmentId)
      .populate('broker', 'fullName email phone imagePath');
    
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }
    
    res.status(200).json(apartment);
  } catch (error) {
    console.error("Error fetching apartment:", error);
    res.status(500).json({ message: "Failed to fetch apartment details" });
  }
};

// 🖼️ Handle Image Upload
exports.uploadImages = async (req, res) => {
  try {
    console.log("Upload Images Request Received");
    console.log("Files received:", req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    
    // Log the server configuration for file serving
    const uploadsDir = path.resolve(__dirname, '../uploads');
    console.log("Uploads directory:", uploadsDir);
    console.log("Directory exists:", fs.existsSync(uploadsDir));
    
    // Create URLs that can be properly accessed by the frontend
    const fileUrls = req.files.map(file => {
      const relativePath = `/uploads/${file.filename}`;
      console.log("Generated image URL:", relativePath);
      return relativePath;
    });
    
    res.status(200).json({ 
      message: "Images uploaded successfully",
      imageUrls: fileUrls,
      count: fileUrls.length
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
};

// 🔍 Debug endpoint to check uploaded files
exports.debugUploads = (req, res) => {
  try {
    const uploadsDir = path.resolve(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({
        message: "Uploads directory does not exist",
        path: uploadsDir
      });
    }
    
    fs.readdir(uploadsDir, (err, files) => {
      if (err) {
        return res.status(500).json({ 
          error: err.message, 
          path: uploadsDir 
        });
      }
      
      // Get stats for each file
      const fileDetails = files.map(filename => {
        try {
          const filePath = path.join(uploadsDir, filename);
          const stats = fs.statSync(filePath);
          return {
            name: filename,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            accessed: stats.atime,
            modified: stats.mtime
          };
        } catch (error) {
          return {
            name: filename,
            error: error.message
          };
        }
      });
      
      res.json({
        path: uploadsDir,
        exists: true,
        fileCount: files.length,
        files: fileDetails
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "Error checking uploads directory",
      error: error.message
    });
  }
};

// ✅ Get Broker's Apartments
exports.getBrokerApartments = async (req, res) => {
  try {
    const brokerEmail = req.session?.user?.email;
    
    if (!brokerEmail) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const apartments = await Apartment.find({ brokerEmail })
      .sort({ createdAt: -1 })
      .lean();
      
    // Enhance with inquiry counts
    const enhancedApartments = await Promise.all(apartments.map(async (apt) => {
      const inquiryCount = await Inquiry.countDocuments({ apartmentId: apt._id });
      return {
        ...apt,
        inquiries: inquiryCount,
        // Add a placeholder for view count (in a real app, this would come from analytics)
        views: Math.floor(Math.random() * 200) + 10
      };
    }));
    
    res.status(200).json(enhancedApartments);
  } catch (error) {
    console.error("Error fetching broker apartments:", error);
    res.status(500).json({ message: "Failed to fetch apartments" });
  }
};

// 💫 Get Featured Apartments (for homepage)
exports.getFeaturedApartments = async (req, res) => {
  try {
    // Get a selection of active apartments, sorted by newest first
    const apartments = await Apartment.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('broker', 'fullName imagePath')
      .lean();
      
    res.status(200).json(apartments);
  } catch (error) {
    console.error("Error fetching featured apartments:", error);
    res.status(500).json({ message: "Failed to fetch featured apartments" });
  }
};