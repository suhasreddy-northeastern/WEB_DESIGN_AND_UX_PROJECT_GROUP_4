// controllers/brokerController.js
const Apartment = require('../models/Apartment');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');

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

    // Prevent unauthorized changes
    const restrictedFields = ["type", "email", "isApproved", "_id", "password"];
    restrictedFields.forEach((field) => delete updates[field]);

    const updatedBroker = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ message: "Profile updated", broker: updatedBroker });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Profile update failed" });
  }
};
