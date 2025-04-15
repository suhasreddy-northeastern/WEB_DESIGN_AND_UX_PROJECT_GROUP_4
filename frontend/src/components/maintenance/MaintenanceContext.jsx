import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create the context
const MaintenanceContext = createContext();

/**
 * Provider component that wraps the app and makes maintenance state available to any
 * child component that calls useMaintenanceMode().
 */
export const MaintenanceProvider = ({ children }) => {
  const [isInMaintenanceMode, setIsInMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch maintenance status
  const fetchMaintenanceStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/system/maintenance-status', {
        withCredentials: true,
      });
      
      setIsInMaintenanceMode(response.data.isInMaintenanceMode || false);
      setMaintenanceMessage(response.data.message || '');
      setEstimatedTime(response.data.estimatedTime || '');
    } catch (err) {
      console.error('Failed to fetch maintenance status:', err);
      setError('Failed to check system status');
      // Default to not in maintenance mode if we can't determine
      setIsInMaintenanceMode(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to set maintenance mode (admin only)
  const setMaintenanceMode = async (status, message = '', time = '') => {
    try {
      const response = await axios.post('/api/admin/set-maintenance-mode', {
        enabled: status,
        message,
        estimatedTime: time
      }, {
        withCredentials: true,
      });
      
      setIsInMaintenanceMode(response.data.isInMaintenanceMode);
      setMaintenanceMessage(response.data.message || '');
      setEstimatedTime(response.data.estimatedTime || '');
      
      return { success: true };
    } catch (err) {
      console.error('Failed to set maintenance mode:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to update maintenance status' 
      };
    }
  };

  // Fetch maintenance status on component mount
  useEffect(() => {
    fetchMaintenanceStatus();
    
    // Set up a polling interval to check status periodically when in maintenance mode
    let intervalId;
    if (isInMaintenanceMode) {
      intervalId = setInterval(fetchMaintenanceStatus, 60000); // Check every minute
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isInMaintenanceMode]);

  // Make the context value
  const value = {
    isInMaintenanceMode,
    maintenanceMessage,
    estimatedTime,
    loading,
    error,
    fetchMaintenanceStatus,
    setMaintenanceMode,
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};

// Custom hook to use the maintenance context
export const useMaintenanceMode = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenanceMode must be used within a MaintenanceProvider');
  }
  return context;
};

export default MaintenanceContext;