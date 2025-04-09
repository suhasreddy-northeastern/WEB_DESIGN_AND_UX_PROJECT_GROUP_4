// controllers/brokerController.js
const Apartment = require('../models/Apartment');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');


// Register a broker (public)
exports.registerBroker = async (req, res) => {
  try {
    const { fullName, email, password, phone, licenseNumber } = req.body;
    
    // Debug logging
    console.log("File received:", req.file);
    console.log("Form data received:", req.body);
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: "License document is required" });
    }
    
    const licenseDocument = req.file.filename;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Create full path for document URL
    const licenseDocumentUrl = `/uploads/${licenseDocument}`;
    
    console.log("License document URL:", licenseDocumentUrl);

    // Save user with full license document path
    const newBroker = new User({
      fullName,
      email,
      password,
      phone,
      licenseNumber,
      licenseDocumentUrl,
      type: "broker",
      isApproved: false,
    });

    await newBroker.save();
    console.log("Broker saved successfully with document:", licenseDocumentUrl);

    res.status(201).json({ message: "Registration successful. Pending admin approval." });
  } catch (error) {
    console.error("Broker registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

// Get broker dashboard stats
exports.getBrokerStats = async (req, res) => {
  try {
    const brokerEmail = req.session.user.email;
    
    const totalListings = await Apartment.countDocuments({ brokerEmail });
    const activeListings = await Apartment.countDocuments({ brokerEmail, isActive: true });
    
    // Count inquiries
    const inquiries = await Inquiry.find({ brokerEmail });
    const newInquiries = inquiries.filter(inq => inq.status === 'pending').length;
    
    // Count pending approvals (if your app has an approval workflow)
    const pendingApprovals = await Apartment.countDocuments({ 
      brokerEmail, 
      approvalStatus: 'pending' 
    });

    res.status(200).json({
      totalListings,
      activeListings,
      newInquiries,
      pendingApprovals: pendingApprovals || 0, // Default to 0 if no approval workflow
    });
  } catch (error) {
    console.error('Error fetching broker stats:', error);
    res.status(500).json({ message: 'Failed to fetch broker stats' });
  }
};

// Get broker's listings
exports.getBrokerListings = async (req, res) => {
  try {
    const brokerEmail = req.session.user.email;
    const listings = await Apartment.find({ brokerEmail })
      .sort({ createdAt: -1 });

    // Enrich listings with view and inquiry counts
    const enrichedListings = await Promise.all(
      listings.map(async (listing) => {
        const inquiryCount = await Inquiry.countDocuments({ apartmentId: listing._id });
        
        // If you have a views tracking system, get view count
        // For now using a random number as placeholder
        const viewCount = Math.floor(Math.random() * 200);
        
        return {
          ...listing.toObject(),
          inquiries: inquiryCount,
          views: viewCount
        };
      })
    );

    res.status(200).json(enrichedListings);
  } catch (error) {
    console.error('Error fetching broker listings:', error);
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
};

// Toggle listing active status
exports.toggleListingActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const brokerEmail = req.session.user.email;
    
    // Ensure the broker owns this listing
    const listing = await Apartment.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    if (listing.brokerEmail !== brokerEmail) {
      return res.status(403).json({ message: 'You do not have permission to modify this listing' });
    }
    
    listing.isActive = isActive;
    await listing.save();
    
    res.status(200).json({ message: 'Listing status updated successfully', listing });
  } catch (error) {
    console.error('Error toggling listing status:', error);
    res.status(500).json({ message: 'Failed to update listing status' });
  }
};

// Delete a listing
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const brokerEmail = req.session.user.email;
    
    // Ensure the broker owns this listing
    const listing = await Apartment.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    if (listing.brokerEmail !== brokerEmail) {
      return res.status(403).json({ message: 'You do not have permission to delete this listing' });
    }
    
    await Apartment.findByIdAndDelete(id);
    
    // Also delete related inquiries
    await Inquiry.deleteMany({ apartmentId: id });
    
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ message: 'Failed to delete listing' });
  }
};

// Get broker's inquiries
exports.getBrokerInquiries = async (req, res) => {
  try {
    const brokerEmail = req.session.user.email;
    
    // Get all broker's listings
    const listings = await Apartment.find({ brokerEmail }, '_id');
    const listingIds = listings.map(listing => listing._id);
    
    // Get inquiries for those listings
    const inquiries = await Inquiry.find({ apartmentId: { $in: listingIds } })
      .sort({ createdAt: -1 });
    
    // Enrich inquiries with apartment titles and user info
    const enrichedInquiries = await Promise.all(
      inquiries.map(async (inquiry) => {
        const apartment = await Apartment.findById(inquiry.apartmentId);
        const user = await User.findOne({ email: inquiry.userEmail });
        
        return {
          ...inquiry.toObject(),
          apartmentTitle: apartment ? `${apartment.bedrooms} BHK in ${apartment.neighborhood}` : 'Unknown Property',
          userName: user ? user.fullName : 'Unknown User',
          userAvatar: user?.imagePath || null
        };
      })
    );
    
    res.status(200).json({ inquiries: enrichedInquiries });
  } catch (error) {
    console.error('Error fetching broker inquiries:', error);
    res.status(500).json({ message: 'Failed to fetch inquiries' });
  }
};

