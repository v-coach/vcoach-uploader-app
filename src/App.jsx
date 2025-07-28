import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import CoachDashboard from './components/CoachDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import AuthButton from './components/AuthButton';

/**
 * A dedicated component to handle redirection from the generic /dashboard
 * to a role-specific dashboard. This improves stability.
 */
function DashboardRedirect() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'coach') {
    return <Navigate to="/coach" replace />;
  }

  // Default to the student dashboard
  return <StudentDashboard />;
}


/**
 * Renders the main content of the application based on authentication status.
 * It uses the `useAuth` hook to access user and loading state.
 */
function AppContent() {
  const { loading } = useAuth();

  // Display a loading indicator while the authentication status is being checked.
  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
            <div>Loading Application...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 border-b border-gray-700">
        <h1 className="text-xl font-bold">V-COACH</h1>
        <AuthButton />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />
          <Route path="/coach" element={<ProtectedRoute roles={['coach']}><CoachDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * The root App component. The Router has been moved to main.jsx
 * to wrap the AuthProvider, which fixes the hook context issue.
 */
function App() {
  return (
      <AppContent />
  );
}

export default App;
