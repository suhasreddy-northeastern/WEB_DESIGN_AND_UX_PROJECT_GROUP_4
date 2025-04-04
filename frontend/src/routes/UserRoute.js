import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import React from 'react';


const UserRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.type !== 'user') return <Navigate to="/" replace />;

  return children;
};

export default UserRoute;