// Reply to an inquiry
exports.replyToInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const brokerEmail = req.session.user.email;
    
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    // Ensure the broker owns the listing related to this inquiry
    const listing = await Apartment.findById(inquiry.apartmentId);
    if (!listing || listing.brokerEmail !== brokerEmail) {
      return res.status(403).json({ message: 'You do not have permission to reply to this inquiry' });
    }
    
    // Update inquiry
    inquiry.brokerResponse = message;
    inquiry.status = 'responded';
    inquiry.responseDate = new Date();
    await inquiry.save();
    
    // In a real application, you might want to notify the user via email
    
    res.status(200).json({ message: 'Reply sent successfully', inquiry });
  } catch (error) {
    console.error('Error replying to inquiry:', error);
    res.status(500).json({ message: 'Failed to send reply' });
  }
};

// Get listing performance metrics
exports.getListingPerformance = async (req, res) => {
  try {
    const brokerEmail = req.session.user.email;
    
    // Get broker's listings
    const listings = await Apartment.find({ brokerEmail }, '_id bedrooms neighborhood');
    
    // Calculate metrics for each listing
    const performance = await Promise.all(
      listings.map(async (listing) => {
        const inquiryCount = await Inquiry.countDocuments({ apartmentId: listing._id });
        
        // For demonstration, generate random view counts
        // In a real application, you would use actual view tracking data
        const viewCount = Math.floor(Math.random() * 200) + 10;
        
        return {
          _id: listing._id,
          title: `${listing.bedrooms} BHK in ${listing.neighborhood}`,
          views: viewCount,
          inquiries: inquiryCount
        };
      })
    );
    
    // Sort by views (highest first)
    performance.sort((a, b) => b.views - a.views);
    
    res.status(200).json({ listings: performance });
  } catch (error) {
    console.error('Error fetching listing performance:', error);
    res.status(500).json({ message: 'Failed to fetch performance metrics' });
  }
};


exports.updateBrokerProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user._id;
    
    // Prevent unauthorized changes
    const restrictedFields = ["type", "email", "isApproved", "_id", "password", "licenseNumber", "licenseDocumentUrl"];
    restrictedFields.forEach((field) => delete updates[field]);
    
    const updateObj = { ...updates };
    
    // Handle profile image if present
    if (req.file) {
      // Save file path with the correct base URL
      updateObj.imagePath = `http://localhost:4000/uploads/${req.file.filename}`;
      
      // Clean up old profile image if it exists
      const user = await User.findById(userId);
      if (user && user.imagePath && !user.imagePath.includes('http://localhost:4000')) {
        const oldImagePath = path.join(__dirname, '..', user.imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    const updatedBroker = await User.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ message: "Profile updated successfully", broker: updatedBroker });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Profile update failed" });
  }
};


// Change broker password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update with new password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
};

// Update broker profile with image upload support
exports.updateBrokerProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user._id;
    
    // Prevent unauthorized changes
    const restrictedFields = ["type", "email", "isApproved", "_id", "password", "licenseNumber", "licenseDocumentUrl"];
    restrictedFields.forEach((field) => delete updates[field]);
    
    const updateObj = { ...updates };
    
    // Handle profile image if present
    if (req.file) {
      // Save file path
      updateObj.imagePath = `/uploads/${req.file.filename}`;
      
      // Clean up old profile image if it exists
      const user = await User.findById(userId);
      if (user && user.imagePath && user.imagePath !== updateObj.imagePath) {
        const oldImagePath = path.join(__dirname, '..', user.imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    const updatedBroker = await User.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ message: "Profile updated successfully", broker: updatedBroker });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Profile update failed" });
  }
};

// Save notification preferences
exports.updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const settings = req.body;
    
    // Validate settings object
    const validSettings = [
      'emailNotifications',
      'newInquiryAlerts',
      'marketingUpdates',
      'accountAlerts'
    ];
    
    // Filter out any settings that are not in our valid list
    const filteredSettings = {};
    Object.keys(settings).forEach(key => {
      if (validSettings.includes(key)) {
        filteredSettings[key] = settings[key];
      }
    });
    
    // In a real application, you might have a separate NotificationSettings model
    // For this example, we'll store it in the user document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { notificationSettings: filteredSettings } },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'Notification settings updated successfully' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Failed to update notification settings' });
  }
};

// Get broker notification settings
exports.getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If no settings exist yet, return defaults
    const defaultSettings = {
      emailNotifications: true,
      newInquiryAlerts: true,
      marketingUpdates: false,
      accountAlerts: true
    };
    
    const notificationSettings = user.notificationSettings || defaultSettings;
    
    res.status(200).json({ notificationSettings });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ message: 'Failed to fetch notification settings' });
  }
};