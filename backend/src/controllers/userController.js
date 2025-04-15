const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const Preference = require("../models/Preference");
const Apartment = require("../models/Apartment");
const Inquiry = require('../models/Inquiry');
const { getMatchExplanation } = require("../services/groqService");
const { calculateMatchScore } = require("../utils/matchScoring"); 
const { getAsync, setexAsync, delAsync, redisClient } = require('../utils/redisClient');

/**
 * Generate a simple fallback explanation when Groq API fails
 * @param {Object} pref - User preference object
 * @param {Object} apt - Apartment object
 * @returns {String} - Simple formatted explanation with check marks
 */
const generateFallbackExplanation = (pref, apt) => {
  const highlights = [];
  
  // Check price match
  if (pref.priceRange) {
    // For "$3,000+" format
    if (pref.priceRange.includes('+')) {
      const minPrice = parseInt(pref.priceRange.replace(/[^\d]/g, ''));
      if (apt.price >= minPrice) {
        highlights.push("Within your budget range");
      }
    } 
    // For regular range
    else {
      const priceRange = pref.priceRange.split('-').map(p => parseInt(p.replace(/[^\d]/g, '')));
      if (priceRange.length === 2) {
        if (apt.price >= priceRange[0] && apt.price <= priceRange[1]) {
          highlights.push("Within your budget range");
        }
      }
    }
  }
  
  // Check bedrooms match
  if (pref.bedrooms && apt.bedrooms) {
    // Extract number from potential formats like "3 Bedrooms"
    const prefBedroomsMatch = pref.bedrooms.toString().match(/(\d+)/);
    const prefBedrooms = prefBedroomsMatch ? prefBedroomsMatch[1] : pref.bedrooms;
    
    const aptBedroomsMatch = apt.bedrooms.toString().match(/(\d+)/);
    const aptBedrooms = aptBedroomsMatch ? aptBedroomsMatch[1] : apt.bedrooms;
    
    if (prefBedrooms === aptBedrooms) {
      highlights.push("Has your required bedrooms");
    }
  }
  
  // Check neighborhood match
  if (pref.neighborhood && apt.neighborhood && pref.neighborhood === apt.neighborhood) {
    highlights.push("In your preferred neighborhood");
  }
  
  // Check move-in date
  if (pref.moveInDate && apt.moveInDate) {
    const prefDate = new Date(pref.moveInDate);
    const aptDate = new Date(apt.moveInDate);
    if (aptDate <= prefDate) {
      highlights.push("Available within your timeframe");
    }
  }
  
  // Check amenities matches
  if (Array.isArray(pref.amenities) && Array.isArray(apt.amenities)) {
    const matchingAmenities = apt.amenities.filter(item => 
      pref.amenities.some(prefItem => 
        prefItem.toLowerCase().includes(item.toLowerCase()) || 
        item.toLowerCase().includes(prefItem.toLowerCase())
      )
    );
    
    if (matchingAmenities.length > 0) {
      if (matchingAmenities.length === pref.amenities.length) {
        highlights.push("Has all your desired amenities");
      } else {
        highlights.push(`Has ${matchingAmenities.length} of your desired amenities`);
      }
    }
  }
  
  // Check parking match
  if (pref.parking && apt.parking) {
    const prefParking = pref.parking.toLowerCase();
    const aptParking = apt.parking.toLowerCase();
    
    if ((prefParking.includes('yes') || prefParking.includes('need')) && 
        (aptParking.includes('yes') || aptParking === 'true')) {
      highlights.push("Includes parking as requested");
    }
  }
  
  // Format the result with check marks
  return highlights.map(highlight => `✅ ${highlight}`).join('\n');
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("👉 Login attempt:", { email, password });

    const user = await User.findOne({ email });
    console.log("🔍 User found:", user ? user.email : "No user found");

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Optional: log user type
    console.log("🧑‍💻 User type:", user.type);

    const isMatch = await user.comparePassword(password);
    console.log("🔐 Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Save session info
    req.session.user = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      type: user.type,
      isApproved: user.isApproved
    };

    console.log("✅ Session created:", req.session.user);
    res.status(200).json({ message: "Login successful", user: req.session.user });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};


