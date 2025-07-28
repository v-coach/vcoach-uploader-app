import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './components/LandingPage';
import StudentDashboard from './components/StudentDashboard';
import CoachDashboard from './components/CoachDashboard';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import vcoachlg from '../public/vcoachlg.jpg';

// Updated Protected Route component to handle initialization
const ProtectedRoute = ({ requiredRoles }) => {
  const { user, isInitializing } = useAuth();

  // If we are still checking for a token, show a loading message
  if (isInitializing) {
    return <div className="text-center text-white/80">Loading...</div>;
  }

  // After checking, if there's no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user has the required role
  const hasRequiredRole = user.roles.some(role => requiredRoles.includes(role));

  if (!hasRequiredRole) {
    // If user doesn't have the role, send them to the home page
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

const AuthButton = () => {
    const { user, logout } = useAuth();
    if (user) {
        return (
            <div className="flex items-center space-x-4">
                <span className="font-semibold text-sm text-white/90">{user.username}</span>
                <button onClick={logout} className="h-10 px-4 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium">Logout</button>
            </div>
        );
    }
    return <NavLink to="/login" className="h-10 px-5 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold inline-flex items-center">Login</NavLink>;
};

function App() {
  const activeLinkStyle = { color: 'white' };

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900 text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(/vcoachbg.jpg)` }}>
          <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-black/30 backdrop-blur-lg">
            <div className="container flex h-20 max-w-screen-xl items-center justify-between mx-auto px-4">
              <Link to="/" className="mr-6 flex items-center space-x-2">
                <img src={vcoachlg} alt="V-Coach Central Logo" className="h-16" />
              </Link>
              <nav className="flex items-center gap-6 text-sm">
                <NavLink to="/" className="transition-colors text-white/70 hover:text-white/100 font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Home</NavLink>
                <NavLink to="/upload" className="transition-colors text-white/70 hover:text-white/100 font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Upload</NavLink>
                <NavLink to="/coach" className="transition-colors text-white/70 hover:text-white/100 font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Coach</NavLink>
                <NavLink to="/admin" className="transition-colors text-white/70 hover:text-white/100 font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Admin</NavLink>
              </nav>
              <div className="flex flex-1 items-center justify-end">
                <AuthButton />
              </div>
            </div>
          </header>

          <main className="container max-w-screen-xl p-8 mx-auto">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/upload" element={<StudentDashboard />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute requiredRoles={['Coach', 'Head Coach', 'Founders']} />}>
                <Route path="/coach" element={<CoachDashboard />} />
              </Route>
              <Route element={<ProtectedRoute requiredRoles={['Founders']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
