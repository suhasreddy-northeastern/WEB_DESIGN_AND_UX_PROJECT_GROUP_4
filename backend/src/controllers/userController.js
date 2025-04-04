const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { getAsync, setexAsync } = require('../utils/redisClient');
const Preference = require("../models/Preference");
const Apartment = require("../models/Apartment");
const { getMatchExplanation } = require("../services/groqService");
const { calculateMatchScore } = require("../utils/matchScoring"); 

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    req.session.user = {
      email: user.email,
      fullName: user.fullName,
      type: user.type,
    };

    res.status(200).json({
      message: "Login successful",
      user: req.session.user,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { email, fullName, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found." });

    if (fullName) user.fullName = fullName;
    if (password) user.password = password;

    await user.save();
    res.status(200).json({ message: "User updated successfully." });
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



// ✅ Get matches with AI explanations
exports.getMatches = async (req, res) => {
  try {
    const { prefId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    
    // Create a cache key based on preference ID and pagination
    const cacheKey = `matches:${prefId}:page${page}:limit${limit}`;
    
    // Try to get cached data first
    const cachedData = await getAsync(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }
    
    console.log(`Cache miss for ${cacheKey}, fetching from database...`);
    
    // If no cache, proceed with the original logic
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
      // Delay each explanation by 1.5s to stay within limits
      await new Promise((resolve) => setTimeout(resolve, 1500));
      let explanation;
      try {
        explanation = await getMatchExplanation(pref, apt);
      } catch (err) {
        explanation = "Could not generate explanation.";
      }

      scored.push({ apartment: apt, matchScore: score, explanation });
    }

    const responseData = {
      results: scored,
      totalCount
    };
    
    // Cache the results for 1 hour (3600 seconds)
    // Adjust the TTL based on how frequently your data changes
    await setexAsync(cacheKey, 3600, JSON.stringify(responseData));
    
    res.status(200).json(responseData);
    
  } catch (err) {
    console.error("Error in getMatches:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add a new function to clear cache when preferences change
exports.clearMatchesCache = async (prefId) => {
  try {
    const limit = 3; // Same as your default limit
    for (let page = 1; page <= 10; page++) {
      await delAsync(`matches:${prefId}:page${page}:limit${limit}`);
    }
    console.log(`Cleared cache for preference ${prefId}`);
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

