import React from 'react';
import { useAuth } from '../AuthContext';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    // For routes that should just be hidden, return null
    return null;
  }

  const hasRequiredRole = user.roles.some(role => roles.includes(role));

  if (!hasRequiredRole) {
    // You can also render an "Access Denied" component here
    return null;
  }

  return children;
}

export default ProtectedRoute;
