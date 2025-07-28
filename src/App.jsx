import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
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

const NavigationLinks = () => {
  const { user } = useAuth();
  const activeLinkStyle = { color: 'white' };

  if (!user) return null;

  return (
    <>
      {/* Show Coach link if user is Coach or Head Coach (but not if they're Admin only) */}
      {(user.roles.includes('Coach') || user.roles.includes('Head Coach')) && !user.roles.includes('Founders') && (
        <NavLink to="/coach" className="transition-colors text-white/70 hover:text-white/100 font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
          Coach
        </NavLink>
      )}
      
      {/* Show Admin link if user is Admin (Founders) */}
      {user.roles.includes('Founders') && (
        <NavLink to="/admin" className="transition-colors text-white/70 hover:text-white/100 font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
          Admin
        </NavLink>
      )}
    </>
  );
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

// Compact Professional Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionClick = (sectionId) => {
    // Always navigate to home page first, then scroll to section
    if (location.pathname !== '/') {
      // Navigate to home page with the section hash
      navigate('/', { replace: false });
      // Use a longer timeout to ensure the page has fully loaded
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      // If already on home page, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleUploadClick = (e) => {
    e.preventDefault();
    navigate('/upload');
  };

  return (
    <footer className="bg-black/50 backdrop-blur-lg border-t border-white/20 mt-12">
      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <img src={vcoachlg} alt="V-Coach Central Logo" className="h-8" />
              <span className="font-bold text-base text-white">V-Coach Central</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              The ultimate platform for competitive gaming improvement. Upload your gameplay, get professional analysis, and take your skills to the next level.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-sky-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-red-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h.857c2.329 0 4.429 1.143 4.429 2.571v9.43c0 1.427-2.1 2.571-4.429 2.571h-.857C9.243 19.286 7.143 18.143 7.143 16.715V7.285C7.143 5.857 9.243 4.714 11.571 4.714z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">Quick Links</h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={handleHomeClick}
                  className={`text-white/70 hover:text-sky-400 transition-colors duration-300 text-sm text-left ${location.pathname === '/' ? 'text-sky-400 font-medium' : ''}`}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={handleUploadClick}
                  className={`text-white/70 hover:text-sky-400 transition-colors duration-300 text-sm text-left ${location.pathname === '/upload' ? 'text-sky-400 font-medium' : ''}`}
                >
                  Upload VoD
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSectionClick('coaches')} 
                  className="text-white/70 hover:text-sky-400 transition-colors duration-300 text-sm text-left hover:underline"
                >
                  Our Coaches
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSectionClick('pricing')} 
                  className="text-white/70 hover:text-sky-400 transition-colors duration-300 text-sm text-left hover:underline"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSectionClick('how-it-works')} 
                  className="text-white/70 hover:text-sky-400 transition-colors duration-300 text-sm text-left hover:underline"
                >
                  How It Works
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">Services</h3>
            <ul className="space-y-1.5">
              <li>
                <a href="#" className="text-white/70 hover:text-sky-400 transition-colors duration-300 text-sm">
                  VoD Review
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-sky-400 transition-colors duration-300 text-sm">
                  1-on-1 Coaching
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-sky-400 transition-colors duration-300 text-sm">
                  Team Coaching
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-sky-400 transition-colors duration-300 text-sm">
                  Performance Analytics
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-sky-400 transition-colors duration-300 text-sm">
                  Tournament Prep
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">Stay Updated</h3>
            <p className="text-white/70 text-sm">
              Get the latest tips, coaching insights, and platform updates.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-9 px-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
              />
              <button className="w-full h-9 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-md text-sm font-medium transition-all duration-300 hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="text-white/60 text-sm">
              © {currentYear} V-Coach Central. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-4">
              <a href="#" className="text-white/60 hover:text-sky-400 transition-colors duration-300 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-white/60 hover:text-sky-400 transition-colors duration-300 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-white/60 hover:text-sky-400 transition-colors duration-300 text-sm">
                Contact Us
              </a>
              <a href="#" className="text-white/60 hover:text-sky-400 transition-colors duration-300 text-sm">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
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
                <NavigationLinks />
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

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
