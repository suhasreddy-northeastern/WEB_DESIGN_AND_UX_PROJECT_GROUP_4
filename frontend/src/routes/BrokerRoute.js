import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import React from 'react';


const BrokerRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.type !== 'broker') return <Navigate to="/home" replace />;

  return children;
};

export default BrokerRoute;
