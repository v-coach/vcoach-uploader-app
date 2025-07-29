import React, { useState } from 'react';
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
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterMessage('Please enter a valid email address');
      return;
    }

    setIsSubmittingNewsletter(true);
    setNewsletterMessage('');

    try {
      const response = await fetch('/.netlify/functions/newsletter-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newsletterEmail,
          timestamp: new Date().toISOString(),
          source: 'footer'
        }),
      });

      if (response.ok) {
        setNewsletterMessage('Successfully subscribed! Thank you for joining our newsletter.');
        setNewsletterEmail('');
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterMessage('Failed to subscribe. Please try again later.');
    } finally {
      setIsSubmittingNewsletter(false);
      // Clear message after 5 seconds
      setTimeout(() => setNewsletterMessage(''), 5000);
    }
  };

  const handleSectionClick = (sectionId) => {
    // Always navigate to home page first, then scroll to section
    if (location.pathname !== '/') {
      // Navigate to home page with the section hash
      navigate('/', { replace: false });
      // Use a longer timeout to ensure the page has fully loaded
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          // Calculate offset for sticky header (20 * 4 = 80px header height)
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // Extra 20px padding
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 300);
    } else {
      // If already on home page, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        // Calculate offset for sticky header
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // Extra 20px padding
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      // Scroll to top after navigation to home page
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
    } else {
      // If already on home page, scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleUploadClick = (e) => {
    e.preventDefault();
    navigate('/upload');
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <footer className="bg-black/50 backdrop-blur-lg border-t border-white/20">
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
              {/* X (Twitter) */}
              <a href="https://x.com/VCoachCentral" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-sky-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* Instagram */}
              <a href="https://www.instagram.com/vcoach.central/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-pink-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              {/* TikTok */}
              <a href="https://www.tiktok.com/@vcoachcentral" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-black rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              
              {/* YouTube */}
              <a href="https://www.youtube.com/channel/UC2Hq8Cmb-z4K0-jBmejqiVQ" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-red-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              
              {/* Twitch */}
              <a href="https://www.twitch.tv/vcoachcentral" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
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
                  Custom Training Plans
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
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
              />
              <button 
                onClick={handleNewsletterSubmit}
                disabled={isSubmittingNewsletter}
                className="w-full h-9 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                {isSubmittingNewsletter ? 'Subscribing...' : 'Subscribe'}
              </button>
              {newsletterMessage && (
                <p className={`text-xs ${newsletterMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                  {newsletterMessage}
                </p>
              )}
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
        <div className="min-h-screen bg-gray-900 text-white bg-cover bg-center bg-fixed flex flex-col" style={{ backgroundImage: `url(/vcoachbg.jpg)` }}>
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

          <main className="flex-1 container max-w-screen-xl p-8 mx-auto">
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
