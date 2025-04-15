// controllers/tourController.js
const Tour = require('../models/Tour');
const Apartment = require('../models/Apartment');
const User = require('../models/User');

/**
 * Schedule a tour request
 */
exports.scheduleTour = async (req, res) => {
  try {
    const { apartmentId, tourDate, tourTime, name, contactNumber, message } = req.body;
    const userEmail = req.session.user?.email;

    // Validate required fields
    if (!apartmentId || !tourDate || !tourTime || !name || !contactNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate user authentication
    if (!userEmail) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get the apartment to verify it exists and get broker info
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    // Get broker email
    const brokerEmail = apartment.brokerEmail;
    if (!brokerEmail) {
      return res.status(404).json({ error: 'Broker information not available' });
    }

    // Create tour request
    const tour = new Tour({
      userEmail,
      brokerEmail,
      apartmentId,
      tourDate,
      tourTime,
      name,
      contactNumber,
      message: message || `Request to tour ${apartment.bedrooms} BHK in ${apartment.neighborhood}`,
      status: 'pending'
    });

    await tour.save();

    // Could add notification logic here (email, push notification, etc.)

    res.status(201).json({ 
      message: 'Tour request submitted successfully',
      tourId: tour._id
    });
  } catch (err) {
    console.error('Error scheduling tour:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all tours for the current user
 */
exports.getUserTours = async (req, res) => {
  try {
    const userEmail = req.session.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get tours and populate with apartment details
    const tours = await Tour.find({ userEmail })
      .sort({ createdAt: -1 })
      .populate('apartmentId', 'bedrooms neighborhood price imageUrls imageUrl');

    // Format the response
    const formattedTours = tours.map(tour => ({
      _id: tour._id,
      apartmentId: tour.apartmentId._id,
      apartmentDetails: {
        bedrooms: tour.apartmentId.bedrooms,
        neighborhood: tour.apartmentId.neighborhood,
        price: tour.apartmentId.price,
        imageUrl: tour.apartmentId.imageUrls?.[0] || tour.apartmentId.imageUrl
      },
      tourDate: tour.tourDate,
      tourTime: tour.tourTime,
      status: tour.status,
      brokerResponse: tour.brokerResponse,
      createdAt: tour.createdAt
    }));

    res.status(200).json({ tours: formattedTours });
  } catch (err) {
    console.error('Error fetching user tours:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all tours for the broker (for broker dashboard)
 */
exports.getBrokerTours = async (req, res) => {
  try {
    const brokerEmail = req.session.user?.email;
    
    if (!brokerEmail) {
      return res.status(401).json({ error: 'Broker not authenticated' });
    }

    // Verify user is a broker
    const broker = await User.findOne({ email: brokerEmail });
    if (!broker || broker.type !== 'broker') {
      return res.status(403).json({ error: 'Access denied. Broker permissions required.' });
    }

    // Get tours and populate with apartment and user details
    const tours = await Tour.find({ brokerEmail })
      .sort({ tourDate: 1 })
      .populate('apartmentId', 'bedrooms neighborhood price imageUrls imageUrl')
      .lean();

    // Get user details but don't expose sensitive information
    const userEmails = [...new Set(tours.map(tour => tour.userEmail))];
    const users = await User.find(
      { email: { $in: userEmails } }, 
      { email: 1, fullName: 1, imagePath: 1 }
    );

    // Create a lookup map for users
    const userMap = {};
    users.forEach(user => {
      userMap[user.email] = {
        fullName: user.fullName,
        imagePath: user.imagePath
      };
    });

    // Format the response
    const formattedTours = tours.map(tour => ({
      _id: tour._id,
      apartmentDetails: {
        _id: tour.apartmentId._id,
        bedrooms: tour.apartmentId.bedrooms,
        neighborhood: tour.apartmentId.neighborhood,
        price: tour.apartmentId.price,
        imageUrl: tour.apartmentId.imageUrls?.[0] || tour.apartmentId.imageUrl
      },
      userDetails: {
        email: tour.userEmail,
        name: tour.name || userMap[tour.userEmail]?.fullName || 'User',
        contactNumber: tour.contactNumber,
        imagePath: userMap[tour.userEmail]?.imagePath
      },
      tourDate: tour.tourDate,
      tourTime: tour.tourTime,
      message: tour.message,
      status: tour.status,
      brokerResponse: tour.brokerResponse,
      createdAt: tour.createdAt
    }));

    res.status(200).json({ tours: formattedTours });
  } catch (err) {
    console.error('Error fetching broker tours:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update tour status (confirm, reschedule, cancel)
 */
exports.updateTourStatus = async (req, res) => {
  try {
    const { tourId } = req.params;
    const { status, brokerResponse, newDate, newTime } = req.body;
    const brokerEmail = req.session.user?.email;

    // Validate required fields
    if (!tourId || !status) {
      return res.status(400).json({ error: 'Tour ID and status are required' });
    }

    // Validate broker authentication
    if (!brokerEmail) {
      return res.status(401).json({ error: 'Broker not authenticated' });
    }

    // Find the tour
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ error: 'Tour request not found' });
    }

    // Verify the broker owns this tour
    if (tour.brokerEmail !== brokerEmail) {
      return res.status(403).json({ error: 'Not authorized to update this tour' });
    }

    // Update the tour
    const updateData = { status };
    
    // Add broker response if provided
    if (brokerResponse) {
      updateData.brokerResponse = brokerResponse;
    }
    
    // If status is 'rescheduled', update the date and time
    if (status === 'rescheduled' && newDate && newTime) {
      updateData.tourDate = newDate;
      updateData.tourTime = newTime;
    }

    // Update the tour
    const updatedTour = await Tour.findByIdAndUpdate(
      tourId,
      updateData,
      { new: true }
    );

    // Could add notification logic here (email to user, etc.)

    res.status(200).json({ 
      message: 'Tour status updated successfully',
      tour: updatedTour
    });
  } catch (err) {
    console.error('Error updating tour status:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Cancel a tour (for users)
 */
exports.cancelTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userEmail = req.session.user?.email;

    // Validate user authentication
    if (!userEmail) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the tour
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ error: 'Tour request not found' });
    }

    // Verify the user owns this tour
    if (tour.userEmail !== userEmail) {
      return res.status(403).json({ error: 'Not authorized to cancel this tour' });
    }

    // Update tour status to canceled
    tour.status = 'canceled';
    tour.userCanceled = true;
    await tour.save();

    res.status(200).json({ message: 'Tour canceled successfully' });
  } catch (err) {
    console.error('Error canceling tour:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = exports;