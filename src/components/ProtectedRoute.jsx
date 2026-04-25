import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{padding: '5rem', textAlign: 'center'}}>Securing connection...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    // If a customer tries to load the POS page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
