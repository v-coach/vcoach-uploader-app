import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import StudentDashboard from './components/StudentDashboard';
import CoachDashboard from './components/CoachDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthButton from './components/AuthButton';
import ProtectedRoute from './components/ProtectedRoute';
import vcoachlg from '../public/vcoachlg.jpg';

function App() {
  const activeLinkStyle = {
    color: 'white'
  };

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
                <NavLink to="/" className="transition-colors text-white/70 hover:text-white/100 font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Student</NavLink>
                <ProtectedRoute roles={['Coach', 'Head Coach']}>
                  <NavLink to="/coach" className="transition-colors text-white/70 hover:text-white/100 font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Coach</NavLink>
                </ProtectedRoute>
                 <ProtectedRoute roles={['Founders']}>
                  <NavLink to="/admin" className="transition-colors text-white/70 hover:text-white/100 font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Admin</NavLink>
                </ProtectedRoute>
              </nav>
              <div className="flex flex-1 items-center justify-end">
                <AuthButton />
              </div>
            </div>
          </header>

          <main className="container max-w-screen-xl p-8 mx-auto">
            <Routes>
              <Route path="/" element={<StudentDashboard />} />
              <Route path="/coach" element={<ProtectedRoute roles={['Coach', 'Head Coach']}><CoachDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={['Founders']}><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
