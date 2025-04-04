import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import React from 'react';


const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.type !== 'admin') return <Navigate to="/home" replace />;

  return children;
};

export default AdminRoute;
