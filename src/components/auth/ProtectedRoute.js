import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../layout/Layout';

/**
 * ProtectedRoute
 *
 * Guards every private route in the application.
 *
 * Behaviour:
 *   isRestoring = true  → return null (prevents flash-redirect to /login while
 *                          the stored token is being validated on cold load)
 *   isAuthenticated     → render children inside the shared Layout shell
 *   not authenticated   → redirect to /login (replace so back-button doesn't
 *                          return to the guarded route)
 *
 * Role awareness:
 *   The authenticated user object (state.auth.user) contains a `role` field
 *   ('admin' | 'staff'). Pass it down via context or read it from Redux in any
 *   child component that needs permission-level branching.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isRestoring } = useSelector((state) => state.auth);

  if (isRestoring) return null;

  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
