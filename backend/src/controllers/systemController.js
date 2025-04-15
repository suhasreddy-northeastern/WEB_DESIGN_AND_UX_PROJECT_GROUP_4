const SystemSettings = require('../models/SystemSettings');

// In-memory cache for faster access to frequently accessed settings
let maintenanceStatus = {
  isInMaintenanceMode: false,
  message: '',
  estimatedTime: '',
  lastUpdated: new Date(),
};

/**
 * Initialize the system settings
 * This should be called when the server starts to load settings into memory
 */
exports.initSystemSettings = async () => {
  try {
    // Get maintenance mode settings from database
    let settings = await SystemSettings.findOne({ key: 'maintenanceMode' });
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new SystemSettings({
        key: 'maintenanceMode',
        value: {
          enabled: false,
          message: 'We are currently performing scheduled maintenance. Please check back soon.',
          estimatedTime: '',
        },
        lastUpdated: new Date()
      });
      await settings.save();
    }
    
    // Update in-memory cache
    maintenanceStatus = {
      isInMaintenanceMode: settings.value.enabled,
      message: settings.value.message,
      estimatedTime: settings.value.estimatedTime,
      lastUpdated: settings.lastUpdated
    };
    
    console.log('System settings initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize system settings:', error);
    return false;
  }
};

/**
 * Get maintenance mode status (public)
 */
exports.getMaintenanceStatus = async (req, res) => {
  try {
    // Check if maintenanceStatus needs to be refreshed (over 5 minutes old)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    if (maintenanceStatus.lastUpdated < fiveMinutesAgo) {
      // Refresh from database if cache is stale
      const settings = await SystemSettings.findOne({ key: 'maintenanceMode' });
      
      if (settings) {
        maintenanceStatus = {
          isInMaintenanceMode: settings.value.enabled,
          message: settings.value.message,
          estimatedTime: settings.value.estimatedTime,
          lastUpdated: settings.lastUpdated
        };
      }
    }
    
    // Send current status
    res.status(200).json(maintenanceStatus);
  } catch (error) {
    console.error('Error getting maintenance status:', error);
    res.status(500).json({ error: 'Failed to get maintenance status' });
  }
};

/**
 * Set maintenance mode (admin only)
 */
exports.setMaintenanceMode = async (req, res) => {
  try {
    const { enabled, message, estimatedTime } = req.body;
    
    console.log(`Setting maintenance mode: enabled=${enabled}, message=${message}`);
    
    // Verify user is admin
    if (req.session.user?.type !== 'admin') {
      return res.status(403).json({ error: 'Only admins can modify maintenance mode' });
    }
    
    // Update in database
    const updatedSettings = await SystemSettings.findOneAndUpdate(
      { key: 'maintenanceMode' },
      {
        value: {
          enabled: enabled,
          message: message || 'We are currently performing scheduled maintenance. Please check back soon.',
          estimatedTime: estimatedTime || '',
        },
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log("Updated settings in database:", updatedSettings);
    
    // Update in-memory cache
    maintenanceStatus = {
      isInMaintenanceMode: enabled,
      message: message || 'We are currently performing scheduled maintenance. Please check back soon.',
      estimatedTime: estimatedTime || '',
      lastUpdated: new Date()
    };
    
    console.log("Updated in-memory cache:", maintenanceStatus);
    
    res.status(200).json({
      success: true,
      isInMaintenanceMode: enabled,
      message: maintenanceStatus.message,
      estimatedTime: maintenanceStatus.estimatedTime
    });
  } catch (error) {
    console.error('Error setting maintenance mode:', error);
    res.status(500).json({ error: 'Failed to update maintenance mode' });
  }
};