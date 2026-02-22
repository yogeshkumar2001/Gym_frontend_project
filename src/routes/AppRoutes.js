import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Members from '../pages/Members';
import Payments from '../pages/Payments';
import Invoices from '../pages/Invoices';
import Import from '../pages/Import';
import Notifications from '../pages/Notifications';
import Analytics from '../pages/Analytics';
import PerformancePage from '../pages/PerformancePage';
import Plans from '../pages/Plans';
import MemberProfile from '../pages/MemberProfile';
import Workouts from '../pages/Workouts';
import WorkoutBuilder from '../pages/WorkoutBuilder';
import Diets from '../pages/Diets';
import DietBuilder from '../pages/DietBuilder';

// ─── Protected Route Guard ────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

// ─── Routes ───────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <Members />
          </ProtectedRoute>
        }
      />

      <Route
        path="/members/:id"
        element={
          <ProtectedRoute>
            <MemberProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Invoices />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <PerformancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/plans"
        element={
          <ProtectedRoute>
            <Plans />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workouts"
        element={
          <ProtectedRoute>
            <Workouts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workouts/new"
        element={
          <ProtectedRoute>
            <WorkoutBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workouts/edit/:id"
        element={
          <ProtectedRoute>
            <WorkoutBuilder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/diets"
        element={
          <ProtectedRoute>
            <Diets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diets/new"
        element={
          <ProtectedRoute>
            <DietBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diets/edit/:id"
        element={
          <ProtectedRoute>
            <DietBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Import />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