// Update user
exports.updateUser = async (req, res) => {
  try {
    const email = req.session.user?.email;
    if (!email) return res.status(401).json({ error: "Not authenticated" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    // Update fields
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.password) user.password = req.body.password;

    await user.save();

    // Refresh session with updated user
    req.session.user = user;

    // Prepare response (sanitize sensitive fields)
    const updatedUser = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      imagePath: user.imagePath,
      type: user.type
    };

    res.status(200).json({
      message: "User updated successfully.",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server error" });
  }
};



// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndDelete({ email });

    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.imagePath) {
      const imagePath = path.join(__dirname, "..", user.imagePath);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Upload user image
exports.uploadImage = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "User not found." });
    }

    if (user.imagePath) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Image already exists for this user." });
    }

    const filePath = `/images/${req.file.filename}`;
    user.imagePath = filePath;
    await user.save();

    res.status(201).json({ message: "Image uploaded successfully.", filePath });
  } catch (error) {
    console.error("Error uploading image:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Server error" });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, password, type } = req.body;

    if (!["admin", "broker", "user"].includes(type)) {
      return res.status(400).json({ error: "Invalid user type. Must be admin, broker, or user." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: "User already exists" });

    const newUser = new User({ fullName, email, password, type });
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: { fullName, email, type },
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const email = req.session.user?.email;
    if (!email) return res.status(401).json({ error: "Not authenticated" });

    const user = await User.findOne({ email }, { password: 0 });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    const email = req.session.user?.email;
    if (!email) return res.status(401).json({ error: "Not authenticated" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update notification settings
    user.notificationSettings = {
      ...user.notificationSettings,
      ...req.body
    };

    await user.save();
    res.status(200).json({ 
      message: "Notification settings updated successfully",
      notificationSettings: user.notificationSettings
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const email = req.session.user?.email;
    
    if (!email) return res.status(401).json({ error: "Not authenticated" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    
    // Update with new password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    const email = req.session.user?.email;
    if (!email) return res.status(401).json({ error: "Not authenticated" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Handle the uploaded file
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // If user already has an image, delete the old one
    if (user.imagePath) {
      try {
        const oldImagePath = path.join(__dirname, "..", user.imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (err) {
        console.error("Error deleting old image:", err);
        // Continue with upload even if delete fails
      }
    }

    const filePath = `/images/${req.file.filename}`;
    user.imagePath = filePath;
    await user.save();

    res.status(200).json({ 
      message: "Profile image updated successfully", 
      imagePath: filePath 
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Error deleting uploaded file:", err);
      }
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Logout
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Failed to log out" });

    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
};

// Get current session
exports.getSession = (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({ user: req.session.user });
  } else {
    return res.status(401).json({ error: "Not authenticated" });
  }
};

// ✅ Submit or Update Preferences
exports.submitPreferences = async (req, res) => {
  try {
    // 🔒 Get email from session
    const userEmail = req.session.user?.email;
    if (!userEmail) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // 🔍 Check if user already submitted preferences
    const existing = await Preference.findOne({ userEmail });

    let preference;
    if (existing) {
      // 🔄 Update existing preference
      Object.assign(existing, req.body, { submittedAt: new Date() });
      preference = await existing.save();
      
      // Clear cache when preferences are updated
      await exports.clearMatchesCache(existing._id.toString());
      
      res.status(200).json({ message: "Preferences updated successfully", preference });
    } else {
      // 🆕 Create new preference
      preference = new Preference({
        ...req.body,
        userEmail,
        submittedAt: new Date(),
      });
      await preference.save();
      res.status(201).json({ message: "Preferences submitted successfully", preference });
    }
  } catch (err) {
    console.error("Submit/Update Preferences Error:", err);
    res.status(400).json({ message: err.message });
  }
};

// ✅ Get matches with AI explanations - UPDATED to handle forceRefresh and fallback explanations
exports.getMatches = async (req, res) => {
  try {
    const { prefId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4; // Using 4 to match frontend itemsPerPage
    const forceRefresh = req.query.forceRefresh === 'true';
    
    // Create a cache key based on preference ID and pagination
    const cacheKey = `matches:${prefId}:page${page}:limit${limit}`;
    
    // Only check cache if we're not forcing a refresh
    let cachedData = null;
    if (!forceRefresh) {
      cachedData = await getAsync(cacheKey);
    }
    
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }
    
    console.log(`Cache miss for ${cacheKey}${forceRefresh ? ' (forced refresh)' : ''}, fetching from database...`);
    
    // If no cache or force refresh, proceed with the original logic
    const pref = await Preference.findById(prefId);
    if (!pref) return res.status(404).json({ message: "Preferences not found" });

    const allApartments = await Apartment.find();
    
    // Get total count for pagination
    const totalCount = allApartments.length;
    
    const start = (page - 1) * limit;
    const paginated = allApartments.slice(start, start + limit);

    const scored = [];

    for (let apt of paginated) {
      const score = calculateMatchScore(pref, apt);
      
      // Try to get explanation from Groq with increased delay
      let explanation;
      try {
        // Increase delay to 8 seconds to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 8000));
        explanation = await getMatchExplanation(pref, apt);
      } catch (err) {
        console.error("Groq API error:", err.response?.data || err.message);
        // Use our fallback explanation generator instead of a generic message
        explanation = generateFallbackExplanation(pref, apt);
      }

      scored.push({ apartment: apt, matchScore: score, explanation });
    }

    const responseData = {
      results: scored,
      totalCount
    };
    
    // Cache the results for 1 hour (3600 seconds)
    await setexAsync(cacheKey, 3600, JSON.stringify(responseData));
    
    res.status(200).json(responseData);
    
  } catch (err) {
    console.error("Error in getMatches:", err);
    res.status(500).json({ message: err.message });
  }
};

// Improved function to clear cache when preferences change
exports.clearMatchesCache = async (prefId) => {
  try {
    // Try to use Redis client to get all matching keys
    try {
      const keys = await redisClient.keys(`matches:${prefId}:*`);
      
      if (keys && keys.length > 0) {
        // Delete all matching keys
        await redisClient.del(keys);
        console.log(`Cleared ${keys.length} cache entries for preference ${prefId}`);
        return;
      }
    } catch (keysError) {
      console.error("Error using redisClient.keys:", keysError);
      // Fall through to backup method
    }
    
    // Backup method: try to clear individual keys for common page/limit combinations
    console.log(`Using fallback method to clear cache for preference ${prefId}`);
    const limits = [3, 4]; // Common limit values used in your app
    
    for (let limit of limits) {
      for (let page = 1; page <= 10; page++) {
        const cacheKey = `matches:${prefId}:page${page}:limit${limit}`;
        await delAsync(cacheKey);
      }
    }
    
    console.log(`Completed fallback cache clearing for preference ${prefId}`);
  } catch (err) {
    console.error("Error clearing cache:", err);
  }
};

exports.getLatestPreference = async (req, res) => {
  try {
    const email = req.session?.user?.email;
    if (!email) return res.status(401).json({ message: "Not logged in" });

    const preference = await Preference.findOne({ userEmail: email }).sort({ submittedAt: -1 });
    if (!preference) return res.status(404).json({ message: "No preferences found" });

    res.status(200).json({ preference });
  } catch (err) {
    console.error("Get latest preference error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//  Save or Unsave apartment
exports.toggleSaveApartment = async (req, res) => {
  const { apartmentId } = req.body;
  const email = req.session.user?.email;
  if (!email) return res.status(401).json({ error: "Not authenticated" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Ensure it's an array
    if (!Array.isArray(user.savedApartments)) {
      user.savedApartments = [];
    }

    // Use `toString()` comparison instead of `includes()`
    const isSaved = user.savedApartments.some(
      id => id?.toString() === apartmentId
    );

    if (isSaved) {
      user.savedApartments = user.savedApartments.filter(
        id => id?.toString() !== apartmentId
      );
      await user.save();
      return res.status(200).json({ message: "Apartment removed from saved." });
    } else {
      user.savedApartments.push(apartmentId);
      await user.save();
      return res.status(200).json({ message: "Apartment saved successfully." });
    }
  } catch (err) {
    console.error("Toggle Save Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


//Fetch all saved apartments
exports.getSavedApartments = async (req, res) => {
  const email = req.session.user?.email;
  if (!email) return res.status(401).json({ error: "Not authenticated" });

  try {
    const user = await User.findOne({ email }).populate("savedApartments");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user.savedApartments);
  } catch (err) {
    console.error("Fetch Saved Apartments Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ Get matches with filtering capabilities
exports.getMatches = async (req, res) => {
  try {
    const { prefId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const sortBy = req.query.sortBy || "matchScore";
    const sortOrder = req.query.sortOrder || "desc";
    const forceRefresh = req.query.forceRefresh === 'true';
    
    // Extract filter parameters
    const filters = {
      minPrice: req.query.minPrice ? parseInt(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice) : null,
      bedrooms: req.query.bedrooms ? req.query.bedrooms.split(',') : null,
      bathrooms: req.query.bathrooms ? req.query.bathrooms.split(',') : null,
      neighborhoods: req.query.neighborhoods ? req.query.neighborhoods.split(',') : null,
      amenities: req.query.amenities ? req.query.amenities.split(',') : null,
    };
    
    // Create a cache key based on all parameters
    const filterKey = Object.entries(filters)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join('-') : value}`)
      .join(':');
    
    const cacheKey = `matches:${prefId}:page${page}:limit${limit}:sort${sortBy}${sortOrder}:${filterKey}`;
    
    // Only check cache if we're not forcing a refresh
    let cachedData = null;
    if (!forceRefresh) {
      cachedData = await getAsync(cacheKey);
    }
    
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }
    
    console.log(`Cache miss for ${cacheKey}${forceRefresh ? ' (forced refresh)' : ''}, fetching from database...`);
    
    // If no cache or force refresh, proceed with the original logic
    const pref = await Preference.findById(prefId);
    if (!pref) return res.status(404).json({ message: "Preferences not found" });

    // Build the filter query
    let query = {};
    
    // Apply price filter
    if (filters.minPrice !== null || filters.maxPrice !== null) {
      query.price = {};
      if (filters.minPrice !== null) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== null) query.price.$lte = filters.maxPrice;
    }
    
    // Apply bedroom filter
    if (filters.bedrooms && filters.bedrooms.length > 0) {
      // Handle multiple bedroom options
      const bedroomConditions = [];
      
      if (filters.bedrooms.includes('Studio')) {
        // For studio, check for '0', 'Studio', or '0 Bedrooms'
        bedroomConditions.push({ bedrooms: '0' });
        bedroomConditions.push({ bedrooms: 'Studio' });
        bedroomConditions.push({ bedrooms: '0 Bedrooms' });
      }
      
      // For numeric bedrooms
      filters.bedrooms.forEach(bed => {
        if (bed !== 'Studio') {
          if (bed === '3+') {
            // For 3+, match 3 or greater
            bedroomConditions.push({ bedrooms: { $regex: /^[3-9]/ } });
            bedroomConditions.push({ bedrooms: { $regex: /^[1-9][0-9]+/ } }); // Two or more digits
          } else {
            // Exact match with potential text
            bedroomConditions.push({ bedrooms: bed });
            bedroomConditions.push({ bedrooms: { $regex: new RegExp(`^${bed}\\s`) } }); // e.g. "1 Bedroom"
          }
        }
      });
      
      if (bedroomConditions.length > 0) {
        query.$or = bedroomConditions;
      }
    }
    
    // Apply bathroom filter (similar logic to bedrooms)
    if (filters.bathrooms && filters.bathrooms.length > 0) {
      const bathroomConditions = [];
      
      filters.bathrooms.forEach(bath => {
        if (bath === '3+') {
          bathroomConditions.push({ bathrooms: { $regex: /^[3-9]/ } });
          bathroomConditions.push({ bathrooms: { $regex: /^[1-9][0-9]+/ } });
        } else {
          bathroomConditions.push({ bathrooms: bath });
          bathroomConditions.push({ bathrooms: { $regex: new RegExp(`^${bath}\\s`) } });
        }
      });
      
      if (bathroomConditions.length > 0) {
        // If we already have an $or, we need to use $and to combine with bathrooms
        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: bathroomConditions }];
          delete query.$or;
        } else {
          query.$or = bathroomConditions;
        }
      }
    }
    
    // Apply neighborhood filter
    if (filters.neighborhoods && filters.neighborhoods.length > 0) {
      if (!query.$and) query.$and = [];
      query.$and.push({ neighborhood: { $in: filters.neighborhoods } });
    }
    
    // Apply amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      // Convert to lowercase and handle plurals
      const normalizedAmenities = filters.amenities.map(amenity => 
        amenity.toLowerCase().replace(/[\s-]/g, '')
      );
      
      if (!query.$and) query.$and = [];
      
      // Create a complex condition for amenities
      query.$and.push({
        $or: normalizedAmenities.map(amenity => ({
          amenities: {
            $elemMatch: {
              $regex: new RegExp(amenity, 'i')
            }
          }
        }))
      });
    }
    
    console.log("Generated query:", JSON.stringify(query, null, 2));
    
    // Fetch apartments with filters
    const allApartments = Object.keys(query).length > 0 
      ? await Apartment.find(query)
      : await Apartment.find();
    
    // Get total count for pagination
    const totalCount = allApartments.length;
    
    // Apply sorting before pagination
    let sortedApartments = [...allApartments];
    
    // We'll sort by match score later, so only apply database sorting for other fields
    if (sortBy === 'price') {
      sortedApartments.sort((a, b) => {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      });
    } else if (sortBy === 'dateAdded') {
      sortedApartments.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    
    // Calculate match scores and explanations for sorted apartments
    const scoredApartments = [];
    
    for (let apt of sortedApartments) {
      const score = calculateMatchScore(pref, apt);
      
      // Try to get explanation from Groq with delay between requests
      let explanation;
      try {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        explanation = await getMatchExplanation(pref, apt);
      } catch (err) {
        console.error("Groq API error:", err.response?.data || err.message);
        explanation = generateFallbackExplanation(pref, apt);
      }
      
      scoredApartments.push({
        apartment: apt,
        matchScore: score,
        explanation
      });
    }
    
    // If sorting by match score, apply it now
    if (sortBy === 'matchScore') {
      scoredApartments.sort((a, b) => {
        return sortOrder === 'asc' ? a.matchScore - b.matchScore : b.matchScore - a.matchScore;
      });
    }
    
    // Apply pagination after all sorting and scoring
    const start = (page - 1) * limit;
    const paginatedResults = scoredApartments.slice(start, start + limit);
    
    const responseData = {
      results: paginatedResults,
      totalCount,
      filteredCount: scoredApartments.length
    };
    
    // Cache the results for 1 hour (3600 seconds)
    await setexAsync(cacheKey, 3600, JSON.stringify(responseData));
    
    res.status(200).json(responseData);
    
  } catch (err) {
    console.error("Error in getMatches:", err);
    res.status(500).json({ message: err.message });
  }
};

// Contact Broker
exports.contactBroker = async (req, res) => {
  try {
    const { apartmentId, message, name, contactNumber } = req.body;
    const userEmail = req.session.user?.email;

    if (!userEmail) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const apartment = await Apartment.findById(apartmentId).populate('broker');
    if (!apartment) return res.status(404).json({ error: 'Apartment not found' });

    const brokerEmail = apartment.broker?.email;
    if (!brokerEmail) return res.status(404).json({ error: 'Broker not found' });

    const inquiry = new Inquiry({
      userEmail,
      brokerEmail,
      apartmentId,
      message,
      name,
      contactNumber
    });

    await inquiry.save();

    res.status(200).json({ message: 'Inquiry submitted successfully.' });
  } catch (err) {
    console.error('Error submitting inquiry:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// Get notification settings
exports.getNotificationSettings = async (req, res) => {
  try {
    const email = req.session.user?.email;
    if (!email) return res.status(401).json({ error: "Not authenticated" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ 
      notificationSettings: user.notificationSettings || {
        emailNotifications: true,
        newInquiryAlerts: true,
        marketingUpdates: false,
        accountAlerts: true
      }
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    res.status(500).json({ error: "Server error" });
  }
};

