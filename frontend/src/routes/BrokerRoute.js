import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import React from 'react';

const BrokerRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const location = useLocation();

  // Check authentication
  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  // Check broker role
  if (user?.type !== 'broker') return <Navigate to="/home" replace />;
  
  // Allow access to dashboard and profile for all brokers
  const isDashboardOrProfile = 
    location.pathname === '/broker/dashboard' || 
    location.pathname === '/broker/profile';
  
  // For other pages, check if broker is approved
  if (!isDashboardOrProfile && !user.isApproved) {
    return <Navigate to="/broker/dashboard" replace />;
  }

  return children;
};

export default BrokerRoute;